<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProductFactory extends Factory
{
    protected $model = Product::class;

    public function definition(): array
    {
        $templates = [
            [
                'title' => 'Ampas Kopi Kering Kualitas Super',
                'description' => 'Ampas kopi bekas cold brew, sudah dikeringkan dengan mesin. Sangat cocok untuk pupuk tanaman, pembuatan kompos, sabun scrub, atau penghilang bau ruangan.',
                'reference_price' => 5000.00,
                'unit' => 'kg',
                'condition' => 'usable',
                'knowledge' => 'Simpan di tempat kering dan tertutup agar tidak berjamur.',
            ],
            [
                'title' => 'Kulit Pisang Raja Organik',
                'description' => 'Kulit pisang sisa produksi pisang goreng krispi. Segar dikumpulkan hari ini, cocok untuk pakan ternak, pembuatan pupuk cair (LOF), atau komposting.',
                'reference_price' => 2000.00,
                'unit' => 'kg',
                'condition' => 'fresh',
                'knowledge' => 'Segera olah dalam waktu 48 jam agar tidak mengalami fermentasi liar.',
            ],
            [
                'title' => 'Minyak Jelantah Rumah Tangga (Used Cooking Oil)',
                'description' => 'Minyak goreng bekas pakai rumah tangga, sudah disaring kasar dari sisa makanan. Sangat cocok sebagai bahan baku pembuatan lilin, sabun cuci, atau biodiesel.',
                'reference_price' => 8000.00,
                'unit' => 'liter',
                'condition' => 'usable',
                'knowledge' => 'Dikemas dalam botol plastik segel tebal untuk menghindari kebocoran.',
            ],
            [
                'title' => 'Ampas Tahu Basah Segar',
                'description' => 'Ampas tahu sisa produksi pabrik tahu rumahan pagi ini. Masih hangat dan wangi khas kedelai. Sangat tinggi protein untuk pakan sapi, kambing, atau budidaya maggot.',
                'reference_price' => 3000.00,
                'unit' => 'kg',
                'condition' => 'fresh',
                'knowledge' => 'Maksimal penyimpanan 3 hari di wadah tertutup kedap udara.',
            ],
            [
                'title' => 'Cangkang Telur Ayam Bersih Kering',
                'description' => 'Cangkang telur sisa industri martabak dan roti. Sudah dicuci bersih dari sisa putih telur dan dikeringkan di bawah sinar matahari. Sangat kaya kalsium untuk nutrisi tanaman hias.',
                'reference_price' => 12000.00,
                'unit' => 'kg',
                'condition' => 'usable',
                'knowledge' => 'Bisa dihaluskan menjadi tepung kalsium sebelum diaplikasikan ke tanah.',
            ],
            [
                'title' => 'Sisa Sayur & Potongan Sayuran Dapur Pasar',
                'description' => 'Kumpulan sisa potongan sayuran segar (kol, sawi, wortel, buncis) hasil sisa pembersihan di pasar induk. Sangat bagus untuk pakan kelinci, babi, kambing, atau budidaya maggot BSF.',
                'reference_price' => 1500.00,
                'unit' => 'kg',
                'condition' => 'fresh',
                'knowledge' => 'Harus segera dicuci kembali sebelum diberikan ke hewan ternak.',
            ],
            [
                'title' => 'Ampas Kelapa Parut Sisa Perasan Santan',
                'description' => 'Ampas kelapa parut bersih sisa perasan santan industri katering. Masih bersih dan tidak bau. Bisa dimanfaatkan untuk pakan unggas (ayam/bebek) atau campuran bahan pakan ternak.',
                'reference_price' => 2500.00,
                'unit' => 'kg',
                'condition' => 'fresh',
                'knowledge' => 'Sebaiknya langsung dikeringkan atau difermentasi agar awet.',
            ],
            [
                'title' => 'Nasi Sisa Layak Makan (Bukan Basi)',
                'description' => 'Nasi putih sisa katering prasmanan pesta pernikahan kemarin malam. Disimpan dalam freezer segera setelah acara selesai. Bersih, higienis, layak untuk pakan ternak unggas.',
                'reference_price' => 3000.00,
                'unit' => 'kg',
                'condition' => 'usable',
                'knowledge' => 'Kukus kembali sebelum disajikan ke ternak agar lebih steril.',
            ]
        ];

        $template = $this->faker->randomElement($templates);

        return array_merge([
            'seller_id' => User::factory()->seller(),
            'category_id' => Category::factory(),
            'minimum_order' => $this->faker->numberBetween(1, 5),
            'stock' => $this->faker->numberBetween(5, 100),
            'location' => $this->faker->randomElement([
                'Kec. Coblong, Bandung', 
                'Dago, Bandung', 
                'Lengkong, Bandung', 
                'Cibeunying Kidul, Bandung', 
                'Cidadap, Bandung'
            ]),
            'expired_at' => $this->faker->dateTimeBetween('now', '+5 days'),
            'status' => 'available',
            'view_count' => $this->faker->numberBetween(10, 300),
        ], $template);
    }
}
