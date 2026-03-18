// src/components/meetings/MeetingsList.tsx
import { useState } from 'react';
import { Calendar, Clock, MapPin, Users, Plus, Search } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { Meeting } from '../types';
import ScheduleMeeting from './ScheduleMeeting';

export default function MeetingsList() {
  const { meetings } = useApp();
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [search, setSearch] = useState('');

  const filteredMeetings = meetings.filter((meeting: Meeting) =>
    meeting.title.toLowerCase().includes(search.toLowerCase()) ||
    meeting.location.toLowerCase().includes(search.toLowerCase())
  );

  const upcomingMeetings = filteredMeetings.filter((m: Meeting) => m.status === 'upcoming');
  const completedMeetings = filteredMeetings.filter((m: Meeting) => m.status === 'completed');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meetings</h1>
          <p className="text-gray-600 mt-1">Schedule and manage chama meetings</p>
        </div>
        <button
          onClick={() => setShowScheduleModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Schedule Meeting
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search meetings..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Meetings */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Upcoming Meetings</h2>
            <p className="text-sm text-gray-600 mt-1">{upcomingMeetings.length} scheduled</p>
          </div>
          <div className="p-4">
            {upcomingMeetings.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming meetings</h3>
                <p className="text-gray-600 text-sm">Schedule your next meeting to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingMeetings.map((meeting: Meeting) => (
                  <div key={meeting.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">{meeting.title}</h3>
                        <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full mt-1">
                          {meeting.type}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{meeting.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{meeting.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{meeting.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>{meeting.attendees.length} attendees</span>
                      </div>
                    </div>

                    {meeting.agenda.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-sm font-medium text-gray-900 mb-2">Agenda:</p>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {meeting.agenda.slice(0, 3).map((item, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-gray-400 mt-1">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                          {meeting.agenda.length > 3 && (
                            <li className="text-gray-500">+{meeting.agenda.length - 3} more items</li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Completed Meetings */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Completed Meetings</h2>
            <p className="text-sm text-gray-600 mt-1">{completedMeetings.length} completed</p>
          </div>
          <div className="p-4">
            {completedMeetings.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No completed meetings</h3>
                <p className="text-gray-600 text-sm">Completed meetings will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {completedMeetings.map((meeting: Meeting) => (
                  <div key={meeting.id} className="border border-gray-200 rounded-lg p-4 opacity-75">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">{meeting.title}</h3>
                        <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full mt-1">
                          {meeting.type}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{meeting.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>{meeting.attendees.length} attendees</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <ScheduleMeeting
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
      />
    </div>
  );
}