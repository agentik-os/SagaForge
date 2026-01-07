import { View, Text, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeInUp, SlideInRight } from 'react-native-reanimated';
import {
  X,
  Clock,
  Lock,
  Check,
  ChevronRight,
  Tv,
  Crown,
  Landmark,
  Cpu,
  Columns,
  Rocket,
  Crosshair,
  Swords,
  Radiation,
  Ship,
  Cigarette,
  Eye,
  Sparkles,
} from 'lucide-react-native';
import {
  useUnlockedEras,
  useCharacter,
  useGameStore,
  ERAS,
  type Era,
} from '@/lib/gameStore';
import { cn } from '@/lib/cn';

const ERA_ICONS: Record<string, typeof Tv> = {
  tv: Tv,
  crown: Crown,
  landmark: Landmark,
  cpu: Cpu,
  columns: Columns,
  rocket: Rocket,
  gun: Crosshair,
  swords: Swords,
  radiation: Radiation,
  ship: Ship,
  cigarette: Cigarette,
  eye: Eye,
};

export default function EraSelectScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const character = useCharacter();
  const unlockedEras = useUnlockedEras();
  const setCurrentEra = useGameStore((s) => s.setCurrentEra);

  const handleSelectEra = (era: Era) => {
    if (!unlockedEras.includes(era)) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setCurrentEra(era);
    router.back();
  };

  const eraList = Object.values(ERAS);
  const unlockedCount = unlockedEras.length;

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
          <Clock size={24} color="#F59E0B" />
          <Text className="text-xl font-bold text-white ml-2">Story Paths</Text>
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

      {/* Progress */}
      <Animated.View entering={FadeIn.duration(400)} className="px-4 mb-4">
        <View className="bg-[#12121F] rounded-xl p-4 border border-[#2A2A40]">
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-400">Eras Unlocked</Text>
            <Text className="text-white font-bold">{unlockedCount}/{eraList.length}</Text>
          </View>
          <View className="h-2 bg-[#1A1A2E] rounded-full overflow-hidden">
            <View
              className="h-full bg-[#F59E0B] rounded-full"
              style={{ width: `${(unlockedCount / eraList.length) * 100}%` }}
            />
          </View>
          <Text className="text-gray-500 text-xs mt-2 text-center">
            Complete main quests to unlock new eras
          </Text>
        </View>
      </Animated.View>

      {/* Current Era */}
      {character && (
        <Animated.View entering={FadeInUp.duration(400).delay(100)} className="px-4 mb-4">
          <Text className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-2">
            Current Era
          </Text>
          <View
            className="rounded-xl p-4 border-2"
            style={{
              backgroundColor: `${ERAS[character.currentEra].color}15`,
              borderColor: ERAS[character.currentEra].color,
            }}
          >
            <View className="flex-row items-center">
              {(() => {
                const IconComponent = ERA_ICONS[ERAS[character.currentEra].icon] || Sparkles;
                return <IconComponent size={24} color={ERAS[character.currentEra].color} />;
              })()}
              <View className="ml-3 flex-1">
                <Text className="text-white font-bold text-lg">{ERAS[character.currentEra].name}</Text>
                <Text className="text-gray-400 text-sm">{ERAS[character.currentEra].year}</Text>
              </View>
              <Check size={24} color={ERAS[character.currentEra].color} />
            </View>
          </View>
        </Animated.View>
      )}

      {/* Era List */}
      <ScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
      >
        <Text className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-3">
          All Story Paths
        </Text>

        <View className="gap-3">
          {eraList.map((era, index) => {
            const isUnlocked = unlockedEras.includes(era.id);
            const isCurrent = character?.currentEra === era.id;
            const IconComponent = ERA_ICONS[era.icon] || Sparkles;

            return (
              <Animated.View
                key={era.id}
                entering={SlideInRight.duration(400).delay(index * 50)}
              >
                <Pressable
                  onPress={() => handleSelectEra(era.id)}
                  disabled={!isUnlocked}
                  className="active:scale-[0.98]"
                >
                  <View
                    className={cn(
                      'rounded-2xl p-4 border',
                      isCurrent
                        ? 'border-2'
                        : isUnlocked
                        ? 'border-[#2A2A40]'
                        : 'border-[#1A1A2E]'
                    )}
                    style={{
                      backgroundColor: isUnlocked ? '#12121F' : '#0D0D14',
                      borderColor: isCurrent ? era.color : undefined,
                    }}
                  >
                    <View className="flex-row items-center">
                      <View
                        className="w-14 h-14 rounded-xl items-center justify-center mr-4"
                        style={{
                          backgroundColor: isUnlocked ? `${era.color}20` : '#1A1A2E',
                        }}
                      >
                        {isUnlocked ? (
                          <IconComponent size={28} color={era.color} />
                        ) : (
                          <Lock size={24} color="#444" />
                        )}
                      </View>

                      <View className="flex-1">
                        <View className="flex-row items-center mb-1">
                          <Text
                            className={cn(
                              'font-bold text-base',
                              isUnlocked ? 'text-white' : 'text-gray-600'
                            )}
                          >
                            {era.name}
                          </Text>
                          {isCurrent && (
                            <View
                              className="ml-2 px-2 py-0.5 rounded-full"
                              style={{ backgroundColor: `${era.color}30` }}
                            >
                              <Text style={{ color: era.color }} className="text-xs font-bold">
                                ACTIVE
                              </Text>
                            </View>
                          )}
                        </View>
                        <Text className={cn('text-sm', isUnlocked ? 'text-gray-400' : 'text-gray-700')}>
                          {era.year} • {era.tagline}
                        </Text>
                        {isUnlocked && (
                          <Text className="text-gray-500 text-xs mt-1" numberOfLines={2}>
                            {era.description}
                          </Text>
                        )}
                      </View>

                      {isUnlocked && !isCurrent && (
                        <ChevronRight size={20} color="#666" />
                      )}
                    </View>

                    {/* Atmosphere tags */}
                    {isUnlocked && (
                      <View className="flex-row flex-wrap gap-2 mt-3 pt-3 border-t border-[#2A2A40]">
                        {era.atmosphere.split(', ').slice(0, 3).map((tag) => (
                          <View
                            key={tag}
                            className="px-2 py-1 rounded-full"
                            style={{ backgroundColor: `${era.color}15` }}
                          >
                            <Text style={{ color: era.color }} className="text-xs">
                              {tag}
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                </Pressable>
              </Animated.View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}
