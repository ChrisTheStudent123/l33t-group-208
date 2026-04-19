import { Stack } from "expo-router";
import { StocksProvider } from "../src/context/StocksContext";

export default function RootLayout() {
  // Hoisted state: Now the entire app (Watchlist, Calendar, News) 
  // shares the exact same stock data in memory.
  return (
    <StocksProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </StocksProvider>
  );
}