<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRecurrentUser
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {

        // $id = $request->route('product_id');
        // $product = Product::findOrFail($id);
        // if($user->recurrent_brand_fk)
        // if (!session()->get('userbrandverified')){
        //     session()->put('userbrandverified', true);
        // return to_route('products.all-products', ['id' => $])
        // }
        return $next($request);
    }
}
