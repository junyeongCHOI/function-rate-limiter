type Options = {
  async: boolean;
  delay: number;
};

type Configs = {
  interval: number;
  invoke: number;
  options?: Partial<Options>;
};

export default class Limiter {
  readonly interval: number;
  readonly invoke: number;
  readonly options: Options = {
    async: false,
    delay: 0,
  };
  invoked: number;
  draft: number;

  constructor(configs: Configs) {
    this.interval = configs.interval;
    this.invoke = configs.invoke;

    if (configs.options) {
      this.options = { ...this.options, ...configs.options };
    }

    this.invoked = 0;
    this.draft = this.now();
  }

  async exec(cb: () => any): Promise<void> {
    if (this.invoked >= this.invoke) {
      await this.waitDraft();
    }

    if (this.now() >= this.draft + this.interval) {
      this.reset();
    }

    this.invoked++;

    if (this.options.async) {
      await cb();
    } else {
      cb();
    }

    if (this.options.delay) {
      await this.wait(this.options.delay);
    }
  }

  private waitDraft(): Promise<true> {
    return this.wait(this.draft + this.interval + 1 - this.now());
  }

  private reset(): void {
    this.invoked = 0;
    this.draft = this.now();
  }

  private async wait(t: number): Promise<true> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, t);
    });
  }

  private now(): number {
    return new Date().getTime();
  }
}
