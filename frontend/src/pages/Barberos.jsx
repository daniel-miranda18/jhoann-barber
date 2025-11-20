import { useEffect, useMemo, useState, useRef } from "react";
import {
  listarBarberos,
  listarServiciosBarbero,
  guardarServiciosBarbero,
  listarHorariosBarbero,
  guardarHorariosBarbero,
} from "../services/barberosServicio";
import { listarServicios } from "../services/serviciosServicio";

import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Switch from "@mui/material/Switch";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import Chip from "@mui/material/Chip";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import IconButton from "@mui/material/IconButton";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import { Typography } from "@mui/material";

const DIAS = [
  { v: 1, t: "Lunes", s: "Lun" },
  { v: 2, t: "Martes", s: "Mar" },
  { v: 3, t: "Miércoles", s: "Mié" },
  { v: 4, t: "Jueves", s: "Jue" },
  { v: 5, t: "Viernes", s: "Vie" },
  { v: 6, t: "Sábado", s: "Sáb" },
  { v: 7, t: "Domingo", s: "Dom" },
];

function useDebounced(v, ms = 500) {
  const [x, setX] = useState(v);
  useEffect(() => {
    const id = setTimeout(() => setX(v), ms);
    return () => clearTimeout(id);
  }, [v, ms]);
  return x;
}

function t2m(s) {
  const m = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(String(s || ""));
  if (!m) return null;
  const hh = parseInt(m[1], 10);
  const mm = parseInt(m[2], 10);
  return hh * 60 + mm;
}

function m2t(mins) {
  const h = Math.floor(mins / 60),
    m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function buildSlots(ti, tf, step) {
  const a = [];
  for (let m = ti; m < tf; m += step) a.push(m2t(m));
  return a;
}

function emptySlotsMap() {
  return {
    1: new Set(),
    2: new Set(),
    3: new Set(),
    4: new Set(),
    5: new Set(),
    6: new Set(),
    7: new Set(),
  };
}

export default function Barberos() {
  const [rows, setRows] = useState([]);
  const [horariosPreview, setHorariosPreview] = useState({});
  const [q, setQ] = useState("");
  const qd = useDebounced(q, 350);
  const [snack, setSnack] = useState({ open: false, msg: "", sev: "success" });
  const [sel, setSel] = useState(null);
  const [tab, setTab] = useState(0);

  const [serviciosAll, setServiciosAll] = useState([]);
  const [servSel, setServSel] = useState([]);

  const [diasAct, setDiasAct] = useState([1, 2, 3, 4, 5]);
  const [multiDia, setMultiDia] = useState(true);

  const [startStr, setStartStr] = useState("08:00");
  const [endStr, setEndStr] = useState("20:00");
  const [step, setStep] = useState(60);

  const startMin = useMemo(() => t2m(startStr) ?? 480, [startStr]);
  const endMin = useMemo(() => t2m(endStr) ?? 1200, [endStr]);
  const slots = useMemo(
    () => buildSlots(startMin, endMin, step),
    [startMin, endMin, step]
  );

  const [slotsSel, setSlotsSel] = useState(() => emptySlotsMap());
  const [horariosRaw, setHorariosRaw] = useState([]);
  const [copiarDesde, setCopiarDesde] = useState(1);

  const loadedRef = useRef(false);
  const [dirty, setDirty] = useState(false);
  const slotsSelDebounced = useDebounced(slotsSel, 600);

  function notify(msg, sev = "success") {
    setSnack({ open: true, msg, sev });
  }

  async function fetchBarberos() {
    try {
      const r = await listarBarberos({
        page: 1,
        per_page: 50,
        q: qd || undefined,
      });
      const data = r.data || [];
      setRows(data);

      const ids = data.map((b) => b.id);
      const promises = ids.map((id) =>
        listarHorariosBarbero(id)
          .then((res) => ({ id, data: res.data || [] }))
          .catch(() => ({ id, data: [] }))
      );
      const settled = await Promise.all(promises);
      const map = {};
      for (const s of settled) map[s.id] = s.data;
      setHorariosPreview(map);
    } catch (e) {
      setRows([]);
      setHorariosPreview({});
    }
  }

  useEffect(() => {
    fetchBarberos();
  }, []);
  useEffect(() => {
    fetchBarberos();
  }, [qd]);

  function formatHorarioRange(r) {
    if (!r) return "";
    const d = DIAS.find((x) => Number(x.v) === Number(r.dia_semana));
    return `${d ? d.s : r.dia_semana} ${r.hora_inicio}-${r.hora_fin}`;
  }

  function rangesToSlotsMap(hor) {
    const map = emptySlotsMap();
    const indexMinutes = slots.map(t2m);
    for (const x of hor) {
      const d = Number(x.dia_semana),
        hi = t2m(x.hora_inicio),
        hf = t2m(x.hora_fin);
      for (let i = 0; i < indexMinutes.length; i++) {
        const sm = indexMinutes[i];
        if (sm >= hi && sm < hf) map[d].add(i);
      }
    }
    return map;
  }

  function slotsMapToRanges(map) {
    const out = [];
    for (const d of [1, 2, 3, 4, 5, 6, 7]) {
      const arr = Array.from(map[d] || []).sort((a, b) => a - b);
      if (!arr.length) continue;
      let startIdx = arr[0],
        prev = arr[0];
      for (let i = 1; i <= arr.length; i++) {
        const cur = arr[i];
        if (i === arr.length || cur !== prev + 1) {
          const hi = slots[startIdx];
          const endMinLocal = (t2m(slots[prev]) ?? 0) + step;
          const hf = m2t(endMinLocal);
          out.push({ dia_semana: d, hora_inicio: hi, hora_fin: hf });
          startIdx = cur;
        }
        prev = cur;
      }
    }
    return out;
  }

  async function openBarbero(b) {
    setSel(b);
    setTab(0);
    loadedRef.current = false;
    setDirty(false);
    try {
      const [srv, hor, all] = await Promise.all([
        listarServiciosBarbero(b.id).catch((e) => ({ data: [] })),
        listarHorariosBarbero(b.id).catch((e) => ({ data: [] })),
        listarServicios({ solo_activos: 1 }).catch((e) => ({ data: [] })),
      ]);
      setServiciosAll(all.data || []);
      setServSel((srv.data || []).map((s) => s.id));
      const hr = hor.data || [];
      setHorariosRaw(hr);
      setSlotsSel(rangesToSlotsMap(hr));
      loadedRef.current = true;
      setDirty(false);
    } catch (e) {
      setServiciosAll([]);
      setServSel([]);
      setHorariosRaw([]);
      setSlotsSel(emptySlotsMap());
      loadedRef.current = true;
      setDirty(false);
    }
  }

  function markDirty() {
    if (loadedRef.current) setDirty(true);
  }

  function toggleCell(day, idx) {
    const targets = multiDia ? diasAct : [day];
    setSlotsSel((prev) => {
      const next = { ...prev };
      for (const d of targets) {
        const s = new Set(prev[d] || []);
        if (s.has(idx)) s.delete(idx);
        else s.add(idx);
        next[d] = s;
      }
      return next;
    });
    markDirty();
  }

  function clickCellKeyboard(e, day, idx) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleCell(day, idx);
    }
  }

  function selectAllDia(day) {
    setSlotsSel((prev) => {
      const next = { ...prev };
      const allIndices = new Set(
        Array.from({ length: slots.length }, (_, i) => i)
      );
      next[day] = allIndices;
      return next;
    });
    markDirty();
  }

  function borrarDia(day) {
    setSlotsSel((prev) => {
      const next = { ...prev };
      next[day] = new Set();
      return next;
    });
    markDirty();
  }

  function copiarDia() {
    const base = slotsSel[copiarDesde] || new Set();
    if (!base.size) {
      notify("Nada que copiar", "warning");
      return;
    }
    setSlotsSel((prev) => {
      const next = { ...prev };
      for (const d of diasAct) {
        if (d === copiarDesde) continue;
        const s = new Set(next[d] || []);
        base.forEach((i) => s.add(i));
        next[d] = s;
      }
      return next;
    });
    markDirty();
  }
  function presetLV_ManianaTarde() {
    const mins = slots.map(t2m),
      i0812 = [],
      i1419 = [];
    for (let i = 0; i < mins.length; i++) {
      if (mins[i] >= 480 && mins[i] < 720) i0812.push(i);
      if (mins[i] >= 840 && mins[i] < 1140) i1419.push(i);
    }
    setSlotsSel(() => {
      const map = emptySlotsMap();
      [1, 2, 3, 4, 5].forEach((d) => {
        map[d] = new Set([...i0812, ...i1419]);
      });
      return map;
    });
    setDiasAct([1, 2, 3, 4, 5]);
    markDirty();
  }
  function presetSabadoManiana() {
    const mins = slots.map(t2m),
      s = new Set();
    for (let i = 0; i < mins.length; i++)
      if (mins[i] >= 540 && mins[i] < 780) s.add(i);
    setSlotsSel((prev) => ({ ...prev, 6: s }));
    if (!diasAct.includes(6)) setDiasAct([...diasAct, 6]);
    markDirty();
  }

  async function saveServicios() {
    if (!sel) return;
    try {
      await guardarServiciosBarbero(sel.id, servSel);
      notify("Servicios guardados");
    } catch (e) {
      notify(e?.response?.data?.mensaje || "Error", "error");
    }
  }

  async function saveHorarioExplicit() {
    if (!sel) return;
    const lista = slotsMapToRanges(slotsSel);
    try {
      const r = await guardarHorariosBarbero(sel.id, lista);
      setHorariosRaw(r.data || []);
      setDirty(false);
      notify("Horario guardado");
    } catch (e) {
      notify(e?.response?.data?.mensaje || "Error", "error");
    }
  }

  useEffect(() => {
    if (!sel) return;
    if (!loadedRef.current) return;
    if (!dirty) return;
    const lista = slotsMapToRanges(slotsSelDebounced);
    guardarHorariosBarbero(sel.id, lista)
      .then((r) => {
        setHorariosRaw(r.data || []);
        setDirty(false);
      })
      .catch(() => {});
  }, [slotsSelDebounced, sel, dirty]);

  useEffect(() => {
    if (!sel || horariosRaw.length === 0) return;
    setSlotsSel(rangesToSlotsMap(horariosRaw));
  }, [startMin, endMin, step, sel]);

  return (
    <div className="container-fluid p-3">
      <div className="container">
        <Typography
          variant="h4"
          sx={{ fontWeight: 900, mb: 1, color: "#212529" }}
        >
          Lista de Barberos
        </Typography>
      </div>
      {!sel && (
        <>
          <div className="row mb-2 g-2">
            <div className="col-12 col-md-6">
              <TextField
                fullWidth
                size="small"
                variant="outlined"
                placeholder="Buscar barbero"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
          </div>

          <div className="row g-3">
            {rows.map((b) => {
              const prev = horariosPreview[b.id] || [];
              return (
                <div className="col-12 col-sm-6 col-lg-4" key={b.id}>
                  <Card className="h-100">
                    <CardContent
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        height: "100%",
                      }}
                    >
                      <div style={{ marginBottom: 8 }}>
                        <strong
                          style={{
                            display: "block",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {b.nombres || b.correo_electronico}
                        </strong>
                        <div style={{ color: "#6c757d" }}>
                          {b.apellidos || " "}
                        </div>
                      </div>

                      <div style={{ marginTop: 8, marginBottom: 8 }}>
                        <div
                          style={{
                            fontSize: 12,
                            color: "#495057",
                            marginBottom: 6,
                          }}
                        >
                          Horario:
                        </div>
                        {prev.length === 0 ? (
                          <div style={{ fontSize: 12, color: "#6c757d" }}>
                            Sin horario
                          </div>
                        ) : (
                          <div
                            style={{
                              display: "flex",
                              gap: 6,
                              flexWrap: "wrap",
                            }}
                          >
                            {prev.slice(0, 3).map((r, i) => (
                              <Chip
                                key={i}
                                label={formatHorarioRange(r)}
                                size="small"
                              />
                            ))}
                            {prev.length > 3 && (
                              <Chip
                                label={`+${prev.length - 3}`}
                                size="small"
                              />
                            )}
                          </div>
                        )}
                      </div>

                      <div
                        style={{
                          marginTop: "auto",
                          display: "flex",
                          gap: 8,
                          alignItems: "center",
                        }}
                      >
                        <Chip
                          label={b.esta_activo ? "Activo" : "Inactivo"}
                          color={b.esta_activo ? "success" : "default"}
                          size="small"
                        />
                        <div style={{ flex: 1 }} />
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => openBarbero(b)}
                        >
                          Configurar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
            {!rows.length && (
              <div className="col-12">
                <div style={{ color: "#6c757d", textAlign: "center" }}>
                  Sin resultados
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {sel && (
        <>
          <div className="row mb-2">
            <div className="col-12 d-flex align-items-center justify-content-between">
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <IconButton
                  size="small"
                  onClick={() => {
                    setSel(null);
                    setSlotsSel(emptySlotsMap());
                    setHorariosRaw([]);
                    setTab(0);
                  }}
                >
                  <ArrowBackIcon />
                </IconButton>
                <div style={{ fontWeight: 600 }}>
                  {sel.nombres || sel.correo_electronico}
                </div>
              </div>

              <div>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    setSel(null);
                    setSlotsSel(emptySlotsMap());
                    setHorariosRaw([]);
                    setTab(0);
                  }}
                >
                  Cerrar
                </Button>
              </div>
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-12">
              <Tabs
                value={tab}
                onChange={(_, v) => setTab(v)}
                indicatorColor="primary"
                textColor="primary"
              >
                <Tab label="Servicios" />
                <Tab label="Horario" />
              </Tabs>
            </div>
          </div>

          {tab === 0 && (
            <div className="row g-3">
              <div className="col-12 col-md-8">
                <div style={{ marginBottom: 6 }}>Servicios</div>
                <Autocomplete
                  multiple
                  options={serviciosAll || []}
                  getOptionLabel={(o) => o.nombre || ""}
                  value={(serviciosAll || []).filter((s) =>
                    servSel.includes(s.id)
                  )}
                  onChange={(_, newVal) => setServSel(newVal.map((s) => s.id))}
                  disableCloseOnSelect
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      size="small"
                      placeholder="Selecciona servicios"
                    />
                  )}
                />
                <div style={{ color: "#6c757d", marginTop: 6 }}>
                  Busca y selecciona servicios
                </div>
              </div>
              <div className="col-12">
                <Button variant="contained" onClick={saveServicios}>
                  Guardar
                </Button>
              </div>
            </div>
          )}

          {tab === 1 && (
            <div className="row g-3">
              <div className="col-12 col-xxl-3">
                <Card>
                  <CardContent>
                    <div style={{ fontWeight: 600, marginBottom: 8 }}>
                      Configuración de vista
                    </div>

                    <div
                      className="d-flex gap-2 mb-2"
                      style={{ alignItems: "center" }}
                    >
                      <TextField
                        type="time"
                        size="small"
                        label="Desde"
                        value={startStr}
                        onChange={(e) => setStartStr(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                      />
                      <TextField
                        type="time"
                        size="small"
                        label="Hasta"
                        value={endStr}
                        onChange={(e) => setEndStr(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                      />
                      <FormControl size="small" style={{ minWidth: 120 }}>
                        <InputLabel>Paso</InputLabel>
                        <Select
                          value={step}
                          label="Paso"
                          onChange={(e) => setStep(Number(e.target.value))}
                        >
                          <MenuItem value={60}>60 min</MenuItem>
                          <MenuItem value={30}>30 min</MenuItem>
                        </Select>
                      </FormControl>
                    </div>

                    <div style={{ marginBottom: 8 }}>
                      <InputLabel shrink>Días activos</InputLabel>
                      <Select
                        multiple
                        size="small"
                        value={diasAct}
                        onChange={(e) =>
                          setDiasAct(
                            typeof e.target.value === "string"
                              ? e.target.value.split(",").map(Number)
                              : e.target.value
                          )
                        }
                        renderValue={(selected) =>
                          selected
                            .map((v) => DIAS.find((d) => d.v === v)?.t)
                            .join(", ")
                        }
                      >
                        {DIAS.map((d) => (
                          <MenuItem key={d.v} value={d.v}>
                            {d.t}
                          </MenuItem>
                        ))}
                      </Select>
                      <div style={{ color: "#6c757d", marginTop: 6 }}>
                        Mantén Ctrl/Cmd para seleccionar varios
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginTop: 8,
                      }}
                    >
                      <Switch
                        checked={multiDia}
                        onChange={(e) => setMultiDia(e.target.checked)}
                      />
                      <div>Aplicar a días seleccionados</div>
                    </div>

                    <hr style={{ margin: "12px 0" }} />

                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        alignItems: "center",
                        marginBottom: 8,
                      }}
                    >
                      <FormControl size="small" style={{ minWidth: 140 }}>
                        <InputLabel>Copiar desde</InputLabel>
                        <Select
                          value={copiarDesde}
                          label="Copiar desde"
                          onChange={(e) =>
                            setCopiarDesde(Number(e.target.value))
                          }
                        >
                          {DIAS.map((d) => (
                            <MenuItem key={d.v} value={d.v}>
                              {d.t}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<ContentCopyIcon />}
                        onClick={copiarDia}
                      >
                        Copiar
                      </Button>
                    </div>

                    <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={presetLV_ManianaTarde}
                      >
                        L–V 08–12 / 14–19
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={presetSabadoManiana}
                      >
                        Sáb 09–13
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => {
                          setSlotsSel(emptySlotsMap());
                          markDirty();
                        }}
                      >
                        Vaciar
                      </Button>
                    </div>

                    <Button
                      variant="contained"
                      fullWidth
                      onClick={saveHorarioExplicit}
                    >
                      Guardar
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <div className="col-12 col-xxl-9">
                <Card>
                  <CardContent>
                    <div style={{ fontWeight: 600, marginBottom: 8 }}>
                      Horario
                    </div>
                    <div style={{ overflowX: "auto" }}>
                      <Table size="small" sx={{ minWidth: 920 }}>
                        <TableHead>
                          <TableRow>
                            <TableCell>Hora</TableCell>
                            {DIAS.map((d) => (
                              <TableCell key={d.v} align="center">
                                <div
                                  style={{
                                    display: "flex",
                                    gap: 8,
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexWrap: "wrap",
                                  }}
                                >
                                  <div style={{ minWidth: 60 }}>{d.t}</div>
                                  <Button
                                    size="small"
                                    onClick={() => selectAllDia(d.v)}
                                  >
                                    Todo
                                  </Button>
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => borrarDia(d.v)}
                                  >
                                    <DeleteForeverIcon fontSize="small" />
                                  </IconButton>
                                </div>
                              </TableCell>
                            ))}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {slots.map((label, idx) => (
                            <TableRow key={label}>
                              <TableCell sx={{ width: 90 }}>
                                <Chip label={label} size="small" />
                              </TableCell>
                              {DIAS.map((d) => {
                                const active = Boolean(
                                  slotsSel[d.v] && slotsSel[d.v].has(idx)
                                );
                                return (
                                  <TableCell key={d.v} align="center">
                                    <div
                                      role="button"
                                      tabIndex={0}
                                      onKeyDown={(e) =>
                                        clickCellKeyboard(e, d.v, idx)
                                      }
                                      onClick={() => toggleCell(d.v, idx)}
                                      title={`${d.t} ${label}`}
                                      style={{
                                        display: "inline-block",
                                        width: 34,
                                        height: 34,
                                        borderRadius: 6,
                                        border: "1px solid rgba(0,0,0,.15)",
                                        background: active
                                          ? "rgba(13,110,253,0.9)"
                                          : "transparent",
                                        cursor: "pointer",
                                        boxShadow: active
                                          ? "0 1px 3px rgba(0,0,0,.2)"
                                          : "none",
                                      }}
                                    />
                                  </TableCell>
                                );
                              })}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </>
      )}

      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
      >
        <MuiAlert
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          severity={snack.sev}
          sx={{ width: "100%" }}
        >
          {snack.msg}
        </MuiAlert>
      </Snackbar>
    </div>
  );
}
