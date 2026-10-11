import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { Header } from "../components/Header";
import { HeroOutcomeCard } from "../components/HeroOutcomeCard";
import { TransactionRow } from "../components/TransactionRow";
import { TransactionCard } from "../components/TransactionCard";
import { TransactionTableRow } from "../components/TransactionTableRow";
import { ViewModeToggle, ViewMode } from "../components/ViewModeToggle";
import { colors } from "../theme/colors";
import { Transaction, DateGroupedTransactions } from "../types";

interface HomeScreenProps {
  onSelectTransaction: (item: Transaction) => void;
  onSearchPress?: () => void;
}

const mockGroupedData: DateGroupedTransactions[] = [
  {
    dateLabel: "Today",
    items: [
      {
        id: "1",
        name: "Nike Store",
        category: "Clothing",
        amount: 734.0,
        tax: 60.35,
        date: "2026-04-11",
        dateLabel: "Today",
        iconType: "clothing",
        type: "expense",
      },
    ],
  },
  {
    dateLabel: "08 April",
    items: [
      {
        id: "2",
        name: "Apple Store",
        category: "Electronics",
        amount: 25.0,
        tax: 4.5,
        date: "2026-04-08",
        dateLabel: "08 April",
        iconType: "electronics",
        type: "expense",
      },
      {
        id: "3",
        name: "Uber",
        category: "Transport",
        amount: 4.99,
        tax: 0.8,
        date: "2026-04-08",
        dateLabel: "08 April",
        iconType: "transport",
        type: "expense",
      },
    ],
  },
  {
    dateLabel: "07 April",
    items: [
      {
        id: "4",
        name: "Starbucks Coffee",
        category: "Food & Drink",
        amount: 6.5,
        tax: 0.65,
        date: "2026-04-07",
        dateLabel: "07 April",
        iconType: "food",
        type: "expense",
      },
      {
        id: "5",
        name: "Whole Foods Market",
        category: "Groceries",
        amount: 142.3,
        tax: 12.4,
        date: "2026-04-07",
        dateLabel: "07 April",
        iconType: "food",
        type: "expense",
      },
    ],
  },
];

export const HomeScreen = ({
  onSelectTransaction,
  onSearchPress,
}: HomeScreenProps) => {
  const [viewMode, setViewMode] = useState<ViewMode>("card");

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header from Screenshot */}
        <Header
          greeting="Hello,"
          userName="Priscilla"
          onSearchPress={onSearchPress}
        />

        {/* Hero Plum Card with Rising Animated Bars */}
        <HeroOutcomeCard amount="$12,560.00" />

        {/* Section Header with Card vs Table Switcher */}
        <View style={styles.sectionTop}>
          <Text style={styles.sectionTitle}>Riwayat Pengeluaran</Text>
          <ViewModeToggle mode={viewMode} onChange={setViewMode} />
        </View>

        {/* Transactions List: Card View vs Table View */}
        <View style={styles.transactionsWrapper}>
          {mockGroupedData.map((group, groupIndex) => (
            <View key={groupIndex} style={styles.groupSection}>
              <Text style={styles.groupHeader}>{group.dateLabel}</Text>

              {viewMode === "card" ? (
                // CARD VIEW (Rich visual cards with entrance animations)
                <View style={styles.cardContainer}>
                  {group.items.map((item, itemIdx) => (
                    <TransactionCard
                      key={item.id}
                      item={item}
                      delay={itemIdx * 80}
                      onPress={() => onSelectTransaction(item)}
                    />
                  ))}
                </View>
              ) : (
                // COMPACT TABLE VIEW
                <View style={styles.tableContainer}>
                  <View style={styles.tableHeader}>
                    <Text style={styles.thDate}>Tanggal</Text>
                    <Text style={styles.thName}>Pihak & Kategori</Text>
                    <Text style={styles.thAmount}>Nominal</Text>
                  </View>
                  {group.items.map((item, i) => (
                    <TransactionTableRow
                      key={item.id}
                      item={item}
                      isEven={i % 2 === 1}
                      onPress={() => onSelectTransaction(item)}
                    />
                  ))}
                </View>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  sectionTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    marginTop: 24,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  transactionsWrapper: {
    marginTop: 6,
  },
  groupSection: {
    marginBottom: 16,
  },
  groupHeader: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textMuted,
    paddingHorizontal: 24,
    marginBottom: 10,
    textTransform: "uppercase",
  },
  cardContainer: {
    paddingHorizontal: 20,
  },
  tableContainer: {
    marginHorizontal: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  tableHeader: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.slateLight,
    borderBottomWidth: 1,
    borderBottomColor: "#EAE8EF",
  },
  thDate: {
    width: 65,
    fontSize: 11,
    fontWeight: "700",
    color: colors.textMuted,
  },
  thName: {
    flex: 1,
    paddingHorizontal: 8,
    fontSize: 11,
    fontWeight: "700",
    color: colors.textMuted,
  },
  thAmount: {
    minWidth: 75,
    textAlign: "right",
    fontSize: 11,
    fontWeight: "700",
    color: colors.textMuted,
  },
});
