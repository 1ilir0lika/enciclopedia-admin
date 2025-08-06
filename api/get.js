export default async function handler(req, res) {
  const response = await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/get/encyclopedia`, {
    headers: {
      Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
    },
  });

  const data = await response.json();
  // 🔽 restituisci direttamente il valore HTML
  res.status(200).json({ html: data.result || "" });
}
