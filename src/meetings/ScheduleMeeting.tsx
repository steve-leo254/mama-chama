// src/components/meetings/ScheduleMeeting.tsx
import { useState } from 'react';
import Modal from '../ui/Modal';
import { useApp } from '../context/AppContext';
import { Plus, X } from 'lucide-react';

interface ScheduleMeetingProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ScheduleMeeting({ isOpen, onClose }: ScheduleMeetingProps) {
  const { addMeeting } = useApp();
  const [form, setForm] = useState({
    title: '',
    date: '',
    time: '',
    location: '',
    type: 'monthly' as 'monthly' | 'special' | 'agm' | 'emergency',
  });
  const [agendaItems, setAgendaItems] = useState<string[]>(['']);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addMeeting({
      ...form,
      agenda: agendaItems.filter(Boolean),
      attendees: [],
      status: 'upcoming',
    });
    setForm({ title: '', date: '', time: '', location: '', type: 'monthly' });
    setAgendaItems(['']);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Schedule Meeting" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Meeting Title</label>
          <input
            type="text"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="input-field"
            placeholder="e.g. January Monthly Meeting"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Date</label>
            <input
              type="date"
              required
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Time</label>
            <input
              type="time"
              required
              value={form.time}
              onChange={(e) => setForm({ ...form, time: e.target.value })}
              className="input-field"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Location</label>
          <input
            type="text"
            required
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            className="input-field"
            placeholder="e.g. Member's home, Restaurant..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Type</label>
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value as any })}
            className="input-field"
          >
            <option value="monthly">Monthly</option>
            <option value="special">Special</option>
            <option value="agm">AGM</option>
            <option value="emergency">Emergency</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Agenda Items</label>
          <div className="space-y-2">
            {agendaItems.map((item, idx) => (
              <div key={idx} className="flex gap-2">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => {
                    const newItems = [...agendaItems];
                    newItems[idx] = e.target.value;
                    setAgendaItems(newItems);
                  }}
                  className="input-field"
                  placeholder={`Agenda item ${idx + 1}`}
                />
                {agendaItems.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setAgendaItems(agendaItems.filter((_, i) => i !== idx))}
                    className="p-3 hover:bg-gray-100 rounded-xl"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => setAgendaItems([...agendaItems, ''])}
              className="text-sm text-primary-600 font-medium flex items-center gap-1 hover:text-primary-700"
            >
              <Plus className="w-4 h-4" /> Add agenda item
            </button>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" className="btn-primary flex-1">Schedule Meeting</button>
        </div>
      </form>
    </Modal>
  );
}