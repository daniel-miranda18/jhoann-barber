import http from "../lib/http";

export function obtenerPerfil() {
  return http.get("/perfil").then((r) => r.data);
}

export function cambiarPin(pinNuevo) {
  return http.post("/perfil/cambiar-pin", { pin_nuevo: pinNuevo });
}
