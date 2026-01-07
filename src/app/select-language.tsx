import { useState } from 'react';
import { View, Text, Pressable, ScrollView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { Globe, Check, ChevronRight, Sparkles } from 'lucide-react-native';
import { useGameStore, LANGUAGES, type Language } from '@/lib/gameStore';
import { useTranslation } from '@/lib/translations';
import { cn } from '@/lib/cn';

const { width, height } = Dimensions.get('window');

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function SelectLanguageScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const currentLanguage = useGameStore((s) => s.language);
  const setLanguage = useGameStore((s) => s.setLanguage);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(currentLanguage);

  // Get translations for the selected language (for preview)
  const { t } = useTranslation(selectedLanguage);

  // Floating animation for globe
  const floatAnim = useSharedValue(0);
  floatAnim.value = withRepeat(
    withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
    -1,
    true
  );

  const globeStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(floatAnim.value, [0, 1], [-8, 8]) },
      { rotate: `${interpolate(floatAnim.value, [0, 1], [-5, 5])}deg` },
    ],
  }));

  const handleSelectLanguage = (lang: Language) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedLanguage(lang);
  };

  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLanguage(selectedLanguage);
    router.back();
  };

  const languageList = Object.values(LANGUAGES);

  return (
    <View className="flex-1 bg-[#05050A]">
      {/* Background gradient layers */}
      <LinearGradient
        colors={['#0A0A18', '#05050A', '#0D0510']}
        style={{ position: 'absolute', width: '100%', height: '100%' }}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Decorative orbs */}
      <View
        style={{
          position: 'absolute',
          top: height * 0.08,
          left: -80,
          width: 200,
          height: 200,
          borderRadius: 100,
          backgroundColor: '#FF3D3D',
          opacity: 0.08,
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: height * 0.4,
          right: -60,
          width: 150,
          height: 150,
          borderRadius: 75,
          backgroundColor: '#00E5FF',
          opacity: 0.06,
        }}
      />
      <View
        style={{
          position: 'absolute',
          bottom: height * 0.15,
          left: width * 0.3,
          width: 100,
          height: 100,
          borderRadius: 50,
          backgroundColor: '#A855F7',
          opacity: 0.05,
        }}
      />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 20,
          paddingBottom: insets.bottom + 100,
          paddingHorizontal: 24,
        }}
      >
        {/* Header */}
        <Animated.View
          entering={FadeInDown.duration(600).delay(100)}
          className="items-center mb-8"
        >
          <Animated.View style={globeStyle} className="mb-4">
            <View className="w-20 h-20 rounded-full bg-gradient-to-br items-center justify-center">
              <LinearGradient
                colors={['#FF3D3D20', '#A855F720']}
                style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  borderRadius: 40,
                }}
              />
              <Globe size={40} color="#FF3D3D" strokeWidth={1.5} />
            </View>
          </Animated.View>

          <Text className="text-3xl font-bold text-white text-center tracking-wide">
            Choose Your Language
          </Text>
          <Text className="text-gray-500 text-center mt-2 text-sm">
            Select the language for your adventure
          </Text>
        </Animated.View>

        {/* Language Grid */}
        <View className="gap-3">
          {languageList.map((lang, index) => {
            const isSelected = selectedLanguage === lang.id;
            return (
              <Animated.View
                key={lang.id}
                entering={FadeInUp.duration(400).delay(150 + index * 50)}
              >
                <Pressable
                  onPress={() => handleSelectLanguage(lang.id)}
                  className="active:scale-[0.98]"
                >
                  <View
                    className={cn(
                      'rounded-2xl overflow-hidden border',
                      isSelected
                        ? 'border-[#FF3D3D]/50'
                        : 'border-white/5'
                    )}
                  >
                    <BlurView
                      intensity={isSelected ? 40 : 20}
                      tint="dark"
                      style={{ overflow: 'hidden' }}
                    >
                      <View
                        className={cn(
                          'flex-row items-center px-5 py-4',
                          isSelected && 'bg-[#FF3D3D]/10'
                        )}
                      >
                        {/* Flag */}
                        <Text className="text-3xl mr-4">{lang.flag}</Text>

                        {/* Language info */}
                        <View className="flex-1">
                          <Text
                            className={cn(
                              'text-lg font-semibold',
                              isSelected ? 'text-white' : 'text-gray-200'
                            )}
                          >
                            {lang.nativeName}
                          </Text>
                          <Text className="text-gray-500 text-sm">
                            {lang.name}
                          </Text>
                        </View>

                        {/* Selection indicator */}
                        <View
                          className={cn(
                            'w-7 h-7 rounded-full items-center justify-center',
                            isSelected
                              ? 'bg-[#FF3D3D]'
                              : 'bg-white/10 border border-white/20'
                          )}
                        >
                          {isSelected && (
                            <Check size={16} color="#fff" strokeWidth={3} />
                          )}
                        </View>
                      </View>
                    </BlurView>
                  </View>
                </Pressable>
              </Animated.View>
            );
          })}
        </View>

        {/* Info note */}
        <Animated.View
          entering={FadeIn.duration(600).delay(800)}
          className="mt-6 flex-row items-center justify-center"
        >
          <Sparkles size={14} color="#666" />
          <Text className="text-gray-600 text-xs ml-2 text-center">
            AI Game Master will respond in your chosen language
          </Text>
        </Animated.View>

        {/* Language Preview Card */}
        <Animated.View
          entering={FadeIn.duration(600).delay(900)}
          className="mt-6"
        >
          <View className="bg-[#12121F] rounded-2xl border border-[#2A2A40] p-4">
            <Text className="text-gray-500 text-xs uppercase tracking-wider mb-3">
              Preview
            </Text>
            <Text className="text-white font-semibold text-lg mb-1">
              {t('welcomeTitle')}
            </Text>
            <Text className="text-gray-400 text-sm mb-3">
              {t('createHeroDesc')}
            </Text>
            <View className="bg-[#FF3D3D]/10 rounded-xl py-3 px-4">
              <Text className="text-[#FF3D3D] font-bold text-center">
                {t('continueAdventure')}
              </Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Bottom CTA */}
      <View
        className="absolute bottom-0 left-0 right-0 px-6"
        style={{ paddingBottom: insets.bottom + 16 }}
      >
        <BlurView
          intensity={80}
          tint="dark"
          style={{
            position: 'absolute',
            top: -20,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        />
        <Animated.View entering={FadeInUp.duration(500).delay(600)}>
          <AnimatedPressable
            onPress={handleContinue}
            className="active:scale-[0.98]"
          >
            <LinearGradient
              colors={['#FF3D3D', '#FF6B35']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ borderRadius: 16, padding: 1 }}
            >
              <View className="bg-transparent rounded-[15px] py-4 flex-row items-center justify-center">
                <Text className="text-white text-lg font-bold mr-2">
                  {t('continue')}
                </Text>
                <ChevronRight size={20} color="#fff" />
              </View>
            </LinearGradient>
          </AnimatedPressable>
        </Animated.View>
      </View>
    </View>
  );
}
