import Player from "./player.tsx";

export const states = {
  STANDING_LEFT: 0,
  STANDING_RIGHT: 1,
  SITTING_LEFT: 2,
  SITTING_RIGHT: 3,
  RUNNING_LEFT: 4,
  RUNNING_RIGHT: 5,
  JUMPING_LEFT: 6,
  JUMPING_RIGHT: 7,
  FALLING_LEFT: 8,
  FALLING_RIGHT: 9,
};

export class State {
  state: string;
  constructor(state: string) {
    this.state = state;
  }
  handleInput(_: string) {}
  enter() {}
}

export class StandingLeft extends State {
  player: Player;
  constructor(player: Player) {
    super("STANDING LEFT");
    this.player = player;
  }

  enter() {
    this.player.frameY = 1;
    this.player.speed = 0;
    this.player.maxFrame = 6;
  }

  handleInput(input: string) {
    if (input === "PRESS right") this.player.setState(states.RUNNING_RIGHT);
    else if (input === "PRESS left") this.player.setState(states.RUNNING_LEFT);
    else if (input === "PRESS down") this.player.setState(states.SITTING_LEFT);
    else if (input === "PRESS up") this.player.setState(states.JUMPING_LEFT);
  }
}

export class StandingRight extends State {
  player: Player;
  constructor(player: Player) {
    super("STANDING RIGHT");
    this.player = player;
  }

  enter() {
    this.player.frameY = 0;
    this.player.speed = 0;
    this.player.maxFrame = 6;
  }

  handleInput(input: string) {
    if (input === "PRESS left") this.player.setState(states.RUNNING_LEFT);
    else if (input === "PRESS right") {
      this.player.setState(states.RUNNING_RIGHT);
    } else if (input === "PRESS down") {
      this.player.setState(states.SITTING_RIGHT);
    } else if (input === "PRESS up") this.player.setState(states.JUMPING_RIGHT);
  }
}

export class SittingLeft extends State {
  player: Player;
  constructor(player: Player) {
    super("SITTING LEFT");
    this.player = player;
  }

  enter() {
    this.player.frameY = 9;
    this.player.speed = 0;
    this.player.maxFrame = 4;
  }

  handleInput(input: string) {
    if (input === "PRESS right") this.player.setState(states.SITTING_RIGHT);
    else if (input === "RELEASE down") {
      this.player.setState(states.STANDING_LEFT);
    }
  }
}

export class SittingRight extends State {
  player: Player;
  constructor(player: Player) {
    super("SITTING RIGHT");
    this.player = player;
  }

  enter() {
    this.player.frameY = 8;
    this.player.speed = 0;
    this.player.maxFrame = 4;
  }

  handleInput(input: string) {
    if (input === "PRESS left") this.player.setState(states.SITTING_LEFT);
    else if (input === "RELEASE down") {
      this.player.setState(states.STANDING_RIGHT);
    }
  }
}

export class RunningLeft extends State {
  player: Player;
  constructor(player: Player) {
    super("SITTING LEFT");
    this.player = player;
  }

  enter() {
    this.player.frameY = 7;
    this.player.speed = -this.player.maxSpeed;
    this.player.maxFrame = 8;
  }

  handleInput(input: string) {
    if (input === "PRESS right") this.player.setState(states.RUNNING_RIGHT);
    else if (input === "RELEASE left") {
      this.player.setState(states.STANDING_LEFT);
    } else if (input === "PRESS down") {
      this.player.setState(states.SITTING_LEFT);
    }
  }
}

export class RunningRight extends State {
  player: Player;
  constructor(player: Player) {
    super("SITTING RIGHT");
    this.player = player;
  }

  enter() {
    this.player.frameY = 6;
    this.player.speed = this.player.maxSpeed;
    this.player.maxFrame = 8;
  }

  handleInput(input: string) {
    if (input === "PRESS left") this.player.setState(states.RUNNING_LEFT);
    else if (input === "RELEASE right") {
      this.player.setState(states.STANDING_RIGHT);
    } else if (input === "PRESS down") {
      this.player.setState(states.SITTING_RIGHT);
    }
  }
}

export class JumpingLeft extends State {
  player: Player;
  constructor(player: Player) {
    super("JUMPING LEFT");
    this.player = player;
  }

  enter() {
    this.player.frameY = 3;
    this.player.maxFrame = 6;
    this.player.speed = -this.player.maxSpeed * 0.5;
    if (this.player.onGround()) {
      this.player.vy = -30;
    }
  }

  handleInput(input: string) {
    if (input === "PRESS right") this.player.setState(states.JUMPING_RIGHT);
    else if (this.player.onGround()) this.player.setState(states.STANDING_LEFT);
    else if (this.player.vy > 0) this.player.setState(states.FALLING_LEFT);
  }
}

export class JumpingRight extends State {
  player: Player;
  constructor(player: Player) {
    super("JUMPING RIGHT");
    this.player = player;
  }

  enter() {
    this.player.frameY = 2;
    this.player.maxFrame = 6;
    this.player.speed = this.player.maxSpeed * 0.5;
    if (this.player.onGround()) {
      this.player.vy = -30;
    }
  }

  handleInput(input: string) {
    if (input === "PRESS left") this.player.setState(states.JUMPING_LEFT);
    else if (this.player.onGround()) this.player.setState(states.STANDING_RIGHT);
    else if (this.player.vy > 0) this.player.setState(states.FALLING_RIGHT);
  }
}

export class FallingLeft extends State {
  player: Player;
  constructor(player: Player) {
    super("FALLING LEFT");
    this.player = player;
  }

  enter() {
    this.player.frameY = 5;
    this.player.maxFrame = 6;
  }

  handleInput(input: string) {
    if (input === "PRESS right") this.player.setState(states.FALLING_RIGHT);
    else if (this.player.onGround()) this.player.setState(states.STANDING_LEFT);
  }
}

export class FallingRight extends State {
  player: Player;
  constructor(player: Player) {
    super("FALLING RIGHT");
    this.player = player;
  }

  enter() {
    this.player.frameY = 4;
    this.player.maxFrame = 6;
  }

  handleInput(input: string) {
    if (input === "PRESS left") this.player.setState(states.FALLING_LEFT);
    else if (this.player.onGround()) this.player.setState(states.STANDING_RIGHT);
  }
}
