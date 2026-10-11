import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Header } from "../components/Header";
import { HeroOutcomeCard } from "../components/HeroOutcomeCard";
import { TransactionRow } from "../components/TransactionRow";
import { TransactionCard } from "../components/TransactionCard";
import { TransactionTableRow } from "../components/TransactionTableRow";
import { ViewModeToggle, ViewMode } from "../components/ViewModeToggle";
import { colors } from "../theme/colors";
import { Transaction, DateGroupedTransactions } from "../types";
import { api, ApiDashboardData } from "../services/api";

interface HomeScreenProps {
  onSelectTransaction: (item: Transaction) => void;
  onSearchPress?: () => void;
}

export const HomeScreen = ({
  onSelectTransaction,
  onSearchPress,
}: HomeScreenProps) => {
  const [viewMode, setViewMode] = useState<ViewMode>("card");
  const [loading, setLoading] = useState(false);
  const [dashboard, setDashboard] = useState<ApiDashboardData | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await api.getDashboard();
      if (data) {
        setDashboard(data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalExpenseFormatted = dashboard?.summary?.totalExpense !== undefined
    ? `Rp ${Number(dashboard.summary.totalExpense).toLocaleString("id-ID")}`
    : "Rp 0";

  const chartData = dashboard?.chartData && dashboard.chartData.length > 0
    ? dashboard.chartData
    : dashboard?.cashFlowTimeline && dashboard.cashFlowTimeline.length > 0
    ? dashboard.cashFlowTimeline.slice(0, 5).reverse().map((item, idx, arr) => ({
        month: item.date,
        amount: Math.round(item.expense / 100000), // scale to bar heights
        active: idx === arr.length - 1,
      }))
    : undefined;

  const displayedGroups: DateGroupedTransactions[] = (() => {
    if (dashboard?.recentTransactions && dashboard.recentTransactions.length > 0) {
      // Group API transactions by dateLabel
      const groupsMap = new Map<string, Transaction[]>();
      for (const t of dashboard.recentTransactions) {
        let label = t.dateLabel;
        if (!label && t.date) {
          const d = new Date(t.date);
          const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"];
          label = `${d.getDate()} ${months[d.getMonth()]}`;
        }
        if (!label) label = "Recent";

        if (!groupsMap.has(label)) {
          groupsMap.set(label, []);
        }

        const catName = t.categoryName || t.category || "General";
        const catLower = catName.toLowerCase();
        const iconType = (catLower.includes("cloth") || catLower.includes("pakaian") ? "clothing" :
                         catLower.includes("gadget") || catLower.includes("phone") || catLower.includes("elektronik") ? "electronics" :
                         catLower.includes("trans") || catLower.includes("kendaraan") || catLower.includes("ride") ? "transport" :
                         catLower.includes("makan") || catLower.includes("food") || catLower.includes("kopi") ? "food" : "general") as any;

        groupsMap.get(label)!.push({
          id: t.id,
          name: t.description || t.merchant || "Transaksi",
          merchant: t.merchant || t.description,
          description: t.description || catName,
          category: catName,
          amount: t.amount,
          taxAmount: t.taxAmount,
          date: t.date || new Date().toISOString(),
          dateLabel: label,
          iconType,
          type: t.type,
        });
      }
      return Array.from(groupsMap.entries()).map(([dateLabel, items]) => ({
        dateLabel,
        items,
      }));
    }
    return [];
  })();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadData} colors={[colors.coral]} tintColor={colors.coral} />
        }
      >
        {/* Header from Screenshot */}
        <Header
          greeting="Halo,"
          userName={dashboard?.user?.name || "Aditia M"}
          onSearchPress={onSearchPress}
        />

        {/* Hero Plum Card with Rising Animated Bars */}
        <HeroOutcomeCard amount={totalExpenseFormatted} chartData={chartData} />

        {/* Section Header with Card vs Table Switcher */}
        <View style={styles.sectionTop}>
          <Text style={styles.sectionTitle}>Riwayat Pengeluaran</Text>
          <ViewModeToggle mode={viewMode} onChange={setViewMode} />
        </View>

        {/* Transactions List: Card View vs Table View */}
        <View style={styles.transactionsWrapper}>
          {displayedGroups.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>Belum Ada Transaksi</Text>
              <Text style={styles.emptySubtitle}>
                Semua data dummy telah dibersihkan. Catat transaksi baru Anda dengan tombol (+) di bawah untuk mulai memantau pengeluaran.
              </Text>
            </View>
          ) : (
            displayedGroups.map((group, groupIndex) => (
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
            ))
          )}
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
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.textPrimary,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 18,
  },
});
