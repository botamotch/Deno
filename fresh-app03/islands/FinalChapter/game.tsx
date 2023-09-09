import { Player } from "./player.tsx";
import { InputHandler } from "./input.tsx";
import { Background } from "./background.tsx";
import { Enemy, FlyingEnemy, ClimbingEnemy, GroundEnemy } from "./enemies.tsx";

export class Game {
  width: number;
  height: number;
  player: Player;
  input: InputHandler;
  groundMargin: number;
  speed: number;
  background: Background;
  enemies: Enemy[];
  enemyTimer: number;
  enemyInterval: number;
  debug: boolean;
  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.groundMargin = 80;
    this.speed = 3;
    this.player = new Player(this);
    this.input = new InputHandler(this);
    this.background = new Background(this);
    this.enemies = [];
    this.enemyTimer = 0;
    this.enemyInterval = 1000;
    this.debug = false;
  }
  update(deltaTime: number) {
    this.background.update();
    this.player.update(this.input.keys, deltaTime);
    if (this.enemyTimer > this.enemyInterval) {
      this.addEnemy();
      this.enemyTimer = 0;
    } else {
      this.enemyTimer += deltaTime;
    }
    this.enemies.forEach((enemy) => {
      enemy.update(deltaTime);
    });
  }

  draw(context: CanvasRenderingContext2D) {
    this.background.draw(context);
    this.player.draw(context);
    this.enemies.forEach((enemy) => {
      enemy.draw(context);
      if (enemy.markedForDeletion) this.enemies.splice(this.enemies.indexOf(enemy), 1);
    });
  }

  addEnemy() {
    if (this.speed > 0 && Math.random() < 0.5) this.enemies.push(new GroundEnemy(this));
    else if (this.speed > 0) this.enemies.push(new ClimbingEnemy(this))
    this.enemies.push(new FlyingEnemy(this));
    console.log(this.enemies);
  }
}

