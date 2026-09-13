// GET  /api/user?id=rec... -> registro completo de un jugador
// POST /api/user            -> crea un jugador nuevo   body: { fields: {...} }
// PATCH /api/user?id=rec... -> actualiza un jugador     body: { fields: {...} }
module.exports = async (req, res) => {
  const token = process.env.AIRTABLE_TOKEN;
  const base = process.env.AIRTABLE_BASE_ID;
  const table = 'Usuarios';

  if (!token || !base) {
    res.status(500).json({ error: 'Faltan las variables de entorno de Airtable' });
    return;
  }

  const apiUrl = `https://api.airtable.com/v0/${base}/${encodeURIComponent(table)}`;
  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  try {
    if (req.method === 'GET') {
      const id = req.query.id;
      if (!id) {
        res.status(400).json({ error: 'Falta el id' });
        return;
      }
      const r = await fetch(`${apiUrl}/${id}`, { headers });
      const data = await r.json();
      if (!r.ok) {
        res.status(r.status).json({ error: data.error || data });
        return;
      }
      res.status(200).json({ id: data.id, fields: data.fields });
      return;
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const r = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({ fields: body.fields }),
      });
      const data = await r.json();
      if (!r.ok) {
        res.status(r.status).json({ error: data.error || data });
        return;
      }
      res.status(200).json({ id: data.id, fields: data.fields });
      return;
    }

    if (req.method === 'PATCH' || req.method === 'PUT') {
      const id = req.query.id;
      if (!id) {
        res.status(400).json({ error: 'Falta el id' });
        return;
      }
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const r = await fetch(`${apiUrl}/${id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ fields: body.fields }),
      });
      const data = await r.json();
      if (!r.ok) {
        res.status(r.status).json({ error: data.error || data });
        return;
      }
      res.status(200).json({ id: data.id, fields: data.fields });
      return;
    }

    res.status(405).json({ error: 'Método no permitido' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
