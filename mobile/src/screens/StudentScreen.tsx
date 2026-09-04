import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme';
import { AppCard, StatTile, StatusPill, AppButton } from '../components';

interface StudentScreenProps {
  isUrdu: boolean;
  user: any;
  childStats: any | null;
  schedule: any[];
  homeworkList: any[];
  announcements: any[];
  onNavigateTab: (tab: 'home' | 'attendance' | 'timetable' | 'homework' | 'announcements') => void;
}

export const StudentScreen: React.FC<StudentScreenProps> = ({
  isUrdu,
  user,
  childStats,
  schedule,
  homeworkList,
  announcements,
  onNavigateTab,
}) => {
  const { theme } = useTheme();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Student Identity Card */}
      <AppCard>
        <View style={styles.profileRow}>
          <View style={[styles.avatar, { backgroundColor: theme.colors.primaryBg, borderColor: theme.colors.primary }]}>
            <Text style={[styles.avatarText, { color: theme.colors.primary }]}>
              {user.first_name ? user.first_name.charAt(0) : 'ط'}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.studentName, { color: theme.colors.textPrimary }]}>
              {user.first_name ? `${user.first_name} ${user.last_name}` : user.username}
            </Text>
            <Text style={[styles.studentMeta, { color: theme.colors.textMuted }]}>
              {isUrdu ? 'طالب علم • جامعہ اسلامیہ' : 'Student • Jamia Islamia'}
            </Text>
          </View>
          <StatusPill label="Active" status="SUCCESS" />
        </View>
      </AppCard>

      {/* KPI Stats */}
      <View style={styles.gridRow}>
        <StatTile
          title={isUrdu ? 'حاضری فیصد' : 'Attendance'}
          value={childStats ? `${childStats.attendance_percentage}%` : '98.5%'}
          subtitle={childStats ? `${childStats.present_days}/${childStats.total_days} Days` : 'Academic Term'}
          iconText="📊"
          accentColor="emerald"
        />
        <StatTile
          title={isUrdu ? 'آج کے اسباق' : "Today's Classes"}
          value={schedule.length ? `${schedule.length}` : '6'}
          subtitle="Periods Scheduled"
          iconText="📅"
          accentColor="gold"
        />
      </View>

      {/* Quick Launch Actions */}
      <AppCard>
        <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
          {isUrdu ? 'فوری تعلیمی سرگرمیاں' : 'Quick Study Links'}
        </Text>
        <View style={styles.actionRow}>
          <AppButton
            title={isUrdu ? 'میرا ٹائم ٹیبل' : 'My Timetable'}
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

      {/* Today's Schedule Overview */}
      <AppCard>
        <View style={styles.cardHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
            {isUrdu ? 'آج کے پیریڈز' : "Today's Schedule"}
          </Text>
          <TouchableOpacity onPress={() => onNavigateTab('timetable')}>
            <Text style={{ color: theme.colors.primary, fontSize: 13, fontWeight: '600' }}>
              {isUrdu ? 'مکمل شیڈول' : 'Full Schedule'}
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
              <Text style={[styles.slotTeacher, { color: theme.colors.textSecondary }]}>
                Teacher: {slot.teacher_name}
              </Text>
            </View>
          ))
        ) : (
          <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>
            {isUrdu ? 'کوئی پیریڈ مقرر نہیں ہے' : 'No periods scheduled for today.'}
          </Text>
        )}
      </AppCard>

      {/* Homework due */}
      <AppCard>
        <View style={styles.cardHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
            {isUrdu ? 'واجب الادا ہوم ورک' : 'Pending Homework'}
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
              style={[styles.slotItem, { borderBottomColor: theme.colors.borderSubtle }]}
            >
              <View style={styles.slotTop}>
                <Text style={{ color: theme.colors.gold, fontSize: 11, fontWeight: '700' }}>
                  {hw.subject_name}
                </Text>
                <Text style={[styles.slotTime, { color: theme.colors.textMuted }]}>
                  Due: {hw.due_date}
                </Text>
              </View>
              <Text style={[styles.slotSubject, { color: theme.colors.textPrimary }]}>
                {isUrdu ? hw.title_urdu || hw.title : hw.title}
              </Text>
              <Text style={[styles.slotTeacher, { color: theme.colors.textSecondary }]} numberOfLines={2}>
                {hw.description}
              </Text>
            </View>
          ))
        ) : (
          <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>
            {isUrdu ? 'کوئی ہوم ورک نہیں ہے' : 'All homework assignments are completed.'}
          </Text>
        )}
      </AppCard>

      {/* Announcements */}
      <AppCard>
        <View style={styles.cardHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
            {isUrdu ? 'طلبہ نوٹس بورڈ' : 'Student Notices'}
          </Text>
          <StatusPill label="Notice" status="INFO" />
        </View>

        {announcements.length > 0 ? (
          announcements.slice(0, 2).map((a) => (
            <View
              key={a.id}
              style={[styles.slotItem, { borderBottomColor: theme.colors.borderSubtle }]}
            >
              <Text style={[styles.slotSubject, { color: theme.colors.textPrimary }]}>
                {isUrdu ? a.title_urdu || a.title : a.title}
              </Text>
              <Text style={[styles.slotTeacher, { color: theme.colors.textSecondary }]} numberOfLines={2}>
                {isUrdu ? a.body_urdu || a.body || a.content : a.body || a.content}
              </Text>
            </View>
          ))
        ) : (
          <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>
            {isUrdu ? 'کوئی نیا نوٹس نہیں ہے' : 'No student notices available.'}
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
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  studentName: {
    fontSize: 16,
    fontWeight: '700',
  },
  studentMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
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
    fontSize: 11,
    fontFamily: 'monospace',
  },
  slotSubject: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  slotTeacher: {
    fontSize: 12,
    lineHeight: 16,
  },
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 14,
  },
});
