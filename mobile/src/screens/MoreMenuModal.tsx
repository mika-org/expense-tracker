import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import {
  PieChart,
  Wallet,
  PiggyBank,
  HandCoins,
  Tags,
  Settings,
  X,
  ChevronRight,
} from "lucide-react-native";
import { colors } from "../theme/colors";

interface MoreMenuModalProps {
  visible: boolean;
  onClose: () => void;
  onNavigate: (screenName: string) => void;
}

export const MoreMenuModal = ({
  visible,
  onClose,
  onNavigate,
}: MoreMenuModalProps) => {
  const menuItems = [
    {
      id: "Budgets",
      title: "Anggaran & Simulasi",
      subtitle: "Alokasi pos belanja & simulasi",
      icon: <PieChart size={22} color="#8B5CF6" />,
      bg: "#F5F3FF",
    },
    {
      id: "Accounts",
      title: "Akun & Dompet",
      subtitle: "Bank, tunai, e-wallet & saldo kas",
      icon: <Wallet size={22} color="#3B82F6" />,
      bg: "#EFF6FF",
    },
    {
      id: "Savings",
      title: "Target Tabungan",
      subtitle: "Dana darurat & impian tabungan",
      icon: <PiggyBank size={22} color="#F59E0B" />,
      bg: "#FFFBEB",
    },
    {
      id: "Debts",
      title: "Utang & Piutang",
      subtitle: "Catatan pinjaman & tagihan jatuh tempo",
      icon: <HandCoins size={22} color="#10B981" />,
      bg: "#ECFDF5",
    },
    {
      id: "Categories",
      title: "Kategori Transaksi",
      subtitle: "Klasifikasi pemasukan & pengeluaran",
      icon: <Tags size={22} color="#F43F5E" />,
      bg: "#FFF1F2",
    },
    {
      id: "Settings",
      title: "Pengaturan Profil",
      subtitle: "Mata uang IDR & zona waktu",
      icon: <Settings size={22} color="#6B7280" />,
      bg: "#F3F4F6",
    },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <SafeAreaView style={styles.sheetContainer}>
          <View style={styles.sheetHeader}>
            <View>
              <Text style={styles.sheetTitle}>Menu & Fitur Lainnya</Text>
              <Text style={styles.sheetSubtitle}>Kelola seluruh keuangan Anda</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <View style={styles.list}>
            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.itemRow}
                onPress={() => {
                  onClose();
                  onNavigate(item.id);
                }}
                activeOpacity={0.7}
              >
                <View style={[styles.iconBox, { backgroundColor: item.bg }]}>
                  {item.icon}
                </View>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
                </View>
                <ChevronRight size={18} color={colors.textMuted} />
              </TouchableOpacity>
            ))}
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  sheetContainer: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 32,
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0EEF4",
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: colors.textPrimary,
  },
  sheetSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: "500",
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.slateLight,
    alignItems: "center",
    justifyContent: "center",
  },
  list: {
    gap: 12,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 20,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.textPrimary,
    marginBottom: 2,
  },
  itemSubtitle: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: "500",
  },
});
