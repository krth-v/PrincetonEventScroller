import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, Tag, Plus } from 'lucide-react';

const BACKEND_URL = 'http://localhost:3001';

function EventsApp() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingToCalendar, setAddingToCalendar] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BACKEND_URL}/api/events`);
      const data = await response.json();
      
      if (data.success) {
        setEvents(data.events);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to load events: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const addToGoogleCalendar = async (eventId) => {
    try {
      setAddingToCalendar(eventId);
      
      // Note: In production, you'd implement OAuth flow to get access token
      // For now, this shows the structure
      const accessToken = localStorage.getItem('google_access_token');
      
      if (!accessToken) {
        alert('Please authenticate with Google Calendar first');
        setAddingToCalendar(null);
        return;
      }

      const response = await fetch(`${BACKEND_URL}/api/calendar/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId,
          accessToken
        })
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Event added to your Google Calendar!');
      } else {
        alert('Failed to add event: ' + data.error);
      }
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setAddingToCalendar(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-700 font-medium">Loading Princeton events...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md">
          <p className="text-red-600 font-semibold">Error: {error}</p>
          <button 
            onClick={fetchEvents}
            className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      {/* Header */}
      <div className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-orange-600">Princeton Events</h1>
            <button
              onClick={fetchEvents}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
            >
              Refresh
            </button>
          </div>
          <p className="text-gray-600 mt-1">{events.length} upcoming events</p>
        </div>
      </div>

      {/* Events List */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {events.map((event) => (
            <div
              key={event.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300"
            >
              <div className="md:flex">
                {/* Cover Image */}
                {event.cover_image && (
                  <div className="md:w-1/3">
                    <img
                      src={event.cover_image}
                      alt={event.name}
                      className="w-full h-64 md:h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                
                {/* Event Details */}
                <div className={`p-6 ${event.cover_image ? 'md:w-2/3' : 'w-full'}`}>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">
                    {event.name || 'Untitled Event'}
                  </h2>

                  {/* Event Info Grid */}
                  <div className="space-y-3 mb-4">
                    {event.datetime && (
                      <div className="flex items-start gap-3">
                        <Calendar className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{event.datetime}</span>
                      </div>
                    )}

                    {event.location && (
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{event.location}</span>
                      </div>
                    )}

                    {event.host_organization && (
                      <div className="flex items-start gap-3">
                        <Users className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">
                          Hosted by <span className="font-semibold">{event.host_organization}</span>
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  {event.description && (
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {event.description}
                    </p>
                  )}

                  {/* Tags */}
                  {event.tags && event.tags.length > 0 && (
                    <div className="flex items-start gap-2 mb-4">
                      <Tag className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                      <div className="flex flex-wrap gap-2">
                        {event.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* RSVP List */}
                  {event.rsvp_list && event.rsvp_list.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-2">
                        {event.rsvp_list.length} {event.rsvp_list.length === 1 ? 'person' : 'people'} attending
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {event.rsvp_list.slice(0, 5).map((person, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm"
                          >
                            {person}
                          </span>
                        ))}
                        {event.rsvp_list.length > 5 && (
                          <span className="px-2 py-1 text-gray-500 text-sm">
                            +{event.rsvp_list.length - 5} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Add to Calendar Button */}
                  <button
                    onClick={() => addToGoogleCalendar(event.id)}
                    disabled={addingToCalendar === event.id}
                    className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    <Plus className="w-5 h-5" />
                    {addingToCalendar === event.id ? 'Adding...' : 'Add to Calendar'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {events.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No events found</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default EventsApp;
