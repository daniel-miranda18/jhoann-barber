import http from "../lib/http";

export function listarServicios(params) {
  return http.get("/servicios", { params }).then((r) => r.data);
}
export function crearServicio(payload) {
  return http.post("/servicios", payload).then((r) => r.data);
}
export function actualizarServicio(id, payload) {
  return http.put(`/servicios/${id}`, payload).then((r) => r.data);
}
export function eliminarServicio(id) {
  return http.delete(`/servicios/${id}`).then((r) => r.data);
}
export function detalleServicio(id) {
  return http.get(`/servicios/${id}`).then((r) => r.data);
}

export function listarServiciosPublico(params) {
  return http.get("/servicios/public", { params }).then((r) => r.data);
}
export function obtenerServicioPublico(id) {
  return http.get(`/servicios/public/${id}`).then((r) => r.data);
}

export function subirImagenServicio(servicioId, file) {
  const fd = new FormData();
  fd.append("imagen", file);
  return http
    .post(`/servicios/${servicioId}/imagen`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((r) => r.data);
}
export function eliminarImagenServicio(servicioId) {
  return http.delete(`/servicios/${servicioId}/imagen`).then((r) => r.data);
}
