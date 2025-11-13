import { useEffect, useState, useMemo } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Stack,
  Skeleton,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import CurrencyExchangeIcon from "@mui/icons-material/CurrencyExchange";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import SearchIcon from "@mui/icons-material/Search";
import { listarServiciosPublico } from "../services/serviciosServicio";

export default function ServiciosPublico() {
  const [servicios, setServicios] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const res = await listarServiciosPublico();
      setServicios(res.data || []);
    } catch (err) {
      setServicios([]);
    }
  }

  const serviciosFiltrados = useMemo(() => {
    if (!servicios) return [];
    return servicios.filter(
      (s) =>
        s.nombre?.toLowerCase().includes(search.toLowerCase()) ||
        s.descripcion?.toLowerCase().includes(search.toLowerCase())
    );
  }, [servicios, search]);

  if (servicios === null) {
    return (
      <div className="container py-5">
        <div className="row g-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div className="col-12 col-sm-6 col-md-4" key={i}>
              <Skeleton variant="rectangular" height={320} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <Box sx={{ py: 5, textAlign: "center" }}>
        <div className="container">
          <Typography
            variant="h3"
            sx={{ fontWeight: 900, mb: 1, color: "#212529" }}
          >
            Nuestros Servicios
          </Typography>
          <Typography variant="h6" sx={{ color: "#6c757d" }}>
            Descubre todos los servicios que ofrecemos en nuestra barbería.
          </Typography>
        </div>
      </Box>

      <div className="container py-5">
        <Stack spacing={2} sx={{ mb: 4 }}>
          <TextField
            fullWidth
            placeholder="Buscar servicio..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />
              ),
            }}
            variant="outlined"
            size="small"
          />
        </Stack>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {serviciosFiltrados.length} servicio
          {serviciosFiltrados.length !== 1 ? "s" : ""} encontrado
          {serviciosFiltrados.length !== 1 ? "s" : ""}
        </Typography>

        {serviciosFiltrados.length > 0 ? (
          <div className="row g-4">
            {serviciosFiltrados.map((servicio) => (
              <div className="col-12 col-sm-6 col-md-4" key={servicio.id}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: 3,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      boxShadow: "0 8px 16px rgba(0,0,0,0.12)",
                      transform: "translateY(-4px)",
                    },
                    border: "2px solid #d4af37",
                  }}
                >
                  <CardContent
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      flexGrow: 1,
                      gap: 2,
                      p: 3,
                    }}
                  >
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 800,
                        color: "#d4af37",
                      }}
                    >
                      {servicio.nombre}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="#6c757d"
                      sx={{ flex: 1, lineHeight: 1.6 }}
                    >
                      {servicio.descripcion || "Servicio de calidad premium."}
                    </Typography>

                    <Box
                      sx={{
                        bgcolor: "#f8f9fa",
                        p: 2,
                        borderRadius: 2,
                      }}
                    >
                      <Stack spacing={1.5}>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <AccessTimeIcon
                            sx={{ color: "#d4af37", fontSize: 24 }}
                          />
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 600,
                              color: "#212529",
                            }}
                          >
                            {servicio.duracion_minutos} minutos
                          </Typography>
                        </Stack>

                        <Stack direction="row" spacing={2} alignItems="center">
                          <CurrencyExchangeIcon
                            sx={{ color: "#28a745", fontSize: 24 }}
                          />
                          <Typography
                            variant="h6"
                            sx={{
                              fontWeight: 700,
                              color: "#28a745",
                              mb: 0,
                            }}
                          >
                            Bs. {parseFloat(servicio.precio).toFixed(2)}
                          </Typography>
                        </Stack>
                      </Stack>
                    </Box>

                    <Button
                      component={RouterLink}
                      to="/reservar"
                      variant="contained"
                      fullWidth
                      sx={{
                        bgcolor: "#d4af37",
                        color: "#212529",
                        fontWeight: 700,
                        py: 1.5,
                        borderRadius: 2,
                        "&:hover": {
                          bgcolor: "#c9a024",
                        },
                      }}
                    >
                      Reservar
                    </Button>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-5">
            <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
              No se encontraron servicios
            </Typography>
            <Button variant="outlined" onClick={() => setSearch("")}>
              Limpiar búsqueda
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
