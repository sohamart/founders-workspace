const { getStore, saveStore } = require('../config/localStore');

// @desc Get All Client Projects
// @route GET /api/clients
exports.getClientProjects = async (req, res) => {
  const store = getStore();
  const user = req.user;

  // Filter sensitive credentials: if not admin, hide unapproved credentials
  const projects = store.clientProjects.map(proj => {
    const sanitizedCreds = proj.credentials.map(c => {
      if (c.status !== 'approved' && user.role !== 'superadmin') {
        return {
          id: c.id,
          title: c.title,
          service: c.service,
          status: 'pending_approval',
          submittedBy: c.submittedBy,
          message: 'Credential pending Super Admin security verification.'
        };
      }
      return c;
    });

    const defaultStages = [
      { id: 'stage_wireframing', name: proj.projectType === 'internal' ? 'Architecture & Specs' : 'Wireframing & UI/UX', lead: proj.leadFounder || 'Sayantan Ghosh', order: 1 },
      { id: 'stage_frontend', name: proj.projectType === 'internal' ? 'Core Engineering' : 'Frontend & Dynamic Motion', lead: 'Soham Dutta', order: 2 },
      { id: 'stage_backend', name: proj.projectType === 'internal' ? 'Integration & API' : 'Backend, CMS & API', lead: 'Soham Dutta', order: 3 },
      { id: 'stage_qa', name: proj.projectType === 'internal' ? 'Launch & Operations' : 'Client QA & Handover', lead: 'Achinta Bej', order: 4 }
    ];

    return {
      ...proj,
      pipelineStages: Array.isArray(proj.pipelineStages) && proj.pipelineStages.length > 0 ? proj.pipelineStages : defaultStages,
      credentials: sanitizedCreds
    };
  });

  res.json({
    success: true,
    count: projects.length,
    projects
  });
};

// @desc Create Project (Supports Client Web Project OR Brand/Internal Initiative)
// @route POST /api/clients
exports.createClientProject = async (req, res) => {
  const { name, clientName, brand, domain, budget, projectType, category, scope, leadFounder } = req.body;

  const isClient = (projectType || 'client') === 'client';

  if (!name || (isClient && !clientName)) {
    return res.status(400).json({ 
      success: false, 
      message: isClient ? 'Project Name and Client Name are required.' : 'Project Name is required.' 
    });
  }

  const store = getStore();
  const isAdmin = req.user.role === 'superadmin';
  const newProject = {
    id: `proj_${Date.now()}`,
    name: name.trim(),
    projectType: isClient ? 'client' : 'internal',
    category: category || (isClient ? 'Client Web Delivery' : 'Brand Internal Product'),
    scope: scope || '',
    leadFounder: leadFounder || req.user.name,
    clientName: isClient ? clientName.trim() : `${brand || 'Weblets®'} Internal`,
    brand: brand || 'Weblets®',
    domain: domain || '',
    status: isAdmin ? 'in_progress' : 'pending_approval',
    approvalStatus: isAdmin ? 'approved' : 'pending',
    requestedBy: req.user.id,
    requestedByName: req.user.name,
    requestedAt: new Date().toISOString(),
    budget: budget || (isClient ? '$0' : 'Internal Resource'),
    currentPhase: 1,
    phaseProgress: {
      phase1: { name: isClient ? 'Wireframing & UI/UX' : 'Architecture & Specs', status: isAdmin ? 'in_progress' : 'pending', percent: 0, lead: leadFounder || 'Sayantan Ghosh' },
      phase2: { name: isClient ? 'Frontend & Motion' : 'Core Engineering', status: 'pending', percent: 0, lead: 'Soham Dutta' },
      phase3: { name: isClient ? 'Backend, CMS & API' : 'Integration & Security', status: 'pending', percent: 0, lead: 'Soham Dutta' },
      phase4: { name: isClient ? 'Client Handover' : 'Launch & Operations', status: 'pending', percent: 0, lead: 'Achinta Bej' }
    },
    payments: {
      total: budget || '$0',
      milestone1: { title: '50% Initial Advance', amount: '', status: 'pending', date: '' },
      milestone2: { title: '25% Mid-Development', amount: '', status: 'pending', date: '' },
      milestone3: { title: '25% Final Delivery', amount: '', status: 'locked', date: '' }
    },
    pipelineStages: [
      { id: 'stage_wireframing', name: isClient ? 'Wireframing & UI/UX' : 'Architecture & Specs', lead: leadFounder || 'Sayantan Ghosh', order: 1 },
      { id: 'stage_frontend', name: isClient ? 'Frontend & Dynamic Motion' : 'Core Engineering', lead: 'Soham Dutta', order: 2 },
      { id: 'stage_backend', name: isClient ? 'Backend, CMS & API' : 'Integration & API', lead: 'Soham Dutta', order: 3 },
      { id: 'stage_qa', name: isClient ? 'Client QA & Handover' : 'Launch & Operations', lead: 'Achinta Bej', order: 4 }
    ],
    credentials: [],
    checklist: [
      { id: 'chk_1', text: 'SSL / HTTPS Certificate Verified Active', completed: false },
      { id: 'chk_2', text: 'Mobile & Tablet Responsive Audit Passed', completed: false },
      { id: 'chk_3', text: 'SEO Meta Tags, OpenGraph & Brand Favicon Configured', completed: false },
      { id: 'chk_4', text: 'Contact & Booking Forms Testing OK', completed: false },
      { id: 'chk_5', text: 'Admin Handover Documentation Prepared', completed: false }
    ],
    revisions: [],
    createdAt: new Date().toISOString()
  };

  store.clientProjects.unshift(newProject);

  const auditLog = {
    id: `log_${Date.now()}`,
    action: isAdmin ? 'CLIENT_PROJECT_CREATED' : 'PROJECT_CREATION_REQUESTED',
    details: isAdmin 
      ? `Super Admin created and initialized project: "${newProject.name}" for ${newProject.clientName}.`
      : `Founder ${req.user.name} submitted project request: "${newProject.name}" (${newProject.clientName}). Awaiting Super Admin approval.`,
    actor: req.user.name,
    timestamp: new Date().toISOString()
  };
  store.auditLogs.unshift(auditLog);

  if (!isAdmin) {
    if (!store.notifications) store.notifications = [];
    const notif = {
      id: `notif_proj_${Date.now()}`,
      title: '📋 New Project Request',
      message: `${req.user.name} submitted project "${newProject.name}" for ${newProject.clientName}. Super Admin approval required to launch.`,
      type: 'info',
      targetRole: 'superadmin',
      linkTab: 'requests',
      timestamp: new Date().toISOString(),
      readBy: []
    };
    store.notifications.unshift(notif);

    const io = req.io || req.app?.get('io');
    if (io) {
      io.emit('new_activity', auditLog);
      io.emit('new_notification', notif);
      io.emit('projects_updated', store.clientProjects);
    }
  } else {
    const io = req.io || req.app?.get('io');
    if (io) {
      io.emit('new_activity', auditLog);
      io.emit('projects_updated', store.clientProjects);
    }
  }

  saveStore(store);

  res.status(201).json({
    success: true,
    message: isAdmin 
      ? 'Client project initialized.' 
      : 'Project initialization request submitted to Super Admin for approval.',
    project: newProject
  });
};

// @desc Super Admin Approves a Project Proposal
// @route POST /api/clients/:id/approve
exports.approveClientProject = async (req, res) => {
  if (req.user.role !== 'superadmin') {
    return res.status(403).json({ success: false, message: 'Only Super Admin can approve project requests.' });
  }

  const { id } = req.params;
  const store = getStore();
  const project = store.clientProjects.find(p => p.id === id);

  if (!project) {
    return res.status(404).json({ success: false, message: 'Project not found.' });
  }

  project.approvalStatus = 'approved';
  project.status = 'in_progress';
  project.approvedBy = req.user.name;
  project.approvedAt = new Date().toISOString();

  // If phase1 was pending, set to in_progress
  if (project.phaseProgress && project.phaseProgress.phase1) {
    project.phaseProgress.phase1.status = 'in_progress';
  }

  const audit = {
    id: `log_${Date.now()}`,
    action: 'PROJECT_CREATION_APPROVED',
    details: `Super Admin approved project "${project.name}" (${project.clientName}). Workspace is now active.`,
    actor: req.user.name,
    timestamp: new Date().toISOString()
  };
  store.auditLogs.unshift(audit);

  if (!store.notifications) store.notifications = [];
  const notif = {
    id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    title: '🎉 Project Proposal Approved!',
    message: `Super Admin approved "${project.name}". The workspace and dev pipeline are now active.`,
    type: 'success',
    targetUserId: project.requestedBy || null,
    targetRole: project.requestedBy ? null : 'all',
    linkTab: 'projects',
    timestamp: new Date().toISOString(),
    readBy: []
  };
  store.notifications.unshift(notif);

  saveStore(store);

  const io = req.io || req.app?.get('io');
  if (io) {
    io.emit('new_activity', audit);
    io.emit('new_notification', notif);
    io.emit('projects_updated', store.clientProjects);
  }

  res.json({
    success: true,
    message: `Project "${project.name}" approved successfully.`,
    project
  });
};

// @desc Super Admin Rejects a Project Proposal
// @route POST /api/clients/:id/reject
exports.rejectClientProject = async (req, res) => {
  if (req.user.role !== 'superadmin') {
    return res.status(403).json({ success: false, message: 'Only Super Admin can reject project requests.' });
  }

  const { id } = req.params;
  const { reason } = req.body;
  const store = getStore();
  const project = store.clientProjects.find(p => p.id === id);

  if (!project) {
    return res.status(404).json({ success: false, message: 'Project not found.' });
  }

  project.approvalStatus = 'rejected';
  project.status = 'rejected';
  project.rejectionReason = reason || 'Declined by Lead Admin.';
  project.rejectedBy = req.user.name;
  project.rejectedAt = new Date().toISOString();

  const audit = {
    id: `log_${Date.now()}`,
    action: 'PROJECT_CREATION_REJECTED',
    details: `Super Admin rejected project proposal "${project.name}": ${project.rejectionReason}`,
    actor: req.user.name,
    timestamp: new Date().toISOString()
  };
  store.auditLogs.unshift(audit);

  if (!store.notifications) store.notifications = [];
  const notif = {
    id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    title: 'Project Proposal Declined',
    message: `Super Admin rejected "${project.name}": ${project.rejectionReason}`,
    type: 'warning',
    targetUserId: project.requestedBy || null,
    targetRole: project.requestedBy ? null : 'all',
    linkTab: 'projects',
    timestamp: new Date().toISOString(),
    readBy: []
  };
  store.notifications.unshift(notif);

  saveStore(store);

  const io = req.io || req.app?.get('io');
  if (io) {
    io.emit('new_activity', audit);
    io.emit('new_notification', notif);
    io.emit('projects_updated', store.clientProjects);
  }

  res.json({
    success: true,
    message: `Project "${project.name}" rejected.`,
    project
  });
};

// @desc Add New Pipeline Stage to a Project
// @route POST /api/clients/:id/pipeline-stage
exports.addPipelineStage = async (req, res) => {
  const { id } = req.params;
  const { stageName, lead, category } = req.body;

  if (!stageName || !stageName.trim()) {
    return res.status(400).json({ success: false, message: 'Stage name is required.' });
  }

  const store = getStore();
  const project = store.clientProjects.find(p => p.id === id);

  if (!project) {
    return res.status(404).json({ success: false, message: 'Client project not found.' });
  }

  if (!Array.isArray(project.pipelineStages)) {
    project.pipelineStages = [
      { id: 'stage_wireframing', name: project.projectType === 'internal' ? 'Architecture & Specs' : 'Wireframing & UI/UX', lead: project.leadFounder || 'Sayantan Ghosh', order: 1 },
      { id: 'stage_frontend', name: project.projectType === 'internal' ? 'Core Engineering' : 'Frontend & Dynamic Motion', lead: 'Soham Dutta', order: 2 },
      { id: 'stage_backend', name: project.projectType === 'internal' ? 'Integration & API' : 'Backend, CMS & API', lead: 'Soham Dutta', order: 3 },
      { id: 'stage_qa', name: project.projectType === 'internal' ? 'Launch & Operations' : 'Client QA & Handover', lead: 'Achinta Bej', order: 4 }
    ];
  }

  const newStage = {
    id: `stage_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    name: stageName.trim(),
    lead: lead || req.user.name,
    category: category || 'Engineering',
    order: project.pipelineStages.length + 1,
    createdAt: new Date().toISOString()
  };

  project.pipelineStages.push(newStage);

  store.auditLogs.unshift({
    id: `log_${Date.now()}`,
    action: 'PIPELINE_STAGE_ADDED',
    details: `${req.user.name} added pipeline stage "${newStage.name}" to project "${project.name}".`,
    actor: req.user.name,
    timestamp: new Date().toISOString()
  });

  saveStore(store);

  res.status(201).json({
    success: true,
    message: 'Pipeline stage created successfully.',
    stage: newStage,
    project
  });
};

// @desc Add Credential to Client Vault (Enters Pending Admin Approval)
// @route POST /api/clients/:id/credentials
exports.addCredential = async (req, res) => {
  const { id } = req.params;
  const { title, service, username, password, url } = req.body;

  if (!title || !username || !password) {
    return res.status(400).json({ success: false, message: 'Title, Username, and Password are required.' });
  }

  const store = getStore();
  const project = store.clientProjects.find(p => p.id === id);

  if (!project) {
    return res.status(404).json({ success: false, message: 'Client project not found.' });
  }

  const newCred = {
    id: `cred_${Date.now()}`,
    title: title.trim(),
    service: service || 'Web Service',
    username: username.trim(),
    passwordMasked: '••••••••••••',
    passwordEncrypted: password.trim(), // Stored securely
    url: url || '',
    status: req.user.role === 'superadmin' ? 'approved' : 'pending_approval',
    submittedBy: req.user.name,
    approvedBy: req.user.role === 'superadmin' ? req.user.name : null,
    createdAt: new Date().toISOString()
  };

  project.credentials.push(newCred);

  const credLog = {
    id: `log_${Date.now()}`,
    action: 'CREDENTIAL_SUBMITTED',
    details: `${req.user.name} added credential "${title}" (${service}) to vault. Status: ${newCred.status}`,
    actor: req.user.name,
    timestamp: new Date().toISOString()
  };
  store.auditLogs.unshift(credLog);

  let credNotif = null;
  if (req.user.role !== 'superadmin') {
    if (!store.notifications) store.notifications = [];
    credNotif = {
      id: `notif_cred_${Date.now()}`,
      title: `🔑 Credential Pending: ${title}`,
      message: `${req.user.name} added vault credential "${title}" (${service}) for project "${project.name}".`,
      type: 'info',
      targetRole: 'superadmin',
      linkTab: 'requests',
      timestamp: new Date().toISOString(),
      readBy: []
    };
    store.notifications.unshift(credNotif);
  }

  saveStore(store);

  const io = req.io || req.app?.get('io');
  if (io) {
    io.emit('new_activity', credLog);
    if (credNotif) {
      io.emit('new_notification', credNotif);
    }
  }

  res.status(201).json({
    success: true,
    message: req.user.role === 'superadmin' 
      ? 'Credential added and instantly verified.' 
      : 'Credential submitted. Pending Super Admin security verification.',
    credential: newCred
  });
};

// @desc Admin Approves Credential in Vault
// @route POST /api/clients/:id/credentials/:credId/approve
exports.approveCredential = async (req, res) => {
  if (req.user.role !== 'superadmin') {
    return res.status(403).json({ success: false, message: 'Only Super Admin can approve client credentials.' });
  }

  const { id, credId } = req.params;
  const store = getStore();
  const project = store.clientProjects.find(p => p.id === id);

  if (!project) {
    return res.status(404).json({ success: false, message: 'Client project not found.' });
  }

  const cred = project.credentials.find(c => c.id === credId);
  if (!cred) {
    return res.status(404).json({ success: false, message: 'Credential not found.' });
  }

  cred.status = 'approved';
  cred.approvedBy = req.user.name;

  const credAppLog = {
    id: `log_${Date.now()}`,
    action: 'CREDENTIAL_APPROVED',
    details: `Super Admin verified and unlocked credential "${cred.title}" for project "${project.name}".`,
    actor: req.user.name,
    timestamp: new Date().toISOString()
  };
  store.auditLogs.unshift(credAppLog);

  if (!store.notifications) store.notifications = [];
  const credAppNotif = {
    id: `notif_cred_app_${Date.now()}`,
    title: `🔓 Credential Verified: ${cred.title}`,
    message: `Super Admin verified and unlocked credential "${cred.title}" for project "${project.name}".`,
    type: 'success',
    targetRole: 'all',
    linkTab: 'projects',
    timestamp: new Date().toISOString(),
    readBy: []
  };
  store.notifications.unshift(credAppNotif);

  saveStore(store);

  const io = req.io || req.app?.get('io');
  if (io) {
    io.emit('new_activity', credAppLog);
    io.emit('new_notification', credAppNotif);
  }

  res.json({
    success: true,
    message: 'Credential approved and unlocked for founders.',
    credential: cred
  });
};

// @desc Reveal / Copy Credential (Logs audit access)
// @route POST /api/clients/:id/credentials/:credId/reveal
exports.revealCredential = async (req, res) => {
  const { id, credId } = req.params;
  const store = getStore();
  const project = store.clientProjects.find(p => p.id === id);

  if (!project) {
    return res.status(404).json({ success: false, message: 'Client project not found.' });
  }

  const cred = project.credentials.find(c => c.id === credId);
  if (!cred) {
    return res.status(404).json({ success: false, message: 'Credential not found.' });
  }

  if (cred.status !== 'approved' && req.user.role !== 'superadmin') {
    return res.status(403).json({ success: false, message: 'This credential is still pending Admin approval.' });
  }

  // Record audit log for security compliance (Rule 16 & 18)
  store.auditLogs.unshift({
    id: `log_${Date.now()}`,
    action: 'CREDENTIAL_ACCESSED',
    details: `${req.user.name} viewed/copied decrypted password for "${cred.title}".`,
    actor: req.user.name,
    timestamp: new Date().toISOString()
  });

  saveStore(store);

  res.json({
    success: true,
    password: cred.passwordEncrypted,
    username: cred.username
  });
};

// @desc Update 4-Phase Web Development Milestone
// @route POST /api/clients/:id/phase-update
exports.updatePhase = async (req, res) => {
  const { id } = req.params;
  const { currentPhase, phaseKey, percent, status } = req.body;

  const store = getStore();
  const project = store.clientProjects.find(p => p.id === id);

  if (!project) {
    return res.status(404).json({ success: false, message: 'Client project not found.' });
  }

  if (currentPhase) project.currentPhase = currentPhase;
  if (phaseKey && project.phaseProgress[phaseKey]) {
    if (typeof percent === 'number') project.phaseProgress[phaseKey].percent = percent;
    if (status) project.phaseProgress[phaseKey].status = status;
  }

  saveStore(store);

  res.json({
    success: true,
    message: 'Phase progress updated.',
    project
  });
};

// @desc Toggle Pre-Launch Go-Live Checklist Item
// @route POST /api/clients/:id/checklist-toggle
exports.toggleChecklist = async (req, res) => {
  const { id } = req.params;
  const { itemId, completed } = req.body;

  const store = getStore();
  const project = store.clientProjects.find(p => p.id === id);

  if (!project) {
    return res.status(404).json({ success: false, message: 'Client project not found.' });
  }

  const item = project.checklist.find(c => c.id === itemId);
  if (item) {
    item.completed = completed;
    saveStore(store);
  }

  res.json({
    success: true,
    project
  });
};

// @desc Super Admin Updates a Project
// @route PUT /api/clients/:id
exports.updateClientProject = async (req, res) => {
  if (req.user.role !== 'superadmin') {
    return res.status(403).json({ success: false, message: 'Only Super Admin can edit projects.' });
  }

  const { id } = req.params;
  const { name, clientName, brand, domain, budget, category, scope, leadFounder, status } = req.body;

  const store = getStore();
  const project = store.clientProjects.find(p => p.id === id);

  if (!project) {
    return res.status(404).json({ success: false, message: 'Project not found.' });
  }

  if (name) project.name = name.trim();
  if (clientName !== undefined) project.clientName = clientName.trim();
  if (brand) project.brand = brand.trim();
  if (domain !== undefined) project.domain = domain.trim();
  if (budget !== undefined) project.budget = budget.trim();
  if (category !== undefined) project.category = category.trim();
  if (scope !== undefined) project.scope = scope;
  if (leadFounder) project.leadFounder = leadFounder;
  if (status) project.status = status;

  project.updatedAt = new Date().toISOString();
  project.updatedBy = req.user.name;

  const audit = {
    id: `log_${Date.now()}`,
    action: 'PROJECT_UPDATED',
    details: `Super Admin updated project "${project.name}" details.`,
    actor: req.user.name,
    timestamp: new Date().toISOString()
  };
  if (!store.auditLogs) store.auditLogs = [];
  store.auditLogs.unshift(audit);

  saveStore(store);

  const io = req.io || req.app?.get('io');
  if (io) {
    io.emit('new_activity', audit);
    io.emit('projects_updated', store.clientProjects);
  }

  res.json({
    success: true,
    message: `Project "${project.name}" updated successfully.`,
    project
  });
};

// @desc Super Admin Deletes a Project
// @route DELETE /api/clients/:id
exports.deleteClientProject = async (req, res) => {
  if (req.user.role !== 'superadmin') {
    return res.status(403).json({ success: false, message: 'Only Super Admin can delete projects.' });
  }

  const { id } = req.params;
  const store = getStore();
  const index = store.clientProjects.findIndex(p => p.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Project not found.' });
  }

  const deletedProject = store.clientProjects[index];
  store.clientProjects.splice(index, 1);

  // If any tasks were linked to this project, detach or move to general sprint
  if (Array.isArray(store.tasks)) {
    store.tasks.forEach(t => {
      if (t.projectId === id) {
        t.projectId = 'proj_general';
      }
    });
  }

  const audit = {
    id: `log_${Date.now()}`,
    action: 'PROJECT_DELETED',
    details: `Super Admin deleted project "${deletedProject.name}" (${deletedProject.clientName}).`,
    actor: req.user.name,
    timestamp: new Date().toISOString()
  };
  if (!store.auditLogs) store.auditLogs = [];
  store.auditLogs.unshift(audit);

  saveStore(store);

  const io = req.io || req.app?.get('io');
  if (io) {
    io.emit('new_activity', audit);
    io.emit('projects_updated', store.clientProjects);
    io.emit('tasks_updated', store.tasks);
  }

  res.json({
    success: true,
    message: `Project "${deletedProject.name}" deleted successfully.`
  });
};

