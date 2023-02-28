import React, { useState, useEffect, createRef, useRef } from 'react';
import { useFormState, useResize, http } from 'gra-react-utils';
import { db } from '../../db';
import {
  Send as SendIcon,
} from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import {
  Box, Button, Card, CardContent, Grid, Typography
} from '@mui/material';
import {
  useNavigate, useParams
} from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { useReactToPrint } from 'react-to-print';

export const Form = () => {

  const dispatch = useDispatch();

  const networkStatus = useSelector((state) => state.networkStatus);

  const { pid } = useParams();

  const formRef = createRef();

  const navigate = useNavigate();

  const componentRef = useRef();

  const [state, setState] = useState({ page: 0, rowsPerPage: 50 });

  const [o, { set }] = useFormState(useState, {

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
        http.get('/atencion/' + pid).then((result) => {

          result.historiaclinica_id = result.historiaclinica.id;
          result.numero = result.historiaclinica.numero;
          result.apeNomb = result.historiaclinica.paciente.apeNomb;
          result.nroDocumento = result.historiaclinica.paciente.nroDocumento;
          result.fechaNacimiento = pad(result.historiaclinica.paciente.fechaNacimiento[2], 2) + '/' + pad(result.historiaclinica.paciente.fechaNacimiento[1], 2) + '/' + result.historiaclinica.paciente.fechaNacimiento[0];
          result.genero = result.historiaclinica.paciente.genero;
          result.oficina = result.historiaclinica.paciente.oficina.name;
          result.modalidadContrato = result.historiaclinica.paciente.modalidadContrato;
          result.celular = result.historiaclinica.paciente.celular;
          result.fechaEvaluacion = pad(result.fechaEvaluacion[2], 2) + '/' + pad(result.fechaEvaluacion[1], 2) + '/' + result.fechaEvaluacion[0];
          result.imc = parseFloat(result.peso / (result.talla * result.talla)).toFixed(2);
          result.estadoCivil = result.historiaclinica.paciente.estadoCivil;
          result.cargo = result.historiaclinica.paciente.cargo;
          result.condicion = result.historiaclinica.paciente.condicion;

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
    dispatch({ type: 'title', title: 'Imprimir Ficha de Atención - GORE Áncash' });
  }, [state.page, state.rowsPerPage]);

  const onClickCancel = () => {
    navigate(-1);
  }

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

  const onClickPrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: 'Ficha de Atencion Medica',
    onAfterPrint: () => dispatch({ type: "snack", msg: 'Ficha de Atención impreso.!' }),
  });

  function getCellClass(value) {
    if (value >= 16.0 && value < 18.5) {
      return 'bg-poco-peso border-table-black p-1-px';
    } else if (value >= 18.5 && value < 25.0) {
      return 'bg-normal border-table-black p-1-px';
    } else if (value >= 25.0 && value <= 40.0) {
      return 'bg-sobre-peso border-table-black p-1-px';
    } else {
      return 'border-table-black p-1-px';
    }
  }

  function getCellClassGestante(value) {
    if (value == 'Gestante') {
      return '';
    } else {
      return 'display-none';
    }
  }

  function getContent() {
    return <LocalizationProvider dateAdapter={AdapterDayjs}>
      <ThemeProvider theme={theme}>
        <Box style={{ overflow: 'auto' }}>
          <Card className='no-imprimir' sx={{ paddingTop: '16px' }}>
            <Grid container>
              <Grid item xs={12} md={3}>
              </Grid>
              <Grid item xs={12} md={3}>
                <Button sx={{ width: 200, fontWeight: 'bold' }} variant="contained" onClick={onClickCancel} color="error">
                  Cancelar
                </Button>
              </Grid>
              <Grid item xs={12} md={3}>
                <Button sx={{ width: 200, fontWeight: 'bold' }} disabled={o.old && !o.confirm} variant="contained" onClick={onClickPrint} color="success" endIcon={<SendIcon />}>
                  Imprimir
                </Button>
              </Grid>
            </Grid>
          </Card>
          <Card ref={componentRef} className='padding-print'>
            <CardContent >
              <TableContainer component={Paper}>
                <Table aria-label="simple table">
                  <TableHead>
                    <TableRow>
                      <TableCell align='right' colSpan={10} className='p-0'>
                        <Box
                          component="img"
                          sx={{
                            width: 120,
                          }}
                          alt="Logo GORE Áncash."
                          src={process.env.PUBLIC_URL + "/logo-azul.png"}
                        />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={10} className='border-table-black bg-table text-white fw-bold text-center'>
                        <Grid container>
                          <Grid item xs={12} md={12}>
                            <Typography className='title-name-year'>
                              "Año de la unidad, la paz y el Desarrollo"
                            </Typography>
                            <Typography className='fw-bold'>
                              FICHA DE ATENCIÓN
                            </Typography>
                            <Typography className='fw-bold'>
                              TÓPICO DEL GOBIERNO REGIONAL DE ÁNCASH
                            </Typography>
                          </Grid>
                        </Grid>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell align='right' colSpan={10}>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell colSpan={10} className='border-table-black bg-table text-white fw-bold'>DATOS PERSONALES DEL PACIENTE</TableCell>
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
                      <TableCell colSpan={3} className='border-table-black p-1-px bg-celeste' sx={{ width: '40%' }}>Estado Civil</TableCell>
                      <TableCell colSpan={7} className='border-table-black p-1-px'>{o.estadoCivil}</TableCell>
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
                      <TableCell colSpan={3} className='border-table-black p-1-px bg-celeste' sx={{ width: '40%' }}>Cargo Laboral</TableCell>
                      <TableCell colSpan={7} className='border-table-black p-1-px'>{o.cargo}</TableCell>
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
                    <TableRow>
                      <TableCell colSpan={10} className='border-table-black bg-table text-white fw-bold'>FUNCIONES VITALES</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className='border-table-black p-1-px bg-celeste'>PA</TableCell>
                      <TableCell className='border-table-black p-1-px'>{o.presion} (mmHg)</TableCell>
                      <TableCell className='border-table-black p-1-px bg-celeste'>FC</TableCell>
                      <TableCell className='border-table-black p-1-px'>{o.frecuenciaCardiaca} (bpm)</TableCell>
                      <TableCell className='border-table-black p-1-px bg-celeste'>FR</TableCell>
                      <TableCell className='border-table-black p-1-px'>{o.frecuenciaRespiratoria} (rpm)</TableCell>
                      <TableCell className='border-table-black p-1-px bg-celeste'>SpO2</TableCell>
                      <TableCell className='border-table-black p-1-px'>{o.saturacion} (%)</TableCell>
                      <TableCell className='border-table-black p-1-px bg-celeste'>Tº</TableCell>
                      <TableCell className='border-table-black p-1-px'>{o.temperatura} (ºC)</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className='border-table-black p-1-px bg-celeste'>Peso</TableCell>
                      <TableCell className='border-table-black p-1-px'>{o.peso} (Kg)</TableCell>
                      <TableCell className='border-table-black p-1-px bg-celeste'>Talla</TableCell>
                      <TableCell className='border-table-black p-1-px'>{o.talla} (m)</TableCell>
                      <TableCell className='border-table-black p-1-px bg-celeste'>IMC</TableCell>
                      <TableCell colSpan={5} className={getCellClass(o.imc)}>{o.imc} (Kg/m2)</TableCell>
                    </TableRow>


                    <TableRow className={getCellClassGestante(o.condicion)}>
                      <TableCell colSpan={10} className='border-table-black bg-table text-white fw-bold'>ATENCIONES PRENATALES</TableCell>
                    </TableRow>
                    <TableRow className={getCellClassGestante(o.condicion)}>
                      <TableCell colSpan={2} className='border-table-black p-1-px bg-celeste'>Fecha de Atención</TableCell>
                      <TableCell className='border-table-black p-1-px'>{o.fechaEvaluacion}</TableCell>
                      <TableCell colSpan={2} className='border-table-black p-1-px bg-celeste'>Edad Gestación(semanas)</TableCell>
                      <TableCell colSpan={2} className='border-table-black p-1-px'>{o.edadGestacion}</TableCell>
                      <TableCell colSpan={2} className='border-table-black p-1-px bg-celeste'>Peso Madre</TableCell>
                      <TableCell className='border-table-black p-1-px'>{o.peso} (Kg)</TableCell>
                    </TableRow>
                    <TableRow className={getCellClassGestante(o.condicion)}>
                      <TableCell colSpan={2} className='border-table-black p-1-px bg-celeste'>Temperatura</TableCell>
                      <TableCell className='border-table-black p-1-px'>{o.temperatura} (ºC)</TableCell>
                      <TableCell colSpan={2} className='border-table-black p-1-px bg-celeste'>Presion Arterial</TableCell>
                      <TableCell colSpan={2} className='border-table-black p-1-px'>{o.presion} (mmHg)</TableCell>
                      <TableCell colSpan={2} className='border-table-black p-1-px bg-celeste'>Pulso Materno</TableCell>
                      <TableCell className='border-table-black p-1-px'>{o.pulsoMaterno} (X min)</TableCell>
                    </TableRow>
                    <TableRow className={getCellClassGestante(o.condicion)}>
                      <TableCell colSpan={2} className='border-table-black p-1-px bg-celeste'>Altura Uterina</TableCell>
                      <TableCell className='border-table-black p-1-px'>{o.alturaUterina} (cm)</TableCell>
                      <TableCell colSpan={2} className='border-table-black p-1-px bg-celeste'>Situación</TableCell>
                      <TableCell colSpan={2} className='border-table-black p-1-px'>{o.situacion}</TableCell>
                      <TableCell colSpan={2} className='border-table-black p-1-px bg-celeste'>Presentación</TableCell>
                      <TableCell className='border-table-black p-1-px'>{o.presentacion}</TableCell>
                    </TableRow>
                    <TableRow className={getCellClassGestante(o.condicion)}>
                      <TableCell colSpan={2} className='border-table-black p-1-px bg-celeste'>Posición</TableCell>
                      <TableCell className='border-table-black p-1-px'>{o.posicion}</TableCell>
                      <TableCell colSpan={2} className='border-table-black p-1-px bg-celeste'>F.C.F(por min/NA)</TableCell>
                      <TableCell colSpan={2} className='border-table-black p-1-px'>{o.edadGestacion}</TableCell>
                      <TableCell colSpan={2} className='border-table-black p-1-px bg-celeste'>Movimiento Fetal</TableCell>
                      <TableCell className='border-table-black p-1-px'>{o.movimientoFetal}</TableCell>
                    </TableRow>
                    <TableRow className={getCellClassGestante(o.condicion)}>
                      <TableCell colSpan={2} className='border-table-black p-1-px bg-celeste'>Proteinuaria Cualitativa</TableCell>
                      <TableCell className='border-table-black p-1-px'>{o.posicion}</TableCell>
                      <TableCell colSpan={2} className='border-table-black p-1-px bg-celeste'>Edema</TableCell>
                      <TableCell colSpan={2} className='border-table-black p-1-px'>{o.movimientoFetal}</TableCell>
                      <TableCell colSpan={2} className='border-table-black p-1-px bg-celeste'>Reflejo Osteotendinoso</TableCell>
                      <TableCell className='border-table-black p-1-px'>{o.reflejo}</TableCell>
                    </TableRow>
                    <TableRow className={getCellClassGestante(o.condicion)}>
                      <TableCell colSpan={2} className='border-table-black p-1-px bg-celeste'>Exámen de Pezon</TableCell>
                      <TableCell className='border-table-black p-1-px'>{o.edadGestacion}</TableCell>
                      <TableCell colSpan={2} className='border-table-black p-1-px bg-celeste'>Indicador Fierro/Ac Fólico</TableCell>
                      <TableCell colSpan={2} className='border-table-black p-1-px'>{o.indicadorFierro}</TableCell>
                      <TableCell colSpan={2} className='border-table-black p-1-px bg-celeste'>Indicador Calcio</TableCell>
                      <TableCell className='border-table-black p-1-px'>{o.indicadorCalcio}</TableCell>
                    </TableRow>
                    <TableRow className={getCellClassGestante(o.condicion)}>
                      <TableCell colSpan={2} className='border-table-black p-1-px bg-celeste'>Indicador Acido Fólico</TableCell>
                      <TableCell className='border-table-black p-1-px'>{o.edadGestacion}</TableCell>
                      <TableCell colSpan={2} className='border-table-black p-1-px bg-celeste'>EG de Eco Control</TableCell>
                      <TableCell colSpan={2} className='border-table-black p-1-px'>{o.ecoControl}</TableCell>
                      <TableCell colSpan={2} className='border-table-black p-1-px bg-celeste'>Perfil Biofísico</TableCell>
                      <TableCell className='border-table-black p-1-px'>{o.perfilBiofisico}</TableCell>
                    </TableRow>
                    <TableRow className={getCellClassGestante(o.condicion)}>
                      <TableCell colSpan={2} className='border-table-black p-1-px bg-celeste'>Cita</TableCell>
                      <TableCell className='border-table-black p-1-px'>{o.proximaCita}</TableCell>
                      <TableCell colSpan={2} className='border-table-black p-1-px bg-celeste'>Visita Domiciliaria</TableCell>
                      <TableCell colSpan={2} className='border-table-black p-1-px'>{o.visitaDomiciliaria}</TableCell>
                      <TableCell colSpan={2} className='border-table-black p-1-px bg-celeste'>Plan Parto</TableCell>
                      <TableCell className='border-table-black p-1-px'>{o.planParto}</TableCell>
                    </TableRow>
                    <TableRow className={getCellClassGestante(o.condicion)}>
                      <TableCell colSpan={2} className='border-table-black p-1-px bg-celeste'>Establecimiento de Atención</TableCell>
                      <TableCell className='border-table-black p-1-px'>{o.lugarAtencion}</TableCell>
                      <TableCell colSpan={2} className='border-table-black p-1-px bg-celeste'>Responsable de la Atención</TableCell>
                      <TableCell colSpan={2} className='border-table-black p-1-px'>{o.responsableAtencion}</TableCell><TableCell colSpan={2} className='border-table-black p-1-px bg-celeste'>N° de Formato SIS</TableCell>
                      <TableCell colSpan={2} className='border-table-black p-1-px'>{o.numeroSis}</TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell align='right' colSpan={10} className='espacio-table'>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={10} className='border-table-black bg-table text-white fw-bold'>1. ANAMNESIS</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={10} className='border-table-black p-1-px'>
                        <Typography dangerouslySetInnerHTML={{ __html: o.anamnesis }} />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell align='right' colSpan={10} className='espacio-table'>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={10} className='border-table-black bg-table text-white fw-bold'>2. HOJA DE EVOLUCIÓN MÉDICA</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={10} className='border-table-black p-1-px'>
                        <Typography dangerouslySetInnerHTML={{ __html: o.evolucionMedica }} />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell align='right' colSpan={10} className='espacio-table'>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={10} className='border-table-black bg-table text-white fw-bold'>3. ORDEN MÉDICA</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={10} className='border-table-black p-1-px'>
                        <Typography dangerouslySetInnerHTML={{ __html: o.ordenMedica }} />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell align='right' colSpan={10} className='espacio-table'>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={10} className='border-table-black bg-table text-white fw-bold'>4. NOTAS DE ENFERMERÍA</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={10} className='border-table-black p-1-px'>
                        <Typography dangerouslySetInnerHTML={{ __html: o.notaEnfermeria }} />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell align='right' colSpan={10} className='espacio-table'>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell align='right' colSpan={10} className='espacio-table'>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={10} className='border-table-black bg-table text-white fw-bold'>5. INTERCONSULTAS Y/O REFERENCIAS</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={10} className='border-table-black p-1-px'>
                        <Typography dangerouslySetInnerHTML={{ __html: o.interConsulta }} />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Box>
      </ThemeProvider>
    </LocalizationProvider>
  }
  return <>{
    1 == 1 ? <Box style={{ textAlign: 'left' }}>{getContent()}</Box>
      : <Box
        sx={{ display: 'flex' }}>
      </Box>
  }
  </>;

}