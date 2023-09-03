import InputHandler from "./input.tsx";

export function drawStatesText(
  ctx: CanvasRenderingContext2D,
  input: InputHandler,
) {
  ctx.font = "30px Helvetica";
  ctx.fillText("Last Input : " + input.lastkey, 20, 50);
}

export function assertIsDefined<T>(val: T): asserts val is NonNullable<T> {
  if (val === undefined || val === null) {
    throw new Error(
      `Expected 'val' to be defined, but received ${val}`,
    );
  }
}


