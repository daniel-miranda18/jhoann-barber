import { Router } from "express";
import { obtenerInformacionContacto } from "../controllers/contacto.controller.js";

const r = Router();

r.get("/", obtenerInformacionContacto);

export default r;
