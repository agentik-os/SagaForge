import { useEffect } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Animated, {
  FadeIn,
  FadeInUp,
  SlideInRight,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import {
  X,
  Calendar,
  Dices,
  Compass,
  MessageCircle,
  Sword,
  Scroll,
  Clock,
  Gift,
  CheckCircle2,
  Coins,
  Star,
  RefreshCw,
} from 'lucide-react-native';
import {
  useDailyChallenges,
  useGameStore,
  useCharacter,
  type DailyChallenge,
} from '@/lib/gameStore';
import { cn } from '@/lib/cn';

const CHALLENGE_ICONS: Record<string, typeof Dices> = {
  dice: Dices,
  explore: Compass,
  social: MessageCircle,
  combat: Sword,
  story: Scroll,
};

const CHALLENGE_COLORS: Record<string, string> = {
  dice: '#F59E0B',
  explore: '#10B981',
  social: '#A855F7',
  combat: '#EF4444',
  story: '#00E5FF',
};

export default function DailyChallengesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const character = useCharacter();
  const challenges = useDailyChallenges();
  const generateDailyChallenges = useGameStore((s) => s.generateDailyChallenges);

  // Generate challenges if none exist or expired
  useEffect(() => {
    if (challenges.length === 0 || challenges.every((c) => c.expiresAt < Date.now())) {
      generateDailyChallenges();
    }
  }, []);

  // Pulsing animation for active challenges
  const pulseScale = useSharedValue(1);
  pulseScale.value = withRepeat(
    withSequence(
      withTiming(1.02, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
    ),
    -1,
    false
  );

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const completedCount = challenges.filter((c) => c.completed).length;
  const totalRewardXP = challenges.reduce((sum, c) => sum + c.reward.xp, 0);
  const earnedXP = challenges.filter((c) => c.completed).reduce((sum, c) => sum + c.reward.xp, 0);

  const getTimeRemaining = () => {
    if (challenges.length === 0) return 'Loading...';
    const expiresAt = challenges[0]?.expiresAt;
    if (!expiresAt) return 'Loading...';
    const now = Date.now();
    const remaining = expiresAt - now;
    if (remaining <= 0) return 'Expired';
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const handleRefresh = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    generateDailyChallenges();
  };

  return (
    <View className="flex-1 bg-[#0A0A14]">
      <LinearGradient
        colors={['#1A1025', '#0A0A14', '#0D0D1A']}
        style={{ position: 'absolute', width: '100%', height: '100%' }}
      />

      {/* Header */}
      <View
        className="flex-row items-center justify-between px-4 pb-4"
        style={{ paddingTop: insets.top + 8 }}
      >
        <View className="flex-row items-center">
          <Calendar size={24} color="#F59E0B" />
          <Text className="text-xl font-bold text-white ml-2">Daily Challenges</Text>
        </View>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
          className="w-10 h-10 rounded-full bg-[#1A1A2E] items-center justify-center"
        >
          <X size={20} color="#fff" />
        </Pressable>
      </View>

      <ScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
      >
        {/* Summary Card */}
        <Animated.View entering={FadeIn.duration(400)} className="mb-6">
          <LinearGradient
            colors={['#F59E0B20', '#F59E0B05']}
            style={{ borderRadius: 20, padding: 1 }}
          >
            <View className="bg-[#12121F] rounded-[19px] p-4">
              <View className="flex-row items-center justify-between mb-4">
                <View>
                  <Text className="text-[#F59E0B] text-lg font-bold">Today's Progress</Text>
                  <View className="flex-row items-center mt-1">
                    <Clock size={14} color="#666" />
                    <Text className="text-gray-500 text-sm ml-1">Resets in {getTimeRemaining()}</Text>
                  </View>
                </View>
                <Pressable
                  onPress={handleRefresh}
                  className="w-10 h-10 rounded-full bg-[#1A1A2E] items-center justify-center"
                >
                  <RefreshCw size={18} color="#F59E0B" />
                </Pressable>
              </View>

              {/* Progress Bar */}
              <View className="mb-3">
                <View className="flex-row justify-between mb-1">
                  <Text className="text-gray-400 text-sm">Challenges Completed</Text>
                  <Text className="text-white font-bold">
                    {completedCount}/{challenges.length}
                  </Text>
                </View>
                <View className="h-3 bg-[#1A1A2E] rounded-full overflow-hidden">
                  <View
                    className="h-full bg-[#F59E0B] rounded-full"
                    style={{
                      width: challenges.length > 0 ? `${(completedCount / challenges.length) * 100}%` : '0%',
                    }}
                  />
                </View>
              </View>

              {/* Rewards Summary */}
              <View className="flex-row justify-between">
                <View className="flex-row items-center">
                  <Star size={16} color="#F59E0B" />
                  <Text className="text-gray-400 text-sm ml-1">XP Earned:</Text>
                  <Text className="text-[#F59E0B] font-bold ml-1">{earnedXP}</Text>
                  <Text className="text-gray-500 text-sm">/{totalRewardXP}</Text>
                </View>
                {character && (
                  <View className="flex-row items-center">
                    <Coins size={16} color="#F59E0B" />
                    <Text className="text-[#F59E0B] font-bold ml-1">{character.gold}</Text>
                    <Text className="text-gray-500 text-sm ml-1">gold</Text>
                  </View>
                )}
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Challenges List */}
        <Text className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-3">
          Today's Challenges
        </Text>

        {challenges.length === 0 ? (
          <Animated.View entering={FadeIn.duration(400)} className="items-center py-12">
            <Calendar size={48} color="#2A2A40" />
            <Text className="text-gray-500 text-center mt-4">
              Loading daily challenges...
            </Text>
          </Animated.View>
        ) : (
          <View className="gap-3">
            {challenges.map((challenge, index) => (
              <ChallengeCard key={challenge.id} challenge={challenge} index={index} />
            ))}
          </View>
        )}

        {/* All Completed Bonus */}
        {completedCount === challenges.length && challenges.length > 0 && (
          <Animated.View entering={FadeInUp.duration(400)} className="mt-6">
            <LinearGradient
              colors={['#10B981', '#059669']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ borderRadius: 16 }}
            >
              <View className="p-4 flex-row items-center justify-center">
                <Gift size={24} color="#fff" />
                <Text className="text-white font-bold text-lg ml-2">
                  All Challenges Completed!
                </Text>
              </View>
            </LinearGradient>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

function ChallengeCard({ challenge, index }: { challenge: DailyChallenge; index: number }) {
  const IconComponent = CHALLENGE_ICONS[challenge.type] || Scroll;
  const color = CHALLENGE_COLORS[challenge.type] || '#F59E0B';
  const progress = Math.min((challenge.progress / challenge.target) * 100, 100);

  return (
    <Animated.View entering={SlideInRight.duration(400).delay(index * 80)}>
      <View
        className={cn(
          'bg-[#12121F] rounded-2xl p-4 border',
          challenge.completed ? 'border-[#10B981]' : 'border-[#2A2A40]'
        )}
      >
        {/* Header */}
        <View className="flex-row items-start justify-between mb-3">
          <View className="flex-row items-center flex-1">
            <View
              className="w-12 h-12 rounded-xl items-center justify-center mr-3"
              style={{
                backgroundColor: challenge.completed ? '#10B98120' : `${color}20`,
              }}
            >
              {challenge.completed ? (
                <CheckCircle2 size={24} color="#10B981" />
              ) : (
                <IconComponent size={24} color={color} />
              )}
            </View>
            <View className="flex-1">
              <Text
                className={cn(
                  'font-bold text-base',
                  challenge.completed ? 'text-[#10B981]' : 'text-white'
                )}
              >
                {challenge.title}
              </Text>
              <Text className="text-gray-500 text-sm">{challenge.description}</Text>
            </View>
          </View>
        </View>

        {/* Progress */}
        <View className="mb-3">
          <View className="flex-row justify-between mb-1">
            <Text className="text-gray-500 text-xs">Progress</Text>
            <Text className="text-gray-400 text-xs font-bold">
              {Math.min(challenge.progress, challenge.target)}/{challenge.target}
            </Text>
          </View>
          <View className="h-2 bg-[#1A1A2E] rounded-full overflow-hidden">
            <View
              className="h-full rounded-full"
              style={{
                width: `${progress}%`,
                backgroundColor: challenge.completed ? '#10B981' : color,
              }}
            />
          </View>
        </View>

        {/* Rewards */}
        <View className="flex-row items-center justify-between pt-3 border-t border-[#2A2A40]">
          <View className="flex-row items-center">
            <Gift size={14} color={challenge.completed ? '#10B981' : '#666'} />
            <Text
              className={cn(
                'text-xs ml-1',
                challenge.completed ? 'text-[#10B981]' : 'text-gray-500'
              )}
            >
              Rewards:
            </Text>
          </View>
          <View className="flex-row items-center gap-3">
            <View className="flex-row items-center">
              <Star size={14} color={challenge.completed ? '#10B981' : '#F59E0B'} />
              <Text
                className={cn(
                  'text-sm font-bold ml-1',
                  challenge.completed ? 'text-[#10B981]' : 'text-[#F59E0B]'
                )}
              >
                {challenge.reward.xp} XP
              </Text>
            </View>
            {challenge.reward.gold && (
              <View className="flex-row items-center">
                <Coins size={14} color={challenge.completed ? '#10B981' : '#F59E0B'} />
                <Text
                  className={cn(
                    'text-sm font-bold ml-1',
                    challenge.completed ? 'text-[#10B981]' : 'text-[#F59E0B]'
                  )}
                >
                  {challenge.reward.gold}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </Animated.View>
  );
}
