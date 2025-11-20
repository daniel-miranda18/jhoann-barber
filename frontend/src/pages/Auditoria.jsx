import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Paper,
  Stack,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Snackbar,
  Alert,
  LinearProgress,
  Tooltip,
  IconButton,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import InfoIcon from "@mui/icons-material/Info";
import dayjs from "dayjs";
import Autocomplete from "@mui/material/Autocomplete";
import {
  listarEventos,
  detalleEvento,
  listarSesiones,
  listarUsuarios,
} from "../services/auditoriaServicio";

function useDebounced(v, ms = 350) {
  const [x, setX] = useState(v);
  useEffect(() => {
    const id = setTimeout(() => setX(v), ms);
    return () => clearTimeout(id);
  }, [v, ms]);
  return x;
}

function MetodoChip({ m }) {
  const map = {
    GET: "default",
    POST: "primary",
    PUT: "warning",
    PATCH: "warning",
    DELETE: "error",
  };
  return <Chip size="small" color={map[m] || "default"} label={m} />;
}

export default function Auditoria() {
  const [tab, setTab] = useState(0);
  const [q, setQ] = useState("");
  const qd = useDebounced(q, 350);
  const [metodo, setMetodo] = useState("todos");
  const metodoParam = useMemo(
    () => (metodo === "todos" ? undefined : metodo),
    [metodo]
  );
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");

  const [usuarioTxt, setUsuarioTxt] = useState("");
  const usuarioTxtDeb = useDebounced(usuarioTxt, 350);
  const [usuariosOpc, setUsuariosOpc] = useState([]);
  const [usuarioSel, setUsuarioSel] = useState(null);
  const usuarioIdParam = usuarioSel?.id || undefined;

  const [page, setPage] = useState(0);
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    per_page: 20,
    pages: 0,
  });
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState({ open: false, msg: "", sev: "success" });
  const [openDlg, setOpenDlg] = useState(false);
  const [evento, setEvento] = useState(null);

  useEffect(() => {
    let cancel = false;
    (async () => {
      const lista = await listarUsuarios(usuarioTxtDeb);
      if (!cancel) setUsuariosOpc(lista);
    })();
    return () => {
      cancel = true;
    };
  }, [usuarioTxtDeb]);

  async function fetchEventos(p = page) {
    setLoading(true);
    try {
      const r = await listarEventos({
        page: p + 1,
        per_page: 20,
        q: qd || undefined,
        metodo: metodoParam,
        desde: desde || undefined,
        hasta: hasta || undefined,
        usuario_id: usuarioIdParam,
      });
      setRows(r.data || []);
      setMeta(r.meta || { total: 0, page: 1, per_page: 20, pages: 0 });
    } finally {
      setLoading(false);
    }
  }

  async function fetchSesiones(p = page) {
    setLoading(true);
    try {
      const r = await listarSesiones({
        page: p + 1,
        per_page: 20,
        usuario_id: usuarioIdParam,
      });
      setRows(r.data || []);
      setMeta(r.meta || { total: 0, page: 1, per_page: 20, pages: 0 });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (tab === 0) fetchEventos(0);
    else fetchSesiones(0);
    setPage(0);
  }, [tab]);

  useEffect(() => {
    if (tab === 0) {
      setPage(0);
      fetchEventos(0);
    }
  }, [qd, metodoParam, desde, hasta, usuarioIdParam]);

  useEffect(() => {
    if (tab === 1) {
      setPage(0);
      fetchSesiones(0);
    }
  }, [usuarioIdParam]);

  useEffect(() => {
    if (tab === 0) fetchEventos(page);
    else fetchSesiones(page);
  }, [page]);

  async function verDetalle(id) {
    try {
      const r = await detalleEvento(id);
      setEvento(r.data || null);
      setOpenDlg(true);
    } catch (e) {
      setSnack({
        open: true,
        msg: e?.response?.data?.mensaje || "Error",
        sev: "error",
      });
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
            Auditoría & Monitoreo
          </Typography>
        </div>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
          <Tab label="Eventos" />
          <Tab label="Sesiones" />
        </Tabs>

        {tab === 0 && (
          <Stack spacing={2}>
            <div className="row g-2">
              <div className="col-12 col-lg-4">
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Buscar ruta o acción"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </div>
              <div className="col-6 col-sm-4 col-lg-2">
                <FormControl size="small" fullWidth>
                  <InputLabel>Método</InputLabel>
                  <Select
                    label="Método"
                    value={metodo}
                    onChange={(e) => setMetodo(e.target.value)}
                  >
                    <MenuItem value="todos">Todos</MenuItem>
                    <MenuItem value="GET">GET</MenuItem>
                    <MenuItem value="POST">POST</MenuItem>
                    <MenuItem value="PUT">PUT</MenuItem>
                    <MenuItem value="PATCH">PATCH</MenuItem>
                    <MenuItem value="DELETE">DELETE</MenuItem>
                  </Select>
                </FormControl>
              </div>
              <div className="col-6 col-sm-4 col-lg-2">
                <TextField
                  label="Desde"
                  type="date"
                  size="small"
                  fullWidth
                  value={desde}
                  onChange={(e) => setDesde(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </div>
              <div className="col-6 col-sm-4 col-lg-2">
                <TextField
                  label="Hasta"
                  type="date"
                  size="small"
                  fullWidth
                  value={hasta}
                  onChange={(e) => setHasta(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </div>
              <div className="col-12 col-lg-2">
                <Autocomplete
                  options={usuariosOpc}
                  value={usuarioSel}
                  onChange={(_, v) => setUsuarioSel(v)}
                  getOptionLabel={(o) => o?.nombre || ""}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      size="small"
                      label="Usuario"
                      placeholder="Buscar usuario"
                      onChange={(e) => setUsuarioTxt(e.target.value)}
                    />
                  )}
                />
              </div>
            </div>

            {loading && <LinearProgress />}

            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Método</TableCell>
                  <TableCell>Ruta</TableCell>
                  <TableCell>Acción</TableCell>
                  <TableCell>Usuario</TableCell>
                  <TableCell>IP</TableCell>
                  <TableCell align="center">Ver</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>
                      {dayjs(r.creado_en).format("YYYY-MM-DD HH:mm")}
                    </TableCell>
                    <TableCell>
                      <MetodoChip m={r.metodo} />
                    </TableCell>
                    <TableCell>{r.ruta}</TableCell>
                    <TableCell>{r.accion || "-"}</TableCell>
                    <TableCell>{r.usuario_nombre || "-"}</TableCell>
                    <TableCell>{r.ip || "-"}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Detalle">
                        <IconButton
                          onClick={() => verDetalle(r.id)}
                          size="small"
                        >
                          <InfoIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                {!rows.length && !loading && (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      Sin resultados
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Stack>
        )}

        {tab === 1 && (
          <Stack spacing={2}>
            <div className="row g-2">
              <div className="col-12 col-md-4 col-lg-3">
                <Autocomplete
                  options={usuariosOpc}
                  value={usuarioSel}
                  onChange={(_, v) => setUsuarioSel(v)}
                  getOptionLabel={(o) => o?.nombre || ""}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      size="small"
                      label="Usuario"
                      placeholder="Buscar usuario"
                      onChange={(e) => setUsuarioTxt(e.target.value)}
                    />
                  )}
                />
              </div>
            </div>

            {loading && <LinearProgress />}

            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Usuario</TableCell>
                  <TableCell>Inicio</TableCell>
                  <TableCell>Fin</TableCell>
                  <TableCell>IP</TableCell>
                  <TableCell>User Agent</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{r.usuario_nombre}</TableCell>
                    <TableCell>
                      {dayjs(r.inicio_en).format("YYYY-MM-DD HH:mm")}
                    </TableCell>
                    <TableCell>
                      {r.fin_en
                        ? dayjs(r.fin_en).format("YYYY-MM-DD HH:mm")
                        : "-"}
                    </TableCell>
                    <TableCell>{r.ip || "-"}</TableCell>
                    <TableCell>{r.user_agent?.slice(0, 80) || "-"}</TableCell>
                  </TableRow>
                ))}
                {!rows.length && !loading && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      Sin resultados
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Stack>
        )}
      </Paper>

      <Dialog
        open={openDlg}
        onClose={() => setOpenDlg(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Detalle del evento</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={1}>
            <div>
              <strong>Método:</strong> {evento?.metodo}
            </div>
            <div>
              <strong>Ruta:</strong> {evento?.ruta}
            </div>
            <div>
              <strong>Acción:</strong> {evento?.accion || "-"}
            </div>
            <div>
              <strong>Usuario:</strong> {evento?.usuario_nombre || "-"}
            </div>
            <div>
              <strong>IP:</strong> {evento?.ip || "-"}
            </div>
            <div>
              <strong>Agente:</strong> {evento?.user_agent || "-"}
            </div>
            <div>
              <strong>Fecha:</strong>{" "}
              {evento
                ? dayjs(evento.creado_en).format("YYYY-MM-DD HH:mm:ss")
                : "-"}
            </div>
            <TextField
              label="Payload"
              value={
                evento?.payload ? JSON.stringify(evento.payload, null, 2) : ""
              }
              multiline
              minRows={6}
              fullWidth
              InputProps={{ readOnly: true }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDlg(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>

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
