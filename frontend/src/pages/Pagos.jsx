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
  Pagination,
  CardActionArea,
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
  actualizarVenta,
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

function EstadoChip({ estado, total, pagado }) {
  let displayEstado = estado;
  if (displayEstado !== "anulada") {
    displayEstado = pagado >= total && total > 0 ? "pagada" : "abierta";
  }
  const color =
    displayEstado === "pagada"
      ? "success"
      : displayEstado === "anulada"
      ? "error"
      : "default";
  return (
    <Chip
      size="small"
      color={color}
      label={String(displayEstado || "").toUpperCase()}
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
  const [selBarberos, setSelBarberos] = useState({});
  const qd = useDebounced(q, 300);

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const r = await buscarServicios(qd);
        if (!cancel) setOpcs(r.data || []);
      } catch {
        if (!cancel) setOpcs([]);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [qd]);

  useEffect(() => {
    if (sv) {
      setDur(sv.duracion_minutos || "");
      setPrecio(sv.precio_unitario ?? sv.precio ?? "");
    } else {
      setDur("");
      setPrecio("");
    }
  }, [sv]);

  useEffect(() => {
    if (barberos && barberos.length === 1) {
      setBb(barberos[0]);
      const map = {};
      opcs.forEach((o) => {
        map[o.id] = barberos[0].id;
      });
      setSelBarberos((s) => ({ ...map, ...s }));
    }
  }, [barberos, opcs]);

  const invalid =
    !sv ||
    (!(bb && bb.id) && !(selBarberos[sv?.id] && selBarberos[sv.id] > 0)) ||
    !dur ||
    Number(dur) <= 0 ||
    !precio ||
    Number(precio) <= 0;

  async function add() {
    if (invalid) {
      setShowErr(true);
      return;
    }
    const barberoId = selBarberos[sv.id] ?? (bb ? bb.id : null);
    try {
      await agregarServicioSvc(ventaId, {
        servicio_id: sv.id,
        barbero_id: barberoId,
        duracion_minutos: Number(dur),
        precio_unitario: Number(precio),
      });
      setSv(null);
      setBb(barberos && barberos.length === 1 ? barberos[0] : null);
      setDur("");
      setPrecio("");
      setShowErr(false);
      await onChanged?.();
    } catch (e) {
      setShowErr(true);
      try {
        const msg = e?.response?.data?.mensaje || e?.message || "Error";
        window.alert(msg);
      } catch {}
    }
  }

  async function del(itemId) {
    try {
      await eliminarServicioSvc(ventaId, itemId);
      await onChanged?.();
    } catch (e) {}
  }

  async function addFromCard(option) {
    const cardBarberoId = selBarberos[option.id] ?? (bb ? bb.id : null);
    if (!cardBarberoId) {
      setSv(option);
      setDur(option.duracion_minutos || "");
      setPrecio(option.precio_unitario ?? option.precio ?? "");
      setShowErr(true);
      return;
    }
    const barberoObj =
      barberos?.find((b) => Number(b.id) === Number(cardBarberoId)) || null;
    try {
      await agregarServicioSvc(ventaId, {
        servicio_id: option.id,
        barbero_id: barberoObj.id,
        duracion_minutos: Number(option.duracion_minutos || 0),
        precio_unitario: Number(option.precio_unitario ?? option.precio ?? 0),
      });
      await onChanged?.();
      setSv(null);
      setDur("");
      setPrecio("");
      setSelBarberos((s) => {
        const copy = { ...s };
        delete copy[option.id];
        return copy;
      });
    } catch (e) {
      try {
        const msg = e?.response?.data?.mensaje || e?.message || "Error";
        window.alert(msg);
      } catch {}
    }
  }

  return (
    <Card variant="outlined">
      <CardHeader
        avatar={<ContentCutIcon />}
        title="Servicios"
        subheader="Selecciona y agrega servicios"
      />
      <CardContent>
        <Stack spacing={2}>
          <TextField
            size="small"
            placeholder="Buscar servicios..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            fullWidth
          />
          <Grid container spacing={2}>
            {opcs.map((option) => {
              const isSelected = sv && Number(sv.id) === Number(option.id);
              return (
                <Grid item xs={12} sm={6} md={4} key={`srv-${option.id}`}>
                  <Card
                    variant="outlined"
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <CardActionArea onClick={() => setSv(option)}>
                      <Box
                        sx={{
                          position: "relative",
                          pt: "75%",
                          overflow: "hidden",
                          backgroundColor: "grey.100",
                        }}
                      >
                        <img
                          src={
                            option.foto_principal
                              ? `${import.meta.env.VITE_API_URL}${
                                  option.foto_principal
                                }`
                              : "https://via.placeholder.com/800x600?text=Sin+imagen"
                          }
                          alt={option.nombre || ""}
                          loading="lazy"
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      </Box>
                      <CardContent>
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: 700 }}
                          noWrap
                          title={option.nombre}
                        >
                          {option.nombre}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mt: 0.5 }}
                        >
                          {option.duracion_minutos} min •{" "}
                          {Bs(option.precio_unitario ?? option.precio ?? 0)}
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                    <CardActions
                      sx={{
                        px: 2,
                        py: 1,
                        mt: "auto",
                        display: "flex",
                        flexDirection: "column",
                        gap: 1,
                      }}
                    >
                      <FormControl size="small" fullWidth>
                        <InputLabel>Barbero</InputLabel>
                        <Select
                          label="Barbero"
                          value={selBarberos[option.id] ?? ""}
                          onChange={(e) =>
                            setSelBarberos((s) => ({
                              ...s,
                              [option.id]: e.target.value,
                            }))
                          }
                        >
                          <MenuItem value="">
                            <em>Seleccione</em>
                          </MenuItem>
                          {barberos.map((b) => (
                            <MenuItem key={b.id} value={b.id}>
                              {b.nombre}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <Box
                        sx={{
                          width: "100%",
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 1,
                        }}
                      >
                        <Button
                          size="small"
                          variant={isSelected ? "contained" : "outlined"}
                          onClick={() => setSv(option)}
                          sx={{ flex: 1 }}
                        >
                          {isSelected ? "Seleccionado" : "Seleccionar"}
                        </Button>
                        <Button
                          size="small"
                          startIcon={<AddIcon />}
                          onClick={() => addFromCard(option)}
                        >
                          Agregar
                        </Button>
                      </Box>
                    </CardActions>
                  </Card>
                </Grid>
              );
            })}
            {!opcs.length && (
              <Grid item xs={12}>
                <Typography color="text.secondary">No hay servicios</Typography>
              </Grid>
            )}
          </Grid>
          <Divider />
          <Divider sx={{ mt: 2 }} />
          <Box sx={{ overflowX: "auto" }}>
            <Table size="small">
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
                    <TableCell align="right">
                      {Bs(it.precio_unitario)}
                    </TableCell>
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
          </Box>
        </Stack>
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
      try {
        const r = await buscarProductos(qd);
        if (!cancel) setOpcs(r.data || []);
      } catch {
        if (!cancel) setOpcs([]);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [qd]);

  useEffect(() => {
    if (prod) setPrecio(prod.precio_unitario ?? "");
  }, [prod]);

  const invalid =
    !prod || !cant || Number(cant) <= 0 || !precio || Number(precio) <= 0;

  async function add() {
    if (invalid) {
      setShowErr(true);
      return;
    }
    try {
      await agregarProductoSvc(ventaId, {
        producto_id: prod.id,
        cantidad: Number(cant),
        precio_unitario: Number(precio),
      });
      setProd(null);
      setCant(1);
      setPrecio("");
      setShowErr(false);
      await onChanged?.();
    } catch (e) {
      setShowErr(true);
      try {
        const msg = e?.response?.data?.mensaje || e?.message || "Error";
        window.alert(msg);
      } catch {}
    }
  }

  async function addFromCard(option) {
    try {
      await agregarProductoSvc(ventaId, {
        producto_id: option.id,
        cantidad: 1,
        precio_unitario: Number(option.precio_unitario ?? 0),
      });
      await onChanged?.();
    } catch (e) {
      setProd(option);
      setCant(1);
      setPrecio(option.precio_unitario ?? "");
    }
  }

  async function del(itemId) {
    try {
      await eliminarProductoDeVenta(ventaId, itemId);
      await onChanged?.();
    } catch (e) {}
  }

  return (
    <Card variant="outlined">
      <CardHeader
        avatar={<Inventory2Icon />}
        title="Productos"
        subheader="Selecciona y agrega productos"
      />
      <CardContent>
        <Stack spacing={2}>
          <TextField
            size="small"
            placeholder="Buscar productos..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            fullWidth
          />
          <Grid container spacing={2}>
            {opcs.map((option) => (
              <Grid item xs={12} sm={6} md={4} key={`prd-${option.id}`}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                  variant="outlined"
                >
                  <CardActionArea onClick={() => addFromCard(option)}>
                    <Box
                      sx={{
                        position: "relative",
                        pt: "75%",
                        overflow: "hidden",
                        backgroundColor: "grey.100",
                      }}
                    >
                      <img
                        src={
                          option.foto_principal
                            ? `${import.meta.env.VITE_API_URL}${
                                option.foto_principal
                              }`
                            : "https://via.placeholder.com/800x600?text=Sin+imagen"
                        }
                        alt={option.nombre || ""}
                        loading="lazy"
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    </Box>
                    <CardContent>
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: 700 }}
                        noWrap
                        title={option.nombre}
                      >
                        {option.nombre}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 0.5 }}
                      >
                        Stock: {option.stock ?? 0} •{" "}
                        {Bs(option.precio_unitario ?? 0)}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                  <CardActions
                    sx={{
                      px: 2,
                      py: 1,
                      mt: "auto",
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <Button size="small" onClick={() => setProd(option)}>
                      Seleccionar
                    </Button>
                    <Button
                      size="small"
                      startIcon={<AddIcon />}
                      onClick={() => addFromCard(option)}
                    >
                      Agregar x1
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
            {!opcs.length && (
              <Grid item xs={12}>
                <Typography color="text.secondary">No hay productos</Typography>
              </Grid>
            )}
          </Grid>
          <Divider />
          <Grid container spacing={2}>
            <Grid item xs={12}>
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
            </Grid>
            <Grid item xs={6} md={4}>
              <TextField
                label="Cantidad"
                size="small"
                type="number"
                value={cant}
                onChange={(e) => setCant(e.target.value)}
                inputProps={{ min: 1, step: 1 }}
                fullWidth
                error={showErr && (!cant || Number(cant) <= 0)}
              />
            </Grid>
            <Grid item xs={6} md={4}>
              <TextField
                label="Precio"
                size="small"
                type="number"
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
                inputProps={{ min: 0, step: "0.01" }}
                fullWidth
                error={showErr && (!precio || Number(precio) <= 0)}
              />
            </Grid>
            <Grid
              item
              xs={12}
              md={4}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
              }}
            >
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={add}
                disabled={!prod}
              >
                Agregar producto
              </Button>
            </Grid>
          </Grid>
          <Divider />
          <Box sx={{ overflowX: "auto" }}>
            <Table size="small">
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
                    <TableCell align="right">
                      {Bs(it.precio_unitario)}
                    </TableCell>
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
          </Box>
        </Stack>
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
    try {
      if (metodo === "mixto") {
        const pagosToSend = pagos
          .map((p) => ({
            metodo: p.metodo,
            monto: Number(p.monto || 0),
            referencia: p.referencia || null,
          }))
          .filter((p) => p.monto > 0);
        if (!pagosToSend.length)
          throw new Error("No hay montos válidos para registrar");
        for (const p of pagosToSend) await pagarVentaSvc(venta.id, p);
      } else {
        const montoEnviar = Number(pendiente || 0);
        if (montoEnviar <= 0) throw new Error("Monto inválido");
        await pagarVentaSvc(venta.id, {
          metodo,
          monto: montoEnviar,
          referencia: pagos[0]?.referencia || null,
        });
      }
      await onDone?.();
      onClose?.();
    } catch (e) {
      const msg =
        e?.response?.data?.mensaje || e?.message || "Error al registrar pago";
      try {
        window.alert(msg);
      } catch {}
    }
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
  setSnack,
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
  const pagado = useMemo(() => Number(venta?.pagado || 0), [venta]);
  const pendiente = Math.max(0, Number(venta?.total || 0) - pagado);
  const [pagarOpen, setPagarOpen] = useState(false);

  useEffect(() => {
    if (open) {
      setClienteSel(null);
      setClientesOpc([]);
      setTab(
        tipoInicial === "servicios" ? 0 : tipoInicial === "productos" ? 1 : 0
      );
      if (ventaId) load();
      (async () => {
        try {
          const r = await buscarClientes("");
          setClientesOpc(r.data || []);
        } catch {}
      })();
    }
  }, [open, tipoInicial, ventaId]);

  async function load() {
    if (!ventaId) return;
    setLoading(true);
    try {
      const d = await detalleVenta(ventaId);
      const v = d?.data;
      setVenta(v || null);
      if (v?.cliente_id && v.cliente_nombre)
        setClienteSel({ id: v.cliente_id, nombre: v.cliente_nombre });
      else setClienteSel(null);
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
      try {
        const r = await listarBarberos();
        if (!cancel) setBarberos(r.data || []);
      } catch {
        if (!cancel) setBarberos([]);
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);

  async function actualizarCliente() {
    if (!venta?.id) return;
    setLoading(true);
    try {
      await actualizarVenta(venta.id, { cliente_id: clienteSel?.id ?? null });
      await load();
      onSaved?.();
      setSnack({
        open: true,
        msg: "Cliente actualizado correctamente",
        sev: "success",
      });
    } catch (e) {
      setSnack({
        open: true,
        msg: e?.response?.data?.mensaje || "Error al asignar cliente",
        sev: "error",
      });
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
      setSnack({
        open: true,
        msg: "Venta anulada exitosamente",
        sev: "warning",
      });
    } catch (e) {
      setSnack({
        open: true,
        msg: e?.response?.data?.mensaje || "Error al anular",
        sev: "error",
      });
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
      setSnack({
        open: true,
        msg: "Venta eliminada exitosamente",
        sev: "success",
      });
    } catch (e) {
      setSnack({
        open: true,
        msg: e?.response?.data?.mensaje || "Error al eliminar",
        sev: "error",
      });
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
    try {
      if (!txt || txt.length < 2) {
        const r = await buscarClientes("");
        setClientesOpc(r.data || []);
        return;
      }
      const r = await buscarClientes(txt);
      setClientesOpc(r.data || []);
    } catch {
      setClientesOpc([]);
    }
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
                    clearOnEscape
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
                  {venta && (
                    <EstadoChip
                      estado={venta.estado}
                      total={venta.total}
                      pagado={pagado}
                    />
                  )}
                  {venta && (
                    <Chip
                      label={
                        typeof dayjs !== "undefined" && venta?.fecha_hora
                          ? dayjs(venta.fecha_hora).format("YYYY-MM-DD HH:mm")
                          : venta?.fecha_hora
                          ? String(venta.fecha_hora)
                          : ""
                      }
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
        <div className="container">
          <Typography
            variant="h4"
            sx={{ fontWeight: 900, mb: 1, color: "#212529" }}
          >
            Lista de Ventas
          </Typography>
        </div>
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
            <Grid item xs={12} md={6} lg={4} key={`venta-${r.id}`}>
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
                  subheader={
                    typeof dayjs !== "undefined" && r?.fecha_hora
                      ? dayjs(r.fecha_hora).format("YYYY-MM-DD HH:mm")
                      : r?.fecha_hora
                      ? String(r.fecha_hora)
                      : ""
                  }
                  action={
                    <EstadoChip
                      estado={r.estado}
                      total={r.total}
                      pagado={r.pagado || 0}
                    />
                  }
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
        {meta.pages > 1 && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
            <Pagination
              count={meta.pages}
              page={page + 1}
              onChange={(e, p) => setPage(p - 1)}
              disabled={loading}
              color="primary"
            />
          </Box>
        )}
      </Paper>
      <VentaModal
        open={openVenta}
        onClose={() => setOpenVenta(false)}
        ventaId={ventaId}
        onSaved={() => fetchData(page)}
        tipoInicial={tipoVenta}
        setSnack={setSnack}
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
