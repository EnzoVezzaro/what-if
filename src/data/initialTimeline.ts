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
  alternativeScenarios: {
    'event-1': [
      {
        id: 'scenario-1-1',
        title: 'Assassination Attempt Fails',
        description: 'What if Gavrilo Princip had missed his shot or been caught before the assassination?',
        parentEventId: 'event-1',
        consequences: 'Without the assassination trigger, World War I might have been delayed or taken a different form. European tensions would have continued to simmer, possibly finding another flashpoint later.',
        imageUrl: 'https://images.pexels.com/photos/127585/pexels-photo-127585.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
      },
      {
        id: 'scenario-1-2',
        title: 'Diplomatic Resolution',
        description: 'What if Austria-Hungary had sought diplomatic solutions rather than issuing an ultimatum to Serbia?',
        parentEventId: 'event-1',
        consequences: 'A diplomatic approach might have prevented the cascade of alliance activations that led to World War I, potentially preserving the old European order for longer.',
        imageUrl: 'https://images.pexels.com/photos/4427876/pexels-photo-4427876.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
      }
    ],
    'event-2': [
      {
        id: 'scenario-2-1',
        title: 'Lenient Treaty Terms',
        description: 'What if the Treaty of Versailles had imposed less punitive measures on Germany?',
        parentEventId: 'event-2',
        consequences: 'With less economic hardship and national humiliation, Germany might not have turned to extremist leadership, potentially preventing the rise of Nazi Germany and World War II.',
        imageUrl: 'https://images.pexels.com/photos/6147369/pexels-photo-6147369.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
      },
      {
        id: 'scenario-2-2',
        title: 'Wilson\'s Fourteen Points Fully Implemented',
        description: 'What if President Wilson\'s vision for a just peace had been fully implemented?',
        parentEventId: 'event-2',
        consequences: 'A peace built on self-determination and international cooperation might have created a more stable interwar period and a stronger League of Nations, potentially preventing future conflicts.',
        imageUrl: 'https://images.pexels.com/photos/8550596/pexels-photo-8550596.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
      }
    ],
    'event-5': [
      {
        id: 'scenario-5-1',
        title: 'Demonstration Bombing',
        description: 'What if the U.S. had conducted a demonstration bombing in an unpopulated area to show Japan the power of the atomic bomb?',
        parentEventId: 'event-5',
        consequences: 'A demonstration might have convinced Japan to surrender without the massive civilian casualties, potentially changing post-war attitudes toward nuclear weapons and their use.',
        imageUrl: 'https://images.pexels.com/photos/76969/cold-front-warm-front-hurricane-felix-76969.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
      },
      {
        id: 'scenario-5-2',
        title: 'Conventional Invasion of Japan',
        description: 'What if the U.S. had proceeded with Operation Downfall, the planned conventional invasion of Japan?',
        parentEventId: 'event-5',
        consequences: 'A conventional invasion would likely have resulted in massive casualties on both sides, potentially extending the war into 1946 and changing the post-war occupation and reconstruction of Japan.',
        imageUrl: 'https://images.pexels.com/photos/163792/war-desert-guns-gunshow-163792.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
      }
    ],
    'event-6': [
      {
        id: 'scenario-6-1',
        title: 'U.S. Invasion of Cuba',
        description: 'What if President Kennedy had ordered a military invasion of Cuba during the Cuban Missile Crisis?',
        parentEventId: 'event-6',
        consequences: 'An invasion might have triggered a nuclear response from the Soviet Union, potentially escalating into a global nuclear war with catastrophic consequences.',
        imageUrl: 'https://images.pexels.com/photos/87772/nuclear-power-plant-cooling-tower-energy-87772.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
      },
      {
        id: 'scenario-6-2',
        title: 'Soviet Refusal to Withdraw',
        description: 'What if Khrushchev had refused to withdraw Soviet missiles from Cuba?',
        parentEventId: 'event-6',
        consequences: 'A continued Soviet presence in Cuba might have led to a prolonged standoff or military conflict, fundamentally altering Cold War dynamics and potentially leading to nuclear escalation.',
        imageUrl: 'https://images.pexels.com/photos/6499182/pexels-photo-6499182.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
      }
    ],
    'event-8': [
      {
        id: 'scenario-8-1',
        title: 'Soviet Military Intervention',
        description: 'What if Soviet leadership had ordered a military crackdown to prevent the fall of the Berlin Wall?',
        parentEventId: 'event-8',
        consequences: 'Military intervention might have preserved Communist rule in East Germany temporarily but could have led to widespread resistance, potentially triggering a new Cold War crisis.',
        imageUrl: 'https://images.pexels.com/photos/8549551/pexels-photo-8549551.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
      },
      {
        id: 'scenario-8-2',
        title: 'Gradual Controlled Opening',
        description: 'What if East Germany had implemented a gradual, controlled opening of the border?',
        parentEventId: 'event-8',
        consequences: 'A managed transition might have allowed East Germany to reform while maintaining some political control, potentially leading to a different model of German reunification.',
        imageUrl: 'https://images.pexels.com/photos/532826/pexels-photo-532826.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
      }
    ],
    'event-9': [
      {
        id: 'scenario-9-1',
        title: 'Attacks Prevented',
        description: 'What if U.S. intelligence had detected and prevented the 9/11 attacks?',
        parentEventId: 'event-9',
        consequences: 'Without 9/11, the U.S. might not have invaded Afghanistan or Iraq, potentially changing the course of Middle Eastern politics and global terrorism.',
        imageUrl: 'https://images.pexels.com/photos/356044/pexels-photo-356044.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
      },
      {
        id: 'scenario-9-2',
        title: 'Diplomatic Response',
        description: 'What if the U.S. had responded with international law enforcement rather than military action?',
        parentEventId: 'event-9',
        consequences: 'A law enforcement approach might have focused on capturing specific terrorists rather than regime change, potentially avoiding the long-term military conflicts in Afghanistan and Iraq.',
        imageUrl: 'https://images.pexels.com/photos/8089152/pexels-photo-8089152.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
      }
    ],
    'event-10': [
      {
        id: 'scenario-10-1',
        title: 'Early Global Coordination',
        description: 'What if there had been immediate, coordinated global action to contain COVID-19 in January 2020?',
        parentEventId: 'event-10',
        consequences: 'Early coordinated action might have contained the virus before it became a pandemic, saving millions of lives and preventing economic disruption.',
        imageUrl: 'https://images.pexels.com/photos/3951355/pexels-photo-3951355.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
      },
      {
        id: 'scenario-10-2',
        title: 'No Lockdown Approach',
        description: 'What if most countries had adopted a Sweden-like approach with minimal restrictions?',
        parentEventId: 'event-10',
        consequences: 'Without widespread lockdowns, the pandemic might have spread more quickly but with potentially less economic damage, creating different trade-offs between public health and economic activity.',
        imageUrl: 'https://images.pexels.com/photos/4429141/pexels-photo-4429141.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
      }
    ]
  }
};