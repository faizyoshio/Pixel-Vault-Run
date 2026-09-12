const CLEAR_MS = 300;
const timers = new WeakMap<HTMLElement, ReturnType<typeof setTimeout>>();

/** One-shot colored edge glow on an element; re-triggering restarts the timer. */
export function flash(el: Element, color: string): void {
  const target = el as HTMLElement;
  target.classList.add('game-flash');
  target.style.backgroundColor = color;
  const prev = timers.get(target);
  if (prev) clearTimeout(prev);
  timers.set(
    target,
    setTimeout(() => {
      target.classList.remove('game-flash');
      target.style.backgroundColor = '';
    }, CLEAR_MS),
  );
}