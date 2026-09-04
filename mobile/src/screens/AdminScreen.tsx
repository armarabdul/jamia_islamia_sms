import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../theme';
import { AppCard, StatTile, StatusPill, AppButton } from '../components';

interface AdminScreenProps {
  isUrdu: boolean;
  announcements: any[];
  onNavigateTab: (tab: 'home' | 'attendance' | 'timetable' | 'homework' | 'announcements') => void;
}

export const AdminScreen: React.FC<AdminScreenProps> = ({ isUrdu, announcements, onNavigateTab }) => {
  const { theme } = useTheme();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* 4 KPI Stat Tiles */}
      <View style={styles.gridRow}>
        <StatTile
          title={isUrdu ? 'کل طلبہ' : 'Students'}
          value="120"
          subtitle="Enrolled 2026-27"
          iconText="🎓"
          accentColor="emerald"
        />
        <StatTile
          title={isUrdu ? 'اساتذہ' : 'Teachers'}
          value="18"
          subtitle="Active Faculty"
          iconText="👥"
          accentColor="gold"
        />
      </View>

      <View style={styles.gridRow}>
        <StatTile
          title={isUrdu ? 'آج کی حاضری' : 'Attendance'}
          value="96.5%"
          subtitle="Institute Average"
          iconText="📊"
          accentColor="blue"
        />
        <StatTile
          title={isUrdu ? 'سسٹم اسٹیٹس' : 'System Status'}
          value="HEALTHY"
          subtitle="API & Database Probes"
          iconText="🛡️"
          accentColor="purple"
        />
      </View>

      {/* Quick Action Card */}
      <AppCard style={{ marginTop: 8 }}>
        <Text style={[styles.cardTitle, { color: theme.colors.textPrimary }]}>
          {isUrdu ? 'انتظامی امور' : 'Administrative Quick Actions'}
        </Text>
        <Text style={[styles.cardDesc, { color: theme.colors.textMuted }]}>
          {isUrdu
            ? 'حاضری، ٹائم ٹیبل اور اعلانات کا فوری جائزہ'
            : 'Access daily attendance registers, timetables, and institute notifications.'}
        </Text>

        <View style={styles.actionRow}>
          <AppButton
            title={isUrdu ? 'حاضری دیکھیں' : 'View Attendance'}
            onPress={() => onNavigateTab('attendance')}
            variant="primary"
            size="sm"
            style={{ flex: 1 }}
          />
          <AppButton
            title={isUrdu ? 'اوقات نامہ' : 'Timetable'}
            onPress={() => onNavigateTab('timetable')}
            variant="secondary"
            size="sm"
            style={{ flex: 1 }}
          />
        </View>
      </AppCard>

      {/* Recent Announcements Feed */}
      <AppCard style={{ marginTop: 8 }}>
        <View style={styles.annHeader}>
          <Text style={[styles.cardTitle, { color: theme.colors.textPrimary }]}>
            {isUrdu ? 'تازہ ترین اعلانات' : 'Recent Announcements'}
          </Text>
          <StatusPill label="Jamia Alerts" status="INFO" />
        </View>

        {announcements.length > 0 ? (
          announcements.slice(0, 3).map((a) => (
            <View
              key={a.id}
              style={[styles.annItem, { borderBottomColor: theme.colors.borderSubtle }]}
            >
              <Text style={[styles.annTitle, { color: theme.colors.textPrimary }]}>
                {isUrdu ? a.title_urdu || a.title : a.title}
              </Text>
              <Text style={[styles.annBody, { color: theme.colors.textSecondary }]} numberOfLines={2}>
                {isUrdu ? a.body_urdu || a.body : a.body}
              </Text>
            </View>
          ))
        ) : (
          <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>
            {isUrdu ? 'کوئی نیا اعلان نہیں ہے' : 'No recent announcements.'}
          </Text>
        )}
      </AppCard>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 32,
  },
  gridRow: {
    flexDirection: 'row',
    marginHorizontal: -4,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  cardDesc: {
    fontSize: 12,
    marginTop: 4,
    marginBottom: 12,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  annHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  annItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  annTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  annBody: {
    fontSize: 11,
    marginTop: 2,
  },
  emptyText: {
    fontSize: 12,
    textAlign: 'center',
    paddingVertical: 16,
  },
});
