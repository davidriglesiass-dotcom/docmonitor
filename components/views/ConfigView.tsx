'use client';
import { useState } from 'react';
import { ConfigSection, Bloqueo } from '@/lib/types';
import { INITIAL_BLOQUEOS } from '@/lib/data';

interface ConfigViewProps {
  showToast: (msg: string) => void;
  onOpenModal: (id: string) => void;
}

export default function ConfigView({ showToast, onOpenModal }: ConfigViewProps) {
  const [activeSection, setActiveSection] = useState<ConfigSection>('perfil');
  const [bloqueos, setBloqueos] = useState<Bloqueo[]>(INITIAL_BLOQUEOS);

  const menuItems: { id: ConfigSection; icon: string; label: string; badge?: number }[] = [
    { id: 'perfil', icon: '👤', label: 'Mi perfil' },
    { id: 'horarios', icon: '🕐', label: 'Horarios' },
    { id: 'notificaciones', icon: '🔔', label: 'Notificaciones', badge: 2 },
    { id: 'impresion', icon: '🖨️', label: 'Impresión / PDF' },
  ];
  const menuItems2: { id: ConfigSection; icon: string; label: string }[] = [
    { id: 'cuenta', icon: '🔐', label: 'Cuenta' },
    { id: 'suscripcion', icon: '💳', label: 'Suscripción' },
  ];

  function delBloqueo(i: number) {
    setBloqueos(prev => prev.filter((_, idx) => idx !== i));
    showToast('Bloqueo eliminado');
  }

  const schedDays = [
    { name: 'Lun', hrs: '8-5 PM', active: true },
    { name: 'Mar', hrs: '8-5 PM', active: true },
    { name: 'Mié', hrs: '8-5 PM', active: true },
    { name: 'Jue', hrs: '8-5 PM', active: true },
    { name: 'Vie', hrs: '8-1 PM', active: true },
    { name: 'Sáb', hrs: 'Cerrado', active: false },
    { name: 'Dom', hrs: 'Cerrado', active: false },
  ];

  const [scheduleDays, setScheduleDays] = useState(schedDays);

  function toggleDay(i: number) {
    setScheduleDays(prev => prev.map((d, idx) => idx === i ? { ...d, active: !d.active } : d));
  }

  const toggleData = [
    { title: 'Confirmación de cita', sub: 'Al crear una cita', on: true },
    { title: 'Recordatorio 24h antes', sub: 'El día anterior', on: true },
    { title: 'Recordatorio 2h antes', sub: 'El mismo día', on: true },
    { title: 'Nueva indicación del doctor', sub: 'Al actualizar el tratamiento', on: true },
    { title: 'Paciente sube examen', sub: 'Notificación al doctor', on: true },
    { title: 'Paciente reporta síntoma', sub: 'Alerta inmediata al doctor', on: true },
  ];

  const [toggleStates, setToggleStates] = useState(toggleData.map(t => t.on));

  return (
    <div>
      <div className="page-header">
        <div><div className="page-title">Configuración</div><div className="page-subtitle">Perfil, horarios y preferencias</div></div>
      </div>
      <div className="config-layout">
        <div className="config-menu">
          {menuItems.map(item => (
            <div key={item.id} className={`config-menu-item${activeSection === item.id ? ' active' : ''}`} onClick={() => setActiveSection(item.id)}>
              {item.icon} {item.label}
              {item.badge && <span className="config-menu-badge">{item.badge}</span>}
            </div>
          ))}
          <div className="config-menu-divider"></div>
          {menuItems2.map(item => (
            <div key={item.id} className={`config-menu-item${activeSection === item.id ? ' active' : ''}`} onClick={() => setActiveSection(item.id)}>
              {item.icon} {item.label}
            </div>
          ))}
        </div>

        <div>
          {/* PERFIL */}
          {activeSection === 'perfil' && (
            <div className="config-card">
              <div className="config-card-title">Información del doctor</div>
              <div className="config-card-sub">Datos en documentos y perfil público.</div>
              <div className="avatar-upload">
                <div className="avatar-big">DI</div>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--negro)', marginBottom: 4 }}>Dr. David Iglesias S.</h3>
                  <p style={{ fontSize: 12, color: 'var(--gris-500)', marginBottom: 10 }}>Ginecología · Ciudad de Panamá</p>
                  <button className="btn-secondary" style={{ fontSize: 12, padding: '6px 14px' }}>Cambiar foto</button>
                </div>
              </div>
              <div className="form-grid">
                <div className="form-group"><label className="form-label">Nombre</label><input className="form-input" defaultValue="David" /></div>
                <div className="form-group"><label className="form-label">Apellido</label><input className="form-input" defaultValue="Iglesias S." /></div>
                <div className="form-group"><label className="form-label">Especialidad</label><input className="form-input" defaultValue="Ginecología y Obstetricia" /></div>
                <div className="form-group"><label className="form-label">Nº Licencia</label><input className="form-input" defaultValue="GIN-2847-PA" /></div>
                <div className="form-group"><label className="form-label">Nombre clínica</label><input className="form-input" defaultValue="Clínica MiDocLink" /></div>
                <div className="form-group"><label className="form-label">Teléfono clínica</label><input className="form-input" defaultValue="+507 264-XXXX" /></div>
                <div className="form-group full"><label className="form-label">Dirección</label><input className="form-input" defaultValue="Punta Pacífica, Ciudad de Panamá" /></div>
              </div>
              <div className="form-actions">
                <button className="btn-ghost">Cancelar</button>
                <button className="btn-primary" onClick={() => showToast('Perfil guardado')}>Guardar cambios</button>
              </div>
            </div>
          )}

          {/* HORARIOS */}
          {activeSection === 'horarios' && (
            <>
              <div className="config-card">
                <div className="config-card-title">Días y horas de atención</div>
                <div className="config-card-sub">Define cuándo estás disponible para citas.</div>
                <div className="schedule-grid" style={{ marginBottom: 20 }}>
                  {scheduleDays.map((d, i) => (
                    <div key={d.name} className={`schedule-day${d.active ? ' active' : ''}`} onClick={() => toggleDay(i)}>
                      <div className="day-name">{d.name}</div>
                      <div className="day-hrs">{d.hrs}</div>
                    </div>
                  ))}
                </div>
                <div className="form-grid">
                  <div className="form-group"><label className="form-label">Hora inicio</label><input className="form-input" type="time" defaultValue="08:00" /></div>
                  <div className="form-group"><label className="form-label">Hora fin</label><input className="form-input" type="time" defaultValue="17:00" /></div>
                  <div className="form-group"><label className="form-label">Duración default</label><select className="form-select" defaultValue="45 min"><option>30 min</option><option>45 min</option><option>60 min</option></select></div>
                  <div className="form-group"><label className="form-label">Tiempo entre citas</label><select className="form-select" defaultValue="10 min"><option>Sin espacio</option><option>10 min</option><option>15 min</option></select></div>
                </div>
                <div className="form-actions">
                  <button className="btn-ghost">Cancelar</button>
                  <button className="btn-primary" onClick={() => showToast('Horarios guardados')}>Guardar</button>
                </div>
              </div>
              <div className="config-card">
                <div className="config-card-title">Bloqueos y ausencias</div>
                <div className="config-card-sub">Períodos sin disponibilidad para citas.</div>
                <div style={{ marginBottom: 14 }}>
                  {bloqueos.length === 0 ? (
                    <div style={{ fontSize: 13, color: 'var(--gris-300)', fontStyle: 'italic' }}>Sin bloqueos configurados</div>
                  ) : (
                    bloqueos.map((bl, i) => (
                      <div key={i} className={`block-item${bl.tipo === 'vacacion' ? ' vac' : ''}`}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--negro)' }}>{bl.label}</div>
                          <div style={{ fontSize: 11, color: 'var(--gris-500)' }}>{bl.ini}{bl.fin !== bl.ini ? ` → ${bl.fin}` : ''}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span className={`block-type-badge ${bl.tipo === 'vacacion' ? 'v' : 'h'}`}>{bl.tipo === 'vacacion' ? 'Vacación' : 'Horario'}</span>
                          <button className="btn-del-block" onClick={() => delBloqueo(i)}>×</button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <button className="btn-primary" style={{ fontSize: 13 }} onClick={() => onOpenModal('bloqueo')}>+ Agregar bloqueo</button>
              </div>
            </>
          )}

          {/* NOTIFICACIONES */}
          {activeSection === 'notificaciones' && (
            <div className="config-card">
              <div className="config-card-title">Notificaciones al paciente</div>
              <div className="config-card-sub">Mensajes automáticos por WhatsApp y email.</div>
              {toggleData.map((t, i) => (
                <div key={i} className="toggle-row">
                  <div className="toggle-info"><h4>{t.title}</h4><p>{t.sub}</p></div>
                  <div className={`toggle${toggleStates[i] ? ' on' : ''}`} onClick={() => setToggleStates(prev => prev.map((v, idx) => idx === i ? !v : v))}></div>
                </div>
              ))}
              <div className="form-actions"><button className="btn-primary" onClick={() => showToast('Notificaciones guardadas')}>Guardar</button></div>
            </div>
          )}

          {/* IMPRESION */}
          {activeSection === 'impresion' && (
            <div className="config-card">
              <div className="config-card-title">Documentos e Impresión</div>
              <div className="config-card-sub">Configura los PDFs generados.</div>
              {[
                { title: 'Incluir logo en documentos', sub: 'Logo y nombre en el encabezado', on: true },
                { title: 'Incluir número de licencia', sub: 'En el pie de página', on: true },
                { title: 'Incluir firma escaneada', sub: 'Al pie de las indicaciones', on: false },
              ].map((t, i) => (
                <div key={i} className="toggle-row">
                  <div className="toggle-info"><h4>{t.title}</h4><p>{t.sub}</p></div>
                  <div className={`toggle${t.on ? ' on' : ''}`} onClick={(e) => (e.target as HTMLElement).classList.toggle('on')}></div>
                </div>
              ))}
              <div className="form-actions"><button className="btn-primary" onClick={() => showToast('Configuración guardada')}>Guardar</button></div>
            </div>
          )}

          {/* CUENTA */}
          {activeSection === 'cuenta' && (
            <>
              <div className="config-card">
                <div className="config-card-title">Seguridad de la cuenta</div>
                <div className="config-card-sub">Actualiza tu contraseña y acceso.</div>
                <div className="form-grid">
                  <div className="form-group full"><label className="form-label">Email</label><input className="form-input" type="email" defaultValue="david.iglesias@midoclink.com" /></div>
                  <div className="form-group"><label className="form-label">Contraseña actual</label><input className="form-input" type="password" placeholder="••••••••" /></div>
                  <div className="form-group"><label className="form-label">Nueva contraseña</label><input className="form-input" type="password" placeholder="••••••••" /></div>
                </div>
                <div className="form-actions"><button className="btn-primary" onClick={() => showToast('Contraseña actualizada')}>Actualizar</button></div>
              </div>
              <div className="config-card">
                <div className="config-card-title" style={{ color: 'var(--rojo)' }}>Zona de peligro</div>
                <div className="danger-zone">
                  <div className="danger-info"><h4>Eliminar cuenta</h4><p>Esta acción no puede deshacerse.</p></div>
                  <button className="btn-danger">Eliminar cuenta</button>
                </div>
              </div>
            </>
          )}

          {/* SUSCRIPCION */}
          {activeSection === 'suscripcion' && (
            <div className="config-card">
              <div className="config-card-title">Tu suscripción</div>
              <div className="config-card-sub">Plan actual y facturación.</div>
              <div style={{ background: 'linear-gradient(135deg, var(--azul), var(--azul-med))', borderRadius: 14, padding: '20px 24px', color: 'var(--blanco)', marginBottom: 20 }}>
                <div style={{ fontSize: 11, opacity: .7, textTransform: 'uppercase' as const, letterSpacing: 1, marginBottom: 4 }}>Plan activo</div>
                <div style={{ fontFamily: "'Lora', serif", fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Plan Doctor Pro</div>
                <div style={{ fontSize: 14, opacity: .8 }}>$100/mes · Próximo cobro: 1 de Abril 2026</div>
              </div>
              <div className="form-actions">
                <button className="btn-ghost">Cancelar suscripción</button>
                <button className="btn-primary">Actualizar plan</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
