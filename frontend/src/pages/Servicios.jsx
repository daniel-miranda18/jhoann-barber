import { useEffect, useMemo, useState } from "react";
import {
  Paper,
  Typography,
  Button,
  TextField,
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
  Stack,
  Tooltip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ImageIcon from "@mui/icons-material/Image";
import dayjs from "dayjs";
import {
  listarServicios,
  crearServicio,
  detalleServicio,
  actualizarServicio,
  eliminarServicio,
  subirImagenServicio,
  eliminarImagenServicio,
} from "../services/serviciosServicio";

function useDebounced(value, ms = 350) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setV(value), ms);
    return () => clearTimeout(id);
  }, [value, ms]);
  return v;
}

function ServicioForm({ open, onClose, onSubmit, initial }) {
  const stringifyPrecio = (v) => {
    if (v === null || v === undefined || v === "") return "0";
    return String(v);
  };

  const [nombre, setNombre] = useState(initial?.nombre || "");
  const [descripcion, setDescripcion] = useState(initial?.descripcion || "");
  const [duracion_minutos, setDuracion] = useState(
    typeof initial?.duracion_minutos === "number"
      ? initial.duracion_minutos
      : 60
  );
  const [precio, setPrecio] = useState(stringifyPrecio(initial?.precio));
  const [esta_activo, setActivo] = useState(
    typeof initial?.esta_activo === "number" ? initial.esta_activo === 1 : true
  );
  const [esta_publicado, setPublicado] = useState(
    typeof initial?.esta_publicado === "number"
      ? initial?.esta_publicado === 1
      : true
  );
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setNombre(initial?.nombre || "");
    setDescripcion(initial?.descripcion || "");
    setDuracion(
      typeof initial?.duracion_minutos === "number"
        ? initial.duracion_minutos
        : 60
    );
    setPrecio(stringifyPrecio(initial?.precio));
    setActivo(
      typeof initial?.esta_activo === "number"
        ? initial?.esta_activo === 1
        : true
    );
    setPublicado(
      typeof initial?.esta_publicado === "number"
        ? initial?.esta_publicado === 1
        : true
    );
    setErrors({});
    setFile(null);
  }, [initial, open]);

  function validar() {
    const newErrors = {};
    if (!String(nombre).trim()) {
      newErrors.nombre = "El nombre es requerido";
    } else if (/\d/.test(nombre)) {
      newErrors.nombre = "El nombre no puede contener números";
    }

    const dur = Number(duracion_minutos);
    if (!Number.isFinite(dur) || isNaN(dur)) {
      newErrors.duracion_minutos = "Duración inválida";
    } else if (dur < 1) {
      newErrors.duracion_minutos = "La duración debe ser al menos 1 minuto";
    }

    const pr = Number(precio);
    if (!Number.isFinite(pr) || isNaN(pr)) {
      newErrors.precio = "Precio inválido";
    } else if (pr < 0) {
      newErrors.precio = "El precio no puede ser negativo";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function submit() {
    if (!validar()) return;
    setSaving(true);
    try {
      await onSubmit(
        {
          nombre: nombre.trim(),
          descripcion: descripcion.trim() || null,
          duracion_minutos: Number(duracion_minutos),
          precio: Number(precio),
          esta_activo,
          esta_publicado,
        },
        file
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {initial ? "Editar servicio" : "Nuevo servicio"}
      </DialogTitle>
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
                error={!!errors.nombre}
                helperText={errors.nombre}
              />
            </div>
            <div className="col-12">
              <TextField
                size="small"
                fullWidth
                label="Descripción"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                multiline
                rows={3}
              />
            </div>
            <div className="col-12">
              <TextField
                size="small"
                fullWidth
                label="Duración (min)"
                type="number"
                inputProps={{ min: 1 }}
                value={duracion_minutos}
                onChange={(e) => setDuracion(e.target.value)}
                error={!!errors.duracion_minutos}
                helperText={errors.duracion_minutos}
              />
            </div>
            <div className="col-12">
              <TextField
                size="small"
                fullWidth
                label="Precio"
                type="number"
                inputProps={{ min: 0, step: "0.01" }}
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
                error={!!errors.precio}
                helperText={errors.precio}
              />
            </div>
            <div className="col-12">
              <FormControlLabel
                control={
                  <Switch
                    checked={esta_publicado}
                    onChange={(e) => setPublicado(e.target.checked)}
                  />
                }
                label="Publicado"
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
            <div className="col-12">
              <Stack direction="row" spacing={1} alignItems="center">
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<ImageIcon />}
                >
                  {file
                    ? "Cambiar imagen"
                    : initial?.foto_principal
                    ? "Reemplazar imagen"
                    : "Imagen del servicio"}
                  <input
                    hidden
                    accept="image/*"
                    type="file"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                </Button>
                {file && (
                  <Button variant="text" onClick={() => setFile(null)}>
                    Quitar
                  </Button>
                )}
              </Stack>
              {!file && initial?.foto_principal && (
                <div className="mt-2">
                  <img
                    src={`${import.meta.env.VITE_API_URL}${
                      initial.foto_principal
                    }`}
                    alt=""
                    style={{ maxHeight: 140, borderRadius: 8 }}
                  />
                </div>
              )}
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

function ServicioView({ open, onClose, data, onRefresh }) {
  const servicio = data?.data || null;
  const [deletingImg, setDeletingImg] = useState(false);

  async function handleEliminarImagen() {
    if (!servicio?.id) return;
    if (!confirm("¿Deseas quitar la imagen del servicio?")) return;
    setDeletingImg(true);
    try {
      await eliminarImagenServicio(servicio.id);
      onRefresh?.();
    } catch (e) {
    } finally {
      setDeletingImg(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Detalle de servicio</DialogTitle>
      <DialogContent dividers>
        {servicio?.foto_principal && (
          <div style={{ marginBottom: 12, textAlign: "center" }}>
            <img
              src={`${import.meta.env.VITE_API_URL}${servicio.foto_principal}`}
              alt=""
              style={{ maxWidth: "100%", maxHeight: 240, borderRadius: 8 }}
            />
            <div className="mt-2">
              <Button
                variant="outlined"
                color="error"
                size="small"
                onClick={handleEliminarImagen}
                disabled={deletingImg}
              >
                {deletingImg ? "Eliminando…" : "Quitar imagen"}
              </Button>
            </div>
          </div>
        )}
        <Typography>
          <strong>Nombre:</strong> {servicio?.nombre}
        </Typography>
        <Typography>
          <strong>Descripción:</strong> {servicio?.descripcion || "—"}
        </Typography>
        <Typography>
          <strong>Duración:</strong> {servicio?.duracion_minutos} min
        </Typography>
        <Typography>
          <strong>Precio:</strong> {Number(servicio?.precio || 0).toFixed(2)}
        </Typography>
        <Typography>
          <strong>Publicado:</strong> {servicio?.esta_publicado ? "Sí" : "No"}
        </Typography>
        <Typography>
          <strong>Estado:</strong>{" "}
          {servicio?.esta_activo ? "Activo" : "Inactivo"}
        </Typography>
        <Typography>
          <strong>Creado:</strong>{" "}
          {servicio?.creado_en
            ? dayjs(servicio.creado_en).format("YYYY-MM-DD HH:mm")
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

export default function Servicios() {
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    per_page: 10,
    pages: 0,
  });
  const [q, setQ] = useState("");
  const [estado, setEstado] = useState("todos");
  const [publicado, setPublicado] = useState("todos");
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
  const publicadoParam = useMemo(
    () => (publicado === "todos" ? undefined : publicado),
    [publicado]
  );

  async function fetchData(p = page, rpp = rowsPerPage, qq = qDebounced) {
    setLoading(true);
    try {
      const res = await listarServicios({
        page: p + 1,
        per_page: rpp,
        q: qq || undefined,
        estado: estadoParam,
        publicado: publicadoParam,
      });
      setRows(res.data || []);
      setMeta(res.meta || { total: 0, page: 1, per_page: rpp, pages: 0 });
    } catch (e) {
      setRows([]);
      setMeta({ total: 0, page: 1, per_page: rpp, pages: 0 });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, [page, rowsPerPage]);

  useEffect(() => {
    setPage(0);
    fetchData(0, rowsPerPage);
  }, [qDebounced, estadoParam, publicadoParam]);

  async function handleCreate(payload, file) {
    try {
      const r = await crearServicio(payload);
      const nuevo = r?.data;
      if (file && nuevo?.id) {
        try {
          await subirImagenServicio(nuevo.id, file);
        } catch {}
      }
      setOpenForm(false);
      setEditRow(null);
      setSnack({ open: true, msg: "Servicio creado", sev: "success" });
      fetchData(0, rowsPerPage);
    } catch (e) {
      setSnack({
        open: true,
        msg: e?.response?.data?.mensaje || "Error",
        sev: "error",
      });
    }
  }

  async function handleUpdate(payload, file) {
    try {
      await actualizarServicio(editRow.id, payload);
      if (file) {
        try {
          await subirImagenServicio(editRow.id, file);
        } catch {}
      }
      setOpenForm(false);
      setEditRow(null);
      setSnack({ open: true, msg: "Servicio actualizado", sev: "success" });
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
      await eliminarServicio(toDelete.id);
      setToDelete(null);
      setSnack({ open: true, msg: "Servicio inhabilitado", sev: "success" });
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
      const d = await detalleServicio(id);
      setViewData(d);
    } catch (e) {}
  }

  async function refreshDetail() {
    if (!viewData?.data?.id) return;
    await openView(viewData.data.id);
    fetchData(page, rowsPerPage);
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
          Lista de Servicios
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
              InputProps={{ startAdornment: <SearchIcon /> }}
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

          <div className="col-6 col-md-3 col-lg-2">
            <FormControl size="small" fullWidth>
              <InputLabel>Publicación</InputLabel>
              <Select
                label="Publicación"
                value={publicado}
                onChange={(e) => setPublicado(e.target.value)}
              >
                <MenuItem value="todos">Todos</MenuItem>
                <MenuItem value="publicado">Publicado</MenuItem>
                <MenuItem value="no_publicado">No publicado</MenuItem>
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
                <TableCell>Imagen</TableCell>
                <TableCell>Nombre</TableCell>
                <TableCell>Duración</TableCell>
                <TableCell>Precio</TableCell>
                <TableCell>Publicado</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Desde</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id} hover>
                  <TableCell>
                    <img
                      src={
                        r.foto_principal
                          ? `${import.meta.env.VITE_API_URL}${r.foto_principal}`
                          : "https://via.placeholder.com/160x90?text=Sin+imagen"
                      }
                      alt={r.nombre || ""}
                      style={{
                        width: 120,
                        height: 80,
                        objectFit: "cover",
                        borderRadius: 6,
                      }}
                    />
                  </TableCell>
                  <TableCell>{r.nombre}</TableCell>
                  <TableCell>{r.duracion_minutos} min</TableCell>
                  <TableCell>
                    {typeof r.precio === "number"
                      ? r.precio.toFixed(2)
                      : Number(r.precio || 0).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      color={r.esta_publicado ? "success" : "default"}
                      label={r.esta_publicado ? "Sí" : "No"}
                    />
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
                    <Tooltip title="Ver detalle">
                      <IconButton onClick={() => openView(r.id)}>
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Editar">
                      <IconButton
                        onClick={() => {
                          setEditRow(r);
                          setOpenForm(true);
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar">
                      <IconButton color="error" onClick={() => setToDelete(r)}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {!rows.length && !loading && (
                <TableRow>
                  <TableCell colSpan={8}>
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
              <div style={{ display: "flex", gap: 12 }}>
                <div
                  style={{
                    width: 88,
                    height: 64,
                    background: "#f6f6f6",
                    borderRadius: 8,
                    overflow: "hidden",
                  }}
                >
                  <img
                    src={
                      r.foto_principal
                        ? `${import.meta.env.VITE_API_URL}${r.foto_principal}`
                        : "https://via.placeholder.com/160x90?text=Sin+imagen"
                    }
                    alt={r.nombre || ""}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                </div>
                <div>
                  <Typography variant="subtitle1" fontWeight={700}>
                    {r.nombre}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {r.duracion_minutos} min • Bs.{" "}
                    {typeof r.precio === "number"
                      ? r.precio.toFixed(2)
                      : Number(r.precio || 0).toFixed(2)}
                  </Typography>
                </div>
              </div>
              <Chip
                size="small"
                color={r.esta_activo ? "success" : "default"}
                label={r.esta_activo ? "Activo" : "Inactivo"}
              />
            </div>
            <div className="mt-2 d-flex flex-wrap gap-2">
              <Chip
                size="small"
                label={r.esta_publicado ? "Publicado" : "No publicado"}
              />
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
        ))}
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

      <ServicioForm
        open={openForm}
        onClose={() => {
          setOpenForm(false);
          setEditRow(null);
        }}
        onSubmit={editRow ? handleUpdate : handleCreate}
        initial={editRow}
      />

      <ServicioView
        open={Boolean(viewData)}
        onClose={() => setViewData(null)}
        data={viewData}
        onRefresh={refreshDetail}
      />

      <ConfirmDialog
        open={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        onConfirm={handleDelete}
        text="¿Deseas eliminar este servicio? Se inhabilitará."
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
