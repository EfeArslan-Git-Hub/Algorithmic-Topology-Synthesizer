import type { Node } from '../../core/interfaces/IGenerator';

export class Renderer {
    private ctx: CanvasRenderingContext2D;
    private width: number;
    private height: number;

    constructor(ctx: CanvasRenderingContext2D, width: number, height: number) {
        this.ctx = ctx;
        this.width = width;
        this.height = height;
    }

    public clear() {
        this.ctx.fillStyle = '#1a1a1a'; // Dark background
        this.ctx.fillRect(0, 0, this.width, this.height);
    }

    public drawGrid(grid: number[][], cellSize: number, progress: number = 1.0) {
        // Clear background
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

        // Draw Floor (0)
        this.ctx.fillStyle = 'rgba(59, 130, 246, 0.4)'; // Sci-Fi Blue
        this.ctx.shadowBlur = 0;

        const width = grid.length;
        const height = grid[0].length;

        // Scanline logic: Draw columns/rows based on progress
        // Let's do a vertical scan (Top to Bottom)
        const visibleHeight = Math.floor(height * progress);

        for (let x = 0; x < width; x++) {
            for (let y = 0; y < visibleHeight; y++) {
                if (grid[x][y] === 0) {
                    this.ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
                }
            }
        }

        // Scanline Beam Effect (Optional)
        if (progress < 1.0) {
            const beamY = visibleHeight * cellSize;
            this.ctx.beginPath();
            this.ctx.moveTo(0, beamY);
            this.ctx.lineTo(this.ctx.canvas.width, beamY);
            this.ctx.strokeStyle = '#60a5fa'; // Blue-400
            this.ctx.lineWidth = 2;
            this.ctx.shadowColor = '#60a5fa';
            this.ctx.shadowBlur = 10;
            this.ctx.stroke();
            this.ctx.shadowBlur = 0;
        }

        // Draw Wall borders (OPTIONAL Polishing)
        // Check neighbors to draw outlines?
        // For performance on large grids, maybe skip custom borders for now.
    }

    // Nodes and Edges are now deprecated/debug only
    public drawNodes() {
        // No-op or debug
    }

    public drawEdges() {
        // No-op or debug
    }

    public drawVisited(nodes: Node[], cellSize: number) {
        this.ctx.fillStyle = 'rgba(234, 179, 8, 0.4)'; // Yellow-500, semi-transparent

        for (const node of nodes) {
            // Draw small centered dot in each visited cell
            const x = node.x * cellSize + cellSize * 0.25;
            const y = node.y * cellSize + cellSize * 0.25;
            const w = cellSize * 0.5;
            this.ctx.fillRect(x, y, w, w);
        }
    }

    public drawPath(path: Node[], cellSize: number) {
        if (path.length === 0) return;

        // Path
        this.ctx.strokeStyle = '#22c55e'; // Green path
        this.ctx.lineWidth = cellSize * 0.4;
        this.ctx.lineJoin = 'round';
        this.ctx.lineCap = 'round';
        this.ctx.shadowColor = '#22c55e';
        this.ctx.shadowBlur = 10;

        this.ctx.beginPath();

        // Move to start
        const startX = path[0].x * cellSize + cellSize / 2;
        const startY = path[0].y * cellSize + cellSize / 2;
        this.ctx.moveTo(startX, startY);

        for (let i = 1; i < path.length; i++) {
            const px = path[i].x * cellSize + cellSize / 2;
            const py = path[i].y * cellSize + cellSize / 2;
            this.ctx.lineTo(px, py);
        }

        this.ctx.stroke();
        this.ctx.shadowBlur = 0;
    }

    public drawMarkers(start: Node, end: Node, cellSize: number) {
        // Start: Hollow Cyan Circle
        const sx = start.x * cellSize + cellSize / 2;
        const sy = start.y * cellSize + cellSize / 2;

        this.ctx.beginPath();
        this.ctx.strokeStyle = '#06b6d4'; // Cyan-500
        this.ctx.lineWidth = 3;
        this.ctx.fillStyle = '#000';
        this.ctx.arc(sx, sy, cellSize * 1.5, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();

        // Label "IN"
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '10px "JetBrains Mono"';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText("IN", sx, sy);

        // End: Hollow Red Circle
        const ex = end.x * cellSize + cellSize / 2;
        const ey = end.y * cellSize + cellSize / 2;

        this.ctx.beginPath();
        this.ctx.strokeStyle = '#ef4444'; // Red-500
        this.ctx.lineWidth = 3;
        this.ctx.fillStyle = '#000';
        this.ctx.arc(ex, ey, cellSize * 1.5, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();

        // Label "OUT"
        this.ctx.fillStyle = '#fff';
        this.ctx.fillText("OUT", ex, ey);
    }
}
