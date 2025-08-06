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

    const data = await response.json(); // Upstash risponde con { result: "stringa salvata" }

    const html = data?.result || "";

    res.setHeader("Content-Type", "application/json"); // oppure text/html, vedi nota sotto
    res.status(200).json({ html }); // JSON corretto per il client
  } catch (error) {
    console.error("❌ Errore nel GET handler:", error);
    res.status(500).json({ error: "Errore nel recupero dei dati" });
  }
}
