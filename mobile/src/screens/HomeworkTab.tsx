import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../theme';
import { AppCard, StatusPill } from '../components';

interface HomeworkTabProps {
  isUrdu: boolean;
  homeworkList: any[];
}

export const HomeworkTab: React.FC<HomeworkTabProps> = ({ isUrdu, homeworkList }) => {
  const { theme } = useTheme();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <AppCard>
        <View style={styles.headerRow}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
            {isUrdu ? 'گھر کا کام و اسائنمنٹس' : 'Assigned Homework & Tasks'}
          </Text>
          <StatusPill label="Homework" status="WARNING" />
        </View>
        <Text style={[styles.desc, { color: theme.colors.textMuted }]}>
          {isUrdu
            ? 'تمام جاری شدہ اسائنمنٹس، آخری تاریخ اور ہدایات'
            : 'Track homework tasks, due dates, instructions, and teacher expectations.'}
        </Text>
      </AppCard>

      {homeworkList.length > 0 ? (
        homeworkList.map((hw) => (
          <AppCard key={hw.id}>
            <View style={styles.hwCard}>
              <View style={styles.topRow}>
                <View style={[styles.subjectBadge, { backgroundColor: theme.colors.goldBg, borderColor: theme.colors.goldLight }]}>
                  <Text style={[styles.subjectText, { color: theme.colors.goldDark }]}>
                    {hw.subject_name || 'General Academic'}
                  </Text>
                </View>
                <Text style={[styles.dueDate, { color: theme.colors.error }]}>
                  📅 Due: {hw.due_date}
                </Text>
              </View>

              <Text style={[styles.hwTitle, { color: theme.colors.textPrimary }]}>
                {isUrdu ? hw.title_urdu || hw.title : hw.title}
              </Text>

              <Text style={[styles.hwDesc, { color: theme.colors.textSecondary }]}>
                {hw.description}
              </Text>
            </View>
          </AppCard>
        ))
      ) : (
        <AppCard>
          <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>
            {isUrdu ? 'کوئی ہوم ورک تفویض نہیں کیا گیا' : 'No homework assignments posted.'}
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
  hwCard: {
    gap: 8,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subjectBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  subjectText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  dueDate: {
    fontSize: 12,
    fontFamily: 'monospace',
    fontWeight: '700',
  },
  hwTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  hwDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 18,
  },
});
