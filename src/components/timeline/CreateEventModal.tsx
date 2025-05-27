import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { TimelineEvent } from '../../types';
import { useTimelineStore } from '../../store/timelineStore'; // Re-import useTimelineStore

interface CreateEventModalProps {
  initialDate: string;
  branchId: string; // Add branchId to props
  onClose: () => void;
  onCreateEvent: (newEvent: TimelineEvent) => void;
}

const CreateEventModal: React.FC<CreateEventModalProps> = ({ initialDate, onClose, onCreateEvent }) => {
  const timelineData = useTimelineStore(state => state.timelineData); // Access timelineData

  const [newEvent, setNewEvent] = useState<Partial<TimelineEvent>>({
    title: '',
    description: '',
    date: initialDate,
    imageUrl: '',
    isBranchPoint: false,
    category: '',
    region: '',
    year: new Date(initialDate).getFullYear(),
    outcomes: [],
  });

  // Get unique categories and regions from all events in the timeline data
  const allEvents = useMemo(() => [
    ...timelineData.mainBranch.events,
    ...timelineData.alternativeBranches.flatMap(branch => branch.events)
  ], [timelineData]);

  const categories = useMemo(() => Array.from(new Set(allEvents.map(event => event.category))).sort(), [allEvents]);
  const regions = useMemo(() => Array.from(new Set(allEvents.map(event => event.region).filter(Boolean))).sort(), [allEvents]);

  useEffect(() => {
    setNewEvent(prev => ({
      ...prev,
      date: initialDate,
      year: new Date(initialDate).getFullYear(),
    }));
  }, [initialDate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setNewEvent(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else if (name === 'date') {
      setNewEvent(prev => ({ ...prev, date: value, year: new Date(value).getFullYear() }));
    } else {
      setNewEvent(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleOutcomesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewEvent(prev => ({ ...prev, outcomes: e.target.value.split(',').map(s => s.trim()).filter(s => s !== '') }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newEvent.title && newEvent.description && newEvent.date && newEvent.category) {
      const eventToCreate: TimelineEvent = {
        ...newEvent,
        id: `event-${Date.now()}`, // Simple unique ID generation
        year: new Date(newEvent.date!).getFullYear(),
        isBranchPoint: newEvent.isBranchPoint || false,
        category: newEvent.category,
        title: newEvent.title,
        description: newEvent.description,
        date: newEvent.date,
        outcomes: newEvent.outcomes || [],
      } as TimelineEvent; // Type assertion to satisfy TimelineEvent
      onCreateEvent(eventToCreate);
      onClose();
    } else {
      alert('Please fill in all required fields: Title, Description, Date, and Category.');
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 25 }}
          className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative flex flex-col p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 transition-colors"
          >
            <X size={20} />
          </button>

          <h2 className="text-2xl font-bold mb-6 text-gray-800">Create New Event</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={newEvent.title}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={newEvent.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              ></textarea>
            </div>

            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={newEvent.date}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">
                Image URL
              </label>
              <input
                type="url"
                id="imageUrl"
                name="imageUrl"
                value={newEvent.imageUrl}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isBranchPoint"
                name="isBranchPoint"
                checked={newEvent.isBranchPoint}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isBranchPoint" className="ml-2 block text-sm text-gray-900">
                Is Branch Point?
              </label>
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                name="category"
                value={newEvent.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select a category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-1">
                Region
              </label>
              <select
                id="region"
                name="region"
                value={newEvent.region}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a region</option>
                {regions.map(reg => (
                  <option key={reg} value={reg}>{reg}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="outcomes" className="block text-sm font-medium text-gray-700 mb-1">
                Outcomes (comma-separated)
              </label>
              <textarea
                id="outcomes"
                name="outcomes"
                value={newEvent.outcomes?.join(', ') || ''}
                onChange={handleOutcomesChange}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Create Event
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CreateEventModal;
