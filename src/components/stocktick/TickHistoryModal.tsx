import { styles } from "@/src/styles";
import { Modal, Pressable, Text, TouchableWithoutFeedback, View } from "react-native";

export function TickHistoryModal({maxTicksVisible, setMaxTicksVisible, changeMaxTicks}: any){
    return (
        <Modal
        visible={maxTicksVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMaxTicksVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setMaxTicksVisible(false)}>
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              <Text style={styles.h3}>Select History Length</Text>
              {[5, 10, 25, 50].map((len) => (
                <Pressable
                  key={len}
                  onPress={() => changeMaxTicks(len as number)}
                  style={styles.intervalButton}
                >
                  <Text>{len}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    );

}