import { View, Text, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeInUp, SlideInRight } from 'react-native-reanimated';
import {
  X,
  Target,
  CheckCircle2,
  Circle,
  Clock,
  Star,
  AlertTriangle,
  ChevronRight,
} from 'lucide-react-native';
import { useQuests, type Quest, type QuestStatus, type QuestType } from '@/lib/gameStore';
import { cn } from '@/lib/cn';

const STATUS_CONFIG: Record<QuestStatus, { color: string; icon: typeof CheckCircle2; label: string }> = {
  active: { color: '#00E5FF', icon: Clock, label: 'In Progress' },
  completed: { color: '#10B981', icon: CheckCircle2, label: 'Completed' },
  failed: { color: '#EF4444', icon: AlertTriangle, label: 'Failed' },
};

const TYPE_CONFIG: Record<QuestType, { color: string; label: string }> = {
  main: { color: '#FF3D3D', label: 'Main Quest' },
  side: { color: '#A855F7', label: 'Side Quest' },
  personal: { color: '#F59E0B', label: 'Personal' },
  daily: { color: '#10B981', label: 'Daily' },
};

export default function QuestLogScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const quests = useQuests();

  const activeQuests = quests.filter((q) => q.status === 'active');
  const completedQuests = quests.filter((q) => q.status === 'completed');
  const failedQuests = quests.filter((q) => q.status === 'failed');

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
          <Target size={24} color="#FF3D3D" />
          <Text className="text-xl font-bold text-white ml-2">Quest Log</Text>
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
        {quests.length === 0 ? (
          <Animated.View entering={FadeIn.duration(400)} className="items-center py-12">
            <Target size={48} color="#2A2A40" />
            <Text className="text-gray-500 text-center mt-4">
              No quests yet. Your adventure awaits!
            </Text>
          </Animated.View>
        ) : (
          <>
            {/* Active Quests */}
            {activeQuests.length > 0 && (
              <QuestSection title="Active Quests" quests={activeQuests} />
            )}

            {/* Completed Quests */}
            {completedQuests.length > 0 && (
              <QuestSection title="Completed" quests={completedQuests} collapsed />
            )}

            {/* Failed Quests */}
            {failedQuests.length > 0 && (
              <QuestSection title="Failed" quests={failedQuests} collapsed />
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

function QuestSection({
  title,
  quests,
  collapsed = false,
}: {
  title: string;
  quests: Quest[];
  collapsed?: boolean;
}) {
  return (
    <Animated.View entering={FadeInUp.duration(400)} className="mb-6">
      <Text className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-3">
        {title} ({quests.length})
      </Text>

      <View className="gap-3">
        {quests.map((quest, index) => (
          <QuestCard key={quest.id} quest={quest} index={index} />
        ))}
      </View>
    </Animated.View>
  );
}

function QuestCard({ quest, index }: { quest: Quest; index: number }) {
  const statusConfig = STATUS_CONFIG[quest.status];
  const typeConfig = TYPE_CONFIG[quest.type];
  const StatusIcon = statusConfig.icon;

  const completedObjectives = quest.objectives.filter((o) => o.completed).length;
  const totalObjectives = quest.objectives.length;
  const progress = totalObjectives > 0 ? (completedObjectives / totalObjectives) * 100 : 0;

  return (
    <Animated.View entering={SlideInRight.duration(400).delay(index * 80)}>
      <Pressable className="active:scale-[0.98]">
        <View className="bg-[#12121F] rounded-2xl p-4 border border-[#2A2A40]">
          {/* Header */}
          <View className="flex-row items-start justify-between mb-3">
            <View className="flex-1">
              <View className="flex-row items-center mb-1">
                <View
                  className="px-2 py-0.5 rounded-full mr-2"
                  style={{ backgroundColor: `${typeConfig.color}20` }}
                >
                  <Text style={{ color: typeConfig.color }} className="text-xs font-bold">
                    {typeConfig.label}
                  </Text>
                </View>
                <View
                  className="flex-row items-center px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: `${statusConfig.color}20` }}
                >
                  <StatusIcon size={10} color={statusConfig.color} />
                  <Text style={{ color: statusConfig.color }} className="text-xs font-bold ml-1">
                    {statusConfig.label}
                  </Text>
                </View>
              </View>
              <Text className="text-white font-bold text-lg">{quest.title}</Text>
            </View>
            <ChevronRight size={20} color="#666" />
          </View>

          {/* Description */}
          <Text className="text-gray-400 text-sm mb-3" numberOfLines={2}>
            {quest.description}
          </Text>

          {/* Objectives */}
          {quest.status === 'active' && (
            <View className="mb-3">
              {quest.objectives.slice(0, 3).map((objective) => (
                <View key={objective.id} className="flex-row items-center mb-1.5">
                  {objective.completed ? (
                    <CheckCircle2 size={14} color="#10B981" />
                  ) : (
                    <Circle size={14} color="#666" />
                  )}
                  <Text
                    className={cn(
                      'text-sm ml-2 flex-1',
                      objective.completed ? 'text-gray-500 line-through' : 'text-gray-300'
                    )}
                    numberOfLines={1}
                  >
                    {objective.description}
                  </Text>
                </View>
              ))}
              {quest.objectives.length > 3 && (
                <Text className="text-gray-500 text-xs mt-1">
                  +{quest.objectives.length - 3} more objectives
                </Text>
              )}
            </View>
          )}

          {/* Progress Bar */}
          <View>
            <View className="flex-row justify-between mb-1">
              <Text className="text-gray-500 text-xs">Progress</Text>
              <Text className="text-gray-400 text-xs font-bold">
                {completedObjectives}/{totalObjectives}
              </Text>
            </View>
            <View className="h-1.5 bg-[#1A1A2E] rounded-full overflow-hidden">
              <View
                className="h-full rounded-full"
                style={{
                  width: `${progress}%`,
                  backgroundColor: statusConfig.color,
                }}
              />
            </View>
          </View>

          {/* Rewards */}
          {quest.rewards && quest.rewards.length > 0 && quest.status === 'active' && (
            <View className="flex-row items-center mt-3 pt-3 border-t border-[#2A2A40]">
              <Star size={14} color="#F59E0B" />
              <Text className="text-gray-400 text-xs ml-2">
                Rewards: {quest.rewards.join(', ')}
              </Text>
            </View>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}
