import type { IGenerator, GenerationParams, GenerationResult } from '../interfaces/IGenerator';

export class CellularAutomataGenerator implements IGenerator {
    private BIRTH_LIMIT = 4;
    private DEATH_LIMIT = 3;
    private SCALE = 5; // Downscale factor for "Chunky" pixels

    public generate(params: GenerationParams): GenerationResult {
        const { width, height, iterations = 5 } = params;

        // Scale down the grid dimensions to make cells larger
        const gridW = Math.floor(width / this.SCALE);
        const gridH = Math.floor(height / this.SCALE);

        // 1. Initialize map
        // 0 = floor, 1 = wall
        let map = this.initializeMap(gridW, gridH);

        // 2. Run simulation steps
        for (let i = 0; i < iterations; i++) {
            map = this.simulationStep(map, gridW, gridH);
        }

        // 3. Ensure Connectivity (Keep Largest Cave)
        map = this.ensureConnectivity(map, gridW, gridH);

        // 4. Center the Map
        map = this.centerMap(map, gridW, gridH);

        return {
            nodes: [],
            edges: [],
            grid: map
        };
    }

    private centerMap(map: number[][], width: number, height: number): number[][] {
        let minX = width, maxX = 0, minY = height, maxY = 0;
        let hasFloor = false;

        // Find bounding box
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                if (map[x][y] === 0) {
                    if (x < minX) minX = x;
                    if (x > maxX) maxX = x;
                    if (y < minY) minY = y;
                    if (y > maxY) maxY = y;
                    hasFloor = true;
                }
            }
        }

        if (!hasFloor) return map;

        const contentW = maxX - minX + 1;
        const contentH = maxY - minY + 1;

        // Calculate shift needed to center the bounding box
        const shiftX = Math.floor((width - contentW) / 2) - minX;
        const shiftY = Math.floor((height - contentH) / 2) - minY;

        if (shiftX === 0 && shiftY === 0) return map;

        const newMap = Array(width).fill(0).map(() => Array(height).fill(1));

        for (let x = minX; x <= maxX; x++) {
            for (let y = minY; y <= maxY; y++) {
                if (map[x][y] === 0) {
                    const nx = x + shiftX;
                    const ny = y + shiftY;
                    if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                        newMap[nx][ny] = 0;
                    }
                }
            }
        }

        return newMap;
    }

    private ensureConnectivity(map: number[][], width: number, height: number): number[][] {
        // Flood fill to find all regions
        const regions: { x: number, y: number }[][] = [];
        const visited = new Set<string>();

        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                if (map[x][y] === 0 && !visited.has(`${x},${y}`)) {
                    // New region found
                    const region: { x: number, y: number }[] = [];
                    const queue: { x: number, y: number }[] = [{ x, y }];
                    visited.add(`${x},${y}`);

                    while (queue.length > 0) {
                        const curr = queue.shift()!;
                        region.push(curr);

                        const neighbors = [
                            { x: curr.x + 1, y: curr.y },
                            { x: curr.x - 1, y: curr.y },
                            { x: curr.x, y: curr.y + 1 },
                            { x: curr.x, y: curr.y - 1 }
                        ];

                        for (const n of neighbors) {
                            if (n.x >= 0 && n.x < width && n.y >= 0 && n.y < height) {
                                if (map[n.x][n.y] === 0 && !visited.has(`${n.x},${n.y}`)) {
                                    visited.add(`${n.x},${n.y}`);
                                    queue.push(n);
                                }
                            }
                        }
                    }
                    regions.push(region);
                }
            }
        }

        // Find largest region
        if (regions.length === 0) return map;

        regions.sort((a, b) => b.length - a.length);
        const largestRegion = regions[0];

        // Fill all other regions with walls
        // Create a new clean map filled with walls
        const finalMap = Array(width).fill(0).map(() => Array(height).fill(1));

        // Carve only the largest region
        for (const cell of largestRegion) {
            finalMap[cell.x][cell.y] = 0;
        }

        return finalMap;
    }

    private initializeMap(width: number, height: number): number[][] {
        const map: number[][] = [];
        for (let x = 0; x < width; x++) {
            map[x] = [];
            for (let y = 0; y < height; y++) {
                // Random initialization
                // 45% chance to be a wall
                map[x][y] = Math.random() < 0.45 ? 1 : 0;
            }
        }
        return map;
    }

    private simulationStep(oldMap: number[][], width: number, height: number): number[][] {
        const newMap: number[][] = [];
        for (let x = 0; x < width; x++) {
            newMap[x] = [];
            for (let y = 0; y < height; y++) {
                const nbs = this.countAliveNeighbors(oldMap, x, y, width, height);

                // The "Game of Life" rules for caves usually:
                // If a cell is alive (wall), stay alive if neighbors >= death_limit
                // If a cell is dead (floor), become alive if neighbors > birth_limit
                if (oldMap[x][y] === 1) {
                    if (nbs < this.DEATH_LIMIT) {
                        newMap[x][y] = 0; // Dies (becomes floor)
                    } else {
                        newMap[x][y] = 1; // Stays wall
                    }
                } else {
                    if (nbs > this.BIRTH_LIMIT) {
                        newMap[x][y] = 1; // Born (becomes wall)
                    } else {
                        newMap[x][y] = 0; // Stays floor
                    }
                }
            }
        }
        return newMap;
    }

    private countAliveNeighbors(map: number[][], x: number, y: number, width: number, height: number): number {
        let count = 0;
        for (let i = -1; i < 2; i++) {
            for (let j = -1; j < 2; j++) {
                const nb_x = x + i;
                const nb_y = y + j;
                if (i === 0 && j === 0) continue; // Skip self

                // Check bounds: if out of bounds, count as wall (to encourage closed caves)
                if (nb_x < 0 || nb_y < 0 || nb_x >= width || nb_y >= height) {
                    count++;
                } else if (map[nb_x][nb_y] === 1) {
                    count++;
                }
            }
        }
        return count;
    }
}
