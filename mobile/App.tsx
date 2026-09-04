import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  StatusBar,
  Alert,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { ThemeProvider, useTheme } from './src/theme';
import { AppHeader, SyncBanner } from './src/components';
import {
  LoginScreen,
  AdminScreen,
  TeacherScreen,
  ParentScreen,
  StudentScreen,
  AttendanceTab,
  TimetableTab,
  HomeworkTab,
  AnnouncementsTab,
  SettingsModal,
} from './src/screens';
import apiClient, {
  getApiBaseUrl,
  setCustomApiBaseUrl,
  setAuthTokens,
  clearAuthSession,
  storeUserData,
  getStoredUserData,
} from './src/services/api';
import { OfflineSyncManager, NetworkSyncState } from './src/services/syncManager';
import { registerForPushNotificationsAsync } from './src/services/notifications';

type TabType = 'home' | 'attendance' | 'timetable' | 'homework' | 'announcements';

function MainApp() {
  const { theme, mode } = useTheme();
  const [language, setLanguage] = useState<'en' | 'ur'>('en');
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('home');

  // Offline & Network state
  const [networkState, setNetworkState] = useState<NetworkSyncState>('ONLINE');
  const [pendingQueueCount, setPendingQueueCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  // Settings Modal
  const [showSettings, setShowSettings] = useState(false);
  const [apiBaseUrl, setApiBaseUrl] = useState('');
  const [academicYearId, setAcademicYearId] = useState<string>('');

  // Role Specific Data
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [students, setStudents] = useState<any[]>([]);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'>>({});

  // Parent Data
  const [childrenList, setChildrenList] = useState<any[]>([]);
  const [activeChild, setActiveChild] = useState<any | null>(null);
  const [childStats, setChildStats] = useState<any | null>(null);

  // General Academic Data
  const [schedule, setSchedule] = useState<any[]>([]);
  const [homeworkList, setHomeworkList] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);

  const isUrdu = language === 'ur';

  // 1. Initial boot
  useEffect(() => {
    bootApp();
  }, []);

  const bootApp = async () => {
    const url = await getApiBaseUrl();
    setApiBaseUrl(url);

    const storedUser = await getStoredUserData();
    if (storedUser) {
      setUser(storedUser);
      loadRoleData(storedUser);
    }
    refreshQueueCount();
  };

  const refreshQueueCount = async () => {
    const queue = await OfflineSyncManager.getQueue();
    setPendingQueueCount(queue.length);
  };

  // 2. Authentication
  const handleLoginSuccess = async (userData: any, access: string, refresh: string) => {
    await setAuthTokens(access, refresh);
    await storeUserData(userData);
    setUser(userData);

    registerForPushNotificationsAsync();
    loadRoleData(userData);
  };

  const handleLogout = async () => {
    await clearAuthSession();
    setUser(null);
    setChildrenList([]);
    setActiveChild(null);
    setStudents([]);
    setSchedule([]);
    setHomeworkList([]);
    setActiveTab('home');
  };

  // 3. Load Role Data
  const loadRoleData = async (currentUser: any) => {
    const role = currentUser.role;

    try {
      // Announcements (All roles)
      apiClient.get('/announcements/').then((res) => {
        const data = res.data.results || res.data;
        setAnnouncements(data);
        OfflineSyncManager.cacheReadData('announcements', data);
      }).catch(async () => {
        const cached = await OfflineSyncManager.getCachedReadData('announcements');
        if (cached) setAnnouncements(cached as any[]);
      });

      // Teacher / Admin Flow
      if (role === 'TEACHER' || role === 'ADMIN') {
        const yearRes = await apiClient.get('/academic/years/');
        const years = yearRes.data.results || yearRes.data;
        const currentYear = years.find((y: any) => y.is_current) || years[0];
        if (currentYear) {
          setAcademicYearId(currentYear.id);
        }

        const classRes = await apiClient.get('/academic/classes/');
        const clsList = classRes.data.results || classRes.data;
        setClasses(clsList);
        if (clsList.length > 0) {
          setSelectedClass(clsList[0].id);
          if (clsList[0].sections?.length > 0) {
            setSelectedSection(clsList[0].sections[0].id);
            fetchStudentsForSection(clsList[0].sections[0].id);
          }
        }

        // Timetable
        apiClient.get('/timetable/my-schedule/').then((res) => {
          setSchedule(res.data.results || res.data);
        });

        // Homework
        apiClient.get('/assignments/').then((res) => {
          setHomeworkList(res.data.results || res.data);
        });
      }

      // Parent Flow
      if (role === 'PARENT') {
        const parRes = await apiClient.get('/parents/my-children/');
        const kids = parRes.data.results || parRes.data;
        setChildrenList(kids);
        if (kids.length > 0) {
          setActiveChild(kids[0]);
          loadChildDetails(kids[0].id);
        }
      }

      // Student Flow
      if (role === 'STUDENT') {
        apiClient.get('/timetable/my-schedule/').then((res) => {
          setSchedule(res.data.results || res.data);
        });
        apiClient.get('/assignments/').then((res) => {
          setHomeworkList(res.data.results || res.data);
        });
        const sId = currentUser.student_profile?.id;
        if (sId) {
          apiClient.get(`/attendance/student-summary/${sId}/`).then((res) => {
            setChildStats(res.data);
          });
        }
      }
    } catch {
      setNetworkState('OFFLINE');
    }
  };

  const fetchStudentsForSection = async (secId: string) => {
    try {
      const res = await apiClient.get(`/students/?section_id=${secId}`);
      const list = res.data.results || res.data;
      setStudents(list);

      const today = new Date().toISOString().split('T')[0];
      let records: any[] = [];
      try {
        const attRes = await apiClient.get(`/attendance/records/?section_id=${secId}&date=${today}`);
        records = attRes.data.results || attRes.data;
      } catch {}

      const initMap: Record<string, any> = {};
      list.forEach((st: any) => {
        const existing = records.find((r: any) => (r.student === st.id || r.student_id === st.id));
        initMap[st.id] = existing ? existing.status : 'PRESENT';
      });
      setAttendanceMap(initMap);
      OfflineSyncManager.cacheReadData(`students_${secId}`, list);
    } catch {
      const cached = await OfflineSyncManager.getCachedReadData(`students_${secId}`);
      if (cached) {
        setStudents(cached as any[]);
      }
    }
  };

  const loadChildDetails = async (childId: string) => {
    try {
      const statsRes = await apiClient.get(`/attendance/student-summary/${childId}/`);
      setChildStats(statsRes.data);

      const ttRes = await apiClient.get(`/timetable/my-schedule/?student_id=${childId}`);
      setSchedule(ttRes.data.results || ttRes.data);

      const hwRes = await apiClient.get('/assignments/');
      setHomeworkList(hwRes.data.results || hwRes.data);
    } catch {
      console.warn('Failed to load child details online');
    }
  };

  // 4. Attendance Submit (with offline queue)
  const submitAttendance = async () => {
    let yearId = academicYearId;
    if (!yearId) {
      try {
        const yRes = await apiClient.get('/academic/years/');
        const yList = yRes.data.results || yRes.data;
        const cur = yList.find((y: any) => y.is_current) || yList[0];
        if (cur) {
          yearId = cur.id;
          setAcademicYearId(cur.id);
        }
      } catch {}
    }

    const records = Object.entries(attendanceMap).map(([studentId, status]) => ({
      student_id: studentId,
      status,
      notes: status === 'ABSENT' ? 'Daily Absence' : '',
    }));

    const payload = {
      academic_year_id: yearId,
      class_room_id: selectedClass,
      section_id: selectedSection,
      date: new Date().toISOString().split('T')[0],
      period_number: 0,
      records,
    };

    if (networkState === 'OFFLINE') {
      await OfflineSyncManager.enqueueAction('MARK_ATTENDANCE', '/attendance/records/bulk-mark/', payload);
      Alert.alert(
        isUrdu ? 'آف لائن محفوظ' : 'Queued Offline',
        isUrdu ? 'حاضری لوکل اسٹوریج میں محفوظ ہے۔ رابطہ بحال ہوتے ہی سنک ہوگی۔' : 'Attendance saved to offline queue. Will sync automatically.'
      );
      refreshQueueCount();
      return;
    }

    try {
      setIsLoading(true);
      await apiClient.post('/attendance/records/bulk-mark/', payload);
      setNetworkState('ONLINE');
      Alert.alert(
        isUrdu ? 'کامیابی' : 'Success',
        isUrdu ? 'حاضری کامیابی سے درج کرلی گئی ہے۔' : 'Attendance submitted successfully to Jamia Islamia server.'
      );
    } catch {
      await OfflineSyncManager.enqueueAction('MARK_ATTENDANCE', '/attendance/records/bulk-mark/', payload);
      Alert.alert(
        isUrdu ? 'آف لائن کیو میں منتقل' : 'Saved to Offline Queue',
        isUrdu ? 'رابطہ منقطع ہونے کی وجہ سے ریکارڈ لوکل کیو میں محفوظ کر لیا گیا۔' : 'Connection failed. Action saved into offline mutation queue.'
      );
      setNetworkState('OFFLINE');
      refreshQueueCount();
    } finally {
      setIsLoading(false);
    }
  };

  // 5. Offline Sync Trigger
  const handleTriggerSync = async () => {
    setIsSyncing(true);
    setNetworkState('SYNCING');
    try {
      const result = await OfflineSyncManager.processSyncQueue();
      Alert.alert(
        isUrdu ? 'مطابقت پذیری مکمل' : 'Sync Complete',
        `${result.synced} ${isUrdu ? 'ریکارڈز سرور پر منتقل ہوئے' : 'actions synchronized successfully.'}`
      );
      setNetworkState('ONLINE');
    } catch {
      setNetworkState('SYNC_ERROR');
    } finally {
      setIsSyncing(false);
      refreshQueueCount();
    }
  };

  const handleSaveApiBaseUrl = async (newUrl: string) => {
    await setCustomApiBaseUrl(newUrl);
    setApiBaseUrl(newUrl);
    setShowSettings(false);
    Alert.alert('Settings Saved', `API Host set to: ${newUrl}`);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.bgApp }]}>
      <StatusBar
        barStyle={mode === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.bgSurface}
      />

      {/* Top Navigation Header */}
      <AppHeader
        userRole={user?.role}
        isUrdu={isUrdu}
        onToggleLanguage={() => setLanguage(language === 'en' ? 'ur' : 'en')}
        onOpenSettings={() => setShowSettings(true)}
        onLogout={user ? handleLogout : undefined}
      />

      {/* Network & Offline Status Banner */}
      <SyncBanner
        networkState={networkState}
        pendingCount={pendingQueueCount}
        isSyncing={isSyncing}
        onSyncPress={handleTriggerSync}
        isUrdu={isUrdu}
      />

      {!user ? (
        <LoginScreen isUrdu={isUrdu} onLoginSuccess={handleLoginSuccess} />
      ) : (
        <View style={{ flex: 1 }}>
          {/* User Bar */}
          <View style={[styles.userBar, { backgroundColor: theme.colors.bgSurfaceElevated, borderBottomColor: theme.colors.borderSubtle }]}>
            <View>
              <Text style={[styles.userName, { color: theme.colors.textPrimary }]}>
                {user.first_name ? `${user.first_name} ${user.last_name}` : user.username}
              </Text>
              <Text style={[styles.userRole, { color: theme.colors.primary }]}>
                Role: {user.role} • Jamia Portal
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleLogout}
              style={[styles.logoutBtn, { backgroundColor: theme.colors.errorBg, borderColor: theme.colors.error }]}
            >
              <Text style={[styles.logoutBtnText, { color: theme.colors.error }]}>
                {isUrdu ? 'لاگ آؤٹ' : 'Logout'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Navigation Tab Bar */}
          <View style={[styles.tabBar, { backgroundColor: theme.colors.bgSurface, borderBottomColor: theme.colors.borderSubtle }]}>
            <TouchableOpacity
              onPress={() => setActiveTab('home')}
              style={[styles.tabItem, activeTab === 'home' && { borderBottomColor: theme.colors.primary, borderBottomWidth: 2 }]}
            >
              <Text style={[styles.tabText, { color: activeTab === 'home' ? theme.colors.primary : theme.colors.textMuted }]}>
                {isUrdu ? 'مرکزی صفحہ' : 'Dashboard'}
              </Text>
            </TouchableOpacity>

            {(user.role === 'TEACHER' || user.role === 'ADMIN') && (
              <TouchableOpacity
                onPress={() => setActiveTab('attendance')}
                style={[styles.tabItem, activeTab === 'attendance' && { borderBottomColor: theme.colors.primary, borderBottomWidth: 2 }]}
              >
                <Text style={[styles.tabText, { color: activeTab === 'attendance' ? theme.colors.primary : theme.colors.textMuted }]}>
                  {isUrdu ? 'حاضری' : 'Attendance'}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={() => setActiveTab('timetable')}
              style={[styles.tabItem, activeTab === 'timetable' && { borderBottomColor: theme.colors.primary, borderBottomWidth: 2 }]}
            >
              <Text style={[styles.tabText, { color: activeTab === 'timetable' ? theme.colors.primary : theme.colors.textMuted }]}>
                {isUrdu ? 'اوقات نامہ' : 'Timetable'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTab('homework')}
              style={[styles.tabItem, activeTab === 'homework' && { borderBottomColor: theme.colors.primary, borderBottomWidth: 2 }]}
            >
              <Text style={[styles.tabText, { color: activeTab === 'homework' ? theme.colors.primary : theme.colors.textMuted }]}>
                {isUrdu ? 'ہوم ورک' : 'Homework'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTab('announcements')}
              style={[styles.tabItem, activeTab === 'announcements' && { borderBottomColor: theme.colors.primary, borderBottomWidth: 2 }]}
            >
              <Text style={[styles.tabText, { color: activeTab === 'announcements' ? theme.colors.primary : theme.colors.textMuted }]}>
                {isUrdu ? 'اعلانات' : 'Notices'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tab Routing */}
          <View style={{ flex: 1 }}>
            {activeTab === 'home' && (
              <>
                {user.role === 'ADMIN' && (
                  <AdminScreen
                    isUrdu={isUrdu}
                    announcements={announcements}
                    onNavigateTab={setActiveTab}
                  />
                )}
                {user.role === 'TEACHER' && (
                  <TeacherScreen
                    isUrdu={isUrdu}
                    classes={classes}
                    schedule={schedule}
                    announcements={announcements}
                    onNavigateTab={setActiveTab}
                  />
                )}
                {user.role === 'PARENT' && (
                  <ParentScreen
                    isUrdu={isUrdu}
                    childrenList={childrenList}
                    activeChild={activeChild}
                    onSelectChild={(kid) => {
                      setActiveChild(kid);
                      loadChildDetails(kid.id);
                    }}
                    childStats={childStats}
                    schedule={schedule}
                    homeworkList={homeworkList}
                    announcements={announcements}
                    onNavigateTab={setActiveTab}
                  />
                )}
                {user.role === 'STUDENT' && (
                  <StudentScreen
                    isUrdu={isUrdu}
                    user={user}
                    childStats={childStats}
                    schedule={schedule}
                    homeworkList={homeworkList}
                    announcements={announcements}
                    onNavigateTab={setActiveTab}
                  />
                )}
              </>
            )}

            {activeTab === 'attendance' && (user.role === 'TEACHER' || user.role === 'ADMIN') && (
              <AttendanceTab
                isUrdu={isUrdu}
                classes={classes}
                selectedClass={selectedClass}
                onSelectClass={(clsId) => {
                  setSelectedClass(clsId);
                  const found = classes.find((c) => c.id === clsId);
                  if (found && found.sections?.length > 0) {
                    setSelectedSection(found.sections[0].id);
                    fetchStudentsForSection(found.sections[0].id);
                  }
                }}
                students={students}
                attendanceMap={attendanceMap}
                onStatusChange={(stId, stStatus) => {
                  setAttendanceMap({ ...attendanceMap, [stId]: stStatus });
                }}
                onSubmitAttendance={submitAttendance}
                isLoading={isLoading}
              />
            )}

            {activeTab === 'timetable' && (
              <TimetableTab isUrdu={isUrdu} schedule={schedule} />
            )}

            {activeTab === 'homework' && (
              <HomeworkTab isUrdu={isUrdu} homeworkList={homeworkList} />
            )}

            {activeTab === 'announcements' && (
              <AnnouncementsTab isUrdu={isUrdu} announcements={announcements} />
            )}
          </View>
        </View>
      )}

      {/* Settings Modal */}
      <SettingsModal
        visible={showSettings}
        onClose={() => setShowSettings(false)}
        apiBaseUrl={apiBaseUrl}
        onSaveApiBaseUrl={handleSaveApiBaseUrl}
        isUrdu={isUrdu}
      />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <MainApp />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  userBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '700',
  },
  userRole: {
    fontSize: 11,
    marginTop: 2,
    fontWeight: '600',
  },
  logoutBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 36,
    justifyContent: 'center',
  },
  logoutBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
