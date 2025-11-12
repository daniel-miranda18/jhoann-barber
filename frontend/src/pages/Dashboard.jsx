import { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Grid,
  Paper,
  Stack,
  Typography,
  CircularProgress,
  Divider,
  Chip,
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
} from "recharts";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import EventIcon from "@mui/icons-material/Event";
import GroupIcon from "@mui/icons-material/Group";
import {
  obtenerResumen,
  obtenerVentas7Dias,
  obtenerGastos7Dias,
  obtenerVentasPorBarbero,
  obtenerCitasPorEstado,
  obtenerProductosMasVendidos,
  obtenerComparativoIngresoGasto,
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
    <Card variant="outlined" sx={{ borderRadius: 2 }}>
      <CardContent>
        <Stack direction="row" spacing={2} alignItems="center">
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              bgcolor: `${color}20`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon sx={{ color, fontSize: 28 }} />
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              {label}
            </Typography>
            <Typography variant="h6" fontWeight={700}>
              {typeof valor === "number"
                ? valor.toLocaleString("es-ES")
                : valor}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { usuario, rol } = useAuth();
  const permisos = rol?.data?.permisos || [];

  const [resumen, setResumen] = useState(null);
  const [ventas7, setVentas7] = useState([]);
  const [gastos7, setGastos7] = useState([]);
  const [ventasBarbero, setVentasBarbero] = useState([]);
  const [citasEstado, setCitasEstado] = useState([]);
  const [productosVendidos, setProductosVendidos] = useState([]);
  const [ingresoGasto, setIngresoGasto] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [r1, r2, r3, r4, r5, r6, r7] = await Promise.all([
          obtenerResumen().then((d) => d?.data),
          obtenerVentas7Dias().then((d) => d?.data),
          obtenerGastos7Dias().then((d) => d?.data),
          obtenerVentasPorBarbero().then((d) => d?.data),
          obtenerCitasPorEstado().then((d) => d?.data),
          obtenerProductosMasVendidos().then((d) => d?.data),
          obtenerComparativoIngresoGasto().then((d) => d?.data),
        ]);
        setResumen(r1 || {});
        setVentas7(r2 || []);
        setGastos7(r3 || []);
        setVentasBarbero(r4 || []);
        setCitasEstado(r5 || []);
        setProductosVendidos(r6 || []);
        setIngresoGasto(r7 || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

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

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2.5, md: 3.5 },
        borderRadius: 3,
        border: 1,
        borderColor: "divider",
      }}
    >
      <Stack
        direction="row"
        alignItems="baseline"
        justifyContent="space-between"
        sx={{ mb: 2 }}
      >
        <Typography variant="h5" fontWeight={800}>
          Dashboard
        </Typography>
        <Chip
          label={rol?.data?.nombre || "—"}
          color="primary"
          variant="outlined"
        />
      </Stack>
      <Divider sx={{ mb: 3 }} />

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <KPI
            icon={TrendingUpIcon}
            label="Ventas Hoy"
            valor={`$${resumen?.ventasHoy?.toFixed(2)}`}
            color="#10B981"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPI
            icon={ShoppingCartIcon}
            label="Gastos Hoy"
            valor={`$${resumen?.gastosHoy?.toFixed(2)}`}
            color="#EF4444"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPI
            icon={EventIcon}
            label="Citas Hoy"
            valor={resumen?.citasHoy}
            color="#3B82F6"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPI
            icon={GroupIcon}
            label="Clientes"
            valor={resumen?.clientesActivos}
            color="#8B5CF6"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={6}>
          <Card variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                Ventas Últimos 7 Días
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={ventas7}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="fecha" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => `$${value.toFixed(2)}`}
                    labelStyle={{ color: "#000" }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="#10B981"
                    strokeWidth={2}
                    name="Total"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={6}>
          <Card variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                Gastos Últimos 7 Días
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={gastos7}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="fecha" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => `$${value.toFixed(2)}`}
                    labelStyle={{ color: "#000" }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="#EF4444"
                    strokeWidth={2}
                    name="Total"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={6}>
          <Card variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                Ventas por Barbero (30 días)
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={ventasBarbero}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="barbero" width={80} />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => `$${value.toFixed(2)}`}
                    labelStyle={{ color: "#000" }}
                  />
                  <Bar dataKey="total" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={6}>
          <Card variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                Citas por Estado (30 días)
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={citasEstado}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ estado, cantidad }) => `${estado}: ${cantidad}`}
                    outerRadius={100}
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
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                Productos Más Vendidos (30 días)
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={productosVendidos}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="producto" width={100} />
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
                    fill="#8884D8"
                    name="Total ($)"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                Comparativo Ingreso vs Gasto (30 días)
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={ingresoGasto}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="fecha" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => `$${value.toFixed(2)}`}
                    labelStyle={{ color: "#000" }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="#8B5CF6"
                    strokeWidth={2}
                    name="Neto"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Paper>
  );
}
