import React from 'react';
import ChandraOCR from '../Components/ChandraOCR';

export default function OcrDemo() {
    return (
        <div style={{ padding: 24 }}>
            <h1>OCR Demo</h1>
            <p>Upload a PDF or image and the server will run the OCR and return results.</p>
            <ChandraOCR />
        </div>
    );
}
