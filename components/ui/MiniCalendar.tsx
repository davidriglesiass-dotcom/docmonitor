'use client';
import { useState } from 'react';
import { MONTHS, APT_DAYS } from '@/lib/data';

export default function MiniCalendar() {
  const [calYear, setCalYear] = useState(2026);
  const [calMonth, setCalMonth] = useState(2); // March = 2

  function calNav(dir: number) {
    let m = calMonth + dir;
    let y = calYear;
    if (m > 11) { m = 0; y++; }
    if (m < 0) { m = 11; y--; }
    setCalMonth(m);
    setCalYear(y);
  }

  const firstDay = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const offset = firstDay === 0 ? 6 : firstDay - 1;
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === calYear && today.getMonth() === calMonth;
  const aptDays = APT_DAYS[calMonth] || [];

  const empties = Array.from({ length: offset }, (_, i) => (
    <div key={`e-${i}`} className="cal-day empty"></div>
  ));

  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const d = i + 1;
    const isToday = isCurrentMonth && d === today.getDate();
    const hasApt = aptDays.includes(d);
    return (
      <div key={d} className={`cal-day${isToday ? ' today' : ''}${hasApt ? ' has-apt' : ''}`}>
        {d}
      </div>
    );
  });

  return (
    <div className="mini-cal">
      <div className="cal-header">
        <button className="cal-nav" onClick={() => calNav(-1)}>‹</button>
        <div className="cal-month">{MONTHS[calMonth]} {calYear}</div>
        <button className="cal-nav" onClick={() => calNav(1)}>›</button>
      </div>
      <div className="cal-grid">
        {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(d => (
          <div key={d} className="cal-dn">{d}</div>
        ))}
        {empties}
        {days}
      </div>
    </div>
  );
}
