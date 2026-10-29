import React, { useState, useMemo } from 'react';
import { 
  allSkillsData, 
  SkillItem, 
  SkillCategory, 
  toddlerConversionTable, 
  agingConversionBreakdown, 
  toddlerBonusTraits,
  calculateChildSkillsFromToddler
} from '../data/skillsData';
import { Sim } from '../types';

interface SkillsGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSim?: Sim | null;
  onApplySkillToSim?: (simId: number, skillName: string) => void;
  onApplyToddlerAgingBonus?: (simId: number, bonusTrait: string) => void;
}

export const SkillsGuideModal: React.FC<SkillsGuideModalProps> = ({
  isOpen,
  onClose,
  currentSim,
  onApplySkillToSim,
  onApplyToddlerAgingBonus
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<SkillCategory | 'All' | 'Calculator'>('All');
  const [selectedPackFilter, setSelectedPackFilter] = useState<string>('All');
  const [selectedSkill, setSelectedSkill] = useState<SkillItem | null>(null);

  // Toddler Aging Calculator State
  const [calcCommunication, setCalcCommunication] = useState<number>(
    currentSim?.toddlerSkills?.Communication || 3
  );
  const [calcImagination, setCalcImagination] = useState<number>(
    currentSim?.toddlerSkills?.Imagination || 3
  );
  const [calcMovement, setCalcMovement] = useState<number>(
    currentSim?.toddlerSkills?.Movement || 3
  );
  const [calcPotty, setCalcPotty] = useState<number>(
    currentSim?.toddlerSkills?.Potty || 2
  );
  const [calcThinking, setCalcThinking] = useState<number>(
    currentSim?.toddlerSkills?.Thinking || 3
  );

  // Sync state if currentSim changes and is toddler
  React.useEffect(() => {
    if (currentSim?.toddlerSkills) {
      setCalcCommunication(currentSim.toddlerSkills.Communication);
      setCalcImagination(currentSim.toddlerSkills.Imagination);
      setCalcMovement(currentSim.toddlerSkills.Movement);
      setCalcPotty(currentSim.toddlerSkills.Potty);
      setCalcThinking(currentSim.toddlerSkills.Thinking);
    }
  }, [currentSim]);

  const uniquePacks = useMemo(() => {
    const packs = Array.from(new Set(allSkillsData.map(s => s.pack)));
    return ['All', ...packs];
  }, []);

  const filteredSkills = useMemo(() => {
    return allSkillsData.filter(skill => {
      // Tab filter
      if (activeTab !== 'All' && activeTab !== 'Calculator' && skill.category !== activeTab) {
        return false;
      }
      // Pack filter
      if (selectedPackFilter !== 'All' && skill.pack !== selectedPackFilter) {
        return false;
      }
      // Search filter
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchesName = skill.name.toLowerCase().includes(q);
        const matchesPack = skill.pack.toLowerCase().includes(q);
        const matchesDesc = skill.description.toLowerCase().includes(q);
        const matchesHow = skill.howToImprove.toLowerCase().includes(q);
        const matchesMentor = skill.mentorFrom ? skill.mentorFrom.toLowerCase().includes(q) : false;
        return matchesName || matchesPack || matchesDesc || matchesHow || matchesMentor;
      }
      return true;
    });
  }, [activeTab, selectedPackFilter, searchQuery]);

  const calcResults = useMemo(() => {
    return calculateChildSkillsFromToddler({
      Communication: calcCommunication,
      Imagination: calcImagination,
      Movement: calcMovement,
      Potty: calcPotty,
      Thinking: calcThinking
    });
  }, [calcCommunication, calcImagination, calcMovement, calcPotty, calcThinking]);

  if (!isOpen) return null;

  const getPackBadgeStyle = (pack: string) => {
    if (pack.includes('Base Game')) return 'bg-blue-950/80 text-blue-300 border-blue-600/60';
    if (pack.includes('Horse Ranch')) return 'bg-amber-950/80 text-amber-300 border-amber-600/60';
    if (pack.includes('Vampires') || pack.includes('Life & Death')) return 'bg-purple-950/80 text-purple-300 border-purple-600/60';
    if (pack.includes('Enchanted') || pack.includes('Nature') || pack.includes('Cottage')) return 'bg-emerald-950/80 text-emerald-300 border-emerald-600/60';
    if (pack.includes('Royalty & Legacy')) return 'bg-yellow-950/80 text-yellow-300 border-yellow-600/60';
    if (pack.includes('Adventure')) return 'bg-orange-950/80 text-orange-300 border-orange-600/60';
    return 'bg-slate-800 text-slate-300 border-slate-700';
  };

  const getSkillTypeBadge = (skill: SkillItem) => {
    if (skill.maxLevel === 15) return 'bg-fuchsia-950/90 text-fuchsia-200 border-fuchsia-600/80';
    if (skill.maxLevel === 10) return 'bg-sky-950/80 text-sky-200 border-sky-600/60';
    if (skill.maxLevel === 5) return 'bg-teal-950/80 text-teal-200 border-teal-600/60';
    return 'bg-indigo-950/80 text-indigo-200 border-indigo-600/60';
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div 
        className="bg-slate-900 border border-slate-700 w-full max-w-6xl rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🎓</span>
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2 tracking-wide">
                <span>The Sims 4 Skills Guide & Master Database</span>
                <span className="text-xs bg-sky-500/20 text-sky-300 px-2.5 py-0.5 rounded-full border border-sky-500/40 font-mono">
                  {allSkillsData.length} Skills • 30 Categories
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Complete reference for Major, Minor, Toddler/Child Fundamentals, Occult & Horse Skills with leveling, mentoring, and aging conversions
              </p>
            </div>
          </div>
          <button
            className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 p-2 rounded-xl transition-all"
            onClick={onClose}
            title="Close Skills Guide"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-950/70 px-6 py-2 border-b border-slate-800 flex items-center gap-1.5 overflow-x-auto text-xs font-bold scrollbar-thin">
          <button
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${activeTab === 'All' ? 'bg-sky-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800'}`}
            onClick={() => setActiveTab('All')}
          >
            <span>🌐</span>
            <span>All Skills ({allSkillsData.length})</span>
          </button>
          <button
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${activeTab === 'Base Game' ? 'bg-sky-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800'}`}
            onClick={() => setActiveTab('Base Game')}
          >
            <span>💎</span>
            <span>Base Game (20)</span>
          </button>
          <button
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${activeTab === 'Fundamental Skills' ? 'bg-sky-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800'}`}
            onClick={() => setActiveTab('Fundamental Skills')}
          >
            <span>🧸</span>
            <span>Fundamentals (Toddler 5 • Child 4)</span>
          </button>
          <button
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${activeTab === 'Expansion Packs' ? 'bg-sky-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800'}`}
            onClick={() => setActiveTab('Expansion Packs')}
          >
            <span>📦</span>
            <span>Expansion Packs</span>
          </button>
          <button
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${activeTab === 'Game & Stuff Packs' ? 'bg-sky-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800'}`}
            onClick={() => setActiveTab('Game & Stuff Packs')}
          >
            <span>✨</span>
            <span>Game & Stuff Packs</span>
          </button>
          <button
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${activeTab === 'Horse Skills' ? 'bg-sky-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800'}`}
            onClick={() => setActiveTab('Horse Skills')}
          >
            <span>🐎</span>
            <span>Horse Skills (4)</span>
          </button>
          <button
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ml-auto ${activeTab === 'Calculator' ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md font-extrabold' : 'text-amber-300 hover:bg-slate-800 border border-amber-500/30'}`}
            onClick={() => setActiveTab('Calculator')}
          >
            <span>⚡</span>
            <span>Toddler ➔ Child Aging Calculator & Bonuses</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'Calculator' ? (
            /* Toddler -> Child Aging Conversion & Bonuses Tab */
            <div className="space-y-6 max-w-5xl mx-auto">
              {/* Introduction Box */}
              <div className="bg-gradient-to-r from-amber-950/40 via-purple-950/30 to-sky-950/40 border border-amber-500/40 p-5 rounded-2xl shadow-xl">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">🧮</span>
                  <div>
                    <h3 className="text-lg font-black text-amber-300">
                      Toddler-to-Child Aging Conversion Mechanics & Trait Bonuses
                    </h3>
                    <p className="text-xs text-slate-300">
                      When a toddler ages up in The Sims 4, their fundamental skills translate directly into head starts for Child skills.
                      Sims who practice diligently also unlock powerful lifetime bonus traits!
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {toddlerBonusTraits.map(bonus => (
                    <div 
                      key={bonus.name}
                      className={`p-3.5 rounded-xl border ${bonus.name === calcResults.awardedBonusTrait ? 'bg-amber-950/80 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.2)]' : 'bg-slate-950/60 border-slate-800'}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-amber-200 text-sm flex items-center gap-1.5">
                          <span>{bonus.icon}</span>
                          <span>{bonus.name}</span>
                        </span>
                        {bonus.name === calcResults.awardedBonusTrait && (
                          <span className="text-[10px] bg-emerald-900 text-emerald-200 px-2 py-0.5 rounded-full font-bold border border-emerald-500/50 animate-pulse">
                            ✓ Currently Qualified!
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-300 mt-1 font-medium">
                        <span className="text-slate-400">Requirement:</span> {bonus.requirement}
                      </p>
                      <p className="text-xs text-amber-300/90 mt-1 font-semibold">
                        <span className="text-slate-400">Lifetime Benefit:</span> {bonus.benefit}
                      </p>
                      {currentSim && onApplyToddlerAgingBonus && (
                        <button
                          className="mt-2.5 w-full bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-bold py-1 px-2.5 rounded-lg transition-all shadow"
                          onClick={() => onApplyToddlerAgingBonus(currentSim.id, bonus.name)}
                          title={`Grant ${bonus.name} directly to Sim ${currentSim.id}`}
                        >
                          Grant "{bonus.name}" to Sim {currentSim.id}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Interactive Calculator Section */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Inputs */}
                <div className="lg:col-span-6 bg-slate-950/80 border border-slate-800 p-5 rounded-2xl">
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
                    <h4 className="font-bold text-sky-300 text-sm uppercase tracking-wider flex items-center gap-2">
                      <span>👶</span>
                      <span>Toddler Skill Levels</span>
                    </h4>
                    <span className="text-xs text-slate-400">
                      {currentSim?.stage === 'Toddler' ? `Loaded from Sim ${currentSim.id}` : 'Customize Levels'}
                    </span>
                  </div>

                  <div className="space-y-4">
                    {/* Communication */}
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-slate-200 flex items-center gap-1">
                          <span>🗣️</span> Communication (➔ Child Social)
                        </span>
                        <span className="text-sky-400 font-mono">Level {calcCommunication} / 5</span>
                      </div>
                      <input 
                        type="range" 
                        min="1" 
                        max="5" 
                        value={calcCommunication}
                        onChange={(e) => setCalcCommunication(Number(e.target.value))}
                        className="w-full accent-sky-500 cursor-pointer"
                      />
                    </div>

                    {/* Imagination */}
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-slate-200 flex items-center gap-1">
                          <span>🦄</span> Imagination (➔ Child Creativity)
                        </span>
                        <span className="text-sky-400 font-mono">Level {calcImagination} / 5</span>
                      </div>
                      <input 
                        type="range" 
                        min="1" 
                        max="5" 
                        value={calcImagination}
                        onChange={(e) => setCalcImagination(Number(e.target.value))}
                        className="w-full accent-sky-500 cursor-pointer"
                      />
                    </div>

                    {/* Movement */}
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-slate-200 flex items-center gap-1">
                          <span>🏃‍♂️</span> Movement (➔ Child Motor)
                        </span>
                        <span className="text-sky-400 font-mono">Level {calcMovement} / 5</span>
                      </div>
                      <input 
                        type="range" 
                        min="1" 
                        max="5" 
                        value={calcMovement}
                        onChange={(e) => setCalcMovement(Number(e.target.value))}
                        className="w-full accent-sky-500 cursor-pointer"
                      />
                    </div>

                    {/* Thinking */}
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-slate-200 flex items-center gap-1">
                          <span>💡</span> Thinking (➔ Child Mental)
                        </span>
                        <span className="text-sky-400 font-mono">Level {calcThinking} / 5</span>
                      </div>
                      <input 
                        type="range" 
                        min="1" 
                        max="5" 
                        value={calcThinking}
                        onChange={(e) => setCalcThinking(Number(e.target.value))}
                        className="w-full accent-sky-500 cursor-pointer"
                      />
                    </div>

                    {/* Potty */}
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-slate-200 flex items-center gap-1">
                          <span>🚽</span> Potty (Special Fundamental)
                        </span>
                        <span className="text-sky-400 font-mono">Level {calcPotty} / 3</span>
                      </div>
                      <input 
                        type="range" 
                        min="1" 
                        max="3" 
                        value={calcPotty}
                        onChange={(e) => setCalcPotty(Number(e.target.value))}
                        className="w-full accent-sky-500 cursor-pointer"
                      />
                      <span className="text-[10px] text-slate-400 italic block mt-0.5">
                        Potty only has 3 levels. Does not affect child skills, but maxing stops dirty diapers!
                      </span>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        className="flex-1 bg-slate-800 hover:bg-slate-700 text-xs font-bold py-1.5 rounded-lg text-slate-200 transition-all"
                        onClick={() => {
                          setCalcCommunication(1);
                          setCalcImagination(1);
                          setCalcMovement(1);
                          setCalcThinking(1);
                          setCalcPotty(1);
                        }}
                      >
                        Reset to Level 1
                      </button>
                      <button
                        className="flex-1 bg-amber-600 hover:bg-amber-500 text-xs font-bold py-1.5 rounded-lg text-slate-950 transition-all shadow"
                        onClick={() => {
                          setCalcCommunication(5);
                          setCalcImagination(5);
                          setCalcMovement(5);
                          setCalcThinking(5);
                          setCalcPotty(3);
                        }}
                      >
                        Max All (Top Notch!)
                      </button>
                    </div>
                  </div>
                </div>

                {/* Live Converted Child Output */}
                <div className="lg:col-span-6 bg-slate-950/80 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
                      <h4 className="font-bold text-emerald-300 text-sm uppercase tracking-wider flex items-center gap-2">
                        <span>🧒</span>
                        <span>Converted Child Skills Upon Aging Up</span>
                      </h4>
                      {calcResults.awardedBonusTrait && (
                        <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-md font-bold">
                          {calcResults.awardedBonusTrait}
                        </span>
                      )}
                    </div>

                    <div className="space-y-3">
                      {/* Social */}
                      <div className="bg-slate-900/90 border border-purple-500/30 p-3 rounded-xl">
                        <div className="flex items-center justify-between text-xs font-bold mb-1">
                          <span className="text-purple-300 flex items-center gap-1.5">
                            <span>🗣️</span> Social Skill (from Communication Lvl {calcCommunication})
                          </span>
                          <span className="text-slate-100 font-mono">
                            {calcResults.social.completedLevel === 0 ? 'Starts Level 1' : `Level ${calcResults.social.completedLevel + 1} (${calcResults.social.percentToNext}% progress)`}
                          </span>
                        </div>
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-purple-500 h-full rounded-full transition-all duration-300"
                            style={{ width: `${calcResults.social.completedLevel === 0 ? 0 : calcResults.social.percentToNext}%` }}
                          />
                        </div>
                        <span className="text-[11px] text-slate-400 mt-1 block">
                          Status: <strong className="text-slate-200">{calcResults.social.label}</strong>
                        </span>
                      </div>

                      {/* Creativity */}
                      <div className="bg-slate-900/90 border border-amber-500/30 p-3 rounded-xl">
                        <div className="flex items-center justify-between text-xs font-bold mb-1">
                          <span className="text-amber-300 flex items-center gap-1.5">
                            <span>🎨</span> Creativity Skill (from Imagination Lvl {calcImagination})
                          </span>
                          <span className="text-slate-100 font-mono">
                            {calcResults.creativity.completedLevel === 0 ? 'Starts Level 1' : `Level ${calcResults.creativity.completedLevel + 1} (${calcResults.creativity.percentToNext}% progress)`}
                          </span>
                        </div>
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-amber-500 h-full rounded-full transition-all duration-300"
                            style={{ width: `${calcResults.creativity.completedLevel === 0 ? 0 : calcResults.creativity.percentToNext}%` }}
                          />
                        </div>
                        <span className="text-[11px] text-slate-400 mt-1 block">
                          Status: <strong className="text-slate-200">{calcResults.creativity.label}</strong>
                        </span>
                      </div>

                      {/* Motor */}
                      <div className="bg-slate-900/90 border border-emerald-500/30 p-3 rounded-xl">
                        <div className="flex items-center justify-between text-xs font-bold mb-1">
                          <span className="text-emerald-300 flex items-center gap-1.5">
                            <span>🏃</span> Motor Skill (from Movement Lvl {calcMovement})
                          </span>
                          <span className="text-slate-100 font-mono">
                            {calcResults.motor.completedLevel === 0 ? 'Starts Level 1' : `Level ${calcResults.motor.completedLevel + 1} (${calcResults.motor.percentToNext}% progress)`}
                          </span>
                        </div>
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                            style={{ width: `${calcResults.motor.completedLevel === 0 ? 0 : calcResults.motor.percentToNext}%` }}
                          />
                        </div>
                        <span className="text-[11px] text-slate-400 mt-1 block">
                          Status: <strong className="text-slate-200">{calcResults.motor.label}</strong>
                        </span>
                      </div>

                      {/* Mental */}
                      <div className="bg-slate-900/90 border border-sky-500/30 p-3 rounded-xl">
                        <div className="flex items-center justify-between text-xs font-bold mb-1">
                          <span className="text-sky-300 flex items-center gap-1.5">
                            <span>🧠</span> Mental Skill (from Thinking Lvl {calcThinking})
                          </span>
                          <span className="text-slate-100 font-mono">
                            {calcResults.mental.completedLevel === 0 ? 'Starts Level 1' : `Level ${calcResults.mental.completedLevel + 1} (${calcResults.mental.percentToNext}% progress)`}
                          </span>
                        </div>
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-sky-500 h-full rounded-full transition-all duration-300"
                            style={{ width: `${calcResults.mental.completedLevel === 0 ? 0 : calcResults.mental.percentToNext}%` }}
                          />
                        </div>
                        <span className="text-[11px] text-slate-400 mt-1 block">
                          Status: <strong className="text-slate-200">{calcResults.mental.label}</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Conversion Table Reference */}
                  <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
                    <strong className="text-slate-300 block mb-1">Official Aging Conversion Breakdown:</strong>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 text-[10px]">
                      {agingConversionBreakdown.map(b => (
                        <div key={b.toddlerLevel} className="bg-slate-900 p-1.5 rounded border border-slate-800">
                          <span className="text-sky-300 font-bold">Lvl {b.toddlerLevel}:</span> {b.childLevelCompleted}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Standard Skills Grid Browsing */
            <div className="space-y-4">
              {/* Filter and Search Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                <div className="flex-1 min-w-[220px]">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="🔍 Search skills, packs, or mentoring keywords (e.g. Archeology, Swordsmanship, Pottery)..."
                    className="w-full bg-slate-800 border border-slate-700 text-slate-100 text-xs px-3 py-2 rounded-lg focus:outline-none focus:border-sky-500 placeholder-slate-500"
                  />
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-slate-400 font-semibold">Filter by Pack:</span>
                  <select
                    value={selectedPackFilter}
                    onChange={(e) => setSelectedPackFilter(e.target.value)}
                    className="bg-slate-800 border border-slate-700 text-slate-100 text-xs px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-sky-500 font-medium"
                  >
                    {uniquePacks.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Skills Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSkills.map(skill => {
                  const isSelected = selectedSkill?.id === skill.id;
                  return (
                    <div
                      key={skill.id}
                      onClick={() => setSelectedSkill(isSelected ? null : skill)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected 
                          ? 'bg-slate-850 border-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.25)]' 
                          : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'
                      }`}
                    >
                      <div>
                        {/* Top Meta */}
                        <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-slate-800">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getPackBadgeStyle(skill.pack)}`}>
                            {skill.pack}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getSkillTypeBadge(skill)}`}>
                            Max Level {skill.maxLevel}
                          </span>
                        </div>

                        {/* Title and Icon */}
                        <div className="flex items-center gap-2.5 mb-2">
                          <span className="text-2xl p-1 bg-slate-900 rounded-lg border border-slate-800">{skill.icon}</span>
                          <div>
                            <h3 className="font-extrabold text-white text-base leading-tight">
                              {skill.name}
                            </h3>
                            <span className="text-[11px] text-slate-400">
                              {skill.skillType}
                            </span>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-xs text-slate-300 line-clamp-3 mb-2.5 leading-relaxed">
                          {skill.description}
                        </p>

                        {/* How to Improve & Mentoring */}
                        <div className="space-y-1 text-[11px] bg-slate-900/90 p-2.5 rounded-lg border border-slate-800/80 mb-2">
                          <div className="text-slate-300">
                            <span className="text-sky-400 font-semibold">How to Improve: </span>
                            {skill.howToImprove}
                          </div>
                          {skill.mentorLevel !== null ? (
                            <div className="text-amber-300/90 pt-1 border-t border-slate-800">
                              <span className="font-semibold text-amber-200">Mentoring: </span>
                              Can mentor at Level {skill.mentorLevel} from {skill.mentorFrom || 'associated equipment'}.
                            </div>
                          ) : (
                            skill.mentorFrom && (
                              <div className="text-amber-300/90 pt-1 border-t border-slate-800">
                                <span className="font-semibold text-amber-200">Mentoring: </span>
                                Can mentor from {skill.mentorFrom}.
                              </div>
                            )
                          )}
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2 text-[11px]">
                        <span className="text-slate-400 font-medium">
                          Stages: {skill.targetStages.join(', ')}
                        </span>
                        {currentSim && onApplySkillToSim && (
                          <button
                            className="bg-sky-600 hover:bg-sky-500 text-white font-bold px-2.5 py-1 rounded-md transition-all shadow"
                            onClick={(e) => {
                              e.stopPropagation();
                              onApplySkillToSim(currentSim.id, skill.name);
                            }}
                            title={`Assign ${skill.name} as hobby/primary skill to Sim ${currentSim.id}`}
                          >
                            Set on Sim {currentSim.id}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredSkills.length === 0 && (
                <div className="text-center py-12 text-slate-400 text-sm italic">
                  No skills matched your search criteria "{searchQuery}".
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-950 px-6 py-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div>
            <span>Showing <strong className="text-slate-200">{filteredSkills.length}</strong> skills</span>
            {selectedPackFilter !== 'All' && <span> • Filtered by <strong className="text-sky-300">{selectedPackFilter}</strong></span>}
          </div>
          <button
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-4 py-1.5 rounded-lg transition-all"
            onClick={onClose}
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
