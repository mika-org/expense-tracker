import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Animated,
} from "react-native";
import { Edit2, Trash2, ChevronLeft } from "lucide-react-native";
import { CategoryPills } from "../components/CategoryPills";
import { TransactionRow } from "../components/TransactionRow";
import { TransactionTableRow } from "../components/TransactionTableRow";
import { ViewModeToggle, ViewMode } from "../components/ViewModeToggle";
import { colors } from "../theme/colors";
import { Transaction } from "../types";

interface DetailScreenProps {
  transaction?: Transaction | null;
  onBack?: () => void;
}

const defaultTx: Transaction = {
  id: "1",
  name: "Nike Store",
  category: "Food & Drink",
  amount: 734.0,
  tax: 60.35,
  date: "2026-04-11",
  dateLabel: "Today",
  iconType: "clothing",
  type: "expense",
};

const categoriesList = ["Food & Drink", "Clothing & shoes", "Furniture", "Transport"];

const bottomRelatedTransactions: Transaction[] = [
  {
    id: "r1",
    name: "Nike Store",
    category: "Clothing",
    amount: 734.0,
    tax: 60.35,
    date: "2026-04-11",
    dateLabel: "Today",
    iconType: "clothing",
    type: "expense",
  },
  {
    id: "r2",
    name: "Nike Store",
    category: "Clothing",
    amount: 25.0,
    tax: 4.5,
    date: "2026-04-09",
    dateLabel: "09 April",
    iconType: "clothing",
    type: "expense",
  },
  {
    id: "r3",
    name: "Nike Store",
    category: "Shoes",
    amount: 4.99,
    tax: 0.8,
    date: "2026-04-09",
    dateLabel: "09 April",
    iconType: "clothing",
    type: "expense",
  },
];

export const DetailScreen = ({
  transaction = defaultTx,
  onBack,
}: DetailScreenProps) => {
  const [selectedCategory, setSelectedCategory] = useState("Food & Drink");
  const [viewMode, setViewMode] = useState<ViewMode>("card");
  const current = transaction || defaultTx;

  // Staggered animated bar heights
  const barHeights = [40, 65, 50, 70, 90];
  const barAnims = useRef(barHeights.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const anims = barHeights.map((h, i) =>
      Animated.timing(barAnims[i], {
        toValue: h,
        duration: 550,
        delay: 100 + i * 80,
        useNativeDriver: false,
      })
    );
    Animated.parallel(anims).start();
  }, [barAnims]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        
        {/* Top Header Card (White surface from screenshot) */}
        <View style={styles.topCard}>
          {/* Navigation & Action Bar */}
          <View style={styles.navRow}>
            {onBack ? (
              <TouchableOpacity onPress={onBack} style={styles.iconBtn}>
                <ChevronLeft size={20} color={colors.textPrimary} />
              </TouchableOpacity>
            ) : (
              <View style={{ width: 36 }} />
            )}

            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.iconBtn} activeOpacity={0.8}>
                <Edit2 size={16} color={colors.textPrimary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn} activeOpacity={0.8}>
                <Trash2 size={16} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Large Amount Title & Details */}
          <View style={styles.amountSection}>
            <Text style={styles.amountText}>- ${current.amount.toFixed(2)}</Text>
            <Text style={styles.categoryTitle}>{current.category}</Text>
            {current.tax ? (
              <Text style={styles.metaText}>Tax: ${current.tax.toFixed(2)}</Text>
            ) : null}
            <Text style={styles.dateMeta}>April, 2026</Text>
          </View>

          {/* Dotted threshold line & Rising animated comparison bar chart */}
          <View style={styles.chartArea}>
            <View style={styles.dashedLine} />
            <View style={styles.chartBars}>
              {[
                { month: "Aug", active: false },
                { month: "Oct", active: false },
                { month: "Dec", active: false },
                { month: "Feb", active: false },
                { month: "Apr", active: true },
              ].map((b, i) => (
                <View key={i} style={styles.chartCol}>
                  <Animated.View
                    style={[
                      styles.chartBar,
                      { height: barAnims[i] },
                      b.active ? styles.chartBarActive : styles.chartBarMuted,
                    ]}
                  />
                  <Text style={styles.chartMonth}>{b.month}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Category Chips Scroll */}
          <CategoryPills
            categories={categoriesList}
            activeCategory={selectedCategory}
            onSelect={setSelectedCategory}
          />
        </View>

        {/* Bottom Dark Plum Container Card (Screen 2 from reference) */}
        <View style={styles.bottomPlumCard}>
          <View style={styles.plumHeaderRow}>
            <Text style={styles.plumDateHeader}>Today</Text>
            <ViewModeToggle mode={viewMode} onChange={setViewMode} />
          </View>

          {viewMode === "card" ? (
            <View>
              <TransactionRow item={bottomRelatedTransactions[0]} darkVariant />
              <Text style={[styles.plumDateHeader, { marginTop: 18 }]}>09 April</Text>
              <TransactionRow item={bottomRelatedTransactions[1]} darkVariant />
              <TransactionRow item={bottomRelatedTransactions[2]} darkVariant />
            </View>
          ) : (
            <View style={styles.darkTable}>
              {bottomRelatedTransactions.map((tx, idx) => (
                <View key={tx.id} style={styles.darkTableRow}>
                  <Text style={styles.darkTableDate}>{tx.dateLabel}</Text>
                  <Text style={styles.darkTableName} numberOfLines={1}>
                    {tx.name} ({tx.category})
                  </Text>
                  <Text style={styles.darkTableAmt}>-${tx.amount.toFixed(2)}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scroll: {
    flexGrow: 1,
  },
  topCard: {
    backgroundColor: "#FFFFFF",
    paddingTop: 12,
  },
  navRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 10,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#F3F1F6",
    alignItems: "center",
    justifyContent: "center",
  },
  amountSection: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  amountText: {
    fontSize: 34,
    fontWeight: "900",
    color: colors.textPrimary,
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  categoryTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 2,
  },
  metaText: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: "500",
  },
  dateMeta: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  chartArea: {
    height: 120,
    paddingHorizontal: 24,
    justifyContent: "flex-end",
    marginBottom: 8,
    position: "relative",
  },
  dashedLine: {
    position: "absolute",
    top: 20,
    left: 24,
    right: 24,
    height: 1,
    borderWidth: 1,
    borderColor: "#E5E1EC",
    borderStyle: "dashed",
  },
  chartBars: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  chartCol: {
    alignItems: "center",
    width: 36,
  },
  chartBar: {
    width: 22,
    borderRadius: 6,
    marginBottom: 6,
  },
  chartBarMuted: {
    backgroundColor: "#EFEBF5",
  },
  chartBarActive: {
    backgroundColor: colors.coral,
  },
  chartMonth: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: "600",
  },
  bottomPlumCard: {
    flex: 1,
    backgroundColor: colors.plumCardBottom,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingTop: 24,
    paddingBottom: 40,
    paddingHorizontal: 20,
    marginTop: 12,
  },
  plumHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  plumDateHeader: {
    fontSize: 13,
    fontWeight: "700",
    color: "#C5B6CF",
    paddingHorizontal: 4,
  },
  darkTable: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 20,
    padding: 12,
    marginTop: 6,
  },
  darkTableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.08)",
  },
  darkTableDate: {
    width: 65,
    fontSize: 11,
    color: "#C5B6CF",
    fontWeight: "600",
  },
  darkTableName: {
    flex: 1,
    fontSize: 13,
    color: "#FFFFFF",
    fontWeight: "700",
    paddingHorizontal: 6,
  },
  darkTableAmt: {
    fontSize: 13,
    color: "#FFFFFF",
    fontWeight: "900",
  },
});
