import { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Paper,
  Stack,
  Typography,
  CircularProgress,
  Divider,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  LineChart,
  Line,
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
import { useAuth } from "../layouts/AppLayout";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
  "#FFC658",
  "#FF7C7C",
];

const estadoColors = {
  pendiente: "#FFC658",
  confirmada: "#82CA9D",
  completada: "#0088FE",
  cancelada: "#FF8042",
  no_asistio: "#FF7C7C",
};

function KPI({ icon: Icon, label, valor, color }) {
  return (
    <div
      className="card border-0 shadow-sm h-100 transition-transform"
      style={{ cursor: "pointer" }}
    >
      <div className="card-body d-flex flex-column justify-content-center align-items-center text-center">
        <div
          className="p-3 mb-3 rounded-3"
          style={{
            backgroundColor: `${color}20`,
            width: "70px",
            height: "70px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon sx={{ color, fontSize: 40 }} />
        </div>
        <p className="text-muted small mb-2">{label}</p>
        <h5 className="fw-bold" style={{ fontSize: "1.5rem" }}>
          {typeof valor === "number" ? valor.toLocaleString("es-ES") : valor}
        </h5>
      </div>
    </div>
  );
}

function DetalleBarberoModal({ open, onClose, barberoId, loading, data }) {
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
          <PersonIcon sx={{ fontSize: 32, color: "#3B82F6" }} />
          <Box>
            <Typography variant="h6" fontWeight={700}>
              {usuario.nombre}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {usuario.correo}
            </Typography>
          </Box>
        </Stack>
        <Button onClick={onClose}>
          <CloseIcon />
        </Button>
      </DialogTitle>

      <DialogContent dividers sx={{ bgcolor: "background.default" }}>
        <div className="container-fluid">
          <div className="row g-3 mb-4">
            <div className="col-12 col-sm-6 col-md-3">
              <KPI
                icon={TrendingUpIcon}
                label="Total Ingresos"
                valor={`Bs. ${totales.ingresos.toFixed(2)}`}
                color="#10B981"
              />
            </div>
            <div className="col-12 col-sm-6 col-md-3">
              <KPI
                icon={EventIcon}
                label="Total Citas"
                valor={totales.citas}
                color="#3B82F6"
              />
            </div>
            <div className="col-12 col-sm-6 col-md-3">
              <KPI
                icon={EventIcon}
                label="Citas Completadas"
                valor={totales.citasCompletadas}
                color="#8B5CF6"
              />
            </div>
            <div className="col-12 col-sm-6 col-md-3">
              <KPI
                icon={StarIcon}
                label="Tasa Completado"
                valor={`${totales.tasaCompletado.toFixed(1)}%`}
                color="#F59E0B"
              />
            </div>
          </div>

          {/* Gráficos */}
          <div className="row g-3 mb-4">
            <div className="col-12 col-lg-6">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <h6 className="card-title fw-bold mb-3">
                    Tendencia de Ingresos (6 meses)
                  </h6>
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={tendencia}>
                      <defs>
                        <linearGradient
                          id="colorTotal"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#3B82F6"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="#3B82F6"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="mes" />
                      <YAxis />
                      <Tooltip formatter={(v) => `Bs. ${v.toFixed(2)}`} />
                      <Area
                        type="monotone"
                        dataKey="total"
                        stroke="#3B82F6"
                        fillOpacity={1}
                        fill="url(#colorTotal)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="col-12 col-lg-6">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <h6 className="card-title fw-bold mb-3">
                    Servicios Realizados (30 días)
                  </h6>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={servicios}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="servicio"
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip labelStyle={{ color: "#000" }} />
                      <Legend />
                      <Bar
                        yAxisId="left"
                        dataKey="cantidad"
                        fill="#82CA9D"
                        name="Cantidad"
                      />
                      <Bar
                        yAxisId="right"
                        dataKey="total"
                        fill="#3B82F6"
                        name="Total ($)"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* Tabla */}
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h6 className="card-title fw-bold mb-3">Detalles de Servicios</h6>
              <div className="table-responsive">
                <table className="table table-sm table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Servicio</th>
                      <th className="text-end">Cantidad</th>
                      <th className="text-end">Total ($)</th>
                      <th className="text-end">Promedio ($)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {servicios.map((s, i) => (
                      <tr key={i}>
                        <td className="fw-500">{s.servicio}</td>
                        <td className="text-end">{s.cantidad}</td>
                        <td className="text-end fw-600">
                          Bs. {s.total.toFixed(2)}
                        </td>
                        <td className="text-end">
                          Bs. {(s.total / s.cantidad).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
  const { usuario, rol } = useAuth();

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
        setVentas7(r2 || []);
        setGastos7(r3 || []);
        setVentasBarbero(r4 || []);
        setCitasEstado(r5 || []);
        setProductosVendidos(r6 || []);
        setIngresoGasto(r7 || []);
        setBarberos(r8 || []);
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
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "60vh" }}
      >
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <h1 className="card-title fw-bold mb-3">Dashboard</h1>
          <hr className="my-3" />

          {/* KPIs */}
          <div className="row g-3 mb-4">
            <div className="col-12 col-sm-6 col-lg-3">
              <KPI
                icon={TrendingUpIcon}
                label="Ventas Hoy"
                valor={`Bs. ${resumen?.ventasHoy?.toFixed(2)}`}
                color="#10B981"
              />
            </div>
            <div className="col-12 col-sm-6 col-lg-3">
              <KPI
                icon={ShoppingCartIcon}
                label="Gastos Hoy"
                valor={`Bs. ${resumen?.gastosHoy?.toFixed(2)}`}
                color="#EF4444"
              />
            </div>
            <div className="col-12 col-sm-6 col-lg-3">
              <KPI
                icon={EventIcon}
                label="Citas Hoy"
                valor={resumen?.citasHoy}
                color="#3B82F6"
              />
            </div>
            <div className="col-12 col-sm-6 col-lg-3">
              <KPI
                icon={GroupIcon}
                label="Clientes"
                valor={resumen?.clientesActivos}
                color="#8B5CF6"
              />
            </div>
          </div>

          {/* Gráficos principales */}
          <div className="row g-3 mb-4">
            <div className="col-12 col-lg-6">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <h6 className="card-title fw-bold mb-3">
                    Ventas Últimos 7 Días
                  </h6>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={ventas7}>
                      <defs>
                        <linearGradient
                          id="colorVentas"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#10B981"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="#10B981"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="fecha" />
                      <YAxis />
                      <Tooltip formatter={(v) => `Bs. ${v.toFixed(2)}`} />
                      <Area
                        type="monotone"
                        dataKey="total"
                        stroke="#10B981"
                        fill="url(#colorVentas)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="col-12 col-lg-6">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <h6 className="card-title fw-bold mb-3">
                    Gastos Últimos 7 Días
                  </h6>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={gastos7}>
                      <defs>
                        <linearGradient
                          id="colorGastos"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#EF4444"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="#EF4444"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="fecha" />
                      <YAxis />
                      <Tooltip formatter={(v) => `Bs. ${v.toFixed(2)}`} />
                      <Area
                        type="monotone"
                        dataKey="total"
                        stroke="#EF4444"
                        fill="url(#colorGastos)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="col-12 col-lg-6">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <h6 className="card-title fw-bold mb-3">
                    Ventas por Barbero (30 días)
                  </h6>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={ventasBarbero}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="barbero"
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis />
                      <Tooltip formatter={(v) => `Bs. ${v.toFixed(2)}`} />
                      <Bar dataKey="total" fill="#3B82F6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="col-12 col-lg-6">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <h6 className="card-title fw-bold mb-3">
                    Citas por Estado (30 días)
                  </h6>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={citasEstado}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ estado, cantidad }) =>
                          `${estado}: ${cantidad}`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="cantidad"
                      >
                        {citasEstado.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              estadoColors[entry.estado] ||
                              COLORS[index % COLORS.length]
                            }
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="col-12">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <h6 className="card-title fw-bold mb-3">
                    Productos Más Vendidos (30 días)
                  </h6>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={productosVendidos}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="producto"
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Bar
                        yAxisId="left"
                        dataKey="cantidad"
                        fill="#82CA9D"
                        name="Cantidad"
                      />
                      <Bar
                        yAxisId="right"
                        dataKey="total"
                        fill="#8884D8"
                        name="Total ($)"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="col-12">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <h6 className="card-title fw-bold mb-3">
                    Comparativo Ingreso vs Gasto (30 días)
                  </h6>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={ingresoGasto}>
                      <defs>
                        <linearGradient
                          id="colorNeto"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#8B5CF6"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="#8B5CF6"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="fecha" />
                      <YAxis />
                      <Tooltip formatter={(v) => `Bs. ${v.toFixed(2)}`} />
                      <Area
                        type="monotone"
                        dataKey="total"
                        stroke="#8B5CF6"
                        fill="url(#colorNeto)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* Desempeño de Barberos */}
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h6 className="card-title fw-bold mb-3">Desempeño de Barberos</h6>
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Barbero</th>
                      <th className="text-center">Ingresos ($)</th>
                      <th className="text-center">Citas</th>
                      <th className="text-center">Calificación</th>
                      <th className="text-center">% Completado</th>
                      <th className="text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {barberos.map((b) => (
                      <tr key={b.id}>
                        <td className="fw-600">{b.nombre}</td>
                        <td className="text-center">
                          Bs. {b.totalIngresos.toFixed(2)}
                        </td>
                        <td className="text-center">
                          <Chip
                            label={b.totalCitas}
                            size="small"
                            variant="outlined"
                          />
                        </td>
                        <td className="text-center">
                          <Stack
                            direction="row"
                            spacing={0.5}
                            justifyContent="center"
                            alignItems="center"
                          >
                            <StarIcon sx={{ fontSize: 16, color: "#F59E0B" }} />
                            <span>{b.calificacion.toFixed(1)}</span>
                          </Stack>
                        </td>
                        <td className="text-center">
                          <Chip
                            label={`${b.tasaCompletado.toFixed(1)}%`}
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
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Detalle */}
      <DetalleBarberoModal
        open={detalleBarberoOpen}
        onClose={cerrarDetalleBarbero}
        loading={loadingDetalle}
        data={detalleBarberoData}
      />
    </div>
  );
}
