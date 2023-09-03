import Player from "./player.tsx";

export const states = {
  STANDING_LEFT: 0,
  STANDING_RIGHT: 1,

}

class State {
  state: string;
  constructor(state: string) {
    this.state = state;
  }
}

class StandingLeft extends State {
  player: Player;
  constructor(player: Player) {
    super("STANDING LEFT")
    this.player = player;
  }

  enter() {
    this.player.frameY = 1;
  }

  handleInput() {

  }
}

class StandingRight extends State {
  player: Player;
  constructor(player: Player) {
    super("STANDING RIGHT")
    this.player = player;
  }

  enter() {

  }

  handleInput() {

  }
}
