import React from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "../styles";

type Stock = {
    symbol: string;
    price: number;
    lastPrice: number;
};

type Props = {
    item: Stock;
    showRemove: boolean;
    onPress: () => void;
    onLongPress: () => void;
    onRemove: () => void;
};

export default function WatchlistItem({
    item,
    showRemove,
    onPress,
    onLongPress,
    onRemove
}: Props) {

    const color =
        item.price > item.lastPrice ? "green" :
        item.price < item.lastPrice ? "red" :
        "black";

    return (
        <Pressable
            style={[styles.card, styles.cardBase]}
            onPress={onPress}
            onLongPress={onLongPress}
        >
            <View style={styles.rowSpace}>
                <Text style={styles.title}>{item.symbol}</Text>
                <Text style={[styles.priceText, { color }]}>
                    ${item.price.toFixed(2)}
                </Text>
            </View>

            {showRemove && (
                <Pressable
                    onPress={onRemove}
                    style={styles.iconButtonWrapper}
                >
                    <Ionicons
                        name="remove-circle-outline"
                        size={styles.iconButtonRemove.fontSize}
                        color={styles.iconButtonRemove.color}
                    />
                </Pressable>
            )}
        </Pressable>
    );
}