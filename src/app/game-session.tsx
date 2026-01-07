import { useState, useRef, useEffect } from 'react';
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
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  SlideInUp,
} from 'react-native-reanimated';
import {
  User,
  Send,
  Menu,
  Sparkles,
  BookOpen,
  Target,
  Package,
  Users,
  Trophy,
  Settings,
  Dices,
  X,
  Heart,
  Zap,
} from 'lucide-react-native';
import {
  useCharacter,
  useCurrentSession,
  useGameStore,
  ARCHETYPES,
  type StoryMessage,
  type DiceRoll,
  type Item,
  type Attributes,
} from '@/lib/gameStore';
import { InlineDiceRoller } from '@/components/DiceRoller';
import { MarkdownText } from '@/components/MarkdownText';
import { useTranslation } from '@/lib/translations';
import { generateStoryResponse, generateInitialStory } from '@/lib/openai';
import { cn } from '@/lib/cn';

// Interface for pending dice check from Game Master
interface PendingDiceCheck {
  attribute: keyof Attributes;
  dc: number;
  context: string;
}

// Parse dice check request from AI response
function parseDiceCheck(text: string): { cleanText: string; diceCheck: PendingDiceCheck | null } {
  const diceCheckRegex = /\[DICE_CHECK:\s*(\w+)\s+DC:(\d+)\]/i;
  const match = text.match(diceCheckRegex);

  if (match) {
    const attribute = match[1].toLowerCase() as keyof Attributes;
    const dc = parseInt(match[2], 10);
    const validAttributes: (keyof Attributes)[] = ['vision', 'resilience', 'influence', 'wisdom', 'audacity', 'integrity'];

    if (validAttributes.includes(attribute) && !isNaN(dc)) {
      const cleanText = text.replace(diceCheckRegex, '').trim();
      return {
        cleanText,
        diceCheck: {
          attribute,
          dc,
          context: cleanText.split('\n')[0] || 'Skill check required',
        },
      };
    }
  }

  return { cleanText: text, diceCheck: null };
}

// Initial story setup for the 80s era
const INITIAL_STORY = `The year is 1986. Hawkins, Indiana seems like any other sleepy American town - but you know better.

Strange things have been happening. Flickering lights. Missing pets. Whispers of a secret government lab on the outskirts of town. Your friends have been acting... different lately.

Tonight, you find yourself standing outside the abandoned Byers house at the end of Mirkwood. The windows are dark, but you could swear you saw something move inside. Your walkie-talkie crackles with static - or was that a voice?

**What do you do?**`;

const STORY_RESPONSES: Record<string, { text: string; item?: Item; npcMeet?: string }> = {
  investigate: {
    text: `You push open the creaking door and step inside. The air smells of dust and something else... something metallic.

Your flashlight beam cuts through the darkness, revealing walls covered in strange drawings - interconnected lines that seem to pulse when you look away.

In the corner, a Christmas light strand flickers weakly. One bulb blinks rapidly: dot-dash-dot-dash. Morse code?

Before you can decipher it, you hear footsteps upstairs. Heavy. Deliberate.

**Do you:**
A) Climb the stairs to investigate
B) Hide and observe
C) Call out to whoever is there`,
    item: {
      id: 'flashlight',
      name: 'Old Flashlight',
      description: 'A worn but working flashlight found in the Byers house',
      type: 'artifact',
      rarity: 'common',
      icon: 'flashlight',
      quantity: 1,
    },
  },

  hide: {
    text: `You duck behind an overturned couch, heart pounding. Through a gap in the cushions, you watch as a figure descends the stairs.

It's Dr. Brenner's assistant - you recognize him from the newspaper clippings you've been collecting. He's carrying a strange device that hums with an otherworldly energy.

He speaks into a radio: "The gate is destabilizing. We need more subjects."

Your blood runs cold. Subjects?

**Do you:**
A) Follow him when he leaves
B) Search the house for clues after he's gone
C) Rush home to warn your friends`,
    npcMeet: 'dr_owens',
  },

  default: {
    text: `The shadows seem to deepen around you. In this town, every choice matters - and some choices echo in ways you can't imagine.

The wind picks up, carrying whispers of things yet to come. Your journey as a hero has only just begun.

**What path will you choose?**`,
  },
};

export default function GameSessionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const character = useCharacter();
  const currentSession = useCurrentSession();
  const language = useGameStore((s) => s.language);
  const worldConfig = useGameStore((s) => s.worldConfig);
  const startNewSession = useGameStore((s) => s.startNewSession);
  const addMessage = useGameStore((s) => s.addMessage);
  const addItem = useGameStore((s) => s.addItem);
  const meetNPC = useGameStore((s) => s.meetNPC);
  const updateQuestObjective = useGameStore((s) => s.updateQuestObjective);

  const { t } = useTranslation(language);

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isGeneratingInitialStory, setIsGeneratingInitialStory] = useState(false);
  const [pendingDiceCheck, setPendingDiceCheck] = useState<PendingDiceCheck | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  const typingDot = useSharedValue(0);

  const archetypeInfo = character ? ARCHETYPES[character.archetype] : null;

  useEffect(() => {
    if (!character) {
      router.replace('/' as never);
      return;
    }

    // Start new session if none exists
    if (!currentSession && !isGeneratingInitialStory) {
      startNewSession();
      setIsGeneratingInitialStory(true);

      // Generate AI initial story in the selected language
      const generateInitial = async () => {
        try {
          const initialStory = await generateInitialStory({
            characterName: character.name,
            archetypeName: archetypeInfo?.name || 'Hero',
            era: worldConfig.era,
            genre: worldConfig.genre,
            tone: worldConfig.tone,
            language: language,
          });

          addMessage({
            type: 'narration',
            content: initialStory,
          });
        } catch (error) {
          console.error('Failed to generate initial story:', error);
          // Fallback to translated static story
          addMessage({
            type: 'narration',
            content: t('initialStory'),
          });
        } finally {
          setIsGeneratingInitialStory(false);
        }
      };

      // Small delay before generating
      setTimeout(generateInitial, 500);
    }
  }, [character, currentSession, isGeneratingInitialStory]);

  useEffect(() => {
    // Typing animation
    typingDot.value = withRepeat(
      withTiming(1, { duration: 600, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const typingStyle = useAnimatedStyle(() => ({
    opacity: typingDot.value,
  }));

  const handleDiceRoll = (result: DiceRoll) => {
    addMessage({
      type: 'dice',
      content: `Rolled ${result.type.toUpperCase()}: **${result.result}**${
        result.modifier !== 0 ? ` (${result.modifier > 0 ? '+' : ''}${result.modifier} = ${result.total})` : ''
      }${result.success !== undefined ? ` - ${result.success ? '**SUCCESS**' : '**FAILURE**'}` : ''}`,
      diceRoll: result,
    });

    // Clear pending dice check after rolling
    if (pendingDiceCheck) {
      setPendingDiceCheck(null);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isTyping || !character) return;

    const userMessage = input.trim();
    setInput('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Add player message
    addMessage({
      type: 'player',
      content: userMessage,
    });

    // Start AI response
    setIsTyping(true);

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      // Build conversation history from messages
      const conversationHistory = messages
        .filter((m) => m.type === 'player' || m.type === 'narration')
        .map((m) => ({
          role: m.type === 'player' ? 'player' as const : 'narrator' as const,
          content: m.content,
        }));

      // Generate AI response in the selected language
      const aiResponse = await generateStoryResponse(
        {
          characterName: character.name,
          archetypeName: archetypeInfo?.name || 'Hero',
          era: worldConfig.era,
          genre: worldConfig.genre,
          tone: worldConfig.tone,
          language: language,
          conversationHistory,
        },
        userMessage
      );

      // Parse the response for dice check requests
      const { cleanText, diceCheck } = parseDiceCheck(aiResponse);

      addMessage({
        type: 'narration',
        content: cleanText,
      });

      // Set pending dice check if AI requested one
      if (diceCheck) {
        setPendingDiceCheck(diceCheck);
      }
    } catch (error) {
      console.error('Failed to generate AI response:', error);
      // Fallback to static response
      const response = STORY_RESPONSES.default;
      addMessage({
        type: 'narration',
        content: response.text,
      });
    }

    setIsTyping(false);

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const messages = currentSession?.messages ?? [];

  if (!character) {
    return (
      <View className="flex-1 bg-[#0A0A14] items-center justify-center">
        <ActivityIndicator color="#FF3D3D" />
      </View>
    );
  }

  const healthPercent = (character.health / character.maxHealth) * 100;
  const energyPercent = (character.energy / character.maxEnergy) * 100;

  return (
    <View className="flex-1 bg-[#0A0A14]">
      <LinearGradient
        colors={['#1A1025', '#0A0A14']}
        style={{ position: 'absolute', width: '100%', height: '100%' }}
      />

      {/* Header */}
      <View
        className="flex-row items-center justify-between px-4 pb-3 border-b border-[#1A1A2E]"
        style={{ paddingTop: insets.top + 8 }}
      >
        <Pressable
          onPress={() => router.push('/character-sheet' as never)}
          className="flex-row items-center flex-1"
        >
          <View className="w-10 h-10 rounded-full bg-[#FF3D3D]/20 items-center justify-center mr-3">
            <User size={20} color="#FF3D3D" />
          </View>
          <View className="flex-1">
            <Text className="text-white font-bold">{character.name}</Text>
            <View className="flex-row items-center mt-1">
              {/* Health bar */}
              <Heart size={10} color="#EF4444" />
              <View className="w-12 h-1.5 bg-[#1A1A2E] rounded-full mx-1 overflow-hidden">
                <View className="h-full bg-[#EF4444] rounded-full" style={{ width: `${healthPercent}%` }} />
              </View>
              {/* Energy bar */}
              <Zap size={10} color="#3B82F6" />
              <View className="w-12 h-1.5 bg-[#1A1A2E] rounded-full mx-1 overflow-hidden">
                <View className="h-full bg-[#3B82F6] rounded-full" style={{ width: `${energyPercent}%` }} />
              </View>
            </View>
          </View>
        </Pressable>

        <View className="flex-row items-center">
          <View className="bg-[#00E5FF]/20 px-3 py-1 rounded-full mr-2">
            <Text className="text-[#00E5FF] text-xs font-medium">Lv.{character.level}</Text>
          </View>
          <Pressable
            onPress={() => setShowMenu(!showMenu)}
            className="w-10 h-10 rounded-full bg-[#1A1A2E] items-center justify-center ml-2"
          >
            {showMenu ? <X size={20} color="#fff" /> : <Menu size={20} color="#fff" />}
          </Pressable>
        </View>
      </View>

      {/* Quick Menu */}
      {showMenu && (
        <Animated.View
          entering={SlideInUp.duration(200)}
          className="absolute top-0 left-0 right-0 z-50 bg-[#12121F] border-b border-[#2A2A40]"
          style={{ paddingTop: insets.top + 60 }}
        >
          <View className="flex-row flex-wrap p-4 gap-3">
            <MenuButton
              icon={Target}
              label="Quests"
              onPress={() => {
                setShowMenu(false);
                router.push('/quest-log' as never);
              }}
            />
            <MenuButton
              icon={Package}
              label="Inventory"
              onPress={() => {
                setShowMenu(false);
                router.push('/inventory' as never);
              }}
            />
            <MenuButton
              icon={Users}
              label="Characters"
              onPress={() => {
                setShowMenu(false);
                router.push('/npcs' as never);
              }}
            />
            <MenuButton
              icon={Trophy}
              label="Achievements"
              onPress={() => {
                setShowMenu(false);
                router.push('/achievements' as never);
              }}
            />
            <MenuButton
              icon={Settings}
              label="Settings"
              onPress={() => {
                setShowMenu(false);
                router.push('/settings' as never);
              }}
            />
            <MenuButton
              icon={User}
              label="Character"
              onPress={() => {
                setShowMenu(false);
                router.push('/character-sheet' as never);
              }}
            />
          </View>
        </Animated.View>
      )}

      {/* Story Content */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
        keyboardVerticalOffset={0}
      >
        <ScrollView
          ref={scrollViewRef}
          className="flex-1 px-4"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 20 }}
        >
          {messages.map((message, index) => (
            <MessageBubble key={message.id} message={message} index={index} />
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <Animated.View
              entering={FadeIn.duration(300)}
              className="flex-row items-center mt-4"
            >
              <View className="w-8 h-8 rounded-full bg-[#FF3D3D]/20 items-center justify-center mr-2">
                <Sparkles size={16} color="#FF3D3D" />
              </View>
              <View className="bg-[#12121F] rounded-2xl px-4 py-3 flex-row">
                <Animated.View
                  style={typingStyle}
                  className="w-2 h-2 rounded-full bg-gray-400 mr-1"
                />
                <Animated.View
                  style={[typingStyle, { opacity: 0.6 }]}
                  className="w-2 h-2 rounded-full bg-gray-400 mr-1"
                />
                <Animated.View
                  style={[typingStyle, { opacity: 0.3 }]}
                  className="w-2 h-2 rounded-full bg-gray-400"
                />
              </View>
            </Animated.View>
          )}
        </ScrollView>

        {/* Dice Check Prompt - Only shows when Game Master requests a roll */}
        {pendingDiceCheck && (
          <Animated.View
            entering={FadeInUp.duration(300)}
            className="mx-4 mb-3 bg-[#1A1A2E] rounded-2xl border border-[#F59E0B]/30 overflow-hidden"
          >
            <View className="bg-[#F59E0B]/10 px-4 py-2 flex-row items-center">
              <Dices size={16} color="#F59E0B" />
              <Text className="text-[#F59E0B] font-bold ml-2">Skill Check Required!</Text>
            </View>
            <View className="p-4">
              <Text className="text-gray-300 text-sm mb-3">
                The Game Master requires a <Text className="text-[#F59E0B] font-bold">{pendingDiceCheck.attribute.toUpperCase()}</Text> check (DC {pendingDiceCheck.dc})
              </Text>
              <InlineDiceRoller
                onRoll={handleDiceRoll}
                requiredAttribute={pendingDiceCheck.attribute}
                difficultyClass={pendingDiceCheck.dc}
              />
            </View>
          </Animated.View>
        )}

        {/* Input Area */}
        <View
          className="px-4 pt-3 border-t border-[#1A1A2E]"
          style={{ paddingBottom: insets.bottom + 8 }}
        >
          <View className="flex-row items-end">
            <View className="flex-1 bg-[#12121F] rounded-2xl border border-[#2A2A40] mr-3">
              <TextInput
                value={input}
                onChangeText={setInput}
                placeholder={t('describeAction')}
                placeholderTextColor="#666"
                className="px-4 py-3 text-white text-base"
                multiline
                maxLength={500}
                style={{ maxHeight: 100 }}
              />
            </View>
            <Pressable
              onPress={handleSendMessage}
              disabled={!input.trim() || isTyping}
              className={cn(
                'w-12 h-12 rounded-full items-center justify-center',
                input.trim() && !isTyping ? 'bg-[#FF3D3D]' : 'bg-[#2A2A40]'
              )}
            >
              <Send size={20} color="#fff" />
            </Pressable>
          </View>

          <Text className="text-gray-600 text-xs text-center mt-2">
            {t('actionHint')}
          </Text>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

function MenuButton({
  icon: Icon,
  label,
  onPress,
}: {
  icon: typeof Target;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      className="bg-[#1A1A2E] rounded-xl p-3 items-center min-w-[70px]"
    >
      <Icon size={20} color="#FF3D3D" />
      <Text className="text-gray-300 text-xs mt-1">{label}</Text>
    </Pressable>
  );
}

function MessageBubble({ message, index }: { message: StoryMessage; index: number }) {
  const isPlayer = message.type === 'player';
  const isDice = message.type === 'dice';
  const isSystem = message.type === 'system';

  return (
    <Animated.View
      entering={FadeInUp.duration(400).delay(Math.min(index * 50, 200))}
      className={cn('mb-4', isPlayer && 'items-end')}
    >
      {!isPlayer && !isDice && !isSystem && (
        <View className="flex-row items-center mb-2">
          <View className="w-6 h-6 rounded-full bg-[#FF3D3D]/20 items-center justify-center mr-2">
            <BookOpen size={12} color="#FF3D3D" />
          </View>
          <Text className="text-[#FF3D3D] text-xs font-medium">Game Master</Text>
        </View>
      )}

      {isDice && (
        <View className="flex-row items-center mb-2">
          <View className="w-6 h-6 rounded-full bg-[#F59E0B]/20 items-center justify-center mr-2">
            <Dices size={12} color="#F59E0B" />
          </View>
          <Text className="text-[#F59E0B] text-xs font-medium">Dice Roll</Text>
        </View>
      )}

      {isSystem && (
        <View className="flex-row items-center mb-2">
          <View className="w-6 h-6 rounded-full bg-[#10B981]/20 items-center justify-center mr-2">
            <Sparkles size={12} color="#10B981" />
          </View>
          <Text className="text-[#10B981] text-xs font-medium">System</Text>
        </View>
      )}

      <View
        className={cn(
          'rounded-2xl px-4 py-3 max-w-[90%]',
          isPlayer
            ? 'bg-[#FF3D3D]/20 rounded-br-sm'
            : isDice
            ? 'bg-[#F59E0B]/10 border border-[#F59E0B]/30 rounded-tl-sm'
            : isSystem
            ? 'bg-[#10B981]/10 border border-[#10B981]/30 rounded-tl-sm'
            : 'bg-[#12121F] border border-[#2A2A40] rounded-tl-sm'
        )}
      >
        <MarkdownText
          className={cn(
            isPlayer ? 'text-white' : isDice ? 'text-[#F59E0B]' : isSystem ? 'text-[#10B981]' : 'text-gray-200'
          )}
          baseColor={isPlayer ? '#fff' : isDice ? '#F59E0B' : isSystem ? '#10B981' : '#e5e7eb'}
        >
          {message.content}
        </MarkdownText>
      </View>

      {isPlayer && (
        <Text className="text-gray-600 text-xs mt-1 mr-1">You</Text>
      )}
    </Animated.View>
  );
}
