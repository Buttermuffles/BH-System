import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function TenantCreate() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    // demo: just show a toast — wire to API when backend is ready
    toast.success(`Tenant saved: ${name}`);
    setName('');
    setEmail('');
  }

  return (
    <AuthenticatedLayout header={<h2 className="text-xl font-semibold">New Tenant</h2>}>
      <Head title="New Tenant" />

      <div className="py-6">
        <div className="mx-auto max-w-3xl sm:px-6 lg:px-8">
          <div className="bg-white border rounded-xl p-6 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm text-gray-600 block">Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-md border-gray-200 px-3 py-2" />
              </div>
              <div>
                <label className="text-sm text-gray-600 block">Email</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-md border-gray-200 px-3 py-2" />
              </div>
              <div className="flex space-x-2">
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded">Save</button>
                <Link href="/tenants" className="px-4 py-2 border rounded">Cancel</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
