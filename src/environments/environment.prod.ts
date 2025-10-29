import packageInfo from '../../package.json';

export const environment = {
  appVersion: packageInfo.version,
  production: true,
  apiUrl: 'https://bufete-abogados.onrender.com/api',
  apiUrlEventos: 'https://bufete-abogados.onrender.com/assets/datas/eventos.json',
  apiUrlPermisos: 'https://bufete-abogados.onrender.com/assets/datas/permisos.json',
  apiUrlUser: 'https://bufete-abogados.onrender.com/assets/datas/users.json',
  apiUrlRoles: 'https://bufete-abogados.onrender.com/assets/datas/roles.json'
};