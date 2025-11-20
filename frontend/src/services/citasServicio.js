const API = import.meta.env.VITE_API_URL;

export async function buscarServicios(q) {
  const u = new URL(`${API}/citas/servicios`);
  if (q) u.searchParams.set("q", q);
  const r = await fetch(u, { credentials: "include" });
  if (!r.ok) throw new Error("Error");
  return r.json();
}

export async function barberosDisponibles({
  fecha,
  hora,
  duracion,
  servicios,
}) {
  const u = new URL(`${API}/citas/barberos-disponibles`);
  u.searchParams.set("fecha", fecha);
  u.searchParams.set("hora", hora);
  u.searchParams.set("duracion", String(duracion));
  (servicios || []).forEach((id) =>
    u.searchParams.append("servicios", String(id))
  );
  const r = await fetch(u, { credentials: "include" });
  if (!r.ok) throw new Error("Error");
  return r.json();
}

export async function crearCita(payload) {
  const r = await fetch(`${API}/citas`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  const j = await r.json();
  if (!r.ok) throw j;
  return j;
}

export async function citasSemana({ start, end }) {
  const u = new URL(`${API}/citas/admin/semana`);
  u.searchParams.set("start", start);
  u.searchParams.set("end", end);
  const r = await fetch(u, { credentials: "include" });
  if (!r.ok) throw new Error("Error");
  return r.json();
}

export async function actualizarEstadoCita(id, estado) {
  const r = await fetch(`${API}/citas/${id}/estado`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ estado }),
  });
  const j = await r.json();
  if (!r.ok) throw j;
  return j;
}

export async function eliminarCita(id) {
  const r = await fetch(`${API}/citas/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  const j = await r.json();
  if (!r.ok) throw j;
  return j;
}

export async function misCitas({ correo, telefono }) {
  const u = new URL(`${API}/citas/mias`);
  if (correo) u.searchParams.set("correo", correo);
  if (telefono) u.searchParams.set("telefono", telefono);
  const r = await fetch(u, { credentials: "include" });
  if (!r.ok) throw new Error("Error");
  return r.json();
}
