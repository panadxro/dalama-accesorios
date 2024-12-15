<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>
        @yield('title', 'Main')
    </title>
    <link rel="stylesheet" href="{{ asset('css/styles.css') }}">
    <script src="https://kit.fontawesome.com/4d0f29e762.js" crossorigin="anonymous"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/flowbite/1.4.7/flowbite.min.js"></script>
    <script src="{{ url('js/tailwind.js') }}"></script>
</head>

<body class="min-h-dvh relative">
    <x-nav></x-nav>

    @if (session()->has('feedback.message'))
        <div 
            class="fixed bottom-5 right-5 bg-red-100 border-2 border-red-700 text-red-700 text-sm font-medium py-4 px-6 rounded-lg shadow-lg flex items-center space-x-4 z-50"
            role="alert">
            <div>
                <p>{!! session()->get('feedback.message') !!}</p>
            </div>
            <button 
                class="text-red-700"
                onclick="this.parentElement.style.display='none';">
                <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    @endif

    @yield('content')

    <x-footer></x-footer>
</body>
