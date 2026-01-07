import { View, Text, Pressable, ScrollView, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import {
  X,
  Settings,
  Volume2,
  VolumeX,
  Vibrate,
  Type,
  RotateCcw,
  ChevronRight,
  AlertTriangle,
  Globe,
} from 'lucide-react-native';
import {
  useGameStore,
  useSoundEnabled,
  useHapticEnabled,
  LANGUAGES,
} from '@/lib/gameStore';
import { cn } from '@/lib/cn';

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const soundEnabled = useSoundEnabled();
  const hapticEnabled = useHapticEnabled();
  const textSpeed = useGameStore((s) => s.textSpeed);
  const language = useGameStore((s) => s.language);

  const setSoundEnabled = useGameStore((s) => s.setSoundEnabled);
  const setHapticEnabled = useGameStore((s) => s.setHapticEnabled);
  const setTextSpeed = useGameStore((s) => s.setTextSpeed);
  const resetGame = useGameStore((s) => s.resetGame);

  const handleToggleSound = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSoundEnabled(!soundEnabled);
  };

  const handleToggleHaptic = () => {
    if (!hapticEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setHapticEnabled(!hapticEnabled);
  };

  const handleTextSpeedChange = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const speeds: Array<'slow' | 'normal' | 'fast'> = ['slow', 'normal', 'fast'];
    const currentIndex = speeds.indexOf(textSpeed);
    const nextIndex = (currentIndex + 1) % speeds.length;
    setTextSpeed(speeds[nextIndex]);
  };

  const handleResetGame = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    resetGame();
    router.replace('/' as never);
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
          <Settings size={24} color="#FF3D3D" />
          <Text className="text-xl font-bold text-white ml-2">Settings</Text>
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
        {/* Audio & Feedback Section */}
        <Animated.View entering={FadeInUp.duration(400)} className="mb-6">
          <Text className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-3">
            Audio & Feedback
          </Text>

          <View className="bg-[#12121F] rounded-2xl border border-[#2A2A40] overflow-hidden">
            {/* Sound */}
            <Pressable
              onPress={handleToggleSound}
              className="flex-row items-center justify-between p-4 border-b border-[#2A2A40]"
            >
              <View className="flex-row items-center">
                {soundEnabled ? (
                  <Volume2 size={20} color="#FF3D3D" />
                ) : (
                  <VolumeX size={20} color="#666" />
                )}
                <Text className="text-white font-medium ml-3">Sound Effects</Text>
              </View>
              <Switch
                value={soundEnabled}
                onValueChange={handleToggleSound}
                trackColor={{ false: '#2A2A40', true: '#FF3D3D50' }}
                thumbColor={soundEnabled ? '#FF3D3D' : '#666'}
              />
            </Pressable>

            {/* Haptics */}
            <Pressable
              onPress={handleToggleHaptic}
              className="flex-row items-center justify-between p-4"
            >
              <View className="flex-row items-center">
                <Vibrate size={20} color={hapticEnabled ? '#FF3D3D' : '#666'} />
                <Text className="text-white font-medium ml-3">Haptic Feedback</Text>
              </View>
              <Switch
                value={hapticEnabled}
                onValueChange={handleToggleHaptic}
                trackColor={{ false: '#2A2A40', true: '#FF3D3D50' }}
                thumbColor={hapticEnabled ? '#FF3D3D' : '#666'}
              />
            </Pressable>
          </View>
        </Animated.View>

        {/* Gameplay Section */}
        <Animated.View entering={FadeInUp.duration(400).delay(100)} className="mb-6">
          <Text className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-3">
            Gameplay
          </Text>

          <View className="bg-[#12121F] rounded-2xl border border-[#2A2A40] overflow-hidden">
            {/* Language */}
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('/select-language' as never);
              }}
              className="flex-row items-center justify-between p-4 border-b border-[#2A2A40]"
            >
              <View className="flex-row items-center">
                <Globe size={20} color="#FF3D3D" />
                <Text className="text-white font-medium ml-3">Language</Text>
              </View>
              <View className="flex-row items-center">
                <Text className="text-gray-400 mr-1">{LANGUAGES[language].flag}</Text>
                <Text className="text-gray-400 mr-2">{LANGUAGES[language].nativeName}</Text>
                <ChevronRight size={16} color="#666" />
              </View>
            </Pressable>

            {/* Text Speed */}
            <Pressable
              onPress={handleTextSpeedChange}
              className="flex-row items-center justify-between p-4"
            >
              <View className="flex-row items-center">
                <Type size={20} color="#FF3D3D" />
                <Text className="text-white font-medium ml-3">Text Speed</Text>
              </View>
              <View className="flex-row items-center">
                <View className="bg-[#FF3D3D]/20 px-3 py-1 rounded-full mr-2">
                  <Text className="text-[#FF3D3D] font-bold text-sm capitalize">
                    {textSpeed}
                  </Text>
                </View>
                <ChevronRight size={16} color="#666" />
              </View>
            </Pressable>
          </View>
        </Animated.View>

        {/* Danger Zone */}
        <Animated.View entering={FadeInUp.duration(400).delay(200)} className="mb-6">
          <Text className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-3">
            Danger Zone
          </Text>

          <View className="bg-[#12121F] rounded-2xl border border-[#EF4444]/30 overflow-hidden">
            <Pressable
              onPress={handleResetGame}
              className="flex-row items-center justify-between p-4"
            >
              <View className="flex-row items-center">
                <RotateCcw size={20} color="#EF4444" />
                <View className="ml-3">
                  <Text className="text-[#EF4444] font-medium">Reset All Progress</Text>
                  <Text className="text-gray-500 text-xs mt-0.5">
                    Delete character, quests, and achievements
                  </Text>
                </View>
              </View>
              <AlertTriangle size={16} color="#EF4444" />
            </Pressable>
          </View>
        </Animated.View>

        {/* About */}
        <Animated.View entering={FadeIn.duration(400).delay(300)} className="items-center mt-8">
          <Text className="text-gray-600 text-sm">Fantasy Hero Quest</Text>
          <Text className="text-gray-700 text-xs mt-1">Version 1.0.0</Text>
          <Text className="text-gray-700 text-xs mt-4 text-center">
            An AI-powered narrative RPG adventure
          </Text>
        </Animated.View>
      </ScrollView>
    </View>
  );
}
