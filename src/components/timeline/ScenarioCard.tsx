import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TimelineEvent, AlternativeScenario } from '../../types';
import { useTimelineStore } from '../../store/timelineStore';

interface ScenarioCardProps {
  scenario: AlternativeScenario;
  event: TimelineEvent;
  branchId: string;
  onClose: () => void;
}

const ScenarioCard: React.FC<ScenarioCardProps> = ({
  scenario,
  event,
  branchId,
  onClose
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCreatingBranch, setIsCreatingBranch] = useState(false);
  const [branchName, setBranchName] = useState(`${scenario.title} Timeline`);
  const [branchDescription, setBranchDescription] = useState(scenario.consequences);
  
  const createNewBranch = useTimelineStore(state => state.createNewBranch);
  
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };
  
  const startBranchCreation = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(true);
    setIsCreatingBranch(true);
  };
  
  const handleCreateBranch = () => {
    const newBranchId = createNewBranch(
      branchName,
      branchDescription,
      branchId,
      event.id,
      scenario.id
    );
    
    if (newBranchId) {
      onClose();
    }
  };
  
  return (
    <motion.div
      layout
      className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      <div 
        className="flex cursor-pointer"
        onClick={toggleExpand}
      >
        {scenario.imageUrl && (
          <div className="w-24 h-24 md:w-32 md:h-32 flex-shrink-0">
            <img 
              src={scenario.imageUrl} 
              alt={scenario.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <div className="p-4 flex flex-col flex-1">
          <h3 className="font-medium text-lg">{scenario.title}</h3>
          <p className="text-gray-600 text-sm line-clamp-2 mt-1">
            {scenario.description}
          </p>
          
          <div className="mt-auto">
            {!isExpanded && (
              <button
                onClick={startBranchCreation}
                className="mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors text-sm"
              >
                Explore This Timeline
              </button>
            )}
          </div>
        </div>
      </div>
      
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="p-4 border-t bg-gray-50"
        >
          <p className="text-gray-700 mb-4">{scenario.consequences}</p>
          
          {isCreatingBranch ? (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Timeline Name
                </label>
                <input
                  type="text"
                  value={branchName}
                  onChange={(e) => setBranchName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Timeline Description
                </label>
                <textarea
                  value={branchDescription}
                  onChange={(e) => setBranchDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={handleCreateBranch}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Create Timeline
                </button>
                <button
                  onClick={() => setIsCreatingBranch(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={startBranchCreation}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Explore This Timeline
            </button>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

export default ScenarioCard;