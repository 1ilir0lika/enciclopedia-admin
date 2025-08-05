export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const response = await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/get/encyclopedia`, {
      headers: {
        Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
      },
    });

    const raw = await response.text();

    // Per debug — logga sempre la risposta grezza
    console.log("RAW RESPONSE FROM UPSTASH:", raw);

    let html = "";

    try {
      const parsed = JSON.parse(raw);
      html = parsed.result || "";
    } catch (err) {
      console.warn("JSON parse failed, falling back to raw text");
      html = raw;
    }

    if (!html) {
      console.warn("No content found in Redis");
      return res.status(404).send("No content saved.");
    }

    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(html);

  } catch (error) {
    console.error("Unexpected error:", error);
    res.status(500).send("Server error");
  }
}
