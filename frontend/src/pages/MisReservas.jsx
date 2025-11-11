import { useState } from "react";
import {
  Container,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
} from "@mui/material";
import dayjs from "dayjs";
import { misCitas } from "../services/citasServicio";

function EstadoChip({ e }) {
  const c =
    e === "confirmada"
      ? "success"
      : e === "pendiente"
      ? "warning"
      : e === "cancelada"
      ? "error"
      : e === "completada"
      ? "primary"
      : "default";
  return <Chip size="small" color={c} label={String(e || "").toUpperCase()} />;
}

export default function MisReservas() {
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [rows, setRows] = useState([]);
  async function buscar() {
    const r = await misCitas({
      correo: correo || undefined,
      telefono: telefono || undefined,
    });
    setRows(r.data || []);
  }
  return (
    <Container sx={{ py: 6 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Mis reservas
      </Typography>
      <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={5}>
            <TextField
              label="Correo"
              type="email"
              fullWidth
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={5}>
            <TextField
              label="Teléfono"
              fullWidth
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <Button fullWidth variant="contained" onClick={buscar}>
              Buscar
            </Button>
          </Grid>
        </Grid>
      </Paper>
      <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Fecha</TableCell>
              <TableCell>Hora</TableCell>
              <TableCell>Duración</TableCell>
              <TableCell>Barbero</TableCell>
              <TableCell>Estado</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{dayjs(r.fecha).format("YYYY-MM-DD")}</TableCell>
                <TableCell>{r.hora}</TableCell>
                <TableCell>{r.duracion_minutos} min</TableCell>
                <TableCell>{r.barbero_nombre}</TableCell>
                <TableCell>
                  <EstadoChip e={r.estado} />
                </TableCell>
              </TableRow>
            ))}
            {!rows.length && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  Sin resultados
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </Container>
  );
}
