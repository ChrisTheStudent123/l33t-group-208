import React from "react";
import { TextInput } from "react-native";
import { styles } from "../styles";

type Props = {
    value: string;
    onChange: (text: string) => void;
    onFocus?: () => void;
};

export default function WLSearchInput({ value, onChange, onFocus }: Props) {
    return (
        <TextInput
            style={styles.input}
            placeholder="Search companies (e.g., Apple, Microsoft)..."
            value={value}
            onChangeText={onChange}
            onFocus={onFocus}
        />
    );
}