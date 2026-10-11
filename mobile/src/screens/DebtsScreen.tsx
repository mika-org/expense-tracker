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
import { ChevronLeft, Plus, ArrowDownRight, ArrowUpRight, CheckCircle2, Clock } from "lucide-react-native";
import { colors } from "../theme/colors";

import { api } from "../services/api";

interface DebtsScreenProps {
  onBack: () => void;
}

export const DebtsScreen = ({ onBack }: DebtsScreenProps) => {
  const [filter, setFilter] = useState<"all" | "debt" | "receivable">("all");
  const [debtList, setDebtList] = useState([
    { id: "1", type: "debt", person: "Bank Mandiri (KPR)", initial: 50000, remaining: 35000, dueDate: "25 Apr 2026", status: "active" },
    { id: "2", type: "receivable", person: "Budi Santoso", initial: 1500, remaining: 500, dueDate: "30 Apr 2026", status: "active" },
    { id: "3", type: "debt", person: "Kartu Kredit", initial: 800, remaining: 0, dueDate: "10 Apr 2026", status: "paid" },
  ]);

  useEffect(() => {
    (async () => {
      const data = await api.getDebts();
      if (data && data.length > 0) {
        setDebtList(data);
      }
    })();
  }, []);

  const debts = debtList;

  const filtered = debts.filter((d) => (filter === "all" ? true : d.type === filter));

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <ChevronLeft size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Utang & Piutang</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Toggle Filters */}
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterBtn, filter === "all" ? styles.filterBtnActive : null]}
            onPress={() => setFilter("all")}
          >
            <Text style={[styles.filterText, filter === "all" ? styles.filterTextActive : null]}>Semua</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterBtn, filter === "debt" ? styles.filterBtnActive : null]}
            onPress={() => setFilter("debt")}
          >
            <Text style={[styles.filterText, filter === "debt" ? styles.filterTextActive : null]}>Utang Saya</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterBtn, filter === "receivable" ? styles.filterBtnActive : null]}
            onPress={() => setFilter("receivable")}
          >
            <Text style={[styles.filterText, filter === "receivable" ? styles.filterTextActive : null]}>Piutang</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.list}>
          {filtered.map((item) => {
            const isDebt = item.type === "debt";
            const isPaid = item.status === "paid" || item.remaining <= 0;

            return (
              <View key={item.id} style={styles.card}>
                <View style={styles.cardTop}>
                  <View style={[styles.typeBadge, { backgroundColor: isDebt ? "#FFF1F2" : "#ECFDF5" }]}>
                    {isDebt ? <ArrowDownRight size={14} color="#EF4444" /> : <ArrowUpRight size={14} color="#10B981" />}
                    <Text style={[styles.typeText, { color: isDebt ? "#EF4444" : "#10B981" }]}>
                      {isDebt ? "Utang (Kewajiban)" : "Piutang (Hak Tagih)"}
                    </Text>
                  </View>

                  {isPaid ? (
                    <View style={styles.statusBadge}>
                      <CheckCircle2 size={12} color="#10B981" />
                      <Text style={[styles.statusText, { color: "#10B981" }]}>Lunas</Text>
                    </View>
                  ) : (
                    <View style={styles.statusBadge}>
                      <Clock size={12} color="#F59E0B" />
                      <Text style={[styles.statusText, { color: "#F59E0B" }]}>Aktif</Text>
                    </View>
                  )}
                </View>

                <Text style={styles.personName}>{item.person}</Text>
                <Text style={styles.dueDate}>Jatuh tempo: {item.dueDate}</Text>

                <View style={styles.balanceBox}>
                  <Text style={styles.balanceLabel}>Sisa Pembayaran:</Text>
                  <Text style={[styles.balanceAmount, isPaid ? styles.paidText : null]}>
                    ${item.remaining.toLocaleString()}
                  </Text>
                  <Text style={styles.initialText}>Nominal Awal: ${item.initial.toLocaleString()}</Text>
                </View>

                {!isPaid && (
                  <TouchableOpacity style={styles.payBtn} activeOpacity={0.8}>
                    <Text style={styles.payBtnText}>Catat Cicilan / Pelunasan</Text>
                  </TouchableOpacity>
                )}
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
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.slateLight, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 17, fontWeight: "800", color: colors.textPrimary },
  content: { padding: 20 },
  filterRow: { flexDirection: "row", backgroundColor: "#FFFFFF", borderRadius: 20, padding: 4, marginBottom: 18, borderWidth: 1, borderColor: colors.cardBorder },
  filterBtn: { flex: 1, paddingVertical: 8, alignItems: "center", borderRadius: 16 },
  filterBtnActive: { backgroundColor: colors.plum },
  filterText: { fontSize: 12, fontWeight: "700", color: colors.textMuted },
  filterTextActive: { color: "#FFFFFF" },
  list: { gap: 14 },
  card: { backgroundColor: "#FFFFFF", borderRadius: 28, padding: 20, borderWidth: 1, borderColor: colors.cardBorder },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  typeBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  typeText: { fontSize: 11, fontWeight: "700" },
  statusBadge: { flexDirection: "row", alignItems: "center", gap: 4 },
  statusText: { fontSize: 11, fontWeight: "700" },
  personName: { fontSize: 16, fontWeight: "800", color: colors.textPrimary, marginBottom: 2 },
  dueDate: { fontSize: 12, color: colors.textMuted, marginBottom: 12 },
  balanceBox: { backgroundColor: colors.slateLight, borderRadius: 18, padding: 14, marginBottom: 12 },
  balanceLabel: { fontSize: 11, color: colors.textMuted, fontWeight: "600" },
  balanceAmount: { fontSize: 20, fontWeight: "900", color: colors.textPrimary, marginTop: 2 },
  paidText: { textDecorationLine: "line-through", color: colors.textMuted },
  initialText: { fontSize: 11, color: colors.textMuted, marginTop: 4 },
  payBtn: { backgroundColor: colors.slateLight, paddingVertical: 10, borderRadius: 16, alignItems: "center" },
  payBtnText: { fontSize: 12, fontWeight: "700", color: colors.textPrimary },
});
