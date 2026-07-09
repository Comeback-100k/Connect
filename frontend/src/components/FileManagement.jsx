import React, { useState } from 'react';

const FileManagement = ({
  documents,
  currentUser,
  searchTerm,
  setActiveShareDocId,
  setShowDocModal,
  setPreviewDoc,
  showToast,
  handleDownload,
  setShareModalDoc,
  setShareSelectedUsers,
  handleDeleteDoc,
  currentFolderId,
  setCurrentFolderId,
  documentLogs,
  fetchDocumentLogs,
  handleMoveDoc
}) => {
  const [showLogs, setShowLogs] = useState(false);
  const [moveModalDoc, setMoveModalDoc] = useState(null);
  const [moveTargetId, setMoveTargetId] = useState('');

  const handleMoveSubmit = (e) => {
    e.preventDefault();
    if (moveModalDoc) {
      handleMoveDoc(moveModalDoc.id, moveTargetId === '' ? null : moveTargetId);
      setMoveModalDoc(null);
      setMoveTargetId('');
      showToast('Document moved successfully.');
    }
  };

  // Breadcrumbs builder
  const getBreadcrumbs = () => {
    const crumbs = [];
    let curr = currentFolderId;
    while (curr) {
      const folder = documents.find(d => d.id === curr);
      if (folder) {
        crumbs.unshift(folder);
        curr = folder.parentId;
      } else {
        break;
      }
    }
    return crumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  const currentDocs = documents.filter(d => 
    d.parentId == currentFolderId && 
    ((d.title || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
     (d.fileName || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
     (d.content || '').toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const folders = currentDocs.filter(d => d.type === 'FOLDER');
  const manuals = currentDocs.filter(d => d.type === 'MANUAL');
  const files = currentDocs.filter(d => d.type === 'FILE');

  return (
    <div className="docs-layout" onClick={() => setActiveShareDocId(null)}>
      {/* Sidebar */}
      <div className="docs-sidebar" style={{ minWidth: '220px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <button onClick={() => setShowDocModal(true)} className="btn btn-primary btn-upload-modern" style={{ width: '100%', padding: '14px', borderRadius: '10px', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 10px -2px rgba(59, 130, 246, 0.4)', transition: 'all 0.2s' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
          New File / Folder
        </button>

        <button onClick={() => {
          setShowLogs(!showLogs);
          if (!showLogs && currentUser.role === 'ROLE_ADMIN') fetchDocumentLogs();
        }} className="btn btn-secondary" style={{ width: '100%', padding: '12px', borderRadius: '10px', fontSize: '14px', fontWeight: '600', backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1' }}>
          {showLogs ? 'Back to Files' : 'View Audit Logs'}
        </button>
      </div>

      <div className="docs-main" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {showLogs ? (
          <div className="card shadow-sm border-0" style={{ padding: '24px', borderRadius: '12px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              Document Audit Logs
            </h3>
            {currentUser.role !== 'ROLE_ADMIN' ? (
              <p style={{ color: '#ef4444' }}>You do not have permission to view audit logs.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                      <th style={{ padding: '12px 16px', color: '#475569', fontWeight: '600' }}>Time</th>
                      <th style={{ padding: '12px 16px', color: '#475569', fontWeight: '600' }}>User</th>
                      <th style={{ padding: '12px 16px', color: '#475569', fontWeight: '600' }}>Action</th>
                      <th style={{ padding: '12px 16px', color: '#475569', fontWeight: '600' }}>Document</th>
                      <th style={{ padding: '12px 16px', color: '#475569', fontWeight: '600' }}>Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documentLogs.map(log => (
                      <tr key={log.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '12px 16px', color: '#64748b' }}>{new Date(log.timestamp).toLocaleString()}</td>
                        <td style={{ padding: '12px 16px', fontWeight: '500' }}>{log.userName}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ 
                            padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold',
                            backgroundColor: log.action === 'DELETE' ? '#fee2e2' : log.action === 'UPLOAD' ? '#dcfce7' : '#e0f2fe',
                            color: log.action === 'DELETE' ? '#ef4444' : log.action === 'UPLOAD' ? '#22c55e' : '#0284c7'
                          }}>
                            {log.action}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', color: '#0f172a' }}>{log.documentTitle}</td>
                        <td style={{ padding: '12px 16px', color: '#64748b' }}>{log.details}</td>
                      </tr>
                    ))}
                    {documentLogs.length === 0 && (
                      <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>No logs available.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Breadcrumb Navigation */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '16px 24px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <button onClick={() => setCurrentFolderId(null)} style={{ background: 'none', border: 'none', color: currentFolderId ? '#3b82f6' : '#0f172a', fontWeight: currentFolderId ? '500' : '700', cursor: 'pointer', fontSize: '15px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ verticalAlign: 'middle', marginRight: '6px' }}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                Home
              </button>
              
              {breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={crumb.id}>
                  <span style={{ color: '#cbd5e1' }}>/</span>
                  <button onClick={() => setCurrentFolderId(crumb.id)} style={{ background: 'none', border: 'none', color: idx === breadcrumbs.length - 1 ? '#0f172a' : '#3b82f6', fontWeight: idx === breadcrumbs.length - 1 ? '700' : '500', cursor: 'pointer', fontSize: '15px' }}>
                    {crumb.title}
                  </button>
                </React.Fragment>
              ))}
            </div>

            {/* Folders Section */}
            {folders.length > 0 && (
              <div className="card shadow-sm border-0" style={{ padding: '24px', borderRadius: '12px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#475569', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                  Folders
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                  {folders.map(folder => {
                    const canEdit = true;
                    return (
                      <div key={folder.id} onClick={() => setCurrentFolderId(folder.id)} style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'all 0.2s' }} className="hover:border-blue-400 hover:shadow-md">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="#60a5fa" stroke="#3b82f6" strokeWidth="1"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                          <span style={{ fontWeight: '600', color: '#1e293b', fontSize: '14px' }}>{folder.title}</span>
                        </div>
                        {canEdit && (
                          <div style={{ display: 'flex', gap: '8px' }} onClick={e => e.stopPropagation()}>
                            <button onClick={() => setMoveModalDoc(folder)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }} title="Move">M</button>
                            <button onClick={() => handleDeleteDoc(folder.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }} title="Delete">X</button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Manuals Section */}
            {manuals.length > 0 && (
              <div className="card shadow-sm border-0" style={{ padding: '24px', borderRadius: '12px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                  Knowledge Base Articles
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                  {manuals.map(doc => {
                    const canEdit = true;
                    return (
                      <div key={doc.id} className="kb-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                          <h4 onClick={() => setPreviewDoc(doc)} style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b', margin: 0, lineHeight: '1.3', cursor: 'pointer' }} className="hover:text-blue-600 transition-colors">
                            {doc.title}
                          </h4>
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                            <span className={`badge-permission ${canEdit ? 'badge-permission-edit' : 'badge-permission-view'}`}>{canEdit ? 'Edit' : 'View Only'}</span>
                          </div>
                        </div>
                        <p style={{ fontSize: '13.5px', color: '#475569', whiteSpace: 'pre-line', lineHeight: '1.6', marginBottom: '20px', flex: 1, display: '-webkit-box', WebkitLineClamp: '4', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{doc.content}</p>
                        
                        <div className="action-bar">
                          <button onClick={() => setPreviewDoc(doc)} className="btn-action-soft" title="Preview">Preview</button>
                          <button onClick={() => { navigator.clipboard.writeText(`https://connect.company.com/docs/${doc.id}`); showToast('Link copied successfully.'); }} className="btn-action-soft" title="Copy Link">Copy Link</button>
                          <button onClick={() => handleDownload(doc)} className="btn-action-soft" title="Download">Download</button>
                          {canEdit && (
                            <>
                              <button onClick={() => setMoveModalDoc(doc)} className="btn-action-soft" title="Move">Move</button>
                              <button onClick={(e) => { 
                                e.stopPropagation(); 
                                setShareModalDoc(doc); setShareSelectedUsers([]); 
                              }} className="btn-action-soft" title="Share">Share</button>
                              <button onClick={() => handleDeleteDoc(doc.id)} className="btn-action-soft btn-delete-soft" title="Delete">Delete</button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Files Section */}
            {files.length > 0 && (
              <div className="card shadow-sm border-0" style={{ padding: '24px', borderRadius: '12px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                  Shared Files
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {files.map(doc => {
                    const ext = (doc.fileType || '').toLowerCase();
                    let badgeClass = 'file-badge-default';
                    if (ext === 'pdf') badgeClass = 'file-badge-pdf';
                    else if (['doc', 'docx'].includes(ext)) badgeClass = 'file-badge-docx';
                    else if (['xls', 'xlsx', 'csv'].includes(ext)) badgeClass = 'file-badge-xlsx';
                    else if (['ppt', 'pptx'].includes(ext)) badgeClass = 'file-badge-ppt';
                    else if (['png', 'jpg', 'jpeg', 'gif'].includes(ext)) badgeClass = 'file-badge-img';

                    const canEdit = true;
                    return (
                      <div key={doc.id} className="file-list-item-modern" style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', padding: '20px', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div className="doc-info" style={{ display: 'flex', alignItems: 'center', gap: '20px', minWidth: '300px', flex: '1 1 auto' }}>
                          <div className={`file-icon-wrapper ${badgeClass}`} style={{ width: '50px', height: '50px', borderRadius: '12px', flexShrink: 0 }}>
                            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <div className="doc-title" style={{ fontSize: '15.5px', fontWeight: '700', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                              {doc.fileName}
                              <div style={{ display: 'flex', gap: '6px' }}>
                                {doc.recipientId == null ? (
                                  <span className="badge-visibility badge-public" title="Shared with Everyone">🌐 Public</span>
                                ) : (
                                  <span className="badge-visibility badge-private" title={`Shared with User #${doc.recipientId}`}>🔒 Private</span>
                                )}
                                <span className={`badge-permission ${canEdit ? 'badge-permission-edit' : 'badge-permission-view'}`}>{canEdit ? 'Edit' : 'View Only'}</span>
                              </div>
                            </div>
                            <div className="doc-meta" style={{ fontSize: '12.5px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                              <span className={`file-badge ${badgeClass}`}>{doc.fileType.toUpperCase()}</span>
                              <span style={{ color: '#cbd5e1' }}>|</span>
                              <span>{(doc.fileSize / 1024).toFixed(1)} KB</span>
                              <span style={{ color: '#cbd5e1' }}>|</span>
                              <span style={{ fontWeight: '500' }}>Uploaded by {doc.uploader.name}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="file-actions-container" style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', flexShrink: 0 }}>
                          <button onClick={() => setPreviewDoc(doc)} className="btn-action-soft file-btn-equal">Preview</button>
                          <button onClick={() => { navigator.clipboard.writeText(`https://connect.company.com/files/${doc.id}`); showToast('Link copied successfully.'); }} className="btn-action-soft file-btn-equal">Copy Link</button>
                          <button onClick={() => handleDownload(doc)} className="btn-action-soft file-btn-equal">Download</button>
                          {canEdit && (
                            <>
                              <button onClick={() => setMoveModalDoc(doc)} className="btn-action-soft file-btn-equal">Move</button>
                              <button onClick={(e) => { 
                                e.stopPropagation(); 
                                setShareModalDoc(doc); setShareSelectedUsers([]); 
                              }} className="btn-action-soft file-btn-equal">Share</button>
                              <button onClick={() => handleDeleteDoc(doc.id)} className="btn-action-soft btn-delete-soft file-btn-equal">Delete</button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {currentDocs.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '2px dashed #e2e8f0' }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2" style={{ margin: '0 auto 16px auto' }}><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                <p style={{ fontSize: '16px', fontWeight: '600', color: '#64748b', marginBottom: '8px' }}>This folder is empty</p>
                <p style={{ fontSize: '14px', color: '#94a3b8' }}>Upload files, write manuals, or create subfolders to get started.</p>
              </div>
            )}
          </>
        )}

      </div>

      {/* Move Document Modal */}
      {moveModalDoc && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ padding: '24px', borderRadius: '12px', maxWidth: '400px', width: '100%' }}>
            <div className="modal-header" style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>Move Document</h3>
              <button className="modal-close-btn" onClick={() => setMoveModalDoc(null)}>&times;</button>
            </div>
            <form onSubmit={handleMoveSubmit}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Select Destination Folder</label>
                <select className="form-input-modern" value={moveTargetId} onChange={e => setMoveTargetId(e.target.value)} style={{ width: '100%' }}>
                  <option value="">(Root Directory)</option>
                  {documents.filter(d => d.type === 'FOLDER' && d.id !== moveModalDoc.id).map(f => (
                    <option key={f.id} value={f.id}>📁 {f.title}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" onClick={() => setMoveModalDoc(null)} className="btn-action-soft">Cancel</button>
                <button type="submit" className="btn btn-primary">Move</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default FileManagement;
