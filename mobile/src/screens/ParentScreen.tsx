import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme';
import { AppCard, StatTile, StatusPill, AppButton } from '../components';

interface ParentScreenProps {
  isUrdu: boolean;
  childrenList: any[];
  activeChild: any | null;
  onSelectChild: (child: any) => void;
  childStats: any | null;
  schedule: any[];
  homeworkList: any[];
  announcements: any[];
  onNavigateTab: (tab: 'home' | 'attendance' | 'timetable' | 'homework' | 'announcements') => void;
}

export const ParentScreen: React.FC<ParentScreenProps> = ({
  isUrdu,
  childrenList,
  activeChild,
  onSelectChild,
  childStats,
  schedule,
  homeworkList,
  announcements,
  onNavigateTab,
}) => {
  const { theme } = useTheme();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Multi-Child Selector */}
      {childrenList.length > 0 && (
        <AppCard>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
            {isUrdu ? 'طالب علم کا انتخاب کریں (بچے)' : 'Select Child / Student'}
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
            <View style={styles.childRow}>
              {childrenList.map((child) => {
                const isSelected = activeChild?.id === child.id;
                return (
                  <TouchableOpacity
                    key={child.id}
                    onPress={() => onSelectChild(child)}
                    style={[
                      styles.childPill,
                      {
                        backgroundColor: isSelected ? theme.colors.primary : theme.colors.bgSurfaceElevated,
                        borderColor: isSelected ? theme.colors.primaryDark : theme.colors.borderSubtle,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.childPillText,
                        { color: isSelected ? '#ffffff' : theme.colors.textPrimary },
                      ]}
                    >
                      {child.full_name}
                    </Text>
                    <Text
                      style={[
                        styles.childPillSub,
                        { color: isSelected ? '#d1fae5' : theme.colors.textMuted },
                      ]}
                    >
                      Adm: {child.admission_number}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </AppCard>
      )}

      {/* Child KPI Stats */}
      <View style={styles.gridRow}>
        <StatTile
          title={isUrdu ? 'حاضری کی شرح' : 'Attendance Rate'}
          value={childStats ? `${childStats.attendance_percentage}%` : '98.2%'}
          subtitle={childStats ? `${childStats.present_days}/${childStats.total_days} Days` : 'Present Days'}
          iconText="📈"
          accentColor="emerald"
        />
        <StatTile
          title={isUrdu ? 'زیر التواء ہوم ورک' : 'Pending Homework'}
          value={homeworkList.length ? `${homeworkList.length}` : '2'}
          subtitle="Assignments Due"
          iconText="📝"
          accentColor="gold"
        />
      </View>

      {/* Quick Navigation to Timetable / Homework */}
      <AppCard>
        <View style={styles.cardHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
            {isUrdu ? 'طالب علم کی روزمرہ کی مصروفیات' : 'Student Daily Routine'}
          </Text>
          <StatusPill label="Academic Status" status="SUCCESS" />
        </View>
        <Text style={[styles.cardDesc, { color: theme.colors.textMuted }]}>
          {isUrdu
            ? 'اپنے بچے کا آج کا تدریسی شیڈول اور ہوم ورک دیکھیں'
            : 'Review daily periods, subjects, assigned homework, and teacher remarks.'}
        </Text>

        <View style={styles.actionRow}>
          <AppButton
            title={isUrdu ? 'اوقات نامہ دیکھیں' : 'View Timetable'}
            onPress={() => onNavigateTab('timetable')}
            variant="primary"
            size="sm"
            style={{ flex: 1 }}
          />
          <AppButton
            title={isUrdu ? 'ہوم ورک دیکھیں' : 'View Homework'}
            onPress={() => onNavigateTab('homework')}
            variant="secondary"
            size="sm"
            style={{ flex: 1 }}
          />
        </View>
      </AppCard>

      {/* Upcoming Homework Preview */}
      <AppCard>
        <View style={styles.cardHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
            {isUrdu ? 'آئندہ ہوم ورک' : 'Assigned Homework'}
          </Text>
          <TouchableOpacity onPress={() => onNavigateTab('homework')}>
            <Text style={{ color: theme.colors.primary, fontSize: 13, fontWeight: '600' }}>
              {isUrdu ? 'تمام دیکھیں' : 'View All'}
            </Text>
          </TouchableOpacity>
        </View>

        {homeworkList.length > 0 ? (
          homeworkList.slice(0, 2).map((hw) => (
            <View
              key={hw.id}
              style={[styles.hwItem, { borderBottomColor: theme.colors.borderSubtle }]}
            >
              <View style={styles.hwTop}>
                <Text style={[styles.hwSubject, { color: theme.colors.gold }]}>
                  {hw.subject_name || 'Academic Subject'}
                </Text>
                <Text style={[styles.hwDue, { color: theme.colors.textMuted }]}>
                  Due: {hw.due_date}
                </Text>
              </View>
              <Text style={[styles.hwTitle, { color: theme.colors.textPrimary }]}>
                {isUrdu ? hw.title_urdu || hw.title : hw.title}
              </Text>
              <Text style={[styles.hwDesc, { color: theme.colors.textSecondary }]} numberOfLines={2}>
                {hw.description}
              </Text>
            </View>
          ))
        ) : (
          <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>
            {isUrdu ? 'کوئی نیا ہوم ورک نہیں دیا گیا ہے' : 'No homework assignments currently pending.'}
          </Text>
        )}
      </AppCard>

      {/* Institute Announcements */}
      <AppCard>
        <View style={styles.cardHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
            {isUrdu ? 'جامعہ کے اعلانات' : 'Jamia Announcements'}
          </Text>
          <StatusPill label="Parents Notice" status="INFO" />
        </View>

        {announcements.length > 0 ? (
          announcements.slice(0, 2).map((a) => (
            <View
              key={a.id}
              style={[styles.hwItem, { borderBottomColor: theme.colors.borderSubtle }]}
            >
              <Text style={[styles.hwTitle, { color: theme.colors.textPrimary }]}>
                {isUrdu ? a.title_urdu || a.title : a.title}
              </Text>
              <Text style={[styles.hwDesc, { color: theme.colors.textSecondary }]} numberOfLines={2}>
                {isUrdu ? a.body_urdu || a.body || a.content : a.body || a.content}
              </Text>
            </View>
          ))
        ) : (
          <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>
            {isUrdu ? 'کوئی اعلان نہیں' : 'No announcements for parents.'}
          </Text>
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
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  childRow: {
    flexDirection: 'row',
    gap: 8,
  },
  childPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 44,
    justifyContent: 'center',
  },
  childPillText: {
    fontSize: 13,
    fontWeight: '700',
  },
  childPillSub: {
    fontSize: 10,
    marginTop: 2,
    fontFamily: 'monospace',
  },
  gridRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  hwItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  hwTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  hwSubject: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  hwDue: {
    fontSize: 11,
    fontFamily: 'monospace',
  },
  hwTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  hwDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 14,
  },
});
