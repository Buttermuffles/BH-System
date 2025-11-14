<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class OcrController extends Controller
{
    /**
     * Handle file upload and OCR processing.
     * Supports both local Tesseract OCR and online OCR services.
     */
    public function upload(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:pdf,png,jpg,jpeg,tiff,bmp,gif,webp',
            'method' => 'sometimes|in:local,online',  // local or online OCR
        ]);

        $file = $request->file('file');
        $method = $request->input('method', 'local');  // Default to local

        $uploadsDir = storage_path('app/uploads');
        if (!is_dir($uploadsDir)) {
            mkdir($uploadsDir, 0755, true);
        }

        $originalName = $file->getClientOriginalName();
        $safeName = time() . '_' . preg_replace('/[^A-Za-z0-9._-]/', '_', $originalName);
        $moved = $file->move($uploadsDir, $safeName);

        if (!$moved) {
            return response()->json(['error' => 'Failed to save uploaded file.'], 500);
        }

        $inputPath = $uploadsDir . DIRECTORY_SEPARATOR . $safeName;
        $ocrOutputDir = storage_path('app/ocr_output');
        $ocrLogsDir = storage_path('app/ocr_logs');

        if (!is_dir($ocrOutputDir)) {
            mkdir($ocrOutputDir, 0755, true);
        }
        if (!is_dir($ocrLogsDir)) {
            mkdir($ocrLogsDir, 0755, true);
        }

        // Route to appropriate OCR method
        if ($method === 'online') {
            return $this->processOnlineOcr($inputPath, $ocrOutputDir, $safeName);
        } else {
            return $this->processLocalOcr($inputPath, $ocrOutputDir, $safeName);
        }
    }

    /**
     * Process OCR using local Tesseract
     */
    private function processLocalOcr($inputPath, $ocrOutputDir, $safeName)
    {
        $isWindows = strtoupper(substr(PHP_OS, 0, 3)) === 'WIN';
        $pythonCmd = env('PYTHON_CMD', $isWindows ? 'py' : 'python');
        $scriptPath = base_path('scripts') . DIRECTORY_SEPARATOR . 'local_ocr.py';

        // Check if Python is available
        $pythonCheck = [];
        $pythonCheckVar = 0;
        exec(escapeshellarg($pythonCmd) . ' --version 2>&1', $pythonCheck, $pythonCheckVar);
        if ($pythonCheckVar !== 0) {
            $msg = 'Python not found. Install Python or set PYTHON_CMD in .env. Output: ' . implode(' ', $pythonCheck);
            Log::error($msg);
            return response()->json(['error' => $msg], 500);
        }

        // Check if the script exists
        if (!file_exists($scriptPath)) {
            return response()->json(['error' => "OCR script not found at {$scriptPath}"], 500);
        }

        $cmd = escapeshellarg($pythonCmd) . ' ' . escapeshellarg($scriptPath)
            . ' --input ' . escapeshellarg($inputPath)
            . ' --output ' . escapeshellarg($ocrOutputDir)
            . ' 2>&1';

        // On Windows, prepend tesseract to PATH for pytesseract to find it
        if ($isWindows) {
            // Use cmd.exe /c to properly handle PATH modification
            $tesseractPath = 'C:\\Program Files\\Tesseract-OCR';
            $cmd = "cmd /c \"set PATH=" . $tesseractPath . ";%PATH% && " . $cmd . "\"";
        }

        // Execute and capture output
        $output = [];
        $returnVar = 0;
        try {
            exec($cmd, $output, $returnVar);
        } catch (\Exception $e) {
            Log::error('Local OCR exec failed: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to run OCR process.'], 500);
        }

        $baseName = pathinfo($safeName, PATHINFO_FILENAME);
        $txtPath = $ocrOutputDir . DIRECTORY_SEPARATOR . $baseName . '.txt';
        $respJsonPath = $ocrOutputDir . DIRECTORY_SEPARATOR . $baseName . '.response.json';

        $text = null;
        $raw = null;
        $debugInfo = "Base name: $baseName | Looking for: $txtPath | Return var: $returnVar";

        Log::info('OCR lookup: ' . $debugInfo);

        if (file_exists($txtPath)) {
            $text = file_get_contents($txtPath);
            Log::info('OCR success: Found text file with ' . strlen($text) . ' bytes');
        } else {
            Log::warning('OCR file not found: ' . $txtPath);
            // List what files were created
            if (is_dir($ocrOutputDir)) {
                $files = array_diff(scandir($ocrOutputDir), ['.', '..']);
                Log::info('Files in ocr_output: ' . json_encode($files));
                $debugInfo .= " | Files: " . json_encode($files);
            }
        }

        if (file_exists($respJsonPath)) {
            $raw = json_decode(file_get_contents($respJsonPath), true);
        }

        $response = [
            'status' => $returnVar === 0 ? 'ok' : 'warning',
            'method' => 'local',
            'text' => $text,
            'raw' => $raw,
            'cmd_output' => implode("\n", $output),
            'debug' => $debugInfo,
        ];

        $statusCode = $returnVar === 0 ? 200 : 500;
        return response()->json($response, $statusCode);
    }

    /**
     * Process OCR using online service (Chandra API or similar)
     */
    private function processOnlineOcr($inputPath, $ocrOutputDir, $safeName)
    {
        // Example: Using Chandra OCR API or Google Cloud Vision, AWS Textract, etc.

        $apiKey = env('CHANDRA_API_KEY');
        $endpoint = env('CHANDRA_ENDPOINT', 'https://api.chandra-ocr.com/v1/ocr');

        if (!$apiKey) {
            return response()->json([
                'error' => 'Online OCR not configured. Set CHANDRA_API_KEY in .env'
            ], 500);
        }

        try {
            // Upload file to online OCR service
            $client = new \GuzzleHttp\Client();

            $response = $client->post($endpoint, [
                'headers' => [
                    'Authorization' => 'Bearer ' . $apiKey,
                ],
                'multipart' => [
                    [
                        'name' => 'file',
                        'contents' => fopen($inputPath, 'r'),
                        'filename' => basename($inputPath),
                    ],
                ],
            ]);

            $result = json_decode($response->getBody(), true);

            $baseName = pathinfo($safeName, PATHINFO_FILENAME);
            $txtPath = $ocrOutputDir . DIRECTORY_SEPARATOR . $baseName . '_online.txt';

            $text = $result['text'] ?? '';

            // Save result
            file_put_contents($txtPath, $text);

            return response()->json([
                'status' => 'ok',
                'method' => 'online',
                'text' => $text,
                'raw' => $result,
            ], 200);

        } catch (\Exception $e) {
            Log::error('Online OCR failed: ' . $e->getMessage());
            return response()->json([
                'error' => 'Online OCR service failed: ' . $e->getMessage(),
            ], 500);
        }
    }
}
