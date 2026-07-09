import React from 'react';

const EmployeeDirectory = ({ 
  users, 
  searchTerm, 
  groups, 
  activeDirectoryMenuId, 
  setActiveDirectoryMenuId, 
  setViewingProfileId, 
  setShowProfileModal, 
  setChatTarget, 
  setCurrentTab 
}) => {
  return (
    <div className="directory-grid" style={{ gap: '20px', padding: '10px' }} onClick={(e) => { if (!e.target.closest('.directory-menu-container')) setActiveDirectoryMenuId(null); }}>
      {users
        .filter(u => 
          (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
          (u.department || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (u.status || '').toLowerCase().includes(searchTerm.toLowerCase())
        )
        .map(u => (
          <div key={u.id} className="directory-card directory-card-modern">
            
            {/* Three-dot menu */}
            <div className="directory-menu-container" style={{ position: 'absolute', top: '12px', right: '12px' }}>
              <button 
                className="btn-icon" 
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveDirectoryMenuId(activeDirectoryMenuId === u.id ? null : u.id);
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>
              </button>
              
              {activeDirectoryMenuId === u.id && (
                <div className="dropdown-menu directory-dropdown shadow-sm border" style={{ position: 'absolute', right: 0, top: '24px', background: 'white', borderRadius: '8px', zIndex: 10, minWidth: '140px', padding: '4px 0' }}>
                  <div className="dropdown-item" style={{ padding: '8px 16px', fontSize: '13px', cursor: 'pointer' }} onClick={() => { setViewingProfileId(u.id); setShowProfileModal(true); setActiveDirectoryMenuId(null); }}>View Profile</div>
                  <div className="dropdown-item" style={{ padding: '8px 16px', fontSize: '13px', cursor: 'pointer' }} onClick={() => {
                    setChatTarget({ type: 'direct', id: u.id, name: u.name, avatarUrl: u.avatarUrl });
                    setCurrentTab('chat');
                    setActiveDirectoryMenuId(null);
                  }}>Send Message</div>
                  <div className="dropdown-item" style={{ padding: '8px 16px', fontSize: '13px', cursor: 'pointer' }} onClick={() => { navigator.clipboard.writeText(u.email); alert('Email copied!'); setActiveDirectoryMenuId(null); }}>Copy Email</div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              {/* Avatar with fallback, online indicator, and circular border */}
              <div style={{ position: 'relative', marginBottom: '12px' }}>
                {u.avatarUrl ? (
                  <img className="directory-avatar" src={u.avatarUrl} alt="" style={{ width: '70px', height: '70px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #f1f5f9' }} />
                ) : (
                  <div className="directory-avatar-fallback" style={{ width: '70px', height: '70px', borderRadius: '50%', background: '#3b82f6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold', border: '3px solid #f1f5f9' }}>
                    {u.name ? u.name.charAt(0).toUpperCase() : '?'}
                  </div>
                )}
                {u.status === 'Active' && (
                  <div className="online-indicator" style={{ position: 'absolute', bottom: '4px', right: '4px', width: '14px', height: '14px', background: '#22c55e', border: '2px solid white', borderRadius: '50%' }}></div>
                )}
              </div>

              {/* Name & Verified Icon */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                <div className="directory-name" style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b' }}>{u.name}</div>
                <svg className="verified-icon" width="16" height="16" viewBox="0 0 24 24" fill="#3b82f6" stroke="white" strokeWidth="2"><polygon points="12 2 15.09 5.09 19.5 5.5 19.91 9.91 23 13 19.91 16.09 19.5 20.5 15.09 20.91 12 24 8.91 20.91 4.5 20.5 4.09 16.09 1 13 4.09 9.91 4.5 5.5 8.91 5.09 12 2"/><polyline points="9 12 11 14 15 10"/></svg>
              </div>

              {/* Department Badge */}
              <div style={{ marginBottom: '8px' }}>
                <span className="badge badge-dept" style={{ background: '#f1f5f9', color: '#475569', padding: '4px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: '500' }}>
                  {u.department}
                </span>
              </div>
              
              {/* Status & Last Active */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', marginBottom: '12px' }}>
                <span className={`badge badge-${u.status === 'Active' ? 'active' : u.status === 'On Leave' ? 'leave' : 'remote'}`} style={{ borderRadius: '4px' }}>
                  {u.status}
                </span>
                <span className="last-active-text" style={{ fontSize: '11px', color: '#94a3b8' }}>Last Active: Today</span>
              </div>

              {/* Group Badges */}
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '12px', minHeight: '24px' }}>
                {groups.filter(g => (g.members || '').split(',').includes(String(u.id))).map(g => (
                  <span key={g.id} className="badge badge-group" style={{ background: '#e0e7ff', color: '#4f46e5', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: '600' }}>
                    {g.name}
                  </span>
                ))}
              </div>
              
              {/* Send Message Button */}
              <button 
                className="btn btn-primary" 
                style={{ width: '100%', fontSize: '13px', padding: '8px 0', borderRadius: '6px', fontWeight: '500', transition: 'background-color 0.2s', marginTop: 'auto' }}
                onClick={() => {
                  setChatTarget({ type: 'direct', id: u.id, name: u.name, avatarUrl: u.avatarUrl });
                  setCurrentTab('chat');
                }}
              >
                Send Message
              </button>
            </div>
          </div>
        ))}
    </div>
  );
};

export default EmployeeDirectory;
