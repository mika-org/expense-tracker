import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { ShoppingBag, Smartphone, Car, Utensils, Zap } from "lucide-react-native";
import { colors } from "../theme/colors";
import { Transaction } from "../types";

export interface TransactionRowProps {
  item: Transaction;
  onPress?: () => void;
  darkVariant?: boolean;
}

export const TransactionRow = ({
  item,
  onPress,
  darkVariant = false,
}: TransactionRowProps) => {
  function renderIcon() {
    switch (item.iconType) {
      case "clothing":
        return <ShoppingBag size={20} color="#3B82F6" />;
      case "electronics":
        return <Smartphone size={20} color="#8B5CF6" />;
      case "transport":
        return <Car size={20} color="#F59E0B" />;
      case "food":
        return <Utensils size={20} color="#10B981" />;
      default:
        return <Zap size={20} color={colors.coral} />;
    }
  }

  function getIconBgColor() {
    if (darkVariant) return "rgba(255, 255, 255, 0.1)";
    switch (item.iconType) {
      case "clothing":
        return colors.iconBlue;
      case "electronics":
        return colors.iconPurple;
      case "transport":
        return colors.iconAmber;
      case "food":
        return colors.iconGreen;
      default:
        return colors.iconRose;
    }
  }

  return (
    <TouchableOpacity
      style={[styles.row, darkVariant ? styles.rowDark : null]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.left}>
        <View style={[styles.iconContainer, { backgroundColor: getIconBgColor() }]}>
          {renderIcon()}
        </View>
        <View style={styles.info}>
          <Text
            style={[
              styles.nameText,
              darkVariant ? styles.nameTextDark : null,
            ]}
            numberOfLines={1}
          >
            {item.name}
          </Text>
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>
      </View>

      <View style={styles.right}>
        <Text
          style={[
            styles.amountText,
            darkVariant ? styles.amountTextDark : null,
          ]}
        >
          - ${item.amount.toFixed(2)}
        </Text>
        {item.tax !== undefined ? (
          <Text style={styles.taxText}>Tax: ${item.tax.toFixed(2)}</Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  rowDark: {
    paddingVertical: 10,
    paddingHorizontal: 0,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  info: {
    flex: 1,
  },
  nameText: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 2,
  },
  nameTextDark: {
    color: colors.textWhite,
  },
  categoryText: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: "500",
  },
  right: {
    alignItems: "flex-end",
  },
  amountText: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.textPrimary,
    marginBottom: 2,
  },
  amountTextDark: {
    color: colors.textWhite,
  },
  taxText: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: "500",
  },
});
