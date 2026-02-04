import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.tsx';
import Home from './pages/Home.tsx';
import ChatbotPage from './pages/ChatbotPage.tsx';
import GenericFeaturePage from './pages/GenericFeaturePage.tsx';
import VideoHubPage from './pages/VideoHubPage.tsx';
import MyGoalsPage from './pages/MyGoalsPage.tsx';
import UserProfilePage from './pages/UserProfilePage.tsx';
import FriendsPage from './pages/FriendsPage.tsx';
import BadgesPage from './pages/BadgesPage.tsx'; // Import the new BadgesPage
import { AuthProvider } from './contexts/AuthContext';

const App: React.FC = () => {
  return (
    <HashRouter>
      <AuthProvider>
        <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
          <Navbar />
          <main className="flex-1 p-4 md:p-8 pt-20 overflow-auto animate-fade-in"> {/* Added pt-20 to push content below the fixed navbar */}
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/chatbot" element={<ChatbotPage />} />
              <Route path="/video-hub" element={<VideoHubPage />} />
              <Route path="/goals" element={<MyGoalsPage />} />
              <Route path="/profile" element={<UserProfilePage />} />
              <Route path="/friends" element={<FriendsPage />} />
              <Route path="/badges" element={<BadgesPage />} /> {/* New route for Badges */}
              {/* Consolidated feature routes to a single generic route */}
              {/* Changed path from "/:featureId" to ":featureId" for HashRouter compatibility */}
              <Route path="/:featureId" element={<GenericFeaturePage />} />
              {/* Fallback for unknown routes */}
              <Route path="*" element={
                <div className="container mx-auto px-4 py-8 mt-16 text-center">
                  <h1 className="text-4xl font-bold text-red-500 mb-4">404 - Page Not Found</h1>
                  <p className="text-lg text-gray-400">Oops! The page you're looking for doesn't exist.</p>
                  <a href="#/" className="mt-6 inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">Go to Home</a>
                </div>
              } />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </HashRouter>
  );
};

export default App;