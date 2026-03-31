# MiDocLink — Panel del Doctor (Next.js)

Panel de gestión médica para doctores, convertido de HTML monolítico a **Next.js 14** con **TypeScript** y **App Router**.

## Estructura del Proyecto

```
midoclink-nextjs/
├── app/
│   ├── globals.css          # Sistema de diseño completo (variables, componentes CSS)
│   ├── layout.tsx            # Root layout con metadata
│   └── page.tsx              # Página principal — orquestador de estado y modales
├── components/
│   ├── layout/
│   │   ├── Topbar.tsx        # Barra superior con navegación, notificaciones, perfil
│   │   └── Sidebar.tsx       # Sidebar con mini-calendario y lista de pacientes
│   ├── ui/
│   │   ├── MiniCalendar.tsx  # Calendario mini interactivo
│   │   ├── Modal.tsx         # Componente modal reutilizable
│   │   └── Toast.tsx         # Notificaciones toast
│   └── views/
│       ├── AgendaView.tsx    # Vista agenda (día/semana)
│       ├── PatientView.tsx   # Ficha paciente con tabs (resumen, citas, historia, tratamiento, exámenes, notas)
│       ├── PatientsView.tsx  # Lista de pacientes con filtros y tabla
│       ├── ReportsView.tsx   # Reportes y estadísticas (KPIs, gráficos, adherencia)
│       ├── ConfigView.tsx    # Configuración (perfil, horarios, notificaciones, etc.)
│       └── NewPatientView.tsx # Registro de nueva paciente (wizard 3 pasos)
├── lib/
│   ├── types.ts              # Tipos TypeScript
│   └── data.ts               # Datos mock (pacientes, citas, ICD-10, etc.)
├── package.json
├── tsconfig.json
└── next.config.js
```

## Instalación y Uso

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Compilar para producción
npm run build

# Servir producción
npm start
```

## Funcionalidades

- **Agenda**: Vista día/semana con citas, estadísticas rápidas
- **Pacientes**: Tabla con filtros, búsqueda, acciones
- **Ficha paciente**: 6 tabs (resumen, citas, historia clínica, tratamiento, exámenes, notas)
- **Búsqueda ICD-10**: Typeahead con base local de códigos
- **Códigos CPT**: Para referencia de aseguradoras
- **Dictado por voz**: Speech-to-text en notas (Chrome)
- **Mini-calendario**: Navegación mensual con indicadores de citas
- **Reportes**: KPIs, gráficos de barras, donut, evolución, adherencia
- **Configuración**: Perfil, horarios, bloqueos, notificaciones, impresión, cuenta, suscripción
- **Registro paciente**: Wizard de 3 pasos con validación
- **Modales**: Nueva cita, exportar, archivar, confirmar asistencia, bloqueos
- **Notificaciones**: Panel desplegable con estados de lectura
- **Toasts**: Confirmaciones de acciones
