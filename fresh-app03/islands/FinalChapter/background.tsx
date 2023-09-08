import { Game } from "./player.tsx";

class Layer {
  x: number;
  y: number;
  game: Game;
  width: number;
  height: number;
  speedModifier: number;
  image: HTMLImageElement;
  constructor(
    game: Game,
    width: number,
    height: number,
    speedModifier: number,
    image: HTMLImageElement,
  ) {
    this.x = 0;
    this.y = 0;
    this.game = game;
    this.width = width;
    this.height = height;
    this.speedModifier = speedModifier;
    this.image = image;
  }

  update() {
    if (this.x < -this.width) this.x = 0;
    else this.x -= this.game.speed * this.speedModifier;
  }

  draw(context: CanvasRenderingContext2D) {
    context.drawImage(this.image, this.x, this.y, this.width, this.height);
    context.drawImage(
      this.image,
      this.x + this.width,
      this.y,
      this.width,
      this.height,
    );
  }
}

export class Background {
  game: Game;
  width: number;
  height: number;
  backgroundLayers: Layer[];
  constructor(game: Game) {
    this.game = game;
    this.width = 1667;
    this.height = 500;
    const ly1 = document.getElementById("layer1") as HTMLImageElement;
    const ly2 = document.getElementById("layer2") as HTMLImageElement;
    const ly3 = document.getElementById("layer3") as HTMLImageElement;
    const ly4 = document.getElementById("layer4") as HTMLImageElement;
    const ly5 = document.getElementById("layer5") as HTMLImageElement;
    this.backgroundLayers = [
      new Layer(this.game, this.width, this.height, 0.0, ly1),
      new Layer(this.game, this.width, this.height, 0.2, ly2),
      new Layer(this.game, this.width, this.height, 0.4, ly3),
      new Layer(this.game, this.width, this.height, 0.8, ly4),
      new Layer(this.game, this.width, this.height, 1.0, ly5),
    ];
  }

  update() {
    this.backgroundLayers.forEach((layer) => {
      layer.update();
    });
  }

  draw(context: CanvasRenderingContext2D) {
    this.backgroundLayers.forEach((layer) => {
      layer.draw(context);
    });
  }
}
