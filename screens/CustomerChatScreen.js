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

export default function CustomerChatScreen({ navigation }) {
  const scrollRef = useRef(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [chat, setChat] = useState([
    {
      role: "ai",
      text: "Merhaba 🌱 Ben BotanikOps AI. Sipariş, kargo, stok ve bitki bakım konularında yardımcı olabilirim.",
    },
  ]);

  const quickMessages = [
    "Siparişim nerede?",
    "Bakımı kolay bir bitki öner",
    "Mavi Ladin Fidanı stokta var mı?",
  ];

  const sendMessage = async (customMessage) => {
    const userText = customMessage || input.trim();
    if (!userText) return;

    setLoading(true);
    setInput("");

    setChat((prev) => [
      ...prev,
      { role: "user", text: userText },
      { role: "ai", text: "BotanikOps AI yanıt hazırlıyor...", loading: true },
    ]);

    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      const data = await sendChatMessage(userText);

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
          text: "Şu anda sisteme ulaşılamıyor. Lütfen daha sonra tekrar deneyin.",
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
          <Text style={styles.title}>BotanikOps AI</Text>
          <Text style={styles.subtitle}>Akıllı müşteri destek asistanı</Text>
        </View>

        <View style={styles.onlineBadge}>
          <Text style={styles.onlineDot}>●</Text>
          <Text style={styles.onlineText}>Aktif</Text>
        </View>
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.chatArea}
        contentContainerStyle={styles.chatContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.assistantCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatar}>🌿</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.assistantTitle}>Fidanlık Asistanı</Text>
            <Text style={styles.assistantDesc}>
              Sipariş durumunuzu sorgulayabilir, stok bilgisi alabilir veya
              bitki bakım önerisi isteyebilirsiniz.
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
            {item.role === "ai" && (
              <View style={styles.smallAvatar}>
                <Text style={styles.smallAvatarText}>AI</Text>
              </View>
            )}

            <View
              style={[
                styles.bubble,
                item.role === "user" ? styles.userBubble : styles.aiBubble,
              ]}
            >
              {item.loading ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator size="small" color="#2D6A4F" />
                  <Text style={styles.loadingText}>Yanıt hazırlanıyor...</Text>
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
            placeholder="Sipariş kodu, stok veya bakım sorusu yaz..."
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
    fontWeight: "800",
  },

  subtitle: {
    color: "#CFE8D9",
    marginTop: 3,
    fontSize: 13,
  },

  onlineBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(216,243,220,0.16)",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 18,
  },

  onlineDot: {
    color: "#7CFF8B",
    fontSize: 10,
    marginRight: 5,
  },

  onlineText: {
    color: "#D8F3DC",
    fontSize: 12,
    fontWeight: "700",
  },

  chatArea: {
    flex: 1,
  },

  chatContent: {
    padding: 16,
    paddingBottom: 10,
  },

  assistantCard: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },

  avatarCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#D8F3DC",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  avatar: {
    fontSize: 28,
  },

  assistantTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#1B4332",
  },

  assistantDesc: {
    marginTop: 4,
    color: "#607067",
    lineHeight: 19,
    fontSize: 13,
  },

  messageRow: {
    flexDirection: "row",
    marginBottom: 13,
    alignItems: "flex-end",
  },

  aiRow: {
    justifyContent: "flex-start",
  },

  userRow: {
    justifyContent: "flex-end",
  },

  smallAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#D8F3DC",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },

  smallAvatarText: {
    color: "#1B4332",
    fontSize: 11,
    fontWeight: "900",
  },

  bubble: {
    maxWidth: "78%",
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
    fontWeight: "700",
    fontSize: 14,
  },

  sourceText: {
    marginTop: 8,
    color: "#8A9A91",
    fontSize: 11,
    fontWeight: "700",
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
    fontWeight: "700",
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
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
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
