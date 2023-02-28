import React, { useState, useEffect, useRef } from 'react';
import {
  Button, Checkbox, Fab, styled, Table, TableCell, TextField, TablePagination,
  TableHead, TableBody, TableRow, TableContainer, Toolbar, Grid, InputAdornment, Card, CardContent, Typography
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

  const [selected, setSelected] = React.useState([]);

  const isSelected = (code) => selected.indexOf(code) !== -1;

  const networkStatus = useSelector((state) => state.networkStatus);

  const pad = (num, places) => String(num).padStart(places, '0')

  const componentRef = useRef();

  function hoy() {
    const hoy = new Date();
    const year = hoy.getFullYear();
    const month = hoy.getMonth() + 1;
    const day = hoy.getDate();

    const date = year + '-' + pad(month, 2) + '-' + pad(day, 2);

    return date;
  }

  const [o, { defaultProps, set }] = useFormState(useState, {
    'fechaIni': hoy(),
    'fechaFin': hoy(),
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
    o.fechaIni = hoy();
    o.fechaFin = hoy();
    set(o => ({ ...o, fechaIni: hoy() }));
    set(o => ({ ...o, fechaFin: hoy() }));
    onClickSearch()
  }

  const onClickSearch = async () => {
    if (o.fechaIni != null && o.fechaFin != null) {

      if (o.fechaIni.toDate) {
        var fechaIni = o.fechaIni.toDate();
        var day = pad(fechaIni.getDate(), 2);
        var month = pad(fechaIni.getMonth() + 1, 2);
        var year = fechaIni.getFullYear();
        var v1 = year + '-' + month + '-' + day;
      } else {
        var v1 = o.fechaIni;
      }

      if (o.fechaFin.toDate) {
        var fechaFin = o.fechaFin.toDate();
        var day = pad(fechaFin.getDate(), 2);
        var month = pad(fechaFin.getMonth() + 1, 2);
        var year = fechaFin.getFullYear();
        var v2 = year + '-' + month + '-' + day;
      } else {
        var v2 = o.fechaFin;
      }

      if (v1 <= v2) {
        var data = { data: [] };
        if (networkStatus.connected) {
          const result = await http.get('/atencion/' + v1 + '/' + v2);
          data.size = result.length;
          data.data = data.data.concat(result);
        }
        setResult(data);
      } else {
        dispatch({ type: "snack", msg: 'La Fecha Inicio debe de ser menor o igual a la Fecha Fin.', severity: 'warning' });
      }

    } else {
      dispatch({ type: "snack", msg: 'Ingrese la Fecha Inicio y Fin.', severity: 'warning' });
    }

  }

  const fetchData = async () => {
    var data = { data: [] };
    if (networkStatus.connected) {
      const result = await http.get('/atencion/' + o.fechaIni + '/' + o.fechaFin);
      data.size = result.length;
      data.data = data.data.concat(result);
    }
    setResult(data);
  };

  useEffect(() => {
    dispatch({ type: 'title', title: 'Reporte por Rango de Fechas - GORE Áncash' });
    fetchData()
  }, []);

  const onClickPrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: 'Reporte atenciones por Rango de Fechas',
    onAfterPrint: () => dispatch({ type: "snack", msg: 'Reporte de Atenciones entre rango de fechas impreso.!' }),
  });

  function onChangeFechaIni(v) {
    set(o => ({ ...o, fechaIni: v }), () => {
      o.fechaIni = v;
    });
  }

  function onChangeFechaFin(v) {
    set(o => ({ ...o, fechaFin: v }), () => {
      o.fechaFin = v;
    });
  }

  const toID = (row) => {
    return row._id && row._id.$oid ? row._id.$oid : row.id;
  }
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <ThemeProvider theme={theme}>
        <Toolbar className="Toolbar-table mt-1" direction="row" >
          <Grid container spacing={2}>
            <Grid item xs={12} md={3} >
              <DesktopDatePicker
                label="Ingrese la Fecha Inicio:"
                inputFormat="DD/MM/YYYY"
                value={o.fechaIni || ''}
                onChange={onChangeFechaIni}
                renderInput={(params) =>
                  <TextField
                    type={'number'}
                    sx={{ fontWeight: 'bold' }}
                    margin="normal"
                    required
                    fullWidth
                    id="standard-name"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Keyboard />
                        </InputAdornment>
                      ),
                    }}
                    {...params}
                  />}
              />
            </Grid>
            <Grid item xs={12} md={3} >
              <DesktopDatePicker
                label="Ingrese la Fecha Fin:"
                inputFormat="DD/MM/YYYY"
                value={o.fechaFin || ''}
                onChange={onChangeFechaFin}
                renderInput={(params) =>
                  <TextField
                    type={'number'}
                    sx={{ fontWeight: 'bold' }}
                    margin="normal"
                    required
                    fullWidth
                    id="standard-name"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Keyboard />
                        </InputAdornment>
                      ),
                    }}
                    {...params}
                  />}
              />
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
              Listado de Atenciones desde el {o.fechaIni} hasta {o.fechaFin}
            </Typography>
            <TableContainer className='table-container' component={Paper}>
              <Table stickyHeader aria-label="sticky table" sx={{ maxWidth: '100%' }}>
                <TableHead>
                  <TableRow>
                    <StyledTableCell style={{ minWidth: '15%', maxWidth: '15%' }} className='bg-gore border-table cursor-pointer'>Apellidos y Nombres
                    </StyledTableCell>
                    <StyledTableCell style={{ minWidth: '15%', maxWidth: '15%' }} className='bg-gore border-table cursor-pointer'>Cantidad de Atenciones
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
                            {row.cantidad}
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