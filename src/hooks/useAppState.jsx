import { createContext, useContext, useState, useCallback } from 'react';
import { MOCK_CREATORS } from '../data/mockCreators';
import { MOCK_CAMPAIGNS } from '../data/mockCampaigns';
import { DEFAULT_TIME_LIMITS } from '../utils/stageConfig';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [creators, setCreators] = useState(MOCK_CREATORS);
  const [campaigns, setCampaigns] = useState(MOCK_CAMPAIGNS);
  const [toasts, setToasts] = useState([]);
  const [settings, setSettings] = useState({
    timeLimits: { ...DEFAULT_TIME_LIMITS },
    nudgeDelay: 0,
    escalationDelay: 24,
    campaignOverrides: {},
  });
  const [activityLog, setActivityLog] = useState([
    { id: 'a1', action: 'System sent auto-nudge to Sarah Mitchell', user: 'System', date: '2026-03-23T09:00:00', creatorId: 'c1' },
    { id: 'a2', action: 'Kate approved content from Mia Johnson', user: 'Kate', date: '2026-03-22T15:30:00', creatorId: 'c6' },
    { id: 'a3', action: 'Amy Chen submitted content for review', user: 'System', date: '2026-03-24T14:00:00', creatorId: 'c3' },
  ]);

  const addToast = useCallback((message, type = 'success', undoAction = null) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type, undoAction }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const moveCreatorStage = useCallback((creatorId, newStage) => {
    setCreators(prev => {
      const creator = prev.find(c => c.id === creatorId);
      if (!creator) return prev;
      const oldStage = creator.stage;
      const updated = prev.map(c =>
        c.id === creatorId ? { ...c, stage: newStage, daysInStage: 0, isOverdue: false } : c
      );
      return updated;
    });
  }, []);

  const addNote = useCallback((creatorId, text, author = 'Kate') => {
    setCreators(prev => prev.map(c => {
      if (c.id !== creatorId) return c;
      const newNote = {
        id: `n${Date.now()}`,
        author,
        date: new Date().toISOString(),
        text,
      };
      return { ...c, notes: [newNote, ...c.notes] };
    }));
    addToast('Note added');
  }, [addToast]);

  const addEmail = useCallback((creatorId, subject, type = 'manual') => {
    setCreators(prev => prev.map(c => {
      if (c.id !== creatorId) return c;
      const newEmail = {
        id: `e${Date.now()}`,
        subject,
        date: new Date().toISOString(),
        sentBy: 'collabs@benable.com',
        type,
      };
      return { ...c, emails: [newEmail, ...c.emails] };
    }));
  }, []);

  const logActivity = useCallback((action, user = 'Kate', creatorId = null) => {
    setActivityLog(prev => [{
      id: `a${Date.now()}`,
      action,
      user,
      date: new Date().toISOString(),
      creatorId,
    }, ...prev]);
  }, []);

  const importCreators = useCallback((newCreators, campaignId) => {
    setCreators(prev => [...prev, ...newCreators.map((c, i) => ({
      ...c,
      id: `c_import_${Date.now()}_${i}`,
      campaignId,
      stage: 'not_in_program',
      daysInStage: 0,
      isOverdue: false,
      notes: [],
      emails: [],
      campaignsCompleted: 0,
      usedBefore: false,
      shopMyLtk: 'unknown',
      flaggedBefore: false,
    }))]);
  }, []);

  const approveContent = useCallback((creatorId) => {
    moveCreatorStage(creatorId, 'content_approved');
    logActivity(`Approved content from ${creators.find(c => c.id === creatorId)?.name}`, 'Kate', creatorId);
    addToast('Content approved! Creator notified to post.');
  }, [moveCreatorStage, logActivity, addToast, creators]);

  const archiveCampaign = useCallback((campaignId) => {
    setCampaigns(prev => prev.map(c =>
      c.id === campaignId ? { ...c, status: 'archived' } : c
    ));
    const camp = campaigns.find(c => c.id === campaignId);
    addToast(`${camp?.name || 'Campaign'} archived`);
    logActivity(`Archived campaign ${camp?.name}`, 'Kate');
  }, [campaigns, addToast, logActivity]);

  const unarchiveCampaign = useCallback((campaignId) => {
    setCampaigns(prev => prev.map(c =>
      c.id === campaignId ? { ...c, status: 'live' } : c
    ));
    const camp = campaigns.find(c => c.id === campaignId);
    addToast(`${camp?.name || 'Campaign'} restored`);
  }, [campaigns, addToast]);

  const rejectContent = useCallback((creatorId, feedback) => {
    // V3: Creator stays in current stage — no backwards move. Feedback sent, creator posts live.
    const creator = creators.find(c => c.id === creatorId);
    logActivity(`Sent feedback to ${creator?.name}: "${feedback.substring(0, 60)}"`, 'Kate', creatorId);
    addEmail(creatorId, `Content Feedback — ${feedback.substring(0, 40)}...`, 'automated');
    addToast(`Feedback sent to ${creator?.name}. Creator stays in current stage.`, 'info');
  }, [logActivity, addEmail, addToast, creators]);

  const value = {
    creators,
    setCreators,
    campaigns,
    toasts,
    addToast,
    removeToast,
    settings,
    setSettings,
    activityLog,
    moveCreatorStage,
    addNote,
    addEmail,
    logActivity,
    importCreators,
    approveContent,
    rejectContent,
    archiveCampaign,
    unarchiveCampaign,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppState() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppState must be used within AppProvider');
  return ctx;
}
