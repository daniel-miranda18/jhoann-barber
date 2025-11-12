import { pool } from "../db/mysql.js";

export async function obtenerInformacionContacto(req, res) {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM informacion_contacto LIMIT 1"
    );
    if (rows.length === 0)
      return res.status(404).json({ mensaje: "No encontrado" });
    return res.json({ data: rows[0] });
  } catch (e) {
    return res.status(500).json({ mensaje: e.message });
  }
}
