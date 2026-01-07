import { View, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { cn } from '@/lib/cn';

type StatBarProps = {
  value: number;
  maxValue: number;
  color?: string;
  bgColor?: string;
  label?: string;
  showNumbers?: boolean;
  height?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  icon?: React.ReactNode;
  className?: string;
};

const heightClasses = {
  sm: 'h-1.5',
  md: 'h-2',
  lg: 'h-3',
};

export function StatBar({
  value,
  maxValue,
  color = '#FF3D3D',
  bgColor = '#1A1A2E',
  label,
  showNumbers = false,
  height = 'md',
  animated = true,
  icon,
  className,
}: StatBarProps) {
  const percentage = Math.min(Math.max((value / maxValue) * 100, 0), 100);
  const animatedWidth = useSharedValue(animated ? 0 : percentage);

  useEffect(() => {
    if (animated) {
      animatedWidth.value = withSpring(percentage, {
        damping: 15,
        stiffness: 100,
      });
    } else {
      animatedWidth.value = percentage;
    }
  }, [percentage, animated]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${animatedWidth.value}%`,
  }));

  return (
    <View className={cn('w-full', className)}>
      {(label || showNumbers || icon) && (
        <View className="flex-row items-center justify-between mb-1">
          <View className="flex-row items-center">
            {icon}
            {label && (
              <Text className={cn('text-gray-400 text-xs', icon && 'ml-1')}>
                {label}
              </Text>
            )}
          </View>
          {showNumbers && (
            <Text className="text-gray-400 text-xs">
              {value}/{maxValue}
            </Text>
          )}
        </View>
      )}
      <View
        className={cn('rounded-full overflow-hidden', heightClasses[height])}
        style={{ backgroundColor: bgColor }}
      >
        <Animated.View
          className="h-full rounded-full"
          style={[{ backgroundColor: color }, animatedStyle]}
        />
      </View>
    </View>
  );
}

type CircularProgressProps = {
  value: number;
  maxValue: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  bgColor?: string;
  showPercentage?: boolean;
  children?: React.ReactNode;
};

export function CircularProgress({
  value,
  maxValue,
  size = 80,
  strokeWidth = 8,
  color = '#FF3D3D',
  bgColor = '#1A1A2E',
  showPercentage = false,
  children,
}: CircularProgressProps) {
  const percentage = Math.min(Math.max((value / maxValue) * 100, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <View style={{ width: size, height: size }} className="items-center justify-center">
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: strokeWidth,
          borderColor: bgColor,
          position: 'absolute',
        }}
      />
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: strokeWidth,
          borderColor: color,
          borderTopColor: 'transparent',
          borderRightColor: percentage > 25 ? color : 'transparent',
          borderBottomColor: percentage > 50 ? color : 'transparent',
          borderLeftColor: percentage > 75 ? color : 'transparent',
          position: 'absolute',
          transform: [{ rotate: '-90deg' }],
        }}
      />
      <View className="items-center justify-center">
        {children ?? (
          showPercentage && (
            <Text className="text-white font-bold text-sm">
              {Math.round(percentage)}%
            </Text>
          )
        )}
      </View>
    </View>
  );
}
