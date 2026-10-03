const { getStore, saveStore } = require('../config/localStore');

// Helper: Dynamically find earliest active upcoming meeting for the top banner
function computeCurrentBannerMeeting(store) {
  if (!Array.isArray(store.meetings)) {
    store.meetings = store.meeting ? [store.meeting] : [];
  }

  const now = Date.now();

  // Active meetings: not cancelled, and either pending host submission or scheduled within active window (up to 90 min after start)
  const activeMeetings = store.meetings.filter(m => {
    if (m.isCancelled || m.status === 'cancelled') return false;
    if (m.status === 'pending_host_submission') return true;
    if (!m.scheduledTime) return true;
    const target = new Date(m.scheduledTime).getTime();
    // Keep visible on banner until 90 minutes after scheduled time
    return (now - target) <= 90 * 60 * 1000;
  });

  // Sort chronologically ascending (earliest upcoming first)
  activeMeetings.sort((a, b) => {
    const timeA = a.scheduledTime ? new Date(a.scheduledTime).getTime() : (a.hostDeadline ? new Date(a.hostDeadline).getTime() : 0);
    const timeB = b.scheduledTime ? new Date(b.scheduledTime).getTime() : (b.hostDeadline ? new Date(b.hostDeadline).getTime() : 0);
    return timeA - timeB;
  });

  const nextBanner = activeMeetings.length > 0 ? activeMeetings[0] : null;

  // Dynamically synchronize host avatar and name with latest user record
  if (nextBanner) {
    const hostUser = store.users.find(u => 
      u.id === nextBanner.hostId || 
      (u.name && nextBanner.hostName && u.name.trim().toLowerCase() === nextBanner.hostName.trim().toLowerCase())
    );
    if (hostUser) {
      if (hostUser.avatar) nextBanner.hostAvatar = hostUser.avatar;
      if (hostUser.name) nextBanner.hostName = hostUser.name;
    }
  }

  store.meeting = nextBanner;
  return nextBanner;
}

// @desc Get Current Meeting & Banner Status
// @route GET /api/meetings/current
exports.getCurrentMeeting = async (req, res) => {
  const store = getStore();
  const io = req.io || req.app?.get('io');

  // Run automated overdue & link window check
  checkMeetingHostOverdue(store, io);
  computeCurrentBannerMeeting(store);

  res.json({
    success: true,
    meeting: store.meeting,
    meetings: store.meetings || []
  });
};

// @desc Get All Meetings
// @route GET /api/meetings
exports.getAllMeetings = async (req, res) => {
  const store = getStore();
  const io = req.io || req.app?.get('io');
  checkMeetingHostOverdue(store, io);
  computeCurrentBannerMeeting(store);

  res.json({
    success: true,
    bannerMeeting: store.meeting,
    meetings: store.meetings || []
  });
};

// @desc Schedule Meeting (Founder schedules own; Admin can schedule or delegate to any founder)
// @route POST /api/meetings/schedule
exports.scheduleMeeting = async (req, res) => {
  const isAdmin = req.user.role === 'superadmin';
  const {
    title,
    agenda,
    delegatedHostId,
    hostDeadline,
    scheduledTime,
    rsvpDeadline
  } = req.body;

  const store = getStore();
  if (!Array.isArray(store.meetings)) {
    store.meetings = store.meeting ? [store.meeting] : [];
  }

  let hostUser = null;
  let isDelegated = false;

  if (isAdmin) {
    if (delegatedHostId && delegatedHostId !== req.user.id) {
      hostUser = store.users.find(u => u.id === delegatedHostId);
      // If admin assigned a scheduledTime, date is fixed by admin.
      // If admin did NOT assign a scheduledTime, host must finalize date before deadline.
      if (!scheduledTime) {
        isDelegated = true;
      }
    } else {
      hostUser = req.user;
    }
  } else {
    // Founder rule: Founders CANNOT assign someone else to host!
    hostUser = req.user;
    isDelegated = false;
  }

  if (!isDelegated && !scheduledTime) {
    return res.status(400).json({
      success: false,
      message: 'Meeting date and time are required to schedule a meeting.'
    });
  }

  const newMeeting = {
    id: `meet_${Date.now()}`,
    title: title?.trim() || (isAdmin ? 'Executive Founders Strategy Sync' : `${req.user.name}'s Strategy Sync`),
    agenda: agenda?.trim() || 'Deliverables review and milestone alignment.',
    status: isDelegated ? 'pending_host_submission' : 'scheduled',
    hostId: hostUser ? hostUser.id : req.user.id,
    hostName: hostUser ? hostUser.name : req.user.name,
    hostAvatar: hostUser ? hostUser.avatar : req.user.avatar,
    hostDeadline: hostDeadline ? new Date(hostDeadline).toISOString() : null,
    scheduledTime: scheduledTime ? new Date(scheduledTime).toISOString() : null,
    dateFixedByAdmin: Boolean(isAdmin && scheduledTime),
    meetLink: '', // Strict Rule: Meeting link cannot be assigned in advance! Must be pasted 5m before meeting
    linkSubmittedAt: null,
    linkSubmittedBy: null,
    linkOverdueWarned: false,
    warnedHost: false,
    rsvpDeadline: rsvpDeadline ? new Date(rsvpDeadline).toISOString() : null,
    createdBy: req.user.id,
    createdByName: req.user.name,
    createdByRole: req.user.role,
    delegatedByAdmin: Boolean(isAdmin && hostUser && hostUser.id !== req.user.id),
    attendees: store.users.map(u => ({
      userId: u.id,
      name: u.name,
      status: u.id === (hostUser ? hostUser.id : req.user.id) ? 'confirmed' : 'pending',
      confirmedAt: u.id === (hostUser ? hostUser.id : req.user.id) ? new Date().toISOString() : null
    })),
    isCancelled: false,
    createdAt: new Date().toISOString()
  };

  store.meetings.push(newMeeting);
  computeCurrentBannerMeeting(store);

  const meetLog = {
    id: `log_${Date.now()}`,
    action: isDelegated ? 'MEETING_HOST_DELEGATED' : 'MEETING_SCHEDULED',
    details: isDelegated
      ? `Lead Admin delegated Meeting Host responsibility to ${hostUser ? hostUser.name : 'Founder'} with deadline.`
      : `${req.user.name} scheduled meeting: "${newMeeting.title}" for ${new Date(newMeeting.scheduledTime).toLocaleString()}.`,
    actor: req.user.name,
    timestamp: new Date().toISOString()
  };
  store.auditLogs.unshift(meetLog);

  if (!store.notifications) store.notifications = [];
  const meetNotif = {
    id: `notif_meet_${Date.now()}`,
    title: isDelegated ? `📋 Host Responsibility: Upcoming Sync` : `📅 New Meeting Call Scheduled`,
    message: isDelegated 
      ? `Lead Admin assigned you as Meeting Host. Submit schedule details before assigned deadline.`
      : `${req.user.name} scheduled "${newMeeting.title}" for ${new Date(newMeeting.scheduledTime).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}. Check top banner!`,
    type: 'info',
    targetUserId: isDelegated && hostUser ? hostUser.id : null,
    targetRole: isDelegated ? null : 'all',
    linkTab: 'meetings',
    timestamp: new Date().toISOString(),
    readBy: []
  };
  store.notifications.unshift(meetNotif);

  saveStore(store);

  const io = req.io || req.app?.get('io');
  if (io) {
    io.emit('new_activity', meetLog);
    io.emit('MEETING_UPDATED', store.meeting);
    io.emit('meetings_updated', store.meetings);
    io.emit('new_notification', meetNotif);
  }

  res.status(201).json({
    success: true,
    message: isDelegated
      ? `Meeting Host assigned to ${hostUser ? hostUser.name : 'Founder'}. Host must finalize date/time before deadline.`
      : 'Meeting scheduled and added to the executive queue. Link paste window opens 5 minutes before call.',
    meeting: newMeeting,
    bannerMeeting: store.meeting,
    meetings: store.meetings
  });
};

// @desc Host Founder Finalizes Meeting Date/Time (if not locked by Admin) & Agenda
// @route POST /api/meetings/host-submit
exports.hostSubmit = async (req, res) => {
  const { meetingId, scheduledTime, agenda } = req.body;
  const store = getStore();

  if (!Array.isArray(store.meetings)) {
    store.meetings = store.meeting ? [store.meeting] : [];
  }

  const targetMeeting = meetingId 
    ? store.meetings.find(m => m.id === meetingId) 
    : store.meeting;

  if (!targetMeeting) {
    return res.status(404).json({ success: false, message: 'No active meeting in pending state.' });
  }

  if (targetMeeting.hostId !== req.user.id && req.user.role !== 'superadmin') {
    return res.status(403).json({ success: false, message: 'Only the assigned Meeting Host can finalize details.' });
  }

  // Security Rule: If date was fixed by Admin, founder CANNOT change date!
  if (targetMeeting.dateFixedByAdmin && req.user.role !== 'superadmin') {
    if (scheduledTime && targetMeeting.scheduledTime && new Date(scheduledTime).getTime() !== new Date(targetMeeting.scheduledTime).getTime()) {
      return res.status(403).json({
        success: false,
        message: 'Meeting date and time was locked by Super Admin and cannot be modified.'
      });
    }
  } else {
    if (scheduledTime) {
      targetMeeting.scheduledTime = new Date(scheduledTime).toISOString();
    } else if (!targetMeeting.scheduledTime) {
      return res.status(400).json({ success: false, message: 'Meeting Date/Time is required.' });
    }
  }

  if (agenda) targetMeeting.agenda = agenda.trim();
  targetMeeting.status = 'scheduled';

  if (targetMeeting.hostId === req.user.id) {
    if (req.user.avatar) targetMeeting.hostAvatar = req.user.avatar;
    if (req.user.name) targetMeeting.hostName = req.user.name;
  }

  computeCurrentBannerMeeting(store);

  const hostMeetLog = {
    id: `log_${Date.now()}`,
    action: 'MEETING_FINALIZED_BY_HOST',
    details: `Meeting Host ${req.user.name} confirmed details for sync: ${new Date(targetMeeting.scheduledTime).toLocaleString()}`,
    actor: req.user.name,
    timestamp: new Date().toISOString()
  };
  store.auditLogs.unshift(hostMeetLog);

  if (!store.notifications) store.notifications = [];
  const hostMeetNotif = {
    id: `notif_host_meet_${Date.now()}`,
    title: `📅 Sync Call Finalized: ${req.user.name}`,
    message: `Meeting date confirmed for ${new Date(targetMeeting.scheduledTime).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}. Link paste window opens 5m before meeting.`,
    type: 'info',
    targetRole: 'all',
    linkTab: 'meetings',
    timestamp: new Date().toISOString(),
    readBy: []
  };
  store.notifications.unshift(hostMeetNotif);

  saveStore(store);

  const io = req.io || req.app?.get('io');
  if (io) {
    io.emit('new_activity', hostMeetLog);
    io.emit('MEETING_UPDATED', store.meeting);
    io.emit('meetings_updated', store.meetings);
    io.emit('new_notification', hostMeetNotif);
  }

  res.json({
    success: true,
    message: 'Meeting schedule confirmed. Link submission window unlocks 5 minutes before the call.',
    meeting: targetMeeting,
    bannerMeeting: store.meeting,
    meetings: store.meetings
  });
};

// @desc Submit Live Meeting Link (Google Meet / Zoom) - Only during 10-minute window (5m before to 5m after meeting time)
// @route POST /api/meetings/submit-link
exports.submitMeetingLink = async (req, res) => {
  const { meetingId, meetLink } = req.body;
  const store = getStore();

  if (!Array.isArray(store.meetings)) {
    store.meetings = store.meeting ? [store.meeting] : [];
  }

  const targetMeeting = meetingId 
    ? store.meetings.find(m => m.id === meetingId) 
    : store.meeting;

  if (!targetMeeting) {
    return res.status(404).json({ success: false, message: 'Meeting not found.' });
  }

  const isAdmin = req.user.role === 'superadmin';
  const isHost = targetMeeting.hostId === req.user.id;

  if (!isHost && !isAdmin) {
    return res.status(403).json({ success: false, message: 'Only the assigned Meeting Host or Super Admin can submit the meeting link.' });
  }

  if (!targetMeeting.scheduledTime) {
    return res.status(400).json({ success: false, message: 'Meeting has no scheduled date and time.' });
  }

  const cleanLink = meetLink?.trim();
  if (!cleanLink || !/^https?:\/\//i.test(cleanLink)) {
    return res.status(400).json({ success: false, message: 'A valid Google Meet, Zoom, or video conference URL (starting with http/https) is required.' });
  }

  const now = Date.now();
  const meetTime = new Date(targetMeeting.scheduledTime).getTime();
  const openTime = meetTime - (5 * 60 * 1000); // 5 min before
  const closeTime = openTime + (10 * 60 * 1000); // 10 min window (5 min after meetTime)

  if (!isAdmin) {
    if (now < openTime) {
      const waitMinutes = Math.ceil((openTime - now) / (60 * 1000));
      return res.status(403).json({
        success: false,
        message: `Meeting link submission opens 5 minutes before scheduled call time (in ${waitMinutes} min).`
      });
    }

    if (now > closeTime) {
      return res.status(403).json({
        success: false,
        message: 'The mandatory 10-minute meeting link submission window has expired.'
      });
    }
  }

  targetMeeting.meetLink = cleanLink;
  targetMeeting.linkSubmittedAt = new Date().toISOString();
  targetMeeting.linkSubmittedBy = req.user.name;

  computeCurrentBannerMeeting(store);

  const linkLog = {
    id: `log_${Date.now()}`,
    action: 'MEETING_LINK_PUBLISHED',
    details: `${req.user.name} published live meeting link for "${targetMeeting.title}". Join button is now active.`,
    actor: req.user.name,
    timestamp: new Date().toISOString()
  };
  store.auditLogs.unshift(linkLog);

  if (!store.notifications) store.notifications = [];
  const linkNotif = {
    id: `notif_link_${Date.now()}`,
    title: `🟢 Live Meeting Link Active`,
    message: `${req.user.name} published the meeting link for "${targetMeeting.title}". Tap Join Meet to enter!`,
    type: 'success',
    targetRole: 'all',
    linkTab: 'meetings',
    timestamp: new Date().toISOString(),
    readBy: []
  };
  store.notifications.unshift(linkNotif);

  saveStore(store);

  const io = req.io || req.app?.get('io');
  if (io) {
    io.emit('new_activity', linkLog);
    io.emit('MEETING_UPDATED', store.meeting);
    io.emit('meetings_updated', store.meetings);
    io.emit('new_notification', linkNotif);
  }

  res.json({
    success: true,
    message: 'Meeting link published successfully! Join button is now active for all attendees.',
    meeting: targetMeeting,
    bannerMeeting: store.meeting,
    meetings: store.meetings
  });
};

// @desc Attendee Confirms Attendance (RSVP)
// @route POST /api/meetings/rsvp
exports.confirmRsvp = async (req, res) => {
  const { meetingId } = req.body;
  const store = getStore();

  if (!Array.isArray(store.meetings)) {
    store.meetings = store.meeting ? [store.meeting] : [];
  }

  const targetMeeting = meetingId 
    ? store.meetings.find(m => m.id === meetingId) 
    : store.meeting;

  if (!targetMeeting) {
    return res.status(404).json({ success: false, message: 'No meeting found.' });
  }

  let attendee = targetMeeting.attendees?.find(a => a.userId === req.user.id);
  if (attendee) {
    attendee.status = 'confirmed';
    attendee.confirmedAt = new Date().toISOString();
  } else {
    if (!targetMeeting.attendees) targetMeeting.attendees = [];
    targetMeeting.attendees.push({
      userId: req.user.id,
      name: req.user.name,
      status: 'confirmed',
      confirmedAt: new Date().toISOString()
    });
  }

  computeCurrentBannerMeeting(store);

  const rsvpLog = {
    id: `log_${Date.now()}`,
    action: 'MEETING_RSVP_CONFIRMED',
    details: `${req.user.name} confirmed attendance for meeting: "${targetMeeting.title}".`,
    actor: req.user.name,
    timestamp: new Date().toISOString()
  };
  store.auditLogs.unshift(rsvpLog);

  saveStore(store);

  const io = req.io || req.app?.get('io');
  if (io) {
    io.emit('new_activity', rsvpLog);
    io.emit('MEETING_UPDATED', store.meeting);
    io.emit('meetings_updated', store.meetings);
  }

  res.json({
    success: true,
    message: 'Attendance confirmed successfully.',
    meeting: targetMeeting,
    bannerMeeting: store.meeting,
    meetings: store.meetings
  });
};

// @desc Cancel Meeting (Admin can cancel any; Founder can ONLY cancel their own created non-admin meeting)
// @route POST /api/meetings/cancel
exports.cancelMeeting = async (req, res) => {
  const { meetingId } = req.body;
  const store = getStore();

  if (!Array.isArray(store.meetings)) {
    store.meetings = store.meeting ? [store.meeting] : [];
  }

  const targetMeeting = meetingId 
    ? store.meetings.find(m => m.id === meetingId) 
    : store.meeting;

  if (!targetMeeting) {
    return res.status(404).json({ success: false, message: 'Meeting not found.' });
  }

  const isAdmin = req.user.role === 'superadmin';

  if (!isAdmin) {
    if (targetMeeting.delegatedByAdmin || targetMeeting.createdByRole === 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Admin-assigned meetings can only be cancelled by Super Admin (Rule 06 Host Protocol).'
      });
    }

    if (targetMeeting.createdBy && targetMeeting.createdBy !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only cancel meetings that you personally scheduled.'
      });
    }
  }

  targetMeeting.isCancelled = true;
  targetMeeting.status = 'cancelled';
  targetMeeting.cancelledBy = req.user.name;
  targetMeeting.cancelledAt = new Date().toISOString();

  // Re-calculate banner meeting
  computeCurrentBannerMeeting(store);

  const cancelLog = {
    id: `log_${Date.now()}`,
    action: 'MEETING_CANCELLED',
    details: `${req.user.name} cancelled meeting: "${targetMeeting.title}". Next upcoming meeting queued to banner.`,
    actor: req.user.name,
    timestamp: new Date().toISOString()
  };
  store.auditLogs.unshift(cancelLog);

  saveStore(store);

  const io = req.io || req.app?.get('io');
  if (io) {
    io.emit('new_activity', cancelLog);
    io.emit('MEETING_UPDATED', store.meeting);
    io.emit('meetings_updated', store.meetings);
  }

  res.json({
    success: true,
    message: 'Meeting cancelled successfully. Next meeting queued.',
    bannerMeeting: store.meeting,
    meetings: store.meetings
  });
};

// Helper: Check if delegated meeting host deadline or 10-min link window has elapsed
function checkMeetingHostOverdue(store, io) {
  if (!Array.isArray(store.meetings)) {
    store.meetings = store.meeting ? [store.meeting] : [];
  }

  let modified = false;
  const now = Date.now();

  for (const m of store.meetings) {
    if (m.isCancelled || m.status === 'cancelled') continue;

    // Check 1: Delegated host missed scheduling deadline
    if (m.status === 'pending_host_submission' && m.hostDeadline && !m.warnedHost) {
      const deadline = new Date(m.hostDeadline).getTime();
      if (now > deadline) {
        m.warnedHost = true;
        modified = true;
        const hostUser = store.users.find(u => u.id === m.hostId);

        if (hostUser && hostUser.role !== 'superadmin') {
          hostUser.strikes = (hostUser.strikes || 0) + 1;
          const strikeEntry = {
            id: `strike_${Date.now()}`,
            ruleNumber: '06',
            reason: 'Meeting misbehavior and non responsibility: Failed to submit meeting schedule before the assigned host deadline (Rule 06: Meeting Host Ownership).',
            issuedBy: 'SYSTEM_WATCHDOG',
            date: new Date().toISOString()
          };
          if (!hostUser.strikeHistory) hostUser.strikeHistory = [];
          hostUser.strikeHistory.unshift(strikeEntry);

          if (hostUser.strikes >= 2) {
            hostUser.status = 'suspended';
          }

          store.auditLogs.unshift({
            id: `log_${Date.now()}`,
            action: 'AUTOMATIC_WARNING_HOST_OVERDUE',
            details: `Automated Strike issued to ${hostUser.name} for missing meeting scheduling deadline. Total strikes: ${hostUser.strikes}`,
            actor: 'SYSTEM_WATCHDOG',
            timestamp: new Date().toISOString()
          });

          if (!store.notifications) store.notifications = [];
          store.notifications.unshift({
            id: `notif_strike_${Date.now()}`,
            type: 'strike_issued',
            title: `🚨 AUTOMATIC STRIKE #${hostUser.strikes} ISSUED`,
            message: `Rule 06 Infraction: You missed the host scheduling deadline for "${m.title}". ${hostUser.strikes >= 2 ? '⛔ IMMEDIATE ACCOUNT SUSPENSION ACTIVE!' : '⚠️ Warning: 2 strikes result in automatic suspension.'}`,
            priority: 'urgent',
            read: false,
            recipientId: hostUser.id,
            timestamp: new Date().toISOString()
          });

          if (io) {
            io.emit('STRIKE_ISSUED', {
              founderId: hostUser.id,
              founderName: hostUser.name,
              strikes: hostUser.strikes
            });
          }
        }
      }
    }

    // Check 2: 10-Minute Meeting Link Submission Window Elapsed Without Link
    // Window: from (scheduledTime - 5m) to (scheduledTime + 5m) = 10 minutes total
    if (m.scheduledTime && !m.meetLink && !m.linkOverdueWarned) {
      const meetTime = new Date(m.scheduledTime).getTime();
      const closeTime = meetTime + (5 * 60 * 1000); // 5 min after meeting time

      if (now > closeTime) {
        m.linkOverdueWarned = true;
        modified = true;
        const hostUser = store.users.find(u => u.id === m.hostId);

        if (hostUser && hostUser.role !== 'superadmin') {
          hostUser.strikes = (hostUser.strikes || 0) + 1;
          const strikeEntry = {
            id: `strike_${Date.now()}`,
            ruleNumber: '06',
            reason: `Meeting misbehavior and non responsibility: Failed to paste meeting link within the mandatory 10-minute window for "${m.title}".`,
            issuedBy: 'SYSTEM_WATCHDOG',
            date: new Date().toISOString()
          };
          if (!hostUser.strikeHistory) hostUser.strikeHistory = [];
          hostUser.strikeHistory.unshift(strikeEntry);

          if (hostUser.strikes >= 2) {
            hostUser.status = 'suspended';
          }

          const strikeLog = {
            id: `log_${Date.now()}`,
            action: 'AUTOMATIC_WARNING_HOST_LINK_MISSED',
            details: `Automated Strike issued to ${hostUser.name} under Rule 06 (Meeting misbehavior and non responsibility: missed 10-min meeting link window for "${m.title}"). Total strikes: ${hostUser.strikes}`,
            actor: 'SYSTEM_WATCHDOG',
            timestamp: new Date().toISOString()
          };
          store.auditLogs.unshift(strikeLog);

          if (!store.notifications) store.notifications = [];
          store.notifications.unshift({
            id: `notif_strike_${Date.now()}`,
            type: 'strike_issued',
            title: `🚨 AUTOMATIC STRIKE #${hostUser.strikes} ISSUED`,
            message: `Meeting misbehavior and non responsibility: Failed to paste meeting link within 10-min window for "${m.title}". ${hostUser.strikes >= 2 ? '⛔ ACCOUNT SUSPENDED!' : '⚠️ Warning: 2 strikes result in automatic lockout.'}`,
            priority: 'urgent',
            read: false,
            recipientId: hostUser.id,
            timestamp: new Date().toISOString()
          });

          if (!store.messages) store.messages = [];
          store.messages.unshift({
            id: `msg_strike_${Date.now()}`,
            channelId: 'founders_group',
            senderId: 'system_governance',
            senderName: 'PORTAL GOVERNANCE RADAR',
            senderAvatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&q=80',
            type: 'system_strike_alert',
            text: `🚨 OFFICIAL DISCIPLINARY ENFORCEMENT: Automatic Strike #${hostUser.strikes} issued to @${hostUser.name} under Rule 06 (Meeting misbehavior and non responsibility: failed to paste live meeting link for "${m.title}" within the 10-minute window). ${hostUser.strikes >= 2 ? '⛔ ACCOUNT SUSPENDED IMMEDIATELY.' : '⚠️ Warning: Strict 2-strike maximum enforced under Rule 28.'}`,
            timestamp: new Date().toISOString()
          });

          if (io) {
            io.emit('STRIKE_ISSUED', {
              founderId: hostUser.id,
              founderName: hostUser.name,
              strikes: hostUser.strikes
            });
            io.emit('new_activity', strikeLog);
          }
        }
      }
    }
  }

  if (modified) {
    saveStore(store);
  }
  return modified;
}

// Background Watchdog runner
exports.runMeetingWatchdog = (io) => {
  const store = getStore();
  if (!store) return;
  const changed = checkMeetingHostOverdue(store, io);
  if (changed) {
    computeCurrentBannerMeeting(store);
    saveStore(store);
    if (io) {
      io.emit('MEETING_UPDATED', store.meeting);
      io.emit('meetings_updated', store.meetings);
    }
  }
};

