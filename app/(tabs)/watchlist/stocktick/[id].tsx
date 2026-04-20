import { TickCard } from "@/src/components/stocktick/TickCard";
import { useStocksContext } from "@/src/context/StocksContext";
import { styles } from "@/src/styles";
import { Ionicons } from "@expo/vector-icons";
import { Background, Button } from "@react-navigation/elements";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  ListRenderItemInfo,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const formatDuration = (ms: number) => {
  if (ms < 0) ms = -ms;
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const two = (n: number) => (n < 10 ? "0" + n : String(n));
  return `${two(h)}:${two(m)}:${two(s)}`;
};

type MaxTick = 5 | 10 | 25 | 50;

type Tick = {
  current: number;
  date: number;
  change: number;
};

export default function Ticker() {
  const router = useRouter();
  const id = useLocalSearchParams<{ id?: string }>();

  const { stocks, refreshStocks } = useStocksContext();

  const [refreshInterval, setRefreshInterval] = useState(5000); // 15s default
  const [maxTicks, setMaxTicks] = useState<MaxTick>(5);

  const [intervalModalVisible, setIntervalModalVisible] = useState(false);
  const [maxTicksVisible, setMaxTicksVisible] = useState(false);

  const [ticksHistory, setTicksHistory] = useState<Tick[]>([]);

  const stock = useMemo(() => stocks.find((e) => e.symbol === id.id), [stocks, id]);

  //time stuff

  // now ticks every second to cause rerender of list items durations
  const [now, setNow] = useState<number>(Date.now());
  useEffect(() => {
    const iv = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(iv);
  }, []);

  // Add a new item newestfirst
  const addNew = () => {
    const date = Date.now();
    setTicksHistory((prev) => [
      { date: date, current: stock?.price as number, change: stock?.lastPrice as number },
      ...prev,
    ]);
  };

  const tickColor = (item: Tick) => {
    if (item.current === item.change) {
      return styles.cardBaseGrey;
    } else if (item.current > item.change) {
      return styles.cardBaseGreen;
    } else {
      return styles.cardBaseRed;
    }
  };

  //    backgroundColor: "#fff",
  const renderItem = ({ item }: ListRenderItemInfo<Tick>) => {
    const diff = now - item.date;
    const label = formatDuration(diff);
    return <TickCard item={item} label={label} cardColor={tickColor(item)} />;
  };

  // memoize data so FlatList doesn't reevaluate unnecessarily
  const memoData = useMemo(() => ticksHistory, [ticksHistory]);

  //time stuff end
  function addTick() {
    if (ticksHistory.length < maxTicks) {
      addNew();
    } else {
      addNew();
      setTicksHistory((prev) => prev.slice(0, -1));
    }
  }

  //auto refresh
  useEffect(() => {
    const interval = setInterval(() => {
      if (ticksHistory.length < maxTicks) {
        refreshStocks();
        addNew();
      } else {
        refreshStocks();
        addNew();
        setTicksHistory((prev) => prev.slice(0, -1));
      }
    }, refreshInterval);
    return () => clearInterval(interval);
  }, [stocks, refreshInterval]);

  const changeInterval = (seconds: number) => {
    setRefreshInterval(seconds * 1000);
    setIntervalModalVisible(false);
  };

  const changeMaxTicks = (length: MaxTick) => {
    const diff = ticksHistory.length - length;
    //removes excess history
    for (let i = 0; i < diff; i++) {
      setTicksHistory((prev) => prev.slice(0, -1));
    }
    setMaxTicks(length);
    setMaxTicksVisible(false);
  };

  return (
    <View style={styles.container}>
      <Text>Ticker screen</Text>

      <SafeAreaView style={styles.container}>
        <View>
          <Pressable onPress={addTick}>
            <Text style={styles.h1}>Press to add tick</Text>
          </Pressable>
        </View>

        <FlatList
          data={memoData}
          keyExtractor={(e) => String(e.date)}
          renderItem={renderItem}
          contentContainerStyle={styles.container}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={21}
        />
      </SafeAreaView>

      {/* Clock/Interval Pop up */}
      <Pressable onPress={() => setIntervalModalVisible(true)} style={styles.clockIntervalButton}>
        <Ionicons name="time-outline" size={24} color="#fff" />
      </Pressable>

      <Modal
        visible={intervalModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIntervalModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIntervalModalVisible(false)}>
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              <Text style={styles.h3}>Select Refresh Interval</Text>
              {[3, 5, 10, 15].map((sec) => (
                <Pressable
                  key={sec}
                  onPress={() => changeInterval(sec)}
                  style={styles.intervalButton}
                >
                  <Text>{sec}s</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Max Ticks History Pop up */}
      <Pressable onPress={() => setMaxTicksVisible(true)} style={styles.maxTicksButton}>
        <Ionicons name="list-circle-outline" size={24} color="#fff" />
      </Pressable>

      <Modal
        visible={maxTicksVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMaxTicksVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setMaxTicksVisible(false)}>
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              <Text style={styles.h3}>Select Stock Tick History Length</Text>
              {[5, 10, 25, 50].map((len) => (
                <Pressable
                  key={len}
                  onPress={() => changeMaxTicks(len as MaxTick)}
                  style={styles.intervalButton}
                >
                  <Text>{len}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}
