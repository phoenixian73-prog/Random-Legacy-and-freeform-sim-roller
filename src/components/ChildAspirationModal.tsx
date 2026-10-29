import React, { useState } from 'react';
import { 
  childAspirationsData, 
  childAspirationCategories, 
  ChildAspiration, 
  ChildAspirationCategory,
  checkMilestoneSkillCompletion
} from '../data/childAspirations';
import { Sim } from '../types';

interface ChildAspirationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSim?: Sim | null;
  onSelectAspiration?: (simId: number, aspirationName: string) => void;
  onGrantRewardTrait?: (simId: number, traitName: string) => void;
}

export const ChildAspirationModal: React.FC<ChildAspirationModalProps> = ({
  isOpen,
  onClose,
  currentSim,
  onSelectAspiration,
  onGrantRewardTrait,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ChildAspirationCategory | 'All'>('All');
  const [activeAspirationId, setActiveAspirationId] = useState<string>(
    currentSim?.asp ? (childAspirationsData.find(a => a.name === currentSim.asp)?.id || childAspirationsData[0].id) : childAspirationsData[0].id
  );

  if (!isOpen) return null;

  const filteredAspirations = selectedCategory === 'All'
    ? childAspirationsData
    : childAspirationsData.filter(a => a.category === selectedCategory);

  const activeAspiration = childAspirationsData.find(a => a.id === activeAspirationId) || filteredAspirations[0] || childAspirationsData[0];

  const categoryIcons: Record<ChildAspirationCategory, string> = {
    Creativity: '🎨',
    Motor: '🏃',
    Social: '🗣️',
    Mental: '🧠'
  };

  const getPackBadgeColor = (pack: string) => {
    if (pack.includes('Growing Together')) return 'bg-emerald-950/80 text-emerald-300 border-emerald-600/60';
    if (pack.includes('Adventure Awaits')) return 'bg-amber-950/80 text-amber-300 border-amber-600/60';
    return 'bg-blue-950/80 text-blue-300 border-blue-600/60';
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div 
        className="bg-slate-900 border border-slate-700 w-full max-w-5xl rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">🧒</span>
              <h2 className="text-xl font-bold text-white tracking-wide">
                Child Aspirations Guide & Tracker
              </h2>
              <span className="bg-sky-500/20 text-sky-300 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-sky-500/30">
                8 Aspirations
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {currentSim ? (
                <>Tracking for <strong className="text-sky-300">Sim {currentSim.id} ({currentSim.stage})</strong> — Current Aspiration: <strong className="text-amber-300">{currentSim.asp}</strong></>
              ) : (
                "Complete Milestones, Objectives, and Reward Traits across all 8 Child Aspirations"
              )}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center font-bold text-lg transition-colors border border-slate-700"
            title="Close"
          >
            ×
          </button>
        </div>

        {/* Category Tabs */}
        <div className="bg-slate-900/90 px-6 py-2.5 border-b border-slate-800 flex items-center gap-2 overflow-x-auto">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1 shrink-0">
            Category:
          </span>
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 border ${
              selectedCategory === 'All'
                ? 'bg-sky-600 text-white border-sky-400 shadow-md'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            ✨ All ({childAspirationsData.length})
          </button>
          {childAspirationCategories.map(cat => {
            const count = childAspirationsData.filter(a => a.category === cat).length;
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 border ${
                  isSelected
                    ? 'bg-sky-600 text-white border-sky-400 shadow-md'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                <span>{categoryIcons[cat]}</span>
                <span>{cat}</span>
                <span className="bg-black/30 text-[10px] px-1.5 py-0.2 rounded-full">
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-hidden">
          {/* Aspirations Sidebar List */}
          <div className="md:col-span-4 lg:col-span-4 border-r border-slate-800 overflow-y-auto p-3 space-y-2 max-h-[40vh] md:max-h-none">
            {filteredAspirations.map(asp => {
              const isActive = asp.id === activeAspiration.id;
              const isSimCurrent = currentSim?.asp === asp.name;

              return (
                <div
                  key={asp.id}
                  onClick={() => setActiveAspirationId(asp.id)}
                  className={`p-3 rounded-xl cursor-pointer border transition-all text-left ${
                    isActive
                      ? 'bg-slate-800 border-sky-400 shadow-lg ring-1 ring-sky-400/50'
                      : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/60 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>{categoryIcons[asp.category]}</span>
                      {asp.name}
                    </span>
                    {isSimCurrent && (
                      <span className="bg-amber-500 text-amber-950 font-black text-[9px] px-1.5 py-0.2 rounded uppercase">
                        Active
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${asp.categoryColor.pill}`}>
                      {asp.category}
                    </span>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded border ${getPackBadgeColor(asp.pack)}`}>
                      {asp.packBadge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-1 mt-1.5">
                    {asp.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Aspiration Detail View */}
          <div className="md:col-span-8 lg:col-span-8 overflow-y-auto p-4 sm:p-6 space-y-5">
            {/* Title & Overview Card */}
            <div className={`p-4 rounded-xl border ${activeAspiration.categoryColor.bg} ${activeAspiration.categoryColor.border}`}>
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-xl">{categoryIcons[activeAspiration.category]}</span>
                    <h3 className="text-lg font-bold text-white">
                      {activeAspiration.name}
                    </h3>
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${activeAspiration.categoryColor.pill}`}>
                      {activeAspiration.category}
                    </span>
                    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${getPackBadgeColor(activeAspiration.pack)}`}>
                      {activeAspiration.packBadge}
                    </span>
                  </div>
                  <p className="text-sm text-slate-200 mt-1">
                    {activeAspiration.description}
                  </p>
                </div>

                {currentSim && currentSim.stage === "Child" && (
                  <div className="flex items-center gap-2">
                    {currentSim.asp !== activeAspiration.name ? (
                      <button
                        onClick={() => onSelectAspiration && onSelectAspiration(currentSim.id, activeAspiration.name)}
                        className="bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs px-3.5 py-2 rounded-lg transition-all shadow-md flex items-center gap-1.5"
                      >
                        🎯 Set for Sim {currentSim.id}
                      </button>
                    ) : (
                      <span className="bg-emerald-950 border border-emerald-600 text-emerald-300 font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1">
                        ✓ Currently Assigned
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Reward Trait Highlight Box */}
              <div className="mt-4 bg-slate-900/90 border border-amber-500/40 rounded-xl p-3 shadow-inner">
                <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🏆</span>
                    <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                      Reward Trait:
                    </span>
                    <span className="bg-amber-500/20 text-amber-200 border border-amber-500/50 px-2 py-0.5 rounded font-bold text-xs">
                      {activeAspiration.rewardTrait.name}
                    </span>
                  </div>
                  {currentSim && onGrantRewardTrait && (
                    <button
                      onClick={() => onGrantRewardTrait(currentSim.id, activeAspiration.rewardTrait.name)}
                      className={`text-[11px] font-semibold px-2 py-1 rounded transition-all border ${
                        currentSim.traits.includes(activeAspiration.rewardTrait.name)
                          ? 'bg-emerald-900/70 text-emerald-200 border-emerald-600 cursor-default'
                          : 'bg-amber-600 hover:bg-amber-500 text-white border-amber-400'
                      }`}
                      disabled={currentSim.traits.includes(activeAspiration.rewardTrait.name)}
                    >
                      {currentSim.traits.includes(activeAspiration.rewardTrait.name)
                        ? '✓ Trait Owned'
                        : `+ Grant to Sim ${currentSim.id}`}
                    </button>
                  )}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed pl-6">
                  {activeAspiration.rewardTrait.description}
                </p>
              </div>
            </div>

            {/* Milestones 1, 2, 3 Section */}
            <div>
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <span>📋</span> Milestones & Objectives
              </h4>

              <div className="space-y-3">
                {activeAspiration.milestones.map((milestone) => {
                  const check = checkMilestoneSkillCompletion(milestone, currentSim?.childSkills);

                  return (
                    <div
                      key={milestone.tier}
                      className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 hover:border-slate-700 transition-all"
                    >
                      <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-slate-800">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-slate-800 text-sky-300 font-bold text-xs flex items-center justify-center border border-slate-700">
                            {milestone.tier}
                          </span>
                          <span className="font-bold text-slate-200 text-sm">
                            {milestone.title}
                          </span>
                        </div>

                        {currentSim && milestone.skillRequirements && milestone.skillRequirements.length > 0 && (
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              check.fulfilled
                                ? 'bg-emerald-950 text-emerald-300 border-emerald-600/60'
                                : 'bg-amber-950/80 text-amber-300 border-amber-600/50'
                            }`}
                          >
                            {check.fulfilled ? '✅ Skill Reqs Met' : '⏳ In Progress'}
                          </span>
                        )}
                      </div>

                      {/* Task Checklist */}
                      <ul className="space-y-1.5 pl-1">
                        {milestone.tasks.map((task, idx) => {
                          // Check if task matches any skill requirement
                          const matchedDetail = check.details.find(d => 
                            task.toLowerCase().includes(d.skill.toLowerCase()) && 
                            task.toLowerCase().includes(d.required.toString())
                          );

                          return (
                            <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                              <span className="text-slate-500 font-bold mt-0.5">•</span>
                              <span className="flex-1">{task}</span>
                              {matchedDetail && currentSim && (
                                <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded border shrink-0 ${
                                  matchedDetail.met 
                                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700' 
                                    : 'bg-slate-800 text-slate-400 border-slate-700'
                                }`}>
                                  {matchedDetail.met ? `✅ Lv ${matchedDetail.current}` : `Needs Lv ${matchedDetail.required} (Lv ${matchedDetail.current})`}
                                </span>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-950 px-6 py-3 border-t border-slate-800 flex items-center justify-between flex-wrap gap-2 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span>💡 Tip:</span>
            <span>Completing childhood aspirations unlocks exclusive reward traits and faster adult skill building!</span>
          </div>
          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-1.5 rounded-lg font-semibold transition-all border border-slate-700"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
