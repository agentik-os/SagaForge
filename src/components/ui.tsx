import { View, Text, Pressable } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { cn } from '@/lib/cn';

type GlassCardProps = {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
  border?: boolean;
  borderColor?: string;
  onPress?: () => void;
  entering?: typeof FadeIn;
};

export function GlassCard({
  children,
  className,
  intensity = 20,
  border = true,
  borderColor = 'border-white/5',
  onPress,
  entering,
}: GlassCardProps) {
  const content = (
    <View
      className={cn(
        'rounded-2xl overflow-hidden',
        border && 'border',
        border && borderColor,
        className
      )}
    >
      <BlurView intensity={intensity} tint="dark" style={{ overflow: 'hidden' }}>
        {children}
      </BlurView>
    </View>
  );

  if (onPress) {
    return (
      <Animated.View entering={entering}>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onPress();
          }}
          className="active:scale-[0.98] active:opacity-90"
        >
          {content}
        </Pressable>
      </Animated.View>
    );
  }

  return entering ? (
    <Animated.View entering={entering}>{content}</Animated.View>
  ) : (
    content
  );
}

type GradientButtonProps = {
  children: React.ReactNode;
  onPress: () => void;
  colors?: [string, string];
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
};

const sizeClasses = {
  sm: 'py-2 px-4',
  md: 'py-3 px-6',
  lg: 'py-4 px-8',
};

export function GradientButton({
  children,
  onPress,
  colors = ['#FF3D3D', '#FF6B35'],
  disabled = false,
  className,
  size = 'md',
}: GradientButtonProps) {
  return (
    <Pressable
      onPress={() => {
        if (!disabled) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onPress();
        }
      }}
      disabled={disabled}
      className={cn('active:scale-[0.98]', disabled && 'opacity-50', className)}
    >
      <LinearGradient
        colors={disabled ? ['#333', '#222'] : colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ borderRadius: 16, padding: 1 }}
      >
        <View
          className={cn(
            'bg-transparent rounded-[15px] flex-row items-center justify-center',
            sizeClasses[size]
          )}
        >
          {children}
        </View>
      </LinearGradient>
    </Pressable>
  );
}

type BadgeProps = {
  children: React.ReactNode;
  color?: 'red' | 'cyan' | 'green' | 'yellow' | 'purple' | 'gray';
  size?: 'sm' | 'md';
  className?: string;
};

const badgeColors = {
  red: 'bg-[#FF3D3D]/20 text-[#FF3D3D]',
  cyan: 'bg-[#00E5FF]/20 text-[#00E5FF]',
  green: 'bg-[#10B981]/20 text-[#10B981]',
  yellow: 'bg-[#F59E0B]/20 text-[#F59E0B]',
  purple: 'bg-[#A855F7]/20 text-[#A855F7]',
  gray: 'bg-white/10 text-gray-400',
};

const badgeSizes = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
};

export function Badge({ children, color = 'red', size = 'md', className }: BadgeProps) {
  return (
    <View className={cn('rounded-full', badgeColors[color], badgeSizes[size], className)}>
      <Text className={cn('font-medium', badgeColors[color].split(' ')[1])}>
        {children}
      </Text>
    </View>
  );
}

type RarityBadgeProps = {
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  size?: 'sm' | 'md';
};

const rarityConfig = {
  common: { color: 'gray' as const, label: 'Common' },
  uncommon: { color: 'green' as const, label: 'Uncommon' },
  rare: { color: 'cyan' as const, label: 'Rare' },
  legendary: { color: 'yellow' as const, label: 'Legendary' },
};

export function RarityBadge({ rarity, size = 'sm' }: RarityBadgeProps) {
  const config = rarityConfig[rarity];
  return (
    <Badge color={config.color} size={size}>
      {config.label}
    </Badge>
  );
}

type IconButtonProps = {
  icon: React.ReactNode;
  onPress: () => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'danger' | 'success';
  disabled?: boolean;
  className?: string;
};

const iconButtonSizes = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
};

const iconButtonVariants = {
  default: 'bg-[#1A1A2E]',
  danger: 'bg-[#EF4444]/20',
  success: 'bg-[#10B981]/20',
};

export function IconButton({
  icon,
  onPress,
  size = 'md',
  variant = 'default',
  disabled = false,
  className,
}: IconButtonProps) {
  return (
    <Pressable
      onPress={() => {
        if (!disabled) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onPress();
        }
      }}
      disabled={disabled}
      className={cn(
        'rounded-full items-center justify-center active:opacity-80',
        iconButtonSizes[size],
        iconButtonVariants[variant],
        disabled && 'opacity-50',
        className
      )}
    >
      {icon}
    </Pressable>
  );
}

type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
};

export function SectionHeader({ title, subtitle, action, className }: SectionHeaderProps) {
  return (
    <View className={cn('flex-row items-center justify-between mb-3', className)}>
      <View>
        <Text className="text-gray-400 text-sm font-bold uppercase tracking-wider">
          {title}
        </Text>
        {subtitle && (
          <Text className="text-gray-600 text-xs mt-0.5">{subtitle}</Text>
        )}
      </View>
      {action}
    </View>
  );
}

type EmptyStateProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
};

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <View className={cn('items-center justify-center py-12', className)}>
      <View className="w-16 h-16 rounded-full bg-[#1A1A2E] items-center justify-center mb-4">
        {icon}
      </View>
      <Text className="text-white font-semibold text-lg mb-1">{title}</Text>
      <Text className="text-gray-500 text-sm text-center max-w-[250px] mb-4">
        {description}
      </Text>
      {action}
    </View>
  );
}
