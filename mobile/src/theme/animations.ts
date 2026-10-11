import { Animated, Easing } from "react-native";

export const ANIMATION_CONFIG = {
  timing: {
    micro: 140,
    standard: 220,
    modal: 280,
    entrance: 320,
  },
  easing: {
    standard: Easing.bezier(0.25, 0.1, 0.25, 1),
    decelerate: Easing.out(Easing.cubic),
    accelerate: Easing.in(Easing.cubic),
  },
};

/**
 * Creates a fade + slide-up entrance animation using native driver.
 */
export function createEntranceAnimation(
  fadeAnim: Animated.Value,
  translateAnim: Animated.Value,
  delay: number = 0,
  duration: number = ANIMATION_CONFIG.timing.standard
) {
  return Animated.parallel([
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration,
      delay,
      easing: ANIMATION_CONFIG.easing.decelerate,
      useNativeDriver: true,
    }),
    Animated.timing(translateAnim, {
      toValue: 0,
      duration,
      delay,
      easing: ANIMATION_CONFIG.easing.decelerate,
      useNativeDriver: true,
    }),
  ]);
}

/**
 * Creates spring scale animation for tactile touch press feedback.
 */
export function createScaleSpring(scaleAnim: Animated.Value, toValue: number) {
  return Animated.spring(scaleAnim, {
    toValue,
    friction: 7,
    tension: 90,
    useNativeDriver: true,
  });
}
