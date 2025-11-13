import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { toast } from 'sonner';
import Modal from '@/Components/Dialog';
import Button from '@/Components/Button';
import { useState } from 'react';

const currency = (v) =>
  typeof v === 'number'
    ? new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
      }).format(v)
    : v;

export default function BillsIndex({ bills = [] }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const { data, setData, reset, post, put, delete: destroy } = useForm({
    room_id: '',
    type: 'water',
    amount: '',
    bill_date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editing) {
      toast.promise(
        new Promise((resolve, reject) => {
          put(`/bills/${editing.id}`, {
            onSuccess: () => {
              setOpen(false);
              reset();
              setEditing(null);
              resolve();
            },
            onError: (errors) => reject(errors),
          });
        }),
        {
          loading: 'Updating bill...',
          success: 'Bill updated',
          error: 'Failed to update bill',
        }
      );
    } else {
      toast.promise(
        new Promise((resolve, reject) => {
          post('/bills', {
            onSuccess: () => {
              setOpen(false);
              reset();
              resolve();
            },
            onError: (errors) => reject(errors),
          });
        }),
        {
          loading: 'Creating bill...',
          success: 'Bill created',
          error: 'Failed to create bill',
        }
      );
    }
  };

  const openEdit = (bill) => {
    setEditing(bill);
    setData({
      room_id: bill.room_id || '',
      type: bill.type || 'water',
      amount: bill.amount || bill.price || '',
      bill_date: bill.bill_date?.split('T')[0] || new Date().toISOString().split('T')[0],
      notes: bill.notes || ''
    });
    setOpen(true);
  };

  const handleDelete = (id) => {
    setDeleteConfirm(id);
  };

  const confirmDelete = () => {
    if (deleteConfirm) {
      toast.promise(
        new Promise((resolve, reject) => {
          destroy(`/bills/${deleteConfirm}`, {
            onSuccess: () => {
              setDeleteConfirm(null);
              setEditing(null);
              resolve();
            },
            onError: (errors) => reject(errors),
          });
        }),
        {
          loading: 'Deleting bill...',
          success: 'Bill deleted',
          error: 'Failed to delete bill',
        }
      );
    }
  };

  const openCreate = () => {
    setEditing(null);
    reset();
    setOpen(true);
  };

  return (
    <AuthenticatedLayout>
      <Head title="Bills" />

      <div className="py-6">
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Bills Management</h3>
                <p className="text-sm text-gray-500 mt-1">Manage all tenant bills and utilities</p>
              </div>
              <div className="flex items-center space-x-3 w-full sm:w-auto">
                <input
                  type="search"
                  placeholder="Search bills..."
                  className="flex-1 sm:flex-none px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
                <Button onClick={openCreate}>+ New Bill</Button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
            {bills.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-gray-400 mb-2">
                  <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-gray-500 font-medium">No bills yet</p>
                <p className="text-gray-400 text-sm">Create your first bill to get started</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">#</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Tenant</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Notes</th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {bills.map((b, idx) => (
                      <tr key={b.id} className="hover:bg-indigo-50 transition-colors duration-200 group">
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">
                            {idx + 1}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-gray-900">{b.tenant?.name ?? b.room?.tenant?.name ?? '—'}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 capitalize">
                            {b.type ?? '—'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-gray-900">{currency(b.amount ?? b.price) ?? '—'}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-600">{b.bill_date ? new Date(b.bill_date).toLocaleDateString() : '—'}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-xs text-gray-500 truncate max-w-xs">{b.notes ?? '—'}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button size="sm" variant="outline" onClick={() => openEdit(b)}>Edit</Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDelete(b.id)}>Delete</Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal
        open={open}
        onOpenChange={setOpen}
        title={editing ? "Edit Bill" : "New Bill"}
        footer={
          <Button onClick={handleSubmit}>{editing ? "Update" : "Save"}</Button>
        }
      >
        <form className="space-y-3" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium mb-1">Room ID</label>
            <input
              className="w-full border rounded p-2"
              placeholder="Room ID"
              type="number"
              value={data.room_id}
              onChange={e => setData('room_id', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <select
              className="w-full border rounded p-2"
              value={data.type}
              onChange={e => setData('type', e.target.value)}
            >
              <option value="water">Water</option>
              <option value="electricity">Electricity</option>
              <option value="rent">Rent</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Amount</label>
            <input
              className="w-full border rounded p-2"
              placeholder="Amount"
              type="number"
              step="0.01"
              value={data.amount}
              onChange={e => setData('amount', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Bill Date</label>
            <input
              className="w-full border rounded p-2"
              type="date"
              value={data.bill_date}
              onChange={e => setData('bill_date', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea
              className="w-full border rounded p-2"
              placeholder="Notes"
              value={data.notes}
              onChange={e => setData('notes', e.target.value)}
              rows="3"
            />
          </div>
        </form>
      </Modal>

      <Modal
        open={!!deleteConfirm}
        onOpenChange={() => setDeleteConfirm(null)}
        title="Delete Bill"
        footer={
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
          </div>
        }
      >
        <div className="py-4">
          <div className="flex items-center space-x-3 mb-4">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4v2m0 4v2M6.343 3h11.314c.243 0 .469.108.627.303l7.364 9.792a.75.75 0 010 .81l-7.364 9.792a.75.75 0 01-.627.303H6.343a.75.75 0 01-.75-.75V3.75a.75.75 0 01.75-.75z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Are you sure you want to delete this bill?</p>
              <p className="text-xs text-gray-500 mt-1">This action cannot be undone.</p>
            </div>
          </div>
        </div>
      </Modal>
    </AuthenticatedLayout>
  );
}
