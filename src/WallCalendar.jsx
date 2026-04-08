import React, { useState, useEffect } from 'react';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  addDays,
  isWithinInterval,
  isAfter,
  isBefore
} from 'date-fns';
import { ChevronLeft, ChevronRight, Moon, Sun, Check, Bell, Trash2, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Holidays from 'date-holidays';
import './WallCalendar.css';

const hd = new Holidays('IN');

const MONTH_IMAGES = [
  'https://images.unsplash.com/photo-1482192596544-9eb780fc7f66?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1400&q=80',
];

const WallCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 3, 8));
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const [notesData, setNotesData] = useState(() => {
    const saved = localStorage.getItem('calendarNotesData');
    return saved
      ? JSON.parse(saved)
      : {
          general: '',
          reminders: {}
        };
  });

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [direction, setDirection] = useState('next');

  const [reminderText, setReminderText] = useState('');
  const [reminderTime, setReminderTime] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  const activeDateKey = startDate
    ? (endDate && !isSameDay(startDate, endDate)
      ? `${format(startDate, 'yyyy-MM-dd')}:${format(endDate, 'yyyy-MM-dd')}`
      : format(startDate, 'yyyy-MM-dd'))
    : 'general';

  const isSingleDateSelected = startDate && (!endDate || isSameDay(startDate, endDate));
  const singleSelectedDateKey = isSingleDateSelected ? format(startDate, 'yyyy-MM-dd') : null;

  const [draftNote, setDraftNote] = useState(() => notesData[activeDateKey] || '');

  useEffect(() => {
    setDraftNote(notesData[activeDateKey] || '');
  }, [activeDateKey, notesData]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('calendarNotesData', JSON.stringify(notesData));
  }, [notesData]);

  useEffect(() => {
    if ('Notification' in window) {
      setNotificationsEnabled(Notification.permission === 'granted');
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!('Notification' in window) || Notification.permission !== 'granted') return;

      const now = new Date();
      const todayKey = format(now, 'yyyy-MM-dd');
      const currentTime = format(now, 'HH:mm');

      const todaysReminders = notesData.reminders?.[todayKey] || [];

      todaysReminders.forEach((reminder) => {
        const notifiedKey = `notified-${todayKey}-${reminder.id}`;
        const alreadyNotified = localStorage.getItem(notifiedKey);

        if (reminder.time === currentTime && !alreadyNotified) {
          new Notification('⏰ Reminder', {
            body: `${reminder.time} — ${reminder.text}`,
          });
          localStorage.setItem(notifiedKey, 'true');
        }
      });
    }, 30000);

    return () => clearInterval(interval);
  }, [notesData]);

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      alert('This browser does not support notifications.');
      return;
    }

    const permission = await Notification.requestPermission();
    setNotificationsEnabled(permission === 'granted');
  };

  const nextMonth = () => {
    setDirection('next');
    setCurrentDate(addMonths(currentDate, 1));
  };

  const prevMonth = () => {
    setDirection('prev');
    setCurrentDate(subMonths(currentDate, 1));
  };

  const onDateClick = (day) => {
    if (!startDate && !endDate) {
      setStartDate(day);
    } else if (startDate && !endDate) {
      if (isBefore(day, startDate)) {
        setStartDate(day);
      } else {
        setEndDate(day);
      }
    } else if (startDate && endDate) {
      setStartDate(day);
      setEndDate(null);
    }
  };

  const handleNoteChange = (e) => {
    setDraftNote(e.target.value);
  };

  const handleConfirmNote = () => {
    setNotesData(prev => ({
      ...prev,
      [activeDateKey]: draftNote
    }));
  };

  const handleAddReminder = () => {
    if (!singleSelectedDateKey) {
      alert('Please select a single date to add a reminder.');
      return;
    }

    if (!reminderText.trim() || !reminderTime) {
      alert('Please enter reminder text and time.');
      return;
    }

    const newReminder = {
      id: Date.now().toString(),
      text: reminderText.trim(),
      time: reminderTime
    };

    setNotesData(prev => {
      const existing = prev.reminders?.[singleSelectedDateKey] || [];
      const updatedReminders = [...existing, newReminder].sort((a, b) =>
        a.time.localeCompare(b.time)
      );

      return {
        ...prev,
        reminders: {
          ...prev.reminders,
          [singleSelectedDateKey]: updatedReminders
        }
      };
    });

    setReminderText('');
    setReminderTime('');
  };

  const handleDeleteReminder = (dateKey, reminderId) => {
    setNotesData(prev => {
      const updated = (prev.reminders?.[dateKey] || []).filter(r => r.id !== reminderId);

      return {
        ...prev,
        reminders: {
          ...prev.reminders,
          [dateKey]: updated
        }
      };
    });
  };

  const activeReminders = singleSelectedDateKey
    ? (notesData.reminders?.[singleSelectedDateKey] || []).sort((a, b) => a.time.localeCompare(b.time))
    : [];

  const renderHeader = () => {
    return (
      <div className="hero-section">
        <img
          src={MONTH_IMAGES[currentDate.getMonth()]}
          alt="Calendar Hero"
          className="hero-image"
        />
        <div className="hero-shape-container">
          <div className="hero-shape-left"></div>
          <div className="hero-shape-right">
            <div className="month-year-display">
              <span className="year">{format(currentDate, 'yyyy')}</span>
              <span className="month">{format(currentDate, 'MMMM')}</span>
            </div>
          </div>
        </div>
        <div className="navigation-buttons">
          <button
            onClick={requestNotificationPermission}
            className="nav-btn"
            title="Enable Notifications"
          >
            <Bell size={20} />
          </button>
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="nav-btn" title="Toggle Dark Mode">
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button onClick={prevMonth} className="nav-btn"><ChevronLeft size={24} /></button>
          <button onClick={nextMonth} className="nav-btn"><ChevronRight size={24} /></button>
        </div>
      </div>
    );
  };

  const renderDays = () => {
    const days = [];
    const dateFormat = 'EEE';
    let startDateOfWeek = startOfWeek(currentDate, { weekStartsOn: 1 });

    for (let i = 0; i < 7; i++) {
      days.push(
        <div className="day-name" key={i}>
          {format(addDays(startDateOfWeek, i), dateFormat).toUpperCase()}
        </div>
      );
    }

    return <div className="days-row">{days}</div>;
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDateOfWeek = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDateOfWeek = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const startYear = format(monthStart, 'yyyy');
    const endYear = format(monthEnd, 'yyyy');
    let holidaysList = hd.getHolidays(startYear);
    if (startYear !== endYear) {
      holidaysList = holidaysList.concat(hd.getHolidays(endYear));
    }

    const holidayMap = {};
    holidaysList.forEach(h => {
      holidayMap[format(new Date(h.date), 'yyyy-MM-dd')] = h.name;
    });

    const rows = [];
    let days = [];
    let day = startDateOfWeek;
    let formattedDate = '';

    const notesEvents = Object.entries(notesData)
      .filter(([key, text]) => key !== 'general' && key !== 'reminders' && typeof text === 'string' && text.trim() !== '')
      .map(([key, text]) => {
        const parts = key.split(':');
        return {
          id: key,
          start: new Date(parts[0] + 'T00:00:00'),
          end: new Date((parts[1] || parts[0]) + 'T00:00:00'),
          text
        };
      });

    while (day <= endDateOfWeek) {
      let weekStartDay = day;
      let weekEndDay = addDays(weekStartDay, 6);

      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, 'd');
        const cloneDay = day;

        let isSelectedStart = startDate && isSameDay(day, startDate);
        let isSelectedEnd = endDate && isSameDay(day, endDate);
        let isInRange = startDate && endDate && isWithinInterval(day, { start: startDate, end: endDate });

        let dayClass = 'day-cell';
        if (!isSameMonth(day, monthStart)) {
          dayClass += ' disabled';
        } else if (isSameDay(day, new Date())) {
          dayClass += ' today';
        }

        if (isSelectedStart) dayClass += ' selected selected-start';
        if (isSelectedEnd) dayClass += ' selected selected-end';
        if (isInRange && !isSelectedStart && !isSelectedEnd) dayClass += ' in-range';

        let formattedDateKey = format(day, 'yyyy-MM-dd');
        let holidayName = holidayMap[formattedDateKey];
        const reminderCount = notesData.reminders?.[formattedDateKey]?.length || 0;

        if (holidayName) dayClass += ' holiday';

        days.push(
          <div
            className={dayClass}
            key={cloneDay.toString()}
            onClick={() => onDateClick(cloneDay)}
            title={holidayName || null}
          >
            <span className="day-number">{formattedDate}</span>
            {holidayName && <span className="holiday-label">{holidayName}</span>}
            {reminderCount > 0 && (
              <span className="reminder-dot">{reminderCount}</span>
            )}
          </div>
        );
        day = addDays(day, 1);
      }

      const weekEventsLayout = notesEvents
        .filter(ev => {
          return isBefore(ev.start, addDays(weekEndDay, 1)) && !isBefore(ev.end, weekStartDay);
        })
        .map((ev, index) => {
          let startCol = 0;
          if (!isBefore(ev.start, weekStartDay)) {
            startCol = (ev.start.getDay() + 6) % 7;
          }

          let endCol = 6;
          if (!isAfter(ev.end, weekEndDay)) {
            endCol = (ev.end.getDay() + 6) % 7;
          }

          const leftPercent = (startCol / 7) * 100;
          const widthPercent = ((endCol - startCol + 1) / 7) * 100;

          return (
            <div
              key={ev.id}
              className={`multi-day-bar ${ev.start.getTime() === ev.end.getTime() ? 'single-day' : ''}`}
              style={{
                left: `calc(${leftPercent}% + 2px)`,
                width: `calc(${widthPercent}% - 4px)`,
                bottom: `${12 + (index * 16)}px`
              }}
            >
              {ev.text}
            </div>
          );
        });

      rows.push(
        <div className="week-row" key={weekStartDay.toString()} style={{ position: 'relative' }}>
          {days}
          {weekEventsLayout}
        </div>
      );
      days = [];
    }

    return <div className="cells-container">{rows}</div>;
  };

  let activeNotesTitle = 'Add a Note';
  if (startDate) {
    if (endDate && !isSameDay(startDate, endDate)) {
      activeNotesTitle = `Notes for ${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d, yyyy')}`;
    } else {
      activeNotesTitle = `Notes for ${format(startDate, 'MMM d, yyyy')}`;
    }
  }

  const pageVariants = {
    enter: (dir) => ({
      rotateX: dir === 'prev' ? 180 : 0,
      zIndex: dir === 'prev' ? 2 : 1,
      opacity: dir === 'prev' ? 0 : 1,
    }),
    center: {
      rotateX: 0,
      zIndex: 1,
      opacity: 1,
      transition: { duration: 0.8, type: 'tween', ease: 'easeInOut' }
    },
    exit: (dir) => ({
      rotateX: dir === 'next' ? 180 : 0,
      zIndex: dir === 'next' ? 2 : 1,
      opacity: dir === 'next' ? 0 : 1,
      transition: { duration: 0.8, type: 'tween', ease: 'easeInOut' }
    })
  };

  return (
    <div className="wall-calendar-container">
      <div className="spiral-binding">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="coil"></div>
        ))}
        <div className="hanger"></div>
      </div>

      <div style={{ position: 'relative', width: '100%', perspective: '1200px' }}>
        <AnimatePresence mode="popLayout" custom={direction} initial={false}>
          <motion.div
            key={currentDate.toString()}
            className="calendar-paper"
            custom={direction}
            variants={pageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            style={{ transformOrigin: 'top center', width: '100%' }}
          >
            {renderHeader()}
            <div className="calendar-body">
              <div className="notes-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 className="notes-title" style={{ marginBottom: 0 }}>{activeNotesTitle}</h3>
                  {draftNote !== (notesData[activeDateKey] || '') && (
                    <button
                      onClick={handleConfirmNote}
                      className="nav-btn"
                      style={{ background: 'var(--primary)', color: 'white', width: '28px', height: '28px' }}
                      title="Save Note"
                    >
                      <Check size={16} />
                    </button>
                  )}
                </div>

                <textarea
                  value={draftNote}
                  onChange={handleNoteChange}
                  placeholder={activeDateKey === 'general' ? "Jot down memos here..." : "Notes for this day..."}
                  className="notes-input"
                  spellCheck="false"
                />

                <div className="reminder-panel">
                  <div className="reminder-panel-header">
                    <h4>Reminders</h4>
                    <span className={`notif-badge ${notificationsEnabled ? 'enabled' : ''}`}>
                      {notificationsEnabled ? 'Notifications On' : 'Notifications Off'}
                    </span>
                  </div>

                  {isSingleDateSelected ? (
                    <>
                      <div className="reminder-form">
                        <input
                          type="text"
                          value={reminderText}
                          onChange={(e) => setReminderText(e.target.value)}
                          placeholder="Reminder title"
                          className="reminder-input"
                        />
                        <div className="reminder-form-row">
                          <input
                            type="time"
                            value={reminderTime}
                            onChange={(e) => setReminderTime(e.target.value)}
                            className="reminder-time"
                          />
                          <button className="add-reminder-btn" onClick={handleAddReminder}>
                            <Plus size={16} />
                            Add
                          </button>
                        </div>
                      </div>

                      <div className="reminder-list">
                        {activeReminders.length === 0 ? (
                          <p className="empty-reminders">No reminders for this day yet.</p>
                        ) : (
                          activeReminders.map(reminder => (
                            <div key={reminder.id} className="reminder-item">
                              <div className="reminder-item-left">
                                <span className="reminder-time-badge">{reminder.time}</span>
                                <span className="reminder-text">{reminder.text}</span>
                              </div>
                              <button
                                className="delete-reminder-btn"
                                onClick={() => handleDeleteReminder(singleSelectedDateKey, reminder.id)}
                                title="Delete reminder"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </>
                  ) : (
                    <p className="empty-reminders">
                      Select a single date to add time-based reminders.
                    </p>
                  )}
                </div>
              </div>

              <div className="grid-section">
                <h2 className="grid-month-title">{format(currentDate, 'MMMM yyyy')}</h2>
                <div className="calendar-grid">
                  {renderDays()}
                  {renderCells()}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default WallCalendar;