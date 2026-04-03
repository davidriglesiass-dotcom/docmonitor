import { Patient, Treatment, Appointment, WeekDay, Notification, Bloqueo, ICDCode, AdherenciaItem } from './types';

export const PATIENTS: Patient[] = [
  { id: 'monica', name: 'Mónica Varela', initials: 'MV', age: 51, dob: '1974-08-12', gender: 'femenino', email: 'monica.v@email.com', phone: '+507 6XXX-XXXX', bgColor: '#EBF1FB', textColor: '#1B3A6B', condition: 'Perimenopausia', lastVisit: 'Feb 24', nextAppt: 'Hoy 9:00 AM', status: 'active', hasAlert: true, alertType: 'red' },
  { id: 'rosa', name: 'Rosa Pérez', initials: 'RP', age: 44, dob: '1981-03-22', gender: 'femenino', email: 'rosa.p@email.com', phone: '+507 6XXX-XXXX', bgColor: '#E0F5F2', textColor: '#0E8A7A', condition: 'Control hormonal', lastVisit: 'Mar 10', nextAppt: 'Hoy 10:30 AM', status: 'active' },
  { id: 'carmen', name: 'Carmen López', initials: 'CL', age: 38, dob: '1987-11-05', gender: 'femenino', email: 'carmen.l@email.com', phone: '+507 6XXX-XXXX', bgColor: '#FEF3C7', textColor: '#D97706', condition: 'Primera consulta', lastVisit: '—', nextAppt: 'Hoy 12:00 PM', status: 'pending' },
  { id: 'lucia', name: 'Lucía Morales', initials: 'LM', age: 56, dob: '1969-06-18', gender: 'femenino', email: 'lucia.m@email.com', phone: '+507 6XXX-XXXX', bgColor: '#EBF1FB', textColor: '#1B3A6B', condition: 'Revisión exámenes', lastVisit: 'Feb 15', nextAppt: 'Hoy 2:00 PM', status: 'active', hasAlert: true, alertType: 'amber' },
  { id: 'ana', name: 'Ana García', initials: 'AG', age: 29, dob: '1996-01-30', gender: 'femenino', email: 'ana.g@email.com', phone: '+507 6XXX-XXXX', bgColor: '#FDEAEA', textColor: '#C0392B', condition: 'Urgencia pélvica', lastVisit: 'Mar 1', nextAppt: 'Hoy 3:30 PM', status: 'pending', hasAlert: true, alertType: 'red' },
];

// Indicaciones con frecuencia y duración estructuradas
export const TREATMENTS: Treatment[] = [
  {
    id: 1,
    descripcion: 'Amitriptilina 25mg',
    dosis: '1 pastilla',
    frecuencia: 1,
    frecuencia_unidad: 'dia',
    duracion: 0,
    duracion_unidad: 'indefinido',
    horas: ['22:00'],
    notas: 'Tomar antes de dormir',
    done: false,
  },
  {
    id: 2,
    descripcion: 'Angeliq',
    dosis: '1 pastilla',
    frecuencia: 1,
    frecuencia_unidad: 'dia',
    duracion: 0,
    duracion_unidad: 'indefinido',
    horas: ['08:00'],
    notas: 'Tomar en ayunas',
    done: false,
  },
  {
    id: 3,
    descripcion: 'Eliminar cigarro',
    dosis: '—',
    frecuencia: 1,
    frecuencia_unidad: 'dia',
    duracion: 0,
    duracion_unidad: 'indefinido',
    horas: [],
    notas: 'Hábito a eliminar',
    done: false,
  },
];

export const APPOINTMENTS: Appointment[] = [
  { time: '9:00 AM', duration: '45 min', patientId: 'monica', patientName: 'Mónica Varela', reason: 'Seguimiento menopausia · 51 años', type: 'urgent', badges: [{ label: '✓ Confirmada', color: 'var(--teal)', textColor: '#fff' }, { label: '⚠ Síntomas nuevos', color: 'var(--rojo)', textColor: '#fff' }], slot: 1 },
  { time: '10:30 AM', duration: '30 min', patientId: 'rosa', patientName: 'Rosa Pérez', reason: 'Control hormonal · 44 años', type: 'confirmed', badges: [{ label: 'Seguimiento', color: 'var(--gris-500)', textColor: '#fff' }], slot: 2 },
  { time: '12:00 PM', duration: '30 min', patientId: 'carmen', patientName: 'Carmen López', reason: 'Primera consulta · 38 años', type: 'confirmed', badges: [{ label: 'Nueva paciente', color: 'var(--azul)', textColor: '#fff' }], slot: 4 },
  { time: '2:00 PM', duration: '45 min', patientId: 'lucia', patientName: 'Lucía Morales', reason: 'Revisión exámenes · 56 años', type: 'pending', badges: [{ label: '⏳ Por confirmar', color: 'var(--amber)', textColor: '#fff' }], slot: 6 },
  { time: '3:30 PM', duration: '30 min', patientId: 'ana', patientName: 'Ana García', reason: 'Urgencia · dolor pélvico · 29 años', type: 'urgent', badges: [{ label: '🔴 Urgente', color: 'var(--rojo)', textColor: '#fff' }], slot: 7 },
];

export const WEEK_DATA: WeekDay[] = [
  { label: 'Lun 16 Mar', isToday: false, citas: [{ time: '9:00', name: 'Ana Ruiz', type: 'Seguimiento', color: 'var(--teal)', alert: false, patientId: 'ana' }, { time: '11:00', name: 'Carmen López', type: 'Control', color: 'var(--azul)', alert: false, patientId: 'carmen' }] },
  { label: 'Mar 17 Mar', isToday: false, citas: [{ time: '8:30', name: 'Mónica Varela', type: 'Urgencia', color: 'var(--rojo)', alert: true, patientId: 'monica' }, { time: '10:00', name: 'Rosa Pérez', type: 'Seguimiento', color: 'var(--teal)', alert: false, patientId: 'rosa' }] },
  { label: 'Mié 18 Mar', isToday: false, citas: [{ time: '9:00', name: 'Patricia Torres', type: 'Primera consulta', color: 'var(--azul)', alert: false, patientId: 'patricia' }] },
  { label: 'Jue 19 Mar', isToday: true, citas: [{ time: '9:00', name: 'Mónica Varela', type: 'Seguimiento', color: 'var(--rojo)', alert: true, patientId: 'monica' }, { time: '10:30', name: 'Rosa Pérez', type: 'Control hormonal', color: 'var(--teal)', alert: false, patientId: 'rosa' }, { time: '12:00', name: 'Carmen López', type: 'Primera consulta', color: 'var(--azul)', alert: false, patientId: 'carmen' }, { time: '2:00 PM', name: 'Lucía Morales', type: 'Rev. exámenes', color: 'var(--amber)', alert: false, patientId: 'lucia' }, { time: '3:30 PM', name: 'Ana García', type: 'Urgencia', color: 'var(--rojo)', alert: true, patientId: 'ana' }] },
  { label: 'Vie 20 Mar', isToday: false, citas: [{ time: '9:00', name: 'María Sánchez', type: 'Seguimiento', color: 'var(--teal)', alert: false, patientId: 'maria' }] },
];

export const NOTIFICATIONS: Notification[] = [
  { id: '1', icon: '🔴', iconBg: 'var(--rojo-light)', boldName: 'Mónica Varela', text: 'reportó mareos', time: 'Hoy, 8:50 AM', unread: true, patientId: 'monica' },
  { id: '2', icon: '📎', iconBg: 'var(--teal-light)', boldName: 'Mónica Varela', text: 'subió un examen', time: 'Hoy, 7:00 AM', unread: true, patientId: 'monica' },
  { id: '3', icon: '💬', iconBg: 'var(--amber-light)', boldName: 'Lucía Morales', text: 'respondió su diario', time: 'Ayer, 9:30 PM', unread: true, patientId: 'lucia' },
  { id: '4', icon: '✅', iconBg: 'var(--verde-light)', boldName: 'Ana García', text: 'marcó indicación cumplida', time: 'Ayer, 6:15 PM', unread: false, patientId: 'ana' },
];

export const INITIAL_BLOQUEOS: Bloqueo[] = [
  { tipo: 'vacacion', label: 'Semana Santa', ini: '2026-04-01', fin: '2026-04-05' },
  { tipo: 'horario', label: 'Almuerzo diario', ini: '2026-03-19', fin: '2026-03-19' },
];

export const ICD_LOCAL: ICDCode[] = [
  { code: 'N95.1', desc: 'Menopausia · estado natural' },
  { code: 'N95.0', desc: 'Menopausia · con síntomas' },
  { code: 'E11.9', desc: 'Diabetes mellitus tipo 2' },
  { code: 'I10', desc: 'Hipertensión esencial' },
  { code: 'G43.9', desc: 'Migraña · sin especificar' },
  { code: 'N92.0', desc: 'Menstruación irregular' },
  { code: 'E03.9', desc: 'Hipotiroidismo' },
  { code: 'J06.9', desc: 'Infección vías respiratorias' },
  { code: 'K29.5', desc: 'Gastritis crónica' },
  { code: 'F41.1', desc: 'Trastorno de ansiedad' },
  { code: 'F32.9', desc: 'Episodio depresivo' },
  { code: 'M54.5', desc: 'Lumbalgia' },
  { code: 'K21.0', desc: 'Reflujo gastroesofágico' },
  { code: 'J45.9', desc: 'Asma' },
  { code: 'E78.5', desc: 'Hiperlipidemia' },
  { code: 'Z34.0', desc: 'Embarazo normal' },
  { code: 'N81.0', desc: 'Cistocele' },
  { code: 'N80.0', desc: 'Endometriosis del útero' },
  { code: 'O80', desc: 'Parto único espontáneo' },
  { code: 'N91.2', desc: 'Amenorrea' },
];

export const ADH_DATA: AdherenciaItem[] = [
  { name: 'Mónica Varela', initials: 'MV', bg: '#EBF1FB', textColor: '#1B3A6B', pct: 45, detail: '3 de 7 indicaciones' },
  { name: 'Rosa Pérez', initials: 'RP', bg: '#E0F5F2', textColor: '#0E8A7A', pct: 80, detail: '4 de 5 indicaciones' },
  { name: 'Lucía Morales', initials: 'LM', bg: '#EBF1FB', textColor: '#1B3A6B', pct: 60, detail: '3 de 5 indicaciones' },
  { name: 'Ana García', initials: 'AG', bg: '#FDEAEA', textColor: '#C0392B', pct: 20, detail: '1 de 5 indicaciones' },
  { name: 'María Sánchez', initials: 'MS', bg: '#E0F5F2', textColor: '#0E8A7A', pct: 90, detail: '9 de 10 indicaciones' },
];

export const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
export const APT_DAYS: Record<number, number[]> = { 2: [3, 4, 6, 10, 11, 13, 17, 18, 19, 20, 24, 25, 27] };
export const TIME_SLOTS = ['8 AM', '9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM'];
