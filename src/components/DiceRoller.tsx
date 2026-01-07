import { useState, useCallback } from 'react';
import { View, Text, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withSpring,
  withRepeat,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { Dices } from 'lucide-react-native';
import { useGameStore, type DiceRoll, type Attributes } from '@/lib/gameStore';
import { cn } from '@/lib/cn';

interface DiceRollerProps {
  onRoll?: (result: DiceRoll) => void;
  attribute?: keyof Attributes;
  size?: 'small' | 'medium' | 'large';
}

const DICE_TYPES: DiceRoll['type'][] = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20'];

export function DiceRoller({ onRoll, attribute, size = 'medium' }: DiceRollerProps) {
  const rollDice = useGameStore((s) => s.rollDice);
  const [selectedDice, setSelectedDice] = useState<DiceRoll['type']>('d20');
  const [lastRoll, setLastRoll] = useState<DiceRoll | null>(null);
  const [isRolling, setIsRolling] = useState(false);

  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);
  const resultOpacity = useSharedValue(0);

  const handleRoll = useCallback(() => {
    if (isRolling) return;

    setIsRolling(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    // Hide result during roll
    resultOpacity.value = 0;

    // Animate dice
    rotation.value = withSequence(
      withTiming(720, { duration: 600, easing: Easing.out(Easing.cubic) }),
      withTiming(0, { duration: 0 })
    );

    scale.value = withSequence(
      withTiming(1.3, { duration: 150 }),
      withTiming(0.8, { duration: 150 }),
      withSpring(1, { damping: 10, stiffness: 100 })
    );

    // Perform roll after animation
    setTimeout(() => {
      const result = rollDice(selectedDice, attribute);
      setLastRoll(result);
      setIsRolling(false);

      // Show result with animation
      resultOpacity.value = withSpring(1);

      // Haptic feedback based on result
      if (selectedDice === 'd20') {
        if (result.result === 20) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else if (result.result === 1) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } else {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
      }

      onRoll?.(result);
    }, 600);
  }, [isRolling, selectedDice, attribute, rollDice, onRoll]);

  const diceStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }, { scale: scale.value }],
  }));

  const resultStyle = useAnimatedStyle(() => ({
    opacity: resultOpacity.value,
  }));

  const sizeClasses = {
    small: { dice: 'w-16 h-16', text: 'text-xl', container: 'p-3' },
    medium: { dice: 'w-24 h-24', text: 'text-3xl', container: 'p-4' },
    large: { dice: 'w-32 h-32', text: 'text-5xl', container: 'p-6' },
  };

  const isCriticalSuccess = lastRoll?.type === 'd20' && lastRoll?.result === 20;
  const isCriticalFail = lastRoll?.type === 'd20' && lastRoll?.result === 1;

  return (
    <View className="items-center">
      {/* Dice Type Selector */}
      <View className="flex-row mb-4 bg-[#12121F] rounded-xl p-1">
        {DICE_TYPES.map((dice) => (
          <Pressable
            key={dice}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setSelectedDice(dice);
              setLastRoll(null);
            }}
            className={cn(
              'px-3 py-2 rounded-lg',
              selectedDice === dice && 'bg-[#FF3D3D]'
            )}
          >
            <Text
              className={cn(
                'text-sm font-bold',
                selectedDice === dice ? 'text-white' : 'text-gray-400'
              )}
            >
              {dice.toUpperCase()}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Dice Button */}
      <Pressable onPress={handleRoll} disabled={isRolling}>
        <Animated.View
          style={diceStyle}
          className={cn(
            sizeClasses[size].dice,
            'rounded-2xl items-center justify-center',
            isCriticalSuccess
              ? 'bg-[#10B981]'
              : isCriticalFail
              ? 'bg-[#EF4444]'
              : 'bg-[#FF3D3D]'
          )}
        >
          {lastRoll && !isRolling ? (
            <Animated.Text
              style={resultStyle}
              className={cn(sizeClasses[size].text, 'font-black text-white')}
            >
              {lastRoll.result}
            </Animated.Text>
          ) : (
            <Dices size={size === 'large' ? 48 : size === 'medium' ? 36 : 24} color="#fff" />
          )}
        </Animated.View>
      </Pressable>

      {/* Result Details */}
      {lastRoll && !isRolling && (
        <Animated.View style={resultStyle} className="mt-4 items-center">
          {isCriticalSuccess && (
            <Text className="text-[#10B981] font-black text-lg mb-1">CRITICAL SUCCESS!</Text>
          )}
          {isCriticalFail && (
            <Text className="text-[#EF4444] font-black text-lg mb-1">CRITICAL FAIL!</Text>
          )}

          <View className="flex-row items-center">
            <Text className="text-gray-400">
              Roll: <Text className="text-white font-bold">{lastRoll.result}</Text>
            </Text>
            {lastRoll.modifier !== 0 && (
              <Text className="text-gray-400 ml-2">
                {lastRoll.modifier > 0 ? '+' : ''}
                {lastRoll.modifier} ={' '}
                <Text className="text-[#00E5FF] font-bold">{lastRoll.total}</Text>
              </Text>
            )}
          </View>

          {lastRoll.attribute && (
            <Text className="text-gray-500 text-xs mt-1 capitalize">
              {lastRoll.attribute} modifier applied
            </Text>
          )}

          {lastRoll.success !== undefined && (
            <View
              className={cn(
                'mt-2 px-3 py-1 rounded-full',
                lastRoll.success ? 'bg-[#10B981]/20' : 'bg-[#EF4444]/20'
              )}
            >
              <Text
                className={cn(
                  'text-sm font-bold',
                  lastRoll.success ? 'text-[#10B981]' : 'text-[#EF4444]'
                )}
              >
                {lastRoll.success ? 'SUCCESS' : 'FAILURE'}
              </Text>
            </View>
          )}
        </Animated.View>
      )}

      {/* Tap to roll hint */}
      {!lastRoll && !isRolling && (
        <Text className="text-gray-500 text-sm mt-4">Tap to roll</Text>
      )}
    </View>
  );
}

// Compact inline dice roller for game session
export function InlineDiceRoller({
  onRoll,
  requiredAttribute,
  difficultyClass,
}: {
  onRoll?: (result: DiceRoll) => void;
  requiredAttribute?: keyof Attributes;
  difficultyClass?: number;
}) {
  const rollDice = useGameStore((s) => s.rollDice);
  const [isRolling, setIsRolling] = useState(false);
  const [lastRoll, setLastRoll] = useState<DiceRoll | null>(null);

  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);

  const handleQuickRoll = () => {
    if (isRolling) return;

    setIsRolling(true);
    setLastRoll(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    rotation.value = withSequence(
      withTiming(720, { duration: 600, easing: Easing.out(Easing.cubic) }),
      withTiming(0, { duration: 0 })
    );

    scale.value = withSequence(
      withTiming(1.2, { duration: 150 }),
      withTiming(0.9, { duration: 150 }),
      withSpring(1, { damping: 10, stiffness: 100 })
    );

    setTimeout(() => {
      const result = rollDice('d20', requiredAttribute, difficultyClass);
      setLastRoll(result);
      setIsRolling(false);

      // Haptic feedback based on result
      if (result.result === 20) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else if (result.result === 1) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } else if (result.success === true) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else if (result.success === false) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }

      onRoll?.(result);
    }, 600);
  };

  const diceStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }, { scale: scale.value }],
  }));

  const isCriticalSuccess = lastRoll?.result === 20;
  const isCriticalFail = lastRoll?.result === 1;
  const isSuccess = lastRoll?.success === true;
  const isFailure = lastRoll?.success === false;

  // If there's a required attribute, show a larger roll button
  if (requiredAttribute) {
    return (
      <View className="items-center">
        <Pressable onPress={handleQuickRoll} disabled={isRolling}>
          <Animated.View
            style={diceStyle}
            className={cn(
              'w-20 h-20 rounded-2xl items-center justify-center',
              lastRoll
                ? isCriticalSuccess
                  ? 'bg-[#10B981]'
                  : isCriticalFail
                  ? 'bg-[#EF4444]'
                  : isSuccess
                  ? 'bg-[#10B981]'
                  : isFailure
                  ? 'bg-[#EF4444]'
                  : 'bg-[#F59E0B]'
                : 'bg-[#F59E0B]'
            )}
          >
            {lastRoll && !isRolling ? (
              <Text className="text-3xl font-black text-white">{lastRoll.result}</Text>
            ) : (
              <Dices size={32} color="#fff" />
            )}
          </Animated.View>
        </Pressable>

        {/* Result Details */}
        {lastRoll && !isRolling && (
          <View className="mt-3 items-center">
            {isCriticalSuccess && (
              <Text className="text-[#10B981] font-black text-sm mb-1">CRITICAL SUCCESS!</Text>
            )}
            {isCriticalFail && (
              <Text className="text-[#EF4444] font-black text-sm mb-1">CRITICAL FAIL!</Text>
            )}

            <View className="flex-row items-center">
              <Text className="text-gray-400 text-sm">
                Roll: <Text className="text-white font-bold">{lastRoll.result}</Text>
              </Text>
              {lastRoll.modifier !== 0 && (
                <Text className="text-gray-400 text-sm ml-2">
                  {lastRoll.modifier > 0 ? '+' : ''}
                  {lastRoll.modifier} = <Text className="text-[#00E5FF] font-bold">{lastRoll.total}</Text>
                </Text>
              )}
              {difficultyClass && (
                <Text className="text-gray-400 text-sm ml-2">
                  vs DC <Text className="text-[#F59E0B] font-bold">{difficultyClass}</Text>
                </Text>
              )}
            </View>

            {lastRoll.success !== undefined && (
              <View
                className={cn(
                  'mt-2 px-4 py-1.5 rounded-full',
                  lastRoll.success ? 'bg-[#10B981]/20' : 'bg-[#EF4444]/20'
                )}
              >
                <Text
                  className={cn(
                    'text-sm font-bold',
                    lastRoll.success ? 'text-[#10B981]' : 'text-[#EF4444]'
                  )}
                >
                  {lastRoll.success ? 'SUCCESS!' : 'FAILURE'}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Tap to roll hint */}
        {!lastRoll && !isRolling && (
          <Text className="text-[#F59E0B] text-sm mt-3 font-medium">Tap to roll D20</Text>
        )}
      </View>
    );
  }

  // Default compact version (not used when Game Master doesn't request)
  return (
    <Pressable onPress={handleQuickRoll} disabled={isRolling}>
      <Animated.View
        style={diceStyle}
        className="w-10 h-10 rounded-xl bg-[#FF3D3D]/20 items-center justify-center"
      >
        <Dices size={20} color="#FF3D3D" />
      </Animated.View>
    </Pressable>
  );
}
