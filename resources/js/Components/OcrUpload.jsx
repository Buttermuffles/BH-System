import { useState } from 'react';

export default function OcrUpload() {
    const [file, setFile] = useState(null);
    const [filePreview, setFilePreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [method, setMethod] = useState('local'); // 'local' or 'online'

    const handleFile = (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        setFile(selectedFile);
        setError(null);

        // Create preview
        const reader = new FileReader();
        reader.onload = (event) => {
            if (selectedFile.type.startsWith('image/')) {
                setFilePreview({
                    type: 'image',
                    src: event.target.result,
                });
            } else if (selectedFile.type === 'application/pdf') {
                setFilePreview({
                    type: 'pdf',
                    name: selectedFile.name,
                });
            }
        };
        reader.readAsDataURL(selectedFile);
    };

    const getCsrf = () => {
        const token = document.querySelector('meta[name="csrf-token"]');
        return token ? token.getAttribute('content') : '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            setError('Please select a file');
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('method', method); // Send selected method

        try {
            const response = await fetch(route('ocr.upload'), {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': getCsrf(),
                },
                body: formData,
            });

            const contentType = response.headers.get('content-type');

            if (!response.ok) {
                const errorData = contentType?.includes('application/json')
                    ? await response.json()
                    : await response.text();

                throw new Error(
                    errorData.error || errorData || `HTTP Error ${response.status}`
                );
            }

            const data = contentType?.includes('application/json')
                ? await response.json()
                : { text: await response.text() };

            setResult(data);
        } catch (err) {
            setError(err.message || 'Upload failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-6">Document OCR</h2>

            {/* OCR Method Selection */}
            <div className="mb-6 p-4 bg-gray-50 rounded border">
                <label className="block text-sm font-medium mb-3">Select OCR Method:</label>
                <div className="flex gap-4">
                    <label className="flex items-center">
                        <input
                            type="radio"
                            name="method"
                            value="local"
                            checked={method === 'local'}
                            onChange={(e) => setMethod(e.target.value)}
                            className="mr-2"
                        />
                        <span className="text-sm">
                            <strong>Local</strong> (Fast, offline Tesseract)
                        </span>
                    </label>
                    <label className="flex items-center">
                        <input
                            type="radio"
                            name="method"
                            value="online"
                            checked={method === 'online'}
                            onChange={(e) => setMethod(e.target.value)}
                            className="mr-2"
                        />
                        <span className="text-sm">
                            <strong>Online</strong> (Cloud-based OCR)
                        </span>
                    </label>
                </div>
                {method === 'online' && (
                    <p className="text-xs text-gray-500 mt-2">
                        Requires CHANDRA_API_KEY configured in .env
                    </p>
                )}
            </div>

            {/* Upload Form */}
            <form onSubmit={handleSubmit} className="mb-6">
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">
                        Select PDF or Image:
                    </label>
                    <input
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg,.tiff,.bmp,.gif,.webp"
                        onChange={handleFile}
                        className="w-full p-2 border rounded"
                        disabled={loading}
                    />
                </div>

                <button
                    type="submit"
                    disabled={!file || loading}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
                >
                    {loading ? 'Processing...' : 'Upload & Extract Text'}
                </button>
            </form>

            {/* Error Message */}
            {error && (
                <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                    Error: {error}
                </div>
            )}

            {/* Results */}
            {result && (
                <div className="space-y-4">
                    <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                        ✓ OCR Completed ({result.method === 'local' ? 'Local' : 'Online'})
                    </div>

                    {/* Side-by-side display */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Original Document */}
                        <div className="border rounded p-4">
                            <h3 className="font-bold mb-2">Original Document</h3>
                            {filePreview?.type === 'image' ? (
                                <img
                                    src={filePreview.src}
                                    alt="Preview"
                                    className="w-full max-h-64 object-contain rounded"
                                />
                            ) : (
                                <div className="flex items-center justify-center h-64 bg-gray-100 rounded">
                                    <span className="text-6xl">📄</span>
                                </div>
                            )}
                        </div>

                        {/* Extracted Text */}
                        <div className="border rounded p-4">
                            <h3 className="font-bold mb-2">Extracted Text</h3>
                            <div className="w-full h-64 p-2 bg-gray-50 border rounded overflow-y-auto text-sm whitespace-pre-wrap">
                                {result.text || '(No text extracted)'}
                            </div>
                        </div>
                    </div>

            {/* Debug Info */}
            {result && (
                <div className="space-y-3 text-xs bg-gray-50 p-3 rounded border">
                    <div>
                        <strong>Method:</strong> {result.method}
                    </div>
                    <div>
                        <strong>Status:</strong> {result.status}
                    </div>
                    {result.debug && (
                        <div className="font-mono text-gray-600">
                            <strong>Debug:</strong> {result.debug}
                        </div>
                    )}
                    {result.cmd_output && (
                        <details className="mt-2">
                            <summary className="cursor-pointer font-bold">
                                Command Output ({result.cmd_output.split('\n').length} lines)
                            </summary>
                            <pre className="mt-2 overflow-x-auto bg-white p-2 border rounded text-xs">
                                {result.cmd_output}
                            </pre>
                        </details>
                    )}
                </div>
            )}
                </div>
            )}
        </div>
    );
}
