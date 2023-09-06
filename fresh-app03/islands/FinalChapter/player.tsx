
export class Game {
  width: number;
  height: number;
  player: Player;
  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.player = new Player(this);
  }
  update() {}

  draw(context: CanvasRenderingContext2D) {
    this.player.draw(context);
  }

}

export class Player {
  game: Game;
  width: number;
  height: number;
  x: number;
  y: number;
  constructor(game: Game) {
    this.game = game;
    this.x = 0;
    this.y = 100;
    this.width = 100;
    this.height = 91.3;
  }

  update() {}

  draw(context: CanvasRenderingContext2D) {
    context.fillRect(this.x, this.y, this.width, this.height);
  }
}
