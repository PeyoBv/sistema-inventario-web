# ✨ Sistema de Inventario

- URL de prueba : https://sistema-inventario-web-ten.vercel.app/

Sistema completo de gestión de inventario con control de acceso basado en roles, seguimiento de artículos, gestión de ubicaciones y registro completo de movimientos para operaciones de almacén.

## � Características

- ✅ Sistema de autenticación con control de acceso basado en roles
- ✅ Gestión completa de inventario (CRUD)
- ✅ Gestión de ubicaciones de almacén
- ✅ Registro de movimientos (entrada, salida, ajuste)
- ✅ Historial completo de auditoría
- ✅ Gestión de usuarios (solo admin)
- ✅ Sistema de notas y advertencias
- ✅ Generación de reportes PDF
- ✅ Prevención de stock negativo
- ✅ Diseño responsive para móvil y escritorio
- ✅ Tema claro/oscuro

## �🔐 Credenciales de Acceso

El sistema se inicializa automáticamente con los siguientes usuarios:

### Administrador
- **Usuario**: `admin`
- **Contraseña**: `admin123`
- **Permisos**: Acceso completo - gestión de usuarios, inventario, ubicaciones y movimientos

### Bodeguero
- **Usuario**: `bodeguero`
- **Contraseña**: `bodega123`
- **Permisos**: Gestión de inventario, ubicaciones y movimientos (sin acceso a gestión de usuarios)

### Usuario
- **Usuario**: `usuario`
- **Contraseña**: `user123`
- **Permisos**: Solo lectura del inventario

## � Requisitos Previos

- Node.js 18.x o superior
- npm o yarn

## 🛠️ Instalación

1. Clona el repositorio:
```bash
git clone https://github.com/PeyoBv/sistema-inventario-web.git
cd sistema-inventario-web
```

2. Instala las dependencias:
```bash
npm install
```

3. Inicia el servidor de desarrollo:
```bash
npm run dev
```

4. Abre tu navegador en `http://localhost:5173`

## 📦 Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run preview` - Vista previa de la build de producción
- `npm run lint` - Ejecuta el linter

## 🧠 Roles y Permisos

- **Admin**: Control total del sistema
  - Gestión de usuarios
  - Gestión de inventario
  - Gestión de ubicaciones
  - Registro de movimientos
  - Revisión de notas y advertencias

- **Bodeguero**: Gestión operativa
  - Gestión de inventario
  - Gestión de ubicaciones
  - Registro de movimientos
  - Revisión de notas y advertencias

- **Usuario**: Solo lectura
  - Consulta de inventario
  - Crear notas y advertencias

## 🗄️ Almacenamiento de Datos

El sistema utiliza `localStorage` del navegador para persistir los datos. Los datos se almacenan localmente en tu navegador y no requieren conexión a servidor.

## 🎨 Tecnologías Utilizadas

- **React 19** - Framework frontend
- **TypeScript** - Tipado estático
- **Vite** - Build tool y dev server
- **Tailwind CSS 4** - Estilos
- **Radix UI** - Componentes de UI
- **Phosphor Icons** - Iconos
- **jsPDF** - Generación de PDFs
- **Sonner** - Notificaciones toast

## 📄 Licencia

MIT License

