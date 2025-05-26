import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Tag, Calendar, ArrowRight } from 'lucide-react';
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
  const [view, setView] = useState<'details' | 'scenarios'>(event.isBranchPoint ? 'details' : 'details');
  const [showAIScenarioOptions, setShowAIScenarioOptions] = useState(false);
  const alternativeScenarios = useTimelineStore(state => state.getAlternativeScenariosForEvent(event.id));
  const addAlternativeScenariosToStore = useTimelineStore(state => state.addAlternativeScenarios);
  const [userScenarios, setUserScenarios] = useState<AlternativeScenario[]>([]);

  const handleCreateAIScenario = () => {
    setShowAIScenarioOptions(true);
    generateAIScenarios();
  };

  const handleCreateOwnScenario = () => {
    if (userScenarios.length < 5) {
      const newScenario: AlternativeScenario = {
        id: `user-scenario-${Date.now()}`,
        title: 'New Scenario',
        description: 'Click to edit',
        consequences: 'Click to edit',
        imageUrl: '',
      };
      setUserScenarios(prev => [...prev, newScenario]);
    }
  };

  const [isLoading, setIsLoading] = useState(false);
  const [scenarios, setScenarios] = useState<AlternativeScenario[]>([]);

  const generateAIScenarios = async () => {
    setIsLoading(true);
    try {
      const schema = z.array(
        z.object({
          title: z.string(),
          description: z.string(),
          consequences: z.string(),
          imageUrl: z.string()
        })
      );
      
      const prompt = `Generate 5 alternative scenarios for the historical event: "${event.title}" which occurred on ${formatDate(event.date)} in ${event.region || 'an unspecified region'}. Description: ${event.description}

Return the scenarios as an array where each scenario has these properties:
- title: string
- description: string
- consequences: string
- imageUrl: string

Example format:
[
  {
    "title": "Scenario 1",
    "description": "Description 1",
    "consequences": "Consequences 1",
    "imageUrl": "url1"
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
      console.log('AI response:', responseData);
  
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
          setScenarios(scenariosWithIds as any);
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
          className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal header with image */}
          <div className="relative h-64">
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
          
          {/* Modal tabs (if event is a branch point) */}
          {event.isBranchPoint && (
            <div className="flex border-b">
              <button
                onClick={() => setView('details')}
                className={`flex-1 py-3 font-medium text-center ${
                  view === 'details' 
                    ? 'text-blue-700 border-b-2 border-blue-700' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Historical Details
              </button>
              <button
                onClick={() => setView('scenarios')}
                className={`flex-1 py-3 font-medium text-center ${
                  view === 'scenarios' 
                    ? 'text-blue-700 border-b-2 border-blue-700' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                "What If" Scenarios
              </button>
            </div>
          )}
          
          {/* Modal content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-400px)]">
            {view === 'details' ? (
              <div>
                <p className="text-gray-700 leading-relaxed">{event.description}</p>
                
                {event.isBranchPoint && (
                  <button
                    onClick={() => setView('scenarios')}
                    className="mt-6 flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <span>Explore Alternative Scenarios</span>
                    <ArrowRight size={16} />
                  </button>
                )}
              </div>
            ) : (
              <div>
                <div className="flex flex-col space-y-4">
                  {alternativeScenarios.map(scenario => (
                    <ScenarioCard key={scenario.id} scenario={scenario} eventId={event.id} branchId={branchId} onClose={onClose} />
                  ))}
                  {userScenarios.map((scenario, index) => (
                    <ScenarioCard
                      key={scenario.id}
                      scenario={scenario}
                      eventId={event.id}
                      branchId={branchId}
                      onClose={onClose}
                      isUserCreated={true}
                      onUpdateScenario={(updatedScenario) => {
                        const updatedUserScenarios = [...userScenarios];
                        updatedUserScenarios[index] = updatedScenario;
                        setUserScenarios(updatedUserScenarios);
                      }}
                      onDeleteScenario={() => {
                        const updatedUserScenarios = userScenarios.filter(s => s.id !== scenario.id);
                        setUserScenarios(updatedUserScenarios);
                      }}
                    />
                  ))}
                  {showAIScenarioOptions && isLoading && (
                    <div className="text-center text-gray-500">Generating AI scenarios...</div>
                  )}
                  {showAIScenarioOptions && scenarios.length > 0 && (
                    <div className="flex flex-col space-y-4">
                      {scenarios.map(scenario => (
                        <ScenarioCard key={scenario.id} scenario={scenario} eventId={event.id} branchId={branchId} />
                      ))}
                    </div>
                  )}
                  <div className="flex space-x-4 mt-4">
                    <button
                      onClick={handleCreateAIScenario}
                      className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors flex items-center justify-center"
                    >
                      <span className="mr-2">Generate AI Scenarios</span> <ArrowRight size={16} />
                    </button>
                    {userScenarios.length < 5 && (
                      <button
                        onClick={handleCreateOwnScenario}
                        className="flex-1 bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition-colors flex items-center justify-center"
                      >
                        <span className="mr-2">Create Your Own Scenario</span> <ArrowRight size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EventModal;
