import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TimelineData, TimelineBranch, TimelineEvent, TimelineFilter, TimelineZoomLevel, AlternativeScenario } from '../types';
import { initialTimelineData } from '../data/initialTimeline';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { z } from 'zod';
import { generateObject } from 'ai';

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
    scenario: AlternativeScenario
  ) => Promise<string>; // createNewBranch is now async
  updateFilter: (filter: Partial<TimelineFilter>) => void;
  setZoomLevel: (level: TimelineZoomLevel) => void;
  getSelectedBranch: () => TimelineBranch;
  getVisibleBranches: () => TimelineBranch[];
  getSelectedEvent: () => TimelineEvent | null;
  getBranchById: (branchId: string) => TimelineBranch | undefined;
  getEventById: (eventId: string) => TimelineEvent | null;
  getAlternativeScenariosForEvent: (eventId: string) => AlternativeScenario[];
  addAlternativeScenarios: (eventId: string, scenarios: AlternativeScenario[]) => void;
  updateAlternativeScenario: (eventId: string, scenarioId: string, updatedScenario: Partial<AlternativeScenario>) => void;
  deleteAlternativeScenario: (eventId: string, scenarioId: string) => void;

  resetTimeline: () => void;
}

// Apply filters to events
const filterEvents = (events: TimelineEvent[], filter: TimelineFilter) => {
  return events.filter(event => {
    if (filter.category && event.category !== filter.category) return false;
    if (filter.region && event.region !== filter.region) return false;
    if (filter.startYear && event.year < filter.startYear) return false;
    if (filter.endYear && event.year > filter.endYear) return false;
    return true;
  });
};

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

// Generate new events based on the scenario using AI
const generateNewEvents = async ( 
  branchPointEvent: TimelineEvent,
  scenario: AlternativeScenario
): Promise<TimelineEvent[]> => {
  const currentYear = new Date().getFullYear();
  const startYear = branchPointEvent.year;
  const yearDiff = currentYear - startYear;

  // Calculate how many events to generate (roughly one every 5-10 years)
  const numEvents = Math.floor(yearDiff / 7);
  if (numEvents <= 0) return [];

  const google = createGoogleGenerativeAI({
    apiKey: import.meta.env.VITE_GEMINI_API_KEY,
  });

  const eventSchema = z.object({
    title: z.string(),
    description: z.string(),
    date: z.string(), // ISO date string
    imageUrl: z.string().optional(),
    category: z.string(),
    region: z.string().optional(),
    year: z.number(),
  });

  const eventsSchema = z.array(eventSchema);

  const prompt = `Given the historical event "${branchPointEvent.title}" that occurred on ${branchPointEvent.date} in ${branchPointEvent.region || 'an unspecified region'} with the description "${branchPointEvent.description}", and an alternative scenario "${scenario.title}" with the consequences "${scenario.consequences}", generate ${numEvents} plausible follow-up historical events for a new timeline branch starting from the year ${branchPointEvent.year}.

The events should logically follow from the alternative scenario and cover a period from ${branchPointEvent.year + 1} to ${currentYear}.

Return the events as a JSON array, where each event has the following properties:
- id: string (generate a unique ID, e.g., 'generated-event-1')
- title: string
- description: string. Make them detailed and engaging descriptions for each event, with at least three paragraphs per description
- date: string (ISO date string, e.g., 'YYYY-MM-DD')
- imageUrl: string (a relevant image URL, can be a placeholder if a real one is hard to find)
- isBranchPoint: boolean (always false for these generated events)
- category: string (e.g., 'politics', 'war', 'technology', 'economics', 'culture', 'science')
- region: string (e.g., 'Europe', 'North America', 'Asia', 'Global', 'Middle East', 'Africa')
- year: number (the year of the event)

Example format:
[
  {
    "id": "generated-event-1",
    "title": "Alternative Event 1",
    "description": "Description of alternative event 1. Make them detailed and engaging descriptions for each event, with at least three paragraphs per description",
    "date": "YYYY-MM-DD",
    "imageUrl": "url1",
    "isBranchPoint": false,
    "category": "politics",
    "region": "Europe",
    "year": YYYY
  }
]`;

  try {
    const result = await generateObject({
      model: google('gemini-2.0-flash', {
        structuredOutputs: true,
      }),
      schema: eventsSchema,
      prompt: prompt,
    });

    const generatedEvents = result.object;

    // Add the branch point event based on the scenario at the beginning
    const newEvents: TimelineEvent[] = [{
      id: `alt-${branchPointEvent.id}`,
      title: scenario.title,
      description: scenario.description,
      date: branchPointEvent.date,
      year: branchPointEvent.year,
      imageUrl: scenario.imageUrl,
      isBranchPoint: false, // The scenario itself is not a branch point event in the new timeline
      category: branchPointEvent.category, // Inherit category/region from branch point event
      region: branchPointEvent.region
    }];

    // Add generated events with unique IDs and isBranchPoint: false
    generatedEvents.forEach((event, index) => {
      newEvents.push({
        ...event,
        id: `generated-${Date.now()}-${index}`, // Ensure unique ID
        isBranchPoint: false,
        // Ensure year is within the expected range
        year: Math.max(branchPointEvent.year + 1, Math.min(currentYear, event.year)),
        // Ensure date matches the year
        date: `${Math.max(branchPointEvent.year + 1, Math.min(currentYear, event.year))}-01-01`, // Use a default date if AI doesn't provide one or it's invalid
      });
    });

    return newEvents;

  } catch (error) {
    console.error('Error generating new events with AI:', error);
    return [];
    // Return only the branch point event if AI generation fails
    return [{
      id: `alt-${branchPointEvent.id}`,
      title: scenario.title,
      description: scenario.description,
      date: branchPointEvent.date,
      year: branchPointEvent.year,
      imageUrl: scenario.imageUrl,
      isBranchPoint: false,
      category: branchPointEvent.category,
      region: branchPointEvent.region
    }];
  }
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

      createNewBranch: async (name, description, parentBranchId, branchPointEventId, scenario) => {
        const parentBranch = get().getBranchById(parentBranchId);
        if (!parentBranch) {
          console.error("createNewBranch: Parent branch not found", parentBranchId);
          return '';
        }

        // Find the branch point event
        const branchPointEvent = parentBranch.events.find(
          event => event.id === branchPointEventId
        );

        // we need to save the new scenario to the current event id
        // if the event id is not in the alternative scenarios, add it
        console.log('here: ', branchPointEvent);

        if (!get().timelineData.alternativeScenarios[branchPointEventId]) {
          get().addAlternativeScenarios(branchPointEventId, [{
            id: scenario.id,
            parentEventId: branchPointEventId,
            consequences: description,
            title: name,
            description,
            imageUrl: 'T/D',
          }]);
        }

        if (!branchPointEvent) {
          console.error("createNewBranch: Branch point event not found", branchPointEventId);
          return '';
        }

        // Generate new events for this timeline branch using AI
        const newEvents = await generateNewEvents(branchPointEvent, scenario);

        const newBranchId = `branch-${Date.now()}`;
        const newBranch: TimelineBranch = {
          id: newBranchId,
          name,
          description,
          events: newEvents,
          parentBranchId,
          branchPointEventId,
          alternativeScenarioId: scenario.id,
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
        const { visibleBranchIds, timelineData, filter } = get();
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

      getAlternativeScenariosForEvent: (eventId: string) => {
        const { timelineData } = get();
        // console.log('getAlternativeScenariosForEvent: ', timelineData, eventId);

        return timelineData.alternativeScenarios[eventId] || [];
      },

      addAlternativeScenarios: (eventId: string, scenarios: AlternativeScenario[]) => {
        set((state) => ({
          timelineData: {
            ...state.timelineData,
            alternativeScenarios: {
              ...state.timelineData.alternativeScenarios,
              [eventId]: [
                ...(state.timelineData.alternativeScenarios[eventId] || []),
                ...scenarios,
              ],
            },
          },
        }));
      },

      updateAlternativeScenario: (eventId: string, scenarioId: string, updatedScenario: Partial<AlternativeScenario>) => {
        set((state) => ({
          timelineData: {
            ...state.timelineData,
            alternativeScenarios: {
              ...state.timelineData.alternativeScenarios,
              [eventId]: (state.timelineData.alternativeScenarios[eventId] || []).map(scenario =>
                scenario.id === scenarioId ? { ...scenario, ...updatedScenario } : scenario
              ),
            },
          },
        }));
      },

      deleteAlternativeScenario: (eventId: string, scenarioId: string) => {
        set((state) => ({
          timelineData: {
            ...state.timelineData,
            alternativeScenarios: {
              ...state.timelineData.alternativeScenarios,
              [eventId]: (state.timelineData.alternativeScenarios[eventId] || []).filter(scenario => scenario.id !== scenarioId),
            },
          },
        }));
      },

      resetTimeline: () => set({ timelineData: initialTimelineData }),
    }),
    {
      name: 'timeline-storage',
      // Optionally, add a version to your storage
      version: 1,
      // You can specify which parts of the state to store
      partialize: (state) => ({
        timelineData: state.timelineData,
        selectedBranchId: state.selectedBranchId,
        visibleBranchIds: state.visibleBranchIds,
      }),
    }
  )
);
