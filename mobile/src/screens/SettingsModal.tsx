import React from 'react';
import { Modal, View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme';
import { AppButton } from '../components';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
  apiBaseUrl: string;
  onSaveApiBaseUrl: (url: string) => void;
  isUrdu: boolean;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  visible,
  onClose,
  apiBaseUrl,
  onSaveApiBaseUrl,
  isUrdu,
}) => {
  const { theme, mode, toggleTheme } = useTheme();
  const [url, setUrl] = React.useState(apiBaseUrl);

  React.useEffect(() => {
    setUrl(apiBaseUrl);
  }, [apiBaseUrl]);

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <TouchableOpacity activeOpacity={1} onPress={onClose} style={styles.backdrop}>
        <TouchableOpacity activeOpacity={1} style={[styles.content, { backgroundColor: theme.colors.bgSurface, borderColor: theme.colors.borderDefault }]}>
          <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
            {isUrdu ? 'ترتیبات و سرور کنفیگریشن' : 'Settings & API Configuration'}
          </Text>

          {/* Theme Switcher Row */}
          <View style={[styles.themeRow, { borderBottomColor: theme.colors.borderSubtle }]}>
            <View>
              <Text style={[styles.label, { color: theme.colors.textPrimary }]}>
                {isUrdu ? 'ایپ تھیم' : 'App Theme'}
              </Text>
              <Text style={[styles.sublabel, { color: theme.colors.textMuted }]}>
                {mode === 'dark' ? (isUrdu ? 'ڈارک موڈ فعال ہے' : 'Dark Theme Active') : (isUrdu ? 'لائٹ موڈ فعال ہے' : 'Light Theme Active')}
              </Text>
            </View>
            <TouchableOpacity
              onPress={toggleTheme}
              style={[
                styles.themeBtn,
                { backgroundColor: theme.colors.bgSurfaceElevated, borderColor: theme.colors.borderSubtle },
              ]}
            >
              <Text style={[styles.themeBtnText, { color: theme.colors.textPrimary }]}>
                {mode === 'dark' ? '☀️ Light' : '🌙 Dark'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* API Base URL Setting */}
          <Text style={[styles.label, { color: theme.colors.textPrimary, marginTop: 14 }]}>
            {isUrdu ? 'بیک اینڈ سرور URL' : 'Backend API Host URL'}
          </Text>
          <Text style={[styles.desc, { color: theme.colors.textMuted }]}>
            {isUrdu
              ? 'فزیکل اینڈرائیڈ ڈیوائس کے لیے اپنے پی سی کا IP ایڈریس درج کریں (مثال: http://192.168.1.50:8000/api/v1)'
              : 'For physical Android devices over Wi-Fi, enter your development machine IP (e.g. http://192.168.1.50:8000/api/v1).'}
          </Text>

          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.bgSurfaceElevated,
                borderColor: theme.colors.borderDefault,
                color: theme.colors.textPrimary,
              },
            ]}
            value={url}
            onChangeText={setUrl}
            placeholder="http://10.0.2.2:8000/api/v1"
            placeholderTextColor={theme.colors.textMuted}
            autoCapitalize="none"
          />

          <View style={styles.btnRow}>
            <AppButton
              title={isUrdu ? 'محفوظ کریں' : 'Save Host'}
              onPress={() => onSaveApiBaseUrl(url)}
              variant="primary"
              size="md"
              style={{ flex: 1 }}
            />
            <AppButton
              title={isUrdu ? 'بند کریں' : 'Close'}
              onPress={onClose}
              variant="secondary"
              size="md"
              style={{ flex: 1 }}
            />
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 12,
  },
  themeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
  },
  sublabel: {
    fontSize: 12,
    marginTop: 2,
  },
  themeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  themeBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  desc: {
    fontSize: 12,
    lineHeight: 16,
    marginTop: 4,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    fontFamily: 'monospace',
    marginBottom: 16,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 10,
  },
});
