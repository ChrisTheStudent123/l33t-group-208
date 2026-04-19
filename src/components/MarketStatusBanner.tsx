import React from "react";
import { View, Text } from "react-native";

type MarketStatus = {
    isOpen: boolean;
    session: string | null;
} | null;

type Props = {
    marketStatus: MarketStatus;
};

export default function MarketStatusBanner({ marketStatus }: Props) {
    if (!marketStatus) {
        return (
            <View
                style={{
                    padding: 10,
                    backgroundColor: "gray",
                }}
            >
                <Text style={{ color: "white", fontWeight: "bold" }}>
                    Loading market status...
                </Text>
            </View>
        );
    }

    return (
        <View
            style={{
                padding: 5,
                backgroundColor: marketStatus.isOpen ? "green" : "red",
            }}
        >
            <Text style={{ color: "white", fontWeight: "bold", textAlign: "center" }}>
                Market is {marketStatus.isOpen ? "OPEN" : "CLOSED"}
                {marketStatus.session ? ` (${marketStatus.session})` : ""}
            </Text>
        </View>
    );
}