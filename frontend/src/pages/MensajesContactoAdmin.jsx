import { useEffect, useState } from "react";
import {
  Container,
  Card,
  CardContent,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Pagination,
  Chip,
  Box,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import VisibilityIcon from "@mui/icons-material/Visibility";
import {
  obtenerMensajesContactoAdmin,
  obtenerMensajeContactoAdmin,
  marcarMensajeLeido,
  eliminarMensajeContacto,
} from "../services/contactoServicio";
import dayjs from "dayjs";

export default function MensajesContactoAdmin() {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, pageSize: 20 });
  const [loading, setLoading] = useState(false);
  const [sel, setSel] = useState(null);
  const [open, setOpen] = useState(false);

  async function load(p = page) {
    setLoading(true);
    try {
      const res = await obtenerMensajesContactoAdmin({ page: p, pageSize });
      setItems(res.data || []);
      setMeta(res.meta || { total: 0, page: p, pageSize });
      setPage(res.meta?.page || p);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(1);
  }, []);

  async function openMensaje(id) {
    try {
      const r = await obtenerMensajeContactoAdmin(id);
      setSel(r.data);
      setOpen(true);
      if (r.data && !r.data.leido) {
        await marcarMensajeLeido(id);
        load(page);
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function eliminar(id) {
    if (!confirm("Eliminar mensaje?")) return;
    try {
      await eliminarMensajeContacto(id);
      load(page);
      setOpen(false);
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <Container sx={{ py: 4 }}>
      <Card>
        <CardContent>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ mb: 2 }}
          >
            <Typography variant="h6">Mensajes de contacto</Typography>
            <Button onClick={() => load(1)} disabled={loading}>
              Refrescar
            </Button>
          </Stack>

          <Box sx={{ overflow: "auto" }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Asunto</TableCell>
                  <TableCell>Correo</TableCell>
                  <TableCell>Celular</TableCell>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((it) => (
                  <TableRow key={it.id} hover>
                    <TableCell>{it.nombre}</TableCell>
                    <TableCell>{it.asunto || "-"}</TableCell>
                    <TableCell>{it.email}</TableCell>
                    <TableCell>{it.celular || "-"}</TableCell>
                    <TableCell>
                      {dayjs(it.creado_en).format("YYYY-MM-DD HH:mm")}
                    </TableCell>
                    <TableCell>
                      {it.leido ? (
                        <Chip label="Leído" size="small" color="success" />
                      ) : (
                        <Chip label="No leído" size="small" color="warning" />
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => openMensaje(it.id)}
                      >
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={async () => {
                          await marcarMensajeLeido(it.id);
                          load(page);
                        }}
                      >
                        <MarkEmailReadIcon />
                      </IconButton>
                      <IconButton size="small" onClick={() => eliminar(it.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No hay mensajes
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Box>

          <Stack direction="row" justifyContent="center" sx={{ mt: 2 }}>
            <Pagination
              count={Math.ceil((meta.total || 0) / meta.pageSize || 1)}
              page={page}
              onChange={(_, v) => {
                setPage(v);
                load(v);
              }}
              color="primary"
            />
          </Stack>
        </CardContent>
      </Card>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Mensaje</DialogTitle>
        <DialogContent dividers>
          {sel ? (
            <div>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                {sel.nombre} • {sel.email}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {dayjs(sel.creado_en).format("YYYY-MM-DD HH:mm")}
              </Typography>
              <Box sx={{ mt: 2, whiteSpace: "pre-wrap" }}>{sel.mensaje}</Box>
              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  IP: {sel.origen_ip || "-"}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block" }}
                >
                  UA: {sel.user_agent || "-"}
                </Typography>
              </Box>
            </div>
          ) : (
            <Typography>Cargando...</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cerrar</Button>
          <Button
            color="error"
            onClick={() => {
              if (sel) eliminar(sel.id);
            }}
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
