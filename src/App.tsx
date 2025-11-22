import { useState, useRef, useEffect, useMemo } from "react";
import { EventCard } from "./components/EventCard";
import { mockEvents } from "./data/mockEvents";
import { motion } from "motion/react";
import { FilterMenu } from "./components/FilterMenu";

export default function App() {
  const [likedEvents, setLikedEvents] = useState<Set<string>>(new Set());
  const [bookmarkedEvents, setBookmarkedEvents] = useState<Set<string>>(
    new Set()
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Filter events based on selected filter
  const filteredEvents = useMemo(() => {
    const now = new Date("2024-11-22"); // Current date based on context
    
    if (selectedFilter === "all") {
      return mockEvents;
    }
    
    return mockEvents.filter((event) => {
      const eventDate = new Date(event.date);
      
      if (selectedFilter === "today") {
        return eventDate.toDateString() === now.toDateString();
      }
      
      if (selectedFilter === "week") {
        const weekFromNow = new Date(now);
        weekFromNow.setDate(now.getDate() + 7);
        return eventDate >= now && eventDate <= weekFromNow;
      }
      
      if (selectedFilter === "month") {
        const monthFromNow = new Date(now);
        monthFromNow.setMonth(now.getMonth() + 1);
        return eventDate >= now && eventDate <= monthFromNow;
      }
      
      return true;
    });
  }, [selectedFilter]);

  // Reset scroll position when filter changes
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: "smooth" });
      setCurrentIndex(0);
    }
  }, [selectedFilter]);

  const handleLike = (eventId: string) => {
    setLikedEvents((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(eventId)) {
        newSet.delete(eventId);
      } else {
        newSet.add(eventId);
      }
      return newSet;
    });
  };

  const handleBookmark = (eventId: string) => {
    setBookmarkedEvents((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(eventId)) {
        newSet.delete(eventId);
      } else {
        newSet.add(eventId);
      }
      return newSet;
    });
  };

  const handleAccount = (eventId: string) => {
    console.log("Account action for event:", eventId);
    // Placeholder for account/share functionality
  };

  // Handle scroll snapping
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      scrollTimeoutRef.current = setTimeout(() => {
        const scrollPosition = container.scrollTop;
        const windowHeight = window.innerHeight;
        const newIndex = Math.round(scrollPosition / windowHeight);
        setCurrentIndex(newIndex);
      }, 150);
    };

    container.addEventListener("scroll", handleScroll);
    return () => {
      container.removeEventListener("scroll", handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // Touch gesture handling for smooth scrolling
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const container = containerRef.current;
    if (!container) return;

    const delta = e.deltaY;
    const threshold = 50;

    if (Math.abs(delta) > threshold) {
      const direction = delta > 0 ? 1 : -1;
      const newIndex = Math.max(
        0,
        Math.min(currentIndex + direction, filteredEvents.length - 1)
      );

      if (newIndex !== currentIndex) {
        container.scrollTo({
          top: newIndex * window.innerHeight,
          behavior: "smooth",
        });
        setCurrentIndex(newIndex);
      }
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-br from-orange-50 via-white to-orange-50">
      {/* Event Cards Container */}
      <div
        ref={containerRef}
        onWheel={handleWheel}
        className="h-screen overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {filteredEvents.length > 0 ? (
          filteredEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onLike={handleLike}
              onBookmark={handleBookmark}
              onAccount={handleAccount}
              isLiked={likedEvents.has(event.id)}
              isBookmarked={bookmarkedEvents.has(event.id)}
            />
          ))
        ) : (
          <div className="h-screen flex items-center justify-center">
            <div className="text-center text-gray-500">
              <p>No events found for this filter</p>
            </div>
          </div>
        )}
      </div>

      {/* Filter Menu - Top Left */}
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="absolute top-4 left-4 z-30"
      >
        <FilterMenu
          selectedFilter={selectedFilter}
          onFilterChange={setSelectedFilter}
        />
      </motion.div>

      {/* Event Counter - Top Right */}
      <motion.div
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="absolute top-4 right-4 z-30"
      >
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#FF8F00] animate-pulse" />
            <span className="text-gray-700 text-sm">
              {filteredEvents.length > 0 ? currentIndex + 1 : 0} / {filteredEvents.length}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Progress Indicator */}
      {filteredEvents.length > 0 && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-2">
          {filteredEvents.map((_, index) => (
            <motion.div
              key={index}
              className={`w-1 rounded-full transition-all ${
                index === currentIndex
                  ? "h-8 bg-[#FF8F00]"
                  : "h-2 bg-gray-300"
              }`}
              animate={{
                height: index === currentIndex ? 32 : 8,
              }}
            />
          ))}
        </div>
      )}

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}