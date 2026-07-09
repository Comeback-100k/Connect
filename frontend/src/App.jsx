import React, { useState, useEffect, useRef } from 'react';
import EmployeeDirectory from './components/EmployeeDirectory';
import FileManagement from './components/FileManagement';
import TasksBoards from './components/TasksBoards';
import Events from './components/Events';


const API_BASE = `http://${window.location.hostname}:8080/api`;

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Forgot Password States
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordStatus, setForgotPasswordStatus] = useState('');
  const [isResetApproved, setIsResetApproved] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [forgotPasswordRequests, setForgotPasswordRequests] = useState([]);

  // Navigation
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');

  // Data States
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [recognitions, setRecognitions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [comments, setComments] = useState({}); // postId -> commentList
  const [activeCommentsPostId, setActiveCommentsPostId] = useState(null);
  const [activeDirectoryMenuId, setActiveDirectoryMenuId] = useState(null);
  const [activeShareDocId, setActiveShareDocId] = useState(null);
  const [showDocModal, setShowDocModal] = useState(false);
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [documentLogs, setDocumentLogs] = useState([]);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [viewingProfileId, setViewingProfileId] = useState(null);
  const [commentContent, setCommentContent] = useState('');

  const [groups, setGroups] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [events, setEvents] = useState([]);
  const [polls, setPolls] = useState([]);
  const [workflows, setWorkflows] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  // Chat specific states
  const [chatTarget, setChatTarget] = useState(null); // { type: 'group'|'direct', id: Long, name: String }
  const [chatMessages, setChatMessages] = useState([]);
  const [allMessages, setAllMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [pendingAttachments, setPendingAttachments] = useState([]);
  const chatFileInputRef = useRef(null);

  // Call functionality
  const [activeCall, setActiveCall] = useState(null);
  const localVideoRef = useRef(null);
  const ringAudioCtx = useRef(null);
  const ringInterval = useRef(null);

  const startRingingSound = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;

      const ctx = new AudioContext();
      ringAudioCtx.current = ctx;

      const playRing = () => {
        if (ctx.state === 'closed') return;

        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc1.type = 'sine';
        osc1.frequency.value = 440;
        osc2.type = 'sine';
        osc2.frequency.value = 480;

        gainNode.gain.setValueAtTime(0, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.5, ctx.currentTime + 1.9);
        gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 2.0);

        osc1.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc1.start(ctx.currentTime);
        osc2.start(ctx.currentTime);
        osc1.stop(ctx.currentTime + 2);
        osc2.stop(ctx.currentTime + 2);
      };

      playRing();
      ringInterval.current = setInterval(playRing, 4000);
    } catch (err) {
      console.warn("AudioContext error", err);
    }
  };

  const stopRingingSound = () => {
    if (ringInterval.current) clearInterval(ringInterval.current);
    if (ringAudioCtx.current && ringAudioCtx.current.state !== 'closed') {
      ringAudioCtx.current.close().catch(() => { });
    }
  };

  const startCall = (type) => {
    setActiveCall({ type, target: chatTarget });
    startRingingSound();

    if (!currentUser || !chatTarget) return;

    const payload = {
      content: type === 'video' ? '📹 Started a video call' : '📞 Started a voice call',
      senderId: currentUser.id
    };

    if (chatTarget.type === 'group') {
      payload.groupId = chatTarget.id;
    } else {
      payload.recipientId = chatTarget.id;
    }

    fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(msg => {
        setChatMessages(prev => [...prev, msg]);
      })
      .catch(err => console.error('Error sending call message:', err));
  };
  const endCall = () => {
    stopRingingSound();
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      localVideoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
    setActiveCall(null);
  };

  // Form Modals
  const [showPostModal, setShowPostModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showEditGroupModal, setShowEditGroupModal] = useState(false);
  const [editGroupTarget, setEditGroupTarget] = useState(null);
  const [editGroupName, setEditGroupName] = useState('');
  const [editGroupDesc, setEditGroupDesc] = useState('');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showPollModal, setShowPollModal] = useState(false);
  const [showWorkflowModal, setShowWorkflowModal] = useState(false);

  // Form Fields
  const [postCategory, setPostCategory] = useState('GENERAL');
  const [postContent, setPostContent] = useState('');
  const [kudosAttempted, setKudosAttempted] = useState(false);
  const [kudosReceiverId, setKudosReceiverId] = useState('');
  const [kudosType, setKudosType] = useState('Team Player');
  const [showKudosModal, setShowKudosModal] = useState(false);
  const [kudosMessage, setKudosMessage] = useState('');
  const [kudosVisibility, setKudosVisibility] = useState('PUBLIC');
  const [kudosReward, setKudosReward] = useState('');
  const [kudosMentions, setKudosMentions] = useState([]); // track mentioned user objects
  const [kudosMentionText, setKudosMentionText] = useState('');
  const [postImages, setPostImages] = useState([]); // array of { url: '', description: '' }
  const [selectedLightboxImage, setSelectedLightboxImage] = useState(null); // { url, description, allImages, currentIndex }

  const [groupName, setGroupName] = useState('');
  const [groupDesc, setGroupDesc] = useState('');
  const [groupIsPrivate, setGroupIsPrivate] = useState(false);
  const [groupMembers, setGroupMembers] = useState([]);
  const [showAddMembersModal, setShowAddMembersModal] = useState(false);
  const [activeGroupToAddMembers, setActiveGroupToAddMembers] = useState(null);
  const [addMembersSelectedIds, setAddMembersSelectedIds] = useState([]);
  const [activeGroupTab, setActiveGroupTab] = useState({});
  const [openGroupMenuId, setOpenGroupMenuId] = useState(null);

  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskStatus, setTaskStatus] = useState('TODO');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskIsPrivate, setTaskIsPrivate] = useState(false);
  const [taskIsChecklist, setTaskIsChecklist] = useState(false);
  const [activeTaskFilter, setActiveTaskFilter] = useState('My Tasks');

  const [docTitle, setDocTitle] = useState('');
  const [docContent, setDocContent] = useState('');
  const [docType, setDocType] = useState('MANUAL');
  const [fileName, setFileName] = useState('');
  const [fileType, setFileType] = useState('pdf');
  const [fileSize, setFileSize] = useState(1200); // KB
  const [docRecipientId, setDocRecipientId] = useState('');

  // UI-only mock state for Document Modal
  const [mockSelectedFile, setMockSelectedFile] = useState(null);
  const [selectedFileObj, setSelectedFileObj] = useState(null);
  const [mockPermission, setMockPermission] = useState('View Only');
  const [mockDescription, setMockDescription] = useState('');
  const [previewDoc, setPreviewDoc] = useState(null);

  // Final features UI state
  const [toastMessage, setToastMessage] = useState('');
  const [shareModalDoc, setShareModalDoc] = useState(null);
  const [shareSearchQuery, setShareSearchQuery] = useState('');
  const [shareSelectedUsers, setShareSelectedUsers] = useState([]);
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleDownload = (doc) => {
    if (doc.type === 'FILE' && doc.storedFileName) {
      window.open(`${API_BASE}/documents/${doc.id}/download`, '_blank');
      return;
    }

    let content = '';
    let downloadFileName = '';
    if (doc.type === 'MANUAL') {
      content = `Title: ${doc.title}\n\n${doc.content || ''}`;
      downloadFileName = (doc.title || 'KnowledgeBase_Article').replace(/\s+/g, '_') + '.txt';
    } else {
      content = 'Simulated file content for ' + (doc.fileName || 'download');
      downloadFileName = doc.fileName || 'SharedFile.pdf';
    }
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = downloadFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Download successfully started.');
  };

  const handleShare = async (docId, recipientIds) => {
    const isVisibilityChange = recipientIds === null;
    const targets = Array.isArray(recipientIds) ? recipientIds : [recipientIds];

    if (isVisibilityChange) {
      setDocuments(prev => prev.map(d => d.id === docId ? { ...d, recipientId: null } : d));
    }

    // Send chat messages
    if (!isVisibilityChange && targets.length > 0) {
      const doc = documents.find(d => d.id === docId);
      if (doc) {
        const attachments = [{
          type: 'document_reference',
          docId: doc.id,
          doc: doc
        }];

        for (const targetId of targets) {
          try {
            await fetch(`http://${window.location.hostname}:8080/api/chat`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                senderId: currentUser.id,
                recipientId: targetId,
                content: '',
                attachments: attachments
              })
            });
          } catch (e) {
            console.error("Failed to share document to chat", e);
          }
        }
      }
    }

    setShareModalDoc(null);
    setShareSearchQuery('');
    setShareSelectedUsers([]);
    showToast(isVisibilityChange ? 'Visibility updated to Public.' : 'Document shared successfully.');
  };

  const [eventTitle, setEventTitle] = useState('');
  const [eventDesc, setEventDesc] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [calendarSelectedDate, setCalendarSelectedDate] = useState(null);
  const [calendarExpanded, setCalendarExpanded] = useState(false);
  const [editingPoll, setEditingPoll] = useState(null);

  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(''); // Comma separated
  const [pollVisibility, setPollVisibility] = useState('Public');
  const [pollAudience, setPollAudience] = useState([]);

  const [workflowType, setWorkflowType] = useState('LEAVE');
  const [workflowTitle, setWorkflowTitle] = useState('');
  const [workflowDesc, setWorkflowDesc] = useState('');
  const [reviewComments, setReviewComments] = useState({}); // workflowId -> comment

  // Profile Edit
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [editDept, setEditDept] = useState('');

  // Refs for Chat Scroll
  const messagesEndRef = useRef(null);

  // Load active session on start
  useEffect(() => {
    if (activeCall?.type === 'video' && localVideoRef.current) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(stream => {
          if (localVideoRef.current) localVideoRef.current.srcObject = stream;
        })
        .catch(err => console.error('Error accessing media devices:', err));
    }
  }, [activeCall]);

  useEffect(() => {
    const savedUser = localStorage.getItem('connect_user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setCurrentUser(parsed);
      setEditName(parsed.name);
      setEditBio(parsed.bio || '');
      setEditAvatar(parsed.avatarUrl || '');
      setEditDept(parsed.department || '');
    }
  }, []);

  // Fetch core data once logged in
  useEffect(() => {
    if (currentUser) {
      // Critical initial data
      fetchUsers();
      fetchPosts();
      fetchGroups();
      setTimeout(fetchTasks, 100);
      setTimeout(fetchDocuments, 200);
      setTimeout(fetchEvents, 300);
      setTimeout(fetchPolls, 400);
      setTimeout(fetchWorkflows, 500);
      setTimeout(fetchAnalytics, 600);
      setTimeout(fetchRecognitions, 700);
      setTimeout(fetchNotifications, 800);
      if (currentUser.role === 'ROLE_ADMIN') {
        fetchDocumentLogs();
        fetchForgotPasswordRequests();
      }
    }
  }, [currentUser]);

  // Polling for Chat Messages
  useEffect(() => {
    if (!currentUser) return;
    fetchAllMessages();
    const interval = setInterval(fetchAllMessages, 3000);
    return () => clearInterval(interval);
  }, [currentUser]);

  // Derive active chat messages from global state
  useEffect(() => {
    if (!chatTarget || !currentUser) {
      setChatMessages([]);
      return;
    }
    const filtered = allMessages.filter(m => {
      if (chatTarget.type === 'group') {
        return m.groupId === chatTarget.id;
      } else {
        return (m.sender.id === currentUser.id && m.recipientId === chatTarget.id) ||
          (m.sender.id === chatTarget.id && m.recipientId === currentUser.id);
      }
    });
    setChatMessages(filtered);
  }, [allMessages, chatTarget, currentUser]);

  // Mark messages as read when a chat is opened
  useEffect(() => {
    if (chatTarget && currentUser) {
      fetch(`${API_BASE}/chat/read`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, type: chatTarget.type, id: chatTarget.id })
      }).then(() => {
        fetchAllMessages(); // refresh to clear badges
      }).catch(err => console.error('Error marking as read:', err));
    }
  }, [chatTarget, currentUser]);

  // Scroll Chat to Bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // API Call Helpers
  const fetchUsers = () => {
    fetch(`${API_BASE}/users`)
      .then(res => res.json())
      .then(data => setUsers(data))
      .catch(err => console.error('Error fetching users:', err));
  };

  const fetchForgotPasswordRequests = () => {
    fetch(`${API_BASE}/auth/forgot-password-requests`)
      .then(res => res.json())
      .then(data => setForgotPasswordRequests(data))
      .catch(err => console.error('Error fetching forgot password requests:', err));
  };

  const fetchPosts = () => {
    fetch(`${API_BASE}/posts`)
      .then(res => res.json())
      .then(data => setPosts(data))
      .catch(err => console.error('Error fetching posts:', err));
  };

  const fetchRecognitions = () => {
    fetch(`${API_BASE}/recognitions`)
      .then(res => res.json())
      .then(data => setRecognitions(data))
      .catch(err => console.error('Error fetching recognitions:', err));
  };

  const fetchNotifications = () => {
    if (!currentUser) return;
    fetch(`${API_BASE}/notifications?userId=${currentUser.id}`)
      .then(res => res.json())
      .then(data => setNotifications(data))
      .catch(err => console.error('Error fetching notifications:', err));
  };

  const fetchGroups = () => {
    fetch(`${API_BASE}/groups`)
      .then(res => res.json())
      .then(data => setGroups(data))
      .catch(err => console.error('Error fetching groups:', err));
  };

  const fetchTasks = () => {
    fetch(`${API_BASE}/tasks`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setTasks(data);
        else setTasks([]);
      })
      .catch(err => console.error('Error fetching tasks:', err));
  };

  const fetchDocuments = () => {
    fetch(`${API_BASE}/documents?userId=${currentUser.id}`)
      .then(res => res.json())
      .then(data => setDocuments(data))
      .catch(err => console.error('Error fetching documents:', err));
  };

  const fetchDocumentLogs = () => {
    fetch(`${API_BASE}/documents/logs`)
      .then(res => res.json())
      .then(data => setDocumentLogs(data))
      .catch(err => console.error('Error fetching document logs:', err));
  };

  const fetchEvents = () => {
    fetch(`${API_BASE}/events`)
      .then(res => res.json())
      .then(data => setEvents(data))
      .catch(err => console.error('Error fetching events:', err));
  };

  const fetchPolls = () => {
    const url = currentUser ? `${API_BASE}/polls?userId=${currentUser.id}` : `${API_BASE}/polls`;
    fetch(url)
      .then(res => res.json())
      .then(data => setPolls(data))
      .catch(err => console.error('Error fetching polls:', err));
  };

  const fetchWorkflows = () => {
    fetch(`${API_BASE}/workflows`)
      .then(res => res.json())
      .then(data => setWorkflows(data))
      .catch(err => console.error('Error fetching workflows:', err));
  };

  const fetchAnalytics = () => {
    fetch(`${API_BASE}/analytics`)
      .then(res => res.json())
      .then(data => setAnalytics(data))
      .catch(err => console.error('Error fetching analytics:', err));
  };

  const fetchComments = (postId) => {
    fetch(`${API_BASE}/posts/${postId}/comments`)
      .then(res => res.json())
      .then(data => {
        setComments(prev => ({ ...prev, [postId]: data }));
      })
      .catch(err => console.error('Error fetching comments:', err));
  };

  const fetchAllMessages = () => {
    if (!currentUser) return;
    fetch(`${API_BASE}/chat/all?userId=${currentUser.id}`)
      .then(res => res.json())
      .then(data => {
        const messagesArray = Array.isArray(data) ? data : [];
        if (!Array.isArray(data)) {
          console.error("fetchAllMessages returned non-array:", data);
        }
        setAllMessages(prev => {
          if (JSON.stringify(prev) === JSON.stringify(messagesArray)) return prev;
          return messagesArray;
        });
      })
      .catch(err => console.error('Error fetching all messages:', err));
  };

  // Login handler
  const handleLogin = (e) => {
    e.preventDefault();
    setLoginError('');
    fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: loginEmail.trim(), password: loginPassword })
    })
      .then(res => {
        if (!res.ok) throw new Error('Authentication failed');
        return res.json();
      })
      .then(user => {
        setCurrentUser(user);
        localStorage.setItem('connect_user', JSON.stringify(user));
        setEditName(user.name);
        setEditBio(user.bio || '');
        setEditAvatar(user.avatarUrl || '');
        setEditDept(user.department || '');
      })
      .catch(err => {
        if (err.message === 'Failed to fetch' || err.toString().includes('NetworkError') || err.message === 'Load failed') {
          setLoginError('Cannot connect to server. Please ensure the backend is running.');
        } else {
          setLoginError('Invalid credentials. Check email or password.');
        }
      });
  };

  const handleQuickLogin = (email, password) => {
    setLoginEmail(email);
    setLoginPassword(password);
    fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
      .then(res => {
        if (!res.ok) throw new Error('Quick login failed');
        return res.json();
      })
      .then(user => {
        setCurrentUser(user);
        localStorage.setItem('connect_user', JSON.stringify(user));
        setEditName(user.name);
        setEditBio(user.bio || '');
        setEditAvatar(user.avatarUrl || '');
        setEditDept(user.department || '');
      })
      .catch(err => setLoginError('Quick Login Failed.'));
  };

  const handleForgotPasswordRequest = (e) => {
    e.preventDefault();
    setForgotPasswordStatus('');
    fetch(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: forgotPasswordEmail })
    })
      .then(res => {
        if (!res.ok) throw new Error('Email not found');
        setForgotPasswordStatus('Reset request sent to admin for approval.');
      })
      .catch(err => setForgotPasswordStatus('Error: Email not found.'));
  };

  const handleCheckResetStatus = (e) => {
    e.preventDefault();
    setForgotPasswordStatus('');
    fetch(`${API_BASE}/auth/check-reset?email=${encodeURIComponent(forgotPasswordEmail)}`)
      .then(res => res.json())
      .then(data => {
        if (data.status === 'Pending') {
          setForgotPasswordStatus('Status: Pending admin approval.');
        } else if (data.status === 'Rejected') {
          setForgotPasswordStatus('Status: Rejected by admin.');
        } else if (data.status === 'Completed' || data.approved) {
          setForgotPasswordStatus('Status: Completed. Your password has been reset successfully!');
        } else {
          setForgotPasswordStatus('Status: No reset request found.');
        }
      })
      .catch(err => setForgotPasswordStatus('Error checking status.'));
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    if (!newPassword) return;
    setForgotPasswordStatus('');
    fetch(`${API_BASE}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: forgotPasswordEmail, newPassword })
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to reset');
        setForgotPasswordStatus('Password reset successful! You can now sign in.');
        setTimeout(() => {
          setShowForgotPassword(false);
          setIsResetApproved(false);
          setForgotPasswordEmail('');
          setNewPassword('');
          setForgotPasswordStatus('');
        }, 3000);
      })
      .catch(err => setForgotPasswordStatus('Error resetting password.'));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setChatTarget(null);
    localStorage.removeItem('connect_user');
    setCurrentTab('dashboard');
  };

  // Post Submission
  const handleCreatePost = (e) => {
    e.preventDefault();
    const validImages = postImages.filter(img => img.url.trim() !== '');

    if (postCategory === 'KUDOS') {
      setKudosAttempted(true);
      if (!kudosReceiverId) {
        showToast('Error: Employee selection is required.');
        return;
      }
      if (!kudosType) {
        showToast('Error: Recognition category is required.');
        return;
      }
      if (!postContent.trim()) {
        return;
      }
    } else {
      if (!postContent.trim() && validImages.length === 0) {
        showToast('Error: Post content is required.');
        return;
      }
    }

    const payload = {
      content: postContent,
      authorId: currentUser.id,
      category: postCategory
    };

    if (postCategory === 'KUDOS') {
      payload.kudosReceiverId = kudosReceiverId;
      payload.kudosType = kudosType;
    }

    if (validImages.length > 0) {
      payload.images = validImages;
    }

    fetch(`${API_BASE}/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => {
        if (!res.ok) throw new Error('Backend failed to create the post.');
        return res.json();
      })
      .then(() => {
        if (postCategory === 'KUDOS') {
          const recPayload = {
            senderId: currentUser.id,
            receiverId: kudosReceiverId,
            category: kudosType,
            message: postContent,
            visibility: 'PUBLIC',
            rewardBadge: '',
            mentionsJson: '[]'
          };
          return fetch(`${API_BASE}/recognitions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(recPayload)
          }).then(res => {
            if (!res.ok) throw new Error('Backend failed to create the recognition.');
            return res.json();
          });
        }
      })
      .then(() => {
        if (postCategory === 'KUDOS') {
          showToast('Kudos Recognition posted successfully.');
          fetchRecognitions();
        } else {
          showToast('Post created successfully.');
        }
        setPostContent('');
        setKudosAttempted(false);
        setKudosReceiverId('');
        setPostImages([]);
        setShowPostModal(false);
        fetchPosts();
        fetchAnalytics();
      })
      .catch(err => {
        console.error(err);
        showToast(`Error: ${err.message || 'Failed to post.'}`);
      });
  };

  const handleLikePost = (postId) => {
    fetch(`${API_BASE}/posts/${postId}/like?userId=${currentUser.id}`, { method: 'POST' })
      .then(res => res.json())
      .then(() => {
        fetchPosts();
      })
      .catch(err => console.error(err));
  };

  const handleAddComment = (e, postId) => {
    e.preventDefault();
    if (!commentContent.trim()) return;

    fetch(`${API_BASE}/posts/${postId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: commentContent, authorId: currentUser.id })
    })
      .then(res => res.json())
      .then(() => {
        setCommentContent('');
        fetchComments(postId);
        fetchPosts(); // Refresh comment counts
      })
      .catch(err => console.error(err));
  };

  // Group creation & joining
  const handleCreateGroup = (e) => {
    e.preventDefault();
    fetch(`${API_BASE}/groups`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: groupName,
        description: groupDesc,
        isPrivate: groupIsPrivate,
        creatorId: currentUser.id,
        members: [...new Set([...groupMembers, String(currentUser.id)])].join(',')
      })
    })
      .then(res => {
        if (!res.ok) throw new Error('Name matches existing group');
        return res.json();
      })
      .then(() => {
        setGroupName('');
        setGroupDesc('');
        setGroupIsPrivate(false);
        setGroupMembers([]);
        setShowGroupModal(false);
        fetchGroups();
      })
      .catch(err => alert(err.message));
  };

  const handleEditGroup = (e) => {
    e.preventDefault();
    fetch(`${API_BASE}/groups/${editGroupTarget.id}?userId=${currentUser.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editGroupName, description: editGroupDesc })
    })
      .then(async res => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then(() => {
        fetchGroups();
        setShowEditGroupModal(false);
      })
      .catch(err => alert(err.message));
  };

  const handleJoinGroup = (groupId) => {
    fetch(`${API_BASE}/groups/${groupId}/join?userId=${currentUser.id}`, { method: 'POST' })
      .then(res => res.json())
      .then(() => fetchGroups())
      .catch(err => console.error(err));
  };

  const handleAddMembersToGroup = (groupId, userIds) => {
    fetch(`${API_BASE}/groups/${groupId}/add-members?userIds=${userIds}`, {
      method: 'POST'
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to add members');
        return res.json();
      })
      .then(() => {
        setShowAddMembersModal(false);
        setActiveGroupToAddMembers(null);
        setAddMembersSelectedIds([]);
        fetchGroups();
      })
      .catch(err => alert(err.message));
  };

  const handleApproveJoin = (groupId, requesterId) => {
    fetch(`${API_BASE}/groups/${groupId}/approve?requesterId=${requesterId}&adminId=${currentUser.id}`, { method: 'POST' })
      .then(res => res.json())
      .then(() => fetchGroups())
      .catch(err => console.error(err));
  };

  const handleChatFileSelect = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPendingAttachments(prev => [...prev, { name: file.name, type: file.type, data: ev.target.result }]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  // Chat message send
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() && pendingAttachments.length === 0) return;

    const payload = {
      content: newMessage,
      senderId: currentUser.id
    };
    if (pendingAttachments.length > 0) {
      payload.attachments = pendingAttachments;
    }

    if (chatTarget.type === 'group') {
      payload.groupId = chatTarget.id;
    } else {
      payload.recipientId = chatTarget.id;
    }

    fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(() => {
        setNewMessage('');
        setPendingAttachments([]);
        fetchAllMessages();
      })
      .catch(err => console.error(err));
  };

  // Tasks (Kanban) CRUD
  const handleCreateTask = (e) => {
    e.preventDefault();
    fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: taskTitle,
        description: taskDesc,
        priority: 'Medium', // Hardcoded since removed from UI
        status: taskStatus,
        assigneeId: currentUser.id, // Always assign to self to show in My Tasks
        dueDate: taskDueDate,
        creatorId: currentUser.id
      })
    })
      .then(res => res.json())
      .then(() => {
        setTaskTitle('');
        setTaskDesc('');
        setTaskStatus('TODO');
        setTaskDueDate('');
        setShowTaskModal(false);
        setActiveTaskFilter('My Tasks');
        fetchTasks();
        fetchAnalytics();
      })
      .catch(err => console.error(err));
  };

  const handleMoveTask = (taskId, currentStatus, direction) => {
    const statuses = ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'];
    let idx = statuses.indexOf(currentStatus);
    if (direction === 'left' && idx > 0) idx--;
    if (direction === 'right' && idx < 3) idx++;
    const newStatus = statuses[idx];

    fetch(`${API_BASE}/tasks/${taskId}/status?status=${newStatus}`, { method: 'PUT' })
      .then(res => res.json())
      .then(() => {
        fetchTasks();
        fetchAnalytics();
      })
      .catch(err => console.error(err));
  };

  const handleMarkNotificationRead = (notifId) => {
    fetch(`${API_BASE}/notifications/${notifId}/read?userId=${currentUser.id}`, { method: 'PUT' })
      .then(() => fetchNotifications())
      .catch(err => console.error(err));
  };

  const handleGiveKudos = () => {
    if (!kudosReceiverId || !kudosMessage) return;

    const mentionsIds = kudosMentions.map(u => u.id);

    const payload = {
      senderId: currentUser.id,
      receiverId: kudosReceiverId,
      category: kudosType,
      message: kudosMessage,
      visibility: kudosVisibility,
      rewardBadge: kudosReward,
      mentionsJson: JSON.stringify(mentionsIds)
    };

    fetch(`${API_BASE}/recognitions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(() => {
        fetchRecognitions();
        setShowKudosModal(false);
        setKudosMessage('');
        setKudosReceiverId('');
        setKudosMentions([]);
        showToast('Kudos sent successfully!');
      });
  };

  const handleDeleteKudos = (id) => {
    if (window.confirm('Are you sure you want to delete this recognition?')) {
      fetch(`${API_BASE}/recognitions/${id}?userId=${currentUser.id}`, { method: 'DELETE' })
        .then(() => fetchRecognitions());
    }
  };

  const handleKudosReaction = (id, type) => {
    fetch(`${API_BASE}/recognitions/${id}/react`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: currentUser.id, type })
    })
      .then(() => fetchRecognitions());
  };

  const handleDeleteTask = (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      fetch(`${API_BASE}/tasks/${taskId}`, { method: 'DELETE' })
        .then(() => {
          fetchTasks();
          fetchAnalytics();
        })
        .catch(err => console.error(err));
    }
  };

  // Document (Manuals & Files)
  const handleCreateDoc = (e) => {
    e.preventDefault();

    if (docType === 'FILE' && selectedFileObj) {
      const formData = new FormData();
      formData.append('file', selectedFileObj);
      formData.append('title', docTitle);
      formData.append('content', docContent || '');
      formData.append('type', docType);
      formData.append('uploaderId', currentUser.id);

      if (currentFolderId) formData.append('parentId', currentFolderId);
      if (docRecipientId) formData.append('recipientId', docRecipientId);

      fetch(`${API_BASE}/documents/upload`, {
        method: 'POST',
        body: formData
      })
        .then(res => res.json())
        .then(() => {
          setDocTitle('');
          setDocContent('');
          setDocType('MANUAL');
          setFileName('');
          setDocRecipientId('');
          setMockSelectedFile(null);
          setSelectedFileObj(null);
          setMockDescription('');
          setShowDocModal(false);
          fetchDocuments();
          if (currentUser.role === 'ROLE_ADMIN') fetchDocumentLogs();
        })
        .catch(err => console.error(err));
      return;
    }

    const payload = {
      title: docTitle,
      content: docContent,
      type: docType, // FOLDER, MANUAL, FILE
      uploaderId: currentUser.id
    };

    if (currentFolderId) {
      payload.parentId = currentFolderId;
    }

    if (docRecipientId) {
      payload.recipientId = docRecipientId;
    }

    if (docType === 'FILE') {
      payload.fileName = fileName || 'Uploaded_Document.pdf';
      payload.fileType = fileType;
      payload.fileSize = fileSize * 1024; // convert KB to bytes
    }

    fetch(`${API_BASE}/documents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(() => {
        setDocTitle('');
        setDocContent('');
        setDocType('MANUAL');
        setFileName('');
        setDocRecipientId('');
        setMockSelectedFile(null);
        setSelectedFileObj(null);
        setMockDescription('');
        setShowDocModal(false);
        fetchDocuments();
        if (currentUser.role === 'ROLE_ADMIN') fetchDocumentLogs();
      })
      .catch(err => console.error(err));
  };

  const handleDeleteDoc = (docId) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      fetch(`${API_BASE}/documents/${docId}?userId=${currentUser.id}`, { method: 'DELETE' })
        .then(() => {
          fetchDocuments();
          if (currentUser.role === 'ROLE_ADMIN') fetchDocumentLogs();
        })
        .catch(err => console.error(err));
    }
  };

  const handleMoveDoc = (docId, newParentId) => {
    fetch(`${API_BASE}/documents/${docId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ parentId: newParentId, userId: currentUser.id })
    })
      .then(res => res.json())
      .then(() => {
        fetchDocuments();
        if (currentUser.role === 'ROLE_ADMIN') fetchDocumentLogs();
      })
      .catch(err => console.error(err));
  };

  // Events & Polls
  const handleCreateEvent = (e) => {
    e.preventDefault();
    fetch(`${API_BASE}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: eventTitle,
        description: eventDesc,
        location: eventLocation,
        eventDate: eventDate,
        creatorId: currentUser.id
      })
    })
      .then(res => res.json())
      .then(() => {
        setEventTitle('');
        setEventDesc('');
        setEventLocation('');
        setEventDate('');
        setShowEventModal(false);
        fetchEvents();
      })
      .catch(err => console.error(err));
  };

  const handleRsvpEvent = (eventId) => {
    fetch(`${API_BASE}/events/${eventId}/rsvp?userId=${currentUser.id}`, { method: 'POST' })
      .then(res => res.json())
      .then(() => fetchEvents())
      .catch(err => console.error(err));
  };

  const handleDeleteEvent = (eventId) => {
    fetch(`${API_BASE}/events/${eventId}`, { method: 'DELETE' })
      .then(() => fetchEvents())
      .catch(err => console.error('Error deleting event:', err));
  };

  const handleEditEvent = (eventId, updatedData) => {
    fetch(`${API_BASE}/events/${eventId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData)
    })
      .then(res => res.json())
      .then(() => fetchEvents())
      .catch(err => console.error('Error updating event:', err));
  };

  const handleDuplicateEvent = (event) => {
    fetch(`${API_BASE}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: `${event.title} (Copy)`,
        description: event.description,
        location: event.location,
        eventDate: event.eventDate,
        creatorId: currentUser.id
      })
    })
      .then(res => res.json())
      .then(() => fetchEvents())
      .catch(err => console.error('Error duplicating event:', err));
  };

  const handleCreatePoll = (e) => {
    e.preventDefault();

    if (pollVisibility === 'Private' && pollAudience.length === 0) {
      alert("Please select at least one employee or team for this private poll.");
      return;
    }

    const selectedEmployeeIds = pollAudience.filter(a => a.startsWith('user_')).map(a => a.replace('user_', '')).join(',');
    const selectedTeamIds = pollAudience.filter(a => !a.startsWith('user_')).join(',');

    fetch(`${API_BASE}/polls`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: pollQuestion,
        options: pollOptions,
        creatorId: currentUser.id,
        visibility: pollVisibility,
        selectedEmployeeIds: selectedEmployeeIds,
        selectedTeamIds: selectedTeamIds
      })
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to create poll");
        return res.json();
      })
      .then(() => {
        setPollQuestion('');
        setPollOptions('');
        setPollVisibility('Public');
        setPollAudience([]);
        setShowPollModal(false);
        fetchPolls();
      })
      .catch(err => {
        console.error(err);
        alert("An error occurred while creating the poll.");
      });
  };

  const handleDeletePoll = (pollId) => {
    if (window.confirm("Are you sure you want to delete this poll?")) {
      fetch(`${API_BASE}/polls/${pollId}?userId=${currentUser.id}`, { method: 'DELETE' })
        .then(res => {
          if (!res.ok) throw new Error("Failed to delete poll");
          return res.json();
        })
        .then(() => fetchPolls())
        .catch(err => {
          console.error(err);
          alert("An error occurred while deleting the poll.");
        });
    }
  };

  const openEditPollModal = (poll) => {
    setEditingPoll(poll);
    setPollQuestion(poll.question);
    setPollOptions(poll.options);
    setPollVisibility(poll.visibility || 'Public');

    const aud = [];
    if (poll.selectedEmployeeIds) {
      poll.selectedEmployeeIds.split(',').forEach(id => aud.push(`user_${id}`));
    }
    if (poll.selectedTeamIds) {
      poll.selectedTeamIds.split(',').forEach(team => aud.push(team));
    }
    setPollAudience(aud);
    setShowPollModal(true);
  };

  const handleUpdatePoll = (e) => {
    e.preventDefault();

    if (pollVisibility === 'Private' && pollAudience.length === 0) {
      alert("Please select at least one employee or team for this private poll.");
      return;
    }

    const selectedEmployeeIds = pollAudience.filter(a => a.startsWith('user_')).map(a => a.replace('user_', '')).join(',');
    const selectedTeamIds = pollAudience.filter(a => !a.startsWith('user_')).join(',');

    fetch(`${API_BASE}/polls/${editingPoll.id}?userId=${currentUser.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: pollQuestion,
        options: pollOptions,
        visibility: pollVisibility,
        selectedEmployeeIds: selectedEmployeeIds,
        selectedTeamIds: selectedTeamIds
      })
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to update poll");
        return res.json();
      })
      .then(() => {
        setEditingPoll(null);
        setPollQuestion('');
        setPollOptions('');
        setPollVisibility('Public');
        setPollAudience([]);
        setShowPollModal(false);
        fetchPolls();
      })
      .catch(err => {
        console.error(err);
        alert("An error occurred while updating the poll.");
      });
  };

  const handleVotePoll = (pollId, optIdx) => {
    fetch(`${API_BASE}/polls/${pollId}/vote?userId=${currentUser.id}&optionIndex=${optIdx}`, { method: 'POST' })
      .then(res => res.json())
      .then(() => fetchPolls())
      .catch(err => console.error(err));
  };

  // Workflow Approvals
  const handleCreateWorkflow = (e) => {
    e.preventDefault();
    fetch(`${API_BASE}/workflows`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: workflowType,
        title: workflowTitle,
        description: workflowDesc,
        creatorId: currentUser.id
      })
    })
      .then(res => res.json())
      .then(() => {
        setWorkflowTitle('');
        setWorkflowDesc('');
        setShowWorkflowModal(false);
        fetchWorkflows();
        fetchAnalytics();
      })
      .catch(err => console.error(err));
  };

  const handleReviewWorkflow = (wfId, status) => {
    const comments = reviewComments[wfId] || '';
    fetch(`${API_BASE}/workflows/${wfId}/review?status=${status}&reviewerId=${currentUser.id}&comments=${encodeURIComponent(comments)}`, { method: 'POST' })
      .then(res => res.json())
      .then(() => {
        // Clear comments
        setReviewComments(prev => ({ ...prev, [wfId]: '' }));
        fetchWorkflows();
        fetchAnalytics();
      })
      .catch(err => console.error(err));
  };

  // Edit profile handler
  const openProfileEdit = () => {
    if (!currentUser) return;
    setEditName(currentUser.name || '');
    setEditBio(currentUser.bio || '');
    setEditAvatar(currentUser.avatarUrl || '');
    setEditDept(currentUser.department || '');
    setShowProfileEdit(true);
  };

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    fetch(`${API_BASE}/users/${currentUser.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editName, bio: editBio, avatarUrl: editAvatar, department: editDept })
    })
      .then(res => res.json())
      .then(updated => {
        setCurrentUser(updated);
        localStorage.setItem('connect_user', JSON.stringify(updated));
        setShowProfileEdit(false);
        fetchUsers();
      })
      .catch(err => console.error(err));
  };

  const handleStatusChange = (status) => {
    fetch(`${API_BASE}/users/${currentUser.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    })
      .then(res => res.json())
      .then(updated => {
        setCurrentUser(updated);
        localStorage.setItem('connect_user', JSON.stringify(updated));
        fetchUsers();
      })
      .catch(err => console.error(err));
  };

  // Helper check for group membership
  const isMemberOf = (group) => {
    if (!currentUser) return false;
    const membersList = (group.members || '').split(',');
    return membersList.includes(String(currentUser.id));
  };

  // Auth Guard Screen
  if (!currentUser && !showForgotPassword) {
    return (
      <div className="login-container">
        <div className="login-main-layout">
          {/* Left Side: Brand Promo / Information */}
          <div className="login-promo">
            <div className="login-promo-header">
              <img src="/logo.jpg" alt="Connect" className="login-promo-logo" />
              <span className="login-promo-title">Connect</span>
            </div>

            <h1 className="login-promo-heading">
              Connect. Collaborate. <br />
              <span className="text-highlight">Grow Together.</span>
            </h1>

            <p className="login-promo-subheading">
              A unified platform for teams to communicate, share ideas and achieve more together.
            </p>

            <div className="login-promo-cards">
              <div className="promo-feature-card">
                <div className="promo-card-icon-wrapper connect-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <h3>Connect</h3>
                <p>Chat, share updates and stay in sync.</p>
              </div>

              <div className="promo-feature-card">
                <div className="promo-card-icon-wrapper collaborate-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <h3>Collaborate</h3>
                <p>Work together in groups and channels.</p>
              </div>

              <div className="promo-feature-card">
                <div className="promo-card-icon-wrapper organize-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <h3>Organize</h3>
                <p>Access files, docs and knowledge easily.</p>
              </div>

              <div className="promo-feature-card">
                <div className="promo-card-icon-wrapper secure-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <h3>Secure</h3>
                <p>Enterprise-grade security you can trust.</p>
              </div>
            </div>

          </div>

          {/* Right Side: Login Form */}
          <div className="login-form-side">
            <div className="login-card">
              <div className="login-card-logo">
                <img src="/logo.jpg" alt="Connect Logo" />
              </div>

              <div className="login-card-header">
                <h2>Welcome Back! 👋</h2>
                <p>Sign in to continue to Connect</p>
              </div>

              {loginError && (
                <div style={{ color: '#991b1b', fontSize: '13px', backgroundColor: '#fee2e2', padding: '12px', borderRadius: '8px', border: '1px solid #fca5a5', textAlign: 'center' }}>
                  {loginError}
                </div>
              )}

              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                <div className="form-group">
                  <label>Email Address</label>
                  <div className="input-with-icon">
                    <span className="input-icon-prefix">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <polyline points="22,6 12,13 2,6" />
                      </svg>
                    </span>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="Enter your email"
                      value={loginEmail}
                      onChange={e => setLoginEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '8px' }}>
                  <label>Password</label>
                  <div className="input-with-icon">
                    <span className="input-icon-prefix">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="form-control"
                      placeholder="Enter your password"
                      value={loginPassword}
                      onChange={e => setLoginPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div className="login-form-options" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0px' }}>
                  <label className="checkbox-container">
                    <input type="checkbox" id="remember-me" style={{ marginRight: '6px' }} />
                    Remember Me
                  </label>
                  <a href="#" onClick={(e) => { e.preventDefault(); setShowForgotPassword(true); setForgotPasswordStatus(''); setIsResetApproved(false); }} className="forgot-password-link" style={{ fontSize: '13px', color: 'var(--primary-color)', textDecoration: 'none', fontWeight: '500' }}>Forgot Password?</a>
                </div>

                <button type="submit" className="btn btn-primary btn-sign-in" style={{ height: '46px', marginTop: '4px' }}>
                  Sign In
                </button>
              </form>

              <div className="login-card-footer">
                Don't have an account? <a href="#" onClick={(e) => { e.preventDefault(); alert("Please contact your IT administrator to create an account."); }} className="contact-admin-link">Contact Admin</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Forgot Password Screen (if toggled)
  if (!currentUser && showForgotPassword) {
    return (
      <div className="login-container">
        <div className="login-main-layout">
          <div className="login-promo">
            {/* Same promo content */}
            <div className="login-promo-header">
              <img src="/logo.jpg" alt="Connect" className="login-promo-logo" />
              <span className="login-promo-title">Connect</span>
            </div>
            <h1 className="login-promo-heading">Connect. Collaborate. <br /><span className="text-highlight">Grow Together.</span></h1>
            <p className="login-promo-subheading">A unified platform for teams to communicate, share ideas and achieve more together.</p>
          </div>
          <div className="login-form-side">
            <div className="login-card">
              <div className="login-card-logo">
                <img src="/logo.jpg" alt="Connect Logo" />
              </div>
              <div className="login-card-header">
                <h2>Reset Password 🔒</h2>
                <p>Request a password reset from your admin</p>
              </div>

              {forgotPasswordStatus && (
                <div style={{ color: forgotPasswordStatus.includes('Error') ? '#991b1b' : '#065f46', fontSize: '13px', backgroundColor: forgotPasswordStatus.includes('Error') ? '#fee2e2' : '#d1fae5', padding: '12px', borderRadius: '8px', marginBottom: '16px', textAlign: 'center' }}>
                  {forgotPasswordStatus}
                </div>
              )}

              {!isResetApproved ? (
                <form style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                  <div className="form-group">
                    <label>Employee ID or Official Email</label>
                    <input type="text" className="form-control" placeholder="Enter your Employee ID or Email" value={forgotPasswordEmail} onChange={e => setForgotPasswordEmail(e.target.value)} required />
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button type="button" onClick={handleForgotPasswordRequest} className="btn btn-secondary" style={{ flex: 1, height: '46px' }}>Request Reset</button>
                    <button type="button" onClick={handleCheckResetStatus} className="btn btn-primary" style={{ flex: 1, height: '46px' }}>Check Status</button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                  <div className="form-group">
                    <label>New Password</label>
                    <input type="password" className="form-control" placeholder="Enter new password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ height: '46px' }}>Set Password</button>
                </form>
              )}

              <div className="login-card-footer" style={{ marginTop: '24px' }}>
                <a href="#" onClick={(e) => { e.preventDefault(); setShowForgotPassword(false); }} style={{ color: 'var(--text-muted)' }}>← Back to Sign In</a>
              </div>

            </div>
          </div>
        </div>

        {/* Outer bottom trust footer bar */}
        <div className="login-footer-bar">
          <span>🛡️ Secure & Trusted by 10,000+ organizations worldwide</span>
          <span>© 2026 Connect Clone</span>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Mobile Drawer Overlay Backdrop */}
      {mobileMenuOpen && (
        <div className="mobile-overlay" onClick={() => setMobileMenuOpen(false)}></div>
      )}

      {/* SIDEBAR NAVIGATION */}
      <div className={`sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        {/* Top 30% Section - Blue */}
        <div className="sidebar-top-blue">
          <div className="sidebar-logo">
            <img src="/logo.jpg" alt="Connect" style={{ width: '36px', height: '36px', borderRadius: '8px', objectFit: 'contain', border: '2px solid rgba(255, 255, 255, 0.4)' }} />
            <h1>Connect</h1>
            <button className="sidebar-mobile-close" onClick={() => setMobileMenuOpen(false)}>
              &times;
            </button>
          </div>
          <div className="sidebar-tagline">
            <p>Smart Collaboration Portal</p>
            <span className="sidebar-tagline-status">● Server Online</span>
          </div>
        </div>

        {/* Bottom 70% Section - White */}
        <div className="sidebar-bottom-white">
          <ul className="sidebar-menu">
            <li className={`menu-item ${currentTab === 'dashboard' ? 'active' : ''}`} onClick={() => { setCurrentTab('dashboard'); setMobileMenuOpen(false); }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
              Dashboard
            </li>
            <li className={`menu-item ${currentTab === 'feed' ? 'active' : ''}`} onClick={() => { setCurrentTab('feed'); setMobileMenuOpen(false); }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>
              Company Feed
            </li>
            <li className={`menu-item ${currentTab === 'groups' ? 'active' : ''}`} onClick={() => { setCurrentTab('groups'); setMobileMenuOpen(false); }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
              Groups
            </li>
            <li className={`menu-item ${currentTab === 'chat' ? 'active' : ''}`} onClick={() => { setCurrentTab('chat'); setMobileMenuOpen(false); }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
              Messaging
            </li>
            <li className={`menu-item ${currentTab === 'tasks' ? 'active' : ''}`} onClick={() => { setCurrentTab('tasks'); setMobileMenuOpen(false); }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="9" y1="3" x2="9" y2="21" /><line x1="15" y1="3" x2="15" y2="21" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="3" y1="15" x2="21" y2="15" /></svg>
              Tasks & Boards
            </li>
            <li className={`menu-item ${currentTab === 'documents' ? 'active' : ''}`} onClick={() => { setCurrentTab('documents'); setMobileMenuOpen(false); }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
              Manuals & Files
            </li>
            <li className={`menu-item ${currentTab === 'approvals' ? 'active' : ''}`} onClick={() => { setCurrentTab('approvals'); setMobileMenuOpen(false); }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
              Workflow Approvals
            </li>
            <li className={`menu-item ${currentTab === 'events' ? 'active' : ''}`} onClick={() => { setCurrentTab('events'); setMobileMenuOpen(false); }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
              Events & Polls
            </li>
            <li className={`menu-item ${currentTab === 'kudos' ? 'active' : ''}`} onClick={() => { setCurrentTab('kudos'); setMobileMenuOpen(false); }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="7" /><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" /></svg>
              Peer Kudos
            </li>
            <li className={`menu-item ${currentTab === 'directory' ? 'active' : ''}`} onClick={() => { setCurrentTab('directory'); setMobileMenuOpen(false); }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="10" r="3" /><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662" /></svg>
              Directory
            </li>
            {currentUser.role === 'ROLE_ADMIN' && (
              <>
                <li className={`menu-item ${currentTab === 'user_management' ? 'active' : ''}`} onClick={() => { setCurrentTab('user_management'); setMobileMenuOpen(false); }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                  User Management
                </li>
                <li className={`menu-item ${currentTab === 'admin' ? 'active' : ''}`} onClick={() => { setCurrentTab('admin'); setMobileMenuOpen(false); }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
                  Admin Settings
                </li>
              </>
            )}
          </ul>

          {/* LOGGED IN USER CARD */}
          <div className="sidebar-footer">
            <img
              className="user-avatar"
              src={currentUser.avatarUrl || 'https://via.placeholder.com/150'}
              alt={currentUser.name}
              onClick={openProfileEdit}
              style={{ cursor: 'pointer' }}
            />
            <div className="user-info">
              <span className="user-name" onClick={openProfileEdit} style={{ cursor: 'pointer' }}>{currentUser.name}</span>
              <span className="user-email">{currentUser.email}</span>
            </div>
            <button onClick={handleLogout} className="logout-btn" title="Sign Out">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
            </button>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="main-content">
        <div className="top-bar">
          <button className="mobile-menu-toggle" onClick={() => setMobileMenuOpen(true)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
          <div className="page-title">
            <h2 style={{ textTransform: 'capitalize' }}>
              {currentTab === 'documents' ? 'Knowledge Base & Files' : currentTab.replace(/([A-Z])/g, ' $1')}
            </h2>
          </div>

          <div className="top-actions">
            {/* SEARCH */}
            <input
              type="text"
              className="top-search"
              placeholder={`Search ${currentTab}...`}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />

            {/* STATUS BADGE SELECTOR */}
            <select
              value={currentUser.status}
              onChange={e => handleStatusChange(e.target.value)}
              className="form-control"
              style={{ padding: '4px 10px', fontSize: '12px', height: '30px', fontWeight: '500' }}
            >
              <option value="Active">🟢 Active</option>
              <option value="On Leave">🟠 On Leave</option>
              <option value="Remote">🔵 Remote</option>
            </select>

            {/* NOTIFICATIONS BELL */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="btn btn-secondary"
                style={{ padding: '6px', height: '30px', width: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
              </button>
              {notifications.filter(n => !n.read).length > 0 && (
                <span style={{ position: 'absolute', top: '-4px', right: '-4px', backgroundColor: '#ef4444', color: 'white', fontSize: '10px', fontWeight: 'bold', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {notifications.filter(n => !n.read).length}
                </span>
              )}
              {showNotifications && (
                <div style={{ position: 'absolute', top: '100%', right: '0', marginTop: '8px', width: '300px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 100, border: '1px solid var(--border-color)', maxHeight: '400px', overflowY: 'auto' }}>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)', fontWeight: '600', fontSize: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    Notifications
                    {notifications.filter(n => !n.read).length > 0 && (
                      <span style={{ fontSize: '11px', color: 'var(--primary-color)', cursor: 'pointer' }} onClick={() => notifications.filter(n => !n.read).forEach(n => handleMarkNotificationRead(n.id))}>Mark all read</span>
                    )}
                  </div>
                  {notifications.length === 0 ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>No notifications</div>
                  ) : (
                    notifications.map(notif => (
                      <div key={notif.id} style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)', backgroundColor: notif.read ? 'white' : '#f0f9ff', cursor: 'pointer' }} onClick={() => handleMarkNotificationRead(notif.id)}>
                        <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#1e293b' }}>{notif.message}</p>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{new Date(notif.createdAt).toLocaleString()}</span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* ROLE BADGE */}
            <span className="badge" style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--text-primary)', textTransform: 'uppercase', fontSize: '10px' }}>
              {currentUser.role.replace('ROLE_', '')}
            </span>
          </div>
        </div>

        <div className="page-container">

          {/* ==========================================
              1. DASHBOARD TAB
              ========================================== */}
          {currentTab === 'dashboard' && (
            <div>
              {/* Stats widgets */}
              <div className="dashboard-grid">
                <div className="stat-card">
                  <span className="stat-title">Employees Online</span>
                  <span className="stat-value">{users.length}</span>
                  <span className="stat-footer">Synced with directory</span>
                </div>
                <div className="stat-card">
                  <span className="stat-title">General Posts</span>
                  <span className="stat-value">{analytics?.postCount || posts.length}</span>
                  <span className="stat-footer">Updates & notices shared</span>
                </div>
                <div className="stat-card">
                  <span className="stat-title">Active Kanban Tasks</span>
                  <span className="stat-value">{analytics?.taskPendingCount || tasks.filter(t => t.status !== 'DONE').length}</span>
                  <span className="stat-footer">Tasks in flight</span>
                </div>
                <div className="stat-card">
                  <span className="stat-title">Workflow approvals</span>
                  <span className="stat-value">{analytics?.approvalRatePercentage || 0}%</span>
                  <span className="stat-footer">Resolution success rate</span>
                </div>
              </div>

              {/* Grid content */}
              <div className="grid-cols-2">
                {/* SVG Visual Charts */}
                <div className="card">
                  <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '20px' }}>Project Tasks Overview</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
                    {/* Interactive SVG Bar Chart - Always rendered */}
                    <svg width="100%" height="150" viewBox="0 0 300 150">
                      {/* Background grid */}
                      <line x1="40" y1="20" x2="280" y2="20" stroke="var(--border-color)" strokeWidth="0.5" />
                      <line x1="40" y1="70" x2="280" y2="70" stroke="var(--border-color)" strokeWidth="0.5" />
                      <line x1="40" y1="120" x2="280" y2="120" stroke="var(--border-color)" strokeWidth="0.5" />

                      {/* Axis */}
                      <line x1="40" y1="10" x2="40" y2="120" stroke="var(--border-focus)" strokeWidth="1.5" />
                      <line x1="40" y1="120" x2="280" y2="120" stroke="var(--border-focus)" strokeWidth="1.5" />

                      {/* Bars with Original Colors */}
                      {/* Todo */}
                      <rect x="65" y={120 - (tasks.filter(t => t.status === 'TODO').length * 20)} width="25" height={tasks.filter(t => t.status === 'TODO').length * 20} fill="#ef4444" rx="3" />
                      {/* In Progress */}
                      <rect x="120" y={120 - (tasks.filter(t => t.status === 'IN_PROGRESS').length * 20)} width="25" height={tasks.filter(t => t.status === 'IN_PROGRESS').length * 20} fill="#3b82f6" rx="3" />
                      {/* Review */}
                      <rect x="175" y={120 - (tasks.filter(t => t.status === 'REVIEW').length * 20)} width="25" height={tasks.filter(t => t.status === 'REVIEW').length * 20} fill="#eab308" rx="3" />
                      {/* Done */}
                      <rect x="230" y={120 - (tasks.filter(t => t.status === 'DONE').length * 20)} width="25" height={tasks.filter(t => t.status === 'DONE').length * 20} fill="#22c55e" rx="3" />

                      {/* Labels */}
                      <text x="77" y="136" fontSize="10" textAnchor="middle" fill="var(--text-secondary)">Todo</text>
                      <text x="132" y="136" fontSize="10" textAnchor="middle" fill="var(--text-secondary)">InProg</text>
                      <text x="187" y="136" fontSize="10" textAnchor="middle" fill="var(--text-secondary)">Review</text>
                      <text x="242" y="136" fontSize="10" textAnchor="middle" fill="var(--text-secondary)">Done</text>

                      {/* Value Labels */}
                      <text x="77" y={120 - (tasks.filter(t => t.status === 'TODO').length * 20) - 5} fontSize="9" textAnchor="middle" fontWeight="bold" fill="var(--text-primary)">{tasks.filter(t => t.status === 'TODO').length}</text>
                      <text x="132" y={120 - (tasks.filter(t => t.status === 'IN_PROGRESS').length * 20) - 5} fontSize="9" textAnchor="middle" fontWeight="bold" fill="var(--text-primary)">{tasks.filter(t => t.status === 'IN_PROGRESS').length}</text>
                      <text x="187" y={120 - (tasks.filter(t => t.status === 'REVIEW').length * 20) - 5} fontSize="9" textAnchor="middle" fontWeight="bold" fill="var(--text-primary)">{tasks.filter(t => t.status === 'REVIEW').length}</text>
                      <text x="242" y={120 - (tasks.filter(t => t.status === 'DONE').length * 20) - 5} fontSize="9" textAnchor="middle" fontWeight="bold" fill="var(--text-primary)">{tasks.filter(t => t.status === 'DONE').length}</text>
                    </svg>
                  </div>
                </div>

                <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '10px' }}>Approval Status</h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Workflow requests resolved successfully.</p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '30px', margin: '20px 0' }}>
                    <svg width="90" height="90" viewBox="0 0 36 36">
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="3.5"
                      />
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#111827"
                        strokeWidth="3.5"
                        strokeDasharray={`${analytics?.approvalRatePercentage || 100}, 100`}
                      />
                      <text x="18" y="20.5" fill="var(--text-primary)" fontSize="7" fontWeight="bold" textAnchor="middle">
                        {analytics?.approvalRatePercentage || 0}%
                      </text>
                    </svg>
                    <div>
                      <div style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                        <span style={{ width: '10px', height: '10px', backgroundColor: '#111827', borderRadius: '50%' }}></span>
                        <span>Approved: {workflows.filter(w => w.status === 'APPROVED').length} requests</span>
                      </div>
                      <div style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                        <span style={{ width: '10px', height: '10px', backgroundColor: '#cbd5e1', borderRadius: '50%' }}></span>
                        <span>Pending Review: {workflows.filter(w => w.status === 'PENDING').length} requests</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Feed Preview */}
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '600' }}>Recent Announcements</h3>
                  <button onClick={() => setCurrentTab('feed')} className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '12px' }}>View Full Feed</button>
                </div>
                {posts.filter(p => p.category === 'ANNOUNCEMENT').slice(0, 2).map(post => (
                  <div key={post.id} style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      <strong style={{ color: 'var(--text-primary)' }}>{post.author.name} ({post.author.department})</strong>
                      <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>{post.content}</p>
                    {post.imagesJson && (() => {
                      try {
                        const images = JSON.parse(post.imagesJson);
                        if (images && images.length > 0) {
                          return (
                            <div style={{ display: 'flex', gap: '8px', marginTop: '8px', overflowX: 'auto' }}>
                              {images.map((img, idx) => (
                                <img
                                  key={idx}
                                  src={img.url}
                                  alt=""
                                  style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                                />
                              ))}
                            </div>
                          );
                        }
                      } catch (e) { }
                      return null;
                    })()}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==========================================
              2. COMPANY FEED TAB
              ========================================== */}
          {currentTab === 'feed' && (
            <div className="feed-layout">
              <div className="feed-main">
                {/* Create post box */}
                <div className="feed-editor">
                  {postCategory === 'KUDOS' && (
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-primary)', display: 'block', marginBottom: '8px' }}>
                        Appreciation Message <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <textarea
                        placeholder="Write your appreciation message..."
                        value={postContent}
                        onChange={e => {
                          setPostContent(e.target.value);
                          if (kudosAttempted) setKudosAttempted(false);
                        }}
                        style={{
                          width: '100%',
                          minHeight: '80px',
                          border: !postContent.trim() ? '1px solid #ef4444' : '1px solid var(--border-color)',
                          outline: !postContent.trim() ? 'none' : undefined,
                          padding: '12px',
                          borderRadius: '8px',
                          resize: 'vertical',
                          fontFamily: 'inherit',
                          fontSize: '14px',
                          transition: 'border 0.2s ease, box-shadow 0.2s ease',
                          boxShadow: !postContent.trim() ? '0 0 0 3px rgba(239, 68, 68, 0.1)' : 'none'
                        }}
                      />
                      {!postContent.trim() && (
                        <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '6px', fontWeight: '500', animation: 'fadeIn 0.3s ease' }}>
                          Please enter an appreciation message.
                        </div>
                      )}
                    </div>
                  )}
                  {postCategory !== 'KUDOS' && (
                    <textarea
                      placeholder={`Share something with the company, ${currentUser.name}...`}
                      value={postContent}
                      onChange={e => setPostContent(e.target.value)}
                    />
                  )}

                  {/* Interactive Image Uploader/List */}
                  {postImages.length > 0 && (
                    <div className="post-image-uploader-list" style={{ display: 'flex', flexDirection: 'column', gap: '14px', borderTop: '1px solid var(--border-color)', paddingTop: '14px' }}>
                      {postImages.map((image, index) => {
                        const handleImageChange = (field, val) => {
                          const updated = [...postImages];
                          updated[index][field] = val;
                          setPostImages(updated);
                        };

                        const handleRemoveImage = () => {
                          const updated = postImages.filter((_, idx) => idx !== index);
                          setPostImages(updated);
                        };

                        const handleFileUpload = (e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              handleImageChange('url', reader.result);
                            };
                            reader.readAsDataURL(file);
                          }
                        };

                        return (
                          <div key={index} className="post-image-uploader-item" style={{ border: '1px solid var(--border-color)', borderRadius: '6px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px', backgroundColor: 'var(--bg-hover)' }}>
                            <div className="uploader-item-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '13px', fontWeight: 'bold' }}>Image #{index + 1}</span>
                              <button type="button" className="btn btn-secondary" onClick={handleRemoveImage} style={{ padding: '2px 8px', fontSize: '11px', color: 'red', border: '1px solid red' }}>
                                Remove
                              </button>
                            </div>
                            <div className="uploader-item-body" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                              <div className="uploader-image-preview-container" style={{ width: '80px', height: '80px', borderRadius: '4px', border: '1px solid var(--border-color)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#e2e8f0' }}>
                                {image.url ? (
                                  <img src={image.url} className="uploader-image-preview" alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', textAlign: 'center' }}>No image</span>
                                )}
                              </div>
                              <div className="uploader-inputs-container" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '200px' }}>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                  <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Paste image URL..."
                                    value={image.url.startsWith('data:') ? 'Local file selected (base64)' : image.url}
                                    disabled={image.url.startsWith('data:')}
                                    onChange={e => handleImageChange('url', e.target.value)}
                                    style={{ flex: 1, fontSize: '12px', height: '30px' }}
                                  />
                                  <label className="btn btn-secondary" style={{ margin: 0, padding: '4px 10px', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', height: '30px' }}>
                                    Upload
                                    <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
                                  </label>
                                </div>
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="Image description (caption)..."
                                  value={image.description}
                                  onChange={e => handleImageChange('description', e.target.value)}
                                  style={{ fontSize: '12px', height: '30px' }}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      <label
                        className="btn btn-secondary"
                        style={{ alignSelf: 'flex-start', padding: '4px 10px', fontSize: '11px', cursor: 'pointer', margin: 0 }}
                      >
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          style={{ display: 'none' }}
                          onChange={(e) => {
                            const files = Array.from(e.target.files);
                            if (files.length === 0) return;

                            let loadedCount = 0;
                            const newImages = [];

                            files.forEach((file) => {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                newImages.push({ url: reader.result, description: '' });
                                loadedCount++;
                                if (loadedCount === files.length) {
                                  setPostImages(prev => [...prev, ...newImages]);
                                }
                              };
                              reader.readAsDataURL(file);
                            });
                            e.target.value = '';
                          }}
                        />
                        + Add Another Image
                      </label>
                    </div>
                  )}

                  <div className="feed-editor-actions">
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      {/* Category Selection */}
                      <select
                        className="form-control"
                        value={postCategory}
                        onChange={e => setPostCategory(e.target.value)}
                        style={{ padding: '4px 10px', fontSize: '12px', height: '30px' }}
                      >
                        <option value="GENERAL">💬 General Post</option>
                        {currentUser.role === 'ROLE_ADMIN' && <option value="ANNOUNCEMENT">📢 Announcement</option>}
                        {currentUser.role === 'ROLE_ADMIN' && <option value="KUDOS">🏆 Kudos Recognition</option>}
                      </select>

                      {/* If Kudos category, show recipient dropdown */}
                      {postCategory === 'KUDOS' && (
                        <>
                          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
                            <select
                              className="form-control"
                              value={kudosReceiverId}
                              onChange={e => setKudosReceiverId(e.target.value)}
                              style={{ padding: '4px 10px', fontSize: '12px', height: '30px', border: (!kudosReceiverId ? '1px solid #ef4444' : '1px solid var(--border-color)') }}
                            >
                              <option value="">Select Employee...</option>
                              {users.filter(u => u.id !== currentUser.id).map(u => (
                                <option key={u.id} value={u.id}>{u.name}</option>
                              ))}
                            </select>
                            {!kudosReceiverId && (
                              <div style={{ position: 'absolute', top: '100%', left: 0, color: '#ef4444', fontSize: '10px', marginTop: '4px', whiteSpace: 'nowrap', animation: 'fadeIn 0.2s ease' }}>
                                Please select an employee.
                              </div>
                            )}
                          </div>

                          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
                            <select
                              className="form-control"
                              value={kudosType}
                              onChange={e => setKudosType(e.target.value)}
                              style={{ padding: '4px 10px', fontSize: '12px', height: '30px', border: (!kudosType ? '1px solid #ef4444' : '1px solid var(--border-color)') }}
                            >
                              <option value="">Select Type...</option>
                              <option value="Team Player">Team Player</option>
                              <option value="Superstar">Superstar</option>
                              <option value="Innovator">Innovator</option>
                              <option value="Hero">Hero</option>
                            </select>
                            {!kudosType && (
                              <div style={{ position: 'absolute', top: '100%', left: 0, color: '#ef4444', fontSize: '10px', marginTop: '4px', whiteSpace: 'nowrap', animation: 'fadeIn 0.2s ease' }}>
                                Please select a recognition type.
                              </div>
                            )}
                          </div>

                          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
                            <select
                              className="form-control"
                              value={kudosReward}
                              onChange={e => setKudosReward(e.target.value)}
                              style={{ padding: '4px 10px', fontSize: '12px', height: '30px', border: (!kudosReward ? '1px solid #ef4444' : '1px solid var(--border-color)') }}
                            >
                              <option value="">Select Badge...</option>
                              <option value="⭐ Kudos Points">⭐ Kudos Points</option>
                              <option value="🥇 Gold Badge">🥇 Gold Badge</option>
                              <option value="🥈 Silver Badge">🥈 Silver Badge</option>
                              <option value="🥉 Bronze Badge">🥉 Bronze Badge</option>
                            </select>
                            {!kudosReward && (
                              <div style={{ position: 'absolute', top: '100%', left: 0, color: '#ef4444', fontSize: '10px', marginTop: '4px', whiteSpace: 'nowrap', animation: 'fadeIn 0.2s ease' }}>
                                Please select a badge.
                              </div>
                            )}
                          </div>
                        </>
                      )}

                      {/* Add Image Button */}
                      <label
                        className="btn btn-secondary"
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px', fontSize: '12px', height: '30px', cursor: 'pointer', margin: 0 }}
                      >
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          style={{ display: 'none' }}
                          onChange={(e) => {
                            const files = Array.from(e.target.files);
                            if (files.length === 0) return;

                            let loadedCount = 0;
                            const newImages = [];

                            files.forEach((file) => {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                newImages.push({ url: reader.result, description: '' });
                                loadedCount++;
                                if (loadedCount === files.length) {
                                  setPostImages(prev => [...prev, ...newImages]);
                                }
                              };
                              reader.readAsDataURL(file);
                            });
                            e.target.value = ''; // Reset input
                          }}
                        />
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <polyline points="21 15 16 10 5 21" />
                        </svg>
                        Add Image
                      </label>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <button
                        onClick={handleCreatePost}
                        className="btn btn-primary"
                        disabled={postCategory === 'KUDOS' && (!kudosReceiverId || !kudosType || !kudosReward || !postContent.trim())}
                        style={{
                          padding: '6px 14px',
                          fontSize: '13px',
                          opacity: (postCategory === 'KUDOS' && (!kudosReceiverId || !kudosType || !kudosReward || !postContent.trim())) ? 0.5 : 1,
                          cursor: (postCategory === 'KUDOS' && (!kudosReceiverId || !kudosType || !kudosReward || !postContent.trim())) ? 'not-allowed' : 'pointer',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        Post
                      </button>
                    </div>
                  </div>
                </div>

                {/* Feed posts list */}
                {posts
                  .filter(post =>
                    (post.content || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (post.author?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map(post => {
                    const isLikedByMe = (post.likedBy || '').split(',').includes(String(currentUser.id));
                    return (
                      <div key={post.id} className="post-card">
                        <div className="post-header">
                          <div className="post-author">
                            <img className="post-author-avatar" src={post.author.avatarUrl || 'https://via.placeholder.com/150'} alt="" />
                            <div className="post-author-details">
                              <span className="post-author-name">{post.author.name}</span>
                              <span className="post-time">{post.author.department} • {new Date(post.createdAt).toLocaleString()}</span>
                            </div>
                          </div>
                          <span className="post-category">{post.category}</span>
                        </div>

                        {/* Kudos Banner */}
                        {post.category === 'KUDOS' && post.kudosReceiver && (
                          <div className="kudos-badge-box">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="7" /><path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12" /></svg>
                            <span>Recognized <strong>{post.kudosReceiver.name}</strong> as a <strong>{post.kudosType}</strong>!</span>
                          </div>
                        )}

                        <p className="post-content">{post.content}</p>

                        {/* Post Images Layout */}
                        {post.imagesJson && (() => {
                          try {
                            const images = JSON.parse(post.imagesJson);
                            if (images && images.length > 0) {
                              return (
                                <div className={`post-media-container images-count-${images.length}`}>
                                  {images.map((img, idx) => (
                                    <div key={idx} className="post-media-item" onClick={() => setSelectedLightboxImage({ ...img, allImages: images, currentIndex: idx })}>
                                      <img src={img.url} alt={img.description || ""} className="post-media-image" />
                                      {img.description && (
                                        <div className="post-media-caption">
                                          <span>{img.description}</span>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              );
                            }
                          } catch (e) {
                            console.error("Error parsing imagesJson:", e);
                          }
                          return null;
                        })()}

                        <div className="post-actions">
                          <button
                            className={`post-action-btn ${isLikedByMe ? 'liked' : ''}`}
                            onClick={() => handleLikePost(post.id)}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill={isLikedByMe ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" /></svg>
                            Like ({post.likesCount})
                          </button>

                          <button
                            className="post-action-btn"
                            onClick={() => {
                              if (activeCommentsPostId === post.id) {
                                setActiveCommentsPostId(null);
                              } else {
                                setActiveCommentsPostId(post.id);
                                fetchComments(post.id);
                              }
                            }}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                            Comments
                          </button>
                        </div>

                        {/* Comments overlay */}
                        {activeCommentsPostId === post.id && (
                          <div className="comments-section">
                            <div className="comment-list">
                              {(comments[post.id] || []).map(comment => (
                                <div key={comment.id} className="comment-item">
                                  <img className="comment-avatar" src={comment.author.avatarUrl || 'https://via.placeholder.com/150'} alt="" />
                                  <div className="comment-body">
                                    <div className="comment-author-name">{comment.author.name}</div>
                                    <div className="comment-content">{comment.content}</div>
                                  </div>
                                </div>
                              ))}
                              {(!comments[post.id] || comments[post.id].length === 0) && (
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No comments yet. Be the first to reply!</div>
                              )}
                            </div>
                            <form onSubmit={(e) => handleAddComment(e, post.id)} className="comment-editor">
                              <input
                                type="text"
                                className="comment-input"
                                placeholder="Write a reply..."
                                value={commentContent}
                                onChange={e => setCommentContent(e.target.value)}
                                required
                              />
                              <button type="submit" className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '12px' }}>Reply</button>
                            </form>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>

              {/* Feed Right Sidebar (Kudos leaders/stats) */}
              <div className="feed-sidebar">
                <div className="card">
                  <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '14px' }}>Peer Kudos Board</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {posts.filter(p => p.category === 'KUDOS').slice(0, 4).map(kudo => (
                      <div key={kudo.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingBottom: '8px', borderBottom: '1px solid var(--border-color)' }}>
                        <img style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }} src={kudo.kudosReceiver?.avatarUrl} alt="" />
                        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                          <span style={{ fontSize: '12.5px', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{kudo.kudosReceiver?.name}</span>
                          <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Recieved "{kudo.kudosType}"</span>
                        </div>
                      </div>
                    ))}
                    {posts.filter(p => p.category === 'KUDOS').length === 0 && (
                      <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>No recognition posted yet. Give Kudos to a teammate!</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
              3. GROUPS TAB
              ========================================== */}
          {currentTab === 'groups' && (() => {
            const filteredGroups = groups.filter(group =>
              (group.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
              (group.description || '').toLowerCase().includes(searchTerm.toLowerCase())
            );
            const publicGroups = filteredGroups.filter(g => !g.isPrivate && g.name !== 'All Members');
            const privateGroups = filteredGroups.filter(g => g.isPrivate && g.name !== 'All Members');
            const allMembersGroups = filteredGroups.filter(g => g.name === 'All Members');

            const renderGroupCard = (group) => {
              const isJoined = isMemberOf(group);
              const isPending = (group.pendingRequests || '').split(',').includes(String(currentUser.id));
              const groupMembers = users.filter(u => (group.members || '').split(',').includes(String(u.id)));

              if (group.name === 'All Members') {
                groupMembers.sort((a, b) => a.name === 'Sarah Jenkins' ? -1 : b.name === 'Sarah Jenkins' ? 1 : 0);
              }

              const currentGTab = activeGroupTab[group.id] || 'members';

              return (
                <div key={group.id} className="group-card">
                  <div className="group-header">
                    <div className="group-avatar">
                      {group.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="group-title-area">
                      <div className="group-title">{group.name}</div>
                      <div className="group-desc">{group.description}</div>
                    </div>
                    <div style={{ position: 'relative' }}>
                      <button
                        className="group-options"
                        onClick={() => setOpenGroupMenuId(openGroupMenuId === group.id ? null : group.id)}
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" /></svg>
                      </button>
                      {openGroupMenuId === group.id && (
                        <div className="group-options-menu">
                          {(!group.isPrivate || isJoined) && (
                            <button onClick={() => {
                              setEditGroupTarget(group);
                              setEditGroupName(group.name);
                              setEditGroupDesc(group.description);
                              setShowEditGroupModal(true);
                              setOpenGroupMenuId(null);
                            }}>Edit Group</button>
                          )}
                          {isJoined && (
                            <button onClick={() => {
                              setActiveGroupToAddMembers(group);
                              setAddMembersSelectedIds([]);
                              setShowAddMembersModal(true);
                              setOpenGroupMenuId(null);
                            }}>Add Members</button>
                          )}
                          {isJoined && <button onClick={() => setOpenGroupMenuId(null)}>Leave Group</button>}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="group-body">
                    <div className="group-tabs">
                      <button className={`group-tab ${currentGTab === 'members' ? 'active' : ''}`} onClick={() => setActiveGroupTab({ ...activeGroupTab, [group.id]: 'members' })}>Members ({groupMembers.length})</button>
                      <button className={`group-tab ${currentGTab === 'poll' ? 'active' : ''}`} onClick={() => setActiveGroupTab({ ...activeGroupTab, [group.id]: 'poll' })}>Polls</button>
                      <button className={`group-tab ${currentGTab === 'notice' ? 'active' : ''}`} onClick={() => setActiveGroupTab({ ...activeGroupTab, [group.id]: 'notice' })}>Notice Board</button>
                      <button className={`group-tab ${currentGTab === 'tasks' ? 'active' : ''}`} onClick={() => setActiveGroupTab({ ...activeGroupTab, [group.id]: 'tasks' })}>Tasks</button>
                    </div>

                    {currentGTab === 'members' && (
                      <div className="group-members-list">
                        {groupMembers.map(u => {
                          const isSarah = u.name === 'Sarah Jenkins';
                          return (
                            <div key={u.id} className="group-member-item" style={isSarah && group.name === 'All Members' ? { padding: '8px', border: '1px solid var(--border-focus)', borderRadius: '8px', backgroundColor: '#f8fafc' } : {}}>
                              <img src={u.avatarUrl || `https://ui-avatars.com/api/?name=${u.name.replace(' ', '+')}&background=random`} className="group-member-avatar" alt="" />
                              <div className="group-member-info">
                                <span className="group-member-name">{u.name} {isSarah && group.name === 'All Members' ? '(Admin)' : ''}</span>
                                <span className="group-member-time">Last Active {u.id % 2 === 0 ? '5 min ago' : 'Today 10:30 AM'}</span>
                              </div>
                              <span className={`group-member-status ${u.status === 'Active' ? 'status-active' : u.status === 'On Leave' ? 'status-leave' : 'status-remote'}`}>
                                {u.status || 'Active'}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {currentGTab === 'poll' && (
                      <div className="group-mock-view">
                        <strong>Active Poll: Next Team Outing?</strong><br />
                        <label><input type="radio" name={`poll-${group.id}`} /> Bowling</label> &nbsp;
                        <label><input type="radio" name={`poll-${group.id}`} /> Dinner</label>
                      </div>
                    )}

                    {currentGTab === 'notice' && (
                      <div className="group-mock-view">
                        <strong>📌 Announcement</strong><br />
                        Welcome to the new {group.name} workspace! Make sure to read the guidelines.
                      </div>
                    )}

                    {currentGTab === 'tasks' && (
                      <div className="group-mock-view">
                        <strong>Assigned Tasks</strong><br />
                        - Update group description<br />
                        - Invite missing members
                      </div>
                    )}
                  </div>

                  <div className="group-footer">
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <span className="badge" style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--text-secondary)' }}>
                        {group.isPrivate ? '🔒 Private' : '🌐 Public'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      {isJoined ? (
                        <button
                          onClick={() => {
                            setChatTarget({ type: 'group', id: group.id, name: group.name });
                            setCurrentTab('chat');
                          }}
                          className="btn btn-secondary"
                          style={{ padding: '6px 14px', fontSize: '13px' }}
                        >
                          Open Group Chat
                        </button>
                      ) : isPending ? (
                        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Pending Approval</span>
                      ) : (
                        <button onClick={() => handleJoinGroup(group.id)} className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '13px' }}>
                          {group.isPrivate ? 'Request to Join' : 'Join Group'}
                        </button>
                      )}
                    </div>
                  </div>

                  {group.isPrivate && isJoined && group.pendingRequests && group.pendingRequests.split(',').filter(x => x).length > 0 && (
                    <div style={{ margin: '0 16px 16px 16px', backgroundColor: '#fafafa', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '10px' }}>
                      <p style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>PENDING JOIN REQUESTS:</p>
                      {group.pendingRequests.split(',').filter(x => x).map(reqId => {
                        const reqUser = users.find(u => String(u.id) === String(reqId));
                        if (!reqUser) return null;
                        return (
                          <div key={reqId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', marginBottom: '4px' }}>
                            <span>{reqUser.name} ({reqUser.department})</span>
                            <button onClick={() => handleApproveJoin(group.id, reqUser.id)} className="btn btn-primary" style={{ padding: '2px 6px', fontSize: '10px' }}>Approve</button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            };

            return (
              <div onClick={(e) => { if (!e.target.closest('.group-options')) setOpenGroupMenuId(null); }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: '700' }}>Company Workgroups</h3>
                  <button onClick={() => setShowGroupModal(true)} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '14px' }}>
                    Create New Group
                  </button>
                </div>

                {publicGroups.length > 0 && (
                  <>
                    <h4 className="group-section-title">Public Groups</h4>
                    <div className="grid-cols-2">
                      {publicGroups.map(renderGroupCard)}
                    </div>
                  </>
                )}

                {privateGroups.length > 0 && (
                  <>
                    <h4 className="group-section-title">Private Groups</h4>
                    <div className="grid-cols-2">
                      {privateGroups.map(renderGroupCard)}
                    </div>
                  </>
                )}

                {allMembersGroups.length > 0 && (
                  <>
                    <h4 className="group-section-title">All Members</h4>
                    <div className="grid-cols-2">
                      {allMembersGroups.map(renderGroupCard)}
                    </div>
                  </>
                )}
              </div>
            );
          })()}

          {/* ==========================================
              4. MESSAGING TAB (CHAT)
              ========================================== */}
          {currentTab === 'chat' && (
            <div className="chat-container">
              {/* Chat Left Contacts Sidebar */}
              <div className="chat-sidebar">
                <div className="chat-list-section">
                  {/* Channels/Groups */}
                  {(() => {
                    const renderGroupList = (list) => list.map(g => {
                      const groupMessages = allMessages.filter(m => m.groupId === g.id);
                      const lastMsg = groupMessages.length > 0 ? groupMessages[groupMessages.length - 1] : null;
                      const unreadCount = groupMessages.filter(m => !m.readStatus && m.sender.id !== currentUser.id).length;

                      return (
                        <div
                          key={g.id}
                          className={`chat-list-item ${chatTarget?.type === 'group' && chatTarget.id === g.id ? 'active' : ''}`}
                          onClick={() => setChatTarget({ type: 'group', id: g.id, name: g.name })}
                        >
                          <div className="avatar-container">
                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="9" y1="3" x2="9" y2="21" /></svg>
                            </div>
                          </div>
                          <div className="chat-item-content">
                            <div className="chat-item-header" style={{ marginBottom: 0, marginTop: '2px' }}>
                              <span className="chat-item-name">{g.name}</span>
                              {lastMsg && <span className="chat-item-time" style={{ fontSize: '11px', color: '#94a3b8' }}>{new Date(lastMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                              <span className="chat-item-preview" style={{ maxWidth: '140px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '12px', color: '#64748b' }}>
                                {lastMsg ? (lastMsg.sender.id === currentUser.id ? 'You: ' + lastMsg.content : lastMsg.sender.name.split(' ')[0] + ': ' + lastMsg.content) : 'No messages yet'}
                              </span>
                              {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
                            </div>
                          </div>
                        </div>
                      )
                    });

                    return (
                      <>
                        <div className="chat-list-section-wrapper">
                          <div className="chat-section-header">Public Channels</div>
                          {renderGroupList(groups.filter(isMemberOf).filter(g => !g.isPrivate))}
                        </div>
                        <div className="chat-list-section-wrapper" style={{ marginTop: '20px' }}>
                          <div className="chat-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>Private Group Chats</span>
                            <button onClick={() => { setGroupIsPrivate(true); setShowGroupModal(true); }} style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', fontSize: '20px', lineHeight: '1', padding: '0 4px', fontWeight: 'bold' }} title="Create Private Group Chat">+</button>
                          </div>
                          {renderGroupList(groups.filter(isMemberOf).filter(g => g.isPrivate))}
                          {groups.filter(isMemberOf).filter(g => g.isPrivate).length === 0 && (
                            <div style={{ fontSize: '12px', color: '#94a3b8', padding: '8px 12px' }}>No private groups yet.</div>
                          )}
                        </div>
                      </>
                    );
                  })()}

                  {/* Direct Messages */}
                  <div className="chat-list-section-wrapper" style={{ marginTop: '20px' }}>
                    <div className="chat-section-header">Direct Messages</div>
                    {(() => {
                      const activeGroup = chatTarget?.type === 'group' ? groups.find(g => g.id === chatTarget.id) : null;
                      let displayedUsers = users.filter(u => u.id !== currentUser.id);
                      if (activeGroup && activeGroup.name !== 'All Members') {
                        const memberIds = (activeGroup.members || '').split(',');
                        displayedUsers = displayedUsers.filter(u => memberIds.includes(String(u.id)));
                      }

                      // Sort by last message time
                      displayedUsers.sort((a, b) => {
                        const aMsgs = allMessages.filter(m => (m.sender.id === a.id && m.recipientId === currentUser.id) || (m.sender.id === currentUser.id && m.recipientId === a.id));
                        const bMsgs = allMessages.filter(m => (m.sender.id === b.id && m.recipientId === currentUser.id) || (m.sender.id === currentUser.id && m.recipientId === b.id));
                        const aTime = aMsgs.length > 0 ? new Date(aMsgs[aMsgs.length - 1].createdAt).getTime() : 0;
                        const bTime = bMsgs.length > 0 ? new Date(bMsgs[bMsgs.length - 1].createdAt).getTime() : 0;
                        return bTime - aTime;
                      });

                      return displayedUsers.map(u => {
                        const dmMessages = allMessages.filter(m => (m.sender.id === u.id && m.recipientId === currentUser.id) || (m.sender.id === currentUser.id && m.recipientId === u.id));
                        const lastMsg = dmMessages.length > 0 ? dmMessages[dmMessages.length - 1] : null;
                        const unreadCount = dmMessages.filter(m => !m.readStatus && m.sender.id === u.id).length;

                        return (
                          <div
                            key={u.id}
                            className={`chat-list-item ${chatTarget?.type === 'direct' && chatTarget.id === u.id ? 'active' : ''}`}
                            onClick={() => setChatTarget({ type: 'direct', id: u.id, name: u.name, avatarUrl: u.avatarUrl })}
                          >
                            <div className="avatar-container">
                              <img src={u.avatarUrl || `https://ui-avatars.com/api/?name=${u.name.replace(' ', '+')}&background=random`} style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} alt="" />
                              <div className="online-dot" style={{ backgroundColor: u.status === 'Active' ? '#22c55e' : '#94a3b8' }}></div>
                            </div>
                            <div className="chat-item-content">
                              <div className="chat-item-header">
                                <span className="chat-item-name">{u.name}</span>
                                {lastMsg && <span className="chat-item-time">{new Date(lastMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span className="chat-item-preview" style={{ maxWidth: '140px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {lastMsg ? (lastMsg.sender.id === currentUser.id ? 'You: ' + lastMsg.content : lastMsg.content) : 'Say hi!'}
                                </span>
                                {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
                              </div>
                            </div>
                          </div>
                        )
                      });
                    })()}
                  </div>
                </div>
              </div>

              {/* Chat Chat window panel */}
              <div className="chat-window">
                {chatTarget ? (
                  <>
                    <div className="chat-header">
                      <div className="chat-header-info">
                        {chatTarget.type === 'direct' ? (
                          <img src={chatTarget.avatarUrl || `https://ui-avatars.com/api/?name=${chatTarget.name.replace(' ', '+')}&background=random`} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} alt="" />
                        ) : (
                          <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="9" y1="3" x2="9" y2="21" /></svg>
                          </div>
                        )}
                        <span className="chat-header-name">{chatTarget.type === 'group' ? `# ${chatTarget.name}` : chatTarget.name}</span>
                      </div>
                      <div className="chat-header-actions">
                        <svg onClick={() => startCall('voice')} style={{ cursor: 'pointer' }} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                        <svg onClick={() => startCall('video')} style={{ cursor: 'pointer' }} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
                      </div>
                    </div>

                    <div className="chat-messages" style={{ display: chatMessages.length === 0 ? 'flex' : 'block', flexDirection: 'column', alignItems: chatMessages.length === 0 ? 'center' : 'stretch', justifyContent: chatMessages.length === 0 ? 'center' : 'flex-start' }}>
                      {chatMessages.length === 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--text-muted)', marginTop: '-40px' }}>
                          <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="var(--border-focus)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '16px', opacity: 0.8 }}>
                            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" fill="#f1f5f9" />
                            <path d="M7 12h10" stroke="var(--accent)" strokeWidth="1.5" />
                            <path d="M7 8h6" stroke="var(--accent)" strokeWidth="1.5" />
                          </svg>
                          <h4 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px' }}>Start the conversation</h4>
                          <p style={{ fontSize: '14px', textAlign: 'center', maxWidth: '300px', lineHeight: '1.5' }}>Send a message to {chatTarget.type === 'group' ? 'the group' : chatTarget.name} to get things started.</p>
                        </div>
                      ) : (
                        chatMessages.map((msg, index) => {
                          const isOutgoing = msg.sender.id === currentUser.id;
                          const msgDate = new Date(msg.createdAt).toDateString();
                          const prevMsgDate = index > 0 ? new Date(chatMessages[index - 1].createdAt).toDateString() : null;

                          let showSeparator = false;
                          let separatorText = '';
                          if (msgDate !== prevMsgDate) {
                            showSeparator = true;
                            const today = new Date().toDateString();
                            const yesterday = new Date(Date.now() - 86400000).toDateString();
                            if (msgDate === today) separatorText = 'Today';
                            else if (msgDate === yesterday) separatorText = 'Yesterday';
                            else separatorText = new Date(msg.createdAt).toLocaleDateString('en-US', { weekday: 'long' });
                          }

                          return (
                            <React.Fragment key={msg.id}>
                              {showSeparator && (
                                <div className="chat-date-separator">
                                  {separatorText}
                                </div>
                              )}
                              <div className={`chat-msg-row ${isOutgoing ? 'outgoing' : 'incoming'}`}>
                                {!isOutgoing && (
                                  <img src={msg.sender.avatarUrl || `https://ui-avatars.com/api/?name=${msg.sender.name.replace(' ', '+')}&background=random`} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', marginTop: '4px' }} alt="" />
                                )}
                                <div>
                                  {!isOutgoing && (
                                    <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '500', marginLeft: '4px' }}>{msg.sender.name}</span>
                                  )}
                                  <div className="chat-msg-bubble">
                                    {msg.attachmentsJson && (() => {
                                      try {
                                        const atts = JSON.parse(msg.attachmentsJson);
                                        return atts.map((att, i) => {
                                          if (att.type === 'document_reference') {
                                            const doc = att.doc || documents.find(d => d.id === att.docId);
                                            if (!doc) return <div key={i} style={{ padding: '8px', fontStyle: 'italic', color: '#94a3b8', fontSize: '12px' }}>Document unavailable or deleted.</div>;
                                            return (
                                              <div key={i} className="chat-doc-card shadow-sm" style={{ width: '100%', maxWidth: '450px', padding: '16px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <span style={{ padding: '4px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: 'bold', backgroundColor: doc.recipientId == null ? '#dcfce7' : '#fee2e2', color: doc.recipientId == null ? '#166534' : '#991b1b' }}>
                                                      {doc.recipientId == null ? '🌐 Public' : '🔒 Private'}
                                                    </span>
                                                    <span style={{ fontSize: '11px', color: '#64748b' }}>
                                                      By {doc.uploader?.name || 'System'} • {new Date(doc.uploadDate || doc.createdAt || Date.now()).toLocaleDateString()}
                                                    </span>
                                                  </div>
                                                </div>

                                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                                                  <div style={{ fontSize: '12px', color: '#475569', backgroundColor: '#f1f5f9', padding: '4px 8px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>
                                                    <span style={{ fontWeight: '600' }}>Location:</span> {(() => {
                                                      if (!doc.parentId) return 'Root Directory';
                                                      let path = [];
                                                      let curr = documents.find(d => d.id === doc.parentId);
                                                      while (curr) {
                                                        path.unshift(curr.title || 'Folder');
                                                        curr = documents.find(d => d.id === curr.parentId);
                                                      }
                                                      return 'Root > ' + path.join(' > ');
                                                    })()}
                                                  </div>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                                  <div style={{ fontSize: '28px' }}>{doc.type === 'MANUAL' ? '📄' : '📁'}</div>
                                                  <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '16px' }}>{doc.title || doc.fileName}</div>
                                                </div>

                                                {doc.type === 'MANUAL' && (
                                                  <div style={{ fontSize: '14px', color: '#334155', lineHeight: '1.6', whiteSpace: 'pre-line', marginBottom: '16px', backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                                    {doc.content}
                                                  </div>
                                                )}

                                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                                  <button onClick={() => setPreviewDoc(doc)} className="btn-action-soft" style={{ flex: 1, minWidth: '80px', padding: '6px 12px', fontSize: '12px', justifyContent: 'center' }}>Preview</button>
                                                  <button onClick={() => handleDownload(doc)} className="btn-action-soft" style={{ flex: 1, minWidth: '80px', padding: '6px 12px', fontSize: '12px', justifyContent: 'center' }}>Download</button>
                                                  <button onClick={() => { navigator.clipboard.writeText(`https://connect.company.com/docs/${doc.id}`); showToast('Link copied successfully.'); }} className="btn-action-soft" style={{ flex: 1, minWidth: '80px', padding: '6px 12px', fontSize: '12px', justifyContent: 'center' }}>Copy Link</button>
                                                </div>
                                              </div>
                                            );
                                          }
                                          return att.type.startsWith('image/')
                                            ? <a key={i} href={att.data} target="_blank" rel="noopener noreferrer"><img src={att.data} alt={att.name} style={{ maxWidth: '200px', borderRadius: '8px', marginBottom: '8px', display: 'block', cursor: 'pointer' }} /></a>
                                            : <a key={i} href={att.data} download={att.name} style={{ display: 'block', padding: '8px', backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: '4px', marginBottom: '8px', fontSize: '12px', textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}>📎 {att.name}</a>
                                        });
                                      } catch (e) { return null; }
                                    })()}
                                    {msg.content}
                                    <span className="chat-msg-meta">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                  </div>
                                </div>
                              </div>
                            </React.Fragment>
                          );
                        })
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    <form onSubmit={handleSendMessage} className="chat-input-area" style={{ flexDirection: 'column', gap: '8px' }}>
                      {pendingAttachments.length > 0 && (
                        <div style={{ display: 'flex', gap: '8px', padding: '8px', backgroundColor: 'var(--bg-card)', borderRadius: '8px', overflowX: 'auto', width: '100%' }}>
                          {pendingAttachments.map((att, i) => (
                            <div key={i} style={{ position: 'relative', width: '60px', height: '60px', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                              {att.type.startsWith('image/') ? (
                                <img src={att.data} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              ) : (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', fontSize: '24px', backgroundColor: '#f1f5f9' }}>📄</div>
                              )}
                              <div
                                onClick={() => setPendingAttachments(prev => prev.filter((_, idx) => idx !== i))}
                                style={{ position: 'absolute', top: '2px', right: '2px', background: 'rgba(0,0,0,0.5)', color: 'white', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '10px' }}
                              >x</div>
                            </div>
                          ))}
                        </div>
                      )}
                      <div style={{ display: 'flex', gap: '8px', width: '100%', alignItems: 'center' }}>
                        <div className="chat-input-wrapper" style={{ flex: 1 }}>
                          <input type="file" multiple ref={chatFileInputRef} style={{ display: 'none' }} onChange={handleChatFileSelect} />
                          <svg onClick={() => chatFileInputRef.current?.click()} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ cursor: 'pointer' }}><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
                          <input
                            type="text"
                            className="chat-input"
                            placeholder={`Message ${chatTarget.type === 'group' ? '#' + chatTarget.name : chatTarget.name}...`}
                            value={newMessage}
                            onChange={e => setNewMessage(e.target.value)}
                            required
                          />
                        </div>
                        <button type="submit" className="chat-send-btn" disabled={!newMessage.trim() && pendingAttachments.length === 0}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                        </button>
                      </div>
                    </form>
                  </>
                ) : (
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px', color: 'var(--text-muted)', backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-lg)' }}>
                    <svg width="120" height="120" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect width="200" height="200" fill="transparent" />
                      <path d="M100 140C133.137 140 160 117.614 160 90C160 62.3858 133.137 40 100 40C66.8629 40 40 62.3858 40 90C40 101.442 44.5776 112.036 52.285 120.655C50.2798 129.288 45.4192 136.633 45.3116 136.792C44.6067 137.842 44.9723 139.293 46.0645 139.818C47.1568 140.342 48.4907 139.957 49.0967 138.932C52.7915 132.65 60.129 128.256 67.587 127.351C77.4727 135.253 88.2259 140 100 140Z" fill="#e0e7ff" stroke="#4f46e5" strokeWidth="4" strokeLinejoin="round" />
                      <path d="M140 150C156.569 150 170 138.807 170 125C170 111.193 156.569 100 140 100C123.431 100 110 111.193 110 125C110 130.721 112.289 136.018 116.142 140.328C115.14 144.644 112.71 148.317 112.656 148.396C112.303 148.921 112.486 149.646 113.032 149.908C113.579 150.17 114.245 149.978 114.549 149.466C116.396 146.325 120.065 144.128 123.793 143.676C128.736 147.626 134.113 150 140 150Z" fill="#c7d2fe" stroke="#4338ca" strokeWidth="4" strokeLinejoin="round" />
                      <circle cx="80" cy="90" r="6" fill="#4f46e5" />
                      <circle cx="100" cy="90" r="6" fill="#4f46e5" />
                      <circle cx="120" cy="90" r="6" fill="#4f46e5" />
                    </svg>
                    <div style={{ textAlign: 'center', marginTop: '8px' }}>
                      <h2 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px', letterSpacing: '-0.5px' }}>Start the Conversation</h2>
                      <p style={{ fontSize: '15px', color: 'var(--text-secondary)', maxWidth: '300px', margin: '0 auto', lineHeight: '1.5' }}>
                        Select a workspace channel or a colleague from the sidebar to send a message.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==========================================
              5. KANBAN TASKS TAB
              ========================================== */}
          {currentTab === 'tasks' && (
            <TasksBoards
              tasks={tasks}
              currentUser={currentUser}
              searchTerm={searchTerm}
              activeTaskFilter={activeTaskFilter}
              setActiveTaskFilter={setActiveTaskFilter}
              setShowTaskModal={setShowTaskModal}
              handleDeleteTask={handleDeleteTask}
              handleMoveTask={handleMoveTask}
            />
          )}

          {/* ==========================================
              6. DOCUMENTS & FILE LIBRARY TAB
              ========================================== */}
          {currentTab === 'documents' && (
            <FileManagement
              documents={documents}
              currentUser={currentUser}
              searchTerm={searchTerm}
              setActiveShareDocId={setActiveShareDocId}
              setShowDocModal={setShowDocModal}
              setPreviewDoc={setPreviewDoc}
              showToast={showToast}
              handleDownload={handleDownload}
              setShareModalDoc={setShareModalDoc}
              setShareSelectedUsers={setShareSelectedUsers}
              handleDeleteDoc={handleDeleteDoc}
              currentFolderId={currentFolderId}
              setCurrentFolderId={setCurrentFolderId}
              documentLogs={documentLogs}
              fetchDocumentLogs={fetchDocumentLogs}
              handleMoveDoc={handleMoveDoc}
            />
          )}

          {/* ==========================================
              7. WORKFLOW AUTOMATION TAB
              ========================================== */}
          {currentTab === 'approvals' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Company Form & Approval Automation</h3>
                {currentUser?.role !== 'ROLE_ADMIN' && (
                  <button onClick={() => setShowWorkflowModal(true)} className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '13px' }}>
                    Submit New Request
                  </button>
                )}
              </div>

              {/* Form/Workflows inbox */}
              <div className="card">
                <h4 style={{ fontSize: '14.5px', fontWeight: '600', marginBottom: '14px' }}>
                  Organization Workflow Requests
                </h4>

                <table className="approvals-table">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Title</th>
                      <th>Submitted By</th>
                      <th>Status</th>
                      <th>Comments / Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workflows
                      .filter(w => (w.title || '').toLowerCase().includes(searchTerm.toLowerCase()) || (w.type || '').toLowerCase().includes(searchTerm.toLowerCase()))
                      .map(wf => (
                        <tr key={wf.id}>
                          <td><span className="badge" style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--text-primary)' }}>{wf.type}</span></td>
                          <td>
                            <strong>{wf.title}</strong>
                            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>{wf.description}</p>
                          </td>
                          <td>{wf.creator.name} ({wf.creator.department})</td>
                          <td>
                            <span className={`status-badge status-${(wf.status || 'pending').toLowerCase()}`}>
                              {wf.status || 'PENDING'}
                            </span>
                          </td>
                          <td>
                            {wf.status === 'PENDING' && currentUser.role === 'ROLE_ADMIN' ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <input
                                  type="text"
                                  placeholder="Review comments..."
                                  className="form-control"
                                  style={{ padding: '4px 8px', fontSize: '12px' }}
                                  value={reviewComments[wf.id] || ''}
                                  onChange={e => setReviewComments({ ...reviewComments, [wf.id]: e.target.value })}
                                />
                                <div style={{ display: 'flex', gap: '6px' }}>
                                  <button onClick={() => handleReviewWorkflow(wf.id, 'APPROVED')} className="btn btn-primary" style={{ padding: '2px 6px', fontSize: '11px', backgroundColor: '#166534' }}>Approve</button>
                                  <button onClick={() => handleReviewWorkflow(wf.id, 'REJECTED')} className="btn btn-danger" style={{ padding: '2px 6px', fontSize: '11px' }}>Reject</button>
                                </div>
                              </div>
                            ) : (
                              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                                {wf.adminComments || 'No reviewer comments.'}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    {workflows.length === 0 && (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No approval requests found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ==========================================
              8. EVENTS & POLLS TAB
              ========================================== */}
          {currentTab === 'events' && (
            <Events
              events={events}
              currentUser={currentUser}
              searchTerm={searchTerm}
              calendarExpanded={calendarExpanded}
              setCalendarExpanded={setCalendarExpanded}
              setShowEventModal={setShowEventModal}
              calendarMonth={calendarMonth}
              setCalendarMonth={setCalendarMonth}
              calendarSelectedDate={calendarSelectedDate}
              setCalendarSelectedDate={setCalendarSelectedDate}
              handleRsvpEvent={handleRsvpEvent}
              handleDeleteEvent={handleDeleteEvent}
              handleEditEvent={handleEditEvent}
              handleDuplicateEvent={handleDuplicateEvent}
              polls={polls}
              setShowPollModal={setShowPollModal}
              openEditPollModal={openEditPollModal}
              handleDeletePoll={handleDeletePoll}
              handleVotePoll={handleVotePoll}
            />
          )}

          {/* ==========================================
              X. KUDOS TAB
              ========================================== */}
          {currentTab === 'kudos' && (
            <div className="kudos-layout" style={{ display: 'flex', gap: '30px', animation: 'fadeIn 0.5s ease', padding: '10px' }}>
              <div style={{ flex: '1' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', padding: '24px 32px', background: 'linear-gradient(135deg, #0f172a 0%, #3b82f6 100%)', borderRadius: '20px', color: 'white', boxShadow: '0 15px 25px -5px rgba(59, 130, 246, 0.4)' }}>
                  <div>
                    <h2 style={{ fontSize: '32px', fontWeight: '800', margin: '0 0 8px 0', letterSpacing: '-1px' }}>🌟 Peer Kudos Board</h2>
                    <p style={{ margin: '0', fontSize: '16px', color: '#cbd5e1' }}>Celebrating excellence and team achievements.</p>
                  </div>
                  {currentUser && currentUser.role === 'ROLE_ADMIN' && (
                    <button onClick={() => setShowKudosModal(true)} style={{ padding: '12px 24px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.15)', border: '1px solid rgba(255, 255, 255, 0.3)', color: 'white', fontSize: '15px', fontWeight: 'bold', backdropFilter: 'blur(10px)', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '8px' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)'} onMouseOut={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'}>
                      <span style={{ fontSize: '18px' }}>✨</span> Give Kudos
                    </button>
                  )}
                </div>

                <div className="kudos-grid">
                  {recognitions
                    .filter(rec =>
                      (rec.message || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                      (rec.receiver.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                      (rec.category || '').toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map(rec => {
                      let reactions = {};
                      try { reactions = JSON.parse(rec.reactionsJson || '{}'); } catch (e) { }
                      let mentions = [];
                      try { mentions = JSON.parse(rec.mentionsJson || '[]'); } catch (e) { }
                      const claps = (reactions['CLAP'] || []).length;
                      const celebrates = (reactions['CELEBRATE'] || []).length;
                      const appreciates = (reactions['APPRECIATE'] || []).length;

                      const messageParts = rec.message.split(/(@[\w\s]+)/g);

                      return (
                        <div key={rec.id} style={{ background: '#ffffff', borderRadius: '20px', padding: '24px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)', border: '1px solid rgba(226, 232, 240, 0.8)', display: 'flex', flexDirection: 'column', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', position: 'relative', overflow: 'hidden' }} onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'; e.currentTarget.style.borderColor = '#bae6fd' }} onMouseOut={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.05)'; e.currentTarget.style.borderColor = 'rgba(226, 232, 240, 0.8)' }}>
                          <div style={{ position: 'absolute', top: '0', left: '0', width: '100%', height: '6px', background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)' }}></div>

                          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                            <img src={rec.receiver.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(rec.receiver.name)}&background=random`} style={{ width: '56px', height: '56px', borderRadius: '16px', objectFit: 'cover', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }} alt="" />
                            <div style={{ flex: '1' }}>
                              <h4 style={{ fontSize: '18px', margin: '0 0 4px 0', color: '#0f172a', fontWeight: '700' }}>{rec.receiver.name}</h4>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                <span style={{ fontSize: '12px', padding: '4px 10px', background: '#f1f5f9', color: '#475569', borderRadius: '20px', fontWeight: '600' }}>{rec.category}</span>
                                {rec.rewardBadge && (
                                  <span style={{ padding: '4px 10px', backgroundColor: '#fef3c7', color: '#d97706', borderRadius: '20px', fontSize: '12px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>🏆 {rec.rewardBadge}</span>
                                )}
                              </div>
                            </div>
                          </div>

                          <p style={{ marginTop: '20px', fontSize: '15px', lineHeight: '1.6', color: '#334155', flex: '1' }}>
                            {messageParts.map((part, i) => {
                              if (part.startsWith('@')) {
                                return <span key={i} style={{ color: '#2563eb', fontWeight: '600', cursor: 'pointer', background: '#eff6ff', padding: '2px 6px', borderRadius: '6px' }} onClick={() => {
                                  const mentionedName = part.substring(1).trim();
                                  const u = users.find(user => user.name.toLowerCase() === mentionedName.toLowerCase());
                                  if (u) { setViewingProfileId(u.id); setShowProfileModal(true); }
                                }}>{part}</span>
                              }
                              return <span key={i}>{part}</span>
                            })}
                          </p>

                          <div style={{ marginTop: '20px', display: 'flex', gap: '10px', borderTop: '1px solid #f1f5f9', paddingTop: '16px', alignItems: 'center' }}>
                            <button onClick={() => handleKudosReaction(rec.id, 'CLAP')} className="btn-reaction" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '6px 12px', fontSize: '13px', fontWeight: '600', color: '#475569', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.background = '#f1f5f9'} onMouseOut={e => e.currentTarget.style.background = '#f8fafc'}>👏 {claps}</button>
                            <button onClick={() => handleKudosReaction(rec.id, 'CELEBRATE')} className="btn-reaction" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '6px 12px', fontSize: '13px', fontWeight: '600', color: '#475569', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.background = '#f1f5f9'} onMouseOut={e => e.currentTarget.style.background = '#f8fafc'}>🎉 {celebrates}</button>
                            <button onClick={() => handleKudosReaction(rec.id, 'APPRECIATE')} className="btn-reaction" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '6px 12px', fontSize: '13px', fontWeight: '600', color: '#475569', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.background = '#f1f5f9'} onMouseOut={e => e.currentTarget.style.background = '#f8fafc'}>❤️ {appreciates}</button>

                            <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '500' }}>By {rec.sender.name}</span>
                              {(currentUser.id === rec.sender.id || currentUser.role === 'ROLE_ADMIN') && (
                                <button onClick={() => handleDeleteKudos(rec.id)} style={{ background: '#fee2e2', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: '14px', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = '#fecaca'} onMouseOut={e => e.currentTarget.style.background = '#fee2e2'} title="Delete">🗑️</button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  {recognitions.length === 0 && (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 40px', color: '#64748b', backgroundColor: '#ffffff', borderRadius: '20px', border: '2px dashed #cbd5e1', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                      <span style={{ fontSize: '48px' }}>🏆</span>
                      <h3 style={{ margin: '0', fontSize: '20px', color: '#0f172a' }}>No Recognitions Yet</h3>
                      <p style={{ margin: '0', fontSize: '15px' }}>Admins, be the first to acknowledge a team member!</p>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ width: '340px', flexShrink: '0' }}>
                <div style={{ position: 'sticky', top: '24px', background: 'white', borderRadius: '20px', padding: '24px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)', border: '1px solid rgba(226, 232, 240, 0.8)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                    <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', color: 'white', boxShadow: '0 4px 6px rgba(245, 158, 11, 0.3)' }}>🏆</div>
                    <h3 style={{ fontSize: '18px', fontWeight: '800', margin: '0', color: '#0f172a' }}>Hall of Fame</h3>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {Object.entries(recognitions.reduce((acc, r) => {
                      acc[r.receiver.name] = (acc[r.receiver.name] || 0) + 1;
                      return acc;
                    }, {})).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([name, count], idx) => {
                      let trophy = null;
                      let rankBg = '#f8fafc';
                      let rankColor = '#64748b';
                      let cardBg = '#ffffff';
                      let borderColor = '#f1f5f9';

                      if (idx === 0) {
                        trophy = '🥇 Gold Trophy';
                        rankBg = 'linear-gradient(135deg, #fbbf24, #d97706)';
                        rankColor = 'white';
                        cardBg = 'linear-gradient(to right, #fffbeb, #ffffff)';
                        borderColor = '#fde68a';
                      } else if (idx === 1) {
                        trophy = '🥈 Silver Trophy';
                        rankBg = 'linear-gradient(135deg, #cbd5e1, #94a3b8)';
                        rankColor = 'white';
                        cardBg = 'linear-gradient(to right, #f8fafc, #ffffff)';
                        borderColor = '#e2e8f0';
                      } else if (idx === 2) {
                        trophy = '🥉 Bronze Trophy';
                        rankBg = 'linear-gradient(135deg, #fdba74, #c2410c)';
                        rankColor = 'white';
                        cardBg = 'linear-gradient(to right, #ffedd5, #ffffff)';
                        borderColor = '#fed7aa';
                      } else {
                        rankBg = '#f1f5f9';
                      }

                      return (
                        <div key={name} style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '16px', background: cardBg, borderRadius: '16px', border: `1px solid ${borderColor}`, transition: 'transform 0.2s', cursor: 'default' }} onMouseOver={e => e.currentTarget.style.transform = 'translateX(4px)'} onMouseOut={e => e.currentTarget.style.transform = 'none'}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: rankBg, color: rankColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 'bold', boxShadow: idx < 3 ? '0 4px 6px rgba(0,0,0,0.1)' : 'none' }}>{idx + 1}</div>
                              <span style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>{name}</span>
                            </div>
                            <span style={{ fontSize: '13px', background: '#e0f2fe', color: '#0284c7', padding: '4px 12px', borderRadius: '20px', fontWeight: '700' }}>{count} Awards</span>
                          </div>
                          {trophy && (
                            <div style={{ marginLeft: '44px', fontSize: '12px', fontWeight: '600', color: idx === 0 ? '#d97706' : idx === 1 ? '#475569' : '#c2410c', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <span>{trophy.split(' ')[0]}</span>
                              <span>Achievement unlocked: {trophy.split(' ').slice(1).join(' ')}</span>
                            </div>
                          )}
                        </div>
                      )
                    })}
                    {recognitions.length === 0 && (
                      <div style={{ padding: '24px', textAlign: 'center', background: '#f8fafc', borderRadius: '16px', color: '#94a3b8', fontSize: '14px' }}>
                        The hall of fame is currently empty.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
              9. DIRECTORY TAB
              ========================================== */}
          {currentTab === 'directory' && (
            <EmployeeDirectory
              users={users.filter(u => u.id !== currentUser?.id)}
              searchTerm={searchTerm}
              groups={groups}
              activeDirectoryMenuId={activeDirectoryMenuId}
              setActiveDirectoryMenuId={setActiveDirectoryMenuId}
              setViewingProfileId={setViewingProfileId}
              setShowProfileModal={setShowProfileModal}
              setChatTarget={setChatTarget}
              setCurrentTab={setCurrentTab}
            />
          )}

          {/* ==========================================
              9.5 USER MANAGEMENT TAB
              ========================================== */}
          {currentTab === 'user_management' && currentUser.role === 'ROLE_ADMIN' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              {/* Dedicated Password Reset Requests Section */}
              <div className="card">
                <h3 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  🔑 Forgot Password Requests
                </h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                      <th style={{ padding: '12px' }}>Request ID</th>
                      <th style={{ padding: '12px' }}>Employee ID</th>
                      <th style={{ padding: '12px' }}>Name</th>
                      <th style={{ padding: '12px' }}>Email</th>
                      <th style={{ padding: '12px' }}>Requested Time</th>
                      <th style={{ padding: '12px' }}>Status</th>
                      <th style={{ padding: '12px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {forgotPasswordRequests.length === 0 ? (
                      <tr>
                        <td colSpan="7" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                          No password reset requests found.
                        </td>
                      </tr>
                    ) : (
                      forgotPasswordRequests.map(r => (
                        <tr key={'reset-req-' + r.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '12px', fontWeight: '500' }}>#{r.id}</td>
                          <td style={{ padding: '12px', fontWeight: '600' }}>{r.employeeId}</td>
                          <td style={{ padding: '12px' }}>{r.name}</td>
                          <td style={{ padding: '12px' }}>{r.email}</td>
                          <td style={{ padding: '12px', fontSize: '13px', color: 'var(--text-muted)' }}>
                            {r.requestedAt ? new Date(r.requestedAt).toLocaleString() : 'N/A'}
                          </td>
                          <td style={{ padding: '12px' }}>
                            <span style={{
                              backgroundColor: r.status === 'Pending' ? '#fef3c7' : r.status === 'Completed' ? '#d1fae5' : '#fee2e2',
                              color: r.status === 'Pending' ? '#92400e' : r.status === 'Completed' ? '#065f46' : '#991b1b',
                              padding: '4px 10px',
                              borderRadius: '12px',
                              fontSize: '12px',
                              fontWeight: '700'
                            }}>
                              {r.status}
                            </span>
                          </td>
                          <td style={{ padding: '12px' }}>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button
                                onClick={() => {
                                  alert(`Password Reset Request Details:\n\nRequest ID: #${r.id}\nEmployee ID: ${r.employeeId}\nName: ${r.name}\nEmail: ${r.email}\nStatus: ${r.status}\nRequested Time: ${r.requestedAt ? new Date(r.requestedAt).toLocaleString() : 'N/A'}`);
                                }}
                                className="btn btn-secondary"
                                style={{ padding: '6px 12px', fontSize: '12px', backgroundColor: '#4b5563', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                              >
                                View
                              </button>
                              {r.status === 'Pending' && (
                                <>
                                  <button
                                    onClick={() => {
                                      const newPassword = prompt(`Enter new password for ${r.name} (Employee ID: ${r.employeeId}):`);
                                      if (newPassword) {
                                        fetch(`${API_BASE}/auth/forgot-password-requests/${r.id}/reset`, {
                                          method: 'POST',
                                          headers: { 'Content-Type': 'application/json' },
                                          body: JSON.stringify({ password: newPassword })
                                        })
                                          .then(res => res.json())
                                          .then(() => {
                                            fetchForgotPasswordRequests();
                                            fetchUsers();
                                            alert(`Password for ${r.name} has been reset successfully and marked as Completed.`);
                                          })
                                          .catch(err => alert("Failed to complete password reset."));
                                      }
                                    }}
                                    className="btn btn-secondary"
                                    style={{ padding: '6px 12px', fontSize: '12px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                  >
                                    Reset Password
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (window.confirm(`Are you sure you want to reject this password reset request?`)) {
                                        fetch(`${API_BASE}/auth/forgot-password-requests/${r.id}/reject`, {
                                          method: 'POST'
                                        })
                                          .then(res => res.json())
                                          .then(() => {
                                            fetchForgotPasswordRequests();
                                            alert("Request has been marked as Rejected.");
                                          })
                                          .catch(err => alert("Failed to reject request."));
                                      }
                                    }}
                                    className="btn btn-secondary"
                                    style={{ padding: '6px 12px', fontSize: '12px', backgroundColor: '#dc2626', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                  >
                                    Reject
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="card">
                <h3 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '20px' }}>User Management</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                      <th style={{ padding: '12px' }}>Name</th>
                      <th style={{ padding: '12px' }}>Email</th>
                      <th style={{ padding: '12px' }}>Status</th>
                      <th style={{ padding: '12px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '12px', verticalAlign: 'middle' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <img src={u.avatarUrl || 'https://via.placeholder.com/40'} alt={u.name} style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
                            <div>
                              <div style={{ fontWeight: '500' }}>{u.name}</div>
                              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{u.role}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '12px', verticalAlign: 'middle' }}>{u.email}</td>
                        <td style={{ padding: '12px', verticalAlign: 'middle' }}>
                          {u.resetRequested && !u.resetApproved ? (
                            <span style={{ backgroundColor: '#fef3c7', color: '#92400e', padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>Password Reset Pending</span>
                          ) : (
                            <span>{u.status}</span>
                          )}
                        </td>
                        <td style={{ padding: '12px', verticalAlign: 'middle' }}>
                          <div style={{ display: 'flex', gap: '10px' }}>
                            {u.resetRequested && !u.resetApproved && (
                              <button onClick={() => {
                                fetch(`${API_BASE}/users/${u.id}/approve-reset`, { method: 'POST' })
                                  .then(res => res.json())
                                  .then(updatedUser => setUsers(users.map(user => user.id === updatedUser.id ? updatedUser : user)))
                                  .catch(err => alert("Failed to approve reset"));
                              }} className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '12px', backgroundColor: '#10b981', color: '#fff', border: 'none' }}>Approve</button>
                            )}
                            <button onClick={() => {
                              const newEmail = prompt("Enter new email:", u.email);
                              if (newEmail !== null) {
                                const newPassword = prompt("Enter new password (leave blank to keep current):");
                                const body = { email: newEmail };
                                if (newPassword) body.password = newPassword;
                                fetch(`${API_BASE}/users/${u.id}`, {
                                  method: 'PUT',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify(body)
                                })
                                  .then(res => res.json())
                                  .then(updatedUser => setUsers(users.map(user => user.id === updatedUser.id ? updatedUser : user)))
                                  .catch(err => alert("Failed to update user"));
                              }
                            }} className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '12px' }}>Edit</button>
                            <button onClick={() => {
                              if (window.confirm("Are you sure you want to delete this user?")) {
                                fetch(`${API_BASE}/users/${u.id}`, { method: 'DELETE' })
                                  .then(res => {
                                    if (res.ok) setUsers(users.filter(user => user.id !== u.id));
                                    else alert("Failed to delete user");
                                  })
                                  .catch(err => alert("Failed to delete user"));
                              }
                            }} className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '12px', color: '#ef4444', borderColor: '#ef4444' }}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ==========================================
              10. ADMIN SETTINGS TAB
              ========================================== */}
          {currentTab === 'admin' && currentUser.role === 'ROLE_ADMIN' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              <div className="card">
                <h3 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '20px' }}>Create Employee / Admin Profile</h3>

                <form onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.target;
                  const name = form.name.value;
                  const email = form.email.value;
                  const password = form.password.value;
                  const department = form.department.value;
                  const role = form.role.value;
                  const status = form.status.value;
                  const bio = form.bio.value;
                  const avatarUrl = form.avatarUrl.value;

                  fetch(`${API_BASE}/users`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password, department, role, status, bio, avatarUrl })
                  })
                    .then(res => {
                      if (!res.ok) throw new Error('User already exists or registration failed');
                      return res.json();
                    })
                    .then(() => {
                      alert('User profile registered successfully!');
                      form.reset();
                      fetchUsers();
                      fetchAnalytics();
                    })
                    .catch(err => alert(err.message));
                }} className="admin-form-grid">
                  <div className="form-group">
                    <label>Employee Name</label>
                    <input type="text" name="name" className="form-control" placeholder="e.g. Richard Hendricks" required />
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input type="email" name="email" className="form-control" placeholder="e.g. richard@company.com" required />
                  </div>
                  <div className="form-group">
                    <label>Password</label>
                    <input type="password" name="password" className="form-control" placeholder="••••••••" required />
                  </div>
                  <div className="form-group">
                    <label>Department</label>
                    <input type="text" name="department" className="form-control" placeholder="e.g. Engineering, HR, Product" required />
                  </div>
                  <div className="form-group">
                    <label>Workspace Role</label>
                    <select name="role" className="form-control" required>
                      <option value="ROLE_EMPLOYEE">Standard Employee</option>
                      <option value="ROLE_ADMIN">System Administrator</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Initial Status</label>
                    <select name="status" className="form-control" required>
                      <option value="Active">🟢 Active</option>
                      <option value="On Leave">🟠 On Leave</option>
                      <option value="Remote">🔵 Remote</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label>Employee Bio</label>
                    <textarea name="bio" className="form-control" placeholder="Write a short summary about the new member..." rows="3"></textarea>
                  </div>
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label>Avatar Photo URL (Optional)</label>
                    <input type="text" name="avatarUrl" className="form-control" placeholder="https://images.unsplash.com/..." />
                  </div>
                  <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end' }}>
                    <button type="submit" className="btn btn-primary">Create User Profile</button>
                  </div>
                </form>
              </div>

              {/* Admin Manage Roles Table */}
              <div className="card">
                <h3 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '20px' }}>Manage User Access & Promote Admins</h3>
                <table className="approvals-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Department</th>
                      <th>Current Role</th>
                      <th>Quick Access Promoters</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id}>
                        <td><strong>{u.name}</strong></td>
                        <td>{u.email}</td>
                        <td>{u.department}</td>
                        <td>
                          <span className="badge" style={{ backgroundColor: u.role === 'ROLE_ADMIN' ? 'var(--accent)' : 'var(--bg-hover)', color: u.role === 'ROLE_ADMIN' ? 'var(--accent-text)' : 'var(--text-primary)' }}>
                            {u.role.replace('ROLE_', '')}
                          </span>
                        </td>
                        <td>
                          {u.role === 'ROLE_EMPLOYEE' ? (
                            <button
                              onClick={() => {
                                if (window.confirm(`Are you sure you want to promote ${u.name} to Administrator?`)) {
                                  fetch(`${API_BASE}/users/${u.id}`, {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ role: 'ROLE_ADMIN' })
                                  })
                                    .then(res => res.json())
                                    .then(() => {
                                      alert(`${u.name} is now an Administrator!`);
                                      fetchUsers();
                                    })
                                    .catch(err => console.error(err));
                                }
                              }}
                              className="btn btn-secondary"
                              style={{ padding: '4px 10px', fontSize: '12px' }}
                            >
                              Promote to Admin
                            </button>
                          ) : (
                            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Admin Role Active</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ==========================================
          MODALS & FORM POPUPS
          ========================================== */}

      {/* 1. Profile Edit Modal */}
      {showProfileEdit && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Edit Profile</h3>
              <button className="modal-close-btn" onClick={() => setShowProfileEdit(false)}>&times;</button>
            </div>
            <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label>Name</label>
                <input type="text" className="form-control" value={editName} onChange={e => setEditName(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Department</label>
                <input type="text" className="form-control" value={editDept} onChange={e => setEditDept(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Bio</label>
                <textarea className="form-control" value={editBio} onChange={e => setEditBio(e.target.value)} rows="3" />
              </div>
              <div className="form-group">
                <label>Avatar Image URL</label>
                <input type="text" className="form-control" value={editAvatar} onChange={e => setEditAvatar(e.target.value)} />
              </div>
              <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-end' }}>Save Changes</button>
            </form>
          </div>
        </div>
      )}

      {/* 2. Group Modal */}
      {showGroupModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Create Workgroup</h3>
              <button className="modal-close-btn" onClick={() => setShowGroupModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleCreateGroup} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label>Group Name (Unique)</label>
                <input type="text" className="form-control" placeholder="e.g. Frontend Devs" value={groupName} onChange={e => setGroupName(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea className="form-control" placeholder="Describe the group focus..." value={groupDesc} onChange={e => setGroupDesc(e.target.value)} rows="3" />
              </div>
              <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
                <input type="checkbox" checked={groupIsPrivate} onChange={e => setGroupIsPrivate(e.target.checked)} />
                <label style={{ cursor: 'pointer' }}>Private Group (Requires approval to join)</label>
              </div>

              <div className="form-group">
                <label>Add Initial Members</label>
                <div style={{ maxHeight: '150px', overflowY: 'auto', border: '2px solid var(--border-color)', borderRadius: '8px', padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px', backgroundColor: 'var(--bg-app)' }}>
                  {users.filter(u => u.id !== currentUser.id).map(u => (
                    <label key={u.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13.5px', fontWeight: '500' }}>
                      <input
                        type="checkbox"
                        checked={groupMembers.includes(String(u.id))}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setGroupMembers([...groupMembers, String(u.id)]);
                          } else {
                            setGroupMembers(groupMembers.filter(id => id !== String(u.id)));
                          }
                        }}
                        style={{ width: '16px', height: '16px' }}
                      />
                      <img src={u.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"} alt={u.name} style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }} />
                      <span>{u.name} ({u.department || 'Staff'})</span>
                    </label>
                  ))}
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-end' }}>Create Group</button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Group Modal */}
      {showEditGroupModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Edit Workgroup</h3>
              <button className="modal-close-btn" onClick={() => setShowEditGroupModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleEditGroup} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label>Group Name (Unique)</label>
                <input type="text" className="form-control" value={editGroupName} onChange={e => setEditGroupName(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea className="form-control" value={editGroupDesc} onChange={e => setEditGroupDesc(e.target.value)} rows="3" />
              </div>
              <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-end' }}>Save Changes</button>
            </form>
          </div>
        </div>
      )}

      {/* 2.5 Add Members Modal */}
      {showAddMembersModal && activeGroupToAddMembers && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Add Members to {activeGroupToAddMembers.name}</h3>
              <button className="modal-close-btn" onClick={() => { setShowAddMembersModal(false); setActiveGroupToAddMembers(null); }}>&times;</button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleAddMembersToGroup(activeGroupToAddMembers.id, addMembersSelectedIds.join(','));
            }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label>Select members to add:</label>
                <div style={{ maxHeight: '220px', overflowY: 'auto', border: '2px solid var(--border-color)', borderRadius: '8px', padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px', backgroundColor: 'var(--bg-app)' }}>
                  {users.filter(u => {
                    const currentGroupMembers = (activeGroupToAddMembers.members || '').split(',');
                    return !currentGroupMembers.includes(String(u.id));
                  }).map(u => (
                    <label key={u.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13.5px', fontWeight: '500' }}>
                      <input
                        type="checkbox"
                        checked={addMembersSelectedIds.includes(String(u.id))}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setAddMembersSelectedIds([...addMembersSelectedIds, String(u.id)]);
                          } else {
                            setAddMembersSelectedIds(addMembersSelectedIds.filter(id => id !== String(u.id)));
                          }
                        }}
                        style={{ width: '16px', height: '16px' }}
                      />
                      <img src={u.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"} alt={u.name} style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }} />
                      <span>{u.name} ({u.department || 'Staff'})</span>
                    </label>
                  ))}
                  {users.filter(u => {
                    const currentGroupMembers = (activeGroupToAddMembers.members || '').split(',');
                    return !currentGroupMembers.includes(String(u.id));
                  }).length === 0 && (
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', textAlign: 'center', padding: '10px 0' }}>All system users are already in this group.</p>
                    )}
                </div>
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ alignSelf: 'flex-end' }}
                disabled={addMembersSelectedIds.length === 0}
              >
                Add Selected
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 3. Task Modal */}
      {showTaskModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Create Task</h3>
              <button className="modal-close-btn" onClick={() => setShowTaskModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleCreateTask} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label>Task Title</label>
                <input type="text" className="form-control" placeholder="e.g. Design Login Page" value={taskTitle} onChange={e => setTaskTitle(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea className="form-control" placeholder="Task checklist and scope..." value={taskDesc} onChange={e => setTaskDesc(e.target.value)} rows="3" />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select className="form-control" value={taskStatus} onChange={e => setTaskStatus(e.target.value)}>
                  <option value="TODO">TODO</option>
                  <option value="IN_PROGRESS">IN PROGRESS</option>
                  <option value="REVIEW">REVIEW</option>
                  <option value="DONE">DONE</option>
                </select>
              </div>
              <div className="form-group">
                <label>Due Date</label>
                <input type="date" className="form-control" value={taskDueDate} onChange={e => setTaskDueDate(e.target.value)} />
              </div>
              <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-end' }}>Create Task</button>
            </form>
          </div>
        </div>
      )}

      {/* 4. Document Modal */}
      {showDocModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ padding: '32px', borderRadius: '16px', maxWidth: '600px', width: '100%' }}>
            <div className="modal-header" style={{ marginBottom: '24px', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', margin: 0 }}>Add to Knowledge Base</h3>
              <button className="modal-close-btn" onClick={() => setShowDocModal(false)} style={{ fontSize: '24px', color: '#94a3b8', background: 'transparent', border: 'none', cursor: 'pointer' }}>&times;</button>
            </div>

            <form onSubmit={handleCreateDoc} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>Entry Type</label>
                <select className="form-input-modern" value={docType} onChange={e => {
                  setDocType(e.target.value);
                  setMockSelectedFile(null);
                  setSelectedFileObj(null);
                  setDocTitle('');
                }}>
                  <option value="MANUAL">Knowledge Base Article / Manual</option>
                  <option value="FILE">Shared File (Document Upload)</option>
                  <option value="FOLDER">Folder</option>
                </select>
              </div>

              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>
                  {docType === 'FOLDER' ? 'Folder Name' : 'Title'} <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input type="text" className="form-input-modern" placeholder={docType === 'FOLDER' ? "E.g., HR Policies 2026" : "E.g., Company Handbook 2026"} value={docTitle} onChange={e => {
                  setDocTitle(e.target.value);
                  if (docType === 'FILE' && !fileName) setFileName(e.target.value + '.pdf');
                }} required />
              </div>

              {docType === 'MANUAL' && (
                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>Article Content</label>
                  <textarea className="form-input-modern" placeholder="Type document details here..." value={docContent} onChange={e => setDocContent(e.target.value)} rows="8" required style={{ resize: 'vertical' }} />
                </div>
              )}

              {docType === 'FILE' && (
                <>
                  <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>Choose File</label>
                    <label htmlFor="docUploadReal" className="file-upload-dropzone" style={{ display: 'block', cursor: 'pointer', margin: 0 }}>
                      <input
                        type="file"
                        id="docUploadReal"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          if (e.target.files && e.target.files.length > 0) {
                            const file = e.target.files[0];
                            setMockSelectedFile(file.name);
                            setSelectedFileObj(file);
                            setFileName(file.name);
                            setFileSize(file.size);
                            const ext = file.name.split('.').pop();
                            setFileType(ext ? ext.toLowerCase() : 'unknown');
                          }
                        }}
                      />
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" style={{ marginBottom: '12px', display: 'block', margin: '0 auto 12px auto' }}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                      {mockSelectedFile ? (
                        <div style={{ color: '#10b981', fontWeight: '600' }}>✓ Selected: {mockSelectedFile} ({(fileSize / 1024 / 1024).toFixed(1)} MB)</div>
                      ) : (
                        <>
                          <div style={{ color: '#3b82f6', fontWeight: '600', marginBottom: '4px' }}>Click to browse or drag file here</div>
                          <div style={{ fontSize: '12px', color: '#94a3b8' }}>Supported formats: Any document format</div>
                          <div style={{ fontSize: '11px', color: '#cbd5e1', marginTop: '4px' }}>Maximum file size: 50MB</div>
                        </>
                      )}
                    </label>
                  </div>

                  <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>Description (Optional)</label>
                    <textarea className="form-input-modern" placeholder="Add a brief description about this file..." value={mockDescription} onChange={e => setMockDescription(e.target.value)} rows="3" style={{ resize: 'vertical' }} />
                  </div>

                  {/* Hidden inputs to maintain backend compatibility without cluttering UI */}
                  <input type="hidden" value={fileName} required />
                </>
              )}

              {docType !== 'FOLDER' && (
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                    <label style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>Visibility (Share With)</label>
                    <select className="form-input-modern" value={docRecipientId} onChange={e => setDocRecipientId(e.target.value)}>
                      <option value="">🌐 Public (All Company)</option>
                      <option value="mock-group-1">👥 Specific Group: Engineering</option>
                      <option value="mock-group-2">👥 Specific Group: Marketing</option>
                      <option value={currentUser.id}>🔒 Private (Only Me)</option>
                      <option value="mock-admin">👨💼 Admin Only</option>
                      <optgroup label="Specific Employee">
                        {users.map(u => (
                          <option key={u.id} value={u.id}>👤 {u.name} ({u.department})</option>
                        ))}
                      </optgroup>
                    </select>
                  </div>

                  <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                    <label style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>Permissions</label>
                    <select className="form-input-modern" value={mockPermission} onChange={e => setMockPermission(e.target.value)}>
                      <option value="View Only">👁️ View Only</option>
                      <option value="Download">⬇️ Download</option>
                      <option value="Edit">✏️ Edit (Owner/Admin)</option>
                    </select>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px', borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
                <button type="button" onClick={() => setShowDocModal(false)} className="btn-action-soft" style={{ padding: '10px 20px', fontSize: '14px' }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ padding: '10px 24px', fontSize: '14px', borderRadius: '8px', boxShadow: '0 4px 10px -2px rgba(59, 130, 246, 0.4)' }}>
                  {docType === 'FOLDER' ? 'Create Folder' : 'Upload / Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4.5 Preview Modal */}
      {previewDoc && (
        <div className="modal-overlay">
          <div className="modal-content modal-content-large" style={{ padding: '40px', borderRadius: '16px', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
            <div className="modal-header" style={{ marginBottom: '24px', borderBottom: '1px solid #f1f5f9', paddingBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: '0 0 12px 0', lineHeight: '1.3' }}>
                  {previewDoc.title || previewDoc.fileName}
                </h3>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '13px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '500' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    By {previewDoc.uploader?.name || 'Unknown'}
                  </span>
                  <span style={{ color: '#cbd5e1' }}>|</span>
                  <span style={{ fontSize: '13px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '500' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    Recently Uploaded
                  </span>
                  <span style={{ color: '#cbd5e1' }}>|</span>
                  {previewDoc.recipientId == null ? (
                    <span className="badge-visibility badge-public" style={{ padding: '4px 10px' }}>🌐 Public</span>
                  ) : (
                    <span className="badge-visibility badge-private" style={{ padding: '4px 10px' }}>🔒 Private</span>
                  )}
                </div>
              </div>
              <button className="modal-close-btn" onClick={() => setPreviewDoc(null)} style={{ fontSize: '28px', color: '#94a3b8', background: 'transparent', border: 'none', cursor: 'pointer', alignSelf: 'flex-start' }}>&times;</button>
            </div>

            <div className="article-body" style={{ overflowY: 'auto', flex: 1, paddingRight: '12px' }}>
              {previewDoc.type === 'MANUAL' ? (
                <div style={{ fontSize: '15px', color: '#334155', lineHeight: '1.8', whiteSpace: 'pre-line' }}>
                  {previewDoc.content}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '300px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '2px dashed #cbd5e1', padding: '20px', overflow: 'hidden' }}>
                  {previewDoc.storedFileName && ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(previewDoc.fileType?.toLowerCase()) ? (
                    <img src={`${API_BASE}/documents/${previewDoc.id}/download`} alt={previewDoc.fileName} style={{ maxWidth: '100%', maxHeight: '60vh', objectFit: 'contain' }} />
                  ) : previewDoc.storedFileName && previewDoc.fileType?.toLowerCase() === 'pdf' ? (
                    <iframe src={`${API_BASE}/documents/${previewDoc.id}/download`} title={previewDoc.fileName} width="100%" height="600px" style={{ border: 'none' }} />
                  ) : (
                    <>
                      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1" style={{ marginBottom: '16px' }}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                      <h4 style={{ fontSize: '18px', color: '#475569', margin: '0 0 16px 0' }}>File Preview</h4>
                      <p style={{ color: '#64748b', fontSize: '15px' }}>{previewDoc.storedFileName ? `Preview is not available for ${previewDoc.fileName}.` : `This is a legacy file. No physical file exists for ${previewDoc.fileName}.`}</p>
                      <button onClick={() => { handleDownload(previewDoc); setPreviewDoc(null); }} className="btn btn-primary" style={{ marginTop: '24px', padding: '10px 24px', borderRadius: '8px' }}>Download File</button>
                    </>
                  )}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px', borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
              <button onClick={() => setPreviewDoc(null)} className="btn btn-secondary" style={{ padding: '10px 24px', borderRadius: '8px' }}>Close Preview</button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Event Modal */}
      {showEventModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Create Calendar Event</h3>
              <button className="modal-close-btn" onClick={() => setShowEventModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleCreateEvent} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label>Event Title</label>
                <input type="text" className="form-control" placeholder="e.g. Q3 Sync Up" value={eventTitle} onChange={e => setEventTitle(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea className="form-control" placeholder="Meeting agenda..." value={eventDesc} onChange={e => setEventDesc(e.target.value)} rows="3" />
              </div>
              <div className="form-group">
                <label>Location</label>
                <input type="text" className="form-control" placeholder="e.g. Conference Room A / Zoom link" value={eventLocation} onChange={e => setEventLocation(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Date & Time</label>
                <input type="datetime-local" className="form-control" value={eventDate} onChange={e => setEventDate(e.target.value)} required />
              </div>
              <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-end' }}>Create Event</button>
            </form>
          </div>
        </div>
      )}

      {/* 6. Poll Modal */}
      {showPollModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingPoll ? 'Edit Poll Survey' : 'Create Poll Survey'}</h3>
              <button className="modal-close-btn" onClick={() => { setShowPollModal(false); setEditingPoll(null); setPollQuestion(''); setPollOptions(''); setPollVisibility('Public'); setPollAudience([]); }}>&times;</button>
            </div>
            <form onSubmit={editingPoll ? handleUpdatePoll : handleCreatePoll} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label>Poll Question</label>
                <input type="text" className="form-control" placeholder="What is your favorite layout?" value={pollQuestion} onChange={e => setPollQuestion(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Poll Options (Comma-separated)</label>
                <input type="text" className="form-control" placeholder="White theme,Grey theme,Dark theme" value={pollOptions} onChange={e => setPollOptions(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Poll Visibility</label>
                <select className="form-control" value={pollVisibility} onChange={e => setPollVisibility(e.target.value)}>
                  <option value="Public">🌐 Public Poll</option>
                  <option value="Private">🔒 Private Poll</option>
                </select>
              </div>

              {pollVisibility === 'Public' && (
                <div style={{ fontSize: '13px', color: '#166534', backgroundColor: '#f0fdf4', padding: '12px', borderRadius: '8px', border: '1px solid #dcfce7', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '18px' }}>🌐</span>
                  <span><strong>Public:</strong> Visible to all employees. Everyone can participate.</span>
                </div>
              )}

              {pollVisibility === 'Private' && (
                <>
                  <div style={{ backgroundColor: '#fef2f2', padding: '16px', borderRadius: '8px', border: '1px solid #fee2e2', marginBottom: '8px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#991b1b', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                      🔒 Private Poll
                    </div>
                    <div style={{ fontSize: '13px', color: '#991b1b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '18px' }}>🛡</span>
                      <span>Only selected employees, departments, or teams can access this poll. This is confidential content.</span>
                    </div>
                  </div>

                  <div className="form-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>👥 Select Audience <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 'normal' }}>(Hold Ctrl/Cmd to select multiple)</span></label>
                    <select multiple className="form-control" style={{ height: '120px' }} value={pollAudience} onChange={e => setPollAudience(Array.from(e.target.selectedOptions, option => option.value))}>
                      <optgroup label="Departments & Teams">
                        <option value="HR">HR</option>
                        <option value="Development">Development</option>
                        <option value="UI/UX">UI/UX</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Team 21">Team 21</option>
                        <option value="Leadership Team">Leadership Team</option>
                        <option value="Manager Group">Manager Group</option>
                      </optgroup>
                      <optgroup label="Individuals">
                        {users.map(u => (
                          <option key={u.id} value={`user_${u.id}`}>{u.name} ({u.department || 'No Dept'})</option>
                        ))}
                      </optgroup>
                    </select>
                  </div>
                </>
              )}

              <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-end', marginTop: '8px' }}>
                {editingPoll ? 'Update Poll' : 'Create Poll'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Give Kudos Modal */}
      {showKudosModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Give Recognition</h3>
              <button className="modal-close-btn" onClick={() => setShowKudosModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Select Employee</label>
                <select className="form-control" value={kudosReceiverId} onChange={e => setKudosReceiverId(e.target.value)}>
                  <option value="">-- Choose Employee --</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.department || 'No Dept'})</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Recognition Category</label>
                <select className="form-control" value={kudosType} onChange={e => setKudosType(e.target.value)}>
                  <option value="Employee of the Month">🏆 Employee of the Month</option>
                  <option value="Team Player">🤝 Team Player</option>
                  <option value="Outstanding Performance">🚀 Outstanding Performance</option>
                  <option value="Innovation Award">💡 Innovation Award</option>
                  <option value="Goal Achiever">🎯 Goal Achiever</option>
                  <option value="Problem Solver">⭐ Problem Solver</option>
                  <option value="Helpful Colleague">🙌 Helpful Colleague</option>
                  <option value="Customer Focus">❤️ Customer Focus</option>
                  <option value="Creativity">🎨 Creativity</option>
                  <option value="Continuous Improvement">📈 Continuous Improvement</option>
                  <option value="Knowledge Sharing">📚 Knowledge Sharing</option>
                  <option value="Leadership Excellence">👑 Leadership Excellence</option>
                  <option value="Reliability & Punctuality">⏰ Reliability & Punctuality</option>
                  <option value="Above & Beyond">🔥 Above & Beyond</option>
                  <option value="Work Anniversary">🎉 Work Anniversary</option>
                </select>
              </div>
              <div className="form-group" style={{ position: 'relative' }}>
                <label>Appreciation Message (Type @ to mention)</label>
                <textarea
                  className="form-control"
                  rows="4"
                  placeholder="Thank you for..."
                  value={kudosMessage}
                  onChange={e => {
                    setKudosMessage(e.target.value);
                    const lastWord = e.target.value.split(/\s/).pop();
                    if (lastWord.startsWith('@')) {
                      setKudosMentionText(lastWord.substring(1));
                    } else {
                      setKudosMentionText('');
                    }
                  }}
                ></textarea>

                {/* Mention Dropdown Overlay */}
                {kudosMentionText !== '' && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, width: '100%', maxHeight: '150px', overflowY: 'auto', backgroundColor: 'white', border: '1px solid var(--border-color)', borderRadius: '4px', zIndex: 10 }}>
                    {users.filter(u => u.name.toLowerCase().includes(kudosMentionText.toLowerCase()) && u.status === 'Active').map(u => (
                      <div key={u.id} style={{ padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                        onClick={() => {
                          const newMsg = kudosMessage.replace(new RegExp(`@${kudosMentionText}$`), `@${u.name} `);
                          setKudosMessage(newMsg);
                          setKudosMentionText('');
                          if (!kudosMentions.find(m => m.id === u.id)) {
                            setKudosMentions([...kudosMentions, u]);
                          }
                        }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <img src={u.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}`} style={{ width: '24px', height: '24px', borderRadius: '50%' }} />
                        <span>{u.name}</span> <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>({u.designation || 'Employee'})</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="form-group">
                <label>Visibility</label>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '14px' }}>
                    <input type="radio" name="visibility" value="PUBLIC" checked={kudosVisibility === 'PUBLIC'} onChange={e => setKudosVisibility(e.target.value)} />
                    🌐 Public Recognition
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '14px' }}>
                    <input type="radio" name="visibility" value="PRIVATE" checked={kudosVisibility === 'PRIVATE'} onChange={e => setKudosVisibility(e.target.value)} />
                    🔒 Private Recognition
                  </label>
                </div>
              </div>
              <div className="form-group">
                <label>Reward (Optional)</label>
                <select className="form-control" value={kudosReward} onChange={e => setKudosReward(e.target.value)}>
                  <option value="">-- No Badge --</option>
                  <option value="⭐ Kudos Points">⭐ Kudos Points</option>
                  <option value="🥇 Gold Badge">🥇 Gold Badge</option>
                  <option value="🥈 Silver Badge">🥈 Silver Badge</option>
                  <option value="🥉 Bronze Badge">🥉 Bronze Badge</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowKudosModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleGiveKudos}>Give Recognition</button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Workflow Request Modal */}
      {showWorkflowModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Submit Workflow Application</h3>
              <button className="modal-close-btn" onClick={() => setShowWorkflowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleCreateWorkflow} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label>Application Type</label>
                <select className="form-control" value={workflowType} onChange={e => setWorkflowType(e.target.value)}>
                  <option value="LEAVE">🌴 Leave Application</option>
                  <option value="EXPENSE">💵 Expense Reimbursement Claim</option>
                  <option value="IT_SUPPORT">💻 IT Support & Hardware Ticket</option>
                </select>
              </div>

              <div className="form-group">
                <label>Title / Subject</label>
                <input type="text" className="form-control" placeholder="e.g. Sick Leave / Dinner Reimbursement" value={workflowTitle} onChange={e => setWorkflowTitle(e.target.value)} required />
              </div>

              <div className="form-group">
                <label>Details & Justifications</label>
                <textarea className="form-control" placeholder="Detail dates, receipts, or items needed..." value={workflowDesc} onChange={e => setWorkflowDesc(e.target.value)} rows="4" required />
              </div>

              <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-end' }}>Submit Request</button>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox Modal for Post Images */}
      {selectedLightboxImage && (
        <div className="lightbox-modal" onClick={() => setSelectedLightboxImage(null)}>
          <div className="lightbox-content" onClick={e => e.stopPropagation()}>
            <button className="lightbox-close" onClick={() => setSelectedLightboxImage(null)}>&times;</button>

            <img src={selectedLightboxImage.url} alt="" className="lightbox-image" />

            {selectedLightboxImage.description && (
              <div className="lightbox-caption">
                {selectedLightboxImage.description}
              </div>
            )}

            {selectedLightboxImage.allImages && selectedLightboxImage.allImages.length > 1 && (
              <div className="lightbox-nav">
                <button
                  onClick={() => {
                    const prevIdx = (selectedLightboxImage.currentIndex - 1 + selectedLightboxImage.allImages.length) % selectedLightboxImage.allImages.length;
                    setSelectedLightboxImage({
                      ...selectedLightboxImage.allImages[prevIdx],
                      allImages: selectedLightboxImage.allImages,
                      currentIndex: prevIdx
                    });
                  }}
                  className="lightbox-nav-btn prev"
                >
                  &#8249;
                </button>
                <span className="lightbox-nav-counter">{selectedLightboxImage.currentIndex + 1} / {selectedLightboxImage.allImages.length}</span>
                <button
                  onClick={() => {
                    const nextIdx = (selectedLightboxImage.currentIndex + 1) % selectedLightboxImage.allImages.length;
                    setSelectedLightboxImage({
                      ...selectedLightboxImage.allImages[nextIdx],
                      allImages: selectedLightboxImage.allImages,
                      currentIndex: nextIdx
                    });
                  }}
                  className="lightbox-nav-btn next"
                >
                  &#8250;
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Call Overlay UI */}
      {activeCall && (
        <div className="call-overlay">
          <div className="call-modal">
            {/* Header */}
            <div className="call-header">
              <span style={{ fontWeight: 'bold' }}>{activeCall.type === 'video' ? 'Video Call' : 'Voice Call'}</span>
            </div>

            {/* Main Area */}
            <div className="call-main">
              {/* Target Avatar / Pulsing */}
              <div className="call-target">
                <div className="pulse-ring"></div>
                <img src={activeCall.target.avatarUrl || `https://ui-avatars.com/api/?name=${activeCall.target.name.replace(' ', '+')}&background=random`} alt="Target" className="call-target-avatar" />
                <div style={{ marginTop: '20px', fontSize: '24px', fontWeight: 'bold' }}>{activeCall.target.name}</div>
                <div style={{ color: '#94a3b8', marginTop: '8px' }}>Calling...</div>
              </div>

              {/* Local PiP Video (Only if video call) */}
              {activeCall.type === 'video' && (
                <div className="pip-video-container">
                  <video ref={localVideoRef} autoPlay playsInline muted className="pip-video" />
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="call-controls">
              <button className="call-btn secondary"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg></button>
              {activeCall.type === 'video' && (
                <button className="call-btn secondary"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg></button>
              )}
              <button className="call-btn danger" onClick={endCall}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"></path><line x1="23" y1="1" x2="1" y2="23"></line></svg></button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {shareModalDoc && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ padding: '24px', borderRadius: '12px', width: '450px' }}>
            <div className="modal-header" style={{ marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '20px', color: '#0f172a' }}>Share Settings</h3>
              <button className="modal-close-btn" onClick={() => { setShareModalDoc(null); setShareSearchQuery(''); setShareSelectedUsers([]); }} style={{ fontSize: '24px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>&times;</button>
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #e2e8f0' }}>
              <div>
                <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '500', marginBottom: '4px' }}>Current Visibility</div>
                <div style={{ fontSize: '15px', color: '#0f172a', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {shareModalDoc.recipientId == null ? '🌐 Public (Everyone)' : '🔒 Private (Restricted)'}
                </div>
              </div>
              {shareModalDoc.recipientId != null && (
                <button onClick={() => handleShare(shareModalDoc.id, null)} className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '6px' }}>Make Public</button>
              )}
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <input
                type="text"
                className="form-control"
                placeholder="Search employees or groups..."
                value={shareSearchQuery}
                onChange={e => setShareSearchQuery(e.target.value)}
                style={{ padding: '12px 16px', fontSize: '14px', borderRadius: '8px' }}
              />
            </div>

            <div style={{ maxHeight: '250px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
              {users.filter(u => (u.name || '').toLowerCase().includes(shareSearchQuery.toLowerCase())).map(u => (
                <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <input
                      type="checkbox"
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      checked={shareSelectedUsers.includes(u.id)}
                      onChange={(e) => {
                        if (e.target.checked) setShareSelectedUsers([...shareSelectedUsers, u.id]);
                        else setShareSelectedUsers(shareSelectedUsers.filter(id => id !== u.id));
                      }}
                    />
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#3b82f6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px' }}>
                      {u.name.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>{u.name}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>{u.email}</div>
                    </div>
                  </div>
                </div>
              ))}
              {users.filter(u => (u.name || '').toLowerCase().includes(shareSearchQuery.toLowerCase())).length === 0 && (
                <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>No employees found matching "{shareSearchQuery}"</div>
              )}
            </div>

            {shareSelectedUsers.length > 0 && (
              <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => handleShare(shareModalDoc.id, shareSelectedUsers)}
                  className="btn btn-primary"
                  style={{ padding: '10px 24px', borderRadius: '8px' }}
                >
                  Share with Selected ({shareSelectedUsers.length})
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {showProfileModal && viewingProfileId && (() => {
        const profile = users.find(u => u.id === viewingProfileId);
        if (!profile) return null;

        const profileGroups = groups.filter(g => (g.members || '').split(',').includes(String(profile.id)));
        const profileTasks = tasks.filter(t => t.assignee && t.assignee.id === profile.id);
        const profileKudosReceived = recognitions.filter(r => r.receiver && r.receiver.id === profile.id);
        const profileKudosGiven = recognitions.filter(r => r.sender && r.sender.id === profile.id);
        const profileActivity = [
          ...posts.filter(p => p.author && p.author.id === profile.id).map(p => ({ type: 'Post', title: p.content.substring(0, 50) + (p.content.length > 50 ? '...' : ''), date: p.createdAt })),
          ...events.filter(e => e.creatorId === profile.id || (e.creator && e.creator.id === profile.id)).map(e => ({ type: 'Event', title: e.title, date: e.createdAt || e.eventDate })),
          ...documents.filter(d => d.uploader && d.uploader.id === profile.id).map(d => ({ type: 'Document', title: d.title || d.fileName, date: d.createdAt }))
        ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

        return (
          <div className="modal-overlay" style={{ zIndex: 1000, overflowY: 'auto', padding: '40px 20px' }} onClick={() => setShowProfileModal(false)}>
            <div className="modal-content" style={{ width: '100%', maxWidth: '1000px', margin: 'auto', borderRadius: '16px', display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }} onClick={e => e.stopPropagation()}>

              {/* Header */}
              <div style={{ padding: '24px 32px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
                <h3 style={{ margin: 0, fontSize: '24px', color: '#0f172a', fontWeight: '800' }}>Employee Profile</h3>
                <button className="modal-close-btn" onClick={() => setShowProfileModal(false)} style={{ fontSize: '28px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>&times;</button>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', padding: '32px', gap: '32px' }}>

                {/* Left Sidebar (Personal Info & Actions) */}
                <div style={{ flex: '1', minWidth: '250px', maxWidth: '300px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div style={{ textAlign: 'center' }}>
                    {profile.avatarUrl ? (
                      <img src={profile.avatarUrl} alt={profile.name} style={{ width: '150px', height: '150px', borderRadius: '50%', objectFit: 'cover', border: '4px solid white', boxShadow: '0 4px 14px rgba(0,0,0,0.1)', marginBottom: '16px' }} />
                    ) : (
                      <div style={{ width: '150px', height: '150px', borderRadius: '50%', background: '#3b82f6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px', fontWeight: 'bold', margin: '0 auto 16px auto', border: '4px solid white', boxShadow: '0 4px 14px rgba(0,0,0,0.1)' }}>
                        {profile.name ? profile.name.charAt(0).toUpperCase() : '?'}
                      </div>
                    )}
                    <h2 style={{ margin: '0 0 4px 0', fontSize: '24px', color: '#1e293b' }}>{profile.name}</h2>
                    <p style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#64748b', fontWeight: '500' }}>{profile.designation || 'Not Available'}</p>
                    <span className={`badge badge-${profile.status === 'Active' ? 'active' : profile.status === 'On Leave' ? 'leave' : 'remote'}`} style={{ borderRadius: '4px', fontSize: '13px' }}>
                      {profile.status}
                    </span>
                  </div>

                  <div className="profile-section" style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Contact Information</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ fontSize: '13px' }}><strong style={{ color: '#64748b', display: 'block', marginBottom: '2px' }}>Email Address</strong> {profile.email}</div>
                      <div style={{ fontSize: '13px' }}><strong style={{ color: '#64748b', display: 'block', marginBottom: '2px' }}>Phone Number</strong> Not Available</div>
                      <div style={{ fontSize: '13px' }}><strong style={{ color: '#64748b', display: 'block', marginBottom: '2px' }}>Alt Phone Number</strong> Not Available</div>
                      <div style={{ fontSize: '13px' }}><strong style={{ color: '#64748b', display: 'block', marginBottom: '2px' }}>Office Extension</strong> Not Available</div>
                    </div>
                  </div>

                  <div className="profile-section" style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Personal Information</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ fontSize: '13px' }}><strong style={{ color: '#64748b', display: 'block', marginBottom: '2px' }}>Employee ID</strong> {profile.id}</div>
                      <div style={{ fontSize: '13px' }}><strong style={{ color: '#64748b', display: 'block', marginBottom: '2px' }}>Username</strong> {profile.email.split('@')[0]}</div>
                      <div style={{ fontSize: '13px' }}><strong style={{ color: '#64748b', display: 'block', marginBottom: '2px' }}>Date of Birth</strong> Not Available</div>
                      <div style={{ fontSize: '13px' }}><strong style={{ color: '#64748b', display: 'block', marginBottom: '2px' }}>Gender</strong> Not Available</div>
                      <div style={{ fontSize: '13px' }}><strong style={{ color: '#64748b', display: 'block', marginBottom: '2px' }}>Address</strong> Not Available</div>
                    </div>
                  </div>

                  <div className="profile-actions" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <button className="btn btn-primary" onClick={() => { setChatTarget({ type: 'direct', id: profile.id, name: profile.name, avatarUrl: profile.avatarUrl }); setCurrentTab('chat'); setShowProfileModal(false); }}>Start Chat</button>
                    <button className="btn btn-secondary" onClick={() => { navigator.clipboard.writeText(profile.email); showToast('Email copied!'); }}>Copy Email</button>
                    <button className="btn btn-secondary" onClick={() => { navigator.clipboard.writeText(profile.id); showToast('Employee ID copied!'); }}>Copy Employee ID</button>
                  </div>
                </div>

                {/* Right Content Area (Tabs basically, just stacked sections) */}
                <div style={{ flex: '2', minWidth: '400px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

                  {/* Bio */}
                  <div>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#0f172a', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px' }}>About Me</h4>
                    <p style={{ margin: 0, fontSize: '15px', color: '#334155', lineHeight: '1.6' }}>{profile.bio || 'Not Available'}</p>
                  </div>

                  {/* Org Info */}
                  <div>
                    <h4 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#0f172a', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px' }}>Organization Information</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                      <div style={{ fontSize: '14px' }}><strong style={{ color: '#64748b', display: 'block', marginBottom: '2px' }}>Company Name</strong> Connect Org</div>
                      <div style={{ fontSize: '14px' }}><strong style={{ color: '#64748b', display: 'block', marginBottom: '2px' }}>Department</strong> {profile.department || 'Not Available'}</div>
                      <div style={{ fontSize: '14px' }}><strong style={{ color: '#64748b', display: 'block', marginBottom: '2px' }}>Job Role</strong> {profile.role ? profile.role.replace('ROLE_', '') : 'Not Available'}</div>
                      <div style={{ fontSize: '14px' }}><strong style={{ color: '#64748b', display: 'block', marginBottom: '2px' }}>Team</strong> Not Available</div>
                      <div style={{ fontSize: '14px' }}><strong style={{ color: '#64748b', display: 'block', marginBottom: '2px' }}>Reporting Manager</strong> Not Available</div>
                      <div style={{ fontSize: '14px' }}><strong style={{ color: '#64748b', display: 'block', marginBottom: '2px' }}>Employment Type</strong> Full-Time</div>
                      <div style={{ fontSize: '14px' }}><strong style={{ color: '#64748b', display: 'block', marginBottom: '2px' }}>Office Location</strong> Not Available</div>
                      <div style={{ fontSize: '14px' }}><strong style={{ color: '#64748b', display: 'block', marginBottom: '2px' }}>Branch</strong> Not Available</div>
                      <div style={{ fontSize: '14px' }}><strong style={{ color: '#64748b', display: 'block', marginBottom: '2px' }}>Join Date</strong> Not Available</div>
                      <div style={{ fontSize: '14px' }}><strong style={{ color: '#64748b', display: 'block', marginBottom: '2px' }}>Years of Service</strong> Not Available</div>
                    </div>
                  </div>

                  {/* Groups & Communities */}
                  <div>
                    <h4 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#0f172a', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px' }}>Groups & Communities</h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {profileGroups.length > 0 ? profileGroups.map(g => (
                        <span key={g.id} style={{ background: '#e0e7ff', color: '#4f46e5', padding: '6px 12px', borderRadius: '16px', fontSize: '13px', fontWeight: '600' }}>
                          # {g.name}
                        </span>
                      )) : <span style={{ fontSize: '14px', color: '#64748b' }}>Not part of any groups.</span>}
                    </div>
                  </div>

                  {/* Work Information */}
                  <div>
                    <h4 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#0f172a', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px' }}>Work Information</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div>
                        <strong style={{ color: '#64748b', display: 'block', marginBottom: '4px', fontSize: '14px' }}>Assigned Tasks ({profileTasks.length})</strong>
                        {profileTasks.length > 0 ? (
                          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#334155' }}>
                            {profileTasks.slice(0, 5).map(t => (
                              <li key={t.id} style={{ marginBottom: '4px' }}>{t.title} <span style={{ fontSize: '12px', color: '#94a3b8' }}>({t.status})</span></li>
                            ))}
                            {profileTasks.length > 5 && <li>...and {profileTasks.length - 5} more</li>}
                          </ul>
                        ) : <div style={{ fontSize: '14px', color: '#64748b' }}>No tasks assigned.</div>}
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                        <div style={{ fontSize: '14px' }}><strong style={{ color: '#64748b', display: 'block', marginBottom: '2px' }}>Current Projects</strong> Not Available</div>
                        <div style={{ fontSize: '14px' }}><strong style={{ color: '#64748b', display: 'block', marginBottom: '2px' }}>Responsibilities</strong> Not Available</div>
                        <div style={{ fontSize: '14px' }}><strong style={{ color: '#64748b', display: 'block', marginBottom: '2px' }}>Technical Skills</strong> Not Available</div>
                        <div style={{ fontSize: '14px' }}><strong style={{ color: '#64748b', display: 'block', marginBottom: '2px' }}>Soft Skills</strong> Not Available</div>
                        <div style={{ fontSize: '14px' }}><strong style={{ color: '#64748b', display: 'block', marginBottom: '2px' }}>Technologies Used</strong> Not Available</div>
                      </div>
                    </div>
                  </div>

                  {/* Badges & Achievements */}
                  <div>
                    <h4 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#0f172a', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px' }}>Badges & Achievements</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ display: 'flex', gap: '24px' }}>
                        <div style={{ fontSize: '14px' }}><strong style={{ color: '#64748b', display: 'block', marginBottom: '4px' }}>Kudos Received</strong> <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#0f172a' }}>{profileKudosReceived.length}</span></div>
                        <div style={{ fontSize: '14px' }}><strong style={{ color: '#64748b', display: 'block', marginBottom: '4px' }}>Kudos Given</strong> <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#0f172a' }}>{profileKudosGiven.length}</span></div>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                        {profileKudosReceived.length > 0 ? profileKudosReceived.map((r, idx) => (
                          <div key={idx} style={{ padding: '8px 12px', background: '#fef3c7', borderRadius: '8px', border: '1px solid #fde68a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '20px' }}>🏆</span>
                            <div>
                              <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#92400e' }}>{r.category}</div>
                              <div style={{ fontSize: '11px', color: '#b45309' }}>From: {r.sender?.name}</div>
                            </div>
                          </div>
                        )) : <div style={{ fontSize: '14px', color: '#64748b' }}>No achievements yet.</div>}
                      </div>
                    </div>
                  </div>

                  {/* Activity */}
                  <div>
                    <h4 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#0f172a', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px' }}>Recent Activity</h4>
                    {profileActivity.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {profileActivity.map((act, idx) => (
                          <div key={idx} style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#3b82f6', textTransform: 'uppercase', marginRight: '8px' }}>{act.type}</span>
                              <span style={{ fontSize: '14px', color: '#1e293b' }}>{act.title}</span>
                            </div>
                            <span style={{ fontSize: '12px', color: '#94a3b8' }}>{new Date(act.date).toLocaleDateString()}</span>
                          </div>
                        ))}
                      </div>
                    ) : <div style={{ fontSize: '14px', color: '#64748b' }}>No recent activity.</div>}
                  </div>

                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {toastMessage && (
        <div className="toast-notification">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
