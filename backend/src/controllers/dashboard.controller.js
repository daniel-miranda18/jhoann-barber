import { pool } from "../db/mysql.js";

export async function resumenGeneral(req, res) {
  try {
    const [[{ ventasHoy = 0 }]] = await pool.query(
      `SELECT IFNULL(SUM(total), 0) ventasHoy FROM ventas 
       WHERE DATE(fecha_hora) = CURDATE() AND estado = 'pagada' AND esta_activo = 1`
    );

    const [[{ gastosHoy = 0 }]] = await pool.query(
      `SELECT IFNULL(SUM(monto), 0) gastosHoy FROM gastos 
       WHERE DATE(fecha) = CURDATE() AND esta_activo = 1`
    );

    const [[{ citasHoy = 0 }]] = await pool.query(
      `SELECT COUNT(1) citasHoy FROM citas 
       WHERE DATE(fecha) = CURDATE() AND estado IN ('pendiente', 'confirmada', 'completada')`
    );

    const [[{ clientesActivos = 0 }]] = await pool.query(
      `SELECT COUNT(1) clientesActivos FROM clientes WHERE esta_activo = 1`
    );

    res.json({
      data: {
        ventasHoy: Number(ventasHoy),
        gastosHoy: Number(gastosHoy),
        citasHoy: Number(citasHoy),
        clientesActivos: Number(clientesActivos),
      },
    });
  } catch (e) {
    res.status(400).json({ mensaje: e.message });
  }
}

export async function ventasUltimos7Dias(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT DATE(fecha_hora) fecha, SUM(total) total, COUNT(1) cantidad
       FROM ventas 
       WHERE fecha_hora >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) 
       AND estado = 'pagada' AND esta_activo = 1
       GROUP BY DATE(fecha_hora)
       ORDER BY fecha ASC`
    );

    const data = rows.map((r) => ({
      fecha: r.fecha,
      total: Number(r.total),
      cantidad: Number(r.cantidad),
    }));

    res.json({ data });
  } catch (e) {
    res.status(400).json({ mensaje: e.message });
  }
}

export async function gastosUltimos7Dias(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT DATE(fecha) fecha, SUM(monto) total, COUNT(1) cantidad
       FROM gastos 
       WHERE fecha >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) AND esta_activo = 1
       GROUP BY DATE(fecha)
       ORDER BY fecha ASC`
    );

    const data = rows.map((r) => ({
      fecha: r.fecha,
      total: Number(r.total),
      cantidad: Number(r.cantidad),
    }));

    res.json({ data });
  } catch (e) {
    res.status(400).json({ mensaje: e.message });
  }
}

export async function ventasPorBarbero(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT 
         u.id, 
         COALESCE(CONCAT(IFNULL(u.nombres,''), ' ', IFNULL(u.apellidos,'')), u.correo_electronico) nombre,
         SUM(vs.subtotal) total,
         COUNT(DISTINCT vs.venta_id) cantidad
       FROM venta_servicios vs
       JOIN usuarios u ON u.id = vs.barbero_id
       JOIN ventas v ON v.id = vs.venta_id AND v.estado = 'pagada'
       WHERE DATE(v.fecha_hora) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
       GROUP BY u.id, nombre
       ORDER BY total DESC
       LIMIT 10`
    );

    const data = rows.map((r) => ({
      barbero: r.nombre,
      total: Number(r.total),
      cantidad: Number(r.cantidad),
    }));

    res.json({ data });
  } catch (e) {
    res.status(400).json({ mensaje: e.message });
  }
}

export async function citasPorEstado(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT estado, COUNT(1) cantidad
       FROM citas
       WHERE DATE(fecha) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
       GROUP BY estado`
    );

    const data = rows.map((r) => ({
      estado: r.estado,
      cantidad: Number(r.cantidad),
    }));

    res.json({ data });
  } catch (e) {
    res.status(400).json({ mensaje: e.message });
  }
}

export async function productosMasVendidos(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT 
         p.id,
         p.nombre,
         SUM(vp.cantidad) cantidad,
         SUM(vp.subtotal) total
       FROM venta_productos vp
       JOIN productos p ON p.id = vp.producto_id
       JOIN ventas v ON v.id = vp.venta_id AND v.estado = 'pagada'
       WHERE DATE(v.fecha_hora) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
       GROUP BY p.id, p.nombre
       ORDER BY cantidad DESC
       LIMIT 10`
    );

    const data = rows.map((r) => ({
      producto: r.nombre,
      cantidad: Number(r.cantidad),
      total: Number(r.total),
    }));

    res.json({ data });
  } catch (e) {
    res.status(400).json({ mensaje: e.message });
  }
}

export async function comparativoIngresoGasto(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT t.fecha, SUM(t.monto) AS total
       FROM (
         SELECT DATE(fecha_hora) AS fecha, SUM(total) AS monto
         FROM ventas
         WHERE estado = 'pagada' AND esta_activo = 1
         GROUP BY DATE(fecha_hora)

         UNION ALL

         SELECT DATE(fecha) AS fecha, -SUM(monto) AS monto
         FROM gastos
         WHERE esta_activo = 1
         GROUP BY DATE(fecha)
       ) t
       WHERE t.fecha >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
       GROUP BY t.fecha
       ORDER BY t.fecha ASC`
    );

    const data = rows.map((r) => ({
      fecha: r.fecha,
      total: Number(r.total),
    }));

    res.json({ data });
  } catch (e) {
    res.status(400).json({ mensaje: e.message });
  }
}
