<?php

namespace App\Services;

use Exception;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class CloudinaryService
{
    /**
     * Upload an image file to Cloudinary.
     * Fallbacks to local storage if Cloudinary credentials are not configured.
     *
     * @return string URL of the uploaded image
     */
    public static function upload(UploadedFile $file, string $folder = 'products'): string
    {
        $cloudName = env('CLOUDINARY_CLOUD_NAME');
        $apiKey = env('CLOUDINARY_API_KEY');
        $apiSecret = env('CLOUDINARY_API_SECRET');

        if (empty($cloudName) || empty($apiKey) || empty($apiSecret)) {
            // Local fallback upload
            $path = $file->store($folder, 'public');

            return asset('storage/'.$path);
        }

        try {
            $timestamp = time();
            $signature = sha1("folder={$folder}&timestamp={$timestamp}".$apiSecret);

            $url = "https://api.cloudinary.com/v1_1/{$cloudName}/image/upload";

            $ch = curl_init($url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, [
                'file' => new \CURLFile($file->getRealPath(), $file->getMimeType(), $file->getClientOriginalName()),
                'timestamp' => $timestamp,
                'api_key' => $apiKey,
                'signature' => $signature,
                'folder' => $folder,
            ]);

            $response = curl_exec($ch);
            $err = curl_error($ch);
            curl_close($ch);

            if ($err) {
                throw new Exception('cURL Error: '.$err);
            }

            $result = json_decode($response, true);

            if (isset($result['secure_url'])) {
                return $result['secure_url'];
            }

            if (isset($result['error']['message'])) {
                throw new Exception('Cloudinary API Error: '.$result['error']['message']);
            }

            throw new Exception('Failed to upload to Cloudinary. Response: '.$response);
        } catch (Exception $e) {
            // Log and fallback to local storage
            logger()->error('Cloudinary upload failed, falling back to local: '.$e->getMessage());
            $path = $file->store($folder, 'public');

            return asset('storage/'.$path);
        }
    }
}
