import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TimelineData, TimelineBranch, TimelineEvent, TimelineFilter, TimelineZoomLevel, AlternativeScenario } from '../types';
import { initialTimelineData } from '../data/initialTimeline';

interface TimelineState {
  // Data
  timelineData: TimelineData;
  selectedBranchId: string;
  selectedEventId: string | null;
  visibleBranchIds: string[];
  
  // UI state
  filter: TimelineFilter;
  zoomLevel: TimelineZoomLevel;
  
  // Actions
  setSelectedBranch: (branchId: string) => void;
  setSelectedEvent: (eventId: string | null) => void;
  addVisibleBranch: (branchId: string) => void;
  removeVisibleBranch: (branchId: string) => void;
  createNewBranch: (
    name: string, 
    description: string, 
    parentBranchId: string, 
    branchPointEventId: string, 
    alternativeScenarioId: string
  ) => string;
  updateFilter: (filter: Partial<TimelineFilter>) => void;
  setZoomLevel: (level: TimelineZoomLevel) => void;
  getSelectedBranch: () => TimelineBranch;
  getVisibleBranches: () => TimelineBranch[];
  getSelectedEvent: () => TimelineEvent | null;
  getBranchById: (branchId: string) => TimelineBranch | undefined;
  getEventById: (eventId: string) => TimelineEvent | null;
  getAlternativeScenariosForEvent: (eventId: string) => AlternativeScenario[];
  resetTimeline: () => void;
}

// Generate a random color for new branches
const generateRandomColor = () => {
  const colors = [
    '#2563eb', // blue
    '#9333ea', // purple
    '#db2777', // pink
    '#d97706', // amber
    '#16a34a', // green
    '#0891b2', // cyan
    '#ef4444', // red
    '#84cc16', // lime
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

// Generate new events based on the scenario
const generateNewEvents = (
  branchPointEvent: TimelineEvent,
  scenario: AlternativeScenario
): TimelineEvent[] => {
  const currentYear = new Date().getFullYear();
  const startYear = branchPointEvent.year;
  const yearDiff = currentYear - startYear;
  
  // Calculate how many events to generate (roughly one every 5-10 years)
  const numEvents = Math.floor(yearDiff / 7);
  const newEvents: TimelineEvent[] = [];
  
  // Categories for generated events
  const categories = ['politics', 'war', 'technology', 'economics', 'culture', 'science'];
  const regions = ['Europe', 'North America', 'Asia', 'Global', 'Middle East', 'Africa'];
  
  // Add the branch point event based on the scenario
  newEvents.push({
    id: `alt-${branchPointEvent.id}`,
    title: scenario.title,
    description: scenario.description,
    date: branchPointEvent.date,
    year: branchPointEvent.year,
    imageUrl: scenario.imageUrl,
    isBranchPoint: false,
    category: branchPointEvent.category,
    region: branchPointEvent.region
  });
  
  // Generate follow-up events
  for (let i = 1; i <= numEvents; i++) {
    const year = startYear + Math.floor((yearDiff * i) / numEvents);
    const category = categories[Math.floor(Math.random() * categories.length)];
    const region = regions[Math.floor(Math.random() * regions.length)];
    
    const newEvent: TimelineEvent = {
      id: `generated-${Date.now()}-${i}`,
      title: `Alternative ${category.charAt(0).toUpperCase() + category.slice(1)} Development`,
      description: `In this alternate timeline, the ${category} landscape evolved differently due to ${scenario.title.toLowerCase()}.`,
      date: `${year}-01-01`,
      year,
      isBranchPoint: false,
      category,
      region,
      imageUrl: `https://images.pexels.com/photos/${Math.floor(Math.random() * 1000000)}/pexels-photo.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2`
    };
    
    newEvents.push(newEvent);
  }
  
  return newEvents;
};

export const useTimelineStore = create<TimelineState>()(
  persist(
    (set, get) => ({
      timelineData: initialTimelineData,
      selectedBranchId: initialTimelineData.mainBranch.id,
      selectedEventId: null,
      visibleBranchIds: [initialTimelineData.mainBranch.id],
      filter: {},
      zoomLevel: 'decade',
      
      setSelectedBranch: (branchId) => set({ selectedBranchId: branchId }),
      
      setSelectedEvent: (eventId) => set({ selectedEventId: eventId }),
      
      addVisibleBranch: (branchId) => set((state) => ({
        visibleBranchIds: [...state.visibleBranchIds, branchId]
      })),
      
      removeVisibleBranch: (branchId) => set((state) => ({
        visibleBranchIds: state.visibleBranchIds.filter(id => id !== branchId)
      })),
      
      createNewBranch: (name, description, parentBranchId, branchPointEventId, alternativeScenarioId) => {
        const parentBranch = get().getBranchById(parentBranchId);
        if (!parentBranch) return '';
        
        // Find the branch point event
        const branchPointEvent = parentBranch.events.find(
          event => event.id === branchPointEventId
        );
        
        if (!branchPointEvent) return '';
        
        // Get the selected scenario
        const scenario = get().timelineData.alternativeScenarios[branchPointEventId]?.find(
          s => s.id === alternativeScenarioId
        );
        
        if (!scenario) return '';
        
        // Generate new events for this timeline branch
        const newEvents = generateNewEvents(branchPointEvent, scenario);
        
        const newBranchId = `branch-${Date.now()}`;
        const newBranch: TimelineBranch = {
          id: newBranchId,
          name,
          description,
          events: newEvents,
          parentBranchId,
          branchPointEventId,
          alternativeScenarioId,
          color: generateRandomColor(),
        };
        
        set((state) => ({
          timelineData: {
            ...state.timelineData,
            alternativeBranches: [...state.timelineData.alternativeBranches, newBranch]
          },
          selectedBranchId: newBranchId,
          visibleBranchIds: [...state.visibleBranchIds, newBranchId]
        }));
        
        return newBranchId;
      },
      
      updateFilter: (filter) => set((state) => ({
        filter: { ...state.filter, ...filter }
      })),
      
      setZoomLevel: (level) => set({ zoomLevel: level }),
      
      getSelectedBranch: () => {
        const { selectedBranchId, timelineData } = get();
        
        if (selectedBranchId === timelineData.mainBranch.id) {
          return timelineData.mainBranch;
        }
        
        const branch = timelineData.alternativeBranches.find(
          branch => branch.id === selectedBranchId
        );
        
        return branch || timelineData.mainBranch;
      },
      
      getVisibleBranches: () => {
        const { visibleBranchIds, timelineData } = get();
        const branches: TimelineBranch[] = [];
        
        if (visibleBranchIds.includes(timelineData.mainBranch.id)) {
          branches.push(timelineData.mainBranch);
        }
        
        timelineData.alternativeBranches.forEach(branch => {
          if (visibleBranchIds.includes(branch.id)) {
            branches.push(branch);
          }
        });
        
        return branches;
      },
      
      getSelectedEvent: () => {
        const { selectedEventId } = get();
        if (!selectedEventId) return null;
        
        return get().getEventById(selectedEventId);
      },
      
      getBranchById: (branchId) => {
        const { timelineData } = get();
        
        if (branchId === timelineData.mainBranch.id) {
          return timelineData.mainBranch;
        }
        
        return timelineData.alternativeBranches.find(branch => branch.id === branchId);
      },
      
      getEventById: (eventId) => {
        const { timelineData } = get();
        
        // Check main branch
        const mainBranchEvent = timelineData.mainBranch.events.find(
          event => event.id === eventId
        );
        if (mainBranchEvent) return mainBranchEvent;
        
        // Check alternative branches
        for (const branch of timelineData.alternativeBranches) {
          const event = branch.events.find(event => event.id === eventId);
          if (event) return event;
        }
        
        return null;
      },
      
      getAlternativeScenariosForEvent: (eventId) => {
        const { timelineData } = get();
        return timelineData.alternativeScenarios[eventId] || [];
      },
      
      resetTimeline: () => set({
        timelineData: initialTimelineData,
        selectedBranchId: initialTimelineData.mainBranch.id,
        selectedEventId: null,
        visibleBranchIds: [initialTimelineData.mainBranch.id],
        filter: {},
        zoomLevel: 'decade',
      }),
    }),
    {
      name: 'timeline-storage',
    }
  )
);