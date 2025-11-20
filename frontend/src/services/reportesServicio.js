import http from "../lib/http";

const API = import.meta.env.VITE_API_URL || "";

export function getBarberosDesempeno(params) {
  return http
    .get("/reportes/barberos/desempeno", { params })
    .then((r) => r.data);
}

export async function exportBarberosDesempenoPdf(params = {}) {
  const qp = new URLSearchParams(params).toString();
  const url = `${API}/reportes/barberos/desempeno/pdf?${qp}`;
  const res = await fetch(url, {
    credentials: "include",
    headers: { Accept: "application/pdf" },
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => null);
    throw new Error(
      `Error exportando PDF: ${res.status} ${res.statusText} ${txt || ""}`
    );
  }
  const blob = await res.blob();
  return blob;
}

export function getProductosMasVendidos(params = {}) {
  return http
    .get("/reportes/productos/mas-vendidos", { params })
    .then((r) => r.data);
}
export async function exportProductosMasVendidosPdf(params = {}) {
  const qp = new URLSearchParams(params).toString();
  const url = `${API}/reportes/productos/mas-vendidos/pdf?${qp}`;
  const res = await fetch(url, {
    credentials: "include",
    headers: { Accept: "application/pdf" },
  });
  if (!res.ok) throw new Error("Error exportando PDF productos");
  return res.blob();
}

export function getIngresosPeriodo(params = {}) {
  return http.get("/reportes/ingresos", { params }).then((r) => r.data);
}
export async function exportIngresosPeriodoPdf(params = {}) {
  const qp = new URLSearchParams(params).toString();
  const url = `${API}/reportes/ingresos/pdf?${qp}`;
  const res = await fetch(url, {
    credentials: "include",
    headers: { Accept: "application/pdf" },
  });
  if (!res.ok) throw new Error("Error exportando PDF ingresos");
  return res.blob();
}

export function getInventarioPeriodo(params = {}) {
  return http.get("/reportes/inventario", { params }).then((r) => r.data);
}
export async function exportInventarioPeriodoPdf(params = {}) {
  const qp = new URLSearchParams(params).toString();
  const url = `${API}/reportes/inventario/pdf?${qp}`;
  const res = await fetch(url, {
    credentials: "include",
    headers: { Accept: "application/pdf" },
  });
  if (!res.ok) throw new Error("Error exportando PDF inventario");
  return res.blob();
}

export function getComisionesPeriodo(params = {}) {
  return http.get("/reportes/comisiones", { params }).then((r) => r.data);
}

export async function exportComisionesPdf(params = {}) {
  const qp = new URLSearchParams(params).toString();
  const url = `${API}/reportes/comisiones/pdf?${qp}`;
  const res = await fetch(url, {
    credentials: "include",
    headers: { Accept: "application/pdf" },
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => null);
    throw new Error(
      `Error exportando PDF: ${res.status} ${res.statusText} ${txt || ""}`
    );
  }
  return res.blob();
}
