import React from 'react';
import ChandraOCR from '../Components/ChandraOCR';

export default function OcrDemo() {
    return (
        <div style={{ padding: 24 }}>
            <h1>OCR Demo</h1>
            <p>Upload a document (PDF, Word, Excel, PowerPoint, images, etc.) and the server will extract text and return results.</p>
            <ChandraOCR />
        </div>
    );
}
