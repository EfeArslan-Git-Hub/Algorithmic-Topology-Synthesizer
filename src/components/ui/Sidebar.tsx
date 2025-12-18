import type { ChangeEvent } from 'react';

interface SidebarProps {
    algorithm: 'bsp' | 'ca';
    onAlgorithmChange: (algo: 'bsp' | 'ca') => void;
    params: {
        width: number;
        height: number;
        iterations: number;
        smoothing: number;
    };
    onParamChange: (key: string, value: number) => void;
    onGenerate: () => void;
    onSolve: () => void;
    solverAlgorithm: 'bfs' | 'astar';
    onSolverChange: (algo: 'bfs' | 'astar') => void;
}

export const Sidebar = ({ algorithm, onAlgorithmChange, params, onParamChange, onGenerate, onSolve, solverAlgorithm, onSolverChange }: SidebarProps) => {

    const handleChange = (key: string) => (e: ChangeEvent<HTMLInputElement>) => {
        onParamChange(key, parseInt(e.target.value, 10));
    };

    return (
        <aside className="w-80 bg-[#1a1a1a] border-l border-white/10 flex flex-col h-full shadow-2xl z-20">
            {/* Header */}
            <div className="p-5 border-b border-white/5">
                <h2 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                    Control Panel
                </h2>
            </div>

            <div className="flex-1 overflow-y-auto p-5 scrollbar-thin scrollbar-thumb-gray-800">
                {/* 1. Generation Settings */}
                <section className="mb-6 space-y-4">
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
                            Generator Algorithm
                        </label>
                        <select
                            value={algorithm}
                            onChange={(e) => onAlgorithmChange(e.target.value as 'bsp' | 'ca')}
                            className="w-full bg-[#252525] border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                        >
                            <option value="bsp">Binary Space Partitioning</option>
                            <option value="ca">Cellular Automata</option>
                        </select>
                        <p className="mt-2 text-[10px] text-gray-400 leading-tight">
                            {algorithm === 'bsp'
                                ? "Creates structured rooms and corridors (Dungeon/Office)."
                                : "Simulates organic growth for caves and terrain."}
                        </p>
                    </div>

                    {/* Parameters Grid */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-[#222] p-2 rounded border border-white/5">
                            <label className="flex justify-between text-[10px] text-gray-400 mb-1">
                                Width: <span className="text-blue-400">{params.width}</span>
                            </label>
                            <input
                                type="range" min="100" max="1000" step="50"
                                value={params.width}
                                onChange={handleChange('width')}
                                className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                            />
                        </div>
                        <div className="bg-[#222] p-2 rounded border border-white/5">
                            <label className="flex justify-between text-[10px] text-gray-400 mb-1">
                                Height: <span className="text-blue-400">{params.height}</span>
                            </label>
                            <input
                                type="range" min="100" max="1000" step="50"
                                value={params.height}
                                onChange={handleChange('height')}
                                className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                            />
                        </div>
                    </div>

                    <div className="bg-[#222] p-2 rounded border border-white/5">
                        <label className="flex justify-between text-[10px] text-gray-400 mb-1">
                            {algorithm === 'bsp' ? 'Split Depth' : 'Simulation Steps'}: <span className="text-green-400">{params.iterations}</span>
                        </label>
                        <input
                            type="range"
                            min="1"
                            max={algorithm === 'bsp' ? "8" : "20"}
                            value={params.iterations}
                            onChange={(e) => onParamChange('iterations', parseInt(e.target.value, 10))}
                            className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500"
                        />
                    </div>
                </section>

                <hr className="border-white/5 mb-6" />

                {/* 2. Pathfinding Settings */}
                <section className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
                            Solver Experiment
                        </label>
                        <select
                            value={solverAlgorithm}
                            onChange={(e) => onSolverChange(e.target.value as 'bfs' | 'astar')}
                            className="w-full bg-[#252525] border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
                        >
                            <option value="bfs">BFS (Flooding)</option>
                            <option value="astar">A* (Heuristic)</option>
                        </select>

                        <div className="mt-2 flex gap-2 items-start bg-[#222] p-2 rounded border border-purple-500/20">
                            <div className="shrink-0 w-1 h-full bg-purple-500/50 rounded-full self-stretch min-h-[40px]" />
                            <p className="text-[10px] text-gray-400 leading-relaxed">
                                {solverAlgorithm === 'bfs'
                                    ? "Classic Flood Fill. It guarantees finding the shortest path by exploring all directions equally. Good for unweighted maps, but computationally expensive as it visits almost every node."
                                    : "Heuristic Search (Manhattan Distance). It calculates the distance to the target and prioritizes nodes that are closer. Much faster and more efficient as it ignores irrelevant paths."}
                            </p>
                        </div>
                    </div>
                </section>
            </div>

            {/* Actions Footer */}
            <div className="p-5 border-t border-white/5 bg-[#1a1a1a]">
                <button
                    onClick={onGenerate}
                    className="w-full bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-sm font-bold py-3 px-4 rounded-lg transition-all shadow-lg shadow-blue-900/20 mb-2"
                >
                    Generate Map
                </button>
                <button
                    onClick={onSolve}
                    className="w-full bg-[#252525] hover:bg-[#333] active:scale-95 text-purple-400 hover:text-purple-300 text-sm font-bold py-3 px-4 rounded-lg border border-white/5 hover:border-purple-500/50 transition-all flex items-center justify-center gap-2"
                >
                    <span>▶ Run Solver</span>
                </button>
            </div>
        </aside>
    );
};
