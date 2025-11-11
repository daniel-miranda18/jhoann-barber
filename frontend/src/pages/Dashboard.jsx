import { useAuth } from "../layouts/AppLayout";
import { Box, Paper, Stack, Typography, Chip, Divider } from "@mui/material";

export default function Dashboard() {
  const { usuario, rol } = useAuth();
  const permisos = rol?.data?.permisos || [];

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

      <Stack spacing={1.2} sx={{ mb: 2 }}>
        <Typography variant="body1">
          <strong>Usuario ID:</strong> {usuario?.sub}
        </Typography>
        <Typography variant="body1">
          <strong>Correo:</strong> {usuario?.correo}
        </Typography>
      </Stack>

      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
        Permisos
      </Typography>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
        {permisos.length ? (
          permisos.map((p) => <Chip key={p.id} label={p.clave} size="small" />)
        ) : (
          <Typography color="text.secondary">Sin permisos</Typography>
        )}
      </Box>
    </Paper>
  );
}
