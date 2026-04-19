import { Stack } from "expo-router";

export default function RootLayout() {
  return (
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
  );
}