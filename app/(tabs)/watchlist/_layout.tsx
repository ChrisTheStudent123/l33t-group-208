import { Stack } from "expo-router";
import { StocksProvider } from "../../../src/context/StocksContext";

export default function RootLayout() {
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
        <Stack.Screen name="stocktick/[id]" options={{ title: "Stock Ticker" }} />
      </Stack>
    </StocksProvider>
  );
}
