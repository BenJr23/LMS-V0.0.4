'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';

export default function CalendarPage() {
  const events = [
    {
      date: 'May 26',
      title: 'Lecture: Data Types',
      course: 'CS101',
      color: 'bg-blue-100 text-blue-800',
    },
    {
      date: 'May 27',
      title: 'Assignment #1 Due',
      course: 'CS101',
      color: 'bg-red-100 text-red-800',
    },
    {
      date: 'May 29',
      title: 'Quiz #1',
      course: 'MATH201',
      color: 'bg-yellow-100 text-yellow-800',
    },
    {
      date: 'May 30',
      title: 'Discussion Forum Due',
      course: 'HIST101',
      color: 'bg-green-100 text-green-800',
    },
  ];

  // Helper to get week dates from a start date
  function getWeekDates(start: Date) {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      dates.push(d);
    }
    return dates;
  }

  // State for current week (start date)
  const [weekStart, setWeekStart] = useState(new Date(2025, 4, 25)); // May is month 4 (0-indexed)
  const weekDates = getWeekDates(weekStart);

  // Format week range string
  function formatDate(date: Date) {
    return date.toLocaleString('en-US', { month: 'short', day: 'numeric' });
  }
  const weekRange = `${formatDate(weekDates[0])} – ${formatDate(weekDates[6])}, ${weekDates[0].getFullYear()}`;

  // Helper to check if a date is today
  function isToday(date: Date) {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }

  return (
    <div className="w-full px-4 md:px-8">
      <div className="flex items-center gap-2 mb-4">
        <CalendarDays className="text-[#800000] w-7 h-7" />
        <h2 className="text-3xl font-bold text-[#800000] tracking-tight">Calendar</h2>
      </div>

      {/* Week Panner */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow mb-2 border border-gray-100">
        <button
          className="text-[#800000] p-2 rounded-full hover:bg-gray-100 focus:ring-2 focus:ring-[#800000] transition"
          onClick={() => setWeekStart(new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() - 7))}
          aria-label="Previous week"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="text-gray-800 font-semibold text-lg tracking-wide">{weekRange}</div>
        <button
          className="text-[#800000] p-2 rounded-full hover:bg-gray-100 focus:ring-2 focus:ring-[#800000] transition"
          onClick={() => setWeekStart(new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 7))}
          aria-label="Next week"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Week Dates Row */}
      <div className="flex gap-2 md:gap-6 text-center w-full justify-between mb-4">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
          <div key={index} className="flex flex-col items-center w-full">
            <div className="text-xs md:text-sm text-gray-500 font-medium mb-1">{day}</div>
            <div
              className={`font-bold w-9 h-9 md:w-10 md:h-10 flex items-center justify-center mx-auto rounded-full transition
                ${isToday(weekDates[index]) ? 'bg-[#800000] text-white shadow-lg border-2 border-[#800000]' :
                  index === 4 ? 'bg-[#800000]/80 text-white' : 'text-gray-800 bg-gray-100'}
              `}
            >
              {weekDates[index].getDate()}
            </div>
          </div>
        ))}
      </div>

      {/* Week View Grid */}
      <div className="grid grid-cols-7 gap-2 bg-white rounded-xl shadow border border-gray-100 text-sm overflow-x-auto">
        {weekDates.map((date, index) => {
          // Format date string for event matching (e.g., 'May 25')
          const dateStr = `${date.toLocaleString('en-US', { month: 'short' })} ${date.getDate()}`;
          const dayEvents = events.filter((e) => e.date === dateStr);
          return (
            <div key={index} className="border-r last:border-r-0 border-gray-100 p-2 min-h-[120px] flex flex-col">
              <div className="text-gray-700 font-semibold mb-2 text-xs md:text-sm text-center">
                {dateStr}
              </div>

              {dayEvents.length > 0 ? (
                dayEvents.map((event, idx) => (
                  <div
                    key={idx}
                    className={`mb-2 p-2 rounded-lg flex flex-col gap-1 shadow-sm border-l-4 ${event.color} border-[#800000] animate-fade-in`}
                  >
                    <div className="font-semibold flex items-center gap-1">
                      <CalendarDays className="w-4 h-4 mr-1 text-[#800000]" />
                      {event.title}
                    </div>
                    <div className="text-xs font-medium text-[#800000]">{event.course}</div>
                  </div>
                ))
              ) : (
                <div className="text-gray-300 italic text-xs text-center mt-6">No events</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}