<?php

namespace App\Jobs;

use App\Models\ProductImage;
use App\Services\CloudinaryService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Http\UploadedFile;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class UploadProductImageJob implements ShouldQueue
{
    use InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The number of times the job may be attempted.
     */
    public int $tries = 3;

    /**
     * The number of seconds to wait before retrying the job.
     */
    public int $backoff = 10;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public readonly int $productId,
        public readonly string $tempPath,
        public readonly string $originalName,
        public readonly bool $isPrimary
    ) {}

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        // Recreate the UploadedFile from the stored temp file
        $file = new UploadedFile(
            $this->tempPath,
            $this->originalName,
            null,
            null,
            true
        );

        $imageUrl = CloudinaryService::upload($file, 'products');

        ProductImage::create([
            'product_id' => $this->productId,
            'image_url' => $imageUrl,
            'is_primary' => $this->isPrimary,
        ]);

        // Clean up the temporary file after successful upload
        if (file_exists($this->tempPath)) {
            unlink($this->tempPath);
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        // Clean up the temporary file on failure
        if (file_exists($this->tempPath)) {
            unlink($this->tempPath);
        }
    }
}
