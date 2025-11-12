import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import {
  resumenGeneral,
  ventasUltimos7Dias,
  gastosUltimos7Dias,
  ventasPorBarbero,
  citasPorEstado,
  productosMasVendidos,
  comparativoIngresoGasto,
} from "../controllers/dashboard.controller.js";

const r = Router();

r.get("/resumen", requireAuth, resumenGeneral);
r.get("/ventas-7dias", requireAuth, ventasUltimos7Dias);
r.get("/gastos-7dias", requireAuth, gastosUltimos7Dias);
r.get("/ventas-barbero", requireAuth, ventasPorBarbero);
r.get("/citas-estado", requireAuth, citasPorEstado);
r.get("/productos-vendidos", requireAuth, productosMasVendidos);
r.get("/ingreso-gasto", requireAuth, comparativoIngresoGasto);

export default r;
