import { Stack } from "expo-router";
import { Pressable, Text } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { StocksProvider } from "../../../src/context/StocksContext";

export default function RootLayout() {
  const router = useRouter();

  return (
    <StocksProvider>
      <Stack>
        {/* HOME SCREEN */}
        <Stack.Screen
          name="index"
          options={{
            headerTitle: "My Stocks",
            headerTitleAlign: "center",
          }}
        />
        <Stack.Screen name="stocktick" options={{ title: "Stock Ticker" }} />
      </Stack>
    </StocksProvider>
  );
}
