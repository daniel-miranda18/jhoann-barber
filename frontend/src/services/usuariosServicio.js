import http from "../lib/http";

export function listarUsuarios(params) {
  return http.get("/usuarios", { params }).then((r) => r.data);
}
export function crearUsuario(data) {
  return http.post("/usuarios", data).then((r) => r.data);
}
export function detalleUsuario(id) {
  return http.get(`/usuarios/${id}`).then((r) => r.data);
}
export function actualizarUsuario(id, data) {
  return http.put(`/usuarios/${id}`, data).then((r) => r.data);
}
export function eliminarUsuario(id) {
  return http.delete(`/usuarios/${id}`).then((r) => r.data);
}
