import { useEffect } from 'react';
import { View, Text, Pressable, Dimensions, ScrollView } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  FadeIn,
  FadeInUp,
  FadeInDown,
} from 'react-native-reanimated';
import {
  Sword,
  Sparkles,
  User,
  Play,
  Target,
  Package,
  Users,
  Trophy,
  Settings,
  Heart,
  Zap,
  Star,
  Map,
  BookOpen,
  Calendar,
  BarChart3,
  Clock,
} from 'lucide-react-native';
import {
  useCharacter,
  useGameStore,
  useQuests,
  useInventory,
  useAchievements,
  ARCHETYPES,
} from '@/lib/gameStore';

const { width, height } = Dimensions.get('window');

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const character = useCharacter();
  const quests = useQuests();
  const inventory = useInventory();
  const achievements = useAchievements();
  const hasCompletedOnboarding = useGameStore((s) => s.hasCompletedOnboarding);

  // Animation values
  const glowOpacity = useSharedValue(0.4);
  const orbFloat = useSharedValue(0);

  useEffect(() => {
    // Hide splash screen
    SplashScreen.hideAsync();

    // Pulsing glow animation
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.4, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );

    // Floating orb animation
    orbFloat.value = withRepeat(
      withSequence(
        withTiming(-15, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
        withTiming(15, { duration: 3000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const orbStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: orbFloat.value }],
  }));

  const handleStartAdventure = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (character) {
      router.push('/game-session' as never);
    } else {
      router.push('/create-character' as never);
    }
  };

  const handleViewCharacter = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/character-sheet' as never);
  };

  const archetypeInfo = character ? ARCHETYPES[character.archetype] : null;
  const activeQuests = quests.filter((q) => q.status === 'active').length;
  const unlockedAchievements = achievements.filter((a) => a.unlockedAt).length;
  const totalItems = inventory.reduce((sum, i) => sum + i.quantity, 0);

  // Redirect to onboarding if not completed
  if (!hasCompletedOnboarding) {
    return <Redirect href="/onboarding" />;
  }

  return (
    <View className="flex-1 bg-[#0A0A14]">
      <LinearGradient
        colors={['#0A0A14', '#1A1025', '#0D0D1A']}
        style={{ position: 'absolute', width: '100%', height: '100%' }}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      {/* Animated background glow */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: height * 0.1,
            left: width * 0.5 - 150,
            width: 300,
            height: 300,
            borderRadius: 150,
            backgroundColor: '#FF3D3D',
          },
          glowStyle,
        ]}
      />
      <View
        style={{
          position: 'absolute',
          top: height * 0.1,
          left: width * 0.5 - 150,
          width: 300,
          height: 300,
          borderRadius: 150,
          backgroundColor: '#0A0A14',
          opacity: 0.7,
        }}
      />

      {/* Secondary glow - cyan */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: height * 0.5,
            right: -50,
            width: 200,
            height: 200,
            borderRadius: 100,
            backgroundColor: '#00E5FF',
            opacity: 0.15,
          },
          orbStyle,
        ]}
      />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 30,
          paddingBottom: insets.bottom + 20,
          paddingHorizontal: 24,
        }}
      >
        {/* Header with floating orb */}
        <Animated.View
          entering={FadeInDown.duration(800).delay(200)}
          className="items-center mb-6"
        >
          <Animated.View style={orbStyle} className="mb-4">
            <View className="w-16 h-16 rounded-full bg-[#FF3D3D]/20 items-center justify-center">
              <Sparkles size={32} color="#FF3D3D" strokeWidth={1.5} />
            </View>
          </Animated.View>

          {/* Title */}
          <Text className="text-3xl font-bold text-white text-center tracking-wider">
            FANTASY
          </Text>
          <Text className="text-4xl font-black text-[#FF3D3D] text-center tracking-[0.2em] mt-1">
            HERO QUEST
          </Text>
          <Text className="text-xs text-gray-400 text-center mt-2 tracking-widest uppercase">
            Your Story Awaits
          </Text>
        </Animated.View>

        {/* Character Card or Welcome Message */}
        <Animated.View entering={FadeIn.duration(600).delay(400)}>
          {character ? (
            <Pressable onPress={handleViewCharacter} className="active:opacity-80">
              <View className="bg-[#12121F] rounded-3xl p-5 border border-[#2A2A40]">
                <View className="flex-row items-center mb-4">
                  <View className="w-14 h-14 rounded-2xl bg-[#FF3D3D]/20 items-center justify-center mr-4">
                    <User size={28} color="#FF3D3D" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-xl font-bold text-white">{character.name}</Text>
                    <Text className="text-sm text-[#00E5FF]">{archetypeInfo?.title}</Text>
                  </View>
                  <View className="items-end">
                    <View className="bg-[#00E5FF]/20 px-3 py-1 rounded-full">
                      <Text className="text-xs text-[#00E5FF] font-bold">Lv.{character.level}</Text>
                    </View>
                    <Text className="text-gray-500 text-xs mt-1">{character.experience} XP</Text>
                  </View>
                </View>

                {/* Health & Energy Bars */}
                <View className="flex-row mb-4">
                  <View className="flex-1 mr-2">
                    <View className="flex-row items-center justify-between mb-1">
                      <View className="flex-row items-center">
                        <Heart size={12} color="#EF4444" />
                        <Text className="text-gray-400 text-xs ml-1">Health</Text>
                      </View>
                      <Text className="text-gray-400 text-xs">{character.health}/{character.maxHealth}</Text>
                    </View>
                    <View className="h-2 bg-[#1A1A2E] rounded-full overflow-hidden">
                      <View
                        className="h-full bg-[#EF4444] rounded-full"
                        style={{ width: `${(character.health / character.maxHealth) * 100}%` }}
                      />
                    </View>
                  </View>
                  <View className="flex-1 ml-2">
                    <View className="flex-row items-center justify-between mb-1">
                      <View className="flex-row items-center">
                        <Zap size={12} color="#3B82F6" />
                        <Text className="text-gray-400 text-xs ml-1">Energy</Text>
                      </View>
                      <Text className="text-gray-400 text-xs">{character.energy}/{character.maxEnergy}</Text>
                    </View>
                    <View className="h-2 bg-[#1A1A2E] rounded-full overflow-hidden">
                      <View
                        className="h-full bg-[#3B82F6] rounded-full"
                        style={{ width: `${(character.energy / character.maxEnergy) * 100}%` }}
                      />
                    </View>
                  </View>
                </View>

                {/* Attributes Preview */}
                <View className="flex-row justify-between">
                  {Object.entries(character.attributes).slice(0, 3).map(([key, value]) => (
                    <View key={key} className="items-center">
                      <Text className="text-xs text-gray-500 uppercase mb-1">{key.slice(0, 3)}</Text>
                      <Text className="text-white text-lg font-bold">{value}</Text>
                    </View>
                  ))}
                  {Object.entries(character.attributes).slice(3).map(([key, value]) => (
                    <View key={key} className="items-center">
                      <Text className="text-xs text-gray-500 uppercase mb-1">{key.slice(0, 3)}</Text>
                      <Text className="text-white text-lg font-bold">{value}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </Pressable>
          ) : (
            <View className="items-center">
              <View className="bg-[#12121F]/80 rounded-3xl p-8 border border-[#2A2A40] w-full">
                <View className="items-center mb-4">
                  <Sword size={48} color="#FF3D3D" strokeWidth={1.5} />
                </View>
                <Text className="text-xl font-bold text-white text-center mb-2">
                  Begin Your Legend
                </Text>
                <Text className="text-gray-400 text-center text-sm leading-6">
                  Create your hero and embark on an AI-driven adventure where every choice shapes your destiny.
                </Text>
              </View>
            </View>
          )}
        </Animated.View>

        {/* Quick Stats (only if character exists) */}
        {character && (
          <Animated.View entering={FadeInUp.duration(600).delay(500)} className="mt-4">
            <View className="flex-row gap-3">
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push('/quest-log' as never);
                }}
                className="flex-1 bg-[#12121F] rounded-2xl p-4 border border-[#2A2A40] active:opacity-80"
              >
                <Target size={20} color="#00E5FF" />
                <Text className="text-2xl font-bold text-white mt-2">{activeQuests}</Text>
                <Text className="text-gray-500 text-xs">Active Quests</Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push('/inventory' as never);
                }}
                className="flex-1 bg-[#12121F] rounded-2xl p-4 border border-[#2A2A40] active:opacity-80"
              >
                <Package size={20} color="#A855F7" />
                <Text className="text-2xl font-bold text-white mt-2">{totalItems}</Text>
                <Text className="text-gray-500 text-xs">Items</Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push('/achievements' as never);
                }}
                className="flex-1 bg-[#12121F] rounded-2xl p-4 border border-[#2A2A40] active:opacity-80"
              >
                <Trophy size={20} color="#F59E0B" />
                <Text className="text-2xl font-bold text-white mt-2">{unlockedAchievements}</Text>
                <Text className="text-gray-500 text-xs">Achievements</Text>
              </Pressable>
            </View>
          </Animated.View>
        )}

        {/* Quick Actions (only if character exists) */}
        {character && (
          <Animated.View entering={FadeInUp.duration(600).delay(600)} className="mt-4">
            <View className="flex-row gap-3">
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push('/world-map' as never);
                }}
                className="flex-1 bg-[#1A1A2E] rounded-xl py-3 items-center flex-row justify-center active:opacity-80"
              >
                <Map size={16} color="#00E5FF" />
                <Text className="text-gray-300 text-sm ml-2">Map</Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push('/npcs' as never);
                }}
                className="flex-1 bg-[#1A1A2E] rounded-xl py-3 items-center flex-row justify-center active:opacity-80"
              >
                <Users size={16} color="#FF3D3D" />
                <Text className="text-gray-300 text-sm ml-2">NPCs</Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push('/journal' as never);
                }}
                className="flex-1 bg-[#1A1A2E] rounded-xl py-3 items-center flex-row justify-center active:opacity-80"
              >
                <BookOpen size={16} color="#A855F7" />
                <Text className="text-gray-300 text-sm ml-2">Journal</Text>
              </Pressable>
            </View>

            <View className="flex-row gap-3 mt-3">
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push('/skills' as never);
                }}
                className="flex-1 bg-[#1A1A2E] rounded-xl py-3 items-center flex-row justify-center active:opacity-80"
              >
                <Zap size={16} color="#F59E0B" />
                <Text className="text-gray-300 text-sm ml-2">Skills</Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push('/daily-challenges' as never);
                }}
                className="flex-1 bg-[#1A1A2E] rounded-xl py-3 items-center flex-row justify-center active:opacity-80"
              >
                <Calendar size={16} color="#10B981" />
                <Text className="text-gray-300 text-sm ml-2">Daily</Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push('/profile-stats' as never);
                }}
                className="flex-1 bg-[#1A1A2E] rounded-xl py-3 items-center flex-row justify-center active:opacity-80"
              >
                <BarChart3 size={16} color="#00E5FF" />
                <Text className="text-gray-300 text-sm ml-2">Stats</Text>
              </Pressable>
            </View>

            <View className="flex-row gap-3 mt-3">
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push('/era-select' as never);
                }}
                className="flex-1 bg-[#1A1A2E] rounded-xl py-3 items-center flex-row justify-center active:opacity-80"
              >
                <Clock size={16} color="#EC4899" />
                <Text className="text-gray-300 text-sm ml-2">Eras</Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push('/settings' as never);
                }}
                className="flex-1 bg-[#1A1A2E] rounded-xl py-3 items-center flex-row justify-center active:opacity-80"
              >
                <Settings size={16} color="#666" />
                <Text className="text-gray-300 text-sm ml-2">Settings</Text>
              </Pressable>
            </View>
          </Animated.View>
        )}

        {/* Action Buttons */}
        <Animated.View entering={FadeInUp.duration(600).delay(700)} className="mt-6">
          {/* Main CTA */}
          <AnimatedPressable
            onPress={handleStartAdventure}
            className="active:scale-95"
            style={{ transform: [{ scale: 1 }] }}
          >
            <LinearGradient
              colors={['#FF3D3D', '#FF6B35']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ borderRadius: 20, padding: 1 }}
            >
              <View className="bg-transparent rounded-[19px] py-5 flex-row items-center justify-center">
                <Play size={24} color="#fff" fill="#fff" />
                <Text className="text-white text-lg font-bold ml-3">
                  {character ? 'Continue Adventure' : 'Create Your Hero'}
                </Text>
              </View>
            </LinearGradient>
          </AnimatedPressable>

          {/* Secondary action if character exists */}
          {character && (
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                useGameStore.getState().clearCharacter();
              }}
              className="mt-4 py-3"
            >
              <Text className="text-gray-500 text-center text-sm">
                Start Fresh with New Character
              </Text>
            </Pressable>
          )}

          {/* Tagline */}
          <Text className="text-gray-600 text-center text-xs mt-6">
            Powered by AI Game Master
          </Text>
        </Animated.View>
      </ScrollView>
    </View>
  );
}
