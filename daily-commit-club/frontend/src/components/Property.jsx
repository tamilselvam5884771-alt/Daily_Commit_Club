import React from 'react';
import { Building } from './Building';

/**
 * Property Component
 * Renders an individual house property space containing:
 * - Property boundary / garden terrain
 * - Surrounding trees and pathway
 * - House architecture
 * - Property sign / mailbox with owner's displayName
 * - Character spawn point
 */
export const Property = ({
  building,
  owner,
  health = 100,
  destroyed = false,
  isSelected = false,
  onClick = () => {}
}) => {
  const displayName = owner?.displayName || owner?.name || owner?.githubUsername || 'Unclaimed';

  return (
    <div className="relative group flex flex-col items-center">
      {/* Property Terrain Base */}
      <div className="absolute bottom-2 w-52 h-16 rounded-[50%] bg-emerald-950/30 border border-emerald-500/20 blur-[2px] pointer-events-none group-hover:border-amber-400/40 transition duration-500" />

      {/* Surrounding Property Flora / Trees */}
      <div className="absolute bottom-12 -left-6 text-xl opacity-60 pointer-events-none">🌲</div>
      <div className="absolute bottom-10 -right-6 text-xl opacity-60 pointer-events-none">🌿</div>

      {/* House Component */}
      <Building
        building={building}
        owner={owner}
        health={health}
        destroyed={destroyed}
        isSelected={isSelected}
        onClick={onClick}
      />

      {/* Property Name Sign / Mailbox */}
      <div className="mt-1 px-3 py-0.5 rounded-md bg-slate-900/90 border border-amber-500/30 text-center shadow-lg pointer-events-none z-10">
        <div className="text-[11px] font-bold text-amber-200 truncate max-w-[140px]">
          {displayName}
        </div>
      </div>
    </div>
  );
};
