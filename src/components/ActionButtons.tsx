import { Heart, Bookmark, User } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

interface ActionButtonsProps {
  eventId: string;
  onLike: (id: string) => void;
  onBookmark: (id: string) => void;
  onAccount: (id: string) => void;
  isLiked: boolean;
  isBookmarked: boolean;
}

export function ActionButtons({
  eventId,
  onLike,
  onBookmark,
  onAccount,
  isLiked,
  isBookmarked,
}: ActionButtonsProps) {
  const [showLikeAnimation, setShowLikeAnimation] = useState(false);
  const [showBookmarkAnimation, setShowBookmarkAnimation] = useState(false);

  const handleLike = () => {
    onLike(eventId);
    setShowLikeAnimation(true);
    setTimeout(() => setShowLikeAnimation(false), 600);
  };

  const handleBookmark = () => {
    onBookmark(eventId);
    setShowBookmarkAnimation(true);
    setTimeout(() => setShowBookmarkAnimation(false), 600);
  };

  return (
    <div className="flex flex-col gap-4">
      <motion.button
        onClick={handleLike}
        className="relative flex items-center justify-center w-14 h-14 rounded-full bg-white/90 backdrop-blur-sm shadow-lg hover:bg-white transition-colors"
        whileTap={{ scale: 0.9 }}
      >
        <Heart
          className={`w-6 h-6 transition-all ${
            isLiked ? "fill-[#FF8F00] text-[#FF8F00]" : "text-gray-700"
          }`}
        />
        {showLikeAnimation && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-[#FF8F00]"
            initial={{ scale: 1, opacity: 1 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 0.6 }}
          />
        )}
      </motion.button>

      <motion.button
        onClick={handleBookmark}
        className="relative flex items-center justify-center w-14 h-14 rounded-full bg-white/90 backdrop-blur-sm shadow-lg hover:bg-white transition-colors"
        whileTap={{ scale: 0.9 }}
      >
        <Bookmark
          className={`w-6 h-6 transition-all ${
            isBookmarked ? "fill-[#FF8F00] text-[#FF8F00]" : "text-gray-700"
          }`}
        />
        {showBookmarkAnimation && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-[#FF8F00]"
            initial={{ scale: 1, opacity: 1 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 0.6 }}
          />
        )}
      </motion.button>

      <motion.button
        onClick={() => onAccount(eventId)}
        className="flex items-center justify-center w-14 h-14 rounded-full bg-white/90 backdrop-blur-sm shadow-lg hover:bg-white transition-colors"
        whileTap={{ scale: 0.9 }}
      >
        <User className="w-6 h-6 text-gray-700" />
      </motion.button>
    </div>
  );
}
