import { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeInUp, SlideInRight } from 'react-native-reanimated';
import {
  X,
  BookOpen,
  Scroll,
  MapPin,
  User,
  Package,
  Sparkles,
  ChevronRight,
  Filter,
  Calendar,
} from 'lucide-react-native';
import {
  useJournal,
  useGameStore,
  ERAS,
  type JournalEntry,
  type JournalEntryType,
} from '@/lib/gameStore';
import { cn } from '@/lib/cn';

const TYPE_CONFIG: Record<JournalEntryType, { color: string; icon: typeof Scroll; label: string }> = {
  story: { color: '#FF3D3D', icon: Scroll, label: 'Story' },
  discovery: { color: '#00E5FF', icon: Sparkles, label: 'Discovery' },
  character: { color: '#A855F7', icon: User, label: 'Character' },
  location: { color: '#10B981', icon: MapPin, label: 'Location' },
  item: { color: '#F59E0B', icon: Package, label: 'Item' },
  lore: { color: '#EC4899', icon: BookOpen, label: 'Lore' },
};

const FILTERS: JournalEntryType[] = ['story', 'discovery', 'character', 'location', 'item', 'lore'];

export default function JournalScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const journal = useJournal();
  const addJournalEntry = useGameStore((s) => s.addJournalEntry);

  const [activeFilter, setActiveFilter] = useState<JournalEntryType | 'all'>('all');
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null);

  const filteredEntries = activeFilter === 'all'
    ? journal
    : journal.filter((e) => e.type === activeFilter);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleAddSampleEntry = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    addJournalEntry({
      type: 'story',
      title: 'The Beginning',
      content: 'My adventure in Hawkins has begun. Strange lights flicker in the distance, and an uneasy feeling settles in my stomach. Something is watching from the shadows...',
      icon: 'scroll',
      era: 'stranger_things',
    });
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
          <BookOpen size={24} color="#A855F7" />
          <Text className="text-xl font-bold text-white ml-2">Journal</Text>
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

      {/* Filters */}
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
              setActiveFilter('all');
            }}
            className={cn(
              'px-4 py-2 rounded-full border',
              activeFilter === 'all'
                ? 'bg-[#A855F7]/20 border-[#A855F7]'
                : 'bg-[#1A1A2E] border-[#2A2A40]'
            )}
          >
            <Text
              className={cn(
                'text-sm font-medium',
                activeFilter === 'all' ? 'text-[#A855F7]' : 'text-gray-400'
              )}
            >
              All
            </Text>
          </Pressable>

          {FILTERS.map((filter) => {
            const config = TYPE_CONFIG[filter];
            const isActive = activeFilter === filter;
            return (
              <Pressable
                key={filter}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setActiveFilter(filter);
                }}
                className={cn(
                  'px-4 py-2 rounded-full border flex-row items-center',
                  isActive
                    ? `border-[${config.color}]`
                    : 'bg-[#1A1A2E] border-[#2A2A40]'
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
        {filteredEntries.length === 0 ? (
          <Animated.View entering={FadeIn.duration(400)} className="items-center py-12">
            <BookOpen size={48} color="#2A2A40" />
            <Text className="text-gray-500 text-center mt-4 mb-6">
              Your journal is empty. Your adventures will be recorded here.
            </Text>
            <Pressable
              onPress={handleAddSampleEntry}
              className="px-6 py-3 bg-[#A855F7]/20 rounded-xl border border-[#A855F7]"
            >
              <Text className="text-[#A855F7] font-bold">Add Sample Entry</Text>
            </Pressable>
          </Animated.View>
        ) : (
          <View className="gap-3">
            {filteredEntries.map((entry, index) => {
              const config = TYPE_CONFIG[entry.type];
              const IconComponent = config.icon;
              const isExpanded = expandedEntry === entry.id;
              const eraInfo = ERAS[entry.era];

              return (
                <Animated.View
                  key={entry.id}
                  entering={SlideInRight.duration(400).delay(index * 50)}
                >
                  <Pressable
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setExpandedEntry(isExpanded ? null : entry.id);
                    }}
                    className="active:scale-[0.98]"
                  >
                    <View className="bg-[#12121F] rounded-2xl p-4 border border-[#2A2A40]">
                      {/* Header */}
                      <View className="flex-row items-start justify-between mb-2">
                        <View className="flex-row items-center flex-1">
                          <View
                            className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                            style={{ backgroundColor: `${config.color}20` }}
                          >
                            <IconComponent size={20} color={config.color} />
                          </View>
                          <View className="flex-1">
                            <View className="flex-row items-center mb-0.5">
                              <View
                                className="px-2 py-0.5 rounded-full mr-2"
                                style={{ backgroundColor: `${config.color}20` }}
                              >
                                <Text
                                  className="text-xs font-bold"
                                  style={{ color: config.color }}
                                >
                                  {config.label}
                                </Text>
                              </View>
                              <View
                                className="px-2 py-0.5 rounded-full"
                                style={{ backgroundColor: `${eraInfo.color}20` }}
                              >
                                <Text
                                  className="text-xs"
                                  style={{ color: eraInfo.color }}
                                >
                                  {eraInfo.name}
                                </Text>
                              </View>
                            </View>
                            <Text className="text-white font-bold">{entry.title}</Text>
                          </View>
                        </View>
                        <ChevronRight
                          size={18}
                          color="#666"
                          style={{
                            transform: [{ rotate: isExpanded ? '90deg' : '0deg' }],
                          }}
                        />
                      </View>

                      {/* Date */}
                      <View className="flex-row items-center mb-2">
                        <Calendar size={12} color="#666" />
                        <Text className="text-gray-500 text-xs ml-1">
                          {formatDate(entry.date)}
                        </Text>
                      </View>

                      {/* Content */}
                      <Text
                        className="text-gray-400 text-sm leading-6"
                        numberOfLines={isExpanded ? undefined : 2}
                      >
                        {entry.content}
                      </Text>
                    </View>
                  </Pressable>
                </Animated.View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
