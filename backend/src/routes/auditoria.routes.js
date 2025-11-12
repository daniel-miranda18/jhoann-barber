import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import { requierePermiso } from "../middlewares/permisos.js";
import {
  listarEventos,
  detalleEvento,
  listarSesiones,
} from "../controllers/auditoria.controller.js";

const r = Router();

r.get("/eventos", requireAuth, requierePermiso("ver_auditoria"), listarEventos);
r.get(
  "/eventos/:id",
  requireAuth,
  requierePermiso("ver_auditoria"),
  detalleEvento
);
r.get(
  "/sesiones",
  requireAuth,
  requierePermiso("ver_auditoria"),
  listarSesiones
);

export default r;
