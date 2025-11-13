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
