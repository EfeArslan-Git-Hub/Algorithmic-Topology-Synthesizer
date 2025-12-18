import type { GenerationResult, Node, PathResult } from '../interfaces/IGenerator';

export class AStarPathfinder {
    /**
     * Finds a path using A* algorithm (Heuristic: Manhattan Distance).
     * Much faster and more "directional" than BFS.
     */
    public findPath(data: GenerationResult): PathResult {
        console.log("AStarPathfinder: findPath called");
        if (!data.grid) {
            console.warn("AStarPathfinder: No grid found in data");
            return { path: [], visited: [] };
        }
        return this.solveGrid(data.grid);
    }

    private solveGrid(grid: number[][]): PathResult {
        const width = grid.length;
        const height = grid[0].length;
        console.log(`AStarPathfinder: Solving grid ${width}x${height}`);

        // 1. Find Start and End (Identical logic to BFS)
        let start: { x: number, y: number } | null = null;
        let end: { x: number, y: number } | null = null;

        for (let x = 0; x < width && !start; x++) {
            for (let y = 0; y < height && !start; y++) {
                if (grid[x][y] === 0) start = { x, y };
            }
        }
        for (let x = width - 1; x >= 0 && !end; x--) {
            for (let y = height - 1; y >= 0 && !end; y--) {
                if (grid[x][y] === 0) end = { x, y };
            }
        }

        console.log("AStarPathfinder: Start", start, "End", end);

        if (!start || !end) return { path: [], visited: [] };

        // 2. A* Sets
        const openList: { x: number, y: number, f: number, g: number }[] = [];
        const cameFrom = new Map<string, { x: number, y: number }>();
        const gScore = new Map<string, number>();
        const closedSet = new Set<string>(); // Keep track for visualization
        const visitedNodes: Node[] = [];

        const key = (x: number, y: number) => `${x},${y}`;
        const heuristic = (x1: number, y1: number, x2: number, y2: number) => Math.abs(x1 - x2) + Math.abs(y1 - y2);

        const startK = key(start.x, start.y);

        gScore.set(startK, 0);
        openList.push({ x: start.x, y: start.y, f: heuristic(start.x, start.y, end.x, end.y), g: 0 });

        while (openList.length > 0) {
            openList.sort((a, b) => a.f - b.f);
            const current = openList.shift()!;
            const cKey = key(current.x, current.y);

            // Track visited for visualization
            if (!closedSet.has(cKey)) {
                closedSet.add(cKey);
                visitedNodes.push({ id: `v-${cKey}`, x: current.x, y: current.y, type: 'cell', active: false });
            }

            if (current.x === end.x && current.y === end.y) {
                const path: Node[] = [];
                let currC = { x: end.x, y: end.y };
                while (currC) {
                    path.unshift({
                        id: `p-${currC.x}-${currC.y}`,
                        x: currC.x,
                        y: currC.y,
                        type: 'cell',
                        active: true
                    });
                    const pKey = key(currC.x, currC.y);
                    if (!cameFrom.has(pKey)) break;
                    currC = cameFrom.get(pKey)!;
                    if (currC.x === start.x && currC.y === start.y) {
                        // Add start
                        path.unshift({ id: `start`, x: start.x, y: start.y, type: 'cell', active: true });
                        break;
                    }
                }
                return { path, visited: visitedNodes };
            }

            const neighbors = [
                { x: current.x + 1, y: current.y },
                { x: current.x - 1, y: current.y },
                { x: current.x, y: current.y + 1 },
                { x: current.x, y: current.y - 1 }
            ];

            for (const n of neighbors) {
                if (n.x >= 0 && n.x < width && n.y >= 0 && n.y < height && grid[n.x][n.y] === 0) {
                    const nKey = key(n.x, n.y);
                    const tentativeG = (gScore.get(cKey) ?? Infinity) + 1;

                    if (tentativeG < (gScore.get(nKey) ?? Infinity)) {
                        cameFrom.set(nKey, current);
                        gScore.set(nKey, tentativeG);
                        const f = tentativeG + heuristic(n.x, n.y, end.x, end.y);

                        openList.push({ x: n.x, y: n.y, f: f, g: tentativeG });
                    }
                }
            }
        }

        return { path: [], visited: visitedNodes };
    }
}
