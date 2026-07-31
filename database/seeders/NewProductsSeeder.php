<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\User;
use App\Services\CloudinaryService;
use Illuminate\Database\Seeder;
use Illuminate\Http\UploadedFile;

class NewProductsSeeder extends Seeder
{
    public function run(): void
    {
        $seller = User::where('email', 'seller@reguna.com')->first();
        if (!$seller) {
            $this->command->error('Seller ReGuna not found!');
            return;
        }

        $categories = Category::all()->keyBy('name');

        $productsData = [
            [
                'title' => 'Ampas Kopi Organik Kering',
                'category_name' => 'Ampas & Sisa Olahan',
                'description' => 'Ampas kopi pilihan berkualitas tinggi dari cafe-cafe lokal. Telah dikeringkan secara alami untuk mencegah pertumbuhan jamur. Sangat cocok digunakan untuk pupuk organik, campuran kompos, penetral bau, maupun media tanam.',
                'reference_price' => 5000,
                'minimum_order' => 10,
                'stock' => 200,
                'unit' => 'kg',
                'location' => 'Jakarta Selatan',
                'condition' => 'usable',
                'image_path' => 'C:\Users\asus\.gemini\antigravity-ide\brain\53d0a701-d9a3-44ab-a9aa-171bd17b3726\waste_coffee_grounds_1785484562316.png',
            ],
            [
                'title' => 'Ampas Tahu Basah Protein Tinggi',
                'category_name' => 'Ampas & Sisa Olahan',
                'description' => 'Ampas tahu segar murni sisa pengolahan pabrik tahu rumahan. Memiliki kandungan air dan protein yang tinggi. Sangat baik digunakan sebagai pakan ternak ruminansia (sapi, kambing) maupun budidaya maggot BSF.',
                'reference_price' => 3000,
                'minimum_order' => 50,
                'stock' => 500,
                'unit' => 'kg',
                'location' => 'Depok',
                'condition' => 'fresh',
                'image_path' => 'C:\Users\asus\.gemini\antigravity-ide\brain\53d0a701-d9a3-44ab-a9aa-171bd17b3726\waste_soybean_dregs_1785484575440.png',
            ],
            [
                'title' => 'Minyak Jelantah Saringan Bersih',
                'category_name' => 'Minyak Jelantah',
                'description' => 'Minyak goreng bekas pakai rumah tangga dan katering yang telah disaring bersih dari sisa makanan. Siap diolah kembali sebagai bahan baku pembuatan biodiesel, lilin aromaterapi, maupun sabun pembersih ramah lingkungan.',
                'reference_price' => 8500,
                'minimum_order' => 5,
                'stock' => 150,
                'unit' => 'kg',
                'location' => 'Tangerang',
                'condition' => 'usable',
                'image_path' => 'C:\Users\asus\.gemini\antigravity-ide\brain\53d0a701-d9a3-44ab-a9aa-171bd17b3726\waste_cooking_oil_1785484591438.png',
            ],
            [
                'title' => 'Cangkang Telur Kering Hancur Kasar',
                'category_name' => 'Cangkang & Kulit Keras',
                'description' => 'Cangkang telur ayam bersih yang sudah melalui proses pencucian, pengeringan, dan dihancurkan secara kasar. Sangat tinggi kandungan kalsium karbonat, cocok untuk pupuk alami pencegah busuk ujung buah (blossom end rot) dan pakan tambahan unggas.',
                'reference_price' => 6000,
                'minimum_order' => 2,
                'stock' => 100,
                'unit' => 'kg',
                'location' => 'Bekasi',
                'condition' => 'usable',
                'image_path' => 'C:\Users\asus\.gemini\antigravity-ide\brain\53d0a701-d9a3-44ab-a9aa-171bd17b3726\waste_eggshells_1785484607555.png',
            ],
            [
                'title' => 'Kulit Pisang Ambon Segar Potongan',
                'category_name' => 'Kulit & Bagian Buah',
                'description' => 'Kulit pisang ambon segar sisa produksi industri kue/pisang goreng. Mengandung kadar kalium dan fosfor yang tinggi. Sangat baik digunakan sebagai bahan utama pembuatan pupuk organik cair (POC) untuk mempercepat pembungaan.',
                'reference_price' => 4000,
                'minimum_order' => 10,
                'stock' => 80,
                'unit' => 'kg',
                'location' => 'Jakarta Timur',
                'condition' => 'fresh',
                'image_path' => 'C:\Users\asus\.gemini\antigravity-ide\brain\53d0a701-d9a3-44ab-a9aa-171bd17b3726\waste_banana_peels_1785484620452.png',
            ],
            [
                'title' => 'Sisa Sayuran Dapur Bersih Harian',
                'category_name' => 'Sisa Sayuran & Dapur',
                'description' => 'Sisa potongan sayuran segar (kol, wortel, sawi, kangkung) dari bagian persiapan dapur restoran/katering. Bersih, bebas dari sampah plastik or non-organik lainnya. Sangat direkomendasikan untuk pakan maggot BSF maupun kompos hijau.',
                'reference_price' => 2500,
                'minimum_order' => 20,
                'stock' => 300,
                'unit' => 'kg',
                'location' => 'Jakarta Barat',
                'condition' => 'fresh',
                'image_path' => 'C:\Users\asus\.gemini\antigravity-ide\brain\53d0a701-d9a3-44ab-a9aa-171bd17b3726\waste_vegetable_scraps_1785484634321.png',
            ],
        ];

        foreach ($productsData as $data) {
            $category = $categories->get($data['category_name']);
            if (!$category) {
                $this->command->warn("Category {$data['category_name']} not found, skipping {$data['title']}");
                continue;
            }

            if (!file_exists($data['image_path'])) {
                $this->command->error("Image file not found: {$data['image_path']}, skipping {$data['title']}");
                continue;
            }

            // Upload image to Cloudinary using CloudinaryService
            $file = new UploadedFile(
                $data['image_path'],
                basename($data['image_path']),
                'image/png',
                null,
                true
            );

            try {
                $this->command->info("Uploading image for '{$data['title']}' to Cloudinary...");
                $imageUrl = CloudinaryService::upload($file, 'products');
                $this->command->info("Uploaded: {$imageUrl}");

                // Create Product
                $product = Product::create([
                    'seller_id' => $seller->id,
                    'category_id' => $category->id,
                    'title' => $data['title'],
                    'description' => $data['description'],
                    'reference_price' => $data['reference_price'],
                    'minimum_order' => $data['minimum_order'],
                    'stock' => $data['stock'],
                    'unit' => $data['unit'],
                    'location' => $data['location'],
                    'condition' => $data['condition'],
                    'status' => 'available',
                    'view_count' => 0,
                ]);

                // Create Product Image record
                ProductImage::create([
                    'product_id' => $product->id,
                    'image_url' => $imageUrl,
                    'is_primary' => true,
                ]);

                $this->command->info("Product '{$data['title']}' successfully created!");
            } catch (\Exception $e) {
                $this->command->error("Failed to process product '{$data['title']}': " . $e->getMessage());
            }
        }
    }
}
