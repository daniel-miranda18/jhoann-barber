import http from "../lib/http";

export async function listarEventos(params = {}) {
  const r = await http.get("/auditoria/eventos", { params });
  return r.data;
}

export async function detalleEvento(id) {
  const r = await http.get(`/auditoria/eventos/${id}`);
  return r.data;
}

export async function listarSesiones(params = {}) {
  const r = await http.get("/auditoria/sesiones", { params });
  return r.data;
}

export async function listarUsuarios(q = "") {
  const r = await http.get("/usuarios", {
    params: { q, page: 1, per_page: 50 },
  });
  const rows = r.data?.data || r.data?.rows || [];
  return rows.map((u) => ({
    id: u.id,
    nombre:
      [u.nombres, u.apellidos].filter(Boolean).join(" ") ||
      u.correo_electronico ||
      `Usuario ${u.id}`,
  }));
}
