export class FloatingMessage {
  timer: number;
  markedForDeletion: boolean;
  constructor(
    public value: string,
    public x: number,
    public y: number,
    public targetX: number,
    public targetY: number,
  ) {
    this.timer = 0;
    this.markedForDeletion = false;
  }

  update() {
    this.x += (this.targetX - this.x) * 0.03;
    this.y += (this.targetY - this.y) * 0.03;
    this.timer++;
    if (this.timer > 100) this.markedForDeletion = true;
  }

  draw(context: CanvasRenderingContext2D) {
    context.font = "24px Helvetica";
    context.fillStyle = "white";
    context.fillText(this.value, this.x, this.y);
    context.fillStyle = "black";
    context.fillText(this.value, this.x - 2, this.y - 2);
  }
}
