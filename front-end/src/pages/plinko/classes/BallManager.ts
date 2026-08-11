import { HEIGHT, WIDTH, ballRadius } from "../constants";
import { createObstacles, createSinks } from "../objects";
import type { Obstacle, Sink } from "../objects";
import { pad, unpad } from "../padding";
import { Ball } from "./Ball";

export class BallManager {
    private balls: Ball[];
    private canvasRef: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private obstacles: Obstacle[]
    private sinks: Sink[]
    private requestId?: number;
    private onFinish?: (index: number, startX?: number) => void;
    // Sink animation state: small downward offset that eases back
    private sinkOffsets: number[];
    private readonly sinkDropAmount = 8; // pixels
    private readonly sinkDecayFactor = 0.85; // per-frame decay
    // Simple audio for sink hit
    private audioCtx?: AudioContext;
    //private ballSprite?: HTMLImageElement;

    constructor(canvasRef: HTMLCanvasElement, onFinish?: (index: number, startX?: number) => void) {
        this.balls = [];
        this.canvasRef = canvasRef;
        this.ctx = this.canvasRef.getContext("2d", { alpha: true })!;
        // Clear canvas to transparent
        this.ctx.clearRect(0, 0, canvasRef.width, canvasRef.height);
        this.obstacles = createObstacles();
        this.sinks = createSinks();
        this.sinkOffsets = new Array(this.sinks.length).fill(0);
        this.update();
        this.onFinish = onFinish;
    }
    /*
    public setBallSprite(img?: HTMLImageElement) {
        this.ballSprite = img;
    }*/

    addBall(startX?: number, targetSinkIndex?: number) {
        // Drop from higher to build momentum before hitting pegs
        const firstRowY = 45 + 34; // matches objects.ts startY + verticalSpacing for row 1
        const spawnY = pad(firstRowY - ballRadius * 2 - 60); // 60px higher for better entry
        let spawnX: number;
        if (targetSinkIndex !== undefined && targetSinkIndex >= 0 && targetSinkIndex < this.sinks.length) {
            // Spawn directly above the chosen sink center to minimize drift
            spawnX = this.sinks[targetSinkIndex].x;
        } else {
            const baseX = startX ?? pad(WIDTH / 2.07);
            // Clamp spawn to sink span to prevent out-of-bounds
            const { minBound, maxBound } = this.getSinkBounds();
            const clamped = Math.max(minBound, Math.min(maxBound, unpad(baseX)));
            spawnX = pad(clamped);
        }

        const newBall = new Ball(
            spawnX,
            spawnY,
            ballRadius,
            "red",
            this.ctx,
            this.obstacles,
            this.sinks,
            (index) => {
                this.balls = this.balls.filter(ball => ball !== newBall);
                if (index >= 0 && index < this.sinks.length) {
                    this.sinkOffsets[index] = Math.max(this.sinkOffsets[index], this.sinkDropAmount);
                    this.playSinkHitSound();
                }
                this.onFinish?.(index, startX);
            },
            //this.ballSprite
        );
        this.balls.push(newBall);
    }

    drawObstacles() {
        this.ctx.fillStyle = 'white';
        this.obstacles.forEach((obstacle) => {
            this.ctx.beginPath();
            this.ctx.arc(unpad(obstacle.x), unpad(obstacle.y), obstacle.radius, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.closePath();
        });
    }

    private getSinkBounds() {
        if (!this.sinks.length) {
            return { minBound: 0, maxBound: WIDTH };
        }
        const minSinkX = Math.min(...this.sinks.map((s) => unpad(s.x))) - this.sinks[0].width / 2;
        const maxSinkX = Math.max(...this.sinks.map((s) => unpad(s.x))) + this.sinks[0].width / 2;
        const margin = ballRadius; // keep within sinks' visual span
        return { minBound: minSinkX + margin, maxBound: maxSinkX - margin };
    }

    getColor(index: number) {
        if (index < 3 || index > this.sinks.length - 4) {
            return { background: '#ff0303ff', color: 'black' };
        }
        if (index < 6 || index > this.sinks.length - 7) {
            return { background: '#ff5e00ff', color: 'black' };
        }
        if (index < 8 || index > this.sinks.length - 9) {
            return { background: '#ffc400ff', color: 'black' };
        }
        if (index < 12 || index > this.sinks.length - 13) {
            return { background: '#ffe600ff', color: 'black' };
        }
        if (index < 15 || index > this.sinks.length - 16) {
            return { background: '#470cd1ff', color: 'black' };
        }
        return { background: '#ff0303ff', color: 'black' };
    }
    drawSinks() {
        const SPACING = 7;
        const depth = 5;
        const radius = 5;

        for (let i = 0; i < this.sinks.length; i++) {
            const sink = this.sinks[i];
            const width = sink.width - SPACING; // visual width (slightly narrower)
            const height = sink.height;
            const xCenter = unpad(sink.x);
            const x = xCenter - width / 2; // convert center to left for drawing
            const y = unpad(sink.y) - height / 2 + (this.sinkOffsets[i] || 0);

            const baseColor = this.getColor(i).background;

            // Draw back face (darker shadow)
            this.ctx.fillStyle = this.darkenColor(baseColor, 0.2);
            this.roundRect(this.ctx, x + depth, y + depth, width, height, radius);
            this.ctx.fill();

            // Draw right side face (side shadow)
            this.ctx.fillStyle = this.darkenColor(baseColor, 0.375);
            this.ctx.beginPath();
            this.ctx.moveTo(x + width, y + radius);
            this.ctx.quadraticCurveTo(x + width, y, x + width - radius, y);
            this.ctx.lineTo(x + width + depth - radius, y + depth);
            this.ctx.quadraticCurveTo(x + width + depth, y + depth, x + width + depth, y + depth + radius);
            this.ctx.lineTo(x + width + depth, y + depth + height - radius);
            this.ctx.quadraticCurveTo(x + width + depth, y + depth + height, x + width + depth - radius, y + depth + height);
            this.ctx.lineTo(x + width - radius, y + height);
            this.ctx.quadraticCurveTo(x + width, y + height, x + width, y + height - radius);
            this.ctx.closePath();
            this.ctx.fill();

            // Draw bottom face (bottom shadow)
            this.ctx.fillStyle = this.darkenColor(baseColor, 0.3);
            this.ctx.beginPath();
            this.ctx.moveTo(x + radius, y + height);
            this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
            this.ctx.lineTo(x + depth, y + height + depth - radius);
            this.ctx.quadraticCurveTo(x + depth, y + height + depth, x + depth + radius, y + height + depth);
            this.ctx.lineTo(x + width + depth - radius, y + height + depth);
            this.ctx.quadraticCurveTo(x + width + depth, y + height + depth, x + width + depth, y + height + depth - radius);
            this.ctx.lineTo(x + width - radius, y + height);
            this.ctx.quadraticCurveTo(x + width, y + height, x + width, y + height - radius);
            this.ctx.closePath();
            this.ctx.fill();

            // Draw front face with rounded corners (brightest)
            this.ctx.fillStyle = baseColor;
            this.roundRect(this.ctx, x, y, width, height, radius);
            this.ctx.fill();

            // Draw border for definition
            this.ctx.strokeStyle = this.darkenColor(baseColor, 0.7);
            this.ctx.lineWidth = 1;
            this.roundRect(this.ctx, x, y, width, height, radius);
            this.ctx.stroke();

            // Draw text
            this.ctx.fillStyle = this.getColor(i).color;
            this.ctx.font = 'bold 14px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText((sink?.multiplier)?.toString() + "x", x + width / 2, y + height / 2);
            this.ctx.textAlign = 'left';
        }
    }

    private roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.arcTo(x + width, y, x + width, y + radius, radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
        ctx.lineTo(x + radius, y + height);
        ctx.arcTo(x, y + height, x, y + height - radius, radius);
        ctx.lineTo(x, y + radius);
        ctx.arcTo(x, y, x + radius, y, radius);
        ctx.closePath();
    }

    private darkenColor(hexColor: string, factor: number): string {
        // Remove the 'ff' alpha channel if present
        const hex = hexColor.replace('ff', '');
        const r = Math.floor(parseInt(hex.substr(1, 2), 16) * factor);
        const g = Math.floor(parseInt(hex.substr(3, 2), 16) * factor);
        const b = Math.floor(parseInt(hex.substr(5, 2), 16) * factor);
        return `rgb(${r}, ${g}, ${b})`;
    }

    private updateSinkAnimations() {
        for (let i = 0; i < this.sinkOffsets.length; i++) {
            const o = this.sinkOffsets[i];
            if (o > 0.01) {
                const next = o * this.sinkDecayFactor;
                this.sinkOffsets[i] = next < 0.2 ? 0 : next;
            }
        }
    }

    private playSinkHitSound() {
        try {
            const Ctor = window.AudioContext ?? (window as Window & { webkitAudioContext?: typeof AudioContext}).webkitAudioContext;
            if (!Ctor) return;
            const ctx = this.audioCtx ?? (this.audioCtx = new Ctor());
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(600, ctx.currentTime);
            gain.gain.setValueAtTime(0, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.13);
        } catch {
            // ignore audio errors
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, WIDTH, HEIGHT);
        this.drawObstacles();
        this.updateSinkAnimations();
        this.drawSinks();
        // Keep balls visible even after reaching sinks
        // this.balls = this.balls.filter(b => !b.isFinished());
        this.balls.forEach(ball => {
            ball.update();
            ball.draw();
        }); 
    }

    update() {
        this.draw();
        this.requestId = requestAnimationFrame(this.update.bind(this));
    }

    stop() {
        if (this.requestId) {
            cancelAnimationFrame(this.requestId);
        }
    }
}