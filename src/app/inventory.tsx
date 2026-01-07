import { View, Text, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeInUp, SlideInRight } from 'react-native-reanimated';
import {
  X,
  Package,
  Sword,
  Shield,
  FlaskConical,
  Key,
  Gem,
  Sparkles,
} from 'lucide-react-native';
import { useInventory, useGameStore, type Item, type ItemRarity, type ItemType } from '@/lib/gameStore';
import { cn } from '@/lib/cn';

const RARITY_CONFIG: Record<ItemRarity, { color: string; bgColor: string; label: string }> = {
  common: { color: '#9CA3AF', bgColor: '#9CA3AF20', label: 'Common' },
  uncommon: { color: '#10B981', bgColor: '#10B98120', label: 'Uncommon' },
  rare: { color: '#3B82F6', bgColor: '#3B82F620', label: 'Rare' },
  legendary: { color: '#F59E0B', bgColor: '#F59E0B20', label: 'Legendary' },
};

const TYPE_ICONS: Record<ItemType, typeof Sword> = {
  weapon: Sword,
  armor: Shield,
  consumable: FlaskConical,
  key: Key,
  artifact: Gem,
};

export default function InventoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const inventory = useInventory();
  const consumeItem = useGameStore((s) => s.useItem);

  const handleUseItem = (item: Item) => {
    if (item.type !== 'consumable') return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    consumeItem(item.id);
  };

  // Group items by type
  const groupedItems = inventory.reduce((acc, item) => {
    if (!acc[item.type]) acc[item.type] = [];
    acc[item.type].push(item);
    return acc;
  }, {} as Record<ItemType, Item[]>);

  const totalItems = inventory.reduce((sum, item) => sum + item.quantity, 0);

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
          <Package size={24} color="#FF3D3D" />
          <Text className="text-xl font-bold text-white ml-2">Inventory</Text>
          <View className="bg-[#2A2A40] px-2 py-0.5 rounded-full ml-2">
            <Text className="text-gray-400 text-xs font-bold">{totalItems} items</Text>
          </View>
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
        {inventory.length === 0 ? (
          <Animated.View entering={FadeIn.duration(400)} className="items-center py-12">
            <Package size={48} color="#2A2A40" />
            <Text className="text-gray-500 text-center mt-4">
              Your inventory is empty.
            </Text>
            <Text className="text-gray-600 text-center text-sm mt-1">
              Find items during your adventure!
            </Text>
          </Animated.View>
        ) : (
          Object.entries(groupedItems).map(([type, items]) => (
            <ItemSection
              key={type}
              type={type as ItemType}
              items={items}
              onUseItem={handleUseItem}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

function ItemSection({
  type,
  items,
  onUseItem,
}: {
  type: ItemType;
  items: Item[];
  onUseItem: (item: Item) => void;
}) {
  const Icon = TYPE_ICONS[type];
  const typeLabel = type.charAt(0).toUpperCase() + type.slice(1) + 's';

  return (
    <Animated.View entering={FadeInUp.duration(400)} className="mb-6">
      <View className="flex-row items-center mb-3">
        <Icon size={16} color="#666" />
        <Text className="text-gray-400 text-sm font-bold uppercase tracking-wider ml-2">
          {typeLabel}
        </Text>
      </View>

      <View className="gap-2">
        {items.map((item, index) => (
          <ItemCard key={item.id} item={item} index={index} onUse={onUseItem} />
        ))}
      </View>
    </Animated.View>
  );
}

function ItemCard({
  item,
  index,
  onUse,
}: {
  item: Item;
  index: number;
  onUse: (item: Item) => void;
}) {
  const rarityConfig = RARITY_CONFIG[item.rarity];
  const Icon = TYPE_ICONS[item.type];

  return (
    <Animated.View entering={SlideInRight.duration(400).delay(index * 50)}>
      <Pressable
        onPress={() => item.type === 'consumable' && onUse(item)}
        className="active:scale-[0.98]"
      >
        <View className="bg-[#12121F] rounded-xl p-4 border border-[#2A2A40] flex-row items-center">
          {/* Icon */}
          <View
            className="w-12 h-12 rounded-xl items-center justify-center mr-3"
            style={{ backgroundColor: rarityConfig.bgColor }}
          >
            <Icon size={24} color={rarityConfig.color} />
          </View>

          {/* Info */}
          <View className="flex-1">
            <View className="flex-row items-center">
              <Text className="text-white font-bold">{item.name}</Text>
              {item.quantity > 1 && (
                <Text className="text-gray-400 ml-2">x{item.quantity}</Text>
              )}
            </View>
            <Text className="text-gray-500 text-xs mt-0.5" numberOfLines={1}>
              {item.description}
            </Text>
            <View className="flex-row items-center mt-1">
              <View
                className="px-2 py-0.5 rounded-full"
                style={{ backgroundColor: rarityConfig.bgColor }}
              >
                <Text style={{ color: rarityConfig.color }} className="text-xs font-bold">
                  {rarityConfig.label}
                </Text>
              </View>
              {item.effect && (
                <View className="flex-row items-center ml-2">
                  <Sparkles size={10} color="#A855F7" />
                  <Text className="text-purple-400 text-xs ml-1">{item.effect}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Use Button */}
          {item.type === 'consumable' && (
            <View className="bg-[#10B981]/20 px-3 py-1.5 rounded-lg">
              <Text className="text-[#10B981] text-xs font-bold">USE</Text>
            </View>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}
