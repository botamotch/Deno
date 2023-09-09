import { Game } from "./game.tsx";

export class UI {
  game: Game;
  fontSize: number;
  fontFamily: string;
  constructor(game: Game) {
    this.game = game;
    this.fontSize = 30;
    // this.fontFamily = "Creepster";
    this.fontFamily = "Helvetica";
  }
  draw(context: CanvasRenderingContext2D) {
    context.save();
    context.shadowOffsetX = 2;
    context.shadowOffsetY = 2;
    context.shadowColor = "white";
    context.shadowBlur = 0;

    context.font = this.fontSize * 1.2 + "px " + this.fontFamily;
    context.textAlign = "left";
    context.fillStyle = this.game.fontColor;
    // score
    context.fillText("Score : " + this.game.score, 20, 50);
    // timer
    context.font = this.fontSize * 0.8 + "px " + this.fontFamily;
    context.fillText("Time : " + (this.game.time * 0.001).toFixed(1), 20, 80);
    // lives
    for (let i = 0; i < this.game.lives; i++) {
      context.drawImage(this.game.liveImage, 25 * i + 20, 95, 25, 25);
    }
    // game over messeage
    if (this.game.gameOver) {
      context.textAlign = "center";
      context.font = this.fontSize * 2.0 + "px " + this.fontFamily;
      context.fillText(
        "Boo-yah",
        this.game.width * 0.5,
        this.game.height * 0.5,
      );
      context.font = this.fontSize * 0.8 + "px " + this.fontFamily;
      context.fillText(
        "What are creatures of the night afraid of? YOU!!!",
        this.game.width * 0.5,
        this.game.height * 0.5 + 30,
      );
    }
    context.restore();
  }
}
