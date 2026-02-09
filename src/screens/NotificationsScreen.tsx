/**
 * Notifications UI. Backend: GET /api/notifications/new-lectures, /api/notifications/new-assignments.
 * UI-ready; backend-triggered push can be added later.
 */
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import api from '../services/api';

type Notif = { id?: string; title?: string; message?: string; type?: string; [key: string]: unknown };

export default function NotificationsScreen() {
  const [items, setItems] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [lecturesRes, assignmentsRes] = await Promise.all([
          api.get('/notifications/new-lectures').catch(() => ({ data: [] })),
          api.get('/notifications/new-assignments').catch(() => ({ data: [] })),
        ]);
        const lectureList = Array.isArray(lecturesRes.data) ? lecturesRes.data : [];
        const assignList = Array.isArray(assignmentsRes.data) ? assignmentsRes.data : [];
        const combined = [
          ...lectureList.map((x: Notif, i: number) => ({ ...x, id: x.id ?? `l-${i}`, type: 'lecture' })),
          ...assignList.map((x: Notif, i: number) => ({ ...x, id: x.id ?? `a-${i}`, type: 'assignment' })),
        ];
        if (!cancelled) setItems(combined);
      } catch {
        if (!cancelled) setError('Failed to load notifications.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const renderItem = ({ item }: { item: Notif }) => (
    <View style={styles.item}>
      <Text style={styles.itemTitle}>{item.title ?? item.message ?? 'Notification'}</Text>
      {item.type ? <Text style={styles.badge}>{item.type}</Text> : null}
    </View>
  );

  if (loading) return <ActivityIndicator style={styles.centered} size="large" />;
  if (error) return <Text style={styles.error}>{error}</Text>;

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id ?? Math.random())}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.empty}>No new notifications</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  centered: { flex: 1, justifyContent: 'center' },
  error: { padding: 20, color: '#c62828' },
  empty: { padding: 20, color: '#666', textAlign: 'center' },
  item: { backgroundColor: '#fff', padding: 16, marginHorizontal: 16, marginBottom: 8, borderRadius: 8 },
  itemTitle: { fontSize: 16, fontWeight: '500' },
  badge: { fontSize: 12, color: '#1a73e8', marginTop: 4 },
});
