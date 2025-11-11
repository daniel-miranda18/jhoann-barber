import http from "../lib/http";

export function listarCategorias(params) {
  return http.get("/gastos/categorias", { params }).then((r) => r.data);
}
export function crearCategoria(payload) {
  return http.post("/gastos/categorias", payload).then((r) => r.data);
}
export function actualizarCategoria(id, payload) {
  return http.put(`/gastos/categorias/${id}`, payload).then((r) => r.data);
}

export function listarGastos(params) {
  return http.get("/gastos", { params }).then((r) => r.data);
}
export function crearGasto(payload, file) {
  const fd = new FormData();
  Object.entries(payload).forEach(([k, v]) => fd.append(k, v));
  if (file) fd.append("comprobante", file);
  return http
    .post("/gastos", fd, { headers: { "Content-Type": "multipart/form-data" } })
    .then((r) => r.data);
}
export function actualizarGasto(id, payload, file) {
  const fd = new FormData();
  Object.entries(payload).forEach(([k, v]) => fd.append(k, v));
  if (file) fd.append("comprobante", file);
  return http
    .put(`/gastos/${id}`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((r) => r.data);
}
export function eliminarGasto(id) {
  return http.delete(`/gastos/${id}`).then((r) => r.data);
}

export function listarMovimientos(params) {
  return http
    .get("/gastos/movimientos/listado", { params })
    .then((r) => r.data);
}
export function crearMovimiento(payload) {
  return http.post("/gastos/movimientos", payload).then((r) => r.data);
}
