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
    // Animation States
    const [gridProgress, setGridProgress] = useState(0); // 0.0 to 1.0 for Grid
    const [pathProgress, setPathProgress] = useState(0); // 0.0 to 1.0 for Path
    const [visitedProgress, setVisitedProgress] = useState(0); // 0 to N for Visited Nodes
    const animationRef = useRef<number>(0);

    // Initialize Renderer
    useEffect(() => {
        if (canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            if (ctx) {
                rendererRef.current = new Renderer(ctx, width, height);
            }
        }
    }, [width, height]);

    // Reset Grid animation ONLY when data changes (New Map)
    useEffect(() => {
        setGridProgress(0);
    }, [data]);

    // Reset Solver animation when path/visited changes (New Solution)
    useEffect(() => {
        setPathProgress(0);
        setVisitedProgress(0);
    }, [path, visited]);

    useEffect(() => {
        const renderLoop = () => {
            if (!rendererRef.current) {
                animationRef.current = requestAnimationFrame(renderLoop);
                return;
            }

            // 1. Grid Animation (if applicable)
            // For grid-based, gridProgress can represent the scanline or just a flag for completion
            // If data.grid exists, we assume it's drawn instantly for now, or we can animate it.
            // The original code had a scanline animation for gridProgress. Let's keep that logic.
            if (data.grid && gridProgress < 1.0) {
                setGridProgress(prev => {
                    const next = prev + 0.02; // Speed of scan
                    return next >= 1.0 ? 1.0 : next;
                });
            }

            // 2. Visited Animation (Search) - Only starts after grid is done (or if no grid)
            // We'll control speed here. visited.length can be huge (e.g. 5000), so we need a multiplier.
            // Only animate visited if grid animation is complete (or not applicable)
            if ((!data.grid || gridProgress >= 1.0) && visited && visited.length > 0 && visitedProgress < visited.length) {
                // Speed: 5% of total nodes per frame or min 10 nodes, to keep it snappy but visible
                const step = Math.max(5, Math.ceil(visited.length * 0.05));
                setVisitedProgress(prev => Math.min(prev + step, visited.length));
            }

            // 3. Path Animation - Only starts after Visited is done
            if ((!data.grid || gridProgress >= 1.0) && (!visited || visitedProgress >= (visited?.length || 0)) && path && path.length > 0 && pathProgress < path.length) {
                setPathProgress(prev => Math.min(prev + 1, path.length));
            }

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
                    // Start from index 0 up to visitedProgress
                    const visibleVisited = visited.slice(0, visitedProgress);
                    renderer.drawVisited(visibleVisited, cellSize);
                }

                // Draw Markers & Path
                if (path && path.length > 0) {
                    // 1. Draw Fixed Markers (IN/OUT) using the FULL path
                    // This ensures OUT is always at the destination, even if path is animating
                    renderer.drawMarkers(path[0], path[path.length - 1], cellSize);

                    // 2. Draw Animated Path (Snake)
                    const visiblePath = path.slice(0, pathProgress);
                    if (visiblePath.length > 0) {
                        renderer.drawPath(visiblePath, cellSize);
                    }
                }
            }
            // Fallback for node-based (BSP legacy or Graph)
            else if (data.nodes.length > 0) {
                renderer.drawEdges(); // Fixed: No arguments expected
                renderer.drawNodes(); // Fixed: No arguments expected
            }

            animationRef.current = requestAnimationFrame(renderLoop);
        };

        animationRef.current = requestAnimationFrame(renderLoop);
        return () => cancelAnimationFrame(animationRef.current);
    }, [data, path, visited, width, height, gridProgress, pathProgress, visitedProgress]);

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
