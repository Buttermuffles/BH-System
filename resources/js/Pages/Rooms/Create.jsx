import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function RoomCreate() {
  const [roomNumber, setRoomNumber] = useState('');
  const [type, setType] = useState('Single');
  const [price, setPrice] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    toast.success(`Room saved: ${roomNumber}`);
    setRoomNumber(''); setPrice('');
  }

  return (
    <AuthenticatedLayout header={<h2 className="text-xl font-semibold">New Room</h2>}>
      <Head title="New Room" />

      <div className="py-6">
        <div className="mx-auto max-w-3xl sm:px-6 lg:px-8">
          <div className="bg-white border rounded-xl p-6 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm text-gray-600 block">Room Number</label>
                <input value={roomNumber} onChange={(e) => setRoomNumber(e.target.value)} className="mt-1 w-full rounded-md border-gray-200 px-3 py-2" />
              </div>
              <div>
                <label className="text-sm text-gray-600 block">Type</label>
                <select value={type} onChange={(e) => setType(e.target.value)} className="mt-1 w-full rounded-md border-gray-200 px-3 py-2">
                  <option>Single</option>
                  <option>Double</option>
                  <option>Studio</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-600 block">Price</label>
                <input value={price} onChange={(e) => setPrice(e.target.value)} className="mt-1 w-full rounded-md border-gray-200 px-3 py-2" />
              </div>
              <div className="flex space-x-2">
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded">Save</button>
                <Link href="/rooms" className="px-4 py-2 border rounded">Cancel</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
