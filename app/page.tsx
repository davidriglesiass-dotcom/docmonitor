'use client';
import { useState, useCallback, useRef } from 'react';
import { ViewName } from '@/lib/types';
import Topbar from '@/components/layout/Topbar';
import Sidebar from '@/components/layout/Sidebar';
import AgendaView from '@/components/views/AgendaView';
import PatientView from '@/components/views/PatientView';
import PatientsView from '@/components/views/PatientsView';
import ReportsView from '@/components/views/ReportsView';
import ConfigView from '@/components/views/ConfigView';
import NewPatientView from '@/components/views/NewPatientView';
import Modal from '@/components/ui/Modal';
import Toast from '@/components/ui/Toast';

const SIDEBAR_VIEWS: ViewName[] = ['agenda', 'paciente'];

export default function Home() {
  const [currentView, setCurrentView] = useState<ViewName>('agenda');
  const [activePatientId, setActivePatientId] = useState('monica');
  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [openModals, setOpenModals] = useState<Record<string, boolean>>({});

  // Bloqueo modal state
  const blqTipoRef = useRef<HTMLSelectElement>(null);
  const blqIniRef = useRef<HTMLInputElement>(null);
  const blqFinRef = useRef<HTMLInputElement>(null);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
  }, []);

  const hideToast = useCallback(() => setToastVisible(false), []);

  function showView(name: ViewName) {
    setCurrentView(name);
  }

  function showPatient(id: string) {
    setActivePatientId(id);
    setCurrentView('paciente');
  }

  function openModal(id: string) {
    setOpenModals(prev => ({ ...prev, [id]: true }));
  }

  function closeModal(id: string) {
    setOpenModals(prev => ({ ...prev, [id]: false }));
  }

  const showSidebar = SIDEBAR_VIEWS.includes(currentView);

  return (
    <>
      <Topbar
        currentView={currentView}
        onViewChange={showView}
        onPatientSelect={showPatient}
        showToast={showToast}
      />

      <div className="app">
        {showSidebar && (
          <Sidebar activePatientId={activePatientId} onPatientSelect={showPatient} />
        )}
        <div className="main">
          {currentView === 'agenda' && (
            <AgendaView onPatientSelect={showPatient} onOpenModal={openModal} />
          )}
          {currentView === 'paciente' && (
            <PatientView
              patientId={activePatientId}
              onBack={() => showView('agenda')}
              onOpenModal={openModal}
              showToast={showToast}
            />
          )}
          {currentView === 'pacientes' && (
            <PatientsView
              onPatientSelect={showPatient}
              onNewPatient={() => showView('nueva-paciente')}
              onOpenModal={openModal}
            />
          )}
          {currentView === 'reportes' && (
            <ReportsView onOpenModal={openModal} />
          )}
          {currentView === 'config' && (
            <ConfigView showToast={showToast} onOpenModal={openModal} />
          )}
          {currentView === 'nueva-paciente' && (
            <NewPatientView
              onBack={() => showView('pacientes')}
              showToast={showToast}
            />
          )}
        </div>
      </div>

      {/* ═══ MODALES ═══ */}

      {/* Nueva Cita */}
      <Modal id="cita" isOpen={!!openModals.cita} onClose={() => closeModal('cita')}>
        <div className="modal-title">Nueva cita</div>
        <div className="modal-sub">Agenda una cita para un paciente</div>
        <div className="modal-form">
          <div className="form-group"><label className="form-label">Paciente</label>
            <select className="form-select"><option>Mónica Varela</option><option>Rosa Pérez</option><option>Carmen López</option><option>+ Nueva paciente</option></select>
          </div>
          <div className="modal-row">
            <div className="form-group"><label className="form-label">Fecha</label><input className="form-input" type="date" defaultValue="2026-03-28" /></div>
            <div className="form-group"><label className="form-label">Hora</label><input className="form-input" type="time" defaultValue="09:00" /></div>
          </div>
          <div className="modal-row">
            <div className="form-group"><label className="form-label">Duración</label><select className="form-select" defaultValue="45 min"><option>30 min</option><option>45 min</option><option>60 min</option></select></div>
            <div className="form-group"><label className="form-label">Tipo</label><select className="form-select"><option>Seguimiento</option><option>Primera consulta</option><option>Urgencia</option></select></div>
          </div>
          <div className="form-group"><label className="form-label">Notificar al paciente</label>
            <select className="form-select"><option>WhatsApp + Email</option><option>Solo WhatsApp</option><option>No notificar</option></select>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-ghost" onClick={() => closeModal('cita')}>Cancelar</button>
          <button className="btn-primary" onClick={() => { closeModal('cita'); showToast('Cita guardada · WhatsApp enviado'); }}>Guardar cita</button>
        </div>
      </Modal>

      {/* Archivar paciente */}
      <Modal id="baja" isOpen={!!openModals.baja} onClose={() => closeModal('baja')}>
        <div className="modal-title">Archivar paciente</div>
        <div className="modal-sub">No aparecerá en la lista activa. Puedes reactivarla en cualquier momento.</div>
        <div className="modal-footer">
          <button className="btn-ghost" onClick={() => closeModal('baja')}>Cancelar</button>
          <button className="btn-danger" onClick={() => { closeModal('baja'); showToast('Paciente archivada'); }}>Archivar</button>
        </div>
      </Modal>

      {/* Confirmar asistencia */}
      <Modal id="asistencia" isOpen={!!openModals.asistencia} onClose={() => closeModal('asistencia')}>
        <div className="modal-title">📱 Pedir confirmación</div>
        <div className="modal-sub">Recordatorio por WhatsApp y email.</div>
        <div className="modal-form">
          <div className="form-group"><label className="form-label">Mensaje</label>
            <textarea className="form-textarea" defaultValue="Hola Mónica, le recordamos su cita mañana a las 9:00 AM. Por favor confirme respondiendo SÍ o NO." />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-ghost" onClick={() => closeModal('asistencia')}>Cancelar</button>
          <button className="btn-primary" onClick={() => { closeModal('asistencia'); showToast('Recordatorio enviado · WhatsApp + Email'); }}>Enviar</button>
        </div>
      </Modal>

      {/* Exportar */}
      <Modal id="exportar" isOpen={!!openModals.exportar} onClose={() => closeModal('exportar')}>
        <div className="modal-title">📤 Exportar</div>
        <div className="modal-sub">Elige qué exportar.</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
          {[
            { icon: '📋', label: 'Agenda del día' },
            { icon: '📄', label: 'Historia clínica' },
            { icon: '👥', label: 'Lista pacientes' },
            { icon: '📊', label: 'Reporte adherencia' },
          ].map((opt, i) => (
            <div
              key={i}
              className="exp-opt"
              style={{ padding: 16, background: 'var(--gris-100)', borderRadius: 12, cursor: 'pointer', textAlign: 'center', border: '2px solid var(--gris-200)' }}
              onClick={(e) => {
                document.querySelectorAll('.exp-opt').forEach(el => (el as HTMLElement).style.borderColor = 'var(--gris-200)');
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--azul-med)';
              }}
            >
              <div style={{ fontSize: 24 }}>{opt.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{opt.label}</div>
            </div>
          ))}
        </div>
        <div className="modal-footer">
          <button className="btn-ghost" onClick={() => closeModal('exportar')}>Cancelar</button>
          <button className="btn-primary" onClick={() => { closeModal('exportar'); showToast('Exportando PDF...'); }}>Exportar PDF</button>
        </div>
      </Modal>

      {/* Bloqueo */}
      <Modal id="bloqueo" isOpen={!!openModals.bloqueo} onClose={() => closeModal('bloqueo')}>
        <div className="modal-title">Agregar bloqueo</div>
        <div className="modal-sub">Bloquea un período en tu agenda.</div>
        <div className="modal-form">
          <div className="form-group"><label className="form-label">Tipo</label>
            <select className="form-select" ref={blqTipoRef}>
              <option value="horario">Horario bloqueado</option>
              <option value="vacacion">Vacaciones</option>
              <option value="congreso">Congreso / evento</option>
              <option value="otro">Otro</option>
            </select>
          </div>
          <div className="modal-row">
            <div className="form-group"><label className="form-label">Fecha inicio</label><input className="form-input" type="date" ref={blqIniRef} /></div>
            <div className="form-group"><label className="form-label">Fecha fin</label><input className="form-input" type="date" ref={blqFinRef} /></div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-ghost" onClick={() => closeModal('bloqueo')}>Cancelar</button>
          <button className="btn-primary" onClick={() => { closeModal('bloqueo'); showToast('Bloqueo guardado'); }}>Guardar bloqueo</button>
        </div>
      </Modal>

      <Toast message={toastMsg} visible={toastVisible} onHide={hideToast} />
    </>
  );
}
