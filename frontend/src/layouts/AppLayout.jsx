import { useEffect, useState, createContext, useContext } from "react";
import {
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  CircularProgress,
  Collapse,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import SecurityIcon from "@mui/icons-material/Security";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import ContentCutIcon from "@mui/icons-material/ContentCut";
import PersonIcon from "@mui/icons-material/Person";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import LogoutIcon from "@mui/icons-material/Logout";
import PaidIcon from "@mui/icons-material/Paid";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import HistoryIcon from "@mui/icons-material/History";
import EventIcon from "@mui/icons-material/Event";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import RoomIcon from "@mui/icons-material/Room";
import AssessmentIcon from "@mui/icons-material/Assessment";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import MailIcon from "@mui/icons-material/Mail";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  sesion,
  cerrarSesion,
  rolDeUsuario as rolDeUsuarioSvc,
} from "../services/autenticacionServicio";

const AuthCtx = createContext(null);
export function useAuth() {
  return useContext(AuthCtx);
}

const drawerWidth = 260;

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [usuario, setUsuario] = useState(null);
  const [rol, setRol] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openACL, setOpenACL] = useState(false);
  const nav = useNavigate();
  const loc = useLocation();

  useEffect(() => {
    (async () => {
      try {
        const s = await sesion();
        setUsuario(s?.usuario || null);
        const uid = s?.usuario?.id ?? s?.usuario?.sub;
        try {
          if (uid) {
            const r = await rolDeUsuarioSvc(uid);
            setRol(r);
          } else {
            setRol(null);
          }
        } catch {
          setRol(null);
        }
        setLoading(false);
      } catch {
        nav("/login", { replace: true });
      }
    })();
  }, [nav]);

  useEffect(() => {
    const shouldOpen =
      loc.pathname.startsWith("/roles") || loc.pathname.startsWith("/permisos");
    setOpenACL(shouldOpen);
  }, [loc.pathname]);

  async function handleLogout() {
    try {
      await cerrarSesion();
    } catch {}
    localStorage.removeItem("jb_user");
    nav("/login", { replace: true });
  }

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  const claves = (rol?.data?.permisos || []).map((p) => p.clave);

  const puedeUsuarios =
    claves.includes("gestionar_usuarios") || claves.includes("ver_usuarios");
  const puedeRoles =
    claves.includes("gestionar_roles") || claves.includes("ver_roles");
  const puedePermisos =
    claves.includes("gestionar_permisos") || claves.includes("ver_permisos");
  const puedeServicios =
    claves.includes("gestionar_servicios") || claves.includes("ver_servicios");
  const puedeProductos =
    claves.includes("gestionar_productos") || claves.includes("ver_productos");
  const puedeBarberos =
    claves.includes("gestionar_barberos") || claves.includes("ver_barberos");
  const puedeGastos =
    claves.includes("gestionar_gastos") || claves.includes("ver_gastos");
  const puedeVentas =
    claves.includes("gestionar_ventas") || claves.includes("ver_ventas");
  const puedeCitas =
    claves.includes("gestionar_citas") || claves.includes("ver_citas");
  const puedeReportes =
    claves.includes("gestionar_reportes") || claves.includes("ver_reportes");
  const puedeAuditoria =
    claves.includes("gestionar_auditoria") || claves.includes("ver_auditoria");
  const puedeContacto =
    claves.includes("gestionar_usuarios") || claves.includes("ver_usuarios");

  const btnSx = { pl: 2 };
  const drawer = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Box sx={{ px: 2.5, py: 2 }}>
        <Typography variant="h5" fontWeight={800}>
          Jhoann Barber
        </Typography>
      </Box>
      <Divider />
      <List sx={{ py: 1 }}>
        <ListItemButton
          sx={btnSx}
          selected={loc.pathname === "/dashboard"}
          onClick={() => {
            nav("/dashboard");
            setMobileOpen(false);
          }}
        >
          <ListItemIcon>
            <DashboardIcon />
          </ListItemIcon>
          <ListItemText primary="Panel de Control" />
        </ListItemButton>

        {puedeUsuarios && (
          <ListItemButton
            sx={btnSx}
            selected={loc.pathname.startsWith("/usuarios")}
            onClick={() => {
              nav("/usuarios");
              setMobileOpen(false);
            }}
          >
            <ListItemIcon>
              <PeopleAltIcon />
            </ListItemIcon>
            <ListItemText primary="Usuarios" />
          </ListItemButton>
        )}

        {(puedeRoles || puedePermisos) && (
          <>
            <ListItemButton sx={btnSx} onClick={() => setOpenACL((v) => !v)}>
              <ListItemIcon>
                <SecurityIcon />
              </ListItemIcon>
              <ListItemText primary="Roles y Permisos" />
              {openACL ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            <Collapse in={openACL} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {puedeRoles && (
                  <ListItemButton
                    sx={btnSx}
                    selected={loc.pathname.startsWith("/roles")}
                    onClick={() => {
                      nav("/roles");
                      setMobileOpen(false);
                    }}
                  >
                    <ListItemIcon>
                      <AdminPanelSettingsIcon />
                    </ListItemIcon>
                    <ListItemText primary="Roles" />
                  </ListItemButton>
                )}
                {puedePermisos && (
                  <ListItemButton
                    sx={btnSx}
                    selected={loc.pathname.startsWith("/permisos")}
                    onClick={() => {
                      nav("/permisos");
                      setMobileOpen(false);
                    }}
                  >
                    <ListItemIcon>
                      <VpnKeyIcon />
                    </ListItemIcon>
                    <ListItemText primary="Permisos" />
                  </ListItemButton>
                )}
              </List>
            </Collapse>
          </>
        )}

        {puedeBarberos && (
          <ListItemButton
            selected={loc.pathname.startsWith("/barberos")}
            onClick={() => {
              nav("/barberos");
              setMobileOpen(false);
            }}
          >
            <ListItemIcon>
              <PersonIcon />
            </ListItemIcon>
            <ListItemText primary="Barberos" />
          </ListItemButton>
        )}
        {puedeServicios && (
          <ListItemButton
            selected={loc.pathname.startsWith("/servicios")}
            onClick={() => {
              nav("/servicios");
              setMobileOpen(false);
            }}
          >
            <ListItemIcon>
              <ContentCutIcon />
            </ListItemIcon>
            <ListItemText primary="Servicios" />
          </ListItemButton>
        )}
        {puedeProductos && (
          <ListItemButton
            selected={loc.pathname.startsWith("/productos")}
            onClick={() => {
              nav("/productos");
              setMobileOpen(false);
            }}
          >
            <ListItemIcon>
              <ShoppingBagIcon />
            </ListItemIcon>
            <ListItemText primary="Productos" />
          </ListItemButton>
        )}
        {puedeGastos && (
          <ListItemButton
            selected={loc.pathname.startsWith("/gastos")}
            onClick={() => {
              nav("/gastos");
              setMobileOpen(false);
            }}
          >
            <ListItemIcon>
              <PaidIcon />
            </ListItemIcon>
            <ListItemText primary="Gastos" />
          </ListItemButton>
        )}
        {puedeVentas && (
          <ListItemButton
            selected={loc.pathname.startsWith("/pagos")}
            onClick={() => {
              nav("/pagos");
              setMobileOpen(false);
            }}
          >
            <ListItemIcon>
              <PointOfSaleIcon />
            </ListItemIcon>
            <ListItemText primary="Ventas" />
          </ListItemButton>
        )}
        {puedeReportes && (
          <ListItemButton
            selected={loc.pathname.startsWith("/reportes")}
            onClick={() => {
              nav("/reportes");
              setMobileOpen(false);
            }}
          >
            <ListItemIcon>
              <AssessmentIcon />
            </ListItemIcon>
            <ListItemText primary="Reportes" />
          </ListItemButton>
        )}
        {puedeReportes && (
          <ListItemButton
            selected={loc.pathname.startsWith("/comisiones")}
            onClick={() => {
              nav("/comisiones");
              setMobileOpen(false);
            }}
            sx={btnSx}
          >
            <ListItemIcon>
              <MonetizationOnIcon />
            </ListItemIcon>
            <ListItemText primary="Comisiones" />
          </ListItemButton>
        )}
        {puedeCitas && (
          <ListItemButton
            selected={loc.pathname.startsWith("/citas")}
            onClick={() => {
              nav("/citas");
              setMobileOpen(false);
            }}
          >
            <ListItemIcon>
              <EventIcon />
            </ListItemIcon>
            <ListItemText primary="Citas" />
          </ListItemButton>
        )}
        {puedeAuditoria && (
          <ListItemButton
            selected={loc.pathname.startsWith("/auditoria")}
            onClick={() => {
              nav("/auditoria");
              setMobileOpen(false);
            }}
          >
            <ListItemIcon>
              <HistoryIcon />
            </ListItemIcon>
            <ListItemText primary="Auditoría" />
          </ListItemButton>
        )}
        {puedeContacto && (
          <ListItemButton
            selected={loc.pathname.startsWith("/admin/contacto")}
            onClick={() => {
              nav("/admin/contacto");
              setMobileOpen(false);
            }}
            sx={btnSx}
          >
            <ListItemIcon>
              <RoomIcon />
            </ListItemIcon>
            <ListItemText primary="Contacto" />
          </ListItemButton>
        )}
      </List>
      <ListItemButton
        selected={loc.pathname.startsWith("/admin/mensajes")}
        onClick={() => {
          nav("/admin/mensajes");
          setMobileOpen(false);
        }}
        sx={btnSx}
      >
        <ListItemIcon>
          <MailIcon />
        </ListItemIcon>
        <ListItemText primary="Mensajes" />
      </ListItemButton>
      <Box sx={{ flexGrow: 1 }} />
      <Divider />
      <List>
        <ListItemButton sx={btnSx} onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Cerrar sesión" />
        </ListItemButton>
      </List>
    </Box>
  );

  return (
    <AuthCtx.Provider value={{ usuario, rol }}>
      <Box
        sx={{
          display: "flex",
          minHeight: "100vh",
          bgcolor: (t) => t.palette.background.default,
        }}
      >
        <AppBar
          position="fixed"
          color="default"
          elevation={0}
          sx={{ borderBottom: 1, borderColor: "divider" }}
        >
          <Toolbar>
            <IconButton
              edge="start"
              sx={{ mr: 2, display: { md: "none" } }}
              onClick={() => setMobileOpen((v) => !v)}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" sx={{ fontWeight: 800, flexGrow: 1 }}>
              Jhoann Barber
            </Typography>
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
              <Avatar sx={{ width: 32, height: 32 }}>
                {String(usuario?.correo || "U")
                  .charAt(0)
                  .toUpperCase()}
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
            >
              <MenuItem disabled>{usuario?.correo}</MenuItem>
              <MenuItem onClick={() => nav("/perfil")}>
                <AccountCircleIcon
                  fontSize="small"
                  style={{ marginRight: 8 }}
                />
                Perfil
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <LogoutIcon fontSize="small" style={{ marginRight: 8 }} />
                Cerrar sesión
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

        <Box
          component="nav"
          sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
        >
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            ModalProps={{ keepMounted: true }}
            sx={{
              display: { xs: "block", md: "none" },
              "& .MuiDrawer-paper": {
                boxSizing: "border-box",
                width: drawerWidth,
              },
            }}
          >
            {drawer}
          </Drawer>
          <Drawer
            variant="permanent"
            open
            sx={{
              display: { xs: "none", md: "block" },
              "& .MuiDrawer-paper": {
                boxSizing: "border-box",
                width: drawerWidth,
              },
            }}
          >
            {drawer}
          </Drawer>
        </Box>

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: 2, md: 3 },
            width: { md: `calc(100% - ${drawerWidth}px)` },
          }}
        >
          <Toolbar />
          <Outlet />
        </Box>
      </Box>
    </AuthCtx.Provider>
  );
}
