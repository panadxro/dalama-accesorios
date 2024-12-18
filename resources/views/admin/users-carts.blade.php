@extends('layouts.main')
@section('title', 'Historial de Compras')
@section('content')
<section class="min-h-dvh my-10 px-4">
  <div class="flex justify-center">
    <h2 class="text-3xl lg:text-4xl font-bold text-center mb-10">Historial de Compras</h2>
  </div>
  <div class="flex flex-col items-center justify-center">
    @if ($users->isEmpty())
      <p class="text-lg text-gray-700">No hay usuarios con historial de compras.</p>
    @else
      <div class="overflow-x-auto w-full max-w-4xl">
        <table class="min-w-full table-auto border-collapse border border-gray-300">
          <thead>
            <tr class="bg-gray-100 text-left">
              <th class="border border-gray-300 px-4 py-2 text-sm lg:text-base">Nombre</th>
              <th class="border border-gray-300 px-4 py-2 text-sm lg:text-base">Email</th>
              <th class="border border-gray-300 px-4 py-2 text-sm lg:text-base">Historial de Compras</th>
            </tr>
          </thead>
          <tbody>
            @foreach ($users as $user)
              <tr class="text-center">
                <td class="border border-gray-300 px-4 py-2 text-sm lg:text-base">
                  <p class="text-gray-700 font-bold">{{ $user->name }}</p>
                </td>
                <td class="border border-gray-300 px-4 py-2 text-sm lg:text-base">
                  <p class="text-gray-700 font-bold">{{ $user->email }}</p>
                </td>
                <td class="border border-gray-300 px-4 py-2 text-sm lg:text-base">
                  @if ($user->orders->isNotEmpty())
                    <div class="space-y-4">
                      @foreach ($user->orders as $order)
                        <div class="border p-4 rounded-md bg-gray-50 shadow-sm">
                          <p class="text-sm font-semibold text-gray-800">
                            Compra realizada el: {{ $order->created_at->format('d/m/Y H:i') }}
                          </p>
                          <ul class="mt-2 list-disc pl-5">
                            @foreach ($order->products as $product)
                              <li class="text-gray-700 text-sm">
                                {{ $product->name }} - 
                                Cantidad: {{ $product->pivot->amount }} - 
                                Total: ${{ number_format($product->pivot->amount * $product->pivot->price, 2) }}
                              </li>
                            @endforeach
                          </ul>
                          <p class="mt-2 text-sm text-gray-800 font-semibold">
                            Total de la compra: ${{ number_format($order->total_price, 2) }}
                          </p>
                        </div>
                      @endforeach
                    </div>
                  @else
                    <p class="text-gray-600">No tiene compras registradas.</p>
                  @endif
                </td>
              </tr>
            @endforeach
          </tbody>
        </table>
      </div>
    @endif
  </div>
</section>
@endsection
