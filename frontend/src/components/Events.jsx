import React from 'react';

// Profile lookups mapping user IDs to names, avatars, and departments
const userProfiles = {
  1: { name: 'Sarah Jenkins', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', dept: 'Engineering' },
  2: { name: 'David Chen', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', dept: 'Product Design' },
  3: { name: 'Aaliyah Robinson', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150', dept: 'HR & Talent' },
  4: { name: 'Yuktha', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150', dept: 'Operations' },
  5: { name: 'Shivani', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', dept: 'Marketing' }
};

const getProfileInfo = (userId) => {
  const idNum = parseInt(userId);
  if (userProfiles[idNum]) return userProfiles[idNum];
  // Deterministic fallback profiles
  const names = ['Liam Smith', 'Sophia Jones', 'Noah Garcia', 'Emma Martinez', 'Oliver Rodriguez', 'Isabella Hernandez'];
  const depts = ['Engineering', 'Marketing', 'Product Design', 'HR & Talent', 'Sales', 'Finance'];
  const name = names[idNum % names.length];
  const dept = depts[idNum % depts.length];
  const avatar = `https://i.pravatar.cc/150?img=${(idNum % 70) + 1}`;
  return { name, avatar, dept };
};

// Category details helper matching screenshot tags and colors
const getCategoryInfo = (event) => {
  const title = (event.title || '').toLowerCase();
  
  if (title.includes('meeting') || title.includes('sync') || title.includes('stand-up') || title.includes('standup') || title.includes('important')) {
    return { label: 'Team Meeting', color: '#10b981', emoji: '👥', bgColor: '#ecfdf5', textColor: '#047857' };
  }
  if (title.includes('annual') || title.includes('award') || title.includes('gala')) {
    return { label: 'Annual Day', color: '#a855f7', emoji: '🏆', bgColor: '#faf5ff', textColor: '#7e22ce' };
  }
  if (title.includes('tech') || title.includes('talk') || title.includes('developer') || title.includes('workshop') || title.includes('migration')) {
    return { label: 'Tech Talk', color: '#3b82f6', emoji: '💻', bgColor: '#eff6ff', textColor: '#1d4ed8' };
  }
  if (title.includes('hackathon') || title.includes('hack')) {
    return { label: 'Hackathon', color: '#8b5cf6', emoji: '🚀', bgColor: '#f5f3ff', textColor: '#6d28d9' };
  }
  if (title.includes('launch') || title.includes('release') || title.includes('demo') || title.includes('roadmap')) {
    return { label: 'Product Launch', color: '#ec4899', emoji: '📣', bgColor: '#fdf2f8', textColor: '#be185d' };
  }
  if (title.includes('training') || title.includes('session') || title.includes('class') || title.includes('bootcamp')) {
    return { label: 'Training Session', color: '#6366f1', emoji: '🎓', bgColor: '#e0e7ff', textColor: '#4338ca' };
  }
  if (title.includes('hr') || title.includes('activity') || title.includes('onboarding') || title.includes('welcome')) {
    return { label: 'HR Activity', color: '#f97316', emoji: '🤝', bgColor: '#fff7ed', textColor: '#c2410c' };
  }
  if (title.includes('festival') || title.includes('holiday') || title.includes('diwali') || title.includes('christmas') || title.includes('new year')) {
    return { label: 'Festival', color: '#ef4444', emoji: '🏮', bgColor: '#fef2f2', textColor: '#b91c1c' };
  }
  if (title.includes('birthday') || title.includes('celebration') || title.includes('party')) {
    return { label: 'Birthday Celebration', color: '#a855f7', emoji: '🎂', bgColor: '#faf5ff', textColor: '#7e22ce' };
  }
  if (title.includes('town') || title.includes('hall') || title.includes('all hands') || title.includes('all-hands') || title.includes('corporate')) {
    return { label: 'Town Hall Meeting', color: '#64748b', emoji: '🏛️', bgColor: '#f8fafc', textColor: '#475569' };
  }
  
  // Fallback based on ID
  const categories = [
    { label: 'Training Session', color: '#6366f1', emoji: '🎓', bgColor: '#e0e7ff', textColor: '#4338ca' },
    { label: 'Team Meeting', color: '#10b981', emoji: '👥', bgColor: '#ecfdf5', textColor: '#047857' },
    { label: 'Tech Talk', color: '#3b82f6', emoji: '💻', bgColor: '#eff6ff', textColor: '#1d4ed8' },
    { label: 'Birthday Celebration', color: '#a855f7', emoji: '🎂', bgColor: '#faf5ff', textColor: '#7e22ce' },
    { label: 'Town Hall Meeting', color: '#64748b', emoji: '🏛️', bgColor: '#f8fafc', textColor: '#475569' }
  ];
  return categories[(event.id || 0) % categories.length];
};

// Countdown Timer Component with custom square tiles styled exactly like the screenshot
const CountdownTimer = ({ targetDate, now }) => {
  const [timeLeft, setTimeLeft] = React.useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  React.useEffect(() => {
    const calculateTime = () => {
      const difference = new Date(targetDate).getTime() - now.getTime();
      if (difference <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      };
    };

    setTimeLeft(calculateTime());
  }, [targetDate, now]);

  const padZero = (num) => String(num).padStart(2, '0');

  const tileStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '60px',
    height: '60px',
    backgroundColor: '#1b1b47',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: '8px',
    minWidth: '60px'
  };

  const numberStyle = {
    fontSize: '18px',
    fontWeight: '800',
    color: '#ffffff',
    lineHeight: '1'
  };

  const labelStyle = {
    fontSize: '9px',
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: '4px',
    letterSpacing: '0.5px'
  };

  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      <div style={tileStyle}>
        <span style={numberStyle}>{padZero(timeLeft.days)}</span>
        <span style={labelStyle}>DAYS</span>
      </div>
      <div style={tileStyle}>
        <span style={numberStyle}>{padZero(timeLeft.hours)}</span>
        <span style={labelStyle}>HRS</span>
      </div>
      <div style={tileStyle}>
        <span style={numberStyle}>{padZero(timeLeft.minutes)}</span>
        <span style={labelStyle}>MIN</span>
      </div>
      <div style={tileStyle}>
        <span style={numberStyle}>{padZero(timeLeft.seconds)}</span>
        <span style={labelStyle}>SEC</span>
      </div>
    </div>
  );
};

const Events = ({
  events,
  currentUser,
  searchTerm,
  calendarExpanded,
  setCalendarExpanded,
  setShowEventModal,
  calendarMonth,
  setCalendarMonth,
  calendarSelectedDate,
  setCalendarSelectedDate,
  handleRsvpEvent,
  handleDeleteEvent,
  handleEditEvent,
  handleDuplicateEvent,
  polls,
  setShowPollModal,
  openEditPollModal,
  handleDeletePoll,
  handleVotePoll
}) => {
  // Local filter states
  const [localSearchTerm, setLocalSearchTerm] = React.useState('');
  const [selectedEventType, setSelectedEventType] = React.useState('All Event Types');
  const [selectedSchedule, setSelectedSchedule] = React.useState('All Schedules');
  const [selectedSortOrder, setSelectedSortOrder] = React.useState('Soonest First');
  const [viewMode, setViewMode] = React.useState('calendar'); // 'calendar' or 'list'

  // Dropdown menu state
  const [activeMenuEventId, setActiveMenuEventId] = React.useState(null);

  React.useEffect(() => {
    const handleOutsideClick = () => {
      setActiveMenuEventId(null);
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  // Dynamic ticking current time
  const [now, setNow] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  // Default mock opinion polls matching screenshot 3
  const defaultPolls = [
    {
      id: 991,
      question: "product launch",
      options: "Light pink",
      votes: "5:0", // 1 vote from Shivani
      creator: { id: 5, name: "Shivani" },
      visibility: "Private",
      createdAt: "2026-07-07T12:00:00"
    },
    {
      id: 992,
      question: "poll",
      options: "white theme",
      votes: "10:0,7:0", // 2 votes
      creator: { id: 10, name: "Yuktha" },
      visibility: "Public",
      createdAt: "2026-07-07T13:00:00"
    }
  ];

  const mergedPolls = [...polls];
  defaultPolls.forEach(def => {
    const exists = polls.some(p => p.question === def.question);
    if (!exists) {
      mergedPolls.push(def);
    }
  });

  // Since all events are persistently stored on the backend, resolvedEvents comes directly from the database.
  const resolvedEvents = events;

  // Calculate banner count relative to mock current time (events scheduled today or in next 24h)
  const next24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const activeEventsCount = resolvedEvents.filter(e => {
    const eDate = new Date(e.eventDate);
    const isSameDay = eDate.toDateString() === now.toDateString();
    const isWithin24h = eDate >= now && eDate <= next24h;
    return isSameDay || isWithin24h;
  }).length;

  // Filter future upcoming events for the hero card
  const sortedUpcomingEvents = resolvedEvents
    .filter(e => new Date(e.eventDate).getTime() > now.getTime())
    .sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate));

  const nextUpcomingEvent = sortedUpcomingEvents[0] || resolvedEvents.sort((a, b) => new Date(b.eventDate) - new Date(a.eventDate))[0];

  // Dynamic statistics counts matching the reference design screenshot
  const totalCorporateEvents = resolvedEvents.length;
  
  const todayEventsCount = resolvedEvents.filter(e => {
    return new Date(e.eventDate).toDateString() === now.toDateString();
  }).length;

  const myRsvpsCount = resolvedEvents.filter(e => {
    return (e.rsvps || '').split(',').includes(String(currentUser.id));
  }).length;

  const totalPollsCount = mergedPolls.length;

  // Search input query calculation
  const combinedSearch = (localSearchTerm || searchTerm || '').toLowerCase();
  
  const filteredEventsList = resolvedEvents
    .filter(event => {
      if (!combinedSearch) return true;
      return (event.title || '').toLowerCase().includes(combinedSearch) ||
             (event.description || '').toLowerCase().includes(combinedSearch) ||
             (event.location || '').toLowerCase().includes(combinedSearch);
    })
    .filter(event => {
      if (!calendarSelectedDate) return true;
      return new Date(event.eventDate).toDateString() === calendarSelectedDate.toDateString();
    })
    .filter(event => {
      if (selectedEventType === 'All Event Types') return true;
      const cat = getCategoryInfo(event);
      return cat.label === selectedEventType;
    })
    .filter(event => {
      if (selectedSchedule === 'All Schedules') return true;
      if (selectedSchedule === "Today's Agenda") {
        return new Date(event.eventDate).toDateString() === now.toDateString();
      }
      if (selectedSchedule === 'My RSVPs') {
        return (event.rsvps || '').split(',').includes(String(currentUser.id));
      }
      return true;
    });

  const finalEventsList = [...filteredEventsList].sort((a, b) => {
    const diff = new Date(a.eventDate) - new Date(b.eventDate);
    return selectedSortOrder === 'Soonest First' ? diff : -diff;
  });

  // Timeline events scheduled for today (Sprint Planning at 10:00 am and Important Meeting at 10:51 pm)
  const todayTimelineEvents = resolvedEvents
    .filter(e => new Date(e.eventDate).toDateString() === now.toDateString())
    .sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate));

  // Calendar dates variables
  const firstDayIndex = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1).getDay();
  const totalDaysInMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0).getDate();

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Event location copied to clipboard!');
  };

  // Event Deletion handler (communicates with backend to sync database)
  const handleDeleteEventLocal = (eventId) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      handleDeleteEvent(eventId);
    }
  };

  // Event Duplication handler (communicates with backend to sync database)
  const handleDuplicateEventLocal = (event) => {
    handleDuplicateEvent(event);
  };

  // Event Edit handler (communicates with backend to sync database)
  const handleEditEventLocal = (event) => {
    const newTitle = window.prompt("Edit Event Title:", event.title);
    if (newTitle) {
      const newDesc = window.prompt("Edit Event Description:", event.description) || event.description;
      const newLoc = window.prompt("Edit Event Location:", event.location) || event.location;
      const updatedData = {
        title: newTitle,
        description: newDesc,
        location: newLoc,
        eventDate: event.eventDate
      };
      handleEditEvent(event.id, updatedData);
    }
  };

  // Helper to dynamically render birthday dates relative to today
  const getDynamicDateString = (daysOffset) => {
    const d = new Date(now);
    d.setDate(d.getDate() + daysOffset);
    const options = { month: 'short', day: 'numeric' };
    const dateStr = d.toLocaleDateString('default', options);
    return daysOffset === 0 ? `${dateStr} (Today!)` : dateStr;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* 1. Agenda Alert Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        backgroundColor: '#fffbeb',
        border: '1px solid #ffe58f',
        borderRadius: '16px',
        padding: '16px 24px',
        boxShadow: 'var(--shadow-sm)',
        color: '#b45309'
      }}>
        <div style={{ fontSize: '32px', flexShrink: 0, paddingRight: '4px' }}>🔔</div>
        <div>
          <strong style={{ fontSize: '15px', color: '#92400e', display: 'block', marginBottom: '2px', fontWeight: '700' }}>Agenda Alert: Active Events</strong>
          <span style={{ fontSize: '13px', color: '#b45309', fontWeight: '500' }}>
            You have {activeEventsCount} event(s) scheduled for today or starting within the next 24 hours. Check location venues below.
          </span>
        </div>
      </div>

      {/* 2. Hero Card: Coming Up Next */}
      {nextUpcomingEvent && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '24px 32px',
          background: 'linear-gradient(135deg, #1e1b4b 0%, #2e2a85 100%)',
          borderRadius: '20px',
          color: '#ffffff',
          boxShadow: 'var(--shadow-md)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', right: '-20px', bottom: '-40px', fontSize: '200px', opacity: '0.04', pointerEvents: 'none' }}>📅</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', zIndex: 1 }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              color: '#ffffff',
              fontSize: '10px',
              fontWeight: '700',
              padding: '4px 10px',
              borderRadius: '20px',
              letterSpacing: '0.5px',
              width: 'fit-content'
            }}>
              🟣 COMING UP NEXT
            </span>
            <h2 style={{ fontSize: '24px', fontWeight: '800', margin: '4px 0 8px 0', textTransform: 'uppercase', letterSpacing: '-0.5px' }}>
              {nextUpcomingEvent.title}
            </h2>
            <div style={{ display: 'flex', gap: '20px', fontSize: '13px', color: 'rgba(255, 255, 255, 0.8)', fontWeight: '500' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                🕒 {new Date(nextUpcomingEvent.eventDate).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                📍 {nextUpcomingEvent.location || 'Online'}
              </span>
              <span style={{
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                fontSize: '11px',
                padding: '2px 8px',
                borderRadius: '6px',
                fontWeight: '600'
              }}>
                {(nextUpcomingEvent.location || '').toLowerCase().includes('room') || (nextUpcomingEvent.location || '').toLowerCase().includes('auditorium') ? 'IN-PERSON' : 'VIRTUAL'}
              </span>
            </div>
          </div>
          <div style={{ zIndex: 1 }}>
            <CountdownTimer targetDate={nextUpcomingEvent.eventDate} now={now} />
          </div>
        </div>
      )}

      {/* 3. Stats Grid (4 columns) */}
      <div className="events-stats-grid">
        {/* Card 1: Corporate Events */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '24px 20px',
          border: '1.5px solid #2563eb',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-primary)', lineHeight: '1' }}>{totalCorporateEvents}</div>
            <div style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--text-primary)', marginTop: '8px' }}>Corporate Events Listed</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Total calendar schedule</div>
          </div>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', boxShadow: 'var(--shadow-sm)' }}>🏛️</div>
        </div>

        {/* Card 2: Today's Office Agenda */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '24px 20px',
          border: '1.5px solid #10b981',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-primary)', lineHeight: '1' }}>{todayEventsCount}</div>
            <div style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--text-primary)', marginTop: '8px' }}>Today's Office Agenda</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Events occurring today</div>
          </div>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#ffe4e6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', boxShadow: 'var(--shadow-sm)' }}>🔥</div>
        </div>

        {/* Card 3: My Participating RSVPs */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '24px 20px',
          border: '1.5px solid #3b82f6',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-primary)', lineHeight: '1' }}>{myRsvpsCount}</div>
            <div style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--text-primary)', marginTop: '8px' }}>My Participating RSVPs</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Going/Interested schedules</div>
          </div>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', boxShadow: 'var(--shadow-sm)' }}>✅</div>
        </div>

        {/* Card 4: Company Opinion Polls */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '24px 20px',
          border: '1.5px solid #a855f7',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-primary)', lineHeight: '1' }}>{totalPollsCount}</div>
            <div style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--text-primary)', marginTop: '8px' }}>Company Opinion Polls</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Quick opinion trackers</div>
          </div>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#faf5ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', boxShadow: 'var(--shadow-sm)' }}>📊</div>
        </div>
      </div>

      {/* 4. Filter & Control Bar */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '1px solid var(--border-color)',
        padding: '20px',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        {/* Row 1: Search & Toggles */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <span style={{ position: 'absolute', left: '14px', fontSize: '14px', color: 'var(--text-muted)' }}>🔍</span>
            <input
              type="text"
              placeholder="Search by title, location, desc..."
              value={localSearchTerm}
              onChange={(e) => setLocalSearchTerm(e.target.value)}
              style={{
                padding: '8px 12px 8px 36px',
                border: '1px solid var(--border-color)',
                borderRadius: '24px',
                fontSize: '13.5px',
                width: '320px',
                outline: 'none',
                color: 'var(--text-primary)'
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* View Mode Toggle Buttons */}
            <div style={{ display: 'flex', border: '1px solid var(--border-color)', borderRadius: '24px', overflow: 'hidden' }}>
              <button
                onClick={() => setViewMode('calendar')}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  fontSize: '13.5px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  backgroundColor: viewMode === 'calendar' ? 'var(--accent)' : '#ffffff',
                  color: viewMode === 'calendar' ? '#ffffff' : 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s'
                }}
              >
                📅 Calendar View
              </button>
              <button
                onClick={() => setViewMode('list')}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  fontSize: '13.5px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  backgroundColor: viewMode === 'list' ? 'var(--accent)' : '#ffffff',
                  color: viewMode === 'list' ? '#ffffff' : 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s'
                }}
              >
                📋 Corporate List
              </button>
            </div>

            {/* Add Event (ROLE_ADMIN only) */}
            {currentUser.role === 'ROLE_ADMIN' && (
              <button
                onClick={() => setShowEventModal(true)}
                className="btn btn-primary"
                style={{
                  padding: '10px 24px',
                  fontSize: '13.5px',
                  fontWeight: '600',
                  borderRadius: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                ➕ Add Event
              </button>
            )}
          </div>
        </div>

        {/* Row 2: Selectors */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: '1px solid #f1f5f9',
          paddingTop: '12px',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
            {/* Event Type Filter */}
            <div style={{ fontSize: '13.5px', fontWeight: '600', color: 'var(--text-secondary)' }}>
              Event Type:&nbsp;
              <select
                value={selectedEventType}
                onChange={(e) => setSelectedEventType(e.target.value)}
                style={{
                  padding: '6px 12px',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '500',
                  color: 'var(--text-primary)',
                  backgroundColor: '#ffffff',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                <option value="All Event Types">All Event Types</option>
                <option value="Team Meeting">👥 Team Meeting</option>
                <option value="Annual Day">🏆 Annual Day</option>
                <option value="Tech Talk">💻 Tech Talk</option>
                <option value="Hackathon">🚀 Hackathon</option>
                <option value="Product Launch">📣 Product Launch</option>
                <option value="Training Session">🎓 Training Session</option>
                <option value="HR Activity">🤝 HR Activity</option>
                <option value="Festival">🏮 Festival</option>
                <option value="Birthday Celebration">🎂 Birthday Celebration</option>
                <option value="Office Party">🥳 Office Party</option>
                <option value="Town Hall">🏛️ Town Hall</option>
              </select>
            </div>

            {/* Schedule Filter */}
            <div style={{ fontSize: '13.5px', fontWeight: '600', color: 'var(--text-secondary)' }}>
              Schedule:&nbsp;
              <select
                value={selectedSchedule}
                onChange={(e) => setSelectedSchedule(e.target.value)}
                style={{
                  padding: '6px 12px',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '500',
                  color: 'var(--text-primary)',
                  backgroundColor: '#ffffff',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                <option value="All Schedules">All Schedules</option>
                <option value="Today's Agenda">Today's Agenda</option>
                <option value="My RSVPs">My RSVPs</option>
              </select>
            </div>
          </div>

          {/* Sort Order Selector */}
          <div style={{ fontSize: '13.5px', fontWeight: '600', color: 'var(--text-secondary)' }}>
            Order:&nbsp;
            <select
              value={selectedSortOrder}
              onChange={(e) => setSelectedSortOrder(e.target.value)}
              style={{
                padding: '6px 12px',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '500',
                color: 'var(--text-primary)',
                backgroundColor: '#ffffff',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <option value="Soonest First">Soonest First</option>
              <option value="Latest First">Latest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* 5. 3-Column Main Layout Section */}
      <div className={`events-layout-grid ${viewMode === 'calendar' ? 'with-calendar' : ''}`}>
        
        {/* Column 1: Calendar Grid (Hidden in Corporate List View) */}
        {viewMode === 'calendar' && (
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid var(--border-color)',
            padding: '24px',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            {/* Calendar Month Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))}
                style={{
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  backgroundColor: '#ffffff',
                  padding: '6px 12px',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer'
                }}
              >
                ◀ Prev Month
              </button>
              <h4 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
                {calendarMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </h4>
              <button
                onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))}
                style={{
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  backgroundColor: '#ffffff',
                  padding: '6px 12px',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer'
                }}
              >
                Next Month ▶
              </button>
            </div>

            {/* Days of the Week */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center', fontWeight: '700', fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d}>{d}</div>)}
            </div>

            {/* Days of the Month Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
              {/* Empty spaces for preceding days */}
              {Array.from({ length: firstDayIndex }).map((_, i) => <div key={`empty-${i}`} />)}
              
              {/* Month dates */}
              {Array.from({ length: totalDaysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateObj = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day);
                const isToday = now.toDateString() === dateObj.toDateString();
                const isSelected = calendarSelectedDate && calendarSelectedDate.toDateString() === dateObj.toDateString();
                
                const dayEvents = resolvedEvents.filter(e => new Date(e.eventDate).toDateString() === dateObj.toDateString());

                return (
                  <div
                    key={day}
                    onClick={() => {
                      if (isSelected) setCalendarSelectedDate(null);
                      else setCalendarSelectedDate(dateObj);
                    }}
                    style={{
                      padding: '10px 4px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      borderRadius: '10px',
                      border: isSelected ? '2px solid var(--accent)' : '1px solid var(--border-color)',
                      backgroundColor: isSelected ? '#eff6ff' : (isToday ? '#e0f2fe' : '#ffffff'),
                      minHeight: '52px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.2s'
                    }}
                  >
                    <span style={{
                      fontSize: '13.5px',
                      fontWeight: (isToday || isSelected) ? '700' : '500',
                      color: isToday ? '#0284c7' : 'var(--text-primary)'
                    }}>
                      {day}
                    </span>
                    {/* Event Category Dots */}
                    {dayEvents.length > 0 && (
                      <div style={{ display: 'flex', gap: '3px', justifyContent: 'center', width: '100%', flexWrap: 'wrap', marginTop: '2px' }}>
                        {dayEvents.slice(0, 3).map((e, idx) => {
                          const cat = getCategoryInfo(e);
                          return (
                            <div
                              key={idx}
                              style={{
                                width: '5px',
                                height: '5px',
                                borderRadius: '50%',
                                backgroundColor: cat.color
                              }}
                            />
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Column 2: Events Cards List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
              Upcoming Calendar Events ({finalEventsList.length})
            </h3>
            {calendarSelectedDate && (
              <button
                onClick={() => setCalendarSelectedDate(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent)',
                  fontSize: '12.5px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                Clear Calendar Filter
              </button>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {finalEventsList.map(event => {
              const eventDateObj = new Date(event.eventDate);
              const eventDay = new Date(eventDateObj);
              eventDay.setHours(0,0,0,0);
              const todayDay = new Date(now);
              todayDay.setHours(0,0,0,0);

              // 1. Status Check
              let statusLabel = 'Upcoming';
              let statusBg = '#eff6ff';
              let statusColor = '#1e40af';
              if (eventDay.getTime() === todayDay.getTime()) {
                statusLabel = 'Today';
                statusBg = '#ecfdf5';
                statusColor = '#047857';
              } else if (eventDay.getTime() < todayDay.getTime()) {
                statusLabel = 'Expired';
                statusBg = '#fef2f2';
                statusColor = '#b91c1c';
              }

              // 2. Category Check
              const cat = getCategoryInfo(event);
              
              // 3. RSVPs and avatars
              const rsvpIds = (event.rsvps || '').split(',').filter(x => x);
              const isUserRsvpd = rsvpIds.includes(String(currentUser.id));
              const mockInterestedCount = event.id % 3; // simulated interested metrics

              // Role based Edit/Delete visibility rules
              // Calendar View: Keep event cards clean without Edit/Delete.
              // Corporate List: Show Edit and Delete for Admin. Employees can only view.
              const isCalendarViewMode = viewMode === 'calendar';
              const showEditDeleteActions = !isCalendarViewMode && (currentUser.role === 'ROLE_ADMIN');

              return (
                <div
                  key={event.id}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '16px',
                    border: '1px solid var(--border-color)',
                    borderLeft: `4px solid ${cat.color}`,
                    padding: '18px',
                    boxShadow: 'var(--shadow-sm)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    position: 'relative'
                  }}
                >
                  {/* Top Row: Title & Badges */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                      <strong style={{ fontSize: '15.5px', color: 'var(--text-primary)', fontWeight: '700' }}>
                        {event.title}
                      </strong>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '2px' }}>
                        <span style={{
                          backgroundColor: cat.bgColor,
                          color: cat.textColor,
                          fontSize: '11px',
                          fontWeight: '700',
                          padding: '3px 10px',
                          borderRadius: '12px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          {cat.emoji} {cat.label}
                        </span>
                        <span style={{
                          backgroundColor: statusBg,
                          color: statusColor,
                          fontSize: '11px',
                          fontWeight: '700',
                          padding: '3px 10px',
                          borderRadius: '12px'
                        }}>
                          {statusLabel}
                        </span>
                      </div>
                    </div>
                    {/* Top-right menu: three-dot (⋮) for Admin, hidden for Employee */}
                    <div style={{ position: 'relative' }}>
                      {currentUser.role === 'ROLE_ADMIN' ? (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuEventId(prev => prev === event.id ? null : event.id);
                            }}
                            title="Event Options"
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              fontSize: '20px',
                              padding: '2px 8px',
                              color: 'var(--text-secondary)',
                              fontWeight: 'bold',
                              borderRadius: '4px',
                              lineHeight: '1'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                          >
                            ⋮
                          </button>
                          {activeMenuEventId === event.id && (
                            <div style={{
                              position: 'absolute',
                              top: '28px',
                              right: '0',
                              backgroundColor: '#ffffff',
                              border: '1px solid #e2e8f0',
                              borderRadius: '8px',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                              zIndex: 100,
                              minWidth: '140px',
                              padding: '4px 0',
                              display: 'flex',
                              flexDirection: 'column'
                            }}>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditEventLocal(event);
                                  setActiveMenuEventId(null);
                                }}
                                style={{
                                  padding: '8px 16px',
                                  fontSize: '12.5px',
                                  color: 'var(--text-primary)',
                                  border: 'none',
                                  backgroundColor: 'transparent',
                                  textAlign: 'left',
                                  cursor: 'pointer',
                                  width: '100%',
                                  fontWeight: '600',
                                  transition: 'background-color 0.15s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                              >
                                ✏️ Edit Event
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDuplicateEventLocal(event);
                                  setActiveMenuEventId(null);
                                }}
                                style={{
                                  padding: '8px 16px',
                                  fontSize: '12.5px',
                                  color: 'var(--text-primary)',
                                  border: 'none',
                                  backgroundColor: 'transparent',
                                  textAlign: 'left',
                                  cursor: 'pointer',
                                  width: '100%',
                                  fontWeight: '600',
                                  transition: 'background-color 0.15s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                              >
                                📋 Duplicate Event
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteEventLocal(event.id);
                                  setActiveMenuEventId(null);
                                }}
                                style={{
                                  padding: '8px 16px',
                                  fontSize: '12.5px',
                                  color: '#dc2626',
                                  border: 'none',
                                  backgroundColor: 'transparent',
                                  textAlign: 'left',
                                  cursor: 'pointer',
                                  width: '100%',
                                  fontWeight: '600',
                                  transition: 'background-color 0.15s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                              >
                                🗑️ Delete Event
                              </button>
                            </div>
                          )}
                        </>
                      ) : null}
                    </div>
                  </div>

                  {/* Middle Row: Description */}
                  <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', margin: '2px 0 0 0', lineHeight: '1.5' }}>
                    {event.description}
                  </p>

                  {/* Location & Time Footer */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '12.5px',
                    color: 'var(--text-secondary)',
                    backgroundColor: '#f8fafc',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    marginTop: '4px'
                  }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      📍 {event.location || 'Online'}
                      <span style={{ color: '#cbd5e1' }}>|</span>
                      🕒 {eventDateObj.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </span>
                  </div>

                  {/* RSVP & Participant Row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                    {/* Overlapping Avatars */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {rsvpIds.length > 0 ? (
                        <div style={{ display: 'flex' }}>
                          {rsvpIds.slice(0, 3).map((id, index) => {
                            const profile = getProfileInfo(id);
                            return (
                              <img
                                key={id}
                                src={profile.avatar}
                                alt={profile.name}
                                title={profile.name}
                                style={{
                                  width: '24px',
                                  height: '24px',
                                  borderRadius: '50%',
                                  border: '2px solid #ffffff',
                                  marginLeft: index > 0 ? '-8px' : '0',
                                  objectFit: 'cover'
                                }}
                              />
                            );
                          })}
                        </div>
                      ) : (
                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>👥</div>
                      )}
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '500' }}>
                        {rsvpIds.length} going • {mockInterestedCount} interested
                      </span>
                    </div>

                    {/* RSVP Action Trigger (Enabled in Calendar view; in Corporate list view, employees can only view) */}
                    {(viewMode === 'calendar' || currentUser.role === 'ROLE_ADMIN') && (
                      <button
                        onClick={() => handleRsvpEvent(event.id)}
                        style={{
                          padding: '6px 16px',
                          fontSize: '12px',
                          fontWeight: '600',
                          borderRadius: '20px',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          backgroundColor: isUserRsvpd ? 'var(--accent)' : 'transparent',
                          color: isUserRsvpd ? '#ffffff' : 'var(--text-secondary)',
                          border: isUserRsvpd ? '1px solid var(--accent)' : '1px solid var(--border-color)'
                        }}
                      >
                        {isUserRsvpd ? '✓ RSVP\'d' : 'RSVP'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {finalEventsList.length === 0 && (
              <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)', fontSize: '13.5px', border: '1px dashed var(--border-color)', borderRadius: '8px' }}>
                No events found matching the filters or date.
              </div>
            )}
          </div>
        </div>

        {/* Column 3: Sidebar Side Panel (Timeline + Birthdays) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Today's Office Timeline Widget */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid var(--border-color)',
            padding: '24px 20px',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              📅 Today's Office Timeline
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', paddingLeft: '16px', borderLeft: '2px solid #e2e8f0', marginLeft: '6px' }}>
              {todayTimelineEvents.map((item, idx) => {
                const eventTime = new Date(item.eventDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                return (
                  <div key={item.id} style={{ position: 'relative' }}>
                    {/* Timeline Node Point */}
                    <div style={{
                      position: 'absolute',
                      left: '-22px',
                      top: '4px',
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      backgroundColor: '#10b981',
                      border: '2px solid #ffffff'
                    }} />
                    <div style={{ fontSize: '12.5px', fontWeight: '700', color: '#10b981', marginBottom: '2px' }}>
                      {eventTime}
                    </div>
                    <div style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--text-primary)' }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      📍 {item.location || 'VIRTUAL'}
                    </div>
                  </div>
                );
              })}

              {todayTimelineEvents.length === 0 && (
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', paddingLeft: '4px' }}>
                  No office events scheduled for today.
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* 6. Polls Section */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '1px solid var(--border-color)',
        padding: '24px',
        boxShadow: 'var(--shadow-sm)',
        marginTop: '8px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            📊 Company Opinion Polls
          </h3>
          <button
            onClick={() => setShowPollModal(true)}
            className="btn btn-primary"
            style={{
              padding: '8px 18px',
              fontSize: '13.5px',
              fontWeight: '600',
              borderRadius: '24px'
            }}
          >
            ➕ Create Poll
          </button>
        </div>

        {/* Poll Cards Layout Grid */}
        <div className="polls-layout-grid">
          {mergedPolls
            .filter(p => (p.question || '').toLowerCase().includes(combinedSearch))
            .map((poll, pollIdx) => {
              const opts = poll.options.split(',');
              
              // Parse votes format "userId:optionIndex,userId:optionIndex"
              const voteMap = (poll.votes || '').split(',').filter(x => x).reduce((acc, voteStr) => {
                const [uid, oidx] = voteStr.split(':');
                acc[uid] = parseInt(oidx);
                return acc;
              }, {});

              const totalVotes = Object.keys(voteMap).length;

              return (
                <div
                  key={poll.id}
                  style={{
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    padding: '20px',
                    backgroundColor: '#ffffff',
                    boxShadow: 'var(--shadow-sm)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                    position: 'relative'
                  }}
                >
                  {/* Poll Title & Badges */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>
                      {poll.question}
                    </div>

                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      {poll.visibility === 'Private' ? (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '10.5px',
                          fontWeight: '700',
                          backgroundColor: '#fee2e2',
                          color: '#991b1b',
                          whiteSpace: 'nowrap'
                        }}>
                          🔒 Private
                        </span>
                      ) : (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '10.5px',
                          fontWeight: '700',
                          backgroundColor: '#dcfce7',
                          color: '#166534',
                          whiteSpace: 'nowrap'
                        }}>
                          🌐 Public
                        </span>
                      )}

                      {/* Creator options */}
                      {(currentUser.id === poll.creator.id || currentUser.role === 'ROLE_ADMIN') && (
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            onClick={() => openEditPollModal(poll)}
                            title="Edit Poll"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', padding: '2px' }}
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDeletePoll(poll.id)}
                            title="Delete Poll"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', padding: '2px' }}
                          >
                            🗑️
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Poll Options Bar List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {opts.map((opt, oIdx) => {
                      const optVotes = Object.values(voteMap).filter(v => v === oIdx).length;
                      const percentage = totalVotes === 0 ? 0 : Math.round((optVotes / totalVotes) * 100);

                      // Curated progress colors to match screenshot: pink for product launch, blue/purple for others
                      const getProgressStyle = () => {
                        const questionLower = (poll.question || '').toLowerCase();
                        if (questionLower.includes('launch') || questionLower.includes('product')) {
                          return { bg: '#fff1f2', bar: '#fecdd3', text: '#be185d' }; // Light pink bar fill
                        } else {
                          return { bg: '#eff6ff', bar: '#dbeafe', text: '#2563eb' }; // Light blue bar fill
                        }
                      };
                      const styleOption = getProgressStyle();

                      return (
                        <div
                          key={oIdx}
                          onClick={() => handleVotePoll(poll.id, oIdx)}
                          style={{
                            position: 'relative',
                            padding: '10px 14px',
                            backgroundColor: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            overflow: 'hidden',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
                          onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                        >
                          {/* Colored dynamic progress fill */}
                          <div style={{
                            width: `${percentage}%`,
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            bottom: 0,
                            backgroundColor: styleOption.bar,
                            transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                            zIndex: 1
                          }} />
                          
                          <div style={{ position: 'relative', zIndex: 2, fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>
                            {opt}
                          </div>
                          <div style={{ position: 'relative', zIndex: 2, fontSize: '13px', fontWeight: '700', color: styleOption.text }}>
                            {percentage}% <span style={{ fontSize: '11px', fontWeight: '500', opacity: 0.8 }}>({optVotes})</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Poll card footer metadata details */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    marginTop: '6px',
                    paddingTop: '10px',
                    borderTop: '1px solid #f1f5f9'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: 'var(--text-muted)', fontWeight: '500' }}>
                      <span>{totalVotes} votes cast</span>
                      <span>Asked by {poll.creator ? poll.creator.name : 'Unknown'}</span>
                    </div>

                    {poll.visibility === 'Private' ? (
                      <div style={{
                        fontSize: '10.5px',
                        color: '#991b1b',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        backgroundColor: '#fef2f2',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        fontWeight: '500'
                      }}>
                        🔒 Confidential • Restricted Access • Visible only to authorized employees.
                      </div>
                    ) : (
                      <div style={{
                        fontSize: '10.5px',
                        color: '#166534',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        backgroundColor: '#f0fdf4',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        fontWeight: '500'
                      }}>
                        🌐 Public • Visible to all employees.
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* 7. Restored Dashboard Widgets: Upcoming Events Bottom Widget & Poll Statistics */}
      <div className="events-bottom-grid">
        
        {/* Left: Upcoming Events Bottom Card */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid var(--border-color)',
          padding: '24px 20px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            ⏱️ Upcoming Events
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {resolvedEvents.slice(0, 4).map(event => {
              const eventDateObj = new Date(event.eventDate);
              const cat = getCategoryInfo(event);
              const rsvpIds = (event.rsvps || '').split(',').filter(x => x);
              const isUserRsvpd = rsvpIds.includes(String(currentUser.id));
              
              // Upcoming Events bottom widget: Show Edit and Delete icons ONLY for Admin users.
              // Hide Edit/Delete for Employee users. Employees can only View and RSVP.
              const showWidgetEditDelete = currentUser.role === 'ROLE_ADMIN';

              return (
                <div
                  key={'widget-' + event.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '12px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '10px',
                    border: '1px solid var(--border-color)',
                    position: 'relative'
                  }}
                >
                  {/* Big Date block */}
                  <div style={{
                    backgroundColor: cat.bgColor,
                    color: cat.color,
                    padding: '10px 14px',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    minWidth: '60px'
                  }}>
                    <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {eventDateObj.toLocaleString('default', { month: 'short' })}
                    </div>
                    <div style={{ fontSize: '18px', lineHeight: '1' }}>{eventDateObj.getDate()}</div>
                  </div>

                  {/* Title & metadata */}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14.5px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>
                      {event.title}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span>🕒 {eventDateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span style={{ margin: '0 4px' }}>•</span>
                      <span>📍 {event.location || 'Online'}</span>
                    </div>
                  </div>

                  {/* Controls (RSVP & Admin actions) */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {/* RSVP Action */}
                    <button
                      onClick={() => handleRsvpEvent(event.id)}
                      style={{
                        padding: '6px 12px',
                        fontSize: '11.5px',
                        fontWeight: '600',
                        borderRadius: '20px',
                        cursor: 'pointer',
                        backgroundColor: isUserRsvpd ? 'var(--accent)' : 'transparent',
                        color: isUserRsvpd ? '#ffffff' : 'var(--text-secondary)',
                        border: isUserRsvpd ? '1px solid var(--accent)' : '1px solid var(--border-color)'
                      }}
                    >
                      {isUserRsvpd ? '✓ RSVP\'d' : 'RSVP'}
                    </button>

                    {/* Admin actions (Edit/Delete) */}
                    {showWidgetEditDelete && (
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          onClick={() => handleEditEventLocal(event)}
                          title="Edit Event"
                          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', padding: '2px' }}
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDeleteEventLocal(event.id)}
                          title="Delete Event"
                          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', padding: '2px' }}
                        >
                          🗑️
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {resolvedEvents.length === 0 && (
              <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '13px' }}>
                No upcoming events.
              </div>
            )}
          </div>
        </div>

        {/* Right: Poll Participation Statistics card */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid var(--border-color)',
          padding: '24px 20px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            📈 Poll Participation Statistics
          </h3>
          <div style={{
            padding: '24px 16px',
            backgroundColor: '#f8fafc',
            borderRadius: '12px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            border: '1px solid var(--border-color)'
          }}>
            <div style={{ fontSize: '42px', fontWeight: '800', color: 'var(--accent)', lineHeight: '1' }}>
              {mergedPolls.reduce((total, p) => total + (p.votes ? p.votes.split(',').filter(x => x).length : 0), 0)}
            </div>
            <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginTop: '8px' }}>
              Total Votes Cast Across All Polls
            </div>
            
            <div style={{ marginTop: '20px', display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center' }}>
              <span style={{ padding: '4px 10px', borderRadius: '12px', backgroundColor: '#f1f5f9', fontSize: '11px', fontWeight: '600', color: 'var(--text-secondary)' }}>🛡️ Internal</span>
              <span style={{ padding: '4px 10px', borderRadius: '12px', backgroundColor: '#fef3c7', fontSize: '11px', fontWeight: '600', color: '#92400e' }}>🔐 Restricted</span>
              <span style={{ padding: '4px 10px', borderRadius: '12px', backgroundColor: '#e0e7ff', fontSize: '11px', fontWeight: '600', color: '#3730a3' }}>🏢 Department</span>
            </div>

            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-evenly', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
              <div>
                <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)' }}>{mergedPolls.length}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', marginTop: '2px' }}>Active Polls</div>
              </div>
              <div style={{ width: '1px', backgroundColor: 'var(--border-color)' }}></div>
              <div>
                <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)' }}>
                  {mergedPolls.length > 0 ? Math.round(mergedPolls.reduce((total, p) => total + (p.votes ? p.votes.split(',').filter(x => x).length : 0), 0) / mergedPolls.length) : 0}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', marginTop: '2px' }}>Avg. Votes / Poll</div>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Events;
