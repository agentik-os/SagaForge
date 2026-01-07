import { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeInUp, SlideInRight } from 'react-native-reanimated';
import {
  X,
  Zap,
  Sword,
  Target,
  Shield,
  MessageCircle,
  AlertTriangle,
  EyeOff,
  Ghost,
  Activity,
  Eye,
  Search,
  BookOpen,
  Settings,
  Sparkles,
  Brain,
  Lock,
  ChevronRight,
} from 'lucide-react-native';
import { useSkills, useGameStore, type Skill, type SkillCategory } from '@/lib/gameStore';
import { cn } from '@/lib/cn';

const CATEGORY_CONFIG: Record<SkillCategory, { color: string; label: string; icon: typeof Sword }> = {
  combat: { color: '#EF4444', label: 'Combat', icon: Sword },
  social: { color: '#A855F7', label: 'Social', icon: MessageCircle },
  survival: { color: '#10B981', label: 'Survival', icon: Activity },
  knowledge: { color: '#3B82F6', label: 'Knowledge', icon: BookOpen },
  mystical: { color: '#EC4899', label: 'Mystical', icon: Sparkles },
};

const SKILL_ICONS: Record<string, typeof Sword> = {
  sword: Sword,
  target: Target,
  shield: Shield,
  'message-circle': MessageCircle,
  'alert-triangle': AlertTriangle,
  'eye-off': EyeOff,
  ghost: Ghost,
  activity: Activity,
  eye: Eye,
  search: Search,
  'book-open': BookOpen,
  settings: Settings,
  sparkles: Sparkles,
  brain: Brain,
};

export default function SkillsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const skills = useSkills();
  const addSkillXP = useGameStore((s) => s.addSkillXP);
  const unlockSkill = useGameStore((s) => s.unlockSkill);

  const [activeCategory, setActiveCategory] = useState<SkillCategory | 'all'>('all');
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);

  const filteredSkills = activeCategory === 'all'
    ? skills
    : skills.filter((s) => s.category === activeCategory);

  const groupedSkills = filteredSkills.reduce((acc, skill) => {
    if (!acc[skill.category]) acc[skill.category] = [];
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<SkillCategory, Skill[]>);

  const handleTrainSkill = (skill: Skill) => {
    if (!skill.unlocked) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    addSkillXP(skill.id, 25);
  };

  const handleUnlockSkill = (skill: Skill) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    unlockSkill(skill.id);
  };

  const canUnlockSkill = (skill: Skill): boolean => {
    if (skill.unlocked) return false;
    if (!skill.prerequisiteId) return true;
    const prereq = skills.find((s) => s.id === skill.prerequisiteId);
    return Boolean(prereq?.currentLevel && prereq.currentLevel >= 3);
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
          <Zap size={24} color="#F59E0B" />
          <Text className="text-xl font-bold text-white ml-2">Skills</Text>
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

      {/* Category Filters */}
      <Animated.View entering={FadeIn.duration(400)} className="px-4 mb-4">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
          style={{ flexGrow: 0 }}
        >
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setActiveCategory('all');
            }}
            className={cn(
              'px-4 py-2 rounded-full border',
              activeCategory === 'all'
                ? 'bg-[#F59E0B]/20 border-[#F59E0B]'
                : 'bg-[#1A1A2E] border-[#2A2A40]'
            )}
          >
            <Text
              className={cn(
                'text-sm font-medium',
                activeCategory === 'all' ? 'text-[#F59E0B]' : 'text-gray-400'
              )}
            >
              All Skills
            </Text>
          </Pressable>

          {(Object.keys(CATEGORY_CONFIG) as SkillCategory[]).map((category) => {
            const config = CATEGORY_CONFIG[category];
            const isActive = activeCategory === category;
            return (
              <Pressable
                key={category}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setActiveCategory(category);
                }}
                className={cn(
                  'px-4 py-2 rounded-full border flex-row items-center',
                  isActive ? '' : 'bg-[#1A1A2E] border-[#2A2A40]'
                )}
                style={isActive ? { backgroundColor: `${config.color}20`, borderColor: config.color } : {}}
              >
                <config.icon size={14} color={isActive ? config.color : '#666'} />
                <Text
                  className="text-sm font-medium ml-1.5"
                  style={{ color: isActive ? config.color : '#9CA3AF' }}
                >
                  {config.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </Animated.View>

      <ScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
      >
        {activeCategory === 'all' ? (
          // Grouped view
          Object.entries(groupedSkills).map(([category, categorySkills], categoryIndex) => {
            const config = CATEGORY_CONFIG[category as SkillCategory];
            return (
              <Animated.View
                key={category}
                entering={FadeInUp.duration(400).delay(categoryIndex * 100)}
                className="mb-6"
              >
                <View className="flex-row items-center mb-3">
                  <config.icon size={16} color={config.color} />
                  <Text
                    className="text-sm font-bold uppercase tracking-wider ml-2"
                    style={{ color: config.color }}
                  >
                    {config.label}
                  </Text>
                </View>

                <View className="gap-3">
                  {categorySkills.map((skill, index) => (
                    <SkillCard
                      key={skill.id}
                      skill={skill}
                      index={index}
                      onTrain={() => handleTrainSkill(skill)}
                      onUnlock={() => handleUnlockSkill(skill)}
                      canUnlock={canUnlockSkill(skill)}
                      skills={skills}
                    />
                  ))}
                </View>
              </Animated.View>
            );
          })
        ) : (
          // Flat view for single category
          <View className="gap-3">
            {filteredSkills.map((skill, index) => (
              <SkillCard
                key={skill.id}
                skill={skill}
                index={index}
                onTrain={() => handleTrainSkill(skill)}
                onUnlock={() => handleUnlockSkill(skill)}
                canUnlock={canUnlockSkill(skill)}
                skills={skills}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function SkillCard({
  skill,
  index,
  onTrain,
  onUnlock,
  canUnlock,
  skills,
}: {
  skill: Skill;
  index: number;
  onTrain: () => void;
  onUnlock: () => void;
  canUnlock: boolean;
  skills: Skill[];
}) {
  const config = CATEGORY_CONFIG[skill.category];
  const IconComponent = SKILL_ICONS[skill.icon] || Zap;
  const progress = skill.unlocked ? (skill.xpCurrent / skill.xpRequired) * 100 : 0;
  const prereqSkill = skill.prerequisiteId ? skills.find((s) => s.id === skill.prerequisiteId) : null;

  return (
    <Animated.View entering={SlideInRight.duration(400).delay(index * 50)}>
      <View
        className={cn(
          'bg-[#12121F] rounded-2xl p-4 border border-[#2A2A40]',
          !skill.unlocked && 'opacity-60'
        )}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center flex-1">
            <View
              className="w-12 h-12 rounded-xl items-center justify-center mr-3"
              style={{ backgroundColor: skill.unlocked ? `${config.color}20` : '#1A1A2E' }}
            >
              {skill.unlocked ? (
                <IconComponent size={24} color={config.color} />
              ) : (
                <Lock size={20} color="#666" />
              )}
            </View>
            <View className="flex-1">
              <Text className="text-white font-bold text-base">{skill.name}</Text>
              <Text className="text-gray-500 text-xs">{skill.description}</Text>
            </View>
          </View>

          {skill.unlocked && (
            <View className="items-center">
              <Text className="text-2xl font-bold" style={{ color: config.color }}>
                {skill.currentLevel}
              </Text>
              <Text className="text-gray-500 text-xs">/ {skill.maxLevel}</Text>
            </View>
          )}
        </View>

        {/* Progress or Unlock */}
        {skill.unlocked ? (
          <>
            {/* XP Progress */}
            <View className="mb-3">
              <View className="flex-row justify-between mb-1">
                <Text className="text-gray-500 text-xs">Experience</Text>
                <Text className="text-gray-400 text-xs">
                  {skill.xpCurrent} / {skill.xpRequired} XP
                </Text>
              </View>
              <View className="h-2 bg-[#1A1A2E] rounded-full overflow-hidden">
                <View
                  className="h-full rounded-full"
                  style={{
                    width: `${progress}%`,
                    backgroundColor: config.color,
                  }}
                />
              </View>
            </View>

            {/* Level indicators */}
            <View className="flex-row gap-1 mb-3">
              {Array.from({ length: skill.maxLevel }).map((_, i) => (
                <View
                  key={i}
                  className="flex-1 h-1.5 rounded-full"
                  style={{
                    backgroundColor: i < skill.currentLevel ? config.color : '#2A2A40',
                  }}
                />
              ))}
            </View>

            {/* Train Button */}
            {skill.currentLevel < skill.maxLevel && (
              <Pressable
                onPress={onTrain}
                className="py-2 rounded-xl items-center"
                style={{ backgroundColor: `${config.color}20` }}
              >
                <Text style={{ color: config.color }} className="font-bold text-sm">
                  Train (+25 XP)
                </Text>
              </Pressable>
            )}

            {skill.currentLevel >= skill.maxLevel && (
              <View className="py-2 rounded-xl items-center bg-[#10B981]/20">
                <Text className="text-[#10B981] font-bold text-sm">Mastered!</Text>
              </View>
            )}
          </>
        ) : (
          <>
            {/* Prerequisite info */}
            {prereqSkill && (
              <View className="mb-3 p-3 bg-[#1A1A2E] rounded-xl">
                <Text className="text-gray-500 text-xs mb-1">Requires:</Text>
                <Text className="text-gray-400 text-sm">
                  {prereqSkill.name} Level 3+
                  {prereqSkill.currentLevel >= 3 && (
                    <Text className="text-[#10B981]"> (Met!)</Text>
                  )}
                </Text>
              </View>
            )}

            {/* Unlock Button */}
            <Pressable
              onPress={onUnlock}
              disabled={!canUnlock}
              className={cn(
                'py-3 rounded-xl items-center',
                canUnlock ? 'bg-[#F59E0B]/20' : 'bg-[#1A1A2E]'
              )}
            >
              <Text
                className={cn(
                  'font-bold text-sm',
                  canUnlock ? 'text-[#F59E0B]' : 'text-gray-600'
                )}
              >
                {canUnlock ? 'Unlock Skill' : 'Locked'}
              </Text>
            </Pressable>
          </>
        )}
      </View>
    </Animated.View>
  );
}
