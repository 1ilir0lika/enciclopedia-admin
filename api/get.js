export default async function handler(req, res) {
  const response = await fetch('https://<your-upstash-url>/get/encyclopedia', {
    headers: {
      Authorization: 'Bearer <your-upstash-token>',
    },
  });

  const data = await response.json();
  res.status(200).json({ html: data.result || "" });
}
