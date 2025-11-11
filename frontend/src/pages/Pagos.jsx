import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Paper,
  Stack,
  Typography,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  LinearProgress,
  Divider,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Grid,
  Card,
  CardContent,
  CardActions,
  CardHeader,
  Avatar,
  Tabs,
  Tab,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import PaidIcon from "@mui/icons-material/Paid";
import BlockIcon from "@mui/icons-material/Block";
import PersonIcon from "@mui/icons-material/Person";
import ContentCutIcon from "@mui/icons-material/ContentCut";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import LocalAtmIcon from "@mui/icons-material/LocalAtm";
import CloseIcon from "@mui/icons-material/Close";
import dayjs from "dayjs";
import Autocomplete from "@mui/material/Autocomplete";
import {
  listarVentas,
  crearVenta,
  detalleVenta,
  pagarVenta as pagarVentaSvc,
  anularVenta as anularVentaSvc,
  eliminarVenta as eliminarVentaSvc,
  agregarServicioAVenta as agregarServicioSvc,
  eliminarServicioDeVenta as eliminarServicioSvc,
  agregarProductoAVenta as agregarProductoSvc,
  eliminarProductoDeVenta as eliminarProductoSvc,
  buscarClientes,
  listarBarberos,
  buscarServicios,
  buscarProductos,
  ticketUrl,
} from "../services/pagosServicio";

function Bs(n) {
  return `Bs ${Number(n || 0).toFixed(2)}`;
}

function EstadoChip({ estado }) {
  const color =
    estado === "pagada"
      ? "success"
      : estado === "anulada"
      ? "error"
      : "default";
  return (
    <Chip
      size="small"
      color={color}
      label={String(estado || "").toUpperCase()}
      className="py-3 px-4"
    />
  );
}

function useDebounced(v, ms = 350) {
  const [x, setX] = useState(v);
  useEffect(() => {
    const id = setTimeout(() => setX(v), ms);
    return () => clearTimeout(id);
  }, [v, ms]);
  return x;
}

function ItemServicios({ ventaId, data, onChanged, barberos }) {
  const [sv, setSv] = useState(null);
  const [bb, setBb] = useState(null);
  const [dur, setDur] = useState("");
  const [precio, setPrecio] = useState("");
  const [q, setQ] = useState("");
  const [opcs, setOpcs] = useState([]);
  const [showErr, setShowErr] = useState(false);
  const qd = useDebounced(q, 300);

  useEffect(() => {
    let cancel = false;
    (async () => {
      const r = await buscarServicios(qd);
      if (!cancel) setOpcs(r.data || []);
    })();
    return () => {
      cancel = true;
    };
  }, [qd]);

  useEffect(() => {
    if (sv) {
      setDur(sv.duracion_minutos || "");
      setPrecio(sv.precio_unitario || "");
    }
  }, [sv]);

  const invalid =
    !sv || !bb || !dur || Number(dur) <= 0 || !precio || Number(precio) <= 0;

  async function add() {
    if (invalid) {
      setShowErr(true);
      return;
    }
    await agregarServicioSvc(ventaId, {
      servicio_id: sv.id,
      barbero_id: bb.id,
      duracion_minutos: Number(dur),
      precio_unitario: Number(precio),
    });
    setSv(null);
    setBb(null);
    setDur("");
    setPrecio("");
    setShowErr(false);
    onChanged?.();
  }

  async function del(itemId) {
    await eliminarServicioSvc(ventaId, itemId);
    onChanged?.();
  }
  return (
    <Card variant="outlined">
      <CardHeader
        avatar={<ContentCutIcon />}
        title="Servicios"
        subheader="Añade servicios"
      />
      <CardContent>
        <div className="container-fluid px-0">
          <div className="row gy-3 gx-2">
            <div className="col-12 col-md-6">
              <Autocomplete
                options={opcs}
                value={sv}
                isOptionEqualToValue={(o, v) => o?.id === v?.id}
                getOptionLabel={(o) => o?.nombre || ""}
                onChange={(_, v) => setSv(v)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Servicio"
                    size="small"
                    fullWidth
                    onChange={(e) => setQ(e.target.value)}
                    error={showErr && !sv}
                    helperText={showErr && !sv ? "Requerido" : ""}
                  />
                )}
              />
            </div>
            <div className="col-12 col-md-6">
              <Autocomplete
                options={barberos}
                value={bb}
                isOptionEqualToValue={(o, v) => o?.id === v?.id}
                getOptionLabel={(o) => o?.nombre || ""}
                onChange={(_, v) => setBb(v)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Barbero"
                    size="small"
                    fullWidth
                    error={showErr && !bb}
                    helperText={showErr && !bb ? "Requerido" : ""}
                  />
                )}
              />
            </div>
            <div className="col-12 col-md-6">
              <TextField
                label="Min"
                size="small"
                type="number"
                value={dur}
                onChange={(e) => setDur(e.target.value)}
                inputProps={{ min: 1, step: 1 }}
                error={showErr && (!dur || Number(dur) <= 0)}
                helperText={
                  showErr && (!dur || Number(dur) <= 0) ? "Minutos > 0" : ""
                }
                fullWidth
              />
            </div>
            <div className="col-12 col-md-6">
              <TextField
                label="Precio"
                size="small"
                type="number"
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
                inputProps={{ min: 0, step: "0.01" }}
                error={showErr && (!precio || Number(precio) <= 0)}
                helperText={
                  showErr && (!precio || Number(precio) <= 0)
                    ? "Precio > 0"
                    : ""
                }
                fullWidth
              />
            </div>
            <div className="col-12 d-flex justify-content-end">
              <Button variant="contained" onClick={add} startIcon={<AddIcon />}>
                Agregar
              </Button>
            </div>
          </div>
        </div>

        <Divider className="my-3" />
        <div className="table-responsive">
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Servicio</TableCell>
                <TableCell>Barbero</TableCell>
                <TableCell align="right">Min</TableCell>
                <TableCell align="right">Precio</TableCell>
                <TableCell align="right">Subtotal</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(data || []).map((it) => (
                <TableRow key={it.id}>
                  <TableCell>{it.servicio_nombre}</TableCell>
                  <TableCell>
                    {[it.nombres, it.apellidos].filter(Boolean).join(" ")}
                  </TableCell>
                  <TableCell align="right">{it.duracion_minutos}</TableCell>
                  <TableCell align="right">{Bs(it.precio_unitario)}</TableCell>
                  <TableCell align="right">{Bs(it.subtotal)}</TableCell>
                  <TableCell align="center">
                    <IconButton color="error" onClick={() => del(it.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {!data?.length && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    Sin servicios
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function ItemProductos({ ventaId, data, onChanged }) {
  const [q, setQ] = useState("");
  const [opcs, setOpcs] = useState([]);
  const [prod, setProd] = useState(null);
  const [cant, setCant] = useState(1);
  const [precio, setPrecio] = useState("");
  const [showErr, setShowErr] = useState(false);
  const qd = useDebounced(q, 300);

  useEffect(() => {
    let cancel = false;
    (async () => {
      const r = await buscarProductos(qd);
      if (!cancel) setOpcs(r.data || []);
    })();
    return () => {
      cancel = true;
    };
  }, [qd]);

  useEffect(() => {
    if (prod) setPrecio(prod.precio_unitario || "");
  }, [prod]);

  const invalid =
    !prod || !cant || Number(cant) <= 0 || !precio || Number(precio) <= 0;

  async function add() {
    if (invalid) {
      setShowErr(true);
      return;
    }
    await agregarProductoSvc(ventaId, {
      producto_id: prod.id,
      cantidad: Number(cant),
      precio_unitario: Number(precio),
    });
    setProd(null);
    setCant(1);
    setPrecio("");
    setShowErr(false);
    onChanged?.();
  }

  async function del(itemId) {
    await eliminarProductoSvc(ventaId, itemId);
    onChanged?.();
  }
  return (
    <Card variant="outlined">
      <CardHeader
        avatar={<Inventory2Icon />}
        title="Productos"
        subheader="Añade productos"
      />
      <CardContent>
        <div className="container-fluid px-0">
          <div className="row gy-3 gx-2">
            <div className="col-12">
              <Autocomplete
                options={opcs}
                value={prod}
                isOptionEqualToValue={(o, v) => o?.id === v?.id}
                getOptionLabel={(o) => o?.nombre || ""}
                onChange={(_, v) => setProd(v)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Producto"
                    size="small"
                    fullWidth
                    onChange={(e) => setQ(e.target.value)}
                    error={showErr && !prod}
                    helperText={showErr && !prod ? "Requerido" : ""}
                  />
                )}
              />
            </div>
            <div className="col-12 col-md-6">
              <TextField
                label="Cantidad"
                size="small"
                type="number"
                value={cant}
                onChange={(e) => setCant(e.target.value)}
                inputProps={{ min: 1, step: 1 }}
                error={showErr && (!cant || Number(cant) <= 0)}
                helperText={
                  showErr && (!cant || Number(cant) <= 0) ? "Cantidad > 0" : ""
                }
                fullWidth
              />
            </div>
            <div className="col-12 col-md-6">
              <TextField
                label="Precio"
                size="small"
                type="number"
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
                inputProps={{ min: 0, step: "0.01" }}
                error={showErr && (!precio || Number(precio) <= 0)}
                helperText={
                  showErr && (!precio || Number(precio) <= 0)
                    ? "Precio > 0"
                    : ""
                }
                fullWidth
              />
            </div>
            <div className="col-12 d-flex justify-content-end">
              <Button variant="contained" onClick={add} startIcon={<AddIcon />}>
                Agregar
              </Button>
            </div>
          </div>
        </div>

        <Divider className="my-3" />
        <div className="table-responsive">
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Producto</TableCell>
                <TableCell align="right">Cant</TableCell>
                <TableCell align="right">Precio</TableCell>
                <TableCell align="right">Subtotal</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(data || []).map((it) => (
                <TableRow key={it.id}>
                  <TableCell>{it.producto_nombre}</TableCell>
                  <TableCell align="right">{it.cantidad}</TableCell>
                  <TableCell align="right">{Bs(it.precio_unitario)}</TableCell>
                  <TableCell align="right">{Bs(it.subtotal)}</TableCell>
                  <TableCell align="center">
                    <IconButton color="error" onClick={() => del(it.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {!data?.length && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    Sin productos
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function PagarDialog({ open, onClose, venta, onDone }) {
  const [metodo, setMetodo] = useState("efectivo");
  const [pagos, setPagos] = useState([
    { metodo: "efectivo", monto: "", referencia: "" },
  ]);
  const total = Number(venta?.total || 0);
  const pagado = Number(
    venta?.pagos?.reduce((a, b) => a + Number(b.monto || 0), 0) || 0
  );
  const pendiente = Math.max(0, total - pagado);
  useEffect(() => {
    if (open) {
      setMetodo("efectivo");
      setPagos([
        {
          metodo: "efectivo",
          monto: pendiente > 0 ? pendiente : "",
          referencia: "",
        },
      ]);
    }
  }, [open, pendiente]);
  function setPago(i, patch) {
    setPagos((arr) =>
      arr.map((p, idx) => (idx === i ? { ...p, ...patch } : p))
    );
  }
  function addPago() {
    setPagos((arr) => [
      ...arr,
      { metodo: "efectivo", monto: "", referencia: "" },
    ]);
  }
  function remPago(i) {
    setPagos((arr) => arr.filter((_, idx) => idx !== i));
  }
  async function submit() {
    const payload =
      metodo === "mixto"
        ? {
            metodo,
            pagos: pagos
              .map((p) => ({ ...p, monto: Number(p.monto || 0) }))
              .filter((p) => p.monto > 0),
          }
        : {
            metodo,
            pagos: [
              {
                metodo,
                monto: Number(pendiente || 0),
                referencia: pagos[0]?.referencia || null,
              },
            ],
          };
    await pagarVentaSvc(venta.id, payload);
    onDone?.();
    onClose?.();
  }
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Registrar pago</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={1.5}>
          <Stack direction="row" spacing={2}>
            <Chip label={`Total: ${Bs(total)}`} />
            <Chip color="success" label={`Pagado: ${Bs(pagado)}`} />
            <Chip color="warning" label={`Pendiente: ${Bs(pendiente)}`} />
          </Stack>
          <FormControl size="small" fullWidth>
            <InputLabel>Método</InputLabel>
            <Select
              label="Método"
              value={metodo}
              onChange={(e) => setMetodo(e.target.value)}
            >
              <MenuItem value="efectivo">Efectivo</MenuItem>
              <MenuItem value="tarjeta">Tarjeta</MenuItem>
              <MenuItem value="transferencia">Transferencia</MenuItem>
              <MenuItem value="mixto">Mixto</MenuItem>
            </Select>
          </FormControl>
          {metodo === "mixto" ? (
            <Stack spacing={1}>
              {pagos.map((p, i) => (
                <div key={i} className="row gy-2 gx-2">
                  <div className="col-12 col-sm-4">
                    <FormControl size="small" fullWidth>
                      <InputLabel>Medio</InputLabel>
                      <Select
                        label="Medio"
                        value={p.metodo}
                        onChange={(e) => setPago(i, { metodo: e.target.value })}
                      >
                        <MenuItem value="efectivo">Efectivo</MenuItem>
                        <MenuItem value="tarjeta">Tarjeta</MenuItem>
                        <MenuItem value="transferencia">Transferencia</MenuItem>
                      </Select>
                    </FormControl>
                  </div>
                  <div className="col-6 col-sm-3">
                    <TextField
                      size="small"
                      label="Monto"
                      type="number"
                      value={p.monto}
                      onChange={(e) => setPago(i, { monto: e.target.value })}
                      inputProps={{ min: 0, step: "0.01" }}
                      fullWidth
                    />
                  </div>
                  <div className="col-6 col-sm-4">
                    <TextField
                      size="small"
                      label="Referencia"
                      value={p.referencia || ""}
                      onChange={(e) =>
                        setPago(i, { referencia: e.target.value })
                      }
                      fullWidth
                    />
                  </div>
                  <div className="col-12 col-sm-1 d-flex align-items-center">
                    <IconButton color="error" onClick={() => remPago(i)}>
                      <DeleteIcon />
                    </IconButton>
                  </div>
                </div>
              ))}
              <Button
                startIcon={<AddIcon />}
                onClick={addPago}
                variant="outlined"
              >
                Agregar pago
              </Button>
            </Stack>
          ) : (
            <TextField
              size="small"
              label="Referencia"
              value={pagos[0]?.referencia || ""}
              onChange={(e) =>
                setPagos((arr) => [{ ...arr[0], referencia: e.target.value }])
              }
              fullWidth
            />
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          variant="contained"
          startIcon={<LocalAtmIcon />}
          onClick={submit}
        >
          Registrar
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function TipoVentaDialog({ open, onClose, onSelect }) {
  const [tipo, setTipo] = useState("servicios");
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Nueva venta</DialogTitle>
      <DialogContent dividers>
        <FormControl fullWidth size="small">
          <InputLabel>Tipo</InputLabel>
          <Select
            label="Tipo"
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
          >
            <MenuItem value="servicios">Servicios</MenuItem>
            <MenuItem value="productos">Productos</MenuItem>
            <MenuItem value="mixto">Mixto</MenuItem>
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} startIcon={<CloseIcon />}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={() => onSelect(tipo)}
          startIcon={<AddIcon />}
        >
          Abrir venta
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function TabPanel({ value, index, children }) {
  return value === index ? <Box sx={{ pt: 2 }}>{children}</Box> : null;
}

function VentaModal({
  open,
  onClose,
  ventaId,
  onSaved,
  tipoInicial = "mixto",
}) {
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [venta, setVenta] = useState(null);
  const [clientesOpc, setClientesOpc] = useState([]);
  const [clienteSel, setClienteSel] = useState(null);
  const [barberos, setBarberos] = useState([]);
  const totalServicios = useMemo(
    () =>
      (venta?.servicios || []).reduce((a, b) => a + Number(b.subtotal || 0), 0),
    [venta]
  );
  const totalProductos = useMemo(
    () =>
      (venta?.productos || []).reduce((a, b) => a + Number(b.subtotal || 0), 0),
    [venta]
  );
  const pagado = useMemo(
    () => (venta?.pagos || []).reduce((a, b) => a + Number(b.monto || 0), 0),
    [venta]
  );
  const pendiente = Math.max(0, Number(venta?.total || 0) - pagado);
  const [pagarOpen, setPagarOpen] = useState(false);
  useEffect(() => {
    if (open)
      setTab(
        tipoInicial === "servicios" ? 0 : tipoInicial === "productos" ? 1 : 0
      );
  }, [open, tipoInicial]);
  async function load() {
    if (!ventaId) return;
    setLoading(true);
    try {
      const d = await detalleVenta(ventaId);
      const v = d?.data;
      setVenta(v || null);
      if (v?.cliente_id) {
        setClienteSel({ id: v.cliente_id, nombre: v.cliente_nombre || "" });
      }
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    if (open && ventaId) load();
  }, [open, ventaId]);
  useEffect(() => {
    let cancel = false;
    (async () => {
      const r = await listarBarberos();
      if (!cancel) setBarberos(r.data || []);
    })();
    return () => {
      cancel = true;
    };
  }, []);
  async function actualizarCliente() {
    if (!venta?.id) return;
    setLoading(true);
    try {
      const id = venta.id;
      await fetch(`${import.meta.env.VITE_API_URL}/ventas/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ cliente_id: clienteSel?.id || null }),
      });
      await load();
      onSaved?.();
    } finally {
      setLoading(false);
    }
  }
  async function anular() {
    if (!venta?.id) return;
    setLoading(true);
    try {
      await anularVentaSvc(venta.id);
      await load();
      onSaved?.();
    } finally {
      setLoading(false);
    }
  }
  async function eliminar() {
    if (!venta?.id) return;
    setLoading(true);
    try {
      await eliminarVentaSvc(venta.id);
      onSaved?.();
      onClose?.();
    } finally {
      setLoading(false);
    }
  }
  function openTicket(print = true) {
    if (!venta?.id) return;
    const url = ticketUrl(venta.id, { curr: "Bs", print });
    window.open(url, "_blank");
  }
  async function buscarCli(txt) {
    const r = await buscarClientes(txt);
    setClientesOpc(r.data || []);
  }
  const tabsDisponibles =
    tipoInicial === "servicios"
      ? ["Servicios", "Detalle"]
      : tipoInicial === "productos"
      ? ["Productos", "Detalle"]
      : ["Servicios", "Productos", "Detalle"];
  const mapIndex = (i) => {
    if (tipoInicial === "servicios") return i === 0 ? 0 : 2;
    if (tipoInicial === "productos") return i === 0 ? 1 : 2;
    return i;
  };
  const visibleIndex = tabsDisponibles.indexOf(
    tabsDisponibles.find((_, i) => mapIndex(i) === tab)
  );
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle>{venta ? `Venta #${venta.id}` : "Venta"}</DialogTitle>
      <DialogContent dividers>
        {loading && <LinearProgress sx={{ mb: 2 }} />}
        <Stack spacing={2}>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
            <div className="container-fluid px-0">
              <div className="row gy-3 gx-2 align-items-center">
                <div className="col-12 col-md-6">
                  <Autocomplete
                    options={clientesOpc}
                    value={clienteSel}
                    isOptionEqualToValue={(o, v) => o?.id === v?.id}
                    getOptionLabel={(o) => o?.nombre || ""}
                    onChange={(_, v) => setClienteSel(v)}
                    onInputChange={(_, v) => buscarCli(v)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Cliente"
                        size="small"
                        placeholder="Buscar por nombre, correo o teléfono"
                      />
                    )}
                  />
                </div>
                <div className="col-md-12 d-flex gap-5 align-items-center flex-wrap">
                  {venta && (
                    <Button variant="outlined" onClick={actualizarCliente}>
                      Guardar cliente
                    </Button>
                  )}
                  {venta && (
                    <Chip
                      icon={<PersonIcon />}
                      label={
                        venta?.cliente_id
                          ? "Cliente asignado"
                          : "Consumidor Final"
                      }
                    />
                  )}
                  {venta && <EstadoChip estado={venta.estado} />}
                  {venta && (
                    <Chip
                      label={dayjs(venta.fecha_hora).format("YYYY-MM-DD HH:mm")}
                    />
                  )}
                </div>
              </div>
            </div>
          </Paper>

          {venta && (
            <>
              <Tabs
                value={visibleIndex}
                onChange={(_, i) => setTab(mapIndex(i))}
                variant="scrollable"
              >
                {tabsDisponibles.includes("Servicios") && (
                  <Tab
                    label={
                      <Stack direction="row" spacing={1} alignItems="center">
                        <ContentCutIcon fontSize="small" />
                        <span>Servicios</span>
                        <Chip
                          size="small"
                          label={(venta.servicios || []).length}
                        />
                      </Stack>
                    }
                  />
                )}
                {tabsDisponibles.includes("Productos") && (
                  <Tab
                    label={
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Inventory2Icon fontSize="small" />
                        <span>Productos</span>
                        <Chip
                          size="small"
                          label={(venta.productos || []).length}
                        />
                      </Stack>
                    }
                  />
                )}
                <Tab
                  label={
                    <Stack direction="row" spacing={1} alignItems="center">
                      <ReceiptLongIcon fontSize="small" />
                      <span>Detalle</span>
                    </Stack>
                  }
                />
              </Tabs>

              {tabsDisponibles.includes("Servicios") && (
                <TabPanel value={tab} index={0}>
                  <ItemServicios
                    ventaId={venta.id}
                    data={venta.servicios}
                    barberos={barberos}
                    onChanged={async () => {
                      await load();
                      onSaved?.();
                    }}
                  />
                </TabPanel>
              )}

              {tabsDisponibles.includes("Productos") && (
                <TabPanel value={tab} index={1}>
                  <ItemProductos
                    ventaId={venta.id}
                    data={venta.productos}
                    onChanged={async () => {
                      await load();
                      onSaved?.();
                    }}
                  />
                </TabPanel>
              )}

              <TabPanel value={tab} index={2}>
                <Card variant="outlined">
                  <CardContent>
                    <div className="container-fluid px-0">
                      <div className="row gy-2 gx-2">
                        <div className="col-auto">
                          <Chip label={`Servicios: ${Bs(totalServicios)}`} />
                        </div>
                        <div className="col-auto">
                          <Chip label={`Productos: ${Bs(totalProductos)}`} />
                        </div>
                        <div className="col-auto">
                          <Chip
                            color="primary"
                            label={`Total: ${Bs(venta.total)}`}
                          />
                        </div>
                        <div className="col-auto">
                          <Chip
                            color="success"
                            label={`Pagado: ${Bs(pagado)}`}
                          />
                        </div>
                        <div className="col-auto">
                          <Chip
                            color="warning"
                            label={`Pendiente: ${Bs(pendiente)}`}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardActions sx={{ justifyContent: "space-between" }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<PaidIcon />}
                        onClick={() => setPagarOpen(true)}
                        disabled={
                          venta.estado === "anulada" || Number(venta.total) <= 0
                        }
                      >
                        Cobrar
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<ReceiptLongIcon />}
                        onClick={() => openTicket(true)}
                      >
                        Ticket
                      </Button>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <Button
                        size="small"
                        color="warning"
                        variant="outlined"
                        startIcon={<BlockIcon />}
                        onClick={anular}
                        disabled={venta.estado === "anulada"}
                      >
                        Anular
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        variant="outlined"
                        startIcon={<DeleteIcon />}
                        onClick={eliminar}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </CardActions>
                </Card>
              </TabPanel>
            </>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} startIcon={<CloseIcon />}>
          Cerrar
        </Button>
      </DialogActions>
      {venta && (
        <PagarDialog
          open={pagarOpen}
          onClose={() => setPagarOpen(false)}
          venta={{ ...venta, pagos: venta.pagos }}
          onDone={async () => {
            await load();
            onSaved?.();
          }}
        />
      )}
    </Dialog>
  );
}

export default function Pagos() {
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
  const [openVenta, setOpenVenta] = useState(false);
  const [ventaId, setVentaId] = useState(null);
  const [snack, setSnack] = useState({ open: false, msg: "", sev: "success" });
  const [tipoDlg, setTipoDlg] = useState(false);
  const [tipoVenta, setTipoVenta] = useState("mixto");
  const qd = useDebounced(q, 350);
  const estadoParam = useMemo(
    () => (estado === "todos" ? undefined : estado),
    [estado]
  );
  async function fetchData(p = page) {
    setLoading(true);
    try {
      const res = await listarVentas({
        page: p + 1,
        per_page: 9,
        q: qd || undefined,
        estado: estadoParam,
      });
      setRows(res.data || []);
      setMeta(res.meta || { total: 0, page: 1, per_page: 9, pages: 0 });
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    fetchData();
  }, [page]);
  useEffect(() => {
    setPage(0);
    fetchData(0);
  }, [qd, estadoParam]);
  function notify(msg, sev = "success") {
    setSnack({ open: true, msg, sev });
  }
  async function crearVentaFlujo(tipo) {
    try {
      const r = await crearVenta({});
      setVentaId(r?.data?.id);
      setTipoVenta(tipo);
      setOpenVenta(true);
      notify("Venta creada");
      fetchData(0);
    } catch (e) {
      notify(e?.response?.data?.mensaje || "Error", "error");
    }
  }
  return (
    <Box>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 3 },
          borderRadius: 3,
          border: 1,
          borderColor: "divider",
        }}
      >
        <div className="container-fluid px-0">
          <div className="row g-2 align-items-center mb-2">
            <div className="col-12 col-md-6">
              <TextField
                fullWidth
                size="small"
                placeholder="Buscar por #venta o cliente"
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
            <div className="col-6 col-md-3">
              <FormControl size="small" fullWidth>
                <InputLabel>Estado</InputLabel>
                <Select
                  label="Estado"
                  value={estado}
                  onChange={(e) => setEstado(e.target.value)}
                >
                  <MenuItem value="todos">Todos</MenuItem>
                  <MenuItem value="abierta">Abierta</MenuItem>
                  <MenuItem value="pagada">Pagada</MenuItem>
                  <MenuItem value="anulada">Anulada</MenuItem>
                </Select>
              </FormControl>
            </div>
            <div className="col-6 col-md-3 d-flex justify-content-end">
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setTipoDlg(true)}
              >
                Nueva venta
              </Button>
            </div>
          </div>
        </div>
        {loading && <LinearProgress sx={{ mb: 2 }} />}
        <Grid container spacing={2}>
          {rows.map((r) => (
            <Grid item xs={12} md={6} lg={4} key={r.id}>
              <Card
                variant="outlined"
                sx={{
                  borderRadius: 2,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <CardHeader
                  avatar={
                    <Avatar>
                      {String(r.cliente_nombre || "C")
                        .charAt(0)
                        .toUpperCase()}
                    </Avatar>
                  }
                  title={`Venta #${r.id}`}
                  subheader={dayjs(r.fecha_hora).format("YYYY-MM-DD HH:mm")}
                  action={<EstadoChip estado={r.estado} />}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Stack spacing={1}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <PersonIcon fontSize="small" />
                      <Typography variant="body2">
                        {r.cliente_nombre || "Consumidor Final"}
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <LocalAtmIcon fontSize="small" />
                      <Chip size="small" label={`Total: ${Bs(r.total)}`} />
                      {r.metodo_pago && (
                        <Chip
                          size="small"
                          variant="outlined"
                          label={r.metodo_pago.toUpperCase()}
                        />
                      )}
                    </Stack>
                  </Stack>
                </CardContent>
                <CardActions sx={{ justifyContent: "space-between" }}>
                  <div style={{ display: "flex", gap: 8 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => {
                        setVentaId(r.id);
                        setTipoVenta("mixto");
                        setOpenVenta(true);
                      }}
                    >
                      Abrir
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<ReceiptLongIcon />}
                      onClick={() =>
                        window.open(
                          ticketUrl(r.id, { curr: "Bs", print: true }),
                          "_blank"
                        )
                      }
                    >
                      Ticket
                    </Button>
                  </div>
                  <Chip
                    size="small"
                    color={
                      r.estado === "pagada"
                        ? "success"
                        : r.estado === "anulada"
                        ? "error"
                        : "default"
                    }
                    label={Bs(r.total)}
                  />
                </CardActions>
              </Card>
            </Grid>
          ))}
          {!rows.length && !loading && (
            <Grid item xs={12}>
              <Typography align="center" color="text.secondary">
                Sin resultados
              </Typography>
            </Grid>
          )}
        </Grid>
      </Paper>

      <VentaModal
        open={openVenta}
        onClose={() => setOpenVenta(false)}
        ventaId={ventaId}
        onSaved={() => fetchData(page)}
        tipoInicial={tipoVenta}
      />

      <TipoVentaDialog
        open={tipoDlg}
        onClose={() => setTipoDlg(false)}
        onSelect={(tipo) => {
          setTipoDlg(false);
          crearVentaFlujo(tipo);
        }}
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
    </Box>
  );
}
