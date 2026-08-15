import { NUM_SINKS, WIDTH, obstacleRadius, sinkWidth } from "./constants";
import { pad } from "./padding";

export interface Obstacle {
    x: number;
    y: number;
    radius: number;
}

export interface Sink {
    x: number;
    y: number;
    width: number;
    height: number;
    multiplier?: number;
}

const MULTIPLIERS: Record<number, number> = {
    0: 16,
    1: 9,
    2: 2,
    3: 1.4,
    4: 1.4,
    5: 1.2,
    6: 1.1,
    7: 1,
    8: 0.5,
    9: 1,
    10: 1.1,
    11: 1.2,
    12: 1.4,
    13: 1.4,
    14: 2,
    15: 9,
    16: 16
}

export const createObstacles = (): Obstacle[] => {
    const obstacles: Obstacle[] = [];
    const spacing = 50;
    const startY = 45;
    const verticalSpacing = 34;
    const centerX = WIDTH / 2;
    
    for (let row = 1; row < 17; row++) {
        const numObstacles = row + 2;
        const y = startY + row * verticalSpacing;
        for (let col = 0; col < numObstacles; col++) {
            // Center pins to match sink grid (keep exact same base as sinks)
            const x = centerX + spacing * (col - numObstacles / 2 + 0.5);
            obstacles.push({ x: pad(x), y: pad(y), radius: obstacleRadius });
        }   
    }
    return obstacles;
}

export const createSinks = (): Sink[] => {
    const sinks = [];
    const spacing = 50;
    const numSinks = NUM_SINKS;
    const centerX = WIDTH / 2;
    
    for (let i = 0; i < numSinks; i++) {
        const x = centerX + spacing * (i - 8);
        const y = 625;
        const width = sinkWidth;
        const height = width;
        sinks.push({ x: pad(x), y: pad(y), width, height, multiplier: MULTIPLIERS[i] });
    }

    return sinks;
}