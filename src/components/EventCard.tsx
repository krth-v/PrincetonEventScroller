import { Event } from "../types/event";
import { ActionButtons } from "./ActionButtons";
import { Calendar, MapPin, Star, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Badge } from "./ui/badge";
import { useState } from "react";

interface EventCardProps {
  event: Event;
  onLike: (id: string) => void;
  onBookmark: (id: string) => void;
  onAccount: (id: string) => void;
  isLiked: boolean;
  isBookmarked: boolean;
}

export function EventCard({
  event,
  onLike,
  onBookmark,
  onAccount,
  isLiked,
  isBookmarked,
}: EventCardProps) {
  const [reviewsExpanded, setReviewsExpanded] = useState(false);
  
  const averageRating =
    event.reviews.length > 0
      ? event.reviews.reduce((acc, review) => acc + review.rating, 0) /
        event.reviews.length
      : 0;

  return (
    <div className="relative w-full h-screen flex-shrink-0 snap-start snap-always flex items-center justify-center p-4">
      {/* Card Container */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative w-full max-w-md h-[calc(100vh-2rem)] bg-white rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* Image Section */}
        <div className="relative h-[50%] overflow-hidden">
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20" />
          
          {/* Badges on Image */}
          <div className="absolute top-4 left-4 flex gap-2">
            <Badge className="bg-[#FF8F00] hover:bg-[#FF8F00]/90 border-none">
              {event.category}
            </Badge>
            {event.isFree && (
              <Badge variant="outline" className="border-white text-white bg-black/30 backdrop-blur-sm">
                Free
              </Badge>
            )}
            {event.hasFreeFood && (
              <Badge variant="outline" className="border-white text-white bg-black/30 backdrop-blur-sm">
                🍕 Free Food
              </Badge>
            )}
          </div>

          {/* Action Buttons - Over the image */}
          <div className="absolute right-4 bottom-6 z-20">
            <ActionButtons
              eventId={event.id}
              onLike={onLike}
              onBookmark={onBookmark}
              onAccount={onAccount}
              isLiked={isLiked}
              isBookmarked={isBookmarked}
            />
          </div>
        </div>

        {/* Content Section */}
        <div className="h-[50%] overflow-y-auto p-6 pb-8 scrollbar-hide">
          {/* Title - Centered and Bold */}
          <h2 className="mb-4 text-gray-900 text-center font-bold">{event.title}</h2>

          {/* Date & Location - Centered */}
          <div className="flex flex-col gap-2 mb-4 text-gray-700 items-center">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#FF8F00]" />
              <span className="text-sm">
                {event.date} • {event.time}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#FF8F00]" />
              <span className="text-sm">{event.location}</span>
            </div>
          </div>

          {/* Description - Left Aligned */}
          <p className="text-sm mb-6 text-gray-600 leading-relaxed text-left">
            {event.description}
          </p>

          {/* Reviews Section - Collapsible */}
          {event.reviews.length > 0 && (
            <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
              <button
                onClick={() => setReviewsExpanded(!reviewsExpanded)}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 fill-[#FF8F00] text-[#FF8F00]" />
                  <span className="text-gray-900">
                    {averageRating.toFixed(1)} ({event.reviews.length}{" "}
                    {event.reviews.length === 1 ? "review" : "reviews"})
                  </span>
                </div>
                {reviewsExpanded ? (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </button>

              <AnimatePresence>
                {reviewsExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 space-y-3 border-t border-gray-200 pt-3">
                      {!event.hasOccurred && (
                        <p className="text-xs text-[#FF8F00] italic mb-2">
                          ⭐ Reviews from similar past events
                        </p>
                      )}
                      {event.reviews.slice(0, 2).map((review) => (
                        <div key={review.id} className="text-sm">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-gray-900">{review.author}</span>
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3 h-3 ${
                                    i < review.rating
                                      ? "fill-[#FF8F00] text-[#FF8F00]"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-gray-600">
                            {review.comment}
                          </p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}