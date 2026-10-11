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
import { ChevronLeft, Layers, Plus, Trash2, X } from "lucide-react-native";
import { colors } from "../theme/colors";
import { api } from "../services/api";
import { FadeInView, ScalePress } from "../components/AnimatedComponents";

interface CategoriesScreenProps {
  onBack: () => void;
}

interface CategoryItem {
  id: string;
  name: string;
  type: "expense" | "income" | string;
  color?: string | null;
  icon?: string | null;
}

const colorPresets = [
  colors.coral,
  colors.plum,
  "#10B981", // emerald
  "#3B82F6", // blue
  "#F59E0B", // amber
  "#8B5CF6", // purple
  "#EC4899", // pink
  "#14B8A6", // teal
];

export const CategoriesScreen = ({ onBack }: CategoriesScreenProps) => {
  const [tab, setTab] = useState<"expense" | "income">("expense");
  const [allCategories, setAllCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Add Category Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [catName, setCatName] = useState("");
  const [catType, setCatType] = useState<"expense" | "income">("expense");
  const [catColor, setCatColor] = useState(colors.coral);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await api.getCategories();
      if (Array.isArray(data)) {
        setAllCategories(data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreateCategory = async () => {
    if (!catName.trim()) {
      Alert.alert("Perhatian", "Nama kategori wajib diisi.");
      return;
    }

    setSaving(true);
    try {
      const res = await api.createCategory({
        name: catName.trim(),
        type: catType,
        color: catColor,
      });

      if (res.success === false) {
        Alert.alert("Gagal", res.error || "Gagal membuat kategori");
        return;
      }

      setModalVisible(false);
      setCatName("");
      fetchCategories();
    } catch (e: any) {
      Alert.alert("Error", e.message || "Gagal membuat kategori");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = (cat: CategoryItem) => {
    Alert.alert(
      "Hapus Kategori",
      `Apakah Anda yakin ingin menghapus kategori "${cat.name}"?`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: async () => {
            try {
              const res = await api.deleteCategory(cat.id);
              if (res.success === false) {
                Alert.alert("Gagal", res.error || "Gagal menghapus kategori");
                return;
              }
              fetchCategories();
            } catch (e: any) {
              Alert.alert("Error", e.message || "Gagal menghapus kategori");
            }
          },
        },
      ]
    );
  };

  const expenseCategories = allCategories.filter((c) => c.type === "expense");
  const incomeCategories = allCategories.filter((c) => c.type === "income");

  const currentList = tab === "expense" ? expenseCategories : incomeCategories;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.header}>
        <ScalePress onPress={onBack} style={styles.backBtn}>
          <ChevronLeft size={22} color={colors.textPrimary} />
        </ScalePress>
        <Text style={styles.headerTitle}>Kategori Transaksi</Text>
        <ScalePress
          onPress={() => {
            setCatType(tab);
            setCatColor(tab === "expense" ? colors.coral : colors.incomeGreen);
            setCatName("");
            setModalVisible(true);
          }}
          style={styles.headerAddBtn}
        >
          <Plus size={20} color="#FFFFFF" strokeWidth={3} />
        </ScalePress>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={fetchCategories}
            colors={[colors.coral]}
            tintColor={colors.coral}
          />
        }
      >
        <View style={styles.tabToggle}>
          <ScalePress
            style={[styles.tabBtn, tab === "expense" ? styles.tabBtnActive : null]}
            onPress={() => setTab("expense")}
          >
            <Text style={[styles.tabText, tab === "expense" ? styles.tabTextActive : null]}>
              Pengeluaran ({expenseCategories.length})
            </Text>
          </ScalePress>
          <ScalePress
            style={[styles.tabBtn, tab === "income" ? styles.tabBtnActive : null]}
            onPress={() => setTab("income")}
          >
            <Text style={[styles.tabText, tab === "income" ? styles.tabTextActive : null]}>
              Pemasukan ({incomeCategories.length})
            </Text>
          </ScalePress>
        </View>

        {currentList.length === 0 && !loading ? (
          <FadeInView delay={100}>
            <View style={styles.emptyCard}>
              <Layers size={36} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>Belum Ada Kategori</Text>
              <Text style={styles.emptySubtitle}>Tidak ada kategori {tab === "expense" ? "pengeluaran" : "pemasukan"} di database.</Text>
            </View>
          </FadeInView>
        ) : (
          <View style={styles.grid}>
            {currentList.map((c, idx) => (
              <FadeInView key={`${c.id || c.name}-${idx}`} delay={idx * 30}>
                <View style={styles.catCard}>
                  <View style={{ flexDirection: "row", alignItems: "center", flex: 1, marginRight: 8 }}>
                    <View style={[styles.colorDot, { backgroundColor: c.color || (tab === "expense" ? colors.coral : colors.incomeGreen) }]} />
                    <Text style={styles.catName} numberOfLines={1}>{c.name}</Text>
                  </View>
                  <ScalePress
                    onPress={() => handleDeleteCategory(c)}
                    style={styles.deleteBtn}
                  >
                    <Trash2 size={14} color="#EF4444" />
                  </ScalePress>
                </View>
              </FadeInView>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Modal Tambah Kategori */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Tambah Kategori Baru</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={22} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Type Selector */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Jenis Kategori</Text>
              <View style={styles.typeSelectorRow}>
                <TouchableOpacity
                  style={[styles.typeChip, catType === "expense" ? styles.typeChipActiveExpense : null]}
                  onPress={() => setCatType("expense")}
                >
                  <Text style={[styles.typeChipText, catType === "expense" ? { color: "#FFFFFF" } : null]}>
                    Pengeluaran
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.typeChip, catType === "income" ? styles.typeChipActiveIncome : null]}
                  onPress={() => setCatType("income")}
                >
                  <Text style={[styles.typeChipText, catType === "income" ? { color: "#FFFFFF" } : null]}>
                    Pemasukan
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Nama Kategori */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Nama Kategori</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Contoh: Kopi, Skincare, Bensin"
                placeholderTextColor={colors.textMuted}
                value={catName}
                onChangeText={setCatName}
              />
            </View>

            {/* Pilihan Warna */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Pilih Warna Aksen</Text>
              <View style={styles.colorPalette}>
                {colorPresets.map((col) => {
                  const selected = catColor === col;
                  return (
                    <ScalePress
                      key={col}
                      style={[
                        styles.colorCircle,
                        { backgroundColor: col },
                        selected ? styles.colorCircleSelected : null,
                      ]}
                      onPress={() => setCatColor(col)}
                    />
                  );
                })}
              </View>
            </View>

            <ScalePress
              style={[styles.saveBtn, saving ? { opacity: 0.7 } : null]}
              onPress={handleCreateCategory}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.saveBtnText}>Simpan Kategori</Text>
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
  headerAddBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.coral,
    alignItems: "center",
    justifyContent: "center",
  },
  content: { padding: 20, paddingBottom: 40 },
  tabToggle: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    padding: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: 20,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 12,
  },
  tabBtnActive: {
    backgroundColor: colors.plum,
  },
  tabText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: "#FFFFFF",
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  emptyTitle: { fontSize: 16, fontWeight: "800", color: colors.textPrimary, marginTop: 12 },
  emptySubtitle: { fontSize: 13, color: colors.textMuted, textAlign: "center", marginTop: 6 },
  grid: {
    gap: 10,
  },
  catCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  colorDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 12,
  },
  catName: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textPrimary,
    flex: 1,
  },
  deleteBtn: {
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
  typeSelectorRow: { flexDirection: "row", gap: 10 },
  typeChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: colors.slateLight,
    alignItems: "center",
  },
  typeChipActiveExpense: { backgroundColor: colors.coral },
  typeChipActiveIncome: { backgroundColor: colors.incomeGreen },
  typeChipText: { fontSize: 12, fontWeight: "700", color: colors.textSecondary },
  colorPalette: {
    flexDirection: "row",
    gap: 12,
    marginTop: 4,
  },
  colorCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  colorCircleSelected: {
    borderWidth: 3,
    borderColor: "#000000",
  },
  saveBtn: {
    backgroundColor: colors.plum,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 10,
  },
  saveBtnText: { fontSize: 15, fontWeight: "800", color: "#FFFFFF" },
});
