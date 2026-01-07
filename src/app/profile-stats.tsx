import { View, Text, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeInUp, SlideInRight } from 'react-native-reanimated';
import {
  X,
  BarChart3,
  Clock,
  Dices,
  Target,
  Sparkles,
  Skull,
  Trophy,
  AlertTriangle,
  Users,
  Package,
  MapPin,
  MessageSquare,
  BookOpen,
  Zap,
  Crown,
} from 'lucide-react-native';
import {
  usePlayerStats,
  useCharacter,
  useAchievements,
  useQuests,
  useInventory,
  useLocations,
  useNPCs,
  ARCHETYPES,
} from '@/lib/gameStore';

interface StatItemProps {
  icon: typeof Clock;
  label: string;
  value: string | number;
  color: string;
  index: number;
}

function StatItem({ icon: Icon, label, value, color, index }: StatItemProps) {
  return (
    <Animated.View
      entering={SlideInRight.duration(400).delay(index * 50)}
      className="flex-row items-center bg-[#12121F] rounded-xl p-3 border border-[#2A2A40]"
    >
      <View
        className="w-10 h-10 rounded-lg items-center justify-center mr-3"
        style={{ backgroundColor: `${color}20` }}
      >
        <Icon size={20} color={color} />
      </View>
      <View className="flex-1">
        <Text className="text-gray-500 text-xs">{label}</Text>
        <Text className="text-white font-bold text-lg">{value}</Text>
      </View>
    </Animated.View>
  );
}

export default function ProfileStatsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const character = useCharacter();
  const stats = usePlayerStats();
  const achievements = useAchievements();
  const quests = useQuests();
  const inventory = useInventory();
  const locations = useLocations();
  const npcs = useNPCs();

  const archetypeInfo = character ? ARCHETYPES[character.archetype] : null;
  const unlockedAchievements = achievements.filter((a) => a.unlockedAt).length;
  const completedQuests = quests.filter((q) => q.status === 'completed').length;
  const totalItems = inventory.reduce((sum, i) => sum + i.quantity, 0);
  const discoveredLocations = locations.filter((l) => l.discovered).length;
  const metNPCs = npcs.filter((n) => n.met).length;

  const formatPlayTime = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const successRate = stats.diceRolled > 0
    ? Math.round((stats.criticalSuccesses / stats.diceRolled) * 100)
    : 0;

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
          <BarChart3 size={24} color="#00E5FF" />
          <Text className="text-xl font-bold text-white ml-2">Statistics</Text>
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
        {/* Character Summary */}
        {character && (
          <Animated.View entering={FadeIn.duration(400)} className="mb-6">
            <LinearGradient
              colors={['#FF3D3D20', '#FF3D3D05']}
              style={{ borderRadius: 20, padding: 1 }}
            >
              <View className="bg-[#12121F] rounded-[19px] p-4">
                <View className="flex-row items-center mb-4">
                  <View className="w-16 h-16 rounded-2xl bg-[#FF3D3D]/20 items-center justify-center mr-4">
                    <Crown size={32} color="#FF3D3D" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-white text-xl font-bold">{character.name}</Text>
                    <Text className="text-[#00E5FF] text-sm">{archetypeInfo?.title}</Text>
                    <View className="flex-row items-center mt-1">
                      <View className="bg-[#00E5FF]/20 px-2 py-0.5 rounded-full mr-2">
                        <Text className="text-[#00E5FF] text-xs font-bold">Lv.{character.level}</Text>
                      </View>
                      <Text className="text-gray-500 text-xs">{character.experience} XP</Text>
                    </View>
                  </View>
                </View>

                {/* Quick Stats Row */}
                <View className="flex-row justify-between">
                  <View className="items-center">
                    <Text className="text-2xl font-bold text-[#F59E0B]">{character.gold}</Text>
                    <Text className="text-gray-500 text-xs">Gold</Text>
                  </View>
                  <View className="items-center">
                    <Text className="text-2xl font-bold text-[#10B981]">{completedQuests}</Text>
                    <Text className="text-gray-500 text-xs">Quests</Text>
                  </View>
                  <View className="items-center">
                    <Text className="text-2xl font-bold text-[#A855F7]">{totalItems}</Text>
                    <Text className="text-gray-500 text-xs">Items</Text>
                  </View>
                  <View className="items-center">
                    <Text className="text-2xl font-bold text-[#00E5FF]">{unlockedAchievements}</Text>
                    <Text className="text-gray-500 text-xs">Achievements</Text>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>
        )}

        {/* Session Stats */}
        <Animated.View entering={FadeInUp.duration(400).delay(100)} className="mb-6">
          <Text className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-3">
            Session Stats
          </Text>
          <View className="gap-2">
            <StatItem
              icon={Clock}
              label="Total Play Time"
              value={formatPlayTime(stats.totalPlayTime)}
              color="#00E5FF"
              index={0}
            />
            <StatItem
              icon={Zap}
              label="Sessions Played"
              value={stats.sessionsPlayed}
              color="#F59E0B"
              index={1}
            />
            <StatItem
              icon={MessageSquare}
              label="Choices Made"
              value={stats.choicesMade}
              color="#A855F7"
              index={2}
            />
            <StatItem
              icon={BookOpen}
              label="Words Read"
              value={stats.wordsRead.toLocaleString()}
              color="#10B981"
              index={3}
            />
          </View>
        </Animated.View>

        {/* Dice Stats */}
        <Animated.View entering={FadeInUp.duration(400).delay(200)} className="mb-6">
          <Text className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-3">
            Dice Statistics
          </Text>
          <View className="gap-2">
            <StatItem
              icon={Dices}
              label="Total Dice Rolled"
              value={stats.diceRolled}
              color="#F59E0B"
              index={0}
            />
            <StatItem
              icon={Sparkles}
              label="Critical Successes (Nat 20)"
              value={stats.criticalSuccesses}
              color="#10B981"
              index={1}
            />
            <StatItem
              icon={Skull}
              label="Critical Failures (Nat 1)"
              value={stats.criticalFailures}
              color="#EF4444"
              index={2}
            />
            <StatItem
              icon={Target}
              label="Crit Success Rate"
              value={`${successRate}%`}
              color="#00E5FF"
              index={3}
            />
          </View>
        </Animated.View>

        {/* Progress Stats */}
        <Animated.View entering={FadeInUp.duration(400).delay(300)} className="mb-6">
          <Text className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-3">
            Progress
          </Text>
          <View className="gap-2">
            <StatItem
              icon={Trophy}
              label="Quests Completed"
              value={stats.questsCompleted}
              color="#10B981"
              index={0}
            />
            <StatItem
              icon={AlertTriangle}
              label="Quests Failed"
              value={stats.questsFailed}
              color="#EF4444"
              index={1}
            />
            <StatItem
              icon={Users}
              label="NPCs Met"
              value={`${metNPCs}/${npcs.length}`}
              color="#A855F7"
              index={2}
            />
            <StatItem
              icon={MapPin}
              label="Locations Discovered"
              value={`${discoveredLocations}/${locations.length}`}
              color="#00E5FF"
              index={3}
            />
            <StatItem
              icon={Package}
              label="Items Collected"
              value={stats.itemsCollected}
              color="#F59E0B"
              index={4}
            />
          </View>
        </Animated.View>

        {/* Achievement Progress */}
        <Animated.View entering={FadeInUp.duration(400).delay(400)}>
          <Text className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-3">
            Achievements Progress
          </Text>
          <View className="bg-[#12121F] rounded-2xl p-4 border border-[#2A2A40]">
            <View className="flex-row justify-between mb-2">
              <Text className="text-gray-400">Unlocked</Text>
              <Text className="text-white font-bold">
                {unlockedAchievements}/{achievements.length}
              </Text>
            </View>
            <View className="h-3 bg-[#1A1A2E] rounded-full overflow-hidden mb-3">
              <View
                className="h-full bg-[#F59E0B] rounded-full"
                style={{
                  width: `${(unlockedAchievements / achievements.length) * 100}%`,
                }}
              />
            </View>
            <Text className="text-gray-500 text-xs text-center">
              {achievements.length - unlockedAchievements} achievements remaining
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}
