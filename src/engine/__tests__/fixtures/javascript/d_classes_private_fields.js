class Counter {
  #count = 0;
  static step = 2;
  constructor(start = 0) {
    this.#count = start;
  }
  increment() {
    this.#count += Counter.step;
    return this.#count;
  }
}
function testCounter(init) {
  const c = new Counter(init);
  c.increment();
  return c.increment();
}