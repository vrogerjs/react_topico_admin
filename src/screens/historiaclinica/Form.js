import React, { useState, useEffect, createRef } from 'react';
import { useFormState, useResize, http } from 'gra-react-utils';
import { VRadioGroup } from '../../utils/useToken';
import { db } from '../../db';

import {
  ExpandMore as ExpandMoreIcon,
  Send as SendIcon,
  Add as AddIcon,
  Room as RoomIcon,
  Search as SearchIcon,
  Keyboard,
  ReplyAll,
  WifiProtectedSetup
} from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import {
  Accordion, AccordionSummary, AccordionDetails, Alert,
  Box, Button, Card, CardContent, Checkbox, Fab,
  FormControl, FormControlLabel, FormGroup, FormLabel, MenuItem, Radio,
  Stack, InputAdornment, IconButton, TextField, Grid, Typography
} from '@mui/material';
import {
  useNavigate, useParams, useLocation
} from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Geolocation } from '@capacitor/geolocation';
import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';

export const Form = () => {

  const dispatch = useDispatch();

  const networkStatus = useSelector((state) => state.networkStatus);

  const { pid } = useParams();

  const formRef = createRef();

  const navigate = useNavigate();

  const [oficinas, setOficinas] = useState([]);

  const [state, setState] = useState({ page: 0, rowsPerPage: 50 });

  const [o, { defaultProps, handleChange, bindEvents, validate, set }] = useFormState(useState, {

  }, {});

  const pad = (num, places) => String(num).padStart(places, '0')

  useEffect(() => {
    dispatch({ type: 'title', title: (pid ? 'Actualizar' : 'Registrar') + ' Paciente.' });
    [].forEach(async (e) => {
      e[1](await db[e[0]].toArray());
    });
  }, []);

  useEffect(() => {
    if (pid) {
      if (networkStatus.connected) {
        http.get('http://localhost:8080/paciente/' + pid).then((result) => {
          result.oficina = result.oficina.id;
          var target = new Date(result.fechaNacimiento);
          result.fechaNacimiento = target;
          set(result);
        });
      }
    } else {
      try {
        var s = localStorage.getItem("setting");
        if (s) {
          s = JSON.parse(s);
          var o2 = {};
          o2.apeNomb = s.apeNomb;
          o2.tipoDocumento = s.tipoDocumento;
          o2.nroDocumento = s.nroDocumento;
          o2.fechaNacimiento = s.fechaNacimiento;
          o2.genero = s.genero;
          o2.celular = s.celular;
          o2.oficina = s.oficina;
          o2.modalidad = s.modalidad;
          set({ ...o, ...o2 });
        }
      } catch (e) {
        console.log(e);
      }
    }
  }, [pid]);

  const { width, height } = useResize(React);

  useEffect(() => {
    if (formRef.current) {
      const header = document.querySelector('.MuiToolbar-root');
      const [body, toolBar] = formRef.current.children;
      const nav = document.querySelector('nav');
      body.style.height = (height - header.offsetHeight - toolBar.offsetHeight) + 'px';
      toolBar.style.width = (width - nav.offsetWidth) + 'px';
    }
  }, [width, height]);


  useEffect(() => {
    dispatch({ type: 'title', title: 'Gestión de Pacientes - GORE Áncash' });
    fetchData(state.page)
  }, [state.page, state.rowsPerPage]);

  const fetchData = async (page) => {
    var data = { data: [] };
    if (networkStatus.connected) {
      const result = await (http.get('http://localhost:8080/oficina'));
      setOficinas(result);
    }
  };

  const onClickCancel = () => {
    navigate(-1);
  }

  const onClickAdd = async () => {
    navigate('/paciente/create', { replace: true });
  }

  const onClickSave = async () => {
    const form = formRef.current;
    if (0 || form != null && validate(form)) {
      var fechaNacimiento = o.fechaNacimiento.toDate ? o.fechaNacimiento.toDate() : o.fechaNacimiento;
      var day = pad(fechaNacimiento.getDate(), 2);
      var month = pad(fechaNacimiento.getMonth() + 1, 2);
      var year = fechaNacimiento.getFullYear();

      var o2 = { ...o, fechaNacimiento: year + '-' + month + '-' + day };

      if (networkStatus.connected) {
        o2.oficina = { id: o.oficina };
        http.post('http://localhost:8080/paciente', o2).then(async (result) => {
          if (!o2._id) {
            if (result.id) {
              dispatch({ type: "snack", msg: 'Registro grabado!' });
              navigate('/paciente', { replace: true });
            }
            else {
              navigate(-1);
            }
          }
        });
      } else {
        if (!o2.id) {
          o2.tmpId = 1 * new Date();
          o2.id = -o2.tmpId;
          //await db.disabled.add(o2);
          navigate('/' + o2.id + '/edit', { replace: true });
        } else {
          //await db.disabled.update(o2.id, o2);
        }
        dispatch({ type: "snack", msg: 'Registro grabado!' });
      }
    } else {
      dispatch({ type: "alert", msg: 'Falta campos por completar!' });
    }
  };

  function onChangeFechaNacimiento(v) {
    set(o => ({ ...o, fechaNacimiento: v }), () => {
      o.fechaNacimiento = v;
    });

  }

  const onSubmit = data => console.log(data);

  const theme = createTheme({
    components: {
      // Name of the component ⚛️
      MuiInput: {
        defaultProps: {
          required: true
        }
      },
    },
  });

  function getActions() {
    return <>
      <Button variant="contained" onClick={onClickCancel} color="error">
        Cancelar
      </Button>
      <Button disabled={o.old && !o.confirm} variant="contained" onClick={onClickSave} color="success" endIcon={<SendIcon />}>
        Registrar
      </Button>
    </>
  }

  function getContent() {
    return <LocalizationProvider dateAdapter={AdapterDayjs}><ThemeProvider theme={theme}>
      <form ref={formRef} onSubmit={onSubmit} style={{ textAlign: 'left' }}>
        <Box style={{ overflow: 'auto' }}>

          <Card className='mt-1 bs-black'>

            <CardContent>
              <Typography gutterBottom variant="h5" component="div" className='text-center fw-bold color-gore'>
                DATOS DEL PACIENTE
              </Typography>

              <Typography variant="body2" color="text.secondary">

                <Grid container>
                  <Grid item xs={12} md={1}>
                  </Grid>
                  <Grid item xs={12} md={10}>
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      size="medium"
                      id="standard-name"
                      label="Nombres y Apellidos Completos: "
                      placeholder="Ingrese los Nombres y Apellidos del Paciente"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Keyboard />
                          </InputAdornment>
                        ),
                      }}
                      {...defaultProps("apeNomb")}
                    />
                  </Grid>
                </Grid>

                <Grid container spacing={1}>
                  <Grid item xs={12} md={1}>
                  </Grid>
                  <Grid item xs={12} md={5}>
                    <TextField
                      select
                      margin="normal"
                      required
                      fullWidth
                      id="standard-name"
                      label="Seleccione el Tipo de Documento: "
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Keyboard />
                          </InputAdornment>
                        ),
                      }}
                      {...defaultProps("tipoDocumento", {
                        // onChange: onChangeTipoDocumento
                      })}
                    >
                      {['DNI', 'Carnet de Extranjería'].map((item, i) => (
                        <MenuItem key={'houseAccess_' + i} value={item}>
                          {item}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  <Grid item xs={12} md={5} >
                    <TextField
                      type={'number'}
                      sx={{ fontWeight: 'bold' }}
                      margin="normal"
                      required
                      fullWidth
                      id="standard-name"
                      label="Número de Documento: "
                      placeholder="Ingrese el número de Documento."
                      // onKeyUp={onKeyUp}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Keyboard />
                          </InputAdornment>
                        ),
                      }}
                      {...defaultProps("nroDocumento")}
                    />
                  </Grid>
                </Grid>

                <Grid container spacing={1}>
                  <Grid item xs={12} md={1}>
                  </Grid>
                  <Grid item xs={12} md={5} >
                    <DesktopDatePicker
                      label="Ingrese su Fecha de Nacimiento."
                      inputFormat="DD/MM/YYYY"
                      value={o.fechaNacimiento || ''}
                      onChange={onChangeFechaNacimiento}
                      renderInput={(params) =>
                        <TextField
                          type={'number'}
                          sx={{ fontWeight: 'bold' }}
                          margin="normal"
                          required
                          fullWidth
                          id="standard-name"
                          label="Fecha de Nacimiento: "
                          placeholder="Ingrese su Fecha de Nacimiento."
                          // onKeyUp={onKeyUp}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Keyboard />
                              </InputAdornment>
                            ),
                          }}
                          {...params}
                        // {...defaultProps("fechaNacimiento")}
                        />}
                    />
                  </Grid>

                  <Grid item xs={12} md={5}>
                    <TextField
                      select
                      margin="normal"
                      required
                      fullWidth
                      id="standard-name"
                      label="Seleccione su Género: "
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Keyboard />
                          </InputAdornment>
                        ),
                      }}
                      {...defaultProps("genero", {
                        // onChange: onChangeTipoDocumento
                      })}
                    >
                      {['Femenino', 'Masculino'].map((item, i) => (
                        <MenuItem key={'houseAccess_' + i} value={item}>
                          {item}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                </Grid>

                <Grid container>
                  <Grid item xs={12} md={1}>
                  </Grid>
                  <Grid item xs={12} md={10}>
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      size="medium"
                      id="standard-name"
                      label="Celular: "
                      placeholder="Ingrese el número de Celular y/o Telefono"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Keyboard />
                          </InputAdornment>
                        ),
                      }}
                      {...defaultProps("celular")}
                    />
                  </Grid>
                </Grid>

                <Grid container>
                  <Grid item xs={12} md={1}>
                  </Grid>
                  <Grid item xs={12} md={10}>
                    <TextField
                      className='select'
                      select
                      margin="normal"
                      required
                      fullWidth
                      id="standard-name"
                      label="Seleccione la Oficina: "
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Keyboard />
                          </InputAdornment>
                        ),
                      }}
                      {...defaultProps("oficina")}
                    >
                      {oficinas.map((item, i) => (
                        <MenuItem key={item.id} value={item.id}>
                          {item.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                </Grid>

                <Grid container>
                  <Grid item xs={12} md={1}>
                  </Grid>
                  <Grid item xs={12} md={10}>
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      size="medium"
                      id="standard-name"
                      label="Modalidad de Contrato: "
                      placeholder="Ingrese la Modalidad de Contrato del Paciente"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Keyboard />
                          </InputAdornment>
                        ),
                      }}
                      {...defaultProps("modalidadContrato")}
                    />
                  </Grid>
                </Grid>

              </Typography>
            </CardContent>
          </Card>

        </Box>
        <Stack direction="row" justifyContent="center"
          style={{ padding: '10px', backgroundColor: '#0f62ac' }}
          alignItems="center" spacing={1}>
          {getActions()}
        </Stack>

        {(o._id || o.id) && <Fab color="primary" aria-label="add"
          onClick={onClickAdd}
          style={{
            position: 'absolute',
            bottom: 80, right: 24
          }}>
          <AddIcon />
        </Fab>}
      </form>
    </ThemeProvider></LocalizationProvider>
  }
  return <>{
    1 == 1 ? <Box style={{ textAlign: 'left' }}>{getContent()}</Box>
      : <Box
        sx={{ display: 'flex' }}>
      </Box>
  }
  </>;

}