import http from "../lib/http";

export function listarServicios(params) {
  return http.get("/servicios", { params }).then((r) => r.data);
}
export function crearServicio(payload) {
  return http.post("/servicios", payload).then((r) => r.data);
}
export function detalleServicio(id) {
  return http.get(`/servicios/${id}`).then((r) => r.data);
}
export function actualizarServicio(id, payload) {
  return http.put(`/servicios/${id}`, payload).then((r) => r.data);
}
export function eliminarServicio(id) {
  return http.delete(`/servicios/${id}`).then((r) => r.data);
}
