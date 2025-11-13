import { Router } from "express";
import {
  getContacto,
  upsertContacto,
} from "../controllers/contacto.controller.js";
import { requireAuth } from "../middlewares/auth.js";
import { requierePermiso } from "../middlewares/permisos.js";

const router = Router();

router.get("/", getContacto);
router.put("/", requireAuth, upsertContacto);

export default router;
