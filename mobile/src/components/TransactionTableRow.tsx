import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { colors } from "../theme/colors";
import { Transaction } from "../types";

export interface TransactionTableRowProps {
  item: Transaction;
  onPress?: () => void;
  isEven?: boolean;
}

export const TransactionTableRow = ({
  item,
  onPress,
  isEven = false,
}: TransactionTableRowProps) => {
  return (
    <TouchableOpacity
      style={[styles.row, isEven ? styles.rowEven : null]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.colDate}>
        <Text style={styles.dateText}>{item.dateLabel}</Text>
      </View>

      <View style={styles.colName}>
        <Text style={styles.nameText} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.catText} numberOfLines={1}>
          {item.category}
        </Text>
      </View>

      <View style={styles.colAmount}>
        <Text style={styles.amountText}>-${item.amount.toFixed(2)}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F1F6",
    backgroundColor: "#FFFFFF",
  },
  rowEven: {
    backgroundColor: "#FAF9FC",
  },
  colDate: {
    width: 65,
  },
  dateText: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: "600",
  },
  colName: {
    flex: 1,
    paddingHorizontal: 8,
  },
  nameText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  catText: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 1,
  },
  colAmount: {
    alignItems: "flex-end",
    minWidth: 75,
  },
  amountText: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.textPrimary,
  },
});
