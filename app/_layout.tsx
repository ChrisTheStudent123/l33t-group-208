import { Stack } from "expo-router";
import { Pressable, Text } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { StocksProvider } from "../src/context/StocksContext"

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
                        headerRight: () => (
                        // *** Route for earnings. Can mimic for sending to news from Stock tick/detail screen
                            <Pressable onPress={() => router.push("/earnings")}>
                                <Ionicons name="calendar-outline" size={22} color="black" />
                            </Pressable>
                        ),
                    }}
                />

            </Stack>
        </StocksProvider>
    );
}