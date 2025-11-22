import { motion, AnimatePresence } from "motion/react";
import { Filter, Calendar, Clock, CalendarDays } from "lucide-react";
import { useState } from "react";

interface FilterMenuProps {
  selectedFilter: string;
  onFilterChange: (filter: string) => void;
}

export function FilterMenu({ selectedFilter, onFilterChange }: FilterMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const filters = [
    { id: "all", label: "All Events", icon: Calendar },
    { id: "today", label: "Today", icon: Clock },
    { id: "week", label: "This Week", icon: CalendarDays },
    { id: "month", label: "Next Month", icon: Calendar },
  ];

  const handleFilterSelect = (filterId: string) => {
    onFilterChange(filterId);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Filter Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg p-4 flex items-center gap-2 hover:bg-white transition-colors"
        whileTap={{ scale: 0.95 }}
      >
        <Filter className="w-5 h-5 text-[#FF8F00]" />
        <span className="text-gray-900 text-sm">
          {filters.find(f => f.id === selectedFilter)?.label || "Filter"}
        </span>
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full mt-2 left-0 bg-white rounded-2xl shadow-xl overflow-hidden min-w-[180px] z-40"
          >
            {filters.map((filter) => {
              const Icon = filter.icon;
              return (
                <button
                  key={filter.id}
                  onClick={() => handleFilterSelect(filter.id)}
                  className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-orange-50 transition-colors ${
                    selectedFilter === filter.id ? "bg-orange-50" : ""
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${
                      selectedFilter === filter.id
                        ? "text-[#FF8F00]"
                        : "text-gray-500"
                    }`}
                  />
                  <span
                    className={`text-sm ${
                      selectedFilter === filter.id
                        ? "text-[#FF8F00]"
                        : "text-gray-700"
                    }`}
                  >
                    {filter.label}
                  </span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
