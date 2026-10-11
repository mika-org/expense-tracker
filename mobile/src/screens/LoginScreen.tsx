import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Wallet, Lock, Mail, Eye, EyeOff, ShieldCheck, ArrowRight } from "lucide-react-native";
import { colors } from "../theme/colors";
import { api, ApiUser } from "../services/api";
import { ScalePress, FadeInView } from "../components/AnimatedComponents";

interface LoginScreenProps {
  onLoginSuccess: (user: ApiUser) => void;
}

export const LoginScreen = ({ onLoginSuccess }: LoginScreenProps) => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!identifier.trim()) {
      setErrorMessage("Silakan masukkan email atau nama pengguna Anda.");
      return;
    }
    if (!password) {
      setErrorMessage("Silakan masukkan kata sandi Anda.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await api.login({
        emailOrUsername: identifier.trim(),
        password: password,
      });

      if (res.success && res.user) {
        onLoginSuccess(res.user);
      } else {
        setErrorMessage(res.error || "Email/username atau kata sandi tidak sesuai.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Gagal menghubungi server. Periksa koneksi Anda.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1E0E24" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header & Brand Emblem */}
          <FadeInView delay={0} style={styles.brandSection}>
            <View style={styles.logoBadge}>
              <Wallet size={36} color="#FFFFFF" />
            </View>
            <Text style={styles.appName}>Expense Tracker</Text>
            <Text style={styles.appTagline}>
              Kelola keuangan pribadi dengan pintar, aman, dan terencana
            </Text>
          </FadeInView>

          {/* Login Card */}
          <FadeInView delay={100} style={styles.formCard}>
            <Text style={styles.formTitle}>Masuk ke Akun</Text>
            <Text style={styles.formSubtitle}>
              Gunakan email atau nama pengguna yang telah terdaftar
            </Text>

            {/* Error Message */}
            {errorMessage ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            {/* Input Identifier */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email atau Username</Text>
              <View style={styles.inputContainer}>
                <Mail size={18} color={colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Masukkan email atau username"
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={identifier}
                  onChangeText={(text) => {
                    setIdentifier(text);
                    if (errorMessage) setErrorMessage(null);
                  }}
                />
              </View>
            </View>

            {/* Input Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Kata Sandi</Text>
              <View style={styles.inputContainer}>
                <Lock size={18} color={colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={[styles.textInput, { flex: 1 }]}
                  placeholder="Masukkan kata sandi"
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (errorMessage) setErrorMessage(null);
                  }}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeBtn}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  {showPassword ? (
                    <EyeOff size={18} color={colors.textMuted} />
                  ) : (
                    <Eye size={18} color={colors.textMuted} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Submit Button */}
            <ScalePress
              style={[styles.loginBtn, loading && { opacity: 0.75 }]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <View style={styles.loginBtnContent}>
                  <Text style={styles.loginBtnText}>Masuk Sekarang</Text>
                  <ArrowRight size={18} color="#FFFFFF" />
                </View>
              )}
            </ScalePress>
          </FadeInView>

          {/* Security Assurance Badge */}
          <FadeInView delay={200} style={styles.securityBadge}>
            <ShieldCheck size={16} color="rgba(255, 255, 255, 0.6)" />
            <Text style={styles.securityText}>
              Dilindungi enkripsi aman & data transaksi lokal tersinkron
            </Text>
          </FadeInView>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1E0E24",
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    minHeight: "100%",
    justifyContent: "center",
  },
  brandSection: {
    alignItems: "center",
    marginBottom: 28,
  },
  logoBadge: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: colors.plum,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.coral,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  appName: {
    fontSize: 26,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },
  appTagline: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.65)",
    textAlign: "center",
    marginTop: 6,
    lineHeight: 18,
    maxWidth: 280,
  },
  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  formSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
    marginBottom: 20,
    lineHeight: 16,
  },
  errorBanner: {
    backgroundColor: "#FEF2F2",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#FCA5A5",
    marginBottom: 16,
  },
  errorText: {
    fontSize: 12,
    color: "#DC2626",
    fontWeight: "600",
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    paddingHorizontal: 14,
    height: 50,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: "500",
  },
  eyeBtn: {
    padding: 4,
  },
  loginBtn: {
    backgroundColor: colors.plum,
    borderRadius: 18,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    shadowColor: colors.plum,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loginBtnContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  loginBtnText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  securityBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 24,
  },
  securityText: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.55)",
    fontWeight: "500",
  },
});
