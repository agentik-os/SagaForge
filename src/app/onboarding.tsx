import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  FadeOut,
  SlideInRight,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  interpolate,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import {
  Globe,
  ChevronRight,
  ChevronLeft,
  Check,
  Wand2,
  Rocket,
  Skull,
  Search,
  Compass,
  Radiation,
  Zap,
  Flame,
  Moon,
  Sun,
  Scale,
  ShieldAlert,
  Sparkles,
  Clock,
  Crown,
  Landmark,
  Cpu,
  Columns,
  Cog,
  Anchor,
  Sword,
  Ghost,
  Play,
  Mountain,
  HeartCrack,
  Trophy,
  CloudRain,
  HelpCircle,
  Heart,
  Smile,
  MessageCircle,
  Cloud,
  Eye,
  Home,
  Box,
  Cigarette,
  BookOpen,
  Film,
  Video,
  Sunrise,
  AlertTriangle,
  Camera,
  Sunset,
  PartyPopper,
  Castle,
  Laugh,
  BadgeCheck,
  Brain,
  Feather,
  Shuffle,
  Leaf,
  FastForward,
  Star,
  Users,
  Minus,
} from 'lucide-react-native';
import {
  useGameStore,
  LANGUAGES,
  GENRES,
  ERAS,
  TONES,
  DIFFICULTIES,
  type Language,
  type Genre,
  type Era,
  type Tone,
  type Difficulty,
} from '@/lib/gameStore';
import { cn } from '@/lib/cn';
import { useTranslation } from '@/lib/translations';

const { width, height } = Dimensions.get('window');

type OnboardingStep = 'language' | 'genre' | 'era' | 'tone' | 'ready';

const STEPS: OnboardingStep[] = ['language', 'genre', 'era', 'tone', 'ready'];

// Era categories for filtering
type EraCategory = 'recommended' | 'original' | 'fantasy' | 'scifi' | 'horror' | 'historical' | 'modern' | 'adventure' | 'mythology' | 'alternate' | 'pop_culture' | 'experimental' | 'profession' | 'creature' | 'competition' | 'romance';

const ERA_CATEGORIES: Record<EraCategory, { label: string; eras: Era[] }> = {
  recommended: { label: '⭐ Recommended', eras: [] }, // Will be filled dynamically based on genre
  original: {
    label: 'Original',
    eras: ['stranger_things', 'medieval', 'victorian', 'cyberpunk', 'ancient', 'space_opera', 'wild_west', 'samurai', 'apocalypse', 'pirate', 'noir', 'lovecraft'],
  },
  fantasy: {
    label: 'Fantasy',
    eras: ['high_fantasy', 'dark_fantasy', 'fairy_tale', 'arthurian', 'sword_sorcery', 'urban_fantasy', 'steampunk_fantasy', 'oriental_fantasy', 'nordic_fantasy', 'celtic_fantasy', 'arabian_nights', 'slavic_folklore', 'african_mythology', 'mesoamerican', 'polynesian', 'native_american'],
  },
  scifi: {
    label: 'Sci-Fi',
    eras: ['hard_scifi', 'biopunk', 'solarpunk', 'dieselpunk', 'atompunk', 'nanopunk', 'space_western', 'alien_invasion', 'first_contact', 'generation_ship', 'dyson_sphere', 'time_travel', 'parallel_universe', 'simulation', 'ai_uprising', 'transhuman', 'clone_wars', 'mech_pilot', 'starship_crew', 'bounty_hunter_space', 'space_horror'],
  },
  horror: {
    label: 'Horror',
    eras: ['slasher', 'zombie_outbreak', 'vampire_gothic', 'werewolf_curse', 'haunted_house', 'cult_horror', 'body_horror', 'folk_horror', 'psychological_horror', 'survival_horror', 'cosmic_horror', 'demonic', 'witch_trials', 'asylum', 'carnival_horror'],
  },
  historical: {
    label: 'Historical',
    eras: ['ancient_egypt', 'ancient_rome', 'ancient_china', 'viking_age', 'mongol_empire', 'crusades', 'renaissance', 'elizabethan', 'french_revolution', 'napoleonic', 'american_civil_war', 'industrial_revolution', 'roaring_twenties', 'great_depression', 'world_war_1', 'world_war_2', 'cold_war', 'vietnam_war', 'korean_war'],
  },
  modern: {
    label: 'Modern',
    eras: ['spy_thriller', 'heist', 'crime_syndicate', 'street_gang', 'cartel', 'political_thriller', 'corporate_espionage', 'journalist', 'hacker_modern', 'paranormal_investigator', 'urban_legends', 'conspiracy', 'secret_society'],
  },
  adventure: {
    label: 'Adventure',
    eras: ['jungle_explorer', 'arctic_expedition', 'deep_sea', 'lost_civilization', 'treasure_hunter', 'safari', 'mountaineer', 'storm_chaser', 'archaeological', 'shipwreck_survivor', 'desert_nomad', 'rainforest', 'underground_caves'],
  },
  mythology: {
    label: 'Mythology',
    eras: ['greek_mythology', 'norse_mythology', 'egyptian_mythology', 'japanese_mythology', 'chinese_mythology', 'hindu_mythology', 'mayan_mythology', 'aztec_mythology', 'celtic_mythology', 'slavic_mythology', 'african_mythology_era', 'native_mythology'],
  },
  alternate: {
    label: 'Alternate History',
    eras: ['nazi_victory', 'confederate_victory', 'roman_never_fell', 'aztec_empire', 'chinese_discovery', 'steampunk_empire', 'magic_industrial', 'dinosaurs_survived'],
  },
  pop_culture: {
    label: 'Pop Culture',
    eras: ['matrix_style', 'mad_max_style', 'blade_runner_style', 'star_wars_style', 'star_trek_style', 'alien_style', 'terminator_style', 'jurassic_style', 'hunger_games_style', 'divergent_style', 'maze_runner_style', 'walking_dead_style', 'game_of_thrones_style', 'witcher_style', 'lord_of_rings_style', 'harry_potter_style', 'percy_jackson_style', 'twilight_style', 'interview_vampire_style', 'underworld_style'],
  },
  experimental: {
    label: 'Experimental',
    eras: ['dreams', 'afterlife', 'purgatory', 'heaven_hell', 'spirit_world', 'fairy_realm', 'elemental_planes', 'shadow_realm', 'mirror_world', 'pocket_dimension', 'shrunk_world', 'giant_world', 'underwater_kingdom', 'sky_islands', 'hollow_earth'],
  },
  profession: {
    label: 'Profession',
    eras: ['gladiator', 'assassin_guild', 'thieves_guild', 'mercenary_company', 'knight_order', 'wizard_academy', 'monster_hunter', 'vampire_hunter', 'demon_slayer', 'exorcist', 'bounty_hunter', 'smuggler', 'revolutionary', 'resistance_fighter', 'freedom_fighter'],
  },
  creature: {
    label: 'Creature',
    eras: ['dragon_rider', 'beast_tamer', 'shapeshifter', 'werewolf_pack', 'vampire_coven', 'fae_court', 'demon_realm', 'angel_hierarchy', 'elemental_spirits', 'kaiju_world'],
  },
  competition: {
    label: 'Competition',
    eras: ['gladiatorial_games', 'tournament_knight', 'racing_champion', 'fighting_circuit', 'death_game', 'survival_game', 'battle_royale', 'arena_champion'],
  },
  romance: {
    label: 'Romance',
    eras: ['regency_romance', 'gothic_romance', 'paranormal_romance', 'space_romance', 'enemies_lovers', 'forbidden_love', 'royal_romance', 'time_crossed_lovers'],
  },
};

// Tone categories for filtering
type ToneCategory = 'classic' | 'dramatic' | 'mood' | 'atmosphere' | 'narrative' | 'emotional' | 'genre_specific' | 'intensity' | 'unique';

const TONE_CATEGORIES: Record<ToneCategory, { label: string; tones: Tone[] }> = {
  classic: {
    label: 'Classic',
    tones: ['dark', 'light', 'balanced', 'gritty', 'whimsical'],
  },
  dramatic: {
    label: 'Dramatic',
    tones: ['epic', 'tragic', 'triumphant', 'melancholic', 'intense'],
  },
  mood: {
    label: 'Mood',
    tones: ['mysterious', 'suspenseful', 'romantic', 'comedic', 'satirical'],
  },
  atmosphere: {
    label: 'Atmosphere',
    tones: ['dreamy', 'nightmarish', 'surreal', 'cozy', 'claustrophobic'],
  },
  narrative: {
    label: 'Narrative',
    tones: ['noir', 'pulpy', 'literary', 'cinematic', 'documentary'],
  },
  emotional: {
    label: 'Emotional',
    tones: ['hopeful', 'desperate', 'nostalgic', 'bittersweet', 'euphoric'],
  },
  genre_specific: {
    label: 'Genre',
    tones: ['gothic', 'campy', 'hardboiled', 'swashbuckling', 'philosophical'],
  },
  intensity: {
    label: 'Intensity',
    tones: ['brutal', 'gentle', 'chaotic', 'serene', 'frantic'],
  },
  unique: {
    label: 'Unique',
    tones: ['absurdist', 'mythic', 'intimate', 'grandiose', 'minimalist'],
  },
};

const genreIcons: Record<Genre, typeof Wand2> = {
  fantasy: Wand2,
  scifi: Rocket,
  horror: Skull,
  mystery: Search,
  adventure: Compass,
  post_apocalyptic: Radiation,
  superhero: Zap,
  mythology: Flame,
};

// Dynamic icon getter for tones
const getToneIcon = (tone: Tone): typeof Moon => {
  const iconMap: Record<string, typeof Moon> = {
    moon: Moon,
    sun: Sun,
    scale: Scale,
    'shield-alert': ShieldAlert,
    sparkles: Sparkles,
    mountain: Mountain,
    'heart-crack': HeartCrack,
    trophy: Trophy,
    'cloud-rain': CloudRain,
    zap: Zap,
    'help-circle': HelpCircle,
    clock: Clock,
    heart: Heart,
    smile: Smile,
    'message-circle': MessageCircle,
    cloud: Cloud,
    skull: Skull,
    eye: Eye,
    home: Home,
    box: Box,
    cigarette: Cigarette,
    flame: Flame,
    'book-open': BookOpen,
    film: Film,
    video: Video,
    sunrise: Sunrise,
    'alert-triangle': AlertTriangle,
    camera: Camera,
    sunset: Sunset,
    'party-popper': PartyPopper,
    castle: Castle,
    laugh: Laugh,
    badge: BadgeCheck,
    sword: Sword,
    brain: Brain,
    feather: Feather,
    shuffle: Shuffle,
    leaf: Leaf,
    'fast-forward': FastForward,
    star: Star,
    users: Users,
    crown: Crown,
    minus: Minus,
  };
  const toneIcon = TONES[tone]?.icon || 'sparkles';
  return iconMap[toneIcon] || Sparkles;
};

// Dynamic icon getter for eras
const getEraIcon = (era: Era): typeof Clock => {
  const iconMap: Record<string, typeof Clock> = {
    tv: Zap,
    crown: Crown,
    landmark: Landmark,
    cpu: Cpu,
    columns: Columns,
    rocket: Rocket,
    sun: Sun,
    swords: Sword,
    radiation: Radiation,
    anchor: Anchor,
    search: Search,
    eye: Ghost,
    sparkles: Sparkles,
    moon: Moon,
    'wand-2': Wand2,
    shield: ShieldAlert,
    building: Landmark,
    cog: Cog,
    wind: Compass,
    snowflake: Sun,
    leaf: Compass,
    lamp: Flame,
    trees: Compass,
    pyramid: Flame,
    waves: Anchor,
    feather: Compass,
    atom: Cpu,
    dna: Cpu,
    plane: Rocket,
    star: Sparkles,
    zap: Zap,
    radio: Cpu,
    clock: Clock,
    layers: Cpu,
    monitor: Cpu,
    bot: Cpu,
    brain: Cpu,
    users: Ghost,
    crosshair: Search,
    skull: Skull,
    home: Landmark,
    heart: Flame,
    flame: Flame,
    ticket: Sparkles,
    flag: Crown,
    cross: Crown,
    palette: Sparkles,
    music: Sparkles,
    'trending-down': Cpu,
    target: Search,
    'alert-triangle': ShieldAlert,
    briefcase: Landmark,
    'map-pin': Compass,
    'dollar-sign': Cpu,
    newspaper: Landmark,
    terminal: Cpu,
    ghost: Ghost,
    'message-circle': Compass,
    lock: Search,
    binoculars: Search,
    mountain: Compass,
    'cloud-lightning': Zap,
    shovel: Compass,
    map: Compass,
    hammer: Sword,
    sunrise: Sun,
    clover: Compass,
    globe: Compass,
    truck: Rocket,
    code: Cpu,
    circle: Sparkles,
    cloud: Sparkles,
    scale: Scale,
    box: Cpu,
    minimize: Cpu,
    maximize: Cpu,
    'paw-print': Compass,
    repeat: Cpu,
    bug: Skull,
    trophy: Crown,
    user: Ghost,
    factory: Landmark,
    package: Compass,
    fist: Zap,
  };
  const eraIcon = ERAS[era]?.icon || 'sparkles';
  return iconMap[eraIcon] || Sparkles;
};

// Floating orb component for atmosphere
function FloatingOrb({ delay, size, color, startX, startY }: {
  delay: number;
  size: number;
  color: string;
  startX: number;
  startY: number;
}) {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-20, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
          withTiming(20, { duration: 3000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      )
    );
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(0.6, { duration: 2000 }),
          withTiming(0.3, { duration: 2000 })
        ),
        -1,
        true
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: startX,
          top: startY,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
        animatedStyle,
      ]}
    />
  );
}

// Animated step indicator
function StepIndicator({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  return (
    <View className="flex-row items-center justify-center gap-2">
      {Array.from({ length: totalSteps }).map((_, index) => {
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;

        return (
          <AnimatedDot key={index} isActive={isActive} isCompleted={isCompleted} />
        );
      })}
    </View>
  );
}

function AnimatedDot({ isActive, isCompleted }: { isActive: boolean; isCompleted: boolean }) {
  const scale = useSharedValue(1);
  const width = useSharedValue(8);

  useEffect(() => {
    if (isActive) {
      scale.value = withSpring(1.2, { damping: 12, stiffness: 200 });
      width.value = withSpring(24, { damping: 12, stiffness: 200 });
    } else {
      scale.value = withSpring(1, { damping: 12, stiffness: 200 });
      width.value = withSpring(8, { damping: 12, stiffness: 200 });
    }
  }, [isActive]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    width: width.value,
  }));

  return (
    <Animated.View
      style={[
        {
          height: 8,
          borderRadius: 4,
          backgroundColor: isActive ? '#FF3D3D' : isCompleted ? '#FF3D3D' : 'rgba(255,255,255,0.2)',
        },
        animatedStyle,
      ]}
    />
  );
}

// Animated selection card wrapper
function SelectionCard({
  isSelected,
  onPress,
  color,
  children,
  delay = 0,
}: {
  isSelected: boolean;
  onPress: () => void;
  color?: string;
  children: React.ReactNode;
  delay?: number;
}) {
  const scale = useSharedValue(1);
  const borderOpacity = useSharedValue(0);
  const glowOpacity = useSharedValue(0);

  useEffect(() => {
    if (isSelected) {
      borderOpacity.value = withSpring(1, { damping: 15 });
      glowOpacity.value = withSpring(0.15, { damping: 15 });
    } else {
      borderOpacity.value = withSpring(0, { damping: 15 });
      glowOpacity.value = withSpring(0, { damping: 15 });
    }
  }, [isSelected]);

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const borderStyle = useAnimatedStyle(() => ({
    borderColor: isSelected && color ? color : 'rgba(255,255,255,0.1)',
    borderWidth: interpolate(borderOpacity.value, [0, 1], [1, 2]),
  }));

  return (
    <Animated.View entering={FadeInUp.duration(300).delay(delay)}>
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onPress();
        }}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <Animated.View style={animatedStyle}>
          {/* Glow effect */}
          {color && (
            <Animated.View
              style={[
                {
                  position: 'absolute',
                  top: -2,
                  left: -2,
                  right: -2,
                  bottom: -2,
                  borderRadius: 18,
                  backgroundColor: color,
                },
                glowStyle,
              ]}
            />
          )}
          <Animated.View
            style={[
              {
                borderRadius: 16,
                overflow: 'hidden',
                backgroundColor: isSelected && color ? `${color}10` : 'rgba(255,255,255,0.03)',
              },
              borderStyle,
            ]}
          >
            {children}
          </Animated.View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

// Animated check mark
function AnimatedCheck({ color = '#fff', size = 14 }: { color?: string; size?: number }) {
  const scale = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 12, stiffness: 200 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Check size={size} color={color} strokeWidth={3} />
    </Animated.View>
  );
}

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);

  const setLanguage = useGameStore((s) => s.setLanguage);
  const setWorldConfig = useGameStore((s) => s.setWorldConfig);
  const setHasCompletedOnboarding = useGameStore((s) => s.setHasCompletedOnboarding);
  const currentLanguage = useGameStore((s) => s.language);
  const worldConfig = useGameStore((s) => s.worldConfig);

  const [step, setStep] = useState<OnboardingStep>('language');
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(currentLanguage);
  const [selectedGenre, setSelectedGenre] = useState<Genre>(worldConfig.genre);
  const [selectedEra, setSelectedEra] = useState<Era>(worldConfig.era);
  const [selectedTone, setSelectedTone] = useState<Tone>(worldConfig.tone);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>(worldConfig.difficulty);

  const { t } = useTranslation(selectedLanguage);

  const currentStepIndex = STEPS.indexOf(step);

  // Button animation
  const buttonScale = useSharedValue(1);
  const buttonGlow = useSharedValue(0);

  useEffect(() => {
    buttonGlow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1500 }),
        withTiming(0, { duration: 1500 })
      ),
      -1,
      true
    );
  }, []);

  const buttonGlowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(buttonGlow.value, [0, 1], [0, 0.3]),
  }));

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    buttonScale.value = withSequence(
      withSpring(0.95, { damping: 10, stiffness: 400 }),
      withSpring(1, { damping: 10, stiffness: 400 })
    );

    if (step === 'language') {
      setLanguage(selectedLanguage);
      setStep('genre');
    } else if (step === 'genre') {
      setWorldConfig({ genre: selectedGenre });
      setStep('era');
    } else if (step === 'era') {
      setWorldConfig({ era: selectedEra });
      setStep('tone');
    } else if (step === 'tone') {
      setWorldConfig({ tone: selectedTone, difficulty: selectedDifficulty });
      setStep('ready');
    } else if (step === 'ready') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setHasCompletedOnboarding(true);
      router.replace('/');
    }

    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setStep(STEPS[prevIndex]);
    }
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const renderStepContent = () => {
    switch (step) {
      case 'language':
        return (
          <LanguageStep
            selected={selectedLanguage}
            onSelect={setSelectedLanguage}
          />
        );
      case 'genre':
        return (
          <GenreStep
            selected={selectedGenre}
            onSelect={setSelectedGenre}
            t={t}
          />
        );
      case 'era':
        return (
          <EraStep
            selected={selectedEra}
            onSelect={setSelectedEra}
            genre={selectedGenre}
            t={t}
          />
        );
      case 'tone':
        return (
          <ToneStep
            selectedTone={selectedTone}
            onSelectTone={setSelectedTone}
            selectedDifficulty={selectedDifficulty}
            onSelectDifficulty={setSelectedDifficulty}
            t={t}
          />
        );
      case 'ready':
        return (
          <ReadyStep
            language={selectedLanguage}
            genre={selectedGenre}
            era={selectedEra}
            tone={selectedTone}
            difficulty={selectedDifficulty}
            t={t}
          />
        );
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 'language': return t('chooseLanguage');
      case 'genre': return t('chooseGenre');
      case 'era': return t('chooseEra');
      case 'tone': return t('chooseTone');
      case 'ready': return t('readyTitle');
    }
  };

  const getStepSubtitle = () => {
    switch (step) {
      case 'language': return t('chooseLanguageSubtitle');
      case 'genre': return t('chooseGenreSubtitle');
      case 'era': return t('chooseEraSubtitle');
      case 'tone': return t('chooseToneSubtitle');
      case 'ready': return t('readySubtitle');
    }
  };

  return (
    <View className="flex-1 bg-[#05050A]">
      <LinearGradient
        colors={['#0A0A18', '#05050A', '#0D0510']}
        style={{ position: 'absolute', width: '100%', height: '100%' }}
      />

      {/* Floating orbs for atmosphere */}
      <FloatingOrb delay={0} size={180} color="#FF3D3D" startX={width - 90} startY={height * 0.08} />
      <FloatingOrb delay={500} size={120} color="#FF6B35" startX={-40} startY={height * 0.3} />
      <FloatingOrb delay={1000} size={100} color="#00E5FF" startX={width - 60} startY={height * 0.6} />
      <FloatingOrb delay={1500} size={80} color="#8B5CF6" startX={20} startY={height * 0.75} />

      {/* Progress indicator */}
      <View
        className="px-6"
        style={{ paddingTop: insets.top + 20 }}
      >
        <StepIndicator currentStep={currentStepIndex} totalSteps={STEPS.length} />
        <Text className="text-gray-600 text-xs mt-3 text-center tracking-wider uppercase">
          {t('step')} {currentStepIndex + 1} {t('of')} {STEPS.length}
        </Text>
      </View>

      <ScrollView
        ref={scrollRef}
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingBottom: insets.bottom + 120,
        }}
      >
        {/* Header */}
        <Animated.View
          key={step}
          entering={FadeInDown.duration(400).springify()}
          className="items-center mt-8 mb-8"
        >
          <Text className="text-3xl font-bold text-white text-center tracking-tight">
            {getStepTitle()}
          </Text>
          <Text className="text-gray-500 text-center mt-3 text-base max-w-[300px] leading-relaxed">
            {getStepSubtitle()}
          </Text>
        </Animated.View>

        {/* Step Content */}
        <Animated.View
          key={`content-${step}`}
          entering={SlideInRight.duration(350).springify()}
        >
          {renderStepContent()}
        </Animated.View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View
        className="absolute bottom-0 left-0 right-0"
        style={{ paddingBottom: insets.bottom + 16 }}
      >
        <BlurView
          intensity={60}
          tint="dark"
          style={{
            position: 'absolute',
            top: -30,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        />
        <LinearGradient
          colors={['transparent', 'rgba(5,5,10,0.9)', 'rgba(5,5,10,1)']}
          style={{
            position: 'absolute',
            top: -60,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        />
        <View className="px-6 flex-row gap-3">
          {currentStepIndex > 0 && (
            <Pressable
              onPress={handleBack}
              className="flex-1 rounded-2xl py-4 flex-row items-center justify-center active:opacity-80"
              style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
            >
              <ChevronLeft size={20} color="#fff" />
              <Text className="text-white font-semibold ml-1">{t('back')}</Text>
            </Pressable>
          )}
          <Animated.View
            style={[
              { flex: currentStepIndex > 0 ? 2 : 1 },
              buttonAnimatedStyle,
            ]}
          >
            <Pressable onPress={handleNext} className="relative">
              {/* Animated glow */}
              <Animated.View
                style={[
                  {
                    position: 'absolute',
                    top: -4,
                    left: -4,
                    right: -4,
                    bottom: -4,
                    borderRadius: 20,
                    backgroundColor: '#FF3D3D',
                  },
                  buttonGlowStyle,
                ]}
              />
              <LinearGradient
                colors={step === 'ready' ? ['#10B981', '#059669'] : ['#FF3D3D', '#FF6B35']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  borderRadius: 16,
                  paddingVertical: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text className="text-white font-bold text-lg mr-2">
                  {step === 'ready' ? t('beginAdventure') : t('continue')}
                </Text>
                {step === 'ready' ? (
                  <Play size={20} color="#fff" fill="#fff" />
                ) : (
                  <ChevronRight size={20} color="#fff" />
                )}
              </LinearGradient>
            </Pressable>
          </Animated.View>
        </View>
      </View>
    </View>
  );
}

// ============================================
// STEP COMPONENTS
// ============================================

function LanguageStep({
  selected,
  onSelect,
}: {
  selected: Language;
  onSelect: (lang: Language) => void;
}) {
  const languages = Object.values(LANGUAGES);

  return (
    <View className="gap-3">
      {languages.map((lang, index) => {
        const isSelected = selected === lang.id;

        return (
          <SelectionCard
            key={lang.id}
            isSelected={isSelected}
            onPress={() => onSelect(lang.id)}
            color="#FF3D3D"
            delay={index * 40}
          >
            <View className="flex-row items-center px-4 py-4">
              <View className="w-12 h-12 rounded-xl bg-white/5 items-center justify-center mr-4">
                <Text className="text-3xl">{lang.flag}</Text>
              </View>
              <View className="flex-1">
                <Text className={cn(
                  'font-semibold text-lg',
                  isSelected ? 'text-white' : 'text-gray-300'
                )}>
                  {lang.nativeName}
                </Text>
                <Text className="text-gray-500 text-sm">{lang.name}</Text>
              </View>
              {isSelected && (
                <View className="w-7 h-7 rounded-full bg-[#FF3D3D] items-center justify-center">
                  <AnimatedCheck />
                </View>
              )}
            </View>
          </SelectionCard>
        );
      })}
    </View>
  );
}

function GenreStep({
  selected,
  onSelect,
  t,
}: {
  selected: Genre;
  onSelect: (genre: Genre) => void;
  t: (key: string) => string;
}) {
  const genres = Object.values(GENRES);

  return (
    <View className="gap-3">
      {genres.map((genre, index) => {
        const Icon = genreIcons[genre.id];
        const isSelected = selected === genre.id;

        return (
          <SelectionCard
            key={genre.id}
            isSelected={isSelected}
            onPress={() => onSelect(genre.id)}
            color={genre.color}
            delay={index * 50}
          >
            <View className="p-4">
              <View className="flex-row items-center">
                <View
                  className="w-14 h-14 rounded-2xl items-center justify-center mr-4"
                  style={{ backgroundColor: `${genre.color}20` }}
                >
                  <Icon size={28} color={genre.color} />
                </View>
                <View className="flex-1">
                  <Text className={cn(
                    'font-bold text-lg',
                    isSelected ? 'text-white' : 'text-gray-200'
                  )}>
                    {t(`genre_${genre.id}`)}
                  </Text>
                  <Text className="text-gray-500 text-sm mt-0.5" numberOfLines={2}>
                    {t(`genre_${genre.id}_desc`)}
                  </Text>
                </View>
                {isSelected && (
                  <View
                    className="w-8 h-8 rounded-full items-center justify-center"
                    style={{ backgroundColor: genre.color }}
                  >
                    <AnimatedCheck size={16} />
                  </View>
                )}
              </View>
            </View>
          </SelectionCard>
        );
      })}
    </View>
  );
}

function EraStep({
  selected,
  onSelect,
  genre,
  t,
}: {
  selected: Era;
  onSelect: (era: Era) => void;
  genre: Genre;
  t: (key: string) => string;
}) {
  const genreInfo = GENRES[genre];
  const compatibleEras = genreInfo.compatibleEras;
  const [activeCategory, setActiveCategory] = useState<EraCategory>('recommended');

  // Get eras for the active category
  const getErasForCategory = (category: EraCategory): Era[] => {
    if (category === 'recommended') {
      return compatibleEras;
    }
    return ERA_CATEGORIES[category].eras.filter(era => ERAS[era]);
  };

  const displayedEras = getErasForCategory(activeCategory);
  const categories: EraCategory[] = ['recommended', 'original', 'fantasy', 'scifi', 'horror', 'historical', 'modern', 'adventure', 'mythology', 'alternate', 'pop_culture', 'experimental', 'profession', 'creature', 'competition', 'romance'];

  return (
    <View className="gap-3">
      {/* Category filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 4, gap: 8 }}
        style={{ flexGrow: 0, marginBottom: 8 }}
      >
        {categories.map((category) => {
          const isActive = activeCategory === category;
          const categoryInfo = ERA_CATEGORIES[category];
          const eraCount = category === 'recommended' ? compatibleEras.length : categoryInfo.eras.filter(e => ERAS[e]).length;

          return (
            <Pressable
              key={category}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setActiveCategory(category);
              }}
            >
              <View
                className={cn(
                  'px-4 py-2.5 rounded-full flex-row items-center',
                  isActive ? 'bg-[#FF3D3D]' : 'bg-white/5'
                )}
              >
                <Text
                  className={cn(
                    'text-sm font-semibold',
                    isActive ? 'text-white' : 'text-gray-400'
                  )}
                >
                  {categoryInfo.label}
                </Text>
                <View
                  className={cn(
                    'ml-2 px-1.5 py-0.5 rounded-full min-w-[20px] items-center',
                    isActive ? 'bg-white/20' : 'bg-white/10'
                  )}
                >
                  <Text
                    className={cn(
                      'text-xs font-bold',
                      isActive ? 'text-white' : 'text-gray-500'
                    )}
                  >
                    {eraCount}
                  </Text>
                </View>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Info hint */}
      {activeCategory === 'recommended' && (
        <Animated.View
          entering={FadeIn.duration(300)}
          className="rounded-2xl overflow-hidden mb-2"
        >
          <LinearGradient
            colors={['rgba(16,185,129,0.15)', 'rgba(16,185,129,0.05)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ padding: 12, borderRadius: 16 }}
          >
            <Text className="text-[#34D399] text-sm text-center font-medium">
              {t('recommendedErasFor')} {t(`genre_${genre}`)}
            </Text>
          </LinearGradient>
        </Animated.View>
      )}

      {/* Era list */}
      {displayedEras.length === 0 ? (
        <View className="py-8 items-center">
          <Text className="text-gray-500 text-center">{t('noErasInCategory') || 'No eras in this category'}</Text>
        </View>
      ) : (
        displayedEras.map((eraId, index) => {
          const era = ERAS[eraId];
          if (!era) return null;

          const Icon = getEraIcon(eraId);
          const isSelected = selected === eraId;
          const isRecommended = compatibleEras.includes(eraId);

          return (
            <Animated.View
              key={eraId}
              entering={FadeInUp.duration(250).delay(index * 30)}
            >
              <SelectionCard
                isSelected={isSelected}
                onPress={() => onSelect(eraId)}
                color={era.color}
              >
                <View className="p-4">
                  <View className="flex-row items-center">
                    <View
                      className="w-14 h-14 rounded-2xl items-center justify-center mr-4"
                      style={{ backgroundColor: `${era.color}20` }}
                    >
                      <Icon size={26} color={era.color} />
                    </View>
                    <View className="flex-1">
                      <View className="flex-row items-center flex-wrap gap-2">
                        <Text className={cn(
                          'font-bold text-lg',
                          isSelected ? 'text-white' : 'text-gray-200'
                        )}>
                          {era.name}
                        </Text>
                        {isRecommended && activeCategory !== 'recommended' && (
                          <View className="bg-[#10B981]/20 px-2.5 py-1 rounded-full">
                            <Text className="text-[#34D399] text-xs font-semibold">{t('recommended')}</Text>
                          </View>
                        )}
                      </View>
                      <Text className="text-gray-600 text-xs mt-0.5">{era.year}</Text>
                      <Text className="text-gray-500 text-sm mt-1" numberOfLines={2}>
                        {era.tagline}
                      </Text>
                    </View>
                    {isSelected && (
                      <View
                        className="w-8 h-8 rounded-full items-center justify-center"
                        style={{ backgroundColor: era.color }}
                      >
                        <AnimatedCheck size={16} />
                      </View>
                    )}
                  </View>
                </View>
              </SelectionCard>
            </Animated.View>
          );
        })
      )}
    </View>
  );
}

function ToneStep({
  selectedTone,
  onSelectTone,
  selectedDifficulty,
  onSelectDifficulty,
  t,
}: {
  selectedTone: Tone;
  onSelectTone: (tone: Tone) => void;
  selectedDifficulty: Difficulty;
  onSelectDifficulty: (diff: Difficulty) => void;
  t: (key: string) => string;
}) {
  const [activeCategory, setActiveCategory] = useState<ToneCategory>('classic');
  const difficulties = Object.entries(DIFFICULTIES);

  const categories: ToneCategory[] = ['classic', 'dramatic', 'mood', 'atmosphere', 'narrative', 'emotional', 'genre_specific', 'intensity', 'unique'];

  const displayedTones = TONE_CATEGORIES[activeCategory].tones.filter(tone => TONES[tone]);

  return (
    <View>
      {/* Tone Selection */}
      <Text className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-4">
        {t('storyTone')}
      </Text>

      {/* Category filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 4, gap: 8 }}
        style={{ flexGrow: 0, marginBottom: 12 }}
      >
        {categories.map((category) => {
          const isActive = activeCategory === category;
          const categoryInfo = TONE_CATEGORIES[category];
          const toneCount = categoryInfo.tones.filter(t => TONES[t]).length;

          return (
            <Pressable
              key={category}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setActiveCategory(category);
              }}
            >
              <View
                className={cn(
                  'px-4 py-2.5 rounded-full flex-row items-center',
                  isActive ? 'bg-[#FF3D3D]' : 'bg-white/5'
                )}
              >
                <Text
                  className={cn(
                    'text-sm font-semibold',
                    isActive ? 'text-white' : 'text-gray-400'
                  )}
                >
                  {categoryInfo.label}
                </Text>
                <View
                  className={cn(
                    'ml-2 px-1.5 py-0.5 rounded-full min-w-[20px] items-center',
                    isActive ? 'bg-white/20' : 'bg-white/10'
                  )}
                >
                  <Text
                    className={cn(
                      'text-xs font-bold',
                      isActive ? 'text-white' : 'text-gray-500'
                    )}
                  >
                    {toneCount}
                  </Text>
                </View>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>

      <View className="gap-3 mb-8">
        {displayedTones.map((toneKey, index) => {
          const tone = TONES[toneKey];
          if (!tone) return null;

          const Icon = getToneIcon(toneKey);
          const isSelected = selectedTone === toneKey;

          return (
            <Animated.View
              key={toneKey}
              entering={FadeInUp.duration(250).delay(index * 30)}
            >
              <SelectionCard
                isSelected={isSelected}
                onPress={() => onSelectTone(toneKey)}
                color="#FF3D3D"
              >
                <View className="flex-row items-center px-4 py-3.5">
                  <View className="w-11 h-11 rounded-xl bg-white/8 items-center justify-center mr-3">
                    <Icon size={22} color={isSelected ? '#FF3D3D' : '#666'} />
                  </View>
                  <View className="flex-1">
                    <Text className={cn(
                      'font-semibold text-base',
                      isSelected ? 'text-white' : 'text-gray-300'
                    )}>
                      {t(`tone_${toneKey}`)}
                    </Text>
                    <Text className="text-gray-500 text-xs mt-0.5">{t(`tone_${toneKey}_desc`)}</Text>
                  </View>
                  {isSelected && (
                    <View className="w-7 h-7 rounded-full bg-[#FF3D3D] items-center justify-center">
                      <AnimatedCheck />
                    </View>
                  )}
                </View>
              </SelectionCard>
            </Animated.View>
          );
        })}
      </View>

      {/* Difficulty Selection */}
      <Text className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-4">
        {t('difficulty')}
      </Text>
      <View className="flex-row gap-3">
        {difficulties.map(([key, diff], index) => {
          const isSelected = selectedDifficulty === key;

          return (
            <Animated.View
              key={key}
              entering={FadeInUp.duration(300).delay(index * 60)}
              className="flex-1"
            >
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onSelectDifficulty(key as Difficulty);
                }}
                className="active:scale-[0.97]"
              >
                <View
                  className="py-4 rounded-2xl items-center justify-center"
                  style={{
                    backgroundColor: isSelected ? `${diff.color}18` : 'rgba(255,255,255,0.03)',
                    borderWidth: isSelected ? 2 : 1,
                    borderColor: isSelected ? diff.color : 'rgba(255,255,255,0.1)',
                  }}
                >
                  <Text
                    className="font-bold text-base"
                    style={{ color: isSelected ? diff.color : '#9ca3af' }}
                  >
                    {t(`difficulty_${key}`)}
                  </Text>
                </View>
              </Pressable>
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
}

function ReadyStep({
  language,
  genre,
  era,
  tone,
  difficulty,
  t,
}: {
  language: Language;
  genre: Genre;
  era: Era;
  tone: Tone;
  difficulty: Difficulty;
  t: (key: string) => string;
}) {
  const langInfo = LANGUAGES[language];
  const genreInfo = GENRES[genre];
  const eraInfo = ERAS[era];
  const toneInfo = TONES[tone];
  const diffInfo = DIFFICULTIES[difficulty];

  const GenreIcon = genreIcons[genre];
  const EraIcon = getEraIcon(era);

  // Celebration animation
  const iconScale = useSharedValue(0);
  const iconRotate = useSharedValue(0);
  const ringScale = useSharedValue(0.8);
  const ringOpacity = useSharedValue(0);

  useEffect(() => {
    iconScale.value = withSpring(1, { damping: 8, stiffness: 100 });
    iconRotate.value = withSequence(
      withSpring(-10, { damping: 10 }),
      withSpring(10, { damping: 10 }),
      withSpring(0, { damping: 10 })
    );
    ringScale.value = withRepeat(
      withSequence(
        withTiming(1.3, { duration: 1500 }),
        withTiming(0.8, { duration: 1500 })
      ),
      -1,
      true
    );
    ringOpacity.value = withRepeat(
      withSequence(
        withTiming(0.4, { duration: 1500 }),
        withTiming(0.1, { duration: 1500 })
      ),
      -1,
      true
    );
  }, []);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: iconScale.value },
      { rotate: `${iconRotate.value}deg` },
    ],
  }));

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
    opacity: ringOpacity.value,
  }));

  return (
    <View>
      <View className="items-center mb-10">
        {/* Animated celebration icon */}
        <View className="relative items-center justify-center">
          <Animated.View
            style={[
              {
                position: 'absolute',
                width: 140,
                height: 140,
                borderRadius: 70,
                borderWidth: 2,
                borderColor: '#FF3D3D',
              },
              ringStyle,
            ]}
          />
          <Animated.View
            style={[
              {
                width: 100,
                height: 100,
                borderRadius: 50,
                backgroundColor: 'rgba(255,61,61,0.15)',
                alignItems: 'center',
                justifyContent: 'center',
              },
              iconStyle,
            ]}
          >
            <Sparkles size={48} color="#FF3D3D" />
          </Animated.View>
        </View>
        <Animated.Text
          entering={FadeInUp.duration(500).delay(200)}
          className="text-white font-bold text-2xl text-center mt-6"
        >
          {t('yourWorldIsReady')}
        </Animated.Text>
      </View>

      {/* Summary card */}
      <Animated.View
        entering={FadeInUp.duration(500).delay(300)}
        className="rounded-3xl overflow-hidden"
      >
        <BlurView intensity={20} tint="dark">
          <View
            className="p-5 gap-5"
            style={{ backgroundColor: 'rgba(18,18,31,0.8)' }}
          >
            {/* Language */}
            <View className="flex-row items-center">
              <View className="w-12 h-12 rounded-xl bg-white/10 items-center justify-center mr-4">
                <Globe size={22} color="#FF3D3D" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-500 text-xs uppercase tracking-wider">{t('language')}</Text>
                <Text className="text-white font-semibold text-base mt-0.5">{langInfo.flag} {langInfo.nativeName}</Text>
              </View>
            </View>

            <View className="h-px bg-white/5" />

            {/* Genre */}
            <View className="flex-row items-center">
              <View
                className="w-12 h-12 rounded-xl items-center justify-center mr-4"
                style={{ backgroundColor: `${genreInfo.color}20` }}
              >
                <GenreIcon size={22} color={genreInfo.color} />
              </View>
              <View className="flex-1">
                <Text className="text-gray-500 text-xs uppercase tracking-wider">{t('genre')}</Text>
                <Text className="text-white font-semibold text-base mt-0.5">{t(`genre_${genre}`)}</Text>
              </View>
            </View>

            <View className="h-px bg-white/5" />

            {/* Era */}
            <View className="flex-row items-center">
              <View
                className="w-12 h-12 rounded-xl items-center justify-center mr-4"
                style={{ backgroundColor: `${eraInfo.color}20` }}
              >
                <EraIcon size={22} color={eraInfo.color} />
              </View>
              <View className="flex-1">
                <Text className="text-gray-500 text-xs uppercase tracking-wider">{t('era')}</Text>
                <Text className="text-white font-semibold text-base mt-0.5">{eraInfo.name}</Text>
                <Text className="text-gray-600 text-xs">{eraInfo.year}</Text>
              </View>
            </View>

            <View className="h-px bg-white/5" />

            {/* Tone & Difficulty */}
            <View className="flex-row items-center">
              <View className="w-12 h-12 rounded-xl bg-white/10 items-center justify-center mr-4">
                <Cog size={22} color="#888" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-500 text-xs uppercase tracking-wider">{t('toneAndDifficulty')}</Text>
                <Text className="text-white font-semibold text-base mt-0.5">
                  {t(`tone_${tone}`)} · <Text style={{ color: diffInfo.color }}>{t(`difficulty_${difficulty}`)}</Text>
                </Text>
              </View>
            </View>
          </View>
        </BlurView>
      </Animated.View>

      <Animated.Text
        entering={FadeIn.duration(400).delay(500)}
        className="text-gray-600 text-xs text-center mt-6"
      >
        {t('changeSettingsAnytime')}
      </Animated.Text>
    </View>
  );
}
