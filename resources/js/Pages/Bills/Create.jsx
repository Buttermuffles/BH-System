import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function BillCreate() {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    toast.success(`Bill created: ${amount}`);
    setTitle(''); setAmount(''); setNotes('');
  }

  return (
    <AuthenticatedLayout header={<h2 className="text-xl font-semibold">New Bill</h2>}>
      <Head title="New Bill" />

      <div className="py-6">
        <div className="mx-auto max-w-3xl sm:px-6 lg:px-8">
          <div className="bg-white border rounded-xl p-6 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm text-gray-600 block">Title</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 w-full rounded-md border-gray-200 px-3 py-2" />
              </div>
              <div>
                <label className="text-sm text-gray-600 block">Amount</label>
                <input value={amount} onChange={(e) => setAmount(e.target.value)} className="mt-1 w-full rounded-md border-gray-200 px-3 py-2" />
              </div>
              <div>
                <label className="text-sm text-gray-600 block">Notes</label>
                <input value={notes} onChange={(e) => setNotes(e.target.value)} className="mt-1 w-full rounded-md border-gray-200 px-3 py-2" />
              </div>
              <div className="flex space-x-2">
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded">Save</button>
                <Link href="/bills" className="px-4 py-2 border rounded">Cancel</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
