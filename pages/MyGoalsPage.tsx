import React, { useState, useEffect, useCallback } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';
import { TrophyGoal } from '../types';

const MyGoalsPage: React.FC = () => {
  const { user } = useAuth();
  const [goalInput, setGoalInput] = useState<string>('');
  const [isSettingGoal, setIsSettingGoal] = useState<boolean>(false);
  const [goalSubmitStatus, setGoalSubmitStatus] = useState<'success' | 'error' | null>(null);
  const [goalSubmitStatusMessage, setGoalSubmitStatusMessage] = useState<string>('');
  const [userGoals, setUserGoals] = useState<TrophyGoal[]>([]);

  // Effect to load user goals from localStorage
  useEffect(() => {
    if (user) {
      const storedGoals = localStorage.getItem(`trophySeekerGoals_${user.username}`); // Keyed by username
      if (storedGoals) {
        setUserGoals(JSON.parse(storedGoals));
      } else {
        setUserGoals([]);
      }
    } else {
      setUserGoals([]); // Clear goals if not logged in
    }
  }, [user]);

  // Reset states when user changes
  useEffect(() => {
    setGoalInput('');
    setIsSettingGoal(false);
    setGoalSubmitStatus(null);
    setGoalSubmitStatusMessage('');
  }, [user]);

  const handleSetGoal = useCallback(() => {
    if (goalInput.trim() === '' || !user) return;

    setIsSettingGoal(true);
    setGoalSubmitStatus(null);
    setGoalSubmitStatusMessage('Setting your goal...');

    setTimeout(() => {
      setIsSettingGoal(false);
      const success = Math.random() > 0.2; // 80% chance of success for demo

      if (success) {
        const newGoal: TrophyGoal = {
          id: Date.now().toString(),
          userId: user.id,
          username: user.username,
          goal: goalInput.trim(),
          isCompleted: false,
          timestamp: Date.now(),
        };
        const updatedGoals = [newGoal, ...userGoals]; // Add new goal to the top
        setUserGoals(updatedGoals);
        localStorage.setItem(`trophySeekerGoals_${user.username}`, JSON.stringify(updatedGoals)); // Keyed by username
        setGoalSubmitStatus('success');
        setGoalSubmitStatusMessage('Goal set successfully! You got this! 💪');
        setGoalInput(''); // Clear input on success
      } else {
        setGoalSubmitStatus('error');
        setGoalSubmitStatusMessage('Failed to set goal. Please try again. 😔');
      }

      setTimeout(() => {
        setGoalSubmitStatusMessage('');
        setGoalSubmitStatus(null);
      }, 5000);
    }, 2000); // Simulate 2 seconds submission time
  }, [goalInput, user, userGoals]);

  const handleToggleGoalComplete = useCallback((goalId: string) => {
    if (!user) return;

    const updatedGoals = userGoals.map(goal =>
      goal.id === goalId ? { ...goal, isCompleted: !goal.isCompleted } : goal
    );
    setUserGoals(updatedGoals);
    localStorage.setItem(`trophySeekerGoals_${user.username}`, JSON.stringify(updatedGoals)); // Keyed by username
  }, [user, userGoals]);

  return (
    <div className="container mx-auto px-4 py-8 mt-16">
      <Card>
        <div className="flex items-center mb-4">
          <span className="text-5xl mr-4">🎯</span>
          <h1 className="text-4xl font-extrabold text-blue-400">My Trophy Goals</h1>
        </div>
        <p className="text-lg text-gray-300 mb-6">
          Set your personal trophy hunting objectives and track your progress here.
        </p>

        {/* Goal Setting Form (Login Gated) */}
        <div className="mt-8 pt-6 border-t border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-4">Set a New Trophy Goal</h2>
          <p className="text-gray-400 mb-4">
            What's your next platinum target or challenging trophy?
          </p>
          {!user ? (
            <Card className="bg-gray-700 text-center py-6">
              <p className="text-lg text-blue-300 font-semibold">Please log in to set and track your trophy goals!</p>
              <p className="text-gray-400 text-sm mt-2">Keep yourself motivated on your trophy hunting journey.</p>
            </Card>
          ) : (
            <>
              <div className="flex flex-col space-y-4">
                <textarea
                  className="w-full p-3 rounded-lg bg-gray-800 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="E.g., 'Platinum Elden Ring before the DLC releases!', 'Get all collectibles in Marvel's Spider-Man 2', 'Finish all time trials in Crash Bandicoot 4.'"
                  value={goalInput}
                  onChange={(e) => setGoalInput(e.target.value)}
                  disabled={isSettingGoal}
                  aria-label="Trophy goal input"
                ></textarea>
                <Button
                  onClick={handleSetGoal}
                  isLoading={isSettingGoal}
                  disabled={isSettingGoal || goalInput.trim() === ''}
                  className="flex items-center justify-center self-start"
                  aria-live="polite"
                >
                  {isSettingGoal ? (
                    <>
                      <LoadingSpinner />
                      Setting Goal...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m0 0l-7 7-7-7m7 7v10a1 1 0 01-1 1h-3"></path>
                      </svg>
                      Set Goal
                    </>
                  )}
                </Button>
              </div>
              {goalSubmitStatusMessage && (
                <p
                  className={`mt-4 text-sm font-medium ${goalSubmitStatus === 'success' ? 'text-green-500' : 'text-red-500'
                    }`}
                  aria-live="assertive"
                >
                  {goalSubmitStatusMessage}
                </p>
              )}
            </>
          )}
        </div>

        {/* Display User Goals */}
        {user && (
          <div className="mt-8 pt-6 border-t border-gray-700">
            {userGoals.length > 0 ? (
              <>
                <h3 className="text-xl font-bold text-white mb-4">Your Current Goals</h3>
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
              </>
            ) : (
              <p className="mt-6 text-center text-gray-500 italic">You haven't set any goals yet. Start tracking your next challenge!</p>
            )}
          </div>
        )}

        <Button className="mt-6" onClick={() => window.history.back()}>
          Back to Home
        </Button>
      </Card>
    </div>
  );
};

export default MyGoalsPage;