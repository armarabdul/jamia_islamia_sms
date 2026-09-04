import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useTheme } from '../theme';
import { AppCard, AppButton, StatusPill } from '../components';

interface AttendanceTabProps {
  isUrdu: boolean;
  classes: any[];
  selectedClass: string;
  onSelectClass: (classId: string) => void;
  students: any[];
  attendanceMap: Record<string, 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'>;
  onStatusChange: (studentId: string, status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED') => void;
  onSubmitAttendance: () => void;
  isLoading: boolean;
}

export const AttendanceTab: React.FC<AttendanceTabProps> = ({
  isUrdu,
  classes,
  selectedClass,
  onSelectClass,
  students,
  attendanceMap,
  onStatusChange,
  onSubmitAttendance,
  isLoading,
}) => {
  const { theme } = useTheme();

  const presentCount = Object.values(attendanceMap).filter((s) => s === 'PRESENT').length;
  const absentCount = Object.values(attendanceMap).filter((s) => s === 'ABSENT').length;
  const lateCount = Object.values(attendanceMap).filter((s) => s === 'LATE').length;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header & Class Selection */}
      <AppCard>
        <View style={styles.headerRow}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
            {isUrdu ? 'حاضری رجسٹر برائے سیکشن' : 'Section Attendance Register'}
          </Text>
          <StatusPill label="Daily Attendance" status="INFO" />
        </View>
        <Text style={[styles.desc, { color: theme.colors.textMuted }]}>
          {isUrdu
            ? 'کلاس منتخب کریں اور طلبہ کی حاضری درج کریں'
            : 'Select an assigned class section and mark student attendance statuses.'}
        </Text>

        {/* Class Selection Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
          <View style={styles.selectorRow}>
            {classes.map((cls) => {
              const isSelected = selectedClass === cls.id;
              return (
                <TouchableOpacity
                  key={cls.id}
                  onPress={() => onSelectClass(cls.id)}
                  style={[
                    styles.classChip,
                    {
                      backgroundColor: isSelected ? theme.colors.primary : theme.colors.bgSurfaceElevated,
                      borderColor: isSelected ? theme.colors.primaryDark : theme.colors.borderSubtle,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.classChipText,
                      { color: isSelected ? '#ffffff' : theme.colors.textPrimary },
                    ]}
                  >
                    {cls.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </AppCard>

      {/* Live Summary Pill Row */}
      {students.length > 0 && (
        <View style={styles.summaryBar}>
          <View style={[styles.summaryPill, { backgroundColor: theme.colors.successBg, borderColor: theme.colors.success }]}>
            <Text style={[styles.summaryLabel, { color: theme.colors.success }]}>
              {isUrdu ? 'حاضر: ' : 'Present: '}{presentCount}
            </Text>
          </View>
          <View style={[styles.summaryPill, { backgroundColor: theme.colors.errorBg, borderColor: theme.colors.error }]}>
            <Text style={[styles.summaryLabel, { color: theme.colors.error }]}>
              {isUrdu ? 'غیر حاضر: ' : 'Absent: '}{absentCount}
            </Text>
          </View>
          <View style={[styles.summaryPill, { backgroundColor: theme.colors.warningBg, borderColor: theme.colors.warning }]}>
            <Text style={[styles.summaryLabel, { color: theme.colors.warning }]}>
              {isUrdu ? 'تاخیر: ' : 'Late: '}{lateCount}
            </Text>
          </View>
        </View>
      )}

      {/* Student List */}
      <AppCard>
        <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary, marginBottom: 10 }]}>
          {isUrdu ? `طلبہ کی فہرست (${students.length})` : `Enrolled Students (${students.length})`}
        </Text>

        {students.length > 0 ? (
          students.map((st) => {
            const stStatus = attendanceMap[st.id] || 'PRESENT';
            return (
              <View
                key={st.id}
                style={[styles.studentRow, { borderBottomColor: theme.colors.borderSubtle }]}
              >
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={[styles.studentName, { color: theme.colors.textPrimary }]}>
                    {st.full_name}
                  </Text>
                  <Text style={[styles.studentRoll, { color: theme.colors.textMuted }]}>
                    Adm #{st.admission_number}
                  </Text>
                </View>

                {/* Status Switcher Buttons (Touch target >= 44px) */}
                <View style={styles.statusGroup}>
                  <TouchableOpacity
                    onPress={() => onStatusChange(st.id, 'PRESENT')}
                    style={[
                      styles.statusBtn,
                      {
                        backgroundColor: stStatus === 'PRESENT' ? theme.colors.primary : theme.colors.bgSurfaceElevated,
                        borderColor: stStatus === 'PRESENT' ? theme.colors.primaryDark : theme.colors.borderSubtle,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusBtnText,
                        { color: stStatus === 'PRESENT' ? '#ffffff' : theme.colors.textSecondary },
                      ]}
                    >
                      P
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => onStatusChange(st.id, 'ABSENT')}
                    style={[
                      styles.statusBtn,
                      {
                        backgroundColor: stStatus === 'ABSENT' ? theme.colors.error : theme.colors.bgSurfaceElevated,
                        borderColor: stStatus === 'ABSENT' ? theme.colors.error : theme.colors.borderSubtle,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusBtnText,
                        { color: stStatus === 'ABSENT' ? '#ffffff' : theme.colors.textSecondary },
                      ]}
                    >
                      A
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => onStatusChange(st.id, 'LATE')}
                    style={[
                      styles.statusBtn,
                      {
                        backgroundColor: stStatus === 'LATE' ? theme.colors.warning : theme.colors.bgSurfaceElevated,
                        borderColor: stStatus === 'LATE' ? theme.colors.warning : theme.colors.borderSubtle,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusBtnText,
                        { color: stStatus === 'LATE' ? '#ffffff' : theme.colors.textSecondary },
                      ]}
                    >
                      L
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        ) : (
          <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>
            {isUrdu ? 'اس سیکشن کے لیے کوئی طالب علم موجود نہیں' : 'No students registered in this section.'}
          </Text>
        )}

        {students.length > 0 && (
          <View style={{ marginTop: 16 }}>
            <AppButton
              title={isUrdu ? 'حاضری محفوظ کریں' : 'Submit Attendance'}
              onPress={onSubmitAttendance}
              variant="primary"
              size="lg"
              loading={isLoading}
              disabled={isLoading}
            />
          </View>
        )}
      </AppCard>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  desc: {
    fontSize: 13,
    lineHeight: 18,
  },
  selectorRow: {
    flexDirection: 'row',
    gap: 8,
  },
  classChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 44,
    justifyContent: 'center',
  },
  classChipText: {
    fontSize: 13,
    fontWeight: '700',
  },
  summaryBar: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
  },
  summaryPill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  studentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  studentName: {
    fontSize: 14,
    fontWeight: '600',
  },
  studentRoll: {
    fontSize: 11,
    fontFamily: 'monospace',
    marginTop: 2,
  },
  statusGroup: {
    flexDirection: 'row',
    gap: 6,
  },
  statusBtn: {
    width: 44,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBtnText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 18,
  },
});
