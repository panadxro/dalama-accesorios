<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Blog;


class HomeController extends Controller
{
    public function home()
    {
        $allBlogs = Blog::all();
        return view('index',[
            'blogs' => $allBlogs
        ]);
        
    }
    public function blog()
    {
        $allBlogs = Blog::all();

        return view('blog',[
            'blogs' => $allBlogs
        ]);
    }
    public function contact()
    {
        return view('contact');
    }

    public function blogView(int $id)
    {
        return view('blog-view',[
            'blog' => Blog::findOrFail($id)
        ]);
    }
}
