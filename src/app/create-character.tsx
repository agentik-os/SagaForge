import { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Animated, {
  FadeIn,
  FadeInUp,
  FadeInDown,
  SlideInRight,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import {
  ChevronLeft,
  Eye,
  Brain,
  Users,
  Sparkles,
  Shield,
  Search,
  Check,
  ChevronRight,
  Wand2,
} from 'lucide-react-native';
import { useGameStore, ARCHETYPES, type Archetype, type Character } from '@/lib/gameStore';
import { generateBackstory } from '@/lib/openai';
import { cn } from '@/lib/cn';

const ARCHETYPE_ICONS: Record<Archetype, React.ReactNode> = {
  visionary: <Eye size={28} color="#FF3D3D" />,
  strategist: <Brain size={28} color="#FF3D3D" />,
  connector: <Users size={28} color="#FF3D3D" />,
  creator: <Sparkles size={28} color="#FF3D3D" />,
  protector: <Shield size={28} color="#FF3D3D" />,
  seeker: <Search size={28} color="#FF3D3D" />,
};

type Step = 'archetype' | 'details' | 'attributes';

export default function CreateCharacterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const setCharacter = useGameStore((s) => s.setCharacter);

  const [step, setStep] = useState<Step>('archetype');
  const [selectedArchetype, setSelectedArchetype] = useState<Archetype | null>(null);
  const [name, setName] = useState('');
  const [backstory, setBackstory] = useState('');
  const [attributes, setAttributes] = useState({
    vision: 5,
    resilience: 5,
    influence: 5,
    wisdom: 5,
    audacity: 5,
    integrity: 5,
  });
  const [remainingPoints, setRemainingPoints] = useState(6);
  const [isGeneratingBackstory, setIsGeneratingBackstory] = useState(false);

  const nameInputRef = useRef<TextInput>(null);

  const handleGenerateBackstory = async () => {
    if (!selectedArchetype || !name.trim()) return;

    setIsGeneratingBackstory(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const archetype = ARCHETYPES[selectedArchetype];
      const generatedBackstory = await generateBackstory(
        name.trim(),
        archetype.name,
        archetype.title,
        archetype.strength,
        archetype.weakness
      );
      setBackstory(generatedBackstory);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Failed to generate backstory:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      // Set a fallback backstory
      setBackstory(`${name.trim()} emerged from the shadows of Hawkins, carrying secrets that even they don't fully understand. The strange events of 1986 have awakened something dormant within them...`);
    } finally {
      setIsGeneratingBackstory(false);
    }
  };

  const handleSelectArchetype = (archetype: Archetype) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedArchetype(archetype);
  };

  const handleNextStep = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (step === 'archetype' && selectedArchetype) {
      setStep('details');
    } else if (step === 'details' && name.trim()) {
      setStep('attributes');
    }
  };

  const handlePrevStep = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step === 'details') {
      setStep('archetype');
    } else if (step === 'attributes') {
      setStep('details');
    } else {
      router.back();
    }
  };

  const handleAttributeChange = (attr: keyof typeof attributes, delta: number) => {
    const newValue = attributes[attr] + delta;
    if (newValue < 1 || newValue > 10) return;
    if (delta > 0 && remainingPoints <= 0) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setAttributes((prev) => ({ ...prev, [attr]: newValue }));
    setRemainingPoints((prev) => prev - delta);
  };

  const handleCreateCharacter = () => {
    if (!selectedArchetype || !name.trim()) return;

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const character: Character = {
      id: `char_${Date.now()}`,
      name: name.trim(),
      archetype: selectedArchetype,
      backstory: backstory.trim() || 'A mysterious hero whose past remains shrouded in shadows...',
      attributes,
      createdAt: Date.now(),
      level: 1,
      experience: 0,
      health: 100,
      maxHealth: 100,
      energy: 100,
      maxEnergy: 100,
      gold: 50,
      currentEra: 'stranger_things',
    };

    setCharacter(character);
    router.replace('/game-session' as never);
  };

  const canProceed =
    (step === 'archetype' && selectedArchetype) ||
    (step === 'details' && name.trim().length >= 2) ||
    (step === 'attributes' && remainingPoints >= 0);

  return (
    <View className="flex-1 bg-[#0A0A14]">
      <LinearGradient
        colors={['#1A1025', '#0A0A14', '#0D0D1A']}
        style={{ position: 'absolute', width: '100%', height: '100%' }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* Header */}
        <View
          className="flex-row items-center justify-between px-4 pb-4"
          style={{ paddingTop: insets.top + 8 }}
        >
          <Pressable
            onPress={handlePrevStep}
            className="w-10 h-10 rounded-full bg-[#1A1A2E] items-center justify-center"
          >
            <ChevronLeft size={24} color="#fff" />
          </Pressable>

          <View className="flex-row">
            {(['archetype', 'details', 'attributes'] as Step[]).map((s, i) => (
              <View
                key={s}
                className={cn(
                  'w-2.5 h-2.5 rounded-full mx-1',
                  step === s ? 'bg-[#FF3D3D]' : 'bg-[#2A2A40]'
                )}
              />
            ))}
          </View>

          <View className="w-10" />
        </View>

        <ScrollView
          className="flex-1 px-6"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Step: Archetype Selection */}
          {step === 'archetype' && (
            <Animated.View entering={FadeIn.duration(400)}>
              <Text className="text-3xl font-bold text-white mb-2">Choose Your Path</Text>
              <Text className="text-gray-400 mb-6">
                Your archetype defines your strengths and the lens through which you see the world.
              </Text>

              <View className="gap-3">
                {(Object.keys(ARCHETYPES) as Archetype[]).map((archetype, index) => {
                  const info = ARCHETYPES[archetype];
                  const isSelected = selectedArchetype === archetype;

                  return (
                    <Animated.View
                      key={archetype}
                      entering={SlideInRight.duration(400).delay(index * 80)}
                    >
                      <Pressable
                        onPress={() => handleSelectArchetype(archetype)}
                        className="active:scale-[0.98]"
                      >
                        <View
                          className={cn(
                            'rounded-2xl p-4 border',
                            isSelected
                              ? 'bg-[#FF3D3D]/10 border-[#FF3D3D]'
                              : 'bg-[#12121F] border-[#2A2A40]'
                          )}
                        >
                          <View className="flex-row items-center">
                            <View
                              className={cn(
                                'w-12 h-12 rounded-xl items-center justify-center mr-3',
                                isSelected ? 'bg-[#FF3D3D]/20' : 'bg-[#1A1A2E]'
                              )}
                            >
                              {ARCHETYPE_ICONS[archetype]}
                            </View>
                            <View className="flex-1">
                              <Text className="text-white font-bold text-base">{info.name}</Text>
                              <Text className="text-gray-400 text-xs">{info.title}</Text>
                            </View>
                            {isSelected && (
                              <View className="w-6 h-6 rounded-full bg-[#FF3D3D] items-center justify-center">
                                <Check size={14} color="#fff" strokeWidth={3} />
                              </View>
                            )}
                          </View>

                          {isSelected && (
                            <Animated.View entering={FadeIn.duration(300)} className="mt-3 pt-3 border-t border-[#2A2A40]">
                              <View className="mb-2">
                                <Text className="text-[#00E5FF] text-xs font-medium mb-1">Strength</Text>
                                <Text className="text-gray-300 text-sm">{info.strength}</Text>
                              </View>
                              <View className="mb-2">
                                <Text className="text-[#FF6B35] text-xs font-medium mb-1">Weakness</Text>
                                <Text className="text-gray-300 text-sm">{info.weakness}</Text>
                              </View>
                              <View>
                                <Text className="text-purple-400 text-xs font-medium mb-1">Personal Quest</Text>
                                <Text className="text-gray-300 text-sm italic">"{info.quest}"</Text>
                              </View>
                            </Animated.View>
                          )}
                        </View>
                      </Pressable>
                    </Animated.View>
                  );
                })}
              </View>
            </Animated.View>
          )}

          {/* Step: Character Details */}
          {step === 'details' && (
            <Animated.View entering={FadeIn.duration(400)}>
              <Text className="text-3xl font-bold text-white mb-2">Name Your Hero</Text>
              <Text className="text-gray-400 mb-6">
                Every legend begins with a name. What shall we call you?
              </Text>

              <View className="mb-6">
                <Text className="text-gray-300 text-sm font-medium mb-2">Character Name</Text>
                <TextInput
                  ref={nameInputRef}
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter your hero's name..."
                  placeholderTextColor="#666"
                  className="bg-[#12121F] rounded-xl px-4 py-4 text-white text-lg border border-[#2A2A40]"
                  autoFocus
                  maxLength={24}
                />
              </View>

              <View>
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-gray-300 text-sm font-medium">
                    Backstory <Text className="text-gray-500">(optional)</Text>
                  </Text>
                  {name.trim().length >= 2 && (
                    <Pressable
                      onPress={handleGenerateBackstory}
                      disabled={isGeneratingBackstory}
                      className={cn(
                        'flex-row items-center px-3 py-1.5 rounded-lg',
                        isGeneratingBackstory ? 'bg-[#A855F7]/30' : 'bg-[#A855F7]/20'
                      )}
                    >
                      {isGeneratingBackstory ? (
                        <ActivityIndicator size="small" color="#A855F7" />
                      ) : (
                        <Wand2 size={14} color="#A855F7" />
                      )}
                      <Text className="text-[#A855F7] text-xs font-bold ml-1.5">
                        {isGeneratingBackstory ? 'Generating...' : 'AI Generate'}
                      </Text>
                    </Pressable>
                  )}
                </View>
                <TextInput
                  value={backstory}
                  onChangeText={setBackstory}
                  placeholder="What shaped your hero's past? What drives them forward?"
                  placeholderTextColor="#666"
                  className="bg-[#12121F] rounded-xl px-4 py-4 text-white text-base border border-[#2A2A40]"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  style={{ minHeight: 120 }}
                  maxLength={500}
                  editable={!isGeneratingBackstory}
                />
                <Text className="text-gray-600 text-xs text-right mt-1">
                  {backstory.length}/500
                </Text>
              </View>

              {selectedArchetype && (
                <View className="mt-6 p-4 bg-[#12121F] rounded-xl border border-[#2A2A40]">
                  <View className="flex-row items-center">
                    <View className="w-10 h-10 rounded-lg bg-[#FF3D3D]/20 items-center justify-center mr-3">
                      {ARCHETYPE_ICONS[selectedArchetype]}
                    </View>
                    <View>
                      <Text className="text-gray-400 text-xs">Selected Archetype</Text>
                      <Text className="text-white font-bold">
                        {ARCHETYPES[selectedArchetype].name}
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            </Animated.View>
          )}

          {/* Step: Attributes */}
          {step === 'attributes' && (
            <Animated.View entering={FadeIn.duration(400)}>
              <Text className="text-3xl font-bold text-white mb-2">Forge Your Soul</Text>
              <Text className="text-gray-400 mb-4">
                Distribute points across your philosophical attributes.
              </Text>

              <View className="bg-[#12121F] rounded-xl p-4 mb-6 border border-[#2A2A40]">
                <Text className="text-gray-400 text-sm text-center">
                  Points remaining:{' '}
                  <Text
                    className={cn(
                      'font-bold',
                      remainingPoints > 0 ? 'text-[#00E5FF]' : 'text-gray-500'
                    )}
                  >
                    {remainingPoints}
                  </Text>
                </Text>
              </View>

              <View className="gap-4">
                {(
                  [
                    { key: 'vision', label: 'Vision', desc: 'See beyond the obvious' },
                    { key: 'resilience', label: 'Resilience', desc: 'Bounce back from setbacks' },
                    { key: 'influence', label: 'Influence', desc: 'Impact on others' },
                    { key: 'wisdom', label: 'Wisdom', desc: 'Make good decisions' },
                    { key: 'audacity', label: 'Audacity', desc: 'Take bold risks' },
                    { key: 'integrity', label: 'Integrity', desc: 'Alignment of words and actions' },
                  ] as const
                ).map(({ key, label, desc }) => (
                  <View key={key} className="bg-[#12121F] rounded-xl p-4 border border-[#2A2A40]">
                    <View className="flex-row justify-between items-center mb-2">
                      <View>
                        <Text className="text-white font-bold">{label}</Text>
                        <Text className="text-gray-500 text-xs">{desc}</Text>
                      </View>
                      <Text className="text-2xl font-bold text-[#FF3D3D]">
                        {attributes[key]}
                      </Text>
                    </View>

                    <View className="flex-row items-center">
                      <Pressable
                        onPress={() => handleAttributeChange(key, -1)}
                        className="w-10 h-10 rounded-lg bg-[#1A1A2E] items-center justify-center"
                        disabled={attributes[key] <= 1}
                      >
                        <Text className="text-white text-xl font-bold">-</Text>
                      </Pressable>

                      <View className="flex-1 mx-3 h-2 bg-[#1A1A2E] rounded-full overflow-hidden">
                        <View
                          className="h-full bg-[#FF3D3D] rounded-full"
                          style={{ width: `${attributes[key] * 10}%` }}
                        />
                      </View>

                      <Pressable
                        onPress={() => handleAttributeChange(key, 1)}
                        className="w-10 h-10 rounded-lg bg-[#1A1A2E] items-center justify-center"
                        disabled={attributes[key] >= 10 || remainingPoints <= 0}
                      >
                        <Text className="text-white text-xl font-bold">+</Text>
                      </Pressable>
                    </View>
                  </View>
                ))}
              </View>
            </Animated.View>
          )}

          <View style={{ height: 120 }} />
        </ScrollView>

        {/* Bottom CTA */}
        <View
          className="px-6 pb-2"
          style={{ paddingBottom: insets.bottom + 8 }}
        >
          <Pressable
            onPress={step === 'attributes' ? handleCreateCharacter : handleNextStep}
            disabled={!canProceed}
            className={cn('active:scale-95', !canProceed && 'opacity-50')}
          >
            <LinearGradient
              colors={canProceed ? ['#FF3D3D', '#FF6B35'] : ['#2A2A40', '#1A1A2E']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ borderRadius: 16 }}
            >
              <View className="py-4 flex-row items-center justify-center">
                <Text className="text-white text-lg font-bold mr-2">
                  {step === 'attributes' ? 'Begin Your Adventure' : 'Continue'}
                </Text>
                <ChevronRight size={20} color="#fff" />
              </View>
            </LinearGradient>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
