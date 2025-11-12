import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import { requierePermiso } from "../middlewares/permisos.js";
import {
  listarVentas,
  crearVenta,
  actualizarVenta,
  detalleVenta,
  eliminarVenta,
  anularVenta,
  pagarVenta,
  ticketVenta,
  agregarServicioAVenta,
  eliminarServicioDeVenta,
  agregarProductoAVenta,
  eliminarProductoDeVenta,
  buscarClientes,
  listarBarberos,
  buscarServicios,
  buscarProductos,
} from "../controllers/pagos.controller.js";

const router = Router();

router.get("/ventas", requireAuth, requierePermiso("ver_ventas"), listarVentas);
router.post(
  "/ventas",
  requireAuth,
  requierePermiso("gestionar_ventas"),
  crearVenta
);
router.get(
  "/ventas/:id",
  requireAuth,
  requierePermiso("ver_ventas"),
  detalleVenta
);
router.put(
  "/ventas/:id",
  requireAuth,
  requierePermiso("gestionar_ventas"),
  actualizarVenta
);
router.delete(
  "/ventas/:id",
  requireAuth,
  requierePermiso("gestionar_ventas"),
  eliminarVenta
);
router.post(
  "/ventas/:id/anular",
  requireAuth,
  requierePermiso("gestionar_ventas"),
  anularVenta
);
router.post(
  "/ventas/:id/pagar",
  requireAuth,
  requierePermiso("gestionar_ventas"),
  pagarVenta
);
router.get(
  "/ventas/:id/ticket",
  requireAuth,
  requierePermiso("ver_ventas"),
  ticketVenta
);

router.post(
  "/ventas/:id/servicios",
  requireAuth,
  requierePermiso("gestionar_ventas"),
  agregarServicioAVenta
);
router.delete(
  "/ventas/:id/servicios/:itemId",
  requireAuth,
  requierePermiso("gestionar_ventas"),
  eliminarServicioDeVenta
);

router.post(
  "/ventas/:id/productos",
  requireAuth,
  requierePermiso("gestionar_ventas"),
  agregarProductoAVenta
);
router.delete(
  "/ventas/:id/productos/:itemId",
  requireAuth,
  requierePermiso("gestionar_ventas"),
  eliminarProductoDeVenta
);

router.get(
  "/clientes",
  requireAuth,
  requierePermiso("ver_clientes"),
  buscarClientes
);
router.get(
  "/barberos",
  requireAuth,
  requierePermiso("ver_barberos"),
  listarBarberos
);
router.get(
  "/servicios",
  requireAuth,
  requierePermiso("ver_servicios"),
  buscarServicios
);
router.get(
  "/productos",
  requireAuth,
  requierePermiso("ver_productos"),
  buscarProductos
);

export default router;
