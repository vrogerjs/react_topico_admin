import React, { useEffect } from 'react';
import {
  Mail as MailIcon,
  Menu as MenuIcon,
  InsertChart as ChartIcon,
  Map as MapIcon,
  Add as AddIcon,
  Quiz as QuizIcon,
  Logout as LogoutIcon,
  Group as GroupIcon,
  AccountCircle as AccountCircleIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import {
  Alert, AppBar, Box, CssBaseline, Drawer, Divider, IconButton, List, ListItem,
  ListItemButton, ListItemIcon, ListItemText, Snackbar, Toolbar,
  Typography
} from '@mui/material';
import { debounce } from 'gra-react-utils';
import lazyLoader from "./utils/LazyLoader";

import {
  Routes,
  Route, useLocation,
  useNavigate
} from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

function VDrawer(props) {
  const dispatch = useDispatch();

  const onClose = () => { dispatch({ type: "drawer" }) };
  const drawer = useSelector((state) => state.drawer);
  return <Drawer variant="temporary"
    open={drawer}
    onClose={onClose}
    ModalProps={{
      keepMounted: true, // Better open performance on mobile.
    }}
    sx={{
      display: { xs: 'block', sm: 'none' },
      '& .MuiDrawer-paper': { boxSizing: 'border-box', width: props.width },
    }}>
    {props.children}
  </Drawer>
}

function VSnackbar() {
  const snack = useSelector((state) => state.snack);

  const dispatch = useDispatch();

  const onClose = () => { dispatch({ type: "snack" }) };

  return <Snackbar open={!!snack}
    sx={{ bottom: 70 }}
    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    autoHideDuration={2000} onClose={onClose}>
    {<Alert severity={snack && snack.severity || "success"} variant="filled" onClose={onClose} sx={{ width: '100%' }}>
      {snack ? snack.msg : ''}
    </Alert>
    }
  </Snackbar>;
}

function VAppBar(props) {

  const networkStatus = useSelector((state) => state.networkStatus);

  return <AppBar style={{ 'background': networkStatus.connected ? '' : 'red' }} {...props}
    position="fixed"
  >{props.children}</AppBar>;

}

const HomePage = ({ logOut, match }) => {

  const setO = React.useState({ title: 'Cuestionarios Discapacidad' })[1];

  const [perms, setPerms] = React.useState([]);

  const dispatch = useDispatch();

  const title = useSelector((state) => state.title);

  const handleDrawerToggle = () => {
    dispatch({ type: 'drawer' });
  };

  const items = [
    {
      perms: 'DISABLED_REGISTER', text: 'Gestión de Oficinas', icon: <QuizIcon />, path: '/oficina', items: [
        { text: 'Agregar', icon: <AddIcon />, path: '/oficina/create' }
      ]
    },
    {
      perms: 'DISABLED_REGISTER', text: 'Gestión de Pacientes', icon: <QuizIcon />, path: '/paciente', items: [
        { text: 'Agregar', icon: <AddIcon />, path: '/paciente/create' }
      ]
    },
    {
      perms: 'DISABLED_REGISTER', text: 'Historia Clinica', icon: <QuizIcon />, path: '/historiaclinica', items: [
        { text: 'Agregar', icon: <AddIcon />, path: '/historiaclinica/create' }
      ]
    },
    {
      perms: 'DISABLED_REGISTER', text: 'Atención Psicologica', icon: <QuizIcon />, path: '/psicologica', items: [
        { text: 'Agregar', icon: <AddIcon />, path: '/psicologica/create' }
      ]
    },
    {
      text: 'Salir', icon: <LogoutIcon />, onClick: () => {
        logOut();
      }
    }
  ]

  const drawer = (
    <div className='bg-gore'>
      <Toolbar>
        <Box
          component="img"
          sx={{
            width: 150,
            marginBottom: 2,
            // maxHeight: { xs: 233, md: 167 },
            // maxWidth: { xs: 350, md: 250 },
          }}
          alt="Logo GORE Áncash."
          src={process.env.PUBLIC_URL + "/logo2018.png"}
          />
      </Toolbar>
      <Divider />
      <List className='sidebar-gore'>
        {items.filter((e) => {
          return e.perms ? perms.includes(e.perms) : true;
        }).map((item, index0) => (
          <React.Fragment key={'List_' + index0} >
            <ListItem>
              <ListItemButton onClick={item.onClick ? item.onClick : () => {
                handleDrawerToggle();
                navigate(item.path);
              }}>
                <ListItemIcon>
                  {item.icon || <MailIcon />}
                </ListItemIcon>
                <ListItemText primary={item.text} />

              </ListItemButton>
            </ListItem>
            {item.items?.map((item, index) => (
              <ListItem key={'List_' + index0 + '_' + index} disablePadding style={{ paddingLeft: '40px' }}>
                <ListItemButton onClick={item.onClick ? item.onClick : () => {
                  handleDrawerToggle();
                  navigate(item.path);
                }}>
                  <ListItemIcon>
                    {item.icon || <MailIcon />}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />

                </ListItemButton>
              </ListItem>
            ))}

          </React.Fragment>
        ))}
      </List>
    </div>
  );

  let location = useLocation();

  useEffect(() => {
    try {
      var s = localStorage.getItem("perms");
      if (s) {
        s = JSON.parse(s);
        setPerms(s);
      }
    } catch (e) {
      console.log(e);
    }
  }, []);

  const formRef = React.createRef();

  useEffect(() => {
    const debouncedHandleResize = debounce((width, height) => {
      const header = document.querySelector('.MuiToolbar-root');
      const body = formRef.current;
      if (body)
        body.style.height = (height - header.offsetHeight * 0) + 'px';
    });
    debouncedHandleResize();
    window.addEventListener('resize', debouncedHandleResize)
    return _ => {
      window.removeEventListener('resize', debouncedHandleResize)
    }
  }, [location, formRef]);

  const drawerWidth = 240;

  let navigate = useNavigate();

  const ChartPanel = lazyLoader(() => import('./screens/Charts'));

  const MapPanel = lazyLoader(() => import('./screens/Map'));


  // Paciente
  const PacienteList = lazyLoader(() => import('./screens/paciente/List'));
  const PacienteForm = lazyLoader(() => import('./screens/paciente/Form')
    .then(module => ({ default: module.Form }))
  );

  // Oficina
  const OficinaList = lazyLoader(() => import('./screens/oficina/List'));
  const OficinaForm = lazyLoader(() => import('./screens/oficina/Form')
    .then(module => ({ default: module.Form }))
  );

  // Historia Clinica
  const HistoriaclinicaList = lazyLoader(() => import('./screens/historiaclinica/List'));
  const HistoriaclinicaListatencion = lazyLoader(() => import('./screens/historiaclinica/Listatencion'));
  const HistoriaclinicaForm = lazyLoader(() => import('./screens/historiaclinica/Form')
    .then(module => ({ default: module.Form }))
  );
  const HistoriaclinicaFormatencion = lazyLoader(() => import('./screens/historiaclinica/Formatencion')
    .then(module => ({ default: module.Form }))
  );


  // Reporte Ficha Medica
  const HistoriaclinicaFormview = lazyLoader(() => import('./screens/historiaclinica/Formview').then(module => ({ default: module.Form }))
  );

  // Atención Psicologica
  const PsicologicaList = lazyLoader(() => import('./screens/psicologica/List'));
  const PsicologicaListatencion = lazyLoader(() => import('./screens/psicologica/Listatencion'));
  const PsicologicaForm = lazyLoader(() => import('./screens/psicologica/Form')
    .then(module => ({ default: module.Form }))
  );
  const PsicologicaFormatencion = lazyLoader(() => import('./screens/psicologica/Formatencion')
    .then(module => ({ default: module.Form }))
  );

  // Reporte Ficha Psicologica
  const PsicologicaFormview = lazyLoader(() => import('./screens/psicologica/Formview').then(module => ({ default: module.Form }))
  );

  //Upload File
  const HistoriaclinicaListfile = lazyLoader(() => import('./screens/historiaclinica/Listfile'));
  const HistoriaclinicaFormfile = lazyLoader(() => import('./screens/historiaclinica/Formfile')
    .then(module => ({ default: module.Form }))
  );

  const UserList = lazyLoader(() => import('./screens/user/List'));

  const UserForm = lazyLoader(() => import('./screens/user/Form')
    .then(module => ({ default: module.Form }))
  );

  const ProfileForm = lazyLoader(() => import('./screens/Profile')
    .then(module => ({ default: module.Form }))
  );

  const SettingForm = lazyLoader(() => import('./screens/Setting')
    .then(module => ({ default: module.Form }))
  );


  return (
    <Box
      sx={{ display: 'flex' }}>
      <CssBaseline />
      <VAppBar
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            {title}
          </Typography>
        </Toolbar>
      </VAppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        <VDrawer

          onClose={handleDrawerToggle}
          width={drawerWidth}
        >
          {drawer}
        </VDrawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box ref={formRef}
        component="main"
        sx={{ flexGrow: 1, width: { sm: `calc(100% - ${drawerWidth}px)` } }}
      >
        <Toolbar className="_" />
        <Routes>

          {/* Paciente */}
          <Route path={`/paciente`} element={<PacienteList setO={setO} />} />
          <Route path={`/paciente/create`} element={<PacienteForm />} />
          <Route path={`/paciente/:pid/edit`} element={<PacienteForm />} />

          {/* Oficina */}
          <Route path={`/oficina`} element={<OficinaList setO={setO} />} />
          <Route path={`/oficina/create`} element={<OficinaForm />} />
          <Route path={`/oficina/:pid/edit`} element={<OficinaForm />} />

          {/* Historia Clinica */}
          <Route path={`/historiaclinica`} element={<HistoriaclinicaList setO={setO} />} />
          <Route path={`/historiaclinica/create`} element={<HistoriaclinicaForm />} />
          <Route path={`/historiaclinica/:pid/edit`} element={<HistoriaclinicaForm />} />
          <Route path={`/historiaclinica/:pid/atencion`} element={<HistoriaclinicaListatencion />} />

          <Route path={`/historiaclinica/atencion/create/:pid/:temp`} element={<HistoriaclinicaFormatencion />} />
          <Route path={`/historiaclinica/atencion/:pid/edit/:temp`} element={<HistoriaclinicaFormatencion />} />

          {/* Examenes Complementarios */}
          <Route path={`/atencion/:aid/file`} element={<HistoriaclinicaListfile />} />
          <Route path={`/atencion/file/create/:aid/:temp`} element={<HistoriaclinicaFormfile />} />
          <Route path={`/atencion/file/:fid/edit/:temp`} element={<HistoriaclinicaFormfile />} />


          {/* Reporte de Atención Medica */}
          <Route path={`/historiaclinica/atencion/:pid`} element={<HistoriaclinicaFormview />} />

          {/* Atencion Psicologica */}
          <Route path={`/psicologica`} element={<PsicologicaList setO={setO} />} />
          <Route path={`/psicologica/create`} element={<PsicologicaForm />} />
          <Route path={`/psicologica/:pid/edit`} element={<PsicologicaForm />} />
          <Route path={`/psicologica/:pid/atencion`} element={<PsicologicaListatencion />} />

          <Route path={`/psicologica/atencion/create/:pid/:temp`} element={<PsicologicaFormatencion />} />
          <Route path={`/psicologica/atencion/:pid/edit/:temp`} element={<PsicologicaFormatencion />} />

          {/* Reporte de Atención Psicologica */}
          <Route path={`/psicologica/atencion/:pid`} element={<PsicologicaFormview />} />

          <Route path={`/user`} element={<UserList setO={setO} />} />
          <Route path={`/user/create`} element={<UserForm />} />
          <Route path={`/user/:uid/edit`} element={<UserForm />} />
          <Route path={`/charts`} element={<ChartPanel />} />
          <Route path={`/map`} element={<MapPanel />} />
          <Route path={`/setting`} element={<SettingForm />} />
          <Route path={`/profile`} element={<ProfileForm />} />
        </Routes>
      </Box>

      <VSnackbar />
    </Box>
  );

};

export default HomePage;