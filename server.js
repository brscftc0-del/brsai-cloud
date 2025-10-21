// server.js
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

const app = express();
app.use(cors({
  origin: [
    "https://<netlify-site-adresin>.netlify.app",
    "https://<senin-domainin>",
    "http://localhost:5500"
  ],
  methods: ["POST","OPTIONS"],
  allowedHeaders: ["Content-Type"]
}));
app.use(bodyParser.json({ limit: "2mb" }));

function analyze(msg){
  const t = msg.toLowerCase();
  return {
    isCode: /kod|code|html|js|python|hata/.test(t),
    isChitChat: /merhaba|selam|nasılsın|kanka|😂|🙂/.test(t),
    isCalc: /hesapla|kaç|topla|çarp|böl|%/.test(t),
    isInfo: /nedir|nasıl|neden|özet|farkı|örnek/.test(t),
    length: msg.length
  };
}

async function modelPhi3(msg){   return `【Phi-3】Kısa ve mantıklı yanıt: ${msg.slice(0,140)}`; }
async function modelTinyLlama(msg){ return `【TinyLlama】Özet: ${msg.slice(0,120)}`; }
async function modelBuddhi(msg){ return `【Buddhi】Kanka bence bunu böyle yapalım: ${msg.slice(0,100)} 😄`; }
async function modelOrion(msg){  return `【Orion】Eksikleri kapattım, sonuç tutarlı.`; }
async function modelMistralMerge(parts){
  return `【Binyalay (Mistral)】Birleşik yanıt:\n- ` + parts.join("\n- ");
}

async function routerReply(userMsg){
  const a = analyze(userMsg);
  const picks = [];
  if(a.isCode || a.isInfo) picks.push(modelPhi3);
  if(a.isChitChat)         picks.push(modelBuddhi);
  if(a.isCalc || a.length>160) picks.push(modelOrion);
  if(picks.length===0)     picks.push(modelTinyLlama);
  const partials = await Promise.all(picks.map(fn => fn(userMsg)));
  const merged = await modelMistralMerge(partials);
  return merged;
}

app.post("/api/chat", async (req, res) => {
  try{
    const userMsg = (req.body?.message || "").toString();
    if(!userMsg) return res.status(400).json({ error:"message alanı boş" });
    const reply = await routerReply(userMsg);
    res.json({ reply });
  }catch(err){
    console.error(err);
    res.status(500).json({ error:"server error", detail: String(err) });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🧠 BRSAI Cloud aktif: ${PORT}`));
