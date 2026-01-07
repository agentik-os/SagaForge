import { View, Text, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeInUp, SlideInRight } from 'react-native-reanimated';
import {
  X,
  Users,
  Heart,
  HeartCrack,
  Minus,
  Badge,
  Smile,
  FlaskConical,
  HelpCircle,
} from 'lucide-react-native';
import { useNPCs, type NPC } from '@/lib/gameStore';
import { cn } from '@/lib/cn';

const NPC_ICONS: Record<string, typeof Badge> = {
  badge: Badge,
  smile: Smile,
  'flask-conical': FlaskConical,
  heart: Heart,
};

function getRelationshipInfo(relationship: number) {
  if (relationship >= 75) return { label: 'Devoted', color: '#10B981', icon: Heart };
  if (relationship >= 50) return { label: 'Friendly', color: '#22D3EE', icon: Heart };
  if (relationship >= 25) return { label: 'Warm', color: '#3B82F6', icon: Heart };
  if (relationship >= 0) return { label: 'Neutral', color: '#9CA3AF', icon: Minus };
  if (relationship >= -25) return { label: 'Wary', color: '#F59E0B', icon: HeartCrack };
  if (relationship >= -50) return { label: 'Hostile', color: '#EF4444', icon: HeartCrack };
  return { label: 'Enemy', color: '#DC2626', icon: HeartCrack };
}

export default function NPCsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const npcs = useNPCs();

  const metNPCs = npcs.filter((n) => n.met);
  const unmetNPCs = npcs.filter((n) => !n.met);

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
          <Users size={24} color="#FF3D3D" />
          <Text className="text-xl font-bold text-white ml-2">Characters</Text>
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
        {/* Met NPCs */}
        {metNPCs.length > 0 && (
          <Animated.View entering={FadeInUp.duration(400)} className="mb-6">
            <Text className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-3">
              Known Characters ({metNPCs.length})
            </Text>
            <View className="gap-3">
              {metNPCs.map((npc, index) => (
                <NPCCard key={npc.id} npc={npc} index={index} />
              ))}
            </View>
          </Animated.View>
        )}

        {/* Unmet NPCs (show as mystery) */}
        {unmetNPCs.length > 0 && (
          <Animated.View entering={FadeInUp.duration(400).delay(200)} className="mb-6">
            <Text className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-3">
              Unknown ({unmetNPCs.length})
            </Text>
            <View className="gap-3">
              {unmetNPCs.map((npc, index) => (
                <UnknownNPCCard key={npc.id} index={index} />
              ))}
            </View>
          </Animated.View>
        )}

        {npcs.length === 0 && (
          <Animated.View entering={FadeIn.duration(400)} className="items-center py-12">
            <Users size={48} color="#2A2A40" />
            <Text className="text-gray-500 text-center mt-4">
              No characters discovered yet.
            </Text>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

function NPCCard({ npc, index }: { npc: NPC; index: number }) {
  const relationshipInfo = getRelationshipInfo(npc.relationship);
  const RelationshipIcon = relationshipInfo.icon;
  const NPCIcon = NPC_ICONS[npc.icon] || HelpCircle;

  const relationshipPercent = ((npc.relationship + 100) / 200) * 100;

  return (
    <Animated.View entering={SlideInRight.duration(400).delay(index * 80)}>
      <Pressable className="active:scale-[0.98]">
        <View className="bg-[#12121F] rounded-2xl p-4 border border-[#2A2A40]">
          <View className="flex-row items-start">
            {/* Avatar */}
            <View className="w-14 h-14 rounded-2xl bg-[#1A1A2E] items-center justify-center mr-3">
              <NPCIcon size={28} color="#FF3D3D" />
            </View>

            {/* Info */}
            <View className="flex-1">
              <Text className="text-white font-bold text-lg">{npc.name}</Text>
              <Text className="text-[#00E5FF] text-xs">{npc.role}</Text>
              <Text className="text-gray-400 text-sm mt-1" numberOfLines={2}>
                {npc.description}
              </Text>
            </View>
          </View>

          {/* Relationship */}
          <View className="mt-4 pt-3 border-t border-[#2A2A40]">
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center">
                <RelationshipIcon size={14} color={relationshipInfo.color} />
                <Text style={{ color: relationshipInfo.color }} className="text-sm font-bold ml-1">
                  {relationshipInfo.label}
                </Text>
              </View>
              <Text className="text-gray-400 text-xs">
                {npc.relationship > 0 ? '+' : ''}{npc.relationship}
              </Text>
            </View>

            {/* Relationship bar */}
            <View className="h-2 bg-[#1A1A2E] rounded-full overflow-hidden">
              <LinearGradient
                colors={['#EF4444', '#F59E0B', '#10B981']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  height: '100%',
                  width: '100%',
                  position: 'absolute',
                  opacity: 0.3,
                }}
              />
              <View
                className="h-full rounded-full absolute"
                style={{
                  width: 4,
                  left: `${relationshipPercent}%`,
                  marginLeft: -2,
                  backgroundColor: relationshipInfo.color,
                }}
              />
            </View>
            <View className="flex-row justify-between mt-1">
              <Text className="text-gray-600 text-xs">Enemy</Text>
              <Text className="text-gray-600 text-xs">Devoted</Text>
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

function UnknownNPCCard({ index }: { index: number }) {
  return (
    <Animated.View entering={SlideInRight.duration(400).delay(index * 80)}>
      <View className="bg-[#12121F] rounded-2xl p-4 border border-[#2A2A40] opacity-60">
        <View className="flex-row items-center">
          <View className="w-14 h-14 rounded-2xl bg-[#1A1A2E] items-center justify-center mr-3">
            <HelpCircle size={28} color="#666" />
          </View>
          <View>
            <Text className="text-gray-500 font-bold text-lg">???</Text>
            <Text className="text-gray-600 text-xs">Unknown Character</Text>
            <Text className="text-gray-600 text-sm mt-1">
              Continue your adventure to discover this character.
            </Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}
