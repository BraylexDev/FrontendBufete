import { Routes } from '@angular/router';
import { AdminComponent } from './features/admin/admin.component';
import { RolesComponent } from './features/rol/componentes/roles/roles.component';
import { NewUserComponent } from './features/user/components/new-user/new-user.component';
import { ListUserComponent } from './features/user/components/list-user/list-user.component';
import { LoginComponent } from './features/login/login.component';
import { AgendaComponent } from './features/agenda/components/agenda/agenda.component';
import { ListaPlantillasComponent } from './features/plantilla/components/lista-plantillas/lista-plantillas.component';
import { ListaReportesComponent } from './features/reportes/componentes/lista-reportes/lista-reportes.component';
import { ListarSentenciasComponent } from './features/sentencias/componentes/listar-sentencias/listar-sentencias.component';
import { EditUserComponent } from './features/user/components/edit-user/edit-user.component';
import { HomeComponent } from './features/home/home.component';
import { VerArchivoComponent } from './features/plantilla/components/ver-archivo/ver-archivo.component';
import { EstadisticaComponent } from './features/reportes/componentes/estadisticas/estadistica/estadistica.component';
import { VerDocumentoComponent } from './features/shared/components/ver-documento/ver-documento.component';
import { ConsultarComponent } from './features/client/components/consultar/consultar.component';
import { InfoConsultarComponent } from './features/client/components/info-consultar/info-consultar.component';
import { VerConsultaComponent } from './features/client/components/ver-consulta/ver-consulta.component';
import { ContableComponent } from './features/gestionAdministrativa/contable/contable.component';
import { ConstanciaCarcelariaComponent } from './features/gestionAdministrativa/constancia-carcelaria/constancia-carcelaria.component';
import { loginGuard } from './guards/login/login.guard';
import { authGuard } from './guards/auth/auth.guard';
import { ExpedienteDetailComponent } from './features/reportes/componentes/expedienteDetail/expediente-detail/expediente-detail.component';
import { GestionProcesoComponent } from './features/procesos/gestion-proceso/gestion-proceso';
import { GestionProcesoPenalesCivilesComponent } from './features/procesos/gestion-proceso-penales-civiles/gestion-proceso-penales-civiles';
import { GestionProcesoAdministrativosComponent } from './features/procesos/gestion-proceso-administrativos/gestion-proceso-administrativos';
import { GestionProcesoNuevaComponent } from './features/procesos/gestion-proceso-nueva/gestion-proceso-nueva.component';
import { GestionExpedientesComponent } from './features/expediente/gestion-expedientes/gestion-expedientes.component';

export const routes: Routes = [
    {
        path: 'login',
        loadComponent: () => import('./features/login/login.component')
            .then(m => m.LoginComponent),
        canActivate: [loginGuard]
    },
    {
        path: 'admin', component: AdminComponent,
        children: [
            {
                path: 'home',
                loadComponent: () => import('./features/home/home.component')
                    .then(m => m.HomeComponent),
                canActivate: [authGuard]
            },
            {
                path: 'roles',
                loadComponent: () => import('./features/rol/componentes/roles/roles.component')
                    .then(m => m.RolesComponent),
                canActivate: [authGuard],
                data: { roles: ['ADMIN'] }
            },
            {
                path: 'usuarios',
                loadComponent: () => import('./features/user/components/new-user/new-user.component')
                    .then(m => m.NewUserComponent),
                canActivate: [authGuard],
                data: { roles: ['ADMIN'] }
            },
            {
                path: 'editarUsuario',
                loadComponent: () => import('./features/user/components/edit-user/edit-user.component')
                    .then(m => m.EditUserComponent),
                canActivate: [authGuard],
                data: { roles: ['ADMIN'] }
            },
            {
                path: 'editarUsuario', component: EditUserComponent
            },
            { path: 'listaUsuarios', component: ListUserComponent, canActivate: [authGuard] },
            { path: 'agenda', component: AgendaComponent, canActivate: [authGuard] },
            { path: 'listaPlantilla', component: ListaPlantillasComponent, canActivate: [authGuard] },
            { path: 'listaReporte', component: ListaReportesComponent, canActivate: [authGuard] },
            { path: 'listaSentencia', component: ListarSentenciasComponent, canActivate: [authGuard] },
            { path: 'doc', component: VerArchivoComponent, canActivate: [authGuard] },
            { path: 'estadistica', component: EstadisticaComponent, canActivate: [authGuard] },
            { path: 'ver', component: VerDocumentoComponent, canActivate: [authGuard] },
            { path: 'contable', component: ContableComponent, canActivate: [authGuard] },
            { path: 'carcel', component: ConstanciaCarcelariaComponent, canActivate: [authGuard] },

            {
                path: 'expedientes/:id',
                component: ExpedienteDetailComponent,
                canActivate: [authGuard]
            },
            {
                path: 'expedientes/:id/archivos',
                loadComponent: () => import('./features/reportes/componentes/expedienteDetail/expediente-detail/expediente-detail.component')
                    .then(m => m.ExpedienteDetailComponent),
                canActivate: [authGuard]
            },
            {
                path: 'gestion-procesos-base',
                component: GestionProcesoComponent,
                canActivate: [authGuard]
            },
            {
                path: 'gestion-procesos-penales-civiles',
                component: GestionProcesoPenalesCivilesComponent,
                canActivate: [authGuard]
            },
            {
                path: 'gestion-procesos-administrativos',
                component: GestionProcesoAdministrativosComponent,
                canActivate: [authGuard]
            },
            {
                path: 'gestion-procesos',
                loadComponent: () => import('./features/procesos/gestion-proceso-nueva/gestion-proceso-nueva.component')
                    .then(m => m.GestionProcesoNuevaComponent),
                canActivate: [authGuard]
            },
            {
                path: 'gestion-expedientes',
                component: GestionExpedientesComponent,
                canActivate: [authGuard]
            },
        ]
    },
    {
        path: 'cliente', component: ConsultarComponent
    },
    {
        path: 'consulta', component: InfoConsultarComponent
    },
    { path: 'view', component: VerConsultaComponent },
    {
        path: '',
        redirectTo: '/admin/home',
        pathMatch: 'full'
    },
    {
        path: '**',
        redirectTo: '/admin/home'
    }

];
