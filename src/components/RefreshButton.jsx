import React from 'react';
import { RefreshCw } from 'lucide-react';

export default function RefreshButton({ onClick, className }) {
  const handleClick = onClick || (() => window.location.reload());
  
  return (
    <button
      onClick={handleClick}
      className={`flex items-center gap-1.5 bg-green-100 hover:bg-green-200 text-green-900 text-xs font-semibold px-4 py-2 rounded-lg transition ${className || ''}`}
    >
      <RefreshCw size={12} /> Refresh
    </button>
  );
}
