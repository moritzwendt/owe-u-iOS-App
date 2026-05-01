import { useEffect } from 'react';
import { useSharedValue, useAnimatedStyle, withSpring, withDelay } from 'react-native-reanimated';

export function useEntranceAnim(delay: number) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(16);
  useEffect(() => {
    opacity.value = withDelay(delay, withSpring(1, { stiffness: 120, damping: 20 }));
    translateY.value = withDelay(delay, withSpring(0, { stiffness: 120, damping: 20 }));
  }, []);
  return useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));
}
