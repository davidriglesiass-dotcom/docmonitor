'use client';
import { useState, useRef } from 'react';
import { PatientTab, Treatment } from '@/lib/types';
import { PATIENTS, ICD_LOCAL, TREATMENTS } from '@/lib/data';

interface PatientViewProps {
  patientId: string;
  onBack: () => void;
  onOpenModal: (id: string) => void;
  showToast: (msg: string) => void;
}

const GENDER_LABEL: Record<string, string> = {
  femenino: 'Femenino',
  masculino: 'Masculino',
  otro: 'Otro',
  'prefiero-no-decir': 'No especificado',
};

function formatDob(dob: string): string {
  if (!dob) return '';
  const [y, m, d] = dob.split('-');
  const months = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
  return `${parseInt(d)} ${months[parseInt(m) - 1]} ${y}`;
}

function formatFrecuencia(t: Treatment): string {
  const unidad = t.frecuencia === 1
    ? { dia: 'vez al día', semana: 'vez a la semana', mes: 'vez al mes' }[t.frecuencia_unidad]
    : { dia: 'veces al día', semana: 'veces a la semana', mes: 'veces al mes' }[t.frecuencia_unidad];
  return `${t.frecuencia} ${unidad}`;
}

function formatDuracion(t: Treatment): string {
  if (t.duracion_unidad === 'indefinido') return 'Tratamiento continuo';
  const unidad = t.duracion === 1
    ? { dias: 'día', semanas: 'semana', meses: 'mes' }[t.duracion_unidad as string] ?? t.duracion_unidad
    : t.duracion_unidad;
  return `por ${t.duracion} ${unidad}`;
}

export default function PatientView({ patientId, onBack, onOpenModal, showToast }: PatientViewProps) {
  const [activeTab, setActiveTab] = useState<PatientTab>('resumen');
  const [treatments, setTreatments] = useState<Treatment[]>(TREATMENTS);
  const [showAddTreatment, setShowAddTreatment] = useState(false);
  const [newTreatment, setNewTreatment] = useState<Partial<Treatment>>({
    descripcion: '', dosis: '1 pastilla',
    frecuencia: 1, frecuencia_unidad: 'dia',
    duracion: 0, duracion_unidad: 'indefinido',
    horas: [], notas: '',
  });
  const [icdChips, setIcdChips] = useState([
    { code: 'N95.1', desc: 'Menopausia natural' },
    { code: 'G43.9', desc: 'Migraña' },
  ]);
  const [cptChips, setCptChips] = useState([{ code: '99213', desc: '99213 Consulta seguimiento' }]);
  const [icdQuery, setIcdQuery] = useState('');
  const [icdResults, setIcdResults] = useState<{ code: string; desc: string }[]>([]);
  const [showIcdDd, setShowIcdDd] = useState(false);
  const [notaText, setNotaText] = useState('');
  const [voiceStatus, setVoiceStatus] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);
  const cptInputRef = useRef<HTMLInputElement>(null);

  const patient = PATIENTS.find(p => p.id === patientId) || PATIENTS[0];
  const tabs: { id: PatientTab; label: string }[] = [
    { id: 'resumen', label: 'Resumen' },
    { id: 'citas', label: 'Citas' },
    { id: 'historia', label: '🏥 Historia' },
    { id: 'tratamiento', label: 'Tratamiento' },
    { id: 'examenes', label: 'Exámenes' },
    { id: 'notas', label: 'Notas' },
  ];

  function markDone(id: number) {
    setTreatments(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
    showToast('Indicación actualizada');
  }

  function addTreatment() {
    if (!newTreatment.descripcion?.trim()) return;
    const t: Treatment = {
      id: Date.now(),
      descripcion: newTreatment.descripcion!,
      dosis: newTreatment.dosis || '1',
      frecuencia: newTreatment.frecuencia || 1,
      frecuencia_unidad: newTreatment.frecuencia_unidad || 'dia',
      duracion: newTreatment.duracion || 0,
      duracion_unidad: newTreatment.duracion_unidad || 'indefinido',
      horas: newTreatment.horas || [],
      notas: newTreatment.notas || '',
      done: false,
    };
    setTreatments(prev => [...prev, t]);
    setNewTreatment({ descripcion: '', dosis: '1 pastilla', frecuencia: 1, frecuencia_unidad: 'dia', duracion: 0, duracion_unidad: 'indefinido', horas: [], notas: '' });
    setShowAddTreatment(false);
    showToast('Indicación agregada');
  }

  function searchICD(q: string) {
    setIcdQuery(q);
    if (q.length < 2) { setShowIcdDd(false); return; }
    setShowIcdDd(true);
    setIcdResults(ICD_LOCAL.filter(i =>
      i.desc.toLowerCase().includes(q.toLowerCase()) || i.code.toLowerCase().includes(q.toLowerCase())
    ));
  }

  function selectICD(code: string, desc: string) {
    if (!icdChips.find(c => c.code === code)) setIcdChips(prev => [...prev, { code, desc }]);
    setShowIcdDd(false);
    setIcdQuery('');
  }

  function addCPT() {
    if (!cptInputRef.current?.value.trim()) return;
    const val = cptInputRef.current.value.trim();
    setCptChips(prev => [...prev, { code: val.split(' ')[0], desc: val }]);
    cptInputRef.current.value = '';
    showToast('Código CPT agregado');
  }

  function toggleVoice() {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { showToast('Usa Chrome para dictar por voz'); return; }
    if (isRecording && recognitionRef.current) { recognitionRef.current.stop(); return; }
    const recognition = new SR();
    recognitionRef.current = recognition;
    recognition.lang = 'es-PA';
    recognition.continuous = true;
    recognition.interimResults = true;
    let base = notaText;
    recognition.onstart = () => { setIsRecording(true); setVoiceStatus('🔴 Grabando...'); };
    recognition.onresult = (e: any) => {
      let interim = '', final = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) final += e.results[i][0].transcript;
        else interim += e.results[i][0].transcript;
      }
      if (final) base += (base ? ' ' : '') + final;
      setNotaText(base + (interim ? ' ' + interim : ''));
    };
    recognition.onend = () => { setIsRecording(false); setVoiceStatus(''); };
    recognition.onerror = () => { setIsRecording(false); setVoiceStatus(''); };
    recognition.start();
  }

  const inputStyle: React.CSSProperties = { padding: '8px 10px', border: '2px solid var(--gris-200)', borderRadius: 8, fontSize: 13, fontFamily: "'Sora', sans-serif", background: 'var(--gris-100)', outline: 'none', width: '100%' };
  const selectStyle: React.CSSProperties = { ...inputStyle, cursor: 'pointer' };

  return (
    <div>
      <button className="back-btn" onClick={onBack}>← Volver a agenda</button>

      <div className="patient-header-card">
        <div className="ph-avatar" style={{ background: patient.bgColor, color: patient.textColor, fontFamily: "'Lora', serif" }}>{patient.initials}</div>
        <div style={{ flex: 1 }}>
          <div className="ph-name">{patient.name}</div>
          <div className="ph-meta">
            <span>👤 {patient.age} años</span>
            {patient.dob && <span>🎂 {formatDob(patient.dob)}</span>}
            {patient.gender && <span>⚧ {GENDER_LABEL[patient.gender] ?? patient.gender}</span>}
            <span>📧 {patient.email}</span>
            <span>📱 {patient.phone}</span>
            <span>🩺 Paciente desde Feb 2026</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <button className="btn-secondary" onClick={() => onOpenModal('cita')}>+ Nueva cita</button>
          <button className="btn-secondary" style={{ color: 'var(--rojo)', borderColor: 'var(--rojo-light)' }} onClick={() => onOpenModal('baja')}>Archivar</button>
          <button className="btn-primary">💬 Mensaje</button>
        </div>
      </div>

      <div className="alerts-bar">
        <div className="alert-chip warning">⚠️ Reportó mareos en las últimas 24h</div>
        <div className="alert-chip danger">🔴 Examen de sangre pendiente de revisión</div>
        <div className="alert-chip info">📅 Próxima cita: hoy 9:00 AM</div>
      </div>

      <div className="proxima-cita">
        <div style={{ fontSize: 28 }}>📅</div>
        <div>
          <div className="pc-label">Próxima cita</div>
          <div className="pc-date">Hoy, Jueves 19 de Marzo 2026</div>
          <div className="pc-hora">9:00 AM · 45 min · Seguimiento menopausia</div>
        </div>
        <div className="pc-actions">
          <button className="btn-white" onClick={() => onOpenModal('asistencia')}>📱 Confirmar</button>
          <button className="btn-white">Reprogramar</button>
        </div>
      </div>

      <div className="tabs">
        {tabs.map(t => (
          <button key={t.id} className={`tab${activeTab === t.id ? ' active' : ''}`} onClick={() => setActiveTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* RESUMEN */}
      {activeTab === 'resumen' && (
        <div className="two-col">
          <div>
            <div className="card">
              <div className="card-title">🩺 Patología</div>
              <div className="patologia-box">Presenta menstruación irregular con dolor, problemas de sueño y dolores de cabeza intensos. Probable perimenopausia.</div>
              <div className="card-title" style={{ marginTop: 14 }}>💊 Tratamiento activo</div>
              {treatments.map(t => (
                <div key={t.id} className={`trat-item${t.done ? ' done' : ''}`} style={t.done ? { background: 'var(--teal-light)' } : undefined}>
                  <div className="trat-check"></div>
                  <div className="trat-text">
                    {t.descripcion}
                    <div style={{ fontSize: 11, color: 'var(--gris-500)', marginTop: 2 }}>
                      {t.dosis !== '—' ? `${t.dosis} · ` : ''}{formatFrecuencia(t)} · {formatDuracion(t)}
                    </div>
                  </div>
                  <div className="trat-status" style={{ color: t.done ? 'var(--teal)' : undefined }}>{t.done ? '✓ Cumplida' : 'Pendiente'}</div>
                </div>
              ))}
            </div>
          </div>
          <div>
            {/* COMENTARIOS DEL PACIENTE */}
            <div className="card">
              <div className="card-title">💬 Cómo se siente el paciente</div>
              <div className="sintoma-item">
                <div className="sintoma-dot"></div>
                <div>
                  <div style={{ fontSize: 13 }}>"He sentido mareos desde ayer en la tarde"</div>
                  <div className="sintoma-time">Hoy, 8:40 AM · desde la app</div>
                </div>
              </div>
              <div className="sintoma-item">
                <div className="sintoma-dot" style={{ background: 'var(--amber)' }}></div>
                <div>
                  <div style={{ fontSize: 13 }}>"No pude dormir bien esta semana"</div>
                  <div className="sintoma-time">Ayer, 10:15 PM · desde la app</div>
                </div>
              </div>
              <div style={{ marginTop: 10, padding: '8px 12px', background: 'var(--gris-100)', borderRadius: 8, fontSize: 12, color: 'var(--gris-500)' }}>
                BD: SELECT * FROM reportes_paciente WHERE paciente_id=X ORDER BY created_at DESC
              </div>
            </div>
            <div className="card">
              <div className="card-title">🧪 Exámenes</div>
              <div className="examen-item">
                <div className="examen-icon">🩸</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>Examen de sangre</div>
                  <div style={{ fontSize: 11, color: 'var(--gris-500)' }}>Subido · Feb 24</div>
                </div>
                <span className="examen-link">Ver →</span>
              </div>
              <div className="examen-item">
                <div className="examen-icon">⏳</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>Perfil hormonal</div>
                  <div style={{ fontSize: 11, color: 'var(--amber)' }}>Pendiente</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CITAS */}
      {activeTab === 'citas' && (
        <div className="card">
          <div className="card-title">📅 Historial de citas <button className="btn-secondary" style={{ fontSize: 12, padding: '6px 12px' }} onClick={() => onOpenModal('cita')}>+ Agendar</button></div>
          <div className="cita-item">
            <div className="cita-date-block" style={{ background: 'var(--azul)' }}><div className="cita-day" style={{ color: '#fff' }}>19</div><div className="cita-mon" style={{ color: 'rgba(255,255,255,.7)' }}>Mar</div></div>
            <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 600 }}>9:00 AM — Hoy</div><div style={{ fontSize: 12, color: 'var(--gris-500)' }}>Seguimiento menopausia · 45 min</div></div>
            <span className="cita-status programada">Programada</span>
          </div>
          <div className="cita-item">
            <div className="cita-date-block"><div className="cita-day">24</div><div className="cita-mon">Feb</div></div>
            <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 600 }}>3:00 PM</div><div style={{ fontSize: 12, color: 'var(--gris-500)' }}>Primera consulta · menstruación irregular</div></div>
            <span className="cita-status realizada">Realizada</span>
          </div>
        </div>
      )}

      {/* HISTORIA */}
      {activeTab === 'historia' && (
        <div className="two-col">
          <div>
            <div className="card">
              <div className="card-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                🏥 Diagnósticos ICD-10
                <span style={{ fontSize: 11, color: 'var(--gris-500)', fontWeight: 400, textTransform: 'none' as const }}>API OMS</span>
              </div>
              <div className="icd-wrap">
                <span className="icd-icon">🔍</span>
                <input className="icd-input" type="text" autoComplete="off" placeholder="Buscar diagnóstico..." value={icdQuery} onChange={e => searchICD(e.target.value)} />
                {showIcdDd && (
                  <div className="icd-dd" style={{ display: 'block' }}>
                    {icdResults.length === 0
                      ? <div style={{ padding: '10px 14px', fontSize: 12, color: 'var(--gris-500)', fontStyle: 'italic' }}>Sin resultados</div>
                      : icdResults.map(item => (
                        <div key={item.code} className="icd-opt" onClick={() => selectICD(item.code, item.desc)}>
                          <span className="icd-code">{item.code}</span><span className="icd-desc">{item.desc}</span>
                        </div>
                      ))}
                  </div>
                )}
              </div>
              <div className="icd-chips">
                {icdChips.map(c => (
                  <div key={c.code} className="icd-chip">
                    <span className="icd-chip-code">{c.code}</span><span>{c.desc}</span>
                    <span className="icd-chip-x" onClick={() => setIcdChips(prev => prev.filter(x => x.code !== c.code))}>×</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="card">
              <div className="card-title">🩺 Antecedentes personales</div>
              <div className="form-grid">
                <div className="form-group full"><label className="form-label">Enfermedades crónicas</label><input className="form-input" defaultValue="Migraña crónica desde 2018" /></div>
                <div className="form-group"><label className="form-label">Alergias</label><input className="form-input" defaultValue="Penicilina" /></div>
                <div className="form-group"><label className="form-label">Tipo de sangre</label>
                  <select className="form-select" defaultValue="O+"><option>O+</option><option>A+</option><option>A-</option><option>B+</option><option>B-</option><option>AB+</option><option>AB-</option><option>O-</option></select>
                </div>
                <div className="form-group full"><label className="form-label">Cirugías previas</label><input className="form-input" defaultValue="Cesárea 2002" /></div>
                <div className="form-group full"><label className="form-label">Medicamentos crónicos</label><input className="form-input" defaultValue="Amitriptilina 25mg, Angeliq" /></div>
              </div>
              <div className="form-actions"><button className="btn-primary" style={{ fontSize: 12, padding: '8px 16px' }} onClick={() => showToast('Historia clínica guardada')}>Guardar cambios</button></div>
            </div>
          </div>
          <div>
            <div className="card">
              <div className="card-title">👨‍👩‍👧 Antecedentes familiares</div>
              <div className="form-grid">
                <div className="form-group full"><label className="form-label">Madre</label><input className="form-input" defaultValue="Diabetes tipo 2, Hipertensión" /></div>
                <div className="form-group full"><label className="form-label">Padre</label><input className="form-input" placeholder="Enfermedades relevantes..." /></div>
              </div>
            </div>
            <div className="card">
              <div className="card-title">🚬 Hábitos</div>
              <div className="form-grid">
                <div className="form-group"><label className="form-label">Tabaco</label><select className="form-select" defaultValue="Fumadora"><option>No fuma</option><option>Fumadora</option><option>Ex-fumadora</option></select></div>
                <div className="form-group"><label className="form-label">Alcohol</label><select className="form-select" defaultValue="Ocasional"><option>Ocasional</option><option>Frecuente</option><option>No consume</option></select></div>
                <div className="form-group"><label className="form-label">Ejercicio</label><select className="form-select" defaultValue="Moderado"><option>Sedentaria</option><option>Moderado</option><option>Activa</option></select></div>
                <div className="form-group"><label className="form-label">IMC</label><input className="form-input" defaultValue="24.8" placeholder="kg/m²" /></div>
              </div>
            </div>
            <div className="card">
              <div className="card-title">🔢 CPT — Referencia aseguradoras</div>
              <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 6, marginBottom: 10 }}>
                {cptChips.map((c, i) => (
                  <div key={i} className="icd-chip" style={{ background: 'var(--teal-light)', borderColor: 'var(--teal)', color: 'var(--teal)' }}>
                    <span className="icd-chip-code">{c.code}</span><span>{c.desc}</span>
                    <span className="icd-chip-x" onClick={() => setCptChips(prev => prev.filter((_, idx) => idx !== i))}>×</span>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input ref={cptInputRef} className="form-input" style={{ flex: 1 }} placeholder="Ej: 99213 — Consulta..." />
                <button className="btn-secondary" style={{ fontSize: 12, flexShrink: 0 }} onClick={addCPT}>+ Agregar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TRATAMIENTO */}
      {activeTab === 'tratamiento' && (
        <div>
          <div className="card">
            <div className="card-title">💊 Indicaciones activas</div>

            {/* Lista de indicaciones con frecuencia y duración */}
            {treatments.map(t => (
              <div key={t.id} style={{
                display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 0',
                borderBottom: '1px solid var(--gris-200)',
                background: t.done ? 'var(--teal-light)' : undefined,
                borderRadius: t.done ? 8 : undefined,
                paddingLeft: t.done ? 8 : undefined,
              }}>
                {/* Check */}
                <div style={{
                  width: 22, height: 22, borderRadius: '50%', flexShrink: 0, marginTop: 2,
                  border: `2px solid ${t.done ? 'var(--teal)' : 'var(--amber)'}`,
                  background: t.done ? 'var(--teal)' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: 12,
                }}>
                  {t.done ? '✓' : ''}
                </div>

                {/* Info */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--negro)', marginBottom: 4 }}>
                    {t.descripcion}
                    {t.dosis !== '—' && <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--gris-500)', marginLeft: 8 }}>{t.dosis}</span>}
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const }}>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 100, background: 'var(--azul-light)', color: 'var(--azul)' }}>
                      🔄 {formatFrecuencia(t)}
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 100, background: 'var(--teal-light)', color: 'var(--teal)' }}>
                      📅 {formatDuracion(t)}
                    </span>
                    {t.horas.length > 0 && (
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 100, background: 'var(--amber-light)', color: 'var(--amber)' }}>
                        🕐 {t.horas.join(' · ')}
                      </span>
                    )}
                  </div>
                  {t.notas && <div style={{ fontSize: 11, color: 'var(--gris-500)', marginTop: 4, fontStyle: 'italic' }}>{t.notas}</div>}
                </div>

                {/* Acciones */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: t.done ? 'var(--teal)' : 'var(--amber)' }}>
                    {t.done ? '✓ Cumplida' : 'Pendiente'}
                  </span>
                  <button
                    style={{ fontSize: 11, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', color: t.done ? 'var(--teal)' : 'var(--gris-500)', fontFamily: "'Sora', sans-serif" }}
                    onClick={() => markDone(t.id)}>
                    {t.done ? 'Desmarcar' : 'Marcar cumplida'}
                  </button>
                </div>
              </div>
            ))}

            {/* Formulario nueva indicación */}
            {!showAddTreatment ? (
              <div style={{ marginTop: 16 }}>
                <button className="btn-primary" style={{ fontSize: 12, padding: '8px 16px' }} onClick={() => setShowAddTreatment(true)}>
                  + Agregar indicación
                </button>
              </div>
            ) : (
              <div style={{ marginTop: 16, padding: 16, background: 'var(--gris-100)', borderRadius: 12, border: '2px solid var(--gris-200)' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--azul)', marginBottom: 14 }}>Nueva indicación</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {/* Descripción */}
                  <div style={{ gridColumn: '1/-1' }}>
                    <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '.4px', color: 'var(--gris-700)', display: 'block', marginBottom: 4 }}>Medicamento / indicación *</label>
                    <input style={inputStyle} type="text" placeholder="Ej: Amoxicilina 500mg"
                      value={newTreatment.descripcion}
                      onChange={e => setNewTreatment(prev => ({ ...prev, descripcion: e.target.value }))} />
                  </div>
                  {/* Dosis */}
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '.4px', color: 'var(--gris-700)', display: 'block', marginBottom: 4 }}>Dosis</label>
                    <input style={inputStyle} type="text" placeholder="Ej: 1 pastilla, 5ml"
                      value={newTreatment.dosis}
                      onChange={e => setNewTreatment(prev => ({ ...prev, dosis: e.target.value }))} />
                  </div>
                  {/* Frecuencia */}
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '.4px', color: 'var(--gris-700)', display: 'block', marginBottom: 4 }}>Frecuencia</label>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <input style={{ ...inputStyle, width: 60 }} type="number" min={1} max={24}
                        value={newTreatment.frecuencia}
                        onChange={e => setNewTreatment(prev => ({ ...prev, frecuencia: parseInt(e.target.value) || 1 }))} />
                      <select style={{ ...selectStyle, flex: 1 }}
                        value={newTreatment.frecuencia_unidad}
                        onChange={e => setNewTreatment(prev => ({ ...prev, frecuencia_unidad: e.target.value as any }))}>
                        <option value="dia">vez(es) al día</option>
                        <option value="semana">vez(es) a la semana</option>
                        <option value="mes">vez(es) al mes</option>
                      </select>
                    </div>
                  </div>
                  {/* Duración */}
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '.4px', color: 'var(--gris-700)', display: 'block', marginBottom: 4 }}>Duración</label>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <select style={{ ...selectStyle, flex: 1 }}
                        value={newTreatment.duracion_unidad}
                        onChange={e => setNewTreatment(prev => ({ ...prev, duracion_unidad: e.target.value as any }))}>
                        <option value="indefinido">Tratamiento continuo</option>
                        <option value="dias">Días</option>
                        <option value="semanas">Semanas</option>
                        <option value="meses">Meses</option>
                      </select>
                      {newTreatment.duracion_unidad !== 'indefinido' && (
                        <input style={{ ...inputStyle, width: 60 }} type="number" min={1}
                          value={newTreatment.duracion || ''}
                          onChange={e => setNewTreatment(prev => ({ ...prev, duracion: parseInt(e.target.value) || 1 }))} />
                      )}
                    </div>
                  </div>
                  {/* Notas */}
                  <div style={{ gridColumn: '1/-1' }}>
                    <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '.4px', color: 'var(--gris-700)', display: 'block', marginBottom: 4 }}>Notas (opcional)</label>
                    <input style={inputStyle} type="text" placeholder="Ej: Tomar con comida, no mezclar con alcohol"
                      value={newTreatment.notas}
                      onChange={e => setNewTreatment(prev => ({ ...prev, notas: e.target.value }))} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                  <button className="btn-primary" style={{ fontSize: 12 }} onClick={addTreatment}>Guardar indicación</button>
                  <button className="btn-ghost" style={{ fontSize: 12 }} onClick={() => setShowAddTreatment(false)}>Cancelar</button>
                </div>
              </div>
            )}
          </div>

          {/* Adherencia — vista del doctor */}
          <div className="card">
            <div className="card-title">📊 Adherencia al tratamiento</div>
            <p style={{ fontSize: 13, color: 'var(--gris-500)', marginBottom: 14 }}>
              Resumen de cumplimiento reportado por el paciente desde la app.
            </p>
            {treatments.map(t => (
              <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--gris-200)' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{t.descripcion}</div>
                  <div style={{ fontSize: 11, color: 'var(--gris-500)' }}>{formatFrecuencia(t)} · {formatDuracion(t)}</div>
                </div>
                {/* Días de adherencia mock — René reemplaza con datos reales */}
                <div style={{ display: 'flex', gap: 4 }}>
                  {[true, true, false, true, true, true, false].map((cumplido, i) => (
                    <div key={i} style={{
                      width: 22, height: 22, borderRadius: 4, fontSize: 10, fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: cumplido ? 'var(--teal-light)' : 'var(--rojo-light)',
                      color: cumplido ? 'var(--teal)' : 'var(--rojo)',
                    }}>
                      {cumplido ? '✓' : '✗'}
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--teal)', width: 40, textAlign: 'right' as const }}>
                  71%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* EXAMENES */}
      {activeTab === 'examenes' && (
        <div className="two-col">
          <div className="card">
            <div className="card-title">📋 Solicitados</div>
            <div className="examen-item"><div className="examen-icon">🩸</div><div><div style={{ fontSize: 13, fontWeight: 600 }}>Examen de sangre</div><div style={{ fontSize: 11, color: 'var(--gris-500)' }}>Resultado recibido</div></div></div>
            <div className="examen-item"><div className="examen-icon">⚗️</div><div><div style={{ fontSize: 13, fontWeight: 600 }}>Perfil hormonal (FSH, LH, E2)</div><div style={{ fontSize: 11, color: 'var(--amber)' }}>⏳ Pendiente</div></div></div>
          </div>
          <div className="card">
            <div className="card-title">📎 Subidos por el paciente</div>
            <div className="examen-item">
              <div className="examen-icon">📄</div>
              <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 600 }}>Examen de sangre</div><div style={{ fontSize: 11, color: 'var(--gris-500)' }}>Feb 24</div></div>
              <span className="examen-link">Ver →</span>
            </div>
          </div>
        </div>
      )}

      {/* NOTAS */}
      {activeTab === 'notas' && (
        <div className="card">
          <div className="card-title">📝 Notas post-consulta</div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 8 }}>
            <textarea className="nota-editor" placeholder="Escribe o dicta una nota..." value={notaText} onChange={e => setNotaText(e.target.value)} />
            <button onClick={toggleVoice} title="Dictar por voz"
              style={{ width: 40, height: 40, borderRadius: '50%', border: '2px solid', background: isRecording ? 'var(--rojo-light)' : 'var(--gris-100)', borderColor: isRecording ? 'var(--rojo)' : 'var(--gris-200)', color: 'var(--gris-500)', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {isRecording ? '⏹️' : '🎙️'}
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button className="btn-primary" style={{ fontSize: 13 }} onClick={() => showToast('Nota guardada')}>Guardar nota</button>
            <span style={{ fontSize: 12, color: 'var(--gris-500)' }}>{voiceStatus}</span>
          </div>
          <div style={{ marginTop: 20 }}>
            <div className="nota-item">
              <div className="nota-fecha">Feb 24, 2026 · Primera consulta</div>
              <div className="nota-texto">Paciente presenta síntomas compatibles con perimenopausia. Se inicia tratamiento con amitriptilina y Angeliq. Se solicitan exámenes de perfil hormonal completo. Seguimiento en 3 semanas.</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
