import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './Components/Navbar';
import FloatingLines from './Components/FloatingLines';
import AnimatedBackground from './Components/AnimatedBackground';
import IntroScreen from './Components/IntroScreen';
import { AnimatePresence, motion } from 'framer-motion';



import ProtectedRoute from './Components/ProtectedRoute';
import Home from './Pages/Home';
import Login from './Pages/Login';
import Convert from './Pages/Convert';
import LearnSign from './Pages/LearnSign';
import AlphabetSyllabus from './Pages/AlphabetSyllabus';
import Community from './Pages/Community';
import Profile from './Pages/Profile';
import LiveSign from './Pages/LiveSign';
import VoiceAssistantPage from './Pages/VoiceAssistantPage';
import VoiceAssistantWidget from './Components/VoiceAssistant/VoiceAssistantWidget';
import { EmergencyProvider } from './Context/EmergencyContext';
import EmergencyModal from './Components/Emergency/EmergencyModal';
import './App.css';

function App() {
  const [showIntro, setShowIntro] = useState(true);

  return (
    <>
      <AnimatePresence>
        {showIntro && (
          <IntroScreen key="intro" onComplete={() => setShowIntro(false)} />
        )}
      </AnimatePresence>

      {!showIntro && (
        <>
          <div className="global-background">
            <FloatingLines
              enabledWaves={['top', 'middle', 'bottom']}
              lineCount={[10, 15, 20]}
              lineDistance={[8, 6, 4]}
              bendRadius={5.0}
              bendStrength={-0.5}
              interactive={true}
              parallax={true}
            />
          </div>
          <motion.div
            key="main-app"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <EmergencyProvider>
              <Router>
                <AnimatedBackground />
                <Navbar />
                <Routes>
                  <Route path="/hearaid/home" element={<Home />} />
                  <Route path="/hearaid/login" element={<Login />} />
                  <Route path="/hearaid/convert" element={<ProtectedRoute><Convert /></ProtectedRoute>} />
                  <Route path="/hearaid/learn-sign" element={<ProtectedRoute><LearnSign /></ProtectedRoute>} />
                  <Route path="/hearaid/alphabet-syllabus" element={<AlphabetSyllabus />} />
                  <Route path="/hearaid/community" element={<ProtectedRoute><Community /></ProtectedRoute>} />
                  <Route path="/hearaid/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                  <Route path="/hearaid/live-sign" element={<ProtectedRoute><LiveSign /></ProtectedRoute>} />
                  <Route path="/hearaid/sign-to-text" element={<ProtectedRoute><LiveSign /></ProtectedRoute>} />
                  <Route path="/hearaid/voice-assistant" element={<VoiceAssistantPage />} />
                  <Route path="*" element={<Home />} />
                </Routes>
                <VoiceAssistantWidget />
                <EmergencyModal />
              </Router>
            </EmergencyProvider>
          </motion.div>
        </>
      )}
    </>
  );
}

export default App;
