import React, { useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator, Pressable, RefreshControl } from "react-native";
import { getEarningsCalendar } from "../../src/services/finnhub";
import { styles } from "../../src/styles";
import { useStocksContext } from "../../src/context/StocksContext";

// Define the shape of Finnhub's earnings data
type EarningsReport = {
    date: string;
    symbol: string;
    epsEstimate: number | null;
    epsActual: number | null;
    quarter: number;
    year: number;
};

export default function Calendar() {
    const { stocks } = useStocksContext();
    
    // UI State
    const [activeTab, setActiveTab] = useState<"global" | "watchlist">("global");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // In-Memory Cache (Satisfies Andrew's Lab 6 requirement)
    const [globalCache, setGlobalCache] = useState<EarningsReport[]>([]);

    // Helper to get dates (Today to +14 Days)
    const getDateRange = () => {
        const from = new Date();
        const to = new Date();
        to.setDate(from.getDate() + 14);
        return {
            from: from.toISOString().split('T')[0],
            to: to.toISOString().split('T')[0]
        };
    };

    const loadEarnings = async (forceRefresh = false) => {
        if (globalCache.length > 0 && !forceRefresh) return;
        
        setLoading(true);
        setError(null);
        try {
            const { from, to } = getDateRange();
            const data = await getEarningsCalendar(from, to);
            
            // Sort chronologically
            const sortedData = data.sort((a: EarningsReport, b: EarningsReport) => 
                new Date(a.date).getTime() - new Date(b.date).getTime()
            );
            
            setGlobalCache(sortedData);
        } catch (err) {
            setError("Failed to load earnings calendar.");
        }
        setLoading(false);
    };

    useEffect(() => {
        loadEarnings();
    }, []);

    // Filter logic: If on watchlist tab, only show reports for symbols in context
    const currentData = activeTab === "global" 
        ? globalCache 
        : globalCache.filter(report => stocks.some(s => s.symbol === report.symbol));

    return (
        <View style={styles.container}>
            {/* Toggle Filters */}
            <View style={{ flexDirection: "row", gap: 10, marginVertical: 10 }}>
                <Pressable 
                    style={[styles.card, { flex: 1, backgroundColor: activeTab === "global" ? "#e5e7eb" : "#fff" }]} 
                    onPress={() => setActiveTab("global")}
                >
                    <Text style={[styles.title, { textAlign: "center" }]}>Upcoming</Text>
                </Pressable>
                
                <Pressable 
                    style={[styles.card, { flex: 1, backgroundColor: activeTab === "watchlist" ? "#e5e7eb" : "#fff" }]} 
                    onPress={() => setActiveTab("watchlist")}
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
                    keyExtractor={(item, index) => `${item.symbol}-${item.date}-${index}`}
                    refreshControl={
                        <RefreshControl refreshing={loading} onRefresh={() => loadEarnings(true)} />
                    }
                    renderItem={({ item }) => (
                        <View style={[styles.card, styles.cardBase, { marginBottom: 10 }]}>
                            <View style={styles.rowSpace}>
                                <Text style={styles.h2}>{item.symbol}</Text>
                                <Text style={styles.newsDate}>{item.date}</Text>
                            </View>
                            <View style={{ paddingHorizontal: 5, marginTop: 5 }}>
                                <Text style={styles.p}>
                                    Quarter: Q{item.quarter} {item.year}
                                </Text>
                                <Text style={styles.p}>
                                    EPS Estimate: {item.epsEstimate ? `$${item.epsEstimate.toFixed(2)}` : "N/A"}
                                </Text>
                                {item.epsActual !== null && (
                                    <Text style={[styles.p, { fontWeight: 'bold' }]}>
                                        EPS Actual: ${item.epsActual.toFixed(2)}
                                    </Text>
                                )}
                            </View>
                        </View>
                    )}
                    ListEmptyComponent={
                        <Text style={styles.notice}>
                            {activeTab === "watchlist" && stocks.length === 0 
                                ? "Add stocks to your watchlist to see upcoming earnings." 
                                : "No upcoming earnings reports found."}
                        </Text>
                    }
                />
            )}
        </View>
    );
}