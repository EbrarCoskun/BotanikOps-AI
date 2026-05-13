from fastapi import FastAPI, Body
from pydantic import BaseModel, Field
import sqlite3
from google import genai
import uvicorn
import sys
import os
from fastapi.middleware.cors import CORSMiddleware

# Türkçe karakter desteği
sys.stdout.reconfigure(encoding='utf-8')

app = FastAPI(title="Botanik Asistan AI Merkezi")

# --- CORS AYARI ---
# Dashboard'u (tarayıcı üzerinden) bilgisayara bağlamak için
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- YAPILANDIRMA ---
MY_API_KEY = "AIzaSyD0S5vw81biVrdZmYyPj4te7O3Ryhvbilo"
client = genai.Client(api_key=MY_API_KEY)

# Veritabanı yolu
base_dir = os.path.dirname(os.path.abspath(__file__))
db_path = os.path.join(base_dir, "botanik_asistan_ai.db")


# --- MODELLER ---
class ChatSoru(BaseModel):
    mesaj: str = Field(..., example="Limon ağacı stokta var mı?")
    user_id: int = Field(None, example=12345)


@app.get("/")
def home():
    return {"durum": "aktif", "mesaj": "Botanik AI Servisi Yeni Şema ile Çalışıyor!"}


# --- 1. SELLER AGENT (Dashboard İçin) ---
@app.get("/analiz")
def ai_analizi_servis_et():
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        
        cursor.execute("SELECT ad, kategori, stok_miktari, kritik_esik FROM urunler WHERE stok_miktari <= kritik_esik")
        stoklar = cursor.fetchall()

        cursor.execute("""
            SELECT musteriler.ad, urunler.ad, siparisler.durum 
            FROM siparisler 
            JOIN musteriler ON siparisler.musteri_id = musteriler.id
            JOIN urunler ON siparisler.urun_id = urunler.id
            WHERE siparisler.durum IN ('Hazırlanıyor', 'Gecikmiş')
            LIMIT 5
        """)
        siparisler = cursor.fetchall()
        conn.close()

        prompt = (
            f"Sen bir İşletme Analiz Ajanısın.\n"
            f"Kritik Stoktaki Ürünler: {stoklar}\n"
            f"Bekleyen Önemli Siparişler: {siparisler}\n"
            "İşletme sahibi için emoji destekli, 3 maddelik kısa bir strateji raporu hazırla."
        )

        response = client.models.generate_content(model="gemini-3.1-flash-lite", contents=prompt)

        return {
            "durum": "basarili",
            "ajan_stratejik_raporu": response.text,
            "metrikler": {
                "kritik_stok_sayisi": len(stoklar),
                "bekleyen_is_sayisi": len(siparisler)
            }
        }
    except Exception as e:
        return {"durum": "hata", "mesaj": f"Veritabanı veya AI hatası: {str(e)}"}


# --- 2. CUSTOMER AGENT  ---
@app.post("/chat")
def customer_agent_cevap(soru: ChatSoru):
    try:
        # 1. Terminale log basalım
        print(f"Gelen Mesaj: {soru.mesaj} | User ID: {soru.user_id}")

        conn = sqlite3.connect(db_path)

        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        # 2. Genel Mağaza Envanterini Çek
        cursor.execute("SELECT ad, birim_fiyat, stok_miktari FROM urunler")
        envanter = [dict(row) for row in cursor.fetchall()]

        # 3. Kişiye Özel Bilgileri Çek (Eğer user_id gelmişse)
        siparis_notu = ""
        if soru.user_id:
            cursor.execute("""
                SELECT s.siparis_kodu, u.ad as urun_adi, s.durum, s.siparis_tarihi
                FROM siparisler s
                JOIN urunler u ON s.urun_id = u.id
                WHERE s.musteri_id = ?
            """, (soru.user_id,))
            gecmis = [dict(row) for row in cursor.fetchall()]

            if gecmis:
                siparis_notu = f"\nBu müşterinin geçmiş siparişleri: {gecmis}"
            else:
                siparis_notu = "\nBu müşterinin henüz bir siparişi bulunmuyor."

        conn.close()


        prompt = (
            f"Sen nazik bir BotanikOps Mağaza asistanısın. Mağaza envanteri: {envanter}\n"
            f"{siparis_notu}\n"
            f"Müşteri sorusu: {soru.mesaj}\n"
            "Müşteriyi tanıyorsan ismiyle hitap etme (veritabanında isim yoksa genel konuş), "
            "siparişi varsa durumunu belirt. Kısa, samimi ve veriye dayalı cevap ver."
        )

        response = client.models.generate_content(
            model="gemini-3.1-flash-lite",
            contents=prompt
        )

        return {"cevap": response.text}

    except Exception as e:
        print(f"!!! KRİTİK HATA: {str(e)}")
        return {
            "cevap": "Sana yardımcı olmayı çok istiyorum ama şu an sistemlerimde küçük bir budama yapılıyor. Birazdan tekrar sorar mısın? 🌿"}


if __name__ == "__main__":
    # 0.0.0.0 kullanımı diğer cihazların sana bağlanmasını sağlar
    uvicorn.run(app, host="0.0.0.0", port=8000)