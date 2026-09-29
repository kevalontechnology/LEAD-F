import api from './api';

export const getTemplatesApi = async (params) => {
  const res = await api.get('/templates', { params });
  return res.data;
};

export const createTemplateApi = async (data) => {
  const res = await api.post('/templates', data);
  return res.data;
};

export const updateTemplateApi = async (id, data) => {
  const res = await api.put(`/templates/${id}`, data);
  return res.data;
};

export const deleteTemplateApi = async (id) => {
  const res = await api.delete(`/templates/${id}`);
  return res.data;
};
