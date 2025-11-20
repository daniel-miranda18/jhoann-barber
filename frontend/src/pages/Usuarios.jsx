import { useEffect, useMemo, useState } from "react";
import {
  Paper,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel,
  Snackbar,
  Alert,
  TableContainer,
  LinearProgress,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import dayjs from "dayjs";
import {
  listarUsuarios,
  crearUsuario,
  detalleUsuario,
  actualizarUsuario,
  eliminarUsuario,
} from "../services/usuariosServicio";
import { listarRoles } from "../services/aclServicio";

function useDebounced(value, ms = 350) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setV(value), ms);
    return () => clearTimeout(id);
  }, [value, ms]);
  return v;
}

function UsuarioForm({ open, onClose, onSubmit, initial, roles }) {
  const [correo_electronico, setCorreo] = useState(
    initial?.correo_electronico || ""
  );
  const [nombres, setNombres] = useState(initial?.nombres || "");
  const [apellidos, setApellidos] = useState(initial?.apellidos || "");
  const [telefono, setTelefono] = useState(initial?.telefono || "");
  const [esta_activo, setActivo] = useState(
    typeof initial?.esta_activo === "number" ? initial?.esta_activo === 1 : true
  );
  const [rol_nombre, setRolNombre] = useState(
    initial?.rol_nombre || initial?.rol?.nombre || ""
  );
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setCorreo(initial?.correo_electronico || "");
    setNombres(initial?.nombres || "");
    setApellidos(initial?.apellidos || "");
    setTelefono(initial?.telefono || "");
    setActivo(
      typeof initial?.esta_activo === "number"
        ? initial?.esta_activo === 1
        : true
    );
    setRolNombre(initial?.rol_nombre || initial?.rol?.nombre || "");
    setErrors({});
  }, [initial, open]);

  function validar() {
    const newErrors = {};

    if (!correo_electronico.trim()) {
      newErrors.correo_electronico = "El correo es requerido";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo_electronico)) {
      newErrors.correo_electronico = "Correo inválido";
    }

    if (!nombres.trim()) {
      newErrors.nombres = "Los nombres son requeridos";
    } else if (/\d/.test(nombres)) {
      newErrors.nombres = "Los nombres no pueden contener números";
    }

    if (!apellidos.trim()) {
      newErrors.apellidos = "Los apellidos son requeridos";
    } else if (/\d/.test(apellidos)) {
      newErrors.apellidos = "Los apellidos no pueden contener números";
    }

    if (!telefono.trim()) {
      newErrors.telefono = "El celular es requerido";
    } else if (!/^\d{8}$/.test(telefono)) {
      newErrors.telefono = "El celular debe tener 8 dígitos válidos en Bolivia";
    }

    if (!rol_nombre) {
      newErrors.rol_nombre = "Debe seleccionar un rol";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function submit() {
    if (!validar()) return;

    setSaving(true);
    try {
      await onSubmit({
        correo_electronico: correo_electronico.trim(),
        nombres: nombres.trim() || null,
        apellidos: apellidos.trim() || null,
        telefono: telefono.trim() || null,
        esta_activo,
        rol_nombre,
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{initial ? "Editar usuario" : "Nuevo usuario"}</DialogTitle>
      <DialogContent dividers>
        <div className="container-fluid">
          <div className="row g-3">
            <div className="col-12">
              <TextField
                size="small"
                fullWidth
                label="Correo electrónico"
                type="email"
                value={correo_electronico}
                onChange={(e) => setCorreo(e.target.value)}
                error={!!errors.correo_electronico}
                helperText={errors.correo_electronico}
              />
            </div>
            <div className="col-12">
              <TextField
                size="small"
                fullWidth
                label="Nombres"
                value={nombres}
                onChange={(e) => setNombres(e.target.value)}
                error={!!errors.nombres}
                helperText={errors.nombres}
              />
            </div>
            <div className="col-12">
              <TextField
                size="small"
                fullWidth
                label="Apellidos"
                value={apellidos}
                onChange={(e) => setApellidos(e.target.value)}
                error={!!errors.apellidos}
                helperText={errors.apellidos}
              />
            </div>
            <div className="col-12">
              <TextField
                size="small"
                fullWidth
                label="Celular"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                error={!!errors.telefono}
                helperText={errors.telefono}
              />
            </div>
            <div className="col-12">
              <FormControl fullWidth size="small" error={!!errors.rol_nombre}>
                <InputLabel>Rol</InputLabel>
                <Select
                  label="Rol"
                  value={rol_nombre}
                  onChange={(e) => setRolNombre(e.target.value)}
                >
                  {(roles?.data || []).map((r) => (
                    <MenuItem key={r.id} value={r.nombre}>
                      {r.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {errors.rol_nombre && (
                <Typography variant="caption" color="error">
                  {errors.rol_nombre}
                </Typography>
              )}
            </div>
            <div className="col-12">
              <FormControlLabel
                control={
                  <Switch
                    checked={esta_activo}
                    onChange={(e) => setActivo(e.target.checked)}
                  />
                }
                label="Activo"
              />
            </div>
          </div>
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" disabled={saving} onClick={submit}>
          {saving ? "Guardando…" : "Guardar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function UsuarioView({ open, onClose, usuario }) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Detalle de usuario</DialogTitle>
      <DialogContent dividers>
        <Typography>
          <strong>Correo Electrónico:</strong>{" "}
          {usuario?.data?.correo_electronico}
        </Typography>
        <Typography>
          <strong>Nombres:</strong> {usuario?.data?.nombres || "—"}
        </Typography>
        <Typography>
          <strong>Apellidos:</strong> {usuario?.data?.apellidos || "—"}
        </Typography>
        <Typography>
          <strong>Teléfono:</strong> {usuario?.data?.telefono || "—"}
        </Typography>
        <Typography>
          <strong>Estado:</strong>{" "}
          {usuario?.data?.esta_activo ? "Activo" : "Inactivo"}
        </Typography>
        <Typography>
          <strong>Roles:</strong>{" "}
          {(usuario?.data?.roles || []).map((r) => r.nombre).join(", ") || "—"}
        </Typography>
        <Typography>
          <strong>Creado:</strong>{" "}
          {usuario?.data?.creado_en
            ? dayjs(usuario.data.creado_en).format("YYYY-MM-DD HH:mm")
            : "—"}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
}

function ConfirmDialog({ open, onClose, onConfirm, text }) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Confirmación</DialogTitle>
      <DialogContent dividers>
        <Typography>{text}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" color="error" onClick={onConfirm}>
          Eliminar
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function Usuarios() {
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    per_page: 10,
    pages: 0,
  });
  const [q, setQ] = useState("");
  const [estado, setEstado] = useState("todos");
  const [rol, setRol] = useState("todos");
  const [roles, setRoles] = useState({ data: [] });
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openForm, setOpenForm] = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [viewData, setViewData] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [snack, setSnack] = useState({ open: false, msg: "", sev: "success" });

  const qDebounced = useDebounced(q, 350);
  const estadoParam = useMemo(
    () => (estado === "todos" ? undefined : estado),
    [estado]
  );
  const rolParam = useMemo(() => (rol === "todos" ? undefined : rol), [rol]);

  async function fetchRoles() {
    try {
      const r = await listarRoles();
      setRoles(r);
    } catch {}
  }

  async function fetchData(p = page, rpp = rowsPerPage, qq = qDebounced) {
    setLoading(true);
    try {
      const res = await listarUsuarios({
        page: p + 1,
        per_page: rpp,
        q: qq || undefined,
        estado: estadoParam,
        rol_nombre: rolParam,
      });
      setRows(res.data || []);
      setMeta(res.meta || { total: 0, page: 1, per_page: rpp, pages: 0 });
    } catch {
      setRows([]);
      setMeta({ total: 0, page: 1, per_page: rpp, pages: 0 });
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    fetchRoles();
  }, []);
  useEffect(() => {
    fetchData();
  }, [page, rowsPerPage]);
  useEffect(() => {
    setPage(0);
    fetchData(0, rowsPerPage);
  }, [qDebounced, estadoParam, rolParam]);

  async function handleCreate(payload) {
    try {
      await crearUsuario(payload);
      setOpenForm(false);
      setEditRow(null);
      setSnack({ open: true, msg: "Usuario creado", sev: "success" });
      fetchData(0, rowsPerPage);
    } catch (e) {
      setSnack({
        open: true,
        msg: e?.response?.data?.mensaje || "Error",
        sev: "error",
      });
    }
  }

  async function handleUpdate(payload) {
    try {
      await actualizarUsuario(editRow.id, payload);
      setOpenForm(false);
      setEditRow(null);
      setSnack({ open: true, msg: "Usuario actualizado", sev: "success" });
      fetchData(page, rowsPerPage);
    } catch (e) {
      setSnack({
        open: true,
        msg: e?.response?.data?.mensaje || "Error",
        sev: "error",
      });
    }
  }

  async function handleDelete() {
    try {
      await eliminarUsuario(toDelete.id);
      setToDelete(null);
      setSnack({ open: true, msg: "Usuario eliminado", sev: "success" });
      fetchData(page, rowsPerPage);
    } catch (e) {
      setSnack({
        open: true,
        msg: e?.response?.data?.mensaje || "Error",
        sev: "error",
      });
    }
  }

  async function openView(id) {
    try {
      const d = await detalleUsuario(id);
      setViewData(d);
    } catch {}
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, md: 3 },
        borderRadius: 3,
        border: 1,
        borderColor: "divider",
      }}
    >
      <div className="container">
        <Typography
          variant="h4"
          sx={{ fontWeight: 900, mb: 1, color: "#212529" }}
        >
          Lista de Usuarios
        </Typography>
      </div>
      <div className="container-fluid px-0">
        <div className="row g-2 align-items-center mb-2">
          <div className="col-12 col-md-6 col-lg-6">
            <TextField
              fullWidth
              size="small"
              placeholder="Buscar por nombre o correo electrónico"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Escape" && setQ("")}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </div>
          <div className="col-6 col-md-3 col-lg-2">
            <FormControl size="small" fullWidth>
              <InputLabel>Rol</InputLabel>
              <Select
                label="Rol"
                value={rol}
                onChange={(e) => setRol(e.target.value)}
              >
                <MenuItem value="todos">Todos</MenuItem>
                {(roles?.data || []).map((r) => (
                  <MenuItem key={r.id} value={r.nombre}>
                    {r.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
          <div className="col-6 col-md-3 col-lg-2">
            <FormControl size="small" fullWidth>
              <InputLabel>Estado</InputLabel>
              <Select
                label="Estado"
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
              >
                <MenuItem value="todos">Todos</MenuItem>
                <MenuItem value="activo">Activo</MenuItem>
                <MenuItem value="inactivo">Inactivo</MenuItem>
              </Select>
            </FormControl>
          </div>
          <div className="col-12 col-md-12 col-lg-2 d-flex justify-content-lg-end">
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setEditRow(null);
                setOpenForm(true);
              }}
            >
              Nuevo
            </Button>
          </div>
        </div>
      </div>

      {loading && <LinearProgress sx={{ mb: 1 }} />}

      <div className="d-none d-md-block">
        <TableContainer sx={{ maxHeight: 520 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell>Usuario</TableCell>
                <TableCell>Correo Electrónico</TableCell>
                <TableCell>Celular</TableCell>
                <TableCell>Rol</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Desde</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id} hover>
                  <TableCell>
                    {[r.nombres, r.apellidos].filter(Boolean).join(" ") || "—"}
                  </TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>
                    {r.correo_electronico}
                  </TableCell>
                  <TableCell>{r.telefono || "—"}</TableCell>
                  <TableCell>
                    <Chip size="small" label={r.rol_nombre || "—"} />
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      color={r.esta_activo ? "success" : "default"}
                      label={r.esta_activo ? "Activo" : "Inactivo"}
                    />
                  </TableCell>
                  <TableCell>
                    {r.creado_en
                      ? dayjs(r.creado_en).format("YYYY-MM-DD")
                      : "—"}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => openView(r.id)}>
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => {
                        setEditRow(r);
                        setOpenForm(true);
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton color="error" onClick={() => setToDelete(r)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {!rows.length && !loading && (
                <TableRow>
                  <TableCell colSpan={7}>
                    <div className="py-4 text-center text-muted">
                      Sin resultados
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </div>

      <div className="d-block d-md-none">
        {rows.map((r) => {
          const nombre =
            [r.nombres, r.apellidos].filter(Boolean).join(" ") || "—";
          return (
            <Paper key={r.id} variant="outlined" className="p-3 mb-2">
              <div className="d-flex justify-content-between align-items-start gap-2">
                <div>
                  <Typography variant="subtitle1" fontWeight={700}>
                    {nombre}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {r.correo_electronico}
                  </Typography>
                </div>
                <Chip
                  size="small"
                  color={r.esta_activo ? "success" : "default"}
                  label={r.esta_activo ? "Activo" : "Inactivo"}
                />
              </div>
              <div className="mt-2 d-flex flex-wrap gap-2">
                <Chip size="small" label={r.rol_nombre || "—"} />
                <Typography variant="body2">
                  Tel: {r.telefono || "—"}
                </Typography>
                <Typography variant="body2">
                  Desde:{" "}
                  {r.creado_en ? dayjs(r.creado_en).format("YYYY-MM-DD") : "—"}
                </Typography>
              </div>
              <div className="mt-2 d-flex justify-content-end gap-1">
                <IconButton onClick={() => openView(r.id)}>
                  <VisibilityIcon />
                </IconButton>
                <IconButton
                  onClick={() => {
                    setEditRow(r);
                    setOpenForm(true);
                  }}
                >
                  <EditIcon />
                </IconButton>
                <IconButton color="error" onClick={() => setToDelete(r)}>
                  <DeleteIcon />
                </IconButton>
              </div>
            </Paper>
          );
        })}
        {!rows.length && !loading && (
          <div className="py-4 text-center text-muted">Sin resultados</div>
        )}
      </div>

      <TablePagination
        component="div"
        count={meta.total}
        page={page}
        onPageChange={(_, p) => setPage(p)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        rowsPerPageOptions={[5, 10, 20, 50]}
        labelRowsPerPage="Por página"
        labelDisplayedRows={({ from, to, count }) =>
          `${from}–${to} de ${count !== -1 ? count : `más de ${to}`}`
        }
        getItemAriaLabel={(type) =>
          ({
            first: "Primera página",
            last: "Última página",
            next: "Siguiente página",
            previous: "Página anterior",
          }[type])
        }
        sx={{
          "& .MuiTablePagination-toolbar": {
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 1,
          },
          "& .MuiTablePagination-spacer": { flex: "none" },
          "& .MuiTablePagination-selectLabel": { m: 0 },
          "& .MuiTablePagination-select": { m: 0 },
          "& .MuiTablePagination-displayedRows": { m: 0 },
        }}
      />

      <UsuarioForm
        open={openForm}
        onClose={() => {
          setOpenForm(false);
          setEditRow(null);
        }}
        onSubmit={editRow ? handleUpdate : handleCreate}
        initial={editRow}
        roles={roles}
      />
      <UsuarioView
        open={Boolean(viewData)}
        onClose={() => setViewData(null)}
        usuario={viewData}
      />

      <ConfirmDialog
        open={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        onConfirm={handleDelete}
        text="¿Deseas eliminar este usuario? Se inhabilitará a este usuario."
      />

      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
      >
        <Alert
          severity={snack.sev}
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </Paper>
  );
}
