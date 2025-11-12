import http from "../lib/http";

export function obtenerInformacionContacto() {
  return http.get("/contacto").then((r) => r.data);
}
