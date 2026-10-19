import packageInfo from '../../package.json';

export const environment = {
  appVersion: packageInfo.version,
  production: true,
  /* apiUrl: 'https://backendbufete-docker.onrender.com/api', */
  apiUrl: 'https://api.rhgestion.com/api',
  /* apiUrl: 'http://localhost:8080/api', */
};