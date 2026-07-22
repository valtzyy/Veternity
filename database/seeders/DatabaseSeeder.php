<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create Categories
        $categoriesData = [
            ['name' => 'Ampas & Sisa Olahan', 'description' => 'Ampas kopi, ampas tahu, ampas kelapa, dan sisa pengolahan makanan lainnya.', 'icon' => 'coffee'],
            ['name' => 'Kulit & Bagian Buah', 'description' => 'Kulit pisang, kulit nanas, kulit jeruk, dan kulit buah lainnya yang kaya nutrisi.', 'icon' => 'apple-slice'],
            ['name' => 'Minyak Jelantah', 'description' => 'Minyak goreng bekas pakai rumah tangga maupun katering untuk biodiesel.', 'icon' => 'droplet'],
            ['name' => 'Sisa Sayuran & Dapur', 'description' => 'Sisa potongan sayuran dapur katering atau pasar induk untuk pakan maggot/ternak.', 'icon' => 'carrot'],
            ['name' => 'Cangkang & Kulit Keras', 'description' => 'Cangkang telur ayam/bebek dan cangkang keras lainnya untuk pupuk kalsium.', 'icon' => 'egg'],
            ['name' => 'Sisa Organik & Pakan', 'description' => 'Nasi, lauk pauk, atau sisa makanan prasmanan bersih untuk ternak/maggot.', 'icon' => 'trash-2'],
        ];

        $categories = [];
        foreach ($categoriesData as $cat) {
            $categories[] = \App\Models\Category::create($cat);
        }

        // Create Admin
        User::factory()->admin()->create([
            'name' => 'Admin ReGuna',
            'email' => 'admin@reguna.com',
        ]);

        // Create Default Seller
        $defaultSeller = User::factory()->seller()->create([
            'name' => 'Seller ReGuna',
            'email' => 'seller@reguna.com',
            'phone' => '081234567890',
            'address' => 'Jl. Raya Food Waste No. 1, Jakarta',
            'is_verified' => true,
        ]);

        // Create Default Buyer
        User::factory()->buyer()->create([
            'name' => 'Buyer ReGuna',
            'email' => 'buyer@reguna.com',
            'phone' => '089876543210',
            'address' => 'Jl. Konsumen Hemat No. 42, Bandung',
        ]);

        // Create random buyers
        User::factory(5)->buyer()->create();

        // Create random sellers
        $sellers = User::factory(5)->seller()->create();

        // Collect all sellers
        $allSellers = collect([$defaultSeller])->concat($sellers);

        // Create products for each seller
        foreach ($allSellers as $seller) {
            // Seed 2 to 5 products per seller
            $productCount = rand(2, 5);
            for ($i = 0; $i < $productCount; $i++) {
                $category = $categories[array_rand($categories)];
                
                $product = \App\Models\Product::factory()->create([
                    'seller_id' => $seller->id,
                    'category_id' => $category->id,
                ]);

                // Create primary image
                \App\Models\ProductImage::factory()->create([
                    'product_id' => $product->id,
                    'is_primary' => true,
                ]);

                // Create 1-2 secondary images
                $secondaryCount = rand(1, 2);
                for ($j = 0; $j < $secondaryCount; $j++) {
                    \App\Models\ProductImage::factory()->create([
                        'product_id' => $product->id,
                        'is_primary' => false,
                    ]);
                }
            }
        }
    }
}
