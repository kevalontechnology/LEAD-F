import React from 'react';
import { LEAD_STATUSES, WHATSAPP_STATUSES, EMAIL_STATUSES } from '../../utils/constants';

export const StatusBadge = ({ type, value }) => {
  let config = { label: value, color: 'bg-slate-100 text-slate-700' };

  if (type === 'lead') {
    config = LEAD_STATUSES[value] || config;
  } else if (type === 'whatsapp') {
    config = WHATSAPP_STATUSES[value] || config;
  } else if (type === 'email') {
    config = EMAIL_STATUSES[value] || config;
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${config.color}`}
    >
      {config.label}
    </span>
  );
};

export default StatusBadge;
