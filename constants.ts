import { Feature, NavigationItem, Game, Video, Badge, FriendUser, SimulatedUserStats, Challenge, GameTrophyCounts, DummyFriend } from './types';

export const GEMINI_PRO_MODEL = 'models/gemini-flash-latest';

export const FEATURES: Feature[] = [
  {
    id: 'guidance',
    name: 'Intelligent Game Guidance',
    description: 'Dynamic walkthroughs, spoiler-free hints, and missable trophy warnings.',
    icon: '💡',
  },
  {
    id: 'roadmap',
    name: 'Personal Trophy Roadmap',
    description: 'Optimal completion paths based on your skill and time.',
    icon: '🗺️',
  },
  {
    id: 'challenges',
    name: 'Weekly Challenge System',
    description: 'Competitive trophy challenges, community objectives, and digital badges.',
    icon: '🏆',
  },
  {
    id: 'badges',
    name: 'Badge & Achievement System',
    description: 'Showcase your specialties with unique achievement badges.',
    icon: '🎖️',
  },
  {
    id: 'community',
    name: 'Community Features',
    description: 'Form parties, share tips, and collaborate on difficult achievements.',
    icon: '🤝',
  },
  {
    id: 'stats',
    name: 'Personal Statistics & Analytics',
    description: 'Visualize progress, compare with friends, and predict completion dates.',
    icon: '📊',
  },
  {
    id: 'cross-game',
    name: 'Cross-Game Optimization',
    description: 'Plan trophy hunting across multiple titles for maximum efficiency.',
    icon: '🔄',
  },
  {
    id: 'video-hub',
    name: 'Video Hub',
    description: 'Explore community clips, guides, and share your own trophy moments.',
    icon: '📹',
  },
  {
    id: 'goals',
    name: 'My Trophy Goals',
    description: 'Set, track, and achieve your personal PlayStation trophy hunting objectives.',
    icon: '🎯',
  },
  {
    id: 'profile',
    name: 'User Profile',
    description: 'View your submitted tips, set goals, and earned badges.',
    icon: '👤',
  },
  { // New Friends Feature
    id: 'friends',
    name: 'Friend Network & Compare',
    description: 'Connect with other hunters and compare your trophy stats.',
    icon: '🤝',
  },
];

export const NAVIGATION_ITEMS: NavigationItem[] = [
  { id: 'home', name: 'Home', path: '/', icon: '🏠' },
  { id: 'guidance', name: 'Guidance', path: 'guidance', icon: '💡' },
  { id: 'roadmap', name: 'Roadmap', path: 'roadmap', icon: '🗺️' },
  { id: 'challenges', name: 'Challenges', path: 'challenges', icon: '🏆' },
  { id: 'badges', name: 'Badges', path: 'badges', icon: '🎖️' },
  { id: 'community', name: 'Community', path: 'community', icon: '🤝' },
  { id: 'stats', name: 'Stats', path: 'stats', icon: '📊' },
  { id: 'cross-game', name: 'Cross-game', path: 'cross-game', icon: '🔄' },
  { id: 'video-hub', name: 'Video Hub', path: 'video-hub', icon: '📹' },
  { id: 'goals', name: 'Goals', path: 'goals', icon: '🎯' },
  { id: 'profile', name: 'Profile', path: 'profile', icon: '👤' },
  { id: 'friends', name: 'Friends', path: 'friends', icon: '🤝' }, // New Friends Navigation Item
  { id: 'chatbot', name: 'Chatbot', path: '/chatbot', icon: '🤖' },
];

export const MARKETING_HOOK = "From Casual to Completionist - Transform Your Gaming with AI-Powered Trophy Guidance";

export const DUMMY_GAMES: Game[] = [
  { id: 'hfw', name: 'Horizon Forbidden West' },
  { id: 'gof', name: 'God of War Ragnarök' },
  { id: 'spm', name: 'Marvel\'s Spider-Man 2' },
  { id: 'er', name: 'Elden Ring' },
  { id: 'rdr2', name: 'Red Dead Redemption 2' },
  { id: 'tlou2', name: 'The Last of Us Part II' },
  { id: 'ff7r', name: 'Final Fantasy VII Rebirth' },
];

// DUMMY_GUIDANCE_RESPONSES removed - now using Gemini AI for guidance
/*
export const DUMMY_GUIDANCE_RESPONSES = [
  {
    hints: `### Hints:
*   For your current progress, focus on exploring the **Tallnecks** to reveal more of the map and gather useful resources.
*   This will naturally lead you to side quests that offer valuable XP and gear upgrades.
*   Remember to **scan new machines** for their weaknesses!`,
    missables: `### Missable Trophy Warning:
*   Keep an eye out for **'All Machine Types Scanned'** (scan every machine variant) as some machines are rare or tied to specific quests.
*   Certain **Data Points** are only available during specific main quests. It's recommended to do a full area sweep before progressing major story beats.`,
    strategies: `### Alternative Strategies:
*   If you find combat challenging, consider investing early in **traps and tripwires**. Setting up ambushes before engaging can turn difficult encounters into manageable ones, especially against larger machines.
*   Don't forget to utilize your **elemental arrows** effectively to exploit machine weaknesses!`
  },
  {
    hints: `### Hints:
*   To advance efficiently, ensure you're completing **favor quests** alongside the main story. These often unlock new areas, gear, and runic attacks that are crucial for later challenges.
*   Pay attention to **environmental puzzles**; they usually hide valuable chests with upgrade materials.`,
    missables: `### Missable Trophy Warning:
*   Some collectibles (like certain **Odin's Ravens** or **Lore Markers**) are tied to specific story chapters or realms that become inaccessible later.
*   Consult an external guide for these, or make sure to thoroughly explore each area before leaving.`,
    strategies: `### Alternative Strategies:
*   If you're struggling with boss fights, prioritize upgrading your **defensive stats** and finding gear that reduces cooldowns on your runic attacks.
*   A more defensive playstyle with powerful runic bursts can be very effective, especially on higher difficulties. Don't be afraid to use **Spartan Rage** when surrounded!`
  },
  {
    hints: `### Hints:
*   Your **web-swinging skills** are key! Practice traversal challenges to get better at combining different moves for speed and style.
*   Many side activities, like stopping crimes or completing **FNSM requests**, will passively grant you tokens needed for suit and gadget upgrades.`,
    missables: `### Missable Trophy Warning:
*   There aren't many truly 'missable' trophies in the traditional sense, as you can typically revisit all areas post-game.
*   However, some **combat-related challenges** might be easier to achieve before completing all story missions when enemy variety is lower.`,
    strategies: `### Alternative Strategies:
*   If you're finding combat encounters overwhelming, focus on **stealth takedowns** first to thin out enemy ranks.
*   For larger groups, prioritize enemies with ranged weapons or those that can disrupt your combos.
*   Using **environmental hazards** and gadgets like the Web Grabber can create openings and make fights much easier.`
  }
];
*/

export const DUMMY_VIDEOS: Video[] = [
  {
    id: 'vid1',
    title: 'Horizon Forbidden West - Platinum Trophy Guide Playlist',
    gameId: 'hfw',
    embedUrl: 'https://www.youtube.com/embed/Qy2LCXdwL4g?list=PLRr5L69yg_kHVWTpULbBzwWvrIffsxqga',
    uploader: 'PowerPyx',
    timestamp: Date.now() - (1000 * 60 * 60 * 24 * 7),
  },
  {
    id: 'vid2',
    title: 'Road To Platinum | God of War Ragnarok (Trophy Overview)',
    gameId: 'gof',
    embedUrl: 'https://www.youtube.com/embed/PLKu5GD9C9s',
    uploader: 'Community Guide',
    timestamp: Date.now() - (1000 * 60 * 60 * 24 * 14),
  },
  {
    id: 'vid3',
    title: 'Marvel\'s Spider-Man 2 - Trophy Guide Playlist',
    gameId: 'spm',
    embedUrl: 'https://www.youtube.com/embed/igxfvqtbxJk?list=PLRr5L69yg_kElD-hCCAzHRj8BaQ2aUhf_',
    uploader: 'PowerPyx',
    timestamp: Date.now() - (1000 * 60 * 60 * 24 * 3),
  },
  {
    id: 'vid4',
    title: 'Elden Ring - Trophy Guide Playlist',
    gameId: 'er',
    embedUrl: 'https://www.youtube.com/embed/w7yokwV9pdY?list=PLRr5L69yg_kEbLZlu-NZoCVXd472Lt8AE',
    uploader: 'PowerPyx',
    timestamp: Date.now() - (1000 * 60 * 60 * 24 * 20),
  },
  {
    id: 'vid5',
    title: 'Red Dead Redemption 2 - Trophy Guide Playlist',
    gameId: 'rdr2',
    embedUrl: 'https://www.youtube.com/embed/b7lEYGUC2so?list=PLRr5L69yg_kEuUIiI4ATYjzsBNsEOqENb',
    uploader: 'PowerPyx',
    timestamp: Date.now() - (1000 * 60 * 60 * 24 * 30),
  },
  {
    id: 'vid6',
    title: 'The Last of Us Part 2 - Trophy Guide Playlist',
    gameId: 'tlou2',
    embedUrl: 'https://www.youtube.com/embed/Azm1-przaGk?list=PLRr5L69yg_kEosKKuT7GoYinTxC79AYJ4',
    uploader: 'PowerPyx',
    timestamp: Date.now() - (1000 * 60 * 60 * 24 * 10),
  },
  {
    id: 'vid7',
    title: 'Final Fantasy VII Rebirth - Trophy Guide Playlist',
    gameId: 'ff7r',
    embedUrl: 'https://www.youtube.com/embed/0oAiL5fcop8?list=PLRr5L69yg_kGQsW1DoBGK603lkEpetyo6',
    uploader: 'PowerPyx',
    timestamp: Date.now() - (1000 * 60 * 60 * 24 * 5),
  },
];

export const CHALLENGE_BADGES: Badge[] = [
  { id: 'weekly-challenger', name: 'Weekly Challenger', icon: '🌟', description: 'Completed a weekly trophy challenge.' },
  { id: 'multi-game-master', name: 'Multi-Game Master', icon: '🎮', description: 'Completed a cross-game challenge.' },
  { id: 'speedrun-ace', name: 'Speedrun Ace', icon: '⏱️', description: 'Completed a time-based challenge.' },
  { id: 'community-hero', name: 'Community Hero', icon: '💖', description: 'Contributed to a community objective.' },
];

export const DUMMY_BADGES: Badge[] = [
  {
    id: 'master-hunter',
    name: 'Master Hunter',
    icon: '🏅',
    description: 'Achieved 5+ Platinum Trophies!',
  },
  {
    id: 'tip-contributor',
    name: 'Community Contributor',
    icon: '🤝',
    description: 'Shared 10+ helpful trophy tips.',
  },
  {
    id: 'speed-runner',
    name: 'Speed Demon',
    icon: '⚡',
    description: 'Completed a game within its speedrun trophy time.',
  },
  {
    id: 'collectible-king',
    name: 'Collectible King',
    icon: '👑',
    description: 'Found all collectibles in three different games.',
  },
  {
    id: 'storyteller',
    name: 'Storyteller',
    icon: '📖',
    description: 'Submitted a video guide to the Video Hub.',
  },
  {
    id: 'first-goal',
    name: 'Goal Setter',
    icon: '🏆',
    description: 'Set your first trophy goal!',
  },
  ...CHALLENGE_BADGES, // Add challenge badges here
];

// Helper to generate random trophy counts for a game
const generateRandomTrophies = (): GameTrophyCounts => ({
  platinum: Math.random() > 0.7 ? (Math.random() > 0.5 ? 1 : 0) : 0, // Low chance of platinum
  gold: Math.floor(Math.random() * 5),
  silver: Math.floor(Math.random() * 10),
  bronze: Math.floor(Math.random() * 20) + 5, // At least 5 bronze
});

// Populate gameTrophyCounts for dummy users
export const DUMMY_USERS_FOR_FRIENDS: DummyFriend[] = [
  {
    user: { id: 'dummy_user_1', username: 'PlatinumPro' },
    stats: {
      tipsCount: 15,
      goalsCompleted: 8,
      goalsTotal: 10,
      badgesEarned: 4,
      gameTrophyCounts: {
        'hfw': { platinum: 1, gold: 3, silver: 8, bronze: 15 },
        'gof': { platinum: 1, gold: 4, silver: 10, bronze: 20 },
        'spm': { platinum: 1, gold: 5, silver: 12, bronze: 25 },
        'er': generateRandomTrophies(),
      }
    },
  },
  {
    user: { id: 'dummy_user_2', username: 'TrophyTitan' },
    stats: {
      tipsCount: 20,
      goalsCompleted: 12,
      goalsTotal: 15,
      badgesEarned: 6,
      gameTrophyCounts: {
        'hfw': { platinum: 1, gold: 5, silver: 12, bronze: 28 },
        'gof': { platinum: 1, gold: 6, silver: 15, bronze: 30 },
        'rdr2': { platinum: 0, gold: 2, silver: 7, bronze: 18 },
        'tlou2': { platinum: 1, gold: 4, silver: 9, bronze: 22 },
        'ff7r': generateRandomTrophies(),
      }
    },
  },
  {
    user: { id: 'dummy_user_3', username: 'HiddenGemHunter' },
    stats: {
      tipsCount: 5,
      goalsCompleted: 3,
      goalsTotal: 5,
      badgesEarned: 2,
      gameTrophyCounts: {
        'spm': { platinum: 0, gold: 1, silver: 4, bronze: 10 },
        'er': { platinum: 0, gold: 0, silver: 2, bronze: 8 },
        'hfw': generateRandomTrophies(),
      }
    },
  },
  {
    user: { id: 'dummy_user_4', username: 'AchievementAddict' },
    stats: {
      tipsCount: 10,
      goalsCompleted: 7,
      goalsTotal: 8,
      badgesEarned: 3,
      gameTrophyCounts: {
        'gof': { platinum: 0, gold: 3, silver: 7, bronze: 14 },
        'rdr2': { platinum: 0, gold: 1, silver: 5, bronze: 12 },
        'spm': generateRandomTrophies(),
      }
    },
  },
  {
    user: { id: 'dummy_user_5', username: 'NoobToPro' },
    stats: {
      tipsCount: 2,
      goalsCompleted: 1,
      goalsTotal: 3,
      badgesEarned: 1,
      gameTrophyCounts: {
        'hfw': { platinum: 0, gold: 0, silver: 1, bronze: 5 },
      }
    },
  },
  {
    user: { id: 'dummy_user_6', username: 'CompletionistKid' },
    stats: {
      tipsCount: 8,
      goalsCompleted: 6,
      goalsTotal: 7,
      badgesEarned: 3,
      gameTrophyCounts: {
        'ff7r': { platinum: 1, gold: 2, silver: 6, bronze: 10 },
        'tlou2': { platinum: 0, gold: 2, silver: 5, bronze: 13 },
      }
    },
  },
];

export const DUMMY_CHALLENGES: Challenge[] = [
  {
    id: 'challenge-1',
    name: 'The Relic Hunter',
    description: 'Find 10 unique collectibles in any single game.',
    badgeId: 'weekly-challenger',
    trophyGoalExample: 'Find all "Vistas" in Horizon Forbidden West.'
  },
  {
    id: 'challenge-2',
    name: 'Combat Prowess',
    description: 'Defeat 5 mini-bosses without taking damage in one session.',
    badgeId: 'weekly-challenger',
    trophyGoalExample: 'Defeat 5 Berserkers in God of War Ragnarök without being hit (easy difficulty allowed).'
  },
  {
    id: 'challenge-3',
    name: 'Speed Demon Sprint',
    description: 'Complete any story mission or side quest in under 15 minutes.',
    badgeId: 'speedrun-ace',
    trophyGoalExample: 'Complete "Grand Central Station" FNSM request in Spider-Man 2 in under 15 minutes.'
  },
  {
    id: 'challenge-4',
    name: 'The Explorer\'s Path',
    description: 'Uncover 5 unexplored map areas across two different games.',
    badgeId: 'multi-game-master',
    trophyGoalExample: 'Reveal 2 undiscovered regions in Elden Ring and 3 in Horizon Forbidden West.'
  },
  {
    id: 'challenge-5',
    name: 'Flawless Victory',
    description: 'Achieve a flawless victory (no damage taken) against a regular enemy group of 3+ foes.',
    badgeId: 'weekly-challenger',
    trophyGoalExample: 'Clear an enemy camp in Ghost of Tsushima without taking damage.'
  },
  {
    id: 'challenge-6',
    name: 'Community Contributor Bonus',
    description: 'Submit 3 helpful trophy tips to the community forum.',
    badgeId: 'community-hero',
    trophyGoalExample: 'Share tips for challenging trophies in Final Fantasy VII Rebirth.'
  },
  {
    id: 'challenge-7',
    name: 'Gold Hoarder',
    description: 'Collect 50,000 in-game currency across any game.',
    badgeId: 'weekly-challenger',
    trophyGoalExample: 'Farm Glimmer in Destiny 2 or craft valuable items in Red Dead Redemption 2.'
  },
];