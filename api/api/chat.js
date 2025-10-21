export default function handler(req, res) {
  res.status(200).json({
    message: "Hello from BRSAI Cloud API 👋",
    status: "online",
    version: "1.0.0",
    info: "Bu API BRSAI 1.0 PRO için bulut bağlantısını sağlar."
  });
}

