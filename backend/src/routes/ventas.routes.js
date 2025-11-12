import { Router } from "express";
import {
  crearVenta,
  listarVentas,
  detalleVenta,
  agregarServicio,
  agregarProducto,
  quitarServicio,
  quitarProducto,
  registrarPago,
  anularVenta,
} from "../controllers/ventas.controller.js";
import { requireAuth } from "../middlewares/auth.js";
import { requierePermiso } from "../middlewares/permisos.js";

const r = Router();

r.post("/", requireAuth, requierePermiso("gestionar_ventas"), crearVenta);
r.get("/", requireAuth, requierePermiso("ver_ventas"), listarVentas);
r.get("/:id", requireAuth, requierePermiso("ver_ventas"), detalleVenta);
r.post(
  "/:id/servicios",
  requireAuth,
  requierePermiso("gestionar_ventas"),
  agregarServicio
);
r.post(
  "/:id/productos",
  requireAuth,
  requierePermiso("gestionar_ventas"),
  agregarProducto
);
r.delete(
  "/:id/servicios/:itemId",
  requireAuth,
  requierePermiso("gestionar_ventas"),
  quitarServicio
);
r.delete(
  "/:id/productos/:itemId",
  requireAuth,
  requierePermiso("gestionar_ventas"),
  quitarProducto
);
r.post(
  "/:id/pagos",
  requireAuth,
  requierePermiso("gestionar_ventas"),
  registrarPago
);
r.post(
  "/:id/anular",
  requireAuth,
  requierePermiso("gestionar_ventas"),
  anularVenta
);

export default r;
