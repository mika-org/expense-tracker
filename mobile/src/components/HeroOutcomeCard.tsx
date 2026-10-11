import React, { useRef, useEffect, useState } from "react";
import { View, Text, StyleSheet, Animated, Easing, TouchableOpacity } from "react-native";
import { colors } from "../theme/colors";
import { MonthlyChartData } from "../types";

interface HeroOutcomeCardProps {
  amount?: string;
  chartData?: MonthlyChartData[];
}

const now = new Date();
const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"];
const defaultChartData: MonthlyChartData[] = [4, 3, 2, 1, 0].map((offset, idx) => {
  const d = new Date(now.getFullYear(), now.getMonth() - offset, 1);
  return {
    month: monthNames[d.getMonth()],
    amount: 14,
    rawAmount: 0,
    active: idx === 4,
  };
});

export const HeroOutcomeCard = ({
  amount = "Rp 0",
  chartData = defaultChartData,
}: HeroOutcomeCardProps) => {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(chartData.length - 1);

  // Card Entrance Animations
  const cardScale = useRef(new Animated.Value(0.95)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;

  // Staggered animated bar heights
  const barAnimValues = useRef(chartData.map(() => new Animated.Value(0))).current;

  // Popover opacity animation
  const popoverOpacity = useRef(new Animated.Value(1)).current;

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
        toValue: Math.max(14, item.amount),
        duration: 650,
        delay: 200 + index * 90,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: false,
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

  const handleBarPress = (index: number) => {
    setSelectedIdx(index);
    popoverOpacity.setValue(0);
    Animated.spring(popoverOpacity, {
      toValue: 1,
      friction: 7,
      tension: 60,
      useNativeDriver: true,
    }).start();
  };

  const orbScale = orbAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.15],
  });

  const selectedItem = selectedIdx !== null ? chartData[selectedIdx] : null;
  const popoverDisplayAmount = selectedItem
    ? selectedItem.rawAmount !== undefined
      ? `Rp ${Number(selectedItem.rawAmount).toLocaleString("id-ID")}`
      : `Rp ${Number(selectedItem.amount).toLocaleString("id-ID")}`
    : "Rp 0";

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

      <View style={styles.topRow}>
        <View>
          <Text style={styles.subtitle}>Pengeluaran Bulan Ini</Text>
          <Text style={styles.amountText}>{amount}</Text>
        </View>

        {/* Clean Popover Info Box */}
        {selectedItem && (
          <Animated.View style={[styles.popoverBox, { opacity: popoverOpacity }]}>
            <Text style={styles.popoverMonth}>{selectedItem.month}</Text>
            <Text style={styles.popoverAmount}>{popoverDisplayAmount}</Text>
          </Animated.View>
        )}
      </View>

      {/* Mini Bar Chart with Rising Bars & Popover Touch Interaction */}
      <View style={styles.chartWrapper}>
        {chartData.map((item, index) => {
          const isSelected = selectedIdx === index;
          return (
            <TouchableOpacity
              key={index}
              style={styles.barColumn}
              activeOpacity={0.7}
              onPress={() => handleBarPress(index)}
            >
              {isSelected && <View style={styles.popoverDot} />}
              <Animated.View
                style={[
                  styles.bar,
                  { height: barAnimValues[index] },
                  isSelected || item.active ? styles.barActive : styles.barInactive,
                ]}
              />
              <Text
                style={[
                  styles.monthLabel,
                  isSelected || item.active ? styles.monthLabelActive : null,
                ]}
              >
                {item.month}
              </Text>
            </TouchableOpacity>
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
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 13,
    color: "#C6B8D1",
    fontWeight: "600",
    marginBottom: 4,
  },
  amountText: {
    fontSize: 28,
    fontWeight: "900",
    color: colors.textWhite,
    letterSpacing: -0.5,
  },
  popoverBox: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "flex-end",
  },
  popoverMonth: {
    fontSize: 11,
    color: "#E5D9EE",
    fontWeight: "700",
  },
  popoverAmount: {
    fontSize: 13,
    color: "#FFFFFF",
    fontWeight: "900",
    marginTop: 2,
  },
  popoverDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.coral,
    marginBottom: 4,
  },
  chartWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 100,
    paddingTop: 8,
  },
  barColumn: {
    alignItems: "center",
    width: 44,
  },
  bar: {
    width: 22,
    borderRadius: 11,
    marginBottom: 8,
  },
  barActive: {
    backgroundColor: colors.coral,
    shadowColor: colors.coral,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  barInactive: {
    backgroundColor: colors.plumLight,
  },
  monthLabel: {
    fontSize: 12,
    color: "#B4A3C0",
    fontWeight: "600",
  },
  monthLabelActive: {
    color: colors.textWhite,
    fontWeight: "800",
  },
});
