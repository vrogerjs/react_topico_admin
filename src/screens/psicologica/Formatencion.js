import React, { useState, useEffect, createRef } from 'react';
import { useFormState, useResize, http } from 'gra-react-utils';
import { VRadioGroup } from '../../utils/useToken';
import { db } from '../../db';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

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
import { fontWeight } from '@mui/system';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

export const Form = () => {

  const dispatch = useDispatch();

  const networkStatus = useSelector((state) => state.networkStatus);

  const { pid } = useParams();

  const { temp } = useParams();

  const formRef = createRef();

  const navigate = useNavigate();

  const [oficinas, setOficinas] = useState([]);

  const [editorData, setEditorData] = useState('');

  const [editorDataPA, setEditorDataPA] = useState('');

  const [editorDataAN, setEditorDataAN] = useState('');

  const [editorDataDI, setEditorDataDI] = useState('');

  const [editorDataRE, setEditorDataRE] = useState('');

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
    if (temp == 1) {
      if (pid) {
        if (networkStatus.connected) {
          http.get('/historiaclinica/' + pid).then((result) => {

            result.historiaclinica_id = result.id;
            result.numero = result.numero;
            result.apeNomb = result.paciente.apeNomb;
            result.nroDocumento = result.paciente.nroDocumento;
            result.fechaNacimiento = result.paciente.fechaNacimiento[2] + '/' + result.paciente.fechaNacimiento[1] + '/' + result.paciente.fechaNacimiento[0];
            result.genero = result.paciente.genero;
            result.oficina = result.paciente.oficina.name;
            result.modalidadContrato = result.paciente.modalidadContrato;
            result.celular = result.paciente.celular;
            result.id='';

            var hoy = new Date()
            var fechaNacimiento = new Date(result.paciente.fechaNacimiento)
            var edad = hoy.getFullYear() - fechaNacimiento.getFullYear()
            var diferenciaMeses = hoy.getMonth() - fechaNacimiento.getMonth()
            if (
              diferenciaMeses < 0 ||
              (diferenciaMeses === 0 && hoy.getDate() < fechaNacimiento.getDate())
            ) {
              edad--
            }

            result.edad = edad;
            set({ ...o, result });

            set(result);
          });
        }
      } else {
        try {
          var s = localStorage.getItem("setting");
          if (s) {
            s = JSON.parse(s);
            var o = {};
            o.apeNomb = s.apeNomb;
            o.tipoDocumento = s.tipoDocumento;
            o.nroDocumento = s.nroDocumento;
            o.fechaNacimiento = s.fechaNacimiento;
            o.genero = s.genero;
            o.celular = s.celular;
            o.oficina = s.oficina;
            o.modalidad = s.modalidad;
            o.numero = s.numero;

          }
        } catch (e) {
          console.log(e);
        }
      }
    } else {
      if (pid) {
        if (networkStatus.connected) {
          http.get('/psicologica/' + pid).then((result) => {

            result.historiaclinica_id = result.historiaclinica.id;
            result.numero = result.historiaclinica.numero;
            result.apeNomb = result.historiaclinica.paciente.apeNomb;
            result.nroDocumento = result.historiaclinica.paciente.nroDocumento;
            result.fechaNacimiento = result.historiaclinica.paciente.fechaNacimiento[2] + '/' + result.historiaclinica.paciente.fechaNacimiento[1] + '/' + result.historiaclinica.paciente.fechaNacimiento[0];
            result.genero = result.historiaclinica.paciente.genero;
            result.oficina = result.historiaclinica.paciente.oficina.name;
            result.modalidadContrato = result.historiaclinica.paciente.modalidadContrato;
            result.celular = result.historiaclinica.paciente.celular;

            var hoy = new Date()
            var fechaNacimiento = new Date(result.historiaclinica.paciente.fechaNacimiento)
            var edad = hoy.getFullYear() - fechaNacimiento.getFullYear()
            var diferenciaMeses = hoy.getMonth() - fechaNacimiento.getMonth()
            if (
              diferenciaMeses < 0 ||
              (diferenciaMeses === 0 && hoy.getDate() < fechaNacimiento.getDate())
            ) {
              edad--
            }

            result.edad = edad;
            set({ ...o, result });
            set(result);

            if (result.motivo)
              setEditorData(result.motivo);

            if (result.problemaActual)
              setEditorDataPA(result.problemaActual);

            if (result.anamnesis)
              setEditorDataAN(result.anamnesis);

            if (result.diagnostico)
              setEditorDataDI(result.diagnostico);

            if (result.recomendacion)
              setEditorDataRE(result.recomendacion);

          });
        }
      } else {
        try {
          var s = localStorage.getItem("setting");
          if (s) {
            s = JSON.parse(s);
            var o = {};
            o.apeNomb = s.apeNomb;
            o.tipoDocumento = s.tipoDocumento;
            o.nroDocumento = s.nroDocumento;
            o.fechaNacimiento = s.fechaNacimiento;
            o.genero = s.genero;
            o.celular = s.celular;
            o.oficina = s.oficina;
            o.modalidad = s.modalidad;
            o.numero = s.numero;

          }
        } catch (e) {
          console.log(e);
        }
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
    dispatch({ type: 'title', title: 'Registrar Atención a Paciente - GORE Áncash' });
    fetchData(state.page)
  }, [state.page, state.rowsPerPage]);

  const fetchData = async (page) => {
    var data = { data: [] };
    if (networkStatus.connected) {
      const result = await (http.get('/oficina'));
      setOficinas(result);
    }
  };

  const onClickCancel = () => {
    navigate(-1);
  }

  const onClickAdd = async () => {
    // navigate('/paciente/create', { replace: true });
  }

  const onClickSave = async () => {
    const form = formRef.current;
    if (0 || form != null && validate(form)) {

      if (networkStatus.connected) {
        o.historiaclinica = { id: o.historiaclinica_id };
        var hoy = new Date();
        o.fechaEvaluacion = hoy;

        http.post('/psicologica', o).then(async (result) => {
          console.log(result);
          if (!o._id) {
            if (result.id) {
              dispatch({ type: "snack", msg: 'Registro grabado!' });
              navigate('/psicologica/' + o.historiaclinica_id + '/atencion', { replace: true });
            }
            else {
              navigate(-1);
            }
          }
        });
      } else {
        if (!o.id) {
          o.tmpId = 1 * new Date();
          o.id = -o.tmpId;
          //await db.disabled.add(o);
          navigate('/' + o.id + '/edit', { replace: true });
        } else {
          //await db.disabled.update(o.id, o);
        }
        dispatch({ type: "snack", msg: 'Registro grabado!' });
      }
    } else {
      dispatch({ type: "alert", msg: 'Falta campos por completar!' });
    }
  };

  function onChangeProximaCita(v) {
    set(o => ({ ...o, proximaCita: v }), () => {
      o.proximaCita = v;
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
        Guardar
      </Button>
    </>
  }

  function getContent() {
    return <LocalizationProvider dateAdapter={AdapterDayjs}><ThemeProvider theme={theme}>
      <form ref={formRef} onSubmit={onSubmit} style={{ textAlign: 'left' }}>
        <Box style={{ overflow: 'auto' }}>

          <TableContainer component={Paper} className='p-20px'>
            <Table aria-label="simple table">
              <TableBody>
                <TableRow>
                  <TableCell colSpan={10} className='border-table-black bg-table table-title-main'>DATOS PERSONALES DEL PACIENTE</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={3} className='border-table-black p-1-px bg-celeste' sx={{ width: '40%' }}>Número de Historia Clínica</TableCell>
                  <TableCell colSpan={7} className='border-table-black p-1-px'>{o.numero}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={3} className='border-table-black p-1-px bg-celeste' sx={{ width: '40%' }}>Nombres y Apellidos</TableCell>
                  <TableCell colSpan={7} className='border-table-black p-1-px'>{o.apeNomb}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={3} className='border-table-black p-1-px bg-celeste' sx={{ width: '40%' }}>Fecha de Nacimiento</TableCell>
                  <TableCell colSpan={7} className='border-table-black p-1-px'>{o.fechaNacimiento}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={3} className='border-table-black p-1-px bg-celeste' sx={{ width: '40%' }}>DNI</TableCell>
                  <TableCell colSpan={7} className='border-table-black p-1-px'>{o.nroDocumento}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={3} className='border-table-black p-1-px bg-celeste' sx={{ width: '40%' }}>Edad</TableCell>
                  <TableCell colSpan={7} className='border-table-black p-1-px'>{o.edad}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={3} className='border-table-black p-1-px bg-celeste' sx={{ width: '40%' }}>Genero</TableCell>
                  <TableCell colSpan={7} className='border-table-black p-1-px'>{o.genero}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={3} className='border-table-black p-1-px bg-celeste' sx={{ width: '40%' }}>Modalidad de Contrato</TableCell>
                  <TableCell colSpan={7} className='border-table-black p-1-px'>{o.modalidadContrato}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={3} className='border-table-black p-1-px bg-celeste' sx={{ width: '40%' }}>Gerencia o Dirección Laboral</TableCell>
                  <TableCell colSpan={7} className='border-table-black p-1-px'>{o.oficina}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={3} className='border-table-black p-1-px bg-celeste' sx={{ width: '40%' }}>Teléfono</TableCell>
                  <TableCell colSpan={7} className='border-table-black p-1-px'>{o.celular}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={3} className='border-table-black p-1-px bg-celeste' sx={{ width: '40%' }}>Fecha de Evaluación</TableCell>
                  <TableCell colSpan={7} className='border-table-black p-1-px'>{o.fechaEvaluacion}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell align='right' colSpan={10} className='espacio-table'>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          <Accordion className='border-white'>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel2a-content"
              id="panel2a-header"
              className='bg-gore'
            >
              <Typography>Motivo de la Consulta</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container>
                <Grid item xs={12} md={12}>
                  <CKEditor
                    editor={ClassicEditor}
                    data={editorData}
                    onChange={(event, editor) => {
                      const data = editor.getData();
                      setEditorData(data);
                      o.motivo = data;
                    }}
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          <Accordion className='border-white'>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel2a-content"
              id="panel2a-header"
              className='bg-gore'
            >
              <Typography>Problema Actual</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container>
                <Grid item xs={12} md={12}>
                  <CKEditor
                    editor={ClassicEditor}
                    data={editorDataPA}
                    onChange={(event, editor) => {
                      const data = editor.getData();
                      setEditorDataPA(data);
                      o.problemaActual = data;
                    }}
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          <Accordion className='border-white'>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel2a-content"
              id="panel2a-header"
              className='bg-gore'
            >
              <Typography>Anamnesis (Datos Relevantes)</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container>
                <Grid item xs={12} md={12}>
                  <CKEditor
                    editor={ClassicEditor}
                    data={editorDataAN}
                    onChange={(event, editor) => {
                      const data = editor.getData();
                      setEditorDataAN(data);
                      o.anamnesis = data;
                    }}
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          <Accordion className='border-white'>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel2a-content"
              id="panel2a-header"
              className='bg-gore'
            >
              <Typography>Diagnóstico Presuntivo</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container>
                <Grid item xs={12} md={12}>
                  <CKEditor
                    editor={ClassicEditor}
                    data={editorDataDI}
                    onChange={(event, editor) => {
                      const data = editor.getData();
                      setEditorDataDI(data);
                      o.diagnostico = data;
                    }}
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          <Accordion className='border-white'>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel2a-content"
              id="panel2a-header"
              className='bg-gore'
            >
              <Typography>Recomendaciones</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container>
                <Grid item xs={12} md={12}>
                  <CKEditor
                    editor={ClassicEditor}
                    data={editorDataRE}
                    onChange={(event, editor) => {
                      const data = editor.getData();
                      setEditorDataRE(data);
                      o.recomendacion = data;
                    }}
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          <Accordion className='border-white'>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel2a-content"
              id="panel2a-header"
              className='bg-gore'
            >
              <Typography>Próxima Cita</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container>
                <Grid item xs={12} md={12}>
                  <DesktopDatePicker
                    label="Ingrese su Próxima Cita."
                    inputFormat="DD/MM/YYYY"
                    value={o.proximaCita || ''}
                    onChange={onChangeProximaCita}
                    renderInput={(params) =>
                      <TextField
                        type={'number'}
                        sx={{ fontWeight: 'bold' }}
                        margin="normal"
                        required
                        fullWidth
                        id="standard-name"
                        label="Próxima Cita: "
                        placeholder="Ingrese su Próxima Cita."
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
              </Grid>
            </AccordionDetails>
          </Accordion>

        </Box>
        <Stack direction="row" justifyContent="center"
          style={{ padding: '10px', backgroundColor: '#0f62ac' }}
          alignItems="center" spacing={1}>
          {getActions()}
        </Stack>

        {/* {(o._id || o.id) && <Fab color="primary" aria-label="add"
          onClick={onClickAdd}
          style={{
            position: 'absolute',
            bottom: 80, right: 24
          }}>
          <AddIcon />
        </Fab>} */}

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