import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerTitleAlign: "center" }}>
      <Tabs.Screen
        name="watchlist"
        options={{
          title: "My Stocks",
          tabBarIcon: ({ color, size }) => <Ionicons name="bar-chart" size={size} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: "Earnings Calendar",
          tabBarIcon: ({ color, size }) => <Ionicons name="calendar" size={size} />,
        }}
      />
      <Tabs.Screen
        name="news"
        options={{
          title: "Stock News",
          tabBarIcon: ({ color, size }) => <Ionicons name="newspaper" size={size} />,
        }}
      />
    </Tabs>
  );
};
