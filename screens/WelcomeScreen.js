import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function WelcomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>🌱</Text>

      <Text style={styles.title}>BotanikOps AI</Text>

      <Text style={styles.subtitle}>
        Akıllı fidanlıklar için yapay zeka destekli müşteri iletişim sistemi
      </Text>

      <TouchableOpacity
        style={styles.customerButton}
        onPress={() => navigation.navigate("CustomerChat")}
      >
        <Text style={styles.buttonText}>Müşteri Girişi</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.adminButton}
        onPress={() => navigation.navigate("AdminLogin")}
      >
        <Text style={styles.adminButtonText}>Admin Girişi</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B3D2E",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  logo: {
    fontSize: 82,
    marginBottom: 18,
  },
  title: {
    color: "white",
    fontSize: 34,
    fontWeight: "bold",
  },
  subtitle: {
    color: "#CFE8D9",
    textAlign: "center",
    marginTop: 12,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 38,
  },
  customerButton: {
    width: "100%",
    backgroundColor: "#4CAF50",
    paddingVertical: 17,
    borderRadius: 18,
    alignItems: "center",
    marginBottom: 14,
  },
  adminButton: {
    width: "100%",
    backgroundColor: "white",
    paddingVertical: 17,
    borderRadius: 18,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  adminButtonText: {
    color: "#1B4332",
    fontSize: 18,
    fontWeight: "bold",
  },
});
