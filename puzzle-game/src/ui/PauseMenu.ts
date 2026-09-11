export class PauseMenu {
  private resumeCallback: (() => void) | null = null;
  private restartCallback: (() => void) | null = null;
  private quitCallback: (() => void) | null = null;

  constructor() {
    this.setupEventListeners();
  }

  show(): void {
    const menu = document.getElementById('pause-menu');
    if (menu) menu.style.display = 'block';
  }

  hide(): void {
    const menu = document.getElementById('pause-menu');
    if (menu) menu.style.display = 'none';
  }

  isVisible(): boolean {
    const menu = document.getElementById('pause-menu');
    return menu ? menu.style.display === 'block' : false;
  }

  onResume(callback: () => void): void {
    this.resumeCallback = callback;
  }

  onRestart(callback: () => void): void {
    this.restartCallback = callback;
  }

  onQuit(callback: () => void): void {
    this.quitCallback = callback;
  }

  private setupEventListeners(): void {
    document.getElementById('resume-btn')?.addEventListener('click', () => {
      this.hide();
      if (this.resumeCallback) this.resumeCallback();
    });

    document.getElementById('restart-btn')?.addEventListener('click', () => {
      if (this.restartCallback) this.restartCallback();
    });

    document.getElementById('quit-btn')?.addEventListener('click', () => {
      if (this.quitCallback) this.quitCallback();
    });
  }
}
