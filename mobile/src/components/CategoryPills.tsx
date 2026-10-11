import React from "react";
import { ScrollView, TouchableOpacity, Text, StyleSheet } from "react-native";
import { colors } from "../theme/colors";

export interface CategoryPillsProps {
  categories: string[];
  activeCategory: string;
  onSelect: (category: string) => void;
}

export const CategoryPills = ({
  categories,
  activeCategory,
  onSelect,
}: CategoryPillsProps) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {categories.map((cat) => {
        const isActive = cat === activeCategory;
        return (
          <TouchableOpacity
            key={cat}
            style={[styles.pill, isActive ? styles.pillActive : styles.pillInactive]}
            onPress={() => onSelect(cat)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.text,
                isActive ? styles.textActive : styles.textInactive,
              ]}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 10,
  },
  pill: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 22,
    borderWidth: 1,
  },
  pillActive: {
    backgroundColor: colors.plumPill,
    borderColor: colors.plumPill,
  },
  pillInactive: {
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
  },
  text: {
    fontSize: 13,
    fontWeight: "600",
  },
  textActive: {
    color: colors.textWhite,
  },
  textInactive: {
    color: colors.textSecondary,
  },
});
