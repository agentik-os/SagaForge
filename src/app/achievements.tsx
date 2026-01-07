import { View, Text, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeInUp, SlideInRight } from 'react-native-reanimated';
import {
  X,
  Trophy,
  Lock,
  Footprints,
  Dices,
  Skull,
  Users,
  Heart,
  Package,
  Eye,
  Shield,
  Crown,
  HelpCircle,
} from 'lucide-react-native';
import { useAchievements, type Achievement } from '@/lib/gameStore';
import { cn } from '@/lib/cn';

const ACHIEVEMENT_ICONS: Record<string, typeof Trophy> = {
  footprints: Footprints,
  dices: Dices,
  skull: Skull,
  users: Users,
  heart: Heart,
  package: Package,
  trophy: Trophy,
  eye: Eye,
  shield: Shield,
  crown: Crown,
};

export default function AchievementsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const achievements = useAchievements();

  const unlockedAchievements = achievements.filter((a) => a.unlockedAt);
  const lockedAchievements = achievements.filter((a) => !a.unlockedAt && !a.secret);
  const secretAchievements = achievements.filter((a) => !a.unlockedAt && a.secret);

  const totalUnlocked = unlockedAchievements.length;
  const totalAchievements = achievements.length;
  const progressPercent = (totalUnlocked / totalAchievements) * 100;

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
          <Trophy size={24} color="#F59E0B" />
          <Text className="text-xl font-bold text-white ml-2">Achievements</Text>
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
        {/* Progress Card */}
        <Animated.View entering={FadeIn.duration(400)} className="mb-6">
          <View className="bg-[#12121F] rounded-2xl p-4 border border-[#2A2A40]">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-white font-bold">Progress</Text>
              <Text className="text-[#F59E0B] font-bold">
                {totalUnlocked}/{totalAchievements}
              </Text>
            </View>
            <View className="h-3 bg-[#1A1A2E] rounded-full overflow-hidden">
              <LinearGradient
                colors={['#F59E0B', '#EF4444']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  height: '100%',
                  width: `${progressPercent}%`,
                  borderRadius: 999,
                }}
              />
            </View>
            <Text className="text-gray-500 text-xs text-center mt-2">
              {Math.round(progressPercent)}% Complete
            </Text>
          </View>
        </Animated.View>

        {/* Unlocked Achievements */}
        {unlockedAchievements.length > 0 && (
          <Animated.View entering={FadeInUp.duration(400)} className="mb-6">
            <Text className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-3">
              Unlocked ({unlockedAchievements.length})
            </Text>
            <View className="gap-3">
              {unlockedAchievements.map((achievement, index) => (
                <AchievementCard
                  key={achievement.id}
                  achievement={achievement}
                  index={index}
                  unlocked
                />
              ))}
            </View>
          </Animated.View>
        )}

        {/* Locked Achievements */}
        {lockedAchievements.length > 0 && (
          <Animated.View entering={FadeInUp.duration(400).delay(100)} className="mb-6">
            <Text className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-3">
              Locked ({lockedAchievements.length})
            </Text>
            <View className="gap-3">
              {lockedAchievements.map((achievement, index) => (
                <AchievementCard
                  key={achievement.id}
                  achievement={achievement}
                  index={index}
                  unlocked={false}
                />
              ))}
            </View>
          </Animated.View>
        )}

        {/* Secret Achievements */}
        {secretAchievements.length > 0 && (
          <Animated.View entering={FadeInUp.duration(400).delay(200)} className="mb-6">
            <Text className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-3">
              Secret ({secretAchievements.length})
            </Text>
            <View className="gap-3">
              {secretAchievements.map((_, index) => (
                <SecretAchievementCard key={index} index={index} />
              ))}
            </View>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

function AchievementCard({
  achievement,
  index,
  unlocked,
}: {
  achievement: Achievement;
  index: number;
  unlocked: boolean;
}) {
  const Icon = ACHIEVEMENT_ICONS[achievement.icon] || HelpCircle;
  const unlockedDate = achievement.unlockedAt
    ? new Date(achievement.unlockedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    : null;

  return (
    <Animated.View entering={SlideInRight.duration(400).delay(index * 60)}>
      <View
        className={cn(
          'bg-[#12121F] rounded-2xl p-4 border flex-row items-center',
          unlocked ? 'border-[#F59E0B]/30' : 'border-[#2A2A40]'
        )}
      >
        {/* Icon */}
        <View
          className={cn(
            'w-14 h-14 rounded-2xl items-center justify-center mr-3',
            unlocked ? 'bg-[#F59E0B]/20' : 'bg-[#1A1A2E]'
          )}
        >
          {unlocked ? (
            <Icon size={28} color="#F59E0B" />
          ) : (
            <Lock size={24} color="#666" />
          )}
        </View>

        {/* Info */}
        <View className="flex-1">
          <Text className={cn('font-bold', unlocked ? 'text-white' : 'text-gray-500')}>
            {achievement.title}
          </Text>
          <Text className={cn('text-sm mt-0.5', unlocked ? 'text-gray-400' : 'text-gray-600')}>
            {achievement.description}
          </Text>
          {unlockedDate && (
            <Text className="text-[#F59E0B] text-xs mt-1">Unlocked {unlockedDate}</Text>
          )}
        </View>

        {/* Badge */}
        {unlocked && (
          <View className="bg-[#F59E0B]/20 p-2 rounded-full">
            <Trophy size={16} color="#F59E0B" />
          </View>
        )}
      </View>
    </Animated.View>
  );
}

function SecretAchievementCard({ index }: { index: number }) {
  return (
    <Animated.View entering={SlideInRight.duration(400).delay(index * 60)}>
      <View className="bg-[#12121F] rounded-2xl p-4 border border-[#2A2A40] flex-row items-center opacity-60">
        <View className="w-14 h-14 rounded-2xl bg-[#1A1A2E] items-center justify-center mr-3">
          <HelpCircle size={28} color="#666" />
        </View>
        <View className="flex-1">
          <Text className="font-bold text-gray-500">???</Text>
          <Text className="text-sm text-gray-600 mt-0.5">Secret Achievement</Text>
        </View>
        <Lock size={16} color="#666" />
      </View>
    </Animated.View>
  );
}
