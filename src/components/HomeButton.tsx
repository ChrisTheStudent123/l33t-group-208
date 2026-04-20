import React from "react";
import { Pressable, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { styles } from "../styles";

export default function HomeButton() {
  const router = useRouter();

  const goHome = () => {
    // replace with "/" to reset stack to index
    router.replace("/");
  };

  return (
    <Pressable style={styles.button} onPress={goHome} accessibilityRole="button">
      <Text style={styles.text}>Back to Home</Text>
    </Pressable>
  );
}
