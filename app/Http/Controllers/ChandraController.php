<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class ChandraController extends Controller
{
    /**
     * Handle an uploaded file, run the Chandra OCR script, and return results.
     */
    public function upload(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:pdf,png,jpg,jpeg,tiff,bmp,gif,webp',
        ]);

        $file = $request->file('file');

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

        // Build command to run the local OCR fallback script in scripts/
        // Default to 'py' on Windows (Python launcher), or 'python' on Unix-like systems.
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
            $pathSeparator = ';';
            $tesseractPath = 'C:\\Program Files\\Tesseract-OCR';
            // Build full command with PATH modification
            $cmd = "set PATH=" . escapeshellarg($tesseractPath . $pathSeparator . '%PATH%') . " && " . $cmd;
        }

        // Execute and capture output
        $output = [];
        $returnVar = 0;
        try {
            exec($cmd, $output, $returnVar);
        } catch (\Exception $e) {
            Log::error('Chandra OCR exec failed: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to run OCR process.'], 500);
        }

        $baseName = pathinfo($safeName, PATHINFO_FILENAME);
        $txtPath = $ocrOutputDir . DIRECTORY_SEPARATOR . $baseName . '.txt';
        $respJsonPath = $ocrOutputDir . DIRECTORY_SEPARATOR . $baseName . '.response.json';

        $text = null;
        $raw = null;

        if (file_exists($txtPath)) {
            $text = file_get_contents($txtPath);
        }

        if (file_exists($respJsonPath)) {
            $raw = json_decode(file_get_contents($respJsonPath), true);
        }

        $response = [
            'status' => $returnVar === 0 ? 'ok' : 'warning',
            'text' => $text,
            'raw' => $raw,
            'cmd_output' => implode("\n", $output),
        ];

        $statusCode = $returnVar === 0 ? 200 : 500;
        return response()->json($response, $statusCode);
    }
}
