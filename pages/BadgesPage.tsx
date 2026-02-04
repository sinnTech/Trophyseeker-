import React, { useState, useEffect, useMemo } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import { DUMMY_BADGES } from '../constants';
import { useAuth } from '../contexts/AuthContext';
import { Badge } from '../types';

const BadgesPage: React.FC = () => {
  const { user, getEarnedBadges } = useAuth();
  const [earnedBadgeIds, setEarnedBadgeIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (user) {
      const badges = getEarnedBadges();
      const ids = new Set(badges.map(b => b.id));
      setEarnedBadgeIds(ids);
    } else {
      setEarnedBadgeIds(new Set()); // Clear earned badges if logged out
    }
  }, [user, getEarnedBadges]); // Re-run when user or earned badges list potentially changes

  return (
    <div className="container mx-auto px-4 py-8 mt-16">
      <Card>
        <div className="flex items-center mb-6 border-b border-gray-700 pb-4">
          <span className="text-5xl mr-4">🎖️</span>
          <div>
            <h1 className="text-4xl font-extrabold text-blue-400">All Available Badges</h1>
            <p className="text-lg text-gray-300">Discover all the prestigious badges you can earn on TrophySeeker.</p>
          </div>
        </div>

        <p className="text-gray-400 mb-8">
          Complete challenges, share tips, and achieve milestones to grow your collection.
          {user ? (
            <span className="ml-1 font-semibold text-green-400">Your earned badges are highlighted below!</span>
          ) : (
            <span className="ml-1 text-yellow-300 italic">Log in to see which badges you've earned!</span>
          )}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {DUMMY_BADGES.map((badge: Badge) => {
            const isEarned = user && earnedBadgeIds.has(badge.id);
            return (
              <Card 
                key={badge.id} 
                className={`p-4 flex flex-col items-center text-center 
                            ${isEarned ? 'bg-green-800/20 border-green-500' : 'bg-gray-700 border-gray-600'}`}
              >
                <span className="text-5xl mb-3" aria-hidden="true">{badge.icon}</span>
                <h3 className="text-xl font-semibold text-white mb-2">{badge.name}</h3>
                <p className="text-sm text-gray-400 mb-3 flex-1">{badge.description}</p>
                {isEarned && (
                  <p className="text-green-400 font-bold mt-2 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Earned!
                  </p>
                )}
              </Card>
            );
          })}
        </div>

        <Button className="mt-8" onClick={() => window.history.back()}>
          Back
        </Button>
      </Card>
    </div>
  );
};

export default BadgesPage;