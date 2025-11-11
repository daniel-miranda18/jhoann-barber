import { Router } from "express";
import {
  crearServicio,
  listarServicios,
  detalleServicio,
  actualizarServicio,
  eliminarServicio,
} from "../controllers/servicios.controller.js";

const r = Router();

r.post("/", crearServicio);
r.get("/", listarServicios);
r.get("/:id", detalleServicio);
r.put("/:id", actualizarServicio);
r.delete("/:id", eliminarServicio);

export default r;
