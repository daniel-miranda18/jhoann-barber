import http from "../lib/http";

export async function listarRoles() {
  const r = await http.get("/acl/roles");
  return r.data;
}

export async function detalleRol(id) {
  const r = await http.get(`/acl/roles/${id}`);
  return r.data;
}

export async function crearRol(payload) {
  const r = await http.post("/acl/roles", payload);
  return r.data;
}

export async function actualizarRol(id, payload) {
  const r = await http.put(`/acl/roles/${id}`, payload);
  return r.data;
}

export async function syncPermisosRol(id, claves) {
  const r = await http.patch(`/acl/roles/${id}/permisos`, { permisos: claves });
  return r.data;
}

export async function listarPermisos(params = {}) {
  const r = await http.get("/acl/permisos", { params });
  return r.data;
}

export async function crearPermiso(payload) {
  const r = await http.post("/acl/permisos", payload);
  return r.data;
}

export async function actualizarPermiso(id, payload) {
  const r = await http.put(`/acl/permisos/${id}`, payload);
  return r.data;
}
