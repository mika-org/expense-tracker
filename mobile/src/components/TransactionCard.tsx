import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { ShoppingBag, Smartphone, Car, Utensils, Zap, Calendar } from "lucide-react-native";
import { colors } from "../theme/colors";
import { Transaction } from "../types";
import { AnimatedCard } from "./AnimatedCard";

export interface TransactionCardProps {
  item: Transaction;
  onPress?: () => void;
  delay?: number;
}

export const TransactionCard = ({
  item,
  onPress,
  delay = 0,
}: TransactionCardProps) => {
  function renderIcon() {
    switch (item.iconType) {
      case "clothing":
        return <ShoppingBag size={22} color="#3B82F6" />;
      case "electronics":
        return <Smartphone size={22} color="#8B5CF6" />;
      case "transport":
        return <Car size={22} color="#F59E0B" />;
      case "food":
        return <Utensils size={22} color="#10B981" />;
      default:
        return <Zap size={22} color={colors.coral} />;
    }
  }

  function getIconBgColor() {
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
    <AnimatedCard
      style={styles.card}
      onPress={onPress}
      delay={delay}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.iconContainer, { backgroundColor: getIconBgColor() }]}>
          {renderIcon()}
        </View>

        <View style={styles.badgeRow}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>{item.category}</Text>
          </View>
        </View>
      </View>

      <View style={styles.body}>
        <Text style={styles.nameText} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.amountText}>- ${item.amount.toFixed(2)}</Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.dateWrap}>
          <Calendar size={12} color={colors.textMuted} />
          <Text style={styles.dateText}>{item.dateLabel}</Text>
        </View>
        {item.tax !== undefined ? (
          <Text style={styles.taxText}>Tax: ${item.tax.toFixed(2)}</Text>
        ) : null}
      </View>
    </AnimatedCard>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeRow: {
    flexDirection: "row",
  },
  categoryBadge: {
    backgroundColor: colors.slateLight,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.textSecondary,
  },
  body: {
    marginBottom: 14,
  },
  nameText: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.textPrimary,
    marginBottom: 4,
  },
  amountText: {
    fontSize: 22,
    fontWeight: "900",
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F4F2F7",
  },
  dateWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  dateText: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: "600",
  },
  taxText: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: "600",
  },
});
