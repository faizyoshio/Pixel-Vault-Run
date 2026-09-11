export class GameLoop {
    private isRunning = false;
    private lastTime = 0;
    private frameCount = 0;
    private fps = 0;
    
    constructor(private updateCallback: (deltaTime: number) => void) {}
    
    start(): void {
        this.isRunning = true;
        this.lastTime = performance.now();
        this.loop();
    }
    
    stop(): void {
        this.isRunning = false;
    }
    
    private loop(): void {
        if (!this.isRunning) return;
        
        const now = performance.now();
        const deltaTime = (now - this.lastTime) / 1000; // Convert to seconds
        this.lastTime = now;
        
        this.updateCallback(deltaTime);
        
        // Calculate FPS
        this.frameCount++;
        if (now - this.lastTime >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
        }
        
        requestAnimationFrame(() => this.loop());
    }
    
    getFPS(): number {
        return this.fps;
    }
}