import http from "../lib/http";

export function crearVenta(payload) {
  return http.post("/ventas", payload).then((r) => r.data);
}
export function listarVentas(params) {
  return http.get("/ventas", { params }).then((r) => r.data);
}
export function detalleVenta(id) {
  return http.get(`/ventas/${id}`).then((r) => r.data);
}
export function agregarServicioAVenta(id, payload) {
  return http.post(`/ventas/${id}/servicios`, payload).then((r) => r.data);
}
export function agregarProductoAVenta(id, payload) {
  return http.post(`/ventas/${id}/productos`, payload).then((r) => r.data);
}
export function quitarServicioDeVenta(id, itemId) {
  return http.delete(`/ventas/${id}/servicios/${itemId}`).then((r) => r.data);
}
export function quitarProductoDeVenta(id, itemId) {
  return http.delete(`/ventas/${id}/productos/${itemId}`).then((r) => r.data);
}
export function registrarPago(id, payload) {
  return http.post(`/ventas/${id}/pagos`, payload).then((r) => r.data);
}
export function anularVenta(id) {
  return http.post(`/ventas/${id}/anular`).then((r) => r.data);
}
