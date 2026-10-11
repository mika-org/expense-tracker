import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { ChevronLeft, PiggyBank, Plus, CheckCircle2 } from "lucide-react-native";
import { colors } from "../theme/colors";

import { api } from "../services/api";

interface SavingsScreenProps {
  onBack: () => void;
}

interface SavingsGoalItem {
  id: string;
  name: string;
  target: number;
  current: number;
  pct: number;
  date: string;
}

export const SavingsScreen = ({ onBack }: SavingsScreenProps) => {
  const [goalsList, setGoalsList] = useState<SavingsGoalItem[]>([
    { id: "1", name: "Dana Darurat (6 Bulan)", target: 30000, current: 20000, pct: 67, date: "31 Des 2026" },
    { id: "2", name: "Liburan Akhir Tahun", target: 10000, current: 3500, pct: 35, date: "30 Nov 2026" },
    { id: "3", name: "Upgrade Gadget Laptop", target: 15000, current: 15000, pct: 100, date: "15 Mei 2026" },
  ]);

  useEffect(() => {
    (async () => {
      const data = await api.getSavings();
      if (data && data.length > 0) {
        setGoalsList(data);
      }
    })();
  }, []);

  const goals = goalsList;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <ChevronLeft size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Target Tabungan</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Target Finansial ({goals.length})</Text>
          <TouchableOpacity style={styles.addBtn} activeOpacity={0.8}>
            <Plus size={16} color="#FFFFFF" strokeWidth={3} />
            <Text style={styles.addBtnText}>Buat Target</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.goalsList}>
          {goals.map((g) => {
            const isDone = g.pct >= 100;
            return (
              <View key={g.id} style={styles.goalCard}>
                <View style={styles.goalTop}>
                  <View style={styles.goalIconBox}>
                    <PiggyBank size={24} color="#F59E0B" />
                  </View>
                  {isDone ? (
                    <View style={styles.doneBadge}>
                      <CheckCircle2 size={12} color="#10B981" />
                      <Text style={styles.doneText}>Tercapai</Text>
                    </View>
                  ) : (
                    <Text style={styles.pctText}>{g.pct}%</Text>
                  )}
                </View>

                <Text style={styles.goalName}>{g.name}</Text>
                <Text style={styles.goalDate}>Target: {g.date}</Text>

                <View style={styles.track}>
                  <View
                    style={[
                      styles.bar,
                      { width: `${g.pct}%`, backgroundColor: isDone ? "#10B981" : colors.plum },
                    ]}
                  />
                </View>

                <View style={styles.amountsRow}>
                  <Text style={styles.currentAmount}>${g.current.toLocaleString()}</Text>
                  <Text style={styles.targetAmount}>Target: ${g.target.toLocaleString()}</Text>
                </View>

                <TouchableOpacity style={styles.depositBtn} activeOpacity={0.8}>
                  <Text style={styles.depositBtnText}>Setor Tabungan</Text>
                </TouchableOpacity>
              </View>
            );
          })}
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
  content: { padding: 20 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: colors.textPrimary },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.coral,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
  },
  addBtnText: { color: "#FFFFFF", fontSize: 12, fontWeight: "800" },
  goalsList: { gap: 16 },
  goalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  goalTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  goalIconBox: { width: 46, height: 46, borderRadius: 20, backgroundColor: "#FFFBEB", alignItems: "center", justifyContent: "center" },
  doneBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#ECFDF5", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  doneText: { fontSize: 11, fontWeight: "700", color: "#10B981" },
  pctText: { fontSize: 16, fontWeight: "900", color: colors.coral },
  goalName: { fontSize: 16, fontWeight: "800", color: colors.textPrimary, marginBottom: 2 },
  goalDate: { fontSize: 12, color: colors.textMuted, marginBottom: 14 },
  track: { height: 8, backgroundColor: colors.slateLight, borderRadius: 4, overflow: "hidden", marginBottom: 8 },
  bar: { height: "100%", borderRadius: 4 },
  amountsRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 14 },
  currentAmount: { fontSize: 14, fontWeight: "900", color: colors.textPrimary },
  targetAmount: { fontSize: 12, color: colors.textMuted, fontWeight: "600" },
  depositBtn: {
    backgroundColor: colors.slateLight,
    paddingVertical: 10,
    borderRadius: 16,
    alignItems: "center",
  },
  depositBtnText: { fontSize: 12, fontWeight: "700", color: colors.textPrimary },
});
