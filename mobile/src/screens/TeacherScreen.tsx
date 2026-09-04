import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme';
import { AppCard, StatTile, StatusPill, AppButton } from '../components';

interface TeacherScreenProps {
  isUrdu: boolean;
  classes: any[];
  schedule: any[];
  announcements: any[];
  onNavigateTab: (tab: 'home' | 'attendance' | 'timetable' | 'homework' | 'announcements') => void;
}

export const TeacherScreen: React.FC<TeacherScreenProps> = ({
  isUrdu,
  classes,
  schedule,
  announcements,
  onNavigateTab,
}) => {
  const { theme } = useTheme();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* 4 KPI Stat Tiles */}
      <View style={styles.gridRow}>
        <StatTile
          title={isUrdu ? 'میرے درجات' : 'My Classes'}
          value={classes.length ? `${classes.length}` : '4'}
          subtitle="Assigned Sections"
          iconText="📚"
          accentColor="emerald"
        />
        <StatTile
          title={isUrdu ? 'آج کے اسباق' : "Today's Periods"}
          value={schedule.length ? `${schedule.length}` : '5'}
          subtitle="Scheduled Today"
          iconText="⏱️"
          accentColor="gold"
        />
      </View>

      <View style={styles.gridRow}>
        <StatTile
          title={isUrdu ? 'حاضری رجسٹر' : 'Attendance'}
          value="Pending"
          subtitle="Daily Register"
          iconText="📋"
          accentColor="blue"
        />
        <StatTile
          title={isUrdu ? 'فعال اسائنمنٹس' : 'Assignments'}
          value="3"
          subtitle="Active Homework"
          iconText="✍️"
          accentColor="purple"
        />
      </View>

      {/* Quick Attendance Action Card */}
      <AppCard style={{ marginTop: 8 }}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, { color: theme.colors.textPrimary }]}>
            {isUrdu ? 'روزانہ حاضری اندراج' : 'Daily Attendance Marking'}
          </Text>
          <StatusPill label="Action Required" status="WARNING" />
        </View>
        <Text style={[styles.cardDesc, { color: theme.colors.textMuted }]}>
          {isUrdu
            ? 'آج کی حاضری درج کریں اور آف لائن یا آن لائن محفوظ کریں'
            : 'Mark today’s section attendance. Seamlessly works offline and syncs when reconnected.'}
        </Text>

        <View style={styles.actionRow}>
          <AppButton
            title={isUrdu ? 'حاضری درج کریں' : 'Mark Attendance'}
            onPress={() => onNavigateTab('attendance')}
            variant="primary"
            size="md"
            style={{ flex: 1 }}
          />
        </View>
      </AppCard>

      {/* Today's Schedule Overview */}
      <AppCard style={{ marginTop: 8 }}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, { color: theme.colors.textPrimary }]}>
            {isUrdu ? 'آج کا ٹائم ٹیبل' : "Today's Teaching Schedule"}
          </Text>
          <TouchableOpacity onPress={() => onNavigateTab('timetable')}>
            <Text style={{ color: theme.colors.primary, fontSize: 13, fontWeight: '600' }}>
              {isUrdu ? 'تمام دیکھیں' : 'View All'}
            </Text>
          </TouchableOpacity>
        </View>

        {schedule.length > 0 ? (
          schedule.slice(0, 3).map((slot) => (
            <View
              key={slot.id}
              style={[styles.slotItem, { borderBottomColor: theme.colors.borderSubtle }]}
            >
              <View style={styles.slotTop}>
                <Text style={[styles.periodBadge, { color: theme.colors.primary, backgroundColor: theme.colors.primaryBg }]}>
                  Period {slot.period_number}
                </Text>
                <Text style={[styles.slotTime, { color: theme.colors.textMuted }]}>
                  {slot.start_time?.slice(0, 5)} - {slot.end_time?.slice(0, 5)}
                </Text>
              </View>
              <Text style={[styles.slotSubject, { color: theme.colors.textPrimary }]}>
                {isUrdu ? slot.subject_name_urdu || slot.subject_name : slot.subject_name}
              </Text>
              <Text style={[styles.slotClass, { color: theme.colors.textSecondary }]}>
                Class: {slot.class_name || 'Assigned Class'}
              </Text>
            </View>
          ))
        ) : (
          <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>
            {isUrdu ? 'آج کوئی کلاس مقرر نہیں ہے' : 'No teaching periods scheduled for today.'}
          </Text>
        )}
      </AppCard>

      {/* Announcements */}
      <AppCard style={{ marginTop: 8 }}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, { color: theme.colors.textPrimary }]}>
            {isUrdu ? 'ادارہ جاتی اعلانات' : 'Faculty Notices'}
          </Text>
          <StatusPill label="Notices" status="INFO" />
        </View>

        {announcements.length > 0 ? (
          announcements.slice(0, 2).map((a) => (
            <View
              key={a.id}
              style={[styles.annItem, { borderBottomColor: theme.colors.borderSubtle }]}
            >
              <Text style={[styles.annTitle, { color: theme.colors.textPrimary }]}>
                {isUrdu ? a.title_urdu || a.title : a.title}
              </Text>
              <Text style={[styles.annBody, { color: theme.colors.textSecondary }]} numberOfLines={2}>
                {isUrdu ? a.body_urdu || a.body || a.content : a.body || a.content}
              </Text>
            </View>
          ))
        ) : (
          <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>
            {isUrdu ? 'کوئی نیا اعلان نہیں ہے' : 'No notices currently available.'}
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
  gridRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
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
  slotItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  slotTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  periodBadge: {
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  slotTime: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  slotSubject: {
    fontSize: 14,
    fontWeight: '600',
  },
  slotClass: {
    fontSize: 12,
    marginTop: 2,
  },
  annItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  annTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  annBody: {
    fontSize: 12,
    lineHeight: 16,
  },
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 14,
  },
});
