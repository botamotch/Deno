import { useEffect } from "preact/hooks";

type Frame = { loc: { x: number; y: number }[] };

interface AnimationStates {
  [index: string]: Frame;
}

function script() {
  const canvas = document.getElementById("canvas1") as HTMLCanvasElement;
  const dropdown = document.getElementById("animations");
  if (dropdown != null) {
    dropdown.addEventListener("change", (e: Event) => {
      playerState = (e.target as HTMLInputElement).value;
    });
  }
  const ctx = canvas.getContext("2d");
  console.log(ctx);

  const CANVAS_WIDTH = canvas.width = 600;
  const CANVAS_HEIGHT = canvas.height = 600;

  const playerImage = new Image();
  playerImage.src = "shadow_dog.png";
  const spriteWidth = 575;
  const spriteHeight = 523;
  let playerState = "jump";

  let gameFrame = 0;
  const staggerFrames = 5;
  const spriteAnimations: AnimationStates = {};
  const animationStates = [
    {
      name: "idle",
      frames: 7,
    },
    {
      name: "jump",
      frames: 7,
    },
    {
      name: "fall",
      frames: 9,
    },
    {
      name: "run",
      frames: 9,
    },
    {
      name: "dizzy",
      frames: 11,
    },
    {
      name: "sit",
      frames: 5,
    },
    {
      name: "roll",
      frames: 7,
    },
    {
      name: "bite",
      frames: 7,
    },
    {
      name: "ko",
      frames: 5,
    },
    {
      name: "gethit",
      frames: 4,
    },
  ];
  animationStates.forEach((state, index) => {
    const frames: Frame = {
      loc: [],
    };
    for (let j = 0; j< state.frames; j++) {
      const positionX = j * spriteWidth;
      const positionY = index * spriteHeight;
      frames.loc.push({x: positionX, y: positionY});
    }
    spriteAnimations[state.name] = frames;
  });
  console.log(spriteAnimations);

  function animate() {
    if (ctx != null) {
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      const position = Math.floor(gameFrame/staggerFrames) % spriteAnimations[playerState].loc.length;
      const frameX = spriteWidth * position;
      const frameY = spriteAnimations[playerState].loc[position].y;

      ctx.drawImage(playerImage, frameX, frameY, spriteWidth, spriteHeight, 0, 0, spriteWidth, spriteHeight);

      gameFrame++
      requestAnimationFrame(animate);
    }
  }

  animate();
}

export function Container() {
  useEffect(() => {
    script();
  }, []);
  return (
    <div class="py-10 px-5 mx-auto max-w-fit lg:max-w-3xl">
      <div class="flex justify-center">
        <canvas id="canvas1" class="border-4 border-black w-[600px] h-[600px]"></canvas>
      </div>
      <div class="flex justify-center py-5">
        <label for="animations">Choose Animation:</label>
        <select id="animations" name="animations">
          <option value="idle">Idle</option>
          <option value="jump">Jump</option>
          <option value="fall">Fall</option>
          <option value="run">Run</option>
          <option value="dizzy">Dizzy</option>
          <option value="sit">Sit</option>
          <option value="bite">Bite</option>
          <option value="ko">KO</option>
          <option value="gethit">Get hit</option>
        </select>
      </div>

      <div class="flex h-80 max-w-fit lg:max-w-3xl items-center justify-center bg-blue-50">
        <div class="h-60 w-5/6 rounded bg-blue-100 flex flex-wrap justify-center gap-5">
          <button type="button" onClick={script} class="h-10 rounded-lg border border-gray-300 bg-white my-5 px-5 py-2.5 text-center text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-100 focus:ring focus:ring-gray-100 disabled:cursor-not-allowed disabled:border-gray-100 disabled:bg-gray-50 disabled:text-gray-400">
            Button text
          </button>
        </div>
      </div>
    </div>
  );
}
