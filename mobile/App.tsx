import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";
import { HomeScreen } from "./src/screens/HomeScreen";
import { DetailScreen } from "./src/screens/DetailScreen";
import { StatsScreen } from "./src/screens/StatsScreen";
import { BudgetsScreen } from "./src/screens/BudgetsScreen";
import { AccountsScreen } from "./src/screens/AccountsScreen";
import { SavingsScreen } from "./src/screens/SavingsScreen";
import { DebtsScreen } from "./src/screens/DebtsScreen";
import { CategoriesScreen } from "./src/screens/CategoriesScreen";
import { SettingsScreen } from "./src/screens/SettingsScreen";
import { AddTransactionModal } from "./src/screens/AddTransactionModal";
import { MoreMenuModal } from "./src/screens/MoreMenuModal";
import { BottomTabBar } from "./src/components/BottomTabBar";
import { colors } from "./src/theme/colors";
import { Transaction } from "./src/types";

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>("Discover");
  const [activeSubScreen, setActiveSubScreen] = useState<string | null>(null);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState<boolean>(false);

  function handleSelectTransaction(tx: Transaction) {
    setSelectedTx(tx);
    setCurrentTab("Receipts");
    setActiveSubScreen(null);
  }

  function renderCurrentScreen() {
    // If a subscreen from 3-dots menu is active
    if (activeSubScreen === "Budgets") {
      return <BudgetsScreen onBack={() => setActiveSubScreen(null)} />;
    }
    if (activeSubScreen === "Accounts") {
      return <AccountsScreen onBack={() => setActiveSubScreen(null)} />;
    }
    if (activeSubScreen === "Savings") {
      return <SavingsScreen onBack={() => setActiveSubScreen(null)} />;
    }
    if (activeSubScreen === "Debts") {
      return <DebtsScreen onBack={() => setActiveSubScreen(null)} />;
    }
    if (activeSubScreen === "Categories") {
      return <CategoriesScreen onBack={() => setActiveSubScreen(null)} />;
    }
    if (activeSubScreen === "Settings") {
      return <SettingsScreen onBack={() => setActiveSubScreen(null)} />;
    }

    // Main 4 screens
    switch (currentTab) {
      case "Discover":
        return (
          <HomeScreen
            onSelectTransaction={handleSelectTransaction}
            onSearchPress={() => {}}
          />
        );
      case "Receipts":
        return (
          <DetailScreen
            transaction={selectedTx}
            onBack={() => setCurrentTab("Discover")}
          />
        );
      case "Stats":
        return <StatsScreen />;
      default:
        return (
          <HomeScreen
            onSelectTransaction={handleSelectTransaction}
            onSearchPress={() => {}}
          />
        );
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.content}>{renderCurrentScreen()}</View>

      {/* Floating Bottom Navigation with 4 primary menus + center button + 3-dots More Menu */}
      <BottomTabBar
        currentTab={activeSubScreen ? "More" : currentTab}
        onTabPress={(tab) => {
          setActiveSubScreen(null);
          setCurrentTab(tab);
        }}
        onCenterPress={() => setIsAddModalOpen(true)}
        onMorePress={() => setIsMoreMenuOpen(true)}
      />

      {/* 3-Dots More Menu Modal Sheet */}
      <MoreMenuModal
        visible={isMoreMenuOpen}
        onClose={() => setIsMoreMenuOpen(false)}
        onNavigate={(screenId) => {
          setActiveSubScreen(screenId);
        }}
      />

      {/* Add Transaction Sheet */}
      <AddTransactionModal
        visible={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={(data) => {
          console.log("Transaction saved:", data);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
});
