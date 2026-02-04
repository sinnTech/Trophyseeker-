import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User, FriendUser, FriendRequest, FriendRequestStatus, SimulatedUserStats, TrophyTip, TrophyGoal, Badge, Challenge, UserChallenge, GameTrophyCounts } from '../types';
import { DUMMY_USERS_FOR_FRIENDS, DUMMY_BADGES, DUMMY_CHALLENGES, DUMMY_GAMES } from '../constants';

interface AuthContextType {
  user: User | null;
  login: (username: string) => void;
  logout: () => void;
  sendFriendRequest: (receiver: FriendUser) => Promise<boolean>;
  acceptFriendRequest: (requestId: string) => Promise<boolean>;
  declineFriendRequest: (requestId: string) => Promise<boolean>;
  removeFriend: (friendId: string) => Promise<boolean>;
  getUserStats: (targetUserId?: string) => SimulatedUserStats;
  getUserGoals: () => TrophyGoal[]; // New: Function to get current user's goals
  getEarnedBadges: () => Badge[]; // NEW: Function to get current user's earned badges
  markChallengeComplete: (challengeId: string) => Promise<boolean>; // NEW: Mark a challenge as completed
  claimChallengeBadge: (challengeId: string) => Promise<boolean>; // NEW: Claim badge for a completed challenge
  connectPsn: () => Promise<{ success: boolean; friendsFound: number }>;
  disconnectPsn: () => Promise<boolean>; // NEW: Disconnect from PSN
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // Helper to generate random trophy counts for a game (for the current user)
  const generateRandomUserTrophies = useCallback((): { [gameId: string]: GameTrophyCounts } => {
    const counts: { [gameId: string]: GameTrophyCounts } = {};
    DUMMY_GAMES.forEach(game => {
      if (Math.random() > 0.3) { // 70% chance to have played a game
        counts[game.id] = {
          platinum: Math.random() > 0.8 ? (Math.random() > 0.5 ? 1 : 0) : 0, // Lower chance of platinum
          gold: Math.floor(Math.random() * 4),
          silver: Math.floor(Math.random() * 8),
          bronze: Math.floor(Math.random() * 15) + 3,
        };
      }
    });
    return counts;
  }, []);

  // Helper to save user data to localStorage (keyed by username)
  const saveUserToLocalStorage = useCallback((currentUser: User) => {
    localStorage.setItem(`trophySeekerUser_${currentUser.username}`, JSON.stringify(currentUser));
  }, []);

  // Helper to update user state and localStorage
  const updateUserState = useCallback((updater: (prevUser: User) => User) => {
    setUser(prevUser => {
      if (!prevUser) return null;
      const updatedUser = updater(prevUser);
      saveUserToLocalStorage(updatedUser); // This will use updatedUser.username
      return updatedUser;
    });
  }, [saveUserToLocalStorage]);

  // Generate a consistent "week ID" for challenges
  const getWeekId = useCallback(() => {
    const today = new Date();
    // Get the first day of the current week (Sunday)
    const startOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
    return startOfWeek.toDateString(); // e.g., "Sun Jul 21 2024"
  }, []);

  // Helper to initialize or refresh weekly challenges for a user
  const initializeChallengesForUser = useCallback((userToUpdate: User): User => {
    const currentWeekId = getWeekId();
    const storedChallengesKey = `trophySeekerChallenges_${userToUpdate.username}_${currentWeekId}`; // Keyed by username
    const storedChallengesData = localStorage.getItem(storedChallengesKey);
    let loadedChallenges: UserChallenge[] = [];

    if (storedChallengesData) {
      try {
        loadedChallenges = JSON.parse(storedChallengesData);
      } catch (e) {
        console.error("Error parsing stored challenges, regenerating.", e);
        // If parsing fails, proceed to generate new challenges
      }
    }

    // If no challenges were loaded or the loaded challenges array is empty, generate new ones
    if (!loadedChallenges || loadedChallenges.length === 0) {
      const selectedChallenges: UserChallenge[] = [];
      const availableChallenges = [...DUMMY_CHALLENGES];
      const numChallenges = Math.min(3, availableChallenges.length); // Max 3 challenges per week

      for (let i = 0; i < numChallenges; i++) {
        const randomIndex = Math.floor(Math.random() * availableChallenges.length);
        const challenge = availableChallenges.splice(randomIndex, 1)[0]; // Remove to prevent duplicates
        selectedChallenges.push({
          ...challenge,
          isCompleted: false,
          isClaimed: false,
          weekId: currentWeekId,
        });
      }
      userToUpdate.activeChallenges = selectedChallenges;
      localStorage.setItem(storedChallengesKey, JSON.stringify(selectedChallenges));
    } else {
      userToUpdate.activeChallenges = loadedChallenges;
    }
    return userToUpdate;
  }, [getWeekId]);

  // Effect to load user from localStorage on initial app load
  useEffect(() => {
    // --- One-time cleanup for old 'trophySeekerUser' key ---
    // If the old generic key exists, remove it. This ensures we don't accidentally load old structure.
    if (localStorage.getItem('trophySeekerUser')) {
      localStorage.removeItem('trophySeekerUser');
    }
    // --- End cleanup ---

    const lastLoggedInUsername = localStorage.getItem('lastLoggedInUsername');
    if (lastLoggedInUsername) {
      const storedUser = localStorage.getItem(`trophySeekerUser_${lastLoggedInUsername}`);
      if (storedUser) {
        try {
          let loadedUser: User = JSON.parse(storedUser);

          // Ensure all new fields are initialized if missing from old data
          if (!loadedUser.friendRequestsSent) loadedUser.friendRequestsSent = [];
          if (!loadedUser.friendRequestsReceived) loadedUser.friendRequestsReceived = [];
          if (!loadedUser.friendsList) loadedUser.friendsList = [];
          if (!loadedUser.earnedBadges) loadedUser.earnedBadges = [];
          if (!loadedUser.activeChallenges) loadedUser.activeChallenges = [];
          if (!loadedUser.gameTrophyCounts) {
            loadedUser.gameTrophyCounts = generateRandomUserTrophies();
          }
          if (loadedUser.isPsnConnected === undefined) loadedUser.isPsnConnected = false; // Initialize new field

          // Simulate an incoming friend request if the user has no pending requests
          // This ensures a new user (or a user without previous requests) gets one for demo purposes
          if (loadedUser.friendRequestsReceived.length === 0) {
            const potentialSender = DUMMY_USERS_FOR_FRIENDS.find(d => d.user.username === 'TrophyTitan');
            if (potentialSender) {
              const simulatedRequest: FriendRequest = {
                id: `req_${Date.now()}`,
                senderId: potentialSender.user.id,
                senderUsername: potentialSender.user.username,
                receiverId: loadedUser.id,
                receiverUsername: loadedUser.username,
                status: FriendRequestStatus.pending,
                timestamp: Date.now() - (1000 * 60 * 60 * 24), // 1 day ago
              };
              loadedUser.friendRequestsReceived.push(simulatedRequest);
            }
          }

          // Initialize/refresh challenges for the current week
          loadedUser = initializeChallengesForUser(loadedUser);

          setUser(loadedUser);
          saveUserToLocalStorage(loadedUser); // Save any updates made in this effect
        } catch (error) {
          console.error('Failed to parse user from localStorage', error);
          localStorage.removeItem(`trophySeekerUser_${lastLoggedInUsername}`); // Clear invalid data
          localStorage.removeItem('lastLoggedInUsername'); // Also clear the last logged in indicator
        }
      } else {
        localStorage.removeItem('lastLoggedInUsername'); // Clear if user data doesn't exist for this username
      }
    }
  }, [saveUserToLocalStorage, generateRandomUserTrophies, initializeChallengesForUser]);

  // Login function
  const login = useCallback((username: string) => {
    let userToLoad: User | null = null;
    const storedUser = localStorage.getItem(`trophySeekerUser_${username}`);

    if (storedUser) {
      userToLoad = JSON.parse(storedUser);
      // Ensure new fields are initialized for old users if they load
      if (!userToLoad.friendRequestsSent) userToLoad.friendRequestsSent = [];
      if (!userToLoad.friendRequestsReceived) userToLoad.friendRequestsReceived = [];
      if (!userToLoad.friendsList) userToLoad.friendsList = [];
      if (!userToLoad.earnedBadges) userToLoad.earnedBadges = [];
      if (!userToLoad.activeChallenges) userToLoad.activeChallenges = [];
      if (!userToLoad.gameTrophyCounts) {
        userToLoad.gameTrophyCounts = generateRandomUserTrophies();
      }
      if (userToLoad.isPsnConnected === undefined) userToLoad.isPsnConnected = false; // Initialize new field
    } else {
      // New user registration
      const newUserId = `user_${Date.now()}`; // Generate a unique ID for the new user
      userToLoad = {
        id: newUserId,
        username,
        friendRequestsSent: [],
        friendRequestsReceived: [],
        friendsList: [],
        earnedBadges: [], // Initialize earned badges for new user
        activeChallenges: [], // Will be set by initializeChallengesForUser
        gameTrophyCounts: generateRandomUserTrophies(), // Generate trophy counts for new user
        isPsnConnected: false, // Default to false for new users
      };

      // Simulate an initial incoming friend request for a brand new user
      const potentialSender = DUMMY_USERS_FOR_FRIENDS.find(d => d.user.username === 'TrophyTitan');
      if (potentialSender) {
        const simulatedRequest: FriendRequest = {
          id: `req_${Date.now()}`,
          senderId: potentialSender.user.id,
          senderUsername: potentialSender.user.username,
          receiverId: userToLoad.id,
          receiverUsername: userToLoad.username,
          status: FriendRequestStatus.pending,
          timestamp: Date.now() - (1000 * 60 * 60 * 24), // 1 day ago
        };
        userToLoad.friendRequestsReceived.push(simulatedRequest);
      }
    }

    // Initialize/refresh challenges for the current week for the logged-in user
    userToLoad = initializeChallengesForUser(userToLoad);

    setUser(userToLoad);
    saveUserToLocalStorage(userToLoad); // Save the (potentially new) user or updated existing user
    localStorage.setItem('lastLoggedInUsername', username); // Remember who last logged in
  }, [saveUserToLocalStorage, generateRandomUserTrophies, initializeChallengesForUser]);

  // Logout function
  const logout = useCallback(() => {
    setUser(null); // Clear current user state
    localStorage.removeItem('lastLoggedInUsername'); // Forget who was last logged in
    // User-specific data (goals, tips, badges, etc.) remains in localStorage
    // keyed by username, so it can be retrieved on next login with that username.
  }, []);

  const sendFriendRequest = useCallback(async (receiver: FriendUser): Promise<boolean> => {
    if (!user) return false;

    // Simulate latency
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check if request already exists (sent or received) or already friends
    const isAlreadyFriends = user.friendsList?.some(f => f.id === receiver.id);
    const hasPendingSent = user.friendRequestsSent?.some(r => r.receiverId === receiver.id && r.status === FriendRequestStatus.pending);
    const hasPendingReceived = user.friendRequestsReceived?.some(r => r.senderId === receiver.id && r.status === FriendRequestStatus.pending);

    if (isAlreadyFriends || hasPendingSent || hasPendingReceived) {
      console.warn('Friend request already pending or already friends.');
      return false;
    }

    const newRequest: FriendRequest = {
      id: `req_${Date.now()}`,
      senderId: user.id,
      senderUsername: user.username,
      receiverId: receiver.id,
      receiverUsername: receiver.username,
      status: FriendRequestStatus.pending,
      timestamp: Date.now(),
    };

    updateUserState(prevUser => ({
      ...prevUser,
      friendRequestsSent: [...(prevUser.friendRequestsSent || []), newRequest],
    }));

    // In a real app, this would also add the request to the receiver's pending list on the backend.
    // For simulation, we'll just update the sender.
    return true;
  }, [user, updateUserState]);

  const acceptFriendRequest = useCallback(async (requestId: string): Promise<boolean> => {
    if (!user) return false;

    await new Promise(resolve => setTimeout(resolve, 1000));

    let requestToAccept: FriendRequest | undefined;
    updateUserState(prevUser => {
      const updatedReceived = prevUser.friendRequestsReceived?.filter(req => {
        if (req.id === requestId) {
          requestToAccept = { ...req, status: FriendRequestStatus.accepted };
          return false; // Remove from received pending list
        }
        return true;
      }) || [];

      if (!requestToAccept) return prevUser; // Request not found

      const newFriend: FriendUser = {
        id: requestToAccept.senderId,
        username: requestToAccept.senderUsername,
      };

      // Also remove any corresponding sent request if it was there (e.g., if user sent back a request)
      const updatedSent = prevUser.friendRequestsSent?.filter(req =>
        !(req.receiverId === newFriend.id && req.status === FriendRequestStatus.pending)
      ) || [];

      return {
        ...prevUser,
        friendRequestsReceived: updatedReceived,
        friendRequestsSent: updatedSent, // Clean up any matching sent requests
        friendsList: [...(prevUser.friendsList || []), newFriend],
      };
    });

    // In a real app, this would notify the sender that the request was accepted
    return true;
  }, [user, updateUserState]);

  const declineFriendRequest = useCallback(async (requestId: string): Promise<boolean> => {
    if (!user) return false;

    await new Promise(resolve => setTimeout(resolve, 1000));

    updateUserState(prevUser => {
      const updatedReceived = prevUser.friendRequestsReceived?.filter(req => req.id !== requestId) || []; // Simply remove
      // In a real app, the status would be marked as 'declined', but for simple UI, we remove.
      return {
        ...prevUser,
        friendRequestsReceived: updatedReceived,
      };
    });
    return true;
  }, [user, updateUserState]);

  const removeFriend = useCallback(async (friendId: string): Promise<boolean> => {
    if (!user) return false;

    await new Promise(resolve => setTimeout(resolve, 1000));

    updateUserState(prevUser => ({
      ...prevUser,
      friendsList: prevUser.friendsList?.filter(f => f.id !== friendId) || [],
    }));
    // In a real app, this would also remove current user from friend's list on backend
    return true;
  }, [user, updateUserState]);


  const getUserStats = useCallback((targetUserId?: string): SimulatedUserStats => {
    // If targetUserId is provided and it's a dummy user, return their stats
    const dummyFriend = targetUserId ? DUMMY_USERS_FOR_FRIENDS.find(d => d.user.id === targetUserId) : undefined;
    if (dummyFriend) {
      return dummyFriend.stats;
    }

    // If targetUserId is current user's ID or not provided, return current user's actual stats
    if (!user || (targetUserId && targetUserId !== user.id)) {
      // Fallback for non-dummy, non-current user cases (shouldn't happen with current logic)
      return { tipsCount: 0, goalsCompleted: 0, goalsTotal: 0, badgesEarned: 0, gameTrophyCounts: {} };
    }

    const storedTips = localStorage.getItem(`trophySeekerTips_${user.username}`); // Keyed by username
    const tips: TrophyTip[] = storedTips ? JSON.parse(storedTips) : [];
    const tipsCount = tips.length;

    const storedGoals = localStorage.getItem(`trophySeekerGoals_${user.username}`); // Keyed by username
    const goals: TrophyGoal[] = storedGoals ? JSON.parse(storedGoals) : [];
    const goalsCompleted = goals.filter(g => g.isCompleted).length;
    const goalsTotal = goals.length;

    const badgesEarned = user.earnedBadges?.length || 0; // Use the actual earnedBadges array for count
    const gameTrophyCounts = user.gameTrophyCounts || {}; // Include current user's gameTrophyCounts

    return { tipsCount, goalsCompleted, goalsTotal, badgesEarned, gameTrophyCounts };
  }, [user]); // user dependency now implicitly covers user.earnedBadges and user.gameTrophyCounts

  const getUserGoals = useCallback((): TrophyGoal[] => {
    if (!user) return [];
    const storedGoals = localStorage.getItem(`trophySeekerGoals_${user.username}`); // Keyed by username
    return storedGoals ? JSON.parse(storedGoals) : [];
  }, [user]);

  const getEarnedBadges = useCallback((): Badge[] => {
    if (!user || !user.earnedBadges) return [];
    // Map the stored badge IDs to their full Badge objects from DUMMY_BADGES
    // Filter out any potential null/undefined if an ID doesn't match
    // Use a Set to ensure only unique badges are returned, in case duplicates were added by mistake
    const uniqueBadgeIds = new Set(user.earnedBadges.map(b => b.id));
    return Array.from(uniqueBadgeIds).map(badgeId => DUMMY_BADGES.find(b => b.id === badgeId)).filter(Boolean) as Badge[];
  }, [user]); // user dependency now implicitly covers user.earnedBadges

  const markChallengeComplete = useCallback(async (challengeId: string): Promise<boolean> => {
    if (!user) return false;
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

    updateUserState(prevUser => {
      const currentWeekId = getWeekId();
      const updatedChallenges = prevUser.activeChallenges?.map(c => {
        if (c.id === challengeId && c.weekId === currentWeekId && !c.isCompleted) {
          return { ...c, isCompleted: true, completedTimestamp: Date.now() };
        }
        return c;
      }) || [];

      // Update local storage for challenges
      localStorage.setItem(`trophySeekerChallenges_${prevUser.username}_${currentWeekId}`, JSON.stringify(updatedChallenges)); // Keyed by username

      return { ...prevUser, activeChallenges: updatedChallenges };
    });
    return true;
  }, [user, updateUserState, getWeekId]);

  const claimChallengeBadge = useCallback(async (challengeId: string): Promise<boolean> => {
    if (!user) return false;
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

    let badgeToAward: Badge | undefined;
    updateUserState(prevUser => {
      const currentWeekId = getWeekId();
      const updatedChallenges = prevUser.activeChallenges?.map(c => {
        if (c.id === challengeId && c.weekId === currentWeekId && c.isCompleted && !c.isClaimed) {
          // Find the full badge object from DUMMY_BADGES
          badgeToAward = DUMMY_BADGES.find(b => b.id === c.badgeId);
          return { ...c, isClaimed: true };
        }
        return c;
      }) || [];

      if (!badgeToAward) return prevUser; // Challenge not found, not completed, or already claimed

      // Add badge to earnedBadges if not already present (check by id)
      const currentEarnedBadgeIds = new Set(prevUser.earnedBadges?.map(b => b.id) || []);
      const updatedEarnedBadges = currentEarnedBadgeIds.has(badgeToAward.id)
        ? prevUser.earnedBadges // Badge already exists, no change
        : [...(prevUser.earnedBadges || []), badgeToAward]; // Add new badge

      // Update local storage for challenges
      localStorage.setItem(`trophySeekerChallenges_${prevUser.username}_${currentWeekId}`, JSON.stringify(updatedChallenges)); // Keyed by username

      return { ...prevUser, activeChallenges: updatedChallenges, earnedBadges: updatedEarnedBadges };
    });
    return !!badgeToAward; // Return true if a badge was successfully awarded
  }, [user, updateUserState, getWeekId]);

  const connectPsn = useCallback(async (): Promise<{ success: boolean; friendsFound: number }> => {
    if (!user || user.isPsnConnected) return { success: false, friendsFound: 0 };

    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call

    try {
      // Calculate new friends FIRST using the current 'user' state
      const existingFriendIds = new Set(user.friendsList?.map(f => f.id) || []);
      const existingSentRequests = new Set(user.friendRequestsSent?.map(r => r.receiverId) || []);
      const existingReceivedRequests = new Set(user.friendRequestsReceived?.map(r => r.senderId) || []);

      const potentialNewFriends = DUMMY_USERS_FOR_FRIENDS.filter(dummyFriend =>
        dummyFriend.user.id !== user.id &&
        !existingFriendIds.has(dummyFriend.user.id) &&
        !existingSentRequests.has(dummyFriend.user.id) &&
        !existingReceivedRequests.has(dummyFriend.user.id)
      );

      const friendsToAdd: FriendUser[] = [];
      const numToAdd = Math.min(3, potentialNewFriends.length);
      for (let i = 0; i < numToAdd; i++) {
        const randomIndex = Math.floor(Math.random() * potentialNewFriends.length);
        const newFriend = potentialNewFriends.splice(randomIndex, 1)[0];
        friendsToAdd.push(newFriend.user);
      }

      updateUserState(prevUser => ({
        ...prevUser,
        isPsnConnected: true,
        friendsList: [...(prevUser.friendsList || []), ...friendsToAdd],
      }));

      return { success: true, friendsFound: friendsToAdd.length };
    } catch (error) {
      console.error("PSN connection error simulation:", error);
      return { success: false, friendsFound: 0 };
    }
  }, [user, updateUserState]);

  const disconnectPsn = useCallback(async (): Promise<boolean> => {
    if (!user || !user.isPsnConnected) return false;

    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

    updateUserState(prevUser => ({
      ...prevUser,
      isPsnConnected: false,
      // Note: We typically keep the friends found, but disconnect the "link"
    }));

    return true;
  }, [user, updateUserState]);


  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      sendFriendRequest,
      acceptFriendRequest,
      declineFriendRequest,
      removeFriend,
      getUserStats,
      getUserGoals,
      getEarnedBadges, // NEW: Provide getEarnedBadges
      markChallengeComplete, // NEW
      claimChallengeBadge,
      connectPsn,
      disconnectPsn, // NEW
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};