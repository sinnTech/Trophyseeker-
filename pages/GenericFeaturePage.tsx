import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';
import { FEATURES, DUMMY_GAMES, DUMMY_BADGES } from '../constants'; // Removed DUMMY_GUIDANCE_RESPONSES
import { useAuth } from '../contexts/AuthContext';
import { TrophyTip, Game, TrophyGoal, UserChallenge, Badge } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import MarkdownRenderer from '../components/MarkdownRenderer';
import { getGameGuidance } from '../services/geminiGuidanceService'; // Import the new Gemini service

const GenericFeaturePage: React.FC = () => {
  const { user, getUserGoals, markChallengeComplete, claimChallengeBadge, getEarnedBadges, getUserStats } = useAuth(); // Destructure challenge functions

  const { featureId } = useParams<{ featureId: string }>();
  const feature = FEATURES.find(f => f.id === featureId);

  // State for 'Community Features' share tip feature
  const [tipInput, setTipInput] = useState<string>('');
  const [isSubmittingTip, setIsSubmittingTip] = useState<boolean>(false);
  const [tipSubmitStatus, setTipSubmitStatus] = useState<'success' | 'error' | null>(null);
  const [tipSubmitStatusMessage, setTipSubmitStatusMessage] = useState<string>('');
  const [communityTips, setCommunityTips] = useState<TrophyTip[]>([]);

  // State for 'Intelligent Game Guidance'
  const [gameSearchQuery, setGameSearchQuery] = useState<string>(''); // NEW: State for game search input
  const [displayedGames, setDisplayedGames] = useState<Game[]>(DUMMY_GAMES); // NEW: State for filtered games
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [progressInput, setProgressInput] = useState<string>('');
  const [isGettingHints, setIsGettingHints] = useState<boolean>(false);
  const [guidanceResponse, setGuidanceResponse] = useState<{ hints: string; missables: string; strategies: string } | null>(null);
  const [guidanceError, setGuidanceError] = useState<string | null>(null);
  const guidanceAbortControllerRef = useRef<AbortController | null>(null); // AbortController for guidance API calls

  // State for 'Personal Trophy Roadmap'
  const [userGoals, setUserGoals] = useState<TrophyGoal[]>([]); // Load user goals for roadmap
  const [roadmapFocusInput, setRoadmapFocusInput] = useState<string>('');
  const [isGeneratingRoadmap, setIsGeneratingRoadmap] = useState<boolean>(false);
  const [roadmapContent, setRoadmapContent] = useState<string | null>(null);
  const [roadmapError, setRoadmapError] = useState<string | null>(null);

  const [activeChallenges, setActiveChallenges] = useState<UserChallenge[]>([]);
  const [isProcessingChallenge, setIsProcessingChallenge] = useState<boolean>(false);
  const [challengeActionMessage, setChallengeActionMessage] = useState<string>('');

  // State for 'Personal Statistics & Analytics'
  const [isPredicting, setIsPredicting] = useState<boolean>(false);
  const [predictionResult, setPredictionResult] = useState<string | null>(null);
  const [predictionError, setPredictionError] = useState<string | null>(null);
  const [predictionGameId, setPredictionGameId] = useState<string>('');

  // State for 'Cross-Game Optimization'
  const [selectedOptimizationGames, setSelectedOptimizationGames] = useState<string[]>([]);
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);
  const [optimizationPlan, setOptimizationPlan] = useState<string | null>(null);

  // Effect to load community tips from localStorage
  useEffect(() => {
    if (featureId === 'community' && user) {
      const storedTips = localStorage.getItem(`trophySeekerTips_${user.username}`); // Keyed by username
      if (storedTips) {
        setCommunityTips(JSON.parse(storedTips));
      } else {
        setCommunityTips([]);
      }
    } else {
      setCommunityTips([]); // Clear tips if not on community page or not logged in
    }
  }, [featureId, user]);

  // Effect to load user goals for Roadmap feature
  useEffect(() => {
    if (featureId === 'roadmap' && user) {
      setUserGoals(getUserGoals());
    } else {
      setUserGoals([]); // Clear goals if not on roadmap page or not logged in
    }
  }, [featureId, user, getUserGoals]); // Add getUserGoals to dependencies

  // Effect to load active challenges for Challenges feature
  useEffect(() => {
    if (featureId === 'challenges' && user) {
      // Access challenges from user object directly for reactivity
      setActiveChallenges(user.activeChallenges || []);
    } else {
      setActiveChallenges([]);
    }
  }, [featureId, user]); // Depend on user, which includes activeChallenges

  // Effect for game search filtering
  useEffect(() => {
    if (featureId === 'guidance') {
      const lowerCaseQuery = gameSearchQuery.toLowerCase();
      const filtered = DUMMY_GAMES.filter(game =>
        game.name.toLowerCase().includes(lowerCaseQuery)
      );
      setDisplayedGames(filtered);

      // If the currently selected game is no longer in the filtered list, clear it
      if (selectedGame && !filtered.some(game => game.id === selectedGame.id)) {
        setSelectedGame(null);
      }
    }
  }, [featureId, gameSearchQuery, selectedGame]);


  // Reset all states when featureId or user changes
  useEffect(() => {
    // Abort any ongoing guidance requests when navigating away or user changes
    if (guidanceAbortControllerRef.current) {
      guidanceAbortControllerRef.current.abort();
      guidanceAbortControllerRef.current = null;
    }

    setTipInput('');
    setIsSubmittingTip(false);
    setTipSubmitStatus(null);
    setTipSubmitStatusMessage('');
    setCommunityTips([]);
    setGameSearchQuery(''); // NEW: Reset search query
    setDisplayedGames(DUMMY_GAMES); // NEW: Reset displayed games
    setSelectedGame(null);
    setProgressInput('');
    setIsGettingHints(false);
    setGuidanceResponse(null);
    setGuidanceError(null);
    setRoadmapFocusInput('');
    setIsGeneratingRoadmap(false);
    setRoadmapContent(null);
    setRoadmapError(null);
    // Reset challenge-specific states
    setActiveChallenges([]); // Will be reloaded by its own useEffect if on challenges page
    setIsProcessingChallenge(false);
    setChallengeActionMessage('');
    // Reset stats-specific states
    setIsPredicting(false);
    setPredictionResult(null);
    setPredictionError(null);
    setPredictionGameId('');
    // Reset cross-game states
    setSelectedOptimizationGames([]);
    setIsOptimizing(false);
    setOptimizationPlan(null);
  }, [featureId, user]); // Include user in dependency array to reset on login/logout

  // Cleanup for abort controller on unmount
  useEffect(() => {
    return () => {
      if (guidanceAbortControllerRef.current) {
        guidanceAbortControllerRef.current.abort();
      }
    };
  }, []);


  const handleSubmitTip = useCallback(() => {
    if (tipInput.trim() === '' || !user) return;

    setIsSubmittingTip(true);
    setTipSubmitStatus(null);
    setTipSubmitStatusMessage('Submitting tip...');

    setTimeout(() => {
      setIsSubmittingTip(false);
      const success = Math.random() > 0.2;

      if (success) {
        const newTip: TrophyTip = {
          id: Date.now().toString(),
          userId: user.id,
          username: user.username,
          tip: tipInput.trim(),
          timestamp: Date.now(),
        };
        const updatedTips = [newTip, ...communityTips];
        setCommunityTips(updatedTips);
        localStorage.setItem(`trophySeekerTips_${user.username}`, JSON.stringify(updatedTips)); // Keyed by username
        setTipSubmitStatus('success');
        setTipSubmitStatusMessage('Tip submitted successfully! Thanks for your contribution! 🎉');
        setTipInput('');
      } else {
        setTipSubmitStatus('error');
        setTipSubmitStatusMessage('Failed to submit tip. Please try again. 😔');
      }

      setTimeout(() => {
        setTipSubmitStatusMessage('');
        setTipSubmitStatus(null);
      }, 5000);
    }, 2500); // Simulate 2.5 seconds submission time
  }, [tipInput, user, communityTips]);

  const handleGetHints = useCallback(async () => {
    if (!selectedGame || progressInput.trim() === '') {
      setGuidanceError('Please select a game and describe your progress.');
      return;
    }

    setIsGettingHints(true);
    setGuidanceResponse(null);
    setGuidanceError(null);

    // Abort any existing request
    if (guidanceAbortControllerRef.current) {
      guidanceAbortControllerRef.current.abort();
    }
    const controller = new AbortController();
    guidanceAbortControllerRef.current = controller;

    try {
      const response = await getGameGuidance(selectedGame.name, progressInput.trim(), controller.signal);
      setGuidanceResponse(response);
      setGuidanceError(null);
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        console.log('Game guidance request aborted.');
        // Don't set error message if aborted by a new request
      } else {
        console.error('Error getting game guidance:', error);
        setGuidanceError('Failed to retrieve guidance. Please try again. ' + (error instanceof Error ? error.message : ''));
        setGuidanceResponse(null);
      }
    } finally {
      setIsGettingHints(false);
      guidanceAbortControllerRef.current = null; // Clear controller after request completes or is aborted
    }
  }, [selectedGame, progressInput]);

  const handleGenerateRoadmap = useCallback(() => {
    if (!user) {
      setRoadmapError('Please log in to generate your trophy roadmap.');
      return;
    }
    const incompleteGoals = userGoals.filter(goal => !goal.isCompleted);
    if (incompleteGoals.length === 0) {
      setRoadmapError('You need to set some uncompleted trophy goals first to generate a roadmap. Visit the "My Trophy Goals" page!');
      return;
    }

    setIsGeneratingRoadmap(true);
    setRoadmapContent(null);
    setRoadmapError(null);

    setTimeout(() => {
      setIsGeneratingRoadmap(false);
      const success = Math.random() > 0.1; // 90% chance of success

      if (success) {
        let roadmapMarkdown = `## Your Personalized Trophy Roadmap 🗺️\n\n`;
        roadmapMarkdown += `Based on your current goals, here's an optimized path to help you achieve them. Remember, this is a guide—feel free to adjust it to your playstyle!\n\n`;

        if (roadmapFocusInput.trim()) {
          roadmapMarkdown += `**Roadmap Focus:** "${roadmapFocusInput.trim()}"\n\n`;
        }

        roadmapMarkdown += `### Active Goals to Tackle:\n`;
        incompleteGoals.forEach((goal, index) => {
          roadmapMarkdown += `*   **Goal ${index + 1}:** "${goal.goal}"\n`;
          // Simulated advice for each goal
          const adviceOptions = [
            `**Strategy:** Focus on story progression that naturally unlocks regions relevant to this goal. Prioritize side quests that align with collectible hunting or specific combat challenges.`,
            `**Next Steps:** Research specific in-game areas or missions known for progress towards this trophy. Consider if a specific character build or weapon set would be beneficial.`,
            `**Efficiency Tip:** Combine this goal with others! For example, if it's a collectible goal, try to gather all items in an area before moving on to avoid backtracking.`,
            `**Preparation:** Ensure your character or loadout is well-suited. You might need specific abilities, gear, or companion upgrades.`,
          ];
          roadmapMarkdown += `    *   ${adviceOptions[Math.floor(Math.random() * adviceOptions.length)]}\n`;
        });

        roadmapMarkdown += `\n### General Trophy Hunting Tips:\n`;
        roadmapMarkdown += `*   **Explore Thoroughly:** Before advancing major story points, always do a sweep of the current area for hidden items, side quests, and optional bosses.\n`;
        roadmapMarkdown += `*   **Check for Missables:** If a game is known for missable trophies, always consult a reliable guide *before* critical story junctures. TrophySeeker's guidance feature can help!\n`;
        roadmapMarkdown += `*   **Patience is Key:** Some trophies require grinding or multiple playthroughs. Break down large goals into smaller, manageable tasks.\n`;
        roadmapMarkdown += `*   **Community Wisdom:** Don't hesitate to check the Community features for tips on particularly tricky trophies or glitches.\n\n`;

        if (incompleteGoals.length > 2) {
          roadmapMarkdown += `Good luck, Hunter! May your trophy cabinet overflow with platinum! ✨`;
        } else {
          roadmapMarkdown += `You're close to achieving your goals! Keep up the great work! ✨`;
        }

        setRoadmapContent(roadmapMarkdown);
      } else {
        setRoadmapError('Failed to generate roadmap. Please try again or refine your goals.');
      }
    }, 4000); // Simulate AI processing time for roadmap
  }, [user, userGoals, roadmapFocusInput]);

  const handleMarkChallengeComplete = useCallback(async (challengeId: string, challengeName: string) => {
    if (!user || isProcessingChallenge) return;

    setIsProcessingChallenge(true);
    setChallengeActionMessage(`Marking "${challengeName}" as complete...`);

    const success = await markChallengeComplete(challengeId);
    if (success) {
      setChallengeActionMessage(`"${challengeName}" marked as complete! You can now claim your badge.`);
      // Update local state to reflect completion (AuthContext updates user state, this updates local page state)
      setActiveChallenges(prev => prev.map(c => c.id === challengeId ? { ...c, isCompleted: true } : c));
    } else {
      setChallengeActionMessage(`Failed to mark "${challengeName}" complete. Please try again.`);
    }
    setIsProcessingChallenge(false);
    setTimeout(() => setChallengeActionMessage(''), 3000);
  }, [user, isProcessingChallenge, markChallengeComplete]);

  const handleClaimChallengeBadge = useCallback(async (challengeId: string, badgeId: string, challengeName: string) => {
    if (!user || isProcessingChallenge) return;

    setIsProcessingChallenge(true);
    setChallengeActionMessage(`Claiming badge for "${challengeName}"...`);

    const success = await claimChallengeBadge(challengeId);
    if (success) {
      const awardedBadge = DUMMY_BADGES.find(b => b.id === badgeId); // Find full badge details
      setChallengeActionMessage(`Badge "${awardedBadge?.name || badgeId}" claimed for "${challengeName}"! It's now on your Profile page. 🎉`);
      // Update local state to reflect badge claim (AuthContext updates user state, this updates local page state)
      setActiveChallenges(prev => prev.map(c => c.id === challengeId ? { ...c, isClaimed: true } : c));
    } else {
      setChallengeActionMessage(`Failed to claim badge for "${challengeName}". Already claimed?`);
    }
    setIsProcessingChallenge(false);
    setTimeout(() => setChallengeActionMessage(''), 3000);
  }, [user, isProcessingChallenge, claimChallengeBadge]);

  const handlePredictCompletion = useCallback(async () => {
    if (!user || !predictionGameId) return;

    setIsPredicting(true);
    setPredictionResult(null);
    setPredictionError(null);

    const selectedGame = DUMMY_GAMES.find(g => g.id === predictionGameId);
    if (!selectedGame) return;

    // Build a prompt for prediction
    const stats = getUserStats();
    const gameTrophies = stats.gameTrophyCounts[predictionGameId] || { platinum: 0, gold: 0, silver: 0, bronze: 0 };

    const prompt = `
      Predict a platinum trophy completion date for the game: ${selectedGame.name}.
      Current user trophies for this game: 
      - Platinum: ${gameTrophies.platinum}
      - Gold: ${gameTrophies.gold}
      - Silver: ${gameTrophies.silver}
      - Bronze: ${gameTrophies.bronze}
      
      The user also has ${stats.goalsCompleted} goals completed out of ${stats.goalsTotal} total goals on this platform.
      Provide a realistic estimate based on typical trophy hunting times for this game (use your knowledge of the game's difficulty and length).
      Format the response as a friendly, encouraging prediction with a projected date or "hours remaining" estimate. Keep it concise.
    `;

    try {
      // Re-using the getGameGuidance service pattern but for a generic prompt
      // We could use a more generic service, but let's stick to simple simulation or a prompt if we had one.
      // Since getGameGuidance expects specific JSON, I'll use a simulated delay and a nice message for now, 
      // or I could try to call a more generic endpoint if it existed.

      // Let's simulate a sophisticated "AI result" for now since we don't have a generic "askAnyQuestion" service.
      await new Promise(resolve => setTimeout(resolve, 3000));

      const totalTrophies = gameTrophies.platinum + gameTrophies.gold + gameTrophies.silver + gameTrophies.bronze;
      let hoursLeft = 0;
      let dateEstimate = "";

      if (predictionGameId === 'hfw') { hoursLeft = Math.max(0, 60 - (totalTrophies * 1.2)); }
      else if (predictionGameId === 'er') { hoursLeft = Math.max(0, 100 - (totalTrophies * 2)); }
      else { hoursLeft = Math.max(5, 40 - (totalTrophies * 0.8)); }

      const days = Math.ceil(hoursLeft / 2); // Assuming 2 hours play per day
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + days);

      setPredictionResult(`### Prediction for ${selectedGame.name} 📈\n\nBased on your current progress and typical completion rates, I predict you have approximately **${Math.floor(hoursLeft)} hours** of hunting remaining.\n\n📅 **Projected Platinum Date:** ${targetDate.toLocaleDateString()}\n\n*Tip: Focus on cleaning up those bronze "collectible" trophies first to build momentum!*`);
    } catch (e) {
      setPredictionError("Failed to generate prediction. Our AI scouts are currently offline.");
    } finally {
      setIsPredicting(false);
    }
  }, [user, predictionGameId, getUserStats]);

  const handleToggleOptimizationGame = (gameId: string) => {
    setSelectedOptimizationGames(prev =>
      prev.includes(gameId)
        ? prev.filter(id => id !== gameId)
        : prev.length < 3 ? [...prev, gameId] : prev
    );
  };

  const handleGenerateOptimization = useCallback(async () => {
    if (selectedOptimizationGames.length < 2) return;

    setIsOptimizing(true);
    setOptimizationPlan(null);

    await new Promise(resolve => setTimeout(resolve, 3500));

    const selectedNames = DUMMY_GAMES
      .filter(g => selectedOptimizationGames.includes(g.id))
      .map(g => g.name);

    let planMarkdown = `## Trophy Efficiency Plan: ${selectedNames.join(' + ')} ⚡\n\n`;
    planMarkdown += `I've analyzed these titles to create the most efficient hunting sequence. By alternating focus, you'll maintain peak performance and avoid burnout.\n\n`;

    planMarkdown += `### 🗓️ Optimized Weekly Schedule\n`;
    planMarkdown += `| Day | Primary Focus | Backup (Relaxation) |\n`;
    planMarkdown += `| :--- | :--- | :--- |\n`;
    planMarkdown += `| **Mon-Tue** | **${selectedNames[0]}** (Progression) | ${selectedNames[1]} (Collectibles) |\n`;
    planMarkdown += `| **Wed** | Skill Drill (Combat Challenges) | - |\n`;
    planMarkdown += `| **Thu-Fri** | **${selectedNames[1]}** (Main Story) | ${selectedNames[0]} (Cleanup) |\n`;
    planMarkdown += `| **Weekend** | Multi-Game Cleanup | Social Gaming |\n\n`;

    planMarkdown += `### 🛠️ Shared Skill Matrix\n`;
    planMarkdown += `*   **Reflexes**: High overlap between these titles. Warm up with ${selectedNames[1]} before tackling bosses in ${selectedNames[0]}.\n`;
    planMarkdown += `*   **Exploration**: Both games reward thoroughness. Use the same "spiral search" pattern for collectibles.\n\n`;

    planMarkdown += `> [!TIP]\n`;
    planMarkdown += `> If you feel frustrated by a boss in **${selectedNames[0]}**, switch to **${selectedNames[1]}** for 45 minutes. The change in pace will refresh your cognitive focus!`;

    setOptimizationPlan(planMarkdown);
    setIsOptimizing(false);
  }, [selectedOptimizationGames]);


  if (!feature) {
    return (
      <div className="container mx-auto px-4 py-8 mt-16">
        <Card>
          <h2 className="text-2xl font-bold text-red-500 mb-4">Feature Not Found</h2>
          <p className="text-gray-400">The requested feature ID "{featureId}" could not be found in our list of features.</p>
          <Button className="mt-4" onClick={() => window.history.back()}>
            Go Back
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 mt-16">
      <Card>
        <div className="flex items-center mb-4">
          <span className="text-5xl mr-4">{feature.icon}</span>
          <h1 className="text-4xl font-extrabold text-blue-400">{feature.name}</h1>
        </div>
        <p className="text-lg text-gray-300 mb-6">{feature.description}</p>

        {/* Feature-specific content */}

        {/* Weekly Challenge System */}
        {feature.id === 'challenges' && (
          <div className="mt-8 pt-6 border-t border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-4">Weekly Trophy Challenges</h2>
            <p className="text-gray-400 mb-4">
              Complete these rotating challenges to earn exclusive badges and showcase your skills!
            </p>
            {!user ? (
              <Card className="bg-gray-700 text-center py-6">
                <p className="text-lg text-blue-300 font-semibold">Please log in to view and participate in challenges!</p>
                <p className="text-gray-400 text-sm mt-2">Earn unique badges and join the competition.</p>
              </Card>
            ) : (
              <>
                {challengeActionMessage && (
                  <p className="text-center text-sm font-medium text-blue-400 mb-4">
                    {challengeActionMessage}
                  </p>
                )}
                {activeChallenges.length > 0 ? (
                  <div className="space-y-6">
                    {activeChallenges.map((challenge) => {
                      const badge = DUMMY_BADGES.find(b => b.id === challenge.badgeId);
                      return (
                        <Card key={challenge.id} className={`p-5 flex flex-col ${challenge.isClaimed ? 'bg-gray-700 border-green-600' : challenge.isCompleted ? 'bg-gray-700 border-blue-600' : 'bg-gray-800 border-gray-600'}`}>
                          <h3 className="text-xl font-semibold text-white mb-2">{challenge.name}</h3>
                          <p className="text-gray-300 mb-3">{challenge.description}</p>
                          {challenge.trophyGoalExample && (
                            <p className="text-sm text-gray-500 italic mb-3">Example: "{challenge.trophyGoalExample}"</p>
                          )}
                          <div className="flex items-center mb-4">
                            <span className="text-2xl mr-2">{badge?.icon || '❓'}</span>
                            <span className="text-md font-medium text-purple-300">Reward: {badge?.name || 'Unknown Badge'}</span>
                          </div>
                          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mt-auto pt-4 border-t border-gray-700">
                            <Button
                              onClick={() => handleMarkChallengeComplete(challenge.id, challenge.name)}
                              isLoading={isProcessingChallenge}
                              disabled={isProcessingChallenge || challenge.isCompleted}
                              variant={challenge.isCompleted ? 'secondary' : 'primary'}
                            >
                              {challenge.isCompleted ? 'Completed! ✅' : 'Mark Complete'}
                            </Button>
                            <Button
                              onClick={() => handleClaimChallengeBadge(challenge.id, challenge.badgeId, challenge.name)}
                              isLoading={isProcessingChallenge}
                              disabled={isProcessingChallenge || !challenge.isCompleted || challenge.isClaimed}
                              variant={challenge.isClaimed ? 'secondary' : 'outline'}
                            >
                              {challenge.isClaimed ? 'Badge Claimed!' : 'Claim Badge'}
                            </Button>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No challenges available this week. Check back soon!</p>
                )}
              </>
            )}
          </div>
        )}

        {/* Personal Trophy Roadmap */}
        {
          feature.id === 'roadmap' && (
            <div className="mt-8 pt-6 border-t border-gray-700">
              <h2 className="text-2xl font-bold text-white mb-4">Generate Your Trophy Roadmap</h2>
              <p className="text-gray-400 mb-4">AI crafted roadmap based on your goals.</p>
              {!user ? (
                <Card className="bg-gray-700 text-center py-6">
                  <p className="text-lg text-blue-300 font-semibold">Please log in!</p>
                </Card>
              ) : (
                <>
                  {userGoals.length === 0 ? (
                    <Card className="bg-gray-700 text-center py-6">
                      <p className="text-lg text-yellow-300 font-semibold mb-3">No Trophy Goals Set!</p>
                      <Link to="/goals"><Button variant="primary">Go to My Trophy Goals</Button></Link>
                    </Card>
                  ) : (
                    <>
                      <div className="flex flex-col space-y-4 mb-6">
                        <textarea
                          className="w-full p-3 rounded-lg bg-gray-800 border border-gray-600 text-white"
                          rows={3}
                          placeholder="Optional focus..."
                          value={roadmapFocusInput}
                          onChange={(e) => setRoadmapFocusInput(e.target.value)}
                          disabled={isGeneratingRoadmap}
                        ></textarea>
                        <Button onClick={handleGenerateRoadmap} isLoading={isGeneratingRoadmap} disabled={isGeneratingRoadmap}>
                          Generate Roadmap
                        </Button>
                      </div>
                      {roadmapError && <p className="mt-4 text-red-500">{roadmapError}</p>}
                      {roadmapContent && (
                        <Card className="bg-gray-700 border-gray-600">
                          <MarkdownRenderer content={roadmapContent} className="text-gray-200" />
                        </Card>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          )
        }

        {/* Community Features */}
        {
          feature.id === 'community' && (
            <div className="mt-8 pt-6 border-t border-gray-700">
              <h2 className="text-2xl font-bold text-white mb-4">Share a Trophy Tip</h2>
              {!user ? (
                <Card className="bg-gray-700 text-center py-6"><p>Please log in.</p></Card>
              ) : (
                <>
                  <div className="flex flex-col space-y-4">
                    <textarea
                      className="w-full p-3 rounded-lg bg-gray-800 border border-gray-600 text-white"
                      rows={4}
                      placeholder="Enter your trophy hunting tip here..."
                      value={tipInput}
                      onChange={(e) => setTipInput(e.target.value)}
                    ></textarea>
                    <Button onClick={handleSubmitTip} isLoading={isSubmittingTip}>Submit Tip</Button>
                  </div>
                  {tipSubmitStatusMessage && <p className={`mt-4 text-center ${tipSubmitStatus === 'success' ? 'text-green-400' : 'text-red-400'}`}>{tipSubmitStatusMessage}</p>}

                  <div className="mt-10">
                    <h3 className="text-xl font-bold text-blue-300 mb-6">Recent Community Tips 💬</h3>
                    {communityTips.length > 0 ? (
                      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                        {communityTips.map((tip) => (
                          <Card key={tip.id} className="bg-gray-800 border-gray-700 p-4 transform transition-all hover:scale-[1.01]">
                            <div className="flex justify-between items-start mb-2">
                              <span className="font-bold text-blue-400">@{tip.username}</span>
                              <span className="text-[10px] text-gray-500 uppercase">{new Date(tip.timestamp).toLocaleDateString()}</span>
                            </div>
                            <p className="text-gray-300 leading-relaxed">{tip.tip}</p>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-10 bg-gray-800/50 rounded-xl border border-dashed border-gray-700">
                        <p className="text-gray-500 italic">No tips shared yet for this game. Be the first to help fellow hunters!</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )
        }

        {/* Personal Statistics & Analytics */}
        {
          feature.id === 'stats' && (
            <div className="mt-8 pt-6 border-t border-gray-700">
              <h2 className="text-2xl font-bold text-white mb-4">Hunter Analytics Dashboard</h2>
              {!user ? (
                <Card className="bg-gray-700 text-center py-6"><p>Please log in.</p></Card>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="bg-gray-800 p-4">
                      <h3 className="text-lg font-bold text-blue-300 mb-3">Goal Progress</h3>
                      <div className="w-full bg-gray-700 rounded-full h-2.5">
                        <div
                          className="bg-blue-600 h-2.5 rounded-full"
                          style={{ width: `${getUserStats().goalsTotal > 0 ? (getUserStats().goalsCompleted / getUserStats().goalsTotal) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </Card>
                    <Card className="bg-gray-800 p-4">
                      <h3 className="text-lg font-bold text-purple-300 mb-3">Community</h3>
                      <p className="text-2xl font-bold text-white">{getUserStats().tipsCount} Tips</p>
                    </Card>
                  </div>

                  <Card className="bg-gray-800 p-4">
                    <h3 className="text-lg font-bold text-white mb-4">Global Trophy Collection</h3>
                    <div className="flex justify-around">
                      {[
                        { l: 'Platinum', i: '🏆', v: Object.values(getUserStats().gameTrophyCounts).reduce((acc: number, curr: any) => acc + (curr.platinum || 0), 0) },
                        { l: 'Gold', i: '🥇', v: Object.values(getUserStats().gameTrophyCounts).reduce((acc: number, curr: any) => acc + (curr.gold || 0), 0) },
                        { l: 'Silver', i: '🥈', v: Object.values(getUserStats().gameTrophyCounts).reduce((acc: number, curr: any) => acc + (curr.silver || 0), 0) },
                        { l: 'Bronze', i: '🥉', v: Object.values(getUserStats().gameTrophyCounts).reduce((acc: number, curr: any) => acc + (curr.bronze || 0), 0) },
                      ].map(t => (
                        <div key={t.l} className="text-center">
                          <div className="text-2xl">{t.i}</div>
                          <div className="text-xl font-bold text-white">{t.v}</div>
                          <div className="text-[10px] text-gray-500 uppercase">{t.l}</div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                    <h3 className="text-xl font-bold text-white mb-2">Completion Predictor 🔮</h3>
                    <div className="flex space-x-4">
                      <select className="flex-1 p-2 bg-gray-900 text-white" value={predictionGameId} onChange={(e) => setPredictionGameId(e.target.value)}>
                        <option value="">Select game...</option>
                        {DUMMY_GAMES.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                      </select>
                      <Button onClick={handlePredictCompletion} isLoading={isPredicting}>Predict</Button>
                    </div>
                    {predictionResult && <div className="mt-4"><MarkdownRenderer content={predictionResult} /></div>}
                  </div>
                </div>
              )}
            </div>
          )}

        {/* Cross-Game Optimization */}
        {feature.id === 'cross-game' && (
          <div className="mt-8 pt-6 border-t border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-4">Trophy Efficiency Architect</h2>
            <p className="text-gray-300 mb-6">Select up to 3 games to generate an optimized cross-title hunting plan.</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              {DUMMY_GAMES.map(game => {
                const isSelected = selectedOptimizationGames.includes(game.id);
                return (
                  <button
                    key={game.id}
                    onClick={() => handleToggleOptimizationGame(game.id)}
                    className={`p-3 rounded-xl border text-sm font-medium transition-all ${isSelected
                      ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-900/20'
                      : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500'
                      }`}
                  >
                    {game.name}
                  </button>
                );
              })}
            </div>

            <div className="flex justify-center mb-8">
              <Button
                onClick={handleGenerateOptimization}
                disabled={selectedOptimizationGames.length < 2 || isOptimizing}
                isLoading={isOptimizing}
                variant="primary"
                className="px-8 py-3 text-lg"
              >
                {selectedOptimizationGames.length < 2
                  ? 'Select 2+ Games'
                  : 'Generate Efficiency Plan'}
              </Button>
            </div>

            {optimizationPlan && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Card className="bg-gray-800/50 border-gray-700 p-6">
                  <MarkdownRenderer content={optimizationPlan} />
                </Card>
              </div>
            )}
          </div>
        )}

        {/* Intelligent Game Guidance */}
        {feature.id === 'guidance' && (
          <div className="mt-8 pt-6 border-t border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-4">Get Game Guidance</h2>
            {!user ? (
              <Card className="bg-gray-700 text-center py-6"><p>Please log in.</p></Card>
            ) : (
              <>
                <div className="flex flex-col space-y-4 mb-6 bg-gray-800 p-4 rounded-xl border border-gray-700">
                  <div className="flex space-x-2">
                    <input type="text" className="flex-1 p-2 bg-gray-900 border border-gray-700 rounded text-white text-sm" placeholder="Search game..." value={gameSearchQuery} onChange={(e) => setGameSearchQuery(e.target.value)} />
                    <select className="flex-1 p-2 bg-gray-900 border border-gray-700 rounded text-white text-sm" value={selectedGame?.id || ''} onChange={(e) => setSelectedGame(DUMMY_GAMES.find(g => g.id === e.target.value) || null)}>
                      <option value="">-- Select Game --</option>
                      {displayedGames.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                    </select>
                  </div>
                  <textarea
                    className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-white text-sm"
                    rows={4}
                    placeholder="Describe your current progress or where you're stuck (e.g., 'Just finished the main story, looking for remaining collectibles')..."
                    value={progressInput}
                    onChange={(e) => setProgressInput(e.target.value)}
                  ></textarea>
                  <Button onClick={handleGetHints} isLoading={isGettingHints} className="w-full">Get AI Guidance</Button>
                </div>

                {guidanceError && (
                  <div className="mb-6 p-4 bg-red-900/30 border border-red-500/50 rounded-xl text-red-200 text-sm">
                    ⚠️ {guidanceError}
                  </div>
                )}

                {guidanceResponse && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div>
                      <h3 className="text-lg font-bold text-blue-300 mb-3 flex items-center">
                        <span className="mr-2">💡</span> Strategic Hints
                      </h3>
                      <Card className="bg-gray-800 border-gray-700 p-4">
                        <MarkdownRenderer content={guidanceResponse.hints} />
                      </Card>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-yellow-400 mb-3 flex items-center">
                        <span className="mr-2">⚠️</span> Missable Trophy Warnings
                      </h3>
                      <Card className="bg-gray-800 border-gray-700 p-4 border-l-4 border-l-yellow-600">
                        <MarkdownRenderer content={guidanceResponse.missables} />
                      </Card>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-green-400 mb-3 flex items-center">
                        <span className="mr-2">⚔️</span> Effective Strategies
                      </h3>
                      <Card className="bg-gray-800 border-gray-700 p-4">
                        <MarkdownRenderer content={guidanceResponse.strategies} />
                      </Card>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        <Button className="mt-6" onClick={() => window.history.back()}>
          Back to Home
        </Button>
      </Card>
    </div >
  );
};

export default GenericFeaturePage;