from fastapi import FastAPI
import sqlite3
import os
from dotenv import load_dotenv
import google.generativeai as genai
from pydantic import BaseModel
from typing import Optional


load_dotenv()

app = FastAPI()

DB_NAME = "botanik_asistan_ai.db"

api_key = os.getenv("GEMINI_API_KEY")

if api_key:
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel("gemini-2.0-flash")
else:
    print("UYARI: GEMINI_API_KEY bulunamadı. Gemini devre dışı.")
    model = None


class ChatRequest(BaseModel):
    message: str
    mode: str = "customer"
    channel: str = "mobile"
    telegram_id: Optional[str] = None
    conversation_id: Optional[str] = None


def get_connection():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    return conn


def normalize_text(text):
    if not text:
        return ""

    tr_map = str.maketrans({
        "ı": "i",
        "İ": "i",
        "ğ": "g",
        "Ğ": "g",
        "ü": "u",
        "Ü": "u",
        "ş": "s",
        "Ş": "s",
        "ö": "o",
        "Ö": "o",
        "ç": "c",
        "Ç": "c",
    })

    return text.lower().translate(tr_map)


def find_product_in_message(user_message, products):
    message_norm = normalize_text(user_message)

    best_match = None
    best_score = 0

    for product in products:
        product_name = product["ad"]
        product_norm = normalize_text(product_name)

        product_words = [
            word
            for word in product_norm.replace("(", " ").replace(")", " ").split()
            if len(word) >= 3
        ]

        score = 0

        if product_norm in message_norm:
            score += 100

        for word in product_words:
            if word in message_norm:
                score += 20

        if score > best_score:
            best_score = score
            best_match = product

    if best_score >= 20:
        return best_match

    return None


def save_message(
    user_message,
    ai_reply,
    source,
    channel="mobile",
    telegram_id=None,
    conversation_id=None
):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO mesajlar (
            kullanici_mesaji,
            ai_cevabi,
            kaynak,
            kanal,
            telegram_id,
            conversation_id
        )
        VALUES (?, ?, ?, ?, ?, ?)
    """, (
        user_message,
        ai_reply,
        source,
        channel,
        telegram_id,
        conversation_id
    ))

    conn.commit()
    conn.close()


def get_all_products():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT *
        FROM urunler
        ORDER BY id DESC
    """)

    products = [dict(row) for row in cursor.fetchall()]
    conn.close()

    return products


def get_all_orders():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT 
            s.id,
            s.siparis_kodu,
            m.ad AS musteri_adi,
            m.telefon,
            m.email,
            m.telegram_id,
            u.ad AS urun_adi,
            u.kategori,
            s.adet,
            s.durum,
            s.siparis_tarihi,
            s.tahmini_teslimat,
            s.kargo_takip_no,
            s.kargo_firmasi,
            s.delay_flag
        FROM siparisler s
        JOIN musteriler m ON s.musteri_id = m.id
        JOIN urunler u ON s.urun_id = u.id
        ORDER BY s.id DESC
    """)

    orders = [dict(row) for row in cursor.fetchall()]
    conn.close()

    return orders


def fallback_reply(user_message, orders, products):
    user_lower = normalize_text(user_message)

    for order in orders:
        if normalize_text(order["siparis_kodu"]) in user_lower:
            delay_text = (
                "\n⚠️ Siparişinizde gecikme riski tespit edilmiş."
                if order["delay_flag"] == 1 or order["durum"] == "Gecikmiş"
                else ""
            )

            return (
                f"Merhaba, siparişinizi kontrol ettim.\n\n"
                f"{order['siparis_kodu']} numaralı siparişinizin güncel durumu: {order['durum']}.\n"
                f"Ürün: {order['urun_adi']}\n"
                f"Adet: {order['adet']}\n"
                f"Tahmini teslimat: {order['tahmini_teslimat']}\n"
                f"Kargo firması: {order['kargo_firmasi'] or 'Henüz atanmadı'}\n"
                f"Kargo takip no: {order['kargo_takip_no'] or 'Henüz oluşmadı'}"
                f"{delay_text}\n\n"
                f"Başka bir konuda da memnuniyetle yardımcı olurum."
            )

    matched_product = find_product_in_message(user_message, products)

    if matched_product:
        stock_text = (
            "kritik stok seviyesinde ⚠️"
            if matched_product["stok_miktari"] <= matched_product["kritik_esik"]
            else "stokta mevcut ✅"
        )

        return (
            f"Merhaba, {matched_product['ad']} ürünümüzü kontrol ettim 🌿\n\n"
            f"Şu anda ürün {stock_text}.\n"
            f"Stok miktarı: {matched_product['stok_miktari']} adet\n"
            f"Fiyat: {matched_product['birim_fiyat']} TL\n\n"
            f"Kısa bakım/ürün notu: {matched_product['bakim_notu']}\n\n"
            f"Dilerseniz sipariş süreciyle ilgili de yardımcı olabilirim."
        )

    if "bakimi kolay" in user_lower or "kolay bitki" in user_lower:
        easy_products = [
            p for p in products
            if "az su" in normalize_text(p["bakim_notu"] or "")
            or "fazla suyu sevmez" in normalize_text(p["bakim_notu"] or "")
            or "kolay" in normalize_text(p["bakim_notu"] or "")
        ]

        if easy_products:
            names = ", ".join([p["ad"] for p in easy_products[:5]])
            return (
                f"Memnuniyetle. Bakımı daha kolay ürünler olarak şunları önerebilirim: {names}.\n\n"
                f"Bu ürünler daha az bakım veya sulama ihtiyacıyla öne çıkıyor. "
                f"İsterseniz kullanım alanınıza göre daha net bir öneri de yapabilirim."
            )

    return (
        "Merhaba, memnuniyetle yardımcı olurum.\n\n"
        "Siparişinizi kontrol etmem için sipariş kodunuzu, ürün bilgisi için ise ürün adını yazabilirsiniz.\n"
        "Örnek: “BST-1541 siparişim nerede?” veya “Orkide stokta var mı?”"
    )


def admin_fallback_reply(user_message, orders, products):
    user_lower = normalize_text(user_message)

    delayed_orders = [
        o for o in orders
        if o["delay_flag"] == 1 or o["durum"] == "Gecikmiş"
    ]

    critical_products = [
        p for p in products
        if p["stok_miktari"] <= p["kritik_esik"]
    ]

    if "geciken" in user_lower or "gecikmis" in user_lower:
        if not delayed_orders:
            return "Şu anda geciken sipariş bulunmuyor."

        lines = [
            f"• {o['siparis_kodu']} - {o['musteri_adi']} - {o['urun_adi']} - {o['tahmini_teslimat']}"
            for o in delayed_orders[:15]
        ]

        return (
            f"Toplam {len(delayed_orders)} geciken/riskli sipariş tespit edildi:\n\n"
            + "\n".join(lines)
            + "\n\nÖneri: Bu müşterilere otomatik bilgilendirme mesajı gönderilebilir."
        )

    if "kritik" in user_lower or "stok" in user_lower:
        if not critical_products:
            return "Şu anda kritik stok seviyesinde ürün bulunmuyor."

        lines = [
            f"• {p['ad']} - Stok: {p['stok_miktari']} - Kritik eşik: {p['kritik_esik']}"
            for p in critical_products[:15]
        ]

        return (
            f"Toplam {len(critical_products)} kritik stok ürünü bulundu:\n\n"
            + "\n".join(lines)
            + "\n\nÖneri: Tedarik süreci başlatılmalı."
        )

    if "ozet" in user_lower or "analiz" in user_lower or "durum" in user_lower:
        shipping_count = len([o for o in orders if o["durum"] == "Kargoda"])
        delivered_count = len([o for o in orders if o["durum"] == "Teslim Edildi"])
        cancelled_count = len([o for o in orders if o["durum"] == "İptal Edildi"])

        return (
            "📊 Güncel operasyon özeti:\n\n"
            f"• Toplam sipariş: {len(orders)}\n"
            f"• Kargoda: {shipping_count}\n"
            f"• Teslim edilen: {delivered_count}\n"
            f"• İptal edilen: {cancelled_count}\n"
            f"• Geciken/riskli sipariş: {len(delayed_orders)}\n"
            f"• Kritik stok ürünü: {len(critical_products)}\n\n"
            "Öneri: Öncelik geciken siparişler ve kritik stok ürünlerine verilmeli."
        )

    return (
        "Admin operasyon panelindesiniz.\n\n"
        "Şunları sorabilirsiniz:\n"
        "• Geciken siparişleri özetle\n"
        "• Kritik stokta olan ürünler neler?\n"
        "• Güncel operasyon özeti çıkar"
    )


@app.get("/")
def root():
    return {"message": "BotanikOps AI API çalışıyor 🌱"}


@app.get("/urunler")
def get_products():
    return get_all_products()


@app.get("/siparisler")
def get_orders():
    return get_all_orders()


@app.get("/bildirimler")
def get_notifications():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT *
        FROM seller_notifications
        ORDER BY tarih DESC
    """)

    notifications = [dict(row) for row in cursor.fetchall()]
    conn.close()

    return notifications


@app.get("/siparis/{siparis_kodu}")
def get_order_by_code(siparis_kodu: str):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT 
            s.siparis_kodu,
            m.ad AS musteri_adi,
            m.telefon,
            m.email,
            m.telegram_id,
            u.ad AS urun_adi,
            u.kategori,
            s.adet,
            s.durum,
            s.siparis_tarihi,
            s.tahmini_teslimat,
            s.kargo_takip_no,
            s.kargo_firmasi,
            s.delay_flag
        FROM siparisler s
        JOIN musteriler m ON s.musteri_id = m.id
        JOIN urunler u ON s.urun_id = u.id
        WHERE s.siparis_kodu = ?
    """, (siparis_kodu,))

    order = cursor.fetchone()
    conn.close()

    if order:
        return dict(order)

    return {"error": "Sipariş bulunamadı"}


@app.get("/mesajlar")
def get_messages():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT *
        FROM mesajlar
        ORDER BY tarih DESC
    """)

    messages = [dict(row) for row in cursor.fetchall()]
    conn.close()

    return messages


@app.post("/chat")
def chat_with_ai(request: ChatRequest):
    user_message = request.message
    mode = request.mode
    channel = request.channel
    telegram_id = request.telegram_id
    conversation_id = request.conversation_id

    orders = get_all_orders()
    products = get_all_products()

    if mode == "admin":
        prompt = f"""
Sen BotanikOps AI adlı yönetici operasyon asistanısın.

Görevin:
- İşletme sahibine sipariş, stok ve müşteri iletişimi hakkında analiz sunmak.
- Müşteri gibi cevap verme.
- Geciken/riskli siparişleri delay_flag ve durum alanına göre tespit et.
- Kritik stokları stok_miktari <= kritik_esik mantığıyla tespit et.
- Yöneticiye kısa ve uygulanabilir aksiyon önerileri ver.
- Sadece verilen verileri kullan.

Sipariş verileri:
{orders[:80]}

Ürün verileri:
{products[:80]}

Yönetici mesajı:
{user_message}
"""
    else:
        prompt = f"""
Sen BotanikOps AI adlı işletme müşteri temsilcisisin.

Konuşma tarzın:
- Bir işletme sahibi ya da deneyimli müşteri temsilcisi gibi konuş.
- Samimi ama resmi ol.
- Gereksiz robotik ifadeler kullanma.
- Müşteriye güven ver.
- Kısa, net ve doğal Türkçe cevap ver.
- Uygunsa “Merhaba”, “Memnuniyetle”, “Kontrol ettim” gibi doğal ifadeler kullan.
- Cevapların sanki gerçek bir işletme sahibi müşteriye yazıyormuş gibi olsun.
- Gerektiğinde müşteriye “başka bir konuda yardımcı olabilirim” gibi güven veren kapanış cümlesi ekle.
- Asla veri uydurma.
- Sadece verilen sipariş ve ürün verilerine göre cevap ver.

Sipariş verileri:
{orders[:80]}

Ürün verileri:
{products[:80]}

Müşteri mesajı:
{user_message}
"""

    if model:
        try:
            response = model.generate_content(prompt)
            reply_text = response.text if response and response.text else ""

            if reply_text:
                save_message(
                    user_message,
                    reply_text,
                    mode,
                    channel,
                    telegram_id,
                    conversation_id
                )
                return {"reply": reply_text, "source": "gemini"}

        except Exception as e:
            print("GEMINI ERROR:", e)

    if mode == "admin":
        reply_text = admin_fallback_reply(user_message, orders, products)
    else:
        reply_text = fallback_reply(user_message, orders, products)

    save_message(
        user_message,
        reply_text,
        mode,
        channel,
        telegram_id,
        conversation_id
    )

    return {"reply": reply_text, "source": "database"}