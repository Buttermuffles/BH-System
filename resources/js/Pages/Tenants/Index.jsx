import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { toast } from 'sonner';
import Modal from '@/Components/Dialog';
import Button from '@/Components/Button';
import { useState } from 'react';

const initials = (name = '') => name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

export default function TenantsIndex({ tenants = [] }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const { data, setData, reset, post, put, delete: destroy } = useForm({
    name: '',
    email: '',
    phone: '',
    room_id: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editing) {
      toast.promise(
        new Promise((resolve, reject) => {
          put(`/tenants/${editing.id}`, {
            onSuccess: () => {
              setOpen(false);
              reset();
              setEditing(null);
              resolve();
            },
            onError: (errors) => {
              console.error('Validation errors:', errors);
              reject(errors);
            }
          });
        }),
        {
          loading: 'Updating tenant...',
          success: 'Tenant updated',
          error: 'Failed to update tenant',
        }
      );
    } else {
      toast.promise(
        new Promise((resolve, reject) => {
          post('/tenants', {
            onSuccess: () => {
              setOpen(false);
              reset();
              resolve();
            },
            onError: (errors) => {
              console.error('Validation errors:', errors);
              reject(errors);
            }
          });
        }),
        {
          loading: 'Creating tenant...',
          success: 'Tenant created',
          error: 'Failed to create tenant',
        }
      );
    }
  };

  const openEdit = (tenant) => {
    setEditing(tenant);
    setData({
      name: tenant.name,
      email: tenant.email || '',
      phone: tenant.phone || '',
      room_id: tenant.room_id || ''
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
          destroy(`/tenants/${deleteConfirm}`, {
            onSuccess: () => {
              setDeleteConfirm(null);
              setEditing(null);
              resolve();
            },
            onError: (errors) => reject(errors),
          });
        }),
        {
          loading: 'Deleting tenant...',
          success: 'Tenant deleted',
          error: 'Failed to delete tenant',
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
    <AuthenticatedLayout >
      <Head title="Tenants" />

      <div className="py-6">
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Tenants Management</h3>
                <p className="text-sm text-gray-500 mt-1">Manage all your tenants and residents</p>
              </div>
              <div className="flex items-center space-x-3 w-full sm:w-auto">
                <input
                  type="search"
                  placeholder="Search tenants..."
                  className="flex-1 sm:flex-none px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
                <Button onClick={openCreate}>+ New Tenant</Button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
            {tenants.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-gray-400 mb-2">
                  <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10a3 3 0 11-6 0 3 3 0 016 0zM6 20h12a6 6 0 00-6-6 6 6 0 00-6 6z" />
                  </svg>
                </div>
                <p className="text-gray-500 font-medium">No tenants yet</p>
                <p className="text-gray-400 text-sm">Create your first tenant to get started</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">#</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Phone</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Room</th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {tenants.map((t, idx) => (
                      <tr key={t.id} className="hover:bg-indigo-50 transition-colors duration-200 group">
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">
                            {idx + 1}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-md">
                              {initials(t.name)}
                            </div>
                            <p className="text-sm font-bold text-gray-900">{t.name}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-600">{t.email ?? '—'}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-600">{t.phone ?? '—'}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                            {t.room?.room_number ?? t.room_number ?? '—'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button size="sm" variant="outline" onClick={() => openEdit(t)}>Edit</Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDelete(t.id)}>Delete</Button>
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
        title={editing ? "Edit Tenant" : "New Tenant"}
        footer={
          <Button onClick={handleSubmit}>{editing ? "Update" : "Save"}</Button>
        }
      >
        <form className="space-y-3" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              className="w-full border rounded p-2"
              placeholder="Name"
              value={data.name}
              onChange={e => setData('name', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              className="w-full border rounded p-2"
              placeholder="Email"
              type="email"
              value={data.email}
              onChange={e => setData('email', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input
              className="w-full border rounded p-2"
              placeholder="Phone"
              value={data.phone}
              onChange={e => setData('phone', e.target.value)}
            />
          </div>
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
        </form>
      </Modal>

      <Modal
        open={!!deleteConfirm}
        onOpenChange={() => setDeleteConfirm(null)}
        title="Delete Tenant"
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
              <p className="text-sm font-medium text-gray-900">Are you sure you want to delete this tenant?</p>
              <p className="text-xs text-gray-500 mt-1">This action cannot be undone.</p>
            </div>
          </div>
        </div>
      </Modal>
    </AuthenticatedLayout>
  );
}
