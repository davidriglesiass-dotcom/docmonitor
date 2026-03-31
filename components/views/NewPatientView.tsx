'use client';
import { useState, useRef } from 'react';
import { ICD_LOCAL } from '@/lib/data';

interface NewPatientViewProps {
  onBack: () => void;
  showToast: (msg: string) => void;
}

export default function NewPatientView({ onBack, showToast }: NewPatientViewProps) {
  const [step, setStep] = useState(1);
  const [icdQuery, setIcdQuery] = useState('');
  const [icdResults, setIcdResults] = useState<{ code: string; desc: string }[]>([]);
  const [showIcdDd, setShowIcdDd] = useState(false);
  const [icdChips, setIcdChips] = useState<{ code: string; desc: string }[]>([]);
  const [tempPass, setTempPass] = useState('MiDocLink2026!');

  const fields = useRef<Record<string, HTMLInputElement | null>>({});

  function regNext(current: number) {
    if (current === 1) {
      const required = ['nombre', 'apellido', 'dob', 'phone', 'email'];
      for (const key of required) {
        const el = fields.current[key];
        if (el && !el.value.trim()) {
          el.style.borderColor = 'var(--rojo)';
          el.focus();
          return;
        }
        if (el) el.style.borderColor = '';
      }
    }
    setStep(current + 1);
  }

  function searchICD(q: string) {
    setIcdQuery(q);
    if (q.length < 2) { setShowIcdDd(false); return; }
    setShowIcdDd(true);
    setIcdResults(ICD_LOCAL.filter(i => i.desc.toLowerCase().includes(q.toLowerCase()) || i.code.toLowerCase().includes(q.toLowerCase())));
  }

  function selectICD(code: string, desc: string) {
    if (!icdChips.find(c => c.code === code)) setIcdChips(prev => [...prev, { code, desc }]);
    setShowIcdDd(false);
    setIcdQuery('');
  }

  function generatePass() {
    setTempPass('MDL' + Math.random().toString(36).slice(2, 8).toUpperCase());
  }

  function finish() {
    showToast('Paciente registrada · WhatsApp enviado');
    setTimeout(onBack, 1200);
  }

  return (
    <div>
      <button className="back-btn" onClick={onBack}>← Volver a pacientes</button>
      <div className="page-header">
        <div>
          <div className="page-title">Registrar nueva paciente</div>
          <div className="page-subtitle">Completa los datos en 3 pasos</div>
        </div>
      </div>
      <div className="card" style={{ maxWidth: 660 }}>
        <div className="reg-steps">
          {[1, 2, 3].map(s => (
            <div key={s} className={`reg-step${step === s ? ' active' : ''}${step > s ? ' done' : ''}`}>
              <div className="step-num">{s}</div>
              <div className="step-lbl">{['Datos personales', 'Info médica', 'Acceso app'][s - 1]}</div>
            </div>
          ))}
        </div>

        {/* STEP 1 */}
        {step === 1 && (
          <div>
            <div className="card-title">Datos personales</div>
            <div className="form-grid">
              <div className="form-group"><label className="form-label">Nombre *</label><input ref={el => { fields.current.nombre = el; }} className="form-input" type="text" placeholder="María" /></div>
              <div className="form-group"><label className="form-label">Apellido *</label><input ref={el => { fields.current.apellido = el; }} className="form-input" type="text" placeholder="González" /></div>
              <div className="form-group"><label className="form-label">Fecha de nacimiento *</label><input ref={el => { fields.current.dob = el; }} className="form-input" type="date" /></div>
              <div className="form-group"><label className="form-label">Teléfono / WhatsApp *</label><input ref={el => { fields.current.phone = el; }} className="form-input" type="tel" placeholder="+507 6XXX-XXXX" /></div>
              <div className="form-group full"><label className="form-label">Email *</label><input ref={el => { fields.current.email = el; }} className="form-input" type="email" placeholder="paciente@email.com" /></div>
            </div>
            <div className="form-actions"><button className="btn-primary" onClick={() => regNext(1)}>Siguiente →</button></div>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div>
            <div className="card-title">Información médica inicial</div>
            <div className="form-grid">
              <div className="form-group full">
                <label className="form-label">Diagnóstico principal (ICD-10)</label>
                <div className="icd-wrap">
                  <span className="icd-icon">🔍</span>
                  <input className="icd-input" type="text" autoComplete="off" placeholder="Buscar diagnóstico ICD-10..." value={icdQuery} onChange={e => searchICD(e.target.value)} />
                  {showIcdDd && (
                    <div className="icd-dd" style={{ display: 'block' }}>
                      {icdResults.length === 0 ? (
                        <div style={{ padding: '10px 14px', fontSize: 12, color: 'var(--gris-500)', fontStyle: 'italic' }}>Sin resultados</div>
                      ) : icdResults.map(item => (
                        <div key={item.code} className="icd-opt" onClick={() => selectICD(item.code, item.desc)}>
                          <span className="icd-code">{item.code}</span><span className="icd-desc">{item.desc}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="icd-chips" style={{ marginTop: 8 }}>
                  {icdChips.map(c => (
                    <div key={c.code} className="icd-chip"><span className="icd-chip-code">{c.code}</span><span>{c.desc}</span><span className="icd-chip-x" onClick={() => setIcdChips(prev => prev.filter(x => x.code !== c.code))}>×</span></div>
                  ))}
                </div>
              </div>
              <div className="form-group"><label className="form-label">Alergias</label><input className="form-input" type="text" placeholder="Ej: Penicilina..." /></div>
              <div className="form-group"><label className="form-label">Cirugías previas</label><input className="form-input" type="text" placeholder="Ej: Cesárea 2018..." /></div>
              <div className="form-group"><label className="form-label">Medicamentos actuales</label><input className="form-input" type="text" placeholder="Ej: Metformina 500mg..." /></div>
              <div className="form-group"><label className="form-label">Tipo de sangre</label>
                <select className="form-select"><option>No sabe</option><option>A+</option><option>A-</option><option>B+</option><option>B-</option><option>AB+</option><option>AB-</option><option>O+</option><option>O-</option></select>
              </div>
            </div>
            <div className="form-actions">
              <button className="btn-ghost" onClick={() => setStep(1)}>← Atrás</button>
              <button className="btn-primary" onClick={() => regNext(2)}>Siguiente →</button>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div>
            <div className="card-title">Acceso a la app</div>
            <div style={{ background: 'var(--azul-light)', borderRadius: 10, padding: '12px 16px', marginBottom: 18, fontSize: 13, color: 'var(--azul)' }}>
              Se enviará un WhatsApp con usuario y contraseña para activar la cuenta.
            </div>
            <div className="form-grid">
              <div className="form-group full">
                <label className="form-label">Contraseña temporal</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input className="form-input" type="text" value={tempPass} onChange={e => setTempPass(e.target.value)} style={{ flex: 1 }} />
                  <button className="btn-secondary" onClick={generatePass}>Generar</button>
                </div>
              </div>
              <div className="form-group full">
                <label className="form-label">Notificar por</label>
                <div style={{ display: 'flex', gap: 16, marginTop: 6 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}><input type="checkbox" defaultChecked /> WhatsApp</label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}><input type="checkbox" defaultChecked /> Email</label>
                </div>
              </div>
            </div>
            <div className="form-actions">
              <button className="btn-ghost" onClick={() => setStep(2)}>← Atrás</button>
              <button className="btn-primary" onClick={finish}>✓ Registrar paciente</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
