import { z } from "zod";
import { pool, query } from "../db/mysql.js";

const crearCitaSchema = z.object({
  cliente: z
    .object({
      nombres: z.string().max(100).nullable().optional(),
      apellidos: z.string().max(100).nullable().optional(),
      correo_electronico: z.string().email().nullable().optional(),
      telefono: z.string().max(30).nullable().optional(),
    })
    .optional(),
  cliente_id: z.number().int().positive().nullable().optional(),
  barbero_id: z.number().int().positive(),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  hora: z.string().regex(/^\d{2}:\d{2}$/),
  duracion_minutos: z.number().int().positive(),
  servicios: z.array(z.number().int().positive()).min(1),
  notas: z.string().nullable().optional(),
});

function overlapSql() {
  return `
    SELECT COUNT(1) AS n
    FROM citas
    WHERE barbero_id=? AND fecha=? AND estado IN ('pendiente','confirmada')
      AND TIME(?) < ADDTIME(hora, SEC_TO_TIME(duracion_minutos*60))
      AND hora < ADDTIME(TIME(?), SEC_TO_TIME(?*60))
  `;
}

export async function serviciosActivos(req, res) {
  const qtxt = req.query.q ? `%${req.query.q}%` : null;
  const vals = [];
  let where = "WHERE s.esta_activo=1";
  if (qtxt) {
    where += " AND (s.nombre LIKE ? OR s.descripcion LIKE ?)";
    vals.push(qtxt, qtxt);
  }
  const [rows] = await pool.query(
    `SELECT s.id,s.nombre,s.duracion_minutos,s.precio FROM servicios s ${where} ORDER BY s.nombre LIMIT 100`,
    vals
  );
  res.json({ data: rows });
}

export async function barberosDisponibles(req, res) {
  const fecha = req.query.fecha;
  const hora = req.query.hora;
  const dur = parseInt(req.query.duracion || "0", 10);
  if (!fecha || !hora || !dur) return res.json({ data: [] });
  const [rows] = await pool.query(
    `SELECT u.id,COALESCE(NULLIF(CONCAT(IFNULL(u.nombres,''),' ',IFNULL(u.apellidos,'')),' '),u.correo_electronico) AS nombre
     FROM usuarios u
     WHERE u.esta_activo=1 AND EXISTS(
       SELECT 1 FROM usuario_rol ur JOIN roles r ON r.id=ur.rol_id AND r.nombre='Barbero' AND r.esta_activo=1
       WHERE ur.usuario_id=u.id AND ur.esta_activo=1
     )
     ORDER BY nombre`
  );
  const out = [];
  for (const b of rows) {
    const [[{ n }]] = await pool.query(overlapSql(), [
      b.id,
      fecha,
      hora,
      hora,
      dur,
    ]);
    if (Number(n) === 0) out.push(b);
  }
  res.json({ data: out });
}

export async function crearCita(req, res) {
  const p = crearCitaSchema.safeParse(req.body || {});
  if (!p.success) return res.status(422).json({ mensaje: "Datos inválidos" });
  const d = p.data;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    let clienteId = d.cliente_id ?? null;
    if (!clienteId && d.cliente) {
      const [ins] = await conn.execute(
        `INSERT INTO clientes (nombres,apellidos,correo_electronico,telefono,esta_activo,creado_por,actualizado_por)
         VALUES (?,?,?,?,?,?,?)`,
        [
          d.cliente.nombres ?? null,
          d.cliente.apellidos ?? null,
          d.cliente.correo_electronico ?? null,
          d.cliente.telefono ?? null,
          1,
          null,
          null,
        ]
      );
      clienteId = ins.insertId;
    }
    const [[{ n }]] = await conn.query(overlapSql(), [
      d.barbero_id,
      d.fecha,
      d.hora,
      d.hora,
      d.duracion_minutos,
    ]);
    if (Number(n) > 0) {
      await conn.rollback();
      conn.release();
      return res.status(409).json({ mensaje: "Horario no disponible" });
    }
    const [insCita] = await conn.execute(
      `INSERT INTO citas (cliente_id,barbero_id,fecha,hora,duracion_minutos,estado,notas,creado_por,actualizado_por)
       VALUES (?,?,?,?,?,'pendiente',?,?,?)`,
      [
        clienteId,
        d.barbero_id,
        d.fecha,
        d.hora,
        d.duracion_minutos,
        d.notas ?? null,
        req.usuario?.sub || null,
        req.usuario?.sub || null,
      ]
    );
    const citaId = insCita.insertId;
    for (const sid of d.servicios) {
      await conn.execute(
        `INSERT INTO cita_servicio (cita_id,servicio_id,precio_aplicado,esta_activo,creado_por,actualizado_por)
         VALUES (?,?,?,?,?,?)`,
        [
          citaId,
          sid,
          null,
          1,
          req.usuario?.sub || null,
          req.usuario?.sub || null,
        ]
      );
    }
    await conn.commit();
    conn.release();
    res.status(201).json({ data: { id: citaId } });
  } catch (e) {
    try {
      await conn.rollback();
      conn.release();
    } catch {}
    res.status(400).json({ mensaje: e.message || "Error" });
  }
}

export async function citasSemana(req, res) {
  const start = req.query.start;
  const end = req.query.end;
  if (!start || !end)
    return res.status(422).json({ mensaje: "Datos inválidos" });
  const [rows] = await pool.query(
    `SELECT c.id,c.fecha,c.hora,c.duracion_minutos,c.estado,c.notas,
            c.barbero_id,
            COALESCE(NULLIF(CONCAT(IFNULL(u.nombres,''),' ',IFNULL(u.apellidos,'')),' '),u.correo_electronico) AS barbero_nombre,
            c.cliente_id,
            COALESCE(NULLIF(CONCAT(IFNULL(cl.nombres,''),' ',IFNULL(cl.apellidos,'')),' '),cl.correo_electronico) AS cliente_nombre
     FROM citas c
     JOIN usuarios u ON u.id=c.barbero_id
     LEFT JOIN clientes cl ON cl.id=c.cliente_id
     WHERE c.fecha>=? AND c.fecha<? 
     ORDER BY c.fecha,c.hora`,
    [start, end]
  );
  res.json({ data: rows });
}

export async function actualizarEstadoCita(req, res) {
  const id = Number(req.params.id);
  const estado = String(req.body?.estado || "");
  const permit = [
    "pendiente",
    "confirmada",
    "cancelada",
    "no_asistio",
    "completada",
  ];
  if (!permit.includes(estado))
    return res.status(422).json({ mensaje: "Datos inválidos" });
  await pool.execute(
    "UPDATE citas SET estado=?, actualizado_por=? WHERE id=?",
    [estado, req.usuario?.sub || null, id]
  );
  res.json({ mensaje: "Actualizado" });
}

export async function eliminarCita(req, res) {
  const id = Number(req.params.id);
  await pool.execute("DELETE FROM citas WHERE id=?", [id]);
  res.json({ mensaje: "Eliminado" });
}

export async function misCitas(req, res) {
  const correo = req.query.correo || null;
  const telefono = req.query.telefono || null;
  if (!correo && !telefono) return res.json({ data: [] });
  const [rows] = await pool.query(
    `SELECT
       c.id,c.fecha,c.hora,c.duracion_minutos,c.estado,c.notas,
       c.barbero_id,
       COALESCE(NULLIF(CONCAT(IFNULL(u.nombres,''),' ',IFNULL(u.apellidos,'')),' '),u.correo_electronico) AS barbero_nombre
     FROM citas c
     JOIN clientes cl ON cl.id=c.cliente_id
     JOIN usuarios u ON u.id=c.barbero_id
     WHERE (cl.correo_electronico=? OR cl.telefono=?) AND cl.esta_activo=1
     ORDER BY c.fecha DESC,c.hora DESC
     LIMIT 100`,
    [correo, telefono]
  );
  res.json({ data: rows });
}
