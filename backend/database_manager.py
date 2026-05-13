import sqlite3
import random
from datetime import datetime, timedelta


DB_NAME = "botanik_asistan_ai.db"


def create_database():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    cursor.execute("PRAGMA foreign_keys = ON")

    # Eski tabloları temizle
    cursor.execute("DROP TABLE IF EXISTS archived_orders")
    cursor.execute("DROP TABLE IF EXISTS seller_notifications")
    cursor.execute("DROP TABLE IF EXISTS mesajlar")
    cursor.execute("DROP TABLE IF EXISTS siparisler")
    cursor.execute("DROP TABLE IF EXISTS urunler")
    cursor.execute("DROP TABLE IF EXISTS musteriler")

    # Müşteriler
    cursor.execute("""
        CREATE TABLE musteriler (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ad TEXT NOT NULL,
            telefon TEXT NOT NULL UNIQUE,
            email TEXT,
            telegram_id TEXT
        )
    """)

    # Ürünler
    cursor.execute("""
        CREATE TABLE urunler (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ad TEXT NOT NULL,
            kategori TEXT NOT NULL,
            stok_miktari INTEGER NOT NULL,
            kritik_esik INTEGER NOT NULL,
            birim_fiyat REAL NOT NULL,
            bakim_notu TEXT
        )
    """)

    # Siparişler
    cursor.execute("""
        CREATE TABLE siparisler (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            siparis_kodu TEXT NOT NULL UNIQUE,
            musteri_id INTEGER NOT NULL,
            urun_id INTEGER NOT NULL,
            adet INTEGER NOT NULL,
            durum TEXT NOT NULL,
            siparis_tarihi TEXT NOT NULL,
            tahmini_teslimat TEXT,
            kargo_takip_no TEXT,
            kargo_firmasi TEXT,
            delay_flag INTEGER DEFAULT 0,
            FOREIGN KEY (musteri_id) REFERENCES musteriler(id),
            FOREIGN KEY (urun_id) REFERENCES urunler(id)
        )
    """)

    # Müşteri mesajları / AI cevapları
    cursor.execute("""
    CREATE TABLE mesajlar (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        kullanici_mesaji TEXT,
        ai_cevabi TEXT,
        kaynak TEXT,
        kanal TEXT DEFAULT 'mobile',
        telegram_id TEXT,
        conversation_id TEXT,
        tarih TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
""")

    # Satıcı / admin bildirimleri
    cursor.execute("""
        CREATE TABLE seller_notifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            baslik TEXT NOT NULL,
            mesaj TEXT NOT NULL,
            durum TEXT DEFAULT 'okunmadı',
            tarih TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Arşiv siparişleri
    cursor.execute("""
        CREATE TABLE archived_orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            siparis_kodu TEXT,
            arsiv_notu TEXT,
            tarih TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # -------------------------
    # MOCK DATA
    # -------------------------

    first_names = [
        "Ahmet", "Mehmet", "Ayşe", "Fatma", "Mustafa", "Zeynep", "Emre",
        "Elif", "Burak", "Merve", "Can", "Cem", "Deniz", "Eda", "Efe",
        "Gizem", "Hakan", "İbrahim", "Kemal", "Leyla", "Murat", "Naz",
        "Oğuz", "Özge", "Pelin", "Selin", "Tuğba", "Umut", "Volkan",
        "Yasin", "Zehra"
    ]

    last_names = [
        "Yılmaz", "Kaya", "Demir", "Çelik", "Şahin", "Yıldız", "Yıldırım",
        "Öztürk", "Aydın", "Özdemir", "Arslan", "Doğan", "Kılıç", "Aslan",
        "Çetin", "Kara", "Koç", "Kurt", "Özkan", "Şimşek"
    ]

    used_phones = set()

    for _ in range(50):
        ad = f"{random.choice(first_names)} {random.choice(last_names)}"
        telegram_id = str(random.randint(100000000, 999999999))

        while True:
            telefon = f"05{random.randint(30, 59)}{random.randint(1000000, 9999999)}"
            if telefon not in used_phones:
                used_phones.add(telefon)
                break

        email = ad.lower().replace(" ", ".").replace("ı", "i").replace("ğ", "g").replace("ü", "u").replace("ş", "s").replace("ö", "o").replace("ç", "c") + "@example.com"

        cursor.execute("""
            INSERT INTO musteriler (ad, telefon, email, telegram_id)
            VALUES (?, ?, ?, ?)
        """, (ad, telefon, email, telegram_id))

    base_products = [
        ("Buğday Tohumu", "Tarım", 180, 40, 120.0, "Serin ve kuru yerde saklanmalı."),
        ("Mısır Tohumu", "Tarım", 220, 50, 140.0, "Ekim öncesi toprak nemi kontrol edilmeli."),
        ("Domates Fidesi", "Tarım", 95, 30, 35.0, "Güneşli alan ister, düzenli sulanmalıdır."),
        ("Organik Gübre", "Tarım", 60, 25, 180.0, "Toprak verimini artırmak için kullanılabilir."),
        ("Damlama Sulama Borusu", "Tarım", 35, 15, 250.0, "Bahçe ve sera sulamasında kullanılır."),
        ("Budama Makası", "Tarım", 18, 10, 320.0, "Fidan bakımında düzenli budama için uygundur."),
        ("Sera Naylonu", "Tarım", 12, 8, 850.0, "Sera örtüsü olarak kullanılır."),
        ("Çapa Makinesi", "Tarım", 7, 5, 4200.0, "Küçük tarım alanları için uygundur."),

        ("Sızma Zeytinyağı", "Gıda", 75, 20, 450.0, "Doğal ve soğuk sıkım üründür."),
        ("Karakovan Balı", "Gıda", 28, 10, 650.0, "Serin ortamda saklanmalıdır."),
        ("Ev Yapımı Tarhana", "Gıda", 90, 25, 130.0, "Geleneksel yöntemlerle hazırlanmıştır."),
        ("Organik Nohut", "Gıda", 110, 30, 95.0, "Kuru ve serin yerde saklanmalı."),
        ("Kuru İncir", "Gıda", 45, 15, 210.0, "Doğal kurutma yöntemiyle hazırlanmıştır."),
        ("Ceviz İçi", "Gıda", 33, 12, 380.0, "Hava almayan kapta saklanmalıdır."),
        ("Tulum Peyniri", "Gıda", 20, 8, 290.0, "Soğuk zincirde muhafaza edilmelidir."),

        ("El Dokuması Halı", "El Sanatları", 9, 4, 3200.0, "El emeği geleneksel dokuma ürünü."),
        ("Çini Tabak", "El Sanatları", 25, 8, 450.0, "Kırılmaya karşı dikkatli paketlenmelidir."),
        ("Bakır Cezve", "El Sanatları", 40, 12, 350.0, "El işçiliği bakır üründür."),
        ("Ahşap Oyma Kutu", "El Sanatları", 16, 6, 520.0, "Nemden korunmalıdır."),
        ("Hasır Sepet", "El Sanatları", 30, 10, 190.0, "Doğal malzemeden üretilmiştir."),

        ("Mavi Ladin Fidanı", "Fidan/Bitki", 85, 20, 450.0, "Güneşli alanları sever, haftada 2 kez sulanmalı."),
        ("Limon Ağacı Bodur", "Fidan/Bitki", 12, 15, 850.0, "Soğuktan korunmalı, toprağı kurudukça sulanmalı."),
        ("Lavanta Seti 10lu", "Fidan/Bitki", 200, 50, 250.0, "Süzek toprak sever, fazla suyu sevmez."),
        ("Zeytin Fidanı Gemlik", "Fidan/Bitki", 45, 30, 320.0, "Bol güneş ister, yıllık gübreleme önerilir."),
        ("Orkide Beyaz", "Fidan/Bitki", 8, 10, 1200.0, "Doğrudan güneş almamalı, ortam nemli tutulmalı."),
        ("Aloe Vera", "Fidan/Bitki", 60, 25, 180.0, "Aydınlık ortam sever, az su ister."),
        ("Armut Fidanı", "Fidan/Bitki", 20, 5, 250.0, "Bol güneş ister, kış aylarında budanmalıdır."),
        ("Ceviz Fidanı Chandler", "Fidan/Bitki", 6, 10, 390.0, "Derin toprak sever, düzenli sulama ister."),
        ("Fesleğen Fidesi", "Fidan/Bitki", 14, 20, 60.0, "Güneş sever, düzenli sulanmalıdır."),
        ("Mazı Fidanı", "Fidan/Bitki", 16, 18, 130.0, "Çit oluşturmak için uygundur, düzenli budanmalı.")
    ]

    suffixes = ["", " Premium", " Yerli Üretim", " Organik", " Büyük Boy", " Özel Paket"]

    products_to_insert = []

    for i in range(100):
        p = random.choice(base_products)
        suffix = random.choice(suffixes)
        name = p[0] + suffix if suffix and i > len(base_products) else p[0]

        stock = random.randint(5, 500)
        critical = random.randint(10, 50)
        price = round(random.uniform(50.0, 5000.0), 2)

        products_to_insert.append((
            name,
            p[1],
            stock,
            critical,
            price,
            p[5]
        ))

    # Botanik ürünleri garanti olarak ekle
    botanical_fixed = [
        ("Mavi Ladin Fidanı", "Fidan/Bitki", 85, 20, 450.0, "Güneşli alanları sever, haftada 2 kez sulanmalı."),
        ("Limon Ağacı Bodur", "Fidan/Bitki", 12, 15, 850.0, "Soğuktan korunmalı, toprağı kurudukça sulanmalı."),
        ("Lavanta Seti 10lu", "Fidan/Bitki", 200, 50, 250.0, "Süzek toprak sever, fazla suyu sevmez."),
        ("Zeytin Fidanı Gemlik", "Fidan/Bitki", 45, 30, 320.0, "Bol güneş ister, yıllık gübreleme önerilir."),
        ("Orkide Beyaz", "Fidan/Bitki", 8, 10, 1200.0, "Doğrudan güneş almamalı, ortam nemli tutulmalı."),
        ("Aloe Vera", "Fidan/Bitki", 60, 25, 180.0, "Aydınlık ortam sever, az su ister."),
        ("Armut Fidanı", "Fidan/Bitki", 20, 5, 250.0, "Bol güneş ister, kış aylarında budanmalıdır.")
    ]

    products_to_insert.extend(botanical_fixed)

    cursor.executemany("""
        INSERT INTO urunler (
            ad, kategori, stok_miktari, kritik_esik, birim_fiyat, bakim_notu
        )
        VALUES (?, ?, ?, ?, ?, ?)
    """, products_to_insert)

    durumlar = ["Hazırlanıyor", "Kargoda", "Teslim Edildi", "İptal Edildi"]
    kargo_firmalari = ["Yurtiçi Kargo", "MNG Kargo", "Aras Kargo", "PTT Kargo"]

    used_order_codes = set()

    for _ in range(200):
        musteri_id = random.randint(1, 50)
        urun_id = random.randint(1, len(products_to_insert))
        adet = random.randint(1, 5)
        durum = random.choice(durumlar)

        while True:
            siparis_kodu = f"BST-{random.randint(1000, 9999)}"
            if siparis_kodu not in used_order_codes:
                used_order_codes.add(siparis_kodu)
                break

        created_at_dt = datetime.now() - timedelta(days=random.randint(1, 30))
        siparis_tarihi = created_at_dt.strftime("%Y-%m-%d %H:%M:%S")
        tahmini_teslimat = (
            created_at_dt + timedelta(days=random.randint(2, 7))
        ).strftime("%Y-%m-%d")

        delay_flag = 1 if random.random() < 0.18 else 0

        if delay_flag == 1:
            durum = "Gecikmiş"

        if durum in ["Kargoda", "Teslim Edildi", "Gecikmiş"]:
            kargo_firmasi = random.choice(kargo_firmalari)
            kargo_takip_no = f"KRG{random.randint(100000, 999999)}"
        else:
            kargo_firmasi = None
            kargo_takip_no = None

        cursor.execute("""
            INSERT INTO siparisler (
                siparis_kodu,
                musteri_id,
                urun_id,
                adet,
                durum,
                siparis_tarihi,
                tahmini_teslimat,
                kargo_takip_no,
                kargo_firmasi,
                delay_flag
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            siparis_kodu,
            musteri_id,
            urun_id,
            adet,
            durum,
            siparis_tarihi,
            tahmini_teslimat,
            kargo_takip_no,
            kargo_firmasi,
            delay_flag
        ))

    # Admin bildirimleri
    notifications = [
        (
            "Kritik stok uyarısı",
            "Bazı ürünler kritik stok seviyesinin altına düştü.",
            "okunmadı"
        ),
        (
            "Geciken sipariş bildirimi",
            "Gecikme riski taşıyan siparişler tespit edildi.",
            "okunmadı"
        ),
        (
            "AI müşteri iletişimi",
            "Müşteri mesajları AI tarafından yanıtlanmaya başladı.",
            "okundu"
        )
    ]

    cursor.executemany("""
        INSERT INTO seller_notifications (baslik, mesaj, durum)
        VALUES (?, ?, ?)
    """, notifications)

    conn.commit()
    conn.close()

    print("Yeni ana veritabanı başarıyla oluşturuldu.")
    print("50 müşteri, 107 ürün, 200 sipariş, bildirim tabloları hazır.")


def test_database():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    print("\n--- Tablo Kontrol ---")
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
    for row in cursor.fetchall():
        print(row[0])

    print("\n--- Ürün Sayısı ---")
    cursor.execute("SELECT COUNT(*) FROM urunler")
    print(cursor.fetchone()[0])

    print("\n--- Sipariş Sayısı ---")
    cursor.execute("SELECT COUNT(*) FROM siparisler")
    print(cursor.fetchone()[0])

    print("\n--- Kritik Stok Sayısı ---")
    cursor.execute("""
        SELECT COUNT(*)
        FROM urunler
        WHERE stok_miktari <= kritik_esik
    """)
    print(cursor.fetchone()[0])

    print("\n--- Geciken Sipariş Sayısı ---")
    cursor.execute("""
        SELECT COUNT(*)
        FROM siparisler
        WHERE delay_flag = 1 OR durum = 'Gecikmiş'
    """)
    print(cursor.fetchone()[0])

    conn.close()


if __name__ == "__main__":
    create_database()
    test_database()