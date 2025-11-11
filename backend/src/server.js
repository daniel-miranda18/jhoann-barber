import http from "http";
import app from "./app.js";
import { config } from "./config/env.js";
import { ensureDatabase, initPool, pool } from "./db/mysql.js";

const server = http.createServer(app);

async function boot() {
  try {
    await ensureDatabase();
    initPool();
    const [rows] = await pool.query("SELECT DATABASE() AS db, 1 AS db_ok");
    console.log(`Conectado exitosamente a la base de datos: ${rows[0]?.db}`);
  } catch (e) {
    console.error("Falló al conectarse:", e.message);
    process.exit(1);
  }
  server.listen(config.port, () =>
    console.log(`API corriendo en http://localhost:${config.port}`)
  );
}
boot();
function shutdown() {
  server.close(async () => {
    try {
      await pool.end();
    } catch {}
    process.exit(0);
  });
}
["SIGINT", "SIGTERM"].forEach((s) => process.on(s, shutdown));
