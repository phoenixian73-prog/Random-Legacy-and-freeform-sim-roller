import React, { useState } from 'react';
import { VERSION_HISTORY, APP_VERSION } from '../data/versionHistory';
import { ChangelogEntry } from '../types';

interface VersionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VersionHistoryModal: React.FC<VersionHistoryModalProps> = ({
  isOpen,
  onClose
}) => {
  const [filterType, setFilterType] = useState<'all' | 'major' | 'minor'>('all');
  const [expandedVersions, setExpandedVersions] = useState<Record<string, boolean>>({
    [APP_VERSION]: true
  });

  if (!isOpen) return null;

  const toggleExpand = (ver: string) => {
    setExpandedVersions(prev => ({
      ...prev,
      [ver]: !prev[ver]
    }));
  };

  const filtered = VERSION_HISTORY.filter(entry => {
    if (filterType === 'all') return true;
    return entry.type === filterType;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-slate-900 border-2 border-slate-700 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-xl shadow-lg shadow-amber-500/20">
              🚀
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white tracking-wide">
                  Version & Overhaul Ledger
                </h2>
                <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  {APP_VERSION}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Tracking all major and minor milestones, mechanics overhauls, and rule updates.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors font-bold cursor-pointer"
            title="Close"
          >
            ✕
          </button>
        </div>

        {/* Filter Bar */}
        <div className="px-6 py-2.5 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-semibold mr-1">Filter Updates:</span>
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                filterType === 'all'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
              }`}
            >
              All Releases ({VERSION_HISTORY.length})
            </button>
            <button
              onClick={() => setFilterType('major')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                filterType === 'major'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
              }`}
            >
              Major Overhauls
            </button>
            <button
              onClick={() => setFilterType('minor')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                filterType === 'minor'
                  ? 'bg-sky-500 text-slate-950 shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
              }`}
            >
              Minor Tweaks
            </button>
          </div>

          <span className="text-[11px] text-slate-500 font-mono">
            Milestone baseline: v1.0
          </span>
        </div>

        {/* Scrollable Version List */}
        <div className="p-6 overflow-y-auto space-y-4">
          {filtered.map((entry: ChangelogEntry) => {
            const isExpanded = !!expandedVersions[entry.version];
            const isMajor = entry.type === 'major';

            return (
              <div
                key={entry.version}
                className={`rounded-xl border transition-all ${
                  isMajor 
                    ? 'bg-slate-950/90 border-amber-500/40 shadow-lg' 
                    : 'bg-slate-950/50 border-slate-800'
                }`}
              >
                {/* Release Header */}
                <div 
                  onClick={() => toggleExpand(entry.version)}
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-800/40 transition-colors select-none"
                >
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-mono font-black text-base text-amber-400">
                      {entry.version}
                    </span>
                    <span className={`text-[10px] uppercase font-mono font-black px-2 py-0.5 rounded border ${
                      isMajor
                        ? 'bg-rose-950 text-rose-300 border-rose-700/60'
                        : 'bg-sky-950 text-sky-300 border-sky-700/60'
                    }`}>
                      {entry.tag}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {entry.date}
                    </span>
                    <span className="text-sm font-bold text-slate-200">
                      — {entry.title}
                    </span>
                  </div>

                  <span className="text-slate-400 text-xs font-mono ml-2">
                    {isExpanded ? '▲ Hide' : '▼ Details'}
                  </span>
                </div>

                {/* Highlights Summary */}
                <div className="px-4 pb-3">
                  <div className="text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <span>✨</span>
                    <span>Key Highlights:</span>
                  </div>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                    {entry.highlights.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 bg-slate-900/80 p-2 rounded-lg border border-slate-800/80 text-slate-200">
                        <span className="text-amber-400 font-bold mt-0.5">•</span>
                        <span className="leading-snug">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Detailed Technical Breakdown (if expanded) */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-2 border-t border-slate-850 bg-slate-900/40 space-y-2 text-xs">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Technical Directive & Rules Implementation:
                    </div>
                    <ul className="space-y-1.5 text-slate-300">
                      {entry.details.map((detail, idx) => (
                        <li key={idx} className="flex items-start gap-2 leading-relaxed">
                          <span className="text-sky-400 font-bold mt-0.5">➔</span>
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Official Legacy Challenge Ruleset Engine</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold transition-colors cursor-pointer"
          >
            Close Ledger
          </button>
        </div>
      </div>
    </div>
  );
};
