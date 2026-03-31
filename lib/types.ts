export interface Patient {
  id: string;
  name: string;
  initials: string;
  age: number;
  email: string;
  phone: string;
  bgColor: string;
  textColor: string;
  condition: string;
  lastVisit: string;
  nextAppt: string;
  status: 'active' | 'pending' | 'inactive';
  hasAlert?: boolean;
  alertType?: 'amber' | 'red';
}

export interface Appointment {
  time: string;
  duration: string;
  patientId: string;
  patientName: string;
  reason: string;
  type: 'confirmed' | 'pending' | 'urgent';
  badges: { label: string; color: string; textColor: string }[];
  slot: number; // 0-indexed from 8AM
}

export interface WeekDay {
  label: string;
  isToday: boolean;
  citas: {
    time: string;
    name: string;
    type: string;
    color: string;
    alert: boolean;
    patientId: string;
  }[];
}

export interface Notification {
  id: string;
  icon: string;
  iconBg: string;
  text: string;
  boldName: string;
  time: string;
  unread: boolean;
  patientId: string;
}

export interface Bloqueo {
  tipo: 'vacacion' | 'horario';
  label: string;
  ini: string;
  fin: string;
}

export interface ICDCode {
  code: string;
  desc: string;
}

export interface AdherenciaItem {
  name: string;
  initials: string;
  bg: string;
  textColor: string;
  pct: number;
  detail: string;
}

export type ViewName = 'agenda' | 'paciente' | 'pacientes' | 'reportes' | 'config' | 'nueva-paciente';
export type PatientTab = 'resumen' | 'citas' | 'historia' | 'tratamiento' | 'examenes' | 'notas';
export type ConfigSection = 'perfil' | 'horarios' | 'notificaciones' | 'impresion' | 'cuenta' | 'suscripcion';
export type AgendaMode = 'dia' | 'semana';
