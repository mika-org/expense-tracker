import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ChevronLeft,
  User,
  Globe,
  Shield,
  KeyRound,
  LogOut,
  LogIn,
  CheckCircle2,
  X,
  CreditCard,
} from "lucide-react-native";
import { colors } from "../theme/colors";
import { api, getStoredUser, setStoredUser, ApiUser } from "../services/api";
import { FadeInView, ScalePress } from "../components/AnimatedComponents";

interface SettingsScreenProps {
  onBack: () => void;
}

export const SettingsScreen = ({ onBack }: SettingsScreenProps) => {
  const [currentUser, setCurrentUser] = useState<ApiUser | null>(getStoredUser());
  const [loading, setLoading] = useState(false);

  // Modal states
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Edit Profile form
  const [editName, setEditName] = useState(currentUser?.name || "Aditia M");
  const [editCurrency, setEditCurrency] = useState("IDR");

  // Change Password form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Login form
  const [loginIdentifier, setLoginIdentifier] = useState("aditiam2311");
  const [loginPassword, setLoginPassword] = useState("admin123");

  const loadProfile = async () => {
    setLoading(true);
    try {
      const u = await api.getProfile();
      if (u) {
        setCurrentUser(u);
        setEditName(u.name);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      Alert.alert("Perhatian", "Nama pengguna tidak boleh kosong.");
      return;
    }
    const res = await api.updateProfile({ name: editName.trim(), currency: editCurrency });
    if (res.success) {
      setCurrentUser(res.user);
      setIsEditProfileOpen(false);
      Alert.alert("Berhasil", "Profil pengguna berhasil diperbarui.");
    } else {
      Alert.alert("Gagal", res.error || "Gagal memperbarui profil.");
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      Alert.alert("Perhatian", "Semua kolom kata sandi wajib diisi.");
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert("Perhatian", "Kata sandi baru minimal 6 karakter.");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Perhatian", "Konfirmasi kata sandi baru tidak sesuai.");
      return;
    }

    const res = await api.changePassword({ currentPassword, newPassword });
    if (res.success) {
      setIsChangePasswordOpen(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      Alert.alert("Sukses", "Kata sandi akun Anda berhasil diubah!");
    } else {
      Alert.alert("Gagal", res.error || "Gagal mengubah kata sandi.");
    }
  };

  const handleLogin = async () => {
    if (!loginIdentifier || !loginPassword) {
      Alert.alert("Perhatian", "Email/username dan kata sandi wajib diisi.");
      return;
    }

    setLoading(true);
    const res = await api.login({
      emailOrUsername: loginIdentifier,
      password: loginPassword,
    });
    setLoading(false);

    if (res.success && res.user) {
      setCurrentUser(res.user);
      setIsLoginModalOpen(false);
      Alert.alert("Berhasil Masuk", `Selamat datang kembali, ${res.user.name}!`);
    } else {
      Alert.alert("Gagal Masuk", res.error || "Email/username atau kata sandi tidak valid.");
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "Konfirmasi Keluar",
      "Apakah Anda yakin ingin keluar dari akun ini?",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Keluar",
          style: "destructive",
          onPress: async () => {
            await api.logout();
            setCurrentUser(null);
            Alert.alert("Telah Keluar", "Anda berhasil keluar. Silakan masuk kembali kapan saja.");
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.header}>
        <ScalePress onPress={onBack} style={styles.backBtn}>
          <ChevronLeft size={22} color={colors.textPrimary} />
        </ScalePress>
        <Text style={styles.headerTitle}>Pengaturan Akun & Keamanan</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Profile Card */}
        <FadeInView delay={0}>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconBox, { backgroundColor: "#FFF7ED" }]}>
                <User size={20} color={colors.coral} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>Profil Pengguna</Text>
                <Text style={styles.cardSubtitle}>
                  {currentUser ? "Akun terhubung aktif" : "Belum masuk akun"}
                </Text>
              </View>
              <ScalePress
                style={styles.actionChip}
                onPress={() => setIsEditProfileOpen(true)}
              >
                <Text style={styles.actionChipText}>Ubah</Text>
              </ScalePress>
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Nama Lengkap</Text>
              <Text style={styles.fieldValue}>{currentUser?.name || "Aditia M"}</Text>
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Email Akun</Text>
              <Text style={styles.fieldValue}>{currentUser?.email || "hate274ever@gmail.com"}</Text>
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Username</Text>
              <Text style={styles.fieldValue}>aditiam2311</Text>
            </View>
          </View>
        </FadeInView>

        {/* Security & Password */}
        <FadeInView delay={60}>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconBox, { backgroundColor: "#EFF6FF" }]}>
                <Shield size={20} color="#3B82F6" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>Keamanan & Sandi</Text>
                <Text style={styles.cardSubtitle}>Pengaturan kata sandi akun</Text>
              </View>
            </View>

            <ScalePress
              style={styles.menuRow}
              onPress={() => setIsChangePasswordOpen(true)}
            >
              <View style={styles.menuRowLeft}>
                <KeyRound size={18} color={colors.plum} />
                <Text style={styles.menuRowText}>Ubah Kata Sandi (Password)</Text>
              </View>
              <Text style={styles.menuArrow}>›</Text>
            </ScalePress>
          </View>
        </FadeInView>

        {/* Currency & Region */}
        <FadeInView delay={120}>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconBox, { backgroundColor: "#F5F3FF" }]}>
                <Globe size={20} color={colors.plum} />
              </View>
              <View>
                <Text style={styles.cardTitle}>Preferensi Regional</Text>
                <Text style={styles.cardSubtitle}>Format angka dan mata uang sistem</Text>
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Mata Uang Utama</Text>
              <Text style={styles.fieldValue}>IDR (Rupiah Indonesia — Rp)</Text>
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Zona Waktu</Text>
              <Text style={styles.fieldValue}>Asia/Jakarta (WIB — UTC+7)</Text>
            </View>
          </View>
        </FadeInView>

        {/* Account Session Actions (Login & Logout) */}
        <FadeInView delay={180}>
          <View style={styles.sessionBox}>
            <ScalePress
              style={styles.switchAccountBtn}
              onPress={() => setIsLoginModalOpen(true)}
            >
              <LogIn size={18} color={colors.plum} />
              <Text style={styles.switchAccountBtnText}>Ganti Akun / Masuk Ulang</Text>
            </ScalePress>

            <ScalePress
              style={styles.logoutBtn}
              onPress={handleLogout}
            >
              <LogOut size={18} color="#EF4444" />
              <Text style={styles.logoutBtnText}>Keluar dari Akun (Logout)</Text>
            </ScalePress>
          </View>
        </FadeInView>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={isEditProfileOpen} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Ubah Profil Akun</Text>
              <TouchableOpacity onPress={() => setIsEditProfileOpen(false)}>
                <X size={20} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nama Lengkap</Text>
              <TextInput
                style={styles.textInput}
                value={editName}
                onChangeText={setEditName}
                placeholder="Nama Anda"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Mata Uang Default</Text>
              <View style={styles.currencyBadge}>
                <Text style={styles.currencyBadgeText}>IDR (Rupiah Indonesia)</Text>
              </View>
            </View>

            <ScalePress style={styles.modalSaveBtn} onPress={handleSaveProfile}>
              <Text style={styles.modalSaveBtnText}>Simpan Profil</Text>
            </ScalePress>
          </View>
        </View>
      </Modal>

      {/* Change Password Modal */}
      <Modal visible={isChangePasswordOpen} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Ubah Kata Sandi</Text>
              <TouchableOpacity onPress={() => setIsChangePasswordOpen(false)}>
                <X size={20} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Kata Sandi Lama</Text>
              <TextInput
                style={styles.textInput}
                secureTextEntry
                placeholder="Kata sandi saat ini"
                value={currentPassword}
                onChangeText={setCurrentPassword}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Kata Sandi Baru (Min. 6 Karakter)</Text>
              <TextInput
                style={styles.textInput}
                secureTextEntry
                placeholder="Kata sandi baru"
                value={newPassword}
                onChangeText={setNewPassword}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Konfirmasi Kata Sandi Baru</Text>
              <TextInput
                style={styles.textInput}
                secureTextEntry
                placeholder="Ulangi kata sandi baru"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            </View>

            <ScalePress style={styles.modalSaveBtn} onPress={handleChangePassword}>
              <Text style={styles.modalSaveBtnText}>Simpan Kata Sandi Baru</Text>
            </ScalePress>
          </View>
        </View>
      </Modal>

      {/* Login / Switch Account Modal */}
      <Modal visible={isLoginModalOpen} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Masuk / Ganti Akun</Text>
              <TouchableOpacity onPress={() => setIsLoginModalOpen(false)}>
                <X size={20} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email atau Username</Text>
              <TextInput
                style={styles.textInput}
                autoCapitalize="none"
                placeholder="aditiam2311 atau hate274ever@gmail.com"
                value={loginIdentifier}
                onChangeText={setLoginIdentifier}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Kata Sandi</Text>
              <TextInput
                style={styles.textInput}
                secureTextEntry
                placeholder="Kata sandi akun"
                value={loginPassword}
                onChangeText={setLoginPassword}
              />
            </View>

            <ScalePress
              style={styles.modalSaveBtn}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.modalSaveBtnText}>Masuk ke Akun</Text>
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
  content: { padding: 20, gap: 16, paddingBottom: 40 },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 26,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0EEF4",
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  cardTitle: { fontSize: 15, fontWeight: "800", color: colors.textPrimary },
  cardSubtitle: { fontSize: 11, color: colors.textMuted },
  actionChip: {
    backgroundColor: colors.slateLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  actionChipText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.plum,
  },
  field: { marginBottom: 12 },
  fieldLabel: { fontSize: 11, color: colors.textMuted, fontWeight: "600" },
  fieldValue: { fontSize: 14, fontWeight: "800", color: colors.textPrimary, marginTop: 2 },
  menuRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  menuRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  menuRowText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  menuArrow: {
    fontSize: 20,
    color: colors.textMuted,
  },
  sessionBox: {
    gap: 10,
    marginTop: 8,
  },
  switchAccountBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: 14,
    borderRadius: 20,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  switchAccountBtnText: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.plum,
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF1F2",
    paddingVertical: 14,
    borderRadius: 20,
    gap: 8,
  },
  logoutBtnText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#EF4444",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.textSecondary,
    marginBottom: 6,
    textTransform: "uppercase",
  },
  textInput: {
    backgroundColor: colors.slateLight,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  currencyBadge: {
    backgroundColor: colors.slateLight,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
  },
  currencyBadgeText: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  modalSaveBtn: {
    backgroundColor: colors.plum,
    paddingVertical: 15,
    borderRadius: 20,
    alignItems: "center",
    marginTop: 8,
  },
  modalSaveBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
});
