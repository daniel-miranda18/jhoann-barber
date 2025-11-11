import { Router } from "express";
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

r.post("/", crearProducto);
r.get("/", listarProductos);
r.get("/:id", detalleProducto);
r.put("/:id", actualizarProducto);
r.delete("/:id", eliminarProducto);
r.post("/:id/fotos", uploadProductos.array("fotos", 10), agregarFotos);
r.delete("/:id/fotos/:fotoId", eliminarFoto);
r.patch("/:id/fotos/:fotoId/principal", setFotoPrincipal);

export default r;
