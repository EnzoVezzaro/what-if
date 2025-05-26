import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlternativeScenario } from '../../types';
import { useTimelineStore } from '../../store/timelineStore';
import { Edit, Trash2 } from 'lucide-react';

interface ScenarioCardProps {
  scenario: AlternativeScenario;
  eventId: string;
  branchId: string;
  onClose: () => void;
}

const ScenarioCard: React.FC<ScenarioCardProps> = ({
  scenario,
  eventId,
  branchId,
  onClose,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCreatingBranch, setIsCreatingBranch] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(scenario.title);
  const [editedDescription, setEditedDescription] = useState(scenario.description);
  const [editedConsequences, setEditedConsequences] = useState(scenario.consequences);

  const createNewBranch = useTimelineStore(state => state.createNewBranch);
  const updateAlternativeScenario = useTimelineStore(state => state.updateAlternativeScenario);
  const deleteAlternativeScenario = useTimelineStore(state => state.deleteAlternativeScenario);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const startBranchCreation = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(true);
    setIsCreatingBranch(true);
  };

  const handleCreateBranch = async () => { // Make function async
    const newBranchId = await createNewBranch( // Await the promise
      editedTitle,
      editedConsequences,
      branchId,
      eventId,
      scenario
    );

    if (newBranchId) { // Check the awaited string
      onClose(); // Close the modal after creating a new branch
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    setIsExpanded(true);
  };

  const handleSaveEdit = () => {
    updateAlternativeScenario(eventId, scenario.id, {
      title: editedTitle,
      description: editedDescription,
      consequences: editedConsequences,
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    deleteAlternativeScenario(eventId, scenario.id);
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
          <h3 className="font-medium text-lg">{editedTitle}</h3>
          <p className="text-gray-600 text-sm line-clamp-2 mt-1">
            {editedDescription}
          </p>

          <div className="mt-auto flex space-x-2">
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
          {isEditing ? (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Consequences
                </label>
                <textarea
                  value={editedConsequences}
                  onChange={(e) => setEditedConsequences(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                ></textarea>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleSaveEdit}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : isCreatingBranch ? (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Timeline Name
                </label>
                <input
                  type="text"
                  value={editedTitle} // Use editedTitle for branch name
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Timeline Description
                </label>
                <textarea
                  value={editedConsequences} // Use editedConsequences for branch description
                  onChange={(e) => setEditedConsequences(e.target.value)}
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
            <>
              <p className="text-gray-700 mb-4">{editedConsequences}</p>
              <div className="flex space-x-2">
                <button
                  onClick={startBranchCreation}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Explore This Timeline
                </button>
                <button
                  onClick={handleEdit}
                  className="p-2 rounded-md bg-purple-100 text-purple-700 hover:bg-purple-200 transition-colors"
                  aria-label="Edit scenario"
                >
                  <Edit size={18} />
                </button>
                <button
                  onClick={handleDelete}
                  className="p-2 rounded-md bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                  aria-label="Delete scenario"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

export default ScenarioCard;
