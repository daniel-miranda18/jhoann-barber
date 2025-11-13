import { pool } from "../db/mysql.js";

export async function getContacto(req, res) {
  try {
    const [[row]] = await pool.query(
      "SELECT * FROM informacion_contacto ORDER BY id LIMIT 1"
    );
    return res.json({ data: row || null });
  } catch (e) {
    return res.status(500).json({ mensaje: "Error al leer información" });
  }
}

export async function upsertContacto(req, res) {
  try {
    const body = req.body || {};
    const {
      telefono = "",
      direccion = "",
      facebook = null,
      instagram = null,
      tiktok = null,
      youtube = null,
      whatsapp = null,
      horarios_atencion = "",
      dias_atencion = "",
    } = body;

    if (!telefono || !direccion || !horarios_atencion || !dias_atencion) {
      return res.status(400).json({ mensaje: "Faltan campos requeridos" });
    }

    const [[existing]] = await pool.query(
      "SELECT id FROM informacion_contacto ORDER BY id LIMIT 1"
    );
    if (!existing) {
      const [r] = await pool.execute(
        `INSERT INTO informacion_contacto
          (telefono,direccion,facebook,instagram,tiktok,youtube,whatsapp,horarios_atencion,dias_atencion)
         VALUES (?,?,?,?,?,?,?,?,?)`,
        [
          telefono,
          direccion,
          facebook,
          instagram,
          tiktok,
          youtube,
          whatsapp,
          horarios_atencion,
          dias_atencion,
        ]
      );
      const [[newRow]] = await pool.query(
        "SELECT * FROM informacion_contacto WHERE id = ?",
        [r.insertId]
      );
      return res.json({ data: newRow });
    } else {
      await pool.execute(
        `UPDATE informacion_contacto SET
           telefono=?, direccion=?, facebook=?, instagram=?, tiktok=?, youtube=?, whatsapp=?, horarios_atencion=?, dias_atencion=?, actualizado_en=NOW()
         WHERE id=?`,
        [
          telefono,
          direccion,
          facebook,
          instagram,
          tiktok,
          youtube,
          whatsapp,
          horarios_atencion,
          dias_atencion,
          existing.id,
        ]
      );
      const [[row]] = await pool.query(
        "SELECT * FROM informacion_contacto WHERE id = ?",
        [existing.id]
      );
      return res.json({ data: row });
    }
  } catch (e) {
    return res.status(500).json({ mensaje: "Error al guardar información" });
  }
}
