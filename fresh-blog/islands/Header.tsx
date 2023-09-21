import { useSignal } from "@preact/signals";

interface HeaderProps {
  isLogin: boolean;
}

export default function Header(props: HeaderProps) {
  const isLogin = props.isLogin;
  const sidebarHidden = useSignal(true);

  function ToggleSidebar() {
    sidebarHidden.value = !sidebarHidden.value;
  }

  return (
    <header class="bg-white">
      <nav class="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8" aria-label="Global">
        <div class="flex lg:flex-1">
          <a href="/" class="m-0 p-1.5">
            <span class="sr-only">Your Company</span>
            <img class="h-8 w-auto" src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600" alt=""/>
          </a>
        </div>
        <div class="flex lg:hidden">
          <button onClick={() => ToggleSidebar() } type="button" class="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700">
            <span class="sr-only">Open main menu</span>
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
        </div>
        <div class="hidden lg:flex lg:flex-1 lg:justify-end gap-5">
          <a
            href="/login"
            class={"rounded-lg border border-blue-500 bg-blue-500 px-5 py-2 text-center text-sm font-bold text-white shadow-sm transition-all hover:border-primary-700 hover:bg-primary-700 focus:ring focus:ring-primary-200 disabled:cursor-not-allowed disabled:border-blue-300 disabled:bg-blue-300 " + ( !isLogin ? "visible" : "hidden") }
          >
            Login
          </a>
          <a
            href="/api/logout"
            class={"text-sm font-semibold leading-6 text-gray-900 " + ( isLogin ? "visible" : "hidden")}
          >
            Log out <span aria-hidden="true">&rarr;</span>
          </a>
        </div>
      </nav>
      <div hidden={sidebarHidden.value} class="lg:hidden" role="dialog" aria-modal="true">
        <div class="fixed inset-0 z-10"></div>
        <div class="fixed inset-y-0 right-0 z-10 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
          <div class="flex items-center justify-between">
            <a href="#" class="m-0 p-1.5">
              <span class="sr-only">Your Company</span>
              <img class="h-8 w-auto" src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600" alt=""/>
            </a>
            <button onClick={() => ToggleSidebar()} type="button" class="-m-2.5 rounded-md p-2.5 text-gray-700">
              <span class="sr-only">Close menu</span>
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="mt-6 flow-root">
            <div class="-my-6 divide-y divide-gray-500/10">
              <div class="py-6">
                <a
                  href="/login"
                  class={"-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50 " + ( isLogin ? "visible" : "hidden")}
                >
                  Log in
                </a>
                <a
                  href="/api/logout"
                  class={"-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50 " + ( !isLogin ? "visible" : "hidden")}
                >
                  Log out
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
