<a {{ request()->routeIs($route) ?'active' : '' }} {!! request()->routeIs($route) ?'aria-current="page"' : '' !!}
    href="{{ route($route) }}"
    class="block"
    >
    {{ $slot }} 
</a>
