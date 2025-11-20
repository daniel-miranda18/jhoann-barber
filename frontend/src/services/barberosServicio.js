import http from "../lib/http";

export function listarBarberos(params) {
  return http.get("/barberos", { params }).then((r) => r.data);
}
export function detalleBarbero(id) {
  return http.get(`/barberos/${id}`).then((r) => r.data);
}
export function listarServiciosBarbero(id) {
  return http.get(`/barberos/${id}/servicios`).then((r) => r.data);
}
export function guardarServiciosBarbero(id, servicios) {
  return http
    .patch(`/barberos/${id}/servicios`, { servicios })
    .then((r) => r.data);
}
export function listarHorariosBarbero(id) {
  return http.get(`/barberos/${id}/horarios`).then((r) => r.data);
}
export function guardarHorariosBarbero(id, horarios) {
  return http
    .patch(`/barberos/${id}/horarios`, { horarios })
    .then((r) => r.data);
}
export function listarBloqueosBarbero(id, params) {
  return http.get(`/barberos/${id}/bloqueos`, { params }).then((r) => r.data);
}
export function crearBloqueoBarbero(id, payload) {
  return http.post(`/barberos/${id}/bloqueos`, payload).then((r) => r.data);
}
export function eliminarBloqueoBarbero(id, bloqueoId) {
  return http
    .delete(`/barberos/${id}/bloqueos/${bloqueoId}`)
    .then((r) => r.data);
}
