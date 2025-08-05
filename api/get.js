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
  let html = data.result || "";

  // Funzione che prova a fare unwrap di stringhe JSON annidate
  function tryUnwrap(value) {
    if (typeof value !== 'string') return value;
    try {
      const parsed = JSON.parse(value);
      // Se parsed è ancora stringa, continua a unwrap
      return tryUnwrap(parsed);
    } catch {
      // Se non si può parsare, restituisci il valore così com’è
      return value;
    }
  }

  html = tryUnwrap(html);

  res.status(200).json({ html });
}
