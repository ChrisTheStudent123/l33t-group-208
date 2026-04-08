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
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "../../../src/styles";
import { useStocksContext } from "../../../src/context/StocksContext";
import { getStockQuote } from "../../../src/services/finnhub";
import { Stock } from "../../../src/types/Stock"


export default function Home() {
    const router = useRouter();
    const { stocks, addStock, removeStock, refreshStocks } = useStocksContext();

    const [searchQuery, setSearchQuery] = useState("");
    const [searchResult, setSearchResult] = useState<Stock | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showRemoveFor, setShowRemoveFor] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [refreshInterval, setRefreshInterval] = useState(15000); // 15s default
    const [intervalModalVisible, setIntervalModalVisible] = useState(false);

      // Search
    const handleSearch = async () => {
        const symbol = searchQuery.trim().toUpperCase();
        if (!symbol) return;

        setLoading(true);
        setError(null);
        setShowRemoveFor(null);

        try {
            const result = await getStockQuote(symbol);
            if (!result || result.price === 0) {
                setError("Stock not found.");
                setSearchResult(null);
            } else {
                 setSearchResult({ ...result, lastPrice: result.price });
            }
        } catch {
            setError("Failed to fetch stock quote");
            setSearchResult(null);
        }

        setLoading(false);
    };

    const handleAdd = async () => {
        if (!searchResult) return;

        if (stocks.length >= 15) {
            setError("Watchlist capped at 15 entries.");
            return;
        }

        await addStock(searchResult.symbol);
        setSearchQuery("");
        setSearchResult(null);
        setError(null);
    };

    // auto refresh using context
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
                    placeholder="Enter stock symbol..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    onSubmitEditing={handleSearch}
                    returnKeyType="search"
                    onFocus={() => setShowRemoveFor(null)}
                />

                {loading && <Text style={styles.notice}>Searching...</Text>}
                {error && <Text style={styles.errorText}>{error}</Text>}

                {searchResult && (
                    <Pressable
                        style={[styles.card, styles.cardBase]}
                        onPress={handleAdd}
                        disabled={stocks.some(s => s.symbol === searchResult.symbol)}
                    >
                        <View style={styles.rowSpace}>
                            <Text style={styles.title}>{searchResult.symbol}</Text>
                            <Pressable onPress={() => setSearchResult(null)} style={styles.iconButtonWrapper}>
                                <Ionicons name="close-outline" size={22} color={styles.iconButtonClear.color} />
                            </Pressable>
                        </View>

                        <Text style={[styles.p, styles.centerText]}>
                            {stocks.some(s => s.symbol === searchResult.symbol)
                                ? "Already in watchlist"
                                : `Current Price: $${searchResult.price.toFixed(2)}`}
                        </Text>
                    </Pressable>
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
                        //
                        // *** Route to stocktick or stockdetail screen here
                        //
                            //onPress={() => router.push(`/stocktick/${item.symbol}`)}
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