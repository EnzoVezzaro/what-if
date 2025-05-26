import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { TimelineEvent as TimelineEventType } from '../../types';
import { useTimelineStore } from '../../store/timelineStore';
import EventModal from './EventModal';

interface TimelineEventProps {
  event: TimelineEventType;
  position: number;
  verticalPosition: number;
  branchColor: string;
  branchId: string;
}

const TimelineEvent: React.FC<TimelineEventProps> = ({
  event,
  position,
  verticalPosition,
  branchColor,
  branchId
}) => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const selectedEventId = useTimelineStore(state => state.selectedEventId);
  const setSelectedEvent = useTimelineStore(state => state.setSelectedEvent);
  
  const handleEventClick = () => {
    setSelectedEvent(event.id);
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
  };
  
  return (
    <>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="absolute cursor-pointer group"
        style={{ 
          left: `${position}px`,
          top: `${verticalPosition - 8}px`,
        }}
        onClick={handleEventClick}
      >
        {/* Event marker */}
        <motion.div
          whileHover={{ scale: 1.2 }}
          className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
          style={{ 
            backgroundColor: event.isBranchPoint ? 'white' : branchColor,
            borderColor: branchColor
          }}
        >
          {event.isBranchPoint && (
            <ArrowRight size={10} style={{ color: branchColor }} />
          )}
        </motion.div>
        
        {/* Event title tooltip */}
        <div
          className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-40 p-2 bg-white rounded shadow-lg text-xs text-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10"
        >
          <div className="font-medium">{event.title}</div>
          <div className="text-gray-500">{new Date(event.date).getFullYear()}</div>
        </div>
      </motion.div>
      
      {isModalOpen && (
        <EventModal
          event={event}
          branchId={branchId}
          onClose={closeModal}
        />
      )}
    </>
  );
};

export default TimelineEvent;