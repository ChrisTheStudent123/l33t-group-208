//import { styles } from "@/src/styles";
import { ListRenderItemInfo, StyleSheet, Text, View } from "react-native";

type Tick = {
  current: number;
  date: number;
  change: number;
};

function percentDifference(from: number, to: number): string {
  if (Number.isNaN(from) || Number.isNaN(to)) throw new TypeError('Inputs must be numbers');

  if (from === 0) {
    if (to === 0) return '0%';
    return (to > 0 ? 'Infinity%' : '-Infinity%');
  }

  const raw = ((to - from) / Math.abs(from)) * 100;
  const rounded = Math.round(raw * 100) / 100;
  const s = rounded.toFixed(2).replace(/\.?0+$/, '');
  return `${s}%`;
}

const difference = (item: any) => {return percentDifference(item.current, item.change)}

export function TickCard({item, label, cardColor}: any){
    return (
<View style={[styles.card, cardColor]}>
  <View style={styles.left}>
    <Text style={styles.price}>${item.current}</Text>
    <Text style={styles.label}>{label} ago</Text>
  </View>

  <View style={styles.right}>
    <Text style={styles.difference}>{difference(item)}</Text>
  </View>
</View>

    );
}
// Styles
const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginVertical: 6,
    // optional: shadow/elevation for card feel
  },

  left: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    paddingRight: 8,
  },

  right: {
    // ensure the difference doesn't wrap awkwardly
    minWidth: 72,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },

  price: {
    fontSize: 18,            // large and readable in a list
    fontWeight: '700',
    lineHeight: 22,
  },

  label: {
    marginTop: 2,
    fontSize: 12,
    color: '#666',
  },

  difference: {
    fontSize: 16,
    fontWeight: '700',
    // DO NOT change color here; keep whatever color you already set
    // e.g. color: '#0a0' or '#a00' is controlled elsewhere
  },
});
