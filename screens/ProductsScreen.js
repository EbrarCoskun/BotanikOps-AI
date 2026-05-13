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

import { getProducts } from "../services/api";

export default function ProductsScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadProducts();
  };

  const criticalCount = products.filter(
    (p) => p.stok_miktari <= p.kritik_esik,
  ).length;

  const totalStock = products.reduce(
    (sum, p) => sum + Number(p.stok_miktari || 0),
    0,
  );

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
          <Text style={styles.title}>Ürün & Stok</Text>
          <Text style={styles.subtitle}>Fidan ve bitki envanter takibi</Text>
        </View>
      </View>

      <View style={styles.summaryCard}>
        <View>
          <Text style={styles.summaryLabel}>Toplam ürün</Text>
          <Text style={styles.summaryValue}>{products.length}</Text>
        </View>

        <View style={styles.summaryRight}>
          <Text style={styles.summaryMini}>🌿 Toplam stok: {totalStock}</Text>
          <Text style={styles.summaryMiniDanger}>
            ⚠️ Kritik: {criticalCount}
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
        products.map((item) => {
          const isCritical = item.stok_miktari <= item.kritik_esik;
          const stockPercent = Math.min(
            100,
            Math.round(
              (item.stok_miktari / Math.max(item.kritik_esik * 2, 1)) * 100,
            ),
          );

          return (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardTop}>
                <View style={styles.productIconBox}>
                  <Text style={styles.productIcon}>🌱</Text>
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.productName}>{item.ad}</Text>
                  <Text style={styles.category}>{item.kategori}</Text>
                </View>

                <Text
                  style={[
                    styles.status,
                    isCritical ? styles.criticalBadge : styles.safeBadge,
                  ]}
                >
                  {isCritical ? "Kritik" : "Stokta"}
                </Text>
              </View>

              <View style={styles.stockBox}>
                <View style={styles.stockHeader}>
                  <Text style={styles.stockLabel}>Stok seviyesi</Text>
                  <Text style={styles.stockValue}>
                    {item.stok_miktari} adet
                  </Text>
                </View>

                <View style={styles.progressBackground}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${stockPercent}%` },
                      isCritical && styles.progressCritical,
                    ]}
                  />
                </View>

                <Text style={styles.threshold}>
                  Kritik eşik: {item.kritik_esik} adet
                </Text>
              </View>

              <View style={styles.infoGrid}>
                <View style={styles.infoBox}>
                  <Text style={styles.infoLabel}>Birim fiyat</Text>
                  <Text style={styles.infoValue}>{item.birim_fiyat} TL</Text>
                </View>

                <View style={styles.infoBox}>
                  <Text style={styles.infoLabel}>Durum</Text>
                  <Text
                    style={[
                      styles.infoValue,
                      isCritical && styles.criticalText,
                    ]}
                  >
                    {isCritical ? "Yenile" : "Yeterli"}
                  </Text>
                </View>
              </View>

              <View style={styles.noteBox}>
                <Text style={styles.noteLabel}>Bakım notu</Text>
                <Text style={styles.noteText}>{item.bakim_notu}</Text>
              </View>
            </View>
          );
        })
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
    alignItems: "center",
  },

  productIconBox: {
    width: 50,
    height: 50,
    borderRadius: 18,
    backgroundColor: "#D8F3DC",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  productIcon: {
    fontSize: 25,
  },

  productName: {
    fontSize: 17,
    fontWeight: "900",
    color: "#103D2B",
  },

  category: {
    marginTop: 4,
    color: "#607067",
    fontSize: 13,
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

  safeBadge: {
    backgroundColor: "#D8F3DC",
    color: "#1B4332",
  },

  criticalBadge: {
    backgroundColor: "#FFE3E3",
    color: "#C92A2A",
  },

  stockBox: {
    marginTop: 18,
    backgroundColor: "#F4F8F5",
    borderRadius: 18,
    padding: 14,
  },

  stockHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  stockLabel: {
    color: "#607067",
    fontSize: 12,
    fontWeight: "800",
  },

  stockValue: {
    color: "#1B4332",
    fontSize: 13,
    fontWeight: "900",
  },

  progressBackground: {
    marginTop: 10,
    height: 10,
    backgroundColor: "#DDEBE2",
    borderRadius: 10,
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    backgroundColor: "#2D6A4F",
    borderRadius: 10,
  },

  progressCritical: {
    backgroundColor: "#C92A2A",
  },

  threshold: {
    marginTop: 8,
    color: "#8A9A91",
    fontSize: 12,
    fontWeight: "700",
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

  criticalText: {
    color: "#C92A2A",
  },

  noteBox: {
    marginTop: 12,
    backgroundColor: "#103D2B",
    borderRadius: 18,
    padding: 14,
  },

  noteLabel: {
    color: "#B7E4C7",
    fontSize: 12,
    fontWeight: "800",
  },

  noteText: {
    color: "white",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
    fontWeight: "600",
  },
});
