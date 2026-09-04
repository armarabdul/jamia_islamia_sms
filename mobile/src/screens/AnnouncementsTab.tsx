import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../theme';
import { AppCard, StatusPill } from '../components';

interface AnnouncementsTabProps {
  isUrdu: boolean;
  announcements: any[];
}

export const AnnouncementsTab: React.FC<AnnouncementsTabProps> = ({ isUrdu, announcements }) => {
  const { theme } = useTheme();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <AppCard>
        <View style={styles.headerRow}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
            {isUrdu ? 'سرکاری اعلانات و نوٹس بورڈ' : 'Official Announcements'}
          </Text>
          <StatusPill label="Institutional" status="INFO" />
        </View>
        <Text style={[styles.desc, { color: theme.colors.textMuted }]}>
          {isUrdu
            ? 'جامعہ اسلامیہ کے تمام سرکاری اعلانات اور اہم اطلاعات'
            : 'Stay informed with verified institutional circulars, academic events, and emergency notices.'}
        </Text>
      </AppCard>

      {announcements.length > 0 ? (
        announcements.map((ann) => (
          <AppCard key={ann.id}>
            <View style={styles.annCard}>
              <View style={styles.topRow}>
                <StatusPill
                  label={ann.priority || 'ANNOUNCEMENT'}
                  status={ann.priority === 'HIGH' ? 'ERROR' : ann.priority === 'MEDIUM' ? 'WARNING' : 'INFO'}
                />
                <Text style={[styles.dateText, { color: theme.colors.textMuted }]}>
                  {ann.published_at ? new Date(ann.published_at).toLocaleDateString() : 'Active'}
                </Text>
              </View>

              <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
                {isUrdu ? ann.title_urdu || ann.title : ann.title}
              </Text>

              <Text style={[styles.body, { color: theme.colors.textSecondary }]}>
                {isUrdu ? ann.content_urdu || ann.content || ann.body_urdu || ann.body : ann.content || ann.body}
              </Text>

              {ann.author_name && (
                <View style={[styles.metaRow, { borderTopColor: theme.colors.borderSubtle }]}>
                  <Text style={[styles.authorText, { color: theme.colors.textMuted }]}>
                    ✍️ Issued by: {ann.author_name}
                  </Text>
                </View>
              )}
            </View>
          </AppCard>
        ))
      ) : (
        <AppCard>
          <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>
            {isUrdu ? 'کوئی اعلان دستیاب نہیں ہے' : 'No announcements currently available.'}
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
  annCard: {
    gap: 8,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 11,
    fontFamily: 'monospace',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  body: {
    fontSize: 13,
    lineHeight: 19,
  },
  metaRow: {
    paddingTop: 8,
    borderTopWidth: 1,
  },
  authorText: {
    fontSize: 11,
    fontStyle: 'italic',
  },
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 18,
  },
});
