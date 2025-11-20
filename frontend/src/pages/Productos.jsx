import { useEffect, useMemo, useState } from "react";
import {
  Paper,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Chip,
  IconButton,
  LinearProgress,
  TablePagination,
  Grid,
  Stack,
  Switch,
  FormControlLabel,
  Tooltip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ImageIcon from "@mui/icons-material/Image";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import StarIcon from "@mui/icons-material/Star";
import CloseIcon from "@mui/icons-material/Close";
import dayjs from "dayjs";
import {
  listarProductos,
  crearProducto,
  detalleProducto,
  actualizarProducto,
  eliminarProducto,
  agregarFotosProducto,
  eliminarFotoProducto,
  marcarPrincipalProducto,
} from "../services/productosServicio";

function useDebounced(v, ms = 350) {
  const [x, setX] = useState(v);
  useEffect(() => {
    const id = setTimeout(() => setX(v), ms);
    return () => clearTimeout(id);
  }, [v, ms]);
  return x;
}

function generarSKU(nombre, precio) {
  if (!nombre || precio === "" || precio === null || isNaN(Number(precio))) {
    return "";
  }
  const nombreParte = nombre
    .toUpperCase()
    .replace(/\s+/g, "")
    .substring(0, 6)
    .padEnd(6, "X");
  // Tomar el precio como número entero
  const precioParte = String(Math.floor(Number(precio)));
  return `${nombreParte}-${precioParte}`;
}

function ProductoForm({ open, onClose, onSubmit, initial, notify }) {
  const [nombre, setNombre] = useState(initial?.nombre || "");
  const [descripcion, setDescripcion] = useState(initial?.descripcion || "");
  const [precio_unitario, setPrecio] = useState(
    initial?.precio_unitario ? String(initial.precio_unitario) : ""
  );
  const [costo_unitario, setCosto] = useState(
    initial?.costo_unitario ? String(initial.costo_unitario) : ""
  );
  const [stock, setStock] = useState(
    initial?.stock ? String(initial.stock) : ""
  );
  const [esta_activo, setActivo] = useState(
    typeof initial?.esta_activo === "number" ? initial.esta_activo === 1 : true
  );
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [detalle, setDetalle] = useState(null);
  const [adding, setAdding] = useState(false);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [errors, setErrors] = useState({});

  const [touched, setTouched] = useState({
    nombre: false,
    precio_unitario: false,
    stock: false,
  });

  useEffect(() => {
    setNombre(initial?.nombre || "");
    setDescripcion(initial?.descripcion || "");
    setPrecio(initial?.precio_unitario ? String(initial.precio_unitario) : "");
    setCosto(initial?.costo_unitario ? String(initial.costo_unitario) : "");
    setStock(initial?.stock ? String(initial.stock) : "");
    setActivo(
      typeof initial?.esta_activo === "number"
        ? initial.esta_activo === 1
        : true
    );
    setFile(null);
    setDetalle(null);
    setTouched({ nombre: false, precio_unitario: false, stock: false });
    setErrors({});
  }, [initial, open]);

  async function loadDetalle() {
    if (!initial?.id) return;
    setCargandoDetalle(true);
    try {
      const d = await detalleProducto(initial.id);
      const x = d?.data;
      setDetalle(x || null);
      if (x) {
        setNombre(x.nombre || "");
        setDescripcion(x.descripcion || "");
        setPrecio(x.precio_unitario ? String(x.precio_unitario) : "");
        setCosto(x.costo_unitario ? String(x.costo_unitario) : "");
        setStock(x.stock ? String(x.stock) : "");
        setActivo(!!x.esta_activo);
      }
    } finally {
      setCargandoDetalle(false);
    }
  }

  useEffect(() => {
    if (open && initial?.id) loadDetalle();
  }, [open, initial?.id]);

  async function addFotos(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length || !initial?.id) return;
    setAdding(true);
    try {
      await agregarFotosProducto(initial.id, files);
      await loadDetalle();
      notify?.("Imágenes agregadas", "success");
    } catch {
      notify?.("Error al agregar imágenes", "error");
    } finally {
      setAdding(false);
      e.target.value = "";
    }
  }

  async function setPrincipal(fotoId) {
    if (!initial?.id) return;
    await marcarPrincipalProducto(initial.id, fotoId);
    await loadDetalle();
    notify?.("Foto principal actualizada", "success");
  }

  async function removeFoto(fotoId) {
    if (!initial?.id) return;
    await eliminarFotoProducto(initial.id, fotoId);
    await loadDetalle();
    notify?.("Foto eliminada", "success");
  }

  async function quitarFotoPrincipalActual() {
    if (!initial?.id || !detalle?.fotos?.length) return;
    const principal = detalle.fotos.find((f) => f.es_principal);
    if (!principal) return;
    await eliminarFotoProducto(initial.id, principal.id);
    await loadDetalle();
    notify?.("Foto principal eliminada", "success");
  }

  function validar() {
    const newErrors = {};

    if (!nombre.trim()) {
      newErrors.nombre = "El nombre es requerido";
    }

    if (
      precio_unitario === "" ||
      isNaN(Number(precio_unitario)) ||
      Number(precio_unitario) < 0
    ) {
      newErrors.precio_unitario = "Precio válido requerido (≥0)";
    }

    if (stock === "" || isNaN(Number(stock)) || Number(stock) < 0) {
      newErrors.stock = "Stock válido requerido (≥0)";
    }

    if (
      costo_unitario &&
      (isNaN(Number(costo_unitario)) || Number(costo_unitario) < 0)
    ) {
      newErrors.costo_unitario = "Costo debe ser válido (≥0)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  const handleNombreChange = (e) => {
    setNombre(e.target.value);
    if (!touched.nombre) setTouched((p) => ({ ...p, nombre: true }));
  };

  const handlePrecioChange = (e) => {
    const val = e.target.value;
    if (val === "" || /^\d*\.?\d*$/.test(val)) {
      setPrecio(val);
    }
    if (!touched.precio_unitario)
      setTouched((p) => ({ ...p, precio_unitario: true }));
  };

  const handleCostoChange = (e) => {
    const val = e.target.value;
    if (val === "" || /^\d*\.?\d*$/.test(val)) {
      setCosto(val);
    }
  };

  const handleStockChange = (e) => {
    const val = e.target.value;
    if (val === "" || /^\d+$/.test(val)) {
      setStock(val);
    }
    if (!touched.stock) setTouched((p) => ({ ...p, stock: true }));
  };

  // Generar SKU automático
  const skuGenerado = generarSKU(nombre, precio_unitario);

  async function submit() {
    if (!validar()) {
      notify?.("Por favor completa los campos correctamente", "warning");
      return;
    }

    setSaving(true);
    try {
      await onSubmit(
        {
          nombre: nombre.trim(),
          descripcion: descripcion.trim() || null,
          sku: skuGenerado || null,
          precio_unitario: Number(precio_unitario),
          costo_unitario: costo_unitario === "" ? null : Number(costo_unitario),
          stock: Number(stock),
          esta_activo,
        },
        file
      );
    } finally {
      setSaving(false);
    }
  }

  const tienePrincipal =
    !!file ||
    !!detalle?.foto_principal ||
    !!initial?.foto_principal ||
    !!detalle?.fotos?.some((f) => f.es_principal);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        {initial ? "Editar producto" : "Nuevo producto"}
      </DialogTitle>
      <DialogContent dividers>
        {cargandoDetalle && <LinearProgress className="mb-3" />}
        <div className="container-fluid">
          <div className="row g-3">
            <div className="col-12">
              <TextField
                size="small"
                fullWidth
                label="Nombre"
                value={nombre}
                onChange={handleNombreChange}
                onBlur={() => setTouched((p) => ({ ...p, nombre: true }))}
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
                label="Código Único"
                value={skuGenerado}
                disabled
              />
            </div>
            <div className="col-6 col-md-3">
              <TextField
                size="small"
                fullWidth
                label="Precio en Venta"
                type="number"
                inputMode="decimal"
                inputProps={{ min: 0, step: "0.01" }}
                value={precio_unitario}
                onChange={handlePrecioChange}
                onBlur={() =>
                  setTouched((p) => ({ ...p, precio_unitario: true }))
                }
                error={!!errors.precio_unitario}
                helperText={errors.precio_unitario}
              />
            </div>
            <div className="col-6 col-md-3">
              <TextField
                size="small"
                fullWidth
                label="Costo"
                type="number"
                inputMode="decimal"
                inputProps={{ min: 0, step: "0.01" }}
                value={costo_unitario}
                onChange={handleCostoChange}
                error={!!errors.costo_unitario}
                helperText={errors.costo_unitario}
              />
            </div>
            <div className="col-6 col-md-3">
              <TextField
                size="small"
                fullWidth
                label="Stock"
                type="number"
                inputMode="numeric"
                inputProps={{ min: 0, step: "1" }}
                value={stock}
                onChange={handleStockChange}
                onBlur={() => setTouched((p) => ({ ...p, stock: true }))}
                error={!!errors.stock}
                helperText={errors.stock}
              />
            </div>
            <div className="col-6 col-md-3 d-flex align-items-center">
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
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<ImageIcon />}
                >
                  {file
                    ? "Cambiar archivo"
                    : initial
                    ? "Reemplazar foto principal"
                    : "Foto principal"}
                  <input
                    hidden
                    accept="image/*"
                    type="file"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                </Button>
                {file && (
                  <Button
                    variant="text"
                    startIcon={<CloseIcon />}
                    onClick={() => setFile(null)}
                  >
                    Quitar selección
                  </Button>
                )}
                {initial?.id && tienePrincipal && (
                  <Button
                    color="error"
                    variant="text"
                    startIcon={<DeleteIcon />}
                    onClick={quitarFotoPrincipalActual}
                  >
                    Quitar foto principal
                  </Button>
                )}
              </Stack>
              {!file &&
                (detalle?.foto_principal || initial?.foto_principal) && (
                  <div className="mt-2">
                    <img
                      src={`${import.meta.env.VITE_API_URL}${
                        detalle?.foto_principal || initial?.foto_principal
                      }`}
                      alt=""
                      style={{ maxHeight: 140, borderRadius: 8 }}
                    />
                  </div>
                )}
            </div>
            {initial?.id && (
              <>
                <div className="col-12 d-flex justify-content-between align-items-center">
                  <Typography variant="subtitle1" fontWeight={700}>
                    Galería
                  </Typography>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<ImageIcon />}
                    disabled={adding}
                  >
                    Agregar imágenes
                    <input
                      hidden
                      accept="image/*"
                      type="file"
                      multiple
                      onChange={addFotos}
                    />
                  </Button>
                </div>
                {adding && (
                  <div className="col-12">
                    <LinearProgress />
                  </div>
                )}
                <div className="col-12">
                  <Grid container spacing={2}>
                    {(detalle?.fotos || []).map((f) => (
                      <Grid item xs={6} sm={4} md={3} key={f.id}>
                        <div className="position-relative">
                          <img
                            src={`${import.meta.env.VITE_API_URL}${f.url}`}
                            alt=""
                            style={{
                              width: "100%",
                              height: 160,
                              objectFit: "cover",
                              borderRadius: 8,
                            }}
                          />
                          <div className="d-flex justify-content-between align-items-center mt-1">
                            <Tooltip title="Principal">
                              <IconButton
                                size="small"
                                onClick={() => setPrincipal(f.id)}
                                color={f.es_principal ? "primary" : "default"}
                              >
                                {f.es_principal ? (
                                  <StarIcon />
                                ) : (
                                  <StarBorderIcon />
                                )}
                              </IconButton>
                            </Tooltip>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => removeFoto(f.id)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </div>
                        </div>
                      </Grid>
                    ))}
                    {!detalle?.fotos?.length && (
                      <Grid item xs={12}>
                        <Typography color="text.secondary">
                          Sin imágenes
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </div>
              </>
            )}
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

function GaleriaDialog({ open, onClose, productoId, notify }) {
  const [detalle, setDetalle] = useState(null);
  const [adding, setAdding] = useState(false);

  async function load() {
    if (!productoId) return;
    const d = await detalleProducto(productoId);
    setDetalle(d?.data || null);
  }

  useEffect(() => {
    if (open && productoId) load();
  }, [open, productoId]);

  async function addFotos(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setAdding(true);
    try {
      await agregarFotosProducto(productoId, files);
      await load();
      notify?.("Imágenes agregadas", "success");
    } catch {
      notify?.("Error al agregar imágenes", "error");
    } finally {
      setAdding(false);
      e.target.value = "";
    }
  }

  async function setPrincipal(fotoId) {
    await marcarPrincipalProducto(productoId, fotoId);
    await load();
    notify?.("Foto principal actualizada", "success");
  }

  async function removeFoto(fotoId) {
    await eliminarFotoProducto(productoId, fotoId);
    await load();
    notify?.("Foto eliminada", "success");
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle>{detalle?.nombre || "Galería del producto"}</DialogTitle>
      <DialogContent dividers>
        <div style={{ marginBottom: 12 }}>
          <Typography variant="subtitle1" fontWeight={700}>
            {detalle?.nombre}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {detalle?.descripcion || "—"}
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <Chip
              label={`Precio: ${Number(detalle?.precio_unitario || 0).toFixed(
                2
              )}`}
            />
            <Chip label={`Stock: ${detalle?.stock ?? "—"}`} />
            <Chip
              color={detalle?.esta_activo ? "success" : "default"}
              label={detalle?.esta_activo ? "Activo" : "Inactivo"}
            />
          </Stack>
        </div>

        <Stack direction="row" spacing={2} alignItems="center" className="mb-3">
          <Button
            variant="outlined"
            component="label"
            startIcon={<ImageIcon />}
            disabled={adding}
          >
            Agregar imágenes
            <input
              hidden
              accept="image/*"
              type="file"
              multiple
              onChange={addFotos}
            />
          </Button>
          {adding && <LinearProgress sx={{ flex: 1 }} />}
        </Stack>

        <Grid container spacing={2}>
          {(detalle?.fotos || []).map((f) => (
            <Grid item xs={6} sm={4} md={3} key={f.id}>
              <div
                style={{
                  borderRadius: 8,
                  overflow: "hidden",
                  background: "#f5f5f5",
                }}
              >
                <div style={{ width: "100%", height: 200, display: "block" }}>
                  <img
                    src={`${import.meta.env.VITE_API_URL}${f.url}`}
                    alt=""
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                </div>
                <div className="d-flex justify-content-between align-items-center p-2">
                  <div>
                    <Typography variant="caption" noWrap>
                      {f.titulo || ""}
                    </Typography>
                  </div>
                  <div>
                    <Tooltip title="Principal">
                      <IconButton
                        size="small"
                        onClick={() => setPrincipal(f.id)}
                        color={f.es_principal ? "primary" : "default"}
                      >
                        {f.es_principal ? <StarIcon /> : <StarBorderIcon />}
                      </IconButton>
                    </Tooltip>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => removeFoto(f.id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </div>
                </div>
              </div>
            </Grid>
          ))}
          {!detalle?.fotos?.length && (
            <Grid item xs={12}>
              <Typography color="text.secondary">Sin imágenes</Typography>
            </Grid>
          )}
        </Grid>
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

export default function Productos() {
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    per_page: 9,
    pages: 0,
  });
  const [q, setQ] = useState("");
  const [estado, setEstado] = useState("todos");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const rowsPerPage = 9;
  const [openForm, setOpenForm] = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [viewData, setViewData] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [snack, setSnack] = useState({ open: false, msg: "", sev: "success" });
  const [galeriaFor, setGaleriaFor] = useState(null);

  const qDebounced = useDebounced(q, 350);
  const estadoParam = useMemo(
    () => (estado === "todos" ? undefined : estado),
    [estado]
  );

  function notify(msg, sev) {
    setSnack({ open: true, msg, sev });
  }

  async function fetchData(p = page, rpp = rowsPerPage, qq = qDebounced) {
    setLoading(true);
    try {
      const res = await listarProductos({
        page: p + 1,
        per_page: rpp,
        q: qq || undefined,
        estado: estadoParam,
      });
      setRows(res.data || []);
      setMeta(res.meta || { total: 0, page: 1, per_page: rpp, pages: 0 });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, [page]);

  useEffect(() => {
    setPage(0);
    fetchData(0, rowsPerPage);
  }, [qDebounced, estadoParam]);

  async function handleCreate(payload, file) {
    try {
      const r = await crearProducto(payload);
      const nuevo = r?.data;
      if (file && nuevo?.id) {
        const up = await agregarFotosProducto(nuevo.id, [file]);
        const last = Array.isArray(up?.data)
          ? up.data[up.data.length - 1]
          : null;
        if (last?.id) await marcarPrincipalProducto(nuevo.id, last.id);
      }
      setOpenForm(false);
      setEditRow(null);
      notify("Producto creado", "success");
      fetchData(0, rowsPerPage);
    } catch (e) {
      notify(e?.response?.data?.mensaje || "Error", "error");
    }
  }

  async function handleUpdate(payload, file) {
    try {
      await actualizarProducto(editRow.id, payload);
      if (file) {
        const up = await agregarFotosProducto(editRow.id, [file]);
        const last = Array.isArray(up?.data)
          ? up.data[up.data.length - 1]
          : null;
        if (last?.id) await marcarPrincipalProducto(editRow.id, last.id);
      }
      setOpenForm(false);
      setEditRow(null);
      notify("Producto actualizado", "success");
      fetchData(page, rowsPerPage);
    } catch (e) {
      notify(e?.response?.data?.mensaje || "Error", "error");
    }
  }

  async function handleDelete() {
    try {
      await eliminarProducto(toDelete.id);
      setToDelete(null);
      notify("Producto inhabilitado", "success");
      fetchData(page, rowsPerPage);
    } catch (e) {
      notify(e?.response?.data?.mensaje || "Error", "error");
    }
  }

  async function openView(id) {
    setGaleriaFor(id);
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
          Lista de Productos
        </Typography>
      </div>
      <div className="container-fluid px-0">
        <div className="row g-2 align-items-center mb-2">
          <div className="col-12 col-md-6 col-lg-6">
            <TextField
              fullWidth
              size="small"
              placeholder="Buscar por nombre, descripción"
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
          <div className="col-12 col-md-3 col-lg-4 d-flex justify-content-lg-end">
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

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      <div className="container-fluid px-0">
        <div className="row g-3">
          {rows.map((r) => (
            <div className="col-12 col-sm-6 col-lg-4" key={r.id}>
              <Card
                variant="outlined"
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  borderRadius: 2,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{ width: "100%", height: 200, background: "#f6f6f6" }}
                >
                  <img
                    src={
                      r.foto_principal
                        ? `${import.meta.env.VITE_API_URL}${r.foto_principal}`
                        : "https://via.placeholder.com/800x600?text=Sin+imagen"
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

                <CardContent sx={{ flexGrow: 1, pt: 2 }}>
                  <Typography
                    variant="subtitle1"
                    fontWeight={800}
                    noWrap
                    title={r.nombre}
                    sx={{ mb: 0.5 }}
                  >
                    {r.nombre}
                  </Typography>
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={{ mb: 1 }}
                  >
                    <Chip size="small" label={`Código: ${r.sku || "—"}`} />
                    <Chip
                      size="small"
                      color={r.esta_activo ? "success" : "default"}
                      label={r.esta_activo ? "Activo" : "Inactivo"}
                    />
                  </Stack>

                  <Typography
                    variant="h6"
                    sx={{ letterSpacing: "-0.02em", mb: 0.5 }}
                  >
                    Bs. {Number(r.precio_unitario || 0).toFixed(2)} precio de
                    venta
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                    sx={{ mb: 1 }}
                  >
                    Stock {r.stock ?? "—"} •{" "}
                    {r.creado_en
                      ? dayjs(r.creado_en).format("YYYY-MM-DD")
                      : "—"}
                  </Typography>
                </CardContent>

                <CardActions
                  sx={{ justifyContent: "space-between", px: 2, pb: 2 }}
                >
                  <div>
                    <Tooltip title="Ver detalle">
                      <IconButton size="small" onClick={() => openView(r.id)}>
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Editar">
                      <IconButton
                        size="small"
                        onClick={() => {
                          setEditRow(r);
                          setOpenForm(true);
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => setToDelete(r)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </div>
                  <div>
                    <Button
                      size="small"
                      startIcon={<ImageIcon />}
                      onClick={() => setGaleriaFor(r.id)}
                    >
                      Galería
                    </Button>
                  </div>
                </CardActions>
              </Card>
            </div>
          ))}
          {!rows.length && !loading && (
            <div className="col-12">
              <Typography align="center" color="text.secondary">
                Sin resultados
              </Typography>
            </div>
          )}
        </div>
      </div>

      <TablePagination
        component="div"
        count={meta.total}
        page={page}
        onPageChange={(_, p) => setPage(p)}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[9]}
        labelRowsPerPage="Por página"
        labelDisplayedRows={({ from, to, count }) =>
          `${from}–${to} de ${count !== -1 ? count : `más de ${to}`}`
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
          "& .MuiTablePagination-displayedRows": { m: 0 },
        }}
      />

      <ProductoForm
        open={openForm}
        onClose={() => {
          setOpenForm(false);
          setEditRow(null);
        }}
        onSubmit={editRow ? handleUpdate : handleCreate}
        initial={editRow}
        notify={notify}
      />

      <GaleriaDialog
        open={Boolean(galeriaFor)}
        onClose={() => setGaleriaFor(null)}
        productoId={galeriaFor}
        notify={notify}
      />

      <ConfirmDialog
        open={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        onConfirm={handleDelete}
        text="¿Deseas eliminar este producto? Se inhabilitará."
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
