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

export const Form = () => {

  const dispatch = useDispatch();

  const networkStatus = useSelector((state) => state.networkStatus);

  const { pid } = useParams();

  const formRef = createRef();

  const navigate = useNavigate();

  const [o, { defaultProps, handleChange, bindEvents, validate, set }] = useFormState(useState, {

  }, {});

  useEffect(() => {
    dispatch({ type: 'title', title: (pid ? 'Actualizar' : 'Registrar') + ' Oficina' });
    [].forEach(async (e) => {
      e[1](await db[e[0]].toArray());
    });
  }, []);

  useEffect(() => {
    if (pid) {
      if (networkStatus.connected) {
        http.get('http://localhost:8080/oficina/' + pid).then((result) => {
          set(result);
          console.log(result);
        });
      }
    } else {
      try {
        var s = localStorage.getItem("setting");
        if (s) {
          s = JSON.parse(s);
          var o2 = {};
          o2.oficina = s.oficina;
          o2.abreviatura = s.abreviatura;
          o2.nombaperesponsable = s.nombaperesponsable;
          o2.cargoresponsable = s.cargoresponsable;
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

  const onClickCancel = () => {
    navigate(-1);
  }

  const onClickAdd = async () => {
    navigate('/oficina/create', { replace: true });
  }

  const onClickSave = async () => {
    const form = formRef.current;
    if (0 || form != null && validate(form)) {

      var o2 = JSON.parse(JSON.stringify(o));
      if (networkStatus.connected) {

        http.post('http://localhost:8080/oficina', o2).then(async (result) => {
          if (!o2._id) {
            if (result.id) {
              // navigate('/oficina/' + result.id + '/edit', { replace: true });
              dispatch({ type: "snack", msg: 'Registro grabado!' });
              navigate('/oficina', { replace: true });
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
        Grabar
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
                DATOS DE LA OFICINA
              </Typography>

              <Typography variant="body2" color="text.secondary">
                <Grid container>
                  <Grid item xs={12} md={1}>
                  </Grid>
                  <Grid item xs={12} md={11}>
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      size="medium"
                      id="standard-name"
                      label="Ingrese el nombre de la Oficina: "
                      placeholder="Oficina"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Keyboard />
                          </InputAdornment>
                        ),
                      }}
                      {...defaultProps("name")}
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