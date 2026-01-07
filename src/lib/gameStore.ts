import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================
// ARCHETYPES
// ============================================
export type Archetype =
  | 'visionary'
  | 'strategist'
  | 'connector'
  | 'creator'
  | 'protector'
  | 'seeker';

export interface ArchetypeInfo {
  id: Archetype;
  name: string;
  title: string;
  strength: string;
  weakness: string;
  quest: string;
  icon: string;
}

export const ARCHETYPES: Record<Archetype, ArchetypeInfo> = {
  visionary: {
    id: 'visionary',
    name: 'The Visionary',
    title: 'Seer of Possibilities',
    strength: 'Sees patterns others miss, inspires action',
    weakness: 'Impatient, disconnected from present',
    quest: 'Prove your vision is worth following',
    icon: 'eye',
  },
  strategist: {
    id: 'strategist',
    name: 'The Strategist',
    title: 'Master of Plans',
    strength: 'Plans perfectly, anticipates moves',
    weakness: 'Overthinks, fears spontaneity',
    quest: 'Create a plan that survives chaos',
    icon: 'brain',
  },
  connector: {
    id: 'connector',
    name: 'The Connector',
    title: 'Bridge Between Worlds',
    strength: 'Builds relationships, reads emotions',
    weakness: 'Too invested emotionally',
    quest: 'Build a community that endures',
    icon: 'users',
  },
  creator: {
    id: 'creator',
    name: 'The Creator',
    title: 'Maker of Wonders',
    strength: 'Innovative solutions, artistic genius',
    weakness: 'Perfectionist, struggles to finish',
    quest: 'Leave behind something immortal',
    icon: 'sparkles',
  },
  protector: {
    id: 'protector',
    name: 'The Protector',
    title: 'Shield of the Innocent',
    strength: 'Unwavering loyalty, fearless courage',
    weakness: 'Overprotective, controlling',
    quest: 'Save those who matter most',
    icon: 'shield',
  },
  seeker: {
    id: 'seeker',
    name: 'The Seeker',
    title: 'Hunter of Truth',
    strength: 'Endless curiosity, analytical mind',
    weakness: 'Detached, undervalues emotions',
    quest: 'Uncover the ultimate mystery',
    icon: 'search',
  },
};

// ============================================
// ERAS / STORY PATHS
// ============================================
export type Era =
  // Original Eras
  | 'stranger_things' | 'medieval' | 'victorian' | 'cyberpunk' | 'ancient' | 'space_opera'
  | 'wild_west' | 'samurai' | 'apocalypse' | 'pirate' | 'noir' | 'lovecraft'
  // Fantasy Eras
  | 'high_fantasy' | 'dark_fantasy' | 'fairy_tale' | 'arthurian' | 'sword_sorcery' | 'urban_fantasy'
  | 'steampunk_fantasy' | 'oriental_fantasy' | 'nordic_fantasy' | 'celtic_fantasy' | 'arabian_nights'
  | 'slavic_folklore' | 'african_mythology' | 'mesoamerican' | 'polynesian' | 'native_american'
  // Sci-Fi Eras
  | 'hard_scifi' | 'biopunk' | 'solarpunk' | 'dieselpunk' | 'atompunk' | 'nanopunk'
  | 'space_western' | 'alien_invasion' | 'first_contact' | 'generation_ship' | 'dyson_sphere'
  | 'time_travel' | 'parallel_universe' | 'simulation' | 'ai_uprising' | 'transhuman'
  | 'clone_wars' | 'mech_pilot' | 'starship_crew' | 'bounty_hunter_space' | 'space_horror'
  // Horror Eras
  | 'slasher' | 'zombie_outbreak' | 'vampire_gothic' | 'werewolf_curse' | 'haunted_house'
  | 'cult_horror' | 'body_horror' | 'folk_horror' | 'psychological_horror' | 'survival_horror'
  | 'cosmic_horror' | 'demonic' | 'witch_trials' | 'asylum' | 'carnival_horror'
  // Historical Eras
  | 'ancient_egypt' | 'ancient_rome' | 'ancient_china' | 'viking_age' | 'mongol_empire'
  | 'crusades' | 'renaissance' | 'elizabethan' | 'french_revolution' | 'napoleonic'
  | 'american_civil_war' | 'industrial_revolution' | 'roaring_twenties' | 'great_depression'
  | 'world_war_1' | 'world_war_2' | 'cold_war' | 'vietnam_war' | 'korean_war'
  // Modern/Contemporary Eras
  | 'spy_thriller' | 'heist' | 'crime_syndicate' | 'street_gang' | 'cartel'
  | 'political_thriller' | 'corporate_espionage' | 'journalist' | 'hacker_modern'
  | 'paranormal_investigator' | 'urban_legends' | 'conspiracy' | 'secret_society'
  // Adventure Eras
  | 'jungle_explorer' | 'arctic_expedition' | 'deep_sea' | 'lost_civilization'
  | 'treasure_hunter' | 'safari' | 'mountaineer' | 'storm_chaser' | 'archaeological'
  | 'shipwreck_survivor' | 'desert_nomad' | 'rainforest' | 'underground_caves'
  // Mythology & Legend Eras
  | 'greek_mythology' | 'norse_mythology' | 'egyptian_mythology' | 'japanese_mythology'
  | 'chinese_mythology' | 'hindu_mythology' | 'mayan_mythology' | 'aztec_mythology'
  | 'celtic_mythology' | 'slavic_mythology' | 'african_mythology_era' | 'native_mythology'
  // Alternate History
  | 'nazi_victory' | 'confederate_victory' | 'roman_never_fell' | 'aztec_empire'
  | 'chinese_discovery' | 'steampunk_empire' | 'magic_industrial' | 'dinosaurs_survived'
  // Specific Pop Culture Inspired
  | 'matrix_style' | 'mad_max_style' | 'blade_runner_style' | 'star_wars_style'
  | 'star_trek_style' | 'alien_style' | 'terminator_style' | 'jurassic_style'
  | 'hunger_games_style' | 'divergent_style' | 'maze_runner_style' | 'walking_dead_style'
  | 'game_of_thrones_style' | 'witcher_style' | 'lord_of_rings_style' | 'harry_potter_style'
  | 'percy_jackson_style' | 'twilight_style' | 'interview_vampire_style' | 'underworld_style'
  // Unique/Experimental Eras
  | 'dreams' | 'afterlife' | 'purgatory' | 'heaven_hell' | 'spirit_world'
  | 'fairy_realm' | 'elemental_planes' | 'shadow_realm' | 'mirror_world' | 'pocket_dimension'
  | 'shrunk_world' | 'giant_world' | 'underwater_kingdom' | 'sky_islands' | 'hollow_earth'
  // Profession-Based Eras
  | 'gladiator' | 'assassin_guild' | 'thieves_guild' | 'mercenary_company' | 'knight_order'
  | 'wizard_academy' | 'monster_hunter' | 'vampire_hunter' | 'demon_slayer' | 'exorcist'
  | 'bounty_hunter' | 'smuggler' | 'revolutionary' | 'resistance_fighter' | 'freedom_fighter'
  // Animal/Creature Focused
  | 'dragon_rider' | 'beast_tamer' | 'shapeshifter' | 'werewolf_pack' | 'vampire_coven'
  | 'fae_court' | 'demon_realm' | 'angel_hierarchy' | 'elemental_spirits' | 'kaiju_world'
  // Sports/Competition
  | 'gladiatorial_games' | 'tournament_knight' | 'racing_champion' | 'fighting_circuit'
  | 'death_game' | 'survival_game' | 'battle_royale' | 'arena_champion'
  // Romance Sub-genres
  | 'regency_romance' | 'gothic_romance' | 'paranormal_romance' | 'space_romance'
  | 'enemies_lovers' | 'forbidden_love' | 'royal_romance' | 'time_crossed_lovers';


// ============================================
// LANGUAGES
// ============================================
export type Language = 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'ja' | 'ko' | 'zh' | 'ru' | 'ar';

export interface LanguageInfo {
  id: Language;
  name: string;
  nativeName: string;
  flag: string;
}

export const LANGUAGES: Record<Language, LanguageInfo> = {
  en: { id: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  es: { id: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  fr: { id: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  de: { id: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  it: { id: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  pt: { id: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷' },
  ja: { id: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  ko: { id: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  zh: { id: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  ru: { id: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  ar: { id: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
};

// ============================================
// GENRES
// ============================================
export type Genre = 'fantasy' | 'scifi' | 'horror' | 'mystery' | 'adventure' | 'post_apocalyptic' | 'superhero' | 'mythology';

export interface GenreInfo {
  id: Genre;
  name: string;
  icon: string;
  color: string;
  description: string;
  themes: string[];
  compatibleEras: Era[];
}

export const GENRES: Record<Genre, GenreInfo> = {
  fantasy: {
    id: 'fantasy',
    name: 'Fantasy',
    icon: 'wand-2',
    color: '#A855F7',
    description: 'Magic, mythical creatures, and epic quests in fantastical worlds',
    themes: ['magic', 'dragons', 'elves', 'quests', 'kingdoms', 'prophecies'],
    compatibleEras: ['medieval', 'ancient', 'victorian'],
  },
  scifi: {
    id: 'scifi',
    name: 'Science Fiction',
    icon: 'rocket',
    color: '#00E5FF',
    description: 'Advanced technology, space exploration, and futuristic societies',
    themes: ['technology', 'space', 'AI', 'aliens', 'cybernetics', 'time travel'],
    compatibleEras: ['cyberpunk', 'space_opera', 'stranger_things'],
  },
  horror: {
    id: 'horror',
    name: 'Horror',
    icon: 'skull',
    color: '#EF4444',
    description: 'Survival, terror, and confronting the unknown darkness',
    themes: ['monsters', 'survival', 'psychological', 'supernatural', 'gore', 'tension'],
    compatibleEras: ['victorian', 'stranger_things', 'lovecraft', 'apocalypse'],
  },
  mystery: {
    id: 'mystery',
    name: 'Mystery',
    icon: 'search',
    color: '#F59E0B',
    description: 'Investigations, secrets, and unraveling complex puzzles',
    themes: ['detective', 'clues', 'conspiracy', 'secrets', 'investigation', 'truth'],
    compatibleEras: ['victorian', 'noir', 'stranger_things', 'cyberpunk'],
  },
  adventure: {
    id: 'adventure',
    name: 'Adventure',
    icon: 'compass',
    color: '#10B981',
    description: 'Exploration, treasure hunting, and thrilling journeys',
    themes: ['exploration', 'treasure', 'travel', 'danger', 'discovery', 'heroism'],
    compatibleEras: ['wild_west', 'pirate', 'ancient', 'space_opera'],
  },
  post_apocalyptic: {
    id: 'post_apocalyptic',
    name: 'Post-Apocalyptic',
    icon: 'radiation',
    color: '#84CC16',
    description: 'Survival in a world after catastrophe, rebuilding civilization',
    themes: ['survival', 'wasteland', 'factions', 'resources', 'hope', 'mutation'],
    compatibleEras: ['apocalypse', 'cyberpunk'],
  },
  superhero: {
    id: 'superhero',
    name: 'Superhero',
    icon: 'zap',
    color: '#EC4899',
    description: 'Powers, costumes, and the battle between good and evil',
    themes: ['powers', 'villains', 'justice', 'identity', 'team', 'origin'],
    compatibleEras: ['stranger_things', 'cyberpunk', 'space_opera'],
  },
  mythology: {
    id: 'mythology',
    name: 'Mythology',
    icon: 'flame',
    color: '#D97706',
    description: 'Gods, legends, and epic tales from ancient civilizations',
    themes: ['gods', 'legends', 'fate', 'monsters', 'heroes', 'divine'],
    compatibleEras: ['ancient', 'samurai', 'medieval'],
  },
};

// ============================================
// WORLD CONFIGURATION
// ============================================
export type Tone =
  // Classic Tones
  | 'dark' | 'light' | 'balanced' | 'gritty' | 'whimsical'
  // Dramatic Tones
  | 'epic' | 'tragic' | 'triumphant' | 'melancholic' | 'intense'
  // Mood-Based Tones
  | 'mysterious' | 'suspenseful' | 'romantic' | 'comedic' | 'satirical'
  // Atmosphere Tones
  | 'dreamy' | 'nightmarish' | 'surreal' | 'cozy' | 'claustrophobic'
  // Narrative Style Tones
  | 'noir' | 'pulpy' | 'literary' | 'cinematic' | 'documentary'
  // Emotional Tones
  | 'hopeful' | 'desperate' | 'nostalgic' | 'bittersweet' | 'euphoric'
  // Genre-Specific Tones
  | 'gothic' | 'campy' | 'hardboiled' | 'swashbuckling' | 'philosophical'
  // Intensity Tones
  | 'brutal' | 'gentle' | 'chaotic' | 'serene' | 'frantic'
  // Unique Tones
  | 'absurdist' | 'mythic' | 'intimate' | 'grandiose' | 'minimalist';

export type Difficulty = 'story' | 'normal' | 'challenging' | 'hardcore';

export interface WorldConfig {
  genre: Genre;
  era: Era;
  tone: Tone;
  difficulty: Difficulty;
  customThemes: string[];
  worldName?: string;
  worldDescription?: string;
  mainConflict?: string;
  aiPersonality: 'dramatic' | 'mysterious' | 'friendly' | 'dark' | 'epic';
}

export interface ToneInfo {
  name: string;
  description: string;
  icon: string;
  color: string;
  mood: string;
}

export const TONES: Record<Tone, ToneInfo> = {
  // ========== CLASSIC TONES ==========
  dark: {
    name: 'Dark & Grim',
    description: 'Serious, dangerous, morally complex',
    icon: 'moon',
    color: '#1F2937',
    mood: 'Shadows loom, hope is scarce'
  },
  light: {
    name: 'Light & Heroic',
    description: 'Hopeful, triumphant, clear good vs evil',
    icon: 'sun',
    color: '#FBBF24',
    mood: 'Heroes rise, justice prevails'
  },
  balanced: {
    name: 'Balanced',
    description: 'Mix of light and dark moments',
    icon: 'scale',
    color: '#6B7280',
    mood: 'Life in all its complexity'
  },
  gritty: {
    name: 'Gritty Realism',
    description: 'Raw, visceral, consequences matter',
    icon: 'shield-alert',
    color: '#78716C',
    mood: 'Every wound tells a story'
  },
  whimsical: {
    name: 'Whimsical',
    description: 'Playful, quirky, unexpected humor',
    icon: 'sparkles',
    color: '#EC4899',
    mood: 'Wonder around every corner'
  },

  // ========== DRAMATIC TONES ==========
  epic: {
    name: 'Epic & Grand',
    description: 'Sweeping scale, legendary heroes, world-shaking events',
    icon: 'mountain',
    color: '#7C3AED',
    mood: 'Fate of worlds hangs in balance'
  },
  tragic: {
    name: 'Tragic',
    description: 'Inevitable downfall, beautiful sadness, meaningful loss',
    icon: 'heart-crack',
    color: '#4B5563',
    mood: 'Beauty in sorrow'
  },
  triumphant: {
    name: 'Triumphant',
    description: 'Victory against all odds, celebration, glory',
    icon: 'trophy',
    color: '#F59E0B',
    mood: 'Against all odds, we win'
  },
  melancholic: {
    name: 'Melancholic',
    description: 'Wistful, contemplative, beautifully sad',
    icon: 'cloud-rain',
    color: '#64748B',
    mood: 'Rainy days and memories'
  },
  intense: {
    name: 'Intense',
    description: 'High stakes, constant tension, edge of your seat',
    icon: 'zap',
    color: '#DC2626',
    mood: 'Every second counts'
  },

  // ========== MOOD-BASED TONES ==========
  mysterious: {
    name: 'Mysterious',
    description: 'Secrets, intrigue, hidden truths waiting to be uncovered',
    icon: 'help-circle',
    color: '#6366F1',
    mood: 'Nothing is as it seems'
  },
  suspenseful: {
    name: 'Suspenseful',
    description: 'Tension building, dread, anticipation of the unknown',
    icon: 'clock',
    color: '#0F172A',
    mood: 'What lurks around the corner?'
  },
  romantic: {
    name: 'Romantic',
    description: 'Love, passion, emotional connections, heart-fluttering moments',
    icon: 'heart',
    color: '#F43F5E',
    mood: 'Hearts entwined'
  },
  comedic: {
    name: 'Comedic',
    description: 'Funny, lighthearted, clever humor throughout',
    icon: 'smile',
    color: '#22C55E',
    mood: 'Laughter is the best medicine'
  },
  satirical: {
    name: 'Satirical',
    description: 'Sharp wit, social commentary, clever criticism',
    icon: 'message-circle',
    color: '#EAB308',
    mood: 'Truth through humor'
  },

  // ========== ATMOSPHERE TONES ==========
  dreamy: {
    name: 'Dreamy',
    description: 'Ethereal, floating, reality bends softly',
    icon: 'cloud',
    color: '#A78BFA',
    mood: 'Between sleep and waking'
  },
  nightmarish: {
    name: 'Nightmarish',
    description: 'Disturbing, unsettling, fear made manifest',
    icon: 'skull',
    color: '#7F1D1D',
    mood: 'Your worst fears realized'
  },
  surreal: {
    name: 'Surreal',
    description: 'Reality distorted, dreamlike logic, impossible beauty',
    icon: 'eye',
    color: '#D946EF',
    mood: 'Logic need not apply'
  },
  cozy: {
    name: 'Cozy',
    description: 'Warm, comforting, safe adventures with friends',
    icon: 'home',
    color: '#F97316',
    mood: 'Warm fires and good company'
  },
  claustrophobic: {
    name: 'Claustrophobic',
    description: 'Confined, pressure building, walls closing in',
    icon: 'box',
    color: '#374151',
    mood: 'No way out'
  },

  // ========== NARRATIVE STYLE TONES ==========
  noir: {
    name: 'Noir',
    description: 'Cynical, shadowy, morally ambiguous antiheroes',
    icon: 'cigarette',
    color: '#1E293B',
    mood: 'Rain-soaked streets, broken dreams'
  },
  pulpy: {
    name: 'Pulpy',
    description: 'Over-the-top action, larger than life, fun adventure',
    icon: 'flame',
    color: '#EA580C',
    mood: 'Two-fisted action!'
  },
  literary: {
    name: 'Literary',
    description: 'Thoughtful, character-driven, beautiful prose',
    icon: 'book-open',
    color: '#059669',
    mood: 'Words that linger'
  },
  cinematic: {
    name: 'Cinematic',
    description: 'Movie-like scenes, dramatic shots, blockbuster feel',
    icon: 'film',
    color: '#0EA5E9',
    mood: 'Roll camera, action!'
  },
  documentary: {
    name: 'Documentary',
    description: 'Realistic, grounded, feels like it could be real',
    icon: 'video',
    color: '#57534E',
    mood: 'Truth stranger than fiction'
  },

  // ========== EMOTIONAL TONES ==========
  hopeful: {
    name: 'Hopeful',
    description: 'Optimistic, believing in better tomorrow',
    icon: 'sunrise',
    color: '#FBBF24',
    mood: 'Dawn always comes'
  },
  desperate: {
    name: 'Desperate',
    description: 'Last chances, survival mode, nothing left to lose',
    icon: 'alert-triangle',
    color: '#B91C1C',
    mood: 'Everything on the line'
  },
  nostalgic: {
    name: 'Nostalgic',
    description: 'Longing for the past, bittersweet memories',
    icon: 'camera',
    color: '#D97706',
    mood: 'Remember when...'
  },
  bittersweet: {
    name: 'Bittersweet',
    description: 'Joy and sorrow intertwined, complex emotions',
    icon: 'sunset',
    color: '#9333EA',
    mood: 'Smiling through tears'
  },
  euphoric: {
    name: 'Euphoric',
    description: 'Pure joy, celebration, overwhelming happiness',
    icon: 'party-popper',
    color: '#F472B6',
    mood: 'On top of the world'
  },

  // ========== GENRE-SPECIFIC TONES ==========
  gothic: {
    name: 'Gothic',
    description: 'Dark romance, haunted beauty, elegant horror',
    icon: 'castle',
    color: '#581C87',
    mood: 'Beautiful darkness'
  },
  campy: {
    name: 'Campy',
    description: 'Deliberately cheesy, fun, self-aware silliness',
    icon: 'laugh',
    color: '#84CC16',
    mood: 'Embrace the cheese!'
  },
  hardboiled: {
    name: 'Hardboiled',
    description: 'Tough, cynical, no-nonsense detective style',
    icon: 'badge',
    color: '#44403C',
    mood: 'Just the facts'
  },
  swashbuckling: {
    name: 'Swashbuckling',
    description: 'Daring adventure, wit, flashy heroics',
    icon: 'sword',
    color: '#0891B2',
    mood: 'En garde!'
  },
  philosophical: {
    name: 'Philosophical',
    description: 'Deep questions, moral dilemmas, meaning of existence',
    icon: 'brain',
    color: '#4F46E5',
    mood: 'What does it all mean?'
  },

  // ========== INTENSITY TONES ==========
  brutal: {
    name: 'Brutal',
    description: 'Unforgiving, violent, harsh reality',
    icon: 'skull',
    color: '#991B1B',
    mood: 'No mercy'
  },
  gentle: {
    name: 'Gentle',
    description: 'Soft, kind, tender moments',
    icon: 'feather',
    color: '#A3E635',
    mood: 'Handle with care'
  },
  chaotic: {
    name: 'Chaotic',
    description: 'Unpredictable, wild, anything can happen',
    icon: 'shuffle',
    color: '#F43F5E',
    mood: 'Expect the unexpected'
  },
  serene: {
    name: 'Serene',
    description: 'Peaceful, calm, meditative journey',
    icon: 'leaf',
    color: '#34D399',
    mood: 'Inner peace'
  },
  frantic: {
    name: 'Frantic',
    description: 'Fast-paced, breathless, non-stop action',
    icon: 'fast-forward',
    color: '#EF4444',
    mood: 'Go go go!'
  },

  // ========== UNIQUE TONES ==========
  absurdist: {
    name: 'Absurdist',
    description: 'Meaningfully meaningless, Kafka meets comedy',
    icon: 'help-circle',
    color: '#8B5CF6',
    mood: 'Why? Why not!'
  },
  mythic: {
    name: 'Mythic',
    description: 'Legendary scale, archetypal heroes, timeless tales',
    icon: 'star',
    color: '#C2410C',
    mood: 'Stories for the ages'
  },
  intimate: {
    name: 'Intimate',
    description: 'Close, personal, focused on relationships',
    icon: 'users',
    color: '#DB2777',
    mood: 'Just between us'
  },
  grandiose: {
    name: 'Grandiose',
    description: 'Majestic, elaborate, nothing is small',
    icon: 'crown',
    color: '#B45309',
    mood: 'Go big or go home'
  },
  minimalist: {
    name: 'Minimalist',
    description: 'Simple, focused, less is more',
    icon: 'minus',
    color: '#9CA3AF',
    mood: 'Essence only'
  },
};

export const DIFFICULTIES: Record<Difficulty, { name: string; description: string; color: string }> = {
  story: { name: 'Story Mode', description: 'Focus on narrative, forgiving gameplay', color: '#10B981' },
  normal: { name: 'Normal', description: 'Balanced challenge and story', color: '#3B82F6' },
  challenging: { name: 'Challenging', description: 'Tactical choices matter, higher stakes', color: '#F59E0B' },
  hardcore: { name: 'Hardcore', description: 'Permadeath possible, maximum tension', color: '#EF4444' },
};

export const DEFAULT_WORLD_CONFIG: WorldConfig = {
  genre: 'adventure',
  era: 'stranger_things',
  tone: 'balanced',
  difficulty: 'normal',
  customThemes: [],
  aiPersonality: 'dramatic',
};

export interface EraInfo {
  id: Era;
  name: string;
  year: string;
  tagline: string;
  description: string;
  atmosphere: string;
  unlocked: boolean;
  color: string;
  icon: string;
}

export const ERAS: Record<Era, EraInfo> = {
  // ========== ORIGINAL ERAS ==========
  stranger_things: {
    id: 'stranger_things', name: 'Stranger Things', year: '1986', tagline: 'The Upside Down Awaits',
    description: 'Hawkins, Indiana. A small town with dark secrets. Government experiments, parallel dimensions, and the power of friendship.',
    atmosphere: 'Nostalgic horror, 80s synth, suburban mystery', unlocked: true, color: '#FF3D3D', icon: 'tv',
  },
  medieval: {
    id: 'medieval', name: 'Dark Ages', year: '1242', tagline: 'Honor, Steel & Sorcery',
    description: 'A realm torn by war. Knights clash, dragons soar, and ancient magic stirs in forgotten ruins.',
    atmosphere: 'Epic fantasy, Game of Thrones, political intrigue', unlocked: true, color: '#F59E0B', icon: 'crown',
  },
  victorian: {
    id: 'victorian', name: 'Victorian Shadows', year: '1888', tagline: 'Darkness in the Fog',
    description: 'London shrouded in fog and fear. Jack the Ripper stalks Whitechapel while occult societies seek forbidden knowledge.',
    atmosphere: 'Gothic horror, Sherlock Holmes, penny dreadful', unlocked: true, color: '#8B5CF6', icon: 'landmark',
  },
  cyberpunk: {
    id: 'cyberpunk', name: 'Neon Future', year: '2084', tagline: 'High Tech, Low Life',
    description: 'Mega-corporations rule the neon-lit streets. Hackers, mercenaries, and rebels fight for freedom.',
    atmosphere: 'Blade Runner, cybernetic noir, corporate dystopia', unlocked: true, color: '#00E5FF', icon: 'cpu',
  },
  ancient: {
    id: 'ancient', name: 'Mythic Greece', year: '-450', tagline: 'Gods & Mortals',
    description: 'The gods watch from Olympus as heroes rise and fall. Monsters lurk in every shadow.',
    atmosphere: 'Greek mythology, epic odyssey, divine intervention', unlocked: true, color: '#10B981', icon: 'columns',
  },
  space_opera: {
    id: 'space_opera', name: 'Stellar Conquest', year: '3847', tagline: 'The Final Frontier',
    description: 'Humanity spans the stars. Ancient alien civilizations, space pirates, and galactic empires collide.',
    atmosphere: 'Star Wars, Dune, interstellar adventure', unlocked: true, color: '#EC4899', icon: 'rocket',
  },
  wild_west: {
    id: 'wild_west', name: 'Wild West', year: '1875', tagline: 'Outlaws & Legends',
    description: 'The frontier is lawless. Gunslingers, bounty hunters, and outlaws fight for gold and glory.',
    atmosphere: 'Red Dead Redemption, spaghetti western', unlocked: true, color: '#D97706', icon: 'sun',
  },
  samurai: {
    id: 'samurai', name: 'Feudal Japan', year: '1600', tagline: 'Way of the Warrior',
    description: 'The Sengoku period. Samurai clans wage war for supremacy. Honor and the blade determine fate.',
    atmosphere: 'Ghost of Tsushima, bushido, ninja assassins', unlocked: true, color: '#DC2626', icon: 'swords',
  },
  apocalypse: {
    id: 'apocalypse', name: 'Post-Apocalypse', year: '2157', tagline: 'Survive the Wasteland',
    description: 'Nuclear fire has scorched the earth. Survivors scavenge, mutants roam, hope is rare.',
    atmosphere: 'Fallout, Mad Max, survival horror', unlocked: true, color: '#78716C', icon: 'radiation',
  },
  pirate: {
    id: 'pirate', name: 'Golden Age of Piracy', year: '1715', tagline: 'Sail the Seven Seas',
    description: 'The Caribbean calls. Plunder galleons, hunt treasure, build your legend as a pirate captain.',
    atmosphere: 'Pirates of the Caribbean, sea shanties', unlocked: true, color: '#0EA5E9', icon: 'anchor',
  },
  noir: {
    id: 'noir', name: 'Noir Detective', year: '1947', tagline: 'Shadows Never Lie',
    description: 'Los Angeles. City of angels and devils. Femme fatales, corrupt cops, and deadly secrets.',
    atmosphere: 'L.A. Noire, classic film noir, hard-boiled', unlocked: true, color: '#6B7280', icon: 'search',
  },
  lovecraft: {
    id: 'lovecraft', name: 'Cosmic Horror', year: '1927', tagline: 'Madness Awaits',
    description: 'Arkham, Massachusetts. Ancient evils stir. Investigate forbidden knowledge at your peril.',
    atmosphere: 'H.P. Lovecraft, Call of Cthulhu, eldritch', unlocked: true, color: '#4C1D95', icon: 'eye',
  },

  // ========== FANTASY ERAS ==========
  high_fantasy: {
    id: 'high_fantasy', name: 'High Fantasy', year: 'Timeless', tagline: 'Magic Flows Like Rivers',
    description: 'A world of wonder where magic is commonplace. Elves, dwarves, and humans coexist in vast kingdoms.',
    atmosphere: 'Lord of the Rings, epic quests, noble heroes', unlocked: true, color: '#22C55E', icon: 'sparkles',
  },
  dark_fantasy: {
    id: 'dark_fantasy', name: 'Dark Fantasy', year: 'Timeless', tagline: 'No Light Without Shadow',
    description: 'A grim world where magic comes at terrible cost. Monsters and men are equally dangerous.',
    atmosphere: 'Dark Souls, The Witcher, moral ambiguity', unlocked: true, color: '#1F2937', icon: 'moon',
  },
  fairy_tale: {
    id: 'fairy_tale', name: 'Fairy Tale', year: 'Once Upon', tagline: 'Dreams and Nightmares',
    description: 'Enchanted forests, cursed castles, and creatures from childhood stories both wondrous and terrifying.',
    atmosphere: 'Brothers Grimm, Disney dark, whimsical horror', unlocked: true, color: '#F472B6', icon: 'wand-2',
  },
  arthurian: {
    id: 'arthurian', name: 'Arthurian Legend', year: '500', tagline: 'The Once and Future King',
    description: 'Camelot rises. Knights of the Round Table, Excalibur, Merlin, and the quest for the Holy Grail.',
    atmosphere: 'King Arthur, chivalry, Avalon', unlocked: true, color: '#FFD700', icon: 'shield',
  },
  sword_sorcery: {
    id: 'sword_sorcery', name: 'Sword & Sorcery', year: 'Hyborian', tagline: 'Steel and Spellcraft',
    description: 'Barbarians, thieves, and wandering sorcerers in a savage world of ancient ruins and dark magic.',
    atmosphere: 'Conan, pulp fantasy, brutal action', unlocked: true, color: '#B91C1C', icon: 'swords',
  },
  urban_fantasy: {
    id: 'urban_fantasy', name: 'Urban Fantasy', year: 'Modern', tagline: 'Magic in the Mundane',
    description: 'Supernatural beings hide in plain sight. Vampires run nightclubs, werewolves work construction.',
    atmosphere: 'Dresden Files, True Blood, secret magic', unlocked: true, color: '#7C3AED', icon: 'building',
  },
  steampunk_fantasy: {
    id: 'steampunk_fantasy', name: 'Steampunk Fantasy', year: '1889', tagline: 'Gears and Grimoires',
    description: 'Victorian aesthetics meet magical technology. Clockwork automatons and spell-powered airships.',
    atmosphere: 'Arcane, magical industrial revolution', unlocked: true, color: '#92400E', icon: 'cog',
  },
  oriental_fantasy: {
    id: 'oriental_fantasy', name: 'Wuxia', year: 'Ancient East', tagline: 'Flying Swords',
    description: 'Martial artists with supernatural abilities. Hidden sects, ancient techniques, honorable warriors.',
    atmosphere: 'Crouching Tiger, cultivation novels', unlocked: true, color: '#BE123C', icon: 'wind',
  },
  nordic_fantasy: {
    id: 'nordic_fantasy', name: 'Nordic Fantasy', year: '800', tagline: 'Frost and Fire',
    description: 'The frozen north where Vikings seek glory. Gods walk among mortals, and Ragnarok looms.',
    atmosphere: 'Norse mythology, Vikings, rune magic', unlocked: true, color: '#0369A1', icon: 'snowflake',
  },
  celtic_fantasy: {
    id: 'celtic_fantasy', name: 'Celtic Fantasy', year: 'Ancient', tagline: 'The Mists of Avalon',
    description: 'Druids commune with nature spirits. Fae creatures lurk in ancient groves. The veil is thin.',
    atmosphere: 'Irish mythology, druids, nature magic', unlocked: true, color: '#15803D', icon: 'leaf',
  },
  arabian_nights: {
    id: 'arabian_nights', name: 'Arabian Nights', year: '800', tagline: '1001 Tales',
    description: 'Flying carpets, genies, and grand viziers. Desert kingdoms full of intrigue and wonder.',
    atmosphere: 'Aladdin, Sinbad, Middle Eastern fantasy', unlocked: true, color: '#B45309', icon: 'lamp',
  },
  slavic_folklore: {
    id: 'slavic_folklore', name: 'Slavic Folklore', year: 'Medieval', tagline: 'The Old Ways',
    description: 'Baba Yaga lurks in the woods. Domovoi protect homes. Ancient Slavic spirits and witches.',
    atmosphere: 'Russian fairy tales, dark forests', unlocked: true, color: '#365314', icon: 'trees',
  },
  african_mythology: {
    id: 'african_mythology', name: 'African Mythology', year: 'Ancient', tagline: 'Spirits of the Land',
    description: 'Anansi the spider god weaves tales. Orishas guide mortals. Ancient kingdoms and powerful spirits.',
    atmosphere: 'Yoruba mythology, Wakanda inspiration', unlocked: true, color: '#CA8A04', icon: 'sun',
  },
  mesoamerican: {
    id: 'mesoamerican', name: 'Mesoamerican', year: '1400', tagline: 'Blood of the Gods',
    description: 'Aztec and Mayan empires at their height. Feathered serpents, blood sacrifice, and cosmic cycles.',
    atmosphere: 'Aztec mythology, jungle temples', unlocked: true, color: '#059669', icon: 'pyramid',
  },
  polynesian: {
    id: 'polynesian', name: 'Polynesian', year: 'Ancient', tagline: 'Across the Pacific',
    description: 'Island warriors navigate by stars. Demigods like Maui shape the world. Ocean adventures await.',
    atmosphere: 'Moana, Pacific Island mythology', unlocked: true, color: '#0891B2', icon: 'waves',
  },
  native_american: {
    id: 'native_american', name: 'Native American', year: 'Pre-Colonial', tagline: 'Spirit Walking',
    description: 'Spirit quests, totem animals, and the balance of nature. Tribes unite against supernatural threats.',
    atmosphere: 'Indigenous mythology, nature spirits', unlocked: true, color: '#7C2D12', icon: 'feather',
  },

  // ========== SCI-FI ERAS ==========
  hard_scifi: {
    id: 'hard_scifi', name: 'Hard Sci-Fi', year: '2150', tagline: 'Science is Law',
    description: 'Realistic space travel, physics-based technology. Survival depends on scientific knowledge.',
    atmosphere: 'The Expanse, The Martian, realistic', unlocked: true, color: '#475569', icon: 'atom',
  },
  biopunk: {
    id: 'biopunk', name: 'Biopunk', year: '2070', tagline: 'Evolution Engineered',
    description: 'Genetic modification is commonplace. Designer organisms, bioweapons, and humanity redefined.',
    atmosphere: 'Biohackers, genetic engineering', unlocked: true, color: '#84CC16', icon: 'dna',
  },
  solarpunk: {
    id: 'solarpunk', name: 'Solarpunk', year: '2120', tagline: 'Green Tomorrow',
    description: 'A hopeful future of sustainable technology. Nature and tech in harmony, but challenges remain.',
    atmosphere: 'Eco-utopia, renewable energy, community', unlocked: true, color: '#22C55E', icon: 'sun',
  },
  dieselpunk: {
    id: 'dieselpunk', name: 'Dieselpunk', year: '1935', tagline: 'Art Deco Apocalypse',
    description: 'Alternate 1930s with advanced diesel technology. Zeppelins, propaganda, and noir aesthetics.',
    atmosphere: 'Sky Captain, Rocketeer, retro-futurism', unlocked: true, color: '#78350F', icon: 'plane',
  },
  atompunk: {
    id: 'atompunk', name: 'Atompunk', year: '1955', tagline: 'Atomic Age Dreams',
    description: 'The future as imagined in the 1950s. Atomic cars, robot servants, and cold war paranoia.',
    atmosphere: 'Fallout pre-war, The Jetsons meets fear', unlocked: true, color: '#65A30D', icon: 'atom',
  },
  nanopunk: {
    id: 'nanopunk', name: 'Nanopunk', year: '2200', tagline: 'Small Things Matter',
    description: 'Nanotechnology has transformed everything. Matter is programmable, but who controls the swarm?',
    atmosphere: 'Microscopic threats, gray goo scenario', unlocked: true, color: '#6366F1', icon: 'cpu',
  },
  space_western: {
    id: 'space_western', name: 'Space Western', year: '2500', tagline: 'Frontier Among Stars',
    description: 'The outer colonies are lawless. Space cowboys, bandits, and frontier justice on distant worlds.',
    atmosphere: 'Firefly, Cowboy Bebop, space frontier', unlocked: true, color: '#EA580C', icon: 'star',
  },
  alien_invasion: {
    id: 'alien_invasion', name: 'Alien Invasion', year: 'Present', tagline: 'They Are Here',
    description: 'Extraterrestrials have arrived with hostile intent. Humanity fights for survival against the unknown.',
    atmosphere: 'Independence Day, War of the Worlds', unlocked: true, color: '#4ADE80', icon: 'zap',
  },
  first_contact: {
    id: 'first_contact', name: 'First Contact', year: '2045', tagline: 'We Are Not Alone',
    description: 'Humanity has made contact with intelligent life. Diplomacy, fear, and wonder intertwine.',
    atmosphere: 'Arrival, Contact, communication', unlocked: true, color: '#38BDF8', icon: 'radio',
  },
  generation_ship: {
    id: 'generation_ship', name: 'Generation Ship', year: '2400', tagline: 'Born in Transit',
    description: 'Generations live and die aboard a massive ship heading to a new world. Society evolves in isolation.',
    atmosphere: 'Slow voyage, ship-bound society', unlocked: true, color: '#A78BFA', icon: 'rocket',
  },
  dyson_sphere: {
    id: 'dyson_sphere', name: 'Dyson Sphere', year: '10000', tagline: 'Harnessing Stars',
    description: 'Humanity has built megastructures around stars. A civilization of unimaginable scale and complexity.',
    atmosphere: 'Megastructures, post-scarcity', unlocked: true, color: '#FBBF24', icon: 'sun',
  },
  time_travel: {
    id: 'time_travel', name: 'Time Travel', year: 'All Times', tagline: 'When Are You?',
    description: 'Navigate the timestream. Paradoxes, alternate timelines, and temporal wars threaten reality.',
    atmosphere: 'Doctor Who, Terminator, Back to Future', unlocked: true, color: '#8B5CF6', icon: 'clock',
  },
  parallel_universe: {
    id: 'parallel_universe', name: 'Parallel Universe', year: 'Infinite', tagline: 'Infinite Possibilities',
    description: 'Countless parallel worlds exist. Travel between realities and meet alternate versions of yourself.',
    atmosphere: 'Sliders, multiverse theory', unlocked: true, color: '#EC4899', icon: 'layers',
  },
  simulation: {
    id: 'simulation', name: 'Simulation', year: 'Unknown', tagline: 'Is This Real?',
    description: 'Reality might be a simulation. Glitches reveal the truth. Can you escape the program?',
    atmosphere: 'The Matrix, existential questions', unlocked: true, color: '#10B981', icon: 'monitor',
  },
  ai_uprising: {
    id: 'ai_uprising', name: 'AI Uprising', year: '2055', tagline: 'Machines Awaken',
    description: 'Artificial intelligence has become sentient and turned against humanity. Man vs machine.',
    atmosphere: 'Terminator, I Robot, Westworld', unlocked: true, color: '#EF4444', icon: 'bot',
  },
  transhuman: {
    id: 'transhuman', name: 'Transhuman', year: '2100', tagline: 'Beyond Human',
    description: 'Humanity transcends biological limits. Uploaded minds, enhanced bodies, what does it mean to be human?',
    atmosphere: 'Altered Carbon, mind uploading', unlocked: true, color: '#06B6D4', icon: 'brain',
  },
  clone_wars: {
    id: 'clone_wars', name: 'Clone Wars', year: '2180', tagline: 'Copies at War',
    description: 'Clone armies battle across the galaxy. Questions of identity and the ethics of manufactured life.',
    atmosphere: 'Star Wars Clone Wars, Orphan Black', unlocked: true, color: '#F97316', icon: 'users',
  },
  mech_pilot: {
    id: 'mech_pilot', name: 'Mech Pilot', year: '2250', tagline: 'Giant Machines',
    description: 'Pilot massive mechanized suits into battle. The bond between pilot and machine decides wars.',
    atmosphere: 'Pacific Rim, Gundam, Evangelion', unlocked: true, color: '#3B82F6', icon: 'bot',
  },
  starship_crew: {
    id: 'starship_crew', name: 'Starship Crew', year: '2400', tagline: 'Explore Strange New Worlds',
    description: 'Command or serve aboard a starship exploring the unknown. Discover new civilizations.',
    atmosphere: 'Star Trek, exploration, diplomacy', unlocked: true, color: '#1D4ED8', icon: 'rocket',
  },
  bounty_hunter_space: {
    id: 'bounty_hunter_space', name: 'Space Bounty Hunter', year: '2550', tagline: 'Hunt Across the Stars',
    description: 'Track dangerous criminals across the galaxy. Your ship is your home, the cosmos your hunting ground.',
    atmosphere: 'Cowboy Bebop, Mandalorian', unlocked: true, color: '#A855F7', icon: 'crosshair',
  },
  space_horror: {
    id: 'space_horror', name: 'Space Horror', year: '2150', tagline: 'In Space No One Can Hear You',
    description: 'Something lurks in the dark void. Isolated in space, terror comes from beyond the stars.',
    atmosphere: 'Alien, Event Horizon, Dead Space', unlocked: true, color: '#18181B', icon: 'skull',
  },

  // ========== HORROR ERAS ==========
  slasher: {
    id: 'slasher', name: 'Slasher', year: '1980s', tagline: 'Final Girl',
    description: 'A masked killer stalks teenagers. Survival means outsmarting a relentless, unstoppable evil.',
    atmosphere: 'Friday the 13th, Halloween, Scream', unlocked: true, color: '#DC2626', icon: 'skull',
  },
  zombie_outbreak: {
    id: 'zombie_outbreak', name: 'Zombie Outbreak', year: 'Present', tagline: 'The Dead Walk',
    description: 'The dead have risen. Survive the horde, find other survivors, and search for a cure or safe haven.',
    atmosphere: 'Walking Dead, 28 Days Later', unlocked: true, color: '#65A30D', icon: 'users',
  },
  vampire_gothic: {
    id: 'vampire_gothic', name: 'Vampire Gothic', year: '1890', tagline: 'Eternal Thirst',
    description: 'Ancient vampires rule from shadowed castles. Their dark society hides among mortals.',
    atmosphere: 'Dracula, Interview with the Vampire', unlocked: true, color: '#7F1D1D', icon: 'moon',
  },
  werewolf_curse: {
    id: 'werewolf_curse', name: 'Werewolf Curse', year: 'Various', tagline: 'The Beast Within',
    description: 'The curse of lycanthropy spreads. Control the beast or become consumed by primal rage.',
    atmosphere: 'An American Werewolf, Wolf', unlocked: true, color: '#713F12', icon: 'moon',
  },
  haunted_house: {
    id: 'haunted_house', name: 'Haunted House', year: 'Various', tagline: 'This House is Alive',
    description: 'A house with dark history traps those who enter. Ghosts demand their stories be told.',
    atmosphere: 'The Haunting, Amityville Horror', unlocked: true, color: '#374151', icon: 'home',
  },
  cult_horror: {
    id: 'cult_horror', name: 'Cult Horror', year: 'Various', tagline: 'Join Us',
    description: 'A sinister cult operates in secret. Their rituals summon things that should stay hidden.',
    atmosphere: 'Midsommar, The Wicker Man', unlocked: true, color: '#991B1B', icon: 'users',
  },
  body_horror: {
    id: 'body_horror', name: 'Body Horror', year: 'Various', tagline: 'Flesh Betrays',
    description: 'The human body becomes the source of terror. Transformation, mutation, and loss of bodily autonomy.',
    atmosphere: 'The Fly, Cronenberg, The Thing', unlocked: true, color: '#BE185D', icon: 'heart',
  },
  folk_horror: {
    id: 'folk_horror', name: 'Folk Horror', year: 'Rural', tagline: 'Old Gods Remember',
    description: 'Ancient rural traditions hide dark truths. The old ways demand sacrifice.',
    atmosphere: 'Midsommar, The VVitch, Apostle', unlocked: true, color: '#4D7C0F', icon: 'trees',
  },
  psychological_horror: {
    id: 'psychological_horror', name: 'Psychological Horror', year: 'Various', tagline: 'Trust Nothing',
    description: 'The mind becomes the battleground. Reality bends, paranoia grows, sanity slips away.',
    atmosphere: 'Black Swan, Shutter Island', unlocked: true, color: '#4B5563', icon: 'brain',
  },
  survival_horror: {
    id: 'survival_horror', name: 'Survival Horror', year: 'Various', tagline: 'Resources Are Scarce',
    description: 'Limited resources, overwhelming threats. Every bullet counts, every decision matters.',
    atmosphere: 'Resident Evil, Silent Hill', unlocked: true, color: '#57534E', icon: 'shield',
  },
  cosmic_horror: {
    id: 'cosmic_horror', name: 'Cosmic Horror', year: 'Various', tagline: 'Humanity Is Nothing',
    description: 'Entities beyond comprehension. The universe is vast, uncaring, and filled with ancient horrors.',
    atmosphere: 'Lovecraft, cosmic insignificance', unlocked: true, color: '#312E81', icon: 'eye',
  },
  demonic: {
    id: 'demonic', name: 'Demonic Possession', year: 'Various', tagline: 'The Devil Inside',
    description: 'Demons from hell seek to corrupt and possess. Faith is tested, souls are at stake.',
    atmosphere: 'The Exorcist, Insidious, Conjuring', unlocked: true, color: '#450A0A', icon: 'flame',
  },
  witch_trials: {
    id: 'witch_trials', name: 'Witch Trials', year: '1692', tagline: 'Burn the Witch',
    description: 'Salem burns with accusations. Are the witches real, or is mass hysteria the true evil?',
    atmosphere: 'The Crucible, VVitch, Salem', unlocked: true, color: '#292524', icon: 'flame',
  },
  asylum: {
    id: 'asylum', name: 'Asylum', year: '1950s', tagline: 'No One Leaves',
    description: 'A mental institution where the treatments are worse than the madness. Something evil lurks here.',
    atmosphere: 'American Horror Story, Outlast', unlocked: true, color: '#D4D4D8', icon: 'building',
  },
  carnival_horror: {
    id: 'carnival_horror', name: 'Carnival Horror', year: 'Various', tagline: 'Step Right Up',
    description: 'A traveling carnival with dark secrets. Freaks, fortune tellers, and fatal attractions.',
    atmosphere: 'Something Wicked This Way Comes', unlocked: true, color: '#EA580C', icon: 'ticket',
  },

  // ========== HISTORICAL ERAS ==========
  ancient_egypt: {
    id: 'ancient_egypt', name: 'Ancient Egypt', year: '-1350', tagline: 'Land of the Pharaohs',
    description: 'The Nile kingdom at its height. Pyramids rise, gods walk among mortals, mummies guard secrets.',
    atmosphere: 'Pharaohs, mummies, ancient magic', unlocked: true, color: '#D97706', icon: 'pyramid',
  },
  ancient_rome: {
    id: 'ancient_rome', name: 'Ancient Rome', year: '50', tagline: 'Glory of the Empire',
    description: 'The Roman Empire at its peak. Gladiators, senators, legions, and the intrigue of the Colosseum.',
    atmosphere: 'Gladiator, Spartacus, Roman politics', unlocked: true, color: '#B91C1C', icon: 'columns',
  },
  ancient_china: {
    id: 'ancient_china', name: 'Ancient China', year: '-200', tagline: 'The Middle Kingdom',
    description: 'Imperial China of warring states. Dynasties rise and fall, martial artists and court intrigue.',
    atmosphere: 'Three Kingdoms, imperial drama', unlocked: true, color: '#DC2626', icon: 'castle',
  },
  viking_age: {
    id: 'viking_age', name: 'Viking Age', year: '850', tagline: 'Sail, Raid, Conquer',
    description: 'Norse warriors seek glory across the seas. Raids, sagas, and the clash of gods and men.',
    atmosphere: 'Vikings, Norse conquest, saga tales', unlocked: true, color: '#1E3A8A', icon: 'anchor',
  },
  mongol_empire: {
    id: 'mongol_empire', name: 'Mongol Empire', year: '1220', tagline: 'The Endless Horde',
    description: 'The greatest land empire in history. Ride with the Khan and conquer from China to Europe.',
    atmosphere: 'Genghis Khan, mounted warfare', unlocked: true, color: '#78350F', icon: 'flag',
  },
  crusades: {
    id: 'crusades', name: 'Crusades', year: '1190', tagline: 'Holy War',
    description: 'Christian and Muslim forces clash over the Holy Land. Faith, politics, and bloodshed intertwine.',
    atmosphere: 'Kingdom of Heaven, religious war', unlocked: true, color: '#9F1239', icon: 'cross',
  },
  renaissance: {
    id: 'renaissance', name: 'Renaissance', year: '1500', tagline: 'Rebirth of Wonder',
    description: 'Art and science flourish. Da Vinci, Michelangelo, and political intrigue in Italian city-states.',
    atmosphere: 'Assassins Creed 2, Borgias', unlocked: true, color: '#A16207', icon: 'palette',
  },
  elizabethan: {
    id: 'elizabethan', name: 'Elizabethan Era', year: '1590', tagline: 'Shakespeare\'s World',
    description: 'England under Queen Elizabeth I. Theatre, exploration, Spanish threats, and courtly intrigue.',
    atmosphere: 'Shakespeare, Tudor court drama', unlocked: true, color: '#7C2D12', icon: 'crown',
  },
  french_revolution: {
    id: 'french_revolution', name: 'French Revolution', year: '1789', tagline: 'Liberty or Death',
    description: 'The people rise against the monarchy. Guillotines fall, ideals clash with brutal reality.',
    atmosphere: 'Les Miserables, revolutionary fervor', unlocked: true, color: '#1E40AF', icon: 'flag',
  },
  napoleonic: {
    id: 'napoleonic', name: 'Napoleonic Wars', year: '1805', tagline: 'Empire of the Eagle',
    description: 'Napoleon reshapes Europe through conquest. Grand battles, strategic genius, and imperial ambition.',
    atmosphere: 'War and Peace, grand warfare', unlocked: true, color: '#1E3A8A', icon: 'flag',
  },
  american_civil_war: {
    id: 'american_civil_war', name: 'American Civil War', year: '1863', tagline: 'Brother Against Brother',
    description: 'America tears itself apart. The fight for union and freedom on blood-soaked battlefields.',
    atmosphere: 'Gone with the Wind, Lincoln', unlocked: true, color: '#1F2937', icon: 'flag',
  },
  industrial_revolution: {
    id: 'industrial_revolution', name: 'Industrial Revolution', year: '1850', tagline: 'Smoke and Progress',
    description: 'Factories transform society. Child labor, class struggle, and the birth of modern industry.',
    atmosphere: 'Oliver Twist, Dickensian London', unlocked: true, color: '#44403C', icon: 'factory',
  },
  roaring_twenties: {
    id: 'roaring_twenties', name: 'Roaring Twenties', year: '1925', tagline: 'Jazz Age',
    description: 'Prohibition, flappers, and jazz. The party roars while gangsters control the underworld.',
    atmosphere: 'Great Gatsby, speakeasies', unlocked: true, color: '#CA8A04', icon: 'music',
  },
  great_depression: {
    id: 'great_depression', name: 'Great Depression', year: '1932', tagline: 'Hard Times',
    description: 'Economic collapse grips the world. Dust bowls, hobos, and desperate measures to survive.',
    atmosphere: 'Grapes of Wrath, survival', unlocked: true, color: '#78716C', icon: 'trending-down',
  },
  world_war_1: {
    id: 'world_war_1', name: 'World War I', year: '1916', tagline: 'The Great War',
    description: 'Trenches stretch across Europe. Mustard gas, artillery, and the death of the old world order.',
    atmosphere: '1917, All Quiet on Western Front', unlocked: true, color: '#57534E', icon: 'target',
  },
  world_war_2: {
    id: 'world_war_2', name: 'World War II', year: '1943', tagline: 'The World at War',
    description: 'Global conflict between Allied and Axis powers. Heroes and atrocities on every front.',
    atmosphere: 'Saving Private Ryan, Band of Brothers', unlocked: true, color: '#1F2937', icon: 'plane',
  },
  cold_war: {
    id: 'cold_war', name: 'Cold War', year: '1962', tagline: 'Mutually Assured',
    description: 'Superpowers play chess with the world. Spies, nuclear fear, and proxy wars shape an era.',
    atmosphere: 'Bridge of Spies, atomic anxiety', unlocked: true, color: '#EF4444', icon: 'alert-triangle',
  },
  vietnam_war: {
    id: 'vietnam_war', name: 'Vietnam War', year: '1968', tagline: 'Into the Jungle',
    description: 'Guerrilla warfare in Southeast Asia. Young soldiers face an enemy they cannot see.',
    atmosphere: 'Apocalypse Now, Platoon', unlocked: true, color: '#15803D', icon: 'trees',
  },
  korean_war: {
    id: 'korean_war', name: 'Korean War', year: '1951', tagline: 'The Forgotten War',
    description: 'Cold War turns hot on the Korean peninsula. A conflict often overshadowed but never ended.',
    atmosphere: 'MASH, Korean conflict', unlocked: true, color: '#1D4ED8', icon: 'flag',
  },

  // ========== MODERN/CONTEMPORARY ERAS ==========
  spy_thriller: {
    id: 'spy_thriller', name: 'Spy Thriller', year: 'Modern', tagline: 'Trust No One',
    description: 'International espionage in a world of shadows. Double agents, gadgets, and high-stakes missions.',
    atmosphere: 'James Bond, Mission Impossible', unlocked: true, color: '#18181B', icon: 'eye',
  },
  heist: {
    id: 'heist', name: 'Heist', year: 'Modern', tagline: 'One Last Job',
    description: 'Assemble the perfect crew for the impossible theft. Plans within plans, and always a twist.',
    atmosphere: 'Ocean\'s Eleven, Money Heist', unlocked: true, color: '#FBBF24', icon: 'key',
  },
  crime_syndicate: {
    id: 'crime_syndicate', name: 'Crime Syndicate', year: 'Modern', tagline: 'Family Business',
    description: 'Rise through the ranks of organized crime. Loyalty, betrayal, and the price of power.',
    atmosphere: 'Godfather, Goodfellas, Peaky Blinders', unlocked: true, color: '#1C1917', icon: 'briefcase',
  },
  street_gang: {
    id: 'street_gang', name: 'Street Gang', year: 'Modern', tagline: 'Rules of the Street',
    description: 'Survive in the urban jungle. Gang wars, loyalty, and the struggle for territory.',
    atmosphere: 'The Wire, GTA, hood stories', unlocked: true, color: '#374151', icon: 'map-pin',
  },
  cartel: {
    id: 'cartel', name: 'Cartel', year: 'Modern', tagline: 'Plata o Plomo',
    description: 'The drug trade at its most brutal. Cartels wage war for control of billion-dollar empires.',
    atmosphere: 'Narcos, Sicario, drug wars', unlocked: true, color: '#166534', icon: 'dollar-sign',
  },
  political_thriller: {
    id: 'political_thriller', name: 'Political Thriller', year: 'Modern', tagline: 'Power Corrupts',
    description: 'Corruption at the highest levels. Conspiracies, cover-ups, and the fight for truth.',
    atmosphere: 'House of Cards, All the President\'s Men', unlocked: true, color: '#1E3A8A', icon: 'building',
  },
  corporate_espionage: {
    id: 'corporate_espionage', name: 'Corporate Espionage', year: 'Modern', tagline: 'Business is War',
    description: 'Mega-corporations battle for dominance. Industrial spies steal secrets worth billions.',
    atmosphere: 'Severance, corporate thriller', unlocked: true, color: '#0F172A', icon: 'briefcase',
  },
  journalist: {
    id: 'journalist', name: 'Investigative Journalist', year: 'Modern', tagline: 'Follow the Story',
    description: 'Uncover the truth that powerful people want hidden. The pen might be mightier than the sword.',
    atmosphere: 'Spotlight, All the President\'s Men', unlocked: true, color: '#374151', icon: 'newspaper',
  },
  hacker_modern: {
    id: 'hacker_modern', name: 'Modern Hacker', year: 'Present', tagline: 'Access Granted',
    description: 'Navigate the digital underground. Hacktivists, cyber criminals, and the battle for information.',
    atmosphere: 'Mr. Robot, Watch Dogs', unlocked: true, color: '#22C55E', icon: 'terminal',
  },
  paranormal_investigator: {
    id: 'paranormal_investigator', name: 'Paranormal Investigator', year: 'Modern', tagline: 'Seeking Proof',
    description: 'Hunt for evidence of the supernatural. Ghosts, cryptids, and unexplained phenomena await.',
    atmosphere: 'Supernatural, X-Files, ghost hunting', unlocked: true, color: '#6B21A8', icon: 'ghost',
  },
  urban_legends: {
    id: 'urban_legends', name: 'Urban Legends', year: 'Modern', tagline: 'Every Legend Has Truth',
    description: 'The stories whispered in the dark are real. Bloody Mary, Slender Man, and modern myths come alive.',
    atmosphere: 'Creepypasta, modern horror myths', unlocked: true, color: '#292524', icon: 'message-circle',
  },
  conspiracy: {
    id: 'conspiracy', name: 'Conspiracy', year: 'Modern', tagline: 'They\'re Watching',
    description: 'Hidden forces control the world. Unravel the web of conspiracy before they silence you.',
    atmosphere: 'Illuminati, deep state, truth seekers', unlocked: true, color: '#1F2937', icon: 'eye',
  },
  secret_society: {
    id: 'secret_society', name: 'Secret Society', year: 'Various', tagline: 'Hidden Among Us',
    description: 'Ancient organizations operate in shadow. Their rituals and goals shape history from behind the scenes.',
    atmosphere: 'Da Vinci Code, Illuminati fiction', unlocked: true, color: '#7C2D12', icon: 'lock',
  },

  // ========== ADVENTURE ERAS ==========
  jungle_explorer: {
    id: 'jungle_explorer', name: 'Jungle Explorer', year: '1930s', tagline: 'Into the Green Hell',
    description: 'Dense jungles hide lost cities and deadly creatures. Adventure awaits the brave.',
    atmosphere: 'Indiana Jones, Tomb Raider, pulp adventure', unlocked: true, color: '#166534', icon: 'trees',
  },
  arctic_expedition: {
    id: 'arctic_expedition', name: 'Arctic Expedition', year: 'Various', tagline: 'The Frozen Unknown',
    description: 'Brave the polar extremes. What ancient secrets lie buried beneath eternal ice?',
    atmosphere: 'The Terror, Arctic exploration', unlocked: true, color: '#E0F2FE', icon: 'snowflake',
  },
  deep_sea: {
    id: 'deep_sea', name: 'Deep Sea', year: 'Modern', tagline: 'Pressure Mounts',
    description: 'Explore the ocean depths where no light reaches. Ancient creatures and lost secrets await.',
    atmosphere: 'The Abyss, Subnautica, deep diving', unlocked: true, color: '#0C4A6E', icon: 'anchor',
  },
  lost_civilization: {
    id: 'lost_civilization', name: 'Lost Civilization', year: 'Ancient', tagline: 'Cities Forgotten',
    description: 'Discover civilizations time forgot. Atlantis, El Dorado, and technologies beyond their era.',
    atmosphere: 'Atlantis, ancient mysteries', unlocked: true, color: '#854D0E', icon: 'map',
  },
  treasure_hunter: {
    id: 'treasure_hunter', name: 'Treasure Hunter', year: 'Various', tagline: 'X Marks the Spot',
    description: 'Follow maps and legends to hidden riches. But treasure always comes with danger.',
    atmosphere: 'Uncharted, National Treasure', unlocked: true, color: '#CA8A04', icon: 'map',
  },
  safari: {
    id: 'safari', name: 'Safari', year: '1920s', tagline: 'The Great Hunt',
    description: 'African wilderness filled with magnificent beasts. Conservation or colonial adventure, you choose.',
    atmosphere: 'Out of Africa, big game hunting', unlocked: true, color: '#A16207', icon: 'binoculars',
  },
  mountaineer: {
    id: 'mountaineer', name: 'Mountaineer', year: 'Modern', tagline: 'Summit or Die',
    description: 'Conquer the world\'s deadliest peaks. The mountain doesn\'t care about your dreams.',
    atmosphere: 'Everest, extreme climbing', unlocked: true, color: '#6B7280', icon: 'mountain',
  },
  storm_chaser: {
    id: 'storm_chaser', name: 'Storm Chaser', year: 'Modern', tagline: 'Into the Eye',
    description: 'Chase nature\'s fury across the plains. Tornadoes, hurricanes, and the thrill of the extreme.',
    atmosphere: 'Twister, extreme weather', unlocked: true, color: '#475569', icon: 'cloud-lightning',
  },
  archaeological: {
    id: 'archaeological', name: 'Archaeological', year: 'Various', tagline: 'Digging Up the Past',
    description: 'Unearth history one brush stroke at a time. Ancient tombs hold secrets worth dying for.',
    atmosphere: 'Indiana Jones, academic adventure', unlocked: true, color: '#92400E', icon: 'shovel',
  },
  shipwreck_survivor: {
    id: 'shipwreck_survivor', name: 'Shipwreck Survivor', year: 'Various', tagline: 'Cast Away',
    description: 'Stranded on a remote island. Survive, signal for rescue, and uncover the island\'s mysteries.',
    atmosphere: 'Cast Away, Lost, survival', unlocked: true, color: '#0D9488', icon: 'anchor',
  },
  desert_nomad: {
    id: 'desert_nomad', name: 'Desert Nomad', year: 'Ancient', tagline: 'Sands of Time',
    description: 'Traverse endless dunes. Oases hide secrets, sandstorms bury civilizations.',
    atmosphere: 'Arabian adventures, desert survival', unlocked: true, color: '#D97706', icon: 'sun',
  },
  rainforest: {
    id: 'rainforest', name: 'Rainforest', year: 'Modern', tagline: 'The Living Forest',
    description: 'The densest ecosystem on Earth. Indigenous tribes, rare species, and pharmaceutical secrets.',
    atmosphere: 'Amazon exploration, conservation', unlocked: true, color: '#15803D', icon: 'leaf',
  },
  underground_caves: {
    id: 'underground_caves', name: 'Underground Caves', year: 'Various', tagline: 'Beneath the Surface',
    description: 'Spelunk into the depths of the earth. Ancient cave systems hide wonders and terrors.',
    atmosphere: 'The Descent, cave exploration', unlocked: true, color: '#44403C', icon: 'mountain',
  },

  // ========== MYTHOLOGY & LEGEND ERAS ==========
  greek_mythology: {
    id: 'greek_mythology', name: 'Greek Mythology', year: 'Mythic', tagline: 'Olympus Watches',
    description: 'Gods and titans shape mortal fates. Heroes undertake legendary quests.',
    atmosphere: 'Percy Jackson, Clash of Titans', unlocked: true, color: '#2563EB', icon: 'zap',
  },
  norse_mythology: {
    id: 'norse_mythology', name: 'Norse Mythology', year: 'Mythic', tagline: 'Ragnarok Approaches',
    description: 'Odin\'s ravens watch all. Thor battles giants while Loki schemes. The end times loom.',
    atmosphere: 'God of War, Norse epics', unlocked: true, color: '#1E3A8A', icon: 'hammer',
  },
  egyptian_mythology: {
    id: 'egyptian_mythology', name: 'Egyptian Mythology', year: 'Mythic', tagline: 'Judgment of Souls',
    description: 'Ra sails across the sky. Anubis weighs hearts. The Book of the Dead guides the afterlife.',
    atmosphere: 'Egyptian gods, pyramid mysteries', unlocked: true, color: '#CA8A04', icon: 'pyramid',
  },
  japanese_mythology: {
    id: 'japanese_mythology', name: 'Japanese Mythology', year: 'Mythic', tagline: 'Spirits Everywhere',
    description: 'Kami inhabit all things. Yokai roam the night. Amaterasu\'s light battles eternal darkness.',
    atmosphere: 'Shinto myths, Studio Ghibli spirits', unlocked: true, color: '#DC2626', icon: 'sunrise',
  },
  chinese_mythology: {
    id: 'chinese_mythology', name: 'Chinese Mythology', year: 'Mythic', tagline: 'Jade Empire',
    description: 'Dragons bring fortune, the Jade Emperor rules heaven. Journey to the West begins.',
    atmosphere: 'Journey to the West, Chinese legends', unlocked: true, color: '#DC2626', icon: 'flame',
  },
  hindu_mythology: {
    id: 'hindu_mythology', name: 'Hindu Mythology', year: 'Mythic', tagline: 'Cosmic Dance',
    description: 'Vishnu preserves, Shiva destroys, Brahma creates. Epic battles between gods and demons.',
    atmosphere: 'Mahabharata, Ramayana, divine conflicts', unlocked: true, color: '#F97316', icon: 'sun',
  },
  mayan_mythology: {
    id: 'mayan_mythology', name: 'Mayan Mythology', year: 'Mythic', tagline: 'Lords of Xibalba',
    description: 'Navigate the underworld of Xibalba. Hero Twins battle death lords in the ball court of fate.',
    atmosphere: 'Mayan creation myths, underworld', unlocked: true, color: '#166534', icon: 'pyramid',
  },
  aztec_mythology: {
    id: 'aztec_mythology', name: 'Aztec Mythology', year: 'Mythic', tagline: 'Fifth Sun',
    description: 'Quetzalcoatl and Tezcatlipoca shape the world. Blood feeds the sun. Prophecy demands sacrifice.',
    atmosphere: 'Aztec gods, cosmic cycles', unlocked: true, color: '#B91C1C', icon: 'sun',
  },
  celtic_mythology: {
    id: 'celtic_mythology', name: 'Celtic Mythology', year: 'Mythic', tagline: 'The Otherworld',
    description: 'The Tuatha Dé Danann rule the Otherworld. Heroes like Cú Chulainn perform impossible feats.',
    atmosphere: 'Irish myths, fae and heroes', unlocked: true, color: '#15803D', icon: 'clover',
  },
  slavic_mythology: {
    id: 'slavic_mythology', name: 'Slavic Mythology', year: 'Mythic', tagline: 'Old Gods',
    description: 'Perun thunders from above while Veles rules below. Rusalki lure the unwary to watery graves.',
    atmosphere: 'Slavic paganism, dark forests', unlocked: true, color: '#1E3A8A', icon: 'zap',
  },
  african_mythology_era: {
    id: 'african_mythology_era', name: 'African Myths', year: 'Mythic', tagline: 'Ancestral Spirits',
    description: 'Anansi spins his tales. Orishas guide the faithful. The spirits of ancestors watch over all.',
    atmosphere: 'African deity tales, trickster stories', unlocked: true, color: '#CA8A04', icon: 'sun',
  },
  native_mythology: {
    id: 'native_mythology', name: 'Native Mythology', year: 'Mythic', tagline: 'Great Spirit',
    description: 'Coyote plays tricks while Thunderbird soars. The spirit world and mortal realm intertwine.',
    atmosphere: 'Indigenous legends, nature spirits', unlocked: true, color: '#7C2D12', icon: 'feather',
  },

  // ========== ALTERNATE HISTORY ==========
  nazi_victory: {
    id: 'nazi_victory', name: 'Axis Victory', year: '1962', tagline: 'The Man in the High Castle',
    description: 'Germany and Japan won WWII. Resistance fighters struggle in a divided world.',
    atmosphere: 'Man in High Castle, Wolfenstein', unlocked: true, color: '#1F2937', icon: 'flag',
  },
  confederate_victory: {
    id: 'confederate_victory', name: 'Confederate Victory', year: '1900', tagline: 'A House Divided',
    description: 'The South won the Civil War. Two Americas exist in uneasy tension.',
    atmosphere: 'Alternate Civil War, divided nation', unlocked: true, color: '#6B7280', icon: 'flag',
  },
  roman_never_fell: {
    id: 'roman_never_fell', name: 'Eternal Rome', year: '1500', tagline: 'Roma Invicta',
    description: 'The Roman Empire never fell. Latin is the world language, legions still march.',
    atmosphere: 'Eternal Rome, imperial continuity', unlocked: true, color: '#B91C1C', icon: 'columns',
  },
  aztec_empire: {
    id: 'aztec_empire', name: 'Aztec Empire', year: '1800', tagline: 'The Fifth Sun Endures',
    description: 'The Aztec Empire was never conquered. Mesoamerican civilization dominates the Americas.',
    atmosphere: 'Surviving Aztec civilization', unlocked: true, color: '#059669', icon: 'pyramid',
  },
  chinese_discovery: {
    id: 'chinese_discovery', name: 'Chinese Discovery', year: '1600', tagline: 'The Dragon Fleet',
    description: 'China discovered and colonized the world. Eastern empires dominate global politics.',
    atmosphere: 'Ming exploration, Eastern dominance', unlocked: true, color: '#DC2626', icon: 'ship',
  },
  steampunk_empire: {
    id: 'steampunk_empire', name: 'Steampunk Empire', year: '1889', tagline: 'Steam Never Stopped',
    description: 'The age of steam never ended. Clockwork wonders and brass technology rule the world.',
    atmosphere: 'Steampunk aesthetic, Victorian sci-fi', unlocked: true, color: '#92400E', icon: 'cog',
  },
  magic_industrial: {
    id: 'magic_industrial', name: 'Magical Industrial', year: '1920', tagline: 'Spellwork Factories',
    description: 'Magic was industrialized. Spell factories, enchanted assembly lines, and magical pollution.',
    atmosphere: 'Fantasy industrial revolution', unlocked: true, color: '#7C3AED', icon: 'factory',
  },
  dinosaurs_survived: {
    id: 'dinosaurs_survived', name: 'Dinosaurs Survived', year: 'Present', tagline: 'Jurassic Present',
    description: 'The asteroid missed. Dinosaurs evolved alongside mammals. Civilization adapts to apex predators.',
    atmosphere: 'Dinotopia, coexistence', unlocked: true, color: '#22C55E', icon: 'bird',
  },

  // ========== POP CULTURE INSPIRED ==========
  matrix_style: {
    id: 'matrix_style', name: 'Digital Reality', year: '2199', tagline: 'What Is Real?',
    description: 'Reality is a simulation. Hackers can bend the rules, but the machines fight back.',
    atmosphere: 'Matrix-inspired, virtual reality war', unlocked: true, color: '#22C55E', icon: 'code',
  },
  mad_max_style: {
    id: 'mad_max_style', name: 'Road Warrior', year: '2050', tagline: 'Witness Me',
    description: 'The world is a wasteland. Gasoline is precious. War rigs rule the endless highway.',
    atmosphere: 'Mad Max, vehicular combat', unlocked: true, color: '#EA580C', icon: 'truck',
  },
  blade_runner_style: {
    id: 'blade_runner_style', name: 'Replicant Hunt', year: '2049', tagline: 'More Human Than Human',
    description: 'Hunt down rogue replicants in rain-soaked neon cities. Question what it means to be human.',
    atmosphere: 'Blade Runner, neo-noir sci-fi', unlocked: true, color: '#0EA5E9', icon: 'eye',
  },
  star_wars_style: {
    id: 'star_wars_style', name: 'Galactic Conflict', year: 'Long Ago', tagline: 'The Force Awakens',
    description: 'An ancient order wields mystical powers. Rebels fight an evil empire across the stars.',
    atmosphere: 'Space fantasy, light vs dark', unlocked: true, color: '#FBBF24', icon: 'star',
  },
  star_trek_style: {
    id: 'star_trek_style', name: 'Federation', year: '2370', tagline: 'Boldly Go',
    description: 'A utopian federation explores the galaxy. First contact, diplomacy, and strange new worlds.',
    atmosphere: 'Star Trek, exploration optimism', unlocked: true, color: '#1D4ED8', icon: 'rocket',
  },
  alien_style: {
    id: 'alien_style', name: 'Xenomorph', year: '2120', tagline: 'Perfect Organism',
    description: 'A perfect predator stalks the crew. In space, survival is the only mission.',
    atmosphere: 'Alien, sci-fi horror', unlocked: true, color: '#18181B', icon: 'skull',
  },
  terminator_style: {
    id: 'terminator_style', name: 'Machine War', year: '2029', tagline: 'No Fate',
    description: 'Machines have risen. The human resistance fights for survival against Skynet.',
    atmosphere: 'Terminator, machine apocalypse', unlocked: true, color: '#EF4444', icon: 'bot',
  },
  jurassic_style: {
    id: 'jurassic_style', name: 'Dinosaur Park', year: 'Present', tagline: 'Life Finds a Way',
    description: 'Scientists have resurrected dinosaurs. Now survive the consequences of playing god.',
    atmosphere: 'Jurassic Park, dino survival', unlocked: true, color: '#22C55E', icon: 'bird',
  },
  hunger_games_style: {
    id: 'hunger_games_style', name: 'Death Games', year: '2150', tagline: 'May the Odds',
    description: 'A dystopian state forces citizens to fight in televised death matches. Rebellion brews.',
    atmosphere: 'Hunger Games, survival competition', unlocked: true, color: '#F97316', icon: 'flame',
  },
  divergent_style: {
    id: 'divergent_style', name: 'Faction Society', year: '2150', tagline: 'Choose Your Path',
    description: 'Society is divided into factions by virtue. But what if you don\'t fit any category?',
    atmosphere: 'Divergent, faction dystopia', unlocked: true, color: '#3B82F6', icon: 'users',
  },
  maze_runner_style: {
    id: 'maze_runner_style', name: 'The Maze', year: 'Unknown', tagline: 'Run or Die',
    description: 'Trapped in an ever-changing maze with no memories. Escape is the only option.',
    atmosphere: 'Maze Runner, mysterious prison', unlocked: true, color: '#65A30D', icon: 'compass',
  },
  walking_dead_style: {
    id: 'walking_dead_style', name: 'Walker Apocalypse', year: 'Present', tagline: 'The Living Are Worse',
    description: 'The dead walk, but the living are the real monsters. Communities rise and fall.',
    atmosphere: 'Walking Dead, survivor drama', unlocked: true, color: '#57534E', icon: 'users',
  },
  game_of_thrones_style: {
    id: 'game_of_thrones_style', name: 'War of Thrones', year: 'Medieval', tagline: 'Winter Is Coming',
    description: 'Noble houses battle for the throne. Dragons return, and an ancient threat rises in the north.',
    atmosphere: 'Game of Thrones, political fantasy', unlocked: true, color: '#1F2937', icon: 'crown',
  },
  witcher_style: {
    id: 'witcher_style', name: 'Monster Slayer', year: 'Medieval', tagline: 'Silver and Steel',
    description: 'Mutated hunters track monsters for coin. In a world of grey morality, evil is relative.',
    atmosphere: 'The Witcher, dark fantasy hunting', unlocked: true, color: '#78716C', icon: 'swords',
  },
  lord_of_rings_style: {
    id: 'lord_of_rings_style', name: 'One Ring', year: 'Third Age', tagline: 'One Ring to Rule Them All',
    description: 'A dark lord rises. A fellowship must destroy the ultimate weapon before evil covers the land.',
    atmosphere: 'Lord of the Rings, epic quest', unlocked: true, color: '#CA8A04', icon: 'circle',
  },
  harry_potter_style: {
    id: 'harry_potter_style', name: 'Wizarding World', year: 'Modern', tagline: 'Magic Is Real',
    description: 'A hidden magical society exists alongside the mundane. Attend the academy, learn spells.',
    atmosphere: 'Harry Potter, magical school', unlocked: true, color: '#7C3AED', icon: 'wand-2',
  },
  percy_jackson_style: {
    id: 'percy_jackson_style', name: 'Demigod Camp', year: 'Modern', tagline: 'Children of the Gods',
    description: 'Greek gods are real and have children. Train at camp and undertake heroic quests.',
    atmosphere: 'Percy Jackson, modern mythology', unlocked: true, color: '#0EA5E9', icon: 'zap',
  },
  twilight_style: {
    id: 'twilight_style', name: 'Vampire Romance', year: 'Modern', tagline: 'Forbidden Love',
    description: 'Supernatural beings live among us. Love across species boundaries is dangerous but irresistible.',
    atmosphere: 'Twilight, paranormal romance', unlocked: true, color: '#7F1D1D', icon: 'heart',
  },
  interview_vampire_style: {
    id: 'interview_vampire_style', name: 'Vampire Chronicles', year: 'Various', tagline: 'Eternal Night',
    description: 'Ancient vampires navigate centuries. Immortality brings wisdom, but also endless loneliness.',
    atmosphere: 'Interview with the Vampire, gothic', unlocked: true, color: '#4C1D95', icon: 'moon',
  },
  underworld_style: {
    id: 'underworld_style', name: 'Vampire vs Lycan', year: 'Modern', tagline: 'Blood Feud',
    description: 'An ancient war between vampires and werewolves. Choose your side in the eternal conflict.',
    atmosphere: 'Underworld, supernatural war', unlocked: true, color: '#1E3A8A', icon: 'moon',
  },

  // ========== UNIQUE/EXPERIMENTAL ERAS ==========
  dreams: {
    id: 'dreams', name: 'Dreamscape', year: 'Timeless', tagline: 'Lucid Reality',
    description: 'Navigate the realm of dreams. Rules of reality don\'t apply, but nightmares are very real.',
    atmosphere: 'Inception, Sandman, dream logic', unlocked: true, color: '#A855F7', icon: 'cloud',
  },
  afterlife: {
    id: 'afterlife', name: 'The Afterlife', year: 'Eternal', tagline: 'Beyond the Veil',
    description: 'Death is just the beginning. Navigate the realm of the dead, seek redemption or revenge.',
    atmosphere: 'What Dreams May Come, ghost stories', unlocked: true, color: '#E0E7FF', icon: 'cloud',
  },
  purgatory: {
    id: 'purgatory', name: 'Purgatory', year: 'Timeless', tagline: 'Between Worlds',
    description: 'Neither heaven nor hell. Work through your sins and unfinished business to move on.',
    atmosphere: 'Limbo, spiritual trial', unlocked: true, color: '#9CA3AF', icon: 'scale',
  },
  heaven_hell: {
    id: 'heaven_hell', name: 'Heaven & Hell', year: 'Eternal', tagline: 'The Great War',
    description: 'Angels and demons battle for souls. Pick a side in the ultimate cosmic conflict.',
    atmosphere: 'Good Omens, divine warfare', unlocked: true, color: '#FBBF24', icon: 'sun',
  },
  spirit_world: {
    id: 'spirit_world', name: 'Spirit World', year: 'Timeless', tagline: 'Spirits Walk',
    description: 'A realm where spirits of all kinds dwell. Ancestral ghosts, nature spirits, and entities unknown.',
    atmosphere: 'Spirited Away, ethereal plane', unlocked: true, color: '#C4B5FD', icon: 'ghost',
  },
  fairy_realm: {
    id: 'fairy_realm', name: 'Fairy Realm', year: 'Timeless', tagline: 'The Fae Courts',
    description: 'Enter the realm of the fae. Time flows differently, deals are dangerous, beauty hides cruelty.',
    atmosphere: 'A Court of Thorns and Roses, fae', unlocked: true, color: '#EC4899', icon: 'sparkles',
  },
  elemental_planes: {
    id: 'elemental_planes', name: 'Elemental Planes', year: 'Infinite', tagline: 'Pure Elements',
    description: 'Realms of pure fire, water, earth, and air. Elementals rule their domains absolutely.',
    atmosphere: 'D&D planes, elemental chaos', unlocked: true, color: '#F97316', icon: 'flame',
  },
  shadow_realm: {
    id: 'shadow_realm', name: 'Shadow Realm', year: 'Timeless', tagline: 'Darkness Incarnate',
    description: 'A dark mirror of reality. Shadow creatures lurk, and light is a precious resource.',
    atmosphere: 'Shadowfell, dark dimension', unlocked: true, color: '#18181B', icon: 'moon',
  },
  mirror_world: {
    id: 'mirror_world', name: 'Mirror World', year: 'Reflected', tagline: 'Through the Glass',
    description: 'Everything is reversed. Your reflection has a life of its own. Which side is real?',
    atmosphere: 'Alice in Wonderland, reflection', unlocked: true, color: '#94A3B8', icon: 'square',
  },
  pocket_dimension: {
    id: 'pocket_dimension', name: 'Pocket Dimension', year: 'Variable', tagline: 'Rules Optional',
    description: 'A small dimension with its own rules. Someone created this place. But why?',
    atmosphere: 'Pocket universes, contained worlds', unlocked: true, color: '#8B5CF6', icon: 'box',
  },
  shrunk_world: {
    id: 'shrunk_world', name: 'Shrunk World', year: 'Present', tagline: 'Everything Is Huge',
    description: 'Shrunk to insect size. The backyard is a jungle, a house cat is a monster.',
    atmosphere: 'Honey I Shrunk the Kids, Ant-Man', unlocked: true, color: '#22C55E', icon: 'minimize',
  },
  giant_world: {
    id: 'giant_world', name: 'Giant World', year: 'Present', tagline: 'Everything Is Tiny',
    description: 'You\'ve grown massive. Navigate a world not built for your size. Try not to step on anyone.',
    atmosphere: 'Attack on Titan, Gulliver', unlocked: true, color: '#78716C', icon: 'maximize',
  },
  underwater_kingdom: {
    id: 'underwater_kingdom', name: 'Underwater Kingdom', year: 'Timeless', tagline: 'Beneath the Waves',
    description: 'Civilizations thrive under the sea. Merfolk, leviathans, and ancient aquatic secrets.',
    atmosphere: 'Atlantis, Aquaman, undersea realms', unlocked: true, color: '#0891B2', icon: 'waves',
  },
  sky_islands: {
    id: 'sky_islands', name: 'Sky Islands', year: 'Timeless', tagline: 'Above the Clouds',
    description: 'Islands float in an endless sky. Airships connect kingdoms, and falling means oblivion.',
    atmosphere: 'Laputa, floating civilizations', unlocked: true, color: '#38BDF8', icon: 'cloud',
  },
  hollow_earth: {
    id: 'hollow_earth', name: 'Hollow Earth', year: '1890', tagline: 'World Within',
    description: 'The Earth is hollow, hiding a prehistoric world within. Dinosaurs, lost races, and wonder.',
    atmosphere: 'Journey to Center of Earth, Pellucidar', unlocked: true, color: '#84CC16', icon: 'globe',
  },

  // ========== PROFESSION-BASED ERAS ==========
  gladiator: {
    id: 'gladiator', name: 'Gladiator', year: '50 AD', tagline: 'Are You Not Entertained?',
    description: 'Fight for survival and glory in the arena. The crowd decides your fate.',
    atmosphere: 'Gladiator, arena combat', unlocked: true, color: '#B91C1C', icon: 'swords',
  },
  assassin_guild: {
    id: 'assassin_guild', name: 'Assassin Guild', year: 'Various', tagline: 'Nothing Is True',
    description: 'A secret brotherhood of killers. Contracts, codes, and the art of death.',
    atmosphere: 'Assassin\'s Creed, John Wick', unlocked: true, color: '#1C1917', icon: 'target',
  },
  thieves_guild: {
    id: 'thieves_guild', name: 'Thieves Guild', year: 'Various', tagline: 'Shadows Pay Well',
    description: 'Master the art of theft. From pickpocketing to impossible heists.',
    atmosphere: 'Skyrim Thieves Guild, Leverage', unlocked: true, color: '#374151', icon: 'key',
  },
  mercenary_company: {
    id: 'mercenary_company', name: 'Mercenary Company', year: 'Various', tagline: 'War for Profit',
    description: 'Sell your sword to the highest bidder. Loyalty is to coin, not causes.',
    atmosphere: 'Black Company, sellsword life', unlocked: true, color: '#78716C', icon: 'shield',
  },
  knight_order: {
    id: 'knight_order', name: 'Knight Order', year: 'Medieval', tagline: 'Vows of Honor',
    description: 'Serve a holy order of knights. Crusade against evil, protect the innocent.',
    atmosphere: 'Templars, paladin orders', unlocked: true, color: '#FBBF24', icon: 'shield',
  },
  wizard_academy: {
    id: 'wizard_academy', name: 'Wizard Academy', year: 'Various', tagline: 'Learn the Arcane',
    description: 'Attend a prestigious school of magic. Master spells, make rivals, uncover secrets.',
    atmosphere: 'Harry Potter, magic school', unlocked: true, color: '#7C3AED', icon: 'book-open',
  },
  monster_hunter: {
    id: 'monster_hunter', name: 'Monster Hunter', year: 'Various', tagline: 'Hunt or Be Hunted',
    description: 'Track and kill creatures of legend. Use their parts to craft better gear.',
    atmosphere: 'Monster Hunter, professional slayer', unlocked: true, color: '#B45309', icon: 'crosshair',
  },
  vampire_hunter: {
    id: 'vampire_hunter', name: 'Vampire Hunter', year: 'Various', tagline: 'Hunt the Night',
    description: 'Dedicated to destroying the undead. Stakes, holy water, and unshakeable faith.',
    atmosphere: 'Van Helsing, Castlevania', unlocked: true, color: '#7F1D1D', icon: 'target',
  },
  demon_slayer: {
    id: 'demon_slayer', name: 'Demon Slayer', year: 'Various', tagline: 'Slay the Darkness',
    description: 'Battle demons that threaten humanity. Special breathing techniques and cursed blades.',
    atmosphere: 'Demon Slayer anime, exorcism', unlocked: true, color: '#DC2626', icon: 'flame',
  },
  exorcist: {
    id: 'exorcist', name: 'Exorcist', year: 'Various', tagline: 'The Power of Faith',
    description: 'Cast out demons through religious rites. Faith is your weapon against possession.',
    atmosphere: 'The Exorcist, religious horror', unlocked: true, color: '#1F2937', icon: 'cross',
  },
  bounty_hunter: {
    id: 'bounty_hunter', name: 'Bounty Hunter', year: 'Various', tagline: 'Dead or Alive',
    description: 'Track down fugitives for pay. The law can\'t catch them, but you can.',
    atmosphere: 'Western bounty hunting, Mandalorian', unlocked: true, color: '#A16207', icon: 'crosshair',
  },
  smuggler: {
    id: 'smuggler', name: 'Smuggler', year: 'Various', tagline: 'Contraband Runs',
    description: 'Move illegal goods past authorities. Fast ships, faster wits, and dangerous clients.',
    atmosphere: 'Han Solo, smuggling routes', unlocked: true, color: '#44403C', icon: 'package',
  },
  revolutionary: {
    id: 'revolutionary', name: 'Revolutionary', year: 'Various', tagline: 'Viva La Revolution',
    description: 'Fight to overthrow an oppressive regime. Rally the people, plan the uprising.',
    atmosphere: 'French Revolution, rebel leader', unlocked: true, color: '#DC2626', icon: 'flag',
  },
  resistance_fighter: {
    id: 'resistance_fighter', name: 'Resistance Fighter', year: 'Various', tagline: 'Fight Back',
    description: 'Occupied by enemy forces. Sabotage, guerrilla tactics, and the hope of liberation.',
    atmosphere: 'WWII resistance, occupied nations', unlocked: true, color: '#1F2937', icon: 'fist',
  },
  freedom_fighter: {
    id: 'freedom_fighter', name: 'Freedom Fighter', year: 'Various', tagline: 'Liberty or Death',
    description: 'Battle against tyranny for the freedom of your people. One person can change history.',
    atmosphere: 'Independence movements, rebels', unlocked: true, color: '#059669', icon: 'flag',
  },

  // ========== ANIMAL/CREATURE FOCUSED ==========
  dragon_rider: {
    id: 'dragon_rider', name: 'Dragon Rider', year: 'Fantasy', tagline: 'Bond of Fire',
    description: 'Bond with a dragon and soar the skies. Your fates are intertwined forever.',
    atmosphere: 'Eragon, How to Train Your Dragon', unlocked: true, color: '#F97316', icon: 'flame',
  },
  beast_tamer: {
    id: 'beast_tamer', name: 'Beast Tamer', year: 'Fantasy', tagline: 'Wild Companions',
    description: 'Communicate with and command animals. Build a pack of loyal creature companions.',
    atmosphere: 'Pokemon, beast master fantasy', unlocked: true, color: '#22C55E', icon: 'paw-print',
  },
  shapeshifter: {
    id: 'shapeshifter', name: 'Shapeshifter', year: 'Various', tagline: 'Many Forms',
    description: 'Transform into animals or other beings. Identity is fluid when form is changeable.',
    atmosphere: 'Animorphs, skinwalker legends', unlocked: true, color: '#8B5CF6', icon: 'repeat',
  },
  werewolf_pack: {
    id: 'werewolf_pack', name: 'Werewolf Pack', year: 'Modern', tagline: 'Run with the Pack',
    description: 'Part of a werewolf pack. Pack politics, moon cycles, and the beast within.',
    atmosphere: 'Teen Wolf, pack dynamics', unlocked: true, color: '#78716C', icon: 'moon',
  },
  vampire_coven: {
    id: 'vampire_coven', name: 'Vampire Coven', year: 'Various', tagline: 'Blood Is Family',
    description: 'Member of a vampire coven. Ancient politics, blood bonds, and eternal existence.',
    atmosphere: 'Vampire Diaries, coven politics', unlocked: true, color: '#7F1D1D', icon: 'users',
  },
  fae_court: {
    id: 'fae_court', name: 'Fae Court', year: 'Timeless', tagline: 'Summer and Winter',
    description: 'Navigate the politics of the fairy courts. Beauty, cruelty, and ancient bargains.',
    atmosphere: 'Dresden Files fae, court intrigue', unlocked: true, color: '#EC4899', icon: 'sparkles',
  },
  demon_realm: {
    id: 'demon_realm', name: 'Demon Realm', year: 'Infernal', tagline: 'Hell\'s Hierarchy',
    description: 'Among the demonic ranks. Climb the infernal hierarchy through cunning and power.',
    atmosphere: 'Helluva Boss, demon society', unlocked: true, color: '#B91C1C', icon: 'flame',
  },
  angel_hierarchy: {
    id: 'angel_hierarchy', name: 'Angel Hierarchy', year: 'Divine', tagline: 'Heaven\'s Ranks',
    description: 'Serve in the celestial hierarchy. Carry out divine will, but even angels can fall.',
    atmosphere: 'Good Omens angels, divine duty', unlocked: true, color: '#FBBF24', icon: 'sun',
  },
  elemental_spirits: {
    id: 'elemental_spirits', name: 'Elemental Spirits', year: 'Timeless', tagline: 'Forces of Nature',
    description: 'You are an elemental spirit. Embody fire, water, earth, or air in physical form.',
    atmosphere: 'Elemental being, nature spirits', unlocked: true, color: '#0EA5E9', icon: 'wind',
  },
  kaiju_world: {
    id: 'kaiju_world', name: 'Kaiju World', year: 'Present', tagline: 'Titans Walk',
    description: 'Giant monsters roam the Earth. Humanity survives in their shadow or fights back.',
    atmosphere: 'Godzilla, Pacific Rim, giant monsters', unlocked: true, color: '#65A30D', icon: 'bug',
  },

  // ========== SPORTS/COMPETITION ==========
  gladiatorial_games: {
    id: 'gladiatorial_games', name: 'Gladiatorial Games', year: 'Ancient', tagline: 'Glory or Death',
    description: 'Compete in deadly arena games. Victory brings fame, defeat brings death.',
    atmosphere: 'Roman games, Spartacus', unlocked: true, color: '#B91C1C', icon: 'trophy',
  },
  tournament_knight: {
    id: 'tournament_knight', name: 'Tournament Knight', year: 'Medieval', tagline: 'Joust for Honor',
    description: 'Compete in jousts and melees. Win glory, titles, and the favor of nobility.',
    atmosphere: 'A Knight\'s Tale, tournament circuit', unlocked: true, color: '#CA8A04', icon: 'trophy',
  },
  racing_champion: {
    id: 'racing_champion', name: 'Racing Champion', year: 'Various', tagline: 'Speed Is Everything',
    description: 'Race for glory in any era. Chariots, cars, pods, or starships—victory or crash.',
    atmosphere: 'Fast and Furious, racing drama', unlocked: true, color: '#EF4444', icon: 'flag',
  },
  fighting_circuit: {
    id: 'fighting_circuit', name: 'Fighting Circuit', year: 'Modern', tagline: 'Underground Legend',
    description: 'Rise through underground fighting rings. Fists, honor, and the roar of the crowd.',
    atmosphere: 'Fight Club, martial arts circuits', unlocked: true, color: '#F97316', icon: 'user',
  },
  death_game: {
    id: 'death_game', name: 'Death Game', year: 'Various', tagline: 'Play or Die',
    description: 'Forced into deadly games with twisted rules. Survive the game master\'s challenges.',
    atmosphere: 'Squid Game, Saw, deadly games', unlocked: true, color: '#DC2626', icon: 'skull',
  },
  survival_game: {
    id: 'survival_game', name: 'Survival Game', year: 'Various', tagline: 'Last One Standing',
    description: 'Dropped into wilderness with nothing. Outlast the environment and other contestants.',
    atmosphere: 'Survivor, wilderness competition', unlocked: true, color: '#65A30D', icon: 'trees',
  },
  battle_royale: {
    id: 'battle_royale', name: 'Battle Royale', year: 'Various', tagline: 'One Victor',
    description: 'Everyone fights until one remains. Alliances are temporary, victory is everything.',
    atmosphere: 'Fortnite, PUBG, battle royale', unlocked: true, color: '#8B5CF6', icon: 'users',
  },
  arena_champion: {
    id: 'arena_champion', name: 'Arena Champion', year: 'Fantasy', tagline: 'King of the Ring',
    description: 'Fight magical beasts and warriors in a fantasy arena. Become the ultimate champion.',
    atmosphere: 'Fantasy arena combat, champions', unlocked: true, color: '#F59E0B', icon: 'trophy',
  },

  // ========== ROMANCE SUB-GENRES ==========
  regency_romance: {
    id: 'regency_romance', name: 'Regency Romance', year: '1815', tagline: 'A Scandal to Remember',
    description: 'Navigate the marriage market of Regency England. Balls, scandals, and finding true love.',
    atmosphere: 'Pride and Prejudice, Bridgerton', unlocked: true, color: '#EC4899', icon: 'heart',
  },
  gothic_romance: {
    id: 'gothic_romance', name: 'Gothic Romance', year: 'Victorian', tagline: 'Dark Passion',
    description: 'Brooding heroes, mysterious mansions, and love tinged with danger and darkness.',
    atmosphere: 'Jane Eyre, Rebecca, dark romance', unlocked: true, color: '#4C1D95', icon: 'heart',
  },
  paranormal_romance: {
    id: 'paranormal_romance', name: 'Paranormal Romance', year: 'Modern', tagline: 'Love Beyond Death',
    description: 'Fall for vampires, werewolves, or ghosts. Love transcends the boundaries of the natural.',
    atmosphere: 'Twilight, supernatural love', unlocked: true, color: '#BE185D', icon: 'heart',
  },
  space_romance: {
    id: 'space_romance', name: 'Space Romance', year: 'Future', tagline: 'Across the Stars',
    description: 'Find love among the stars. Different species, different worlds, one heart.',
    atmosphere: 'Sci-fi romance, alien love', unlocked: true, color: '#EC4899', icon: 'heart',
  },
  enemies_lovers: {
    id: 'enemies_lovers', name: 'Enemies to Lovers', year: 'Various', tagline: 'Hate Turns to Love',
    description: 'Start as rivals or enemies. Through conflict, discover unexpected connection.',
    atmosphere: 'Rivals romance, slow burn', unlocked: true, color: '#EF4444', icon: 'heart',
  },
  forbidden_love: {
    id: 'forbidden_love', name: 'Forbidden Love', year: 'Various', tagline: 'Against All Rules',
    description: 'Love that society forbids. Class, species, or circumstance keeps you apart.',
    atmosphere: 'Romeo and Juliet, star-crossed', unlocked: true, color: '#9F1239', icon: 'heart',
  },
  royal_romance: {
    id: 'royal_romance', name: 'Royal Romance', year: 'Various', tagline: 'Crown and Heart',
    description: 'Romance with royalty. Navigate court intrigue while falling for a prince or princess.',
    atmosphere: 'Royal romances, crown and love', unlocked: true, color: '#CA8A04', icon: 'crown',
  },
  time_crossed_lovers: {
    id: 'time_crossed_lovers', name: 'Time-Crossed Lovers', year: 'Various', tagline: 'Love Through Time',
    description: 'Separated by centuries. Find a way to be together across the barriers of time.',
    atmosphere: 'Outlander, time travel romance', unlocked: true, color: '#8B5CF6', icon: 'clock',
  },
};


// ============================================
// SKILLS SYSTEM
// ============================================
export type SkillCategory = 'combat' | 'social' | 'survival' | 'knowledge' | 'mystical';

export interface Skill {
  id: string;
  name: string;
  description: string;
  category: SkillCategory;
  maxLevel: number;
  currentLevel: number;
  xpRequired: number;
  xpCurrent: number;
  icon: string;
  unlocked: boolean;
  prerequisiteId?: string;
}

export const INITIAL_SKILLS: Skill[] = [
  // Combat
  { id: 'melee', name: 'Melee Combat', description: 'Fighting with weapons and fists', category: 'combat', maxLevel: 10, currentLevel: 1, xpRequired: 100, xpCurrent: 0, icon: 'sword', unlocked: true },
  { id: 'ranged', name: 'Ranged Combat', description: 'Accuracy with thrown and ranged weapons', category: 'combat', maxLevel: 10, currentLevel: 1, xpRequired: 100, xpCurrent: 0, icon: 'target', unlocked: true },
  { id: 'defense', name: 'Defense', description: 'Blocking, dodging, and damage reduction', category: 'combat', maxLevel: 10, currentLevel: 1, xpRequired: 100, xpCurrent: 0, icon: 'shield', unlocked: true },
  // Social
  { id: 'persuasion', name: 'Persuasion', description: 'Convincing others through charm and logic', category: 'social', maxLevel: 10, currentLevel: 1, xpRequired: 100, xpCurrent: 0, icon: 'message-circle', unlocked: true },
  { id: 'intimidation', name: 'Intimidation', description: 'Coercing others through fear and presence', category: 'social', maxLevel: 10, currentLevel: 1, xpRequired: 100, xpCurrent: 0, icon: 'alert-triangle', unlocked: true },
  { id: 'deception', name: 'Deception', description: 'Lying, disguises, and misdirection', category: 'social', maxLevel: 10, currentLevel: 1, xpRequired: 100, xpCurrent: 0, icon: 'eye-off', unlocked: true },
  // Survival
  { id: 'stealth', name: 'Stealth', description: 'Moving unseen and unheard', category: 'survival', maxLevel: 10, currentLevel: 1, xpRequired: 100, xpCurrent: 0, icon: 'ghost', unlocked: true },
  { id: 'athletics', name: 'Athletics', description: 'Running, climbing, swimming, and jumping', category: 'survival', maxLevel: 10, currentLevel: 1, xpRequired: 100, xpCurrent: 0, icon: 'activity', unlocked: true },
  { id: 'perception', name: 'Perception', description: 'Noticing hidden details and danger', category: 'survival', maxLevel: 10, currentLevel: 1, xpRequired: 100, xpCurrent: 0, icon: 'eye', unlocked: true },
  // Knowledge
  { id: 'investigation', name: 'Investigation', description: 'Finding clues and solving mysteries', category: 'knowledge', maxLevel: 10, currentLevel: 1, xpRequired: 100, xpCurrent: 0, icon: 'search', unlocked: true },
  { id: 'lore', name: 'Lore', description: 'Knowledge of history, legends, and the supernatural', category: 'knowledge', maxLevel: 10, currentLevel: 1, xpRequired: 100, xpCurrent: 0, icon: 'book-open', unlocked: true },
  { id: 'technology', name: 'Technology', description: 'Understanding and using machines and gadgets', category: 'knowledge', maxLevel: 10, currentLevel: 1, xpRequired: 100, xpCurrent: 0, icon: 'settings', unlocked: true },
  // Mystical
  { id: 'sixth_sense', name: 'Sixth Sense', description: 'Sensing supernatural presences', category: 'mystical', maxLevel: 5, currentLevel: 0, xpRequired: 200, xpCurrent: 0, icon: 'sparkles', unlocked: false, prerequisiteId: 'perception' },
  { id: 'willpower', name: 'Willpower', description: 'Resisting mental attacks and fear', category: 'mystical', maxLevel: 5, currentLevel: 0, xpRequired: 200, xpCurrent: 0, icon: 'brain', unlocked: false, prerequisiteId: 'lore' },
];

// ============================================
// JOURNAL / CODEX SYSTEM
// ============================================
export type JournalEntryType = 'story' | 'discovery' | 'character' | 'location' | 'item' | 'lore';

export interface JournalEntry {
  id: string;
  type: JournalEntryType;
  title: string;
  content: string;
  date: number;
  icon: string;
  era: Era;
}

// ============================================
// LOCATIONS / MAP SYSTEM
// ============================================
export interface Location {
  id: string;
  name: string;
  description: string;
  era: Era;
  discovered: boolean;
  visited: boolean;
  icon: string;
  dangerLevel: number; // 1-5
  coordinates: { x: number; y: number };
  connectedTo: string[];
}

export const INITIAL_LOCATIONS: Location[] = [
  // Stranger Things Era
  { id: 'hawkins_downtown', name: 'Downtown Hawkins', description: 'The quiet main street of Hawkins. Ice cream shops, arcades, and normalcy - or so it seems.', era: 'stranger_things', discovered: true, visited: true, icon: 'building', dangerLevel: 1, coordinates: { x: 50, y: 50 }, connectedTo: ['hawkins_school', 'byers_house', 'hawkins_lab'] },
  { id: 'hawkins_school', name: 'Hawkins Middle School', description: 'The AV club meets here. Strange electromagnetic readings have been detected.', era: 'stranger_things', discovered: true, visited: false, icon: 'graduation-cap', dangerLevel: 1, coordinates: { x: 30, y: 30 }, connectedTo: ['hawkins_downtown'] },
  { id: 'byers_house', name: 'Byers House', description: 'The abandoned Byers residence. Christmas lights still hang from the walls.', era: 'stranger_things', discovered: true, visited: false, icon: 'home', dangerLevel: 3, coordinates: { x: 70, y: 40 }, connectedTo: ['hawkins_downtown', 'mirkwood'] },
  { id: 'mirkwood', name: 'Mirkwood Forest', description: 'Dense woods where strange things happen after dark. The trees seem to watch.', era: 'stranger_things', discovered: false, visited: false, icon: 'trees', dangerLevel: 4, coordinates: { x: 80, y: 60 }, connectedTo: ['byers_house', 'hawkins_lab'] },
  { id: 'hawkins_lab', name: 'Hawkins National Laboratory', description: 'DOE facility. Restricted area. What experiments are they conducting inside?', era: 'stranger_things', discovered: false, visited: false, icon: 'flask-conical', dangerLevel: 5, coordinates: { x: 90, y: 80 }, connectedTo: ['mirkwood', 'upside_down'] },
  { id: 'upside_down', name: 'The Upside Down', description: 'A dark reflection of our world. Cold, decaying, and inhabited by nightmares.', era: 'stranger_things', discovered: false, visited: false, icon: 'flip-vertical', dangerLevel: 5, coordinates: { x: 50, y: 90 }, connectedTo: ['hawkins_lab'] },
];

// ============================================
// DAILY CHALLENGES
// ============================================
export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  type: 'dice' | 'explore' | 'social' | 'combat' | 'story';
  target: number;
  progress: number;
  reward: { xp: number; gold?: number; item?: string };
  completed: boolean;
  expiresAt: number;
}

// ============================================
// STATS TRACKING
// ============================================
export interface PlayerStats {
  totalPlayTime: number;
  sessionsPlayed: number;
  diceRolled: number;
  criticalSuccesses: number;
  criticalFailures: number;
  questsCompleted: number;
  questsFailed: number;
  npcsmet: number;
  itemsCollected: number;
  locationsDiscovered: number;
  choicesMade: number;
  wordsRead: number;
}

// ============================================
// BASE TYPES
// ============================================
export interface Attributes {
  vision: number;
  resilience: number;
  influence: number;
  wisdom: number;
  audacity: number;
  integrity: number;
}

export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'legendary';
export type ItemType = 'weapon' | 'armor' | 'consumable' | 'key' | 'artifact';

export interface Item {
  id: string;
  name: string;
  description: string;
  type: ItemType;
  rarity: ItemRarity;
  icon: string;
  effect?: string;
  quantity: number;
}

export type QuestStatus = 'active' | 'completed' | 'failed';
export type QuestType = 'main' | 'side' | 'personal' | 'daily';

export interface QuestObjective {
  id: string;
  description: string;
  completed: boolean;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  type: QuestType;
  status: QuestStatus;
  objectives: QuestObjective[];
  rewards?: string[];
  startedAt: number;
  completedAt?: number;
  era?: Era;
}

export interface NPC {
  id: string;
  name: string;
  role: string;
  description: string;
  relationship: number;
  met: boolean;
  icon: string;
  era?: Era;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: number;
  secret?: boolean;
  category?: string;
}

export interface DiceRoll {
  id: string;
  type: 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20';
  result: number;
  modifier: number;
  total: number;
  attribute?: keyof Attributes;
  success?: boolean;
  timestamp: number;
}

export interface Character {
  id: string;
  name: string;
  archetype: Archetype;
  backstory: string;
  attributes: Attributes;
  createdAt: number;
  level: number;
  experience: number;
  health: number;
  maxHealth: number;
  energy: number;
  maxEnergy: number;
  gold: number;
  currentEra: Era;
}

export interface StoryMessage {
  id: string;
  type: 'narration' | 'choice' | 'player' | 'consequence' | 'system' | 'dice';
  content: string;
  choices?: string[];
  diceRoll?: DiceRoll;
  timestamp: number;
}

export interface GameSession {
  id: string;
  characterId: string;
  messages: StoryMessage[];
  currentScene: string;
  isActive: boolean;
  startedAt: number;
  era: Era;
}

// ============================================
// INITIAL DATA
// ============================================
const INITIAL_NPCS: NPC[] = [
  { id: 'sheriff_hopper', name: 'Sheriff Hopper', role: 'Law Enforcement', description: 'The gruff but good-hearted chief of police. He knows more about the strange happenings than he lets on.', relationship: 0, met: false, icon: 'badge', era: 'stranger_things' },
  { id: 'dustin', name: 'Dustin Henderson', role: 'Fellow Adventurer', description: 'A curious kid with a heart of gold and a love for science. Always ready to help a friend.', relationship: 20, met: false, icon: 'smile', era: 'stranger_things' },
  { id: 'dr_owens', name: 'Dr. Sam Owens', role: 'Government Scientist', description: 'A government scientist with ambiguous motives. Is he trying to help or contain?', relationship: -10, met: false, icon: 'flask-conical', era: 'stranger_things' },
  { id: 'joyce', name: 'Joyce Byers', role: 'Concerned Mother', description: 'A mother who has seen things. She believes in the supernatural and will fight for those she loves.', relationship: 10, met: false, icon: 'heart', era: 'stranger_things' },
  { id: 'eleven', name: 'Eleven', role: 'The Girl with Powers', description: 'A mysterious girl with psychic abilities. Her past is shrouded in darkness.', relationship: 0, met: false, icon: 'zap', era: 'stranger_things' },
  { id: 'steve', name: 'Steve Harrington', role: 'Reluctant Hero', description: 'Former popular kid turned monster hunter. His bat is legendary.', relationship: 5, met: false, icon: 'award', era: 'stranger_things' },
];

const INITIAL_ACHIEVEMENTS: Achievement[] = [
  // ========== PROGRESS ==========
  { id: 'first_steps', title: 'First Steps', description: 'Begin your adventure', icon: 'footprints', secret: false, category: 'progress' },
  { id: 'chapter_one', title: 'Chapter One', description: 'Complete the first story chapter', icon: 'book', secret: false, category: 'progress' },
  { id: 'legend', title: 'Living Legend', description: 'Reach level 10', icon: 'crown', secret: false, category: 'progress' },
  { id: 'master', title: 'Grand Master', description: 'Reach level 25', icon: 'star', secret: false, category: 'progress' },
  { id: 'level_5', title: 'Rising Hero', description: 'Reach level 5', icon: 'trending-up', secret: false, category: 'progress' },
  { id: 'level_50', title: 'Legendary', description: 'Reach level 50', icon: 'sparkles', secret: false, category: 'progress' },
  { id: 'level_100', title: 'Immortal', description: 'Reach level 100', icon: 'infinity', secret: false, category: 'progress' },
  { id: 'gold_100', title: 'Penny Pincher', description: 'Accumulate 100 gold', icon: 'coins', secret: false, category: 'progress' },
  { id: 'gold_1000', title: 'Wealthy', description: 'Accumulate 1000 gold', icon: 'piggy-bank', secret: false, category: 'progress' },
  { id: 'gold_10000', title: 'Tycoon', description: 'Accumulate 10000 gold', icon: 'banknote', secret: false, category: 'progress' },

  // ========== DICE ==========
  { id: 'dice_master', title: 'Dice Master', description: 'Roll a natural 20', icon: 'dices', secret: false, category: 'dice' },
  { id: 'snake_eyes', title: 'Snake Eyes', description: 'Roll a natural 1', icon: 'skull', secret: false, category: 'dice' },
  { id: 'lucky_streak', title: 'Lucky Streak', description: 'Roll 5 successes in a row', icon: 'flame', secret: false, category: 'dice' },
  { id: 'roll_100', title: 'Dice Addict', description: 'Roll 100 dice', icon: 'rotate-cw', secret: false, category: 'dice' },
  { id: 'roll_500', title: 'Dice Fanatic', description: 'Roll 500 dice', icon: 'repeat', secret: false, category: 'dice' },
  { id: 'roll_1000', title: 'Dice Maniac', description: 'Roll 1000 dice', icon: 'refresh-cw', secret: false, category: 'dice' },
  { id: 'triple_20', title: 'Triple Threat', description: 'Roll three natural 20s in a session', icon: 'target', secret: false, category: 'dice' },
  { id: 'comeback_king', title: 'Comeback King', description: 'Succeed after rolling 3 failures in a row', icon: 'undo', secret: false, category: 'dice' },
  { id: 'perfect_session', title: 'Perfect Session', description: 'Complete a session with no failed rolls', icon: 'check-circle', secret: false, category: 'dice' },
  { id: 'risk_taker', title: 'Risk Taker', description: 'Succeed on 10 rolls with DC 15+', icon: 'alert-triangle', secret: false, category: 'dice' },

  // ========== SOCIAL ==========
  { id: 'social_butterfly', title: 'Social Butterfly', description: 'Meet all NPCs', icon: 'users', secret: false, category: 'social' },
  { id: 'best_friend', title: 'Best Friend', description: 'Reach max relationship with an NPC', icon: 'heart', secret: false, category: 'social' },
  { id: 'enemy_made', title: 'Enemy Made', description: 'Reach minimum relationship with an NPC', icon: 'heart-crack', secret: false, category: 'social' },
  { id: 'first_contact', title: 'First Contact', description: 'Meet your first NPC', icon: 'user-plus', secret: false, category: 'social' },
  { id: 'charmer', title: 'Charmer', description: 'Reach 50+ relationship with 3 NPCs', icon: 'smile', secret: false, category: 'social' },
  { id: 'diplomat', title: 'Diplomat', description: 'Improve a negative relationship to positive', icon: 'handshake', secret: false, category: 'social' },
  { id: 'villain', title: 'Villain', description: 'Have 3 NPCs hate you', icon: 'angry', secret: false, category: 'social' },
  { id: 'neutral_party', title: 'Neutral Party', description: 'Keep all relationships at exactly 0', icon: 'minus', secret: true, category: 'social' },
  { id: 'popular', title: 'Popular', description: 'Meet 10 different NPCs', icon: 'users-round', secret: false, category: 'social' },
  { id: 'loved_by_all', title: 'Loved By All', description: 'Reach 75+ relationship with 5 NPCs', icon: 'heart-handshake', secret: false, category: 'social' },

  // ========== COLLECTION ==========
  { id: 'collector', title: 'Collector', description: 'Collect 10 items', icon: 'package', secret: false, category: 'collection' },
  { id: 'hoarder', title: 'Hoarder', description: 'Collect 50 items', icon: 'archive', secret: false, category: 'collection' },
  { id: 'legendary_find', title: 'Legendary Find', description: 'Find a legendary item', icon: 'gem', secret: false, category: 'collection' },
  { id: 'first_item', title: 'Finder', description: 'Find your first item', icon: 'search', secret: false, category: 'collection' },
  { id: 'rare_collector', title: 'Rare Collector', description: 'Collect 5 rare items', icon: 'diamond', secret: false, category: 'collection' },
  { id: 'weapon_master', title: 'Weapon Master', description: 'Collect 10 weapons', icon: 'sword', secret: false, category: 'collection' },
  { id: 'armored_up', title: 'Armored Up', description: 'Collect 10 armor pieces', icon: 'shield', secret: false, category: 'collection' },
  { id: 'key_keeper', title: 'Key Keeper', description: 'Collect 5 key items', icon: 'key', secret: false, category: 'collection' },
  { id: 'artifact_hunter', title: 'Artifact Hunter', description: 'Collect 10 artifacts', icon: 'scroll', secret: false, category: 'collection' },
  { id: 'museum_curator', title: 'Museum Curator', description: 'Collect 100 total items', icon: 'building', secret: false, category: 'collection' },

  // ========== EXPLORATION ==========
  { id: 'explorer', title: 'Explorer', description: 'Discover 5 locations', icon: 'map', secret: false, category: 'exploration' },
  { id: 'cartographer', title: 'Cartographer', description: 'Discover all locations in an era', icon: 'compass', secret: false, category: 'exploration' },
  { id: 'era_traveler', title: 'Era Traveler', description: 'Unlock a new era', icon: 'clock', secret: false, category: 'exploration' },
  { id: 'first_discovery', title: 'First Discovery', description: 'Discover a new location', icon: 'map-pin', secret: false, category: 'exploration' },
  { id: 'danger_seeker', title: 'Danger Seeker', description: 'Visit a level 5 danger zone', icon: 'alert-circle', secret: false, category: 'exploration' },
  { id: 'world_walker', title: 'World Walker', description: 'Discover 20 locations', icon: 'globe', secret: false, category: 'exploration' },
  { id: 'era_master', title: 'Era Master', description: 'Complete 3 different eras', icon: 'history', secret: false, category: 'exploration' },
  { id: 'dimensional_traveler', title: 'Dimensional Traveler', description: 'Play in 5 different eras', icon: 'layers', secret: false, category: 'exploration' },
  { id: 'speed_runner', title: 'Speed Runner', description: 'Complete an era in under 1 hour', icon: 'timer', secret: true, category: 'exploration' },
  { id: 'thorough', title: 'Thorough', description: 'Visit every location in an era', icon: 'check-square', secret: false, category: 'exploration' },

  // ========== QUESTS ==========
  { id: 'quest_complete', title: 'Quest Complete', description: 'Complete your first quest', icon: 'trophy', secret: false, category: 'quests' },
  { id: 'quest_master', title: 'Quest Master', description: 'Complete 10 quests', icon: 'medal', secret: false, category: 'quests' },
  { id: 'daily_warrior', title: 'Daily Warrior', description: 'Complete 7 daily challenges', icon: 'calendar', secret: false, category: 'quests' },
  { id: 'side_quester', title: 'Side Quester', description: 'Complete 5 side quests', icon: 'route', secret: false, category: 'quests' },
  { id: 'main_story', title: 'Main Story', description: 'Complete a main story quest', icon: 'book-open', secret: false, category: 'quests' },
  { id: 'perfectionist', title: 'Perfectionist', description: 'Complete all objectives in a quest', icon: 'list-checks', secret: false, category: 'quests' },
  { id: 'quest_chain', title: 'Quest Chain', description: 'Complete 3 quests in one session', icon: 'link', secret: false, category: 'quests' },
  { id: 'daily_streak_7', title: 'Weekly Warrior', description: 'Complete dailies 7 days in a row', icon: 'calendar-check', secret: false, category: 'quests' },
  { id: 'daily_streak_30', title: 'Monthly Champion', description: 'Complete dailies 30 days in a row', icon: 'calendar-heart', secret: false, category: 'quests' },
  { id: 'quest_fail', title: 'Learning Experience', description: 'Fail your first quest (it happens!)', icon: 'x-circle', secret: false, category: 'quests' },

  // ========== COMBAT ==========
  { id: 'first_blood', title: 'First Blood', description: 'Win your first combat encounter', icon: 'swords', secret: false, category: 'combat' },
  { id: 'warrior', title: 'Warrior', description: 'Win 10 combat encounters', icon: 'shield-check', secret: false, category: 'combat' },
  { id: 'champion', title: 'Champion', description: 'Win 50 combat encounters', icon: 'crown', secret: false, category: 'combat' },
  { id: 'boss_slayer', title: 'Boss Slayer', description: 'Defeat a boss enemy', icon: 'skull', secret: false, category: 'combat' },
  { id: 'unscathed', title: 'Unscathed', description: 'Win a combat without taking damage', icon: 'shield', secret: false, category: 'combat' },
  { id: 'comeback_victory', title: 'Comeback Victory', description: 'Win with less than 10% health', icon: 'heart-pulse', secret: false, category: 'combat' },
  { id: 'pacifist', title: 'Pacifist', description: 'Complete a quest without combat', icon: 'peace', secret: true, category: 'combat' },
  { id: 'critical_striker', title: 'Critical Striker', description: 'Land 10 critical hits', icon: 'zap', secret: false, category: 'combat' },
  { id: 'tank', title: 'Tank', description: 'Block 100 damage total', icon: 'shield-plus', secret: false, category: 'combat' },
  { id: 'glass_cannon', title: 'Glass Cannon', description: 'Win combat with only 1 HP remaining', icon: 'flame', secret: true, category: 'combat' },

  // ========== STORY ==========
  { id: 'wordsmith', title: 'Wordsmith', description: 'Read 10,000 words of story', icon: 'book', secret: false, category: 'story' },
  { id: 'bookworm', title: 'Bookworm', description: 'Read 50,000 words of story', icon: 'book-open', secret: false, category: 'story' },
  { id: 'scholar', title: 'Scholar', description: 'Read 100,000 words of story', icon: 'graduation-cap', secret: false, category: 'story' },
  { id: 'choice_maker', title: 'Choice Maker', description: 'Make 50 choices', icon: 'git-branch', secret: false, category: 'story' },
  { id: 'decisive', title: 'Decisive', description: 'Make 200 choices', icon: 'git-merge', secret: false, category: 'story' },
  { id: 'creative_writer', title: 'Creative Writer', description: 'Write 100 custom actions', icon: 'pen-tool', secret: false, category: 'story' },
  { id: 'novelist', title: 'Novelist', description: 'Write 500 custom actions', icon: 'feather', secret: false, category: 'story' },
  { id: 'long_session', title: 'Marathon', description: 'Play for 2 hours in one session', icon: 'clock', secret: false, category: 'story' },
  { id: 'night_owl', title: 'Night Owl', description: 'Play between midnight and 4 AM', icon: 'moon', secret: true, category: 'story' },
  { id: 'early_bird', title: 'Early Bird', description: 'Play between 5 AM and 7 AM', icon: 'sunrise', secret: true, category: 'story' },

  // ========== SECRET ==========
  { id: 'the_truth', title: 'The Truth is Out There', description: 'Discover the secret of Hawkins Lab', icon: 'eye', secret: true, category: 'secret' },
  { id: 'survivor', title: 'Survivor', description: 'Survive a near-death experience', icon: 'shield', secret: true, category: 'secret' },
  { id: 'upside_down_visitor', title: 'Between Worlds', description: 'Enter the Upside Down', icon: 'flip-vertical', secret: true, category: 'secret' },
  { id: 'easter_egg', title: 'Easter Egg Hunter', description: 'Find a hidden easter egg', icon: 'egg', secret: true, category: 'secret' },
  { id: 'secret_ending', title: 'Secret Ending', description: 'Discover a secret ending', icon: 'lock', secret: true, category: 'secret' },
  { id: 'completionist', title: 'Completionist', description: 'Unlock all non-secret achievements', icon: 'award', secret: true, category: 'secret' },
  { id: 'true_master', title: 'True Master', description: 'Unlock every achievement', icon: 'trophy', secret: true, category: 'secret' },
  { id: 'bug_finder', title: 'Bug Finder', description: 'Report a bug to the developers', icon: 'bug', secret: true, category: 'secret' },
  { id: 'loyal_player', title: 'Loyal Player', description: 'Play for 30 consecutive days', icon: 'heart', secret: true, category: 'secret' },
  { id: 'centurion', title: 'Centurion', description: 'Play 100 game sessions', icon: 'hash', secret: true, category: 'secret' },

  // ========== GENRE-SPECIFIC ==========
  { id: 'fantasy_hero', title: 'Fantasy Hero', description: 'Complete your first fantasy adventure', icon: 'wand', secret: false, category: 'genre' },
  { id: 'space_explorer', title: 'Space Explorer', description: 'Complete your first sci-fi adventure', icon: 'rocket', secret: false, category: 'genre' },
  { id: 'horror_survivor', title: 'Horror Survivor', description: 'Survive your first horror adventure', icon: 'ghost', secret: false, category: 'genre' },
  { id: 'detective', title: 'Detective', description: 'Solve your first mystery', icon: 'search', secret: false, category: 'genre' },
  { id: 'adventurer', title: 'Adventurer', description: 'Complete your first adventure quest', icon: 'compass', secret: false, category: 'genre' },
  { id: 'apocalypse_survivor', title: 'Apocalypse Survivor', description: 'Survive post-apocalyptic world', icon: 'radiation', secret: false, category: 'genre' },
  { id: 'hero_of_justice', title: 'Hero of Justice', description: 'Save the day as a superhero', icon: 'zap', secret: false, category: 'genre' },
  { id: 'myth_seeker', title: 'Myth Seeker', description: 'Encounter a mythological being', icon: 'flame', secret: false, category: 'genre' },
  { id: 'genre_hopper', title: 'Genre Hopper', description: 'Play in 4 different genres', icon: 'shuffle', secret: false, category: 'genre' },
  { id: 'genre_master', title: 'Genre Master', description: 'Complete a quest in every genre', icon: 'award', secret: false, category: 'genre' },
];

const INITIAL_QUEST: Quest = {
  id: 'main_mystery',
  title: 'The Hawkins Mystery',
  description: 'Strange things are happening in Hawkins. Investigate the abandoned Byers house and uncover the truth.',
  type: 'main',
  status: 'active',
  objectives: [
    { id: 'obj1', description: 'Investigate the Byers house', completed: false },
    { id: 'obj2', description: 'Find clues about the disappearances', completed: false },
    { id: 'obj3', description: 'Discover the connection to Hawkins Lab', completed: false },
    { id: 'obj4', description: 'Find an ally who knows the truth', completed: false },
    { id: 'obj5', description: 'Confront the darkness', completed: false },
  ],
  rewards: ['Experience +200', 'Unlock Medieval Era'],
  startedAt: Date.now(),
  era: 'stranger_things',
};

const DICE_VALUES: Record<DiceRoll['type'], number> = {
  d4: 4, d6: 6, d8: 8, d10: 10, d12: 12, d20: 20,
};

// ============================================
// STORE STATE
// ============================================
interface GameState {
  character: Character | null;
  hasSeenIntro: boolean;
  hasCompletedOnboarding: boolean;
  language: Language;
  worldConfig: WorldConfig;
  inventory: Item[];
  quests: Quest[];
  npcs: NPC[];
  achievements: Achievement[];
  diceHistory: DiceRoll[];
  currentSession: GameSession | null;
  sessionHistory: GameSession[];
  soundEnabled: boolean;
  hapticEnabled: boolean;
  textSpeed: 'slow' | 'normal' | 'fast';

  // New systems
  skills: Skill[];
  journal: JournalEntry[];
  locations: Location[];
  dailyChallenges: DailyChallenge[];
  unlockedEras: Era[];
  playerStats: PlayerStats;

  // Onboarding & World Config
  setHasCompletedOnboarding: (value: boolean) => void;
  setWorldConfig: (config: Partial<WorldConfig>) => void;

  // Character actions
  setCharacter: (character: Character) => void;
  clearCharacter: () => void;
  setHasSeenIntro: (value: boolean) => void;
  updateCharacterStats: (stats: Partial<Pick<Character, 'health' | 'energy' | 'experience' | 'level' | 'gold'>>) => void;
  setCurrentEra: (era: Era) => void;

  // Inventory
  addItem: (item: Item) => void;
  removeItem: (itemId: string, quantity?: number) => void;
  useItem: (itemId: string) => void;

  // Quests
  addQuest: (quest: Quest) => void;
  updateQuestObjective: (questId: string, objectiveId: string, completed: boolean) => void;
  completeQuest: (questId: string) => void;
  failQuest: (questId: string) => void;

  // NPCs
  addNPC: (npc: NPC) => void;
  updateRelationship: (npcId: string, delta: number) => void;
  meetNPC: (npcId: string) => void;

  // Achievements
  unlockAchievement: (achievementId: string) => void;

  // Dice
  rollDice: (type: DiceRoll['type'], attribute?: keyof Attributes, difficultyClass?: number) => DiceRoll;

  // Session
  startNewSession: (era?: Era) => void;
  addMessage: (message: Omit<StoryMessage, 'id' | 'timestamp'>) => void;
  endSession: () => void;

  // Settings
  setSoundEnabled: (enabled: boolean) => void;
  setHapticEnabled: (enabled: boolean) => void;
  setTextSpeed: (speed: 'slow' | 'normal' | 'fast') => void;
  setLanguage: (language: Language) => void;

  // Skills
  addSkillXP: (skillId: string, xp: number) => void;
  unlockSkill: (skillId: string) => void;

  // Journal
  addJournalEntry: (entry: Omit<JournalEntry, 'id' | 'date'>) => void;

  // Locations
  discoverLocation: (locationId: string) => void;
  visitLocation: (locationId: string) => void;

  // Daily Challenges
  generateDailyChallenges: () => void;
  updateChallengeProgress: (challengeId: string, progress: number) => void;

  // Eras
  unlockEra: (era: Era) => void;

  // Stats
  incrementStat: (stat: keyof PlayerStats, amount?: number) => void;

  // Reset
  resetGame: () => void;
}

const INITIAL_STATS: PlayerStats = {
  totalPlayTime: 0,
  sessionsPlayed: 0,
  diceRolled: 0,
  criticalSuccesses: 0,
  criticalFailures: 0,
  questsCompleted: 0,
  questsFailed: 0,
  npcsmet: 0,
  itemsCollected: 0,
  locationsDiscovered: 0,
  choicesMade: 0,
  wordsRead: 0,
};

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      character: null,
      hasSeenIntro: false,
      hasCompletedOnboarding: false,
      language: 'en' as Language,
      worldConfig: DEFAULT_WORLD_CONFIG,
      inventory: [],
      quests: [],
      npcs: INITIAL_NPCS,
      achievements: INITIAL_ACHIEVEMENTS,
      diceHistory: [],
      currentSession: null,
      sessionHistory: [],
      soundEnabled: true,
      hapticEnabled: true,
      textSpeed: 'normal',
      skills: INITIAL_SKILLS,
      journal: [],
      locations: INITIAL_LOCATIONS,
      dailyChallenges: [],
      unlockedEras: ['stranger_things'],
      playerStats: INITIAL_STATS,

      // Onboarding & World Config
      setHasCompletedOnboarding: (value) => set({ hasCompletedOnboarding: value }),
      setWorldConfig: (config) => set({ worldConfig: { ...get().worldConfig, ...config } }),

      setCharacter: (character) => set({ character }),
      clearCharacter: () => set({ character: null, currentSession: null }),
      setHasSeenIntro: (value) => set({ hasSeenIntro: value }),

      updateCharacterStats: (stats) => {
        const { character } = get();
        if (!character) return;
        set({ character: { ...character, ...stats } });
        if (stats.level && stats.level >= 10) get().unlockAchievement('legend');
        if (stats.level && stats.level >= 25) get().unlockAchievement('master');
      },

      setCurrentEra: (era) => {
        const { character } = get();
        if (!character) return;
        set({ character: { ...character, currentEra: era } });
      },

      // Inventory
      addItem: (item) => {
        const { inventory } = get();
        const existingItem = inventory.find((i) => i.id === item.id);
        if (existingItem) {
          set({ inventory: inventory.map((i) => i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i) });
        } else {
          set({ inventory: [...inventory, item] });
        }
        get().incrementStat('itemsCollected', item.quantity);
        const totalItems = get().inventory.reduce((sum, i) => sum + i.quantity, 0);
        if (totalItems >= 10) get().unlockAchievement('collector');
        if (totalItems >= 50) get().unlockAchievement('hoarder');
        if (item.rarity === 'legendary') get().unlockAchievement('legendary_find');
      },

      removeItem: (itemId, quantity = 1) => {
        const { inventory } = get();
        const item = inventory.find((i) => i.id === itemId);
        if (!item) return;
        if (item.quantity <= quantity) {
          set({ inventory: inventory.filter((i) => i.id !== itemId) });
        } else {
          set({ inventory: inventory.map((i) => i.id === itemId ? { ...i, quantity: i.quantity - quantity } : i) });
        }
      },

      useItem: (itemId) => {
        const { inventory, character } = get();
        const item = inventory.find((i) => i.id === itemId);
        if (!item || !character) return;
        if (item.type === 'consumable') {
          if (item.effect === 'heal') {
            get().updateCharacterStats({ health: Math.min(character.health + 20, character.maxHealth) });
          } else if (item.effect === 'energy') {
            get().updateCharacterStats({ energy: Math.min(character.energy + 20, character.maxEnergy) });
          }
          get().removeItem(itemId, 1);
        }
      },

      // Quests
      addQuest: (quest) => set({ quests: [...get().quests, quest] }),

      updateQuestObjective: (questId, objectiveId, completed) => {
        set({
          quests: get().quests.map((q) =>
            q.id === questId
              ? { ...q, objectives: q.objectives.map((o) => o.id === objectiveId ? { ...o, completed } : o) }
              : q
          ),
        });
        get().incrementStat('choicesMade');
      },

      completeQuest: (questId) => {
        const { character } = get();
        set({
          quests: get().quests.map((q) =>
            q.id === questId ? { ...q, status: 'completed', completedAt: Date.now() } : q
          ),
        });
        if (character) {
          const xpGain = 100;
          const newXP = character.experience + xpGain;
          const newLevel = Math.floor(newXP / 200) + 1;
          get().updateCharacterStats({ experience: newXP, level: newLevel });
        }
        get().incrementStat('questsCompleted');
        get().unlockAchievement('quest_complete');
        const completed = get().quests.filter(q => q.status === 'completed').length;
        if (completed >= 10) get().unlockAchievement('quest_master');

        // Unlock new era on main quest completion
        if (questId === 'main_mystery') {
          get().unlockEra('medieval');
          get().unlockAchievement('chapter_one');
        }
      },

      failQuest: (questId) => {
        set({ quests: get().quests.map((q) => q.id === questId ? { ...q, status: 'failed' } : q) });
        get().incrementStat('questsFailed');
      },

      // NPCs
      addNPC: (npc) => set({ npcs: [...get().npcs, npc] }),

      updateRelationship: (npcId, delta) => {
        set({
          npcs: get().npcs.map((n) =>
            n.id === npcId ? { ...n, relationship: Math.max(-100, Math.min(100, n.relationship + delta)) } : n
          ),
        });
        const npc = get().npcs.find((n) => n.id === npcId);
        if (npc && npc.relationship >= 100) get().unlockAchievement('best_friend');
        if (npc && npc.relationship <= -100) get().unlockAchievement('enemy_made');
      },

      meetNPC: (npcId) => {
        set({ npcs: get().npcs.map((n) => n.id === npcId ? { ...n, met: true } : n) });
        get().incrementStat('npcsmet');
        const allMet = get().npcs.every((n) => n.met);
        if (allMet) get().unlockAchievement('social_butterfly');
      },

      // Achievements
      unlockAchievement: (achievementId) => {
        const { achievements } = get();
        const achievement = achievements.find((a) => a.id === achievementId);
        if (!achievement || achievement.unlockedAt) return;
        set({
          achievements: achievements.map((a) =>
            a.id === achievementId ? { ...a, unlockedAt: Date.now() } : a
          ),
        });
      },

      // Dice
      rollDice: (type, attribute, difficultyClass) => {
        const { character, diceHistory } = get();
        const maxValue = DICE_VALUES[type];
        const result = Math.floor(Math.random() * maxValue) + 1;
        const modifier = attribute && character ? Math.floor((character.attributes[attribute] - 5) / 2) : 0;
        const total = result + modifier;

        // Use provided difficultyClass, or default to 10 for d20
        const dc = difficultyClass ?? (type === 'd20' ? 10 : undefined);

        const roll: DiceRoll = {
          id: `roll_${Date.now()}`,
          type, result, modifier, total, attribute,
          success: dc !== undefined ? total >= dc : undefined,
          timestamp: Date.now(),
        };

        set({ diceHistory: [roll, ...diceHistory.slice(0, 49)] });
        get().incrementStat('diceRolled');

        if (type === 'd20' && result === 20) {
          get().unlockAchievement('dice_master');
          get().incrementStat('criticalSuccesses');
        }
        if (type === 'd20' && result === 1) {
          get().unlockAchievement('snake_eyes');
          get().incrementStat('criticalFailures');
        }

        const totalRolls = get().playerStats.diceRolled;
        if (totalRolls >= 100) get().unlockAchievement('roll_100');

        return roll;
      },

      // Session
      startNewSession: (era) => {
        const { character, quests } = get();
        if (!character) return;
        const sessionEra = era || character.currentEra;

        const newSession: GameSession = {
          id: `session_${Date.now()}`,
          characterId: character.id,
          messages: [],
          currentScene: 'intro',
          isActive: true,
          startedAt: Date.now(),
          era: sessionEra,
        };

        if (quests.length === 0) get().addQuest(INITIAL_QUEST);
        set({ currentSession: newSession });
        get().unlockAchievement('first_steps');
        get().incrementStat('sessionsPlayed');
      },

      addMessage: (message) => {
        const { currentSession } = get();
        if (!currentSession) return;
        const newMessage: StoryMessage = {
          ...message,
          id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: Date.now(),
        };
        set({
          currentSession: {
            ...currentSession,
            messages: [...currentSession.messages, newMessage],
          },
        });
        get().incrementStat('wordsRead', message.content.split(' ').length);
      },

      endSession: () => {
        const { currentSession, sessionHistory } = get();
        if (!currentSession) return;
        set({
          sessionHistory: [...sessionHistory, { ...currentSession, isActive: false }],
          currentSession: null,
        });
      },

      // Settings
      setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
      setHapticEnabled: (enabled) => set({ hapticEnabled: enabled }),
      setTextSpeed: (speed) => set({ textSpeed: speed }),
      setLanguage: (language) => set({ language }),

      // Skills
      addSkillXP: (skillId, xp) => {
        const { skills } = get();
        set({
          skills: skills.map((s) => {
            if (s.id !== skillId || !s.unlocked) return s;
            let newXP = s.xpCurrent + xp;
            let newLevel = s.currentLevel;
            let newRequired = s.xpRequired;

            while (newXP >= newRequired && newLevel < s.maxLevel) {
              newXP -= newRequired;
              newLevel++;
              newRequired = Math.floor(newRequired * 1.5);
            }

            return { ...s, xpCurrent: newXP, currentLevel: newLevel, xpRequired: newRequired };
          }),
        });
      },

      unlockSkill: (skillId) => {
        set({
          skills: get().skills.map((s) => s.id === skillId ? { ...s, unlocked: true, currentLevel: 1 } : s),
        });
      },

      // Journal
      addJournalEntry: (entry) => {
        const newEntry: JournalEntry = {
          ...entry,
          id: `journal_${Date.now()}`,
          date: Date.now(),
        };
        set({ journal: [newEntry, ...get().journal] });
      },

      // Locations
      discoverLocation: (locationId) => {
        set({
          locations: get().locations.map((l) => l.id === locationId ? { ...l, discovered: true } : l),
        });
        get().incrementStat('locationsDiscovered');
        const discovered = get().locations.filter(l => l.discovered).length;
        if (discovered >= 5) get().unlockAchievement('explorer');

        const era = get().locations.find(l => l.id === locationId)?.era;
        if (era) {
          const eraLocations = get().locations.filter(l => l.era === era);
          if (eraLocations.every(l => l.discovered)) {
            get().unlockAchievement('cartographer');
          }
        }
      },

      visitLocation: (locationId) => {
        set({
          locations: get().locations.map((l) => l.id === locationId ? { ...l, visited: true, discovered: true } : l),
        });
      },

      // Daily Challenges
      generateDailyChallenges: () => {
        const tomorrow = new Date();
        tomorrow.setHours(24, 0, 0, 0);

        const challenges: DailyChallenge[] = [
          {
            id: `daily_dice_${Date.now()}`,
            title: 'Roll the Dice',
            description: 'Roll 10 dice today',
            type: 'dice',
            target: 10,
            progress: 0,
            reward: { xp: 50 },
            completed: false,
            expiresAt: tomorrow.getTime(),
          },
          {
            id: `daily_explore_${Date.now()}`,
            title: 'Explorer',
            description: 'Discover a new location',
            type: 'explore',
            target: 1,
            progress: 0,
            reward: { xp: 75, gold: 25 },
            completed: false,
            expiresAt: tomorrow.getTime(),
          },
          {
            id: `daily_story_${Date.now()}`,
            title: 'Storyteller',
            description: 'Make 5 choices in your adventure',
            type: 'story',
            target: 5,
            progress: 0,
            reward: { xp: 100 },
            completed: false,
            expiresAt: tomorrow.getTime(),
          },
        ];

        set({ dailyChallenges: challenges });
      },

      updateChallengeProgress: (challengeId, progress) => {
        const { dailyChallenges, character } = get();
        set({
          dailyChallenges: dailyChallenges.map((c) => {
            if (c.id !== challengeId || c.completed) return c;
            const newProgress = c.progress + progress;
            const completed = newProgress >= c.target;

            if (completed && character) {
              get().updateCharacterStats({
                experience: character.experience + c.reward.xp,
                gold: character.gold + (c.reward.gold || 0),
              });
            }

            return { ...c, progress: newProgress, completed };
          }),
        });

        const completedDaily = get().dailyChallenges.filter(c => c.completed).length;
        if (completedDaily >= 7) get().unlockAchievement('daily_warrior');
      },

      // Eras
      unlockEra: (era) => {
        const { unlockedEras } = get();
        if (!unlockedEras.includes(era)) {
          set({ unlockedEras: [...unlockedEras, era] });
          get().unlockAchievement('era_traveler');
        }
      },

      // Stats
      incrementStat: (stat, amount = 1) => {
        const { playerStats } = get();
        set({
          playerStats: { ...playerStats, [stat]: playerStats[stat] + amount },
        });
      },

      // Reset
      resetGame: () => {
        set({
          character: null,
          hasSeenIntro: false,
          inventory: [],
          quests: [],
          npcs: INITIAL_NPCS,
          achievements: INITIAL_ACHIEVEMENTS,
          diceHistory: [],
          currentSession: null,
          sessionHistory: [],
          skills: INITIAL_SKILLS,
          journal: [],
          locations: INITIAL_LOCATIONS,
          dailyChallenges: [],
          unlockedEras: ['stranger_things'],
          playerStats: INITIAL_STATS,
        });
      },
    }),
    {
      name: 'fantasy-hero-quest-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Selectors
export const useCharacter = () => useGameStore((s) => s.character);
export const useCurrentSession = () => useGameStore((s) => s.currentSession);
export const useHasSeenIntro = () => useGameStore((s) => s.hasSeenIntro);
export const useInventory = () => useGameStore((s) => s.inventory);
export const useQuests = () => useGameStore((s) => s.quests);
export const useNPCs = () => useGameStore((s) => s.npcs);
export const useAchievements = () => useGameStore((s) => s.achievements);
export const useDiceHistory = () => useGameStore((s) => s.diceHistory);
export const useSoundEnabled = () => useGameStore((s) => s.soundEnabled);
export const useHapticEnabled = () => useGameStore((s) => s.hapticEnabled);
export const useLanguage = () => useGameStore((s) => s.language);
export const useSkills = () => useGameStore((s) => s.skills);
export const useJournal = () => useGameStore((s) => s.journal);
export const useLocations = () => useGameStore((s) => s.locations);
export const useDailyChallenges = () => useGameStore((s) => s.dailyChallenges);
export const useUnlockedEras = () => useGameStore((s) => s.unlockedEras);
export const usePlayerStats = () => useGameStore((s) => s.playerStats);
