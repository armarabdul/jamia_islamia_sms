import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  StatusBar,
  ActivityIndicator,
  Alert,
  Modal
} from 'react-native';
import apiClient, { 
  getApiBaseUrl, 
  setCustomApiBaseUrl, 
  setAuthTokens, 
  clearAuthSession, 
  storeUserData, 
  getStoredUserData 
} from './src/services/api';
import { OfflineSyncManager, NetworkSyncState } from './src/services/syncManager';
import { registerForPushNotificationsAsync } from './src/services/notifications';

export default function App() {
  const [language, setLanguage] = useState<'en' | 'ur'>('en');
  const [user, setUser] = useState<any | null>(null);
  const [username, setUsername] = useState('teacher_ahmed');
  const [password, setPassword] = useState('JamiaPass2026!');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'attendance' | 'timetable' | 'homework' | 'announcements'>('home');
  
  // Offline & Network state
  const [networkState, setNetworkState] = useState<NetworkSyncState>('ONLINE');
  const [pendingQueueCount, setPendingQueueCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  // Settings Modal
  const [showSettings, setShowSettings] = useState(false);
  const [apiBaseUrl, setApiBaseUrl] = useState('');

  // Role Data
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [students, setStudents] = useState<any[]>([]);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'>>({});
  
  // Parent Data
  const [children, setChildren] = useState<any[]>([]);
  const [activeChild, setActiveChild] = useState<any | null>(null);
  const [childStats, setChildStats] = useState<any | null>(null);

  // General Data
  const [schedule, setSchedule] = useState<any[]>([]);
  const [homeworkList, setHomeworkList] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);

  const isUrdu = language === 'ur';

  // 1. Initial boot: restore session, check host config, check offline queue
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

  // 2. Real Login
  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert(isUrdu ? 'خرابی' : 'Error', isUrdu ? 'براہ کرم یوزر نام اور پاس ورڈ درج کریں' : 'Please enter username and password');
      return;
    }

    setIsLoading(true);
    try {
      const res = await apiClient.post('/auth/login/', {
        username: username.trim(),
        password: password.trim(),
      });

      const { access, refresh, user: userData } = res.data;
      await setAuthTokens(access, refresh);
      await storeUserData(userData);
      setUser(userData);

      // Register Push Notifications
      registerForPushNotificationsAsync();

      // Load Role Specific Data
      loadRoleData(userData);
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || err.response?.data?.detail || err.message || 'Login failed';
      Alert.alert(isUrdu ? 'لاگ ان کی ناکامی' : 'Authentication Failed', msg);
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Real Logout
  const handleLogout = async () => {
    await clearAuthSession();
    setUser(null);
    setChildren([]);
    setActiveChild(null);
    setStudents([]);
    setSchedule([]);
  };

  // 4. Load Role Data from Real APIs (with offline caching)
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

      // Teacher Flow
      if (role === 'TEACHER' || role === 'ADMIN') {
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
        setChildren(kids);
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
    } catch (e) {
      console.warn('Network error loading role data, using cache if available');
      setNetworkState('OFFLINE');
    }
  };

  const fetchStudentsForSection = async (secId: string) => {
    try {
      const res = await apiClient.get(`/students/?section_id=${secId}`);
      const list = res.data.results || res.data;
      setStudents(list);
      const initMap: Record<string, any> = {};
      list.forEach((st: any) => { initMap[st.id] = 'PRESENT'; });
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
    } catch (e) {
      console.warn('Failed to load child details online');
    }
  };

  // 5. Submit Attendance (Real API with offline mutation fallback)
  const submitAttendance = async () => {
    const records = Object.entries(attendanceMap).map(([studentId, status]) => ({
      student_id: studentId,
      status,
      notes: status === 'ABSENT' ? 'Daily Absence' : '',
    }));

    const payload = {
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
        isUrdu ? 'حاضری لوکل اسٹوریج میں محفوظ ہے۔ انٹرنیٹ آنے پر مطابقت پذیری ہوگی۔' : 'Attendance saved to local offline queue. Will sync automatically.'
      );
      refreshQueueCount();
      return;
    }

    try {
      setIsLoading(true);
      await apiClient.post('/attendance/records/bulk-mark/', payload);
      Alert.alert(
        isUrdu ? 'کامیابی' : 'Success',
        isUrdu ? 'حاضری کامیابی سے درج کرلی گئی ہے۔' : 'Attendance submitted successfully to Jamia Islamia server.'
      );
    } catch (err: any) {
      // If network fails during submit, queue offline
      await OfflineSyncManager.enqueueAction('MARK_ATTENDANCE', '/attendance/records/bulk-mark/', payload);
      Alert.alert(
        isUrdu ? 'آف لائن کیو میں منتقل' : 'Network Failed - Saved to Queue',
        isUrdu ? 'رابطہ منقطع ہونے کی وجہ سے ریکارڈ لوکل کیو میں محفوظ کر لیا گیا۔' : 'Connection failed. Action saved into offline mutation queue.'
      );
      setNetworkState('OFFLINE');
      refreshQueueCount();
    } finally {
      setIsLoading(false);
    }
  };

  // 6. Manual Sync Queue Trigger
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#064e3b" />

      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerBrand}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoText}>ج</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>
              {isUrdu ? 'جامعہ اسلامیہ بھٹکل' : 'Jamia Islamia'}
            </Text>
            <Text style={styles.headerSubtitle}>
              {isUrdu ? 'نوایت کالونی، بھٹکل' : 'Nawayath Colony, Bhatkal'}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <TouchableOpacity
            onPress={() => setShowSettings(true)}
            style={styles.iconBtn}
          >
            <Text style={styles.iconBtnText}>⚙️</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setLanguage(language === 'en' ? 'ur' : 'en')}
            style={styles.langBtn}
          >
            <Text style={styles.langBtnText}>{language === 'en' ? 'اردو' : 'English'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Network & Offline Status Banner */}
      <View style={[
        styles.networkBanner,
        networkState === 'OFFLINE' ? styles.bannerOffline :
        networkState === 'SYNCING' ? styles.bannerSyncing :
        pendingQueueCount > 0 ? styles.bannerPending : styles.bannerOnline
      ]}>
        <Text style={styles.networkBannerText}>
          {networkState === 'OFFLINE' ? (isUrdu ? '📴 آف لائن موڈ فعال ہے' : '📴 Offline Mode Active') :
           networkState === 'SYNCING' ? (isUrdu ? '🔄 سرور کے ساتھ مطابقت پذیری ہو رہی ہے...' : '🔄 Synchronizing with server...') :
           pendingQueueCount > 0 ? (isUrdu ? `⚡ ${pendingQueueCount} آف لائن ریکارڈز سنک کے منتظر ہیں` : `⚡ ${pendingQueueCount} offline actions pending sync`) :
           (isUrdu ? '🌐 آن لائن (سرور سے منسلک)' : '🌐 Online (Connected to Backend)')}
        </Text>

        {pendingQueueCount > 0 && (
          <TouchableOpacity onPress={handleTriggerSync} style={styles.syncBtn}>
            <Text style={styles.syncBtnText}>{isUrdu ? 'ابھی سنک کریں' : 'Sync Now'}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ========================================================================= */}
      {/* LOGIN VIEW */}
      {/* ========================================================================= */}
      {!user ? (
        <ScrollView contentContainerStyle={styles.loginContainer}>
          <View style={styles.loginCard}>
            <Text style={styles.cardTitle}>
              {isUrdu ? 'جامعہ اسلامیہ اسکول پورٹل' : 'Jamia Islamia Mobile Portal'}
            </Text>
            <Text style={styles.cardSubtitle}>
              {isUrdu ? 'اپنے اکاؤنٹ میں لاگ ان کریں' : 'Sign in with your institutional credentials'}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Username"
              placeholderTextColor="#64748b"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />

            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#64748b"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <TouchableOpacity
              style={styles.btnPrimary}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.btnPrimaryText}>{isUrdu ? 'لاگ ان کریں' : 'Sign In'}</Text>
              )}
            </TouchableOpacity>

            {/* Quick Demo Pre-fill Accounts */}
            <View style={styles.demoSection}>
              <Text style={styles.demoHeading}>
                {isUrdu ? 'ایک کلک میں منتخب کریں:' : 'One-Click Demo Roles:'}
              </Text>
              <View style={styles.demoRow}>
                <TouchableOpacity
                  onPress={() => { setUsername('teacher_ahmed'); setPassword('JamiaPass2026!'); }}
                  style={styles.demoChip}
                >
                  <Text style={styles.demoChipText}>Teacher</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => { setUsername('parent_tariq'); setPassword('JamiaPass2026!'); }}
                  style={styles.demoChip}
                >
                  <Text style={styles.demoChipText}>Parent</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => { setUsername('student_zaid'); setPassword('JamiaPass2026!'); }}
                  style={styles.demoChip}
                >
                  <Text style={styles.demoChipText}>Student</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => { setUsername('admin'); setPassword('JamiaAdmin2026!'); }}
                  style={styles.demoChip}
                >
                  <Text style={styles.demoChipText}>Admin</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      ) : (
        // =========================================================================
        // AUTHENTICATED ROLE DASHBOARDS
        // =========================================================================
        <View style={{ flex: 1 }}>
          
          {/* User Profile Bar */}
          <View style={styles.userBanner}>
            <View>
              <Text style={styles.userNameText}>
                {user.first_name ? `${user.first_name} ${user.last_name}` : user.username}
              </Text>
              <Text style={styles.userRoleText}>Role: {user.role}</Text>
            </View>
            <TouchableOpacity onPress={handleLogout} style={styles.logoutPill}>
              <Text style={styles.logoutPillText}>{isUrdu ? 'لاگ آؤٹ' : 'Logout'}</Text>
            </TouchableOpacity>
          </View>

          {/* Navigation Tabs */}
          <View style={styles.tabBar}>
            <TouchableOpacity
              onPress={() => setActiveTab('home')}
              style={[styles.tabItem, activeTab === 'home' && styles.tabItemActive]}
            >
              <Text style={[styles.tabText, activeTab === 'home' && styles.tabTextActive]}>
                {isUrdu ? 'مرکزی صفحہ' : 'Dashboard'}
              </Text>
            </TouchableOpacity>

            {(user.role === 'TEACHER' || user.role === 'ADMIN') && (
              <TouchableOpacity
                onPress={() => setActiveTab('attendance')}
                style={[styles.tabItem, activeTab === 'attendance' && styles.tabItemActive]}
              >
                <Text style={[styles.tabText, activeTab === 'attendance' && styles.tabTextActive]}>
                  {isUrdu ? 'حاضری' : 'Attendance'}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={() => setActiveTab('timetable')}
              style={[styles.tabItem, activeTab === 'timetable' && styles.tabItemActive]}
            >
              <Text style={[styles.tabText, activeTab === 'timetable' && styles.tabTextActive]}>
                {isUrdu ? 'اوقات نامہ' : 'Timetable'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTab('homework')}
              style={[styles.tabItem, activeTab === 'homework' && styles.tabItemActive]}
            >
              <Text style={[styles.tabText, activeTab === 'homework' && styles.tabTextActive]}>
                {isUrdu ? 'ہوم ورک' : 'Homework'}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.dashboardContainer}>

            {/* ------------------------------------------------------------- */}
            {/* TAB: DASHBOARD / HOME */}
            {/* ------------------------------------------------------------- */}
            {activeTab === 'home' && (
              <>
                {/* PARENT MULTI-CHILD SWITCHER */}
                {user.role === 'PARENT' && children.length > 0 && (
                  <View style={styles.sectionCard}>
                    <Text style={styles.sectionHeading}>
                      {isUrdu ? 'طالب علم کا انتخاب کریں (بچے)' : 'Select Child / Student'}
                    </Text>
                    <View style={styles.childrenRow}>
                      {children.map((child) => (
                        <TouchableOpacity
                          key={child.id}
                          onPress={() => {
                            setActiveChild(child);
                            loadChildDetails(child.id);
                          }}
                          style={[
                            styles.childChip,
                            activeChild?.id === child.id && styles.childChipActive
                          ]}
                        >
                          <Text style={[
                            styles.childChipText,
                            activeChild?.id === child.id && styles.childChipTextActive
                          ]}>
                            {child.full_name} ({child.admission_number})
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}

                {/* STATS OVERVIEW (STUDENT & PARENT) */}
                {(user.role === 'STUDENT' || user.role === 'PARENT') && childStats && (
                  <View style={styles.statsGrid}>
                    <View style={styles.statBox}>
                      <Text style={styles.statLabel}>{isUrdu ? 'حاضری کی شرح' : 'Attendance Rate'}</Text>
                      <Text style={styles.statValue}>{childStats.attendance_percentage}%</Text>
                    </View>
                    <View style={styles.statBox}>
                      <Text style={styles.statLabel}>{isUrdu ? 'حاضر ایام' : 'Present Days'}</Text>
                      <Text style={styles.statValue}>{childStats.present_days} / {childStats.total_days}</Text>
                    </View>
                  </View>
                )}

                {/* ANNOUNCEMENTS FEED */}
                <View style={styles.sectionCard}>
                  <Text style={styles.sectionHeading}>
                    {isUrdu ? 'سرکاری اعلانات و نوٹس بورڈ' : 'Official Announcements'}
                  </Text>
                  {announcements.length > 0 ? (
                    announcements.slice(0, 3).map((ann) => (
                      <View key={ann.id} style={styles.annItem}>
                        <Text style={styles.annTitle}>{isUrdu ? ann.title_urdu || ann.title : ann.title}</Text>
                        <Text style={styles.annBody} numberOfLines={2}>
                          {isUrdu ? ann.content_urdu || ann.content : ann.content}
                        </Text>
                        <Text style={styles.annMeta}>
                          {new Date(ann.published_at).toLocaleDateString()} • {ann.author_name}
                        </Text>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.emptyText}>{isUrdu ? 'کوئی اعلان نہیں' : 'No announcements available.'}</Text>
                  )}
                </View>
              </>
            )}

            {/* ------------------------------------------------------------- */}
            {/* TAB: TEACHER ATTENDANCE REGISTER */}
            {/* ------------------------------------------------------------- */}
            {activeTab === 'attendance' && (user.role === 'TEACHER' || user.role === 'ADMIN') && (
              <View style={styles.sectionCard}>
                <Text style={styles.sectionHeading}>
                  {isUrdu ? 'حاضری رجسٹر (سیکشن مارکنگ)' : 'Section Attendance Register'}
                </Text>

                {/* Class selector */}
                <View style={styles.selectorRow}>
                  {classes.map((cls) => (
                    <TouchableOpacity
                      key={cls.id}
                      onPress={() => {
                        setSelectedClass(cls.id);
                        if (cls.sections?.length > 0) {
                          setSelectedSection(cls.sections[0].id);
                          fetchStudentsForSection(cls.sections[0].id);
                        }
                      }}
                      style={[styles.classChip, selectedClass === cls.id && styles.classChipActive]}
                    >
                      <Text style={[styles.classChipText, selectedClass === cls.id && styles.classChipTextActive]}>
                        {cls.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Students Attendance List */}
                <View style={{ marginTop: 12 }}>
                  {students.map((st) => {
                    const stStatus = attendanceMap[st.id] || 'PRESENT';
                    return (
                      <View key={st.id} style={styles.studentRow}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.studentName}>{st.full_name}</Text>
                          <Text style={styles.studentRoll}>Adm: {st.admission_number}</Text>
                        </View>

                        <View style={styles.statusGroup}>
                          <TouchableOpacity
                            onPress={() => setAttendanceMap({ ...attendanceMap, [st.id]: 'PRESENT' })}
                            style={[styles.statusBtn, stStatus === 'PRESENT' && styles.statusPresent]}
                          >
                            <Text style={styles.statusBtnText}>P</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            onPress={() => setAttendanceMap({ ...attendanceMap, [st.id]: 'ABSENT' })}
                            style={[styles.statusBtn, stStatus === 'ABSENT' && styles.statusAbsent]}
                          >
                            <Text style={styles.statusBtnText}>A</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            onPress={() => setAttendanceMap({ ...attendanceMap, [st.id]: 'LATE' })}
                            style={[styles.statusBtn, stStatus === 'LATE' && styles.statusLate]}
                          >
                            <Text style={styles.statusBtnText}>L</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  })}
                </View>

                <TouchableOpacity
                  style={styles.btnPrimary}
                  onPress={submitAttendance}
                  disabled={isLoading || students.length === 0}
                >
                  <Text style={styles.btnPrimaryText}>
                    {isUrdu ? 'حاضری محفوظ کریں' : 'Submit Attendance'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* ------------------------------------------------------------- */}
            {/* TAB: TIMETABLE */}
            {/* ------------------------------------------------------------- */}
            {activeTab === 'timetable' && (
              <View style={styles.sectionCard}>
                <Text style={styles.sectionHeading}>
                  {isUrdu ? 'ہفتہ وار تدریسی شیڈول' : 'Weekly Timetable Schedule'}
                </Text>

                {schedule.length > 0 ? (
                  schedule.map((slot) => (
                    <View key={slot.id} style={styles.slotRow}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={styles.slotPeriod}>Period {slot.period_number}</Text>
                        <Text style={styles.slotTime}>{slot.start_time?.slice(0, 5)} - {slot.end_time?.slice(0, 5)}</Text>
                      </View>
                      <Text style={styles.slotSubject}>
                        {isUrdu ? slot.subject_name_urdu || slot.subject_name : slot.subject_name}
                      </Text>
                      <Text style={styles.slotTeacher}>Teacher: {slot.teacher_name}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.emptyText}>{isUrdu ? 'کوئی ٹائم ٹیبل ریکارڈ نہیں ملا' : 'No timetable entries found.'}</Text>
                )}
              </View>
            )}

            {/* ------------------------------------------------------------- */}
            {/* TAB: HOMEWORK */}
            {/* ------------------------------------------------------------- */}
            {activeTab === 'homework' && (
              <View style={styles.sectionCard}>
                <Text style={styles.sectionHeading}>
                  {isUrdu ? 'گھر کا کام و اسائنمنٹس' : 'Assigned Homework'}
                </Text>

                {homeworkList.length > 0 ? (
                  homeworkList.map((hw) => (
                    <View key={hw.id} style={styles.hwCard}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={styles.hwSubject}>{hw.subject_name}</Text>
                        <Text style={styles.hwDue}>Due: {hw.due_date}</Text>
                      </View>
                      <Text style={styles.hwTitle}>{isUrdu ? hw.title_urdu || hw.title : hw.title}</Text>
                      <Text style={styles.hwDesc}>{hw.description}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.emptyText}>{isUrdu ? 'کوئی ہوم ورک نہیں' : 'No homework assignments posted.'}</Text>
                )}
              </View>
            )}

          </ScrollView>
        </View>
      )}

      {/* ========================================================================= */}
      {/* HOST CONFIGURATION / SETTINGS MODAL */}
      {/* ========================================================================= */}
      <Modal visible={showSettings} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Backend API Host Configuration</Text>
            <Text style={styles.modalDesc}>
              For physical Android devices on Wi-Fi, point this to your development PC IP (e.g. http://192.168.1.50:8000/api/v1).
            </Text>

            <TextInput
              style={styles.input}
              value={apiBaseUrl}
              onChangeText={setApiBaseUrl}
              placeholder="http://10.0.2.2:8000/api/v1"
              placeholderTextColor="#64748b"
            />

            <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
              <TouchableOpacity
                style={[styles.btnPrimary, { flex: 1 }]}
                onPress={async () => {
                  await setCustomApiBaseUrl(apiBaseUrl);
                  setShowSettings(false);
                  Alert.alert('Settings Saved', `API Host set to: ${apiBaseUrl}`);
                }}
              >
                <Text style={styles.btnPrimaryText}>Save</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.btnSecondary, { flex: 1 }]}
                onPress={() => setShowSettings(false)}
              >
                <Text style={styles.btnSecondaryText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090d16',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#064e3b',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  headerBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBadge: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#047857',
    borderWidth: 1,
    borderColor: '#f59e0b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: '#f59e0b',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#6ee7b7',
    fontSize: 10,
  },
  langBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  langBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  iconBtn: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  iconBtnText: {
    fontSize: 14,
  },
  networkBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  bannerOnline: {
    backgroundColor: '#065f46',
  },
  bannerOffline: {
    backgroundColor: '#991b1b',
  },
  bannerSyncing: {
    backgroundColor: '#b45309',
  },
  bannerPending: {
    backgroundColor: '#d97706',
  },
  networkBannerText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '600',
  },
  syncBtn: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  syncBtnText: {
    color: '#0b1120',
    fontSize: 10,
    fontWeight: 'bold',
  },
  loginContainer: {
    padding: 20,
    flexGrow: 1,
    justifyContent: 'center',
  },
  loginCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  cardTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  cardSubtitle: {
    color: '#94a3b8',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#090d16',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#ffffff',
    fontSize: 14,
    marginBottom: 12,
  },
  btnPrimary: {
    backgroundColor: '#059669',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 6,
  },
  btnPrimaryText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  btnSecondary: {
    backgroundColor: '#334155',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 6,
  },
  btnSecondaryText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  demoSection: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#334155',
    paddingTop: 14,
  },
  demoHeading: {
    color: '#94a3b8',
    fontSize: 11,
    marginBottom: 8,
    textAlign: 'center',
  },
  demoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  demoChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  demoChipText: {
    color: '#10b981',
    fontSize: 11,
    fontWeight: '600',
  },
  userBanner: {
    backgroundColor: '#064e3b',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userNameText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  userRoleText: {
    color: '#a7f3d0',
    fontSize: 11,
  },
  logoutPill: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  logoutPillText: {
    color: '#f87171',
    fontSize: 11,
    fontWeight: 'bold',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#0f172a',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  tabItem: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  tabItemActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#10b981',
  },
  tabText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#10b981',
  },
  dashboardContainer: {
    padding: 16,
    gap: 14,
  },
  sectionCard: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  sectionHeading: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  childrenRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  childChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#1e293b',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  childChipActive: {
    backgroundColor: '#064e3b',
    borderColor: '#10b981',
  },
  childChipText: {
    color: '#94a3b8',
    fontSize: 12,
  },
  childChipTextActive: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
    alignItems: 'center',
  },
  statLabel: {
    color: '#94a3b8',
    fontSize: 11,
  },
  statValue: {
    color: '#10b981',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 4,
    fontFamily: 'monospace',
  },
  annItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  annTitle: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  annBody: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 2,
  },
  annMeta: {
    color: '#64748b',
    fontSize: 10,
    marginTop: 4,
  },
  selectorRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  classChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#1e293b',
    borderRadius: 6,
  },
  classChipActive: {
    backgroundColor: '#059669',
  },
  classChipText: {
    color: '#94a3b8',
    fontSize: 12,
  },
  classChipTextActive: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  studentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  studentName: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  studentRoll: {
    color: '#94a3b8',
    fontSize: 10,
    fontFamily: 'monospace',
  },
  statusGroup: {
    flexDirection: 'row',
    gap: 4,
  },
  statusBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusPresent: {
    backgroundColor: '#059669',
  },
  statusAbsent: {
    backgroundColor: '#dc2626',
  },
  statusLate: {
    backgroundColor: '#d97706',
  },
  statusBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  slotRow: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  slotPeriod: {
    color: '#10b981',
    fontSize: 11,
    fontWeight: 'bold',
  },
  slotTime: {
    color: '#64748b',
    fontSize: 10,
    fontFamily: 'monospace',
  },
  slotSubject: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  slotTeacher: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 2,
  },
  hwCard: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  hwSubject: {
    color: '#f59e0b',
    fontSize: 11,
    fontWeight: 'bold',
  },
  hwDue: {
    color: '#64748b',
    fontSize: 10,
    fontFamily: 'monospace',
  },
  hwTitle: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
    marginTop: 2,
  },
  hwDesc: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 2,
  },
  emptyText: {
    color: '#64748b',
    fontSize: 12,
    textAlign: 'center',
    paddingVertical: 12,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  modalTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  modalDesc: {
    color: '#94a3b8',
    fontSize: 11,
    marginBottom: 16,
    lineHeight: 16,
  },
});
