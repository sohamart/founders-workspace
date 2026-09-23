const { getStore, saveStore } = require('../config/localStore');

// @desc Get All Tasks
// @route GET /api/tasks
exports.getTasks = async (req, res) => {
  const store = getStore();
  const userId = req.user.id;
  const userRole = req.user.role;

  let tasks = store.tasks;

  // Optional query filter
  if (req.query.projectId) {
    tasks = tasks.filter(t => t.projectId === req.query.projectId);
  }
  if (req.query.assignedTo) {
    tasks = tasks.filter(t => t.assignedTo.includes(req.query.assignedTo));
  }

  res.json({
    success: true,
    count: tasks.length,
    tasks
  });
};

// @desc Create Task (3 Assignment Modes: Single, Team, Cloned Multi-Founder)
// @route POST /api/tasks
exports.createTask = async (req, res) => {
  const {
    title,
    projectId,
    projectName,
    topic,
    description,
    priority,
    assigneeType, // 'single' | 'team' | 'cloned'
    assignedTo,   // Array of user IDs
    deadline,
    referenceLinks,
    checklist
  } = req.body;

  if (!title || !deadline) {
    return res.status(400).json({ success: false, message: 'Task Title and Deadline are required.' });
  }

  const store = getStore();
  const createdTasks = [];

  const isSuperAdmin = req.user.role === 'superadmin';
  const initialStatus = isSuperAdmin ? 'todo' : 'pending_approval';
  const approvalStatus = isSuperAdmin ? 'approved' : 'pending';

  // Dynamic Pipeline Stage Resolution
  let stageId = req.body.pipelineStageId || null;
  let stageName = req.body.pipelineStageName || null;

  if (req.body.newPipelineStage && req.body.newPipelineStage.trim() && projectId && projectId !== 'proj_general') {
    const targetProj = store.clientProjects.find(p => p.id === projectId);
    if (targetProj) {
      if (!Array.isArray(targetProj.pipelineStages)) {
        targetProj.pipelineStages = [
          { id: 'stage_wireframing', name: targetProj.projectType === 'internal' ? 'Architecture & Specs' : 'Wireframing & UI/UX', lead: targetProj.leadFounder || 'Sayantan Ghosh', order: 1 },
          { id: 'stage_frontend', name: targetProj.projectType === 'internal' ? 'Core Engineering' : 'Frontend & Dynamic Motion', lead: 'Soham Dutta', order: 2 },
          { id: 'stage_backend', name: targetProj.projectType === 'internal' ? 'Integration & API' : 'Backend, CMS & API', lead: 'Soham Dutta', order: 3 },
          { id: 'stage_qa', name: targetProj.projectType === 'internal' ? 'Launch & Operations' : 'Client QA & Handover', lead: 'Achinta Bej', order: 4 }
        ];
      }
      const createdStage = {
        id: `stage_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        name: req.body.newPipelineStage.trim(),
        lead: req.user.name,
        category: topic || 'Development',
        order: targetProj.pipelineStages.length + 1,
        createdAt: new Date().toISOString()
      };
      targetProj.pipelineStages.push(createdStage);
      stageId = createdStage.id;
      stageName = createdStage.name;
    }
  }

  if (assigneeType === 'cloned' && Array.isArray(assignedTo) && assignedTo.length > 1) {
    // Mode 3: Cloned Independent Tasks for Each Selected Founder
    assignedTo.forEach((founderId) => {
      const founder = store.users.find(u => u.id === founderId);
      const newTask = {
        id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        title: `${title} [${founder ? founder.name : 'Founder'}]`,
        projectId: projectId || 'proj_general',
        projectName: projectName || 'General Operations',
        topic: topic || 'Operations',
        pipelineStageId: stageId,
        pipelineStageName: stageName,
        description: description || '',
        priority: priority || 'medium',
        assigneeType: 'single',
        assignedTo: [founderId],
        assignedBy: req.user.id,
        progress: 0,
        status: initialStatus,
        approvalStatus: approvalStatus,
        requesterId: req.user.id,
        requesterName: req.user.name,
        deadline: new Date(deadline).toISOString(),
        isBlocked: false,
        blockerReason: '',
        referenceLinks: referenceLinks || [],
        checklist: checklist || [],
        dailyUpdates: [],
        progressRequests: [],
        transferRequests: [],
        createdAt: new Date().toISOString()
      };
      store.tasks.unshift(newTask);
      createdTasks.push(newTask);
    });
  } else if (assigneeType === 'team') {
    // Mode 2: Shared Team Task
    const allFounderIds = store.users.filter(u => u.role === 'founder').map(u => u.id);
    const newTask = {
      id: `task_${Date.now()}`,
      title,
      projectId: projectId || 'proj_general',
      projectName: projectName || 'General Operations',
      topic: topic || 'Team Initiative',
      pipelineStageId: stageId,
      pipelineStageName: stageName,
      description: description || '',
      priority: priority || 'medium',
      assigneeType: 'team',
      assignedTo: allFounderIds,
      assignedBy: req.user.id,
      progress: 0,
      status: initialStatus,
      approvalStatus: approvalStatus,
      requesterId: req.user.id,
      requesterName: req.user.name,
      deadline: new Date(deadline).toISOString(),
      isBlocked: false,
      blockerReason: '',
      referenceLinks: referenceLinks || [],
      checklist: checklist || [],
      dailyUpdates: [],
      progressRequests: [],
      transferRequests: [],
      createdAt: new Date().toISOString()
    };
    store.tasks.unshift(newTask);
    createdTasks.push(newTask);
  } else {
    // Mode 1: Single Assignee (or direct)
    const newTask = {
      id: `task_${Date.now()}`,
      title,
      projectId: projectId || 'proj_general',
      projectName: projectName || 'General Operations',
      topic: topic || 'Operations',
      pipelineStageId: stageId,
      pipelineStageName: stageName,
      description: description || '',
      priority: priority || 'medium',
      assigneeType: 'single',
      assignedTo: Array.isArray(assignedTo) && assignedTo.length > 0 ? assignedTo : [req.user.id],
      assignedBy: req.user.id,
      progress: 0,
      status: initialStatus,
      approvalStatus: approvalStatus,
      requesterId: req.user.id,
      requesterName: req.user.name,
      deadline: new Date(deadline).toISOString(),
      isBlocked: false,
      blockerReason: '',
      referenceLinks: referenceLinks || [],
      checklist: checklist || [],
      dailyUpdates: [],
      progressRequests: [],
      transferRequests: [],
      createdAt: new Date().toISOString()
    };
    store.tasks.unshift(newTask);
    createdTasks.push(newTask);
  }

  const taskLog = {
    id: `log_${Date.now()}`,
    action: isSuperAdmin ? 'TASK_CREATED' : 'TASK_CREATION_REQUESTED',
    details: isSuperAdmin
      ? `Lead Admin directly provisioned task: "${title}"`
      : `${req.user.name} submitted task "${title}" for Admin Creation Approval.`,
    actor: req.user.name,
    timestamp: new Date().toISOString()
  };
  store.auditLogs.unshift(taskLog);

  let taskReqNotif = null;
  if (!isSuperAdmin) {
    if (!store.notifications) store.notifications = [];
    taskReqNotif = {
      id: `notif_${Date.now()}`,
      title: `Task Request: ${title}`,
      message: `${req.user.name} submitted task "${title}" for Admin Creation Approval.`,
      type: 'task',
      targetRole: 'superadmin',
      linkTab: 'requests',
      referenceId: createdTasks[0]?.id,
      timestamp: new Date().toISOString(),
      readBy: []
    };
    store.notifications.unshift(taskReqNotif);
  }

  saveStore(store);

  const io = req.io || req.app?.get('io');
  if (io) {
    io.emit('new_activity', taskLog);
    if (taskReqNotif) {
      io.emit('new_notification', taskReqNotif);
    }
    io.emit('task_updated', {
      action: isSuperAdmin ? 'TASK_CREATED' : 'TASK_CREATION_REQUESTED',
      tasks: createdTasks,
      actor: req.user.name
    });
  }

  res.status(201).json({
    success: true,
    message: isSuperAdmin
      ? `Created ${createdTasks.length} task(s) successfully.`
      : `Task creation request submitted. Waiting for Lead Admin approval.`,
    tasks: createdTasks,
    isPendingApproval: !isSuperAdmin
  });
};

// @desc Post Daily Update (Instant Post - No Admin Approval Required)
// @route POST /api/tasks/:id/daily-update
exports.postDailyUpdate = async (req, res) => {
  const { id } = req.params;
  const { text, statusTag, voiceNoteUrl, voiceNoteDuration } = req.body;

  const updateText = (text && text.trim()) ? text.trim() : (voiceNoteUrl ? '🎙️ Voice Note Standup Memo' : '');

  if (!updateText) {
    return res.status(400).json({ success: false, message: 'Update text or voice note is required.' });
  }

  const store = getStore();
  const taskIndex = store.tasks.findIndex(t => t.id === id);

  if (taskIndex === -1) {
    return res.status(404).json({ success: false, message: 'Task not found.' });
  }

  const updateEntry = {
    id: `du_${Date.now()}`,
    authorId: req.user.id,
    authorName: req.user.name,
    text: updateText,
    statusTag: statusTag || (voiceNoteUrl ? 'Voice Note' : 'Working'),
    timestamp: new Date().toISOString(),
    voiceNoteUrl: voiceNoteUrl || null,
    voiceNoteDuration: voiceNoteDuration || 0
  };

  store.tasks[taskIndex].dailyUpdates.unshift(updateEntry);
  if (store.tasks[taskIndex].status === 'todo') {
    store.tasks[taskIndex].status = 'in_progress';
  }

  const updateLog = {
    id: `log_${Date.now()}`,
    action: 'DAILY_UPDATE_POSTED',
    details: `${req.user.name} posted a daily update on "${store.tasks[taskIndex].title}"`,
    actor: req.user.name,
    timestamp: new Date().toISOString()
  };
  store.auditLogs.unshift(updateLog);

  saveStore(store);

  const io = req.io || req.app?.get('io');
  if (io) {
    io.emit('new_activity', updateLog);
  }

  res.json({
    success: true,
    message: 'Daily update logged instantly.',
    update: updateEntry,
    task: store.tasks[taskIndex]
  });
};

// @desc Request Progress % Increase (Requires Mandatory Proof URL -> Enters Admin Review Queue)
// @route POST /api/tasks/:id/request-progress
exports.requestProgress = async (req, res) => {
  const { id } = req.params;
  const { targetProgress, proofUrl, notes, voiceNoteUrl, voiceNoteDuration, credentialData } = req.body;

  if (!targetProgress || !proofUrl || proofUrl.trim() === '') {
    return res.status(400).json({ success: false, message: 'Target progress percentage and proof URL are mandatory.' });
  }

  const store = getStore();
  const taskIndex = store.tasks.findIndex(t => t.id === id);

  if (taskIndex === -1) {
    return res.status(404).json({ success: false, message: 'Task not found.' });
  }

  let attachedCredId = null;
  const currentTask = store.tasks[taskIndex];

  // Auto-inject credentials to project vault if provided
  if (credentialData && credentialData.title && credentialData.username) {
    if (currentTask.projectId && currentTask.projectId !== 'proj_general') {
      const proj = store.clientProjects.find(p => p.id === currentTask.projectId);
      if (proj) {
        if (!Array.isArray(proj.credentials)) proj.credentials = [];
        attachedCredId = `cred_${Date.now()}`;
        const newCred = {
          id: attachedCredId,
          title: credentialData.title.trim(),
          service: credentialData.service || 'Web Service',
          username: credentialData.username.trim(),
          passwordMasked: '••••••••••••',
          passwordEncrypted: credentialData.password ? credentialData.password.trim() : '••••••••',
          url: credentialData.url || '',
          status: req.user.role === 'superadmin' ? 'approved' : 'pending_approval',
          submittedBy: req.user.name,
          sourceTaskId: currentTask.id,
          sourceTaskTitle: currentTask.title,
          createdAt: new Date().toISOString()
        };
        proj.credentials.push(newCred);
      }
    }
  }

  const progressReq = {
    id: `pr_${Date.now()}`,
    requestedBy: req.user.id,
    requesterName: req.user.name,
    currentProgress: store.tasks[taskIndex].progress,
    targetProgress: parseInt(targetProgress, 10),
    proofUrl: proofUrl.trim(),
    notes: notes || '',
    voiceNoteUrl: voiceNoteUrl || null,
    voiceNoteDuration: voiceNoteDuration || 0,
    credentialData: credentialData || null,
    attachedCredId,
    status: 'pending', // pending | approved | rejected
    reviewFeedback: '',
    createdAt: new Date().toISOString()
  };

  store.tasks[taskIndex].progressRequests.unshift(progressReq);
  store.tasks[taskIndex].status = 'review_pending';

  const progressAudit = {
    id: `log_${Date.now()}`,
    action: 'PROGRESS_INCREASE_REQUESTED',
    details: `${req.user.name} requested progress increase (${store.tasks[taskIndex].progress}% -> ${targetProgress}%) with proof link.${attachedCredId ? ' [Credentials Auto-Synced to Project Vault]' : ''}`,
    actor: req.user.name,
    timestamp: new Date().toISOString()
  };
  store.auditLogs.unshift(progressAudit);

  if (!store.notifications) store.notifications = [];
  const progressNotif = {
    id: `notif_pr_${Date.now()}`,
    title: `📈 Progress Review: ${store.tasks[taskIndex].title}`,
    message: `${req.user.name} submitted ${targetProgress}% progress proof for review.`,
    type: 'task',
    targetRole: 'superadmin',
    linkTab: 'requests',
    referenceId: store.tasks[taskIndex].id,
    timestamp: new Date().toISOString(),
    readBy: []
  };
  store.notifications.unshift(progressNotif);

  saveStore(store);

  const io = req.io || req.app?.get('io');
  if (io) {
    io.emit('new_notification', progressNotif);
    io.emit('new_activity', progressAudit);
    io.emit('task_updated', {
      action: 'PROGRESS_REQUESTED',
      taskId: store.tasks[taskIndex].id,
      task: store.tasks[taskIndex]
    });
  }

  res.json({
    success: true,
    message: 'Progress increase request submitted for Admin review.',
    request: progressReq,
    task: store.tasks[taskIndex]
  });
};

// @desc Admin Review Progress Request (Approve or Reject with Rollback)
// @route POST /api/tasks/:id/review-progress
exports.reviewProgress = async (req, res) => {
  const { id } = req.params;
  const { requestId, decision, feedback } = req.body; // decision: 'approve' | 'reject'

  if (req.user.role !== 'superadmin') {
    return res.status(403).json({ success: false, message: 'Only Super Admin can approve progress proofs.' });
  }

  const store = getStore();
  const taskIndex = store.tasks.findIndex(t => t.id === id);
  if (taskIndex === -1) {
    return res.status(404).json({ success: false, message: 'Task not found.' });
  }

  const reqIndex = store.tasks[taskIndex].progressRequests.findIndex(r => r.id === requestId);
  if (reqIndex === -1) {
    return res.status(404).json({ success: false, message: 'Progress request not found.' });
  }

  const targetReq = store.tasks[taskIndex].progressRequests[reqIndex];
  if (!store.notifications) store.notifications = [];
  let reviewNotif = null;

  if (decision === 'approve') {
    targetReq.status = 'approved';
    targetReq.reviewFeedback = feedback || 'Verified and approved by Lead Admin.';
    store.tasks[taskIndex].progress = targetReq.targetProgress;
    store.tasks[taskIndex].status = targetReq.targetProgress >= 100 ? 'completed' : 'in_progress';

    // Auto-approve attached credential if submitted with task
    if (targetReq.attachedCredId) {
      const currentTask = store.tasks[taskIndex];
      if (currentTask.projectId) {
        const proj = store.clientProjects.find(p => p.id === currentTask.projectId);
        if (proj && Array.isArray(proj.credentials)) {
          const targetCred = proj.credentials.find(c => c.id === targetReq.attachedCredId);
          if (targetCred) {
            targetCred.status = 'approved';
            targetCred.approvedBy = req.user.name;
          }
        }
      }
    }

    const appAudit = {
      id: `log_${Date.now()}`,
      action: 'PROGRESS_APPROVED',
      details: `Lead Admin approved ${targetReq.targetProgress}% progress for "${store.tasks[taskIndex].title}"`,
      actor: req.user.name,
      timestamp: new Date().toISOString()
    };
    store.auditLogs.unshift(appAudit);

    reviewNotif = {
      id: `notif_pr_app_${Date.now()}`,
      title: `✅ Progress Approved (${targetReq.targetProgress}%): ${store.tasks[taskIndex].title}`,
      message: `Lead Admin approved your progress proof for "${store.tasks[taskIndex].title}".`,
      type: 'success',
      targetUserId: targetReq.requestedBy,
      linkTab: 'tasks',
      referenceId: store.tasks[taskIndex].id,
      timestamp: new Date().toISOString(),
      readBy: []
    };
    store.notifications.unshift(reviewNotif);
  } else {
    targetReq.status = 'rejected';
    targetReq.reviewFeedback = feedback || 'Proof rejected. Progress reverted to previous percentage.';
    store.tasks[taskIndex].status = 'in_progress'; // Reverts back

    const rejAudit = {
      id: `log_${Date.now()}`,
      action: 'PROGRESS_REJECTED',
      details: `Lead Admin rejected progress proof for "${store.tasks[taskIndex].title}". Reason: ${feedback || 'Insufficient proof'}`,
      actor: req.user.name,
      timestamp: new Date().toISOString()
    };
    store.auditLogs.unshift(rejAudit);

    reviewNotif = {
      id: `notif_pr_rej_${Date.now()}`,
      title: `❌ Progress Proof Rejected: ${store.tasks[taskIndex].title}`,
      message: `Lead Admin rejected progress proof. Reason: ${feedback || 'Insufficient proof'}`,
      type: 'warning',
      targetUserId: targetReq.requestedBy,
      linkTab: 'requests',
      referenceId: store.tasks[taskIndex].id,
      timestamp: new Date().toISOString(),
      readBy: []
    };
    store.notifications.unshift(reviewNotif);
  }

  saveStore(store);

  const io = req.io || req.app?.get('io');
  if (io) {
    if (reviewNotif) {
      io.emit('new_notification', reviewNotif);
    }
    const latestAudit = store.auditLogs[0];
    if (latestAudit) {
      io.emit('new_activity', latestAudit);
    }
    io.emit('task_updated', {
      action: decision === 'approve' ? 'PROGRESS_APPROVED' : 'PROGRESS_REJECTED',
      taskId: store.tasks[taskIndex].id,
      task: store.tasks[taskIndex]
    });
  }

  res.json({
    success: true,
    message: `Progress request ${decision === 'approve' ? 'Approved' : 'Rejected'}.`,
    task: store.tasks[taskIndex]
  });
};

// @desc Request Task Transfer with Mandatory Handover Brief
// @route POST /api/tasks/:id/transfer-request
exports.requestTransfer = async (req, res) => {
  const { id } = req.params;
  const { targetFounderId, workDoneSoFar, currentProgressPercent, remainingWork, reason } = req.body;

  const store = getStore();
  const task = store.tasks.find(t => t.id === id);

  if (!task) {
    return res.status(404).json({ success: false, message: 'Task not found.' });
  }

  // Strict ownership check: founder can ONLY transfer tasks assigned to themselves
  if (!task.assignedTo.includes(req.user.id) && req.user.role !== 'superadmin') {
    return res.status(403).json({ success: false, message: 'You can only request transfer for tasks assigned to yourself.' });
  }

  if (!workDoneSoFar || !reason || !targetFounderId) {
    return res.status(400).json({ success: false, message: 'Target founder, Handover Brief (Work Done So Far), and Reason are required.' });
  }

  const targetFounder = store.users.find(u => u.id === targetFounderId);
  if (!targetFounder) {
    return res.status(404).json({ success: false, message: 'Target founder does not exist.' });
  }

  const transferItem = {
    id: `tr_${Date.now()}`,
    fromUserId: req.user.id,
    fromUserName: req.user.name,
    toUserId: targetFounderId,
    toUserName: targetFounder.name,
    workDoneSoFar: workDoneSoFar.trim(),
    currentProgressPercent: currentProgressPercent || task.progress,
    remainingWork: remainingWork || '',
    reason: reason.trim(),
    status: 'pending', // pending | accepted | declined
    createdAt: new Date().toISOString()
  };

  task.transferRequests.unshift(transferItem);

  const transferLog = {
    id: `log_${Date.now()}`,
    action: 'TASK_TRANSFER_REQUESTED',
    details: `${req.user.name} initiated transfer request for "${task.title}" to ${targetFounder.name}.`,
    actor: req.user.name,
    timestamp: new Date().toISOString()
  };
  store.auditLogs.unshift(transferLog);

  if (!store.notifications) store.notifications = [];
  
  // 1. Send urgent notification to the recipient founder
  const trRecipientNotif = {
    id: `notif_tr_${Date.now()}`,
    title: `🔄 Task Handover: ${task.title}`,
    message: `${req.user.name} initiated transfer of "${task.title}" to you. Reason: "${reason.trim()}". Review and accept in Requests Hub.`,
    type: 'warning',
    priority: 'urgent',
    targetUserId: targetFounderId,
    linkTab: 'requests',
    referenceId: task.id,
    timestamp: new Date().toISOString(),
    readBy: []
  };
  store.notifications.unshift(trRecipientNotif);

  // 2. Send notification to Lead Admin
  const trAdminNotif = {
    id: `notif_tr_adm_${Date.now()}`,
    title: `🔄 Task Handover Notice: ${task.title}`,
    message: `${req.user.name} requested transfer to ${targetFounder.name} for task "${task.title}".`,
    type: 'info',
    targetRole: 'superadmin',
    linkTab: 'requests',
    referenceId: task.id,
    timestamp: new Date().toISOString(),
    readBy: []
  };
  store.notifications.unshift(trAdminNotif);

  // 3. Post system message in Founders Group chat
  if (!store.messages) store.messages = [];
  const trChatMsg = {
    id: `msg_tr_${Date.now()}`,
    channelId: 'founders_group',
    senderId: 'system_handover',
    senderName: '🔄 TASK HANDOVER RADAR',
    senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    type: 'system_alert',
    text: `🔄 TASK HANDOVER INITIATED: @${req.user.name} requested transfer of "${task.title}" to @${targetFounder.name}. Brief: "${workDoneSoFar.trim()}".`,
    timestamp: new Date().toISOString()
  };
  store.messages.unshift(trChatMsg);

  const io = req.io || req.app?.get('io');
  if (io) {
    io.emit('new_notification', trRecipientNotif);
    io.emit('new_activity', transferLog);
    io.emit('new_message', trChatMsg);
    io.emit('task_updated', { action: 'TASK_TRANSFER_REQUESTED', taskId: task.id, task });
  }

  saveStore(store);

  res.json({
    success: true,
    message: 'Transfer request dispatched with handover brief & team notified.',
    transfer: transferItem
  });
};

// @desc Recipient Accepts or Declines Task Transfer
// @route POST /api/tasks/:id/transfer-respond
exports.respondTransfer = async (req, res) => {
  const { id } = req.params;
  const { transferId, decision, note } = req.body; // decision: 'accept' | 'decline'

  const store = getStore();
  const task = store.tasks.find(t => t.id === id);

  if (!task) {
    return res.status(404).json({ success: false, message: 'Task not found.' });
  }

  const transferIdToFind = transferId || req.body.requestId;
  const transfer = task.transferRequests.find(tr => tr.id === transferIdToFind);
  if (!transfer) {
    return res.status(404).json({ success: false, message: 'Transfer request not found.' });
  }

  if (transfer.toUserId !== req.user.id && req.user.role !== 'superadmin') {
    return res.status(403).json({ success: false, message: 'Only the recipient founder or Admin can respond to this transfer.' });
  }

  if (!store.notifications) store.notifications = [];
  const io = req.io || req.app?.get('io');

  if (decision === 'accept') {
    transfer.status = 'accepted';
    task.assignedTo = [transfer.toUserId];

    const accLog = {
      id: `log_${Date.now()}`,
      action: 'TASK_TRANSFER_ACCEPTED',
      details: `${req.user.name} accepted task handover for "${task.title}". Task ownership transferred.`,
      actor: req.user.name,
      timestamp: new Date().toISOString()
    };
    store.auditLogs.unshift(accLog);

    const accNotif = {
      id: `notif_tr_acc_${Date.now()}`,
      title: `✅ Handover Accepted: ${task.title}`,
      message: `${req.user.name} accepted task handover for "${task.title}". Ownership successfully transferred.`,
      type: 'success',
      targetUserId: transfer.fromUserId,
      linkTab: 'tasks',
      referenceId: task.id,
      timestamp: new Date().toISOString(),
      readBy: []
    };
    store.notifications.unshift(accNotif);
    if (io) {
      io.emit('new_notification', accNotif);
      io.emit('new_activity', accLog);
      io.emit('task_updated', { action: 'TASK_TRANSFER_ACCEPTED', taskId: task.id, task });
    }
  } else {
    transfer.status = 'declined';
    transfer.declineNote = note || 'Declined by recipient.';

    const decLog = {
      id: `log_${Date.now()}`,
      action: 'TASK_TRANSFER_DECLINED',
      details: `${req.user.name} declined task handover for "${task.title}".`,
      actor: req.user.name,
      timestamp: new Date().toISOString()
    };
    store.auditLogs.unshift(decLog);

    const decNotif = {
      id: `notif_tr_dec_${Date.now()}`,
      title: `❌ Handover Declined: ${task.title}`,
      message: `${req.user.name} declined task handover for "${task.title}". Note: "${transfer.declineNote}".`,
      type: 'warning',
      targetUserId: transfer.fromUserId,
      linkTab: 'tasks',
      referenceId: task.id,
      timestamp: new Date().toISOString(),
      readBy: []
    };
    store.notifications.unshift(decNotif);
    if (io) {
      io.emit('new_notification', decNotif);
      io.emit('new_activity', decLog);
      io.emit('task_updated', { action: 'TASK_TRANSFER_DECLINED', taskId: task.id, task });
    }
  }

  saveStore(store);

  res.json({
    success: true,
    message: `Transfer request ${decision === 'accept' ? 'Accepted' : 'Declined'}.`,
    task
  });
};

// @desc Request Deadline Extension (To Admin)
// @route POST /api/tasks/:id/request-extension
exports.requestExtension = async (req, res) => {
  const { id } = req.params;
  const { requestedDeadline, reason } = req.body;

  if (!requestedDeadline || !reason) {
    return res.status(400).json({ success: false, message: 'New requested deadline and justification reason are required.' });
  }

  const store = getStore();
  const task = store.tasks.find(t => t.id === id);

  if (!task) {
    return res.status(404).json({ success: false, message: 'Task not found.' });
  }

  task.extensionRequest = {
    id: `ext_${Date.now()}`,
    requestedBy: req.user.id,
    requesterName: req.user.name,
    currentDeadline: task.deadline,
    requestedDeadline: new Date(requestedDeadline).toISOString(),
    reason: reason.trim(),
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  const extAudit = {
    id: `log_${Date.now()}`,
    action: 'EXTENSION_REQUESTED',
    details: `${req.user.name} requested deadline extension for "${task.title}" to ${new Date(requestedDeadline).toLocaleString()}. Reason: "${reason.trim()}".`,
    actor: req.user.name,
    timestamp: new Date().toISOString()
  };
  store.auditLogs.unshift(extAudit);

  // Urgent notification to Super Admin
  if (!store.notifications) store.notifications = [];
  const extNotif = {
    id: `notif_ext_${Date.now()}`,
    title: `⏱️ Extension Request: ${task.title}`,
    message: `${req.user.name} requested deadline extension to ${new Date(requestedDeadline).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}. Reason: "${reason.trim()}". Review in Requests Hub.`,
    type: 'warning',
    priority: 'urgent',
    targetRole: 'superadmin',
    linkTab: 'requests',
    referenceId: task.id,
    timestamp: new Date().toISOString(),
    readBy: []
  };
  store.notifications.unshift(extNotif);

  const io = req.io || req.app?.get('io');
  if (io) {
    io.emit('new_notification', extNotif);
    io.emit('new_activity', extAudit);
    io.emit('task_updated', { action: 'EXTENSION_REQUESTED', taskId: task.id, task });
  }

  saveStore(store);

  res.json({
    success: true,
    message: 'Deadline extension request forwarded to Lead Admin with alert notification.',
    task
  });
};

// @desc Super Admin Review Deadline Extension Request (Approve or Reject)
// @route POST /api/tasks/:id/review-extension
exports.reviewExtension = async (req, res) => {
  const { id } = req.params;
  const { decision, status, feedback } = req.body;

  if (req.user.role !== 'superadmin') {
    return res.status(403).json({ success: false, message: 'Only Super Admin can decide on deadline extensions.' });
  }

  const store = getStore();
  const task = store.tasks.find(t => t.id === id);

  if (!task || !task.extensionRequest) {
    return res.status(404).json({ success: false, message: 'Extension request not found for this task.' });
  }

  const isApproved = decision === 'approve' || decision === 'approved' || status === 'approved' || status === 'approve';

  if (isApproved) {
    if (task.extensionRequest.requestedDeadline) {
      task.deadline = task.extensionRequest.requestedDeadline;
    }
    task.extensionRequest.status = 'approved';
    task.extensionRequest.approvedAt = new Date().toISOString();
  } else {
    task.extensionRequest.status = 'rejected';
    task.extensionRequest.rejectionFeedback = feedback || 'Rejected by Lead Admin.';
    task.extensionRequest.rejectedAt = new Date().toISOString();
  }

  const extAudit = {
    id: `log_${Date.now()}`,
    action: isApproved ? 'EXTENSION_APPROVED' : 'EXTENSION_REJECTED',
    details: `Lead Admin ${isApproved ? 'approved' : 'rejected'} deadline extension for "${task.title}". ${feedback ? 'Note: ' + feedback : ''}`,
    actor: req.user.name,
    timestamp: new Date().toISOString()
  };
  store.auditLogs.unshift(extAudit);

  if (!store.notifications) store.notifications = [];
  const extDecNotif = {
    id: `notif_ext_dec_${Date.now()}`,
    title: isApproved ? `✅ Extension Approved: ${task.title}` : `❌ Extension Rejected: ${task.title}`,
    message: isApproved 
      ? `Lead Admin approved your extension request. New deadline is now active.`
      : `Extension request was rejected. Feedback: "${feedback || 'Maintain current sprint deadline.'}"`,
    type: isApproved ? 'success' : 'warning',
    priority: isApproved ? 'normal' : 'urgent',
    targetUserId: task.extensionRequest.requestedBy,
    linkTab: 'tasks',
    referenceId: task.id,
    timestamp: new Date().toISOString(),
    readBy: []
  };
  store.notifications.unshift(extDecNotif);

  const io = req.io || req.app?.get('io');
  if (io) {
    io.emit('new_notification', extDecNotif);
    io.emit('new_activity', extAudit);
    io.emit('task_updated', { action: isApproved ? 'EXTENSION_APPROVED' : 'EXTENSION_REJECTED', taskId: task.id, task });
  }

  saveStore(store);

  res.json({
    success: true,
    message: `Extension request ${isApproved ? 'Approved' : 'Rejected'}.`,
    task
  });
};

// @desc Toggle "I am Blocked" Escalation Signal (Rule 08)
// @route POST /api/tasks/:id/toggle-blocker
exports.toggleBlocker = async (req, res) => {
  const { id } = req.params;
  const { isBlocked, reason } = req.body;

  const store = getStore();
  const task = store.tasks.find(t => t.id === id);

  if (!task) {
    return res.status(404).json({ success: false, message: 'Task not found.' });
  }

  task.isBlocked = !!isBlocked;
  task.blockerReason = isBlocked ? (reason || 'Founder reported an active blocker (Rule 08).') : '';

  const blockerLog = {
    id: `log_${Date.now()}`,
    action: isBlocked ? 'TASK_MARKED_BLOCKED' : 'TASK_UNBLOCKED',
    details: `${req.user.name} ${isBlocked ? 'reported blocker: ' + task.blockerReason : 'cleared blocker'} on "${task.title}".`,
    actor: req.user.name,
    timestamp: new Date().toISOString()
  };
  store.auditLogs.unshift(blockerLog);

  if (!store.notifications) store.notifications = [];
  const io = req.io || req.app?.get('io');

  if (isBlocked) {
    // High-priority blocker notification for all founders & Super Admin
    const blockerNotif = {
      id: `notif_block_${Date.now()}`,
      title: `🚨 Rule 08 Blocker: ${task.title}`,
      message: `${req.user.name} reported a blocker on "${task.title}": "${task.blockerReason}". Immediate team support required!`,
      type: 'warning',
      priority: 'urgent',
      targetRole: 'all',
      linkTab: 'tasks',
      referenceId: task.id,
      timestamp: new Date().toISOString(),
      readBy: []
    };
    store.notifications.unshift(blockerNotif);

    // Broadcast in Founders Group chat
    if (!store.messages) store.messages = [];
    const blockerMsg = {
      id: `msg_block_${Date.now()}`,
      channelId: 'founders_group',
      senderId: 'system_blocker',
      senderName: '🚨 RULE 08 BLOCKER ESCALATION',
      senderAvatar: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=150&q=80',
      type: 'system_blocker_alert',
      text: `🚨 ACTIVE BLOCKER REPORTED: @${req.user.name} is blocked on task "${task.title}"! Blocker: "${task.blockerReason}". Team review required immediately under Rule 08.`,
      timestamp: new Date().toISOString()
    };
    store.messages.unshift(blockerMsg);

    if (io) {
      io.emit('new_notification', blockerNotif);
      io.emit('new_activity', blockerLog);
      io.emit('new_message', blockerMsg);
      io.emit('TASK_BLOCKED', { taskId: task.id, reason: task.blockerReason });
      io.emit('task_updated', { action: 'TASK_BLOCKED', taskId: task.id, task });
    }
  } else {
    const unblockNotif = {
      id: `notif_unblock_${Date.now()}`,
      title: `✅ Blocker Resolved: ${task.title}`,
      message: `${req.user.name} resolved the active blocker on "${task.title}".`,
      type: 'success',
      targetRole: 'all',
      linkTab: 'tasks',
      referenceId: task.id,
      timestamp: new Date().toISOString(),
      readBy: []
    };
    store.notifications.unshift(unblockNotif);
    if (io) {
      io.emit('new_notification', unblockNotif);
      io.emit('new_activity', blockerLog);
      io.emit('task_updated', { action: 'TASK_UNBLOCKED', taskId: task.id, task });
    }
  }

  saveStore(store);

  res.json({
    success: true,
    message: isBlocked ? 'Task flagged as blocked. Team and Lead Admin notified.' : 'Task unblocked.',
    task
  });
};

// @desc Toggle Checklist Item
// @route POST /api/tasks/:id/checklist-toggle
exports.toggleChecklist = async (req, res) => {
  const { id } = req.params;
  const { itemId, completed } = req.body;

  const store = getStore();
  const task = store.tasks.find(t => t.id === id);

  if (!task) {
    return res.status(404).json({ success: false, message: 'Task not found.' });
  }

  const item = task.checklist.find(c => c.id === itemId);
  if (item) {
    item.completed = completed;
    saveStore(store);
  }

  res.json({ success: true, task });
};

// @desc Approve Task Creation (Super Admin Only)
// @route POST /api/tasks/:id/approve-creation
exports.approveTaskCreation = async (req, res) => {
  const { id } = req.params;

  if (req.user.role !== 'superadmin') {
    return res.status(403).json({ success: false, message: 'Only Super Admin can approve task creation.' });
  }

  const store = getStore();
  const task = store.tasks.find(t => t.id === id);

  if (!task) {
    return res.status(404).json({ success: false, message: 'Task not found.' });
  }

  task.approvalStatus = 'approved';
  task.status = 'todo'; // Activated into the Kanban board

  const appLog = {
    id: `log_${Date.now()}`,
    action: 'TASK_CREATION_APPROVED',
    details: `Lead Admin approved task creation for "${task.title}" (Requested by ${task.requesterName || 'Founder'}).`,
    actor: req.user.name,
    timestamp: new Date().toISOString()
  };
  store.auditLogs.unshift(appLog);

  if (!store.notifications) store.notifications = [];
  const appNotif = {
    id: `notif_${Date.now()}`,
    title: `Task Approved: ${task.title}`,
    message: `Lead Admin approved your task "${task.title}". It is now live on the Kanban board!`,
    type: 'success',
    targetUserId: task.requesterId,
    linkTab: 'tasks',
    referenceId: task.id,
    timestamp: new Date().toISOString(),
    readBy: []
  };
  store.notifications.unshift(appNotif);

  saveStore(store);

  const io = req.io || req.app?.get('io');
  if (io) {
    io.emit('new_notification', appNotif);
    io.emit('new_activity', appLog);
    io.emit('task_updated', {
      action: 'TASK_CREATION_APPROVED',
      task
    });
  }

  res.json({
    success: true,
    message: `Task "${task.title}" approved and activated in the board.`,
    task
  });
};

// @desc Reject Task Creation (Super Admin Only)
// @route POST /api/tasks/:id/reject-creation
exports.rejectTaskCreation = async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  if (req.user.role !== 'superadmin') {
    return res.status(403).json({ success: false, message: 'Only Super Admin can reject task creation.' });
  }

  const store = getStore();
  const taskIndex = store.tasks.findIndex(t => t.id === id);

  if (taskIndex === -1) {
    return res.status(404).json({ success: false, message: 'Task not found.' });
  }

  const taskTitle = store.tasks[taskIndex].title;
  const requesterId = store.tasks[taskIndex].requesterId;
  store.tasks.splice(taskIndex, 1); // Remove rejected task

  const rejLog = {
    id: `log_${Date.now()}`,
    action: 'TASK_CREATION_REJECTED',
    details: `Lead Admin rejected task creation for "${taskTitle}". Reason: ${reason || 'Not aligned with current sprint priorities.'}`,
    actor: req.user.name,
    timestamp: new Date().toISOString()
  };
  store.auditLogs.unshift(rejLog);

  if (!store.notifications) store.notifications = [];
  const rejNotif = {
    id: `notif_${Date.now()}`,
    title: `Task Request Rejected: ${taskTitle}`,
    message: `Reason: ${reason || 'Not aligned with current sprint priorities.'}`,
    type: 'warning',
    targetUserId: requesterId,
    linkTab: 'requests',
    timestamp: new Date().toISOString(),
    readBy: []
  };
  store.notifications.unshift(rejNotif);

  saveStore(store);

  const io = req.io || req.app?.get('io');
  if (io) {
    io.emit('new_notification', rejNotif);
    io.emit('new_activity', rejLog);
    io.emit('task_updated', {
      action: 'TASK_CREATION_REJECTED',
      taskId: id,
      taskTitle
    });
  }

  res.json({
    success: true,
    message: `Task creation request for "${taskTitle}" rejected.`
  });
};
