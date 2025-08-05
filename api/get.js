export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const response = await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/get/encyclopedia`, {
    headers: {
      Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
    },
  });

  const data = await response.json();

  res.status(200).json({ html: data.result || "" });
}
