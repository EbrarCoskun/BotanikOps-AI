import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function DashboardScreen({ navigation }) {
  const stats = [
    { title: "Bugünkü Sipariş", value: "24", icon: "📦" },
    { title: "Bekleyen Mesaj", value: "8", icon: "💬" },
    { title: "Kritik Stok", value: "6", icon: "⚠️" },
    { title: "AI Yanıtı", value: "31", icon: "🤖" },
  ];

  const menuItems = [
    {
      title: "Müşteri Mesajları",
      desc: "AI tarafından yanıtlanan talepleri görüntüle",
      icon: "💬",
      screen: "Messages",
    },
    {
      title: "Sipariş Yönetimi",
      desc: "Kargo, teslimat ve sipariş durumlarını takip et",
      icon: "📦",
      screen: "Orders",
    },
    {
      title: "Ürün & Stok",
      desc: "Fidan ve bitki stoklarını gerçek zamanlı izle",
      icon: "🌿",
      screen: "Products",
    },
    {
      title: "AI Operasyon Asistanı",
      desc: "Gecikmeler, stoklar ve müşteri talepleri için analiz al",
      icon: "🤖",
      screen: "Assistant",
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.hero}>
        <View>
          <Text style={styles.hello}>Hoş geldiniz </Text>
          <Text style={styles.title}>BotanikOps Admin</Text>
          <Text style={styles.subtitle}>
            Fidanlık müşteri iletişimi, sipariş ve stok yönetimi
          </Text>
        </View>

        <View style={styles.avatar}>
          <Text style={styles.avatarText}>🌱</Text>
        </View>
      </View>

      <View style={styles.alertCard}>
        <Text style={styles.alertIcon}>⚡</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.alertTitle}>AI Operasyon Özeti</Text>
          <Text style={styles.alertText}>
            Bugün 5 geciken sipariş ve 6 kritik stok ürünü tespit edildi.
          </Text>
        </View>
      </View>

      <View style={styles.statsGrid}>
        {stats.map((item, index) => (
          <View key={index} style={styles.statCard}>
            <Text style={styles.statIcon}>{item.icon}</Text>
            <Text style={styles.statValue}>{item.value}</Text>
            <Text style={styles.statTitle}>{item.title}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Yönetim Alanları</Text>

      {menuItems.map((item, index) => (
        <TouchableOpacity
          key={index}
          style={styles.menuCard}
          onPress={() => navigation.navigate(item.screen)}
        >
          <View style={styles.menuIconBox}>
            <Text style={styles.menuIcon}>{item.icon}</Text>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.menuTitle}>{item.title}</Text>
            <Text style={styles.menuDesc}>{item.desc}</Text>
          </View>

          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={() => navigation.replace("Welcome")}
      >
        <Text style={styles.logoutText}>Çıkış Yap</Text>
      </TouchableOpacity>

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

  hero: {
    marginTop: 55,
    backgroundColor: "#103D2B",
    borderRadius: 30,
    padding: 22,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  hello: {
    color: "#B7E4C7",
    fontSize: 14,
    fontWeight: "700",
  },

  title: {
    color: "white",
    fontSize: 28,
    fontWeight: "900",
    marginTop: 6,
  },

  subtitle: {
    color: "#D8F3DC",
    fontSize: 13,
    marginTop: 8,
    lineHeight: 19,
    maxWidth: 220,
  },

  avatar: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: "rgba(255,255,255,0.14)",
    justifyContent: "center",
    alignItems: "center",
  },

  avatarText: {
    fontSize: 32,
  },

  alertCard: {
    marginTop: 16,
    backgroundColor: "white",
    borderRadius: 24,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  alertIcon: {
    fontSize: 28,
  },

  alertTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#1B4332",
  },

  alertText: {
    color: "#607067",
    marginTop: 4,
    lineHeight: 19,
    fontSize: 13,
  },

  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 16,
  },

  statCard: {
    width: "48%",
    backgroundColor: "white",
    borderRadius: 24,
    padding: 18,
  },

  statIcon: {
    fontSize: 25,
  },

  statValue: {
    fontSize: 28,
    fontWeight: "900",
    color: "#1B4332",
    marginTop: 10,
  },

  statTitle: {
    color: "#607067",
    fontWeight: "700",
    marginTop: 4,
    fontSize: 13,
  },

  sectionTitle: {
    marginTop: 24,
    marginBottom: 12,
    fontSize: 21,
    fontWeight: "900",
    color: "#103D2B",
  },

  menuCard: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  menuIconBox: {
    width: 50,
    height: 50,
    borderRadius: 18,
    backgroundColor: "#D8F3DC",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  menuIcon: {
    fontSize: 24,
  },

  menuTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#1B4332",
  },

  menuDesc: {
    color: "#7A887F",
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },

  arrow: {
    fontSize: 32,
    color: "#95A69C",
    marginLeft: 8,
  },

  logoutButton: {
    marginTop: 10,
    backgroundColor: "#FFE3E3",
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: "center",
  },

  logoutText: {
    color: "#C92A2A",
    fontWeight: "900",
    fontSize: 15,
  },
});
