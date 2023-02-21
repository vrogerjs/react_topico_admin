import React, { useState, useEffect } from 'react';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { db } from '../../db';
import {
  Button, Checkbox, Fab, styled, Table, TableCell, TextField, TablePagination,
  TableHead, TableBody, TableRow, TableContainer, Toolbar, Grid, InputAdornment, Card, CardContent
} from '@mui/material';
import { AddTask, Autorenew, CloudUpload, ControlPoint, ManageSearch } from '@mui/icons-material';
import { http, useResize, useFormState } from 'gra-react-utils';
import { tableCellClasses } from '@mui/material/TableCell';
import { useDispatch, useSelector } from "react-redux";
import {
  useNavigate
} from "react-router-dom";

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

  const pad = (num, places) => String(num).padStart(places, '0')

  const onChangeAllRow = (event) => {
    if (event.target.checked) {
      const newSelected = result.data.map((row) => toID(row));
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

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
    o.search = '';
  }

  const onClickSearch = async () => {
    if (o.search != '') {
      var data = { data: [] };
      if (networkStatus.connected) {
        const result = await http.get('/historiaclinica/search/' + o.search);
        data.size = result.size;
        data.data = data.data.concat(result.content);
      }
      setResult(data);
    } else {
      dispatch({ type: "snack", msg: 'Ingrese un texto para realizar la búsqueda.', severity: 'warning' });
    }
  }

  const keyPress = (e) => {
    if (e.keyCode == 13) {
      onClickSearch();
    }
  }

  const fetchData = async (page) => {
    var data = { data: [] };
    if (networkStatus.connected) {
      const result = await http.get('/historiaclinica/' + page + '/' + state.rowsPerPage);
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
    dispatch({ type: 'title', title: 'Gestión de Historias Clínicas - GORE Áncash' });
    fetchData(state.page)
  }, [state.page, state.rowsPerPage]);

  const [o, { defaultProps }] = useFormState(useState, {}, {});

  const createOnClick = () => {
    navigate('/paciente/create');
  };

  const editOnClick = () => {
    navigate('/paciente/' + selected[0] + '/edit');
  }

  const atencionOnClick = () => {
    navigate('/historiaclinica/' + selected[0] + '/atencion');
  }

  const uploadOnClick = () => {
    navigate('/historiaclinica/' + selected[0] + '/file');
  }

  const deleteOnClick = () => {
    dispatch({
      type: "confirm", msg: 'Esta seguro de eliminar el registro seleccionado?', cb: (e) => {
        if (e) {
          http.delete('/paciente/' + selected[0]).then((result) => {

            dispatch({ type: 'snack', msg: 'Registro' + (selected.length > 1 ? 's' : '') + ' eliminado!' });
            onClickRefresh();

          });
        }
      }
    });
  };


  const toID = (row) => {
    return row._id && row._id.$oid ? row._id.$oid : row.id;
  }
  return (
    <>
      <Toolbar className="Toolbar-table mt-1" direction="row" >
        <Grid container spacing={2}>
          <Grid item xs={12} md={2}>
            <Button sx={{ width: '100%', fontWeight: 'bold' }} startIcon={<ControlPoint />} onClick={createOnClick} variant="contained" color="primary">Nuevo</Button>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button sx={{ width: '100%', fontWeight: 'bold' }} disabled={!selected.length} startIcon={<AddTask />} onClick={atencionOnClick} variant="contained" color="primary">Atender</Button>
          </Grid>
          <Grid item md={2}>
            <Button sx={{ width: '100%', fontWeight: 'bold' }} disabled={!selected.length} startIcon={<CloudUpload />} onClick={uploadOnClick} variant="contained" color="primary">Archivos</Button>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button sx={{ width: '100%', fontWeight: 'bold' }} disabled={!selected.length} startIcon={<EditIcon />} onClick={editOnClick} variant="contained" color="primary">Editar</Button>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button sx={{ width: '100%', fontWeight: 'bold' }} onClick={onClickRefresh} startIcon={<Autorenew />} variant="contained" color="primary">Actualizar</Button>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button sx={{ width: '100%', fontWeight: 'bold' }} onClick={onClickSearch} startIcon={<ManageSearch />} variant="contained" color="primary">Buscar</Button>
          </Grid>
        </Grid>
      </Toolbar>

      <Grid container>
        <Grid item xs={12} md={12}>
          <TextField
            onKeyDown={keyPress}
            className='p-1'
            margin="normal"
            required
            fullWidth
            size="medium"
            id="standard-name"
            label="Ingrese el texto para realizar la busqueda:"
            placeholder="Historia Clínica / Oficina / Paciente / Nro Documento / Celular / Modalidad de Contrato"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <ManageSearch />
                </InputAdornment>
              ),
            }}
            {...defaultProps("search")}
          />
        </Grid>
      </Grid>

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
                  <StyledTableCell style={{ minWidth: 50, maxWidth: 50 }} className='bg-gore border-table text-table'>Nro Historia Clinica
                    {/* <TextField {...defaultProps('dependencia')} style={{ padding: 0, marginTop: '5px !important' }} /> */}
                  </StyledTableCell>
                  <StyledTableCell style={{ minWidth: 150, maxWidth: 150 }} className='bg-gore border-table text-table'>Oficina
                    {/* <TextField {...defaultProps('dependencia')} style={{ padding: 0, marginTop: '5px !important' }} /> */}
                  </StyledTableCell>
                  <StyledTableCell style={{ minWidth: 150, maxWidth: 150 }} className='bg-gore border-table text-table'>Paciente
                    {/* <TextField {...defaultProps('abreviatura')} style={{ padding: 0, marginTop: '5px !important' }} /> */}
                  </StyledTableCell>
                  <StyledTableCell style={{ minWidth: 50, maxWidth: 50 }} className='bg-gore border-table text-table'>Fecha de Nacimiento
                    {/* <TextField {...defaultProps('abreviatura')} style={{ padding: 0, marginTop: '5px !important' }} /> */}
                  </StyledTableCell>
                  <StyledTableCell style={{ minWidth: 50, maxWidth: 50 }} className='bg-gore border-table text-table'>Tipo Documento
                    {/* <TextField {...defaultProps('nombaperesponsable')} style={{ padding: 0, marginTop: '5px !important' }} /> */}
                  </StyledTableCell>
                  <StyledTableCell style={{ minWidth: 50, maxWidth: 50 }} className='bg-gore border-table text-table'>Nro Documento
                    {/* <TextField {...defaultProps('cargoresponsable')} style={{ padding: 0, marginTop: '5px !important' }} /> */}
                  </StyledTableCell>
                  <StyledTableCell style={{ minWidth: 50, maxWidth: 50 }} className='bg-gore border-table text-table'>Celular
                    {/* <TextField {...defaultProps('cargoresponsable')} style={{ padding: 0, marginTop: '5px !important' }} /> */}
                  </StyledTableCell>
                  <StyledTableCell style={{ minWidth: 100, maxWidth: 100 }} className='bg-gore border-table text-table'>Modalidad/Contrato
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
                        <TableCell style={{ minWidth: 50, maxWidth: 50 }} align="center" className='border-table text-table' >
                          {row.numero}
                        </TableCell>
                        <TableCell style={{ minWidth: 150, maxWidth: 150 }} className='border-table text-table' >
                          {row.paciente.oficina.name}
                        </TableCell>
                        <TableCell style={{ minWidth: 150, maxWidth: 150 }} className='border-table text-table'>
                          {row.paciente.apeNomb}
                        </TableCell>
                        <TableCell style={{ minWidth: 50, maxWidth: 50 }} align="center" className='border-table text-table'>
                          {pad(row.paciente.fechaNacimiento[2], 2)}/{pad(row.paciente.fechaNacimiento[1], 2)}/{row.paciente.fechaNacimiento[0]}
                        </TableCell>
                        <TableCell style={{ minWidth: 50, maxWidth: 50 }} align="center" className='border-table text-table'>
                          {row.paciente.tipoDocumento}
                        </TableCell>
                        <TableCell style={{ minWidth: 50, maxWidth: 50 }} align="center" className='border-table text-table'>
                          {row.paciente.nroDocumento}
                        </TableCell>
                        <TableCell style={{ minWidth: 50, maxWidth: 50 }} align="center" className='border-table text-table'>
                          {row.paciente.celular}
                        </TableCell>
                        <TableCell style={{ minWidth: 100, maxWidth: 100 }} className='border-table text-table'>
                          {row.paciente.modalidadContrato}
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