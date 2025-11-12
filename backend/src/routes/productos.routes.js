import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import { requierePermiso } from "../middlewares/permisos.js";
import {
  crearProducto,
  listarProductos,
  detalleProducto,
  actualizarProducto,
  eliminarProducto,
  agregarFotos,
  eliminarFoto,
  setFotoPrincipal,
} from "../controllers/productos.controller.js";
import { uploadProductos } from "../lib/upload.js";

const r = Router();

r.post("/", requireAuth, requierePermiso("gestionar_productos"), crearProducto);
r.get("/", requireAuth, requierePermiso("ver_productos"), listarProductos);
r.get("/:id", requireAuth, requierePermiso("ver_productos"), detalleProducto);
r.put(
  "/:id",
  requireAuth,
  requierePermiso("gestionar_productos"),
  actualizarProducto
);
r.delete(
  "/:id",
  requireAuth,
  requierePermiso("gestionar_productos"),
  eliminarProducto
);
r.post(
  "/:id/fotos",
  requireAuth,
  uploadProductos.array("fotos", 10),
  requierePermiso("gestionar_productos"),
  agregarFotos
);
r.delete(
  "/:id/fotos/:fotoId",
  requireAuth,
  requierePermiso("gestionar_productos"),
  eliminarFoto
);
r.patch(
  "/:id/fotos/:fotoId/principal",
  requireAuth,
  requierePermiso("gestionar_productos"),
  setFotoPrincipal
);

export default r;
