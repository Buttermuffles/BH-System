import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export default function ElectricalBillReceipt() {
    const [commonData, setCommonData] = useState({
        rate: '12.50',
        billDate: new Date().toISOString().split('T')[0],
        readingDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });

    const [rooms, setRooms] = useState([
        { id: 1, name: 'Room 1', previous: '', current: '' },
        { id: 2, name: 'Room 2', previous: '', current: '' },
        { id: 3, name: 'Room 3', previous: '', current: '' },
        { id: 4, name: 'Room 4', previous: '', current: '' },
    ]);

    const [calculatedBills, setCalculatedBills] = useState([]);
    const [printCopies, setPrintCopies] = useState(1);
    const [compactFit, setCompactFit] = useState(false);

    // Restore persisted session values on mount
    useEffect(() => {
        try {
            const savedBills = sessionStorage.getItem('electrical_calculated_bills');
            const savedRooms = sessionStorage.getItem('electrical_rooms');
            const savedCommon = sessionStorage.getItem('electrical_common');

            if (savedBills) setCalculatedBills(JSON.parse(savedBills));
            if (savedRooms) setRooms(JSON.parse(savedRooms));
            if (savedCommon) setCommonData(prev => ({ ...prev, ...JSON.parse(savedCommon) }));
        } catch (e) {
            // ignore parse errors
            console.error('Failed to restore electrical session data', e);
        }
    }, []);

    // Persist rooms and commonData to sessionStorage whenever they change
    useEffect(() => {
        try {
            sessionStorage.setItem('electrical_rooms', JSON.stringify(rooms));
        } catch (e) {
            console.error('Failed to save rooms to sessionStorage', e);
        }
    }, [rooms]);

    useEffect(() => {
        try {
            sessionStorage.setItem('electrical_common', JSON.stringify(commonData));
        } catch (e) {
            console.error('Failed to save commonData to sessionStorage', e);
        }
    }, [commonData]);

    const addDaysISO = (isoDate, days) => {
        if (!isoDate) return '';
        const d = new Date(isoDate + 'T00:00:00');
        d.setDate(d.getDate() + days);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    };

    const handleCommonChange = (field, value) => {
        if (field === 'readingDate') {
            const newDue = addDaysISO(value, 5);
            setCommonData(prev => ({ ...prev, readingDate: value, dueDate: newDue }));
            return;
        }

        setCommonData(prev => ({ ...prev, [field]: value }));
    };

    const handleRoomChange = (id, field, value) => {
        setRooms(prev => prev.map(room =>
            room.id === id ? { ...room, [field]: value } : room
        ));
    };

    const addRoom = () => {
        setRooms(prev => [...prev, {
            id: Math.max(...prev.map(r => r.id), 0) + 1,
            name: `Room ${prev.length + 1}`,
            previous: '',
            current: ''
        }]);
    };

    const removeRoom = (id) => {
        if (rooms.length <= 1) return;
        setRooms(prev => prev.filter(room => room.id !== id));
    };

    const calculateBills = () => {
        const rate = parseFloat(commonData.rate) || 0;
        const bills = [];

        rooms.forEach(room => {
            const previous = parseFloat(room.previous) || 0;
            const current = parseFloat(room.current) || 0;

            if (room.current && room.previous) {
                 if (current < previous) {
                     toast.error(`Current reading cannot be less than previous for ${room.name}`);
                     return;
                 }
                 const totalKwh = current - previous;
                 const totalAmount = totalKwh * rate;
                 bills.push({
                     ...room,
                     totalKwh,
                     totalAmount,
                     rate,
                     billDate: commonData.billDate,
                     readingDate: commonData.readingDate,
                     dueDate: commonData.dueDate
                 });
             }
         });

         if (bills.length === 0) {
             toast.warning('Please enter valid readings for at least one room');
             return;
         }

         setCalculatedBills(bills);
         try {
             sessionStorage.setItem('electrical_calculated_bills', JSON.stringify(bills));
         } catch (e) {
             console.error('Failed to save calculated bills to sessionStorage', e);
         }
         toast.success(`Calculated ${bills.length} bills successfully!`);
     };

    const resetForm = () => {
        setRooms([
            { id: 1, name: 'Room 1', previous: '', current: '' },
            { id: 2, name: 'Room 2', previous: '', current: '' },
            { id: 3, name: 'Room 3', previous: '', current: '' },
            { id: 4, name: 'Room 4', previous: '', current: '' },
        ]);
        setCalculatedBills([]);

        try {
            sessionStorage.removeItem('electrical_calculated_bills');
            sessionStorage.removeItem('electrical_rooms');
            sessionStorage.removeItem('electrical_common');
        } catch (e) {
            // ignore
        }
    };

    const escapeHtml = (str) => {
        if (!str && str !== 0) return '';
        return String(str).replace(/[&<>"']/g, (s) => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        }[s]));
    };

    const printReceipt = () => {
        if (!calculatedBills || calculatedBills.length === 0) {
            toast.warning('No receipts to print. Please calculate bills first.');
            return;
        }

        const printWindow = window.open('', '_blank', 'width=900,height=700');
        if (!printWindow) {
            toast.error('Popup blocked. Please allow popups for this site to print receipts.');
            return;
        }

        const styles = `
            <style>
                /* Ensure we only show the receipt area when printing */
                @media print {
                    body * { visibility: hidden; }
                    #receipt, #receipt * { visibility: visible; }
                    #receipt { position: absolute; left: 0; top: 0; width: 100%; background: #fff; margin: 0; padding: 6px; box-shadow: none; }
                    @page { margin: 6mm; size: auto; }
                }

                /* Default rendering styles for the print window */
                body { font-family: Arial, Helvetica, sans-serif; color: #000; margin: 0; padding: 6px; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                .grid { display: grid; ${compactFit ? 'grid-template-columns: repeat(3, 1fr);' : 'grid-template-columns: repeat(2, 1fr);'} gap: 10px; }
                .card { border: 1px solid #111; padding: 8px; border-radius: 6px; background: #fff; box-sizing: border-box; page-break-inside: avoid; break-inside: avoid-column; -webkit-print-color-adjust: exact; }
                .header { text-align: center; border-bottom: 1px solid #111; padding-bottom: 6px; margin-bottom: 6px; font-weight: 700; font-size:12px; }
                .row { display:flex; justify-content:space-between; font-size:12px; margin:3px 0; }
                .total { font-weight:800; font-size:14px; margin-top:8px; display:flex; justify-content:space-between; }
                .copy-label { font-size:10px; text-align:right; color:#333; }
                /* color helpers */
                .prev { color: #6b7280; } /* gray */
                .curr { color: #1e40af; font-weight:700; } /* blue */
                .consumption { color: #3730a3; font-weight:800; } /* indigo */
                .rate { color: #16a34a; font-weight:700; } /* green */
                .total-amt { color: #b91c1c; font-weight:900; font-size:15px; } /* red */
                /* compact fit adjustments */
                .compact .card { padding:6px; }
                .compact .row { font-size:10px; }
                .compact .header { font-size:11px; }
            </style>
        `;

        let bodyHtml = `<div id="receipt"><div class="grid ${compactFit ? 'compact' : ''}">`
        calculatedBills.forEach((bill) => {
            const name = escapeHtml(bill.name || '');
            const prev = isNaN(parseFloat(bill.previous)) ? '' : parseFloat(bill.previous).toLocaleString();
            const curr = isNaN(parseFloat(bill.current)) ? '' : parseFloat(bill.current).toLocaleString();
            const consumption = bill.totalKwh != null ? bill.totalKwh.toLocaleString() : '';
            const amount = bill.totalAmount != null ? formatCurrency(bill.totalAmount) : '';
            const rateStr = bill.rate != null ? formatCurrency(bill.rate) + '/kWh' : '';

            // create N copies for this bill
            for (let c = 0; c < (printCopies || 1); c++) {
                bodyHtml += `
                    <div class="card">
                        <div class="header"><div style="font-size:14px;font-weight:700">JRC APARTMENT - ELECTRICAL BILL</div><div style="font-size:11px">BH System</div></div>
                        <div class="row"><div>Name/Room:</div><div style="font-weight:600">${name}</div></div>
                        <div class="row"><div>Date:</div><div>${bill.billDate ? new Date(bill.billDate).toLocaleDateString() : ''}</div></div>
                        <div class="row"><div>Reading Date:</div><div>${bill.readingDate ? new Date(bill.readingDate).toLocaleDateString() : ''}</div></div>
                        <div class="row"><div>Due Date:</div><div style="font-weight:600; color:red;">${bill.dueDate ? new Date(bill.dueDate).toLocaleDateString() : ''}</div></div>
                        <div class="row"><div>Prev:</div><div class="prev">${prev ? prev + ' kWh' : '-'}</div></div>
                        <div class="row"><div>Curr:</div><div class="curr">${curr ? curr + ' kWh' : '-'}</div></div>
                        <div class="row"><div>Consumption:</div><div class="consumption">${consumption} kWh</div></div>
                        <div class="row"><div>Rate:</div><div class="rate">${rateStr}</div></div>
                        <div class="total"><div>TOTAL:</div><div class="total-amt">${amount}</div></div>
                        <div class="copy-label">Copy ${c + 1}</div>
                        <div style="text-align:center;font-size:10px;margin-top:4px;color:#666;">Generated on ${new Date().toLocaleDateString()}</div>
                    </div>
                `;
            }
        });
        bodyHtml += '</div>';

        printWindow.document.open();
        printWindow.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Print Receipts</title>${styles}</head><body>${bodyHtml}</body></html>`);
        printWindow.document.close();
        printWindow.focus();

        const triggerPrint = () => {
            try { printWindow.focus(); } catch (e) {}
            try {
                printWindow.print();
            } catch (e) {
                console.error('Print failed', e);
            }

            try {
                printWindow.addEventListener('afterprint', () => {
                    try { printWindow.close(); } catch (e) { /* ignore */ }
                });
            } catch (e) {
                // ignore
            }

            // Fallback: close the print window after 2 seconds
            setTimeout(() => {
                try { printWindow.close(); } catch (e) { /* ignore */ }
            }, 2000);
        };

        if (printWindow.document.readyState === 'complete') {
            setTimeout(triggerPrint, 50);
        } else {
            printWindow.addEventListener('load', () => setTimeout(triggerPrint, 50));
            setTimeout(triggerPrint, 1200);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP'
        }).format(amount);
    };

    // Build preview items according to copies selection
    const previewItems = [];
    for (let c = 0; c < (printCopies || 1); c++) {
        calculatedBills.forEach(bill => previewItems.push({ bill, copy: c + 1 }));
    }

    return (
        <AuthenticatedLayout>
            <div className="py-6 print:hidden">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="mb-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Electrical Bill Receipt Calculator</h1>
                                <p className="text-gray-600 mt-1">Quickly calculate and print receipts for multiple rooms</p>
                            </div>
                            <div className="hidden sm:flex items-center gap-3">
                                <div className="text-sm text-gray-500">Tip: Use <span className="font-medium text-gray-700">Fit to one page</span> for compact printouts</div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Settings & Input */}
                            <div className="lg:col-span-3 space-y-6">
                            {/* Common Settings */}
                            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                                <h2 className="text-lg font-semibold text-gray-800 mb-4">Bill Settings</h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Rate per kWh (PHP)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={commonData.rate}
                                            onChange={(e) => handleCommonChange('rate', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Bill Date</label>
                                        <input
                                            type="date"
                                            value={commonData.billDate}
                                            onChange={(e) => handleCommonChange('billDate', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Reading Date</label>
                                        <input
                                            type="date"
                                            value={commonData.readingDate}
                                            onChange={(e) => handleCommonChange('readingDate', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                        />
                                    </div>
                                       <div>
                                           <label className="block text-sm font-medium text-gray-700 mb-1">Due Date <span className="ml-2 text-xs text-red-600 font-semibold">(Due)</span></label>
                                            <input
                                                type="date"
                                                value={commonData.dueDate}
                                                onChange={(e) => handleCommonChange('dueDate', e.target.value)}
                                                className="w-full px-3 py-2 border border-red-300 rounded-lg bg-white focus:ring-1 focus:ring-red-300"
                                            />
                                    </div>
                                </div>
                            </div>

                            {/* Rooms Input */}
                            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-lg font-semibold text-gray-800">Room Readings</h2>
                                    <button onClick={addRoom} className="text-sm text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
                                        Add Room
                                    </button>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-100">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Room Name</th>
                                                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Previous</th>
                                                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Current</th>
                                                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-100">
                                            {rooms.map((room) => (
                                                <tr key={room.id}>
                                                    <td className="px-3 py-2">
                                                        <input
                                                            type="text"
                                                            value={room.name}
                                                            onChange={(e) => handleRoomChange(room.id, 'name', e.target.value)}
                                                            className="w-full px-2 py-1 border border-gray-200 rounded text-sm bg-white"
                                                            placeholder="Room Name"
                                                        />
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            value={room.previous}
                                                            onChange={(e) => handleRoomChange(room.id, 'previous', e.target.value)}
                                                            className="w-full px-2 py-1 border border-gray-200 rounded text-sm bg-white"
                                                            placeholder="0.00"
                                                        />
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            value={room.current}
                                                            onChange={(e) => handleRoomChange(room.id, 'current', e.target.value)}
                                                            className="w-full px-2 py-1 border border-gray-200 rounded text-sm bg-white"
                                                            placeholder="0.00"
                                                        />
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <button onClick={() => removeRoom(room.id)} className="text-red-600 hover:text-red-800 inline-flex items-center p-1 rounded hover:bg-red-50">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="mt-6 flex space-x-3">
                                    <button onClick={calculateBills} className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 text-white py-2 px-4 rounded-lg hover:from-blue-700 hover:to-blue-600 font-medium shadow">Calculate All</button>
                                    <button onClick={resetForm} className="px-6 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">Reset</button>
                                </div>
                                </div>
                                <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 mt-6">
                                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Receipt Preview</h2>
                                    {calculatedBills.length > 0 ? (
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm text-gray-600">Generated <span className="font-medium text-gray-800">{calculatedBills.length}</span> receipts.</p>
                                                <div className="flex items-center gap-3">
                                                    <label className="text-sm text-gray-600">Copies:</label>
                                                    <select value={printCopies} onChange={(e) => setPrintCopies(parseInt(e.target.value || '1'))} className="px-2 py-1 border rounded text-sm bg-white">
                                                        <option value={1}>1</option>
                                                        <option value={2}>2</option>
                                                        <option value={3}>3</option>
                                                    </select>
                                                    <label className="ml-4 flex items-center gap-2 text-sm text-gray-600">
                                                        <input type="checkbox" checked={compactFit} onChange={(e) => setCompactFit(e.target.checked)} />
                                                        Fit to one page
                                                    </label>
                                                </div>
                                            </div>
                                            <button onClick={printReceipt} className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 font-medium flex items-center justify-center gap-2 shadow">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                                                Print Receipts
                                            </button>
                                            <div className="border border-gray-100 rounded bg-gray-50 p-4">
                                                <div className={`grid grid-cols-1 ${compactFit ? 'sm:grid-cols-3 lg:grid-cols-4' : 'sm:grid-cols-2 lg:grid-cols-3'} gap-4`}>
                                                    {previewItems.map(({ bill, copy }, index) => (
                                                        <div key={`${index}-${copy}`} className="bg-white p-6 border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-colors text-sm flex flex-col justify-between min-h-[220px] relative">
                                                            {printCopies > 1 && (
                                                                <div className="absolute -top-3 -right-3 bg-green-50 text-xs text-green-700 rounded-full px-3 py-1 border border-green-100 shadow">Copy {copy}</div>
                                                            )}
                                                            <div className="flex items-start justify-between mb-3">
                                                                <div className="flex flex-col">
                                                                    <span className="text-xs font-semibold uppercase text-gray-500">JRC Apartment</span>
                                                                    <span className="text-lg font-bold text-gray-900">Electrical Bill</span>
                                                                </div>
                                                                <div className="text-xs text-gray-500 text-right">
                                                                    <div className="font-medium">{new Date(bill.billDate).toLocaleDateString()}</div>
                                                                    <div className="mt-1">{bill.readingDate ? new Date(bill.readingDate).toLocaleDateString() : ''}</div>
                                                                </div>
                                                            </div>

                                                            <div className="flex-grow">
                                                                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-3">
                                                                    <div className="text-gray-500">Room</div>
                                                                    <div className="font-medium text-gray-900">{bill.name}</div>

                                                                    <div className="text-gray-500">Prev / Curr</div>
                                                                    <div>{bill.previous ? parseFloat(bill.previous).toLocaleString() : '-'} &rarr; {bill.current ? parseFloat(bill.current).toLocaleString() : '-'}</div>

                                                                    <div className="text-gray-500">Reading Date</div>
                                                                    <div>{bill.readingDate ? new Date(bill.readingDate).toLocaleDateString() : '-'}</div>

                                                                    <div className="text-gray-500">Due Date</div>
                                                                    <div className="font-semibold text-red-600">{bill.dueDate ? new Date(bill.dueDate).toLocaleDateString() : '-'}</div>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-end justify-between mt-2">
                                                                <div>
                                                                    <div className="text-sm text-gray-500">Consumption</div>
                                                                    <div className="text-blue-600 font-bold">{bill.totalKwh != null ? bill.totalKwh.toLocaleString() : '0'} kWh</div>
                                                                </div>
                                                                <div className="text-right">
                                                                    <div className="text-xs text-gray-500">Rate</div>
                                                                    <div className="text-green-600 font-bold">{bill.rate != null ? formatCurrency(bill.rate) : ''}/kWh</div>
                                                                    <div className="text-sm text-gray-500 mt-1">Total</div>
                                                                    <div className="text-xl font-semibold text-red-600">{bill.totalAmount != null ? formatCurrency(bill.totalAmount) : formatCurrency(0)}</div>
                                                                </div>
                                                            </div>

                                                            <div className="mt-3 text-xs text-gray-400 text-right">Generated on {new Date().toLocaleDateString()}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center text-gray-500 py-8">
                                            Calculate bills to see preview
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                </div>
            </div>

            {/* Printable Area */}
            <div className="hidden print:block print:p-4 print:text-black print:bg-white print:shadow-none">
                <div className="print:grid print:grid-cols-2 print:gap-6 print:items-start">
                    {calculatedBills.map((bill, index) => (
                        <div key={index} className="print:border print:border-gray-700 print:p-4 print:rounded print:break-inside-avoid print:page-break-inside-avoid print:text-sm print:bg-white print:flex print:flex-col print:justify-between print:min-h-[160px]">
                            <div className="print:flex print:justify-between print:items-start print:mb-2">
                                <div className="print:text-left">
                                    <h3 className="print:font-bold print:text-base">ELECTRICAL BILL</h3>
                                    <div className="print:text-xs print:text-gray-600">BH System</div>
                                </div>
                                <div className="print:text-xs print:text-gray-600 print:text-right">
                                    <div>{new Date(bill.billDate).toLocaleDateString()}</div>
                                    <div className="print:mt-1">{bill.readingDate ? new Date(bill.readingDate).toLocaleDateString() : ''}</div>
                                </div>
                            </div>

                                <div className="print:grid print:grid-cols-2 print:gap-x-4 print:gap-y-1 print:mb-3 print:text-xs print:text-gray-700">
                                <div className="print:text-gray-600">Name/Room:</div>
                                <div className="print:font-bold">{bill.name}</div>

                                <div className="print:text-gray-600">Date:</div>
                                <div>{new Date(bill.billDate).toLocaleDateString()}</div>

                                <div className="print:text-gray-600">Due Date:</div>
                                <div className="print:font-bold print:text-red-700">{bill.dueDate ? new Date(bill.dueDate).toLocaleDateString() : ''}</div>
                            </div>

                            <div className="print:border-t print:border-b print:border-gray-300 print:py-3 print:mb-3 print:space-y-1">
                                <div className="print:flex print:justify-between print:text-sm">
                                    <span>Prev Reading:</span>
                                    <span className="print:prev print:font-semibold">{bill.previous ? parseFloat(bill.previous).toLocaleString() + ' kWh' : '-'}</span>
                                </div>
                                <div className="print:flex print:justify-between print:text-sm">
                                    <span>Curr Reading:</span>
                                    <span className="print:curr print:font-semibold">{bill.current ? parseFloat(bill.current).toLocaleString() + ' kWh' : '-'}</span>
                                </div>
                                <div className="print:flex print:justify-between print:font-medium print:text-indigo-700">
                                    <span>Consumption:</span>
                                    <span className="print:consumption print:font-semibold">{bill.totalKwh != null ? bill.totalKwh.toLocaleString() : '0'} kWh</span>
                                </div>
                                <div className="print:flex print:justify-between print:text-xs print:text-gray-500">
                                    <span>Rate:</span>
                                    <span className="print:rate print:font-semibold">{formatCurrency(bill.rate)}/kWh</span>
                                </div>
                            </div>

                            <div className="print:flex print:justify-between print:items-center print:text-lg print:font-bold print:mt-2">
                                <span>TOTAL:</span>
                                <span className="print:total-amt print:font-bold">{formatCurrency(bill.totalAmount)}</span>
                            </div>

                            <div className="print:mt-4 print:text-center print:text-[10px] print:text-gray-500">
                                Generated on {new Date().toLocaleDateString()}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}