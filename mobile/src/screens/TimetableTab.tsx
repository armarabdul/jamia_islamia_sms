import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../theme';
import { AppCard, StatusPill } from '../components';

interface TimetableTabProps {
  isUrdu: boolean;
  schedule: any[];
}

export const TimetableTab: React.FC<TimetableTabProps> = ({ isUrdu, schedule }) => {
  const { theme } = useTheme();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <AppCard>
        <View style={styles.headerRow}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
            {isUrdu ? 'ہفتہ وار تدریسی شیڈول' : 'Weekly Timetable Schedule'}
          </Text>
          <StatusPill label="Active Term" status="SUCCESS" />
        </View>
        <Text style={[styles.desc, { color: theme.colors.textMuted }]}>
          {isUrdu
            ? 'جامعہ اسلامیہ کے یومیہ تعلیمی پیریڈز اور اسباق کی تفصیلات'
            : 'Official timetable including period numbers, timings, classroom locations, and teachers.'}
        </Text>
      </AppCard>

      {schedule.length > 0 ? (
        schedule.map((slot) => (
          <AppCard key={slot.id}>
            <View style={styles.slotCard}>
              <View style={styles.topRow}>
                <View style={[styles.badge, { backgroundColor: theme.colors.primaryBg, borderColor: theme.colors.borderAccent }]}>
                  <Text style={[styles.badgeText, { color: theme.colors.primary }]}>
                    Period {slot.period_number}
                  </Text>
                </View>
                <Text style={[styles.timeText, { color: theme.colors.textMuted }]}>
                  ⏰ {slot.start_time?.slice(0, 5)} — {slot.end_time?.slice(0, 5)}
                </Text>
              </View>

              <Text style={[styles.subjectName, { color: theme.colors.textPrimary }]}>
                {isUrdu ? slot.subject_name_urdu || slot.subject_name : slot.subject_name}
              </Text>

              <View style={[styles.metaRow, { borderTopColor: theme.colors.borderSubtle }]}>
                <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>
                  👨‍🏫 {slot.teacher_name || 'Assigned Faculty'}
                </Text>
                {slot.room_number && (
                  <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>
                    🏛️ Room: {slot.room_number}
                  </Text>
                )}
              </View>
            </View>
          </AppCard>
        ))
      ) : (
        <AppCard>
          <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>
            {isUrdu ? 'کوئی ٹائم ٹیبل ریکارڈ نہیں ملا' : 'No timetable schedule slots available.'}
          </Text>
        </AppCard>
      )}
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
  slotCard: {
    gap: 8,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  timeText: {
    fontSize: 12,
    fontFamily: 'monospace',
    fontWeight: '600',
  },
  subjectName: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
  },
  metaText: {
    fontSize: 12,
  },
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 18,
  },
});
