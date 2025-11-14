<?php
$txtPath = 'storage/app/ocr_output/1763112042_ChatGPT_Image_Nov_5__2025__09_39_24_PM.txt';

if (file_exists($txtPath)) {
    echo "✓ File exists at: " . realpath($txtPath) . PHP_EOL;
    $text = file_get_contents($txtPath);
    echo "✓ File size: " . strlen($text) . " bytes" . PHP_EOL;
    echo "✓ First 100 chars: " . substr($text, 0, 100) . "..." . PHP_EOL;
    echo "\n=== FULL TEXT ===" . PHP_EOL;
    echo $text . PHP_EOL;
} else {
    echo "✗ File not found at: " . $txtPath . PHP_EOL;
    echo "Real path would be: " . realpath('storage/app/ocr_output/') . PHP_EOL;
}
?>
