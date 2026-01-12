import React from 'react';
import { createRoot } from 'react-dom/client';
import ElectricalBillReceiptPublic from './Pages/ElectricalBillReceiptPublic';
import '../css/app.css';

const mount = () => {
    let el = document.getElementById('app');
    if (!el) {
        el = document.createElement('div');
        el.id = 'app';
        document.body.appendChild(el);
    }

    const root = createRoot(el);
    root.render(
        <React.StrictMode>
            <ElectricalBillReceiptPublic />
        </React.StrictMode>
    );
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
} else {
    mount();
}
