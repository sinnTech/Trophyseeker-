import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';
import { FEATURES, MARKETING_HOOK } from '../constants';
import ParticleTrail from '../components/ParticleTrail';

const Home: React.FC = () => {
  return (
    // Outer container for the Home page to provide the overall gamer background and feel
    <div className="relative isolate min-h-[calc(100vh-80px)] overflow-hidden">
      <ParticleTrail />
      {/* Background gradient for the page content */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 z-0 opacity-80"></div>

      <div className="relative z-10 container mx-auto px-4 py-12 md:py-20"> {/* Adjusted py for more vertical spacing */}
        {/* Hero Section Card */}
        <Card className="text-center mb-16 p-8 md:p-12 bg-gray-800/80 backdrop-blur-md rounded-2xl border-2 border-blue-600 shadow-xl shadow-blue-500/40 relative transform hover:scale-[1.01] transition-all duration-300 ease-in-out">
          <div className="flex justify-center mb-6">
            <img
              src="/logo.png"
              alt="TrophySeeker Logo"
              className="w-32 h-32 md:w-48 md:h-48 drop-shadow-[0_0_20px_rgba(34,211,238,0.5)] animate-pulse"
            />
          </div>
          <p className="text-xl md:text-2xl text-gray-200 mb-8 italic animate-slide-up font-light" style={{ animationDelay: '0.5s', animationDuration: '0.8s' }}>
            {MARKETING_HOOK}
          </p>
          <Link to="/chatbot">
            <Button size="lg" className="group relative animate-pulse bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105" style={{ animationDelay: '1s' }}>
              <span className="flex items-center gap-2">
                Ask TrophySeeker (AI Chat)
                <span className="inline-block transition-transform duration-500 group-hover:-translate-y-12 group-hover:translate-x-12 opacity-0 group-hover:opacity-100 scale-150">🚀</span>
              </span>
            </Button>
          </Link>
        </Card>

        {/* Core Features Heading */}
        <h2 className="text-4xl md:text-5xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-300 mb-10 mt-12 drop-shadow-md animate-fade-in" style={{ animationDelay: '1.2s' }}>
          Core Features
        </h2>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature, index) => (
            <Link to={`/${feature.id}`} key={feature.id} className="group animate-slide-up" style={{ animationDelay: `${1.4 + index * 0.1}s`, animationDuration: '0.7s' }}> {/* Added group class for hover effects */}
              <Card className="p-6 flex flex-col justify-between transform hover:scale-105 hover:bg-gray-700 hover:shadow-xl hover:shadow-blue-500/30 bg-gray-800 rounded-xl border border-gray-700 transition-all duration-300 ease-in-out cursor-pointer h-full">
                <div className="flex items-start mb-4"> {/* Changed to items-start for better icon alignment */}
                  <span className="text-5xl md:text-6xl mr-3 mb-2 transition-transform duration-300 group-hover:scale-110">{feature.icon}</span>
                  <h3 className="text-2xl font-bold text-blue-300 group-hover:text-white transition-colors duration-300 mb-2">{feature.name}</h3>
                </div>
                <p className="text-gray-400 text-base">{feature.description}</p>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;