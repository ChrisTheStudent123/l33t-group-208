import { styles } from "@/src/styles";
import { Modal, Pressable, Text, TouchableWithoutFeedback, View } from "react-native";

export function TickIntervalModal({intervalModalVisible, setIntervalModalVisible, changeInterval}: any) {
  return (
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
  );
}
