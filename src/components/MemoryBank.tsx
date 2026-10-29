import React from 'react';
import { Memory } from '../types';

interface MemoryBankProps {
  memories: Memory[];
  onLoad: (index: number) => void;
  onImport: (memories: Memory[]) => void;
}

export const MemoryBank: React.FC<MemoryBankProps> = ({ memories, onLoad, onImport }) => {
  const handleExport = () => {
    if (memories.length === 0) {
      alert("Nothing to export! Memorize a household first.");
      return;
    }
    const dataStr = JSON.stringify(memories, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sim_memory_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (e) {
      try {
        const result = e.target?.result;
        if (typeof result !== 'string') return;
        
        const imported = JSON.parse(result);
        if (Array.isArray(imported)) {
          // Validate structure
          const isValid = imported.every((mem: any) => 
            mem.lot && 
            mem.household && Array.isArray(mem.household) &&
            mem.household.every((s: any) => 
              Array.isArray(s.traits) && 
              typeof s.asp === 'string' && 
              typeof s.hobby === 'string'
            )
          );

          if (isValid) {
            onImport(imported);
            console.log("Data imported successfully!");
          } else {
            console.error("Invalid file format: Data structure mismatch.");
            alert("Invalid file format: Imported data is missing required fields (traits, aspiration, or hobby).");
          }
        } else {
          console.error("Invalid file format: Expected an array of memories.");
          alert("Invalid file format: Expected an array of memories.");
        }
      } catch (err) {
        console.error("Invalid file format. Make sure you are using a previously exported JSON.", err);
      }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset input so same file can be selected again
  };

  return (
    <div className="mt-8 pt-5 border-t-2 border-slate-700">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-sky-400 text-lg uppercase font-bold m-0">Memorized Data Nodes</h2>
        <div className="flex gap-2.5">
          <button className="bg-slate-600 text-slate-50 px-3 py-1.5 text-xs font-bold rounded hover:bg-slate-500 transition-all" onClick={handleExport}>💾 Export Data</button>
          <label className="bg-slate-600 text-slate-50 px-3 py-1.5 text-xs font-bold rounded hover:bg-slate-500 transition-all cursor-pointer flex items-center">
            📂 Import Data
            <input type="file" className="hidden" accept=".json" onChange={handleImport} />
          </label>
        </div>
      </div>
      <div className="flex flex-col gap-2.5">
        {memories.length === 0 ? (
          <div className="text-slate-500 text-sm italic text-center p-4">No memories saved. Generate a household and click "Memorize" to save, or import a file.</div>
        ) : (
          memories.map((mem, index) => {
            const baseStr = mem.household[0].isPet ? mem.household[0].species : (mem.household[0].occult !== "None" ? mem.household[0].occult : "Human");
            const mainSims = mem.household.length > 0 ? (mem.household[0].ghost ? `Ghost ${baseStr}` : baseStr) : "Empty";
            return (
              <div key={index} className="bg-slate-800 p-4 rounded-lg border border-slate-700 cursor-pointer hover:border-sky-400 transition-all flex justify-between items-center" onClick={() => onLoad(index)}>
                <div className="text-sm text-slate-200">
                  <strong>📍 {mem.lot.world}</strong> {mem.lot.neighborhood ? `(${mem.lot.neighborhood})` : ''} {mem.lot.dwellingType ? `• ${mem.lot.dwellingType}` : ''} — {mem.household.length} Entity(s) ({mainSims}...)
                </div>
                <div className="text-slate-500 text-xs">Saved: {mem.timestamp}</div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
