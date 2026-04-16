import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  TouchableWithoutFeedback,
  Keyboard,
  RefreshControl,
  Modal,
  ActivityIndicator
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "../../../src/styles";
import { useStocksContext } from "../../../src/context/StocksContext";
import { searchSymbols } from "../../../src/services/finnhub";

// Shape of the Finnhub search response
type SearchResult = {
    description: string;
    displaySymbol: string;
    symbol: string;
    type: string;
};

export default function Home() {
    const router = useRouter();
    const { stocks, addStock, removeStock, refreshStocks } = useStocksContext();

    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const [showRemoveFor, setShowRemoveFor] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [refreshInterval, setRefreshInterval] = useState(15000); // 15s default
    const [intervalModalVisible, setIntervalModalVisible] = useState(false);

    // --- Debounced Search Logic ---
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            const query = searchQuery.trim();
            if (query.length < 2) {
                setSearchResults([]);
                setIsSearching(false);
                return;
            }

            setIsSearching(true);
            setError(null);
            try {
                const results = await searchSymbols(query);
                // This strips out both Crypto/Forex (:) AND International (.)
                const filtered = results.filter((r: SearchResult) => !r.symbol.includes('.') && !r.symbol.includes(':')).slice(0, 5);
                setSearchResults(filtered);
            } catch (err) {
                setError("Failed to search symbols.");
            }
            setIsSearching(false);
        }, 500); // 500ms delay

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    // --- Add Stock Logic ---
    const handleAdd = async (symbol: string) => {
        if (stocks.length >= 15) {
            setError("Watchlist capped at 15 entries.");
            return;
        }

        if (stocks.some(s => s.symbol === symbol)) {
            setError(`${symbol} is already in your watchlist.`);
            return;
        }

        setIsSearching(true);
        try {
            await addStock(symbol);
            setSearchQuery("");
            setSearchResults([]);
            Keyboard.dismiss();
        } catch (err) {
            setError(`Finnhub does not support quotes for ${symbol}.`);
        }
        setIsSearching(false);
    };

    // Auto refresh using context
    useEffect(() => {
        const interval = setInterval(() => {
            if (stocks.length) refreshStocks();
        }, refreshInterval);

        return () => clearInterval(interval);
    }, [stocks, refreshInterval]);

    const handleRefresh = async () => {
        if (!stocks.length) return;
        setRefreshing(true);
        await refreshStocks();
        setRefreshing(false);
    };

    const handleBackgroundPress = () => {
        setShowRemoveFor(null);
        setSearchResults([]);
        Keyboard.dismiss();
    };

    const changeInterval = (seconds: number) => {
        setRefreshInterval(seconds * 1000);
        setIntervalModalVisible(false);
    };

    return (
        <TouchableWithoutFeedback onPress={handleBackgroundPress}>
            <View style={styles.container}>
                {/* Search */}
                <TextInput
                    style={styles.input}
                    placeholder="Search companies (e.g., Apple, Microsoft)..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    onFocus={() => setShowRemoveFor(null)}
                />

                {isSearching && <ActivityIndicator size="small" style={{ marginVertical: 10 }} />}
                {error && <Text style={styles.errorText}>{error}</Text>}

                {/* Autocomplete Dropdown */}
                {searchResults.length > 0 && (
                    <View style={{ backgroundColor: "#f9fafb", borderRadius: 8, borderWidth: 1, borderColor: "#e5e7eb", marginBottom: 10, marginTop: 5 }}>
                        {searchResults.map((item, index) => (
                            <Pressable
                                key={`${item.symbol}-${index}`} 
                                style={{ padding: 12, borderBottomWidth: 1, borderBottomColor: "#e5e7eb" }}
                                onPress={() => handleAdd(item.symbol)}
                            >
                                <View style={styles.rowSpace}>
                                    <Text style={{ fontWeight: "bold" }}>{item.symbol}</Text>
                                    <Text style={{ fontSize: 12, color: "#6b7280", flexShrink: 1, marginLeft: 10 }}>{item.description}</Text>
                                </View>
                            </Pressable>
                        ))}
                    </View>
                )}

                {/* WATCHLIST */}
                <FlatList
                    data={stocks}
                    keyExtractor={item => item.symbol}
                    contentContainerStyle={styles.listContainer}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
                    renderItem={({ item }) => (
                        <Pressable
                            style={[styles.card, styles.cardBase]}
                            onLongPress={() => setShowRemoveFor(item.symbol)}
                            onPress={() => router.push(`./watchlist/stocktick/${item.symbol}`)}
                        >
                            <View style={styles.rowSpace}>
                                <Text style={styles.title}>{item.symbol}</Text>
                                <Text style={[styles.priceText, { color: item.price > (item.lastPrice ?? item.price) ? "green" : item.price < (item.lastPrice ?? item.price) ? "red" : "black" }]}>
                                    ${(item.price ?? 0).toFixed(2)}
                                </Text>
                            </View>

                            {showRemoveFor === item.symbol && (
                                <Pressable
                                    onPress={() => { removeStock(item.symbol); setShowRemoveFor(null); }}
                                    style={styles.iconButtonWrapper}
                                >
                                    <Ionicons name="remove-circle-outline" size={styles.iconButtonRemove.fontSize} color={styles.iconButtonRemove.color} />
                                </Pressable>
                            )}
                        </Pressable>
                    )}
                />

                {/* Clock/Interval Pop up */}
                <Pressable onPress={() => setIntervalModalVisible(true)} style={styles.clockIntervalButton}>
                    <Ionicons name="time-outline" size={24} color="#fff" />
                </Pressable>

                <Modal
                    visible={intervalModalVisible}
                    transparent
                    animationType="fade"
                    onRequestClose={() => setIntervalModalVisible(false)}
                >
                    <TouchableWithoutFeedback onPress={() => setIntervalModalVisible(false)}>
                        <View style={styles.modalBackground}>
                            <View style={styles.modalContainer}>
                                <Text style={styles.h3}>Select Refresh Interval</Text>
                                {[15, 30, 45, 60].map(sec => (
                                    <Pressable key={sec} onPress={() => changeInterval(sec)} style={styles.intervalButton}>
                                        <Text>{sec}s</Text>
                                    </Pressable>
                                ))}
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </Modal>
            </View>
        </TouchableWithoutFeedback>
    );
}