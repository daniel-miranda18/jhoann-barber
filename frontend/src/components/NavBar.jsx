import {
  AppBar,
  Toolbar,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { NavLink, useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import logo from "../assets/logo/logo.png";

function cookieTieneToken() {
  return document.cookie
    .split(";")
    .some((c) =>
      c.trim().startsWith(`${import.meta.env.VITE_JWT_COOKIE_NAME || "token"}=`)
    );
}

export default function NavBar() {
  const [anchor, setAnchor] = useState(null);
  const isAuth = useMemo(cookieTieneToken, []);
  const navigate = useNavigate();
  const abrir = (e) => setAnchor(e.currentTarget);
  const cerrar = () => setAnchor(null);
  const linkStyle = ({ isActive }) => ({
    color: isActive ? "#C9A227" : "#ffffff",
    textDecoration: "none",
    padding: "8px 12px",
    display: "inline-block",
  });

  return (
    <AppBar position="sticky" color="primary" elevation={0}>
      <Toolbar sx={{ gap: 2 }}>
        <Box
          onClick={() => navigate("/")}
          sx={{ cursor: "pointer", display: "flex", alignItems: "center" }}
        >
          <Box
            component="img"
            src={logo}
            alt="Jhoann Barber"
            sx={{ height: 70, width: "auto", display: "block" }}
            className="m-3"
          />
        </Box>

        <Box
          sx={{
            display: { xs: "none", md: "flex" },
            alignItems: "center",
            gap: 1,
            ml: "auto",
          }}
        >
          <NavLink to="/" style={linkStyle}>
            Inicio
          </NavLink>
          <NavLink to="/nosotros" style={linkStyle}>
            Nosotros
          </NavLink>
          <NavLink to="/nuestros-servicios" style={linkStyle}>
            Servicios
          </NavLink>
          <NavLink to="/contacto" style={linkStyle}>
            Contacto
          </NavLink>
          <NavLink to="/reservar" style={linkStyle}>
            Reserva
          </NavLink>
          {isAuth && (
            <NavLink to="/mis-reservas" style={linkStyle}>
              Mis reservas
            </NavLink>
          )}
          {!isAuth ? (
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate("/mis-reservas")}
            >
              Consultar Reservas
            </Button>
          ) : (
            <Button
              variant="outlined"
              color="primary"
              onClick={() => navigate("/logout")}
            >
              Cerrar sesión
            </Button>
          )}
        </Box>

        <Box sx={{ ml: "auto", display: { xs: "flex", md: "none" } }}>
          <IconButton onClick={abrir} size="large" sx={{ color: "#ffffff" }}>
            <MenuIcon />
          </IconButton>
          <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={cerrar}>
            <MenuItem
              onClick={() => {
                cerrar();
                navigate("/");
              }}
            >
              Inicio
            </MenuItem>
            <MenuItem
              onClick={() => {
                cerrar();
                navigate("/nosotros");
              }}
            >
              Nosotros
            </MenuItem>
            <MenuItem
              onClick={() => {
                cerrar();
                navigate("/nuestros-servicios");
              }}
            >
              Servicios
            </MenuItem>
            <MenuItem
              onClick={() => {
                cerrar();
                navigate("/contacto");
              }}
            >
              Contacto
            </MenuItem>
            <MenuItem
              onClick={() => {
                cerrar();
                navigate("/reservar");
              }}
            >
              Reserva
            </MenuItem>
            {isAuth && (
              <MenuItem
                onClick={() => {
                  cerrar();
                  navigate("/mis-reservas");
                }}
              >
                Mis reservas
              </MenuItem>
            )}
            {!isAuth ? (
              <MenuItem
                onClick={() => {
                  cerrar();
                  navigate("/mis-reservas");
                }}
              >
                Consultar Reservas
              </MenuItem>
            ) : (
              <MenuItem
                onClick={() => {
                  cerrar();
                  navigate("/logout");
                }}
              >
                Cerrar sesión
              </MenuItem>
            )}
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
