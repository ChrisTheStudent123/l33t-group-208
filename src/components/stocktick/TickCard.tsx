import { styles } from "@/src/styles";
import { ListRenderItemInfo, Text, View } from "react-native";

type Tick = {
  current: number;
  date: number;
  change: number;
};

export function TickCard({item, label, cardColor}: any){
    return (
      <View style={cardColor}>
        <Text style={styles.h3}>Per share: ${item.current}</Text>
        <Text style={styles.notice}>{label} ago</Text>
      </View>
    );
}