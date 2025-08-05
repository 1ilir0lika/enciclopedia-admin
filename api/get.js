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

    const { result } = await response.json(); // Upstash risponde con: { result: "..." }

    if (!result) {
      console.warn("Redis is empty");
      return res.status(404).send('No content');
    }

    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(result);

  } catch (error) {
    console.error("GET ERROR:", error);
    return res.status(500).send('Internal Server Error');
  }
}
