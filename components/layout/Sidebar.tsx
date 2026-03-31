'use client';
import { PATIENTS } from '@/lib/data';
import MiniCalendar from '@/components/ui/MiniCalendar';

interface SidebarProps {
  activePatientId: string;
  onPatientSelect: (id: string) => void;
}

export default function Sidebar({ activePatientId, onPatientSelect }: SidebarProps) {
  return (
    <div className="sidebar">
      <div className="sidebar-section">
        <div className="sidebar-label">Calendario</div>
        <MiniCalendar />
      </div>
      <div className="sidebar-section">
        <div className="sidebar-label">Pacientes de hoy</div>
      </div>
      <div className="patient-list">
        {PATIENTS.map(p => (
          <div
            key={p.id}
            className={`patient-item${activePatientId === p.id ? ' active' : ''}`}
            onClick={() => onPatientSelect(p.id)}
          >
            <div className="p-av" style={{ background: p.bgColor, color: p.textColor }}>{p.initials}</div>
            <div className="p-info">
              <div className="p-name">{p.name}</div>
              <div className="p-meta">{p.age} años · {p.nextAppt.replace('Hoy ', '')}</div>
            </div>
            {p.hasAlert && <div className="p-alert" style={p.alertType === 'red' ? { background: 'var(--rojo)' } : undefined}></div>}
          </div>
        ))}
      </div>
    </div>
  );
}
