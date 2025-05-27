import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import { useTimelineStore, eras } from '../../store/timelineStore'; // Import eras
import TimelineEvent from './TimelineEvent';
import CreateEventModal from './CreateEventModal'; // Import the new modal
import { TimelineEvent as TimelineEventType, TimelineBranch, TimelineZoomLevel } from '../../types';

const Timeline: React.FC = () => {
  const { timelineData, filter, zoomLevel, visibleBranchIds, removeVisibleBranch, setZoomLevel, addEventToBranch } = useTimelineStore(state => ({
    timelineData: state.timelineData,
    filter: state.filter,
    zoomLevel: state.zoomLevel,
    visibleBranchIds: state.visibleBranchIds, // Get visibleBranchIds directly
    removeVisibleBranch: state.removeVisibleBranch,
    setZoomLevel: state.setZoomLevel,
    addEventToBranch: state.addEventToBranch, // Add this to useTimelineStore
  }));

  const [showCreateEventModal, setShowCreateEventModal] = useState(false);
  const [initialCreateEventDate, setInitialCreateEventDate] = useState('');
  const [selectedBranchForNewEvent, setSelectedBranchForNewEvent] = useState(''); // New state for clicked branch

  const timelineContainerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);


  useEffect(() => {
    const handleResize = () => {
      if (timelineContainerRef.current) { // Changed back to timelineContainerRef
        setContainerWidth(timelineContainerRef.current.clientWidth); // Changed back to timelineContainerRef
      }
    };

    const timelineContentElement = timelineContainerRef.current; // Changed to timelineRef

    const handleMouseDown = (e: MouseEvent) => {
      if (timelineContentElement) {
        setIsDragging(true);
        setStartX(e.pageX - timelineContentElement.offsetLeft);
        setScrollLeft(timelineContentElement.scrollLeft);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !timelineContentElement) return;
      e.preventDefault();
      const x = e.pageX - timelineContentElement.offsetLeft;
      const walk = (x - startX); // The distance the user has dragged

      requestAnimationFrame(() => {
        timelineContentElement.scrollLeft = scrollLeft - walk;
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (timelineContentElement) {
      handleResize(); // Set initial width
      window.addEventListener('resize', handleResize);
      timelineContentElement.addEventListener('mousedown', handleMouseDown);
      timelineContentElement.addEventListener('mousemove', handleMouseMove);
      timelineContentElement.addEventListener('mouseup', handleMouseUp);
      // Add mouseup listener to window to stop dragging if mouse is released outside the container
      window.addEventListener('mouseup', handleMouseUp);
    }


    return () => {
      if (timelineContentElement) {
        window.removeEventListener('resize', handleResize);
        timelineContentElement.removeEventListener('mousedown', handleMouseDown);
        timelineContentElement.removeEventListener('mousemove', handleMouseMove);
        timelineContentElement.removeEventListener('mouseup', handleMouseUp);
        window.removeEventListener('mouseup', handleMouseUp);
      }
    };
  }, [isDragging, startX, scrollLeft]);


  // Helper to apply filters to events (copied from timelineStore.ts for local use)
  const filterEvents = (events: TimelineEventType[], currentFilter: typeof filter) => {
    return events.filter(event => {
      if (currentFilter.categories && currentFilter.categories.length > 0 && !currentFilter.categories.includes(event.category)) return false;
      if (currentFilter.regions && currentFilter.regions.length > 0 && (!event.region || !currentFilter.regions.includes(event.region))) return false;

      // Handle multiple era selections
      if (currentFilter.selectedEras && currentFilter.selectedEras.length > 0) {
        const eventYear = event.year;
        const isWithinSelectedEra = currentFilter.selectedEras.some(selectedEraName => {
          const era = eras.find(e => e.name === selectedEraName); // Use imported eras
          return era && eventYear >= era.startYear && eventYear <= era.endYear;
        });
        if (!isWithinSelectedEra) return false;
      }

      if (currentFilter.startYear && event.year < currentFilter.startYear) return false;
      if (currentFilter.endYear && event.year > currentFilter.endYear) return false;

      return true;
    });
  };

  // Get all events from visible branches, filtered using useMemo
  const visibleBranchesWithFilteredEvents = useMemo(() => {
    const branches: TimelineBranch[] = [];

    // Check main branch
    if (visibleBranchIds.includes(timelineData.mainBranch.id)) {
      const filteredMainBranchEvents = filterEvents(timelineData.mainBranch.events, filter);
      if (filteredMainBranchEvents.length > 0) {
        branches.push({ ...timelineData.mainBranch, events: filteredMainBranchEvents });
      }
    }

    // Check alternative branches
    timelineData.alternativeBranches.forEach(branch => {
      if (visibleBranchIds.includes(branch.id)) {
        const filteredBranchEvents = filterEvents(branch.events, filter);
        if (filteredBranchEvents.length > 0) {
          branches.push({ ...branch, events: filteredBranchEvents });
        }
      }
    });
    return branches;
  }, [visibleBranchIds, timelineData, filter]); // Dependencies for memoization

  // Get all years from all visible events to calculate timeline scale
  const allYears = visibleBranchesWithFilteredEvents
    .flatMap(branch => branch.events)
    .map(event => event.year);

  const minYear = allYears.length > 0 ? Math.min(...allYears) : 1900;
  const maxYear = allYears.length > 0 ? Math.max(...allYears) : 2025;

  // Timeline width constants
  const eventSpacing = {
    century: 200,
    decade: 400,
    year: 800,
    month: 1200,
  };

  // Calculate required spacing for 'fit' zoom level
  const fitSpacing = useMemo(() => {
    const yearRange = maxYear - minYear;
    if (yearRange <= 0 || containerWidth <= 0) return 100; // Default spacing
    // Calculate spacing needed to fit the entire range within the container width
    // timelineWidth = yearRange * spacing / 10
    // containerWidth = yearRange * spacing / 10
    // spacing = (containerWidth * 10) / yearRange
    return (containerWidth * 10) / yearRange;
  }, [minYear, maxYear, containerWidth]);

  // Calculate timeline width based on year range and zoom level
  const calculateTimelineWidth = () => {
    const yearRange = maxYear - minYear;
    const spacing = zoomLevel === 'fit' ? fitSpacing : eventSpacing[zoomLevel];
    return yearRange * spacing / 10;
  };

  const timelineWidth = calculateTimelineWidth();


  // Handle scrolling controls
  const handleScroll = (direction: 'left' | 'right') => {
    if (!timelineContainerRef.current) return; // Changed to timelineRef

    const scrollAmount = timelineContainerRef.current.clientWidth * 0.8; // Changed to timelineRef
    const newPosition = direction === 'left'
      ? timelineContainerRef.current.scrollLeft - scrollAmount // Changed to timelineRef
      : timelineContainerRef.current.scrollLeft + scrollAmount; // Changed to timelineRef

    timelineContainerRef.current.scrollTo({ // Changed to timelineRef
      left: newPosition,
      behavior: 'smooth'
    });
  };

  // Update scroll position when timeline scrolls
  useEffect(() => {
    const handleScrollEvent = () => {
      if (timelineContainerRef.current) { // Changed to timelineRef
        // setScrollPosition(timelineRef.current.scrollLeft); // scrollPosition state is not used
      }
    };

    const timelineContentElement = timelineContainerRef.current; // Changed to timelineRef
    if (timelineContentElement) {
      timelineContentElement.addEventListener('scroll', handleScrollEvent);
      return () => {
        timelineContentElement.removeEventListener('scroll', handleScrollEvent);
      };
    }
  }, []);

  // Cycle through zoom levels
  const zoomLevels: TimelineZoomLevel[] = ['fit', 'century', 'decade', 'year', 'month'];

  const zoomIn = () => {
    const currentIndex = zoomLevels.indexOf(zoomLevel);
    if (currentIndex < zoomLevels.length - 1) {
      setZoomLevel(zoomLevels[currentIndex + 1]);
    }
  };

  const zoomOut = () => {
    const currentIndex = zoomLevels.indexOf(zoomLevel);
    if (currentIndex > 0) {
      setZoomLevel(zoomLevels[currentIndex - 1]);
    }
  };


  // Calculate position for an event based on its year and the timeline scale
  const calculateEventPosition = (year: number) => {
    const yearPosition = ((year - minYear) / (maxYear - minYear)) * timelineWidth;
    return yearPosition;
  };

  // Calculate vertical position for a branch (to stack them)
  const getBranchVerticalPosition = (branchIndex: number) => {
    return 40 + branchIndex * 120;
  };

  // Create time markers for the timeline
  const renderTimeMarkers = () => {
    const markers = [];
    let step = 1;

    switch (zoomLevel) {
      case 'century':
        step = 10;
        break;
      case 'decade':
        step = 5;
        break;
      case 'year':
        step = 1;
        break;
      case 'month':
        step = 1;
        break;
      case 'fit':
        step = Math.max(1, Math.floor((maxYear - minYear) / 10)); // Adjust step for 'fit' view
        break;
    }

    for (let year = minYear; year <= maxYear; year += step) {
      const position = calculateEventPosition(year);

      markers.push(
        <div
          key={`marker-${year}`}
          className="absolute bottom-0 flex flex-col items-center"
          style={{ left: `${position}px` }}
        >
          <div className="h-4 w-px bg-gray-300"></div>
          <div className="text-xs text-gray-500 mt-1">{year}</div>
        </div>
      );
    }

    return markers;
  };

  // Find an event by its ID across all branches
  const findEventById = (eventId: string): TimelineEventType | undefined => {
    // Check main branch
    const mainBranchEvent = timelineData.mainBranch.events.find(event => event.id === eventId);
    if (mainBranchEvent) return mainBranchEvent;

    // Check alternative branches
    for (const branch of timelineData.alternativeBranches) {
      const event = branch.events.find(event => event.id === eventId);
      if (event) return event;
    }

    return undefined;
  };

  // Find the branch containing a specific event
  const findBranchByEventId = (eventId: string): TimelineBranch | undefined => {
    if (timelineData.mainBranch.events.some(event => event.id === eventId)) {
      return timelineData.mainBranch;
    }
    return timelineData.alternativeBranches.find(branch =>
      branch.events.some(event => event.id === eventId)
    );
  };


  // Render connecting lines between branch points and new branches
  const renderConnectingLines = () => {
    const lines: JSX.Element[] = []; // Explicitly type lines
    const currentVisibleBranches = visibleBranchesWithFilteredEvents; // Use the memoized value

    // Iterate through visible branches (excluding the main branch as it doesn't branch from another)
    currentVisibleBranches.filter(branch => branch.id !== timelineData.mainBranch.id).forEach((branch) => {
      const branchPointEvent = findEventById(branch.branchPointEventId);
      const parentBranch = findBranchByEventId(branch.branchPointEventId);

      // Helper to check if an event passes the current filter
      const doesEventPassFilter = (event: TimelineEventType) => {
        if (filter.categories && filter.categories.length > 0 && !filter.categories.includes(event.category)) return false;
        if (filter.regions && filter.regions.length > 0 && (!event.region || !filter.regions.includes(event.region))) return false;
        if (filter.startYear && event.year < filter.startYear) return false;
        if (filter.endYear && event.year > filter.endYear) return false;
        return true;
      };

      if (branchPointEvent && parentBranch && branch && branch.events && branch.events.length > 0 && currentVisibleBranches.some(b => b.id === parentBranch.id) && doesEventPassFilter(branchPointEvent)) {
        // Calculate positions
        const branchPointX = calculateEventPosition(branchPointEvent.year);
        const branchPointY = getBranchVerticalPosition(
          parentBranch.id === timelineData.mainBranch.id
            ? 0 // Main branch is at index 0
            : currentVisibleBranches.findIndex(b => b.id === parentBranch.id) // Find parent branch index among visible branches
        );

        const newBranchStartX = calculateEventPosition(branch.events[0].year);
        const newBranchStartY = getBranchVerticalPosition(
          currentVisibleBranches.findIndex(b => b.id === branch.id) // Find this branch's index among visible branches
        );

        // Draw a line using SVG
        lines.push(
          <svg
            key={`line-${branch.id}`}
            className="absolute top-8 left-4 w-full h-full pointer-events-none"
            style={{ overflow: 'visible' }}
          >
            <line
              x1={branchPointX+10}
              y1={branchPointY}
              x2={newBranchStartX+10}
              y2={newBranchStartY-35}
              stroke={branch.color}
              strokeWidth="2"
              markerEnd="url(#arrowhead)"
            />
            {/* Define arrowhead marker */}
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="7"
                refX="0" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill={branch.color} />
              </marker>
            </defs>
          </svg>
        );
      }
    });

    return lines;
  };


  return (
    <div className="relative h-full flex flex-col ">
      {/* Timeline controls */}
      <div className="absolute top-4 left-4 z-10 flex space-x-2">
        <button
          onClick={() => handleScroll('left')}
          className="p-2 rounded-full bg-white shadow-md hover:bg-gray-100"
          aria-label="Scroll left"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={() => handleScroll('right')}
          className="p-2 rounded-full bg-white shadow-md hover:bg-gray-100"
          aria-label="Scroll right"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Zoom controls */}
      <div className="absolute top-4 right-4 z-10 flex items-center bg-white rounded-full shadow-md">
        <button
          onClick={zoomOut}
          className={`p-2 rounded-l-full ${zoomLevel === 'fit' ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'}`}
          aria-label="Zoom Out"
        >
          <ZoomOut size={18} />
        </button>
        <button
          onClick={zoomIn}
          className={`p-2 rounded-r-full ${zoomLevel === 'month' ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'}`}
          aria-label="Zoom In"
        >
          <ZoomIn size={20} />
        </button>
      </div>

      {/* Timeline content */}
      <div
        ref={timelineContainerRef}
        className="flex-1 relative flex flex-col overflow-x-auto pt-0"
        onDoubleClick={zoomIn}
      >
        <div
          ref={timelineRef}
          className="relative flex-1 overflow-x-hidden overflow-y-auto p-4 pt-8"
          style={{ width: `${timelineWidth}px`, minHeight: '400px' }}
        >
          {/* Render connecting lines */}
          {renderConnectingLines()}

          {/* Timeline branches and events */}
          {visibleBranchesWithFilteredEvents.map((branch, branchIndex) => {
            const verticalPosition = getBranchVerticalPosition(branchIndex);

            return (
              <div key={branch.id} className="absolute w-full">
                {/* Branch line */}
                <div
                  className="absolute h-2 rounded-full timeline-branch cursor-pointer" // Added cursor-pointer
                  style={{
                    backgroundColor: branch.color,
                    top: `${verticalPosition}px`,
                    left: '0',
                    right: '0',
                    opacity: 0.7
                  }}
                  onClick={(e) => {
                    // Calculate the x position relative to the timeline content
                    const timelineContentElement = timelineRef.current;
                    if (!timelineContentElement) return;

                    const clickX = e.clientX - timelineContentElement.getBoundingClientRect().left;

                    // Calculate the year based on the click position
                    const yearRange = maxYear - minYear;
                    const yearAtClick = minYear + (clickX / timelineWidth) * yearRange;

                    // Create a date string from the calculated year
                    const date = new Date(Math.round(yearAtClick), 0, 1).toISOString().split('T')[0]; // YYYY-MM-DD format

                    setInitialCreateEventDate(date);
                    setSelectedBranchForNewEvent(branch.id); // Set the clicked branch ID
                    setShowCreateEventModal(true);
                  }}
                ></div>

                {/* Branch label and hide button */}
                <div
                  className="absolute font-medium text-sm flex items-center space-x-2"
                  style={{
                    top: `${verticalPosition - 20}px`,
                    left: '10px',
                    color: branch.color
                  }}
                >
                  <span>{branch.name}</span>
                  {branch.id !== timelineData.mainBranch.id && ( // Don't show hide button for main branch
                    <button
                      onClick={() => removeVisibleBranch(branch.id)}
                      className="text-gray-500 hover:text-gray-700 text-xs"
                      aria-label={`Hide branch ${branch.name}`}
                    >
                      Hide
                    </button>
                  )}
                </div>

                {/* Branch events */}
                {branch.events.map(event => {
                  const position = calculateEventPosition(event.year);

                  return (
                    <TimelineEvent
                      key={`${branch.id}-${event.id}`}
                      event={event}
                      position={position}
                      verticalPosition={verticalPosition}
                      branchColor={branch.color}
                      branchId={branch.id}
                    />
                  );
                })}
              </div>
            );
          })}

        </div>
        {/* Time markers */}
        <div className="w-full h-8 bg-white z-10 border-t border-gray-200 flex-shrink-0"> {/* Removed absolute positioning, added flex-shrink-0 */}
          {renderTimeMarkers()}
        </div>
      </div>

      {showCreateEventModal && (
        <CreateEventModal
          initialDate={initialCreateEventDate}
          branchId={selectedBranchForNewEvent} // Pass the selected branch ID
          onClose={() => setShowCreateEventModal(false)}
          onCreateEvent={(newEvent) => {
            addEventToBranch(selectedBranchForNewEvent, newEvent); // Use the selected branch ID
          }}
        />
      )}
    </div>
  );
};

export default Timeline;
