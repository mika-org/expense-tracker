import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { ChevronLeft, User, Globe, Shield, Database } from "lucide-react-native";
import { colors } from "../theme/colors";

interface SettingsScreenProps {
  onBack: () => void;
}

export const SettingsScreen = ({ onBack }: SettingsScreenProps) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <ChevronLeft size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pengaturan Akun</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Profile Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconBox, { backgroundColor: "#FFF7ED" }]}>
              <User size={20} color={colors.coral} />
            </View>
            <View>
              <Text style={styles.cardTitle}>Profil Pengguna</Text>
              <Text style={styles.cardSubtitle}>Akun demo aktif</Text>
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Nama Lengkap</Text>
            <Text style={styles.fieldValue}>Priscilla</Text>
          </View>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Email</Text>
            <Text style={styles.fieldValue}>demo@expensetracker.com</Text>
          </View>
        </View>

        {/* Currency & Region */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconBox, { backgroundColor: "#F5F3FF" }]}>
              <Globe size={20} color={colors.plum} />
            </View>
            <View>
              <Text style={styles.cardTitle}>Preferensi Regional</Text>
              <Text style={styles.cardSubtitle}>Zona waktu & format angka</Text>
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Mata Uang Utama</Text>
            <Text style={styles.fieldValue}>USD ($) / IDR (Rp)</Text>
          </View>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Zona Waktu</Text>
            <Text style={styles.fieldValue}>Asia/Jakarta (WIB — UTC+7)</Text>
          </View>
        </View>

        {/* Database & Architecture */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconBox, { backgroundColor: "#EFF6FF" }]}>
              <Database size={20} color="#3B82F6" />
            </View>
            <View>
              <Text style={styles.cardTitle}>Arsitektur Sistem</Text>
              <Text style={styles.cardSubtitle}>Spesifikasi teknis</Text>
            </View>
          </View>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Database</Text>
            <Text style={styles.rowValue}>PostgreSQL (Prisma 6)</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Presisi Angka</Text>
            <Text style={styles.rowValue}>Decimal(15, 2)</Text>
          </View>
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
  content: { padding: 20, gap: 16 },
  card: { backgroundColor: "#FFFFFF", borderRadius: 28, padding: 20, borderWidth: 1, borderColor: colors.cardBorder },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: "#F0EEF4" },
  iconBox: { width: 42, height: 42, borderRadius: 16, alignItems: "center", justifyContent: "center", marginRight: 12 },
  cardTitle: { fontSize: 15, fontWeight: "800", color: colors.textPrimary },
  cardSubtitle: { fontSize: 11, color: colors.textMuted },
  field: { marginBottom: 12 },
  fieldLabel: { fontSize: 11, color: colors.textMuted, fontWeight: "600" },
  fieldValue: { fontSize: 14, fontWeight: "800", color: colors.textPrimary, marginTop: 2 },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6 },
  rowLabel: { fontSize: 13, color: colors.textSecondary },
  rowValue: { fontSize: 13, fontWeight: "800", color: colors.textPrimary },
});
