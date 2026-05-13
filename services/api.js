const BASE_URL = "https://botanikops-ai.onrender.com";

export async function getProducts() {
  const response = await fetch(`${BASE_URL}/urunler`);

  if (!response.ok) {
    throw new Error("Ürünler alınamadı");
  }

  return response.json();
}

export async function getOrders() {
  const response = await fetch(`${BASE_URL}/siparisler`);

  if (!response.ok) {
    throw new Error("Siparişler alınamadı");
  }

  return response.json();
}

export async function getOrderByCode(orderCode) {
  const response = await fetch(`${BASE_URL}/siparis/${orderCode}`);

  if (!response.ok) {
    throw new Error("Sipariş alınamadı");
  }

  return response.json();
}

export async function sendChatMessage(message, mode = "customer") {
  const response = await fetch(`${BASE_URL}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message,
      mode,
    }),
  });

  if (!response.ok) {
    throw new Error("Chat cevabı alınamadı");
  }

  return response.json();
}

export async function getMessages() {
  const response = await fetch(`${BASE_URL}/mesajlar`);

  if (!response.ok) {
    throw new Error("Mesajlar alınamadı");
  }

  return response.json();
}
