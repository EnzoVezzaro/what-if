import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Tag, Calendar, ArrowRight } from 'lucide-react';
import { TimelineEvent, AlternativeScenario } from '../../types';
import { useTimelineStore } from '../../store/timelineStore';
import ScenarioCard from './ScenarioCard';

interface EventModalProps {
  event: TimelineEvent;
  branchId: string;
  onClose: () => void;
}

const EventModal: React.FC<EventModalProps> = ({ event, branchId, onClose }) => {
  const [view, setView] = useState<'details' | 'scenarios'>(event.isBranchPoint ? 'details' : 'details');
  const alternativeScenarios = useTimelineStore(state => state.getAlternativeScenariosForEvent(event.id));
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
          className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal header with image */}
          <div className="relative h-64">
            {event.imageUrl ? (
              <img
                src={event.imageUrl}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400">No image available</span>
              </div>
            )}
            
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-black bg-opacity-40 text-white hover:bg-opacity-60 transition-colors"
            >
              <X size={20} />
            </button>
            
            {/* Event title overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4 text-white">
              <h2 className="text-2xl font-bold">{event.title}</h2>
              <div className="flex items-center space-x-4 mt-1">
                <div className="flex items-center space-x-1 text-sm">
                  <Calendar size={14} />
                  <span>{formatDate(event.date)}</span>
                </div>
                {event.region && (
                  <div className="flex items-center space-x-1 text-sm">
                    <MapPin size={14} />
                    <span>{event.region}</span>
                  </div>
                )}
                <div className="flex items-center space-x-1 text-sm">
                  <Tag size={14} />
                  <span className="capitalize">{event.category}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Modal tabs (if event is a branch point) */}
          {event.isBranchPoint && (
            <div className="flex border-b">
              <button
                onClick={() => setView('details')}
                className={`flex-1 py-3 font-medium text-center ${
                  view === 'details' 
                    ? 'text-blue-700 border-b-2 border-blue-700' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Historical Details
              </button>
              <button
                onClick={() => setView('scenarios')}
                className={`flex-1 py-3 font-medium text-center ${
                  view === 'scenarios' 
                    ? 'text-blue-700 border-b-2 border-blue-700' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                "What If" Scenarios
              </button>
            </div>
          )}
          
          {/* Modal content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-400px)]">
            {view === 'details' ? (
              <div>
                <p className="text-gray-700 leading-relaxed">{event.description}</p>
                
                {event.isBranchPoint && (
                  <button
                    onClick={() => setView('scenarios')}
                    className="mt-6 flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <span>Explore Alternative Scenarios</span>
                    <ArrowRight size={16} />
                  </button>
                )}
              </div>
            ) : (
              <div>
                <p className="text-gray-600 mb-6">
                  Select an alternative scenario to explore a different timeline branching from this event.
                </p>
                
                <div className="space-y-4">
                  {alternativeScenarios.map(scenario => (
                    <ScenarioCard
                      key={scenario.id}
                      scenario={scenario}
                      event={event}
                      branchId={branchId}
                      onClose={onClose}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EventModal;