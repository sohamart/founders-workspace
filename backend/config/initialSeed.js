const bcrypt = require('bcryptjs');

// Pre-computed salted bcrypt hashes for default password 'password123'
const defaultPasswordHash = bcrypt.hashSync('password123', 10);
const adminPasswordHash = bcrypt.hashSync('Admin12345', 10);

const initialUsers = [
  {
    id: 'user_admin_01',
    name: 'Soham Dutta',
    email: 'sohamduttabwn@gmail.com',
    role: 'superadmin',
    designation: 'Managing Partner & Lead Admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
    phone: '+91 98765 43210',
    status: 'active',
    strikes: 0,
    strikeHistory: [],
    mustChangePassword: false,
    isOnboarded: true,
    passwordHash: adminPasswordHash,
    createdAt: '2026-09-19T00:00:00.000Z'
  },
  {
    id: 'user_founder_01',
    name: 'Soham Dutta',
    email: 'soham@weblets.bond',
    role: 'founder',
    designation: 'Product & System Architecture',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
    phone: '+91 91234 56789',
    status: 'active',
    strikes: 0,
    strikeHistory: [],
    mustChangePassword: false,
    isOnboarded: true,
    signature: {
      signed: true,
      signatureData: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60"><text x="10" y="35" font-family="cursive" font-size="24" fill="%230f172a">Soham Dutta</text></svg>',
      date: '19/09/2026',
      hash: 'SHA:EB252D6DB80ACD1D'
    },
    passwordHash: defaultPasswordHash,
    createdAt: '2026-09-19T00:00:00.000Z'
  },
  {
    id: 'user_founder_02',
    name: 'Sayantan Ghosh',
    email: 'sayantan@weblets.bond',
    role: 'founder',
    designation: 'UI/UX & Creative Direction',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80',
    phone: '+91 92345 67890',
    status: 'active',
    strikes: 0,
    strikeHistory: [],
    mustChangePassword: false,
    isOnboarded: true,
    signature: {
      signed: true,
      signatureData: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60"><text x="10" y="35" font-family="cursive" font-size="24" fill="%230f172a">Sayantan Ghosh</text></svg>',
      date: '19/09/2026',
      hash: 'SHA:D842F180306CB863'
    },
    passwordHash: defaultPasswordHash,
    createdAt: '2026-09-19T00:00:00.000Z'
  },
  {
    id: 'user_founder_03',
    name: 'Achinta Bej',
    email: 'achinta@weblets.bond',
    role: 'founder',
    designation: 'Client Handling & Growth',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=250&q=80',
    phone: '+91 93456 78901',
    status: 'active',
    strikes: 0,
    strikeHistory: [],
    mustChangePassword: false,
    isOnboarded: true,
    signature: {
      signed: true,
      signatureData: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60"><text x="10" y="35" font-family="cursive" font-size="24" fill="%230f172a">Achinta Bej</text></svg>',
      date: '21/09/2026',
      hash: 'SHA:8B9E4B44CDB3C088'
    },
    passwordHash: defaultPasswordHash,
    createdAt: '2026-09-19T00:00:00.000Z'
  }
];

const initialRules = [
  // Chapter 1: Operational Baseline
  {
    number: '01',
    title: 'Meeting Attendance',
    tagline: 'BE ON TIME. ALWAYS.',
    chapter: 'Operational Baseline',
    points: [
      'Every founder must attend all scheduled meetings on time.',
      'If you are unable to attend, you must inform the team in advance with a valid reason.',
      'Joining late (even 5–10 minutes) without prior intimation is unacceptable.',
      'Meeting host\'s instructions must be followed by all.'
    ],
    warning: 'Unnotified absence or repeated lateness may lead to serious action, including removal from the company.'
  },
  {
    number: '02',
    title: 'Communication & Calls',
    tagline: 'STAY RESPONDING.',
    chapter: 'Operational Baseline',
    points: [
      'If a founder cannot answer an important company call, they must inform the team by message as soon as possible.',
      'Ignoring important calls or messages repeatedly without a valid reason is strictly prohibited.',
      'All communication must be professional and respectful.'
    ],
    warning: 'Repeatedly ignoring important calls or messages may lead to immediate disciplinary action.'
  },
  {
    number: '03',
    title: 'Tasks & Deadlines',
    tagline: 'DELIVER WHAT YOU COMMIT.',
    chapter: 'Operational Baseline',
    points: [
      'Every founder must complete and submit assigned tasks within the agreed deadline.',
      'If you expect any delay, you must inform the team before the deadline.',
      'Abandoning tasks or missing deadlines without communication is strictly prohibited.',
      'Provide regular updates on task progress in the workspace portal.'
    ],
    warning: 'Tasks not completed or deadlines missed without prior communication may lead to removal from the company.'
  },
  {
    number: '04',
    title: 'Responsibility & Discipline',
    tagline: 'ACT LIKE A FOUNDER.',
    chapter: 'Operational Baseline',
    points: [
      'Every founder must actively contribute to the company.',
      'Maintain professionalism, honesty and discipline at all times.',
      'Respect all other founders, their ideas and opinions.',
      'Work towards the growth of Weblets and StackAdda, not personal gains.'
    ],
    warning: 'Unprofessional behaviour, lack of contribution or disrespect may lead to serious action.'
  },
  {
    number: '05',
    title: 'Active Workspace Presence',
    tagline: 'BE ACTIVE. STAY UPDATED.',
    chapter: 'Operational Baseline',
    points: [
      'Every founder must be active daily on the company workspace portal.',
      'Give daily updates on your work, progress, issues and plans.',
      'Check announcements, tasks and messages regularly.',
      'In case of any problem, inform immediately and take help from other team members to get the work done.'
    ],
    warning: 'Not being active or not giving updates regularly will be considered a serious violation.'
  },

  // Chapter 2: Host Ownership & Logistics
  {
    number: '06',
    title: 'Meeting Host Responsibility',
    tagline: 'FULL OWNERSHIP. NO EXCUSES.',
    chapter: 'Host Ownership & Logistics',
    points: [
      'The person responsible for hosting the meeting must handle everything (end-to-end).',
      'They must schedule, send the meeting link, set the agenda and ensure everyone attends on time.',
      'No last-minute confusion or mismanagement is allowed.',
      'All founders must join on time. Being 5–10 minutes late is not acceptable.',
      'If the host faces an issue, they must arrange an alternative solution immediately.'
    ],
    warning: 'No excuses like "network issue", "forgot", or "was busy". If you are the meeting host, you are fully responsible.'
  },
  {
    number: '07',
    title: 'Internet & Connectivity',
    tagline: 'BE PREPARED. ALWAYS CONNECTED.',
    chapter: 'Host Ownership & Logistics',
    points: [
      'No excuses will be accepted for "net not working", "data finished" or similar issues.',
      'You must ensure proper internet, backup data or alternative arrangement (e.g., mobile hotspot, different network, etc.).',
      'If you are unable to join a meeting due to a genuine emergency, you must inform the team immediately before the meeting.',
      'Repeated connectivity issues will be treated as a serious violation.'
    ],
    warning: '"Net sesh", "network problem", "data nai" — these are not valid excuses. You must find a way to join.'
  },
  {
    number: '08',
    title: 'Problem Solving & Escalation',
    tagline: 'INFORM IMMEDIATELY. SEEK HELP.',
    chapter: 'Host Ownership & Logistics',
    points: [
      'If you face any problem while working on a project or task, inform the other founders immediately.',
      'You must seek help from other team members and get the work done.',
      'Do not keep problems to yourself or remain inactive.',
      'If you are genuinely stuck, it is your responsibility to follow up and learn the update from other team members. Others are not obligated to inform you.'
    ],
    warning: 'Keeping problems hidden, staying silent or becoming inactive is not acceptable and may lead to removal from the company.'
  },
  {
    number: '09',
    title: 'Domain Purchase & Shared Expenses',
    tagline: 'SHARED INVESTMENT. EQUAL CONTRIBUTION.',
    chapter: 'Host Ownership & Logistics',
    points: [
      'Whenever a new domain needs to be purchased or renewed (e.g., weblets.bond, stackadda.me or any other), the cost must be split equally among all three founders.',
      'No founder can refuse payment or give excuses like "I don\'t have money".',
      'All agreed company expenses (domains, tools, hosting, software, etc.) must be shared equally unless decided otherwise in writing by all three.',
      'Timely contribution is mandatory.'
    ],
    warning: 'Not contributing financially or delaying payment without a valid reason is a serious violation.'
  },
  {
    number: '10',
    title: 'Confidentiality & Company Assets',
    tagline: 'PROTECT OUR COMPANY.',
    chapter: 'Host Ownership & Logistics',
    points: [
      'All ideas, discussions, documents, code, designs, client information and strategies are strictly confidential.',
      'You must not share any company-related information with anyone outside the company without approval from all three founders.',
      'All accounts, domains, social media, code repositories and company assets belong to the company, not to any individual founder.',
      'Misuse or leakage of confidential information may lead to immediate removal and legal action if required.'
    ],
    warning: 'Sharing confidential information, giving unauthorized access or personal use of company assets is strictly prohibited.'
  },

  // Chapter 3: Team Governance & Decisions
  {
    number: '11',
    title: 'Team Collaboration & Mutual Support',
    tagline: 'WE GROW TOGETHER.',
    chapter: 'Team Governance & Decisions',
    points: [
      'Every founder must support each other whenever required.',
      'Share knowledge, resources and updates openly.',
      'Avoid working in isolation. Take help from other founders or team members.',
      'Success is a team effort — no ego, no competition within the founding team.'
    ],
    warning: 'Not helping team members, hiding information or working against the team is a serious violation.'
  },
  {
    number: '12',
    title: 'Decision Making',
    tagline: 'DISCUSS. ANALYSE. DECIDE TOGETHER.',
    chapter: 'Team Governance & Decisions',
    points: [
      'Major decisions related to company direction, finance, product, hiring, partnerships or brand must be discussed with all three founders.',
      'Decisions should be taken after open discussion, considering all opinions.',
      'No founder can make major commitments on behalf of the company alone without consent from the other two (except in pre-approved emergency cases).'
    ],
    warning: 'Taking major decisions alone without discussion is strictly prohibited and may lead to removal.'
  },
  {
    number: '13',
    title: 'Conflict Resolution',
    tagline: 'RESPECT DIFFERENCES. FIND SOLUTIONS.',
    chapter: 'Team Governance & Decisions',
    points: [
      'In case of any disagreement or conflict, all founders must discuss the issue calmly and respectfully.',
      'The goal is to find a fair solution, not to win an argument.',
      'Personal attacks, disrespectful behaviour or toxic communication will not be tolerated.',
      'If a resolution cannot be reached, the matter may be escalated to a neutral advisor/mentor (mutually agreed).'
    ],
    warning: 'Continuous conflicts, toxic behaviour or intentional disruption may lead to removal from the company.'
  },
  {
    number: '14',
    title: 'Performance, Contribution & Review',
    tagline: 'CONSISTENT EFFORT. MEASURABLE IMPACT.',
    chapter: 'Team Governance & Decisions',
    points: [
      'Every founder must continuously contribute to the company\'s growth.',
      'Regular review of each founder\'s contribution may be conducted (e.g., monthly/quarterly).',
      'Lack of contribution, inactivity or repeated underperformance without valid reason is not acceptable.',
      'Each founder should take ownership and deliver results in their respective areas.'
    ],
    warning: 'Being inactive, non-performing or not contributing meaningfully may lead to a formal warning or direct removal.'
  },
  {
    number: '15',
    title: 'Company Reputation & Conduct',
    tagline: 'YOU REPRESENT WEBLETS & STACKADDA.',
    chapter: 'Team Governance & Decisions',
    points: [
      'Every founder must maintain a professional image and behaviour in all online and offline platforms.',
      'Do not make any public statements, posts or commitments that can harm the company\'s reputation.',
      'Maintain honesty, integrity and respect in all professional and personal interactions.',
      'Follow all legal and ethical practices.'
    ],
    warning: 'Any action that damages the brand reputation or brings legal/financial risk to the company will be treated as a serious violation.'
  },

  // Chapter 4: Assets, Security & Finances
  {
    number: '16',
    title: 'Company Devices & Access',
    tagline: 'USE RESPONSIBLY. KEEP IT SECURE.',
    chapter: 'Assets, Security & Finances',
    points: [
      'Use company devices, accounts and tools only for work-related purposes.',
      'Do not share login credentials with anyone, including other founders without valid reason.',
      'Keep all passwords secure and enable two-factor authentication (2FA).',
      'Any misuse, negligence or data breach must be reported immediately.',
      'Do not install unverified software or access unsafe websites.'
    ],
    warning: 'Sharing credentials, misusing devices or causing a security breach may lead to immediate suspension or removal from the company.'
  },
  {
    number: '17',
    title: 'Intellectual Property',
    tagline: 'OUR IDEAS. OUR ASSETS.',
    chapter: 'Assets, Security & Finances',
    points: [
      'All ideas, designs, code, content, branding and creative work developed for Weblets or StackAdda belong to the company.',
      'Do not use company intellectual property for personal projects or outside business without written consent from all three founders.',
      'Give proper credit within the team.',
      'Even after leaving the company, you must not use any company IP.'
    ],
    warning: 'Using company ideas, code, designs or content for personal gain may lead to legal action and permanent ban from all company projects.'
  },
  {
    number: '18',
    title: 'Data Security & Privacy',
    tagline: 'PROTECT WHAT MATTERS.',
    chapter: 'Assets, Security & Finances',
    points: [
      'Keep all client, user and company data confidential and secure.',
      'Do not share sensitive data outside the company.',
      'Use secure platforms for file storage and communication.',
      'Follow best practices for data backup and access control.',
      'Any data leak due to carelessness or intentional action will be treated as a serious violation.'
    ],
    warning: 'Leaking, sharing or misusing sensitive data may lead to immediate removal and legal action, depending on the severity.'
  },
  {
    number: '19',
    title: 'Financial Management',
    tagline: 'BE TRANSPARENT. BE ACCOUNTABLE.',
    chapter: 'Assets, Security & Finances',
    points: [
      'All income, payments, investments and expenses must be recorded clearly.',
      'Major financial decisions must be discussed and approved by all three founders.',
      'Maintain transparency in revenue, client payments and shared expenses.',
      'Personal withdrawals from company funds are strictly prohibited.',
      'Regular financial reports should be shared with all founders.'
    ],
    warning: 'Hiding transactions, misusing funds or making payments without approval may lead to immediate removal and legal action.'
  },
  {
    number: '20',
    title: 'Exit, Inactivity & Removal',
    tagline: 'COMMITMENT MATTERS.',
    chapter: 'Assets, Security & Finances',
    points: [
      'If a founder wishes to leave, a written notice (minimum 30 days) must be given.',
      'All ongoing work, accounts and access must be properly handed over.',
      'Long-term inactivity (without valid reason) may lead to removal.',
      'The remaining founders have the right to remove a founder for violation of rules, misconduct or harm to the company.',
      'Any founder leaving the company must not use the company\'s name, brand, assets or data afterward.'
    ],
    warning: 'Leaving without notice, refusing to hand over work, or misusing company assets after exit may lead to legal action and permanent ban from all company initiatives.'
  },

  // Chapter 5: Client & Brand Excellence
  {
    number: '21',
    title: 'Client Handling & Professionalism',
    tagline: 'CLIENTS ARE OUR PRIORITY.',
    chapter: 'Client & Brand Excellence',
    points: [
      'All client communication must be professional, polite and clear.',
      'Do not make false promises to clients.',
      'Major commitments (pricing, deadlines, features) must be discussed with all three founders before confirmation.',
      'Any client issue, complaint or refund request must be informed immediately.',
      'Maintain long-term relationships and provide quality work.'
    ],
    warning: 'Giving false information to a client, misbehaving or handling clients independently for personal benefit is a serious violation and may lead to removal.'
  },
  {
    number: '22',
    title: 'Marketing, Branding & Public Communication',
    tagline: 'ONE VOICE. ONE BRAND.',
    chapter: 'Client & Brand Excellence',
    points: [
      'All public posts, advertisements, brand collaborations or media interactions must be aligned with the company\'s vision.',
      'Do not post anything related to Weblets or StackAdda without mutual agreement.',
      'Maintain consistency in branding, messaging and design.',
      'Avoid controversial, offensive or misleading content.',
      'All official social media accounts must be accessible to all three founders.'
    ],
    warning: 'Posting misleading information or unauthorized content on behalf of the company may lead to immediate disciplinary action or removal.'
  },
  {
    number: '23',
    title: 'Project Management & Delivery',
    tagline: 'PLAN. EXECUTE. DELIVER.',
    chapter: 'Client & Brand Excellence',
    points: [
      'All projects must be properly planned, tracked and updated in the workspace portal.',
      'Ensure quality, timely delivery and client satisfaction.',
      'Regularly update task status, progress and blockers.',
      'Do not take on projects beyond our capacity without discussion.',
      'Learn from mistakes and continuously improve our processes.'
    ],
    warning: 'Deliberate delays, poor quality work or taking on projects without approval may lead to financial loss and disciplinary action.'
  },
  {
    number: '24',
    title: 'Partnerships, Collaborations & Opportunities',
    tagline: 'GROW TOGETHER. SHARE FAIRLY.',
    chapter: 'Client & Brand Excellence',
    points: [
      'Any partnership, collaboration or business opportunity related to Weblets or StackAdda must be discussed with all three founders.',
      'Do not enter into any agreement, contract or commitment on behalf of the company alone.',
      'Share all potential opportunities, even if you are not directly handling them.',
      'Evaluate pros and cons together before making a decision.',
      'Give proper credit and ensure fair benefit distribution.'
    ],
    warning: 'Hiding a business opportunity or making personal deals using the company\'s name is a serious violation and may lead to removal.'
  },
  {
    number: '25',
    title: 'Continuous Learning & Self-Development',
    tagline: 'BETTER FOUNDERS. BIGGER FUTURE.',
    chapter: 'Client & Brand Excellence',
    points: [
      'Every founder must keep learning and improving their skills.',
      'Share useful resources, tools, ideas and knowledge with the team.',
      'Apply what you learn to improve the company\'s products, services and operations.',
      'Support each other\'s growth and encourage a learning culture.',
      'Set personal goals and contribute to the long-term vision of Weblets and StackAdda.'
    ],
    warning: 'Lack of effort to learn, adapt or improve, and resisting new ideas or technologies may slow the company\'s growth and lead to a formal warning.'
  },

  // Chapter 6: Enforcement & Warning System
  {
    number: '26',
    title: 'Rule Violation & Warning System',
    tagline: 'LEARN FROM MISTAKES. TAKE IT SERIOUSLY.',
    chapter: 'Enforcement & Warning System',
    points: [
      'If any founder violates any of these rules, they will receive a formal warning.',
      'The warning will be given in writing (on company workspace / official group).',
      'The founder must acknowledge the warning and take immediate corrective action.',
      'Repeated similar mistakes after a warning will not be tolerated.',
      'All warnings will be recorded for internal reference.'
    ],
    warning: 'Ignoring a warning or repeating the same mistake is a serious offense and will lead to removal from the team.'
  },
  {
    number: '27',
    title: 'One Chance Policy',
    tagline: 'A WARNING ONCE. NO SECOND CHANCE.',
    chapter: 'Enforcement & Warning System',
    points: [
      'Every founder will get only one formal warning for any violation.',
      'After the warning, if the same rule (or any other major rule) is violated again, the founder will be removed from the team immediately.',
      'No second warning will be given under any circumstances.',
      'This applies to all types of violations — communication, work, behaviour, commitment, inactivity, confidentiality, or any other rule.'
    ],
    warning: 'This is a one chance policy. We believe in improvement, but we also value the team\'s discipline and future.'
  },
  {
    number: '28',
    title: 'Removal from the Team',
    tagline: 'FAIR DECISION. FINAL ACTION.',
    chapter: 'Enforcement & Warning System',
    points: [
      'If a founder violates any rule again after a warning, they will be removed from Weblets and StackAdda immediately.',
      'The decision will be taken by the remaining two founders.',
      'After removal, the person will lose all access to company accounts, domains, files, tools, and communication channels.',
      'The removed person must not use the company name, brand, assets or information in any way after removal.'
    ],
    warning: 'Once removed, the person has no rights to represent, use or claim any part of Weblets or StackAdda.'
  },
  {
    number: '29',
    title: 'Post-Removal Restrictions',
    tagline: 'NO INVOLVEMENT AFTER EXIT.',
    chapter: 'Enforcement & Warning System',
    points: [
      'A removed founder must not contact clients, partners or team members on behalf of the company.',
      'They must not access, copy, share or use any company data, source code, designs, documents or strategies.',
      'They must not create a similar brand, website or project using company knowledge or resources.',
      'If any violation is found, the remaining founders may take necessary action to protect the company.'
    ],
    warning: 'Misusing company assets or information after removal is a serious violation and may lead to legal action if required.'
  },
  {
    number: '30',
    title: 'Our Commitment',
    tagline: 'DISCIPLINE TODAY. A BIGGER TOMORROW.',
    chapter: 'Enforcement & Warning System',
    points: [
      'We follow these rules to build a strong, honest and successful future together.',
      'This is not just a business, it\'s a shared dream.',
      'We respect each other, our time, our work and our commitment.',
      'By following these rules, we ensure a positive, productive and long-term journey for Weblets and StackAdda.'
    ],
    warning: 'Together we can build something great. Rules are not to limit us, but to protect our vision.'
  }
];

const initialAdminRatification = {
  quote: "I, Lead Admin, hereby ratify, execute and officially enforce the Founders' Strict Rules & Agreement (Version 2.0) across Weblets and StackAdda.",
  ratifiedBy: "SSA TEAM",
  date: "21/09/2026",
  sealType: "gold_crest", // gold_crest | dual_brand | protocol
  signatureText: "SSA TEAM EXECUTIVE SEAL",
  verified: true
};

const initialClientProjects = [
  {
    id: 'proj_01',
    name: 'Apex Health Telemed Platform',
    clientName: 'Apex Health Care Inc.',
    brand: 'Weblets®',
    domain: 'preview.weblets.bond/apexhealth',
    status: 'in_progress',
    budget: '$3,800',
    currentPhase: 2, // 1: Wireframe, 2: Frontend, 3: Backend/CMS, 4: QA/Launch
    phaseProgress: {
      phase1: { name: 'Wireframing & UI/UX', status: 'completed', percent: 100, lead: 'Sayantan Ghosh' },
      phase2: { name: 'Frontend & Dynamic Motion', status: 'in_progress', percent: 65, lead: 'Soham Dutta' },
      phase3: { name: 'Backend, CMS & Integration', status: 'pending', percent: 20, lead: 'Soham Dutta' },
      phase4: { name: 'Client QA, Testing & Handover', status: 'pending', percent: 0, lead: 'Achinta Bej' }
    },
    payments: {
      total: '$3,800',
      milestone1: { title: '50% Initial Advance', amount: '$1,900', status: 'paid', date: '15/09/2026' },
      milestone2: { title: '25% Mid-Development', amount: '$950', status: 'pending', date: '30/09/2026' },
      milestone3: { title: '25% Final Delivery', amount: '$950', status: 'locked', date: '15/10/2026' }
    },
    credentials: [
      {
        id: 'cred_01',
        title: 'Production cPanel Login',
        service: 'cPanel Hostinger',
        username: 'apex_admin',
        passwordMasked: '••••••••••••',
        passwordEncrypted: 'cPanel#Apex2026!Sec',
        url: 'https://cpanel.apexhealthcare.com:2083',
        status: 'approved', // pending_approval | approved
        submittedBy: 'Achinta Bej',
        approvedBy: 'SSA TEAM Lead Admin'
      },
      {
        id: 'cred_02',
        title: 'Stripe Gateway Live API Keys',
        service: 'Stripe Payment Gateway',
        username: 'pk_live_51M...',
        passwordMasked: '••••••••••••',
        passwordEncrypted: 'sk_live_51M891xP0923!',
        url: 'https://dashboard.stripe.com',
        status: 'approved',
        submittedBy: 'Soham Dutta',
        approvedBy: 'SSA TEAM Lead Admin'
      }
    ],
    checklist: [
      { id: 'chk_1', text: 'SSL / HTTPS Certificate Verified Active', completed: true },
      { id: 'chk_2', text: 'Mobile & Tablet Responsive Audit Passed (375px to 1440px)', completed: true },
      { id: 'chk_3', text: 'SEO Meta Tags, OpenGraph & Brand Favicon Configured', completed: false },
      { id: 'chk_4', text: 'Contact & Booking Forms Testing OK', completed: false },
      { id: 'chk_5', text: 'Admin Handover Documentation Prepared', completed: false }
    ],
    revisions: [
      { round: 1, title: 'Hero Section Typography & Color Tweaks', requestedBy: 'Dr. Robert (Client)', status: 'resolved' },
      { round: 2, title: 'Add Live Doctor Availability Widget', requestedBy: 'Dr. Robert (Client)', status: 'in_progress' }
    ],
    createdAt: '2026-09-12T10:00:00.000Z'
  },
  {
    id: 'proj_02',
    name: 'UrbanCraft Luxury Architecture',
    clientName: 'UrbanCraft Studios',
    brand: 'StackAdda™',
    domain: 'urbancraft.stackadda.me',
    status: 'in_progress',
    budget: '$2,400',
    currentPhase: 1,
    phaseProgress: {
      phase1: { name: 'Wireframing & UI/UX', status: 'in_progress', percent: 80, lead: 'Sayantan Ghosh' },
      phase2: { name: 'Frontend & Dynamic Motion', status: 'pending', percent: 0, lead: 'Soham Dutta' },
      phase3: { name: 'Backend, CMS & Integration', status: 'pending', percent: 0, lead: 'Soham Dutta' },
      phase4: { name: 'Client QA, Testing & Handover', status: 'pending', percent: 0, lead: 'Achinta Bej' }
    },
    payments: {
      total: '$2,400',
      milestone1: { title: '50% Initial Advance', amount: '$1,200', status: 'paid', date: '18/09/2026' },
      milestone2: { title: '25% Mid-Development', amount: '$600', status: 'pending', date: '05/10/2026' },
      milestone3: { title: '25% Final Delivery', amount: '$600', status: 'locked', date: '20/10/2026' }
    },
    credentials: [
      {
        id: 'cred_03',
        title: 'WordPress Admin Staging Login',
        service: 'WordPress Engine',
        username: 'urban_editor',
        passwordMasked: '••••••••••••',
        passwordEncrypted: 'Urban@Craft2026!Wp',
        url: 'https://staging.urbancraft.com/wp-admin',
        status: 'approved',
        submittedBy: 'Achinta Bej',
        approvedBy: 'SSA TEAM Lead Admin'
      }
    ],
    checklist: [
      { id: 'chk_1', text: 'SSL / HTTPS Certificate Verified Active', completed: true },
      { id: 'chk_2', text: 'Mobile & Tablet Responsive Audit Passed', completed: false },
      { id: 'chk_3', text: 'High-Res Architecture Image CDN Setup', completed: false }
    ],
    revisions: [],
    createdAt: '2026-09-18T14:30:00.000Z'
  }
];

const initialTasks = [
  {
    id: 'task_01',
    title: 'Finalize Mobile Dock Animation & Glassmorphism Spec',
    projectId: 'proj_01',
    projectName: 'Apex Health Telemed Platform',
    topic: 'UI/UX Design',
    description: 'Ensure floating frosted dock satisfies 4.5:1 light mode contrast and spring bounce physics.\nReference docs: https://weblets.bond/design-system',
    priority: 'urgent',
    assigneeType: 'single', // single | team | cloned
    assignedTo: ['user_founder_02'], // Sayantan Ghosh
    assignedBy: 'user_admin_01',
    progress: 75,
    status: 'in_progress', // todo | in_progress | review_pending | completed | blocked
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 28).toISOString(), // 28 hours from now
    isBlocked: false,
    blockerReason: '',
    referenceLinks: [
      { title: 'Figma Mobile Mockup', url: 'https://figma.com/file/weblets-dock-design', type: 'figma' },
      { title: 'Linear Mobile Dock Benchmark', url: 'https://linear.app/mobile-spec', type: 'docs' }
    ],
    checklist: [
      { id: 'tc_1', text: 'Backdrop blur 20px with subtle 1px border', completed: true },
      { id: 'tc_2', text: 'Auto-hide dock when WhatsApp chat is active', completed: true },
      { id: 'tc_3', text: 'Haptic audio toggle integration', completed: false }
    ],
    dailyUpdates: [
      {
        id: 'du_1',
        authorId: 'user_founder_02',
        authorName: 'Sayantan Ghosh',
        text: 'Polished SVG icons and spring easing curves. Contrast tested against cyan-50 background.',
        statusTag: 'Polishing Motion',
        timestamp: '2026-09-22T17:30:00.000Z',
        voiceNoteUrl: null
      }
    ],
    progressRequests: [],
    transferRequests: [],
    createdAt: '2026-09-20T10:00:00.000Z'
  },
  {
    id: 'task_02',
    title: 'Deploy Client Staging API & Webhooks Integration',
    projectId: 'proj_01',
    projectName: 'Apex Health Telemed Platform',
    topic: 'Product Architecture',
    description: 'Hook up appointment booking API with SendGrid webhook confirmations and live database sync.',
    priority: 'high',
    assigneeType: 'single',
    assignedTo: ['user_founder_01'], // Soham Dutta
    assignedBy: 'user_admin_01',
    progress: 60,
    status: 'in_progress',
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(),
    isBlocked: false,
    blockerReason: '',
    referenceLinks: [
      { title: 'GitHub Repository', url: 'https://github.com/weblets-agency/apex-api', type: 'github' },
      { title: 'Postman Collection Docs', url: 'https://documenter.getpostman.com/view/apex-endpoints', type: 'docs' }
    ],
    checklist: [
      { id: 'tc_4', text: 'Rate limiter setup for booking endpoints', completed: true },
      { id: 'tc_5', text: 'JWT middleware testing with test tokens', completed: true },
      { id: 'tc_6', text: 'SendGrid email template verification', completed: false }
    ],
    dailyUpdates: [],
    progressRequests: [],
    transferRequests: [],
    createdAt: '2026-09-21T11:00:00.000Z'
  },
  {
    id: 'task_03',
    title: 'Client Contract & Payment Milestones Clearance',
    projectId: 'proj_02',
    projectName: 'UrbanCraft Luxury Architecture',
    topic: 'Client Handling',
    description: 'Follow up with UrbanCraft team for milestone 1 bank transfer receipt verification.',
    priority: 'medium',
    assigneeType: 'single',
    assignedTo: ['user_founder_03'], // Achinta Bej
    assignedBy: 'user_admin_01',
    progress: 100,
    status: 'completed',
    deadline: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    isBlocked: false,
    blockerReason: '',
    referenceLinks: [
      { title: 'Invoice Drive Folder', url: 'https://drive.google.com/drive/folders/urbancraft-invoices', type: 'drive' }
    ],
    checklist: [
      { id: 'tc_7', text: 'Official 50% invoice generated and mailed', completed: true },
      { id: 'tc_8', text: 'Payment receipt verified by SSA TEAM Admin', completed: true }
    ],
    dailyUpdates: [],
    progressRequests: [],
    transferRequests: [],
    createdAt: '2026-09-18T15:00:00.000Z'
  }
];

const initialMeeting = {
  id: 'meet_01',
  title: 'Q3 Agency Revenue & Client Delivery Strategy Sync',
  agenda: 'Review of Apex Health Telemed deployment, UrbanCraft wireframe handover, and domain renewal budget (Rule 09).',
  status: 'scheduled', // pending_host_submission | scheduled | cancelled
  hostId: 'user_founder_01',
  hostName: 'Soham Dutta',
  hostAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
  hostDeadline: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // Submitted in time
  scheduledTime: new Date(Date.now() + 1000 * 60 * 60 * 20).toISOString(), // 20 hours from now
  meetLink: 'https://meet.google.com/ssa-weblets-sync',
  rsvpDeadline: new Date(Date.now() + 1000 * 60 * 60 * 8).toISOString(),
  attendees: [
    { userId: 'user_founder_01', name: 'Soham Dutta', status: 'confirmed', confirmedAt: '2026-09-22T20:00:00.000Z' },
    { userId: 'user_founder_02', name: 'Sayantan Ghosh', status: 'confirmed', confirmedAt: '2026-09-22T21:15:00.000Z' },
    { userId: 'user_founder_03', name: 'Achinta Bej', status: 'confirmed', confirmedAt: '2026-09-22T22:30:00.000Z' },
    { userId: 'user_admin_01', name: 'SSA TEAM Lead Admin', status: 'confirmed', confirmedAt: '2026-09-22T19:00:00.000Z' }
  ],
  isCancelled: false
};

const initialChatMessages = [
  {
    id: 'msg_01',
    senderId: 'user_admin_01',
    senderName: 'SSA TEAM Lead Admin',
    senderRole: 'superadmin',
    text: 'Welcome to the Founders Workspace for Weblets® and StackAdda™. Please review the updated Rules Charter v2.0.',
    timestamp: '2026-09-21T09:00:00.000Z',
    status: 'read', // sent | delivered | read
    voiceNote: null
  },
  {
    id: 'msg_02',
    senderId: 'user_founder_02',
    senderName: 'Sayantan Ghosh',
    senderRole: 'founder',
    text: 'Understood. I have verified and digitally signed all 30 rules on the charter canvas pad.',
    timestamp: '2026-09-21T09:12:00.000Z',
    status: 'read',
    voiceNote: null
  },
  {
    id: 'msg_03',
    senderId: 'user_founder_01',
    senderName: 'Soham Dutta',
    senderRole: 'founder',
    text: 'Working on the Apex Health Telemed API deployment. Daily progress update has been logged.',
    timestamp: '2026-09-22T14:40:00.000Z',
    status: 'read',
    voiceNote: null
  },
  {
    id: 'msg_04',
    senderId: 'user_founder_03',
    senderName: 'Achinta Bej',
    senderRole: 'founder',
    text: 'UrbanCraft initial 50% milestone payment received and verified. Moving on to client revisions.',
    timestamp: '2026-09-23T11:20:00.000Z',
    status: 'delivered',
    voiceNote: null
  }
];

const initialSharedExpenses = [
  {
    id: 'exp_01',
    title: 'Annual Domain Renewal: weblets.bond & stackadda.me',
    totalAmount: '$36.00',
    perFounderShare: '$12.00',
    dueDate: '2026-10-05',
    category: 'Domain & Hosting',
    status: 'active',
    payments: [
      { userId: 'user_founder_01', name: 'Soham Dutta', paid: true, date: '2026-09-20', receipt: 'TXN#99201A' },
      { userId: 'user_founder_02', name: 'Sayantan Ghosh', paid: true, date: '2026-09-21', receipt: 'TXN#99202B' },
      { userId: 'user_founder_03', name: 'Achinta Bej', paid: false, date: null, receipt: null }
    ]
  }
];

const initialAuditLogs = [
  {
    id: 'log_01',
    action: 'SYSTEM_BOOT',
    details: 'Founders Workspace Portal v2.0 initialized for Weblets® × StackAdda™.',
    actor: 'SYSTEM',
    timestamp: '2026-09-19T00:00:00.000Z'
  },
  {
    id: 'log_02',
    action: 'LEGAL_RATIFICATION',
    details: 'Lead Admin (SSA TEAM) executed legal ratification of Rules v2.0.',
    actor: 'SSA TEAM Lead Admin',
    timestamp: '2026-09-21T00:00:00.000Z'
  }
];

module.exports = {
  initialUsers,
  initialRules,
  initialAdminRatification,
  initialClientProjects,
  initialTasks,
  initialMeeting,
  initialChatMessages,
  initialSharedExpenses,
  initialAuditLogs
};
