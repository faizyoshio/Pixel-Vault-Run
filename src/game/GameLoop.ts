const requestFrame = typeof requestAnimationFrame !== 'undefined'
    ? requestAnimationFrame
    : (cb: FrameRequestCallback) => setTimeout(cb, 16) as unknown as number;

const cancelFrame = typeof cancelAnimationFrame !== 'undefined'
    ? cancelAnimationFrame
    : (id: number) => clearTimeout(id as unknown as NodeJS.Timeout);

export class GameLoop {
    private isRunning = false;
    private lastTime = 0;
    private frameCount = 0;
    private fps = 0;
    private animationFrameId: number | null = null;
    
    constructor(private updateCallback: (deltaTime: number) => void) {}
    
    start(): void {
        this.isRunning = true;
        this.lastTime = Date.now();
        this.loop();
    }
    
    stop(): void {
        this.isRunning = false;
        if (this.animationFrameId !== null) {
            cancelFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }
    
    private loop(): void {
        if (!this.isRunning) return;
        
        const now = Date.now();
        const deltaTime = (now - this.lastTime) / 1000;
        this.lastTime = now;
        
        this.updateCallback(deltaTime);
        
        this.frameCount++;
        if (now - this.lastTime >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
        }
        
        this.animationFrameId = requestFrame(() => this.loop());
    }
    
    getFPS(): number {
        return this.fps;
    }
}