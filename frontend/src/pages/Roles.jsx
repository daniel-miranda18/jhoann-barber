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
  Autocomplete,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import dayjs from "dayjs";
import {
  listarRoles,
  detalleRol,
  crearRol,
  actualizarRol,
  syncPermisosRol,
  listarPermisos,
} from "../services/aclServicio";

function useDebounced(value, ms = 350) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setV(value), ms);
    return () => clearTimeout(id);
  }, [value, ms]);
  return v;
}

function RolForm({ open, onClose, onSubmit, initial, permisos }) {
  const [nombre, setNombre] = useState(initial?.nombre || "");
  const [descripcion, setDescripcion] = useState(initial?.descripcion || "");
  const [esta_activo, setActivo] = useState(
    typeof initial?.esta_activo === "number" ? initial?.esta_activo === 1 : true
  );
  const [perms, setPerms] = useState(
    (initial?.permisos || []).map((p) => p.clave)
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setNombre(initial?.nombre || "");
    setDescripcion(initial?.descripcion || "");
    setActivo(
      typeof initial?.esta_activo === "number"
        ? initial?.esta_activo === 1
        : true
    );
    setPerms((initial?.permisos || []).map((p) => p.clave));
  }, [initial, open]);

  async function submit() {
    setSaving(true);
    try {
      await onSubmit({ nombre, descripcion, esta_activo, permisos: perms });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{initial ? "Editar rol" : "Nuevo rol"}</DialogTitle>
      <DialogContent dividers>
        <div className="container-fluid">
          <div className="row g-3">
            <div className="col-12">
              <TextField
                size="small"
                fullWidth
                label="Nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
            </div>
            <div className="col-12">
              <TextField
                size="small"
                fullWidth
                label="Descripción"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
              />
            </div>
            <div className="col-12">
              <Autocomplete
                multiple
                options={(permisos?.data || []).map((p) => p.clave)}
                value={perms}
                onChange={(_, v) => setPerms(v)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    size="small"
                    label="Permisos"
                    placeholder="Seleccionar"
                  />
                )}
              />
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

function RolView({ open, onClose, rol }) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Detalle de rol</DialogTitle>
      <DialogContent dividers>
        <Typography>
          <strong>Nombre:</strong> {rol?.data?.nombre}
        </Typography>
        <Typography>
          <strong>Descripción:</strong> {rol?.data?.descripcion || "—"}
        </Typography>
        <Typography sx={{ mb: 1 }}>
          <strong>Estado:</strong>{" "}
          {rol?.data?.esta_activo ? "Activo" : "Inactivo"}
        </Typography>
        <div className="d-flex flex-wrap gap-1">
          {(rol?.data?.permisos || []).map((p) => (
            <Chip key={p.id} size="small" label={p.clave} />
          ))}
          {!(rol?.data?.permisos || []).length && (
            <Typography color="text.secondary">Sin permisos</Typography>
          )}
        </div>
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
          Inhabilitar
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function Roles() {
  const [rowsAll, setRowsAll] = useState([]);
  const [q, setQ] = useState("");
  const [estado, setEstado] = useState("todos");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openForm, setOpenForm] = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [viewData, setViewData] = useState(null);
  const [toDisable, setToDisable] = useState(null);
  const [snack, setSnack] = useState({ open: false, msg: "", sev: "success" });
  const [permisos, setPermisos] = useState({ data: [] });

  const qDebounced = useDebounced(q, 350);

  const rows = useMemo(() => {
    let r = [...rowsAll];
    if (estado !== "todos")
      r = r.filter((x) =>
        estado === "activo" ? x.esta_activo : !x.esta_activo
      );
    if (qDebounced) {
      const s = qDebounced.toLowerCase();
      r = r.filter(
        (x) =>
          (x.nombre || "").toLowerCase().includes(s) ||
          (x.descripcion || "").toLowerCase().includes(s)
      );
    }
    return r;
  }, [rowsAll, qDebounced, estado]);

  const paged = useMemo(() => {
    const start = page * rowsPerPage;
    return rows.slice(start, start + rowsPerPage);
  }, [rows, page, rowsPerPage]);

  async function fetchAll() {
    setLoading(true);
    try {
      const [rs, ps] = await Promise.all([listarRoles(), listarPermisos()]);
      setRowsAll(rs.data || []);
      setPermisos(ps);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => {
    setPage(0);
  }, [qDebounced, estado]);

  async function handleCreate(payload) {
    try {
      await crearRol(payload);
      setOpenForm(false);
      setEditRow(null);
      setSnack({ open: true, msg: "Rol creado", sev: "success" });
      fetchAll();
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
      await actualizarRol(editRow.id, {
        nombre: payload.nombre,
        descripcion: payload.descripcion,
        esta_activo: payload.esta_activo,
      });
      await syncPermisosRol(editRow.id, payload.permisos || []);
      setOpenForm(false);
      setEditRow(null);
      setSnack({ open: true, msg: "Rol actualizado", sev: "success" });
      fetchAll();
    } catch (e) {
      setSnack({
        open: true,
        msg: e?.response?.data?.mensaje || "Error",
        sev: "error",
      });
    }
  }

  async function handleDisable() {
    try {
      await actualizarRol(toDisable.id, { esta_activo: false });
      setToDisable(null);
      setSnack({ open: true, msg: "Rol inhabilitado", sev: "success" });
      fetchAll();
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
      const d = await detalleRol(id);
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
          Lista de Roles
        </Typography>
      </div>
      <div className="container-fluid px-0">
        <div className="row g-2 align-items-center mb-2">
          <div className="col-12 col-md-6 col-lg-6">
            <TextField
              fullWidth
              size="small"
              placeholder="Buscar por nombre o descripción"
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
          <div className="col-12 col-md-12 col-lg-4 d-flex justify-content-lg-end">
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
                <TableCell>Nombre</TableCell>
                <TableCell>Descripción</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Desde</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paged.map((r) => (
                <TableRow key={r.id} hover>
                  <TableCell>{r.nombre}</TableCell>
                  <TableCell>{r.descripcion || "—"}</TableCell>
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
                      onClick={async () => {
                        const d = await detalleRol(r.id);
                        setEditRow({ ...r, permisos: d?.data?.permisos || [] });
                        setOpenForm(true);
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton color="error" onClick={() => setToDisable(r)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {!paged.length && !loading && (
                <TableRow>
                  <TableCell colSpan={5}>
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
        {rows.map((r) => (
          <Paper key={r.id} variant="outlined" className="p-3 mb-2">
            <div className="d-flex justify-content-between align-items-start gap-2">
              <div>
                <Typography variant="subtitle1" fontWeight={700}>
                  {r.nombre}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {r.descripcion || "—"}
                </Typography>
              </div>
              <Chip
                size="small"
                color={r.esta_activo ? "success" : "default"}
                label={r.esta_activo ? "Activo" : "Inactivo"}
              />
            </div>
            <div className="mt-2 d-flex justify-content-end gap-1">
              <IconButton onClick={() => openView(r.id)}>
                <VisibilityIcon />
              </IconButton>
              <IconButton
                onClick={async () => {
                  const d = await detalleRol(r.id);
                  setEditRow({ ...r, permisos: d?.data?.permisos || [] });
                  setOpenForm(true);
                }}
              >
                <EditIcon />
              </IconButton>
              <IconButton color="error" onClick={() => setToDisable(r)}>
                <DeleteIcon />
              </IconButton>
            </div>
          </Paper>
        ))}
        {!rows.length && !loading && (
          <div className="py-4 text-center text-muted">Sin resultados</div>
        )}
      </div>

      <TablePagination
        component="div"
        count={rows.length}
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
          `${from}–${to} de ${count}`
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
      <RolForm
        open={openForm}
        onClose={() => {
          setOpenForm(false);
          setEditRow(null);
        }}
        onSubmit={editRow ? handleUpdate : handleCreate}
        initial={editRow}
        permisos={permisos}
      />

      <RolView
        open={Boolean(viewData)}
        onClose={() => setViewData(null)}
        rol={viewData}
      />

      <ConfirmDialog
        open={Boolean(toDisable)}
        onClose={() => setToDisable(null)}
        onConfirm={handleDisable}
        text="¿Deseas inhabilitar este rol?"
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
