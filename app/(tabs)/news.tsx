import React, { useEffect, useState } from "react";
import { View, Text, TextInput, FlatList, ActivityIndicator, Pressable, Image, Linking, RefreshControl, Keyboard } from "react-native";
import { getMarketNews, getCompanyNews } from "../../src/services/finnhub";
import { styles } from "../../src/styles";
import { NewsArticle } from "../../src/types/Stock";
import { useStocksContext } from "../../src/context/StocksContext";

export default function News() {
    const { stocks } = useStocksContext();
    
    // UI State
    const [activeTab, setActiveTab] = useState<"global" | "watchlist" | "search">("global");
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // In-Memory Caches (Satisfies Lab 6 requirement)
    const [globalCache, setGlobalCache] = useState<NewsArticle[]>([]);
    const [watchlistCache, setWatchlistCache] = useState<NewsArticle[]>([]);
    const [searchResults, setSearchResults] = useState<NewsArticle[]>([]);

    // Helper to get YYYY-MM-DD dates for the Finnhub API (last 7 days)
    const getDateRange = () => {
        const to = new Date();
        const from = new Date();
        from.setDate(to.getDate() - 7);
        return {
            to: to.toISOString().split('T')[0],
            from: from.toISOString().split('T')[0]
        };
    };

    // --- Fetch Logic ---
    const loadGlobalNews = async (forceRefresh = false) => {
        if (globalCache.length > 0 && !forceRefresh) return;
        
        setLoading(true);
        try {
            const data = await getMarketNews();
            setGlobalCache(data.slice(0, 30)); // Cap at 30 to save memory
        } catch (err) {
            setError("Failed to load global news.");
        }
        setLoading(false);
    };

    const loadWatchlistNews = async (forceRefresh = false) => {
        if (stocks.length === 0) return;
        if (watchlistCache.length > 0 && !forceRefresh) return;

        setLoading(true);
        try {
            const { from, to } = getDateRange();
            // Fetch news for all stocks in the watchlist simultaneously
            const promises = stocks.map(stock => getCompanyNews(stock.symbol, from, to));
            const results = await Promise.all(promises);
            
            // Flatten the array of arrays, sort by newest, and cap at 30
            const combinedNews = results.flat()
                .sort((a, b) => b.datetime - a.datetime)
                .slice(0, 30);
                
            setWatchlistCache(combinedNews);
        } catch (err) {
            setError("Failed to load watchlist news.");
        }
        setLoading(false);
    };

    const handleSearch = async () => {
        const symbol = searchQuery.trim().toUpperCase();
        if (!symbol) return;

        Keyboard.dismiss();
        setActiveTab("search");
        setLoading(true);
        setError(null);

        try {
            const { from, to } = getDateRange();
            const data = await getCompanyNews(symbol, from, to);
            setSearchResults(data.slice(0, 20));
        } catch (err) {
            setError(`Could not find news for ${symbol}.`);
        }
        setLoading(false);
    };

    // Load initial data
    useEffect(() => {
        if (activeTab === "global") loadGlobalNews();
        if (activeTab === "watchlist") loadWatchlistNews();
    }, [activeTab]);

    // --- Render Helpers ---
    const openArticle = (url: string) => {
        Linking.openURL(url).catch(err => console.error("Couldn't open URL", err));
    };

    const formatDate = (unix: number) => {
        const date = new Date(unix * 1000);
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    // Determine which array to render based on the active tab
    const currentData = activeTab === "global" ? globalCache : 
                        activeTab === "watchlist" ? watchlistCache : searchResults;

    return (
        <View style={styles.container}>
            {/* Search Bar */}
            <TextInput
                style={styles.input}
                placeholder="Search stock news (e.g. AAPL)..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={handleSearch}
                returnKeyType="search"
            />

            {/* Toggle Filters */}
            <View style={{ flexDirection: "row", gap: 10, marginVertical: 10 }}>
                <Pressable 
                    style={[styles.card, { flex: 1, backgroundColor: activeTab === "global" ? "#e5e7eb" : "#fff" }]} 
                    onPress={() => { setActiveTab("global"); setSearchQuery(""); }}
                >
                    <Text style={[styles.title, { textAlign: "center" }]}>Global</Text>
                </Pressable>
                
                <Pressable 
                    style={[styles.card, { flex: 1, backgroundColor: activeTab === "watchlist" ? "#e5e7eb" : "#fff" }]} 
                    onPress={() => { setActiveTab("watchlist"); setSearchQuery(""); }}
                >
                    <Text style={[styles.title, { textAlign: "center" }]}>My Stocks</Text>
                </Pressable>
            </View>

            {/* Content Area */}
            {loading ? (
                <ActivityIndicator size="large" color="#000" style={{ marginTop: 20 }} />
            ) : error ? (
                <Text style={styles.errorText}>{error}</Text>
            ) : (
                <FlatList
                    data={currentData}
                    keyExtractor={(item, index) => `${item.id}-${index}`}
                    refreshControl={
                        <RefreshControl 
                            refreshing={loading} 
                            onRefresh={() => activeTab === "global" ? loadGlobalNews(true) : loadWatchlistNews(true)} 
                        />
                    }
                    renderItem={({ item }) => (
                        <Pressable style={styles.newsCard} onPress={() => openArticle(item.url)}>
                            {item.image ? (
                                <Image source={{ uri: item.image }} style={styles.newsImage} />
                            ) : null}
                            <View style={styles.newsContent}>
                                <View style={styles.newsMetaRow}>
                                    <Text style={styles.newsSource}>{item.source}</Text>
                                    <Text style={styles.newsDate}>{formatDate(item.datetime)}</Text>
                                </View>
                                <Text style={styles.newsHeadline}>{item.headline}</Text>
                                <Text style={styles.newsSummary} numberOfLines={3}>{item.summary}</Text>
                            </View>
                        </Pressable>
                    )}
                    ListEmptyComponent={
                        <Text style={styles.notice}>
                            {activeTab === "watchlist" && stocks.length === 0 
                                ? "Add stocks to your watchlist to see tailored news here." 
                                : "No news available."}
                        </Text>
                    }
                />
            )}
        </View>
    );
}