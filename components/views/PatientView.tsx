'use client';
import { useState, useRef } from 'react';
import { PatientTab } from '@/lib/types';
import { PATIENTS, ICD_LOCAL } from '@/lib/data';

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
  const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  return `${parseInt(d)} ${months[parseInt(m) - 1]} ${y}`;
}

export default function PatientView({ patientId, onBack, onOpenModal, showToast }: PatientViewProps) {
  const [activeTab, setActiveTab] = useState<PatientTab>('resumen');
  const [treatments, setTreatments] = useState([
    { id: 1, text: 'Tomar amitriptilina diariamente antes de dormir', done: false },
    { id: 2, text: 'Tomar Angeliq diariamente', done: false },
    { id: 3, text: 'Eliminar cigarro', done: false },
  ]);
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

  function searchICD(q: string) {
    setIcdQuery(q);
    if (q.length < 2) { setShowIcdDd(false); return; }
    setShowIcdDd(true);
    const results = ICD_LOCAL.filter(i =>
      i.desc.toLowerCase().includes(q.toLowerCase()) || i.code.toLowerCase().includes(q.toLowerCase())
    );
    setIcdResults(results);
  }

  function selectICD(code: string, desc: string) {
    if (!icdChips.find(c => c.code === code)) {
      setIcdChips(prev => [...prev, { code, desc }]);
    }
    setShowIcdDd(false);
    setIcdQuery('');
  }

  function addCPT() {
    if (!cptInputRef.current?.value.trim()) return;
    const val = cptInputRef.current.value.trim();
    const code = val.split(' ')[0];
    setCptChips(prev => [...prev, { code, desc: val }]);
    cptInputRef.current.value = '';
    showToast('Código CPT agregado');
  }

  function toggleVoice() {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { showToast('Usa Chrome para dictar por voz'); return; }
    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      return;
    }
    const recognition = new SR();
    recognitionRef.current = recognition;
    recognition.lang = 'es-PA';
    recognition.continuous = true;
    recognition.interimResults = true;
    let base = notaText;
    recognition.onstart = () => {
      setIsRecording(true);
      setVoiceStatus('🔴 Grabando...');
    };
    recognition.onresult = (e: any) => {
      let interim = '', final = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) final += e.results[i][0].transcript;
        else interim += e.results[i][0].transcript;
      }
      if (final) base += (base ? ' ' : '') + final;
      setNotaText(base + (interim ? ' ' + interim : ''));
    };
    recognition.onend = () => {
      setIsRecording(false);
      setVoiceStatus('');
    };
    recognition.onerror = () => {
      setIsRecording(false);
      setVoiceStatus('');
    };
    recognition.start();
  }

  return (
    <div>
      <button className="back-btn" onClick={onBack}>← Volver a agenda</button>

      <div className="patient-header-card">
        <div className="ph-avatar" style={{ background: patient.bgColor, color: patient.textColor, fontFamily: "'Lora', serif" }}>{patient.initials}</div>
        <div style={{ flex: 1 }}>
          <div className="ph-name">{patient.name}</div>
          <div className="ph-meta">
            {/* Edad — calculada desde dob si está disponible */}
            <span>👤 {patient.age} años</span>
            {/* Fecha de nacimiento */}
            {patient.dob && (
              <span>🎂 {formatDob(patient.dob)}</span>
            )}
            {/* Género */}
            {patient.gender && (
              <span>⚧ {GENDER_LABEL[patient.gender] ?? patient.gender}</span>
            )}
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
                  <div className="trat-text">{t.text}</div>
                  <div className="trat-status" style={{ color: t.done ? 'var(--teal)' : undefined }}>{t.done ? '✓ Cumplida' : 'Pendiente'}</div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="card">
              <div className="card-title">🔔 Síntomas recientes</div>
              <div className="sintoma-item">
                <div className="sintoma-dot"></div>
                <div><div style={{ fontSize: 13 }}>Ha sentido mareos</div><div className="sintoma-time">Hoy, 8:40</div></div>
              </div>
              <div className="sintoma-item">
                <div className="sintoma-dot" style={{ background: 'var(--amber)' }}></div>
                <div><div style={{ fontSize: 13 }}>Dificultad para dormir</div><div className="sintoma-time">Ayer, 22:10</div></div>
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
                <input
                  className="icd-input"
                  type="text"
                  autoComplete="off"
                  placeholder="Buscar diagnóstico (ej: menopausia, diabetes...)"
                  value={icdQuery}
                  onChange={e => searchICD(e.target.value)}
                />
                {showIcdDd && (
                  <div className="icd-dd" style={{ display: 'block' }}>
                    {icdResults.length === 0 ? (
                      <div style={{ padding: '10px 14px', fontSize: 12, color: 'var(--gris-500)', fontStyle: 'italic' }}>Sin resultados para esta búsqueda</div>
                    ) : (
                      icdResults.map(item => (
                        <div key={item.code} className="icd-opt" onClick={() => selectICD(item.code, item.desc)}>
                          <span className="icd-code">{item.code}</span>
                          <span className="icd-desc">{item.desc}</span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
              <div className="icd-chips">
                {icdChips.map(c => (
                  <div key={c.code} className="icd-chip">
                    <span className="icd-chip-code">{c.code}</span>
                    <span>{c.desc}</span>
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
              <p style={{ fontSize: 12, color: 'var(--gris-500)', marginBottom: 10 }}>Código de procedimiento para referencia.</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
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
        <div className="card">
          <div className="card-title">💊 Indicaciones actuales</div>
          {treatments.map(t => (
            <div key={t.id} className={`trat-item${t.done ? ' done' : ''}`} style={t.done ? { background: 'var(--teal-light)' } : undefined}>
              <div className="trat-check"></div>
              <div className="trat-text">{t.text}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div className="trat-status" style={{ color: t.done ? 'var(--teal)' : undefined }}>{t.done ? '✓ Cumplida' : 'Pendiente'}</div>
                <button style={{ fontSize: 11, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', color: t.done ? 'var(--teal)' : 'var(--gris-500)', fontFamily: "'Sora', sans-serif" }} onClick={() => markDone(t.id)}>
                  {t.done ? 'Desmarcar' : 'Marcar cumplida'}
                </button>
              </div>
            </div>
          ))}
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--gris-200)' }}>
            <div className="form-group" style={{ marginBottom: 10 }}>
              <label className="form-label">Nueva indicación</label>
              <input className="form-input" type="text" placeholder="Ej: Vitamina D 1000UI diaria" />
            </div>
            <button className="btn-primary" style={{ fontSize: 12, padding: '8px 16px' }}>+ Agregar</button>
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
            <button
              onClick={toggleVoice}
              title="Dictar por voz"
              style={{
                width: 40, height: 40, borderRadius: '50%', border: '2px solid var(--gris-200)',
                background: isRecording ? 'var(--rojo-light)' : 'var(--gris-100)',
                borderColor: isRecording ? 'var(--rojo)' : 'var(--gris-200)',
                color: 'var(--gris-500)', cursor: 'pointer', fontSize: 18,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}
            >
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
