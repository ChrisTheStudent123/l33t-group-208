import React from "react";
import { Modal, View, Text, Pressable, TouchableWithoutFeedback } from "react-native";
import { styles } from "../styles";

type Props = {
    visible: boolean;
    onClose: () => void;
    onSelect: (seconds: number) => void;
};

export default function RefreshIntervalModal({
    visible,
    onClose,
    onSelect
}: Props) {
    return (
        <Modal visible={visible} transparent animationType="fade">
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.modalBackground}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.h3}>Select Refresh Interval</Text>

                        {[15, 30, 45, 60].map(sec => (
                            <Pressable
                                key={sec}
                                onPress={() => onSelect(sec)}
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