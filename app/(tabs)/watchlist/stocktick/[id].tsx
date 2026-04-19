import { useStocksContext } from "@/src/context/StocksContext";
import { styles } from "@/src/styles";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Modal, Pressable, Text, TouchableWithoutFeedback, View } from "react-native";

type MaxTick = 5 | 10 | 25 | 50;

export default function Ticker() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();

  const { stocks, refreshStocks } = useStocksContext();

  const [refreshing, setRefreshing] = useState(false);

  const [refreshInterval, setRefreshInterval] = useState(15000); // 15s default
  const [maxTicks, setMaxTicks] = useState<MaxTick>(5);

  const [intervalModalVisible, setIntervalModalVisible] = useState(false);
  const [maxTicksVisible, setMaxTicksVisible] = useState(false);

  //const event = useMemo(() =>)

  const handleRefresh = async () => {
    if (!stocks.length) return;
    setRefreshing(true);
    await refreshStocks();
    setRefreshing(false);
  };

  const changeInterval = (seconds: number) => {
    setRefreshInterval(seconds * 1000);
    setIntervalModalVisible(false);
  };

  const changeMaxTicks = (length: MaxTick) => {
    setMaxTicks(length);
    setMaxTicksVisible(false);
  };

  return (
    <View style={styles.container}>
      <Text>Ticker screen</Text>

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
              {[15, 30, 45, 60].map((sec) => (
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
