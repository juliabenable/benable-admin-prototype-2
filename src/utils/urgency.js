/**
 * 4-state urgency system for creator cards.
 * OVERDUE → DUE_SOON → ON_TRACK → DONE
 */

const DONE_STAGES = ['completed', 'denied', 'declined_campaign'];
const DUE_SOON_THRESHOLD_HOURS = 48;

export function getUrgencyState(creator) {
  // DONE: completed or denied
  if (DONE_STAGES.includes(creator.stage)) {
    return {
      state: 'done',
      actionText: creator.stage === 'completed'
        ? `Delivered Mar ${20 + (creator.daysInStage || 0)}`
        : creator.stage === 'declined_campaign'
        ? 'Declined this campaign'
        : 'Not selected',
    };
  }

  // OVERDUE: isOverdue flag from data
  if (creator.isOverdue) {
    const days = creator.daysInStage || 1;
    return {
      state: 'overdue',
      actionText: `${getOverdueLabel(creator.stage)} overdue by ${days} ${days === 1 ? 'day' : 'days'}`,
    };
  }

  // DUE SOON: within 48h of expected transition (daysInStage >= 2 and not overdue)
  // Approximate: if daysInStage >= 2 for stages that have time limits
  const dueSoonStages = ['invited_to_program', 'in_program', 'invited_to_campaign', 'waiting_for_content', 'content_submitted', 'content_approved'];
  if (dueSoonStages.includes(creator.stage) && creator.daysInStage >= 2) {
    return {
      state: 'due_soon',
      actionText: getDueSoonLabel(creator.stage),
    };
  }

  // ON TRACK: everything else
  return {
    state: 'on_track',
    actionText: getOnTrackLabel(creator.stage, creator.daysInStage),
  };
}

function getOverdueLabel(stage) {
  const map = {
    invited_to_program: 'Program invite response',
    in_program: 'Campaign readiness',
    invited_to_campaign: 'Campaign invite response',
    accepted_campaign: 'Product selection',
    assigned_to_campaign: 'Assignment',
    products_chosen: 'Order confirmation',
    products_ordered: 'Delivery',
    products_received: 'Confirmation',
    waiting_for_content: 'Content',
    content_submitted: 'Review',
    content_approved: 'Posting',
    posted: 'Verification',
  };
  return map[stage] || 'Action';
}

function getDueSoonLabel(stage) {
  const map = {
    invited_to_program: 'Program response due soon',
    in_program: 'Campaign invite due soon',
    invited_to_campaign: 'Campaign response due soon',
    waiting_for_content: 'Content due soon',
    content_submitted: 'Review needed soon',
    content_approved: 'Post due soon',
  };
  return map[stage] || 'Due soon';
}

function getOnTrackLabel(stage, days) {
  const stageLabels = {
    not_in_program: 'Ready for review',
    invited_to_program: `Waiting for program response · ${days}d`,
    in_program: `Active creator · ${days}d`,
    invited_to_campaign: `Waiting for campaign response · ${days}d`,
    accepted_campaign: `Ready for products · ${days}d`,
    declined_campaign: 'Declined this campaign',
    assigned_to_campaign: `Visible to brand · ${days}d`,
    products_chosen: `Products selected · ${days}d`,
    products_ordered: `In transit · ${days}d`,
    products_received: `Products delivered · ${days}d`,
    waiting_for_content: `Creating content · ${days}d`,
    content_submitted: 'Awaiting review',
    content_approved: `Cleared to post · ${days}d`,
    posted: `Live — verifying · ${days}d`,
  };
  return stageLabels[stage] || `${days}d in stage`;
}

/**
 * Returns style properties for a card based on urgency state.
 * Used in both Kanban tiles and list rows.
 */
export function getUrgencyCardStyles(urgencyState, isKanban = true) {
  const wash = isKanban ? 'wash' : 'wash-row';

  switch (urgencyState) {
    case 'overdue':
      return {
        background: isKanban ? 'var(--overdue-wash)' : 'var(--overdue-wash-row)',
        boxShadow: 'inset 4px 0 0 var(--overdue-border)',
      };
    case 'due_soon':
      return {
        background: isKanban ? 'var(--due-soon-wash)' : 'var(--due-soon-wash-row)',
      };
    case 'done':
      return {
        opacity: 0.45,
      };
    default:
      return {};
  }
}
