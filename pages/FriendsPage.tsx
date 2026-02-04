import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';
import { FriendUser, FriendRequest, FriendRequestStatus, GameTrophyCounts } from '../types';
import { DUMMY_USERS_FOR_FRIENDS, DUMMY_GAMES } from '../constants';

const FriendsPage: React.FC = () => {
  const { user, sendFriendRequest, acceptFriendRequest, declineFriendRequest, removeFriend, getUserStats, connectPsn, disconnectPsn } = useAuth();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<FriendUser[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchStatusMessage, setSearchStatusMessage] = useState<string>('');
  const [isProcessingRequest, setIsProcessingRequest] = useState<boolean>(false);
  const [isConnectingPsn, setIsConnectingPsn] = useState<boolean>(false); // New state for PSN connection loading
  const [psnConnectMessage, setPsnConnectMessage] = useState<string>(''); // New state for PSN connection message

  // State to manage which friend's game comparison is expanded
  const [expandedFriendGames, setExpandedFriendGames] = useState<Set<string>>(new Set());

  const toggleGameComparison = useCallback((friendId: string) => {
    setExpandedFriendGames(prev => {
      const newSet = new Set(prev);
      if (newSet.has(friendId)) {
        newSet.delete(friendId);
      } else {
        newSet.add(friendId);
      }
      return newSet;
    });
  }, []);

  // Memoized lists for pending requests and current friends
  const receivedRequests = useMemo(() =>
    user?.friendRequestsReceived?.filter(req => req.status === FriendRequestStatus.pending) || [],
    [user?.friendRequestsReceived]
  );

  const sentRequests = useMemo(() =>
    user?.friendRequestsSent?.filter(req => req.status === FriendRequestStatus.pending) || [],
    [user?.friendRequestsSent]
  );

  const friendsList = useMemo(() =>
    user?.friendsList || [],
    [user?.friendsList]
  );

  // User's own stats
  const currentUserStats = useMemo(() => getUserStats(user?.id), [user, getUserStats]);

  const handleSearch = useCallback(async () => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      setSearchStatusMessage('');
      return;
    }
    if (!user) {
      setSearchStatusMessage('Please log in to search for users.');
      return;
    }

    setIsSearching(true);
    setSearchStatusMessage('Searching...');
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

    const lowerCaseQuery = searchQuery.toLowerCase();
    const results = DUMMY_USERS_FOR_FRIENDS
      .filter(dummy =>
        dummy.user.username.toLowerCase().includes(lowerCaseQuery) && dummy.user.id !== user.id // Don't show self
      )
      .map(dummy => dummy.user);

    setSearchResults(results);
    setSearchStatusMessage(results.length > 0 ? '' : 'No users found.');
    setIsSearching(false);
  }, [searchQuery, user]);

  const handleSendRequest = useCallback(async (receiver: FriendUser) => {
    if (!user || isProcessingRequest) return;
    setIsProcessingRequest(true);
    const success = await sendFriendRequest(receiver);
    if (success) {
      alert(`Friend request sent to ${receiver.username}!`);
    } else {
      alert(`Failed to send request to ${receiver.username}. Already friends or request pending?`);
    }
    setIsProcessingRequest(false);
  }, [user, isProcessingRequest, sendFriendRequest]);

  const handleAcceptRequest = useCallback(async (requestId: string, senderUsername: string) => {
    if (!user || isProcessingRequest) return;
    setIsProcessingRequest(true);
    const success = await acceptFriendRequest(requestId);
    if (success) {
      alert(`Accepted request from ${senderUsername}!`);
    } else {
      alert(`Failed to accept request from ${senderUsername}.`);
    }
    setIsProcessingRequest(false);
  }, [user, isProcessingRequest, acceptFriendRequest]);

  const handleDeclineRequest = useCallback(async (requestId: string, senderUsername: string) => {
    if (!user || isProcessingRequest) return;
    setIsProcessingRequest(true);
    const success = await declineFriendRequest(requestId);
    if (success) {
      alert(`Declined request from ${senderUsername}.`);
    } else {
      alert(`Failed to decline request from ${senderUsername}.`);
    }
    setIsProcessingRequest(false);
  }, [user, isProcessingRequest, declineFriendRequest]);

  const handleRemoveFriend = useCallback(async (friendId: string, friendUsername: string) => {
    if (!user || isProcessingRequest) return;
    if (!window.confirm(`Are you sure you want to unfriend ${friendUsername}?`)) return;

    setIsProcessingRequest(true);
    const success = await removeFriend(friendId);
    if (success) {
      alert(`Successfully unfriended ${friendUsername}.`);
    } else {
      alert(`Failed to unfriend ${friendUsername}.`);
    }
    setIsProcessingRequest(false);
  }, [user, isProcessingRequest, removeFriend]);

  const handlePsnConnect = useCallback(async () => {
    if (!user || user.isPsnConnected || isConnectingPsn) return;

    setIsConnectingPsn(true);
    setPsnConnectMessage('Connecting to PlayStation Network...');

    const result = await connectPsn();

    setIsConnectingPsn(false);
    if (result.success) {
      let message = 'Successfully connected to PlayStation Network!';
      if (result.friendsFound > 0) {
        message += ` ${result.friendsFound} new friend(s) found!`;
      }
      setPsnConnectMessage(message);
    } else {
      setPsnConnectMessage('Failed to connect to PlayStation Network. Please try again.');
    }

    setTimeout(() => setPsnConnectMessage(''), 5000); // Clear message after 5 seconds
  }, [user, isConnectingPsn, connectPsn]);

  const handlePsnDisconnect = useCallback(async () => {
    if (!user || !user.isPsnConnected || isConnectingPsn) return;

    if (!window.confirm('Are you sure you want to disconnect your PlayStation account? Your found friends will remain, but the link will be removed.')) return;

    setIsConnectingPsn(true);
    setPsnConnectMessage('Disconnecting...');

    const success = await disconnectPsn();

    setIsConnectingPsn(false);
    if (success) {
      setPsnConnectMessage('Disconnected from PlayStation Network.');
    } else {
      setPsnConnectMessage('Failed to disconnect. Please try again.');
    }

    setTimeout(() => setPsnConnectMessage(''), 5000);
  }, [user, isConnectingPsn, disconnectPsn]);

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 mt-16">
        <Card className="text-center py-10">
          <h1 className="text-3xl font-bold text-red-400 mb-4">Access Denied</h1>
          <p className="text-xl text-blue-300 font-semibold mb-4">Please log in to manage your friends.</p>
          <p className="text-gray-400 text-sm mb-6">Connect with fellow trophy hunters and compare progress!</p>
          <Button onClick={() => window.location.hash = '#/'} variant="primary">
            Go to Home & Login
          </Button>
        </Card>
      </div>
    );
  }

  const renderTrophyCounts = (trophies: GameTrophyCounts | undefined) => {
    if (!trophies) {
      return <span className="text-gray-500 text-sm italic">N/A</span>;
    }
    return (
      <div className="flex items-center space-x-2 text-sm md:text-base">
        <span className="text-purple-400 font-bold" title="Platinum">{trophies.platinum}🏆</span>
        <span className="text-yellow-400 font-bold" title="Gold">{trophies.gold}🥇</span>
        <span className="text-gray-300 font-bold" title="Silver">{trophies.silver}🥈</span>
        <span className="text-orange-400 font-bold" title="Bronze">{trophies.bronze}🥉</span>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 mt-16">
      <Card>
        <div className="flex items-center mb-6 border-b border-gray-700 pb-4">
          <span className="text-5xl mr-4">🤝</span>
          <div>
            <h1 className="text-4xl font-extrabold text-blue-400">Friend Network</h1>
            <p className="text-lg text-gray-300">Connect and compare with other hunters</p>
          </div>
        </div>

        {/* Search for Hunters Section */}
        <div className="mt-8 pt-6 border-t border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-4">Search for Hunters</h2>
          <p className="text-gray-400 mb-4">
            Find friends by username to expand your trophy hunting network.
          </p>
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-4">
            <input
              type="text"
              className="flex-1 p-3 rounded-lg bg-gray-800 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={isSearching || isProcessingRequest}
              aria-label="Search for username"
            />
            <Button
              onClick={handleSearch}
              isLoading={isSearching}
              disabled={isSearching || searchQuery.trim() === '' || isProcessingRequest}
              aria-label="Perform user search"
            >
              Search
            </Button>
          </div>
          {searchStatusMessage && (
            <p className="text-sm font-medium text-gray-500 mb-4" aria-live="polite">{searchStatusMessage}</p>
          )}

          {searchResults.length > 0 && (
            <div className="mt-4 space-y-3">
              <h3 className="text-xl font-semibold text-blue-300">Search Results:</h3>
              {searchResults.map((result) => {
                const isFriend = friendsList.some(f => f.id === result.id);
                const isRequestSent = sentRequests.some(req => req.receiverId === result.id);
                const isRequestReceived = receivedRequests.some(req => req.senderId === result.id);

                return (
                  <Card key={result.id} className="flex items-center justify-between p-4 bg-gray-700 border-gray-600">
                    <span className="text-lg font-medium text-white">{result.username}</span>
                    <div>
                      {isFriend ? (
                        <span className="text-green-400 font-semibold">Friends</span>
                      ) : isRequestSent ? (
                        <span className="text-yellow-400 font-semibold">Request Sent</span>
                      ) : isRequestReceived ? (
                        <span className="text-purple-400 font-semibold">Request Received</span>
                      ) : (
                        <Button
                          onClick={() => handleSendRequest(result)}
                          isLoading={isProcessingRequest}
                          disabled={isProcessingRequest}
                          size="sm"
                          aria-label={`Send friend request to ${result.username}`}
                        >
                          Send Request
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Connect via Social Media Section */}
        <div className="mt-8 pt-6 border-t border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-4">Connect via Social Media</h2>
          <p className="text-gray-400 mb-4">
            Link your PlayStation Network account (or other platforms) to automatically find friends!
          </p>
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 items-center">
            <Button
              onClick={handlePsnConnect}
              isLoading={isConnectingPsn && !user.isPsnConnected}
              disabled={isConnectingPsn || user.isPsnConnected}
              className={`flex items-center justify-center ${user.isPsnConnected ? 'bg-green-600 hover:bg-green-600' : 'bg-purple-600 hover:bg-purple-700'}`}
              aria-live="polite"
            >
              {isConnectingPsn && !user.isPsnConnected ? (
                <>
                  <LoadingSpinner className="mr-2" />
                  Connecting...
                </>
              ) : user.isPsnConnected ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Connected to PlayStation ✅
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0H9m7 6l-3-3m0 0l-3 3m3-3v6m-3 0h6m-3-6a9 9 0 110-18 9 9 0 010 18z" />
                  </svg>
                  Connect to PlayStation
                </>
              )}
            </Button>

            {user.isPsnConnected && (
              <Button
                onClick={handlePsnDisconnect}
                isLoading={isConnectingPsn && user.isPsnConnected}
                disabled={isConnectingPsn}
                variant="outline"
                className="flex items-center justify-center border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                aria-live="polite"
              >
                {isConnectingPsn ? (
                  <>
                    <LoadingSpinner className="mr-2" />
                    Disconnecting...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout of PlayStation
                  </>
                )}
              </Button>
            )}
          </div>
          {psnConnectMessage && (
            <p className="mt-4 text-sm font-medium text-blue-400" aria-live="polite">
              {psnConnectMessage}
            </p>
          )}
        </div>


        {/* Friend Requests Section */}
        <div className="mt-8 pt-6 border-t border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-4">Friend Requests</h2>

          {/* Received Requests */}
          <h3 className="text-xl font-semibold text-blue-300 mb-3">Received Requests:</h3>
          {receivedRequests.length > 0 ? (
            <div className="space-y-3 mb-6">
              {receivedRequests.map((request) => (
                <Card key={request.id} className="flex flex-col sm:flex-row items-center justify-between p-4 bg-gray-700 border-yellow-500">
                  <span className="text-lg font-medium text-white mb-2 sm:mb-0">
                    {request.senderUsername}
                    <span className="text-gray-400 text-sm ml-2">(Pending)</span>
                  </span>
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => handleAcceptRequest(request.id, request.senderUsername)}
                      isLoading={isProcessingRequest}
                      disabled={isProcessingRequest}
                      size="sm"
                      aria-label={`Accept request from ${request.senderUsername}`}
                    >
                      Accept
                    </Button>
                    <Button
                      onClick={() => handleDeclineRequest(request.id, request.senderUsername)}
                      isLoading={isProcessingRequest}
                      disabled={isProcessingRequest}
                      variant="secondary"
                      size="sm"
                      aria-label={`Decline request from ${request.senderUsername}`}
                    >
                      Decline
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic mb-6">No new friend requests.</p>
          )}

          {/* Sent Requests */}
          <h3 className="text-xl font-semibold text-blue-300 mb-3">Sent Requests:</h3>
          {sentRequests.length > 0 ? (
            <div className="space-y-3">
              {sentRequests.map((request) => (
                <Card key={request.id} className="flex items-center justify-between p-4 bg-gray-700 border-gray-600">
                  <span className="text-lg font-medium text-white">{request.receiverUsername}</span>
                  <span className="text-yellow-400 font-semibold">Pending</span>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">You haven't sent any pending friend requests.</p>
          )}
        </div>

        {/* My Friends List & Stats Comparison */}
        <div className="mt-8 pt-6 border-t border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-4">My Friends & Stats Comparison</h2>
          {friendsList.length > 0 ? (
            <div className="space-y-6">
              {friendsList.map((friend) => {
                const friendStats = getUserStats(friend.id); // Get simulated stats for the friend
                const isExpanded = expandedFriendGames.has(friend.id);

                return (
                  <Card key={friend.id} className="p-5 bg-gray-700 border-blue-600 flex flex-col">
                    <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-600">
                      <h3 className="text-xl font-semibold text-blue-300">{friend.username}</h3>
                      <Button
                        onClick={() => handleRemoveFriend(friend.id, friend.username)}
                        isLoading={isProcessingRequest}
                        disabled={isProcessingRequest}
                        variant="danger"
                        size="sm"
                        aria-label={`Remove ${friend.username} from friends`}
                      >
                        Remove Friend
                      </Button>
                    </div>

                    {/* Overall Stats Comparison Table/Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center mb-6">
                      {/* Tips Contributed */}
                      <div className="flex flex-col items-center">
                        <span className="text-3xl mb-1">✍️</span>
                        <span className="text-xs text-gray-400">Tips</span>
                        <div className="text-lg font-bold text-white mt-1">
                          {currentUserStats.tipsCount} <span className="text-gray-400">vs</span> {friendStats.tipsCount}
                        </div>
                      </div>
                      {/* Goals Completed */}
                      <div className="flex flex-col items-center">
                        <span className="text-3xl mb-1">✅</span>
                        <span className="text-xs text-gray-400">Goals Done</span>
                        <div className="text-lg font-bold text-white mt-1">
                          {currentUserStats.goalsCompleted} <span className="text-gray-400">vs</span> {friendStats.goalsCompleted}
                        </div>
                      </div>
                      {/* Goals Total */}
                      <div className="flex flex-col items-center">
                        <span className="text-3xl mb-1">🎯</span>
                        <span className="text-xs text-gray-400">Total Goals</span>
                        <div className="text-lg font-bold text-white mt-1">
                          {currentUserStats.goalsTotal} <span className="text-gray-400">vs</span> {friendStats.goalsTotal}
                        </div>
                      </div>
                      {/* Badges Earned */}
                      <div className="flex flex-col items-center">
                        <span className="text-3xl mb-1">🎖️</span>
                        <span className="text-xs text-gray-400">Badges</span>
                        <div className="text-lg font-bold text-white mt-1">
                          {currentUserStats.badgesEarned} <span className="text-gray-400">vs</span> {friendStats.badgesEarned}
                        </div>
                      </div>
                    </div>

                    {/* Game-Specific Trophy Comparison */}
                    <div className="border-t border-gray-600 pt-4">
                      <Button
                        onClick={() => toggleGameComparison(friend.id)}
                        variant="outline"
                        size="sm"
                        className="w-full justify-center"
                        aria-expanded={isExpanded}
                        aria-controls={`game-compare-${friend.id}`}
                      >
                        {isExpanded ? 'Hide Game Trophies' : 'Compare Game Trophies'}
                        <svg
                          className={`h-4 w-4 ml-2 transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                          fill="none" viewBox="0 0 24 24" stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </Button>

                      {isExpanded && (
                        <div id={`game-compare-${friend.id}`} className="mt-4 space-y-4 animate-fade-in">
                          <h4 className="text-lg font-bold text-white">Trophy Breakdown by Game:</h4>
                          {DUMMY_GAMES.map(game => (
                            <div key={game.id} className="p-3 bg-gray-800 rounded-md border border-gray-700">
                              <h5 className="font-semibold text-blue-200 mb-2">{game.name}</h5>
                              <div className="flex flex-col md:flex-row md:items-center md:justify-between text-sm">
                                <div className="mb-2 md:mb-0">
                                  <span className="text-gray-400">You: </span>
                                  {renderTrophyCounts(currentUserStats.gameTrophyCounts?.[game.id])}
                                </div>
                                <div>
                                  <span className="text-gray-400">{friend.username}: </span>
                                  {renderTrophyCounts(friendStats.gameTrophyCounts?.[game.id])}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 italic">You don't have any friends yet. Use the search bar above to connect with other hunters!</p>
          )}
        </div>

        <Button className="mt-8" onClick={() => window.history.back()}>
          Back to Home
        </Button>
      </Card>
    </div>
  );
};

export default FriendsPage;