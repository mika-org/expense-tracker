import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Search } from "lucide-react-native";
import { colors } from "../theme/colors";

export interface HeaderProps {
  greeting?: string;
  userName?: string;
  onSearchPress?: () => void;
}

export const Header = ({
  greeting = "Hello,",
  userName = "Priscilla",
  onSearchPress,
}: HeaderProps) => {
  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.greeting}>{greeting}</Text>
        <Text style={styles.userName}>{userName}</Text>
      </View>

      <TouchableOpacity
        style={styles.searchButton}
        onPress={onSearchPress}
        activeOpacity={0.8}
      >
        <Search size={18} color={colors.textPrimary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
  },
  greeting: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  userName: {
    fontSize: 26,
    fontWeight: "800",
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  searchButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.card,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
});
