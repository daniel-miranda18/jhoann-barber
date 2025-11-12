import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import { requierePermiso } from "../middlewares/permisos.js";
import {
  listarUsuarios,
  detalleUsuario,
  registrarUsuario,
  actualizarUsuario,
  eliminarUsuario,
} from "../controllers/usuarios.controller.js";

const r = Router();

r.get("/", requireAuth, requierePermiso("ver_usuarios"), listarUsuarios);
r.get("/:id", requireAuth, requierePermiso("ver_usuarios"), detalleUsuario);
r.post(
  "/",
  requireAuth,
  requierePermiso("gestionar_usuarios"),
  registrarUsuario
);
r.put(
  "/:id",
  requireAuth,
  requierePermiso("gestionar_usuarios"),
  actualizarUsuario
);
r.delete(
  "/:id",
  requireAuth,
  requierePermiso("gestionar_usuarios"),
  eliminarUsuario
);

export default r;
