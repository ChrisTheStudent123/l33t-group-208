import React from "react";
import { View, Text, Pressable } from "react-native";
import { styles } from "../styles";

type SearchResult = {
    description: string;
    displaySymbol: string;
    symbol: string;
    type: string;
};

type Props = {
    results: SearchResult[];
    onSelect: (symbol: string) => void;
};

export default function WLSearchResults({ results, onSelect }: Props) {
    if (!results.length) return null;

    return (
        <View style={{
            backgroundColor: "#f9fafb",
            borderRadius: 8,
            borderWidth: 1,
            borderColor: "#e5e7eb",
            marginTop: 5,
            marginBottom: 10
        }}>
            {results.map((item, index) => (
                <Pressable
                    key={`${item.symbol}-${index}`}
                    style={{ padding: 12, borderBottomWidth: 1, borderBottomColor: "#e5e7eb" }}
                    onPress={() => onSelect(item.symbol)}
                >
                    <View style={styles.rowSpace}>
                        <Text style={{ fontWeight: "bold" }}>{item.symbol}</Text>
                        <Text style={{ fontSize: 12, color: "#6b7280", flexShrink: 1 }}>
                            {item.description}
                        </Text>
                    </View>
                </Pressable>
            ))}
        </View>
    );
}