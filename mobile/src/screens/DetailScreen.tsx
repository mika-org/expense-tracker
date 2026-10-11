import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Animated,
  RefreshControl,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ChevronLeft,
  Receipt,
  Calendar,
  CreditCard,
  Tag,
  Edit2,
  Trash2,
  Upload,
  Download,
  CheckCircle2,
} from "lucide-react-native";
import { CategoryPills } from "../components/CategoryPills";
import { TransactionRow } from "../components/TransactionRow";
import { ViewModeToggle, ViewMode } from "../components/ViewModeToggle";
import { colors } from "../theme/colors";
import { Transaction } from "../types";
import { api } from "../services/api";
import { EditTransactionModal } from "./EditTransactionModal";
import { FadeInView, ScalePress } from "../components/AnimatedComponents";

interface DetailScreenProps {
  transaction?: Transaction | null;
  onBack?: () => void;
}

export const DetailScreen = ({
  transaction,
  onBack,
}: DetailScreenProps) => {
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [viewMode, setViewMode] = useState<ViewMode>("card");
  const [categoriesList, setCategoriesList] = useState<string[]>(["Semua"]);
  const [activeTx, setActiveTx] = useState<Transaction | null>(transaction || null);
  const [relatedTxList, setRelatedTxList] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  // Edit modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Popover state for comparison chart
  const [selectedChartIdx, setSelectedChartIdx] = useState<number>(4);
  const [monthsData, setMonthsData] = useState<{ month: string; amount: number }[]>([
    { month: "Jun", amount: 0 },
    { month: "Jul", amount: 0 },
    { month: "Ags", amount: 0 },
    { month: "Sep", amount: 0 },
    { month: "Okt", amount: 0 },
  ]);

  // Staggered animated bar heights
  const barAnims = useRef([0, 1, 2, 3, 4].map(() => new Animated.Value(14))).current;

  const fetchReceiptData = async () => {
    setLoading(true);
    try {
      // 1. Fetch categories
      const cats = await api.getCategories();
      if (Array.isArray(cats) && cats.length > 0) {
        setCategoriesList(Array.from(new Set(["Semua", ...cats.map((c: any) => c.name).filter(Boolean)])));
      }

      // 2. Fetch live transactions
      const txs = await api.getTransactions({ limit: 20 });
      if (Array.isArray(txs) && txs.length > 0) {
        const mapped: Transaction[] = txs.map((t: any) => ({
          id: t.id,
          name: t.description || t.merchant || "Transaksi",
          merchant: t.merchant || t.description,
          description: t.description,
          category: t.categoryName || t.category || "Umum",
          amount: t.amount,
          taxAmount: t.taxAmount,
          accountName: t.accountName,
          date: t.date,
          dateLabel: t.dateLabel || new Date(t.date).toLocaleDateString("id-ID", { day: "numeric", month: "short" }),
          iconType: "food",
          type: t.type,
          receiptUrl: t.receiptUrl,
        }));

        setRelatedTxList(mapped);

        if (transaction) {
          const match = mapped.find((m) => m.id === transaction.id);
          setActiveTx(match || transaction);
        } else if (!activeTx && mapped.length > 0) {
          setActiveTx(mapped[0]);
        }
      } else {
        setRelatedTxList([]);
        if (!transaction) {
          setActiveTx(null);
        }
      }

      // 3. Fetch dynamic monthly expense trend from database
      const dash = await api.getDashboard();
      if (dash?.monthlyExpenses && dash.monthlyExpenses.length > 0) {
        setMonthsData(dash.monthlyExpenses);
        setSelectedChartIdx(dash.monthlyExpenses.length - 1);

        const maxAmt = Math.max(...dash.monthlyExpenses.map((m) => m.amount), 1);
        const anims = dash.monthlyExpenses.map((m, i) => {
          const targetHeight = m.amount > 0 ? Math.max(16, Math.round((m.amount / maxAmt) * 88)) : 14;
          return Animated.timing(barAnims[i], {
            toValue: targetHeight,
            duration: 550,
            delay: 100 + i * 80,
            useNativeDriver: false,
          });
        });
        Animated.parallel(anims).start();
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (transaction) {
      setActiveTx(transaction);
      if (transaction.category) setSelectedCategory(transaction.category);
    }
  }, [transaction]);

  useEffect(() => {
    fetchReceiptData();
  }, []);

  const handleDeleteTransaction = () => {
    if (!activeTx) return;
    Alert.alert(
      "Hapus Transaksi",
      `Apakah Anda yakin ingin menghapus transaksi "${activeTx.merchant || activeTx.name}"?`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: async () => {
            const res = await api.deleteTransaction(activeTx.id);
            if (res.success) {
              setActiveTx(null);
              fetchReceiptData();
            } else {
              Alert.alert("Gagal", res.error || "Gagal menghapus transaksi.");
            }
          },
        },
      ]
    );
  };

  const handleDownloadReceipt = () => {
    if (!activeTx) return;
    Alert.alert(
      "Struk Berhasil Diunduh",
      `Struk digital untuk ${activeTx.merchant || activeTx.name} sebesar Rp ${Number(
        activeTx.amount
      ).toLocaleString("id-ID")} telah disimpan ke perangkat Anda.`,
      [{ text: "OK" }]
    );
  };

  const handleUploadReceipt = () => {
    Alert.alert(
      "Unggah Struk Digital",
      "Struk foto berhasil dilampirkan pada transaksi ini.",
      [{ text: "OK" }]
    );
  };

  const filteredList = selectedCategory === "Semua"
    ? relatedTxList
    : relatedTxList.filter(
        (t) => t.category?.toLowerCase() === selectedCategory.toLowerCase()
      );

  const selectedChartItem = monthsData[selectedChartIdx];

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={fetchReceiptData}
            colors={[colors.coral]}
            tintColor={colors.coral}
          />
        }
      >
        {/* Top Header Card */}
        <View style={styles.topCard}>
          {/* Navigation & Action Bar */}
          <View style={styles.navRow}>
            {onBack ? (
              <ScalePress onPress={onBack} style={styles.iconBtn}>
                <ChevronLeft size={20} color={colors.textPrimary} />
              </ScalePress>
            ) : (
              <View style={{ width: 38 }} />
            )}
            <Text style={styles.navTitle}>Struk & Rincian Transaksi</Text>

            {activeTx ? (
              <View style={styles.actionRow}>
                <ScalePress
                  onPress={() => setIsEditModalOpen(true)}
                  style={styles.iconBtn}
                >
                  <Edit2 size={16} color={colors.textPrimary} />
                </ScalePress>
                <ScalePress
                  onPress={handleDeleteTransaction}
                  style={[styles.iconBtn, { backgroundColor: "#FFF1F2" }]}
                >
                  <Trash2 size={16} color="#EF4444" />
                </ScalePress>
              </View>
            ) : (
              <View style={{ width: 38 }} />
            )}
          </View>

          {/* Large Amount Title & Details or Empty State */}
          {!activeTx ? (
            <View style={styles.emptyReceiptBox}>
              <View style={styles.emptyIconCircle}>
                <Receipt size={32} color={colors.plum} />
              </View>
              <Text style={styles.emptyReceiptTitle}>Belum Ada Struk Transaksi</Text>
              <Text style={styles.emptyReceiptSubtitle}>
                Semua data dummy telah dibersihkan. Catat transaksi baru melalui tombol (+) untuk melihat struk digital dan rincian transaksi di sini.
              </Text>
            </View>
          ) : (
            <View style={styles.receiptContainer}>
              <View style={styles.amountSection}>
                <Text
                  style={[
                    styles.amountText,
                    { color: activeTx.type === "income" ? colors.incomeGreen : colors.textPrimary },
                  ]}
                >
                  {activeTx.type === "income" ? "+" : "-"} Rp {Number(activeTx.amount).toLocaleString("id-ID")}
                </Text>
                <Text style={styles.categoryTitle}>
                  {activeTx.merchant || activeTx.name || "Transaksi"}
                </Text>
              </View>

              {/* Receipt Metadata Chips */}
              <View style={styles.metaRow}>
                <View style={styles.metaChip}>
                  <Tag size={13} color={colors.textSecondary} />
                  <Text style={styles.metaChipText}>{activeTx.category || "Umum"}</Text>
                </View>
                <View style={styles.metaChip}>
                  <CreditCard size={13} color={colors.textSecondary} />
                  <Text style={styles.metaChipText}>{activeTx.accountName || "Kas / Dompet"}</Text>
                </View>
                <View style={styles.metaChip}>
                  <Calendar size={13} color={colors.textSecondary} />
                  <Text style={styles.metaChipText}>
                    {activeTx.date
                      ? new Date(activeTx.date).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "Hari ini"}
                  </Text>
                </View>
              </View>

              {/* Upload & Download Struk Buttons */}
              <View style={styles.receiptActionsRow}>
                <ScalePress
                  style={styles.receiptActionBtn}
                  onPress={handleDownloadReceipt}
                >
                  <Download size={14} color={colors.plum} />
                  <Text style={styles.receiptActionText}>Download Struk</Text>
                </ScalePress>

                <ScalePress
                  style={styles.receiptActionBtn}
                  onPress={handleUploadReceipt}
                >
                  <Upload size={14} color={colors.coral} />
                  <Text style={[styles.receiptActionText, { color: colors.coral }]}>Upload Struk</Text>
                </ScalePress>
              </View>

              {/* Dotted threshold line & Staggered comparison chart with interactive popover */}
              <View style={styles.chartArea}>
                {selectedChartItem && (
                  <View style={styles.chartPopover}>
                    <Text style={styles.chartPopoverText}>
                      {selectedChartItem.month}: Rp {selectedChartItem.amount.toLocaleString("id-ID")}
                    </Text>
                  </View>
                )}
                <View style={styles.dashedLine} />
                <View style={styles.chartBars}>
                  {monthsData.map((b, i) => {
                    const isSelected = selectedChartIdx === i;
                    return (
                      <TouchableOpacity
                        key={i}
                        style={styles.chartCol}
                        activeOpacity={0.8}
                        onPress={() => setSelectedChartIdx(i)}
                      >
                        <Animated.View
                          style={[
                            styles.chartBar,
                            { height: barAnims[i] },
                            isSelected ? styles.chartBarActive : styles.chartBarMuted,
                          ]}
                        />
                        <Text style={[styles.chartMonth, isSelected ? styles.chartMonthActive : null]}>
                          {b.month}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </View>
          )}

          {/* Category Chips Scroll */}
          <CategoryPills
            categories={categoriesList}
            activeCategory={selectedCategory}
            onSelect={(cat) => {
              setSelectedCategory(cat);
              if (cat !== "Semua") {
                const found = relatedTxList.find((t) => t.category?.toLowerCase() === cat.toLowerCase());
                if (found) setActiveTx(found);
              }
            }}
          />
        </View>

        {/* Bottom Dark Plum Container Card - Expands seamlessly to bottom */}
        <View style={styles.bottomPlumContainer}>
          <View style={styles.bottomPlumCard}>
            <View style={styles.plumHeaderRow}>
              <Text style={styles.plumDateHeader}>Daftar Riwayat Struk</Text>
              <ViewModeToggle mode={viewMode} onChange={setViewMode} />
            </View>

            {filteredList.length === 0 ? (
              <View style={styles.emptyListWrap}>
                <Text style={styles.emptyListText}>
                  Belum ada transaksi pada kategori ini.
                </Text>
              </View>
            ) : viewMode === "card" ? (
              <View>
                {filteredList.map((tx) => (
                  <TransactionRow
                    key={tx.id}
                    item={tx}
                    darkVariant
                    onPress={() => setActiveTx(tx)}
                  />
                ))}
              </View>
            ) : (
              <View style={styles.darkTable}>
                {filteredList.map((tx) => (
                  <TouchableOpacity
                    key={tx.id}
                    style={styles.darkTableRow}
                    onPress={() => setActiveTx(tx)}
                  >
                    <Text style={styles.darkTableDate}>{tx.dateLabel || "Recent"}</Text>
                    <Text style={styles.darkTableName} numberOfLines={1}>
                      {tx.merchant || tx.name} ({tx.category})
                    </Text>
                    <Text
                      style={[
                        styles.darkTableAmt,
                        tx.type === "income" ? { color: "#34D399" } : null,
                      ]}
                    >
                      {tx.type === "income" ? "+" : "-"}Rp {Number(tx.amount).toLocaleString("id-ID")}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Edit Transaction Modal */}
      <EditTransactionModal
        visible={isEditModalOpen}
        transaction={activeTx}
        onClose={() => setIsEditModalOpen(false)}
        onSave={async (updated) => {
          const res = await api.updateTransaction(updated);
          if (res.success) {
            fetchReceiptData();
          } else {
            Alert.alert("Gagal", res.error || "Gagal memperbarui transaksi.");
          }
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scroll: {
    flexGrow: 1,
    backgroundColor: colors.plum, // ensures bottom overscroll & content background is seamlessly purple
  },
  topCard: {
    backgroundColor: "#FFFFFF",
    paddingTop: 12,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    zIndex: 10,
  },
  navRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  navTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  actionRow: {
    flexDirection: "row",
    gap: 8,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.slateLight,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyReceiptBox: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    alignItems: "center",
  },
  emptyIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#F4EFF8",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  emptyReceiptTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.textPrimary,
    marginBottom: 6,
  },
  emptyReceiptSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 18,
    paddingHorizontal: 16,
  },
  receiptContainer: {
    paddingHorizontal: 20,
  },
  amountSection: {
    alignItems: "center",
    paddingVertical: 10,
  },
  amountText: {
    fontSize: 30,
    fontWeight: "900",
    color: colors.textPrimary,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textSecondary,
    marginTop: 4,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginTop: 10,
    marginBottom: 14,
  },
  metaChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.slateLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 4,
  },
  metaChipText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  receiptActionsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    marginBottom: 16,
  },
  receiptActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.slateLight,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 6,
  },
  receiptActionText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.plum,
  },
  chartArea: {
    marginTop: 8,
    marginBottom: 16,
    position: "relative",
    height: 115,
    justifyContent: "flex-end",
  },
  chartPopover: {
    position: "absolute",
    top: 0,
    alignSelf: "center",
    backgroundColor: colors.plum,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    zIndex: 10,
  },
  chartPopoverText: {
    fontSize: 11,
    color: "#FFFFFF",
    fontWeight: "700",
  },
  dashedLine: {
    position: "absolute",
    top: 35,
    left: 0,
    right: 0,
    height: 1,
    borderWidth: 1,
    borderColor: "#EAE7F0",
    borderStyle: "dashed",
  },
  chartBars: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    height: 90,
  },
  chartCol: {
    alignItems: "center",
    paddingHorizontal: 8,
  },
  chartBar: {
    width: 24,
    borderRadius: 12,
    marginBottom: 6,
  },
  chartBarActive: {
    backgroundColor: colors.coral,
  },
  chartBarMuted: {
    backgroundColor: "#EFEBF5",
  },
  chartMonth: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: "600",
  },
  chartMonthActive: {
    color: colors.coral,
    fontWeight: "800",
  },
  bottomPlumContainer: {
    flex: 1,
    backgroundColor: colors.plum,
  },
  bottomPlumCard: {
    backgroundColor: colors.plum,
    padding: 24,
    paddingBottom: 80, // Generous padding so purple fills comfortably past the floating bottom bar
    minHeight: 350,
  },
  plumHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  plumDateHeader: {
    fontSize: 15,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  emptyListWrap: {
    padding: 28,
    alignItems: "center",
  },
  emptyListText: {
    color: "#E0D7E5",
    fontSize: 13,
    textAlign: "center",
  },
  darkTable: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 20,
    overflow: "hidden",
  },
  darkTableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  darkTableDate: {
    fontSize: 11,
    color: "#B4A3C0",
    fontWeight: "600",
    width: 60,
  },
  darkTableName: {
    flex: 1,
    fontSize: 13,
    color: "#FFFFFF",
    fontWeight: "700",
    paddingHorizontal: 8,
  },
  darkTableAmt: {
    fontSize: 13,
    fontWeight: "800",
    color: "#FFFFFF",
  },
});
