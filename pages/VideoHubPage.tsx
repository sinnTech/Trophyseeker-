import React, { useState, useEffect, useCallback } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import { DUMMY_VIDEOS, DUMMY_GAMES } from '../constants';
import { useAuth } from '../contexts/AuthContext';
import { Game, Video } from '../types';

const VideoHubPage: React.FC = () => {
  const { user } = useAuth();
  const [selectedGameFilter, setSelectedGameFilter] = useState<string>('all');
  const [videoLinkInput, setVideoLinkInput] = useState<string>('');
  const [isSubmittingVideo, setIsSubmittingVideo] = useState<boolean>(false);
  const [videoSubmitStatus, setVideoSubmitStatus] = useState<'success' | 'error' | null>(null);
  const [videoSubmitStatusMessage, setVideoSubmitStatusMessage] = useState<string>('');

  const filteredVideos = DUMMY_VIDEOS.filter(video =>
    selectedGameFilter === 'all' || video.gameId === selectedGameFilter
  ).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)); // Sort by most recent first

  // Reset states when component mounts or user changes
  useEffect(() => {
    setVideoLinkInput('');
    setIsSubmittingVideo(false);
    setVideoSubmitStatus(null);
    setVideoSubmitStatusMessage('');
  }, [user]);

  const isValidYouTubeUrl = (url: string): boolean => {
    // Basic regex for YouTube URL validation and embed extraction
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/(watch\?v=|embed\/|v\/|)([\w-]{11})(.*)?$/;
    return youtubeRegex.test(url);
  };

  const handleSubmitVideo = useCallback(() => {
    if (videoLinkInput.trim() === '') {
      setVideoSubmitStatus('error');
      setVideoSubmitStatusMessage('Video link cannot be empty.');
      return;
    }
    if (!isValidYouTubeUrl(videoLinkInput.trim())) {
      setVideoSubmitStatus('error');
      setVideoSubmitStatusMessage('Please enter a valid YouTube video URL.');
      return;
    }
    if (!user) return; // Should be gated by UI, but good for safety

    setIsSubmittingVideo(true);
    setVideoSubmitStatus(null);
    setVideoSubmitStatusMessage('Submitting video for review...');

    setTimeout(() => {
      setIsSubmittingVideo(false);
      const success = Math.random() > 0.2; // 80% chance of success for demo

      if (success) {
        setVideoSubmitStatus('success');
        setVideoSubmitStatusMessage('Video submitted for review! Thanks for your contribution! 🎉');
        setVideoLinkInput(''); // Clear input on success
      } else {
        setVideoSubmitStatus('error');
        setVideoSubmitStatusMessage('Failed to submit video. Please try again. 😔');
      }

      setTimeout(() => {
        setVideoSubmitStatusMessage('');
        setVideoSubmitStatus(null);
      }, 5000);
    }, 2500); // Simulate 2.5 seconds submission time
  }, [videoLinkInput, user]);

  return (
    <div className="container mx-auto px-4 py-8 mt-16">
      <Card>
        <div className="flex items-center mb-4">
          <span className="text-5xl mr-4">📹</span>
          <h1 className="text-4xl font-extrabold text-blue-400">Video Hub</h1>
        </div>
        <p className="text-lg text-gray-300 mb-6">
          Explore helpful game hints, short clips, and community-shared trophy moments!
        </p>

        {/* Video Filter */}
        <div className="mb-8 p-4 bg-gray-700 rounded-lg">
          <label htmlFor="game-filter" className="block text-gray-300 text-sm font-medium mb-2">
            Filter by Game:
          </label>
          <select
            id="game-filter"
            className="w-full md:w-1/2 p-3 rounded-lg bg-gray-800 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedGameFilter}
            onChange={(e) => setSelectedGameFilter(e.target.value)}
            aria-label="Filter videos by game"
          >
            <option value="all">All Games</option>
            {DUMMY_GAMES.map((game) => (
              <option key={game.id} value={game.id}>{game.name}</option>
            ))}
          </select>
        </div>

        {/* Video Feed */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredVideos.length > 0 ? (
            filteredVideos.map((video) => (
              <Card key={video.id} className="p-4 bg-gray-700 border-gray-600 flex flex-col h-full">
                <h3 className="text-xl font-semibold text-white mb-3">{video.title}</h3>
                <div className="relative w-full aspect-video mb-3 bg-gray-800 rounded-lg overflow-hidden">
                  <iframe
                    className="absolute top-0 left-0 w-full h-full"
                    src={video.embedUrl}
                    title={video.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                    loading="lazy"
                    aria-label={`Embedded video: ${video.title}`}
                  ></iframe>
                </div>
                <p className="text-sm text-gray-400">
                  Game: <span className="font-medium text-blue-300">{DUMMY_GAMES.find(g => g.id === video.gameId)?.name || 'Unknown'}</span>
                </p>
                {video.uploader && (
                  <p className="text-xs text-gray-500 mt-1">
                    Uploaded by: {video.uploader} {video.timestamp ? `on ${new Date(video.timestamp).toLocaleDateString()}` : ''}
                  </p>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 self-start"
                  onClick={() => {
                    const videoId = video.embedUrl.split('/').pop()?.split('?')[0];
                    const watchUrl = videoId ? `https://www.youtube.com/watch?v=${videoId}` : video.embedUrl;
                    window.open(watchUrl, '_blank');
                  }}
                >
                  Watch on YouTube 🔗
                </Button>
              </Card>
            ))
          ) : (
            <div className="md:col-span-3 text-center text-gray-500 italic">No videos found for this filter.</div>
          )}
        </div>

        {/* Video Submission (Login Gated) */}
        <div className="mt-8 pt-6 border-t border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-4">Submit Your Video</h2>
          <p className="text-gray-400 mb-4">
            Share your awesome trophy clips, guides, or speedruns with the community! (YouTube links only).
          </p>
          {!user ? (
            <Card className="bg-gray-700 text-center py-6">
              <p className="text-lg text-blue-300 font-semibold">Please log in to submit videos!</p>
              <p className="text-gray-400 text-sm mt-2">Your content helps fellow hunters on their journey.</p>
            </Card>
          ) : (
            <>
              <div className="flex flex-col space-y-4">
                <label htmlFor="video-link-input" className="block text-gray-300 text-sm font-medium">YouTube Video URL:</label>
                <input
                  type="url"
                  id="video-link-input"
                  className="w-full p-3 rounded-lg bg-gray-800 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                  value={videoLinkInput}
                  onChange={(e) => setVideoLinkInput(e.target.value)}
                  disabled={isSubmittingVideo}
                  aria-label="YouTube video URL input"
                />
                <Button
                  onClick={handleSubmitVideo}
                  isLoading={isSubmittingVideo}
                  disabled={isSubmittingVideo || videoLinkInput.trim() === ''}
                  className="flex items-center justify-center self-start"
                  aria-live="polite"
                >
                  {isSubmittingVideo ? (
                    <>
                      <LoadingSpinner />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.5 17h.01M12 11V6a1 1 0 00-1-1H9a1 1 0 00-1 1v5h2a2 2 0 012 2v2m-3 0h6m-3-6a9 9 0 110-18 9 9 0 010 18z" />
                      </svg>
                      Submit Video
                    </>
                  )}
                </Button>
              </div>
              {videoSubmitStatusMessage && (
                <p
                  className={`mt-4 text-sm font-medium ${videoSubmitStatus === 'success' ? 'text-green-500' : 'text-red-500'
                    }`}
                  aria-live="assertive"
                >
                  {videoSubmitStatusMessage}
                </p>
              )}
            </>
          )}
        </div>

        <Button className="mt-6" onClick={() => window.history.back()}>
          Back to Home
        </Button>
      </Card>
    </div>
  );
};

export default VideoHubPage;