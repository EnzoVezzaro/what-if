import React from 'react';
import { FolderTree, Clock, Map, Filter } from 'lucide-react';
import { useTimelineStore } from '../../store/timelineStore';
import TimelineTree from '../timeline/TimelineTree';

interface SidebarProps {
  isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const [activeTab, setActiveTab] = React.useState<'tree' | 'filter'>('tree');
  const timelineData = useTimelineStore(state => state.timelineData);
  const filter = useTimelineStore(state => state.filter);
  const updateFilter = useTimelineStore(state => state.updateFilter);
  
  // Get unique categories, regions, and eras from all events
  const allEvents = [
    ...timelineData.mainBranch.events,
    ...timelineData.alternativeBranches.flatMap(branch => branch.events)
  ];
  
  const categories = Array.from(new Set(allEvents.map(event => event.category)));
  const regions = Array.from(new Set(allEvents.map(event => event.region).filter(Boolean)));
  
  // Create era objects based on event years
  const years = allEvents.map(event => event.year);
  const minYear = Math.min(...years);
  const maxYear = Math.max(...years);
  
  const eras = [
    { name: 'Pre-WWI (Before 1914)', startYear: minYear, endYear: 1913 },
    { name: 'World Wars (1914-1945)', startYear: 1914, endYear: 1945 },
    { name: 'Cold War (1946-1991)', startYear: 1946, endYear: 1991 },
    { name: 'Modern Era (1992-Present)', startYear: 1992, endYear: maxYear }
  ];
  
  return (
    <aside
      className={`fixed top-16 left-0 bottom-0 w-80 bg-white shadow-xl transition-transform transform ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } z-40 overflow-y-auto`}
    >
      <div className="sticky top-0 bg-white z-10 border-b">
        <div className="flex p-2">
          <button
            onClick={() => setActiveTab('tree')}
            className={`flex-1 py-2 flex items-center justify-center space-x-2 rounded-l ${
              activeTab === 'tree' ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'
            }`}
          >
            <FolderTree size={18} />
            <span>Timeline Tree</span>
          </button>
          <button
            onClick={() => setActiveTab('filter')}
            className={`flex-1 py-2 flex items-center justify-center space-x-2 rounded-r ${
              activeTab === 'filter' ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'
            }`}
          >
            <Filter size={18} />
            <span>Filters</span>
          </button>
        </div>
      </div>
      
      <div className="p-4">
        {activeTab === 'tree' && (
          <div>
            <h3 className="font-medium text-lg mb-3">Timeline Branches</h3>
            <TimelineTree />
          </div>
        )}
        
        {activeTab === 'filter' && (
          <div className="space-y-6">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Clock size={18} className="text-blue-700" />
                <h3 className="font-medium">Time Periods</h3>
              </div>
              <div className="space-y-2">
                {eras.map(era => (
                  <button
                    key={era.name}
                    onClick={() => updateFilter({ 
                      startYear: era.startYear, 
                      endYear: era.endYear 
                    })}
                    className={`block w-full text-left px-3 py-2 rounded ${
                      filter.startYear === era.startYear && filter.endYear === era.endYear
                        ? 'bg-blue-100 text-blue-800'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {era.name}
                  </button>
                ))}
                {(filter.startYear || filter.endYear) && (
                  <button
                    onClick={() => updateFilter({ startYear: undefined, endYear: undefined })}
                    className="text-sm text-blue-700 hover:underline mt-2"
                  >
                    Clear time filter
                  </button>
                )}
              </div>
            </div>
            
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Map size={18} className="text-blue-700" />
                <h3 className="font-medium">Regions</h3>
              </div>
              <div className="space-y-2">
                {regions.map(region => (
                  <button
                    key={region}
                    onClick={() => updateFilter({ region })}
                    className={`block w-full text-left px-3 py-2 rounded ${
                      filter.region === region
                        ? 'bg-blue-100 text-blue-800'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {region}
                  </button>
                ))}
                {filter.region && (
                  <button
                    onClick={() => updateFilter({ region: undefined })}
                    className="text-sm text-blue-700 hover:underline mt-2"
                  >
                    Clear region filter
                  </button>
                )}
              </div>
            </div>
            
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Filter size={18} className="text-blue-700" />
                <h3 className="font-medium">Categories</h3>
              </div>
              <div className="space-y-2">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => updateFilter({ category })}
                    className={`block w-full text-left px-3 py-2 rounded capitalize ${
                      filter.category === category
                        ? 'bg-blue-100 text-blue-800'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {category}
                  </button>
                ))}
                {filter.category && (
                  <button
                    onClick={() => updateFilter({ category: undefined })}
                    className="text-sm text-blue-700 hover:underline mt-2"
                  >
                    Clear category filter
                  </button>
                )}
              </div>
            </div>
            
            <button
              onClick={() => updateFilter({})}
              className="w-full py-2 rounded bg-blue-700 text-white hover:bg-blue-800 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;