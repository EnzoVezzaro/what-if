import { TimelineData } from '../types';
import { initialTimelineEventsData } from './initialTimelineEventsData';

export const initialTimelineData: TimelineData = {
  mainBranch: {
    id: 'main-timeline',
    name: 'Historical Timeline',
    description: 'The timeline of events as they actually occurred in history.',
    events: initialTimelineEventsData.map(event => ({
      id: event.id,
      title: event.label,
      description: event.label,
      date: event.date,
      year: new Date(event.date).getFullYear(),
      imageUrl: event.image,
      isBranchPoint: true, // default true on initial data
      category: event.category,
      region: event.region
    })),
    branchPointEventId: '', // The main timeline doesn't branch from anything
    alternativeScenarioId: '', // The main timeline doesn't represent an alternative scenario
    color: '#172554', // Deep navy blue for the main timeline
  },
  alternativeBranches: [],
  alternativeScenarios: {}
};
