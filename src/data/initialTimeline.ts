import { TimelineData } from '../types';

export const initialTimelineData: TimelineData = {
  mainBranch: {
    id: 'main-timeline',
    name: 'Historical Timeline',
    description: 'The timeline of events as they actually occurred in history.',
    events: [
      {
        id: 'event-1',
        title: 'Assassination of Archduke Franz Ferdinand',
        description: 'Archduke Franz Ferdinand of Austria and his wife Sophie are assassinated by Serbian nationalist Gavrilo Princip in Sarajevo, triggering a chain of events that led to World War I.',
        date: '1914-06-28',
        year: 1914,
        imageUrl: 'https://images.pexels.com/photos/673862/pexels-photo-673862.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        isBranchPoint: true,
        category: 'war',
        region: 'Europe'
      },
      {
        id: 'event-2',
        title: 'Treaty of Versailles',
        description: 'The Treaty of Versailles is signed in Paris, officially ending World War I and imposing harsh penalties on Germany, which many historians believe contributed to the rise of Nazi Germany and World War II.',
        date: '1919-06-28',
        year: 1919,
        imageUrl: 'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        isBranchPoint: true,
        category: 'politics',
        region: 'Europe'
      },
      {
        id: 'event-3',
        title: 'Stock Market Crash of 1929',
        description: 'The U.S. stock market crashes, marking the beginning of the Great Depression, the worst economic downturn in the history of the industrialized world.',
        date: '1929-10-29',
        year: 1929,
        imageUrl: 'https://images.pexels.com/photos/186461/pexels-photo-186461.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        isBranchPoint: true,
        category: 'economics',
        region: 'North America'
      },
      {
        id: 'event-4',
        title: 'Pearl Harbor Attack',
        description: 'Japan launches a surprise attack on the U.S. naval base at Pearl Harbor, Hawaii, drawing the United States into World War II.',
        date: '1941-12-07',
        year: 1941,
        imageUrl: 'https://images.pexels.com/photos/15975480/pexels-photo-15975480/free-photo-of-american-cemetery-in-normandy.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        isBranchPoint: true,
        category: 'war',
        region: 'North America'
      },
      {
        id: 'event-5',
        title: 'Atomic Bombings of Hiroshima and Nagasaki',
        description: 'The United States drops atomic bombs on the Japanese cities of Hiroshima and Nagasaki, leading to Japan\'s surrender and the end of World War II.',
        date: '1945-08-06',
        year: 1945,
        imageUrl: 'https://images.pexels.com/photos/5460396/pexels-photo-5460396.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        isBranchPoint: true,
        category: 'war',
        region: 'Asia'
      },
      {
        id: 'event-6',
        title: 'Cuban Missile Crisis',
        description: 'A 13-day confrontation between the United States and the Soviet Union concerning Soviet ballistic missile deployment in Cuba, considered the closest the Cold War came to escalating into a full-scale nuclear war.',
        date: '1962-10-16',
        year: 1962,
        imageUrl: 'https://images.pexels.com/photos/56832/road-asphalt-space-sky-56832.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        isBranchPoint: true,
        category: 'politics',
        region: 'North America'
      },
      {
        id: 'event-7',
        title: 'Moon Landing',
        description: 'Neil Armstrong and Edwin "Buzz" Aldrin become the first humans to land on the Moon during NASA\'s Apollo 11 mission.',
        date: '1969-07-20',
        year: 1969,
        imageUrl: 'https://images.pexels.com/photos/47367/full-moon-moon-bright-sky-47367.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        isBranchPoint: false,
        category: 'technology',
        region: 'Global'
      },
      {
        id: 'event-8',
        title: 'Fall of the Berlin Wall',
        description: 'The Berlin Wall falls, symbolizing the beginning of the end of the Cold War and the reunification of Germany.',
        date: '1989-11-09',
        year: 1989,
        imageUrl: 'https://images.pexels.com/photos/109629/pexels-photo-109629.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        isBranchPoint: true,
        category: 'politics',
        region: 'Europe'
      },
      {
        id: 'event-9',
        title: 'September 11 Attacks',
        description: 'Terrorists hijack four commercial airplanes and crash them into the World Trade Center, the Pentagon, and a field in Pennsylvania, resulting in nearly 3,000 deaths and triggering the U.S. War on Terror.',
        date: '2001-09-11',
        year: 2001,
        imageUrl: 'https://images.pexels.com/photos/144343/pexels-photo-144343.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        isBranchPoint: true,
        category: 'war',
        region: 'North America'
      },
      {
        id: 'event-10',
        title: 'COVID-19 Pandemic',
        description: 'A global pandemic of the coronavirus disease (COVID-19) begins, leading to widespread lockdowns, economic disruption, and millions of deaths worldwide.',
        date: '2020-03-11',
        year: 2020,
        imageUrl: 'https://images.pexels.com/photos/3951628/pexels-photo-3951628.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        isBranchPoint: true,
        category: 'health',
        region: 'Global'
      }
    ],
    branchPointEventId: '', // The main timeline doesn't branch from anything
    alternativeScenarioId: '', // The main timeline doesn't represent an alternative scenario
    color: '#172554', // Deep navy blue for the main timeline
  },
  alternativeBranches: [],
  alternativeScenarios: {}
};