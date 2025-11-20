import http from "../lib/http";

export async function listarVentas(params = {}) {
  const r = await http.get("/pagos/ventas", { params });
  return r.data;
}

export async function crearVenta(payload = {}) {
  const r = await http.post("/pagos/ventas", payload);
  return r.data;
}

export async function detalleVenta(id) {
  const r = await http.get(`/pagos/ventas/${id}`);
  return r.data;
}

export async function pagarVenta(id, payload) {
  const r = await http.post(`/pagos/ventas/${id}/pagar`, payload);
  return r.data;
}

export async function anularVenta(id) {
  const r = await http.post(`/pagos/ventas/${id}/anular`);
  return r.data;
}

export async function eliminarVenta(id) {
  const r = await http.delete(`/pagos/ventas/${id}`);
  return r.data;
}

export async function agregarServicioAVenta(id, payload) {
  const r = await http.post(`/pagos/ventas/${id}/servicios`, payload);
  return r.data;
}

export async function eliminarServicioDeVenta(id, itemId) {
  const r = await http.delete(`/pagos/ventas/${id}/servicios/${itemId}`);
  return r.data;
}

export async function agregarProductoAVenta(id, payload) {
  const r = await http.post(`/pagos/ventas/${id}/productos`, payload);
  return r.data;
}

export async function eliminarProductoDeVenta(id, itemId) {
  const r = await http.delete(`/pagos/ventas/${id}/productos/${itemId}`);
  return r.data;
}

export async function actualizarVenta(id, payload = {}) {
  const r = await http.put(`/pagos/ventas/${id}`, payload);
  return r.data;
}

export async function buscarClientes(q) {
  const r = await http.get("/pagos/clientes", { params: { q } });
  return r.data;
}

export async function listarBarberos() {
  const r = await http.get("/pagos/barberos");
  return r.data;
}

export async function buscarServicios(q) {
  const r = await http.get("/pagos/servicios", { params: { q } });
  return r.data;
}

export async function buscarProductos(q) {
  const r = await http.get("/pagos/productos", { params: { q } });
  return r.data;
}

export function ticketUrl(ventaId, opts = {}) {
  const base = import.meta.env.VITE_API_URL || "";
  const curr = opts.curr || "Bs";
  const print = opts.print ? "1" : "0";
  return `${base}/pagos/ventas/${ventaId}/ticket?curr=${encodeURIComponent(
    curr
  )}&print=${print}`;
}
