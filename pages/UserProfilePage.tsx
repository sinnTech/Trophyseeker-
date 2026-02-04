import React, { useState, useEffect, useCallback } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner'; // In case we add async logic later
import { useAuth } from '../contexts/AuthContext';
import { TrophyTip, TrophyGoal, Badge } from '../types';
import { DUMMY_BADGES } from '../constants'; // DUMMY_BADGES is still imported for reference to all possible badges, but actual earned list comes from context.

const UserProfilePage: React.FC = () => {
  const { user, getUserGoals, getEarnedBadges } = useAuth(); // Destructure getUserGoals and getEarnedBadges
  const [userTips, setUserTips] = useState<TrophyTip[]>([]);
  const [userGoals, setUserGoals] = useState<TrophyGoal[]>([]);
  const [earnedBadges, setEarnedBadges] = useState<Badge[]>([]);

  // Load user-specific data from localStorage and AuthContext
  useEffect(() => {
    if (user) {
      // Load Tips
      const storedTips = localStorage.getItem(`trophySeekerTips_${user.username}`); // Keyed by username
      if (storedTips) {
        setUserTips(JSON.parse(storedTips));
      } else {
        setUserTips([]);
      }

      // Load Goals using getUserGoals from AuthContext
      setUserGoals(getUserGoals());

      // Get earned badges using getEarnedBadges from AuthContext
      setEarnedBadges(getEarnedBadges());

    } else {
      setUserTips([]);
      setUserGoals([]);
      setEarnedBadges([]);
    }
  }, [user, getUserGoals, getEarnedBadges]); // Re-run when user (login status), getUserGoals, or getEarnedBadges changes

  // Function to toggle goal completion status
  const handleToggleGoalComplete = useCallback((goalId: string) => {
    if (!user) return;

    const updatedGoals = userGoals.map(goal =>
      goal.id === goalId ? { ...goal, isCompleted: !goal.isCompleted } : goal
    );
    setUserGoals(updatedGoals);
    localStorage.setItem(`trophySeekerGoals_${user.username}`, JSON.stringify(updatedGoals)); // Keyed by username
  }, [user, userGoals]);

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 mt-16">
        <Card className="text-center py-10">
          <h1 className="text-3xl font-bold text-red-400 mb-4">Access Denied</h1>
          <p className="text-xl text-blue-300 font-semibold mb-4">Please log in to view your profile.</p>
          <p className="text-gray-400 text-sm mb-6">Your personalized content awaits!</p>
          <Button onClick={() => window.location.hash = '#/'} variant="primary">
            Go to Home & Login
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 mt-16">
      <Card>
        <div className="flex items-center mb-6 border-b border-gray-700 pb-4">
          <span className="text-5xl mr-4">👤</span>
          <div>
            <h1 className="text-4xl font-extrabold text-blue-400">Welcome, {user.username}!</h1>
            <p className="text-lg text-gray-300">Your TrophySeeker Profile</p>
          </div>
        </div>

        {/* Your Submitted Tips */}
        <div className="mt-8 pt-6 border-t border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-4">Your Submitted Tips</h2>
          {userTips.length > 0 ? (
            <div className="space-y-4">
              {userTips.map((tip) => (
                <Card key={tip.id} className="p-4 bg-gray-700 border-gray-600">
                  <p className="text-gray-200 mb-2">{tip.tip}</p>
                  <p className="text-xs text-gray-400">
                    Shared on {new Date(tip.timestamp).toLocaleDateString()}
                  </p>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">You haven't shared any tips yet. Head over to the <a href="#/community" className="text-blue-400 hover:underline">Community page</a> to contribute!</p>
          )}
        </div>

        {/* Your Trophy Goals */}
        <div className="mt-8 pt-6 border-t border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-4">Your Trophy Goals</h2>
          {userGoals.length > 0 ? (
            <div className="space-y-4">
              {userGoals.map((goal) => (
                <Card key={goal.id} className={`p-4 ${goal.isCompleted ? 'bg-gray-700 border-gray-600' : 'bg-gray-800 border-blue-600'} flex items-center justify-between`}>
                  <div className="flex-1 mr-4">
                    <p className={`text-gray-200 text-lg ${goal.isCompleted ? 'line-through text-gray-400 italic' : ''}`}>
                      {goal.goal}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Set on {new Date(goal.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    onClick={() => handleToggleGoalComplete(goal.id)}
                    variant={goal.isCompleted ? 'secondary' : 'primary'}
                    size="sm"
                    aria-label={goal.isCompleted ? `Mark "${goal.goal}" as incomplete` : `Mark "${goal.goal}" as complete`}
                  >
                    {goal.isCompleted ? 'Incomplete' : 'Complete'}
                  </Button>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">You haven't set any goals yet. Visit the <a href="#/goals" className="text-blue-400 hover:underline">Goals page</a> to start tracking your targets!</p>
          )}
        </div>

        {/* Your Earned Badges */}
        <div className="mt-8 pt-6 border-t border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-4">Your Earned Badges</h2>
          {earnedBadges.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {earnedBadges.map((badge) => (
                <Card key={badge.id} className="p-4 bg-gray-700 border-green-500 flex flex-col items-center text-center">
                  <span className="text-4xl mb-2" aria-hidden="true">{badge.icon}</span>
                  <h3 className="text-lg font-semibold text-green-300 mb-1">{badge.name}</h3>
                  <p className="text-xs text-gray-400">{badge.description}</p>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">No badges earned yet. Keep hunting those trophies!</p>
          )}
        </div>

        <Button className="mt-8" onClick={() => window.history.back()}>
          Back
        </Button>
      </Card>
    </div>
  );
};

export default UserProfilePage;