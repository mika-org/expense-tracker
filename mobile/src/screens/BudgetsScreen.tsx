import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { ChevronLeft, PieChart, CheckCircle2, AlertTriangle, XCircle } from "lucide-react-native";
import { colors } from "../theme/colors";

interface BudgetsScreenProps {
  onBack: () => void;
}

export const BudgetsScreen = ({ onBack }: BudgetsScreenProps) => {
  const [needsPct, setNeedsPct] = useState(50);
  const [wantsPct, setWantsPct] = useState(30);
  const [savingsPct, setSavingsPct] = useState(20);

  const budgetItems = [
    { name: "Makanan & Minuman", limit: 3000, spent: 1850, pct: 62, status: "safe" },
    { name: "Tempat Tinggal", limit: 2500, spent: 2500, pct: 100, status: "exceeded" },
    { name: "Transportasi", limit: 1200, spent: 1050, pct: 88, status: "warning" },
    { name: "Tagihan & Utilitas", limit: 1000, spent: 750, pct: 75, status: "safe" },
    { name: "Belanja & Keinginan", limit: 1500, spent: 1200, pct: 80, status: "warning" },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <ChevronLeft size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Anggaran (Budgets)</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Hero Budget Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroHeader}>
            <View>
              <Text style={styles.heroSubtitle}>Alokasi Bulan Ini</Text>
              <Text style={styles.heroTitle}>Bulan April 2026</Text>
            </View>
            <View style={styles.iconCircle}>
              <PieChart size={20} color={colors.coral} />
            </View>
          </View>

          <View style={styles.statsRow}>
            <View>
              <Text style={styles.statLabel}>Batas Anggaran</Text>
              <Text style={styles.statValue}>$9,200.00</Text>
            </View>
            <View>
              <Text style={styles.statLabel}>Terpakai</Text>
              <Text style={[styles.statValue, { color: colors.coral }]}>$7,350.00</Text>
            </View>
            <View>
              <Text style={styles.statLabel}>Sisa</Text>
              <Text style={[styles.statValue, { color: colors.incomeGreen }]}>$1,850.00</Text>
            </View>
          </View>
        </View>

        {/* Categories Progress Breakdown */}
        <Text style={styles.sectionTitle}>Realisasi Kategori</Text>
        <View style={styles.itemsList}>
          {budgetItems.map((item, idx) => (
            <View key={idx} style={styles.budgetItemCard}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemName}>{item.name}</Text>
                {item.status === "exceeded" ? (
                  <View style={[styles.badge, { backgroundColor: "#FFF0F2" }]}>
                    <XCircle size={12} color="#EF4444" />
                    <Text style={[styles.badgeText, { color: "#EF4444" }]}>Melewati</Text>
                  </View>
                ) : item.status === "warning" ? (
                  <View style={[styles.badge, { backgroundColor: "#FFF7EB" }]}>
                    <AlertTriangle size={12} color="#F59E0B" />
                    <Text style={[styles.badgeText, { color: "#F59E0B" }]}>Mendekati</Text>
                  </View>
                ) : (
                  <View style={[styles.badge, { backgroundColor: "#ECFDF5" }]}>
                    <CheckCircle2 size={12} color="#10B981" />
                    <Text style={[styles.badgeText, { color: "#10B981" }]}>Aman</Text>
                  </View>
                )}
              </View>

              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressBar,
                    {
                      width: `${Math.min(100, item.pct)}%`,
                      backgroundColor:
                        item.status === "exceeded"
                          ? "#EF4444"
                          : item.status === "warning"
                          ? colors.coral
                          : colors.plum,
                    },
                  ]}
                />
              </View>

              <View style={styles.itemFooter}>
                <Text style={styles.footerSpent}>
                  ${item.spent.toFixed(2)}{" "}
                  <Text style={styles.footerLimit}>/ ${item.limit.toFixed(2)}</Text>
                </Text>
                <Text style={styles.footerPct}>{item.pct}%</Text>
              </View>
            </View>
          ))}
        </View>

        {/* What-If Simulation Box */}
        <View style={styles.simulationCard}>
          <Text style={styles.simTitle}>Simulasi: Bagaimana Jika?</Text>
          <Text style={styles.simSubtitle}>Uji alokasi persentase pemasukan 50 / 30 / 20</Text>

          <View style={styles.simPillsRow}>
            <View style={styles.simBox}>
              <Text style={styles.simBoxTitle}>Kebutuhan</Text>
              <Text style={styles.simBoxValue}>50% ($5,000)</Text>
            </View>
            <View style={styles.simBox}>
              <Text style={styles.simBoxTitle}>Keinginan</Text>
              <Text style={[styles.simBoxValue, { color: colors.coral }]}>30% ($3,000)</Text>
            </View>
            <View style={styles.simBox}>
              <Text style={styles.simBoxTitle}>Tabungan</Text>
              <Text style={[styles.simBoxValue, { color: colors.incomeGreen }]}>20% ($2,000)</Text>
            </View>
          </View>
        </View>
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
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.slateLight,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 17, fontWeight: "800", color: colors.textPrimary },
  content: { padding: 20, paddingBottom: 40 },
  heroCard: {
    backgroundColor: colors.plum,
    borderRadius: 30,
    padding: 24,
    marginBottom: 24,
  },
  heroHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  heroSubtitle: { fontSize: 12, color: "#C5B6CF", fontWeight: "600" },
  heroTitle: { fontSize: 22, fontWeight: "900", color: "#FFFFFF", marginTop: 2 },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
  },
  statLabel: { fontSize: 11, color: "#A797B3", fontWeight: "500" },
  statValue: { fontSize: 16, fontWeight: "800", color: "#FFFFFF", marginTop: 2 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.textPrimary,
    marginBottom: 12,
  },
  itemsList: { gap: 12, marginBottom: 24 },
  budgetItemCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  itemName: { fontSize: 14, fontWeight: "700", color: colors.textPrimary },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  badgeText: { fontSize: 11, fontWeight: "700" },
  progressTrack: {
    height: 8,
    backgroundColor: colors.slateLight,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressBar: { height: "100%", borderRadius: 4 },
  itemFooter: { flexDirection: "row", justifyContent: "space-between" },
  footerSpent: { fontSize: 13, fontWeight: "800", color: colors.textPrimary },
  footerLimit: { color: colors.textMuted, fontWeight: "500" },
  footerPct: { fontSize: 12, fontWeight: "700", color: colors.textSecondary },
  simulationCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 26,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  simTitle: { fontSize: 15, fontWeight: "800", color: colors.textPrimary },
  simSubtitle: { fontSize: 12, color: colors.textMuted, marginTop: 2, marginBottom: 16 },
  simPillsRow: { flexDirection: "row", gap: 8 },
  simBox: {
    flex: 1,
    backgroundColor: colors.slateLight,
    borderRadius: 18,
    padding: 12,
    alignItems: "center",
  },
  simBoxTitle: { fontSize: 11, color: colors.textSecondary, fontWeight: "600" },
  simBoxValue: { fontSize: 12, fontWeight: "800", color: colors.textPrimary, marginTop: 4 },
});
