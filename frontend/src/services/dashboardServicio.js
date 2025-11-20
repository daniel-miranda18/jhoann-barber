import http from "../lib/http.js";

export async function obtenerResumen() {
  return http.get("/dashboard/resumen").then((r) => r.data);
}

export async function obtenerVentas7Dias() {
  return http.get("/dashboard/ventas-7dias").then((r) => r.data);
}

export async function obtenerGastos7Dias() {
  return http.get("/dashboard/gastos-7dias").then((r) => r.data);
}

export async function obtenerVentasPorBarbero() {
  return http.get("/dashboard/ventas-barbero").then((r) => r.data);
}

export async function obtenerCitasPorEstado() {
  return http.get("/dashboard/citas-estado").then((r) => r.data);
}

export async function obtenerProductosMasVendidos() {
  return http.get("/dashboard/productos-vendidos").then((r) => r.data);
}

export async function obtenerComparativoIngresoGasto() {
  return http.get("/dashboard/ingreso-gasto").then((r) => r.data);
}

export async function obtenerListaBarberos() {
  return http.get("/dashboard/barberos").then((r) => r.data);
}

export async function obtenerDetalleBarbero(id) {
  return http.get(`/dashboard/barberos/${id}`).then((r) => r.data);
}
