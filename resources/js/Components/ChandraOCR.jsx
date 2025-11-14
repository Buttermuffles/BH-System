import React, { useState } from 'react';

export default function ChandraOCR() {
    const [file, setFile] = useState(null);
    const [filePreview, setFilePreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleFile = (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);
        setResult(null);
        setError(null);

        // Create preview URL for images; for PDFs show a placeholder
        if (selectedFile) {
            if (selectedFile.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (ev) => setFilePreview(ev.target.result);
                reader.readAsDataURL(selectedFile);
            } else if (selectedFile.type === 'application/pdf') {
                setFilePreview('pdf'); // placeholder
            }
        }
    };

    const getCsrf = () => {
        // Read CSRF token from meta tag (now guaranteed to exist)
        const m = document.querySelector('meta[name="csrf-token"]');
        return m ? m.getAttribute('content') : null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) return setError('Please choose a file');

        setLoading(true);
        setError(null);

        const form = new FormData();
        form.append('file', file);

        try {
            const headers = {};
            const csrf = getCsrf();
            if (csrf) headers['X-CSRF-TOKEN'] = csrf;

            const resp = await fetch('/ocr', {
                method: 'POST',
                body: form,
                credentials: 'same-origin',
                headers,
            });

            const contentType = resp.headers.get('content-type') || '';

            if (contentType.includes('application/json')) {
                const data = await resp.json();
                if (!resp.ok) {
                    setError(data.error || JSON.stringify(data));
                } else {
                    setResult(data);
                }
            } else {
                // Non-JSON response (HTML debug page or plain text) — read as text and show safely
                const text = await resp.text();
                if (!resp.ok) {
                    setError(text || 'OCR failed (non-JSON response)');
                } else {
                    // Successful but non-JSON: show raw text
                    setResult({ text });
                }
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-semibold">Document OCR</h2>
                <p className="text-sm text-gray-500 mt-1">Upload a PDF or image to extract text. Uses local OCR fallback by default.</p>

                <form onSubmit={handleSubmit} className="mt-4">
                    <div className="flex items-center gap-4">
                        <input
                            id="chandra-file"
                            type="file"
                            accept=".pdf,image/*"
                            onChange={handleFile}
                            className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
                        >
                            {loading ? 'Processing…' : 'Upload & OCR'}
                        </button>
                    </div>
                </form>

                {error && (
                    <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>
                )}

                {result && (
                    <div className="mt-6">
                        <h3 className="text-lg font-semibold mb-4">OCR Results</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Left side: Image preview */}
                            {filePreview && (
                                <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-100">
                                    {filePreview === 'pdf' ? (
                                        <div className="h-96 flex items-center justify-center text-gray-500">
                                            <div className="text-center">
                                                <div className="text-4xl mb-2">📄</div>
                                                <p>PDF Document</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <img
                                            src={filePreview}
                                            alt="Uploaded document"
                                            className="w-full h-auto max-h-96 object-contain"
                                        />
                                    )}
                                </div>
                            )}

                            {/* Right side: OCR text */}
                            <div className="border border-gray-200 rounded-lg bg-gray-50 p-4 flex flex-col">
                                <h4 className="font-medium text-gray-700 mb-2">Extracted Text</h4>
                                <div className="flex-1 overflow-auto">
                                    <pre className="whitespace-pre-wrap text-sm text-gray-800">
                                        {result.text || (result.raw ? JSON.stringify(result.raw, null, 2) : 'No text extracted')}
                                    </pre>
                                </div>
                            </div>
                        </div>

                        {result.cmd_output && (
                            <details className="mt-4 text-sm text-gray-600">
                                <summary className="cursor-pointer font-medium">Command output / logs</summary>
                                <pre className="whitespace-pre-wrap mt-2 text-xs text-gray-700 bg-white border rounded p-2">{result.cmd_output}</pre>
                            </details>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
