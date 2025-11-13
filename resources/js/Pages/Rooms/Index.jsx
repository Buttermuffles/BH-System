import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { toast } from 'sonner';
import Modal from '@/Components/Dialog';
import Button from '@/Components/Button';
import { useState } from 'react';

const priceFmt = (v) =>
  typeof v === 'number'
    ? new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
      }).format(v)
    : v;

const statusBadge = (s) =>
  s === 'occupied'
    ? 'bg-green-100 text-green-800'
    : s === 'vacant'
    ? 'bg-blue-100 text-blue-800'
    : 'bg-gray-100 text-gray-800';

export default function RoomsIndex({ rooms = [] }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const { data, setData, reset, post, put, delete: destroy } = useForm({
    room_number: '',
    type: '',
    capacity: '',
    status: 'vacant',
    price: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editing) {
      toast.promise(
        new Promise((resolve, reject) => {
          put(`/rooms/${editing.id}`, {
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
          loading: 'Updating room...',
          success: 'Room updated',
          error: 'Failed to update room',
        }
      );
    } else {
      toast.promise(
        new Promise((resolve, reject) => {
          post('/rooms', {
            onSuccess: () => {
              setOpen(false);
              reset();
              resolve();
            },
            onError: (errors) => reject(errors),
          });
        }),
        {
          loading: 'Creating room...',
          success: 'Room created',
          error: 'Failed to create room',
        }
      );
    }
  };

  const openEdit = (room) => {
    setEditing(room);
    setData({
      room_number: room.room_number,
      type: room.type || '',
      capacity: room.capacity || '',
      status: room.status || 'vacant',
      price: room.price || ''
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
          destroy(`/rooms/${deleteConfirm}`, {
            onSuccess: () => {
              setDeleteConfirm(null);
              setEditing(null);
              resolve();
            },
            onError: (errors) => reject(errors),
          });
        }),
        {
          loading: 'Deleting room...',
          success: 'Room deleted',
          error: 'Failed to delete room',
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
      <Head title="Rooms" />

      <div className="py-6">
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Rooms Management</h3>
                <p className="text-sm text-gray-500 mt-1">Manage your boarding house rooms</p>
              </div>
              <div className="flex items-center space-x-3 w-full sm:w-auto">
                <input
                  type="search"
                  placeholder="Search rooms..."
                  className="flex-1 sm:flex-none px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
                <Button onClick={openCreate}>+ New Room</Button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
            {rooms.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-gray-400 mb-2">
                  <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-3m0 0l7-4 7 4M5 9v10a1 1 0 001 1h2a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h2a1 1 0 001-1V9m-9 0a1 1 0 012 0m0 0a1 1 0 012 0m0 0a1 1 0 012 0" />
                  </svg>
                </div>
                <p className="text-gray-500 font-medium">No rooms yet</p>
                <p className="text-gray-400 text-sm">Create your first room to get started</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">#</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Room #</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Capacity</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {rooms.map((r, idx) => (
                      <tr key={r.id} className="hover:bg-indigo-50 transition-colors duration-200 group">
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">
                            {idx + 1}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-gray-900">{r.room_number}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-600">{r.type ?? '—'}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
                            {r.capacity ?? '—'} {r.capacity ? 'pax' : ''}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 text-xs font-bold rounded-full ${
                            r.status === 'occupied'
                              ? 'bg-green-100 text-green-800'
                              : r.status === 'vacant'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {r.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-gray-900">{r.price != null ? priceFmt(Number(r.price)) : '—'}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button size="sm" variant="outline" onClick={() => openEdit(r)}>Edit</Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDelete(r.id)}>Delete</Button>
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
        title={editing ? "Edit Room" : "New Room"}
        footer={
          <Button onClick={handleSubmit}>{editing ? "Update" : "Save"}</Button>
        }
      >
        <form className="space-y-3" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium mb-1">Room #</label>
            <input
              className="w-full border rounded p-2"
              placeholder="Room #"
              value={data.room_number}
              onChange={e => setData('room_number', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <input
              className="w-full border rounded p-2"
              placeholder="Type"
              value={data.type}
              onChange={e => setData('type', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Capacity</label>
            <input
              className="w-full border rounded p-2"
              placeholder="Capacity"
              type="number"
              value={data.capacity}
              onChange={e => setData('capacity', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              className="w-full border rounded p-2"
              value={data.status}
              onChange={e => setData('status', e.target.value)}
            >
              <option value="vacant">Vacant</option>
              <option value="occupied">Occupied</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Price</label>
            <input
              className="w-full border rounded p-2"
              placeholder="Price"
              type="number"
              step="0.01"
              value={data.price}
              onChange={e => setData('price', e.target.value)}
            />
          </div>
        </form>
      </Modal>

      <Modal
        open={!!deleteConfirm}
        onOpenChange={() => setDeleteConfirm(null)}
        title="Delete Room"
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
              <p className="text-sm font-medium text-gray-900">Are you sure you want to delete this room?</p>
              <p className="text-xs text-gray-500 mt-1">This action cannot be undone.</p>
            </div>
          </div>
        </div>
      </Modal>
    </AuthenticatedLayout>
  );
}
