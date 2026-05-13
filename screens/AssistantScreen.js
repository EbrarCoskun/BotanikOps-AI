import { useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { sendChatMessage } from "../services/api";

export default function AssistantScreen({ navigation }) {
  const scrollRef = useRef(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [chat, setChat] = useState([
    {
      role: "ai",
      text: "Merhaba Ben BotanikOps AI yönetici asistanı. Sipariş gecikmeleri, kritik stoklar, ürün önerileri ve müşteri talepleri hakkında analiz sunabilirim.",
    },
  ]);

  const quickMessages = [
    "Geciken siparişleri özetle",
    "Kritik stokta olan ürünler neler?",
    "Bakımı kolay ürünleri öner",
  ];

  const sendMessage = async (customMessage) => {
    const userText = customMessage || input.trim();
    if (!userText) return;

    setLoading(true);
    setInput("");

    setChat((prev) => [
      ...prev,
      { role: "user", text: userText },
      {
        role: "ai",
        text: "AI operasyon analizi hazırlanıyor...",
        loading: true,
      },
    ]);

    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      const data = await sendChatMessage(userText, 'admin');

      setChat((prev) => [
        ...prev.slice(0, -1),
        {
          role: "ai",
          text: data.reply || "Cevap üretilemedi.",
          source: data.source,
        },
      ]);
    } catch (error) {
      setChat((prev) => [
        ...prev.slice(0, -1),
        {
          role: "ai",
          text: "Şu anda backend servisine ulaşılamıyor. Lütfen FastAPI’nin çalıştığından emin olun.",
        },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }, 150);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.wrapper}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={20}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>

        <View style={styles.headerTextArea}>
          <Text style={styles.title}>AI Operasyon</Text>
          <Text style={styles.subtitle}>Yönetici analiz asistanı</Text>
        </View>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>Admin</Text>
        </View>
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.chatArea}
        contentContainerStyle={styles.chatContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.analysisCard}>
          <Text style={styles.analysisIcon}>🤖</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.analysisTitle}>Operasyon Özeti Sor</Text>
            <Text style={styles.analysisDesc}>
              AI; sipariş, stok ve müşteri mesajlarını analiz ederek yöneticiye
              aksiyon önerisi sunar.
            </Text>
          </View>
        </View>

        {chat.map((item, index) => (
          <View
            key={index}
            style={[
              styles.messageRow,
              item.role === "user" ? styles.userRow : styles.aiRow,
            ]}
          >
            <View
              style={[
                styles.bubble,
                item.role === "user" ? styles.userBubble : styles.aiBubble,
              ]}
            >
              {item.loading ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator size="small" color="#2D6A4F" />
                  <Text style={styles.loadingText}>Analiz hazırlanıyor...</Text>
                </View>
              ) : (
                <>
                  <Text
                    style={[
                      styles.bubbleText,
                      item.role === "user" ? styles.userText : styles.aiText,
                    ]}
                  >
                    {item.text}
                  </Text>

                  {item.source && (
                    <Text style={styles.sourceText}>
                      Kaynak:{" "}
                      {item.source === "gemini" ? "Gemini AI" : "Veritabanı"}
                    </Text>
                  )}
                </>
              )}
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.quickArea}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {quickMessages.map((msg, index) => (
            <TouchableOpacity
              key={index}
              style={styles.quickButton}
              onPress={() => sendMessage(msg)}
              disabled={loading}
            >
              <Text style={styles.quickText}>{msg}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.inputWrapper}>
        <View style={styles.inputArea}>
          <TextInput
            style={styles.input}
            placeholder="Operasyon hakkında soru sor..."
            placeholderTextColor="#8A9A91"
            value={input}
            onChangeText={setInput}
            editable={!loading}
          />

          <TouchableOpacity
            style={[styles.sendButton, loading && styles.disabledButton]}
            onPress={() => sendMessage()}
            disabled={loading}
          >
            <Text style={styles.sendText}>➤</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#EEF7F0",
  },
  header: {
    paddingTop: 54,
    paddingHorizontal: 18,
    paddingBottom: 18,
    backgroundColor: "#103D2B",
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.12)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  back: {
    color: "white",
    fontSize: 26,
    fontWeight: "bold",
    marginTop: -2,
  },
  headerTextArea: {
    flex: 1,
  },
  title: {
    color: "white",
    fontSize: 24,
    fontWeight: "900",
  },
  subtitle: {
    color: "#CFE8D9",
    marginTop: 3,
    fontSize: 13,
    fontWeight: "700",
  },
  badge: {
    backgroundColor: "rgba(216,243,220,0.16)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
  },
  badgeText: {
    color: "#D8F3DC",
    fontSize: 12,
    fontWeight: "900",
  },
  chatArea: {
    flex: 1,
  },
  chatContent: {
    padding: 16,
    paddingBottom: 10,
  },
  analysisCard: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  analysisIcon: {
    fontSize: 34,
    marginRight: 14,
  },
  analysisTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: "#1B4332",
  },
  analysisDesc: {
    marginTop: 4,
    color: "#607067",
    lineHeight: 19,
    fontSize: 13,
  },
  messageRow: {
    flexDirection: "row",
    marginBottom: 13,
  },
  aiRow: {
    justifyContent: "flex-start",
  },
  userRow: {
    justifyContent: "flex-end",
  },
  bubble: {
    maxWidth: "84%",
    paddingVertical: 13,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  aiBubble: {
    backgroundColor: "white",
    borderBottomLeftRadius: 6,
  },
  userBubble: {
    backgroundColor: "#2D6A4F",
    borderBottomRightRadius: 6,
  },
  bubbleText: {
    fontSize: 15,
    lineHeight: 21,
  },
  aiText: {
    color: "#1B4332",
  },
  userText: {
    color: "white",
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  loadingText: {
    color: "#2D6A4F",
    fontWeight: "800",
    fontSize: 14,
  },
  sourceText: {
    marginTop: 8,
    color: "#8A9A91",
    fontSize: 11,
    fontWeight: "800",
  },
  quickArea: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  quickButton: {
    backgroundColor: "white",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 18,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#D8F3DC",
  },
  quickText: {
    color: "#1B4332",
    fontSize: 13,
    fontWeight: "800",
  },
  inputWrapper: {
    backgroundColor: "#EEF7F0",
    paddingHorizontal: 12,
    paddingBottom: Platform.OS === "ios" ? 26 : 12,
  },
  inputArea: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 24,
    padding: 8,
  },
  input: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#1B4332",
  },
  sendButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#2D6A4F",
    justifyContent: "center",
    alignItems: "center",
  },
  disabledButton: {
    opacity: 0.6,
  },
  sendText: {
    color: "white",
    fontSize: 22,
    fontWeight: "900",
    marginLeft: 2,
  },
});
