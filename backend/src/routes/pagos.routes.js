import { Router } from "express";
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

router.get("/ventas", listarVentas);
router.post("/ventas", crearVenta);
router.get("/ventas/:id", detalleVenta);
router.put("/ventas/:id", actualizarVenta);
router.delete("/ventas/:id", eliminarVenta);
router.post("/ventas/:id/anular", anularVenta);
router.post("/ventas/:id/pagar", pagarVenta);
router.get("/ventas/:id/ticket", ticketVenta);

router.post("/ventas/:id/servicios", agregarServicioAVenta);
router.delete("/ventas/:id/servicios/:itemId", eliminarServicioDeVenta);

router.post("/ventas/:id/productos", agregarProductoAVenta);
router.delete("/ventas/:id/productos/:itemId", eliminarProductoDeVenta);

router.get("/clientes", buscarClientes);
router.get("/barberos", listarBarberos);
router.get("/servicios", buscarServicios);
router.get("/productos", buscarProductos);

export default router;
