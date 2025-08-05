export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const auth = req.headers.authorization;
  if (auth !== `Bearer admin`) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const { html } = await req.json?.() || req.body;

  if (!html) {
    return res.status(400).json({ error: 'Missing HTML content' });
  }

  const response = await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/set/encyclopedia`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ value: html })
  });

  const result = await response.json();
  res.status(200).json(result);
}
