export class Inventory {
  private items: string[] = [];

  addItem(item: string): void {
    this.items.push(item);
    this.updateDisplay();
  }

  removeItem(item: string): void {
    this.items = this.items.filter(i => i !== item);
    this.updateDisplay();
  }

  hasItem(item: string): boolean {
    return this.items.includes(item);
  }

  getItems(): string[] {
    return [...this.items];
  }

  clear(): void {
    this.items = [];
    this.updateDisplay();
  }

  private updateDisplay(): void {
    const container = document.getElementById('inventory-container');
    if (container) {
      container.innerHTML = this.items.map(item => `<div>${item}</div>`).join('');
    }
  }
}
