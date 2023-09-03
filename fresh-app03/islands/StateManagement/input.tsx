export default class InputHandler {
  lastkey: string;
  constructor() {
    this.lastkey = "";
    self.window.addEventListener("keydown", (e) => {
      switch (e.key) {
        case "ArrowLeft":
          this.lastkey = "PRESS left";
          break;
        case "ArrowRight":
          this.lastkey = "PRESS right";
          break;
      }
    });
    self.window.addEventListener("keyup", (e) => {
      switch (e.key) {
        case "ArrowLeft":
          this.lastkey = "RELEASE left";
          break;
        case "ArrowRight":
          this.lastkey = "RELEASE right";
          break;
      }
    });
  }
}
