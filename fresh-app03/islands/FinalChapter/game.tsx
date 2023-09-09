import { Player } from "./player.tsx";
import { InputHandler } from "./input.tsx";
import { Background } from "./background.tsx";
import { ClimbingEnemy, Enemy, FlyingEnemy, GroundEnemy } from "./enemies.tsx";
import { Particle } from "./particles.tsx";
import { UI } from "./ui.tsx";
import { CollisionAnimation } from "./collisionAnimation.tsx";
import { FloatingMessage } from "./floatingMessage.tsx";

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
  score: number;
  fontColor: string;
  UI: UI;
  particles: Particle[];
  collisions: CollisionAnimation[];
  time: number;
  maxTime: number;
  gameOver: boolean;
  lives: number;
  liveImage: HTMLImageElement;
  floatingMessage: FloatingMessage[];
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
    this.score = 0;
    this.debug = false;
    this.fontColor = "black";
    this.UI = new UI(this);
    this.particles = [];
    this.collisions = [];
    this.time = 0;
    this.maxTime = 20000;
    this.gameOver = false;
    this.lives = 5;
    this.liveImage = document.getElementById("lives") as HTMLImageElement;
    this.floatingMessage = [];
  }
  update(deltaTime: number) {
    this.time += deltaTime;
    if (this.time > this.maxTime) this.gameOver = true;
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
    this.particles.forEach((particle, index) => {
      particle.update();
      if (particle.markedForDeletion) this.particles.splice(index, 1);
    });
    if (this.particles.length > 50) {
      this.particles = this.particles.slice(0, 50);
    }
    this.collisions.forEach((collision, index) => {
      collision.update(deltaTime);
      if (collision.markedForDeletion) this.collisions.splice(index, 1);
    });
    this.floatingMessage.forEach((message, index) => {
      message.update();
      if (message.markedForDeletion) this.floatingMessage.splice(index, 1);
    });
  }

  draw(context: CanvasRenderingContext2D) {
    this.background.draw(context);
    this.player.draw(context);
    this.enemies.forEach((enemy) => {
      enemy.draw(context);
      if (enemy.markedForDeletion) {
        this.enemies.splice(this.enemies.indexOf(enemy), 1);
      }
    });
    this.UI.draw(context);
    this.particles.forEach((particle) => {
      particle.draw(context);
    });
    this.collisions.forEach((collision) => {
      collision.draw(context);
    });
    this.floatingMessage.forEach((message) => {
      message.draw(context);
    });
  }

  addEnemy() {
    if (this.speed > 0 && Math.random() < 0.5) {
      this.enemies.push(new GroundEnemy(this));
    } else if (this.speed > 0) this.enemies.push(new ClimbingEnemy(this));
    this.enemies.push(new FlyingEnemy(this));
    // console.log(this.enemies);
  }
}
