import api from './api';

export const getLeadsApi = async (params) => {
  const res = await api.get('/leads', { params });
  return res.data;
};

export const getLeadByIdApi = async (id) => {
  const res = await api.get(`/leads/${id}`);
  return res.data;
};

export const createLeadApi = async (data) => {
  const res = await api.post('/leads', data);
  return res.data;
};

export const updateLeadApi = async (id, data) => {
  const res = await api.put(`/leads/${id}`, data);
  return res.data;
};

export const deleteLeadApi = async (id) => {
  const res = await api.delete(`/leads/${id}`);
  return res.data;
};

export const bulkDeleteLeadsApi = async (leadIds) => {
  const res = await api.post('/leads/bulk-delete', { leadIds });
  return res.data;
};

export const previewExcelApi = async (formData) => {
  const res = await api.post('/leads/import/preview', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
};

export const confirmExcelImportApi = async (data) => {
  const res = await api.post('/leads/import/confirm', data);
  return res.data;
};

export const updateLeadMessageApi = async (id, data) => {
  const res = await api.put(`/leads/${id}/message`, data);
  return res.data;
};

export const regenerateLeadMessageApi = async (id) => {
  const res = await api.post(`/leads/${id}/regenerate-message`);
  return res.data;
};
