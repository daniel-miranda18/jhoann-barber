import { Router } from "express";
import {
  listarServiciosPublico,
  obtenerServicioPublico,
  crearServicio,
  listarServicios,
  detalleServicio,
  actualizarServicio,
  eliminarServicio,
} from "../controllers/servicios.controller.js";
import { requireAuth } from "../middlewares/auth.js";
import { requierePermiso } from "../middlewares/permisos.js";

const r = Router();

r.get("/public", listarServiciosPublico);
r.get("/public/:id", obtenerServicioPublico);

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
