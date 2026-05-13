import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { getMessages } from "../services/api";

export default function MessagesScreen({ navigation }) {
  const [messages, setMessages] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadMessages = async () => {
    try {
      const data = await getMessages();
      setMessages(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadMessages();
  };

  const filteredMessages = useMemo(() => {
    if (activeFilter === "all") return messages;

    return messages.filter((item) => {
      const channel = item.kanal || "mobile";
      return channel === activeFilter;
    });
  }, [messages, activeFilter]);

  const mobileCount = messages.filter(
    (item) => (item.kanal || "mobile") === "mobile",
  ).length;
  const telegramCount = messages.filter(
    (item) => item.kanal === "telegram",
  ).length;

  const filters = [
    { key: "all", label: "Tümü", count: messages.length },
    { key: "mobile", label: "Mobil", count: mobileCount },
    { key: "telegram", label: "Telegram", count: telegramCount },
  ];

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>

        <View>
          <Text style={styles.title}>Müşteri Mesajları</Text>
          <Text style={styles.subtitle}>
            Mobil ve Telegram konuşma kayıtları
          </Text>
        </View>
      </View>

      <View style={styles.summaryCard}>
        <View>
          <Text style={styles.summaryLabel}>Gösterilen kayıt</Text>
          <Text style={styles.summaryValue}>{filteredMessages.length}</Text>
        </View>

        <View style={styles.summaryIconBox}>
          <Text style={styles.summaryIcon}>
            {activeFilter === "telegram"
              ? "📨"
              : activeFilter === "mobile"
                ? "📱"
                : "💬"}
          </Text>
        </View>
      </View>

      <View style={styles.filterRow}>
        {filters.map((filter) => {
          const isActive = activeFilter === filter.key;

          return (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterButton,
                isActive && styles.activeFilterButton,
              ]}
              onPress={() => setActiveFilter(filter.key)}
            >
              <Text
                style={[styles.filterText, isActive && styles.activeFilterText]}
              >
                {filter.label}
              </Text>
              <Text
                style={[
                  styles.filterCount,
                  isActive && styles.activeFilterCount,
                ]}
              >
                {filter.count}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#2D6A4F"
          style={{ marginTop: 40 }}
        />
      ) : filteredMessages.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>🌱</Text>
          <Text style={styles.emptyTitle}>Bu filtrede mesaj yok</Text>
          <Text style={styles.emptyText}>
            Mobil veya Telegram üzerinden mesaj geldiğinde burada görünecek.
          </Text>
        </View>
      ) : (
        filteredMessages.map((item) => (
          <View key={item.id} style={styles.card}>
            <View style={styles.cardTop}>
              <View style={styles.badgeRow}>
                <Text
                  style={[
                    styles.badge,
                    item.kaynak === "gemini"
                      ? styles.geminiBadge
                      : styles.fallbackBadge,
                  ]}
                >
                  {item.kaynak === "gemini" ? "Gemini AI" : "Veritabanı AI"}
                </Text>

                <Text
                  style={[
                    styles.channelBadge,
                    item.kanal === "telegram"
                      ? styles.telegramBadge
                      : styles.mobileBadge,
                  ]}
                >
                  {item.kanal === "telegram" ? "Telegram" : "Mobil"}
                </Text>
              </View>

              <Text style={styles.date}>{item.tarih}</Text>
            </View>

            <View style={styles.messageBlock}>
              <Text style={styles.label}>Müşteri</Text>
              <Text style={styles.customerMessage}>
                {item.kullanici_mesaji}
              </Text>
            </View>

            <View style={styles.answerBlock}>
              <Text style={styles.label}>AI Yanıtı</Text>
              <Text style={styles.aiMessage}>{item.ai_cevabi}</Text>
            </View>
          </View>
        ))
      )}

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EEF7F0",
    paddingHorizontal: 18,
  },

  header: {
    marginTop: 55,
    marginBottom: 18,
    flexDirection: "row",
    alignItems: "center",
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#D8F3DC",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  backText: {
    fontSize: 27,
    color: "#1B4332",
    fontWeight: "900",
    marginTop: -2,
  },

  title: {
    fontSize: 27,
    fontWeight: "900",
    color: "#103D2B",
  },

  subtitle: {
    marginTop: 3,
    color: "#607067",
    fontWeight: "700",
    fontSize: 13,
  },

  summaryCard: {
    backgroundColor: "#103D2B",
    borderRadius: 26,
    padding: 20,
    marginBottom: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  summaryLabel: {
    color: "#B7E4C7",
    fontWeight: "800",
    fontSize: 13,
  },

  summaryValue: {
    color: "white",
    fontSize: 34,
    fontWeight: "900",
    marginTop: 5,
  },

  summaryIconBox: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "rgba(255,255,255,0.14)",
    justifyContent: "center",
    alignItems: "center",
  },

  summaryIcon: {
    fontSize: 30,
  },

  filterRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 18,
  },

  filterButton: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 18,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D8F3DC",
  },

  activeFilterButton: {
    backgroundColor: "#2D6A4F",
    borderColor: "#2D6A4F",
  },

  filterText: {
    color: "#1B4332",
    fontWeight: "900",
    fontSize: 13,
  },

  activeFilterText: {
    color: "white",
  },

  filterCount: {
    marginTop: 4,
    color: "#607067",
    fontWeight: "800",
    fontSize: 12,
  },

  activeFilterCount: {
    color: "#D8F3DC",
  },

  emptyCard: {
    backgroundColor: "white",
    borderRadius: 26,
    padding: 28,
    alignItems: "center",
    marginTop: 20,
  },

  emptyIcon: {
    fontSize: 48,
  },

  emptyTitle: {
    marginTop: 12,
    fontSize: 20,
    fontWeight: "900",
    color: "#1B4332",
  },

  emptyText: {
    marginTop: 8,
    color: "#607067",
    textAlign: "center",
    lineHeight: 21,
  },

  card: {
    backgroundColor: "white",
    borderRadius: 26,
    padding: 18,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },

  cardTop: {
    gap: 10,
  },

  badgeRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    flexWrap: "wrap",
  },

  badge: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    fontWeight: "900",
    fontSize: 12,
    overflow: "hidden",
  },

  geminiBadge: {
    backgroundColor: "#E7F5FF",
    color: "#1864AB",
  },

  fallbackBadge: {
    backgroundColor: "#D8F3DC",
    color: "#1B4332",
  },

  channelBadge: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    fontWeight: "900",
    fontSize: 12,
    overflow: "hidden",
  },

  telegramBadge: {
    backgroundColor: "#E7F5FF",
    color: "#1864AB",
  },

  mobileBadge: {
    backgroundColor: "#FFF3BF",
    color: "#A66F00",
  },

  date: {
    color: "#8A9A91",
    fontSize: 11,
    fontWeight: "800",
  },

  messageBlock: {
    marginTop: 18,
    backgroundColor: "#F4F8F5",
    borderRadius: 18,
    padding: 14,
  },

  answerBlock: {
    marginTop: 12,
    backgroundColor: "#EEF7F0",
    borderRadius: 18,
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: "#2D6A4F",
  },

  label: {
    color: "#2D6A4F",
    fontWeight: "900",
    fontSize: 12,
    marginBottom: 6,
  },

  customerMessage: {
    color: "#103D2B",
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "700",
  },

  aiMessage: {
    color: "#607067",
    fontSize: 15,
    lineHeight: 22,
  },
});
