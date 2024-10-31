<x-top-nav></x-top-nav>
<div class="sticky top-0 z-30">
 <nav class="bg-white w-full">
    <div class="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
      <a href="/" class="flex items-center space-x-3">
          <img src="{{ asset('img/dalama-logo.png') }}" class="h-12" alt="Dalama Logo" />
      </a>
      <button data-collapse-toggle="navbar-dropdown" type="button" class="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600" aria-controls="navbar-dropdown" aria-expanded="false">
          <span class="sr-only">Open main menu</span>
          <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 1h15M1 7h15M1 13h15"/>
          </svg>
      </button>
      <div class="hidden w-full md:block md:w-auto" id="navbar-dropdown">
        <ul class="flex flex-col font-medium p-4 md:p-0 mt-4 border border-gray-100 rounded-lg md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 bg-red-700 md:bg-transparent">
          <li class="block py-2 px-3 text-white rounded md:text-black md:p-0">
            <x-nav-link route="home">Inicio</x-nav-link>
          </li>
          <li class="block py-2 px-3 text-white md:text-black md:p-0">
              <button id="dropdownNavbarLink" data-dropdown-toggle="dropdownNavbar" class="flex items-center justify-between w-full py-2 px-3 md:border-0 md:p-0 md:w-auto">Productos<svg class="w-2.5 h-2.5 ms-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 4 4 4-4"/>
            </svg></button>

              <div id="dropdownNavbar" class="z-10 hidden font-normal bg-slate-100 rounded-lg shadow w-44 ">
                  <ul class="py-2 text-sm text-black" aria-labelledby="dropdownLargeButton">
                    <li class="block px-4 py-2 hover:bg-red-700 hover:text-white">
                        <x-nav-link route="products.all-products">Todos los productos</x-nav-link>
                    </li>
                    <li class="block px-4 py-2 hover:bg-red-700 hover:text-white">
                        <x-nav-link route="products.administracion">Administrar productos</x-nav-link>
                    </li>
              </div>
          </li>
          <li class="block py-2 px-3 text-black md:p-0">
            <x-nav-link route="blog">Blog</x-nav-link>
          </li>
          <li class="block py-2 px-3 text-black md:p-0">
            <x-nav-link route="contact">Contacto</x-nav-link>
          </li>
        @guest
            <li class="block py-2 px-3 text-black md:p-0">
                <x-nav-link route="auth.login.form">Inicio de sesión</x-nav-link>
            </li>
            @else
            <li class="block py-2 px-3 text-black md:p-0">
                <form action="{{ route('auth.logout.process') }}" method="POST" class="mb-0">
                    @csrf
                    <button class="text-black hover:underline"> {{ auth()->user()->email }} (Cerrar Sesión) </button>
                </form>
            </li>
        @endguest
        </ul>
      </div>
    </div>
  </nav>
  
    </div>
