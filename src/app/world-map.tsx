import { useState } from 'react';
import { View, Text, Pressable, ScrollView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Animated, {
  FadeIn,
  FadeInUp,
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import {
  X,
  MapPin,
  Lock,
  Eye,
  AlertTriangle,
  ChevronRight,
  Compass,
  Building,
  GraduationCap,
  Home,
  TreePine,
  FlaskConical,
  FlipVertical,
} from 'lucide-react-native';
import {
  useLocations,
  useCharacter,
  useGameStore,
  ERAS,
  type Location,
  type Era,
} from '@/lib/gameStore';
import { cn } from '@/lib/cn';

const { width, height } = Dimensions.get('window');
const MAP_WIDTH = width - 48;
const MAP_HEIGHT = 400;

const LOCATION_ICONS: Record<string, typeof MapPin> = {
  building: Building,
  'graduation-cap': GraduationCap,
  home: Home,
  trees: TreePine,
  'flask-conical': FlaskConical,
  'flip-vertical': FlipVertical,
};

const DANGER_COLORS = ['#10B981', '#84CC16', '#EAB308', '#F97316', '#EF4444'];

export default function WorldMapScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const character = useCharacter();
  const locations = useLocations();
  const discoverLocation = useGameStore((s) => s.discoverLocation);
  const visitLocation = useGameStore((s) => s.visitLocation);

  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

  const currentEra = character?.currentEra || 'stranger_things';
  const eraInfo = ERAS[currentEra];
  const eraLocations = locations.filter((l) => l.era === currentEra);

  // Pulsing animation for discovered but not visited locations
  const pulseOpacity = useSharedValue(0.5);
  pulseOpacity.value = withRepeat(
    withSequence(
      withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      withTiming(0.5, { duration: 1000, easing: Easing.inOut(Easing.ease) })
    ),
    -1,
    false
  );

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
  }));

  const handleSelectLocation = (location: Location) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedLocation(location);
  };

  const handleVisitLocation = () => {
    if (!selectedLocation) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    visitLocation(selectedLocation.id);
    setSelectedLocation(null);
  };

  const handleExplore = () => {
    if (!selectedLocation) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // In a real game, this would trigger a narrative scene
    visitLocation(selectedLocation.id);
    router.push('/game-session' as never);
  };

  const discoveredCount = eraLocations.filter((l) => l.discovered).length;
  const visitedCount = eraLocations.filter((l) => l.visited).length;

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
          <Compass size={24} color={eraInfo.color} />
          <Text className="text-xl font-bold text-white ml-2">World Map</Text>
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
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
      >
        {/* Era Info */}
        <Animated.View entering={FadeInDown.duration(400)} className="px-4 mb-4">
          <View
            className="rounded-2xl p-4 border"
            style={{
              backgroundColor: `${eraInfo.color}10`,
              borderColor: `${eraInfo.color}30`,
            }}
          >
            <View className="flex-row items-center justify-between">
              <View>
                <Text style={{ color: eraInfo.color }} className="text-lg font-bold">
                  {eraInfo.name}
                </Text>
                <Text className="text-gray-400 text-sm">{eraInfo.year}</Text>
              </View>
              <View className="items-end">
                <Text className="text-gray-400 text-xs">Discovered</Text>
                <Text className="text-white font-bold">
                  {discoveredCount}/{eraLocations.length}
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Map Container */}
        <Animated.View entering={FadeIn.duration(600).delay(200)} className="px-4 mb-4">
          <View
            className="rounded-3xl overflow-hidden border border-[#2A2A40]"
            style={{ height: MAP_HEIGHT }}
          >
            <LinearGradient
              colors={['#0D1117', '#161B22', '#0D1117']}
              style={{ position: 'absolute', width: '100%', height: '100%' }}
            />

            {/* Grid lines */}
            <View style={{ position: 'absolute', width: '100%', height: '100%' }}>
              {[0.2, 0.4, 0.6, 0.8].map((pos) => (
                <View
                  key={`h-${pos}`}
                  style={{
                    position: 'absolute',
                    top: `${pos * 100}%`,
                    left: 0,
                    right: 0,
                    height: 1,
                    backgroundColor: '#1A1A2E',
                  }}
                />
              ))}
              {[0.2, 0.4, 0.6, 0.8].map((pos) => (
                <View
                  key={`v-${pos}`}
                  style={{
                    position: 'absolute',
                    left: `${pos * 100}%`,
                    top: 0,
                    bottom: 0,
                    width: 1,
                    backgroundColor: '#1A1A2E',
                  }}
                />
              ))}
            </View>

            {/* Connection lines */}
            <View style={{ position: 'absolute', width: '100%', height: '100%' }}>
              {eraLocations.map((location) => {
                if (!location.discovered) return null;
                return location.connectedTo.map((connectedId) => {
                  const connected = eraLocations.find((l) => l.id === connectedId);
                  if (!connected || !connected.discovered) return null;

                  const x1 = (location.coordinates.x / 100) * MAP_WIDTH + 24;
                  const y1 = (location.coordinates.y / 100) * MAP_HEIGHT;
                  const x2 = (connected.coordinates.x / 100) * MAP_WIDTH + 24;
                  const y2 = (connected.coordinates.y / 100) * MAP_HEIGHT;

                  const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
                  const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);

                  return (
                    <View
                      key={`${location.id}-${connectedId}`}
                      style={{
                        position: 'absolute',
                        left: x1 - 24,
                        top: y1,
                        width: length,
                        height: 2,
                        backgroundColor: location.visited && connected.visited ? '#00E5FF40' : '#2A2A4060',
                        transform: [{ rotate: `${angle}deg` }],
                        transformOrigin: 'left center',
                      }}
                    />
                  );
                });
              })}
            </View>

            {/* Location markers */}
            {eraLocations.map((location, index) => {
              const IconComponent = LOCATION_ICONS[location.icon] || MapPin;
              const isSelected = selectedLocation?.id === location.id;
              const markerColor = location.visited
                ? '#00E5FF'
                : location.discovered
                ? '#F59E0B'
                : '#2A2A40';

              if (!location.discovered) {
                return (
                  <View
                    key={location.id}
                    style={{
                      position: 'absolute',
                      left: `${location.coordinates.x}%`,
                      top: `${location.coordinates.y}%`,
                      transform: [{ translateX: -12 }, { translateY: -12 }],
                    }}
                  >
                    <View className="w-6 h-6 rounded-full bg-[#1A1A2E] items-center justify-center border border-[#2A2A40]">
                      <Lock size={10} color="#666" />
                    </View>
                  </View>
                );
              }

              return (
                <Animated.View
                  key={location.id}
                  entering={FadeIn.duration(400).delay(index * 100)}
                  style={{
                    position: 'absolute',
                    left: `${location.coordinates.x}%`,
                    top: `${location.coordinates.y}%`,
                    transform: [{ translateX: -20 }, { translateY: -20 }],
                  }}
                >
                  <Pressable
                    onPress={() => handleSelectLocation(location)}
                    className="items-center"
                  >
                    {!location.visited && (
                      <Animated.View
                        style={[
                          {
                            position: 'absolute',
                            width: 48,
                            height: 48,
                            borderRadius: 24,
                            backgroundColor: '#F59E0B',
                          },
                          pulseStyle,
                        ]}
                      />
                    )}
                    <View
                      className={cn(
                        'w-10 h-10 rounded-full items-center justify-center',
                        isSelected ? 'scale-110' : ''
                      )}
                      style={{
                        backgroundColor: `${markerColor}30`,
                        borderWidth: 2,
                        borderColor: markerColor,
                      }}
                    >
                      <IconComponent size={18} color={markerColor} />
                    </View>
                    {isSelected && (
                      <View className="absolute -bottom-4">
                        <View className="w-2 h-2 rotate-45 bg-[#00E5FF]" />
                      </View>
                    )}
                  </Pressable>
                </Animated.View>
              );
            })}

            {/* Legend */}
            <View className="absolute bottom-3 left-3 right-3 flex-row justify-between">
              <View className="flex-row items-center">
                <View className="w-3 h-3 rounded-full bg-[#00E5FF] mr-1" />
                <Text className="text-[#00E5FF] text-xs">Visited</Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-3 h-3 rounded-full bg-[#F59E0B] mr-1" />
                <Text className="text-[#F59E0B] text-xs">Discovered</Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-3 h-3 rounded-full bg-[#2A2A40] mr-1" />
                <Text className="text-gray-500 text-xs">Unknown</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Selected Location Details */}
        {selectedLocation && (
          <Animated.View entering={FadeInUp.duration(300)} className="px-4 mb-4">
            <View className="bg-[#12121F] rounded-2xl p-4 border border-[#2A2A40]">
              <View className="flex-row items-start justify-between mb-3">
                <View className="flex-1">
                  <View className="flex-row items-center mb-1">
                    <Text className="text-white font-bold text-lg mr-2">
                      {selectedLocation.name}
                    </Text>
                    {selectedLocation.visited && (
                      <View className="bg-[#00E5FF]/20 px-2 py-0.5 rounded-full">
                        <Text className="text-[#00E5FF] text-xs font-bold">Visited</Text>
                      </View>
                    )}
                  </View>
                  <Text className="text-gray-400 text-sm">{selectedLocation.description}</Text>
                </View>
              </View>

              {/* Danger Level */}
              <View className="flex-row items-center mb-4">
                <AlertTriangle size={14} color={DANGER_COLORS[selectedLocation.dangerLevel - 1]} />
                <Text className="text-gray-400 text-xs ml-2 mr-2">Danger:</Text>
                <View className="flex-row gap-1">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <View
                      key={level}
                      className="w-4 h-2 rounded-sm"
                      style={{
                        backgroundColor:
                          level <= selectedLocation.dangerLevel
                            ? DANGER_COLORS[selectedLocation.dangerLevel - 1]
                            : '#2A2A40',
                      }}
                    />
                  ))}
                </View>
              </View>

              {/* Connected Locations */}
              {selectedLocation.connectedTo.length > 0 && (
                <View className="mb-4">
                  <Text className="text-gray-500 text-xs mb-2">Connected to:</Text>
                  <View className="flex-row flex-wrap gap-2">
                    {selectedLocation.connectedTo.map((connectedId) => {
                      const connected = eraLocations.find((l) => l.id === connectedId);
                      if (!connected) return null;
                      return (
                        <View
                          key={connectedId}
                          className="px-2 py-1 rounded-full"
                          style={{
                            backgroundColor: connected.discovered ? '#1A1A2E' : '#0D0D14',
                          }}
                        >
                          <Text
                            className={cn(
                              'text-xs',
                              connected.discovered ? 'text-gray-400' : 'text-gray-600'
                            )}
                          >
                            {connected.discovered ? connected.name : '???'}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                </View>
              )}

              {/* Actions */}
              <Pressable onPress={handleExplore} className="active:scale-95">
                <LinearGradient
                  colors={['#FF3D3D', '#FF6B35']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ borderRadius: 12 }}
                >
                  <View className="py-3 flex-row items-center justify-center">
                    <Eye size={18} color="#fff" />
                    <Text className="text-white font-bold ml-2">
                      {selectedLocation.visited ? 'Return Here' : 'Explore Location'}
                    </Text>
                    <ChevronRight size={18} color="#fff" />
                  </View>
                </LinearGradient>
              </Pressable>
            </View>
          </Animated.View>
        )}

        {/* Location List */}
        <View className="px-4">
          <Text className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-3">
            All Locations ({discoveredCount}/{eraLocations.length} discovered)
          </Text>

          <View className="gap-3">
            {eraLocations.map((location, index) => {
              const IconComponent = LOCATION_ICONS[location.icon] || MapPin;
              const isDiscovered = location.discovered;
              const isVisited = location.visited;

              return (
                <Animated.View
                  key={location.id}
                  entering={FadeInUp.duration(400).delay(index * 50)}
                >
                  <Pressable
                    onPress={() => isDiscovered && handleSelectLocation(location)}
                    disabled={!isDiscovered}
                    className={cn(
                      'flex-row items-center bg-[#12121F] rounded-xl p-3 border border-[#2A2A40]',
                      !isDiscovered && 'opacity-50'
                    )}
                  >
                    <View
                      className="w-10 h-10 rounded-lg items-center justify-center mr-3"
                      style={{
                        backgroundColor: isVisited
                          ? '#00E5FF20'
                          : isDiscovered
                          ? '#F59E0B20'
                          : '#1A1A2E',
                      }}
                    >
                      {isDiscovered ? (
                        <IconComponent
                          size={20}
                          color={isVisited ? '#00E5FF' : '#F59E0B'}
                        />
                      ) : (
                        <Lock size={16} color="#666" />
                      )}
                    </View>

                    <View className="flex-1">
                      <Text
                        className={cn(
                          'font-bold',
                          isDiscovered ? 'text-white' : 'text-gray-600'
                        )}
                      >
                        {isDiscovered ? location.name : '???'}
                      </Text>
                      <View className="flex-row items-center mt-0.5">
                        {isVisited && (
                          <View className="bg-[#00E5FF]/20 px-1.5 py-0.5 rounded mr-2">
                            <Text className="text-[#00E5FF] text-[10px] font-bold">
                              VISITED
                            </Text>
                          </View>
                        )}
                        <View className="flex-row gap-0.5">
                          {[1, 2, 3, 4, 5].map((level) => (
                            <View
                              key={level}
                              className="w-1.5 h-1.5 rounded-full"
                              style={{
                                backgroundColor:
                                  isDiscovered && level <= location.dangerLevel
                                    ? DANGER_COLORS[location.dangerLevel - 1]
                                    : '#2A2A40',
                              }}
                            />
                          ))}
                        </View>
                      </View>
                    </View>

                    {isDiscovered && (
                      <ChevronRight size={18} color="#666" />
                    )}
                  </Pressable>
                </Animated.View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
