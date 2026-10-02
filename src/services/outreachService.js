import api from './api';

export const sendWhatsAppApi = async (leadId, customMessage) => {
  const res = await api.post('/leads/whatsapp/send', { leadId, customMessage });
  return res.data;
};

export const sendEmailApi = async (leadId, customSubject, customBody) => {
  const res = await api.post('/leads/email/send', { leadId, customSubject, customBody });
  return res.data;
};

export const bulkSendMessagesApi = async (leadIds, channel, filter, category, sendAllDatabase = false) => {
  const res = await api.post('/leads/messages/bulk-send', { leadIds, channel, filter, category, sendAllDatabase });
  return res.data;
};
