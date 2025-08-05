export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const auth = req.headers.authorization;
  if (auth !== `Bearer ${process.env.ADMIN_KEY}`) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const { html } = await req.json ? await req.json() : await req.body;

  const response = await fetch('https://<your-upstash-url>/set/encyclopedia', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer <your-upstash-token>',
      'Content-Type': 'application/json'
    },
    // ✅ Scrivi solo la stringa HTML, senza oggetti annidati
    body: JSON.stringify({ value: html })
  });

  const result = await response.json();
  res.status(200).json(result);
}
