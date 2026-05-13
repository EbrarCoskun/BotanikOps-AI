# BotanikOps-AI
<div align="center">
  <img src="https://media.giphy.com/media/dWesBcTLavkZuG35MI/giphy.gif" width="600" height="300"/>
</div>
# 🌿 BotanikOps AI Backend

Bu proje, bir botanik mağazasının operasyonel süreçlerini yöneten ve **Gemini 3.1 Flash-Lite** yapay zeka modelini kullanan akıllı bir backend sistemidir.

## 🚀 Özellikler
- **Akıllı Müşteri Desteği (/chat):** Müşterilerin stok sormasını, ürün tavsiyesi almasını ve sipariş durumlarını sorgulamasını sağlar.
- **Yönetici Operasyon Analizi (/analiz):** Kritik stokları belirler, geciken siparişleri raporlar ve işletme sahibi için stratejik öneriler üretir.
- **Dinamik Veritabanı:** SQLite altyapısı ile güncel stok ve sipariş verilerini anlık olarak işler.
- **Hızlı Yanıt:** Gemini Flash-Lite modeli sayesinde yüksek performans sunar.

## 🛠️ Kurulum

1. **Kütüphaneleri Yükleyin:**

    ```bash
     pip install -r requirements.txt
    
2. **Sunucuyu Başlatın**
     ```bash
    python agent_brain.py
Sunucu varsayılan olarak http://127.0.0.1:8000 adresinde çalışacaktır.

## 🔌 API Endpoints
POST /chat: Yapay zeka ile sohbet ve stok sorgulama.

GET /analiz: Operasyonel rapor ve strateji analizi.     
