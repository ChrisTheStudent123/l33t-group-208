import { Stack } from "expo-router";

export default function RootLayout() {
  // Root uses a Stack, but the actual primary navigation is Tabs inside (tabs).
  return <Stack screenOptions={{ headerShown: false }} />;
}
