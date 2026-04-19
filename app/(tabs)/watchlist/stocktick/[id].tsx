import { useLocalSearchParams, useRouter } from "expo-router";
import { Text, View } from "react-native";

export default function Ticker() {
  const router = useRouter();
  const params = useLocalSearchParams<{id?: string}>();
  return (
    <View>
      <Text>Ticker screen</Text>
    </View>
  );
}

