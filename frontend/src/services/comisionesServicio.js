import http from "../lib/http";

export function listarComisionesSemana(params) {
  return http.get("/comisiones/semana", { params }).then((r) => r.data);
}

export function pagarComision(payload) {
  return http.post("/comisiones/pagar", payload).then((r) => r.data);
}
