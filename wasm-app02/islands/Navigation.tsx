import { useSignal } from "@preact/signals";

export default function Nav() {
  const sidebarHidden = useSignal(false);

  function ToggleSidebar() {
    sidebarHidden.value = !sidebarHidden.value;
  }

  return (
    <nav class={"order-first bg-gray-50 p-4 " + (sidebarHidden.value ? "w-14" : "w-64")}>
      <button
        type="button"
        class="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
        onClick={ToggleSidebar}
      >
        <svg
          class="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
          />
        </svg>
      </button>
      <div hidden={sidebarHidden.value}>
        <p class="my-2 hover:underline">
          <a href="/">Home</a>
        </p>
        <p class="my-2 hover:underline">
          <a href="/game">Game</a>
        </p>
      </div>
    </nav>
  );
}
