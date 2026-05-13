import sqlite3
from datetime import datetime, timedelta
import random


DB_NAME = "botanik_asistan_ai.db"


def create_database():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    cursor.execute("PRAGMA foreign_keys = ON")

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS musteriler (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ad TEXT NOT NULL,
            telefon TEXT NOT NULL UNIQUE,
            email TEXT
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS urunler (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ad TEXT NOT NULL,
            kategori TEXT NOT NULL,
            stok_miktari INTEGER NOT NULL,
            kritik_esik INTEGER NOT NULL,
            birim_fiyat REAL NOT NULL,
            bakim_notu TEXT
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS siparisler (
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
            FOREIGN KEY (musteri_id) REFERENCES musteriler(id),
            FOREIGN KEY (urun_id) REFERENCES urunler(id)
        )
    """)

    cursor.execute("DELETE FROM siparisler")
    cursor.execute("DELETE FROM urunler")
    cursor.execute("DELETE FROM musteriler")

    musteriler = [
        ("Ahmet Yılmaz", "05511234567", "ahmet@example.com"),
        ("Elif Demir", "05519876543", "elif@example.com"),
        ("Caner Özkan", "05431234567", "caner@example.com"),
        ("Selin Kaya", "05321234567", "selin@example.com"),
        ("Bora Sert", "05071234567", "bora@example.com"),
        ("Ayşe Koç", "05554443322", "ayse@example.com"),
        ("Mehmet Aydın", "05445556677", "mehmet@example.com"),
        ("Zeynep Arslan", "05339998877", "zeynep@example.com"),
    ]

    cursor.executemany("""
        INSERT INTO musteriler (ad, telefon, email)
        VALUES (?, ?, ?)
    """, musteriler)

    urunler = [
        ("Mavi Ladin Fidanı", "Dış Mekan", 85, 20, 450.0, "Güneşli alanları sever, haftada 2 kez sulanmalı."),
        ("Limon Ağacı Bodur", "Meyve", 12, 15, 850.0, "Soğuktan korunmalı, toprağı kurudukça sulanmalı."),
        ("Lavanta Seti 10lu", "Tıbbi Bitki", 200, 50, 250.0, "Süzek toprak sever, fazla suyu sevmez."),
        ("Zeytin Fidanı Gemlik", "Meyve", 45, 30, 320.0, "Bol güneş ister, yıllık gübreleme önerilir."),
        ("Orkide Beyaz", "İç Mekan", 8, 10, 1200.0, "Doğrudan güneş almamalı, ortam nemli tutulmalı."),
        ("Aloe Vera", "Tıbbi Bitki", 60, 25, 180.0, "Aydınlık ortam sever, az su ister."),
        ("Armut Fidanı", "Meyve", 20, 5, 250.0, "Bol güneş ister, kış aylarında budanmalıdır."),
        ("Ceviz Fidanı Chandler", "Meyve", 6, 10, 390.0, "Derin toprak sever, düzenli sulama ister."),
        ("Defne Fidanı", "Aromatik Bitki", 30, 12, 160.0, "Yarı gölge alanlarda gelişir."),
        ("Biberiye", "Aromatik Bitki", 18, 20, 95.0, "Güneşli alan ister, fazla sulama yapılmamalı."),
        ("Sakura Fidanı", "Süs Bitkisi", 9, 8, 1450.0, "Ilıman iklim sever, rüzgardan korunmalı."),
        ("Kaktüs Mini Set", "İç Mekan", 40, 15, 140.0, "Çok az su ister, güneşli pencere önü uygundur."),
        ("Çam Fidanı", "Orman Fidanı", 75, 25, 120.0, "Dış mekanda kolay yetişir."),
        ("Fesleğen Fidesi", "Aromatik Bitki", 14, 20, 60.0, "Güneş sever, düzenli sulanmalıdır."),
        ("Gül Fidanı Kırmızı", "Süs Bitkisi", 22, 10, 210.0, "Güneşli alan ister, budama yapılmalıdır."),
        ("Hurma Fidanı", "Meyve", 5, 8, 980.0, "Sıcak iklim sever, don olayından korunmalı."),
        ("Menekşe", "İç Mekan", 33, 15, 85.0, "Dolaylı ışık sever, toprağı nemli kalmalı."),
        ("Adaçayı", "Tıbbi Bitki", 27, 12, 75.0, "Az su ister, güneşli ortamda gelişir."),
        ("Kiraz Fidanı", "Meyve", 11, 10, 340.0, "Soğuklama ihtiyacı vardır, bahçeye uygundur."),
        ("Mazı Fidanı", "Çit Bitkisi", 16, 18, 130.0, "Çit oluşturmak için uygundur, düzenli budanmalı."),
    ]

    cursor.executemany("""
        INSERT INTO urunler 
        (ad, kategori, stok_miktari, kritik_esik, birim_fiyat, bakim_notu)
        VALUES (?, ?, ?, ?, ?, ?)
    """, urunler)

    durumlar = [
        "Hazırlanıyor",
        "Kargoda",
        "Teslim Edildi",
        "Gecikmiş",
        "İptal Edildi"
    ]

    kargo_firmalari = ["Yurtiçi Kargo", "Aras Kargo", "MNG Kargo", "PTT Kargo"]

    used_codes = set()

    for i in range(20):
        musteri_id = random.randint(1, len(musteriler))
        urun_id = random.randint(1, len(urunler))
        adet = random.randint(1, 5)
        durum = random.choice(durumlar)

        while True:
            siparis_kodu = f"BST-{random.randint(1000, 9999)}"
            if siparis_kodu not in used_codes:
                used_codes.add(siparis_kodu)
                break

        siparis_tarihi = (
            datetime.now() - timedelta(days=random.randint(1, 12))
        ).strftime("%Y-%m-%d")

        tahmini_teslimat = (
            datetime.now() + timedelta(days=random.randint(1, 5))
        ).strftime("%Y-%m-%d")

        if durum in ["Kargoda", "Teslim Edildi", "Gecikmiş"]:
            kargo_takip_no = f"KRG{random.randint(100000, 999999)}"
            kargo_firmasi = random.choice(kargo_firmalari)
        else:
            kargo_takip_no = None
            kargo_firmasi = None

        cursor.execute("""
            INSERT INTO siparisler
            (
                siparis_kodu, musteri_id, urun_id, adet, durum,
                siparis_tarihi, tahmini_teslimat, kargo_takip_no, kargo_firmasi
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            siparis_kodu,
            musteri_id,
            urun_id,
            adet,
            durum,
            siparis_tarihi,
            tahmini_teslimat,
            kargo_takip_no,
            kargo_firmasi
        ))

    conn.commit()
    conn.close()

    print("Botanik Asistan AI veritabanı başarıyla oluşturuldu.")


def test_database():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    print("\n--- Ürünler ---")
    cursor.execute("SELECT id, ad, stok_miktari, kritik_esik FROM urunler")
    for row in cursor.fetchall():
        print(row)

    print("\n--- Kritik Stoklar ---")
    cursor.execute("""
        SELECT ad, stok_miktari, kritik_esik
        FROM urunler
        WHERE stok_miktari <= kritik_esik
    """)
    for row in cursor.fetchall():
        print(row)

    print("\n--- Siparişler ---")
    cursor.execute("""
        SELECT 
            s.siparis_kodu,
            m.ad,
            m.telefon,
            u.ad,
            s.adet,
            s.durum,
            s.kargo_takip_no,
            s.kargo_firmasi
        FROM siparisler s
        JOIN musteriler m ON s.musteri_id = m.id
        JOIN urunler u ON s.urun_id = u.id
    """)
    for row in cursor.fetchall():
        print(row)

    conn.close()


if __name__ == "__main__":
    create_database()
    test_database()