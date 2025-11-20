import { query } from "../db/mysql.js";

export async function listarMensajes(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 20;
    const offset = (page - 1) * pageSize;

    const rows = await query(
      `SELECT * FROM mensajes_contacto
       ORDER BY creado_en DESC
       LIMIT ? OFFSET ?`,
      [pageSize, offset]
    );

    const totalRows = await query(
      "SELECT COUNT(*) AS total FROM mensajes_contacto"
    );

    const total = totalRows[0]?.total || 0;

    res.json({
      data: rows,
      meta: {
        page,
        pageSize,
        total,
      },
    });
  } catch (e) {
    res.status(500).json({ mensaje: e.message });
  }
}

export async function obtenerMensaje(req, res) {
  try {
    const rows = await query("SELECT * FROM mensajes_contacto WHERE id = ?", [
      req.params.id,
    ]);

    if (!rows.length) return res.status(404).json({ mensaje: "No encontrado" });

    res.json({ data: rows[0] });
  } catch (e) {
    res.status(500).json({ mensaje: e.message });
  }
}

export async function marcarLeido(req, res) {
  await query("UPDATE mensajes_contacto SET leido = 1 WHERE id = ?", [
    req.params.id,
  ]);
  res.json({ ok: true });
}

export async function eliminarMensaje(req, res) {
  await query("DELETE FROM mensajes_contacto WHERE id = ?", [req.params.id]);
  res.json({ ok: true });
}
