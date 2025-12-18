export interface Node {
    id: string;
    x: number;
    y: number;
    width?: number; // For Rooms
    height?: number;
    type: 'room' | 'corridor' | 'cell';
    active: boolean;
}

export interface Edge {
    source: string;
    target: string;
}

export interface GenerationResult {
    nodes: Node[];
    edges: Edge[];
    grid?: number[][]; // 0 = floor, 1 = wall
}

export interface PathResult {
    path: Node[];
    visited: Node[]; // Nodes visited during search
}

export interface GenerationParams {
    width: number;
    height: number;
    iterations?: number;
    smoothing?: number;
    seed?: number;
}

export interface IGenerator {
    generate(params: GenerationParams): GenerationResult;
}
