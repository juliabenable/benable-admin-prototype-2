import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppState } from '../hooks/useAppState';
import CampaignSidebar from '../components/CampaignSidebar';
import CampaignDetailContent from './CampaignDetail';

export default function Campaigns() {
  const { campaigns } = useAppState();
  const { campaignId } = useParams();
  const navigate = useNavigate();

  const liveCampaigns = campaigns.filter(c => c.status === 'live');
  const [activeCampaignId, setActiveCampaignId] = useState(
    campaignId || liveCampaigns[0]?.id || ''
  );

  useEffect(() => {
    if (campaignId) setActiveCampaignId(campaignId);
  }, [campaignId]);

  const handleSelect = (id) => {
    setActiveCampaignId(id);
    navigate(`/admin/campaigns/${id}`, { replace: true });
  };

  // Auto-select first campaign
  useEffect(() => {
    if (!campaignId && liveCampaigns.length > 0) {
      navigate(`/admin/campaigns/${liveCampaigns[0].id}`, { replace: true });
    }
  }, []);

  return (
    <div style={styles.layout}>
      <CampaignSidebar activeCampaignId={activeCampaignId} onSelect={handleSelect} />
      <div style={styles.content}>
        {activeCampaignId ? (
          <CampaignDetailContent campaignId={activeCampaignId} />
        ) : (
          <div style={styles.empty}>Select a campaign from the sidebar</div>
        )}
      </div>
    </div>
  );
}

const styles = {
  layout: {
    display: 'flex',
    minHeight: 'calc(100vh - 56px)',
  },
  content: {
    flex: 1,
    minWidth: 0,
    overflow: 'auto',
  },
  empty: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: 'var(--color-text-tertiary)',
    fontSize: 16,
  },
};
