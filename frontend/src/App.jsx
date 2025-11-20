import { Routes, Route, Outlet } from "react-router-dom";
import NavBar from "./components/NavBar.jsx";
import Footer from "./components/Footer.jsx";
import Home from "./pages/Home.jsx";
import Nosotros from "./pages/Nosotros.jsx";
import ServiciosPublico from "./pages/ServiciosPublico.jsx";
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
import Citas from "./pages/Citas.jsx";
import Perfil from "./pages/Perfil";
import AdminContacto from "./pages/AdminContacto.jsx";
import ScrollToTopButton from "./components/ScrollToTopButton.jsx";
import { useEffect, useState } from "react";
import Fab from "@mui/material/Fab";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import { obtenerInformacionContacto } from "./services/contactoServicio";
import Reportes from "./pages/Reportes.jsx";
import Comisiones from "./pages/Comisiones.jsx";
import MensajesContactoAdmin from "./pages/MensajesContactoAdmin.jsx";
export default function App() {
  return (
    <Routes>
      <Route element={<PublicShell />}>
        <Route path="/" element={<Home />} />
        <Route path="/nosotros" element={<Nosotros />} />
        <Route path="/nuestros-servicios" element={<ServiciosPublico />} />
        <Route path="/contacto" element={<Contacto />} />
        <Route path="/reservar" element={<Reservar />} />
        <Route path="/mis-reservas" element={<MisReservas />} />
      </Route>

      <Route path="/login" element={<Login />} />

      <Route element={<AppLayout />}>
        <Route path="perfil" element={<Perfil />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/reportes" element={<Reportes />} />
        <Route path="/usuarios" element={<Usuarios />} />
        <Route path="/roles" element={<Roles />} />
        <Route path="/permisos" element={<Permisos />} />
        <Route path="/servicios" element={<Servicios />} />
        <Route path="/productos" element={<Productos />} />
        <Route path="/barberos" element={<Barberos />} />
        <Route path="/gastos" element={<Gastos />} />
        <Route path="/pagos" element={<Pagos />} />
        <Route path="/citas" element={<Citas />} />
        <Route path="/auditoria" element={<Auditoria />} />
        <Route path="/comisiones" element={<Comisiones />} />
        <Route path="/admin/contacto" element={<AdminContacto />} />
        <Route path="/admin/mensajes" element={<MensajesContactoAdmin />} />
      </Route>
    </Routes>
  );
}

function PublicShell() {
  const [waLink, setWaLink] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await obtenerInformacionContacto();
        const raw = String(res?.data?.whatsapp || "").trim();
        if (!raw) {
          if (mounted) setWaLink(null);
          return;
        }
        const digits = raw.replace(/\D/g, "");
        if (!digits) {
          if (mounted) setWaLink(null);
          return;
        }
        let link = null;
        if (digits.startsWith("591")) link = `https://wa.me/${digits}`;
        else if (digits.length === 8) link = `https://wa.me/591${digits}`;
        else link = `https://wa.me/${digits}`;
        if (mounted) setWaLink(link);
      } catch (e) {
        if (mounted) setWaLink(null);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <>
      <NavBar />
      <Outlet />
      <Footer />
      {waLink && (
        <Fab
          color="success"
          aria-label="whatsapp"
          href={waLink}
          target="_blank"
          rel="noopener"
          sx={{ position: "fixed", right: 20, bottom: 20, zIndex: 1400 }}
        >
          <WhatsAppIcon />
        </Fab>
      )}
      <ScrollToTopButton />
    </>
  );
}
