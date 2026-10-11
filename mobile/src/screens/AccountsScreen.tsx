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
  KeyboardAvoidingView,
  Platform,
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
  CreditCard,
} from "lucide-react-native";
import { colors } from "../theme/colors";
import { api } from "../services/api";
import { FadeInView, ScalePress } from "../components/AnimatedComponents";
import { ViewModeToggle, ViewMode } from "../components/ViewModeToggle";

interface AccountsScreenProps {
  onBack: () => void;
}

const ACCOUNT_TYPES = [
  { key: "bank", label: "Rekening Bank", icon: Building2, desc: "BCA, Mandiri, BRI, BNI, Bank Digital" },
  { key: "cash", label: "Uang Tunai (Cash)", icon: Wallet, desc: "Dompet fisik, Kas kecil, Uang tunai" },
  { key: "ewallet", label: "E-Wallet", icon: Smartphone, desc: "GoPay, OVO, DANA, ShopeePay" },
  { key: "savings", label: "Tabungan & Investasi", icon: PiggyBank, desc: "Deposito, Reksa Dana, Saham, Emas" },
  { key: "credit_card", label: "Kartu Kredit", icon: CreditCard, desc: "Limit & transaksi kartu kredit" },
];

export const AccountsScreen = ({ onBack }: AccountsScreenProps) => {
  const [accountList, setAccountList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("card");

  // Form states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState<string>("bank");
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
    const raw = (acc.accountType || acc.type || "bank").toLowerCase();
    setFormType(
      raw === "bank" || raw === "cash" || raw === "ewallet" || raw === "savings" || raw === "credit_card"
        ? raw
        : "bank"
    );
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
        <ScalePress style={styles.headerAddBtn} onPress={openAddModal}>
          <Plus size={20} color="#FFFFFF" strokeWidth={3} />
        </ScalePress>
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

        {/* Section Header with ViewModeToggle and Add Button */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Daftar Sumber Dana ({accounts.length})</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <ViewModeToggle mode={viewMode} onChange={setViewMode} />
            <ScalePress style={styles.addBtn} onPress={openAddModal}>
              <Plus size={14} color="#FFFFFF" strokeWidth={3} />
              <Text style={styles.addBtnText}>Tambah</Text>
            </ScalePress>
          </View>
        </View>

        {accounts.length === 0 && !loading ? (
          <FadeInView delay={100}>
            <View style={styles.emptyContainer}>
              <Wallet size={36} color={colors.textMuted} />
              <Text style={styles.emptyText}>Belum ada akun terdaftar.</Text>
            </View>
          </FadeInView>
        ) : viewMode === "card" ? (
          <View style={styles.accountList}>
            {accounts.map((acc, idx) => (
              <FadeInView key={`${acc.id || idx}`} delay={idx * 50}>
                <View style={styles.accountCard}>
                  <View style={styles.accountLeft}>
                    <View style={[styles.iconBox, { backgroundColor: acc.bg }]}>
                      {acc.icon}
                    </View>
                    <View style={styles.accountInfoCol}>
                      <Text style={styles.accountName}>{acc.name}</Text>
                      <Text style={styles.accountType}>
                        {acc.type === "bank"
                          ? "Rekening Bank"
                          : acc.type === "ewallet"
                          ? "Dompet Digital (E-Wallet)"
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
            ))}
          </View>
        ) : (
          /* Table View Mode */
          <FadeInView delay={50}>
            <View style={styles.tableCard}>
              <View style={styles.tableHeaderRow}>
                <Text style={[styles.tableHeaderCell, { flex: 2.2 }]}>Nama Sumber</Text>
                <Text style={[styles.tableHeaderCell, { flex: 1.5 }]}>Jenis</Text>
                <Text style={[styles.tableHeaderCell, { flex: 2, textAlign: "right" }]}>Saldo</Text>
                <Text style={[styles.tableHeaderCell, { width: 68, textAlign: "center" }]}>Aksi</Text>
              </View>

              {accounts.map((acc, idx) => (
                <View
                  key={`tbl-${acc.id || idx}`}
                  style={[
                    styles.tableRow,
                    idx % 2 === 1 ? styles.tableRowZebra : null,
                  ]}
                >
                  <View style={[styles.tableCellWrap, { flex: 2.2 }]}>
                    <View style={[styles.tableIconBox, { backgroundColor: acc.bg }]}>
                      {acc.icon}
                    </View>
                    <Text style={styles.tableNameText} numberOfLines={2}>
                      {acc.name}
                    </Text>
                  </View>

                  <View style={{ flex: 1.5 }}>
                    <Text style={styles.tableTypeText}>
                      {acc.type === "bank"
                        ? "Bank"
                        : acc.type === "ewallet"
                        ? "E-Wallet"
                        : acc.type === "savings"
                        ? "Tabungan"
                        : "Tunai"}
                    </Text>
                  </View>

                  <Text style={[styles.tableBalanceText, { flex: 2, textAlign: "right" }]}>
                    Rp {Number(acc.balance).toLocaleString("id-ID")}
                  </Text>

                  <View style={styles.tableActions}>
                    <TouchableOpacity
                      onPress={() => openEditModal(acc)}
                      style={styles.tableActionBtn}
                    >
                      <Edit2 size={13} color={colors.textSecondary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDelete(acc)}
                      style={[styles.tableActionBtn, { marginLeft: 4 }]}
                    >
                      <Trash2 size={13} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </FadeInView>
        )}
      </ScrollView>

      {/* Modal Add / Edit Account */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingId ? "Ubah Akun / Dompet" : "Tambah Akun Baru"}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <X size={22} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              style={{ maxHeight: 540 }}
              contentContainerStyle={{ paddingBottom: 24 }}
            >
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

              {/* Account Type Selector - Full Width Cards */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Pilih Jenis Akun</Text>
                <View style={styles.typeListContainer}>
                  {ACCOUNT_TYPES.map((item) => {
                    const active = formType === item.key;
                    const IconComp = item.icon;
                    return (
                      <TouchableOpacity
                        key={item.key}
                        style={[styles.typeListItem, active ? styles.typeListItemActive : null]}
                        activeOpacity={0.7}
                        onPress={() => setFormType(item.key)}
                      >
                        <View style={[styles.typeIconBox, active ? styles.typeIconBoxActive : null]}>
                          <IconComp size={20} color={active ? "#FFFFFF" : colors.plum} />
                        </View>
                        <View style={styles.typeTextGroup}>
                          <Text style={[styles.typeItemTitle, active ? styles.typeItemTitleActive : null]}>
                            {item.label}
                          </Text>
                          <Text style={[styles.typeItemDesc, active ? styles.typeItemDescActive : null]}>
                            {item.desc}
                          </Text>
                        </View>
                        <View style={[styles.radioCircle, active ? styles.radioCircleActive : null]}>
                          {active && <View style={styles.radioDot} />}
                        </View>
                      </TouchableOpacity>
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
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
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
  headerAddBtn: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: colors.coral,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.coral,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
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
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
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
  accountLeft: { flexDirection: "row", alignItems: "center", flex: 1, marginRight: 10 },
  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  accountInfoCol: { flex: 1 },
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
  emptyContainer: {
    padding: 32,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    gap: 8,
  },
  emptyText: { color: colors.textMuted, fontSize: 14, fontWeight: "600" },
  // Table Mode Styles
  tableCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  tableHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  tableHeaderCell: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.textMuted,
    textTransform: "uppercase",
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  tableRowZebra: {
    backgroundColor: "#FAFAFC",
  },
  tableCellWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  tableIconBox: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  tableNameText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textPrimary,
    flex: 1,
  },
  tableTypeText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.textMuted,
  },
  tableBalanceText: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  tableActions: {
    width: 68,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  tableActionBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: colors.slateLight,
  },
  // Modal Styles
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
  typeListContainer: {
    gap: 8,
    width: "100%",
  },
  typeListItem: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
  },
  typeListItemActive: {
    backgroundColor: colors.plum,
    borderColor: colors.plum,
  },
  typeIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  typeIconBoxActive: {
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  typeTextGroup: {
    flex: 1,
  },
  typeItemTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  typeItemTitleActive: {
    color: "#FFFFFF",
  },
  typeItemDesc: {
    fontSize: 11,
    fontWeight: "500",
    color: colors.textMuted,
    marginTop: 2,
  },
  typeItemDescActive: {
    color: "rgba(255,255,255,0.8)",
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#CBD5E1",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },
  radioCircleActive: {
    borderColor: "#FFFFFF",
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#FFFFFF",
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
