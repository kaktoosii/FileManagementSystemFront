export class Semaphore {
  private counter = 0;
  private waiting: any[] = [];

  constructor(private max: number) {}

  private take() {
    if (this.waiting.length > 0 && this.counter < this.max) {
      this.counter++;
      let promise = this.waiting.shift();
      promise?.resolve();
    }
  }

  wait() {
    if (this.counter < this.max) {
      this.counter++;
      return new Promise<void>((resolve) => {
        resolve();
      });
    } else {
      return new Promise<void>((resolve, err) => {
        this.waiting.push({ resolve: resolve, err: err });
      });
    }
  }

  signal() {
    this.counter--;
    this.take();
  }

  purge() {
    let unresolved = this.waiting.length;

    for (let i = 0; i < unresolved; i++) {
      (this.waiting[i] as any).err("Task has been purged.");
    }

    this.counter = 0;
    this.waiting = [];

    return unresolved;
  }
}
