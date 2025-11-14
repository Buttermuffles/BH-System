<?php
// Test script to simulate the OCR upload
require __DIR__ . '/vendor/autoload.php';

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

// Bootstrap Laravel
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(\Illuminate\Contracts\Http\Kernel::class);

// Create a fake request
$request = \Illuminate\Http\Request::create('/ocr', 'POST');

// Simulate file upload
$testFilePath = 'storage/app/uploads/1763112042_ChatGPT_Image_Nov_5__2025__09_39_24_PM.png';

if (file_exists($testFilePath)) {
    echo "✓ Test file exists\n";
    
    // Create UploadedFile instance
    $file = new UploadedFile(
        $testFilePath,
        '1763112042_ChatGPT_Image_Nov_5__2025__09_39_24_PM.png',
        'image/png',
        null,
        true
    );
    
    // Set the file and method on the request
    $request->files->set('file', $file);
    $request->request->set('method', 'local');
    
    // Set CSRF token
    $request->attributes->set('_token', '');
    
    // Call the controller directly
    $controller = new \App\Http\Controllers\OcrController();
    $response = $controller->upload($request);
    
    echo "Response Status: " . $response->getStatusCode() . "\n";
    echo "Response Body:\n";
    echo $response->getContent();
} else {
    echo "✗ Test file not found at: $testFilePath\n";
}
?>
