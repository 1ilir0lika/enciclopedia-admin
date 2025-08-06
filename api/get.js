export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).send('Method not allowed');
  }

  try {
    const response = await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/get/encyclopedia`, {
      headers: {
        Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
      },
    });

    const data = await response.json(); // { result: "<html string>" }

    const raw = data?.result || "";

    let html;
    try {
      // 👇 se il contenuto è ancora stringificato tipo {"value":"..."}
      const parsed = JSON.parse(raw);
      html = parsed.value || "";
    } catch (e) {
      // 👇 altrimenti, è già una stringa HTML pura
      html = raw;
    }

    res.setHeader("Content-Type", "application/json");
    res.status(200).json({ html });
  } catch (error) {
    console.error("❌ Errore nel GET handler:", error);
    res.status(500).json({ error: "Errore nel recupero dei dati" });
  }
}
