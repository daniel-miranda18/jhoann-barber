import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
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

r.get("/", requireAuth, listarBarberos);
r.get("/:id", requireAuth, detalleBarbero);
r.get("/:id/servicios", requireAuth, listarServiciosBarbero);
r.patch("/:id/servicios", requireAuth, syncServiciosBarbero);
r.get("/:id/horarios", requireAuth, listarHorariosBarbero);
r.patch("/:id/horarios", requireAuth, upsertHorariosBarbero);
r.get("/:id/bloqueos", requireAuth, listarBloqueosBarbero);
r.post("/:id/bloqueos", requireAuth, crearBloqueoBarbero);
r.delete("/:id/bloqueos/:bloqueoId", requireAuth, eliminarBloqueoBarbero);

export default r;
