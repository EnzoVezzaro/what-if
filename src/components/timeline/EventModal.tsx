import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Tag, Calendar } from 'lucide-react';
import { TimelineEvent, AlternativeScenario } from '../../types';
import { useTimelineStore } from '../../store/timelineStore';
import ScenarioCard from './ScenarioCard';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { z } from 'zod';
import { generateObject } from 'ai';

interface EventModalProps {
  event: TimelineEvent;
  branchId: string;
  onClose: () => void;
}

const EventModal: React.FC<EventModalProps> = ({ event, branchId, onClose }) => {
  const alternativeScenarios = useTimelineStore(state => state.getAlternativeScenariosForEvent(event.id));
  const addAlternativeScenariosToStore = useTimelineStore(state => state.addAlternativeScenarios);

  const [view, setView] = useState<'details' | 'scenarios'>(alternativeScenarios.length > 0 ? 'scenarios' : 'details');
  const [isLoading, setIsLoading] = useState(false);
  const [newScenario, setNewScenario] = useState<AlternativeScenario | null>(null);

  useEffect(() => {
    if (alternativeScenarios.length > 0) {
      setView('scenarios');
    }
  }, [alternativeScenarios]);

  const handleCreateAIScenario = () => {
    generateAIScenarios();
  };

  const handleCreateOwnScenario = () => {
    setNewScenario({
      id: `user-scenario-${Date.now()}`,
      title: 'New Scenario',
      description: '',
      consequences: '',
      imageUrl: '',
      parentEventId: event.id,
    });
  };

  const handleSaveNewScenario = () => {
    if (newScenario) {
      addAlternativeScenariosToStore(event.id, [newScenario]);
      setNewScenario(null); // Clear the new scenario state
    }
  };

  const handleCancelNewScenario = () => {
    setNewScenario(null); // Discard the new scenario
  };

  const generateAIScenarios = async () => {
    setIsLoading(true);
    const scenariosToGenerate = 5 - alternativeScenarios.length;
    if (scenariosToGenerate <= 0) {
      setIsLoading(false);
      return;
    }

    try {
      const schema = z.array(
        z.object({
          title: z.string(),
          description: z.string(),
          consequences: z.string(),
          imageUrl: z.string()
        })
      );

      const prompt = `Generate ${scenariosToGenerate} alternative scenarios for the historical event: "${event.title}" which occurred on ${formatDate(event.date)} in ${event.region || 'an unspecified region'}. Description: ${event.description}

Return the scenarios as an array where each scenario has these properties:
- title: string
- description: string
- consequences: string
- imageUrl: string

Example format:
[
  {
    "title": "Title Scenario",
    "description": "Description",
    "consequences": "Consequences",
    "imageUrl": "url"
  }
]`;
      const google = createGoogleGenerativeAI({
        apiKey: import.meta.env.VITE_GEMINI_API_KEY,
      });

      const result = await generateObject({
        model: google('gemini-2.0-flash', {
          structuredOutputs: true,
        }),
        schema: schema,
        prompt: prompt,
      });
      const response = await result.response;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const responseData = response.body as any;

      // Extract the scenarios array from the nested response structure
      let scenariosText = '';
      if (responseData?.candidates?.[0]?.content?.parts?.[0]?.text) {
        try {
          scenariosText = responseData.candidates[0].content.parts[0].text;
          const parsedScenarios = JSON.parse(scenariosText);
          const validatedScenarios = schema.parse(parsedScenarios);
          // Add unique IDs to scenarios
          const scenariosWithIds = validatedScenarios.map((scenario, index) => ({
            ...scenario,
            id: `ai-scenario-${Date.now()}-${index}`
          }));
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          addAlternativeScenariosToStore(event.id, scenariosWithIds as any);
        } catch (error) {
          console.error('Error parsing scenarios:', error);
          throw error;
        }
      } else {
        throw new Error('Invalid response structure from Gemini API');
      }
    } catch (error) {
      console.error('Error generating scenarios:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 25 }}
          className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto relative flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal header with image */}
          <div className="relative h-64 flex-shrink-0">
            {event.imageUrl ? (
              <img
                src={event.imageUrl}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400">No image available</span>
              </div>
            )}

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-black bg-opacity-40 text-white hover:bg-opacity-60 transition-colors"
            >
              <X size={20} />
            </button>

            {/* Event title overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4 text-white">
              <h2 className="text-2xl font-bold">{event.title}</h2>
              <div className="flex items-center space-x-4 mt-1">
                <div className="flex items-center space-x-1 text-sm">
                  <Calendar size={14} />
                  <span>{formatDate(event.date)}</span>
                </div>
                {event.region && (
                  <div className="flex items-center space-x-1 text-sm">
                    <MapPin size={14} />
                    <span>{event.region}</span>
                  </div>
                )}
                <div className="flex items-center space-x-1 text-sm">
                  <Tag size={14} />
                  <span className="capitalize">{event.category}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Modal tabs */}
          <div className="flex border-b">
            <button
              onClick={() => setView('details')}
              className={`flex-1 py-3 font-medium text-center ${
                view === 'details'
                  ? 'text-blue-700 border-b-2 border-blue-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Details
            </button>
            <button
              onClick={() => setView('scenarios')}
              className={`flex-1 py-3 font-medium text-center ${
                view === 'scenarios'
                  ? 'text-blue-700 border-b-2 border-blue-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              What If?
            </button>
          </div>

          {/* Modal content */}
          <div className="p-6 overflow-y-auto flex-grow custom-scrollbar">
            {view === 'details' && (
              <div>
                <h3 className="text-xl font-semibold mb-3">Event Details</h3>
                <p className="text-gray-700 mb-4 text-justify">{event.description}</p>
                {event.outcomes && (
                  <div className="mt-4">
                    <h4 className="text-lg font-semibold mb-2">Outcomes</h4>
                    <ul className="list-disc list-inside text-gray-700">
                      {event.outcomes.map((outcome, index) => (
                        <li key={index}>{outcome}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {view === 'scenarios' && (
              <div>
                <h3 className="text-xl font-semibold mb-3">What If Scenarios?</h3>
                {alternativeScenarios.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {alternativeScenarios.map(scenario => (
                      <ScenarioCard key={scenario.id} scenario={scenario} eventId={event.id} branchId={branchId} onClose={onClose} />
                    ))}
                  </div>
                )}

                {alternativeScenarios.length < 5 && !newScenario && !isLoading && (
                  <div className={`flex ${alternativeScenarios.length > 0 ? 'mt-4' : 'flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg'}`}>
                    {alternativeScenarios.length === 0 && (
                       <p className="text-lg text-gray-600 mb-4">No alternative scenarios created yet.</p>
                    )}
                    <div className={`flex space-x-4 ${alternativeScenarios.length === 0 ? '' : 'w-full justify-center'}`}>
                      <button
                        onClick={handleCreateAIScenario}
                        className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                      >
                        <span>Generate {5 - alternativeScenarios.length} AI Scenario{5 - alternativeScenarios.length > 1 ? 's' : ''}</span>
                      </button>
                      <button
                        onClick={handleCreateOwnScenario}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                      >
                        <span>Create Your Own</span>
                      </button>
                    </div>
                  </div>
                )}

                {newScenario && (
                  <div className="mt-6 p-4 border rounded-lg bg-gray-50">
                    <h4 className="text-lg font-semibold mb-3">Create New Scenario</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Title
                        </label>
                        <input
                          type="text"
                          value={newScenario.title}
                          onChange={(e) => setNewScenario({ ...newScenario, title: e.target.value })}
                          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <textarea
                          value={newScenario.description}
                          onChange={(e) => setNewScenario({ ...newScenario, description: e.target.value })}
                          rows={3}
                          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        ></textarea>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Consequences
                        </label>
                        <textarea
                          value={newScenario.consequences}
                          onChange={(e) => setNewScenario({ ...newScenario, consequences: e.target.value })}
                          rows={3}
                          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        ></textarea>
                      </div>
                      <div className="flex space-x-3">
                        <button
                          onClick={handleSaveNewScenario}
                          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                        >
                          Save Scenario
                        </button>
                        <button
                          onClick={handleCancelNewScenario}
                          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {isLoading && (
                  <div className="mt-6">
                    <p>Generating AI scenarios...</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Modal footer */}
          <div className="p-4 bg-gray-100 border-t flex justify-end">
            <button
              onClick={onClose}
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EventModal;
