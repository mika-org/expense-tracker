import React, { useRef, useEffect } from "react";
import { Animated, TouchableOpacity, StyleProp, ViewStyle } from "react-native";

export interface AnimatedCardProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  delay?: number;
  onPress?: () => void;
  activeOpacity?: number;
}

export const AnimatedCard = ({
  children,
  style,
  delay = 0,
  onPress,
  activeOpacity = 0.92,
}: AnimatedCardProps) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 450,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 7,
        tension: 40,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim, delay]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();
  };

  const animatedStyle = {
    opacity: fadeAnim,
    transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
  };

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={activeOpacity}
      >
        <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>
      </TouchableOpacity>
    );
  }

  return <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>;
};
