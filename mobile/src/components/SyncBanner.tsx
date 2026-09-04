import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useTheme } from '../theme';
import { NetworkSyncState } from '../services/syncManager';

interface SyncBannerProps {
  networkState: NetworkSyncState;
  pendingCount: number;
  isSyncing: boolean;
  onSyncPress: () => void;
  isUrdu?: boolean;
}

export const SyncBanner: React.FC<SyncBannerProps> = ({
  networkState,
  pendingCount,
  isSyncing,
  onSyncPress,
  isUrdu = false,
}) => {
  const { theme } = useTheme();

  if (networkState === 'ONLINE' && pendingCount === 0 && !isSyncing) {
    return null; // Clean: no banner needed when synced & online
  }

  const isOffline = networkState === 'OFFLINE' || pendingCount > 0;

  return (
    <View
      style={[
        styles.banner,
        {
          backgroundColor: isOffline ? theme.colors.warningBg : theme.colors.primaryBg,
          borderColor: isOffline ? theme.colors.warning : theme.colors.primary,
        },
      ]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, gap: 8 }}>
        <Text style={styles.icon}>{isOffline ? '⚡' : '🔄'}</Text>
        <Text
          style={[
            styles.text,
            { color: isOffline ? theme.colors.warning : theme.colors.primary },
          ]}
        >
          {isOffline
            ? isUrdu
              ? `آف لائن موڈ (${pendingCount} زیرِ التواء)`
              : `Offline (${pendingCount} pending actions)`
            : isUrdu
            ? 'ہم وقت سازی جاری ہے...'
            : 'Synchronizing...'}
        </Text>
      </View>

      {pendingCount > 0 && (
        <TouchableOpacity
          onPress={onSyncPress}
          disabled={isSyncing}
          style={[styles.syncBtn, { backgroundColor: theme.colors.warning }]}
        >
          {isSyncing ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={styles.syncBtnText}>{isUrdu ? 'ابھی سنک کریں' : 'Sync Now'}</Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  icon: {
    fontSize: 16,
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
  },
  syncBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  syncBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
});
