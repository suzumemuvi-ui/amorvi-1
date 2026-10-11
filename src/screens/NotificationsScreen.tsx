import React, { useMemo, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

type NotificationFilter = 'all' | 'likes' | 'matches' | 'messages' | 'radar';

type AmorviNotification = {
  id: string;
  type: Exclude<NotificationFilter, 'all'>;
  title: string;
  body: string;
  time: string;
  action: string;
  locked?: boolean;
  section: 'Today' | 'Earlier';
};

const filters: Array<{
  id: NotificationFilter;
  label: string;
  icon: string;
}> = [
  { id: 'all', label: 'All', icon: 'notifications-outline' },
  { id: 'likes', label: 'Likes', icon: 'heart-outline' },
  { id: 'matches', label: 'Matches', icon: 'heart-circle-outline' },
  { id: 'messages', label: 'Messages', icon: 'chatbubble-outline' },
  { id: 'radar', label: 'Radar', icon: 'radio-outline' },
];

const notifications: AmorviNotification[] = [
  {
    id: 'like-1',
    type: 'likes',
    title: 'Someone liked you',
    body: 'Someone nearby felt a spark with you.',
    time: '2m ago',
    action: 'See who',
    locked: true,
    section: 'Today',
  },
  {
    id: 'match-1',
    type: 'matches',
    title: "It's a Match!",
    body: 'You and Sara liked each other.',
    time: '10m ago',
    action: 'Say Hi',
    section: 'Today',
  },
  {
    id: 'message-1',
    type: 'messages',
    title: 'New message',
    body: 'from Marko',
    time: '25m ago',
    action: 'Reply',
    section: 'Today',
  },
  {
    id: 'like-2',
    type: 'likes',
    title: 'Someone sent you a Super Like',
    body: 'Open Amorvi to see your match.',
    time: '1h ago',
    action: 'See who',
    locked: true,
    section: 'Today',
  },
  {
    id: 'radar-1',
    type: 'radar',
    title: 'Radar is active',
    body: '18 people matching your preferences are nearby.',
    time: '2h ago',
    action: 'Open Radar',
    section: 'Earlier',
  },
  {
    id: 'radar-2',
    type: 'radar',
    title: 'Love Zone is active',
    body: 'More people are connecting in your Love Zone.',
    time: '4h ago',
    action: 'Go to Love',
    section: 'Earlier',
  },
  {
    id: 'message-2',
    type: 'messages',
    title: 'New message',
    body: 'from Derya',
    time: 'Yesterday, 18:10',
    action: 'Reply',
    section: 'Earlier',
  },
  {
    id: 'match-2',
    type: 'matches',
    title: "It's a Match!",
    body: 'You and Alex liked each other.',
    time: 'Yesterday, 19:30',
    action: 'Say Hi',
    section: 'Earlier',
  },
];

const iconByType: Record<AmorviNotification['type'], string> = {
  likes: 'heart',
  matches: 'heart-circle',
  messages: 'chatbubble',
  radar: 'radio',
};

const colorByType: Record<AmorviNotification['type'], string> = {
  likes: '#FF2F7D',
  matches: '#FF2F7D',
  messages: '#8B5CF6',
  radar: '#FF2F7D',
};

const NotificationsScreen = ({ navigation }: { navigation?: any }) => {
  const [activeFilter, setActiveFilter] = useState<NotificationFilter>('all');

  const visibleNotifications = useMemo(
    () =>
      activeFilter === 'all'
        ? notifications
        : notifications.filter(item => item.type === activeFilter),
    [activeFilter],
  );

  const sections = ['Today', 'Earlier'] as const;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#05080A" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => navigation?.goBack()}>
          <Icon name="chevron-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity style={styles.iconButton}>
          <Icon name="settings-outline" size={22} color="#FFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.filterRow}>
        {filters.map(filter => {
          const active = activeFilter === filter.id;

          return (
            <TouchableOpacity
              key={filter.id}
              style={[styles.filterChip, active && styles.filterChipActive]}
              onPress={() => setActiveFilter(filter.id)}
              activeOpacity={0.85}
            >
              <Icon
                name={filter.icon}
                size={15}
                color={active ? '#FFF' : '#DADDE3'}
              />
              <Text style={[styles.filterText, active && styles.filterTextActive]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {(activeFilter === 'all' || activeFilter === 'likes') && (
          <View style={styles.upgradeCard}>
            <View style={styles.upgradeIcon}>
              <Icon name="heart" size={34} color="#FF4D8D" />
            </View>
            <View style={styles.upgradeCopy}>
              <Text style={styles.upgradeTitle}>12 people liked you</Text>
              <Text style={styles.upgradeText}>
                Upgrade to see who likes you and start connecting today.
              </Text>
              <TouchableOpacity style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>See who likes you</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.goldBadge}>
              <Icon name="star" size={13} color="#FDBA2D" />
              <Text style={styles.goldText}>Gold</Text>
            </View>
          </View>
        )}

        {sections.map(section => {
          const sectionItems = visibleNotifications.filter(
            item => item.section === section,
          );

          if (sectionItems.length === 0) return null;

          return (
            <View key={section} style={styles.section}>
              <Text style={styles.sectionTitle}>{section}</Text>
              {sectionItems.map(item => (
                <View key={item.id} style={styles.notificationRow}>
                  <View
                    style={[
                      styles.notificationIcon,
                      { backgroundColor: `${colorByType[item.type]}24` },
                    ]}
                  >
                    <Icon
                      name={iconByType[item.type]}
                      size={22}
                      color={colorByType[item.type]}
                    />
                  </View>

                  <View style={styles.notificationBody}>
                    <Text style={styles.notificationTitle}>{item.title}</Text>
                    <Text style={styles.notificationText}>{item.body}</Text>
                    <Text style={styles.notificationTime}>{item.time}</Text>
                  </View>

                  <TouchableOpacity style={styles.outlineButton}>
                    <Icon
                      name={item.locked ? 'lock-closed' : 'chatbubble-outline'}
                      size={13}
                      color="#FF2F7D"
                    />
                    <Text style={styles.outlineButtonText}>{item.action}</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#05080A',
  },
  header: {
    height: 54,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  filterChip: {
    flex: 1,
    minHeight: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  filterChipActive: {
    backgroundColor: '#FF2F7D',
    borderColor: '#FF2F7D',
  },
  filterText: {
    color: '#DADDE3',
    fontSize: 11,
    fontWeight: '800',
  },
  filterTextActive: {
    color: '#FFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 14,
    paddingBottom: 88,
  },
  upgradeCard: {
    minHeight: 116,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: '#101519',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    marginBottom: 14,
  },
  upgradeIcon: {
    width: 58,
    height: 58,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  upgradeCopy: {
    flex: 1,
  },
  upgradeTitle: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 4,
  },
  upgradeText: {
    color: '#DADDE3',
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 10,
  },
  primaryButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#FF2F7D',
    borderRadius: 18,
    paddingHorizontal: 22,
    paddingVertical: 10,
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '900',
  },
  goldBadge: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(253,186,45,0.5)',
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  goldText: {
    color: '#FDBA2D',
    fontSize: 11,
    fontWeight: '900',
  },
  section: {
    marginTop: 4,
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '900',
    marginVertical: 10,
  },
  notificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  notificationIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  notificationBody: {
    flex: 1,
    paddingRight: 10,
  },
  notificationTitle: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '900',
    marginBottom: 3,
  },
  notificationText: {
    color: '#D7DAE0',
    fontSize: 12,
    lineHeight: 16,
  },
  notificationTime: {
    color: '#858B94',
    fontSize: 11,
    marginTop: 3,
  },
  outlineButton: {
    minWidth: 84,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#FF2F7D',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingHorizontal: 10,
  },
  outlineButtonText: {
    color: '#FF2F7D',
    fontSize: 11,
    fontWeight: '900',
  },
});

export default NotificationsScreen;
