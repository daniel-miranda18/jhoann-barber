import http from "../lib/http";

export async function login({ correo_electronico, pin }) {
  const r = await http.post("/auth/login", { correo_electronico, pin });
  return r.data;
}

export async function sesion() {
  const r = await http.get("/auth/sesion");
  return r.data;
}

export async function cerrarSesion() {
  const r = await http.post("/auth/logout");
  return r.data;
}

export async function rolDeUsuario(usuarioId) {
  const r = await http.get(`/acl/usuarios/${usuarioId}/rol`);
  return r.data;
}

export function tienePermiso(rolData, clave) {
  const lista = (rolData?.data?.permisos || []).map((p) => p.clave);
  return lista.includes(clave);
}
