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

r.use(requireAuth);

r.get("/", listarBarberos);
r.get("/:id", detalleBarbero);
r.get("/:id/servicios", listarServiciosBarbero);
r.patch("/:id/servicios", syncServiciosBarbero);
r.get("/:id/horarios", listarHorariosBarbero);
r.patch("/:id/horarios", upsertHorariosBarbero);
r.get("/:id/bloqueos", listarBloqueosBarbero);
r.post("/:id/bloqueos", crearBloqueoBarbero);
r.delete("/:id/bloqueos/:bloqueoId", eliminarBloqueoBarbero);

export default r;
