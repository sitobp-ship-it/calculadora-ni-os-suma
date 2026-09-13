// GET /api/users -> lista resumida de jugadores (para la pantalla de selección)
module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Método no permitido' });
    return;
  }
  const token = process.env.AIRTABLE_TOKEN;
  const base = process.env.AIRTABLE_BASE_ID;
  const table = 'Usuarios';

  if (!token || !base) {
    res.status(500).json({ error: 'Faltan las variables de entorno de Airtable' });
    return;
  }

  try {
    let records = [];
    let offset;
    do {
      const url = `https://api.airtable.com/v0/${base}/${encodeURIComponent(table)}?pageSize=100${offset ? `&offset=${offset}` : ''}`;
      const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const data = await r.json();
      if (!r.ok) {
        res.status(r.status).json({ error: data.error || data });
        return;
      }
      records = records.concat(data.records);
      offset = data.offset;
    } while (offset);

    const users = records.map((rec) => ({
      id: rec.id,
      name: rec.fields.Nombre || '',
      avatar: rec.fields.Avatar || '🙂',
      coins: rec.fields.Monedas || 0,
      level: rec.fields.NivelGlobal || 0,
      medals: rec.fields.Medallas || 0,
    })).filter((u) => u.name);

    res.status(200).json({ users });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
