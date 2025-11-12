import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import { requierePermiso } from "../middlewares/permisos.js";
import {
  crearServicio,
  listarServicios,
  detalleServicio,
  actualizarServicio,
  eliminarServicio,
} from "../controllers/servicios.controller.js";

const r = Router();

r.post("/", requireAuth, requierePermiso("gestionar_servicios"), crearServicio);
r.get("/", requireAuth, requierePermiso("ver_servicios"), listarServicios);
r.get("/:id", requireAuth, requierePermiso("ver_servicios"), detalleServicio);
r.put(
  "/:id",
  requireAuth,
  requierePermiso("gestionar_servicios"),
  actualizarServicio
);
r.delete(
  "/:id",
  requireAuth,
  requierePermiso("gestionar_servicios"),
  eliminarServicio
);

export default r;
