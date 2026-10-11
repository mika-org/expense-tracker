import React, { useEffect, useRef } from "react";
import {
  Animated,
  View,
  TouchableOpacity,
  TouchableOpacityProps,
  ViewStyle,
  StyleProp,
} from "react-native";
import { ANIMATION_CONFIG, createEntranceAnimation, createScaleSpring } from "../theme/animations";

interface FadeInViewProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  translateYOffset?: number;
  style?: StyleProp<ViewStyle>;
}

export const FadeInView: React.FC<FadeInViewProps> = ({
  children,
  delay = 0,
  duration = ANIMATION_CONFIG.timing.standard,
  translateYOffset = 14,
  style,
}) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(translateYOffset)).current;

  useEffect(() => {
    createEntranceAnimation(opacity, translateY, delay, duration).start();
  }, []);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};

interface ScalePressProps extends TouchableOpacityProps {
  children?: React.ReactNode;
  activeScale?: number;
  style?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
}

export const ScalePress: React.FC<ScalePressProps> = ({
  children,
  activeScale = 0.96,
  onPress,
  style,
  containerStyle,
  disabled,
  ...rest
}) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (!disabled) {
      createScaleSpring(scale, activeScale).start();
    }
  };

  const handlePressOut = () => {
    if (!disabled) {
      createScaleSpring(scale, 1).start();
    }
  };

  return (
    <Animated.View style={[{ transform: [{ scale }] }, containerStyle]}>
      <TouchableOpacity
        activeOpacity={0.88}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        disabled={disabled}
        style={style}
        {...rest}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
};

interface AnimatedProgressBarProps {
  percentage: number;
  height?: number;
  color?: string;
  backgroundColor?: string;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

export const AnimatedProgressBar: React.FC<AnimatedProgressBarProps> = ({
  percentage,
  height = 8,
  color = "#3B82F6",
  backgroundColor = "#E2E8F0",
  borderRadius = 4,
  style,
}) => {
  const widthAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: Math.min(100, Math.max(0, percentage)),
      duration: 650,
      easing: ANIMATION_CONFIG.easing.decelerate,
      useNativeDriver: false,
    }).start();
  }, [percentage]);

  const widthInterpolated = widthAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={[{ height, backgroundColor, borderRadius, overflow: "hidden" }, style]}>
      <Animated.View
        style={{
          height: "100%",
          width: widthInterpolated,
          backgroundColor: color,
          borderRadius,
        }}
      />
    </View>
  );
};

interface AnimatedScreenProps {
  children: React.ReactNode;
  screenKey: string;
  style?: StyleProp<ViewStyle>;
}

export const AnimatedScreen: React.FC<AnimatedScreenProps> = ({
  children,
  screenKey,
  style,
}) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(8)).current;

  useEffect(() => {
    opacity.setValue(0);
    translateY.setValue(8);
    createEntranceAnimation(opacity, translateY, 0, ANIMATION_CONFIG.timing.standard).start();
  }, [screenKey]);

  return (
    <Animated.View
      style={[
        { flex: 1 },
        style,
        {
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};
