import { useRef, useEffect, useState } from 'react';
import type { GenerationResult } from '../../core/interfaces/IGenerator';
import type { Node } from '../../core/interfaces/IGenerator'; // Explicit import
import { Renderer } from './Renderer';

interface CanvasViewportProps {
    data: GenerationResult;
    width?: number;
    height?: number;
    path?: Node[]; // Use strict type
    visited?: Node[];
}

export const CanvasViewport = ({ data, width = 800, height = 600, path, visited }: CanvasViewportProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const rendererRef = useRef<Renderer | null>(null);

    // Animation States
    const [gridProgress, setGridProgress] = useState(0); // 0.0 to 1.0 for Grid
    const [pathProgress, setPathProgress] = useState(0); // 0.0 to 1.0 for Path

    // Initialize Renderer
    useEffect(() => {
        if (canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            if (ctx) {
                rendererRef.current = new Renderer(ctx, width, height);
            }
        }
    }, [width, height]);

    // Reset animation when data changes
    useEffect(() => {
        setGridProgress(0);
        setPathProgress(0);
    }, [data]);

    // Reset path animation when path changes
    useEffect(() => {
        setPathProgress(0);
    }, [path]);

    // Animation Loop
    useEffect(() => {
        let animationFrameId: number;

        const animate = () => {
            // 1. Animate Grid (Scanline)
            if (data.grid && gridProgress < 1.0) {
                setGridProgress(prev => {
                    const next = prev + 0.02; // Speed of scan
                    if (next >= 1.0) return 1.0;
                    return next;
                });
            }

            // 2. Animate Path (Snake)
            // Only start if grid is done (or parallel? let's do parallel or independent)
            if (path && path.length > 0 && pathProgress < 1.0) {
                setPathProgress(prev => {
                    const next = prev + 0.02; // Speed of path
                    if (next >= 1.0) return 1.0;
                    return next;
                });
            }

            animationFrameId = requestAnimationFrame(animate);
        };

        animationFrameId = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrameId);
    }, [data, gridProgress, path, pathProgress]);

    // Draw Loop
    useEffect(() => {
        if (rendererRef.current) {
            const renderer = rendererRef.current;
            renderer.clear();

            // Draw Grid (CA) - Only if grid exists
            if (data.grid) {
                // Calculate cell size based on grid dimensions vs canvas dimensions
                // gridW = width / scale. cellSize should be around scale (e.g. 4)
                const cellSizeX = width / data.grid.length;
                const cellSizeY = height / data.grid[0].length;
                const cellSize = Math.min(cellSizeX, cellSizeY);

                renderer.drawGrid(data.grid, cellSize, gridProgress);

                // Draw Visited (Search Area)
                if (visited && visited.length > 0) {
                    renderer.drawVisited(visited, cellSize);
                }

                // Draw Path
                if (path && path.length > 0) {
                    renderer.drawPath(path, cellSize, pathProgress);
                }
            }
            // Fallback for node-based (BSP legacy or Graph)
            else if (data.nodes.length > 0) {
                // For now, no specific animation for legacy node mode in this view
                // Just clear or draw static if needed
            }
        }
    }, [data, path, visited, width, height, gridProgress, pathProgress]);

    return (
        <div className="relative border border-white/10 rounded-lg overflow-hidden shadow-2xl bg-[#0f0f0f]">
            <canvas
                ref={canvasRef}
                width={width}
                height={height}
                className="block"
            />
        </div>
    );
};
