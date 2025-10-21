// api/chat.js  — Vercel Serverless Function
export default async function handler(req, res) {
  // Basit CORS (UI başka domainden gelecek)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    if (req.method !== "POST") return res.status(405).json({ error: "Only POST" });

    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const userMsg = (body.message || "").toString();
    if (!userMsg) return res.status(400).json({ error: "message alanı boş" });

    // ---- Router benzeri basit analiz
    const t = userMsg.toLowerCase();
    const a = {
      isCode: /kod|code|html|js|python|hata/.test(t),
      isChitChat: /merhaba|selam|nasılsın|kanka|😂|🙂/.test(t),
      isCalc: /hesapla|kaç|topla|çarp|böl|%/.test(t),
      isInfo: /nedir|nasıl|neden|özet|farkı|örnek/.test(t),
      length: userMsg.length
    };

    // ---- Yerine GERÇEK modelleri bağlayacağın placeholder cevaplar
    const phi3       = `【Phi-3】Kısa ve mantıklı yanıt: ${userMsg.slice(0,140)}`;
    const tinyllama  = `【TinyLlama】Özet: ${userMsg.slice(0,120)}`;
    const buddhi     = `【Buddhi】Kanka bence bunu böyle yapalım: ${userMsg.slice(0,100)} 😄`;
    const orion      = `【Orion】Eksikleri kapattım, sonuç tutarlı.`;

    const picks = [];
    if (a.isCode || a.isInfo) picks.push(phi3);
    if (a.isChitChat)         picks.push(buddhi);
    if (a.isCalc || a.length>160) picks.push(orion);
    if (picks.length===0)     picks.push(tinyllama);

    const merged = "【Binyalay】Birleşik yanıt:\n- " + picks.join("\n- ");
    return res.status(200).json({ reply: merged });
  } catch (err) {
    return res.status(500).json({ error: "server error", detail: String(err) });
  }
}
