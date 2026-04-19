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
import { searchSymbols,getMarketStatus } from "../../../src/services/finnhub";
import WLSearchInput from "../../../src/components/SearchInputWL";
import WLSearchResults from "../../../src/components/SearchResultsWL";
import WatchlistItem from "../../../src/components/ItemWL";
import RefreshIntervalModal from "../../../src/components/RefreshModal";
import MarketStatusBanner from "../../../src/components/MarketStatusBanner";

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
    const [marketStatus, setMarketStatus] = useState<{
        isOpen: boolean;
        session: string | null;
    } | null>(null);
    
    const [showRemoveFor, setShowRemoveFor] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [refreshInterval, setRefreshInterval] = useState(15000); // 15s default
    const [intervalModalVisible, setIntervalModalVisible] = useState(false);

    const isMarketOpen = marketStatus?.isOpen === true;

    const fetchMarketStatus = async () => {
        try {
            const status = await getMarketStatus();
            console.log("MARKET STATUS RESPONSE:", status);
            setMarketStatus(status);
        } catch (err) {
            console.log("Failed to fetch market status", err);
        }
    };
    // Market status first load
    useEffect(() => {
        fetchMarketStatus();
    }, []);

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
        if (stocks.length >= 12) {
            setError("Watchlist capped at 12 entries.");
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
            if (!marketStatus?.isOpen) return;
            if (stocks.length) refreshStocks();
        }, refreshInterval);

        return () => clearInterval(interval);
    }, [stocks, refreshInterval, isMarketOpen]);

    const handleRefresh = async () => {
        if (!stocks.length) return;

        setRefreshing(true);
        await fetchMarketStatus();
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
            {/* Market Status Banner */}
           <MarketStatusBanner marketStatus={marketStatus} />
            {/* Search Input */}
            <WLSearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                onFocus={() => setShowRemoveFor(null)}
            />

            {/* Loading */}
            {isSearching && (
                <ActivityIndicator size="small" style={{ marginVertical: 10 }} />
            )}

            {/* Error */}
            {error && <Text style={styles.errorText}>{error}</Text>}

            {/* Search Results */}
            <WLSearchResults
                results={searchResults}
                onSelect={handleAdd}
            />

            {/* Watchlist */}
            <FlatList
                data={stocks}
                keyExtractor={(item) => item.symbol}
                contentContainerStyle={styles.listContainer}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                    />
                }
                renderItem={({ item }) => (
                    <WatchlistItem
                        item={item}
                        showRemove={showRemoveFor === item.symbol}
                        onLongPress={() => setShowRemoveFor(item.symbol)}
                        onPress={() =>
                            router.push(`./watchlist/stocktick/${item.symbol}`)
                        }
                        onRemove={() => {
                            removeStock(item.symbol);
                            setShowRemoveFor(null);
                        }}
                    />
                )}
            />

            {/* Interval Button */}
            <Pressable
                onPress={() => setIntervalModalVisible(true)}
                style={styles.clockIntervalButton}
            >
                <Ionicons name="time-outline" size={24} color="#fff" />
            </Pressable>

            {/* Interval Modal */}
            <RefreshIntervalModal
                visible={intervalModalVisible}
                onClose={() => setIntervalModalVisible(false)}
                onSelect={changeInterval}
            />

        </View>
    </TouchableWithoutFeedback>
);
}