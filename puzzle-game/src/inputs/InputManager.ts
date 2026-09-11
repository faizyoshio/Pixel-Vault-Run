export type InputState = {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  jump: boolean;
  interact: boolean;
  mouseX: number;
  mouseY: number;
  mouseDown: boolean;
};

export class InputManager {
  private state: InputState = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    jump: false,
    interact: false,
    mouseX: 0,
    mouseY: 0,
    mouseDown: false,
  };

  private boundKeyDown: ((e: KeyboardEvent) => void) | null = null;
  private boundKeyUp: ((e: KeyboardEvent) => void) | null = null;
  private boundMouseMove: ((e: MouseEvent) => void) | null = null;
  private boundMouseDown: ((e: MouseEvent) => void) | null = null;
  private boundMouseUp: ((e: MouseEvent) => void) | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.boundKeyDown = this.handleKeyDown.bind(this);
      this.boundKeyUp = this.handleKeyUp.bind(this);
      this.boundMouseMove = this.handleMouseMove.bind(this);
      this.boundMouseDown = this.handleMouseDown.bind(this);
      this.boundMouseUp = this.handleMouseUp.bind(this);
    }
  }

  setup(): void {
    if (typeof window === 'undefined') return;
    
    window.addEventListener('keydown', this.boundKeyDown!);
    window.addEventListener('keyup', this.boundKeyUp!);
    window.addEventListener('mousemove', this.boundMouseMove!);
    window.addEventListener('mousedown', this.boundMouseDown!);
    window.addEventListener('mouseup', this.boundMouseUp!);
  }

  private handleKeyDown(e: KeyboardEvent): void {
    switch (e.key.toLowerCase()) {
      case 'w':
      case 'arrowup':
        this.state.forward = true;
        break;
      case 's':
      case 'arrowdown':
        this.state.backward = true;
        break;
      case 'a':
      case 'arrowleft':
        this.state.left = true;
        break;
      case 'd':
      case 'arrowright':
        this.state.right = true;
        break;
      case ' ':
        this.state.jump = true;
        break;
      case 'e':
        this.state.interact = true;
        break;
    }
  }

  private handleKeyUp(e: KeyboardEvent): void {
    switch (e.key.toLowerCase()) {
      case 'w':
      case 'arrowup':
        this.state.forward = false;
        break;
      case 's':
      case 'arrowdown':
        this.state.backward = false;
        break;
      case 'a':
      case 'arrowleft':
        this.state.left = false;
        break;
      case 'd':
      case 'arrowright':
        this.state.right = false;
        break;
      case ' ':
        this.state.jump = false;
        break;
      case 'e':
        this.state.interact = false;
        break;
    }
  }

  private handleMouseMove(e: MouseEvent): void {
    this.state.mouseX = e.clientX;
    this.state.mouseY = e.clientY;
  }

  private handleMouseDown(e: MouseEvent): void {
    if (e.button === 0) {
      this.state.mouseDown = true;
    }
  }

  private handleMouseUp(e: MouseEvent): void {
    if (e.button === 0) {
      this.state.mouseDown = false;
    }
  }

  getState(): InputState {
    return { ...this.state };
  }

  update(): void {
    // Input state is event-driven; nothing to poll each frame
  }

  dispose(): void {
    if (typeof window === 'undefined') return;
    
    window.removeEventListener('keydown', this.boundKeyDown!);
    window.removeEventListener('keyup', this.boundKeyUp!);
    window.removeEventListener('mousemove', this.boundMouseMove!);
    window.removeEventListener('mousedown', this.boundMouseDown!);
    window.removeEventListener('mouseup', this.boundMouseUp!);
  }
}

export const inputManager = new InputManager();