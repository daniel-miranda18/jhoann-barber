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
  Box,
  Card,
  CardContent,
  InputAdornment,
  useTheme,
} from "@mui/material";
import {
  Search as SearchIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
} from "@mui/icons-material";
import dayjs from "dayjs";
import { misCitas } from "../services/citasServicio";
import "bootstrap/dist/css/bootstrap.min.css";

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
  const theme = useTheme();
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  async function buscar() {
    setLoading(true);
    try {
      const r = await misCitas({
        correo: correo || undefined,
        telefono: telefono || undefined,
      });
      setRows(r.data || []);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box
      sx={{
        background: theme.palette.background.default,
        minHeight: "100vh",
        py: 6,
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ py: 5, textAlign: "center" }}>
          <div className="container">
            <Typography
              variant="h3"
              sx={{ fontWeight: 900, mb: 1, color: "#212529" }}
            >
              Consultar Reservas
            </Typography>
            <Typography variant="h6" sx={{ color: "#6c757d" }}>
              Busca tus citas en nuestra barbería
            </Typography>
          </div>
        </Box>

        <Card
          sx={{
            mb: 4,
            boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
            borderRadius: 3,
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Grid container spacing={2} alignItems="flex-end">
              <Grid item xs={12} md={4}>
                <TextField
                  label="Correo Electrónico"
                  type="email"
                  fullWidth
                  variant="outlined"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon sx={{ color: theme.palette.primary.main }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Teléfono"
                  fullWidth
                  variant="outlined"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon sx={{ color: theme.palette.primary.main }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={buscar}
                  disabled={loading}
                  startIcon={<SearchIcon />}
                  sx={{
                    py: 1.8,
                    fontSize: "1.1rem",
                    fontWeight: "bold",
                    borderRadius: 2,
                    textTransform: "none",
                  }}
                >
                  {loading ? "Buscando..." : "Buscar"}
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card
          sx={{
            boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
            borderRadius: 3,
            overflow: "hidden",
          }}
        >
          <CardContent sx={{ p: 0 }}>
            {rows.length > 0 ? (
              <Box sx={{ overflowX: "auto" }}>
                <Table>
                  <TableHead>
                    <TableRow
                      sx={{
                        backgroundColor: theme.palette.primary.main,
                      }}
                    >
                      <TableCell
                        sx={{
                          color: "white",
                          fontWeight: "bold",
                          fontSize: "1rem",
                        }}
                      >
                        Fecha
                      </TableCell>
                      <TableCell
                        sx={{
                          color: "white",
                          fontWeight: "bold",
                          fontSize: "1rem",
                        }}
                      >
                        Hora
                      </TableCell>
                      <TableCell
                        sx={{
                          color: "white",
                          fontWeight: "bold",
                          fontSize: "1rem",
                        }}
                      >
                        Duración
                      </TableCell>
                      <TableCell
                        sx={{
                          color: "white",
                          fontWeight: "bold",
                          fontSize: "1rem",
                        }}
                      >
                        Barbero
                      </TableCell>
                      <TableCell
                        sx={{
                          color: "white",
                          fontWeight: "bold",
                          fontSize: "1rem",
                        }}
                      >
                        Estado
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.map((r) => (
                      <TableRow
                        key={r.id}
                        sx={{
                          "&:hover": {
                            backgroundColor: theme.palette.action.hover,
                          },
                          "&:nth-of-type(odd)": {
                            backgroundColor: theme.palette.action.selected,
                          },
                        }}
                      >
                        <TableCell sx={{ py: 2 }}>
                          {dayjs(r.fecha).format("DD/MM/YYYY")}
                        </TableCell>
                        <TableCell sx={{ py: 2 }}>{r.hora}</TableCell>
                        <TableCell sx={{ py: 2 }}>
                          {r.duracion_minutos} min
                        </TableCell>
                        <TableCell sx={{ py: 2 }}>{r.barbero_nombre}</TableCell>
                        <TableCell sx={{ py: 2 }}>
                          <EstadoChip e={r.estado} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            ) : (
              <Box sx={{ p: 4, textAlign: "center" }}>
                <Typography
                  variant="h6"
                  sx={{ color: theme.palette.text.secondary, mb: 1 }}
                >
                  {loading ? "Buscando reservas..." : "Sin resultados"}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: theme.palette.text.disabled }}
                >
                  {!loading &&
                    "Ingresa tu correo o teléfono para consultar tus reservas"}
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
