export class InputHandler {
  keys: [];
  constructor() {
    this.keys = [];
    self.window.addEventListener("keydown", (e) => {
      console.log(e.key);
    });
  }
}
