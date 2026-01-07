import { View, Text, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeInUp, SlideInRight } from 'react-native-reanimated';
import {
  X,
  Eye,
  Brain,
  Users,
  Sparkles,
  Shield,
  Search,
  Calendar,
  Scroll,
  Swords,
} from 'lucide-react-native';
import { useCharacter, ARCHETYPES, type Archetype } from '@/lib/gameStore';
import { cn } from '@/lib/cn';

const ARCHETYPE_ICONS: Record<Archetype, React.ReactNode> = {
  visionary: <Eye size={32} color="#FF3D3D" />,
  strategist: <Brain size={32} color="#FF3D3D" />,
  connector: <Users size={32} color="#FF3D3D" />,
  creator: <Sparkles size={32} color="#FF3D3D" />,
  protector: <Shield size={32} color="#FF3D3D" />,
  seeker: <Search size={32} color="#FF3D3D" />,
};

const ATTRIBUTE_INFO: Record<string, { label: string; color: string }> = {
  vision: { label: 'Vision', color: '#FF3D3D' },
  resilience: { label: 'Resilience', color: '#FF6B35' },
  influence: { label: 'Influence', color: '#00E5FF' },
  wisdom: { label: 'Wisdom', color: '#A855F7' },
  audacity: { label: 'Audacity', color: '#F59E0B' },
  integrity: { label: 'Integrity', color: '#10B981' },
};

export default function CharacterSheetScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const character = useCharacter();

  if (!character) {
    return (
      <View className="flex-1 bg-[#0A0A14] items-center justify-center">
        <Text className="text-white">No character found</Text>
      </View>
    );
  }

  const archetypeInfo = ARCHETYPES[character.archetype];
  const createdDate = new Date(character.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

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
        <Text className="text-xl font-bold text-white">Character Sheet</Text>
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
        className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
      >
        {/* Hero Card */}
        <Animated.View entering={FadeIn.duration(400)}>
          <LinearGradient
            colors={['#12121F', '#1A1025']}
            style={{ borderRadius: 24, padding: 1 }}
          >
            <View className="bg-[#0D0D1A] rounded-3xl p-6">
              {/* Avatar and Name */}
              <View className="items-center mb-6">
                <View className="w-24 h-24 rounded-3xl bg-[#FF3D3D]/20 items-center justify-center mb-4 border-2 border-[#FF3D3D]/30">
                  {ARCHETYPE_ICONS[character.archetype]}
                </View>
                <Text className="text-3xl font-black text-white text-center">
                  {character.name}
                </Text>
                <View className="flex-row items-center mt-2">
                  <View className="bg-[#FF3D3D]/20 px-4 py-1.5 rounded-full">
                    <Text className="text-[#FF3D3D] font-bold text-sm">
                      {archetypeInfo.name}
                    </Text>
                  </View>
                </View>
                <Text className="text-[#00E5FF] text-sm mt-2">{archetypeInfo.title}</Text>
              </View>

              {/* Created Date */}
              <View className="flex-row items-center justify-center mb-4 opacity-60">
                <Calendar size={14} color="#888" />
                <Text className="text-gray-500 text-xs ml-2">Created {createdDate}</Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Attributes Section */}
        <Animated.View entering={FadeInUp.duration(400).delay(100)} className="mt-6">
          <View className="flex-row items-center mb-4">
            <Swords size={18} color="#FF3D3D" />
            <Text className="text-white font-bold text-lg ml-2">Attributes</Text>
          </View>

          <View className="bg-[#12121F] rounded-2xl p-4 border border-[#2A2A40]">
            {Object.entries(character.attributes).map(([key, value], index) => {
              const info = ATTRIBUTE_INFO[key];
              return (
                <Animated.View
                  key={key}
                  entering={SlideInRight.duration(400).delay(150 + index * 50)}
                  className={cn('py-3', index > 0 && 'border-t border-[#2A2A40]')}
                >
                  <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-gray-300 font-medium">{info.label}</Text>
                    <Text className="text-white font-bold text-lg">{value}</Text>
                  </View>
                  <View className="h-2 bg-[#1A1A2E] rounded-full overflow-hidden">
                    <View
                      className="h-full rounded-full"
                      style={{
                        width: `${(value as number) * 10}%`,
                        backgroundColor: info.color,
                      }}
                    />
                  </View>
                </Animated.View>
              );
            })}
          </View>
        </Animated.View>

        {/* Archetype Details */}
        <Animated.View entering={FadeInUp.duration(400).delay(200)} className="mt-6">
          <View className="flex-row items-center mb-4">
            <Sparkles size={18} color="#00E5FF" />
            <Text className="text-white font-bold text-lg ml-2">Archetype Traits</Text>
          </View>

          <View className="bg-[#12121F] rounded-2xl p-4 border border-[#2A2A40]">
            <View className="mb-4">
              <Text className="text-[#00E5FF] text-xs font-bold uppercase tracking-wider mb-1">
                Strength
              </Text>
              <Text className="text-gray-300 leading-5">{archetypeInfo.strength}</Text>
            </View>

            <View className="mb-4 pt-4 border-t border-[#2A2A40]">
              <Text className="text-[#FF6B35] text-xs font-bold uppercase tracking-wider mb-1">
                Weakness
              </Text>
              <Text className="text-gray-300 leading-5">{archetypeInfo.weakness}</Text>
            </View>

            <View className="pt-4 border-t border-[#2A2A40]">
              <Text className="text-purple-400 text-xs font-bold uppercase tracking-wider mb-1">
                Personal Quest
              </Text>
              <Text className="text-gray-300 leading-5 italic">"{archetypeInfo.quest}"</Text>
            </View>
          </View>
        </Animated.View>

        {/* Backstory */}
        <Animated.View entering={FadeInUp.duration(400).delay(300)} className="mt-6">
          <View className="flex-row items-center mb-4">
            <Scroll size={18} color="#A855F7" />
            <Text className="text-white font-bold text-lg ml-2">Backstory</Text>
          </View>

          <View className="bg-[#12121F] rounded-2xl p-4 border border-[#2A2A40]">
            <Text className="text-gray-300 leading-6 italic">
              "{character.backstory}"
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}
