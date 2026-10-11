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
import { ChevronLeft, Plus } from "lucide-react-native";
import { colors } from "../theme/colors";

import { api } from "../services/api";

interface CategoriesScreenProps {
  onBack: () => void;
}

export const CategoriesScreen = ({ onBack }: CategoriesScreenProps) => {
  const [tab, setTab] = useState<"expense" | "income">("expense");
  const [expenseCategories, setExpenseCategories] = useState([
    { name: "Makanan & Minuman", color: "#EF4444" },
    { name: "Transportasi", color: "#F97316" },
    { name: "Tempat Tinggal", color: "#F59E0B" },
    { name: "Tagihan & Utilitas", color: "#EAB308" },
    { name: "Internet & Komunikasi", color: "#84CC16" },
    { name: "Belanja", color: "#3B82F6" },
    { name: "Hiburan", color: "#6366F1" },
    { name: "Kesehatan", color: "#10B981" },
  ]);

  useEffect(() => {
    (async () => {
      const data = await api.getCategories();
      if (data && data.length > 0) {
        setExpenseCategories(data.map((c: any) => ({ name: c.name, color: c.color || "#F27A54" })));
      }
    })();
  }, []);

  const incomeCategories = [
    { name: "Gaji Pokok", color: "#10B981" },
    { name: "Freelance", color: "#06B6D4" },
    { name: "Bisnis & Usaha", color: "#3B82F6" },
    { name: "Investasi", color: "#8B5CF6" },
    { name: "Bonus & THR", color: "#EC4899" },
  ];

  const list = tab === "expense" ? expenseCategories : incomeCategories;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <ChevronLeft size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kategori Transaksi</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.tabToggle}>
          <TouchableOpacity
            style={[styles.tabBtn, tab === "expense" ? styles.tabBtnActive : null]}
            onPress={() => setTab("expense")}
          >
            <Text style={[styles.tabText, tab === "expense" ? styles.tabTextActive : null]}>
              Pengeluaran ({expenseCategories.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, tab === "income" ? styles.tabBtnActive : null]}
            onPress={() => setTab("income")}
          >
            <Text style={[styles.tabText, tab === "income" ? styles.tabTextActive : null]}>
              Pemasukan ({incomeCategories.length})
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.grid}>
          {list.map((c, i) => (
            <View key={i} style={styles.catCard}>
              <View style={[styles.colorDot, { backgroundColor: c.color }]} />
              <Text style={styles.catName}>{c.name}</Text>
            </View>
          ))}
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
  tabToggle: { flexDirection: "row", backgroundColor: "#FFFFFF", borderRadius: 20, padding: 4, marginBottom: 20, borderWidth: 1, borderColor: colors.cardBorder },
  tabBtn: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 16 },
  tabBtnActive: { backgroundColor: colors.plum },
  tabText: { fontSize: 12, fontWeight: "700", color: colors.textMuted },
  tabTextActive: { color: "#FFFFFF" },
  grid: { gap: 10 },
  catCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  colorDot: { width: 12, height: 12, borderRadius: 6, marginRight: 14 },
  catName: { fontSize: 14, fontWeight: "700", color: colors.textPrimary },
});
