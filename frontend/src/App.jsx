import { Routes, Route, Outlet } from "react-router-dom";
import NavBar from "./components/NavBar.jsx";
import Footer from "./components/Footer.jsx";
import Home from "./pages/Home.jsx";
import Nosotros from "./pages/Nosotros.jsx";
import Servicios from "./pages/Servicios.jsx";
import Contacto from "./pages/Contacto.jsx";
import Reservar from "./pages/Reservar.jsx";
import MisReservas from "./pages/MisReservas.jsx";
import Login from "./pages/autenticacion/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Usuarios from "./pages/Usuarios.jsx";
import AppLayout from "./layouts/AppLayout.jsx";
import Roles from "./pages/Roles.jsx";
import Permisos from "./pages/Permisos.jsx";
import Productos from "./pages/Productos";
import Barberos from "./pages/Barberos";
import Gastos from "./pages/Gastos.jsx";
import Pagos from "./pages/Pagos.jsx";
import Auditoria from "./pages/Auditoria.jsx";

function PublicShell() {
  return (
    <>
      <NavBar />
      <Outlet />
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<PublicShell />}>
        <Route path="/" element={<Home />} />
        <Route path="/nosotros" element={<Nosotros />} />
        <Route path="/contacto" element={<Contacto />} />
        <Route path="/reservar" element={<Reservar />} />
        <Route path="/mis-reservas" element={<MisReservas />} />
      </Route>

      <Route path="/login" element={<Login />} />

      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/usuarios" element={<Usuarios />} />
        <Route path="/roles" element={<Roles />} />
        <Route path="/permisos" element={<Permisos />} />
        <Route path="/servicios" element={<Servicios />} />
        <Route path="/productos" element={<Productos />} />
        <Route path="/barberos" element={<Barberos />} />
        <Route path="/gastos" element={<Gastos />} />
        <Route path="/pagos" element={<Pagos />} />
        <Route path="/auditoria" element={<Auditoria />} />
      </Route>
    </Routes>
  );
}
