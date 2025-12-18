import type { IGenerator, GenerationParams, GenerationResult, Node } from '../interfaces/IGenerator';

interface Leaf {
    x: number;
    y: number;
    width: number;
    height: number;
    leftChild?: Leaf;
    rightChild?: Leaf;
    room?: Node;
}

export class BSPGenerator implements IGenerator {
    private grid: number[][] = [];
    private scale = 4; // Scale factor for grid density

    public generate(params: GenerationParams): GenerationResult {
        // 1. Initialize Grid (1 = Wall)
        // We use a scaled down grid for the "Tilemap" feel
        const gridW = Math.floor(params.width / this.scale);
        const gridH = Math.floor(params.height / this.scale);

        this.grid = Array(gridW).fill(0).map(() => Array(gridH).fill(1));

        // 2. Create BSP Tree
        const root: Leaf = { x: 0, y: 0, width: gridW, height: gridH };
        this.split(root, params.iterations || 4);

        // 3. Carve Rooms
        this.createRooms(root);

        // 4. Carve Corridors
        this.createCorridors(root);

        // Return just the grid
        return {
            nodes: [],
            edges: [],
            grid: this.grid
        };
    }

    private split(leaf: Leaf, iter: number) {
        if (iter === 0) return;

        // Determine split direction
        // If width > height * 1.25, split vertical (create left/right)
        // If height > width * 1.25, split horizontal (create top/bottom)
        // Else random
        let splitH = Math.random() > 0.5;
        if (leaf.width > leaf.height && leaf.width / leaf.height >= 1.25) splitH = false;
        else if (leaf.height > leaf.width && leaf.height / leaf.width >= 1.25) splitH = true;

        const max = (splitH ? leaf.height : leaf.width) - 4; // Min size 4
        if (max <= 4) return; // Too small

        const split = Math.floor(Math.random() * (max - 4)) + 4; // Random split pos

        if (splitH) {
            leaf.leftChild = { x: leaf.x, y: leaf.y, width: leaf.width, height: split };
            leaf.rightChild = { x: leaf.x, y: leaf.y + split, width: leaf.width, height: leaf.height - split };
        } else {
            leaf.leftChild = { x: leaf.x, y: leaf.y, width: split, height: leaf.height };
            leaf.rightChild = { x: leaf.x + split, y: leaf.y, width: leaf.width - split, height: leaf.height };
        }

        this.split(leaf.leftChild, iter - 1);
        this.split(leaf.rightChild, iter - 1);
    }

    private createRooms(leaf: Leaf) {
        if (leaf.leftChild || leaf.rightChild) {
            if (leaf.leftChild) this.createRooms(leaf.leftChild);
            if (leaf.rightChild) this.createRooms(leaf.rightChild);
            return;
        }

        // Create random room within leaf area
        // Leave at least 1 cell padding
        const roomW = Math.floor(Math.random() * (leaf.width - 4)) + 3;
        const roomH = Math.floor(Math.random() * (leaf.height - 4)) + 3;
        const roomX = leaf.x + Math.floor(Math.random() * (leaf.width - roomW - 1)) + 1;
        const roomY = leaf.y + Math.floor(Math.random() * (leaf.height - roomH - 1)) + 1;

        leaf.room = {
            id: `room-${roomX}-${roomY}`,
            x: roomX,
            y: roomY,
            width: roomW,
            height: roomH,
            type: 'room',
            active: true
        };

        // Carve (Set to 0)
        for (let x = roomX; x < roomX + roomW; x++) {
            for (let y = roomY; y < roomY + roomH; y++) {
                if (x >= 0 && x < this.grid.length && y >= 0 && y < this.grid[0].length) {
                    this.grid[x][y] = 0;
                }
            }
        }
    }

    private createCorridors(leaf: Leaf) {
        if (!leaf.leftChild || !leaf.rightChild) return;

        this.createCorridors(leaf.leftChild);
        this.createCorridors(leaf.rightChild);

        const leftRoom = this.getRoomInTree(leaf.leftChild);
        const rightRoom = this.getRoomInTree(leaf.rightChild);

        if (leftRoom && rightRoom) {
            // Connect center to center
            const x1 = Math.floor(leftRoom.x + (leftRoom.width || 0) / 2);
            const y1 = Math.floor(leftRoom.y + (leftRoom.height || 0) / 2);
            const x2 = Math.floor(rightRoom.x + (rightRoom.width || 0) / 2);
            const y2 = Math.floor(rightRoom.y + (rightRoom.height || 0) / 2);

            this.carveLPath(x1, y1, x2, y2);
        }
    }

    private getRoomInTree(leaf?: Leaf): Node | undefined {
        if (!leaf) return undefined;
        if (leaf.room) return leaf.room;
        // Randomly pick a child's room to connect to
        return Math.random() > 0.5
            ? this.getRoomInTree(leaf.leftChild) || this.getRoomInTree(leaf.rightChild)
            : this.getRoomInTree(leaf.rightChild) || this.getRoomInTree(leaf.leftChild);
    }

    private carveLPath(x1: number, y1: number, x2: number, y2: number) {
        // Horizontal then Vertical, or vice versa
        // Let's add thickness
        const thickness = 2;

        let curX = x1;
        let curY = y1;

        // Move horizontally
        while (curX !== x2) {
            curX += (x2 > curX ? 1 : -1);
            this.carveDot(curX, curY, thickness);
        }

        // Move vertically
        while (curY !== y2) {
            curY += (y2 > curY ? 1 : -1);
            this.carveDot(curX, curY, thickness);
        }
    }

    private carveDot(x: number, y: number, thickness: number) {
        for (let i = 0; i < thickness; i++) {
            for (let j = 0; j < thickness; j++) {
                const tx = x + i;
                const ty = y + j;
                if (tx >= 0 && tx < this.grid.length && ty >= 0 && ty < this.grid[0].length) {
                    this.grid[tx][ty] = 0;
                }
            }
        }
    }
}
