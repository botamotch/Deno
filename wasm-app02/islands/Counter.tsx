import type { Signal } from "@preact/signals";
import { Button } from "@/components/Button.tsx";
import { add, instantiate, main } from "@/lib/rs_lib.generated.js";
import { useEffect } from "preact/hooks";

interface CounterProps {
  count: Signal<number>;
}

export default function Counter(props: CounterProps) {
  useEffect(() => {
    (async () => {
      await instantiate({
        url: new URL("rs_lib_bg.wasm", location.origin),
      });
      main();
    })();
  });

  return (
    <div class="flex gap-8 py-6">
      <Button
        onClick={() => {
          props.count.value -= 1;
          console.log("count +1 is " + add(1, props.count.value));
        }}
      >
        -1
      </Button>
      <p class="text-3xl">{props.count}</p>
      <Button
        onClick={() => {
          props.count.value += 1;
          console.log("count +1 is " + add(1, props.count.value));
        }}
      >
        +1
      </Button>
      <canvas
        id="canvas"
        class="bg-blue-300 border-4 border-gray-800 max-w-full max-h-full"
      />
    </div>
  );
}
