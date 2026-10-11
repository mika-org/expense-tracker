import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  Animated,
  RefreshControl,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TrendingUp, TrendingDown, Scale, Download, BarChart2 } from "lucide-react-native";
import { ViewModeToggle, ViewMode } from "../components/ViewModeToggle";
import { colors } from "../theme/colors";
import { api } from "../services/api";
import { FadeInView, ScalePress } from "../components/AnimatedComponents";

export const StatsScreen = () => {
  const [period, setPeriod] = useState<"Bulan Ini" | "Bulan Lalu" | "Tahun Ini">("Bulan Ini");
  const [catFilter, setCatFilter] = useState<"all" | "expense" | "income">("expense");
  const [viewMode, setViewMode] = useState<ViewMode>("card");
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<{
    totalIncome: number;
    totalExpense: number;
    netCashFlow: number;
    categoryBreakdown: Array<{ name: string; type?: string; color: string; amount: number; pct: number }>;
    categories?: Array<{ name: string; type: string; color: string; amount: number; pct: number }>;
  }>({
    totalIncome: 0,
    totalExpense: 0,
    netCashFlow: 0,
    categoryBreakdown: [],
    categories: [],
  });

  const fetchReports = async (p = period) => {
    setLoading(true);
    try {
      const apiPeriod = p === "Bulan Lalu" ? "last_month" : p === "Tahun Ini" ? "this_year" : "this_month";
      const data = await api.getReports(apiPeriod);
      if (data) {
        setReportData({
          totalIncome: data.totalIncome || 0,
          totalExpense: data.totalExpense || 0,
          netCashFlow: data.netCashFlow || 0,
          categoryBreakdown: data.categoryBreakdown || [],
          categories: data.categories || data.categoryBreakdown || [],
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports(period);
  }, [period]);

  const activeCategoriesList = (() => {
    const list = reportData.categories && reportData.categories.length > 0
      ? reportData.categories
      : reportData.categoryBreakdown.map((c) => ({ ...c, type: "expense" }));
    if (catFilter === "all") return list;
    return list.filter((c) => (c.type || "expense") === catFilter);
  })();

  const [selectedCatIdx, setSelectedCatIdx] = useState<number | null>(null);

  // Animated progress bars
  const fillAnims = useRef(activeCategoriesList.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const anims = activeCategoriesList.map((c, i) =>
      Animated.timing(fillAnims[i] || new Animated.Value(0), {
        toValue: c.pct,
        duration: 700,
        delay: 100 + i * 80,
        useNativeDriver: false,
      })
    );
    Animated.parallel(anims).start();
  }, [activeCategoriesList]);

  const handleExportCsv = () => {
    Alert.alert(
      "Ekspor Laporan (CSV)",
      `Laporan statistik transaksi periode "${period}" telah disiapkan. Data mencakup total pemasukan, pengeluaran, dan arus kas.`,
      [{ text: "Tutup" }]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerIconCircle}>
            <BarChart2 size={20} color={colors.plum} />
          </View>
          <Text style={styles.headerTitle}>Statistik & Laporan</Text>
        </View>

        <ScalePress style={styles.exportBtn} onPress={handleExportCsv}>
          <Download size={14} color="#FFFFFF" strokeWidth={2.5} />
          <Text style={styles.exportBtnText}>CSV</Text>
        </ScalePress>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={() => fetchReports()} colors={[colors.coral]} tintColor={colors.coral} />
        }
      >
        {/* Primary Period Selector Tabs (Equal 1/3 Width Each) */}
        <View style={styles.periodRow}>
          {(["Bulan Ini", "Bulan Lalu", "Tahun Ini"] as const).map((p) => {
            const isActive = period === p;
            return (
              <ScalePress
                key={p}
                containerStyle={styles.periodBtnContainer}
                style={[styles.periodBtn, isActive ? styles.periodBtnActive : null]}
                onPress={() => {
                  setPeriod(p);
                  setSelectedCatIdx(null);
                }}
              >
                <Text style={[styles.periodText, isActive ? styles.periodTextActive : null]}>
                  {p}
                </Text>
              </ScalePress>
            );
          })}
        </View>

        {/* 3 Metric Summary Cards */}
        <FadeInView delay={0}>
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <View style={styles.metricTop}>
                <Text style={styles.metricLabel}>Pemasukan</Text>
                <TrendingUp size={16} color={colors.incomeGreen} />
              </View>
              <Text style={[styles.metricValue, { color: colors.incomeGreen }]}>
                Rp {reportData.totalIncome.toLocaleString("id-ID")}
              </Text>
            </View>

            <View style={styles.metricCard}>
              <View style={styles.metricTop}>
                <Text style={styles.metricLabel}>Pengeluaran</Text>
                <TrendingDown size={16} color={colors.coral} />
              </View>
              <Text style={[styles.metricValue, { color: colors.coral }]}>
                Rp {reportData.totalExpense.toLocaleString("id-ID")}
              </Text>
            </View>
          </View>

          <View style={[styles.metricCard, { marginBottom: 24 }]}>
            <View style={styles.metricTop}>
              <Text style={styles.metricLabel}>Surplus Arus Kas</Text>
              <Scale size={16} color={reportData.netCashFlow >= 0 ? "#0D9488" : colors.coral} />
            </View>
            <Text style={[styles.metricValue, { color: reportData.netCashFlow >= 0 ? "#0D9488" : colors.coral }]}>
              {reportData.netCashFlow >= 0 ? "+" : ""}Rp {reportData.netCashFlow.toLocaleString("id-ID")}
            </Text>
          </View>
        </FadeInView>

        {/* Secondary Category Filter Tabs & View Mode Switcher */}
        <View style={styles.rankingHeaderRow}>
          <View style={styles.catFilterRow}>
            {[
              { key: "expense", label: "Pengeluaran" },
              { key: "income", label: "Pemasukan" },
              { key: "all", label: "Semua" },
            ].map((f) => {
              const active = catFilter === f.key;
              return (
                <ScalePress
                  key={f.key}
                  style={[styles.catFilterChip, active ? styles.catFilterChipActive : null]}
                  onPress={() => {
                    setCatFilter(f.key as any);
                    setSelectedCatIdx(null);
                  }}
                >
                  <Text style={[styles.catFilterText, active ? styles.catFilterTextActive : null]}>
                    {f.label}
                  </Text>
                </ScalePress>
              );
            })}
          </View>

          <ViewModeToggle mode={viewMode} onChange={setViewMode} />
        </View>

        {/* Ranking List: Card vs Table View or Empty State */}
        {activeCategoriesList.length === 0 ? (
          <FadeInView delay={100}>
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>Belum Ada Data Transaksi</Text>
              <Text style={styles.emptySubtitle}>
                Tidak ada data {catFilter === "all" ? "transaksi" : catFilter === "expense" ? "pengeluaran" : "pemasukan"} tercatat untuk {period.toLowerCase()}.
              </Text>
            </View>
          </FadeInView>
        ) : viewMode === "card" ? (
          <View style={styles.rankingList}>
            {activeCategoriesList.map((c, i) => {
              const animVal = fillAnims[i] || new Animated.Value(c.pct);
              const widthInterpolation = animVal.interpolate({
                inputRange: [0, 100],
                outputRange: ["0%", "100%"],
              });
              const isSelected = selectedCatIdx === i;

              return (
                <FadeInView key={`${c.name}-${c.type}-${i}`} delay={i * 40}>
                  <ScalePress
                    style={[
                      styles.rankingCard,
                      isSelected ? styles.rankingCardActive : null,
                    ]}
                    onPress={() => setSelectedCatIdx(isSelected ? null : i)}
                  >
                    <View style={styles.rankingTop}>
                      <View style={styles.rankingLeft}>
                        <View style={[styles.dot, { backgroundColor: c.color }]} />
                        <Text style={styles.catName}>{c.name}</Text>
                        {c.type && (
                          <View
                            style={[
                              styles.typeTag,
                              { backgroundColor: c.type === "income" ? "#ECFDF5" : "#FFF1F2" },
                            ]}
                          >
                            <Text
                              style={[
                                styles.typeTagText,
                                { color: c.type === "income" ? "#059669" : "#E11D48" },
                              ]}
                            >
                              {c.type === "income" ? "Masuk" : "Keluar"}
                            </Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.amountText}>
                        Rp {c.amount.toLocaleString("id-ID")}{" "}
                        <Text style={styles.pctLabel}>({c.pct}%)</Text>
                      </Text>
                    </View>

                    <View style={styles.barTrack}>
                      <Animated.View
                        style={[
                          styles.barFill,
                          { width: widthInterpolation, backgroundColor: c.color },
                        ]}
                      />
                    </View>

                    {isSelected && (
                      <View style={styles.catPopover}>
                        <Text style={styles.catPopoverText}>
                          Porsi {c.pct}% dari total {c.type === "income" ? "pemasukan" : "pengeluaran"} ({period})
                        </Text>
                      </View>
                    )}
                  </ScalePress>
                </FadeInView>
              );
            })}
          </View>
        ) : (
          <View style={styles.tableCard}>
            <View style={styles.tableHead}>
              <Text style={styles.thCat}>Kategori</Text>
              <Text style={styles.thPct}>Porsi</Text>
              <Text style={styles.thAmt}>Nominal</Text>
            </View>
            {activeCategoriesList.map((c, i) => (
              <View key={`${c.name}-${i}`} style={[styles.tableRow, i % 2 === 1 ? styles.tableRowEven : null]}>
                <View style={styles.tdCatBox}>
                  <View style={[styles.dotSmall, { backgroundColor: c.color }]} />
                  <View>
                    <Text style={styles.tdCatText} numberOfLines={1}>
                      {c.name}
                    </Text>
                    <Text style={{ fontSize: 10, color: c.type === "income" ? "#059669" : "#E11D48", fontWeight: "700" }}>
                      {c.type === "income" ? "Pemasukan" : "Pengeluaran"}
                    </Text>
                  </View>
                </View>
                <Text style={styles.tdPctText}>{c.pct}%</Text>
                <Text style={styles.tdAmtText}>Rp {c.amount.toLocaleString("id-ID")}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F0EEF4",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.slateLight,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 18, fontWeight: "900", color: colors.textPrimary },
  exportBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: colors.coral,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  exportBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
  content: { padding: 20, paddingBottom: 40 },
  periodRow: {
    flexDirection: "row",
    backgroundColor: "#F3F1F6",
    borderRadius: 20,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#EAE7EE",
    alignItems: "center",
  },
  periodBtnContainer: {
    flex: 1,
  },
  periodBtn: {
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    width: "100%",
  },
  periodBtnActive: {
    backgroundColor: colors.plum,
    shadowColor: colors.plum,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 3,
  },
  periodText: { fontSize: 13, fontWeight: "700", color: colors.textMuted },
  periodTextActive: { color: "#FFFFFF", fontWeight: "800" },
  metricsGrid: { flexDirection: "row", gap: 12, marginBottom: 12 },
  metricCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  metricTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  metricLabel: { fontSize: 11, fontWeight: "600", color: colors.textMuted, textTransform: "uppercase" },
  metricValue: { fontSize: 18, fontWeight: "900" },
  rankingHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  catFilterRow: {
    flexDirection: "row",
    gap: 6,
  },
  catFilterChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: "#F3F1F6",
  },
  catFilterChipActive: {
    backgroundColor: colors.plum,
  },
  catFilterText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.textMuted,
  },
  catFilterTextActive: {
    color: "#FFFFFF",
  },
  typeTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 6,
  },
  typeTagText: {
    fontSize: 9,
    fontWeight: "800",
  },
  rankingList: { gap: 12 },
  rankingCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  rankingCardActive: {
    borderColor: colors.plum,
    borderWidth: 1.5,
    backgroundColor: "#FDFCFE",
  },
  catPopover: {
    marginTop: 10,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: colors.slateLight,
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  catPopoverText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: "700",
  },
  rankingTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  rankingLeft: { flexDirection: "row", alignItems: "center" },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
  catName: { fontSize: 14, fontWeight: "700", color: colors.textPrimary },
  amountText: { fontSize: 14, fontWeight: "800", color: colors.textPrimary },
  pctLabel: { fontSize: 11, color: colors.textMuted, fontWeight: "500" },
  barTrack: { height: 6, backgroundColor: colors.slateLight, borderRadius: 3, overflow: "hidden" },
  barFill: { height: "100%", borderRadius: 3 },
  tableCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    overflow: "hidden",
  },
  tableHead: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F7FA",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#EAE8EF",
  },
  thCat: { flex: 2, fontSize: 11, fontWeight: "700", color: colors.textMuted, textTransform: "uppercase" },
  thPct: { width: 50, textAlign: "right", fontSize: 11, fontWeight: "700", color: colors.textMuted, textTransform: "uppercase" },
  thAmt: { flex: 1.5, textAlign: "right", fontSize: 11, fontWeight: "700", color: colors.textMuted, textTransform: "uppercase" },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F4F2F7",
  },
  tableRowEven: {
    backgroundColor: "#FAFAFD",
  },
  tdCatBox: { flex: 2, flexDirection: "row", alignItems: "center" },
  dotSmall: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  tdCatText: { fontSize: 13, fontWeight: "700", color: colors.textPrimary },
  tdPctText: { width: 50, textAlign: "right", fontSize: 12, fontWeight: "600", color: colors.textMuted },
  tdAmtText: { flex: 1.5, textAlign: "right", fontSize: 13, fontWeight: "800", color: colors.textPrimary },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 28,
    alignItems: "center",
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
