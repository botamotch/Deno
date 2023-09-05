import InputHandler from "./input.tsx";
import Player from "./player.tsx";

export function drawStatesText(
  ctx: CanvasRenderingContext2D,
  input: InputHandler,
  player: Player,
) {
  ctx.font = "30px Helvetica";
  ctx.fillText("Last Input : " + input.lastkey, 20, 50);
  ctx.fillText("Activce state : " + player.currentState.state, 20, 90);
}

export function assertIsDefined<T>(val: T): asserts val is NonNullable<T> {
  if (val === undefined || val === null) {
    throw new Error(
      `Expected 'val' to be defined, but received ${val}`,
    );
  }
}


