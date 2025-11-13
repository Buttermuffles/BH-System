import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

// Topology view: rooms are nodes and connections are edges.
// Nodes are automatically laid out in a circle. Connections are drawn with an SVG overlay.
export default function BuildingMap() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showBillForm, setShowBillForm] = useState(false);
  const [billAmount, setBillAmount] = useState('');
  const [billNotes, setBillNotes] = useState('');

  const containerRef = useRef(null);
  const nodeRefs = useRef(new Map());
  const dialogRef = useRef(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [floorYs, setFloorYs] = useState([]);
  const [coords, setCoords] = useState({}); // { [id]: {x,y,width,height} }
  const [showConnections, setShowConnections] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    let mounted = true;

    fetch('/api/rooms/map')
      .then((res) => {
        if (!res.ok) throw new Error('no api');
        return res.json();
      })
      .then((data) => {
        if (!mounted) return;
        // Normalize: rooms should have id, name, status, tenant, connections: [id,...], plus type/capacity/price
        const normalized = data.map((r) => ({
          id: r.id,
          room_number: r.room_number ?? r.name ?? `Room ${r.id}`,
          name: r.room_number ?? r.name ?? `Room ${r.id}`,
          status: r.status ?? 'vacant',
          tenant: (r.tenants && r.tenants.length) ? r.tenants[0].name : null,
          connections: Array.isArray(r.connections) ? r.connections : (r.connected_rooms ?? []),
          type: r.type ?? null,
          capacity: r.capacity ?? null,
          price: r.price ?? null,
        }));

        setRooms(normalized);
      })
      .catch(() => {
        if (!mounted) return;
        // demo fallback topology
        setRooms([
          { id: 1, name: '101', status: 'occupied', tenant: 'John Doe', connections: [2, 3] },
          { id: 2, name: '102', status: 'vacant', tenant: null, connections: [1] },
          { id: 3, name: '103', status: 'occupied', tenant: 'Jane Smith', connections: [1, 4] },
          { id: 4, name: '104', status: 'maintenance', tenant: null, connections: [3] },
        ]);
      })
      .finally(() => setLoading(false));

    return () => (mounted = false);
  }, []);

  const statusColor = (s) => (s === 'occupied' ? 'bg-green-600' : s === 'available' ? 'bg-blue-500' : 'bg-gray-500');

  // Compute positions (circle layout) and then calculate SVG lines between connected nodes.
  const computeLayout = useCallback(() => {
    const container = containerRef.current;
    if (!container || rooms.length === 0) return;

    const rect = container.getBoundingClientRect();
    const width = Math.max(0, rect.width);
    const height = Math.max(0, rect.height);
    setCanvasSize({ width, height });
    const padding = 60;

    // group rooms by floor (derive floor number from room_number when possible)
    const floors = new Map();
    rooms.forEach((room, i) => {
      let floor = 1;
      const numStr = (room.room_number ?? room.name ?? '').toString();
      const parsed = parseInt(numStr.replace(/\D/g, ''), 10);
      if (!isNaN(parsed) && parsed >= 100) floor = Math.max(1, Math.floor(parsed / 100));
      else if (room._floor) floor = room._floor;
      else floor = i < Math.ceil(rooms.length / 2) ? 1 : 2;

      room._floor = floor;
      if (!floors.has(floor)) floors.set(floor, []);
      floors.get(floor).push(room);
    });

    const floorKeys = Array.from(floors.keys()).sort((a, b) => a - b);
    const floorCount = Math.max(1, floorKeys.length);

    // node geometry
    const nodeWidth = Math.min(160, Math.max(110, Math.floor(width / 6)));
    const nodeHeight = Math.max(48, Math.floor(nodeWidth * 0.4));

    // vertical positions per floor (floor 1 is bottom)
    const yStart = padding + nodeHeight / 2;
    const yEnd = height - padding - nodeHeight / 2;
    const stepY = floorCount > 1 ? (yEnd - yStart) / (floorCount - 1) : 0;

    const newCoords = {};
    const computedFloorYs = [];

    const maxPerFloor = Math.max(...Array.from(floors.values()).map(list => list.length), 1);

    floorKeys.forEach((floor, fi) => {
      const list = floors.get(floor) || [];
      const y = yEnd - fi * stepY;
      computedFloorYs.push(y);

      list.forEach((room, idx) => {
        const colCount = maxPerFloor;
        const slot = (idx + 0.5) / colCount;
        const x = padding + slot * (width - 2 * padding);

        newCoords[room.id] = { x, y, width: nodeWidth, height: nodeHeight };
      });
    });

    setFloorYs(computedFloorYs);
    setCoords(newCoords);
  }, [rooms]);

  useEffect(() => {
    computeLayout();
    const onResize = () => computeLayout();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [rooms, computeLayout]);

  // open/close native dialog when selectedRoom changes
  useEffect(() => {
    const dlg = dialogRef.current;
    if (!dlg) return;
    try {
      if (selectedRoom) {
        // open native dialog then animate in
        if (typeof dlg.showModal === 'function') dlg.showModal();
        else dlg.setAttribute('open', '');
        // small delay so the browser registers open before animation class
        setTimeout(() => setDialogOpen(true), 10);
      } else {
        // animate out then close dialog
        setDialogOpen(false);
        setTimeout(() => {
          try { if (dlg.open) dlg.close(); } catch {}
        }, 180);
      }
    } catch (e) {
      // ignore unsupported or already-open errors
    }
  }, [selectedRoom]);

  async function handleRemove(room) {
    try {
      const res = await fetch(`/api/rooms/${room.id}`, { method: 'DELETE' });
      if (res.ok) {
        setRooms((prev) => prev.filter((r) => r.id !== room.id));
        setSelectedRoom(null);
        toast.success('Room removed');
      } else {
        throw new Error('delete failed');
      }
    } catch (err) {
      // demo fallback
      toast('Remove room (demo)', { description: 'API not available — this is a demo.' });
      setRooms((prev) => prev.filter((r) => r.id !== room.id));
      setSelectedRoom(null);
    }
  }

  async function handleCreateBill(e) {
    e.preventDefault();
    const payload = { amount: billAmount, notes: billNotes };
    try {
      const res = await fetch(`/api/rooms/${selectedRoom.id}/bills`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        toast.success('Bill created');
        setShowBillForm(false);
        setBillAmount('');
        setBillNotes('');
        setSelectedRoom(null);
      } else {
        throw new Error('api');
      }
    } catch (err) {
      toast('Create bill (demo)', { description: JSON.stringify(payload) });
      setShowBillForm(false);
      setSelectedRoom(null);
    }
  }

  // memoized room order for deterministic layout
  const orderedRooms = useMemo(() => rooms.slice().sort((a, b) => a.id - b.id), [rooms]);

  // compute floors for rendering labels and counts
  const floorsForRender = useMemo(() => {
    const map = new Map();
    rooms.forEach((r) => {
      // try numeric floor from room_number, fallback to r._floor or 1
      let floor = 1;
      const numStr = (r.room_number ?? r.name ?? '').toString();
      const parsed = parseInt(numStr.replace(/\D/g, ''), 10);
      if (!isNaN(parsed) && parsed >= 100) floor = Math.max(1, Math.floor(parsed / 100));
      else if (r._floor) floor = r._floor;
      if (!map.has(floor)) map.set(floor, []);
      map.get(floor).push(r);
    });
    return { map, keys: Array.from(map.keys()).sort((a, b) => a - b) };
  }, [rooms]);

  return (
    <AuthenticatedLayout >
      <Head title="Building Map" />

      <div className="py-8">
        <div className="mx-auto max-w-6xl sm:px-6 lg:px-8">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">Building view — rooms are arranged by floor. Click a room to view details.</div>
            <div className="flex items-center space-x-3 text-xs">
              <div className="flex items-center space-x-2"><span className="w-3 h-3 rounded-full bg-green-500" /> <span>Occupied</span></div>
              <div className="flex items-center space-x-2"><span className="w-3 h-3 rounded-full bg-blue-500" /> <span>Vacant</span></div>
              <div className="flex items-center space-x-2"><span className="w-3 h-3 rounded-full bg-gray-500" /> <span>Maintenance</span></div>
            </div>
          </div>

          <div className="bg-white shadow rounded-xl p-4 border border-gray-100 relative" style={{ minHeight: 320 }} ref={containerRef}>
            {loading ? (
              <div className="text-center text-gray-500 py-12">Loading rooms…</div>
            ) : (
              <>
                {/* SVG overlay for connections */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden>
                  {/* building outline using measured canvasSize */}
                  <rect x={32} y={32} width={Math.max(0, canvasSize.width - 64)} height={Math.max(0, canvasSize.height - 64)} fill="none" stroke="#CBD5E1" strokeWidth={2} rx={8} />
                  {/* floor separators to make the view look like stacked floors */}
                  {floorYs.map((y, i) => (
                    <line key={`floor-${i}`} x1={36} x2={Math.max(36, canvasSize.width - 36)} y1={y + 30} y2={y + 30} stroke="#E6EEF6" strokeWidth={2} />
                  ))}
                  {/* connection lines (optional) */}
                  {showConnections && Object.keys(coords).length > 0 && (
                    <g stroke="#60A5FA" strokeWidth={2} fill="none">
                      {rooms.map((r) => (
                        (r.connections || []).map((toId, ii) => {
                          const a = coords[r.id];
                          const b = coords[toId];
                          if (!a || !b) return null;
                          return <line key={`conn-${r.id}-${toId}-${ii}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} strokeOpacity={0.9} />;
                        })
                      ))}
                    </g>
                  )}
                </svg>

                {/* Nodes container (positioned absolutely by computeLayout). Use responsive height. */}
                <div className="relative" style={{ height: '75vh', minHeight: 520 }}>
                  {/* toolbar */}
                  <div className="absolute right-4 top-4 z-20 flex items-center space-x-2">
                    <button onClick={() => setShowConnections((v) => !v)} className={`px-2 py-1 text-xs rounded ${showConnections ? 'bg-indigo-600 text-white' : 'bg-white border'}`}>
                      {showConnections ? 'Hide' : 'Show'} connections
                    </button>
                    <div className="flex items-center space-x-1 bg-white border rounded px-2">
                      <button onClick={() => setZoom((z) => Math.max(0.5, +(z - 0.1).toFixed(2)))} className="text-sm">−</button>
                      <div className="text-xs px-2">{Math.round(zoom * 100)}%</div>
                      <button onClick={() => setZoom((z) => Math.min(2, +(z + 0.1).toFixed(2)))} className="text-sm">+</button>
                    </div>
                  </div>
                  {/* floor labels */}
                  {floorsForRender.keys.map((floor, idx) => {
                    const floorCount = floorsForRender.keys.length;
                    const startY = 40 + Math.max(24, Math.floor(Math.min(48, canvasSize.width / 12)));
                    const endY = canvasSize.height - 40 - Math.max(24, Math.floor(Math.min(48, canvasSize.width / 12)));
                    const step = floorCount > 1 ? (endY - startY) / (floorCount - 1) : 0;
                    const y = endY - (idx * step);
                    return (
                      <div key={floor} style={{ position: 'absolute', left: -112, top: y - 12 }} className="text-xs text-gray-500">Floor {floor}</div>
                    );
                  })}
                  {orderedRooms.length > 0 ? (
                    orderedRooms.map((room) => {
                      const c = coords[room.id];
                      const style = c ? {
                        position: 'absolute',
                        left: `${c.x - c.width / 2}px`,
                        top: `${c.y - c.height / 2}px`,
                        width: `${c.width}px`,
                        height: `${c.height}px`,
                        transform: `scale(${zoom})`,
                        transformOrigin: 'center center',
                      } : {};
                      return (
                        <div
                          key={room.id}
                          ref={(el) => {
                            if (el) nodeRefs.current.set(room.id, el);
                            else nodeRefs.current.delete(room.id);
                          }}
                          role="button"
                          tabIndex={0}
                          onClick={() => setSelectedRoom(room)}
                          onKeyDown={(e) => { if (e.key === 'Enter') setSelectedRoom(room); }}
                          style={style}
                          className="px-4 rounded-lg border border-gray-100 shadow-sm bg-white text-center overflow-hidden flex flex-col justify-center items-center cursor-pointer transition duration-200 ease-out hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-200"
                          aria-label={`${room.name} - ${room.status}`}
                        >
                          <div className="flex items-center justify-center space-x-2">
                            <span className={`w-3 h-3 rounded-full ${statusColor(room.status)}`} />
                            <div className="text-sm font-medium text-gray-700 truncate">{room.name}</div>
                          </div>
                          <div className="text-xs text-gray-500 mt-1 truncate">{room.tenant ?? 'No tenant'}</div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center text-gray-500">No rooms found</div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Dialog (room details) */}
          <dialog ref={dialogRef} className="rounded-lg p-0 border-0 shadow-lg" onClose={() => setSelectedRoom(null)}>
            {selectedRoom && (
              <div className="w-full max-w-lg bg-white rounded-lg">
                <div className={`transform ${dialogOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'} transition-all duration-200`}>
                  <div className="flex items-center justify-between px-6 py-4 border-b">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{selectedRoom.name}</h3>
                    <p className="text-sm text-gray-500">{selectedRoom.tenant ?? 'No tenant'}</p>
                  </div>
                  <button onClick={() => { setDialogOpen(false); setTimeout(() => { try { dialogRef.current.close(); } catch {} setSelectedRoom(null); }, 180); }} className="text-gray-400 hover:text-gray-700">✕</button>
                </div>

                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-sm text-gray-700">
                    <div>
                      <div className="text-xs text-gray-500">Status</div>
                      <div className="font-medium">{selectedRoom.status}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Floor</div>
                      <div className="font-medium">{selectedRoom._floor ?? (() => {
                        const num = parseInt((selectedRoom.room_number ?? '').toString().replace(/\D/g, ''), 10);
                        return (!isNaN(num) && num >= 100) ? Math.floor(num / 100) : '1';
                      })()}</div>
                    </div>

                    <div>
                      <div className="text-xs text-gray-500">Type</div>
                      <div className="font-medium">{selectedRoom.type ?? '—'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Capacity</div>
                      <div className="font-medium">{selectedRoom.capacity ?? '—'}</div>
                    </div>

                    <div>
                      <div className="text-xs text-gray-500">Price</div>
                      <div className="font-medium">{selectedRoom.price != null ? (`₱${Number(selectedRoom.price).toFixed(2)}`) : '—'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Room #</div>
                      <div className="font-medium">{selectedRoom.room_number ?? selectedRoom.name}</div>
                    </div>
                  </div>

                  {!showBillForm ? (
                    <div className="flex items-center space-x-3">
                      <button onClick={() => setShowBillForm(true)} className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700">Create Bill</button>
                      <button onClick={() => handleRemove(selectedRoom)} className="inline-flex items-center rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100">Remove Room</button>
                      <button onClick={() => { setDialogOpen(false); setTimeout(() => { try { dialogRef.current.close(); } catch {} setSelectedRoom(null); }, 180); }} className="px-3 py-2 text-sm">Close</button>
                    </div>
                  ) : (
                    <form onSubmit={handleCreateBill} className="space-y-3">
                      <div>
                        <label className="text-xs text-gray-600">Amount</label>
                        <input value={billAmount} onChange={(e) => setBillAmount(e.target.value)} className="mt-1 w-full rounded-md border-gray-200 px-2 py-1" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">Notes</label>
                        <input value={billNotes} onChange={(e) => setBillNotes(e.target.value)} className="mt-1 w-full rounded-md border-gray-200 px-2 py-1" />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <button type="button" onClick={() => setShowBillForm(false)} className="px-3 py-2 text-sm">Cancel</button>
                        <button type="submit" className="px-3 py-2 rounded-md bg-indigo-600 text-white text-sm">Create</button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
            )}
          </dialog>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
