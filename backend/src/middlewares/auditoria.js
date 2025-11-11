import { pool } from "../db/mysql.js";

export function auditar() {
  return async (req, res, next) => {
    const t0 = Date.now();
    const m = req.method.toUpperCase();
    const loggable =
      ["POST", "PUT", "PATCH", "DELETE"].includes(m) ||
      req.headers["x-aud-accion"];
    const ruta = req.originalUrl || req.url;
    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.ip || null;
    const ua = req.get("user-agent") || null;
    const payload = loggable ? JSON.stringify(req.body || {}) : null;
    const usuarioId = req.usuario?.sub || null;
    const accion = req.headers["x-aud-accion"] || null;
    res.on("finish", async () => {
      try {
        await pool.execute(
          "INSERT INTO auditoria_eventos (usuario_id,metodo,ruta,accion,ip,user_agent,payload,creado_por,actualizado_por) VALUES (?,?,?,?,?,?,?,?,?)",
          [usuarioId, m, ruta, accion, ip, ua, payload, usuarioId, usuarioId]
        );
      } catch {}
    });
    next();
  };
}
