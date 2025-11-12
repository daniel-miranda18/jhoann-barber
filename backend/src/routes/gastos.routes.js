import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import { requierePermiso } from "../middlewares/permisos.js";
import { uploadGastos } from "../lib/upload.js";
import {
  listarCategorias,
  crearCategoria,
  actualizarCategoria,
} from "../controllers/gasto_categorias.controller.js";
import {
  listarGastos,
  crearGasto,
  actualizarGasto,
  eliminarGasto,
} from "../controllers/gastos.controller.js";
import {
  listarMovimientos,
  crearMovimiento,
} from "../controllers/movimientos.controller.js";

const r = Router();

r.get(
  "/categorias",
  requireAuth,
  requierePermiso("ver_gastos"),
  listarCategorias
);
r.post(
  "/categorias",
  requireAuth,
  requierePermiso("gestionar_gastos"),
  crearCategoria
);
r.put(
  "/categorias/:id",
  requireAuth,
  requierePermiso("gestionar_gastos"),
  actualizarCategoria
);

r.get("/", requireAuth, requierePermiso("ver_gastos"), listarGastos);
r.post(
  "/",
  requireAuth,
  requierePermiso("gestionar_gastos"),
  uploadGastos.single("comprobante"),
  crearGasto
);
r.put(
  "/:id",
  requireAuth,
  requierePermiso("gestionar_gastos"),
  uploadGastos.single("comprobante"),
  actualizarGasto
);
r.delete(
  "/:id",
  requireAuth,
  requierePermiso("gestionar_gastos"),
  eliminarGasto
);

r.get(
  "/movimientos/listado",
  requireAuth,
  requierePermiso("ver_gastos"),
  listarMovimientos
);
r.post(
  "/movimientos",
  requireAuth,
  requierePermiso("gestionar_gastos"),
  crearMovimiento
);

export default r;
