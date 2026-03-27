export const EMAIL_TEMPLATES = {
  invite_reminder: {
    key: 'invite_reminder',
    label: 'Invite Reminder',
    stage: 'invited_to_program',
    subject: 'Friendly Reminder: {{campaignName}} Campaign Invite — Please respond by tomorrow',
    body: `Hi {{creatorName}},

Just a quick follow-up on our invite to join the {{campaignName}} campaign on Benable! We'd love to have you on board.

Please respond within 24 hours so we can hold your spot. If you have any questions about the campaign or what's involved, don't hesitate to reach out — we're here to help.

Looking forward to hearing from you!

Best,
The Benable Team`,
  },
  acceptance_reminder: {
    key: 'acceptance_reminder',
    label: 'Campaign Acceptance Reminder',
    stage: 'invited_to_campaign',
    subject: 'Next Step: Accept the {{campaignName}} Campaign within 48 hours',
    body: `Hi {{creatorName}},

Thanks for joining Benable! We noticed you haven't accepted the {{campaignName}} campaign yet.

Please head over to your dashboard within the next 48 hours to review the campaign details and accept. The brand is excited to work with you and we'd hate for you to miss out!

Best,
The Benable Team`,
  },
  product_selection_reminder: {
    key: 'product_selection_reminder',
    label: 'Product Selection Reminder',
    stage: 'accepted_campaign',
    subject: 'Choose Your Products for {{campaignName}} — Due within 24 hours',
    body: `Hi {{creatorName}},

Great news — you're all set for the {{campaignName}} campaign! The next step is to choose which products you'd like to receive.

Please make your selection within 24 hours so we can get your products shipped right away. Head to your campaign dashboard to browse the available options.

Best,
The Benable Team`,
  },
  content_submission_reminder: {
    key: 'content_submission_reminder',
    label: 'Content Submission Reminder',
    stage: 'waiting_for_content',
    subject: 'Your {{campaignName}} Content Is Due — Please submit within 48 hours',
    body: `Hi {{creatorName}},

We hope you're enjoying your products from {{campaignName}}! A quick reminder that your content submission is now due.

Please submit your content through your Benable dashboard within the next 48 hours. If you need any guidance on what the brand is looking for, check the campaign brief in your dashboard or reply to this email.

We can't wait to see what you create!

Best,
The Benable Team`,
  },
  content_received_reminder: {
    key: 'content_received_reminder',
    label: 'Products Received Check-in',
    stage: 'products_received',
    subject: 'Did you receive your {{campaignName}} products?',
    body: `Hi {{creatorName}},

Just checking in — our records show your {{campaignName}} products were delivered. Can you confirm you've received everything?

Once confirmed, you'll be all set to start creating your content. Please respond within 24 hours so we can keep things on track.

Best,
The Benable Team`,
  },
  general_checkin: {
    key: 'general_checkin',
    label: 'General Check-in',
    stage: null,
    subject: 'Checking In — {{campaignName}} — Response needed within 24 hours',
    body: `Hi {{creatorName}},

Just checking in on how things are going with the {{campaignName}} campaign. We'd love a quick update from you within the next 24 hours.

Is there anything we can help with? Let us know if you have any questions or need support.

Best,
The Benable Team`,
  },
};

export function getTemplatesForStage(stageKey) {
  const templates = Object.values(EMAIL_TEMPLATES).filter(
    t => t.stage === stageKey || t.stage === null
  );
  return templates.length > 0 ? templates : [EMAIL_TEMPLATES.general_checkin];
}

export function fillTemplate(template, data) {
  let text = template;
  Object.entries(data).forEach(([key, value]) => {
    text = text.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
  });
  return text;
}
