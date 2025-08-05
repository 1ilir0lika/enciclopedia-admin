export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const response = await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/get/encyclopedia`, {
    headers: {
      Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
    },
  });

  const text = await response.text();

  let html = "";
  try {
    const data = JSON.parse(text);
    html = data.result || "";
  } catch {
    html = text;
  }

  res.status(200).json({ html });
}
