import http from "../lib/http";

export function obtenerInformacionContacto() {
  return http.get("/contacto").then((r) => r.data);
}

export function obtenerInformacionContactoAdmin() {
  return http.get("/admin/contacto").then((r) => r.data);
}

export function actualizarInformacionContacto(payload) {
  return http.put("/admin/contacto", payload).then((r) => r.data);
}

export function enviarMensajeContacto(payload) {
  return http.post("/contacto", payload).then((r) => r.data);
}

export function obtenerMensajesContactoAdmin({ page = 1, pageSize = 20 } = {}) {
  return http
    .get("/admin/mensajes", { params: { page, pageSize } })
    .then((r) => r.data);
}

export function obtenerMensajeContactoAdmin(id) {
  return http.get(`/admin/mensajes/${id}`).then((r) => r.data);
}

export function marcarMensajeLeido(id) {
  return http.patch(`/admin/mensajes/${id}/leido`).then((r) => r.data);
}

export function eliminarMensajeContacto(id) {
  return http.delete(`/admin/mensajes/${id}`).then((r) => r.data);
}
