# ReGuna AI Skill - Coding Standard & Project Guidelines
## Custom Instruction untuk AI (Claude, ChatGPT, etc)

---

## 📋 PREAMBLE (GUNAKAN DI AWAL SETIAP PROMPT)

Salin-paste bagian ini di awal setiap kali kamu minta AI generate code:

```
=== REGUNA PROJECT CONTEXT ===

Project: ReGuna Marketplace (Food Waste Trading Platform)
Framework: Laravel 12 + Blade + Alpine.js + Tailwind CSS
Database: PostgreSQL (Neon)
Competition: Veternity Beraksi 2026
Timeline: 10-day sprint
Team: 3 people (Valzy as backend lead, 2 specialists)

CRITICAL CONSTRAINTS:
- Do NOT create unnecessary files or folders
- Do NOT add dependencies not in composer.json
- Do NOT create migration files (already exist)
- Do NOT generate config files unless explicitly asked
- Do NOT create .env files or secrets
- Focus on core features only (NO payment gateway full impl)
- Follow Laravel conventions strictly
- Performance optimization is priority
- Code must be production-ready

=== END CONTEXT ===
```

---

## 🎯 SPECIFIC INSTRUCTION FOR AI

### PART 1: FOLDER STRUCTURE - YANG BOLEH DIBUAT

**✅ ALLOWED TO CREATE:**
```
app/
├── Http/
│   ├── Controllers/        ← Controllers (ProductController.php)
│   ├── Requests/           ← Form Requests (StoreProductRequest.php)
│   ├── Resources/          ← API Resources (ProductResource.php)
│   └── Middleware/         ← Middleware (IsAdmin.php, IsSeller.php)
├── Models/                 ← Eloquent Models (Product.php, User.php)
├── Services/               ← Business logic services (ProductService.php)
├── Exceptions/             ← Custom exceptions
└── Traits/                 ← Reusable traits (HasTimestamps.php)

routes/
├── web.php                 ← Web routes
└── api.php                 ← API routes (if needed)

resources/
├── views/
│   ├── layouts/            ← Base templates
│   ├── components/         ← Reusable Blade components
│   ├── products/           ← Product-related views
│   ├── auth/               ← Auth views
│   ├── orders/             ← Order views
│   └── dashboard/          ← Dashboard views
└── css/                    ← Custom CSS (if needed beyond Tailwind)

database/
├── migrations/             ← Alterations only (DO NOT create new)
└── seeders/                ← Seeders untuk test data

tests/
├── Unit/                   ← Unit tests
└── Feature/                ← Feature tests

storage/
└── logs/                   ← Application logs (auto-generated)

public/
├── images/                 ← Static images
└── js/                     ← JavaScript files (if needed)
```

### ❌ NOT ALLOWED TO CREATE:

```
❌ vendor/                  - Don't create (composer install handles)
❌ node_modules/            - Don't create (npm install handles)
❌ .env                     - Don't create (exists as .env.example)
❌ .env.example             - Don't modify unless explicitly asked
❌ composer.lock            - Don't create (auto-generated)
❌ package-lock.json        - Don't create (auto-generated)
❌ docker/                  - Not needed for this sprint
❌ .github/workflows/       - Not needed (deploy manually via Render)
❌ config/                  - Already complete, don't add
❌ bootstrap/               - Don't touch
❌ storage/app/             - Don't create unnecessary dirs
❌ .vscode/                 - Personal preference, don't include
❌ build/                   - Not needed
❌ dist/                    - Not needed
❌ unnecessary test files   - Only create if requested
```

---

## 💻 CODING STANDARDS - LARAVEL

### 1. MODEL FILES (app/Models/)

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Casts\Attribute;

class Product extends Model
{
    use SoftDeletes;
    
    // 1. Define fillable (explicit)
    protected $fillable = [
        'seller_id',
        'category_id',
        'title',
        'description',
        'reference_price',
        'minimum_order',
        'stock',
        'unit',
        'location',
        'condition',
        'expired_at',
        'knowledge',
        'status',
    ];
    
    // 2. Define casts (for type safety)
    protected $casts = [
        'reference_price' => 'decimal:2',
        'expired_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
        'condition' => 'string', // enum
        'status' => 'string', // enum
    ];
    
    // 3. Define hidden attributes
    protected $hidden = [
        'deleted_at',
    ];
    
    // 4. Relationships (use type hints)
    public function seller(): BelongsTo
    {
        return $this->belongsTo(User::class, 'seller_id');
    }
    
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }
    
    // 5. Scopes untuk filtering
    public function scopeAvailable($query)
    {
        return $query->where('status', 'available');
    }
    
    public function scopeOfSeller($query, $sellerId)
    {
        return $query->where('seller_id', $sellerId);
    }
    
    // 6. Accessor/Mutator (jika ada logic)
    protected function formattedPrice(): Attribute
    {
        return Attribute::make(
            get: fn () => 'Rp ' . number_format($this->reference_price)
        );
    }
}
```

**RULES:**
- ✅ Use explicit `$fillable` (NOT `$guarded = ['*']`)
- ✅ Use `$casts` untuk type safety
- ✅ Use relationship type hints (`: BelongsTo`, `: HasMany`)
- ✅ Use scopes untuk common filters
- ✅ Always use eager loading to prevent N+1
- ❌ Don't add logic di model (use services)
- ❌ Don't over-complicate

---

### 2. CONTROLLER FILES (app/Http/Controllers/)

```php
<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Pagination\Paginator;

class ProductController extends Controller
{
    // 1. Authorization di constructor
    public function __construct()
    {
        $this->middleware('auth', except: ['index', 'show']);
    }
    
    // 2. Index - dengan pagination & eager loading
    public function index()
    {
        $products = Product::available()
            ->with(['seller:id,name,average_rating', 'category:id,name'])
            ->latest()
            ->paginate(15);
        
        return response()->json([
            'success' => true,
            'data' => ProductResource::collection($products)
        ]);
    }
    
    // 3. Store - dengan validation & authorization
    public function store(StoreProductRequest $request)
    {
        // Validate is done by StoreProductRequest
        
        $product = auth()->user()->products()->create($request->validated());
        
        return response()->json([
            'success' => true,
            'message' => 'Produk berhasil dibuat',
            'data' => new ProductResource($product)
        ], 201);
    }
    
    // 4. Show - dengan related data
    public function show(Product $product)
    {
        $product->load(['seller', 'category', 'images', 'ratings']);
        $product->increment('view_count');
        
        return response()->json([
            'success' => true,
            'data' => new ProductResource($product)
        ]);
    }
    
    // 5. Update - dengan authorization
    public function update(UpdateProductRequest $request, Product $product)
    {
        $this->authorize('update', $product);
        
        $product->update($request->validated());
        
        return response()->json([
            'success' => true,
            'message' => 'Produk berhasil diperbarui',
            'data' => new ProductResource($product)
        ]);
    }
    
    // 6. Destroy - soft delete
    public function destroy(Product $product)
    {
        $this->authorize('delete', $product);
        
        $product->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Produk berhasil dihapus'
        ]);
    }
}
```

**RULES:**
- ✅ Use Form Requests untuk validation
- ✅ Use authorization checks (`$this->authorize()`)
- ✅ Use eager loading di index/show
- ✅ Return consistent JSON structure
- ✅ Use 201 status untuk create, 200 untuk success
- ❌ Don't put logic di controller (use services)
- ❌ Don't repeat validation code

---

### 3. FORM REQUEST FILES (app/Http/Requests/)

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check() && auth()->user()->isSeller();
    }
    
    public function rules(): array
    {
        return [
            'title' => 'required|string|min:5|max:255',
            'description' => 'required|string|min:20',
            'reference_price' => 'required|numeric|gt:0',
            'minimum_order' => 'required|integer|gte:1',
            'stock' => 'required|integer|gte:0',
            'unit' => 'required|string|in:kg,liter,pcs,box',
            'location' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'condition' => 'required|in:fresh,usable,near_expired',
            'expired_at' => 'nullable|date|after:now',
            'knowledge' => 'nullable|string|max:1000',
        ];
    }
    
    public function messages(): array
    {
        return [
            'title.required' => 'Judul produk harus diisi',
            'reference_price.gt' => 'Harga harus lebih dari 0',
            // Customize messages
        ];
    }
}
```

**RULES:**
- ✅ Always check authorization di `authorize()`
- ✅ Use specific validation rules
- ✅ Provide Indonesian messages
- ✅ Use `validated()` method untuk get validated data

---

### 4. DATABASE QUERIES - BEST PRACTICES

```php
// ❌ BAD - N+1 problem
$products = Product::all();
foreach ($products as $product) {
    echo $product->seller->name; // N queries!
}

// ✅ GOOD - Eager loading
$products = Product::with('seller')->get();
foreach ($products as $product) {
    echo $product->seller->name; // 1 query
}

// ✅ GOOD - Pagination with eager loading
$products = Product::with(['seller', 'category'])
    ->where('status', 'available')
    ->paginate(15);

// ✅ GOOD - Use scopes
$products = Product::available()
    ->ofSeller(auth()->id())
    ->latest()
    ->get();

// ✅ GOOD - Use select() untuk reduce data
$sellers = Product::select('seller_id')
    ->distinct()
    ->get();
```

---

### 5. NAMING CONVENTIONS

```
MODELS:
  Product.php, User.php, Category.php ← Singular, PascalCase

CONTROLLERS:
  ProductController.php ← Singular + Controller, PascalCase

REQUESTS:
  StoreProductRequest.php ← Verb + Model + Request
  UpdateProductRequest.php

RESOURCES:
  ProductResource.php ← Model + Resource

MIGRATIONS:
  create_products_table.php ← create_table_table
  add_columns_to_products_table.php

METHODS:
  public function storeProduct() ← camelCase
  public function updateProductStatus() ← action + noun

VARIABLES:
  $productId ← camelCase
  $isActive ← camelCase
  $allProducts ← camelCase

DATABASE:
  table_name ← snake_case
  column_name ← snake_case
  seller_id ← snake_case, singular
```

---

## 🛡️ ERROR HANDLING & VALIDATION

### API Response Format (STANDARDIZED)

```php
// ✅ SUCCESS RESPONSE
{
    "success": true,
    "message": "Data berhasil diambil",
    "data": { /* actual data */ }
}

// ✅ SUCCESS RESPONSE (Paginated)
{
    "success": true,
    "message": "Data berhasil diambil",
    "data": [ /* items */ ],
    "meta": {
        "current_page": 1,
        "per_page": 15,
        "total": 100
    }
}

// ✅ ERROR RESPONSE
{
    "success": false,
    "message": "Validation failed",
    "errors": {
        "email": ["Email sudah terdaftar"],
        "password": ["Password minimal 8 karakter"]
    }
}

// ✅ COMMON ERRORS
{
    "success": false,
    "message": "Unauthorized",
    "status": 401
}
```

---

## 📝 VIEWS & FRONTEND STANDARDS

### Blade Components

```blade
{{-- ✅ resources/views/components/product-card.blade.php --}}
@props(['product', 'link' => null])

<div class="bg-white rounded-lg shadow hover:shadow-lg transition p-4">
    {{-- Image --}}
    <div class="relative bg-gray-100 rounded mb-3 overflow-hidden">
        @if($product->images()->where('is_primary', true)->exists())
            <img 
                src="{{ $product->images()->where('is_primary', true)->first()->image_url }}"
                alt="{{ $product->title }}"
                class="w-full h-48 object-cover"
                loading="lazy"
            >
        @endif
    </div>
    
    {{-- Content --}}
    <h3 class="font-bold text-lg truncate">{{ $product->title }}</h3>
    
    {{-- Price --}}
    <p class="text-2xl font-bold text-green-600">
        Rp {{ number_format($product->reference_price) }}
    </p>
    
    {{-- Seller --}}
    <p class="text-gray-600 text-sm">
        {{ $product->seller->name }}
        @if($product->seller->average_rating)
            <span class="text-yellow-500">⭐ {{ $product->seller->average_rating }}</span>
        @endif
    </p>
    
    {{-- Action --}}
    @if($link)
        <a href="{{ $link }}" class="btn btn-primary w-full mt-3">
            Lihat Detail
        </a>
    @endif
</div>
```

**RULES:**
- ✅ Use Alpine.js untuk interaksi sederhana
- ✅ Use Tailwind CSS classes (NO custom CSS)
- ✅ Use Blade components untuk reusable UI
- ✅ Lazy load images
- ✅ Mobile-first responsive design
- ❌ Don't use Bootstrap atau CSS framework lain
- ❌ Don't create inline styles

---

## 🚫 STRICT EXCLUSIONS

**Jangan buat di bawah ini tanpa explicit approval:**

1. **Config files** - Sudah lengkap
2. **Middleware** baru - Hanya jika core features membutuhkan
3. **Service providers** - Jangan ubah existing
4. **Custom packages** - Gunakan yang sudah di-composer.json
5. **Job/Queue** - Tidak prioritas untuk MVP
6. **Events/Listeners** - Keep it simple
7. **Policies** (authorization) - Minimal, inline checks okay
8. **Observers** - Avoid, explicit method calls clearer
9. **Rate limiting** - Gak ada time untuk implementasi
10. **Caching** - Hanya jika performance critical

---

## ✅ DEPLOYMENT CONSIDERATIONS

### Code yang production-ready:
- ✅ Proper error handling (try-catch, validation)
- ✅ Logging untuk debug (Log::info, Log::error)
- ✅ Query optimization (eager loading, indexes)
- ✅ Security (authorization checks, input validation)
- ✅ Performance (no N+1, pagination)

### Testing requirement:
- ✅ At least feature tests untuk critical flows
- ✅ Test authorization & validation
- ✅ Don't aim for 100% coverage (unrealistic for timeline)

---

## 🎯 PRIORITY CHECKLIST SETIAP GENERATE

**Sebelum AI generate code, pastikan:**

- [ ] Request jelas dan specific
- [ ] Tidak asking untuk create unnecessary files
- [ ] Sudah include database schema context
- [ ] Sudah mention apakah itu model, controller, atau view
- [ ] Sudah mention validation rules jika ada
- [ ] Sudah mention relationships jika ada

**Setelah AI generate code:**

- [ ] Check folder structure (sesuai allowed paths)
- [ ] Check naming conventions
- [ ] Check eager loading di queries
- [ ] Check validation rules lengkap
- [ ] Check authorization checks ada
- [ ] Check JSON response format standard
- [ ] Check no unnecessary files created

---

## 📞 QUICK REFERENCE

**Common tasks prompt format:**

```
Task: Create a controller for [Feature Name]

Requirements:
1. Actions needed: index, store, update, destroy
2. Authorization: Only seller can create/update/destroy
3. Validation: [list validation rules]
4. Relationships: belongs to User, has many [Models]
5. Response: Standard JSON format
6. Do not create: Any files outside app/Http/Controllers/

Generate for: Laravel 12, PostgreSQL
```

---

## 🚀 TEMPLATE PROMPT UNTUK AI

**Use this template untuk consistent output:**

```
=== REGUNA PROJECT CODE GENERATION ===

PROJECT CONTEXT:
- Framework: Laravel 12
- Feature: [Feature name]
- Owner: [Team member name]
- Deadline: [Day]
- Status: [Database done / Relations done / etc]

TASK:
Generate [Model/Controller/Request/View] untuk [Feature]

SPECIFICATIONS:
1. Database table: [table name]
2. Relationships: [relationships to other models]
3. Validation rules: [if applicable]
4. Authorization: [who can access]
5. Response format: [describe expected output]
6. Do not create: [list of files to exclude]

CONTEXT:
[Any additional context needed]

CODE REQUIREMENTS:
- Follow Laravel 12 conventions
- Use eager loading for queries
- Include proper type hints
- Add comments for complex logic
- Use soft deletes if applicable
- Include validation in Form Requests
- Response using standard JSON format

FORBIDDEN:
- No unnecessary files/folders
- No new dependencies
- No migration files
- No config modifications
- No extra packages

Provide ONLY the code needed. Ready?
```

---

## 💡 TIPS MENGGUNAKAN AI LEBIH EFEKTIF

1. **Be specific** - Jangan hanya bilang "buat product controller", tapi sebutkan methods mana
2. **Include context** - Mention relationships, validations, authorization
3. **Show examples** - Kalau ada pattern yang ingin diikuti, show contohnya
4. **Review output** - Cek apakah sesuai dengan standards
5. **Ask for fixes** - "Remove this validation" or "Add eager loading for seller"
6. **Iterative approach** - Jangan request seluruh feature sekaligus, break down ke pieces

---

**Last update: 10-day sprint standard**
**Compatible with: Claude, ChatGPT, Copilot**
