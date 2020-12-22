import UIElement from './UIElement';

export default class Timer {
  private id: NodeJS.Timeout;
  private seconds: number;
  private readonly duration: number;
  private running = false;
  private timerElement: UIElement;

  public constructor(duration: number) {
    this.duration = duration;
  }

  public setElement(element: UIElement): void {
    this.timerElement = element;
  }

  public start(resume = false): void {
    this.running = true;
    if (!resume) this.seconds = this.duration;

    const tick = () => {
      this.seconds--;
      this.timerElement.innerText = this.countdown;

      if (this.seconds > 0) {
        clearTimeout(this.id);
        this.id = setTimeout(tick, 1000);
      } else this.stop();
    };

    tick();
  }

  public stop(): void {
    this.running = false;
    clearTimeout(this.id);
    console.log(`timer finished in ${this.duration - this.seconds}s`);
  }

  public resume(): void {
    this.start(true);
  }

  public reset(): void {
    this.running = true;
    this.seconds = this.duration;

    this.start();
  }

  public get isRunning(): boolean {
    return this.running;
  }

  public get countdown(): string {
    const format = (value: number): string => `0${Math.floor(value)}`.slice(-2);
    const minutes: number = (this.seconds % 3600) / 60;

    return this.seconds < 3600
      ? [minutes, this.seconds % 60].map(format).join(':')
      : [this.seconds / 3600, minutes, this.seconds % 60].map(format).join(':');
  }
}
