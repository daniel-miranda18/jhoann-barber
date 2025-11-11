import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import { requiereRol } from "../middlewares/roles.js";
import {
  listarUsuarios,
  detalleUsuario,
  registrarUsuario,
  actualizarUsuario,
  eliminarUsuario,
} from "../controllers/usuarios.controller.js";

const r = Router();

r.get("/", requireAuth, listarUsuarios);
r.get("/:id", requireAuth, detalleUsuario);
r.post("/", requireAuth, requiereRol("Administrador"), registrarUsuario);
r.put("/:id", requireAuth, requiereRol("Administrador"), actualizarUsuario);
r.delete("/:id", requireAuth, requiereRol("Administrador"), eliminarUsuario);

export default r;
