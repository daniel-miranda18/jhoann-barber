import { useState } from "react";
import dayjs from "dayjs";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Divider,
  Paper,
  Chip,
} from "@mui/material";
import {
  getBarberosDesempeno,
  exportBarberosDesempenoPdf,
  getProductosMasVendidos,
  exportProductosMasVendidosPdf,
  getIngresosPeriodo,
  exportIngresosPeriodoPdf,
  getInventarioPeriodo,
  exportInventarioPeriodoPdf,
} from "../services/reportesServicio";
import {
  getComisionesPeriodo,
  exportComisionesPdf,
} from "../services/reportesServicio";

const REPORTS = [
  { id: "barberos", label: "Desempeño de barberos", enabled: true },
  { id: "productos", label: "Productos más vendidos", enabled: true },
  { id: "ingresos", label: "Ingresos (mensual/anual)", enabled: true },
  { id: "inventario", label: "Inventario por periodo", enabled: true },
  {
    id: "comisiones",
    label: "Comisiones (diario/semanal/mensual)",
    enabled: true,
  },
];

function formatMoney(n) {
  return `Bs ${Number(n || 0).toFixed(2)}`;
}

export default function Reportes() {
  const [reporte, setReporte] = useState("barberos");
  const [desde, setDesde] = useState(
    dayjs().startOf("month").format("YYYY-MM-DD")
  );
  const [hasta, setHasta] = useState(dayjs().format("YYYY-MM-DD"));
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState(null);
  const [groupBy, setGroupBy] = useState("month");

  const commonParams = { from: desde, to: hasta };

  async function vistaPrevia() {
    setLoading(true);
    setError(null);
    try {
      if (reporte === "barberos") {
        const res = await getBarberosDesempeno(commonParams);
        setRows(res.data || []);
      } else if (reporte === "productos") {
        const res = await getProductosMasVendidos({
          ...commonParams,
          limit: 100,
        });
        setRows(res.data || []);
      } else if (reporte === "ingresos") {
        const res = await getIngresosPeriodo({
          ...commonParams,
          group: groupBy,
        });
        setRows(res.data || []);
      } else if (reporte === "inventario") {
        const res = await getInventarioPeriodo(commonParams);
        setRows(res.data || []);
      } else if (reporte === "comisiones") {
        const res = await getComisionesPeriodo({
          ...commonParams,
          group: groupBy,
        });
        setRows(res.data || []);
      }
    } catch (e) {
      setError(e?.message || "Error al cargar datos del reporte");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  function openBlobInNewTab(blob, filename = "reporte.pdf") {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.target = "_blank";
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 20000);
  }

  async function exportarPdf() {
    setExporting(true);
    setError(null);
    try {
      let blob;
      if (reporte === "barberos") {
        blob = await exportBarberosDesempenoPdf({ from: desde, to: hasta });
        openBlobInNewTab(blob, `barberos-desempeno-${desde}-${hasta}.pdf`);
      } else if (reporte === "productos") {
        blob = await exportProductosMasVendidosPdf({
          from: desde,
          to: hasta,
          limit: 200,
        });
        openBlobInNewTab(blob, `productos-mas-vendidos-${desde}-${hasta}.pdf`);
      } else if (reporte === "ingresos") {
        blob = await exportIngresosPeriodoPdf({
          from: desde,
          to: hasta,
          group: groupBy,
        });
        openBlobInNewTab(blob, `ingresos-${groupBy}-${desde}-${hasta}.pdf`);
      } else if (reporte === "inventario") {
        blob = await exportInventarioPeriodoPdf({ from: desde, to: hasta });
        openBlobInNewTab(blob, `inventario-${desde}-${hasta}.pdf`);
      } else if (reporte === "comisiones") {
        blob = await exportComisionesPdf({
          from: desde,
          to: hasta,
          group: groupBy,
        });
        openBlobInNewTab(blob, `comisiones-${groupBy}-${desde}-${hasta}.pdf`);
      } else {
        throw new Error("Exportar PDF no implementado para este reporte");
      }
    } catch (e) {
      setError(e?.message || "Error al exportar PDF");
    } finally {
      setExporting(false);
    }
  }

  function renderTableHead() {
    if (reporte === "barberos") {
      return (
        <TableHead>
          <TableRow>
            <TableCell>#</TableCell>
            <TableCell>Barbero</TableCell>
            <TableCell align="right">Servicios</TableCell>
            <TableCell align="right">Ingresos</TableCell>
            <TableCell align="right">Ventas</TableCell>
          </TableRow>
        </TableHead>
      );
    }
    if (reporte === "productos") {
      return (
        <TableHead>
          <TableRow>
            <TableCell>#</TableCell>
            <TableCell>Producto</TableCell>
            <TableCell>SKU</TableCell>
            <TableCell align="right">Cantidad</TableCell>
            <TableCell align="right">Total (Bs.)</TableCell>
          </TableRow>
        </TableHead>
      );
    }
    if (reporte === "ingresos") {
      return (
        <TableHead>
          <TableRow>
            <TableCell>#</TableCell>
            <TableCell>Periodo</TableCell>
            <TableCell align="right">Ingresos (Bs.)</TableCell>
          </TableRow>
        </TableHead>
      );
    }
    if (reporte === "comisiones") {
      return (
        <TableHead>
          <TableRow>
            <TableCell>#</TableCell>
            <TableCell>Periodo</TableCell>
            <TableCell>Barbero</TableCell>
            <TableCell align="right">Servicios</TableCell>
            <TableCell align="right">Ventas</TableCell>
            <TableCell align="right">Total (Bs.)</TableCell>
            <TableCell align="right">Barbero (Bs.)</TableCell>
            <TableCell align="right">Barbería (Bs.)</TableCell>
          </TableRow>
        </TableHead>
      );
    }
    return (
      <TableHead>
        <TableRow>
          <TableCell>#</TableCell>
          <TableCell>Producto</TableCell>
          <TableCell>SKU</TableCell>
          <TableCell align="right">Stock</TableCell>
          <TableCell align="right">Vendidos</TableCell>
        </TableRow>
      </TableHead>
    );
  }

  function renderTableBody() {
    if (!rows || !rows.length) {
      const colspan = reporte === "comisiones" ? 8 : 5;
      return (
        <TableBody>
          <TableRow>
            <TableCell colSpan={colspan} sx={{ textAlign: "center", py: 6 }}>
              {loading
                ? "Cargando..."
                : 'Sin datos — usa "Vista previa" para cargar resultados'}
            </TableCell>
          </TableRow>
        </TableBody>
      );
    }

    if (reporte === "barberos") {
      return (
        <TableBody>
          {rows.map((r, i) => (
            <TableRow key={r.id ?? i}>
              <TableCell>{i + 1}</TableCell>
              <TableCell>{r.nombre}</TableCell>
              <TableCell align="right">{r.total_servicios ?? 0}</TableCell>
              <TableCell align="right">{formatMoney(r.ingresos)}</TableCell>
              <TableCell align="right">{r.ventas_count ?? 0}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      );
    }

    if (reporte === "productos") {
      return (
        <TableBody>
          {rows.map((r, i) => (
            <TableRow key={r.id ?? i}>
              <TableCell>{i + 1}</TableCell>
              <TableCell>{r.nombre}</TableCell>
              <TableCell>{r.sku || ""}</TableCell>
              <TableCell align="right">{r.cantidad_vendida ?? 0}</TableCell>
              <TableCell align="right">
                {formatMoney(r.total_vendido)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      );
    }

    if (reporte === "ingresos") {
      return (
        <TableBody>
          {rows.map((r, i) => (
            <TableRow key={`${r.periodo ?? i}`}>
              <TableCell>{i + 1}</TableCell>
              <TableCell>{r.periodo}</TableCell>
              <TableCell align="right">
                {formatMoney(r.total_ingresos)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      );
    }

    if (reporte === "comisiones") {
      return (
        <TableBody>
          {rows.map((r, i) => {
            const periodoRaw = String(r.periodo);
            const periodoDisplay =
              groupBy === "week"
                ? `${periodoRaw.slice(0, 4)}-W${periodoRaw.slice(4)}`
                : periodoRaw;
            return (
              <TableRow key={`${r.periodo}-${r.barbero_id}-${i}`}>
                <TableCell>{i + 1}</TableCell>
                <TableCell>{periodoDisplay}</TableCell>
                <TableCell>{r.nombre}</TableCell>
                <TableCell align="right">{r.servicios_count ?? 0}</TableCell>
                <TableCell align="right">{r.ventas_count ?? 0}</TableCell>
                <TableCell align="right">
                  {formatMoney(r.total_generado)}
                </TableCell>
                <TableCell align="right">
                  {formatMoney(r.monto_barbero)}
                </TableCell>
                <TableCell align="right">
                  {formatMoney(r.monto_barberia)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      );
    }

    return (
      <TableBody>
        {rows.map((r, i) => (
          <TableRow key={r.id ?? i}>
            <TableCell>{i + 1}</TableCell>
            <TableCell>{r.nombre}</TableCell>
            <TableCell>{r.sku || ""}</TableCell>
            <TableCell align="right">{r.stock ?? 0}</TableCell>
            <TableCell align="right">{r.vendidos_periodo ?? 0}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Card elevation={3}>
        <CardContent>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <div>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                Reportes
              </Typography>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <Chip label={`Desde ${desde}`} size="small" />
              <Chip label={`Hasta ${hasta}`} size="small" />
            </div>
          </div>

          <Divider sx={{ my: 2 }} />

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            alignItems="center"
            sx={{ mb: 2 }}
          >
            <FormControl size="small" sx={{ minWidth: 260 }}>
              <InputLabel id="reporte-select-label">Tipo de reporte</InputLabel>
              <Select
                labelId="reporte-select-label"
                value={reporte}
                label="Tipo de reporte"
                onChange={(e) => setReporte(e.target.value)}
              >
                {REPORTS.map((r) => (
                  <MenuItem key={r.id} value={r.id} disabled={!r.enabled}>
                    {r.label} {!r.enabled ? " (próximamente)" : ""}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Desde"
              type="date"
              size="small"
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Hasta"
              type="date"
              size="small"
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />

            {(reporte === "ingresos" || reporte === "comisiones") && (
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel>Agrupar</InputLabel>
                <Select
                  label="Agrupar"
                  value={groupBy}
                  onChange={(e) => setGroupBy(e.target.value)}
                >
                  <MenuItem value="day">Diario</MenuItem>
                  <MenuItem value="week">Semanal</MenuItem>
                  <MenuItem value="month">Mensual</MenuItem>
                </Select>
              </FormControl>
            )}

            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                onClick={vistaPrevia}
                disabled={loading}
              >
                {loading ? <CircularProgress size={18} /> : "Vista previa"}
              </Button>

              <Button
                variant="outlined"
                onClick={exportarPdf}
                disabled={exporting}
              >
                {exporting ? <CircularProgress size={18} /> : "Imprimir"}
              </Button>
            </Stack>
          </Stack>

          {error && (
            <Paper sx={{ p: 2, backgroundColor: "#fff4f4", mb: 2 }}>
              <Typography color="error" variant="body2">
                {error}
              </Typography>
            </Paper>
          )}

          <Paper variant="outlined" sx={{ mt: 1 }}>
            <Box sx={{ overflowX: "auto" }}>
              <Table size="small">
                {renderTableHead()}
                {renderTableBody()}
              </Table>
            </Box>
          </Paper>
        </CardContent>
      </Card>
    </Box>
  );
}
