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

  // Run automated overdue check
  checkMeetingHostOverdue(store);
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
  checkMeetingHostOverdue(store);
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
    meetLink,
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
      isDelegated = !!(hostDeadline && (!scheduledTime || !meetLink));
    } else {
      hostUser = req.user;
    }
  } else {
    // Founder rule: Founders CANNOT assign someone else to host!
    hostUser = req.user;
    isDelegated = false;
  }

  if (!isDelegated && (!scheduledTime || !meetLink)) {
    return res.status(400).json({
      success: false,
      message: 'Meeting date/time and Google Meet/Zoom link are required to schedule a meeting.'
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
    meetLink: meetLink ? meetLink.trim() : '',
    rsvpDeadline: rsvpDeadline ? new Date(rsvpDeadline).toISOString() : null,
    createdBy: req.user.id,
    createdByName: req.user.name,
    createdByRole: req.user.role,
    delegatedByAdmin: isAdmin && isDelegated,
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
      : `${req.user.name} scheduled meeting: "${newMeeting.title}" for ${new Date(scheduledTime).toLocaleString()}.`,
    actor: req.user.name,
    timestamp: new Date().toISOString()
  };
  store.auditLogs.unshift(meetLog);

  if (!store.notifications) store.notifications = [];
  const meetNotif = {
    id: `notif_meet_${Date.now()}`,
    title: isDelegated ? `📋 Host Responsibility: Upcoming Sync` : `📅 New Meeting Call Scheduled`,
    message: isDelegated 
      ? `Lead Admin assigned you as Meeting Host. Submit link & time before sprint deadline.`
      : `${req.user.name} scheduled "${newMeeting.title}" for ${new Date(scheduledTime).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}. Check top banner!`,
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
      : 'Meeting scheduled and added to the executive queue.',
    meeting: newMeeting,
    bannerMeeting: store.meeting,
    meetings: store.meetings
  });
};

// @desc Host Founder Finalizes Meeting Date, Time, Agenda & Meet Link
// @route POST /api/meetings/host-submit
exports.hostSubmit = async (req, res) => {
  const { meetingId, scheduledTime, meetLink, agenda, rsvpDeadline } = req.body;
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

  if (!scheduledTime || !meetLink) {
    return res.status(400).json({ success: false, message: 'Meeting Date/Time and Google Meet/Zoom link are required.' });
  }

  targetMeeting.scheduledTime = new Date(scheduledTime).toISOString();
  targetMeeting.meetLink = meetLink.trim();
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
    details: `Meeting Host ${req.user.name} finalized date/time for sync: ${new Date(scheduledTime).toLocaleString()}`,
    actor: req.user.name,
    timestamp: new Date().toISOString()
  };
  store.auditLogs.unshift(hostMeetLog);

  if (!store.notifications) store.notifications = [];
  const hostMeetNotif = {
    id: `notif_host_meet_${Date.now()}`,
    title: `📅 Sync Call Finalized: ${req.user.name}`,
    message: `Meeting date & link confirmed for ${new Date(scheduledTime).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}. Confirm RSVP in top banner.`,
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
    message: 'Meeting scheduled and live banner updated for all founders.',
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

  // Permission verification:
  // Super Admin can cancel any meeting. Founder can ONLY cancel their own created meeting, NOT admin-assigned meetings!
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

// Helper: Check if delegated meeting host deadline has elapsed without submission
function checkMeetingHostOverdue(store) {
  if (!store.meeting || store.meeting.status !== 'pending_host_submission' || !store.meeting.hostDeadline) {
    return;
  }

  const deadline = new Date(store.meeting.hostDeadline).getTime();
  const now = Date.now();

  if (now > deadline && !store.meeting.warnedHost) {
    store.meeting.warnedHost = true;
    const hostUser = store.users.find(u => u.id === store.meeting.hostId);

    if (hostUser && hostUser.role !== 'superadmin') {
      hostUser.strikes = (hostUser.strikes || 0) + 1;
      const strikeEntry = {
        id: `strike_${Date.now()}`,
        ruleNumber: '06',
        reason: 'Failed to submit meeting date, time & agenda before the assigned host deadline (Rule 06: Full Ownership. No Excuses).',
        issuedBy: 'SYSTEM_WATCHDOG',
        date: new Date().toISOString()
      };
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

      saveStore(store);
    }
  }
}
