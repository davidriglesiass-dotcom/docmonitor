'use client';
import { useState } from 'react';
import { PATIENTS } from '@/lib/data';

interface PatientsViewProps {
  onPatientSelect: (id: string) => void;
  onNewPatient: () => void;
  onOpenModal: (id: string) => void;
}

export default function PatientsView({ onPatientSelect, onNewPatient, onOpenModal }: PatientsViewProps) {
  const [filter, setFilter] = useState('');

  const filtered = PATIENTS.filter(p => p.name.toLowerCase().includes(filter.toLowerCase()));

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Mis Pacientes</div>
          <div className="page-subtitle">47 pacientes activos · 3 con alertas</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-secondary">📤 Exportar</button>
          <button className="btn-primary" onClick={onNewPatient}>+ Nueva paciente</button>
        </div>
      </div>

      <div className="summary-cards">
        <div className="sum-card"><div className="sum-icon" style={{ background: 'var(--azul-light)' }}>👥</div><div><div className="sum-val">47</div><div className="sum-lbl">Pacientes activas</div></div></div>
        <div className="sum-card"><div className="sum-icon" style={{ background: 'var(--amber-light)' }}>⚠️</div><div><div className="sum-val" style={{ color: 'var(--amber)' }}>3</div><div className="sum-lbl">Con alertas</div></div></div>
        <div className="sum-card"><div className="sum-icon" style={{ background: 'var(--teal-light)' }}>📅</div><div><div className="sum-val" style={{ color: 'var(--teal)' }}>12</div><div className="sum-lbl">Citas este mes</div></div></div>
        <div className="sum-card"><div className="sum-icon" style={{ background: 'var(--verde-light)' }}>🆕</div><div><div className="sum-val" style={{ color: 'var(--verde)' }}>5</div><div className="sum-lbl">Nuevas este mes</div></div></div>
      </div>

      <div className="filters-bar">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input type="text" placeholder="Buscar por nombre o email..." value={filter} onChange={e => setFilter(e.target.value)} />
        </div>
        <select className="filter-select">
          <option>Todos los estados</option><option>Activas</option><option>Con alertas</option><option>Inactivas</option>
        </select>
      </div>

      <div className="patient-table">
        <div className="table-header">
          <div className="th">Paciente</div><div className="th">Condición</div>
          <div className="th td-center">Última visita</div><div className="th td-center">Próxima cita</div>
          <div className="th td-center">Estado</div><div className="th"></div>
        </div>
        <div>
          {filtered.map(p => (
            <div key={p.id} className="patient-row" onClick={() => onPatientSelect(p.id)}>
              <div className="pc-name-cell">
                <div className="pt-av" style={{ background: p.bgColor, color: p.textColor }}>{p.initials}</div>
                <div>
                  <div className="pt-name">
                    {p.name}
                    {p.hasAlert && <span className={`alert-dot-sm${p.alertType === 'red' ? ' red' : ''}`}></span>}
                  </div>
                  <div className="pt-email">{p.email}</div>
                </div>
              </div>
              <div className="td">{p.condition}</div>
              <div className="td td-center">{p.lastVisit}</div>
              <div className="td td-center" style={p.alertType === 'red' ? { color: 'var(--rojo)', fontWeight: 600 } : p.nextAppt.includes('Hoy') ? { color: 'var(--azul)', fontWeight: 600 } : undefined}>
                {p.nextAppt}
              </div>
              <div className="td td-center">
                <span className={`status-badge ${p.status === 'active' ? 'status-active' : 'status-pending'}`}>
                  {p.status === 'active' ? '✓ Activa' : p.hasAlert && p.alertType === 'red' ? '⚠️ Alerta' : '⏳ Nueva'}
                </span>
              </div>
              <div className="row-actions">
                <button className="action-btn" onClick={(e) => { e.stopPropagation(); onPatientSelect(p.id); }}>👤</button>
                <button className="action-btn" onClick={(e) => { e.stopPropagation(); onOpenModal('cita'); }}>📅</button>
              </div>
            </div>
          ))}
        </div>
        <div className="pagination">
          <div className="pag-info">Mostrando 1-5 de 47 pacientes</div>
          <div className="pag-btns">
            <button className="pag-btn">‹</button>
            <button className="pag-btn active">1</button>
            <button className="pag-btn">2</button>
            <button className="pag-btn">…</button>
            <button className="pag-btn">7</button>
            <button className="pag-btn">›</button>
          </div>
        </div>
      </div>
    </div>
  );
}
