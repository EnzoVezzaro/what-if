import React from 'react';
import { ChevronDown, ChevronRight, Eye, EyeOff } from 'lucide-react';
import { useTimelineStore } from '../../store/timelineStore';

const TimelineTree: React.FC = () => {
  const timelineData = useTimelineStore(state => state.timelineData);
  const selectedBranchId = useTimelineStore(state => state.selectedBranchId);
  const visibleBranchIds = useTimelineStore(state => state.visibleBranchIds);
  const setSelectedBranch = useTimelineStore(state => state.setSelectedBranch);
  const addVisibleBranch = useTimelineStore(state => state.addVisibleBranch);
  const removeVisibleBranch = useTimelineStore(state => state.removeVisibleBranch);
  
  // Create a map of parent branch IDs to child branch IDs
  const branchChildrenMap: Record<string, string[]> = {};
  
  // Initialize with empty arrays for each branch ID
  [timelineData.mainBranch.id, ...timelineData.alternativeBranches.map(b => b.id)].forEach(id => {
    branchChildrenMap[id] = [];
  });
  
  // Populate the children map
  timelineData.alternativeBranches.forEach(branch => {
    if (branch.parentBranchId) {
      branchChildrenMap[branch.parentBranchId].push(branch.id);
    }
  });
  
  // Track expanded state for each branch
  const [expandedBranches, setExpandedBranches] = React.useState<Record<string, boolean>>({
    [timelineData.mainBranch.id]: true
  });
  
  const toggleExpand = (branchId: string) => {
    setExpandedBranches(prev => ({
      ...prev,
      [branchId]: !prev[branchId]
    }));
  };
  
  const toggleVisibility = (branchId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (visibleBranchIds.includes(branchId)) {
      removeVisibleBranch(branchId);
    } else {
      addVisibleBranch(branchId);
    }
  };
  
  const renderBranch = (branchId: string, depth = 0) => {
    const branch = branchId === timelineData.mainBranch.id
      ? timelineData.mainBranch
      : timelineData.alternativeBranches.find(b => b.id === branchId);
    
    if (!branch) return null;
    
    const hasChildren = branchChildrenMap[branchId]?.length > 0;
    const isExpanded = expandedBranches[branchId];
    const isSelected = selectedBranchId === branchId;
    const isVisible = visibleBranchIds.includes(branchId);
    
    return (
      <div key={branchId} className="mb-1">
        <div 
          className={`flex items-center py-2 px-2 rounded ${
            isSelected ? 'bg-blue-100' : 'hover:bg-gray-100'
          } cursor-pointer`}
          style={{ marginLeft: `${depth * 20}px` }}
          onClick={() => setSelectedBranch(branchId)}
        >
          {hasChildren && (
            <button 
              onClick={(e) => { e.stopPropagation(); toggleExpand(branchId); }}
              className="p-1 rounded-full hover:bg-gray-200 mr-1"
            >
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
          )}
          
          {!hasChildren && <div className="w-6 mr-1"></div>}
          
          <div 
            className="w-3 h-3 rounded-full mr-2" 
            style={{ backgroundColor: branch.color }}
          ></div>
          
          <span className="flex-1 truncate">{branch.name}</span>
          
          <button
            onClick={(e) => toggleVisibility(branchId, e)}
            className={`p-1 rounded-full ${
              isVisible ? 'text-blue-600 hover:bg-blue-100' : 'text-gray-400 hover:bg-gray-200'
            }`}
            title={isVisible ? 'Hide timeline' : 'Show timeline'}
          >
            {isVisible ? <Eye size={16} /> : <EyeOff size={16} />}
          </button>
        </div>
        
        {isExpanded && hasChildren && (
          <div>
            {branchChildrenMap[branchId].map(childId => renderBranch(childId, depth + 1))}
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div>
      {renderBranch(timelineData.mainBranch.id)}
    </div>
  );
};

export default TimelineTree;