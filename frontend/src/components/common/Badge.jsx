import React from 'react';
import { getPriorityInfo } from '../../utils/formatters';

export const PriorityBadge = ({ priority }) => {
  const info = getPriorityInfo(priority);
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${info.color}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${info.dotColor}`}></span>
      {info.label}
    </span>
  );
};

export const StatusBadge = ({ completed }) => {
  if (completed) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
        Đã hoàn thành
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
      Đang làm
    </span>
  );
};
