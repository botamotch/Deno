export default function Header() {
  return (
    <header class="bg-white p-4 border-solid border-2 border-white border-b-gray-300">
      <nav aria-label="breadcrumb">
        <ol class="inline-flex items-center space-x-4 py-2 text-sm font-medium">
          <li class="inline-flex items-center">
            <a href="/" class="text-secondary-500 hover:text-secondary-600">
              Home
            </a>
          </li>
          <li class="inline-flex items-center space-x-4">
            <svg
              class="h-6 w-6 text-gray-400"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill-rule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clip-rule="evenodd"
              >
              </path>
            </svg>
            <a href="/game" class="text-secondary-500 hover:text-secondary-600">
              Game
            </a>
          </li>
        </ol>
      </nav>
    </header>
  );
}
