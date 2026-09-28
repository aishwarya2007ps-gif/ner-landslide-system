import React from 'react';

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const norm = status.toLowerCase();

  let styles = 'bg-slate-800 text-slate-300 border-slate-700';

  if (norm === 'critical' || norm === 'rejected') {
    styles = 'bg-red-950/80 text-red-300 border-red-800';
  } else if (norm === 'high' || norm === 'warning') {
    styles = 'bg-orange-950/80 text-orange-300 border-orange-800';
  } else if (norm === 'moderate' || norm === 'under_review' || norm === 'submitted') {
    styles = 'bg-amber-950/80 text-amber-300 border-amber-800';
  } else if (norm === 'low' || norm === 'verified' || norm === 'resolved' || norm === 'published' || norm === 'online') {
    styles = 'bg-emerald-950/80 text-emerald-300 border-emerald-800';
  } else if (norm === 'in_progress' || norm === 'assigned') {
    styles = 'bg-blue-950/80 text-blue-300 border-blue-800';
  }

  return (
    <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border inline-block uppercase tracking-wider ${styles}`}>
      {status.replace('_', ' ')}
    </span>
  );
};
