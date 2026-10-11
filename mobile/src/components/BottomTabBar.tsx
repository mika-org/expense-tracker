import React, { useRef, useEffect } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { Compass, Receipt, Scan, BarChart2, MoreHorizontal } from "lucide-react-native";
import { colors } from "../theme/colors";
import { ScalePress } from "./AnimatedComponents";

export interface BottomTabBarProps {
  currentTab: string;
  onTabPress: (tabName: string) => void;
  onCenterPress: () => void;
  onMorePress: () => void;
}

export const BottomTabBar = ({
  currentTab,
  onTabPress,
  onCenterPress,
  onMorePress,
}: BottomTabBarProps) => {
  // Continuous breathing pulse animation for the center coral button
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.06,
          duration: 1400,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1400,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        {/* 1. Discover / Home */}
        <ScalePress
          style={styles.tabItem}
          onPress={() => onTabPress("Discover")}
          activeScale={0.92}
        >
          <Compass
            size={22}
            color={currentTab === "Discover" ? colors.plum : colors.textMuted}
            strokeWidth={currentTab === "Discover" ? 2.5 : 2}
          />
          <Text
            style={[
              styles.tabLabel,
              currentTab === "Discover" ? styles.tabLabelActive : null,
            ]}
          >
            Discover
          </Text>
        </ScalePress>

        {/* 2. Receipts / Transactions */}
        <ScalePress
          style={styles.tabItem}
          onPress={() => onTabPress("Receipts")}
          activeScale={0.92}
        >
          <Receipt
            size={22}
            color={currentTab === "Receipts" ? colors.plum : colors.textMuted}
            strokeWidth={currentTab === "Receipts" ? 2.5 : 2}
          />
          <Text
            style={[
              styles.tabLabel,
              currentTab === "Receipts" ? styles.tabLabelActive : null,
            ]}
          >
            Receipts
          </Text>
        </ScalePress>

        {/* Center Floating Coral Scanner/Add Button with Pulse Animation */}
        <View style={styles.centerButtonContainer}>
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <ScalePress
              style={styles.centerButton}
              onPress={onCenterPress}
              activeScale={0.90}
            >
              <Scan size={26} color="#FFFFFF" strokeWidth={2.5} />
            </ScalePress>
          </Animated.View>
        </View>

        {/* 3. Stats / Reports */}
        <ScalePress
          style={styles.tabItem}
          onPress={() => onTabPress("Stats")}
          activeScale={0.92}
        >
          <BarChart2
            size={22}
            color={currentTab === "Stats" ? colors.plum : colors.textMuted}
            strokeWidth={currentTab === "Stats" ? 2.5 : 2}
          />
          <Text
            style={[
              styles.tabLabel,
              currentTab === "Stats" ? styles.tabLabelActive : null,
            ]}
          >
            Stats
          </Text>
        </ScalePress>

        {/* 4. Menu Icon Dots 3 (More Menu) */}
        <ScalePress
          style={styles.tabItem}
          onPress={onMorePress}
          activeScale={0.92}
        >
          <MoreHorizontal
            size={24}
            color={currentTab === "More" ? colors.plum : colors.textMuted}
            strokeWidth={currentTab === "More" ? 2.5 : 2}
          />
          <Text
            style={[
              styles.tabLabel,
              currentTab === "More" ? styles.tabLabelActive : null,
            ]}
          >
            Menu
          </Text>
        </ScalePress>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.background,
    paddingBottom: 8,
  },
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: colors.card,
    height: 72,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
    paddingHorizontal: 12,
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: colors.textMuted,
    marginTop: 4,
  },
  tabLabelActive: {
    color: colors.plum,
    fontWeight: "800",
  },
  centerButtonContainer: {
    top: -18,
    alignItems: "center",
    justifyContent: "center",
  },
  centerButton: {
    width: 58,
    height: 58,
    borderRadius: 22,
    backgroundColor: colors.coral,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.coral,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 8,
  },
});
