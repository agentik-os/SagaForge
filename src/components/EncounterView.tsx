import { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import Animated, {
  FadeIn,
  FadeInUp,
  FadeInDown,
  SlideInRight,
} from 'react-native-reanimated';
import {
  Swords,
  MessageCircle,
  Search,
  Skull,
  HelpCircle,
  ShieldAlert,
  Coffee,
  ShoppingBag,
  Crown,
  Dices,
  Check,
  X,
  Zap,
  Heart,
} from 'lucide-react-native';
import { MarkdownText } from './MarkdownText';
import { StatBar } from './StatBar';
import { GradientButton, Badge } from './ui';
import { cn } from '@/lib/cn';
import {
  type Encounter,
  type EncounterChoice,
  type EncounterOutcome,
  type EncounterType,
  type DifficultyLevel,
} from '@/lib/encounters';
import { type Attributes, type DiceRoll } from '@/lib/gameStore';

const encounterTypeIcons: Record<EncounterType, typeof Swords> = {
  exploration: Search,
  combat: Swords,
  social: MessageCircle,
  puzzle: HelpCircle,
  discovery: Search,
  trap: ShieldAlert,
  rest: Coffee,
  merchant: ShoppingBag,
  boss: Crown,
};

const encounterTypeColors: Record<EncounterType, string> = {
  exploration: '#00E5FF',
  combat: '#EF4444',
  social: '#A855F7',
  puzzle: '#F59E0B',
  discovery: '#10B981',
  trap: '#EF4444',
  rest: '#10B981',
  merchant: '#F59E0B',
  boss: '#FF3D3D',
};

const difficultyColors: Record<DifficultyLevel, string> = {
  easy: '#10B981',
  medium: '#F59E0B',
  hard: '#EF4444',
  deadly: '#DC2626',
};

type EncounterViewProps = {
  encounter: Encounter;
  characterAttributes: Attributes;
  characterSkills: { id: string; level: number }[];
  onChoiceSelected: (choice: EncounterChoice, rollResult?: DiceRoll) => void;
  onRollDice: (attribute: keyof Attributes) => DiceRoll;
};

export function EncounterView({
  encounter,
  characterAttributes,
  characterSkills,
  onChoiceSelected,
  onRollDice,
}: EncounterViewProps) {
  const [selectedChoice, setSelectedChoice] = useState<EncounterChoice | null>(null);
  const [rollResult, setRollResult] = useState<DiceRoll | null>(null);
  const [showOutcome, setShowOutcome] = useState(false);

  const Icon = encounterTypeIcons[encounter.type];
  const typeColor = encounterTypeColors[encounter.type];

  const handleChoicePress = (choice: EncounterChoice) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedChoice(choice);

    // If no dice roll needed, proceed directly
    if (!choice.difficultyCheck) {
      setShowOutcome(true);
      onChoiceSelected(choice);
      return;
    }

    // Otherwise, show roll prompt
  };

  const handleRoll = () => {
    if (!selectedChoice?.requiredAttribute) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    const result = onRollDice(selectedChoice.requiredAttribute);
    setRollResult(result);

    // Determine success after a delay for dramatic effect
    setTimeout(() => {
      setShowOutcome(true);
      onChoiceSelected(selectedChoice, result);
    }, 1500);
  };

  const getAttributeBonus = (attr: keyof Attributes): number => {
    const value = characterAttributes[attr];
    return Math.floor((value - 10) / 2);
  };

  const isSuccess = rollResult && selectedChoice?.difficultyCheck
    ? rollResult.total >= selectedChoice.difficultyCheck
    : null;

  return (
    <View className="flex-1">
      {/* Header */}
      <Animated.View entering={FadeInDown.duration(400)} className="mb-4">
        <View className="flex-row items-center mb-2">
          <View
            className="w-10 h-10 rounded-xl items-center justify-center mr-3"
            style={{ backgroundColor: `${typeColor}20` }}
          >
            <Icon size={20} color={typeColor} />
          </View>
          <View className="flex-1">
            <Text className="text-white font-bold text-xl">{encounter.title}</Text>
            <View className="flex-row items-center mt-1">
              <Badge color={encounter.difficulty === 'easy' ? 'green' : encounter.difficulty === 'medium' ? 'yellow' : 'red'} size="sm">
                {encounter.difficulty.charAt(0).toUpperCase() + encounter.difficulty.slice(1)}
              </Badge>
              <Text className="text-gray-500 text-xs ml-2 capitalize">{encounter.type}</Text>
            </View>
          </View>
        </View>
      </Animated.View>

      {/* Narration */}
      <Animated.View entering={FadeIn.duration(600).delay(200)}>
        <ScrollView
          className="max-h-48 mb-4"
          showsVerticalScrollIndicator={false}
        >
          <View className="bg-[#12121F] rounded-2xl border border-[#2A2A40] p-4">
            <MarkdownText className="text-gray-200" baseColor="#e5e7eb">
              {encounter.narration}
            </MarkdownText>
          </View>
        </ScrollView>
      </Animated.View>

      {/* Choices or Roll Result */}
      {!selectedChoice ? (
        <Animated.View entering={FadeInUp.duration(400).delay(400)} className="gap-3">
          <Text className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-2">
            Choose Your Action
          </Text>
          {encounter.choices.map((choice, index) => (
            <ChoiceButton
              key={choice.id}
              choice={choice}
              index={index}
              characterAttributes={characterAttributes}
              onPress={() => handleChoicePress(choice)}
            />
          ))}
        </Animated.View>
      ) : !rollResult && selectedChoice.difficultyCheck ? (
        <Animated.View entering={FadeIn.duration(400)} className="items-center py-6">
          <View className="bg-[#12121F] rounded-3xl border border-[#2A2A40] p-6 w-full items-center">
            <Text className="text-gray-400 text-sm mb-2">Skill Check Required</Text>
            <Text className="text-white font-bold text-lg mb-1 capitalize">
              {selectedChoice.requiredAttribute}
            </Text>
            <Text className="text-gray-500 text-sm mb-4">
              Target: {selectedChoice.difficultyCheck} | Your Bonus: +{getAttributeBonus(selectedChoice.requiredAttribute!)}
            </Text>

            <GradientButton onPress={handleRoll} size="lg">
              <Dices size={24} color="#fff" />
              <Text className="text-white font-bold text-lg ml-2">Roll d20</Text>
            </GradientButton>

            <Pressable
              onPress={() => {
                setSelectedChoice(null);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              className="mt-4"
            >
              <Text className="text-gray-500 text-sm">Choose different action</Text>
            </Pressable>
          </View>
        </Animated.View>
      ) : rollResult ? (
        <Animated.View entering={FadeIn.duration(400)} className="items-center py-4">
          <View className="bg-[#12121F] rounded-3xl border border-[#2A2A40] p-6 w-full items-center">
            {/* Dice Result */}
            <View className="flex-row items-center mb-4">
              <View
                className={cn(
                  'w-20 h-20 rounded-2xl items-center justify-center',
                  isSuccess ? 'bg-[#10B981]/20' : 'bg-[#EF4444]/20'
                )}
              >
                <Text
                  className={cn(
                    'text-4xl font-black',
                    isSuccess ? 'text-[#10B981]' : 'text-[#EF4444]'
                  )}
                >
                  {rollResult.result}
                </Text>
              </View>
              <View className="ml-4">
                <Text className="text-gray-400 text-sm">
                  Roll: {rollResult.result} + {rollResult.modifier} = {rollResult.total}
                </Text>
                <Text className="text-gray-500 text-xs">
                  Target: {selectedChoice?.difficultyCheck}
                </Text>
              </View>
            </View>

            {/* Result Badge */}
            {showOutcome && (
              <Animated.View entering={SlideInRight.duration(300)}>
                <View
                  className={cn(
                    'flex-row items-center px-6 py-3 rounded-full',
                    isSuccess ? 'bg-[#10B981]/20' : 'bg-[#EF4444]/20'
                  )}
                >
                  {isSuccess ? (
                    <Check size={24} color="#10B981" strokeWidth={3} />
                  ) : (
                    <X size={24} color="#EF4444" strokeWidth={3} />
                  )}
                  <Text
                    className={cn(
                      'font-bold text-xl ml-2',
                      isSuccess ? 'text-[#10B981]' : 'text-[#EF4444]'
                    )}
                  >
                    {isSuccess ? 'SUCCESS!' : 'FAILURE'}
                  </Text>
                </View>
              </Animated.View>
            )}
          </View>
        </Animated.View>
      ) : null}
    </View>
  );
}

type ChoiceButtonProps = {
  choice: EncounterChoice;
  index: number;
  characterAttributes: Attributes;
  onPress: () => void;
};

function ChoiceButton({ choice, index, characterAttributes, onPress }: ChoiceButtonProps) {
  const hasRequirement = choice.requiredAttribute || choice.requiredSkill;
  const bonus = choice.requiredAttribute
    ? Math.floor((characterAttributes[choice.requiredAttribute] - 10) / 2)
    : 0;

  return (
    <Animated.View entering={FadeInUp.duration(300).delay(100 * index)}>
      <Pressable
        onPress={onPress}
        className="active:scale-[0.98] active:opacity-90"
      >
        <View className="bg-[#12121F] rounded-xl border border-[#2A2A40] p-4">
          <Text className="text-white font-medium text-base mb-1">
            {choice.text}
          </Text>
          {hasRequirement && (
            <View className="flex-row items-center mt-2">
              {choice.requiredAttribute && (
                <View className="flex-row items-center bg-[#FF3D3D]/10 px-2 py-1 rounded-lg mr-2">
                  <Zap size={12} color="#FF3D3D" />
                  <Text className="text-[#FF3D3D] text-xs ml-1 capitalize">
                    {choice.requiredAttribute}
                  </Text>
                  <Text className="text-gray-500 text-xs ml-1">
                    (+{bonus})
                  </Text>
                </View>
              )}
              {choice.difficultyCheck && (
                <View className="flex-row items-center bg-white/5 px-2 py-1 rounded-lg">
                  <Dices size={12} color="#666" />
                  <Text className="text-gray-400 text-xs ml-1">
                    DC {choice.difficultyCheck}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}

type OutcomeViewProps = {
  outcome: EncounterOutcome;
  isSuccess?: boolean;
  onContinue: () => void;
};

export function OutcomeView({ outcome, isSuccess, onContinue }: OutcomeViewProps) {
  return (
    <View className="flex-1">
      <Animated.View entering={FadeIn.duration(600)}>
        {/* Outcome Narration */}
        <View className="bg-[#12121F] rounded-2xl border border-[#2A2A40] p-4 mb-4">
          <MarkdownText className="text-gray-200" baseColor="#e5e7eb">
            {outcome.narration}
          </MarkdownText>
        </View>

        {/* Effects */}
        <View className="gap-2 mb-6">
          {outcome.healthChange && (
            <View className="flex-row items-center">
              <Heart size={16} color={outcome.healthChange > 0 ? '#10B981' : '#EF4444'} />
              <Text
                className={cn(
                  'ml-2 font-medium',
                  outcome.healthChange > 0 ? 'text-[#10B981]' : 'text-[#EF4444]'
                )}
              >
                {outcome.healthChange > 0 ? '+' : ''}{outcome.healthChange} Health
              </Text>
            </View>
          )}
          {outcome.energyChange && (
            <View className="flex-row items-center">
              <Zap size={16} color={outcome.energyChange > 0 ? '#3B82F6' : '#F59E0B'} />
              <Text
                className={cn(
                  'ml-2 font-medium',
                  outcome.energyChange > 0 ? 'text-[#3B82F6]' : 'text-[#F59E0B]'
                )}
              >
                {outcome.energyChange > 0 ? '+' : ''}{outcome.energyChange} Energy
              </Text>
            </View>
          )}
          {outcome.experienceGain && (
            <View className="flex-row items-center">
              <Text className="text-[#A855F7] font-medium">
                +{outcome.experienceGain} XP
              </Text>
            </View>
          )}
          {outcome.goldChange && (
            <View className="flex-row items-center">
              <Text
                className={cn(
                  'font-medium',
                  outcome.goldChange > 0 ? 'text-[#F59E0B]' : 'text-gray-400'
                )}
              >
                {outcome.goldChange > 0 ? '+' : ''}{outcome.goldChange} Gold
              </Text>
            </View>
          )}
          {outcome.itemsGained?.map((item, i) => (
            <View key={i} className="flex-row items-center">
              <Text className="text-[#00E5FF] font-medium">
                + {item.name}
              </Text>
            </View>
          ))}
        </View>

        <GradientButton onPress={onContinue}>
          <Text className="text-white font-bold text-lg">Continue</Text>
        </GradientButton>
      </Animated.View>
    </View>
  );
}
