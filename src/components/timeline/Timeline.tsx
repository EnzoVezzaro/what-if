import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Calendar } from 'lucide-react';
import { useTimelineStore } from '../../store/timelineStore';
import TimelineEvent from './TimelineEvent';
import { TimelineEvent as TimelineEventType, TimelineBranch } from '../../types';

const Timeline: React.FC = () => {
  const timelineData = useTimelineStore(state => state.timelineData);
  const visibleBranches = useTimelineStore(state => state.getVisibleBranches);
  const filter = useTimelineStore(state => state.filter);
  const zoomLevel = useTimelineStore(state => state.zoomLevel);
  const setZoomLevel = useTimelineStore(state => state.setZoomLevel);

  const timelineRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);

  // Timeline width constants
  const eventSpacing = {
    century: 200,
    decade: 400,
    year: 800,
    month: 1200,
  };

  // Apply filters to events
  const filterEvents = (events: TimelineEventType[]) => {
    return events.filter(event => {
      if (filter.category && event.category !== filter.category) return false;
      if (filter.region && event.region !== filter.region) return false;
      if (filter.startYear && event.year < filter.startYear) return false;
      if (filter.endYear && event.year > filter.endYear) return false;
      return true;
    });
  };

  // Get all events from visible branches, filtered
  const allVisibleBranches = visibleBranches();
  const visibleBranchesWithFilteredEvents = allVisibleBranches.map(branch => ({
    ...branch,
    events: filterEvents(branch.events)
  }));

  // Get all years from all visible events to calculate timeline scale
  const allYears = visibleBranchesWithFilteredEvents
    .flatMap(branch => branch.events)
    .map(event => event.year);

  const minYear = allYears.length > 0 ? Math.min(...allYears) : 1900;
  const maxYear = allYears.length > 0 ? Math.max(...allYears) : 2025;

  // Calculate timeline width based on year range and zoom level
  const calculateTimelineWidth = () => {
    const yearRange = maxYear - minYear;
    const spacing = eventSpacing[zoomLevel];
    return yearRange * spacing / 10;
  };

  const timelineWidth = calculateTimelineWidth();

  // Handle scrolling controls
  const handleScroll = (direction: 'left' | 'right') => {
    if (!timelineRef.current) return;

    const scrollAmount = timelineRef.current.clientWidth * 0.8;
    const newPosition = direction === 'left'
      ? scrollPosition - scrollAmount
      : scrollPosition + scrollAmount;

    timelineRef.current.scrollTo({
      left: newPosition,
      behavior: 'smooth'
    });
  };

  // Update scroll position when timeline scrolls
  useEffect(() => {
    const handleScrollEvent = () => {
      if (timelineRef.current) {
        setScrollPosition(timelineRef.current.scrollLeft);
      }
    };

    const timelineElement = timelineRef.current;
    if (timelineElement) {
      timelineElement.addEventListener('scroll', handleScrollEvent);
      return () => {
        timelineElement.removeEventListener('scroll', handleScrollEvent);
      };
    }
  }, []);

  // Handle zoom level changes
  const changeZoomLevel = (level: 'century' | 'decade' | 'year' | 'month') => {
    setZoomLevel(level);
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

    // Iterate through alternative branches
    timelineData.alternativeBranches.forEach((branch) => { // Removed unused branchIndex
      const branchPointEvent = findEventById(branch.branchPointEventId);
      const parentBranch = findBranchByEventId(branch.branchPointEventId);


      if (branchPointEvent && parentBranch) {
        // Calculate positions
        const branchPointX = calculateEventPosition(branchPointEvent.year);
        const branchPointY = getBranchVerticalPosition(
          parentBranch.id === timelineData.mainBranch.id
            ? 0 // Main branch is at index 0
            : timelineData.alternativeBranches.findIndex(b => b.id === parentBranch.id) + 1 // Find parent branch index
        );

        const newBranchStartX = calculateEventPosition(branch.events[0].year);
        const newBranchStartY = getBranchVerticalPosition(
          timelineData.alternativeBranches.findIndex(b => b.id === branch.id) + 1 // Find this branch's index
        );

        // Draw a line using SVG
        lines.push(
          <svg
            key={`line-${branch.id}`}
            className="absolute top-0 left-0 w-full h-full pointer-events-none"
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
    <div className="relative h-full flex flex-col">
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
          onClick={() => changeZoomLevel('century')}
          className={`p-2 rounded-l-full ${zoomLevel === 'century' ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'}`}
          aria-label="Century view"
        >
          <Calendar size={18} />
        </button>
        <button
          onClick={() => changeZoomLevel('decade')}
          className={`p-2 ${zoomLevel === 'decade' ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'}`}
          aria-label="Decade view"
        >
        <ZoomOut size={18} />
        </button>
        <button
          onClick={() => changeZoomLevel('year')}
          className={`p-2 ${zoomLevel === 'year' ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'}`}
          aria-label="Year view"
        >
          <ZoomIn size={18} />
        </button>
        <button
          onClick={() => changeZoomLevel('month')}
          className={`p-2 rounded-r-full ${zoomLevel === 'month' ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'}`}
          aria-label="Month view"
        >
          <ZoomIn size={20} />
        </button>
      </div>

      {/* Timeline content */}
      <div
        ref={timelineRef}
        className="flex-1 overflow-x-auto overflow-y-auto relative"
      >
        <div
          className="relative h-full"
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
                  className="absolute h-2 rounded-full"
                  style={{
                    backgroundColor: branch.color,
                    top: `${verticalPosition}px`,
                    left: '0',
                    right: '0',
                    opacity: 0.7
                  }}
                ></div>

                {/* Branch label */}
                <div
                  className="absolute font-medium text-sm"
                  style={{
                    top: `${verticalPosition - 20}px`,
                    left: '10px',
                    color: branch.color
                  }}
                >
                  {branch.name}
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

          {/* Time markers */}
          <div className="absolute bottom-4 w-full h-8">
            {renderTimeMarkers()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Timeline;
