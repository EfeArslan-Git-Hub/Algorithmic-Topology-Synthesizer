import type { GenerationResult, Node, PathResult } from '../interfaces/IGenerator';

export class BFSPathfinder {
    /**
     * Finds a path from start to end in the provided topology.
     * Uses simple BFS.
     */
    public findPath(data: GenerationResult): PathResult {
        if (data.grid) {
            return this.solveGrid(data.grid);
        } else if (data.nodes.length > 1) {
            // Force legacy to match interface
            const path = this.solveGraph(data);
            return { path, visited: [] };
        }
        return { path: [], visited: [] };
    }

    // Solve for Cellular Automata (2D Grid)
    private solveGrid(grid: number[][]): PathResult {
        const width = grid.length;
        const height = grid[0].length;

        // Find first open cell
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

        if (!start || !end) return { path: [], visited: [] };

        // BFS
        const queue: { x: number, y: number }[] = [start];
        const visitedSet = new Set<string>();
        const visitedNodes: Node[] = [];
        const parent = new Map<string, { x: number, y: number }>();

        const key = (p: { x: number, y: number }) => `${p.x},${p.y}`;
        visitedSet.add(key(start));

        let found = false;

        while (queue.length > 0) {
            const current = queue.shift()!;

            // Track visited
            visitedNodes.push({ id: `v-${current.x}-${current.y}`, x: current.x, y: current.y, type: 'cell', active: false });

            if (current.x === end.x && current.y === end.y) {
                found = true;
                break;
            }

            const neighbors = [
                { x: current.x + 1, y: current.y },
                { x: current.x - 1, y: current.y },
                { x: current.x, y: current.y + 1 },
                { x: current.x, y: current.y - 1 }
            ];

            for (const n of neighbors) {
                if (n.x >= 0 && n.x < width && n.y >= 0 && n.y < height) {
                    const k = key(n);
                    if (grid[n.x][n.y] === 0 && !visitedSet.has(k)) {
                        visitedSet.add(k);
                        parent.set(k, current);
                        queue.push(n);
                    }
                }
            }
        }

        if (!found) return { path: [], visited: visitedNodes };

        // Reconstruct path
        const path: Node[] = [];
        let curr: { x: number, y: number } | undefined = end;
        while (curr) {
            path.unshift({
                id: `path-${curr.x}-${curr.y}`,
                x: curr.x,
                y: curr.y,
                type: 'cell',
                active: true
            });
            curr = parent.get(key(curr));
        }

        return { path, visited: visitedNodes };
    }

    // Solve for BSP (Room Graph)
    private solveGraph(data: GenerationResult): Node[] {
        const startNode = data.nodes[0];
        const endNode = data.nodes[data.nodes.length - 1];

        if (!startNode || !endNode) return [];

        const adj = new Map<string, string[]>();

        // Build adjacency list
        data.edges.forEach(e => {
            if (!adj.has(e.source)) adj.set(e.source, []);
            if (!adj.has(e.target)) adj.set(e.target, []);
            adj.get(e.source)?.push(e.target);
            adj.get(e.target)?.push(e.source); // Undirected
        });

        const queue: string[] = [startNode.id];
        const visited = new Set<string>();
        const parent = new Map<string, string>();
        visited.add(startNode.id);

        let found = false;

        while (queue.length > 0) {
            const currId = queue.shift()!;
            if (currId === endNode.id) {
                found = true;
                break;
            }

            const neighbors = adj.get(currId) || [];
            for (const nId of neighbors) {
                if (!visited.has(nId)) {
                    visited.add(nId);
                    parent.set(nId, currId);
                    queue.push(nId);
                }
            }
        }

        if (!found) return [];

        const path: Node[] = [];
        let currId: string | undefined = endNode.id;
        const nodeMap = new Map(data.nodes.map(n => [n.id, n]));

        while (currId) {
            const node = nodeMap.get(currId);
            if (node) path.unshift(node);
            currId = parent.get(currId);
        }

        return path;
    }
}
