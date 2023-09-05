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
        case "ArrowDown":
          this.lastkey = "PRESS down";
          break;
        case "ArrowUp":
          this.lastkey = "PRESS up";
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
        case "ArrowDown":
          this.lastkey = "RELEASE down";
          break;
        case "ArrowUp":
          this.lastkey = "RELEASE up";
          break;
      }
    });
  }
}
