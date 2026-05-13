import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../config/firebase";

export default function AdminLoginScreen({ navigation }) {
  const [email, setEmail] = useState("admin@botanikops.com");
  const [password, setPassword] = useState("123456");
  const [loading, setLoading] = useState(false);

  const login = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Eksik bilgi", "Lütfen e-posta ve şifre girin.");
      return;
    }

    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email.trim(), password.trim());
      navigation.replace("Dashboard");
    } catch (error) {
      Alert.alert("Giriş başarısız", "E-posta veya şifre hatalı olabilir.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.wrapper}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.topSection}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>

        <View style={styles.logoCircle}>
          <Text style={styles.logo}>🌿</Text>
        </View>

        <Text style={styles.title}>Admin Paneli</Text>
        <Text style={styles.subtitle}>
          Botanik işletmenizin sipariş, stok ve müşteri iletişim süreçlerini
          yönetin.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Yetkili Girişi</Text>
        <Text style={styles.cardDesc}>Firebase güvenli kimlik doğrulama</Text>

        <View style={styles.inputBox}>
          <Text style={styles.inputLabel}>E-posta</Text>
          <TextInput
            style={styles.input}
            placeholder="admin@botanikops.com"
            placeholderTextColor="#9AA7A0"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <View style={styles.inputBox}>
          <Text style={styles.inputLabel}>Şifre</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••"
            placeholderTextColor="#9AA7A0"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity
          style={[styles.loginButton, loading && styles.disabledButton]}
          onPress={login}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.loginText}>Giriş Yap</Text>
          )}
        </TouchableOpacity>

        <View style={styles.demoBox}>
          <Text style={styles.demoTitle}>Demo Hesap</Text>
          <Text style={styles.demoText}>admin@botanikops.com</Text>
          <Text style={styles.demoText}>123456</Text>
        </View>
      </View>

      <Text style={styles.footerText}>
        BotanikOps AI · Güvenli İşletme Yönetimi
      </Text>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#EEF7F0",
    padding: 20,
  },

  topSection: {
    paddingTop: 48,
    alignItems: "center",
  },

  backButton: {
    position: "absolute",
    top: 52,
    left: 0,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#D8F3DC",
    justifyContent: "center",
    alignItems: "center",
  },

  backText: {
    fontSize: 28,
    color: "#1B4332",
    fontWeight: "bold",
    marginTop: -2,
  },

  logoCircle: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: "#1B4332",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
    shadowColor: "#000",
    shadowOpacity: 0.16,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },

  logo: {
    fontSize: 43,
  },

  title: {
    fontSize: 32,
    fontWeight: "900",
    color: "#103D2B",
  },

  subtitle: {
    marginTop: 10,
    color: "#607067",
    textAlign: "center",
    lineHeight: 22,
    fontSize: 15,
    paddingHorizontal: 10,
  },

  card: {
    backgroundColor: "white",
    borderRadius: 28,
    padding: 22,
    marginTop: 30,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },

  cardTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: "#1B4332",
  },

  cardDesc: {
    marginTop: 5,
    color: "#8A9A91",
    fontWeight: "600",
    marginBottom: 20,
  },

  inputBox: {
    backgroundColor: "#F4F8F5",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 8,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E1EFE5",
  },

  inputLabel: {
    fontSize: 12,
    color: "#2D6A4F",
    fontWeight: "800",
    marginBottom: 4,
  },

  input: {
    fontSize: 16,
    color: "#1B4332",
    paddingVertical: 6,
  },

  loginButton: {
    backgroundColor: "#2D6A4F",
    paddingVertical: 17,
    borderRadius: 20,
    alignItems: "center",
    marginTop: 6,
  },

  disabledButton: {
    opacity: 0.7,
  },

  loginText: {
    color: "white",
    fontSize: 17,
    fontWeight: "900",
  },

  demoBox: {
    marginTop: 18,
    backgroundColor: "#D8F3DC",
    borderRadius: 18,
    padding: 14,
  },

  demoTitle: {
    color: "#1B4332",
    fontWeight: "900",
    marginBottom: 4,
  },

  demoText: {
    color: "#1B4332",
    fontSize: 13,
    fontWeight: "700",
  },

  footerText: {
    textAlign: "center",
    color: "#8A9A91",
    marginTop: 22,
    fontWeight: "700",
    fontSize: 12,
  },
});
