import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { X, ArrowDownRight, ArrowUpRight } from "lucide-react-native";
import { colors } from "../theme/colors";

export interface AddTransactionModalProps {
  visible: boolean;
  onClose: () => void;
  onSave?: (data: {
    type: "expense" | "income";
    amount: number;
    merchant: string;
    category: string;
  }) => void;
}

export const AddTransactionModal = ({
  visible,
  onClose,
  onSave,
}: AddTransactionModalProps) => {
  const [type, setType] = useState<"expense" | "income">("expense");
  const [amount, setAmount] = useState("");
  const [merchant, setMerchant] = useState("");
  const [category, setCategory] = useState("Food & Drink");

  const categories = ["Food & Drink", "Clothing", "Transport", "Electronics", "Groceries"];

  function handleSave() {
    const parsed = parseFloat(amount);
    if (!parsed || parsed <= 0) return;

    if (onSave) {
      onSave({
        type,
        amount: parsed,
        merchant: merchant || "New Transaction",
        category,
      });
    }
    setAmount("");
    setMerchant("");
    onClose();
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.overlay}
      >
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Tambah Transaksi</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Toggle Type */}
          <View style={styles.typeToggle}>
            <TouchableOpacity
              style={[styles.typeBtn, type === "expense" ? styles.typeBtnActive : null]}
              onPress={() => setType("expense")}
            >
              <ArrowDownRight size={16} color={type === "expense" ? "#FFFFFF" : colors.textMuted} />
              <Text style={[styles.typeText, type === "expense" ? styles.typeTextActive : null]}>
                Pengeluaran
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.typeBtn, type === "income" ? styles.typeBtnActive : null]}
              onPress={() => setType("income")}
            >
              <ArrowUpRight size={16} color={type === "income" ? "#FFFFFF" : colors.textMuted} />
              <Text style={[styles.typeText, type === "income" ? styles.typeTextActive : null]}>
                Pemasukan
              </Text>
            </TouchableOpacity>
          </View>

          {/* Amount Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Nominal ($)</Text>
            <TextInput
              style={styles.amountInput}
              placeholder="0.00"
              placeholderTextColor={colors.textMuted}
              keyboardType="decimal-pad"
              value={amount}
              onChangeText={setAmount}
            />
          </View>

          {/* Merchant / Store */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Toko / Pihak Terkait</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Contoh: Nike Store, Apple"
              placeholderTextColor={colors.textMuted}
              value={merchant}
              onChangeText={setMerchant}
            />
          </View>

          {/* Category Chips */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Pilih Kategori</Text>
            <View style={styles.categoryWrap}>
              {categories.map((c) => {
                const isSelected = c === category;
                return (
                  <TouchableOpacity
                    key={c}
                    onPress={() => setCategory(c)}
                    style={[
                      styles.categoryChip,
                      isSelected ? styles.categoryChipSelected : null,
                    ]}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        isSelected ? styles.categoryChipTextSelected : null,
                      ]}
                    >
                      {c}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.85}>
            <Text style={styles.saveBtnText}>Simpan Transaksi</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    padding: 24,
    paddingBottom: 36,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.slateLight,
    alignItems: "center",
    justifyContent: "center",
  },
  typeToggle: {
    flexDirection: "row",
    backgroundColor: colors.slateLight,
    borderRadius: 18,
    padding: 4,
    marginBottom: 20,
  },
  typeBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 14,
    gap: 6,
  },
  typeBtnActive: {
    backgroundColor: colors.plum,
  },
  typeText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textSecondary,
  },
  typeTextActive: {
    color: "#FFFFFF",
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textSecondary,
    marginBottom: 6,
  },
  amountInput: {
    backgroundColor: colors.slateLight,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 14,
    fontSize: 26,
    fontWeight: "900",
    color: colors.textPrimary,
  },
  textInput: {
    backgroundColor: colors.slateLight,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  categoryWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: "#FFFFFF",
  },
  categoryChipSelected: {
    backgroundColor: colors.plumPill,
    borderColor: colors.plumPill,
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  categoryChipTextSelected: {
    color: "#FFFFFF",
  },
  saveBtn: {
    backgroundColor: colors.coral,
    borderRadius: 22,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 10,
    shadowColor: colors.coral,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  saveBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
});
