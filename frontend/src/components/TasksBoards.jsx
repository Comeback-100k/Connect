import React from 'react';

const TasksBoards = ({
  tasks,
  currentUser,
  searchTerm,
  activeTaskFilter,
  setActiveTaskFilter,
  setShowTaskModal,
  handleDeleteTask,
  handleMoveTask
}) => {
  // We only show tasks assigned to the current user in My Tasks.
  const myTasks = tasks.filter(t => t.assignee && t.assignee.id === currentUser?.id);

  return (
    <div className="tasks-layout">
      {/* Tasks Secondary Left Sidebar */}
      <div className="tasks-sidebar">
        <div className="tasks-sidebar-menu">
          <div className="tasks-sidebar-item active">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
            My Tasks
            <span className="badge" style={{ marginLeft: 'auto', backgroundColor: '#fecdd3', color: '#be123c', fontSize: '10px', padding: '2px 6px' }}>{myTasks.length}</span>
          </div>
        </div>
      </div>

      {/* Tasks Main Board Area */}
      <div className="tasks-main">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600' }}>My Tasks</h3>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setShowTaskModal(true)} className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '13px' }}>
              Create Task
            </button>
          </div>
        </div>

        <div className="kanban-board">
          {['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'].map(colStatus => {
            const colTasks = myTasks.filter(t => t.status === colStatus && ((t.title || '').toLowerCase().includes(searchTerm.toLowerCase()) || (t.description || '').toLowerCase().includes(searchTerm.toLowerCase())));
            
            let headerColor = 'var(--border-color)';
            if (colStatus === 'TODO') headerColor = '#ef4444';
            if (colStatus === 'IN_PROGRESS') headerColor = '#3b82f6';
            if (colStatus === 'REVIEW') headerColor = '#eab308';
            if (colStatus === 'DONE') headerColor = '#22c55e';

            return (
              <div key={colStatus} className="kanban-column" style={{ borderTop: `4px solid ${headerColor}` }}>
                <div className="kanban-column-header">
                  <span style={{ color: headerColor }}>{colStatus.replace('_', ' ')}</span>
                  <span className="column-count">{colTasks.length}</span>
                </div>
                
                <div className="kanban-column-cards">
                  {colTasks.map(task => (
                    <div key={task.id} className="task-card">
                      <div className="task-card-header">
                        <span className={`badge badge-${(task.priority || 'Medium').toLowerCase()}`}>{task.priority || 'Medium'}</span>
                        <button 
                          onClick={() => handleDeleteTask(task.id)} 
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                        >
                          &times;
                        </button>
                      </div>
                      <span className="task-card-title">{task.title}</span>
                      <p className="task-card-desc">{task.description}</p>
                      
                      {task.dueDate && (
                        <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '500' }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                          {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                      )}

                      <div className="task-card-footer">
                        {task.assignee ? (
                          <div className="task-assignee">
                            <img className="task-assignee-avatar" src={task.assignee.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"} alt="" />
                            <span>{task.assignee.name.split(' ')[0]}</span>
                          </div>
                        ) : <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Unassigned</span>}

                        {/* Navigation controllers */}
                        <div style={{ display: 'flex', gap: '4px' }}>
                          {colStatus !== 'TODO' && (
                            <button onClick={() => handleMoveTask(task.id, colStatus, 'left')} style={{ padding: '2px 6px', border: '1px solid var(--border-color)', background: 'none', cursor: 'pointer', fontSize: '10px' }}>&larr;</button>
                          )}
                          {colStatus !== 'DONE' && (
                            <button onClick={() => handleMoveTask(task.id, colStatus, 'right')} style={{ padding: '2px 6px', border: '1px solid var(--border-color)', background: 'none', cursor: 'pointer', fontSize: '10px' }}>&rarr;</button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TasksBoards;
