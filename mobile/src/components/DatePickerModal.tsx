import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X } from "lucide-react-native";
import { colors } from "../theme/colors";
import { ScalePress } from "./AnimatedComponents";

interface DatePickerModalProps {
  visible: boolean;
  initialDate?: string | null;
  onClose: () => void;
  onSelectDate: (dateString: string, formattedLabel: string) => void;
  title?: string;
}

const MONTH_NAMES = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const SHORT_MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Ags",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

const DAY_NAMES = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

export const DatePickerModal: React.FC<DatePickerModalProps> = ({
  visible,
  initialDate,
  onClose,
  onSelectDate,
  title = "Pilih Tanggal",
}) => {
  const getInitialDateObj = () => {
    if (!initialDate) return new Date();
    const parsed = new Date(initialDate);
    return isNaN(parsed.getTime()) ? new Date() : parsed;
  };

  const [selectedDate, setSelectedDate] = useState<Date>(getInitialDateObj());
  const [viewYear, setViewYear] = useState<number>(selectedDate.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(selectedDate.getMonth());

  useEffect(() => {
    if (visible) {
      const d = getInitialDateObj();
      setSelectedDate(d);
      setViewYear(d.getFullYear());
      setViewMonth(d.getMonth());
    }
  }, [visible, initialDate]);

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((prev) => prev - 1);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((prev) => prev + 1);
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const totalDays = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  const daysArray: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) {
    daysArray.push(null);
  }
  for (let i = 1; i <= totalDays; i++) {
    daysArray.push(i);
  }

  const isToday = (day: number) => {
    const today = new Date();
    return (
      today.getDate() === day &&
      today.getMonth() === viewMonth &&
      today.getFullYear() === viewYear
    );
  };

  const isSelected = (day: number) => {
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === viewMonth &&
      selectedDate.getFullYear() === viewYear
    );
  };

  const handleDaySelect = (day: number) => {
    const newDate = new Date(viewYear, viewMonth, day);
    setSelectedDate(newDate);
  };

  const handleQuickSelect = (type: "today" | "yesterday" | "tomorrow" | "endOfMonth") => {
    const d = new Date();
    if (type === "yesterday") {
      d.setDate(d.getDate() - 1);
    } else if (type === "tomorrow") {
      d.setDate(d.getDate() + 1);
    } else if (type === "endOfMonth") {
      d.setMonth(d.getMonth() + 1, 0);
    }
    setSelectedDate(d);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  };

  const handleConfirm = () => {
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const day = String(selectedDate.getDate()).padStart(2, "0");
    const dateString = `${year}-${month}-${day}`;
    const label = `${selectedDate.getDate()} ${SHORT_MONTH_NAMES[selectedDate.getMonth()]} ${year}`;
    onSelectDate(dateString, label);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleWrap}>
              <CalendarIcon size={18} color={colors.coral} />
              <Text style={styles.headerTitle}>{title}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Month & Year Navigation */}
          <View style={styles.monthNav}>
            <ScalePress onPress={handlePrevMonth} style={styles.navBtn}>
              <ChevronLeft size={20} color={colors.textPrimary} />
            </ScalePress>
            <Text style={styles.monthYearText}>
              {MONTH_NAMES[viewMonth]} {viewYear}
            </Text>
            <ScalePress onPress={handleNextMonth} style={styles.navBtn}>
              <ChevronRight size={20} color={colors.textPrimary} />
            </ScalePress>
          </View>

          {/* Quick Preset Buttons */}
          <View style={styles.presetsRow}>
            <TouchableOpacity
              style={styles.presetChip}
              onPress={() => handleQuickSelect("today")}
            >
              <Text style={styles.presetChipText}>Hari Ini</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.presetChip}
              onPress={() => handleQuickSelect("yesterday")}
            >
              <Text style={styles.presetChipText}>Kemarin</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.presetChip}
              onPress={() => handleQuickSelect("tomorrow")}
            >
              <Text style={styles.presetChipText}>Besok</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.presetChip}
              onPress={() => handleQuickSelect("endOfMonth")}
            >
              <Text style={styles.presetChipText}>Akhir Bulan</Text>
            </TouchableOpacity>
          </View>

          {/* Day of week labels */}
          <View style={styles.daysHeader}>
            {DAY_NAMES.map((name, idx) => (
              <Text
                key={name}
                style={[
                  styles.dayLabel,
                  idx === 0 ? { color: "#EF4444" } : null, // Minggu red
                ]}
              >
                {name}
              </Text>
            ))}
          </View>

          {/* Calendar Day Grid */}
          <View style={styles.grid}>
            {daysArray.map((day, idx) => {
              if (day === null) {
                return <View key={`empty-${idx}`} style={styles.dayCell} />;
              }
              const selected = isSelected(day);
              const today = isToday(day);

              return (
                <TouchableOpacity
                  key={`day-${day}`}
                  style={[
                    styles.dayCell,
                    selected ? styles.dayCellSelected : null,
                    today && !selected ? styles.dayCellToday : null,
                  ]}
                  activeOpacity={0.7}
                  onPress={() => handleDaySelect(day)}
                >
                  <Text
                    style={[
                      styles.dayText,
                      selected ? styles.dayTextSelected : null,
                      today && !selected ? styles.dayTextToday : null,
                    ]}
                  >
                    {day}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Selected Date Summary & Confirm Action */}
          <View style={styles.footer}>
            <View style={styles.selectedDateInfo}>
              <Text style={styles.infoLabel}>Tanggal Dipilih:</Text>
              <Text style={styles.infoValue}>
                {selectedDate.getDate()} {MONTH_NAMES[selectedDate.getMonth()]}{" "}
                {selectedDate.getFullYear()}
              </Text>
            </View>

            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                <Text style={styles.cancelBtnText}>Batal</Text>
              </TouchableOpacity>
              <ScalePress style={styles.confirmBtn} onPress={handleConfirm}>
                <Text style={styles.confirmBtnText}>Pilih Tanggal</Text>
              </ScalePress>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.65)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  container: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  headerTitleWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  closeBtn: {
    padding: 4,
  },
  monthNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.slateLight,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 16,
    marginBottom: 12,
  },
  navBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  monthYearText: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  presetsRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 14,
    justifyContent: "space-between",
  },
  presetChip: {
    flex: 1,
    paddingVertical: 6,
    backgroundColor: "#F1F5F9",
    borderRadius: 8,
    alignItems: "center",
  },
  presetChipText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  daysHeader: {
    flexDirection: "row",
    marginBottom: 8,
  },
  dayLabel: {
    flex: 1,
    textAlign: "center",
    fontSize: 12,
    fontWeight: "700",
    color: colors.textMuted,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  dayCell: {
    width: "14.28%",
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    marginVertical: 2,
  },
  dayCellToday: {
    borderWidth: 1.5,
    borderColor: colors.coral,
  },
  dayCellSelected: {
    backgroundColor: colors.coral,
    shadowColor: colors.coral,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  dayText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  dayTextToday: {
    fontWeight: "800",
    color: colors.coral,
  },
  dayTextSelected: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    paddingTop: 14,
  },
  selectedDateInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textMuted,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textSecondary,
  },
  confirmBtn: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: colors.plum,
    alignItems: "center",
    shadowColor: colors.plum,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  confirmBtnText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#FFFFFF",
  },
});
