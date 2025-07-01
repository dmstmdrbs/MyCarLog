import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
  Alert,
  SafeAreaView,
} from 'react-native';
import { database } from '@/database';
import MaintenanceItem from '@shared/models/MaintenanceItem';

export function SettingsMaintenanceItemPage() {
  const [items, setItems] = useState<MaintenanceItem[]>([]);
  const [name, setName] = useState('');
  const [maintenanceKm, setMaintenanceKm] = useState('');
  const [maintenanceMonth, setMaintenanceMonth] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchItems = async () => {
    const collection = database.get<MaintenanceItem>('maintenance_items');
    const all = await collection.query().fetch();
    setItems(all);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleSave = async () => {
    if (!name) return Alert.alert('정비 항목명을 입력하세요');
    if (editingId) {
      const collection = database.get<MaintenanceItem>('maintenance_items');
      const item = await collection.find(editingId);
      await database.write(async () => {
        await item.update((i) => {
          i.name = name;
          i.maintenanceKm = maintenanceKm ? Number(maintenanceKm) : undefined;
          i.maintenanceMonth = maintenanceMonth
            ? Number(maintenanceMonth)
            : undefined;
        });
      });
      setEditingId(null);
    } else {
      await database.write(async () => {
        await database.get<MaintenanceItem>('maintenance_items').create((i) => {
          i.name = name;
          if (maintenanceKm) i.maintenanceKm = Number(maintenanceKm);
          if (maintenanceMonth) i.maintenanceMonth = Number(maintenanceMonth);
          i.createdAt = Date.now();
        });
      });
    }
    setName('');
    setMaintenanceKm('');
    setMaintenanceMonth('');
    fetchItems();
  };

  const handleDelete = async (id: string) => {
    const collection = database.get<MaintenanceItem>('maintenance_items');
    const item = await collection.find(id);
    await database.write(async () => {
      await item.markAsDeleted();
      await item.destroyPermanently();
    });
    fetchItems();
  };

  const handleEdit = (item: MaintenanceItem) => {
    setEditingId(item.id);
    setName(item.name);
    setMaintenanceKm(item.maintenanceKm ? String(item.maintenanceKm) : '');
    setMaintenanceMonth(
      item.maintenanceMonth ? String(item.maintenanceMonth) : '',
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>정비 항목 CRUD 테스트</Text>
        <TextInput
          style={styles.input}
          placeholder="정비 항목명"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="정비 주기(km)"
          value={maintenanceKm}
          onChangeText={setMaintenanceKm}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          placeholder="정비 주기(개월)"
          value={maintenanceMonth}
          onChangeText={setMaintenanceMonth}
          keyboardType="numeric"
        />
        <Button title={editingId ? '수정' : '추가'} onPress={handleSave} />
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <Text>
                {item.name}{' '}
                {item.maintenanceKm ? `(${item.maintenanceKm}km)` : ''}{' '}
                {item.maintenanceMonth ? `/${item.maintenanceMonth}개월` : ''}
              </Text>
              <View style={styles.row}>
                <Button title="수정" onPress={() => handleEdit(item)} />
                <Button
                  title="삭제"
                  color="red"
                  onPress={() => handleDelete(item.id)}
                />
              </View>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 8,
    marginBottom: 8,
  },
  row: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  item: {
    padding: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
    marginBottom: 8,
  },
});
