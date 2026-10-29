import React from 'react';
import { RelationMode } from '../types';

interface ControlPanelProps {
  onAddHuman: (age: string) => void;
  onAddPet: (age: string) => void;
  onGenerate: (count: number | null) => void;
  onMemorize: () => void;
  relationMode: RelationMode;
  onRelationModeChange: (mode: RelationMode) => void;
  onOpenChildAspirationsGuide?: () => void;
  onOpenSkillsGuide?: () => void;
  // 2/3 Chain Roll Settings (Easy Editing)
  chainRollProbabilityInput: string;
  chainRollProbability: number;
  onChainRollProbabilityChange: (inputVal: string, numericVal: number) => void;
  chainRollCap: number;
  onChainRollCapChange: (cap: number) => void;
}

function parseFactorInput(str: string): number {
  str = str.trim();
  if (str.includes('/')) {
    const parts = str.split('/');
    const n = parseFloat(parts[0]);
    const d = parseFloat(parts[1]);
    if (!isNaN(n) && !isNaN(d) && d !== 0) {
      return n / d;
    }
  }
  const parsed = parseFloat(str);
  return isNaN(parsed) ? 2 / 3 : Math.max(0.01, Math.min(0.99, parsed));
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  onAddHuman,
  onAddPet,
  onGenerate,
  onMemorize,
  relationMode,
  onRelationModeChange,
  onOpenChildAspirationsGuide,
  onOpenSkillsGuide,
  chainRollProbabilityInput,
  chainRollProbability,
  onChainRollProbabilityChange,
  chainRollCap,
  onChainRollCapChange,
}) => {
  const [addAge, setAddAge] = React.useState("Teen");
  const [addPetAge, setAddPetAge] = React.useState("Adult");
  const [sizeMode, setSizeMode] = React.useState<'random' | 'upto' | 'exact' | 'chain'>('random');
  const [householdSize, setHouseholdSize] = React.useState<number>(4);

  const handleRollHousehold = () => {
    if (sizeMode === 'random') {
      const randSize = Math.floor(Math.random() * 8) + 1;
      onGenerate(randSize);
    } else if (sizeMode === 'upto') {
      const max = Math.min(8, Math.max(1, householdSize));
      const randSize = Math.floor(Math.random() * max) + 1;
      onGenerate(randSize);
    } else if (sizeMode === 'exact') {
      const exact = Math.min(8, Math.max(1, householdSize));
      onGenerate(exact);
    } else {
      onGenerate(null); // Triggers chain roll capped at 8
    }
  };

  const getRollButtonText = () => {
    switch (sizeMode) {
      case 'random':
        return '🎲 Roll Household (Random 1–8 Sims)';
      case 'upto':
        return `🎲 Roll Household (Up to ${householdSize} Sims)`;
      case 'exact':
        return `🎲 Roll Household (Exactly ${householdSize} Sims)`;
      case 'chain':
        return `🎲 Roll Household (${chainRollProbabilityInput} Chain • 1–8 Sims)`;
    }
  };

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2.5">
        <div className="flex items-center gap-2 flex-wrap">
          {onOpenSkillsGuide && (
            <button
              className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white px-4 py-2 text-xs font-bold rounded-lg shadow-md transition-all flex items-center gap-1.5 border border-emerald-400/40 hover:scale-105"
              onClick={onOpenSkillsGuide}
              title="Browse complete Sims 4 Skills Guide (Base Game, 29 Packs, Fundamentals & Toddler Aging Conversion)"
            >
              <span>🎓</span>
              <span>Skills Guide & Master List</span>
              <span className="bg-black/30 text-[10px] px-1.5 py-0.5 rounded-full font-mono">
                30 Packs
              </span>
            </button>
          )}

          {onOpenChildAspirationsGuide && (
            <button
              className="bg-gradient-to-r from-sky-600 via-indigo-600 to-purple-600 hover:from-sky-500 hover:to-purple-500 text-white px-4 py-2 text-xs font-bold rounded-lg shadow-md transition-all flex items-center gap-1.5 border border-sky-400/40 hover:scale-105"
              onClick={onOpenChildAspirationsGuide}
              title="Browse all 8 categorized Child Aspirations, Milestones & Reward Traits"
            >
              <span>🧒</span>
              <span>Child Aspirations Guide (8)</span>
              <span className="bg-black/30 text-[10px] px-1.5 py-0.5 rounded-full font-mono">
                TS4
              </span>
            </button>
          )}
        </div>

        <div className="flex gap-2.5 flex-wrap ml-auto">
          <select
            className="bg-slate-700 text-slate-50 text-xs p-2 rounded border border-slate-600 font-medium"
            value={addAge}
            onChange={(e) => setAddAge(e.target.value)}
          >
            <option value="Infant">Infant</option>
            <option value="Toddler">Toddler</option>
            <option value="Child">Child</option>
            <option value="Teen">Teen</option>
            <option value="Young Adult">Young Adult</option>
            <option value="Adult">Adult</option>
            <option value="Elder">Elder</option>
          </select>
          <button
            className="bg-slate-600 text-slate-50 px-4 py-2 text-xs font-bold rounded hover:bg-slate-500 transition-all shadow-md"
            onClick={() => onAddHuman(addAge)}
          >
            ➕ Add Human
          </button>
          <button
            className="bg-purple-600 text-slate-50 px-4 py-2 text-xs font-bold rounded hover:bg-purple-500 transition-all shadow-md"
            onClick={() => onAddHuman("Random")}
          >
            🎲 Add Random Sim
          </button>
          
          <div className="w-px bg-slate-600 mx-2 hidden sm:block"></div>

          <select
            className="bg-slate-700 text-slate-50 text-xs p-2 rounded border border-slate-600 font-medium"
            value={addPetAge}
            onChange={(e) => setAddPetAge(e.target.value)}
          >
            <option value="Baby">Baby</option>
            <option value="Adult">Adult</option>
            <option value="Elder">Elder</option>
          </select>
          <button
            className="bg-slate-600 text-slate-50 px-4 py-2 text-xs font-bold rounded hover:bg-slate-500 transition-all shadow-md"
            onClick={() => onAddPet(addPetAge)}
          >
            ➕ Add Pet
          </button>
        </div>
      </div>

      {/* Household Size Controls (1 to 8 Sims strictly) */}
      <div className="bg-slate-900/90 border border-slate-700/80 p-4 rounded-xl mb-4 shadow-lg">
        <div className="flex items-center justify-between gap-3 flex-wrap pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xl">👥</span>
            <div>
              <div className="font-extrabold text-sm text-sky-400 uppercase tracking-wide flex items-center gap-2">
                Household Size Generator
                <span className="text-[10px] bg-sky-950 text-sky-300 border border-sky-600/50 px-2 py-0.5 rounded font-mono font-bold">
                  Strict 1–8 Sims Cap
                </span>
              </div>
              <div className="text-xs text-slate-400">
                Choose between a fully random roll, an "Up to X" ceiling, an exact count, or a probability chain roll.
              </div>
            </div>
          </div>

          {/* Mode Selector Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              type="button"
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 ${
                sizeMode === 'random'
                  ? 'bg-sky-500 text-slate-950 shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
              onClick={() => setSizeMode('random')}
            >
              <span>🎲</span>
              <span>Random (1–8)</span>
            </button>

            <button
              type="button"
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 ${
                sizeMode === 'upto'
                  ? 'bg-sky-500 text-slate-950 shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
              onClick={() => setSizeMode('upto')}
            >
              <span>📈</span>
              <span>Up to X</span>
            </button>

            <button
              type="button"
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 ${
                sizeMode === 'exact'
                  ? 'bg-sky-500 text-slate-950 shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
              onClick={() => setSizeMode('exact')}
            >
              <span>🎯</span>
              <span>Exact X</span>
            </button>

            <button
              type="button"
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 ${
                sizeMode === 'chain'
                  ? 'bg-sky-500 text-slate-950 shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
              onClick={() => setSizeMode('chain')}
            >
              <span>⛓️</span>
              <span>2/3 Chain</span>
            </button>
          </div>
        </div>

        {/* Dynamic Controls based on selected mode */}
        {sizeMode === 'random' && (
          <div className="mt-3 p-3 bg-slate-800/60 rounded-lg border border-slate-700/60 flex items-center justify-between flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-2 text-slate-200">
              <span className="text-lg">🎲</span>
              <div>
                <span className="font-bold text-sky-300">Random 1–8 Sims Mode:</span> Each roll will pick a completely random number of Sims from 1 to 8.
              </div>
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              Roll Range: [1, 2, 3, 4, 5, 6, 7, 8] Sims
            </div>
          </div>
        )}

        {(sizeMode === 'upto' || sizeMode === 'exact') && (
          <div className="mt-3 p-3 bg-slate-800/60 rounded-lg border border-slate-700/60">
            <div className="flex items-center justify-between gap-3 flex-wrap mb-2">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <span>{sizeMode === 'upto' ? '📈' : '🎯'}</span>
                <span>
                  {sizeMode === 'upto' ? 'Select Maximum Cap (Rolls 1 to X):' : 'Select Exact Household Size:'}
                </span>
              </span>
              <span className="text-xs font-mono font-bold text-sky-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
                {sizeMode === 'upto' ? `Up to ${householdSize} Sims (1–${householdSize})` : `Exactly ${householdSize} Sims`}
              </span>
            </div>

            {/* 1 to 8 Number Buttons */}
            <div className="grid grid-cols-8 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                <button
                  key={num}
                  type="button"
                  className={`py-2 text-xs font-extrabold rounded-lg border transition-all ${
                    householdSize === num
                      ? 'bg-sky-500 text-slate-950 border-sky-300 shadow-md scale-105'
                      : 'bg-slate-900/90 text-slate-300 border-slate-700 hover:border-slate-500 hover:text-white hover:bg-slate-800'
                  }`}
                  onClick={() => setHouseholdSize(num)}
                >
                  {num} {num === 1 ? 'Sim' : 'Sims'}
                </button>
              ))}
            </div>

            <div className="mt-2 text-[11px] text-slate-400">
              {sizeMode === 'upto'
                ? `Will randomly generate anywhere between 1 and ${householdSize} Sims (never exceeding ${householdSize}).`
                : `Will generate exactly ${householdSize} Sims in the household.`}
            </div>
          </div>
        )}

        {sizeMode === 'chain' && (
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            {/* Probability Input */}
            <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700/60">
              <div className="font-bold text-slate-300 uppercase text-[10px] mb-1 flex justify-between">
                <span>Roll Probability</span>
                <span className="text-sky-300 font-mono">{(chainRollProbability * 100).toFixed(1)}%</span>
              </div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <input
                  type="text"
                  className="bg-slate-900 text-sky-200 font-bold px-2 py-1 rounded border border-slate-600 w-20 text-center focus:border-sky-400 focus:outline-none"
                  value={chainRollProbabilityInput}
                  onChange={(e) => {
                    const str = e.target.value;
                    const num = parseFactorInput(str);
                    onChainRollProbabilityChange(str, num);
                  }}
                  placeholder="2/3"
                  title="Type 2/3, 1/2, 3/4, or decimals like 0.67"
                />
                <span className="text-slate-400 text-[11px]">chance per next Sim</span>
              </div>
              {/* Presets */}
              <div className="flex items-center gap-1 flex-wrap">
                <button
                  type="button"
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold border transition-colors ${chainRollProbabilityInput === '2/3' ? 'bg-sky-600 text-white border-sky-400' : 'bg-slate-700 text-slate-300 border-slate-600 hover:text-white'}`}
                  onClick={() => onChainRollProbabilityChange('2/3', 2 / 3)}
                >
                  2/3 (Default)
                </button>
                <button
                  type="button"
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold border transition-colors ${chainRollProbabilityInput === '1/2' ? 'bg-sky-600 text-white border-sky-400' : 'bg-slate-700 text-slate-300 border-slate-600 hover:text-white'}`}
                  onClick={() => onChainRollProbabilityChange('1/2', 0.5)}
                >
                  1/2
                </button>
                <button
                  type="button"
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold border transition-colors ${chainRollProbabilityInput === '3/4' ? 'bg-sky-600 text-white border-sky-400' : 'bg-slate-700 text-slate-300 border-slate-600 hover:text-white'}`}
                  onClick={() => onChainRollProbabilityChange('3/4', 0.75)}
                >
                  3/4
                </button>
              </div>
            </div>

            {/* Maximum Limit (Strictly 1–8 Sims) */}
            <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700/60">
              <div className="font-bold text-slate-300 uppercase text-[10px] mb-1">Max Household Limit</div>
              <select
                className="bg-slate-900 text-slate-100 font-semibold text-xs p-1.5 rounded border border-slate-600 w-full mt-1"
                value={chainRollCap}
                onChange={(e) => onChainRollCapChange(parseInt(e.target.value))}
              >
                <option value={8}>8 Sims (Strict Sims 4 Cap)</option>
                <option value={6}>6 Sims Maximum</option>
                <option value={4}>4 Sims Maximum</option>
                <option value={2}>2 Sims Maximum</option>
              </select>
              <div className="text-[10px] text-slate-400 mt-1">
                Strictly capped at 8 Sims maximum. Chain roll terminates if probability check fails or cap is reached.
              </div>
            </div>

            {/* Cumulative Odds Breakdown */}
            <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700/60 flex flex-col justify-between">
              <div className="font-bold text-slate-300 uppercase text-[10px] mb-1">Cumulative Probability Chain</div>
              <div className="font-mono text-[11px] text-sky-300 leading-tight">
                Sim 1: 100% (Guaranteed)<br />
                Sim 2: {(chainRollProbability * 100).toFixed(1)}%<br />
                Sim 3: {(Math.pow(chainRollProbability, 2) * 100).toFixed(1)}%<br />
                Sim 4: {(Math.pow(chainRollProbability, 3) * 100).toFixed(1)}%<br />
                <span className="text-slate-400 text-[10px]">Strictly capped at 8 Sims maximum.</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-4 mt-5 flex-wrap items-center">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-slate-400 font-bold uppercase">Relationships in Rolls</label>
          <select
            className="bg-slate-700 text-slate-50 text-xs sm:text-sm p-3 rounded-xl border border-slate-600 h-[60px]"
            value={relationMode}
            onChange={(e) => onRelationModeChange(e.target.value as RelationMode)}
          >
            <option value="mixed">Mixed Co-living (Families & Roommates)</option>
            <option value="multiFamily">Multi-Family Co-living (Multiple Independent Families)</option>
            <option value="familyOnly">Single Extended Family (All Related)</option>
            <option value="unrelatedOnly">All Independent Roommates (Unrelated)</option>
          </select>
        </div>

        <button
          className="flex-2 bg-sky-400 text-slate-900 p-4 rounded-xl text-lg sm:text-xl font-extrabold uppercase tracking-wider hover:bg-sky-300 hover:shadow-[0_0_20px_rgba(56,189,248,0.4)] transition-all flex-grow min-w-[200px] h-[60px]"
          onClick={handleRollHousehold}
        >
          {getRollButtonText()}
        </button>
        <button
          className="flex-1 bg-slate-600 text-slate-50 p-4 rounded-xl text-lg font-bold hover:bg-slate-500 hover:shadow-[0_0_15px_rgba(100,116,139,0.4)] transition-all min-w-[150px] h-[60px]"
          onClick={onMemorize}
        >
          💾 Memorize Household
        </button>
      </div>
    </div>
  );
};
