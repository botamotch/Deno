export class InputHandler {
  keys: string[];
  constructor() {
    this.keys = [];
    self.window.addEventListener("keydown", (e) => {
      if (
        (e.key === "ArrowDown" || e.key === "ArrowUp" ||
          e.key === "ArrowLeft" || e.key === "ArrowRight") &&
        this.keys.indexOf(e.key) === -1
      ) {
        this.keys.push(e.key);
      }
    });
    self.window.addEventListener("keyup", (e) => {
      if (
        e.key === "ArrowDown" || e.key === "ArrowUp" ||
        e.key === "ArrowLeft" || e.key === "ArrowRight"
      ) {
        this.keys.splice(this.keys.indexOf(e.key), 1);
      }
    });
  }
}
