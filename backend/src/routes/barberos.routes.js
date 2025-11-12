import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import { requierePermiso } from "../middlewares/permisos.js";
import {
  listarBarberos,
  detalleBarbero,
  listarServiciosBarbero,
  syncServiciosBarbero,
  listarHorariosBarbero,
  upsertHorariosBarbero,
  listarBloqueosBarbero,
  crearBloqueoBarbero,
  eliminarBloqueoBarbero,
} from "../controllers/barberos.controller.js";

const r = Router();

r.get("/", requireAuth, requierePermiso("ver_barberos"), listarBarberos);
r.get("/:id", requireAuth, requierePermiso("ver_barberos"), detalleBarbero);
r.get(
  "/:id/servicios",
  requireAuth,
  requierePermiso("ver_barberos"),
  listarServiciosBarbero
);
r.patch(
  "/:id/servicios",
  requireAuth,
  requierePermiso("gestionar_barberos"),
  syncServiciosBarbero
);
r.get(
  "/:id/horarios",
  requireAuth,
  requierePermiso("ver_barberos"),
  listarHorariosBarbero
);
r.patch(
  "/:id/horarios",
  requireAuth,
  requierePermiso("gestionar_barberos"),
  upsertHorariosBarbero
);
r.get(
  "/:id/bloqueos",
  requireAuth,
  requierePermiso("ver_barberos"),
  listarBloqueosBarbero
);
r.post(
  "/:id/bloqueos",
  requireAuth,
  requierePermiso("gestionar_barberos"),
  crearBloqueoBarbero
);
r.delete(
  "/:id/bloqueos/:bloqueoId",
  requireAuth,
  requierePermiso("gestionar_barberos"),
  eliminarBloqueoBarbero
);

export default r;
