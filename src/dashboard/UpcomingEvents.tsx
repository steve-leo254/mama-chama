// src/components/dashboard/UpcomingEvents.tsx
import { MapPin, Clock, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Badge from '../ui/Badge';

export default function UpcomingEvents() {
  const { meetings, merryGoRoundCycles } = useApp();

  const upcomingMeetings = meetings.filter(m => m.status === 'upcoming').slice(0, 2);
  const currentMGR = merryGoRoundCycles.find(c => c.status === 'current');

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm shadow-black/5 p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Upcoming Events</h3>

      {/* Merry-go-round highlight */}
      {currentMGR && (
        <div className="bg-gradient-to-r from-purple-50 to-purple-100/50 rounded-xl p-4 mb-4 border border-purple-200">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🎡</span>
            <Badge variant="purple">Merry-Go-Round</Badge>
          </div>
          <p className="text-sm font-semibold text-gray-900">
            Next payout: {currentMGR.recipientName}
          </p>
          <p className="text-xs text-gray-600 mt-1">
            KES {currentMGR.amount.toLocaleString()} • {currentMGR.date}
          </p>
        </div>
      )}

      {/* Upcoming Meetings */}
      <div className="space-y-3">
        {upcomingMeetings.map((meeting) => (
          <div key={meeting.id} className="group flex items-start gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer">
            <div className="w-12 h-12 bg-primary-50 rounded-xl flex flex-col items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-primary-600">
                {new Date(meeting.date).toLocaleDateString('en', { day: '2-digit' })}
              </span>
              <span className="text-[10px] text-primary-500 uppercase">
                {new Date(meeting.date).toLocaleDateString('en', { month: 'short' })}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900">{meeting.title}</p>
              <div className="flex items-center gap-3 mt-1">
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="w-3 h-3" /> {meeting.time}
                </span>
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <MapPin className="w-3 h-3" /> {meeting.location.split(',')[0]}
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors mt-1" />
          </div>
        ))}
      </div>
    </div>
  );
}