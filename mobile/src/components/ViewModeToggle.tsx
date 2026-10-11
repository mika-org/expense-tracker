import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { LayoutGrid, Table } from "lucide-react-native";
import { colors } from "../theme/colors";

export type ViewMode = "card" | "table";

export interface ViewModeToggleProps {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
}

export const ViewModeToggle = ({ mode, onChange }: ViewModeToggleProps) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.btn, mode === "card" ? styles.btnActive : null]}
        onPress={() => onChange("card")}
        activeOpacity={0.8}
      >
        <LayoutGrid size={14} color={mode === "card" ? "#FFFFFF" : colors.textMuted} />
        <Text style={[styles.text, mode === "card" ? styles.textActive : null]}>Card</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.btn, mode === "table" ? styles.btnActive : null]}
        onPress={() => onChange("table")}
        activeOpacity={0.8}
      >
        <Table size={14} color={mode === "table" ? "#FFFFFF" : colors.textMuted} />
        <Text style={[styles.text, mode === "table" ? styles.textActive : null]}>Tabel</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 3,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  btnActive: {
    backgroundColor: colors.plum,
  },
  text: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.textMuted,
  },
  textActive: {
    color: "#FFFFFF",
  },
});
