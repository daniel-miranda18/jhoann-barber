import { useEffect, useMemo, useState } from "react";
import {
  Paper,
  Typography,
  Button,
  TextField,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  TableContainer,
  LinearProgress,
  Stack,
  Tooltip,
  Box,
  Chip,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import PaidIcon from "@mui/icons-material/Paid";
import {
  listarComisionesSemana,
  pagarComision,
} from "../services/comisionesServicio";
import dayjs from "dayjs";

function weekStartFromDate(dateStr) {
  const d = new Date(dateStr + "T00:00:00Z");
  const day = d.getUTCDay();
  const weekday = day === 0 ? 6 : day - 1;
  d.setUTCDate(d.getUTCDate() - weekday);
  return d.toISOString().slice(0, 10);
}

function estadoToChip(r) {
  if (r.pagado) return <Chip label="Pagado" color="success" size="small" />;
  const estado = (r.estado || "").toString().toLowerCase();
  if (estado === "anulado" || estado === "cancelada" || estado === "cancelado")
    return <Chip label="Anulado" color="error" size="small" />;
  if (estado === "no_asistio" || estado === "no asistió")
    return <Chip label="No asistió" color="warning" size="small" />;
  return <Chip label="Pendiente" color="warning" size="small" />;
}

export default function Comisiones() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openPayDialog, setOpenPayDialog] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [snack, setSnack] = useState({ open: false, msg: "", sev: "success" });

  async function fetchData() {
    setLoading(true);
    try {
      const data = await listarComisionesSemana({ fecha });
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setRows([]);
      setSnack({
        open: true,
        msg: e?.response?.data?.mensaje || "Error al cargar",
        sev: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, [fecha]);

  async function handlePagarConfirm() {
    if (!selectedRow) return;
    try {
      await pagarComision({
        barbero_id: selectedRow.barbero_id,
        semana_inicio: selectedRow.semana_inicio,
      });
      setOpenPayDialog(false);
      setSelectedRow(null);
      setSnack({ open: true, msg: "Pago registrado", sev: "success" });
      fetchData();
    } catch (e) {
      setSnack({
        open: true,
        msg: e?.response?.data?.mensaje || "Error al registrar pago",
        sev: "error",
      });
    }
  }

  function openPagar(row) {
    setSelectedRow(row);
    setOpenPayDialog(true);
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
      <Box className="container">
        <Typography
          variant="h4"
          sx={{ fontWeight: 900, mb: 1, color: "#212529" }}
        >
          Comisiones semanales
        </Typography>
      </Box>

      <div className="container-fluid px-0">
        <div className="row g-2 align-items-center mb-2">
          <div className="col-12 col-md-4">
            <TextField
              fullWidth
              size="small"
              label="Fecha (elige cualquier día de la semana)"
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </div>

          <div className="col-12 col-md-8 d-flex justify-content-md-end gap-2">
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={() => fetchData()}
              >
                Refrescar
              </Button>
            </Stack>
          </div>
        </div>
      </div>

      {loading && <LinearProgress sx={{ mb: 1 }} />}

      <TableContainer sx={{ maxHeight: 520 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell>Barbero</TableCell>
              <TableCell>Semana inicio</TableCell>
              <TableCell align="right">Total generado (Bs)</TableCell>
              <TableCell align="right">Monto barbero (Bs)</TableCell>
              <TableCell align="right">Monto barbería (Bs)</TableCell>
              <TableCell align="center">Estado</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((r) => (
                <TableRow key={r.barbero_id}>
                  <TableCell>
                    {r.nombres} {r.apellidos || ""}
                  </TableCell>
                  <TableCell>
                    {dayjs(r.semana_inicio).format("YYYY-MM-DD")}
                  </TableCell>
                  <TableCell align="right">
                    {Number(r.total_generado || 0).toFixed(2)}
                  </TableCell>
                  <TableCell align="right">
                    {Number(r.monto_barbero || 0).toFixed(2)}
                  </TableCell>
                  <TableCell align="right">
                    {Number(r.monto_barberia || 0).toFixed(2)}
                  </TableCell>
                  <TableCell align="center">{estadoToChip(r)}</TableCell>
                  <TableCell align="right">
                    {!r.pagado && (
                      <Tooltip title="Marcar pagado">
                        <IconButton
                          color="success"
                          onClick={() => openPagar(r)}
                        >
                          <PaidIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            {!rows.length && !loading && (
              <TableRow>
                <TableCell colSpan={7}>
                  <div className="py-4 text-center text-muted">
                    Sin resultados
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={rows.length}
        page={page}
        onPageChange={(_, p) => setPage(p)}
        rowsPerPage={rowsPerPage}
        labelRowsPerPage="Por página"
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        rowsPerPageOptions={[5, 10, 20, 50]}
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

      <Dialog
        open={openPayDialog}
        onClose={() => setOpenPayDialog(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Confirmar pago</DialogTitle>
        <DialogContent dividers>
          <Typography>
            ¿Registrar pago para{" "}
            <strong>
              {selectedRow?.nombres} {selectedRow?.apellidos}
            </strong>{" "}
            correspondiente a la semana inicio{" "}
            <strong>{selectedRow?.semana_inicio}</strong>?
          </Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
            <Typography>Total:</Typography>
            <Typography fontWeight={700}>
              {Number(selectedRow?.total_generado || 0).toFixed(2)} Bs
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
            <Typography>Barbero:</Typography>
            <Typography fontWeight={700}>
              {Number(selectedRow?.monto_barbero || 0).toFixed(2)} Bs
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPayDialog(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handlePagarConfirm}>
            Marcar pagado
          </Button>
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
    </Paper>
  );
}
