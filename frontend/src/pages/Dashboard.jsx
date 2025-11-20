import { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Stack,
  Typography,
  CircularProgress,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  useTheme,
} from "@mui/material";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import EventIcon from "@mui/icons-material/Event";
import GroupIcon from "@mui/icons-material/Group";
import StarIcon from "@mui/icons-material/Star";
import PersonIcon from "@mui/icons-material/Person";
import CloseIcon from "@mui/icons-material/Close";
import {
  obtenerResumen,
  obtenerVentas7Dias,
  obtenerGastos7Dias,
  obtenerVentasPorBarbero,
  obtenerCitasPorEstado,
  obtenerProductosMasVendidos,
  obtenerComparativoIngresoGasto,
  obtenerListaBarberos,
  obtenerDetalleBarbero,
} from "../services/dashboardServicio.js";

function normalizeLabel(v) {
  if (v === null || v === undefined) return "--";
  const s = String(v).trim();
  if (!s) return "--";
  return s.toUpperCase();
}
function formatBs(v) {
  const n = Number(v || 0);
  return `Bs. ${n.toLocaleString("es-ES", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function KPI({ icon: Icon, label, valor, color }) {
  return (
    <Card
      sx={{
        boxShadow: "0 6px 24px rgba(0,0,0,0.08)",
        borderRadius: 2,
        height: "100%",
      }}
    >
      <CardContent>
        <Stack spacing={2} alignItems="flex-start">
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              backgroundColor: `${color}20`,
              display: "inline-flex",
            }}
          >
            <Icon sx={{ color, fontSize: 28 }} />
          </Box>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontWeight: 600 }}
          >
            {label}
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 700, color }}>
            {typeof valor === "number" ? valor.toLocaleString("es-ES") : valor}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}

function DetalleBarberoModal({ open, onClose, loading, data, theme }) {
  if (loading) {
    return (
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
        <DialogTitle>
          Cargando...
          <Button
            onClick={onClose}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </Button>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
            <CircularProgress />
          </Box>
        </DialogContent>
      </Dialog>
    );
  }
  if (!data) return null;
  const { usuario, totales, tendencia, servicios } = data;
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              backgroundColor: `${theme.palette.primary.main}20`,
            }}
          >
            <PersonIcon
              sx={{ fontSize: 28, color: theme.palette.primary.main }}
            />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={700}>
              {normalizeLabel(usuario?.nombre)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {usuario?.correo || "--"}
            </Typography>
          </Box>
        </Stack>
        <Button onClick={onClose}>
          <CloseIcon />
        </Button>
      </DialogTitle>

      <DialogContent dividers>
        <div className="container-fluid">
          <div className="row g-2 mb-3">
            <div className="col-12 col-sm-6 col-md-3">
              <KPI
                icon={TrendingUpIcon}
                label="TOTAL INGRESOS"
                valor={formatBs(totales?.ingresos)}
                color={theme.palette.success.main}
              />
            </div>
            <div className="col-12 col-sm-6 col-md-3">
              <KPI
                icon={EventIcon}
                label="TOTAL CITAS"
                valor={totales?.citas ?? 0}
                color={theme.palette.primary.main}
              />
            </div>
            <div className="col-12 col-sm-6 col-md-3">
              <KPI
                icon={EventIcon}
                label="CITAS COMPLETADAS"
                valor={totales?.citasCompletadas ?? 0}
                color={theme.palette.secondary.main}
              />
            </div>
            <div className="col-12 col-sm-6 col-md-3">
              <KPI
                icon={StarIcon}
                label="TASA COMPLETADO"
                valor={`${(totales?.tasaCompletado ?? 0).toFixed(1)}%`}
                color={theme.palette.warning.main}
              />
            </div>
          </div>

          <div className="row g-3 mb-3">
            <div className="col-12 col-lg-6">
              <Card sx={{ boxShadow: "0 6px 24px rgba(0,0,0,0.06)" }}>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={700} mb={2}>
                    TENDENCIA INGRESOS (6 MESES)
                  </Typography>
                  <ResponsiveContainer width="100%" height={240}>
                    <AreaChart data={tendencia || []}>
                      <defs>
                        <linearGradient
                          id="gIngreso"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor={theme.palette.primary.main}
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor={theme.palette.primary.main}
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={theme.palette.divider}
                      />
                      <XAxis
                        dataKey="mes"
                        stroke={theme.palette.text.secondary}
                      />
                      <YAxis stroke={theme.palette.text.secondary} />
                      <Tooltip
                        formatter={(v) => formatBs(v)}
                        contentStyle={{
                          backgroundColor: theme.palette.background.paper,
                          border: `1px solid ${theme.palette.divider}`,
                          borderRadius: 8,
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="total"
                        stroke={theme.palette.primary.main}
                        fill="url(#gIngreso)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <div className="col-12 col-lg-6">
              <Card sx={{ boxShadow: "0 6px 24px rgba(0,0,0,0.06)" }}>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={700} mb={2}>
                    SERVICIOS REALIZADOS (30 DÍAS)
                  </Typography>
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={servicios || []}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={theme.palette.divider}
                      />
                      <XAxis
                        dataKey="servicio"
                        stroke={theme.palette.text.secondary}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis stroke={theme.palette.text.secondary} />
                      <Tooltip
                        formatter={(v) => formatBs(v)}
                        contentStyle={{
                          backgroundColor: theme.palette.background.paper,
                          border: `1px solid ${theme.palette.divider}`,
                          borderRadius: 8,
                        }}
                      />
                      <Bar
                        dataKey="cantidad"
                        fill={theme.palette.success.main}
                        name="CANTIDAD"
                      />
                      <Bar
                        dataKey="total"
                        fill={theme.palette.primary.main}
                        name="TOTAL (Bs.)"
                      />
                      <Legend />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="row">
            <div className="col-12">
              <Card sx={{ boxShadow: "0 6px 24px rgba(0,0,0,0.06)" }}>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={700} mb={2}>
                    DETALLES DE SERVICIOS
                  </Typography>
                  <Box sx={{ overflowX: "auto" }}>
                    <table className="table table-sm mb-0">
                      <thead>
                        <tr
                          style={{
                            backgroundColor: theme.palette.background.default,
                          }}
                        >
                          <th style={{ color: theme.palette.text.secondary }}>
                            SERVICIO
                          </th>
                          <th
                            style={{ color: theme.palette.text.secondary }}
                            className="text-end"
                          >
                            CANTIDAD
                          </th>
                          <th
                            style={{ color: theme.palette.text.secondary }}
                            className="text-end"
                          >
                            TOTAL (Bs.)
                          </th>
                          <th
                            style={{ color: theme.palette.text.secondary }}
                            className="text-end"
                          >
                            PROMEDIO (Bs.)
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {(servicios || []).map((s, i) => (
                          <tr key={i}>
                            <td style={{ fontWeight: 600 }}>
                              {normalizeLabel(s?.servicio)}
                            </td>
                            <td className="text-end">
                              {Number(s?.cantidad ?? 0)}
                            </td>
                            <td className="text-end fw-600">
                              {formatBs(s?.total)}
                            </td>
                            <td className="text-end">
                              {s?.cantidad
                                ? formatBs((s.total || 0) / s.cantidad)
                                : formatBs(0)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </Box>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="contained">
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function Dashboard() {
  const theme = useTheme();
  const [resumen, setResumen] = useState(null);
  const [ventas7, setVentas7] = useState([]);
  const [gastos7, setGastos7] = useState([]);
  const [ventasBarbero, setVentasBarbero] = useState([]);
  const [citasEstado, setCitasEstado] = useState([]);
  const [productosVendidos, setProductosVendidos] = useState([]);
  const [ingresoGasto, setIngresoGasto] = useState([]);
  const [barberos, setBarberos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detalleBarberoOpen, setDetalleBarberoOpen] = useState(false);
  const [detalleBarberoData, setDetalleBarberoData] = useState(null);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const [r1, r2, r3, r4, r5, r6, r7, r8] = await Promise.all([
          obtenerResumen().then((d) => d?.data),
          obtenerVentas7Dias().then((d) => d?.data),
          obtenerGastos7Dias().then((d) => d?.data),
          obtenerVentasPorBarbero().then((d) => d?.data),
          obtenerCitasPorEstado().then((d) => d?.data),
          obtenerProductosMasVendidos().then((d) => d?.data),
          obtenerComparativoIngresoGasto().then((d) => d?.data),
          obtenerListaBarberos().then((d) => d?.data),
        ]);
        setResumen(r1 || {});
        setVentas7(
          (r2 || []).map((x) => ({ ...x, total: Number(x.total || 0) }))
        );
        setGastos7(
          (r3 || []).map((x) => ({ ...x, total: Number(x.total || 0) }))
        );
        setVentasBarbero(
          (r4 || []).map((x) => ({
            ...x,
            barbero: normalizeLabel(x.barbero ?? x.nombre ?? ""),
            total: Number(x.total || 0),
          }))
        );
        setCitasEstado(
          (r5 || []).map((x) => ({
            ...x,
            estadoLabel: normalizeLabel(x.estado ?? x.estado_label ?? ""),
            estadoKey: String(x.estado ?? "").toLowerCase(),
            cantidad: Number(x.cantidad ?? 0),
          }))
        );
        setProductosVendidos(
          (r6 || []).map((x) => ({
            ...x,
            producto: normalizeLabel(x.producto ?? x.nombre ?? ""),
            cantidad: Number(x.cantidad ?? 0),
            total: Number(x.total ?? 0),
          }))
        );
        setIngresoGasto(
          (r7 || []).map((x) => ({ ...x, total: Number(x.total || 0) }))
        );
        setBarberos(
          (r8 || []).map((x) => ({
            ...x,
            nombre: normalizeLabel(x.nombre ?? ""),
          }))
        );
      } catch (e) {
        throw e;
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const abrirDetalleBarbero = async (id) => {
    setDetalleBarberoOpen(true);
    setLoadingDetalle(true);
    try {
      const res = await obtenerDetalleBarbero(id);
      setDetalleBarberoData(res?.data);
    } catch (e) {
      throw e;
    } finally {
      setLoadingDetalle(false);
    }
  };

  const cerrarDetalleBarbero = () => {
    setDetalleBarberoOpen(false);
    setDetalleBarberoData(null);
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  const estadoPalette = {
    pendiente: theme.palette.warning.main,
    confirmada: theme.palette.success.main,
    completada: theme.palette.primary.main,
    cancelada: theme.palette.error.main,
    no_asistio: theme.palette.secondary.main,
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <div className="container">
        <Typography
          variant="h4"
          sx={{ fontWeight: 900, mb: 1, color: "#212529" }}
        >
          Panel de Control
        </Typography>
      </div>
      <div className="row g-3 mb-3">
        <div className="col-12 col-sm-6 col-md-3">
          <KPI
            icon={TrendingUpIcon}
            label="VENTAS HOY"
            valor={formatBs(resumen?.ventasHoy)}
            color={theme.palette.success.main}
          />
        </div>
        <div className="col-12 col-sm-6 col-md-3">
          <KPI
            icon={ShoppingCartIcon}
            label="GASTOS HOY"
            valor={formatBs(resumen?.gastosHoy)}
            color={theme.palette.error.main}
          />
        </div>
        <div className="col-12 col-sm-6 col-md-3">
          <KPI
            icon={EventIcon}
            label="CITAS HOY"
            valor={resumen?.citasHoy ?? 0}
            color={theme.palette.primary.main}
          />
        </div>
        <div className="col-12 col-sm-6 col-md-3">
          <KPI
            icon={GroupIcon}
            label="CLIENTES"
            valor={resumen?.clientesActivos ?? 0}
            color={theme.palette.secondary.main}
          />
        </div>
      </div>

      <Card sx={{ boxShadow: "0 6px 24px rgba(0,0,0,0.06)" }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={tabValue}
            onChange={(_, v) => setTabValue(v)}
            aria-label="dashboard tabs"
            sx={{
              "& .MuiTabs-indicator": {
                backgroundColor: theme.palette.primary.main,
                height: 3,
              },
            }}
          >
            <Tab label="Gráficos" />
            <Tab label="Desempeño de Barberos" />
          </Tabs>
        </Box>

        <Box sx={{ p: 3 }} hidden={tabValue !== 0}>
          <div className="row g-3">
            <div className="col-12 col-lg-6">
              <Card
                sx={{
                  boxShadow: "0 6px 24px rgba(0,0,0,0.06)",
                  height: "100%",
                }}
              >
                <CardContent>
                  <Typography variant="h6" fontWeight={700} mb={2}>
                    VENTAS ÚLTIMOS 7 DÍAS
                  </Typography>
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={ventas7} margin={{ bottom: 50 }}>
                      <defs>
                        <linearGradient id="gV" x1="0" y1="0" x2="0" y2="1">
                          <stop
                            offset="5%"
                            stopColor={theme.palette.success.main}
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor={theme.palette.success.main}
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={theme.palette.divider}
                      />
                      <XAxis
                        dataKey="fecha"
                        stroke={theme.palette.text.secondary}
                        angle={-25}
                        textAnchor="end"
                        interval={0}
                      />
                      <YAxis stroke={theme.palette.text.secondary} />
                      <Tooltip
                        formatter={(v) => formatBs(v)}
                        contentStyle={{
                          backgroundColor: theme.palette.background.paper,
                          border: `1px solid ${theme.palette.divider}`,
                          borderRadius: 8,
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="total"
                        stroke={theme.palette.success.main}
                        fill="url(#gV)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <div className="col-12 col-lg-6">
              <Card
                sx={{
                  boxShadow: "0 6px 24px rgba(0,0,0,0.06)",
                  height: "100%",
                }}
              >
                <CardContent>
                  <Typography variant="h6" fontWeight={700} mb={2}>
                    GASTOS ÚLTIMOS 7 DÍAS
                  </Typography>
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart
                      data={gastos7}
                      margin={{ bottom: 50, left: 0, right: 0, top: 0 }}
                    >
                      <defs>
                        <linearGradient id="gG" x1="0" y1="0" x2="0" y2="1">
                          <stop
                            offset="5%"
                            stopColor={theme.palette.error.main}
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor={theme.palette.error.main}
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={theme.palette.divider}
                      />
                      <XAxis
                        dataKey="fecha"
                        stroke={theme.palette.text.secondary}
                        tick={{ fontSize: 11 }}
                      />
                      <YAxis stroke={theme.palette.text.secondary} />
                      <Tooltip
                        formatter={(v) => formatBs(v)}
                        contentStyle={{
                          backgroundColor: theme.palette.background.paper,
                          border: `1px solid ${theme.palette.divider}`,
                          borderRadius: 8,
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="total"
                        stroke={theme.palette.error.main}
                        fill="url(#gG)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <div className="col-12 col-lg-6">
              <Card
                sx={{
                  boxShadow: "0 6px 24px rgba(0,0,0,0.06)",
                  height: "100%",
                }}
              >
                <CardContent>
                  <Typography variant="h6" fontWeight={700} mb={2}>
                    SERVICIOS POR BARBERO (30 DÍAS)
                  </Typography>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart
                      data={ventasBarbero}
                      margin={{ bottom: 50, left: 0, right: 0, top: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={theme.palette.divider}
                      />
                      <XAxis
                        dataKey="barbero"
                        stroke={theme.palette.text.secondary}
                        tick={{ fontSize: 11 }}
                        angle={-25}
                        textAnchor="end"
                      />
                      <YAxis stroke={theme.palette.text.secondary} />
                      <Tooltip
                        formatter={(v) => formatBs(v)}
                        contentStyle={{
                          backgroundColor: theme.palette.background.paper,
                          border: `1px solid ${theme.palette.divider}`,
                          borderRadius: 8,
                        }}
                      />
                      <Bar
                        dataKey="total"
                        fill={theme.palette.primary.main}
                        name="TOTAL (Bs.)"
                        radius={[8, 8, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <div className="col-12 col-lg-6">
              <Card
                sx={{
                  boxShadow: "0 6px 24px rgba(0,0,0,0.06)",
                  height: "100%",
                }}
              >
                <CardContent>
                  <Typography variant="h6" fontWeight={700} mb={2}>
                    CITAS POR ESTADO (30 DÍAS)
                  </Typography>
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={citasEstado}
                        dataKey="cantidad"
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        label={({ payload }) =>
                          `${payload?.estadoLabel ?? "--"}: ${
                            payload?.cantidad ?? 0
                          }`
                        }
                      >
                        {(citasEstado || []).map((entry, i) => (
                          <Cell
                            key={`c-${i}`}
                            fill={
                              estadoPalette[entry.estadoKey] ??
                              theme.palette.primary.main
                            }
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(v) => `${Number(v || 0)} `}
                        contentStyle={{
                          backgroundColor: theme.palette.background.paper,
                          border: `1px solid ${theme.palette.divider}`,
                          borderRadius: 8,
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <div className="col-12">
              <Card
                sx={{
                  boxShadow: "0 6px 24px rgba(0,0,0,0.06)",
                  height: "100%",
                }}
              >
                <CardContent>
                  <Typography variant="h6" fontWeight={700} mb={2}>
                    PRODUCTOS MÁS VENDIDOS (30 DÍAS)
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={productosVendidos} margin={{ bottom: 50 }}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={theme.palette.divider}
                      />
                      <XAxis
                        dataKey="producto"
                        stroke={theme.palette.text.secondary}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis stroke={theme.palette.text.secondary} />
                      <Tooltip
                        formatter={(v) => formatBs(v)}
                        contentStyle={{
                          backgroundColor: theme.palette.background.paper,
                          border: `1px solid ${theme.palette.divider}`,
                          borderRadius: 8,
                        }}
                      />
                      <Legend />
                      <Bar
                        yAxisId="left"
                        dataKey="cantidad"
                        fill={theme.palette.success.main}
                        name="CANTIDAD"
                        radius={[8, 8, 0, 0]}
                      />
                      <Bar
                        yAxisId="right"
                        dataKey="total"
                        fill={theme.palette.primary.main}
                        name="TOTAL (Bs.)"
                        radius={[8, 8, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <div className="col-12">
              <Card
                sx={{
                  boxShadow: "0 6px 24px rgba(0,0,0,0.06)",
                  height: "100%",
                }}
              >
                <CardContent>
                  <Typography variant="h6" fontWeight={700} mb={2}>
                    COMPARATIVO INGRESO VS GASTO (30 DÍAS)
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart
                      data={ingresoGasto}
                      margin={{ bottom: 50, left: 0, right: 0, top: 0 }}
                    >
                      <defs>
                        <linearGradient id="gN" x1="0" y1="0" x2="0" y2="1">
                          <stop
                            offset="5%"
                            stopColor={theme.palette.secondary.main}
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor={theme.palette.secondary.main}
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={theme.palette.divider}
                      />
                      <XAxis
                        dataKey="fecha"
                        stroke={theme.palette.text.secondary}
                        tick={{ fontSize: 11 }}
                      />
                      <YAxis stroke={theme.palette.text.secondary} />
                      <Tooltip
                        formatter={(v) => formatBs(v)}
                        contentStyle={{
                          backgroundColor: theme.palette.background.paper,
                          border: `1px solid ${theme.palette.divider}`,
                          borderRadius: 8,
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="total"
                        stroke={theme.palette.secondary.main}
                        fill="url(#gN)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        </Box>

        <Box sx={{ p: 3 }} hidden={tabValue !== 1}>
          <Card sx={{ boxShadow: "0 6px 24px rgba(0,0,0,0.06)" }}>
            <CardContent>
              <Box sx={{ overflowX: "auto" }}>
                <table className="table table-hover mb-0">
                  <thead>
                    <tr
                      style={{
                        backgroundColor: theme.palette.background.default,
                      }}
                    >
                      <th style={{ color: theme.palette.text.secondary }}>
                        BARBERO
                      </th>
                      <th
                        style={{ color: theme.palette.text.secondary }}
                        className="text-center"
                      >
                        INGRESOS (Bs.)
                      </th>
                      <th
                        style={{ color: theme.palette.text.secondary }}
                        className="text-center"
                      >
                        CITAS
                      </th>

                      <th
                        style={{ color: theme.palette.text.secondary }}
                        className="text-center"
                      >
                        % COMPLETADO
                      </th>
                      <th
                        style={{ color: theme.palette.text.secondary }}
                        className="text-center"
                      >
                        ACCIONES
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {barberos.map((b) => (
                      <tr key={b.id}>
                        <td style={{ fontWeight: 600 }}>{b.nombre}</td>
                        <td className="text-center">
                          {formatBs(b.totalIngresos || 0)}
                        </td>
                        <td className="text-center">
                          <Chip
                            label={b.totalCitas ?? 0}
                            size="small"
                            variant="outlined"
                            color="primary"
                          />
                        </td>

                        <td className="text-center">
                          <Chip
                            label={`${(b.tasaCompletado ?? 0).toFixed(1)}%`}
                            size="small"
                            color={
                              b.tasaCompletado >= 90
                                ? "success"
                                : b.tasaCompletado >= 70
                                ? "warning"
                                : "error"
                            }
                            variant="outlined"
                          />
                        </td>
                        <td className="text-center">
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => abrirDetalleBarbero(b.id)}
                          >
                            Ver Detalle
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Card>

      <DetalleBarberoModal
        open={detalleBarberoOpen}
        onClose={cerrarDetalleBarbero}
        loading={loadingDetalle}
        data={detalleBarberoData}
        theme={theme}
      />
    </Box>
  );
}
