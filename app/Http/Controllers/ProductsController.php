<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Product;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Quantity;
use Illuminate\Support\Facades\Storage;

class ProductsController extends Controller
{
    public function index(Request $request)
    {
        $productsQuery = Product::with(['brand', 'category', 'quantities']);
        
        $searchParams = [
            'search' => request()->query('search'),
            'category' => request()->query('category')
        ];

        if ($searchParams['search']) {
            $productsQuery->where('name', 'like', '%' . $searchParams['search'] . '%');
        }

        if ($searchParams['category']) {
            $productsQuery->where('category_fk', '=', $searchParams['category']);
        }

        $allProducts = $productsQuery->paginate(8)->withQueryString();

        return view('products.all-products',[
            'products' => $allProducts,
            'categories' => Category::all(),
            'brand' => Brand::all(),
            'searchParams' => $searchParams
        ]);
    }
    public function administrar()
    {

        $allProducts = Product::all();

        return view('products.administracion',[
            'products' => $allProducts
        ]);
    }

    public function view(int $id)
    {
        return view('products.view',[
            'product' => Product::findOrFail($id)
        ]);
    }
    public function createForm()
    {
        return view('products.create-form', [
            'brands' => Brand::all(),
            'categories' => Category::all(),
            'quantities' => Quantity::orderBy('name')->get()
        ]);
    }
    public function createProcess(Request $request)
    {

        $request->validate([
            'name' => 'required|min:3',
            'brand_fk' => 'required',
            'category_fk' => 'required',
            // 'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
            'description' => 'required|min:3',
        ],[
            'name.required' => 'El título debe tener un valor.',
            'name.min' => 'El título debe tener al menos :min caracteres.',
            'brand_fk.required' => 'La marca debe tener un valor.',
            'category_fk.required' => 'La categoría debe tener un valor.',
            // 'image.required' => 'La imagen debe no puede estar vacia.',
            'description.required' => 'La descripción debe tener un valor.',
            'description.min' => 'La descripción debe tener al menos :min caracteres.'
        ]);

        $input = $request->all();

        if($request->hasFile('image')){
            $input['image'] = $request->file('image')->store('images', 'public');
        }

        $product = Product::create($input);
        $product->quantities()->sync($input['quantity_id'] ?? []);


        // $imageName = time() . '.' . $request->file('image')->getClientOriginalExtension();
        //     $request->file('image')->move(public_path('img'), $imageName);
    
        // $input['image'] = $imageName;

        return redirect()
            ->route('products.all-products')
            ->with('feedback.message', 'El producto <b> '. e($input['name']) .'</b> fue agregado con exito.');

    }

    public function editForm(int $id)
    {
        return view('products.edit-form', [
            'product' => Product::findOrFail($id),
            'brands' => Brand::all(),
            'categories' => Category::all(),
            'quantities' => Quantity::all()
        ]);
    }

    public function editProcess(int $id, Request $request)
    {
        $product = Product::findOrFail($id);

        $request->validate([
            'name' => 'required|min:3',
            'brand_fk' => 'required',
            'category_fk' => 'required',
            'description' => 'required|min:3',
        ],[
            'name.required' => 'El título debe tener un valor.',
            'name.min' => 'El título debe tener al menos :min caracteres.',
            'brand_fk.required' => 'La marca debe tener un valor.',
            // 'brand_fk.min' => 'La marca debe tener al menos :min caracteres.',
            'category_fk.required' => 'La categoría debe tener un valor.',
            // 'category.min' => 'La categoría debe tener al menos :min caracteres.',
            'description.required' => 'La descripción debe tener un valor.',
            'description.min' => 'La descripción debe tener al menos :min caracteres.'
        ]);

        $input = $request->except(['_token', '_method']);
        // $input = $request->only(['name', 'image', 'description', 'brand_fk', 'category_fk']);

        // if($request->hasFile('image')){
        //     $imageName = time() . '.' . $request->file('image')->getClientOriginalExtension();
        //     $request->file('image')->move(public_path('img'), $imageName);
    
        // $input['image'] = $imageName;
        // }
        
        $product = Product::findOrFail($id);

        if($request->hasFile('image')){
            $input['image'] = $request->file('image')->store('images', 'public');
        } 

        $product->update($input);
        $product->quantities()->sync($input['quantity_id'] ?? []);

        return redirect()
            ->route('products.administracion')
            ->with('feedback.message', 'El producto <b> '. e($input['name']) .'</b> fue actualizado con exito.');
    }

    public function deleteProcess(int $id)
    {
        $product = Product::findOrFail($id);

        $product->quantities()->detach();
        $product->delete();

        return redirect()
            ->route('products.all-products')
            ->with('feedback.message', 'El producto <b> '. e($product->name) .'</b> fue Eliminada con exito.');
    }
}
