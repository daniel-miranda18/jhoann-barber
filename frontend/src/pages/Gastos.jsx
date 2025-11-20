import { useEffect, useMemo, useState } from "react";
import {
  Paper,
  Tabs,
  Tab,
  Snackbar,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Stack,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  LinearProgress,
  Tooltip,
  Badge,
  TablePagination,
  Divider,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ImageIcon from "@mui/icons-material/Image";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import dayjs from "dayjs";
import {
  listarCategorias,
  crearCategoria,
  actualizarCategoria,
  listarGastos,
  crearGasto,
  actualizarGasto,
  eliminarGasto,
  listarMovimientos,
  crearMovimiento,
} from "../services/gastosServicio";

function useDebounced(v, ms = 350) {
  const [x, setX] = useState(v);
  useEffect(() => {
    const id = setTimeout(() => setX(v), ms);
    return () => clearTimeout(id);
  }, [v, ms]);
  return x;
}

function CategoriaDialog({ open, onClose, initial, onSave }) {
  const [nombre, setNombre] = useState(initial?.nombre || "");
  const [descripcion, setDescripcion] = useState(initial?.descripcion || "");
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    setNombre(initial?.nombre || "");
    setDescripcion(initial?.descripcion || "");
  }, [initial, open]);
  async function submit() {
    setSaving(true);
    try {
      await onSave({ nombre, descripcion: descripcion || null });
    } finally {
      setSaving(false);
    }
  }
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {initial ? "Editar categoría" : "Nueva categoría"}
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <TextField
            label="Nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
          <TextField
            label="Descripción"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
          />
        </Stack>
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

function GastoDialog({ open, onClose, initial, categorias, onSave }) {
  const [fecha, setFecha] = useState(
    initial?.fecha || dayjs().format("YYYY-MM-DD")
  );
  const [monto, setMonto] = useState(
    initial?.monto != null ? Number(initial.monto) : 0
  );
  const [descripcion, setDescripcion] = useState(initial?.descripcion || "");
  const [gasto_categoria_id, setCat] = useState(
    initial?.gasto_categoria_id || ""
  );
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    setFecha(initial?.fecha || dayjs().format("YYYY-MM-DD"));
    setMonto(initial?.monto != null ? Number(initial.monto) : 0);
    setDescripcion(initial?.descripcion || "");
    setCat(initial?.gasto_categoria_id || "");
    setFile(null);
  }, [initial, open]);
  async function submit() {
    setSaving(true);
    try {
      await onSave(
        {
          fecha,
          monto: Number(monto),
          descripcion,
          gasto_categoria_id: Number(gasto_categoria_id),
        },
        file
      );
    } finally {
      setSaving(false);
    }
  }
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{initial ? "Editar gasto" : "Nuevo gasto"}</DialogTitle>
      <DialogContent dividers>
        <div className="container-fluid">
          <div className="row g-3">
            <div className="col-6">
              <TextField
                label="Fecha"
                type="date"
                fullWidth
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
              />
            </div>
            <div className="col-6">
              <TextField
                label="Monto"
                type="number"
                fullWidth
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">Bs/</InputAdornment>
                  ),
                }}
              />
            </div>
            <div className="col-12">
              <TextField
                label="Descripción"
                fullWidth
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
              />
            </div>
            <div className="col-12">
              <FormControl fullWidth>
                <InputLabel>Categoría</InputLabel>
                <Select
                  label="Categoría"
                  value={gasto_categoria_id}
                  onChange={(e) => setCat(e.target.value)}
                >
                  {categorias.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
            <div className="col-12">
              <Button
                variant="outlined"
                component="label"
                startIcon={<AttachFileIcon />}
              >
                {file ? "1 archivo seleccionado" : "Adjuntar comprobante"}
                <input
                  hidden
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
              </Button>
              {initial?.comprobante_url && !file && (
                <div className="mt-2">
                  <a
                    href={`${import.meta.env.VITE_API_URL}${
                      initial.comprobante_url
                    }`}
                    target="_blank"
                  >
                    Ver comprobante
                  </a>
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

function MovimientoDialog({ open, onClose, onSave }) {
  const [fecha, setFecha] = useState(dayjs().format("YYYY-MM-DD"));
  const [tipo, setTipo] = useState("ingreso");
  const [categoria, setCategoria] = useState("");
  const [monto, setMonto] = useState(0);
  const [nota, setNota] = useState("");
  const [saving, setSaving] = useState(false);
  async function submit() {
    setSaving(true);
    try {
      await onSave({
        fecha,
        tipo,
        categoria: categoria || null,
        monto: Number(monto),
        nota: nota || null,
      });
    } finally {
      setSaving(false);
    }
  }
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Nuevo</DialogTitle>
      <DialogContent dividers>
        <div className="container-fluid">
          <div className="row g-3">
            <div className="col-6">
              <TextField
                label="Fecha"
                type="date"
                fullWidth
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
              />
            </div>
            <div className="col-6">
              <FormControl fullWidth>
                <InputLabel>Tipo</InputLabel>
                <Select
                  label="Tipo"
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value)}
                >
                  <MenuItem value="ingreso">Ingreso</MenuItem>
                  <MenuItem value="egreso">Egreso</MenuItem>
                </Select>
              </FormControl>
            </div>
            <div className="col-6">
              <TextField
                label="Categoría"
                fullWidth
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
              />
            </div>
            <div className="col-6">
              <TextField
                label="Monto"
                type="number"
                fullWidth
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">Bs/</InputAdornment>
                  ),
                }}
              />
            </div>
            <div className="col-12">
              <TextField
                label="Nota"
                fullWidth
                value={nota}
                onChange={(e) => setNota(e.target.value)}
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

export default function Gastos() {
  const [tab, setTab] = useState(0);
  const [snack, setSnack] = useState({ open: false, msg: "", sev: "success" });

  const [cats, setCats] = useState([]);
  const [openCat, setOpenCat] = useState(false);
  const [editCat, setEditCat] = useState(null);

  const [gQ, setGQ] = useState("");
  const gQd = useDebounced(gQ, 350);
  const [gDesde, setGDesde] = useState(
    dayjs().startOf("month").format("YYYY-MM-DD")
  );
  const [gHasta, setGHasta] = useState(
    dayjs().endOf("month").format("YYYY-MM-DD")
  );
  const [gCat, setGCat] = useState("");
  const [gPage, setGPage] = useState(0);
  const gRpp = 12;
  const [gLoading, setGLoading] = useState(false);
  const [gMeta, setGMeta] = useState({
    total: 0,
    page: 1,
    per_page: gRpp,
    pages: 0,
  });
  const [gRows, setGRows] = useState([]);
  const [openGasto, setOpenGasto] = useState(false);
  const [editGasto, setEditGasto] = useState(null);

  const [mDesde, setMDesde] = useState(
    dayjs().startOf("month").format("YYYY-MM-DD")
  );
  const [mHasta, setMHasta] = useState(
    dayjs().endOf("month").format("YYYY-MM-DD")
  );
  const [mTipo, setMTipo] = useState("");
  const [mQ, setMQ] = useState("");
  const mQd = useDebounced(mQ, 350);
  const [mPage, setMPage] = useState(0);
  const mRpp = 12;
  const [mMeta, setMMeta] = useState({
    total: 0,
    page: 1,
    per_page: mRpp,
    pages: 0,
  });
  const [mRows, setMRows] = useState([]);
  const [openMov, setOpenMov] = useState(false);

  function toast(msg, sev = "success") {
    setSnack({ open: true, msg, sev });
  }

  async function loadCats() {
    const r = await listarCategorias({});
    setCats(r.data || []);
  }

  async function loadGastos(p = gPage) {
    setGLoading(true);
    try {
      const r = await listarGastos({
        page: p + 1,
        per_page: gRpp,
        desde: gDesde,
        hasta: gHasta,
        categoria_id: gCat || undefined,
        q: gQd || undefined,
      });
      setGRows(r.data || []);
      setGMeta(r.meta || { total: 0, page: 1, per_page: gRpp, pages: 0 });
    } finally {
      setGLoading(false);
    }
  }

  async function loadMovs(p = mPage) {
    const r = await listarMovimientos({
      page: p + 1,
      per_page: mRpp,
      desde: mDesde,
      hasta: mHasta,
      tipo: mTipo || undefined,
      q: mQd || undefined,
    });
    setMRows(r.data || []);
    setMMeta(r.meta || { total: 0, page: 1, per_page: mRpp, pages: 0 });
  }

  useEffect(() => {
    loadCats();
  }, []);
  useEffect(() => {
    loadGastos(0);
    setGPage(0);
  }, [gQd, gDesde, gHasta, gCat]);
  useEffect(() => {
    loadMovs(0);
    setMPage(0);
  }, [mDesde, mHasta, mTipo, mQd]);

  const totalGastos = useMemo(
    () => gRows.reduce((a, b) => a + Number(b.monto || 0), 0),
    [gRows]
  );
  const resumenMov = useMemo(() => {
    const ing = mRows
      .filter((x) => x.tipo === "ingreso")
      .reduce((a, b) => a + Number(b.monto || 0), 0);
    const egr = mRows
      .filter((x) => x.tipo === "egreso")
      .reduce((a, b) => a + Number(b.monto || 0), 0);
    return { ing, egr, neto: ing - egr };
  }, [mRows]);

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
          Gastos & Movimientos Financieros
        </Typography>
      </div>
      <Tabs value={tab} onChange={(_, t) => setTab(t)} sx={{ mb: 2 }}>
        <Tab label="Gastos" />
        <Tab label="Categorías" />
        <Tab label="Movimientos" />
      </Tabs>

      {tab === 0 && (
        <>
          <div className="container-fluid px-0">
            <div className="row g-2 align-items-end">
              <div className="col-12 col-md-4">
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Buscar descripción"
                  value={gQ}
                  onChange={(e) => setGQ(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </div>
              <div className="col-6 col-md-2">
                <TextField
                  fullWidth
                  size="small"
                  label="Desde"
                  type="date"
                  value={gDesde}
                  onChange={(e) => setGDesde(e.target.value)}
                />
              </div>
              <div className="col-6 col-md-2">
                <TextField
                  fullWidth
                  size="small"
                  label="Hasta"
                  type="date"
                  value={gHasta}
                  onChange={(e) => setGHasta(e.target.value)}
                />
              </div>
              <div className="col-6 col-md-2">
                <FormControl fullWidth size="small">
                  <InputLabel>Categoría</InputLabel>
                  <Select
                    label="Categoría"
                    value={gCat}
                    onChange={(e) => setGCat(e.target.value)}
                  >
                    <MenuItem value="">Todas</MenuItem>
                    {cats.map((c) => (
                      <MenuItem key={c.id} value={c.id}>
                        {c.nombre}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>
              <div className="col-6 col-md-2 d-flex justify-content-end">
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    setEditGasto(null);
                    setOpenGasto(true);
                  }}
                >
                  Nuevo
                </Button>
              </div>
            </div>
          </div>

          <Divider sx={{ my: 2 }} />

          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} md={4}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="overline">Gastos en página</Typography>
                  <Typography variant="h5">
                    Bs/ {totalGastos.toFixed(2)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={8}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="overline">Resumen rápido</Typography>
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ mt: 1, flexWrap: "wrap" }}
                  >
                    <Chip
                      label={`Ingresos: Bs/ ${resumenMov.ing.toFixed(2)}`}
                      color="success"
                    />
                    <Chip
                      label={`Egresos: Bs/ ${resumenMov.egr.toFixed(2)}`}
                      color="error"
                    />
                    <Chip label={`Neto: Bs/ ${resumenMov.neto.toFixed(2)}`} />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {gLoading && <LinearProgress sx={{ mb: 2 }} />}

          <div className="container-fluid px-0">
            <div className="row g-3">
              {gRows.map((r) => (
                <div className="col-12 col-md-6 col-lg-4" key={r.id}>
                  <Card
                    variant="outlined"
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        sx={{ mb: 1 }}
                      >
                        <Badge
                          badgeContent={dayjs(r.fecha).format("DD")}
                          color="primary"
                        >
                          <Chip label={dayjs(r.fecha).format("MMM")} />
                        </Badge>
                        <Chip label={r.categoria} color="default" />
                        <Chip
                          label={`Bs/ ${Number(r.monto).toFixed(2)}`}
                          color="error"
                        />
                      </Stack>
                      <Typography variant="subtitle1" sx={{ mb: 1 }}>
                        {r.descripcion}
                      </Typography>
                      {r.comprobante_url && (
                        <Button
                          size="small"
                          startIcon={<ImageIcon />}
                          href={`${import.meta.env.VITE_API_URL}${
                            r.comprobante_url
                          }`}
                          target="_blank"
                        >
                          Comprobante
                        </Button>
                      )}
                    </CardContent>
                    <CardActions sx={{ justifyContent: "space-between" }}>
                      <Typography variant="caption" color="text.secondary">
                        {dayjs(r.creado_en).format("YYYY-MM-DD")}
                      </Typography>
                      <div>
                        <Tooltip title="Editar">
                          <IconButton
                            onClick={() => {
                              setEditGasto(r);
                              setOpenGasto(true);
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar">
                          <IconButton
                            color="error"
                            onClick={async () => {
                              await eliminarGasto(r.id);
                              toast("Gasto eliminado");
                              loadGastos(gPage);
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </div>
                    </CardActions>
                  </Card>
                </div>
              ))}
              {!gRows.length && !gLoading && (
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
            count={gMeta.total}
            page={gPage}
            onPageChange={(_, p) => {
              setGPage(p);
              loadGastos(p);
            }}
            rowsPerPage={gRpp}
            rowsPerPageOptions={[gRpp]}
            labelRowsPerPage="Por página"
          />

          <GastoDialog
            open={openGasto}
            onClose={() => setOpenGasto(false)}
            initial={editGasto}
            categorias={cats}
            onSave={async (payload, file) => {
              if (editGasto) await actualizarGasto(editGasto.id, payload, file);
              else await crearGasto(payload, file);
              setOpenGasto(false);
              setEditGasto(null);
              toast(editGasto ? "Gasto actualizado" : "Gasto creado");
              loadGastos(0);
            }}
          />
        </>
      )}

      {tab === 1 && (
        <>
          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
            <TextField
              size="small"
              placeholder="Buscar"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setEditCat(null);
                setOpenCat(true);
              }}
            >
              Nueva categoría
            </Button>
          </Stack>
          <Grid container spacing={2}>
            {cats.map((c) => (
              <Grid item xs={12} md={6} lg={4} key={c.id}>
                <Card variant="outlined">
                  <CardContent>
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      sx={{ mb: 1 }}
                    >
                      <Chip
                        label={c.esta_activo ? "Activa" : "Inactiva"}
                        color={c.esta_activo ? "success" : "default"}
                      />
                    </Stack>
                    <Typography variant="h6">{c.nombre}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {c.descripcion || "—"}
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ justifyContent: "end" }}>
                    <Button
                      size="small"
                      onClick={() => {
                        setEditCat(c);
                        setOpenCat(true);
                      }}
                    >
                      Editar
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
            {!cats.length && (
              <Grid item xs={12}>
                <Typography align="center" color="text.secondary">
                  Sin categorías
                </Typography>
              </Grid>
            )}
          </Grid>

          <CategoriaDialog
            open={openCat}
            onClose={() => setOpenCat(false)}
            initial={editCat}
            onSave={async (payload) => {
              if (editCat) await actualizarCategoria(editCat.id, payload);
              else await crearCategoria(payload);
              setOpenCat(false);
              setEditCat(null);
              toast(editCat ? "Categoría actualizada" : "Categoría creada");
              loadCats();
            }}
          />
        </>
      )}

      {tab === 2 && (
        <>
          <div className="container-fluid px-0">
            <div className="row g-2 align-items-end">
              <div className="col-6 col-md-3">
                <TextField
                  fullWidth
                  size="small"
                  label="Desde"
                  type="date"
                  value={mDesde}
                  onChange={(e) => setMDesde(e.target.value)}
                />
              </div>
              <div className="col-6 col-md-3">
                <TextField
                  fullWidth
                  size="small"
                  label="Hasta"
                  type="date"
                  value={mHasta}
                  onChange={(e) => setMHasta(e.target.value)}
                />
              </div>
              <div className="col-6 col-md-3">
                <FormControl fullWidth size="small">
                  <InputLabel>Tipo</InputLabel>
                  <Select
                    label="Tipo"
                    value={mTipo}
                    onChange={(e) => setMTipo(e.target.value)}
                  >
                    <MenuItem value="">Todos</MenuItem>
                    <MenuItem value="ingreso">Ingreso</MenuItem>
                    <MenuItem value="egreso">Egreso</MenuItem>
                  </Select>
                </FormControl>
              </div>
              <div className="col-6 col-md-3">
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Buscar nota/categoría"
                  value={mQ}
                  onChange={(e) => setMQ(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </div>
            </div>
          </div>

          <Stack
            direction="row"
            spacing={1}
            sx={{ my: 2, justifyContent: "space-between" }}
          >
            <Stack direction="row" spacing={1}>
              <Chip
                label={`Ingresos Bs/ ${resumenMov.ing.toFixed(2)}`}
                color="success"
              />
              <Chip
                label={`Egresos Bs/ ${resumenMov.egr.toFixed(2)}`}
                color="error"
              />
              <Chip label={`Neto Bs/ ${resumenMov.neto.toFixed(2)}`} />
            </Stack>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenMov(true)}
            >
              Nuevo
            </Button>
          </Stack>

          <Grid container spacing={2}>
            {mRows.map((r) => (
              <Grid item xs={12} md={6} key={r.id}>
                <Card variant="outlined">
                  <CardContent>
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      sx={{ mb: 1, flexWrap: "wrap" }}
                    >
                      <Chip label={dayjs(r.fecha).format("YYYY-MM-DD HH:mm")} />
                      <Chip
                        label={r.tipo.toUpperCase()}
                        color={r.tipo === "ingreso" ? "success" : "error"}
                      />
                      {r.categoria ? <Chip label={r.categoria} /> : null}
                      <Chip label={`Bs/ ${Number(r.monto).toFixed(2)}`} />
                    </Stack>
                    <Typography variant="body2">{r.nota || "—"}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
            {!mRows.length && (
              <Grid item xs={12}>
                <Typography align="center" color="text.secondary">
                  Sin movimientos
                </Typography>
              </Grid>
            )}
          </Grid>

          <TablePagination
            component="div"
            count={mMeta.total}
            page={mPage}
            onPageChange={(_, p) => {
              setMPage(p);
              loadMovs(p);
            }}
            rowsPerPage={mRpp}
            rowsPerPageOptions={[mRpp]}
            labelRowsPerPage="Por página"
          />

          <MovimientoDialog
            open={openMov}
            onClose={() => setOpenMov(false)}
            onSave={async (payload) => {
              await crearMovimiento(payload);
              setOpenMov(false);
              toast("Movimiento creado");
              loadMovs(0);
            }}
          />
        </>
      )}

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
