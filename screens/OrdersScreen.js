import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { getOrders } from "../services/api";

export default function OrdersScreen({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadOrders = async () => {
    try {
      const data = await getOrders();
      setOrders(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadOrders();
  };

  const getStatusStyle = (status) => {
    if (status === "Gecikmiş") return styles.danger;
    if (status === "Kargoda") return styles.shipping;
    if (status === "Teslim Edildi") return styles.done;
    if (status === "İptal Edildi") return styles.cancelled;
    return styles.preparing;
  };

  const delayedCount = orders.filter((o) => o.durum === "Gecikmiş").length;
  const shippingCount = orders.filter((o) => o.durum === "Kargoda").length;

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
          <Text style={styles.title}>Sipariş Yönetimi</Text>
          <Text style={styles.subtitle}>Kargo, teslimat ve durum takibi</Text>
        </View>
      </View>

      <View style={styles.summaryCard}>
        <View>
          <Text style={styles.summaryLabel}>Toplam sipariş</Text>
          <Text style={styles.summaryValue}>{orders.length}</Text>
        </View>

        <View style={styles.summaryRight}>
          <Text style={styles.summaryMini}>🚚 Kargoda: {shippingCount}</Text>
          <Text style={styles.summaryMiniDanger}>
            ⚠️ Gecikmiş: {delayedCount}
          </Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#2D6A4F"
          style={{ marginTop: 40 }}
        />
      ) : (
        orders.map((item) => (
          <View key={item.id} style={styles.card}>
            <View style={styles.cardTop}>
              <View>
                <Text style={styles.orderCode}>{item.siparis_kodu}</Text>
                <Text style={styles.customer}>{item.musteri_adi}</Text>
              </View>

              <Text style={[styles.status, getStatusStyle(item.durum)]}>
                {item.durum}
              </Text>
            </View>

            <View style={styles.productBox}>
              <Text style={styles.productLabel}>Ürün</Text>
              <Text style={styles.productName}>
                {item.urun_adi} × {item.adet}
              </Text>
            </View>

            <View style={styles.infoGrid}>
              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>Teslimat</Text>
                <Text style={styles.infoValue}>{item.tahmini_teslimat}</Text>
              </View>

              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>Kargo</Text>
                <Text style={styles.infoValue}>
                  {item.kargo_firmasi || "Beklemede"}
                </Text>
              </View>
            </View>

            {item.kargo_takip_no && (
              <View style={styles.trackingBox}>
                <Text style={styles.trackingLabel}>Kargo takip no</Text>
                <Text style={styles.trackingNo}>{item.kargo_takip_no}</Text>
              </View>
            )}
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
    marginBottom: 18,
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
    fontSize: 36,
    fontWeight: "900",
    marginTop: 4,
  },

  summaryRight: {
    alignItems: "flex-end",
    gap: 8,
  },

  summaryMini: {
    color: "#D8F3DC",
    fontWeight: "800",
    fontSize: 13,
  },

  summaryMiniDanger: {
    color: "#FFD6D6",
    fontWeight: "800",
    fontSize: 13,
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  orderCode: {
    fontSize: 20,
    fontWeight: "900",
    color: "#103D2B",
  },

  customer: {
    marginTop: 4,
    color: "#607067",
    fontSize: 14,
    fontWeight: "700",
  },

  status: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    fontWeight: "900",
    fontSize: 12,
    overflow: "hidden",
  },

  preparing: {
    backgroundColor: "#FFF3BF",
    color: "#A66F00",
  },

  shipping: {
    backgroundColor: "#D8F3DC",
    color: "#1B4332",
  },

  done: {
    backgroundColor: "#E7F5FF",
    color: "#1864AB",
  },

  danger: {
    backgroundColor: "#FFE3E3",
    color: "#C92A2A",
  },

  cancelled: {
    backgroundColor: "#F1F3F5",
    color: "#868E96",
  },

  productBox: {
    marginTop: 18,
    backgroundColor: "#F4F8F5",
    borderRadius: 18,
    padding: 14,
  },

  productLabel: {
    color: "#2D6A4F",
    fontWeight: "900",
    fontSize: 12,
  },

  productName: {
    marginTop: 5,
    color: "#103D2B",
    fontWeight: "800",
    fontSize: 15,
  },

  infoGrid: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },

  infoBox: {
    flex: 1,
    backgroundColor: "#EEF7F0",
    borderRadius: 18,
    padding: 13,
  },

  infoLabel: {
    color: "#607067",
    fontSize: 12,
    fontWeight: "800",
  },

  infoValue: {
    marginTop: 5,
    color: "#1B4332",
    fontWeight: "900",
    fontSize: 14,
  },

  trackingBox: {
    marginTop: 12,
    backgroundColor: "#103D2B",
    borderRadius: 18,
    padding: 14,
  },

  trackingLabel: {
    color: "#B7E4C7",
    fontSize: 12,
    fontWeight: "800",
  },

  trackingNo: {
    color: "white",
    fontSize: 16,
    fontWeight: "900",
    marginTop: 5,
  },
});
