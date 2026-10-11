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
import { TrendingUp, TrendingDown, Scale } from "lucide-react-native";
import { ViewModeToggle, ViewMode } from "../components/ViewModeToggle";
import { colors } from "../theme/colors";

export const StatsScreen = () => {
  const [period, setPeriod] = useState<"Bulan Ini" | "Bulan Lalu" | "Tahun Ini">("Bulan Ini");
  const [viewMode, setViewMode] = useState<ViewMode>("card");

  const categoryRanking = [
    { name: "Makanan & Minuman", amount: 4850, pct: 38, color: "#EF4444" },
    { name: "Tempat Tinggal", amount: 2500, pct: 20, color: "#F59E0B" },
    { name: "Belanja Pakaian", amount: 1850, pct: 15, color: "#3B82F6" },
    { name: "Transportasi", amount: 1250, pct: 10, color: "#F97316" },
    { name: "Tagihan & WiFi", amount: 950, pct: 8, color: "#8B5CF6" },
  ];

  // Animated progress bars
  const fillAnims = useRef(categoryRanking.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const anims = categoryRanking.map((c, i) =>
      Animated.timing(fillAnims[i], {
        toValue: c.pct,
        duration: 700,
        delay: 150 + i * 90,
        useNativeDriver: false,
      })
    );
    Animated.parallel(anims).start();
  }, [fillAnims]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Statistik & Laporan</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Period Selector */}
        <View style={styles.periodRow}>
          {(["Bulan Ini", "Bulan Lalu", "Tahun Ini"] as const).map((p) => (
            <TouchableOpacity
              key={p}
              style={[styles.periodBtn, period === p ? styles.periodBtnActive : null]}
              onPress={() => setPeriod(p)}
            >
              <Text style={[styles.periodText, period === p ? styles.periodTextActive : null]}>
                {p}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 3 Metric Cards */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <View style={styles.metricTop}>
              <Text style={styles.metricLabel}>Pemasukan</Text>
              <TrendingUp size={16} color={colors.incomeGreen} />
            </View>
            <Text style={[styles.metricValue, { color: colors.incomeGreen }]}>$17,500.00</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={styles.metricTop}>
              <Text style={styles.metricLabel}>Pengeluaran</Text>
              <TrendingDown size={16} color={colors.coral} />
            </View>
            <Text style={[styles.metricValue, { color: colors.coral }]}>$12,560.00</Text>
          </View>
        </View>

        <View style={[styles.metricCard, { marginBottom: 20 }]}>
          <View style={styles.metricTop}>
            <Text style={styles.metricLabel}>Surplus Arus Kas</Text>
            <Scale size={16} color="#0D9488" />
          </View>
          <Text style={[styles.metricValue, { color: "#0D9488" }]}>+$4,940.00</Text>
        </View>

        {/* Section Header with View Mode Toggle */}
        <View style={styles.rankingHeaderRow}>
          <Text style={styles.rankingTitle}>Pengeluaran Terbesar</Text>
          <ViewModeToggle mode={viewMode} onChange={setViewMode} />
        </View>

        {/* Ranking List: Card vs Table View */}
        {viewMode === "card" ? (
          <View style={styles.rankingList}>
            {categoryRanking.map((c, i) => {
              const widthInterpolation = fillAnims[i].interpolate({
                inputRange: [0, 100],
                outputRange: ["0%", "100%"],
              });

              return (
                <View key={i} style={styles.rankingCard}>
                  <View style={styles.rankingTop}>
                    <View style={styles.rankingLeft}>
                      <View style={[styles.dot, { backgroundColor: c.color }]} />
                      <Text style={styles.catName}>{c.name}</Text>
                    </View>
                    <Text style={styles.amountText}>
                      ${c.amount.toLocaleString()}{" "}
                      <Text style={styles.pctLabel}>({c.pct}%)</Text>
                    </Text>
                  </View>

                  <View style={styles.track}>
                    <Animated.View
                      style={[
                        styles.fill,
                        {
                          width: widthInterpolation,
                          backgroundColor: c.color,
                        },
                      ]}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          <View style={styles.tableCard}>
            <View style={styles.tableHead}>
              <Text style={styles.thCol}>Kategori</Text>
              <Text style={[styles.thCol, { textAlign: "right" }]}>Nominal & Porsi</Text>
            </View>
            {categoryRanking.map((c, i) => (
              <View key={i} style={styles.tableRow}>
                <View style={styles.rankingLeft}>
                  <View style={[styles.dot, { backgroundColor: c.color }]} />
                  <Text style={styles.catName}>{c.name}</Text>
                </View>
                <Text style={styles.amountText}>
                  ${c.amount.toLocaleString()}{" "}
                  <Text style={styles.pctLabel}>({c.pct}%)</Text>
                </Text>
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
    paddingHorizontal: 24,
    paddingVertical: 18,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F0EEF4",
  },
  headerTitle: { fontSize: 20, fontWeight: "900", color: colors.textPrimary },
  content: { padding: 20, paddingBottom: 40 },
  periodRow: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  periodBtn: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 16 },
  periodBtnActive: { backgroundColor: colors.plum },
  periodText: { fontSize: 12, fontWeight: "700", color: colors.textMuted },
  periodTextActive: { color: "#FFFFFF" },
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
  },
  rankingTitle: { fontSize: 16, fontWeight: "800", color: colors.textPrimary },
  rankingList: { gap: 12 },
  rankingCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  rankingTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  rankingLeft: { flexDirection: "row", alignItems: "center" },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
  catName: { fontSize: 14, fontWeight: "700", color: colors.textPrimary },
  amountText: { fontSize: 14, fontWeight: "800", color: colors.textPrimary },
  pctLabel: { fontSize: 11, color: colors.textMuted, fontWeight: "500" },
  track: { height: 6, backgroundColor: colors.slateLight, borderRadius: 3, overflow: "hidden" },
  fill: { height: "100%", borderRadius: 3 },
  tableCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    overflow: "hidden",
  },
  tableHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: colors.slateLight,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#EAE8EF",
  },
  thCol: { fontSize: 11, fontWeight: "700", color: colors.textMuted },
  tableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F4F2F7",
  },
});
