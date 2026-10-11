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
import { ChevronLeft, Building2, Smartphone, Wallet, PiggyBank, Plus } from "lucide-react-native";
import { colors } from "../theme/colors";

import { api } from "../services/api";

interface AccountsScreenProps {
  onBack: () => void;
}

export const AccountsScreen = ({ onBack }: AccountsScreenProps) => {
  const [accountList, setAccountList] = useState([
    { id: "1", name: "Rekening BCA", type: "bank", balance: 12500.0 },
    { id: "2", name: "Dompet Tunai", type: "cash", balance: 750.0 },
    { id: "3", name: "GoPay / OVO", type: "ewallet", balance: 450.0 },
    { id: "4", name: "Bibit Reksadana", type: "savings", balance: 20000.0 },
  ]);

  useEffect(() => {
    (async () => {
      const data = await api.getAccounts();
      if (data && data.length > 0) {
        setAccountList(data);
      }
    })();
  }, []);

  const accounts = accountList.map((acc, idx) => ({
    ...acc,
    icon: acc.type === "bank" ? <Building2 size={22} color="#3B82F6" /> :
          acc.type === "cash" ? <Wallet size={22} color="#10B981" /> :
          acc.type === "savings" ? <PiggyBank size={22} color="#8B5CF6" /> :
          <Smartphone size={22} color={colors.coral} />,
    bg: acc.type === "bank" ? "#EFF6FF" :
        acc.type === "cash" ? "#ECFDF5" :
        acc.type === "savings" ? "#F5F3FF" : "#FFF7ED",
  }));

  const totalBalance = accounts.reduce((acc, curr) => acc + (curr.balance || 0), 0);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <ChevronLeft size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Akun & Dompet (Wallets)</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Total Net Worth Card */}
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Total Saldo Kas Tersedia</Text>
          <Text style={styles.totalAmount}>${totalBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}</Text>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Daftar Sumber Dana ({accounts.length})</Text>
          <TouchableOpacity style={styles.addBtn} activeOpacity={0.8}>
            <Plus size={16} color="#FFFFFF" strokeWidth={3} />
            <Text style={styles.addBtnText}>Tambah Akun</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.accountList}>
          {accounts.map((acc) => (
            <View key={acc.id} style={styles.accountCard}>
              <View style={styles.accountLeft}>
                <View style={[styles.iconBox, { backgroundColor: acc.bg }]}>
                  {acc.icon}
                </View>
                <View>
                  <Text style={styles.accountName}>{acc.name}</Text>
                  <Text style={styles.accountType}>
                    {acc.type === "bank" ? "Rekening Bank" : acc.type === "ewallet" ? "E-Wallet" : acc.type === "savings" ? "Tabungan / Investasi" : "Uang Tunai"}
                  </Text>
                </View>
              </View>

              <View style={styles.accountRight}>
                <Text style={styles.accountBalance}>
                  ${acc.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </Text>
                <Text style={styles.statusActive}>Aktif</Text>
              </View>
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
  totalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: 24,
  },
  totalLabel: { fontSize: 12, color: colors.textMuted, fontWeight: "600", textTransform: "uppercase" },
  totalAmount: { fontSize: 32, fontWeight: "900", color: colors.textPrimary, marginTop: 4 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
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
  accountList: { gap: 12 },
  accountCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  accountLeft: { flexDirection: "row", alignItems: "center" },
  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  accountName: { fontSize: 15, fontWeight: "800", color: colors.textPrimary },
  accountType: { fontSize: 12, color: colors.textMuted, fontWeight: "500", marginTop: 2 },
  accountRight: { alignItems: "flex-end" },
  accountBalance: { fontSize: 15, fontWeight: "900", color: colors.textPrimary },
  statusActive: { fontSize: 11, color: colors.incomeGreen, fontWeight: "700", marginTop: 2 },
});
