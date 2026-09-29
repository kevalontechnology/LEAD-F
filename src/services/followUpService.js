import api from './api';

export const getFollowUpsApi = async (params) => {
  const res = await api.get('/followups', { params });
  return res.data;
};

export const createFollowUpApi = async (data) => {
  const res = await api.post('/followups', data);
  return res.data;
};

export const updateFollowUpApi = async (id, data) => {
  const res = await api.put(`/followups/${id}`, data);
  return res.data;
};

export const deleteFollowUpApi = async (id) => {
  const res = await api.delete(`/followups/${id}`);
  return res.data;
};
