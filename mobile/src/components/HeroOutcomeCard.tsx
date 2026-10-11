import React, { useRef, useEffect } from "react";
import { View, Text, StyleSheet, Animated, Easing } from "react-native";
import { colors } from "../theme/colors";
import { MonthlyChartData } from "../types";

interface HeroOutcomeCardProps {
  amount?: string;
  chartData?: MonthlyChartData[];
}

const defaultChartData: MonthlyChartData[] = [
  { month: "Aug", amount: 45, active: false },
  { month: "Oct", amount: 65, active: false },
  { month: "Dec", amount: 55, active: false },
  { month: "Feb", amount: 75, active: false },
  { month: "Apr", amount: 90, active: true },
];

export const HeroOutcomeCard = ({
  amount = "$12,560.00",
  chartData = defaultChartData,
}: HeroOutcomeCardProps) => {
  // Card Entrance Animations
  const cardScale = useRef(new Animated.Value(0.95)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;

  // Staggered animated bar heights
  const barAnimValues = useRef(chartData.map(() => new Animated.Value(0))).current;

  // Subtle floating pulse for orb watermark
  const orbAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Entrance of the whole card
    Animated.parallel([
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(cardScale, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // 2. Rising bars animation with staggered delays
    const barAnimations = chartData.map((item, index) =>
      Animated.timing(barAnimValues[index], {
        toValue: item.amount,
        duration: 650,
        delay: 200 + index * 90,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: false, // height requires layout
      })
    );
    Animated.parallel(barAnimations).start();

    // 3. Gentle breathing loop for watermark orb
    Animated.loop(
      Animated.sequence([
        Animated.timing(orbAnim, {
          toValue: 1,
          duration: 2500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(orbAnim, {
          toValue: 0,
          duration: 2500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [cardOpacity, cardScale, barAnimValues, orbAnim, chartData]);

  const orbScale = orbAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.15],
  });

  return (
    <Animated.View
      style={[
        styles.cardContainer,
        {
          opacity: cardOpacity,
          transform: [{ scale: cardScale }],
        },
      ]}
    >
      {/* Decorative animated orb watermark in top right */}
      <Animated.View
        style={[
          styles.watermarkOrb,
          {
            transform: [{ scale: orbScale }],
          },
        ]}
      />

      <Text style={styles.subtitle}>Outcome</Text>
      <Text style={styles.amountText}>{amount}</Text>

      {/* Mini Bar Chart with Rising Bars */}
      <View style={styles.chartWrapper}>
        {chartData.map((item, index) => {
          return (
            <View key={index} style={styles.barColumn}>
              <Animated.View
                style={[
                  styles.bar,
                  { height: barAnimValues[index] },
                  item.active ? styles.barActive : styles.barInactive,
                ]}
              />
              <Text
                style={[
                  styles.monthLabel,
                  item.active ? styles.monthLabelActive : null,
                ]}
              >
                {item.month}
              </Text>
            </View>
          );
        })}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: colors.plum,
    borderRadius: 30,
    padding: 24,
    marginHorizontal: 20,
    shadowColor: colors.plum,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 8,
    position: "relative",
    overflow: "hidden",
  },
  watermarkOrb: {
    position: "absolute",
    top: 20,
    right: 24,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  subtitle: {
    fontSize: 14,
    color: "#C6B8D1",
    fontWeight: "600",
    marginBottom: 6,
  },
  amountText: {
    fontSize: 34,
    fontWeight: "900",
    color: colors.textWhite,
    letterSpacing: -0.5,
    marginBottom: 26,
  },
  chartWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 105,
    paddingTop: 8,
  },
  barColumn: {
    alignItems: "center",
    width: 32,
  },
  bar: {
    width: 20,
    borderRadius: 8,
    marginBottom: 8,
  },
  barInactive: {
    backgroundColor: "#42284D",
  },
  barActive: {
    backgroundColor: colors.coral,
    shadowColor: colors.coral,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 6,
    elevation: 4,
  },
  monthLabel: {
    fontSize: 11,
    color: "#8E7A99",
    fontWeight: "600",
  },
  monthLabelActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
});
