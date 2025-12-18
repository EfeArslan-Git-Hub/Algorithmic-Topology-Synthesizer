import { useState, useCallback, useEffect } from 'react';
import { Sidebar } from './components/ui/Sidebar';
import { CanvasViewport } from './components/visualizer/CanvasViewport';
import { BSPGenerator } from './core/algorithms/BSPGenerator';
import { CellularAutomataGenerator } from './core/algorithms/CellularAutomataGenerator';
import type { GenerationResult, Node } from './core/interfaces/IGenerator';
import { BFSPathfinder } from './core/algorithms/BFSPathfinder';
import { AStarPathfinder } from './core/algorithms/AStarPathfinder';

const bspGenerator = new BSPGenerator();
const caGenerator = new CellularAutomataGenerator();
const bfsPathfinder = new BFSPathfinder();
const aStarPathfinder = new AStarPathfinder();

function App() {
  const [algorithm, setAlgorithm] = useState<'bsp' | 'ca'>('bsp');
  const [solverAlgorithm, setSolverAlgorithm] = useState<'bfs' | 'astar'>('bfs');

  const [params, setParams] = useState({
    width: 600,
    height: 400,
    iterations: 5,
    smoothing: 0
  });

  const [data, setData] = useState<GenerationResult>({ nodes: [], edges: [], grid: undefined });
  const [path, setPath] = useState<Node[]>([]);
  const [visitedNodes, setVisitedNodes] = useState<Node[]>([]); // New state for visited visualization

  const handleParamChange = (key: string, value: number) => {
    setParams(prev => ({ ...prev, [key]: value }));
  };

  const generate = useCallback(() => {
    const genParams = {
      width: params.width,
      height: params.height,
      iterations: params.iterations
    };

    let result: GenerationResult;
    if (algorithm === 'bsp') {
      result = bspGenerator.generate(genParams);
    } else {
      result = caGenerator.generate(genParams);
    }
    setData(result);
    setPath([]); // Reset path on new generation
    setVisitedNodes([]);
  }, [algorithm, params]);

  const solve = useCallback(() => {
    if (data) {
      let result: { path: Node[], visited: Node[] };

      if (solverAlgorithm === 'bfs') {
        result = bfsPathfinder.findPath(data);
      } else {
        result = aStarPathfinder.findPath(data);
      }

      setPath(result.path);
      setVisitedNodes(result.visited);
    }
  }, [data, solverAlgorithm]);

  // Generate on mount and when algo changes
  useEffect(() => {
    generate();
  }, [generate]);

  return (
    <div className="flex h-screen bg-[#111] text-white overflow-hidden font-inter">
      <Sidebar
        algorithm={algorithm}
        onAlgorithmChange={(algo) => {
          setAlgorithm(algo);
          // Optionally reset params or keep them
        }}
        params={params}
        onParamChange={handleParamChange}
        onGenerate={generate}
        onSolve={solve}
        solverAlgorithm={solverAlgorithm}
        onSolverChange={(algo) => {
          setSolverAlgorithm(algo);
          setPath([]); // Clear path to highlight difference
        }}
      />

      <main className="flex-1 p-8 flex flex-col items-center justify-center relative">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-800/20 via-[#111] to-[#111] pointer-events-none" />

        <header className="mb-8 z-10 text-center">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 mb-2">
            Algorithmic Topology Synthesizer
          </h1>
          <p className="text-gray-400 text-sm mb-4">
            Visualizing {algorithm === 'bsp' ? 'Binary Space Partitioning' : 'Cellular Automata'}
          </p>
        </header>

        <div className="z-10 shadow-2xl shadow-blue-900/10 mb-8">
          <CanvasViewport
            data={data}
            path={path}
            visited={visitedNodes}
            width={params.width}
            height={params.height}
          />
        </div>

        <footer className="z-10 text-gray-500 text-sm">
          Made by <a href="https://efe-arslan-portfolio.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors">Efe Arslan</a>
        </footer>
      </main>
    </div>
  );
}

export default App;
