'use client';
import { useState, useEffect, useRef } from 'react';
import { ViewName, Notification } from '@/lib/types';
import { NOTIFICATIONS } from '@/lib/data';

interface TopbarProps {
  currentView: ViewName;
  onViewChange: (view: ViewName) => void;
  onPatientSelect: (id: string) => void;
  showToast: (msg: string) => void;
}

export default function Topbar({ currentView, onViewChange, onPatientSelect, showToast }: TopbarProps) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(NOTIFICATIONS);
  const wrapRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => n.unread).length;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  function markAllRead() {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
    showToast('Notificaciones leídas');
  }

  const navItems: { id: ViewName; icon: string; label: string }[] = [
    { id: 'agenda', icon: '📅', label: 'Agenda' },
    { id: 'pacientes', icon: '👥', label: 'Pacientes' },
    { id: 'reportes', icon: '📊', label: 'Reportes' },
    { id: 'config', icon: '⚙️', label: 'Config' },
  ];

  return (
    <div className="topbar">
      <div className="brand" onClick={() => onViewChange('agenda')}>MiDoc<span>Link</span></div>
      <div className="topbar-nav">
        {navItems.map(item => (
          <button
            key={item.id}
            className={`topbar-btn${currentView === item.id ? ' active' : ''}`}
            onClick={() => onViewChange(item.id)}
          >
            {item.icon} {item.label}
          </button>
        ))}
      </div>
      <div className="notif-wrap" style={{ marginLeft: 8 }} ref={wrapRef}>
        <button className="notif-bell" onClick={() => setNotifOpen(!notifOpen)}>
          🔔
          {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
        </button>
        <div className={`notif-panel${notifOpen ? ' open' : ''}`}>
          <div className="notif-head">
            <h4>Notificaciones</h4>
            <button onClick={markAllRead}>Marcar leídas</button>
          </div>
          {notifications.map(n => (
            <div
              key={n.id}
              className={`notif-item${n.unread ? ' unread' : ''}`}
              onClick={() => { onPatientSelect(n.patientId); setNotifOpen(false); }}
            >
              <div className="notif-icon" style={{ background: n.iconBg }}>{n.icon}</div>
              <div>
                <div className="notif-text"><strong>{n.boldName}</strong> {n.text}</div>
                <div className="notif-time">{n.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="doc-badge">
        <div className="doc-avatar">DR</div>
        <div>
          <div className="doc-name">Dr. David Iglesias</div>
          <div className="doc-spec">Ginecología</div>
        </div>
      </div>
    </div>
  );
}
