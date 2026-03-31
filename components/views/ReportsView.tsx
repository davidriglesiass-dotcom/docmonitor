'use client';
import { useState } from 'react';
import { ADH_DATA } from '@/lib/data';

interface ReportsViewProps {
  onOpenModal: (id: string) => void;
}

export default function ReportsView({ onOpenModal }: ReportsViewProps) {
  const [activePeriod, setActivePeriod] = useState('30D');
  const [showAdhDetail, setShowAdhDetail] = useState(false);

  const periods = ['7D', '30D', '3M', '1A'];
  const barData = [
    { label: 'Lun', val: 6, h: 60, color: 'var(--azul-med)' },
    { label: 'Mar', val: 9, h: 90, color: 'var(--azul)' },
    { label: 'Mié', val: 8, h: 80, color: 'var(--azul-med)' },
    { label: 'Jue', val: 11, h: 110, color: 'var(--azul)' },
    { label: 'Vie', val: 7, h: 70, color: 'var(--azul-med)' },
    { label: 'Sáb', val: 4, h: 40, color: 'var(--gris-300)' },
    { label: 'Dom', val: 0, h: 4, color: 'var(--gris-200)' },
  ];
  const lineData = [
    { label: 'Abr', h: 36 }, { label: 'May', h: 42 }, { label: 'Jun', h: 30 },
    { label: 'Jul', h: 28 }, { label: 'Ago', h: 38 }, { label: 'Sep', h: 44 },
    { label: 'Oct', h: 40 }, { label: 'Nov', h: 48 }, { label: 'Dic', h: 52 },
    { label: 'Ene', h: 46 }, { label: 'Feb', h: 56 }, { label: 'Mar', h: 64 },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Reportes y Estadísticas</div>
          <div className="page-subtitle">Resumen clínico · Dr. David Iglesias</div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div className="period-selector">
            {periods.map(p => (
              <button key={p} className={`period-btn${activePeriod === p ? ' active' : ''}`} onClick={() => setActivePeriod(p)}>{p}</button>
            ))}
          </div>
          <button className="btn-primary" onClick={() => onOpenModal('exportar')}>📤 Exportar</button>
        </div>
      </div>

      <div className="report-card full" style={{ marginBottom: 20 }}>
        <div className="kpi-row">
          <div className="kpi" style={{ borderRight: '1px solid var(--gris-200)' }}><div className="kpi-val">48</div><div className="kpi-lbl">Consultas este mes</div><div className="kpi-trend">↑ 12% vs mes anterior</div></div>
          <div className="kpi" style={{ borderRight: '1px solid var(--gris-200)' }}><div className="kpi-val">$3,840</div><div className="kpi-lbl">Ingresos estimados</div><div className="kpi-trend">↑ 8% vs mes anterior</div></div>
          <div className="kpi"><div className="kpi-val">94%</div><div className="kpi-lbl">Tasa de asistencia</div><div className="kpi-trend">↑ 3% vs mes anterior</div></div>
        </div>
      </div>

      <div className="report-grid">
        <div className="report-card">
          <div className="card-title"><span>📅 Citas por día</span></div>
          <div className="bar-chart">
            {barData.map(b => (
              <div key={b.label} className="bar-group">
                <div className="bar-val">{b.val}</div>
                <div className="bar" style={{ height: b.h, background: b.color }}></div>
                <div className="bar-label">{b.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="report-card">
          <div className="card-title">🩺 Tipo de consulta</div>
          <div className="donut-wrap">
            <svg width="100" height="100" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="35" fill="none" stroke="#EEF0F4" strokeWidth="18" />
              <circle cx="50" cy="50" r="35" fill="none" stroke="#1B3A6B" strokeWidth="18" strokeDasharray="88 132" strokeDashoffset="0" transform="rotate(-90 50 50)" />
              <circle cx="50" cy="50" r="35" fill="none" stroke="#0E8A7A" strokeWidth="18" strokeDasharray="52 168" strokeDashoffset="-88" transform="rotate(-90 50 50)" />
              <circle cx="50" cy="50" r="35" fill="none" stroke="#D97706" strokeWidth="18" strokeDasharray="32 188" strokeDashoffset="-140" transform="rotate(-90 50 50)" />
              <text x="50" y="54" textAnchor="middle" fontSize="14" fontWeight="700" fill="#1B3A6B" fontFamily="Sora">48</text>
            </svg>
            <div className="donut-legend">
              <div className="legend-item"><div className="legend-dot" style={{ background: '#1B3A6B' }}></div><span>Seguimiento</span><span className="legend-val">20</span></div>
              <div className="legend-item"><div className="legend-dot" style={{ background: '#0E8A7A' }}></div><span>1ª Consulta</span><span className="legend-val">12</span></div>
              <div className="legend-item"><div className="legend-dot" style={{ background: '#D97706' }}></div><span>Rev. exámenes</span><span className="legend-val">10</span></div>
            </div>
          </div>
        </div>

        <div className="report-card full">
          <div className="card-title">📈 Evolución — Últimos 12 meses</div>
          <div className="line-chart">
            {lineData.map((p, i) => (
              <div key={p.label} className="line-point">
                <div className="line-bar" style={{ height: p.h }}></div>
                <div className="line-label" style={i === lineData.length - 1 ? { color: 'var(--azul)', fontWeight: 700 } : undefined}>{p.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="report-card">
          <div className="card-title">🏆 Pacientes frecuentes</div>
          {[
            { rank: 1, name: 'Mónica Varela', visits: 8, width: '100%' },
            { rank: 2, name: 'Rosa Pérez', visits: 6, width: '75%' },
            { rank: 3, name: 'Lucía Morales', visits: 5, width: '62%' },
          ].map(t => (
            <div key={t.rank} className="top-item">
              <div className="top-rank">{t.rank}</div>
              <div style={{ flex: 1 }}><div className="top-name">{t.name}</div><div className="top-meta">{t.visits} visitas</div></div>
              <div className="top-bar-wrap"><div className="top-bar-bg"><div className="top-bar-fill" style={{ width: t.width }}></div></div></div>
            </div>
          ))}
        </div>

        <div className="report-card">
          <div className="card-title">📋 Adherencia al tratamiento</div>
          {[
            { label: 'Cumplen indicaciones', pct: 68, color: 'var(--teal)' },
            { label: 'Suben exámenes a tiempo', pct: 54, color: 'var(--azul-med)' },
            { label: 'Reportan síntomas', pct: 41, color: 'var(--amber)' },
          ].map(a => (
            <div key={a.label} style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                <span>{a.label}</span><span style={{ fontWeight: 700, color: a.color }}>{a.pct}%</span>
              </div>
              <div style={{ height: 8, background: 'var(--gris-200)', borderRadius: 10, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${a.pct}%`, background: a.color, borderRadius: 10 }}></div>
              </div>
            </div>
          ))}
          <p style={{ marginTop: 14, fontSize: 12, color: 'var(--gris-500)', fontStyle: 'italic' }}>💡 Pacientes con seguimiento activo tienen 3x más probabilidad de volver.</p>
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--gris-200)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '.5px', color: 'var(--gris-500)' }}>Por paciente</span>
              <button className="btn-secondary" style={{ fontSize: 11, padding: '4px 10px' }} onClick={() => setShowAdhDetail(!showAdhDetail)}>Ver detalle</button>
            </div>
            {showAdhDetail && (
              <div>
                {ADH_DATA.map(d => {
                  const c = d.pct >= 70 ? 'var(--teal)' : d.pct >= 40 ? 'var(--amber)' : 'var(--rojo)';
                  return (
                    <div key={d.name} className="adh-row">
                      <div className="adh-av" style={{ background: d.bg, color: d.textColor }}>{d.initials}</div>
                      <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 600 }}>{d.name}</div><div style={{ fontSize: 11, color: 'var(--gris-500)' }}>{d.detail}</div></div>
                      <div className="adh-bar-bg"><div className="adh-bar-fill" style={{ width: `${d.pct}%`, background: c }}></div></div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: c, width: 36, textAlign: 'right' as const }}>{d.pct}%</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
