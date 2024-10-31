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

<body class="min-h-dvh relative" >
    <x-nav></x-nav>
    @if (session()->has('feedback.message'))
        <div class="alert alert-success">
            {!! session()->get('feedback.message') !!}
        </div>
    @endif

    @yield('content')

    <x-footer></x-footer>
</body>

</html>
