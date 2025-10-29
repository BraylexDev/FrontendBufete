export interface NavigationItem {
  id: string;
  title: string;
  type: 'item' | 'collapse' | 'group';
  translate?: string;
  icon?: string;
  hidden?: boolean;
  url?: string;
  classes?: string;
  exactMatch?: boolean;
  external?: boolean;
  target?: boolean;
  breadcrumbs?: boolean;
  badge?: {
    title?: string;
    type?: string;
  };
  children?: NavigationItem[];
  roles?: string[];
}

export const NavigationItems: NavigationItem[] = [
  {
    id: 'users',
    title: '',
    type: 'group',
    icon: 'icon-group',
    children: [
      {
        id: 'dashboard',
        title: 'Home',
        type: 'item',
        url: '/admin/home',
        icon: 'feather icon-home',
        breadcrumbs: false
      },/* 
      {
        id: 'perfil',
        title: 'Perfil',
        type: 'item',
        url: '/admin/perfil',
        icon: 'feather icon-user'
      }, */
    ]
  },
  {
    id: 'users',
    title: 'Gestión',
    type: 'group',
    icon: 'icon-group',
    children: [
      {
        id: 'usuarios',
        title: 'Usuarios',
        type: 'collapse',
        icon: 'feather icon-users',
        roles: ['ADMIN'],
        children: [
          {
            id: 'crear-usuarios',
            title: 'Crear usuario',
            type: 'item',
            url: '/admin/usuarios',
            icon: 'feather icon-user-plus'
          },
          {
            id: 'crear-usuarios',
            title: 'Editar usuario',
            type: 'item',
            hidden: true,
            url: '/admin/editarUsuario',
            icon: 'feather icon-edit'
          },
          {
            id: 'listar-usuarios',
            title: 'Usuarios Registrados',
            type: 'item',
            url: '/admin/listaUsuarios',
            icon: 'feather icon-users'
          },
        ]
      },
      {
        id: 'dashboard',
        title: 'Roles',
        type: 'item',
        url: '/admin/roles',
        icon: 'feather icon-bookmark',
        roles: ['ADMIN'],
      },
      {
        id: 'dashboard',
        title: 'Calendario Jurídico',
        type: 'item',
        url: '/admin/agenda',
        icon: 'feather icon-calendar'
      },
      {
        id: 'dashboard',
        title: 'Plantillas Jurídicas',
        type: 'item',
        url: '/admin/listaPlantilla',
        icon: 'feather icon-file-text'
      },
      {
        id: 'sentencias',
        title: 'Gestión de Procesos',
        type: 'collapse',
        icon: 'feather icon-cpu',
        children: [
          {
            id: 'dashboard',
            title: 'Procesos Registrados',
            type: 'item',
            url: '/admin/listaReporte',
            icon: 'feather icon-layers'
          },
          {
            id: 'dashboard',
            title: 'Ver Documento',
            type: 'item',
            hidden: true,
            url: '/admin/ver',
            icon: 'feather icon-home',
          }
        ]
      },
      {
        id: 'sentencias',
        title: 'Sentencias',
        type: 'collapse',
        icon: 'feather icon-layers',
        children: [
          {
            id: 'crear-usuarios',
            title: 'Sentencias Registradas',
            type: 'item',
            url: '/admin/listaSentencia',
            icon: 'feather icon-file-text'
          },/* 
          {
            id: 'Estadísticas',
            title: 'Estadísticas',
            type: 'item',
            url: '/admin/expediente',
            icon: 'feather icon-bar-chart-2'
          }, */
          {
            id: 'dashboard',
            title: 'Ver Documento',
            type: 'item',
            hidden: true,
            url: '/admin/ver',
            icon: 'feather icon-home',
          }
        ]
      },
      {
        id: 'sentencias',
        title: 'Administrativa',
        type: 'collapse',
        icon: 'feather icon-book',
        children: [
          {
            id: 'crear-usuarios',
            title: 'Constancia Visitas Carcelarias',
            type: 'item',
            url: '/admin/carcel',
            icon: 'feather icon-file-text'
          },
          {
            id: 'dashboard',
            title: 'Contabilidad',
            type: 'item',
            url: '/admin/contable',
            icon: 'feather icon-briefcase'
          },
          /* {
            id: 'crear-usuarios',
            title: 'Constancia Acciones Legales',
            type: 'item',
            url: '/admin/listaSentencia',
            icon: 'feather icon-file-text'
          },
          {
            id: 'crear-usuarios',
            title: 'Solicitudes Reduccion de Pena',
            type: 'item',
            url: '/admin/listaSentencia',
            icon: 'feather icon-file-text'
          },
          {
            id: 'dashboard',
            title: 'Contratos',
            type: 'item',
            url: '/admin/ver',
            icon: 'feather icon-home',
          } */
        ]
      },
    ]
  }
];
