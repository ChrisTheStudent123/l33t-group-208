import HomeButton from "@/src/components/HomeButton";
import MarketStatusBanner from "@/src/components/MarketStatusBanner";
import { TickCard } from "@/src/components/stocktick/TickCard";
import { TickHistoryModal } from "@/src/components/stocktick/TickHistoryModal";
import { TickIntervalModal } from "@/src/components/stocktick/TickIntervalModal";
import { useStocksContext } from "@/src/context/StocksContext";
import { getMarketStatus } from "@/src/services/finnhub";
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

type Tick = {
  current: number;
  date: number;
  change: number;
};

export default function Ticker() {
  const id = useLocalSearchParams<{ id?: string }>();

  const { stocks, refreshStocks } = useStocksContext();

  const [refreshInterval, setRefreshInterval] = useState(5000); // 15s default
  const [maxTicks, setMaxTicks] = useState<number>(5);

  const [intervalModalVisible, setIntervalModalVisible] = useState(false);
  const [maxTicksVisible, setMaxTicksVisible] = useState(false);

  const [ticksHistory, setTicksHistory] = useState<Tick[]>([]);

  const [marketStatus, setMarketStatus] = useState<{
    isOpen: boolean;
    session: string | null;
  } | null>(null);

  const stock = useMemo(() => stocks.find((e) => e.symbol === id.id), [stocks, id]);

  const fetchMarketStatus = async () => {
    try {
      const status = await getMarketStatus();
      console.log("MARKET STATUS RESPONSE:", status);
      setMarketStatus(status);
    } catch (err) {
      console.log("Failed to fetch market status", err);
    }
  };
  // Market status first load
  useEffect(() => {
    fetchMarketStatus();
  }, []);

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

  const renderItem = ({ item }: ListRenderItemInfo<Tick>) => {
    const diff = now - item.date;
    const label = formatDuration(diff);
    return <TickCard item={item} label={label} cardColor={tickColor(item)} />;
  };

  // memoize data so FlatList doesn't reevaluate unnecessarily
  const memoData = useMemo(() => ticksHistory, [ticksHistory]);

  function addTick() {
    if (marketStatus?.isOpen) {
      if (ticksHistory.length < maxTicks) {
        refreshStocks();
        addNew();
      } else {
        refreshStocks();
        addNew();
        setTicksHistory((prev) => prev.slice(0, -1));
      }
    } else if (ticksHistory.length < 1) {
      refreshStocks();
      addNew();
    }
  }

  //auto refresh
  useEffect(() => {
    const interval = setInterval(() => {
      addTick();
    }, refreshInterval);
    return () => clearInterval(interval);
  }, [stocks, refreshInterval]);

  const changeInterval = (seconds: number) => {
    setRefreshInterval(seconds * 1000);
    setIntervalModalVisible(false);
  };

  const changeMaxTicks = (length: number) => {
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
      <Pressable style={styles.cardBase} onPress={addTick}>
        <Text style={styles.h1}>Currently Monitoring: {stock?.symbol}</Text>
      </Pressable>

      {/* Market Status Banner */}
      <MarketStatusBanner marketStatus={marketStatus} />
      <SafeAreaView style={styles.container}>
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

      <HomeButton />

      {/* Clock/Interval Pop up */}
      <Pressable onPress={() => setIntervalModalVisible(true)} style={styles.clockIntervalButton}>
        <Ionicons name="time-outline" size={24} color="#fff" />
      </Pressable>

      <TickIntervalModal
        intervalModalVisible={intervalModalVisible}
        setIntervalModalVisible={setIntervalModalVisible}
        changeInterval={changeInterval}
      />

      {/* Max Ticks History Pop up */}
      <Pressable onPress={() => setMaxTicksVisible(true)} style={styles.maxTicksButton}>
        <Ionicons name="settings-outline" size={24} color="#fff" />
      </Pressable>

      <TickHistoryModal
        maxTicksVisible={maxTicksVisible}
        setMaxTicksVisible={setMaxTicksVisible}
        changeMaxTicks={changeMaxTicks}
      />
    </View>
  );
}
