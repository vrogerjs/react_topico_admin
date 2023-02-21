import React, { useState, useEffect } from 'react';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import {
  Button, Checkbox, Fab, styled, Table, TableCell, TextField, TablePagination,
  TableHead, TableBody, TableRow, TableContainer, Toolbar, Grid, Link, Card, CardContent
} from '@mui/material';
import { Autorenew, ControlPoint, PictureAsPdf, ReplyAll, Visibility } from '@mui/icons-material';
import { http, useResize, useFormState } from 'gra-react-utils';
import { tableCellClasses } from '@mui/material/TableCell';
import { useDispatch, useSelector } from "react-redux";
import {
  useNavigate, useParams
} from "react-router-dom";
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';

const bull = (
  <Box
    component="span"
    sx={{ display: 'inline-block', mx: '2px', transform: 'scale(0.8)' }}
  >
    •
  </Box>
);

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

  const navigate = useNavigate();

  const [state, setState] = useState({ page: 0, rowsPerPage: 25 });

  const [result, setResult] = useState({ size: 0, data: [] });

  const [selected, setSelected] = React.useState([]);

  const isSelected = (code) => selected.indexOf(code) !== -1;

  const networkStatus = useSelector((state) => state.networkStatus);

  const [pacientes, setPacientes] = useState([]);

  const pad = (num, places) => String(num).padStart(places, '0')

  const [o, { defaultProps }] = useFormState(useState, {}, {});

  const onChangeAllRow = (event) => {
    if (event.target.checked) {
      const newSelected = result.data.map((row) => toID(row));
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const { pid } = useParams();

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

  const onPageChange = (
    event, page
  ) => {
    setState({ ...state, page: page });
  };

  const onRowsPerPageChange = (
    event
  ) => {
    setState({ ...state, rowsPerPage: event.target.value });
  };

  const onClickRefresh = () => {
    setSelected([]);
    fetchData(state.page);
  }

  const fetchData = async (page) => {
    var data = { data: [] };
    if (networkStatus.connected) {
      const result = await http.get('/file/' + page + '/' + state.rowsPerPage + '/' + pid);

      const resultHC = await http.get('/historiaclinica/' + pid);

      var hoy = new Date()
      var fechaNacimiento = new Date(resultHC.paciente.fechaNacimiento)
      var edad = hoy.getFullYear() - fechaNacimiento.getFullYear()
      var diferenciaMeses = hoy.getMonth() - fechaNacimiento.getMonth()
      if (
        diferenciaMeses < 0 ||
        (diferenciaMeses === 0 && hoy.getDate() < fechaNacimiento.getDate())
      ) {
        edad--
      }

      o.edad = edad;

      var historiaclinica_id = resultHC.id;
      o.historiaclinica_id = historiaclinica_id;

      var numero = resultHC.numero;
      o.numero = numero;

      var nombApe = resultHC.paciente.apeNomb;
      o.nombApe = nombApe;

      var nroDocumento = resultHC.paciente.nroDocumento;
      o.nroDocumento = nroDocumento;

      var genero = resultHC.paciente.genero;
      o.genero = genero;

      var fechaNacimiento = pad(resultHC.paciente.fechaNacimiento[2], 2) + '/' + pad(resultHC.paciente.fechaNacimiento[1], 2) + '/' + resultHC.paciente.fechaNacimiento[0];
      o.fechaNacimiento = fechaNacimiento;

      var modalidadContrato = resultHC.paciente.modalidadContrato;
      o.modalidadContrato = modalidadContrato;

      var celular = resultHC.paciente.celular;
      o.celular = celular;

      var oficina = resultHC.paciente.oficina.name;
      o.oficina = oficina;

      data.size = result.size;
      state.totalElements = result.totalElements;
      data.data = data.data.concat(result.content);
    }
    setResult(data);
  };

  const { height, width } = useResize(React);

  useEffect(() => {
    const header = document.querySelector('.MuiToolbar-root');
    const tableContainer = document.querySelector('.MuiTableContainer-root');
    const nav = document.querySelector('nav');
    const toolbarTable = document.querySelector('.Toolbar-table');
    const tablePagination = document.querySelector('.MuiTablePagination-root');

    if (tableContainer) {
      tableContainer.style.width = (width - nav.offsetWidth) + 'px';
      tableContainer.style.height = (height - header.offsetHeight
        - toolbarTable.offsetHeight - tablePagination.offsetHeight) + 'px';
    }
  }, [height, width]);

  useEffect(() => {
    dispatch({ type: 'title', title: 'Gestión de Archivos del Paciente - GORE Áncash' });
    fetchData(state.page)
  }, [state.page, state.rowsPerPage]);

  const createOnClick = () => {
    navigate('/historiaclinica/file/create/' + o.historiaclinica_id + '/1');
  };

  const editOnClick = () => {
    navigate('/historiaclinica/file/' + selected[0] + '/edit/2');
  }

  const onClickBack = () => {
    navigate('/historiaclinica', { replace: true });
  }

  const toID = (row) => {
    return row._id && row._id.$oid ? row._id.$oid : row.id;
  }
  return (
    <>
      <Grid container className='p-20px'>
        <Grid item xs={12} md={12}>
          <Table aria-label="simple table">
            <TableBody>
              <TableRow>
                <TableCell colSpan={10} className='border-table-black bg-table table-title-main'>DATOS PERSONALES DEL PACIENTE</TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={3} className='border-table-black p-5px bg-celeste' sx={{ width: '40%' }}>Número de Historia Clínica</TableCell>
                <TableCell colSpan={7} className='border-table-black p-5px'>{o.numero}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={3} className='border-table-black p-5px bg-celeste' sx={{ width: '40%' }}>Nombres y Apellidos</TableCell>
                <TableCell colSpan={7} className='border-table-black p-5px'>{o.nombApe}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={3} className='border-table-black p-5px bg-celeste' sx={{ width: '40%' }}>Fecha de Nacimiento</TableCell>
                <TableCell colSpan={7} className='border-table-black p-5px'>{o.fechaNacimiento}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={3} className='border-table-black p-5px bg-celeste' sx={{ width: '40%' }}>DNI</TableCell>
                <TableCell colSpan={7} className='border-table-black p-5px'>{o.nroDocumento}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={3} className='border-table-black p-5px bg-celeste' sx={{ width: '40%' }}>Edad</TableCell>
                <TableCell colSpan={7} className='border-table-black p-5px'>{o.edad}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={3} className='border-table-black p-5px bg-celeste' sx={{ width: '40%' }}>Genero</TableCell>
                <TableCell colSpan={7} className='border-table-black p-5px'>{o.genero}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={3} className='border-table-black p-5px bg-celeste' sx={{ width: '40%' }}>Modalidad de Contrato</TableCell>
                <TableCell colSpan={7} className='border-table-black p-5px'>{o.modalidadContrato}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={3} className='border-table-black p-5px bg-celeste' sx={{ width: '40%' }}>Gerencia o Dirección Laboral</TableCell>
                <TableCell colSpan={7} className='border-table-black p-5px'>{o.oficina}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={3} className='border-table-black p-5px bg-celeste' sx={{ width: '40%' }}>Teléfono</TableCell>
                <TableCell colSpan={7} className='border-table-black p-5px'>{o.celular}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Grid>
      </Grid>

      <Toolbar className="Toolbar-table mt-1" direction="row" >

        <Grid container spacing={2}>
          <Grid item xs={12} md={2}>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button sx={{ width: '100%', fontWeight: 'bold' }} startIcon={<ControlPoint />} onClick={createOnClick} variant="contained" color="primary">Nuevo</Button>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button sx={{ width: '100%', fontWeight: 'bold' }} disabled={!selected.length} startIcon={<EditIcon />} onClick={editOnClick} variant="contained" color="primary">Editar</Button>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button sx={{ width: '100%', fontWeight: 'bold' }} onClick={onClickRefresh} startIcon={<Autorenew />} variant="contained" color="primary">Actualizar</Button>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button sx={{ width: '100%', fontWeight: 'bold' }} onClick={onClickBack} startIcon={<ReplyAll />} variant="contained" color="primary">Atras</Button>
          </Grid>
          <Grid item xs={12} md={2}>
          </Grid>
        </Grid>
      </Toolbar>

      <Card>
        <CardContent>
          <TableContainer className='table-container'>
            <Table stickyHeader aria-label="sticky table" sx={{ maxWidth: '100%' }}>
              <TableHead>
                <TableRow>
                  <StyledTableCell padding="checkbox" className='bg-gore border-table text-table'>
                    <Checkbox
                      style={{ color: 'white' }}
                      indeterminate={selected.length > 0 && selected.length < result.data.length}
                      checked={result && result.data.length > 0 && selected.length === result.data.length}
                      onChange={onChangeAllRow}
                      inputProps={{
                        'aria-label': 'select all desserts',
                      }}
                    />
                  </StyledTableCell>
                  <StyledTableCell style={{ minWidth: 50, maxWidth: 50 }} className='bg-gore border-table text-table'>Fecha del Documento
                    {/* <TextField {...defaultProps('dependencia')} style={{ padding: 0, marginTop: '5px !important' }} /> */}
                  </StyledTableCell>
                  <StyledTableCell style={{ minWidth: 100, maxWidth: 100 }} className='bg-gore border-table text-table'>Nombre del Documento
                    {/* <TextField {...defaultProps('dependencia')} style={{ padding: 0, marginTop: '5px !important' }} /> */}
                  </StyledTableCell>
                  <StyledTableCell style={{ minWidth: 50, maxWidth: 50 }} className='bg-gore border-table text-table'>Documento
                    {/* <TextField {...defaultProps('dependencia')} style={{ padding: 0, marginTop: '5px !important' }} /> */}
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
                        <TableCell padding="checkbox" className='border-table text-table'>
                          <Checkbox
                            color="primary"
                            checked={isItemSelected}
                          />
                        </TableCell>
                        <TableCell style={{ minWidth: 50, maxWidth: 50 }} className='border-table text-table' >
                          {pad(row.fechaRegistro[2], 2)}/{pad(row.fechaRegistro[1], 2)}/{row.fechaRegistro[0]}
                        </TableCell>
                        <TableCell style={{ minWidth: 100, maxWidth: 100 }} className='border-table text-table' >
                          {row.name}
                        </TableCell>
                        <TableCell style={{ minWidth: 50, maxWidth: 50 }} className='border-table text-table' align='center'>
                          <Link href={`https://web.regionancash.gob.pe/fs/temp/${row.urlDocumento}`} underline="none" target={'_link'}>
                            <PictureAsPdf color="primary" />
                          </Link>
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
          <TablePagination
            rowsPerPageOptions={[10, 20, 50]}
            component="div"
            count={state.totalElements}
            rowsPerPage={state.rowsPerPage}
            page={state.page}
            onPageChange={onPageChange}
            onRowsPerPageChange={onRowsPerPageChange}
          />
        </CardContent>
      </Card>
    </>
  );

};

export default List;