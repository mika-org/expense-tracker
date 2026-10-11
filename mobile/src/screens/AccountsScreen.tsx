import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  StyleSheet,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ChevronLeft,
  Building2,
  Smartphone,
  Wallet,
  PiggyBank,
  Plus,
  Trash2,
  Edit2,
  X,
  Check,
} from "lucide-react-native";
import { colors } from "../theme/colors";
import { api } from "../services/api";
import { FadeInView, ScalePress } from "../components/AnimatedComponents";

interface AccountsScreenProps {
  onBack: () => void;
}

export const AccountsScreen = ({ onBack }: AccountsScreenProps) => {
  const [accountList, setAccountList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState<"bank" | "cash" | "ewallet" | "savings">("bank");
  const [formBalance, setFormBalance] = useState("");

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const data = await api.getAccounts();
      if (Array.isArray(data)) {
        setAccountList(data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setFormName("");
    setFormType("bank");
    setFormBalance("");
    setModalVisible(true);
  };

  const openEditModal = (acc: any) => {
    setEditingId(acc.id);
    setFormName(acc.name || "");
    setFormType((acc.accountType || acc.type || "bank").toLowerCase());
    setFormBalance(acc.openingBalance ? acc.openingBalance.toString() : (acc.balance ? acc.balance.toString() : "0"));
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!formName.trim()) {
      Alert.alert("Perhatian", "Nama akun/dompet wajib diisi.");
      return;
    }

    const parsedBalance = parseFloat(formBalance.replace(/[^0-9.]/g, "")) || 0;
    setSaving(true);
    try {
      if (editingId) {
        const res = await api.updateAccount({
          id: editingId,
          name: formName.trim(),
          accountType: formType,
          openingBalance: parsedBalance,
        });
        if (res.success === false) {
          Alert.alert("Gagal", res.error || "Gagal memperbarui akun");
          return;
        }
      } else {
        const res = await api.createAccount({
          name: formName.trim(),
          accountType: formType,
          openingBalance: parsedBalance,
        });
        if (res.success === false) {
          Alert.alert("Gagal", res.error || "Gagal membuat akun");
          return;
        }
      }

      setModalVisible(false);
      fetchAccounts();
    } catch (e: any) {
      Alert.alert("Terjadi Kesalahan", e.message || "Gagal menyimpan akun.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (acc: any) => {
    Alert.alert(
      "Hapus Akun",
      `Apakah Anda yakin ingin menghapus akun "${acc.name}"?`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: async () => {
            try {
              const res = await api.deleteAccount(acc.id);
              if (res.success === false) {
                Alert.alert("Gagal", res.error || "Gagal menghapus akun");
                return;
              }
              fetchAccounts();
            } catch (e: any) {
              Alert.alert("Error", e.message || "Gagal menghapus akun");
            }
          },
        },
      ]
    );
  };

  const accounts = accountList.map((acc: any) => {
    const rawType = (acc.accountType || acc.type || "cash").toLowerCase();
    const balance =
      acc.currentBalance !== undefined
        ? acc.currentBalance
        : acc.balance !== undefined
        ? acc.balance
        : 0;
    return {
      ...acc,
      type: rawType,
      balance,
      icon:
        rawType === "bank" ? (
          <Building2 size={22} color="#3B82F6" />
        ) : rawType === "cash" ? (
          <Wallet size={22} color="#10B981" />
        ) : rawType === "savings" ? (
          <PiggyBank size={22} color="#8B5CF6" />
        ) : (
          <Smartphone size={22} color={colors.coral} />
        ),
      bg:
        rawType === "bank"
          ? "#EFF6FF"
          : rawType === "cash"
          ? "#ECFDF5"
          : rawType === "savings"
          ? "#F5F3FF"
          : "#FFF7ED",
    };
  });

  const totalBalance = accounts.reduce((acc, curr) => acc + (curr.balance || 0), 0);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.header}>
        <ScalePress onPress={onBack} style={styles.backBtn}>
          <ChevronLeft size={22} color={colors.textPrimary} />
        </ScalePress>
        <Text style={styles.headerTitle}>Akun & Dompet (Wallets)</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={fetchAccounts}
            colors={[colors.coral]}
            tintColor={colors.coral}
          />
        }
      >
        {/* Total Net Worth Card */}
        <FadeInView delay={0}>
          <View style={styles.totalCard}>
            <Text style={styles.totalLabel}>Total Saldo Kas Tersedia</Text>
            <Text style={styles.totalAmount}>Rp {totalBalance.toLocaleString("id-ID")}</Text>
          </View>
        </FadeInView>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Daftar Sumber Dana ({accounts.length})</Text>
          <ScalePress style={styles.addBtn} onPress={openAddModal}>
            <Plus size={16} color="#FFFFFF" strokeWidth={3} />
            <Text style={styles.addBtnText}>Tambah Akun</Text>
          </ScalePress>
        </View>

        <View style={styles.accountList}>
          {accounts.length === 0 && !loading ? (
            <FadeInView delay={100}>
              <View style={{ padding: 24, alignItems: "center" }}>
                <Text style={{ color: colors.textMuted }}>Belum ada akun terdaftar.</Text>
              </View>
            </FadeInView>
          ) : (
            accounts.map((acc, idx) => (
              <FadeInView key={`${acc.id || idx}`} delay={idx * 50}>
                <View style={styles.accountCard}>
                  <View style={styles.accountLeft}>
                    <View style={[styles.iconBox, { backgroundColor: acc.bg }]}>
                      {acc.icon}
                    </View>
                    <View style={{ maxWidth: 140 }}>
                      <Text style={styles.accountName} numberOfLines={1}>{acc.name}</Text>
                      <Text style={styles.accountType}>
                        {acc.type === "bank"
                          ? "Rekening Bank"
                          : acc.type === "ewallet"
                          ? "E-Wallet"
                          : acc.type === "savings"
                          ? "Tabungan / Investasi"
                          : "Uang Tunai"}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.accountRight}>
                    <Text style={styles.accountBalance}>
                      Rp {Number(acc.balance).toLocaleString("id-ID")}
                    </Text>
                    <View style={styles.actionRow}>
                      <ScalePress
                        onPress={() => openEditModal(acc)}
                        style={styles.actionBtn}
                      >
                        <Edit2 size={15} color={colors.textSecondary} />
                      </ScalePress>
                      <ScalePress
                        onPress={() => handleDelete(acc)}
                        style={[styles.actionBtn, { marginLeft: 8 }]}
                      >
                        <Trash2 size={15} color="#EF4444" />
                      </ScalePress>
                    </View>
                  </View>
                </View>
              </FadeInView>
            ))
          )}
        </View>
      </ScrollView>

      {/* Modal Add / Edit Account */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingId ? "Ubah Akun / Dompet" : "Tambah Akun Baru"}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={22} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Input Name */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Nama Akun / Dompet</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Contoh: BCA Prioritas, GoPay, Dompet Tunai"
                placeholderTextColor={colors.textMuted}
                value={formName}
                onChangeText={setFormName}
              />
            </View>

            {/* Account Type Selector */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Jenis Akun</Text>
              <View style={styles.typeSelectorRow}>
                {[
                  { key: "bank", label: "Bank" },
                  { key: "cash", label: "Tunai" },
                  { key: "ewallet", label: "E-Wallet" },
                  { key: "savings", label: "Tabungan" },
                ].map((item) => {
                  const active = formType === item.key;
                  return (
                    <ScalePress
                      key={item.key}
                      style={[styles.typeChip, active ? styles.typeChipActive : null]}
                      onPress={() => setFormType(item.key as any)}
                    >
                      <Text style={[styles.typeChipText, active ? styles.typeChipTextActive : null]}>
                        {item.label}
                      </Text>
                    </ScalePress>
                  );
                })}
              </View>
            </View>

            {/* Opening Balance */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Saldo Awal (Rp)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="0"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                value={formBalance}
                onChangeText={setFormBalance}
              />
            </View>

            {/* Submit Button */}
            <ScalePress
              style={[styles.saveBtn, saving ? { opacity: 0.7 } : null]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.saveBtnText}>
                  {editingId ? "Simpan Perubahan" : "Buat Akun"}
                </Text>
              )}
            </ScalePress>
          </View>
        </View>
      </Modal>
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
  totalLabel: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: "600",
    textTransform: "uppercase",
  },
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
  actionRow: { flexDirection: "row", alignItems: "center", marginTop: 6 },
  actionBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: colors.slateLight,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: "800", color: colors.textPrimary },
  formGroup: { marginBottom: 16 },
  formLabel: { fontSize: 13, fontWeight: "700", color: colors.textPrimary, marginBottom: 8 },
  textInput: {
    backgroundColor: colors.slateLight,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.textPrimary,
  },
  typeSelectorRow: {
    flexDirection: "row",
    gap: 8,
  },
  typeChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: colors.slateLight,
    alignItems: "center",
  },
  typeChipActive: {
    backgroundColor: colors.plum,
  },
  typeChipText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textSecondary,
  },
  typeChipTextActive: {
    color: "#FFFFFF",
  },
  saveBtn: {
    backgroundColor: colors.plum,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 10,
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#FFFFFF",
  },
});
