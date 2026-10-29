import React from 'react';
import { db, childMultiSkillConfig, skillsByName } from '../data/simData';
import { roll } from '../utils/generator';
import { 
  getAspirationRuleCheck, 
  generationGoalsList, 
  miscFunList, 
  conventionalCareersList, 
  unconventionalCareersList, 
  maritalStatuses 
} from '../data/legacyChallengeData';

interface QuickRollersProps {
  onLog: (text: string) => void;
  onUpdateLastRolled: (skill: string, job: string, asp: string) => void;
}

export const QuickRollers: React.FC<QuickRollersProps> = ({ onLog, onUpdateLastRolled }) => {
  const [age, setAge] = React.useState("Young Adult");
  const [log, setLog] = React.useState<string[]>([]);

  const appendToLog = (text: string) => {
    const entry = `[${new Date().toLocaleTimeString()}] ${text}`;
    setLog((prev) => [entry, ...prev]);
    onLog(text);
  };

  const handleRollSkill = () => {
    if (age === "Toddler") {
      const toddlerSkill = roll(db.toddlerSkills);
      const info = skillsByName[toddlerSkill];
      onUpdateLastRolled(toddlerSkill, "N/A", "N/A");
      appendToLog(`Rolled Toddler Fundamental: <span class="text-amber-300 font-bold">${info?.icon || '👶'} ${toddlerSkill}</span> (Max Lvl ${info?.maxLevel || 5}${info?.correspondingChildSkill ? ` ➔ Child ${info.correspondingChildSkill}` : ''})`);
      return;
    }
    if (age === "Child") {
      const childSkill = roll(db.childSkills);
      const conf = (childMultiSkillConfig as any)[childSkill];
      onUpdateLastRolled(childSkill, "N/A", "N/A");
      if (conf) {
        appendToLog(`Rolled Child Skill: <span class="text-sky-300 font-bold">${conf.icon} ${childSkill}</span> [Related Aspiration: ${conf.aspiration} • Unlocks: ${conf.unlockedAdultSkills.join(', ')}]`);
      } else {
        appendToLog(`Rolled Child Skill: ${childSkill}`);
      }
      return;
    }
    if (age === "Horse") {
      const horseSkill = roll(db.horseSkills);
      const info = skillsByName[horseSkill];
      onUpdateLastRolled(horseSkill, "N/A", "N/A");
      appendToLog(`Rolled Horse Skill: <span class="text-amber-400 font-bold">🐎 ${horseSkill}</span> (Max Lvl 10 • Horse Ranch)`);
      return;
    }
    const skill = roll(db.adultSkills);
    const info = skillsByName[skill];
    onUpdateLastRolled(skill, "N/A", "N/A");
    appendToLog(`Rolled ${age} Skill: <span class="text-emerald-300 font-bold">${info?.icon || '⚡'} ${skill}</span> (Max Lvl ${info?.maxLevel || 10} • ${info?.pack || 'The Sims 4'})`);
  };

  const handleRollJob = () => {
    let job = "N/A";
    if (age === "Toddler" || age === "Horse") job = `N/A (${age})`;
    else if (age === "Child") job = "N/A (Child)";
    else if (age === "Teen") job = roll(["Part-Time: Fast Food", "Part-Time: Barista", "Part-Time: Retail", "Student: High School", "Part-Time: Young Noble"]);
    else job = roll(db.allCareers);
    onUpdateLastRolled("N/A", job, "N/A");
    appendToLog(`Rolled ${age} Job: ${job}`);
  };

  const handleRollAsp = () => {
    let asp = "N/A";
    if (age === "Toddler" || age === "Horse") asp = `N/A (${age})`;
    else if (age === "Child") asp = roll(db.aspirationsChild);
    else if (age === "Teen") asp = roll([...db.aspirationsTeen, ...db.aspirationsAdult]);
    else asp = roll(db.aspirationsAdult);
    onUpdateLastRolled("N/A", "N/A", asp);
    const rule = getAspirationRuleCheck(asp);
    if (rule.careerRule) {
      appendToLog(`Rolled ${age} Aspiration: <span class="text-amber-300 font-bold">${asp}</span> <span class="text-rose-300 text-xs">[💼 Requires: ${rule.careerRule.description}]</span>`);
    } else {
      appendToLog(`Rolled ${age} Aspiration: <span class="text-sky-300 font-bold">${asp}</span>`);
    }
  };

  const handleClear = () => {
    setLog([]);
  };

  return (
    <div className="mt-8 pt-5 border-t-2 border-slate-700">
      <h2 className="text-center text-slate-400 text-base uppercase mb-4 tracking-wider">Standalone Rollers (Logs)</h2>
      <div className="flex gap-4 mb-4 flex-wrap items-center">
        <select
          className="bg-slate-700 text-slate-50 p-3 rounded-lg text-base font-bold flex-1 min-w-[120px]"
          value={age}
          onChange={(e) => setAge(e.target.value)}
        >
          <option value="Toddler">Toddler</option>
          <option value="Child">Child</option>
          <option value="Teen">Teen</option>
          <option value="Young Adult">Young Adult</option>
          <option value="Adult">Adult</option>
          <option value="Elder">Elder</option>
          <option value="Horse">Horse (Pet)</option>
        </select>
        <button className="bg-slate-600 text-slate-50 px-4 py-3 rounded-lg font-bold hover:bg-slate-500 transition-all flex-1 min-w-[100px]" onClick={handleRollSkill}>Roll Skill</button>
        <button className="bg-slate-600 text-slate-50 px-4 py-3 rounded-lg font-bold hover:bg-slate-500 transition-all flex-1 min-w-[100px]" onClick={handleRollJob}>Roll Job</button>
        <button className="bg-slate-600 text-slate-50 px-4 py-3 rounded-lg font-bold hover:bg-slate-500 transition-all flex-1 min-w-[100px]" onClick={handleRollAsp}>Roll Aspiration</button>
        <button className="bg-red-900 text-red-300 px-4 py-3 rounded-lg font-bold hover:bg-red-800 transition-all flex-[0.3] min-w-[80px]" onClick={handleClear}>Clear</button>
      </div>

      {/* Random Legacy Challenge Quick Standalone Rollers */}
      <div className="flex gap-2.5 mb-4 flex-wrap items-center">
        <span className="text-xs font-bold text-amber-400 uppercase tracking-wide flex items-center gap-1.5 mr-1">
          <span>👑</span>
          <span>Legacy Rolls:</span>
        </span>
        <button 
          className="bg-amber-950/80 hover:bg-amber-800 text-amber-300 border border-amber-600/50 px-3 py-2 rounded-lg text-xs font-bold transition-all shadow"
          onClick={() => {
            const dice = Math.floor(Math.random() * 80) + 1;
            const goal = generationGoalsList.find(g => g.id === dice) || generationGoalsList[0];
            const sealedNote = goal.id === 12 ? ' <span class="text-amber-400 font-semibold">[🔒 Noted on Heir\'s challenges: Aspects cannot be rolled before aging as Adult]</span>' : '';
            appendToLog(`👑 Rolled <strong>Generation Goal #${goal.id}:</strong> <span class="text-amber-300 font-bold">${goal.title}</span> [${goal.pack}] — ${goal.description}${sealedNote}`);
          }}
        >
          🎯 Roll Goal (1–80)
        </button>
        <button 
          className="bg-rose-950/80 hover:bg-rose-800 text-rose-300 border border-rose-600/50 px-3 py-2 rounded-lg text-xs font-bold transition-all shadow"
          onClick={() => {
            const dice = Math.floor(Math.random() * 78) + 1;
            const fun = miscFunList.find(f => f.id === dice) || miscFunList[0];
            appendToLog(`🎪 Rolled <strong>Misc Fun #${fun.id}:</strong> <span class="text-rose-300 font-bold">${fun.title}</span> [${fun.pack}] — ${fun.description}`);
          }}
        >
          🎪 Roll Misc Fun (1–78)
        </button>
        <button 
          className="bg-emerald-950/80 hover:bg-emerald-800 text-emerald-300 border border-emerald-600/50 px-3 py-2 rounded-lg text-xs font-bold transition-all shadow"
          onClick={() => {
            const dice = Math.floor(Math.random() * 82) + 1;
            const u = unconventionalCareersList.find(c => c.id === dice) || unconventionalCareersList[0];
            appendToLog(`💼 Rolled <strong>Unconventional Career #${u.id}:</strong> <span class="text-emerald-300 font-bold">${u.name}</span> [${u.pack}] — ${u.description}`);
          }}
        >
          🎨 Unconventional Job (1–82)
        </button>
        <button 
          className="bg-sky-950/80 hover:bg-sky-800 text-sky-300 border border-sky-600/50 px-3 py-2 rounded-lg text-xs font-bold transition-all shadow"
          onClick={() => {
            const dice = Math.floor(Math.random() * 65) + 1;
            const c = conventionalCareersList.find(car => car.id === dice) || conventionalCareersList[0];
            appendToLog(`💼 Rolled <strong>Conventional Career #${c.id}:</strong> <span class="text-sky-300 font-bold">${c.name} (${c.branch})</span> [${c.pack}]`);
          }}
        >
          🏢 Conventional Job (1–65)
        </button>
        <button 
          className="bg-purple-950/80 hover:bg-purple-800 text-purple-300 border border-purple-600/50 px-3 py-2 rounded-lg text-xs font-bold transition-all shadow"
          onClick={() => {
            const dice = Math.floor(Math.random() * 54) + 1;
            const status = maritalStatuses.find(s => dice >= s.minRoll && dice <= s.maxRoll) || maritalStatuses[0];
            appendToLog(`💍 Rolled <strong>Marital Status [Dice ${dice}/54]:</strong> <span class="text-purple-300 font-bold">${status.title}</span> — ${status.description}`);
          }}
        >
          💍 Marital Status (1–54)
        </button>
      </div>
      <div className="max-h-48 overflow-y-auto bg-slate-900 p-3 rounded-lg border border-slate-700 text-sm text-slate-400">
        {log.map((entry, idx) => (
          <div key={idx} className="py-1 border-b border-slate-800 last:border-none" dangerouslySetInnerHTML={{ __html: entry.replace(/\[(.*?)\] (.*)/, '<strong>[$1]</strong> $2') }} />
        ))}
      </div>
    </div>
  );
};
