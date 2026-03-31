'use client';
import { useState } from 'react';
import { APPOINTMENTS, WEEK_DATA, TIME_SLOTS } from '@/lib/data';
import { AgendaMode } from '@/lib/types';

interface AgendaViewProps {
  onPatientSelect: (id: string) => void;
  onOpenModal: (id: string) => void;
}

export default function AgendaView({ onPatientSelect, onOpenModal }: AgendaViewProps) {
  const [mode, setMode] = useState<AgendaMode>('dia');

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Jueves, 19 de Marzo</div>
          <div className="page-subtitle">5 citas · 2 alertas activas</div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div className="vt-wrap">
            <button className={`vt-btn${mode === 'dia' ? ' active' : ''}`} onClick={() => setMode('dia')}>Día</button>
            <button className={`vt-btn${mode === 'semana' ? ' active' : ''}`} onClick={() => setMode('semana')}>Semana</button>
          </div>
          <button className="btn-secondary" onClick={() => onOpenModal('cita')}>+ Nueva cita</button>
          <button className="btn-primary" onClick={() => onOpenModal('exportar')}>📤 Exportar</button>
        </div>
      </div>

      {mode === 'dia' && (
        <div>
          <div className="stats-row">
            <div className="stat-card"><div className="stat-val">5</div><div className="stat-lbl">Citas hoy</div></div>
            <div className="stat-card"><div className="stat-val" style={{ color: 'var(--amber)' }}>2</div><div className="stat-lbl">Alertas</div></div>
            <div className="stat-card"><div className="stat-val" style={{ color: 'var(--teal)' }}>3</div><div className="stat-lbl">Confirmadas</div></div>
            <div className="stat-card"><div className="stat-val">18</div><div className="stat-lbl">Pacientes mes</div></div>
          </div>
          <div className="agenda-grid">
            <div className="time-col">
              {TIME_SLOTS.map(t => <div key={t} className="time-slot">{t}</div>)}
            </div>
            <div className="apt-col">
              {TIME_SLOTS.map((_, i) => {
                const apt = APPOINTMENTS.find(a => a.slot === i);
                if (apt) {
                  return (
                    <div key={i} className="apt-slot has-apt">
                      <div className={`apt-block ${apt.type}`} onClick={() => onPatientSelect(apt.patientId)}>
                        <div className="apt-time">{apt.time} · {apt.duration}</div>
                        <div className="apt-name">{apt.patientName}</div>
                        <div className="apt-reason">{apt.reason}</div>
                        <div className="apt-badges">
                          {apt.badges.map((b, bi) => (
                            <span key={bi} className="badge" style={{ background: b.color, color: b.textColor }}>{b.label}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                }
                return (
                  <div key={i} className="apt-slot" onClick={() => onOpenModal('cita')}>
                    <div className="empty-hint">+ Añadir cita</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {mode === 'semana' && (
        <div>
          {WEEK_DATA.map((day, i) => (
            <div key={i} className={`week-day-block${day.isToday ? ' week-today' : ''}`}>
              <div className="week-day-header">
                <div className="week-day-title">{day.label}{day.isToday ? ' — Hoy' : ''}</div>
                <span className="week-day-count">{day.citas.length} cita{day.citas.length !== 1 ? 's' : ''}</span>
              </div>
              {day.citas.length === 0 ? (
                <div className="week-empty">Sin citas</div>
              ) : (
                day.citas.map((c, ci) => (
                  <div key={ci} className="week-cita" onClick={() => onPatientSelect(c.patientId)}>
                    <div className="week-cita-time">{c.time}</div>
                    <div className="week-cita-dot" style={{ background: c.color }}></div>
                    <div style={{ flex: 1 }}>
                      <div className="week-cita-name">{c.name}</div>
                      <div className="week-cita-type">{c.type}</div>
                    </div>
                    {c.alert && <span className="week-alert-badge">⚠ Alerta</span>}
                  </div>
                ))
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
