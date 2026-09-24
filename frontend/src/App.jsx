import React, { useState, useEffect } from 'react';
import { PortalProvider, usePortal } from './context/PortalContext';
import { HeaderBar } from './components/layout/HeaderBar';
import { DesktopSidebar } from './components/layout/DesktopSidebar';
import { MobileDock } from './components/layout/MobileDock';
import { MeetingBanner } from './components/layout/MeetingBanner';
import { DashboardView } from './components/dashboard/DashboardView';
import { TaskListView } from './components/tasks/TaskListView';
import { TaskDetailModal } from './components/tasks/TaskDetailModal';
import { TaskCreateModal } from './components/tasks/TaskCreateModal';
import { TaskTransferModal } from './components/tasks/TaskTransferModal';
import { AdminProofReview } from './components/tasks/AdminProofReview';
import { ClientHubView } from './components/client/ClientHubView';
import { ClientVaultModal } from './components/client/ClientVaultModal';
import { NewClientModal } from './components/client/NewClientModal';
import { TeamChatView } from './components/chat/TeamChatView';
import { RulesBookView } from './components/rules/RulesBookView';
import { RequestsView } from './components/requests/RequestsView';
import { AdminCommandView } from './components/admin/AdminCommandView';
import { ProfileView } from './components/profile/ProfileView';
import { MeetingsView } from './components/meeting/MeetingsView';
import { ComingSoonModal } from './components/auth/ComingSoonModal';
import { LoginModal } from './components/auth/LoginModal';
import { OnboardingModal } from './components/auth/OnboardingModal';
import { SuspendedScreen } from './components/auth/SuspendedScreen';
import { MeetingScheduleModal } from './components/meeting/MeetingScheduleModal';
import { NotificationDrawer } from './components/notifications/NotificationDrawer';
import { StrikeAlertBanner } from './components/common/StrikeAlertBanner';
import { SplashScreen } from './components/common/SplashScreen';
import { WorkspaceTourModal } from './components/common/WorkspaceTourModal';
import { NotFoundView } from './components/common/NotFoundView';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const MainPortal = () => {
  const { 
    isBypassed, 
    isSettingsLoaded,
    isAuthenticated, 
    isSuspended, 
    mustOnboard,
    currentTab, 
    setCurrentTab,
    toastMessage,
    currentUser,
    tasks 
  } = usePortal();

  // Modal states
  const [selectedTask, setSelectedTask] = useState(null);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [createTaskProjectId, setCreateTaskProjectId] = useState(null);
  const [showTransferTask, setShowTransferTask] = useState(null);
  const [reviewProofData, setReviewProofData] = useState(null); // { task, request }
  const [vaultProject, setVaultProject] = useState(null);
  const [showNewClient, setShowNewClient] = useState(false);
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [isMeetingHostMode, setIsMeetingHostMode] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [showTour, setShowTour] = useState(false);

  // Auto-launch interactive tour on very first visit
  useEffect(() => {
    const tourCompleted = localStorage.getItem('founders_tour_completed');
    if (!tourCompleted && isAuthenticated && !mustOnboard && !isSuspended) {
      const timer = setTimeout(() => setShowTour(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, mustOnboard, isSuspended]);

  // Gate 0: Wait for initial settings check so Coming Soon never flickers on boot
  if (!isSettingsLoaded) {
    return null;
  }

  // 1. Gate 1: Coming Soon Gateway with Passcode / Admin Bypass
  if (!isBypassed) {
    return <ComingSoonModal />;
  }

  // 2. Gate 2: Authentication
  if (!isAuthenticated) {
    return <LoginModal />;
  }

  // 3. Gate 3: 2-Strike Automated Suspension Lockout Screen
  if (isSuspended) {
    return <SuspendedScreen />;
  }

  // 4. Gate 4: First-time Onboarding Wizard (Permanent Password, Avatar, Rules Briefing)
  if (mustOnboard) {
    return <OnboardingModal />;
  }

  // 5. Special Mode: 100% Full-Screen WhatsApp Chat (Dock is hidden, zero distraction)
  if (currentTab === 'chat') {
    return <TeamChatView />;
  }

  return (
    <div className="h-screen bg-slate-50 text-slate-800 flex overflow-hidden antialiased selection:bg-orange-100 selection:text-orange-950 font-sans">
      
      {/* Desktop Fixed Full-Height Glassmorphic Sidebar */}
      <DesktopSidebar />

      {/* Right Main Application Workspace */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Main Top Header Bar (Natural top navigation) */}
        <HeaderBar 
          onOpenNotifications={() => setShowNotifications(true)} 
          onStartTour={() => setShowTour(prev => !prev)}
        />

        {/* Sleek Strategic Meeting Banner (if scheduled) */}
        <MeetingBanner
          onOpenHostModal={() => {
            setIsMeetingHostMode(true);
            setShowMeetingModal(true);
          }}
          onOpenScheduleModal={() => {
            setIsMeetingHostMode(false);
            setShowMeetingModal(true);
          }}
        />

        {/* Compact & Dismissible Disciplinary Warning Banner (renders if current founder has strikes) */}
        <StrikeAlertBanner />

        {/* Central Scrollable Work Canvas - ONLY THIS AREA SCROLLS */}
        <main className="flex-1 h-full p-4 md:p-6 pb-28 md:pb-8 overflow-y-auto overflow-x-hidden">
          {currentTab === 'profile' && <ProfileView />}

          {currentTab === 'dashboard' && (
            <DashboardView
              onOpenCreateTask={() => setShowCreateTask(true)}
              onOpenNewClient={() => setShowNewClient(true)}
            />
          )}

          {currentTab === 'tasks' && (
            <TaskListView
              onSelectTask={(task) => setSelectedTask(task)}
              onOpenCreateModal={() => setShowCreateTask(true)}
            />
          )}

          {currentTab === 'projects' && (
            <ClientHubView
              onOpenVault={(project) => setVaultProject(project)}
              onOpenNewClientModal={() => setShowNewClient(true)}
              onOpenCreateTaskUnderProject={(projId) => {
                setCreateTaskProjectId(projId);
                setShowCreateTask(true);
              }}
            />
          )}

          {currentTab === 'meetings' && <MeetingsView />}

          {currentTab === 'requests' && <RequestsView />}

          {currentTab === 'rules' && <RulesBookView />}

          {currentTab === 'admin' && <AdminCommandView />}

          {![
            'profile',
            'dashboard',
            'tasks',
            'projects',
            'meetings',
            'requests',
            'rules',
            'admin'
          ].includes(currentTab) && (
            <NotFoundView onGoHome={() => setCurrentTab('dashboard')} />
          )}
        </main>
      </div>

      {/* Floating Mobile Dock with Center Plus Button & More Drawer */}
      <MobileDock 
        onOpenCreateTask={() => setShowCreateTask(true)}
        onOpenNewClient={() => setShowNewClient(true)}
        onOpenScheduleModal={() => {
          setIsMeetingHostMode(false);
          setShowMeetingModal(true);
        }}
      />

      {/* Modals & Overlays */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onOpenProofReview={(t, req) => {
            setSelectedTask(null);
            setReviewProofData({ task: t, request: req });
          }}
          onOpenTransferModal={(t) => {
            setSelectedTask(null);
            setShowTransferTask(t);
          }}
        />
      )}

      {showCreateTask && (
        <TaskCreateModal 
          initialProjectId={createTaskProjectId}
          onClose={() => {
            setShowCreateTask(false);
            setCreateTaskProjectId(null);
          }} 
        />
      )}

      {showTransferTask && (
        <TaskTransferModal
          task={showTransferTask}
          onClose={() => setShowTransferTask(null)}
        />
      )}

      {reviewProofData && (
        <AdminProofReview
          task={reviewProofData.task}
          request={reviewProofData.request}
          onClose={() => setReviewProofData(null)}
        />
      )}

      {vaultProject && (
        <ClientVaultModal
          project={vaultProject}
          onClose={() => setVaultProject(null)}
        />
      )}

      {showNewClient && (
        <NewClientModal onClose={() => setShowNewClient(false)} />
      )}

      {showMeetingModal && (
        <MeetingScheduleModal
          isHostMode={isMeetingHostMode}
          onClose={() => setShowMeetingModal(false)}
        />
      )}

      {showNotifications && (
        <NotificationDrawer onClose={() => setShowNotifications(false)} />
      )}

      {/* Interactive Website Guided Tour Modal */}
      <WorkspaceTourModal
        isOpen={showTour}
        onClose={() => setShowTour(false)}
      />

      {/* Luxury Minimalist Boot Splash Screen */}
      {showSplash && (
        <SplashScreen onFinish={() => setShowSplash(false)} />
      )}
    </div>
  );
};

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Portal Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen flex flex-col items-center justify-center p-6 bg-slate-50 text-slate-800 text-center select-none font-sans">
          <div className="max-w-md w-full p-8 rounded-3xl bg-white border border-slate-200/90 shadow-xl space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-600 mx-auto flex items-center justify-center font-bold text-2xl border border-orange-200">
              ⚡
            </div>
            <div className="space-y-1">
              <h2 className="text-base font-bold text-slate-900">Executive Workspace Recovery</h2>
              <p className="text-xs text-slate-500">
                A UI exception was intercepted safely. Your credentials and session remain intact.
              </p>
            </div>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 text-white font-bold text-xs shadow-md shadow-orange-600/20 hover:scale-[1.01] transition-all cursor-pointer"
            >
              Reload Portal
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <PortalProvider>
        <MainPortal />
        {/* Unified Executive React-Toastify Notification System permanently mounted at root */}
        <ToastContainer
          position="top-right"
          autoClose={3500}
          limit={3}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss={false}
          draggable
          pauseOnHover
          theme="light"
          toastClassName="rounded-2xl border border-slate-200/90 shadow-2xl backdrop-blur-xl font-sans"
        />
      </PortalProvider>
    </ErrorBoundary>
  );
}
