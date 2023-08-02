
function script() {
  const canvas = document.getElementById('canvas1') as HTMLCanvasElement;
  const ctx = canvas.getContext("2d");
  console.log(ctx);
}

export function Container() {
  return (
    <div class="py-10 px-5 mx-auto max-w-fit lg:max-w-3xl">
      <div class="flex justify-center">
        <canvas id="canvas1" class="border-4 border-black w-[600px] h-[600px]"></canvas>
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
