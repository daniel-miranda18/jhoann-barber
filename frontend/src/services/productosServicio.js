import http from "../lib/http";

export function listarProductos(params) {
  return http.get("/productos", { params }).then((r) => r.data);
}
export function crearProducto(payload) {
  return http.post("/productos", payload).then((r) => r.data);
}
export function actualizarProducto(id, payload) {
  return http.put(`/productos/${id}`, payload).then((r) => r.data);
}
export function eliminarProducto(id) {
  return http.delete(`/productos/${id}`).then((r) => r.data);
}
export function detalleProducto(id) {
  return http.get(`/productos/${id}`).then((r) => r.data);
}
export function subirFotos(productoId, files) {
  const fd = new FormData();
  [...files].forEach((f) => fd.append("fotos", f));
  return http
    .post(`/productos/${productoId}/fotos`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((r) => r.data);
}
export function eliminarFoto(productoId, fotoId) {
  return http
    .delete(`/productos/${productoId}/fotos/${fotoId}`)
    .then((r) => r.data);
}
export function setFotoPrincipal(productoId, fotoId) {
  return http
    .patch(`/productos/${productoId}/fotos/${fotoId}/principal`)
    .then((r) => r.data);
}

export function agregarFotosProducto(productoId, files) {
  return subirFotos(productoId, files);
}
export function eliminarFotoProducto(productoId, fotoId) {
  return eliminarFoto(productoId, fotoId);
}
export function marcarPrincipalProducto(productoId, fotoId) {
  return setFotoPrincipal(productoId, fotoId);
}
