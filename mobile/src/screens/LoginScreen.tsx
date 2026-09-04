import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useTheme } from '../theme';
import { AppCard, AppButton } from '../components';

import apiClient from '../services/api';

interface LoginScreenProps {
  onLoginSuccess: (userData: any, access: string, refresh: string) => void;
  isUrdu: boolean;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
  isUrdu,
}) => {
  const { theme } = useTheme();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('JamiaAdmin2026!');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert(
        isUrdu ? 'خرابی' : 'Error',
        isUrdu ? 'براہ کرم یوزر نام اور پاس ورڈ درج کریں' : 'Please enter username and password'
      );
      return;
    }

    setIsLoading(true);
    try {
      const res = await apiClient.post('/auth/login/', {
        username: username.trim(),
        password: password.trim(),
      });
      const { access, refresh, user: userData } = res.data;
      onLoginSuccess(userData, access, refresh);
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || err.response?.data?.detail || err.message || 'Login failed';
      Alert.alert(isUrdu ? 'لاگ ان کی ناکامی' : 'Authentication Failed', msg);
    } finally {
      setIsLoading(false);
    }
  };

  const setDemoUser = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <ScrollView
      contentContainerStyle={[styles.scrollContainer, { backgroundColor: theme.colors.bgApp }]}
      keyboardShouldPersistTaps="handled"
    >
      {/* Main Login Card */}
      <AppCard style={styles.card}>
        {/* Brand Crest */}
        <View style={styles.crestContainer}>
          <View style={[styles.crest, { backgroundColor: theme.colors.primaryDark }]}>
            <Text style={styles.crestText}>ج</Text>
          </View>
          <Text style={[styles.brandTitle, { color: theme.colors.textPrimary }]}>
            {isUrdu ? 'جامعہ اسلامیہ' : 'Jamia Islamia'}
          </Text>
          <Text style={[styles.brandSubtitle, { color: theme.colors.primary }]}>
            {isUrdu ? 'بھٹکل، کرناٹک' : 'Bhatkal, Karnataka'}
          </Text>
          <Text style={[styles.tagline, { color: theme.colors.textMuted }]}>
            {isUrdu ? 'اسکول و مکتب مینجمنٹ سسٹم' : 'School Management System'}
          </Text>
        </View>

        {/* Inputs */}
        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>
            {isUrdu ? 'یوزر نام' : 'Username'}
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.bgSurfaceElevated,
                borderColor: theme.colors.borderDefault,
                color: theme.colors.textPrimary,
                textAlign: isUrdu ? 'right' : 'left',
              },
            ]}
            value={username}
            onChangeText={setUsername}
            placeholder="e.g. admin, teacher_ahmed"
            placeholderTextColor={theme.colors.textMuted}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>
            {isUrdu ? 'پاس ورڈ' : 'Password'}
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.bgSurfaceElevated,
                borderColor: theme.colors.borderDefault,
                color: theme.colors.textPrimary,
                textAlign: isUrdu ? 'right' : 'left',
              },
            ]}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholderTextColor={theme.colors.textMuted}
          />
        </View>

        <AppButton
          title={isUrdu ? 'لاگ ان کریں' : 'Sign In'}
          onPress={handleSignIn}
          isLoading={isLoading}
          variant="primary"
          size="lg"
          style={{ marginTop: 12 }}
        />

        {/* Quick Demo Logins */}
        <View style={[styles.demoSection, { borderTopColor: theme.colors.borderSubtle }]}>
          <Text style={[styles.demoHeading, { color: theme.colors.textMuted }]}>
            {isUrdu ? 'براہِ راست ڈیمو اکاؤنٹس' : 'Quick Demo Logins'}
          </Text>

          <View style={styles.demoGrid}>
            <TouchableOpacity
              onPress={() => setDemoUser('admin', 'JamiaAdmin2026!')}
              style={[styles.demoBtn, { backgroundColor: theme.colors.bgSurfaceElevated, borderColor: theme.colors.borderSubtle }]}
            >
              <Text style={[styles.demoRole, { color: theme.colors.primary }]}>🛡️ Admin</Text>
              <Text style={[styles.demoName, { color: theme.colors.textMuted }]}>admin</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setDemoUser('teacher_ahmed', 'JamiaPass2026!')}
              style={[styles.demoBtn, { backgroundColor: theme.colors.bgSurfaceElevated, borderColor: theme.colors.borderSubtle }]}
            >
              <Text style={[styles.demoRole, { color: theme.colors.primary }]}>📖 Teacher</Text>
              <Text style={[styles.demoName, { color: theme.colors.textMuted }]}>teacher_ahmed</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setDemoUser('parent_tariq', 'JamiaPass2026!')}
              style={[styles.demoBtn, { backgroundColor: theme.colors.bgSurfaceElevated, borderColor: theme.colors.borderSubtle }]}
            >
              <Text style={[styles.demoRole, { color: theme.colors.gold }]}>👨‍👧 Parent</Text>
              <Text style={[styles.demoName, { color: theme.colors.textMuted }]}>parent_tariq</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setDemoUser('student_zaid', 'JamiaPass2026!')}
              style={[styles.demoBtn, { backgroundColor: theme.colors.bgSurfaceElevated, borderColor: theme.colors.borderSubtle }]}
            >
              <Text style={[styles.demoRole, { color: theme.colors.gold }]}>🎓 Student</Text>
              <Text style={[styles.demoName, { color: theme.colors.textMuted }]}>student_zaid</Text>
            </TouchableOpacity>
          </View>
        </View>
      </AppCard>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  topUtilityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  smallBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallBtnText: {
    fontSize: 16,
  },
  langBtn: {
    paddingHorizontal: 12,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  langBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  card: {
    padding: 24,
  },
  crestContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  crest: {
    width: 60,
    height: 60,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
    marginBottom: 10,
  },
  crestText: {
    color: '#fbbf24',
    fontSize: 32,
    fontWeight: '700',
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  tagline: {
    fontSize: 11,
    marginTop: 4,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 14,
  },
  demoSection: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  demoHeading: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
    textAlign: 'center',
  },
  demoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  demoBtn: {
    flex: 1,
    minWidth: '45%',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  demoRole: {
    fontSize: 12,
    fontWeight: '700',
  },
  demoName: {
    fontSize: 10,
    marginTop: 2,
  },
});
