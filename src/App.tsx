import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import Timeline from './components/timeline/Timeline';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header 
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
      />
      
      <main className="flex flex-1 pt-16">
        <Sidebar isOpen={isSidebarOpen} />
        
        <motion.div
          className="flex-1 overflow-hidden"
          animate={{
            marginLeft: isSidebarOpen ? '20rem' : '0',
          }}
          transition={{ duration: 0.3 }}
        >
          <div className="h-full">
            <Timeline />
          </div>
        </motion.div>
      </main>
    </div>
  );
}

export default App;