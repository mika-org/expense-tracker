import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import {
  X,
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  Building2,
  Smartphone,
  Wallet,
  PiggyBank,
} from "lucide-react-native";
import { colors } from "../theme/colors";
import { api } from "../services/api";
import { Transaction } from "../types";
import { ScalePress } from "../components/AnimatedComponents";
import { DatePickerModal } from "../components/DatePickerModal";

export interface EditTransactionModalProps {
  visible: boolean;
  transaction: Transaction | null;
  onClose: () => void;
  onSave?: (data: {
    id: string;
    type: "expense" | "income";
    amount: number;
    merchant: string;
    category: string;
    date?: string;
    accountId?: string;
  }) => void;
}

const defaultExpenseCats = [
  "Makanan & Minuman",
  "Transportasi",
  "Belanja",
  "Tagihan & Utilitas",
  "Tempat Tinggal & Kos",
  "Hiburan",
  "Nongkrong & Kopi",
  "Kesehatan",
];

const defaultIncomeCats = [
  "Gaji",
  "Freelance",
  "Bisnis",
  "Investasi",
  "Bonus & THR",
  "Lainnya (Pemasukan)",
];

export const EditTransactionModal = ({
  visible,
  transaction,
  onClose,
  onSave,
}: EditTransactionModalProps) => {
  const [type, setType] = useState<"expense" | "income">("expense");
  const [amount, setAmount] = useState("");
  const [merchant, setMerchant] = useState("");
  const [category, setCategory] = useState("Makanan & Minuman");
  const [categoriesList, setCategoriesList] = useState<any[]>([]);

  // Account selector state
  const [accountsList, setAccountsList] = useState<any[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");

  // DatePicker state
  const [date, setDate] = useState("");
  const [dateLabel, setDateLabel] = useState("");
  const [datePickerVisible, setDatePickerVisible] = useState(false);

  useEffect(() => {
    if (transaction) {
      setType(transaction.type === "income" ? "income" : "expense");
      setAmount(transaction.amount ? transaction.amount.toString() : "");
      setMerchant(transaction.merchant || transaction.name || "");
      if (transaction.category) setCategory(transaction.category);
      if (transaction.date) {
        setDate(transaction.date.split("T")[0]);
        const d = new Date(transaction.date);
        setDateLabel(
          !isNaN(d.getTime())
            ? d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
            : "Pilih Tanggal"
        );
      }
      if (transaction.accountId) {
        setSelectedAccountId(transaction.accountId);
      }
    }
  }, [transaction, visible]);

  useEffect(() => {
    if (visible) {
      (async () => {
        try {
          const [cats, accs] = await Promise.all([
            api.getCategories(),
            api.getAccounts(),
          ]);
          if (Array.isArray(cats) && cats.length > 0) {
            setCategoriesList(cats);
          }
          if (Array.isArray(accs) && accs.length > 0) {
            setAccountsList(accs);
            setSelectedAccountId((prev) =>
              prev && accs.some((a) => a.id === prev)
                ? prev
                : transaction?.accountId || accs[0].id
            );
          }
        } catch (e) {
          console.warn("Failed to load initial data for edit modal:", e);
        }
      })();
    }
  }, [visible, transaction]);

  const activeCategories = Array.from(
    new Set(
      (categoriesList.length > 0
        ? categoriesList.filter((c) => c.type === type).map((c) => c.name)
        : type === "expense"
        ? defaultExpenseCats
        : defaultIncomeCats
      ).filter(Boolean)
    )
  );

  function handleSave() {
    if (!transaction) return;
    const parsed = parseFloat(amount.replace(/[^0-9.]/g, ""));
    if (!parsed || parsed <= 0) return;

    if (onSave) {
      onSave({
        id: transaction.id,
        type,
        amount: parsed,
        merchant: merchant.trim() || (type === "expense" ? "Pengeluaran" : "Pemasukan"),
        category,
        date: date || undefined,
        accountId: selectedAccountId || undefined,
      });
    }
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
            <Text style={styles.headerTitle}>Ubah Transaksi</Text>
            <ScalePress onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={colors.textPrimary} />
            </ScalePress>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 520 }}>
            {/* Toggle Type */}
            <View style={styles.typeToggle}>
              <ScalePress
                style={[styles.typeBtn, type === "expense" ? styles.typeBtnActive : null]}
                onPress={() => setType("expense")}
              >
                <ArrowDownRight size={16} color={type === "expense" ? "#FFFFFF" : colors.textMuted} />
                <Text style={[styles.typeText, type === "expense" ? styles.typeTextActive : null]}>
                  Pengeluaran
                </Text>
              </ScalePress>

              <ScalePress
                style={[styles.typeBtn, type === "income" ? styles.typeBtnActive : null]}
                onPress={() => setType("income")}
              >
                <ArrowUpRight size={16} color={type === "income" ? "#FFFFFF" : colors.textMuted} />
                <Text style={[styles.typeText, type === "income" ? styles.typeTextActive : null]}>
                  Pemasukan
                </Text>
              </ScalePress>
            </View>

            {/* Amount Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nominal (Rp)</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="0"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
              />
            </View>

            {/* Merchant / Description */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Deskripsi / Pihak Terkait</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Keterangan transaksi"
                placeholderTextColor={colors.textMuted}
                value={merchant}
                onChangeText={setMerchant}
              />
            </View>

            {/* Account / Sumber Dana Selector */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Pilih Akun / Sumber Dana</Text>
              {accountsList.length === 0 ? (
                <Text style={styles.emptyAccountText}>Memuat akun dompet...</Text>
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.accountScroll}>
                  {accountsList.map((acc) => {
                    const isSelected = acc.id === selectedAccountId;
                    const rawType = (acc.accountType || "").toLowerCase();
                    const isBank = rawType.includes("bank");
                    const isWallet = rawType.includes("ewallet") || rawType.includes("wallet");
                    const isCash = rawType.includes("cash");

                    return (
                      <TouchableOpacity
                        key={acc.id}
                        onPress={() => setSelectedAccountId(acc.id)}
                        activeOpacity={0.7}
                        style={[
                          styles.accountChip,
                          isSelected ? styles.accountChipSelected : null,
                        ]}
                      >
                        <View style={[styles.accIconWrap, isSelected ? styles.accIconWrapSelected : null]}>
                          {isBank ? (
                            <Building2 size={14} color={isSelected ? "#FFFFFF" : colors.plum} />
                          ) : isWallet ? (
                            <Smartphone size={14} color={isSelected ? "#FFFFFF" : colors.plum} />
                          ) : isCash ? (
                            <Wallet size={14} color={isSelected ? "#FFFFFF" : colors.plum} />
                          ) : (
                            <PiggyBank size={14} color={isSelected ? "#FFFFFF" : colors.plum} />
                          )}
                        </View>
                        <View>
                          <Text
                            style={[
                              styles.accountChipText,
                              isSelected ? styles.accountChipTextSelected : null,
                            ]}
                            numberOfLines={1}
                          >
                            {acc.name}
                          </Text>
                          <Text
                            style={[
                              styles.accountChipBalance,
                              isSelected ? styles.accountChipBalanceSelected : null,
                            ]}
                          >
                            Rp {(acc.currentBalance ?? acc.balance ?? 0).toLocaleString("id-ID")}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              )}
            </View>

            {/* Transaction Date Picker */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Tanggal Transaksi</Text>
              <TouchableOpacity
                style={styles.datePickerBtn}
                onPress={() => setDatePickerVisible(true)}
              >
                <Calendar size={18} color={colors.coral} />
                <Text style={styles.datePickerBtnText}>{dateLabel || "Pilih Tanggal Transaksi"}</Text>
              </TouchableOpacity>
            </View>

            {/* Category Chips */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Pilih Kategori</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
                {activeCategories.map((c, idx) => {
                  const isSelected = c === category;
                  return (
                    <ScalePress
                      key={`${c}-${idx}`}
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
                    </ScalePress>
                  );
                })}
              </ScrollView>
            </View>

            {/* Save Button */}
            <ScalePress style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>Simpan Perubahan</Text>
            </ScalePress>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>

      <DatePickerModal
        visible={datePickerVisible}
        title="Pilih Tanggal Transaksi"
        initialDate={date || null}
        onClose={() => setDatePickerVisible(false)}
        onSelectDate={(dateStr, label) => {
          setDate(dateStr);
          setDateLabel(label);
        }}
      />
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
    paddingVertical: 12,
    borderRadius: 14,
    gap: 6,
  },
  typeBtnActive: {
    backgroundColor: colors.plum,
  },
  typeText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textMuted,
  },
  typeTextActive: {
    color: "#FFFFFF",
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textSecondary,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  amountInput: {
    fontSize: 26,
    fontWeight: "900",
    color: colors.textPrimary,
    backgroundColor: colors.slateLight,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  textInput: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
    backgroundColor: colors.slateLight,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  datePickerBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.slateLight,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  datePickerBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  categoryScroll: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 4,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: colors.slateLight,
  },
  categoryChipSelected: {
    backgroundColor: colors.coral,
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textSecondary,
  },
  categoryChipTextSelected: {
    color: "#FFFFFF",
  },
  saveBtn: {
    backgroundColor: colors.plum,
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  saveBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
  accountScroll: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 4,
  },
  accountChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: colors.slateLight,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  accountChipSelected: {
    backgroundColor: "#F3E8FF",
    borderColor: colors.plum,
  },
  accIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  accIconWrapSelected: {
    backgroundColor: colors.plum,
  },
  accountChipText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  accountChipTextSelected: {
    color: colors.plum,
  },
  accountChipBalance: {
    fontSize: 10,
    fontWeight: "600",
    color: colors.textMuted,
  },
  accountChipBalanceSelected: {
    color: colors.plum,
  },
  emptyAccountText: {
    fontSize: 12,
    color: colors.textMuted,
    fontStyle: "italic",
    paddingVertical: 6,
  },
});
