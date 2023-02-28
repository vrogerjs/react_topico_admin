import React, { useState, useEffect, useRef } from 'react';
import {
  Button, Checkbox, Fab, styled, Table, TableCell, TextField, TablePagination,
  TableHead, TableBody, TableRow, TableContainer, Toolbar, Grid, InputAdornment, Card, CardContent, Typography, MenuItem
} from '@mui/material';
import { Autorenew, ControlPoint, Keyboard, ManageSearch } from '@mui/icons-material';
import { http, useResize, useFormState } from 'gra-react-utils';
import { tableCellClasses } from '@mui/material/TableCell';
import { useDispatch, useSelector } from "react-redux";
import Paper from '@mui/material/Paper';
import { useReactToPrint } from 'react-to-print';
import { Send as SendIcon } from '@mui/icons-material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    textAlign: 'center',
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

const List = () => {

  const dispatch = useDispatch();

  const [result, setResult] = useState({ size: 0, data: [] });

  const [modalidadContrato, setmodalidadContrato] = useState([]);

  const [selected, setSelected] = React.useState([]);

  const isSelected = (code) => selected.indexOf(code) !== -1;

  const networkStatus = useSelector((state) => state.networkStatus);

  const pad = (num, places) => String(num).padStart(places, '0')

  const componentRef = useRef();

  const [o, { defaultProps, set }] = useFormState(useState, {
    'edad': '18 años a 29 años'
  }, {});

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

  const onClickRow = (event, code) => {
    const selectedIndex = selected.indexOf(code);

    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, code);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }
    setSelected(newSelected);
  };

  const emptyRows = result.data && result.data.length;

  const onClickRefresh = () => {
    o.edad = '18 años a 29 años';
    set(o => ({ ...o, edad: '18 años a 29 años' }));
  }

  const onClickSearch = async () => {
    if (o.edad != '') {
      fetchData()
    } else {
      dispatch({ type: "snack", msg: 'Seleccione el Rango de edades.', severity: 'warning' });
    }
  }

  const fetchData = async () => {
    var data = { data: [] };
    if (o.edad === '18 años a 29 años') {
      o.edadIni = 18;
      o.edadFin = 29;
    } else if (o.edad === '30 años a 59 años') {
      o.edadIni = 30;
      o.edadFin = 59;
    } else {
      o.edadIni = 60;
      o.edadFin = 200;
    }

    if (networkStatus.connected) {
      const result = await http.get('/paciente/reporte/edad/' + o.edadIni + '/' + o.edadFin);
      data.size = result.length;
      data.data = data.data.concat(result);
    }
    setResult(data);
  };

  function edad(fechaNacimiento) {
    var v1 = pad(fechaNacimiento[2], 2) + '/' + pad(fechaNacimiento[1], 2) + '/' + fechaNacimiento[0];
    var hoy = new Date()
    var fechaNacimiento = new Date(fechaNacimiento)
    var edad = hoy.getFullYear() - fechaNacimiento.getFullYear()
    var diferenciaMeses = hoy.getMonth() - fechaNacimiento.getMonth()
    if (
      diferenciaMeses < 0 ||
      (diferenciaMeses === 0 && hoy.getDate() < fechaNacimiento.getDate())
    ) {
      edad--
    }
    return edad;
  }

  useEffect(() => {
    dispatch({ type: 'title', title: 'Reporte de Pacientes por Edad - GORE Áncash' });
    fetchData()
  }, []);

  const onClickPrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: 'Reporte de Pacientes por Rango de Edad.',
    onAfterPrint: () => dispatch({ type: "snack", msg: 'Reporte de Atenciones por Edad impreso.!' }),
  });

  const toID = (row) => {
    return row._id && row._id.$oid ? row._id.$oid : row.id;
  }
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <ThemeProvider theme={theme}>
        <Toolbar className="Toolbar-table mt-1" direction="row" >
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                select
                margin="normal"
                required
                fullWidth
                id="standard-name"
                label="Seleccione el Rango de Edad: "
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Keyboard />
                    </InputAdornment>
                  ),
                }}
                {...defaultProps("edad", {
                })}
              >
                {['18 años a 29 años', '30 años a 59 años', 'Mayor a 60 años'].map((item, i) => (
                  <MenuItem key={'houseAccess_' + i} value={item}>
                    {item}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={2} className='mt-1-5'>
              <Button sx={{ width: '100%', fontWeight: 'bold' }} onClick={onClickSearch} startIcon={<ManageSearch />} variant="contained" color="primary">Buscar</Button>
            </Grid>
            <Grid item xs={12} md={2} className='mt-1-5'>
              <Button sx={{ width: '100%', fontWeight: 'bold' }} onClick={onClickRefresh} startIcon={<Autorenew />} variant="contained" color="primary">Actualizar</Button>
            </Grid>
            <Grid item xs={12} md={2} className='mt-1-5'>
              <Button sx={{ width: '100%', fontWeight: 'bold' }} variant="contained" onClick={onClickPrint} color="primary" startIcon={<SendIcon />}>
                Imprimir
              </Button>
            </Grid>
            <Grid item xs={12} md={1}>
            </Grid>
          </Grid>
        </Toolbar>

        <Card ref={componentRef} className='padding-print'>
          <CardContent>
            <Typography sx={{ fontSize: 18 }} gutterBottom className='text-uppercase fw-bold text-center'>
              Listado de Paciente por el Rango de Edad: {o.edad}
            </Typography>
            <TableContainer className='table-container' component={Paper}>
              <Table stickyHeader aria-label="sticky table" sx={{ maxWidth: '100%' }}>
                <TableHead>
                  <TableRow>
                    <StyledTableCell style={{ minWidth: '15%', maxWidth: '15%' }} className='bg-gore border-table cursor-pointer'>Apellidos y Nombres
                    </StyledTableCell>
                    <StyledTableCell style={{ minWidth: '15%', maxWidth: '15%' }} className='bg-gore border-table cursor-pointer'>DNI
                    </StyledTableCell>
                    <StyledTableCell style={{ minWidth: '15%', maxWidth: '15%' }} className='bg-gore border-table cursor-pointer'>Género
                    </StyledTableCell>
                    <StyledTableCell style={{ minWidth: '15%', maxWidth: '15%' }} className='bg-gore border-table cursor-pointer'>Edad
                    </StyledTableCell>
                    <StyledTableCell style={{ minWidth: '15%', maxWidth: '15%' }} className='bg-gore border-table cursor-pointer'>Oficina
                    </StyledTableCell>
                    <StyledTableCell style={{ minWidth: '15%', maxWidth: '15%' }} className='bg-gore border-table cursor-pointer'>Cargo
                    </StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(result && result.data && result.data.length ? result.data : [])
                    .map((row, index) => {
                      const isItemSelected = isSelected(toID(row));
                      return (
                        <StyledTableRow
                          style={{ backgroundColor: (1) ? '' : (index % 2 === 0 ? '#f1f19c' : '#ffffbb') }}
                          hover
                          onClick={(event) => onClickRow(event, toID(row))}
                          role="checkbox"
                          aria-checked={isItemSelected}
                          tabIndex={-1}
                          key={index + ' ' + toID(row)}
                          selected={isItemSelected}
                        >
                          <TableCell style={{ minWidth: '15%', maxWidth: '15%' }} className='border-table cursor-pointer' >
                            {row.apeNomb}
                          </TableCell>
                          <TableCell style={{ minWidth: '15%', maxWidth: '15%' }} className='border-table cursor-pointer' >
                            {row.nroDocumento}
                          </TableCell>
                          <TableCell style={{ minWidth: '15%', maxWidth: '15%' }} className='border-table cursor-pointer' >
                            {row.genero}
                          </TableCell>
                          <TableCell style={{ minWidth: '15%', maxWidth: '15%' }} className='border-table cursor-pointer' >
                            {edad(row.fechaNacimiento)}
                          </TableCell>
                          <TableCell style={{ minWidth: '15%', maxWidth: '15%' }} className='border-table cursor-pointer' >
                            {row.oficina.name}
                          </TableCell>
                          <TableCell style={{ minWidth: '15%', maxWidth: '15%' }} className='border-table cursor-pointer' >
                            {row.cargo}
                          </TableCell>
                        </StyledTableRow >
                      );
                    })}
                  {(!emptyRows) && (
                    <TableRow style={{ height: 53 }}>
                      <TableCell colSpan={7} >
                        No data
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </ThemeProvider>
    </LocalizationProvider>
  );
};

export default List;