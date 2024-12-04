@extends('layouts.main')

@section('title', 'prueba de integracion con MercadoPago')

@section('content')
<div class="container">
    <div class="row">
        <div class="col-12">
            <h2 class="mb-3">Prueba de Integración con Mercado Pago</h2>
            <table class="table table-bordered table-striped mb-3">
                <thead>
                    <tr>
                        <th>Título</th>
                        <th>Precio</th>
                        <th>Cantidad</th>
                        <th>Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($products as $product)
                    <tr>
                        <td>{{ $product->name }}</td>
                        <td>${{ $product->price }}</td>
                        <td>1</td>
                        <td>${{ $product->price }}</td>
                    </tr>
                    @endforeach
                    <tr>
                        <td colspan="3"><b>TOTAL:</b></td>
                        <td><b>${{ $products->sum('price') }}</b></td>
                    </tr>
                </tbody>
            </table>
            <div id="mercadopago-button"></div>

            {{-- Incluimos el SDK de JS de Mercado Pago --}}
            <script src="https://sdk.mercadopago.com/js/v2"></script>
            <script>
                // const mp = new MercadoPago('TEST-edce4b63-a9fe-4834-b4cb-93af46c4d0f5');
                // const mp = new MercadoPago('APP_USR-a285a08d-cf80-4a92-8e34-c8feee491040');
                // const mp = new MercadoPago('<?= env("MERCADOPAGO_PUBLIC_KEY");?>');
                const mp = new MercadoPago('<?= $mpPublicKey;?>');
                mp.bricks().create('wallet', 'mercadopago-button', {
                    initialization: {
                        // Noten que preferenceId debe ser un string.
                        // El valor del id lo obtenemos del objeto Preference.
                        preferenceId: '<?= $preference->id;?>',
                    }
                });
            </script>
        </div>
    </div>
</div>
@endsection
