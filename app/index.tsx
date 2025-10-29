// app/(tabs)/index.tsx
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  Platform,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import Animated, { FadeIn, FadeOut, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

type Item = {
  id: string;
  text: string;
  image: string;
  completed: boolean;
  favorite: boolean;
};

const ItemCard = React.memo(function ItemCard({
  item,
  onPress,
  onToggle,
  onDelete,
  onFavorite,
  deletable,
  isDark,
}: {
  item: Item;
  onPress: (i: Item) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onFavorite: (id: string) => void;
  deletable?: boolean;
  isDark: boolean;
}) {
  const scale = useSharedValue(1);
  const rStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withTiming(scale.value, { duration: 120 }) }],
  }));

  return (
    <Animated.View entering={FadeIn} exiting={FadeOut} style={[styles.card, { backgroundColor: isDark ? "#1e1e1e" : "#fff" }, rStyle]}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => onPress(item)}
        onPressIn={() => (scale.value = 0.97)}
        onPressOut={() => (scale.value = 1)}
        style={{ flex: 1, flexDirection: "row", alignItems: "center" }}
      >
        <Image source={{ uri: item.image }} style={styles.image} />
        <View style={{ flex: 1 }}>
          <Text
            style={[
              styles.itemText,
              {
                color: isDark ? "#fff" : "#000",
                textDecorationLine: item.completed ? "line-through" : "none",
                opacity: item.completed ? 0.6 : 1,
              },
            ]}
            numberOfLines={2}
          >
            {item.text}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Favorite button */}
      <TouchableOpacity onPress={() => onFavorite(item.id)} style={{ marginHorizontal: 8 }}>
        <Ionicons name={item.favorite ? "heart" : "heart-outline"} size={22} color={item.favorite ? "#ff4d6d" : isDark ? "#aaa" : "#444"} />
      </TouchableOpacity>

      <Switch
        value={item.completed}
        onValueChange={() => onToggle(item.id)}
        trackColor={{ false: "#ccc", true: "#4CAF50" }}
        thumbColor={Platform.OS === "android" ? "#fff" : undefined}
      />

      {deletable && (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() =>
            Alert.alert("Hapus Barang", "Apakah kamu yakin ingin menghapus barang ini?", [
              { text: "Batal", style: "cancel" },
              { text: "Hapus", style: "destructive", onPress: () => onDelete(item.id) },
            ])
          }
        >
          <Text style={styles.deleteButtonText}>🗑️</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
});

export default function HomeScreen() {
  const [items, setItems] = useState<Item[] | null>(null);
  const [newItem, setNewItem] = useState("");
  const [newImage, setNewImage] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      try {
        const saved = await AsyncStorage.getItem("items");
        setItems(saved ? JSON.parse(saved) : []);
      } catch (e) {
        console.error("load error", e);
        setItems([]);
      }
    };
    loadData();
  }, []);

  const saveData = useCallback(async (data: Item[]) => {
    setItems(data);
    try {
      await AsyncStorage.setItem("items", JSON.stringify(data));
    } catch (e) {
      console.error("save error", e);
    }
  }, []);

  const pickImage = useCallback(async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.9,
      });
      if (!result.canceled) setNewImage(result.assets[0].uri);
    } catch (e) {
      console.error("ImagePicker error:", e);
    }
  }, []);

  const addItem = useCallback(() => {
    if (newItem.trim() === "" || newImage.trim() === "") {
      Alert.alert("Isi nama dan gambar terlebih dahulu");
      return;
    }
    const newHelp: Item = { id: Date.now().toString(), text: newItem.trim(), image: newImage, completed: false, favorite: false };
    saveData([...(items ?? []), newHelp]);
    setNewItem("");
    setNewImage("");
    setModalVisible(false);
  }, [newItem, newImage, items, saveData]);

  const toggleFavorite = useCallback(
    (id: string) => {
      const updated = (items ?? []).map((i) => (i.id === id ? { ...i, favorite: !i.favorite } : i));
      saveData(updated);
    },
    [items, saveData]
  );

  const toggleCompleted = useCallback(
    (id: string) => {
      const updated = (items ?? []).map((i) => (i.id === id ? { ...i, completed: !i.completed } : i));
      saveData(updated);
    },
    [items, saveData]
  );

  const deleteItem = useCallback((id: string) => {
    const updated = (items ?? []).filter((i) => i.id !== id);
    saveData(updated);
  }, [items, saveData]);

  const openDetail = useCallback((item: Item) => {
  router.push({
    pathname: "/detail",
    params: {
      text: item.text,
      image: item.image,
      completed: String(item.completed),
    },
  });
}, [router]);


  const favorites = useMemo(() => (items ?? []).filter((i) => i.favorite), [items]);
  const notCompleted = useMemo(() => (items ?? []).filter((i) => !i.completed), [items]);
  const completed = useMemo(() => (items ?? []).filter((i) => i.completed), [items]);

  if (items === null)
    return (
      <View style={[styles.loadingContainer, { backgroundColor: isDark ? "#121212" : "#f4f6f9" }]}>
        <ActivityIndicator size="large" color={isDark ? "#fff" : "#333"} />
        <Text style={{ marginTop: 10, color: isDark ? "#fff" : "#333" }}>Loading...</Text>
      </View>
    );

  return (
    <View style={[styles.container, { backgroundColor: isDark ? "#121212" : "#f4f6f9" }]}>
      <Text style={[styles.title, { color: isDark ? "#fff" : "#000" }]}>Barang Impian ✨</Text>

      {/* Favorites horizontal */}
      {favorites.length > 0 && (
        <>
          <Text style={[styles.sectionTitle, { color: isDark ? "#fff" : "#000" }]}>Barang Favorit ❤️</Text>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={favorites}
            keyExtractor={(i) => i.id}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => openDetail(item)} style={styles.favoriteItem}>
                <Image source={{ uri: item.image }} style={styles.favoriteImage} />
                <Text numberOfLines={1} style={[styles.favoriteText, { color: isDark ? "#fff" : "#000" }]}>
                  {item.text}
                </Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={{ paddingBottom: 12 }}
          />
        </>
      )}

      <Text style={[styles.sectionTitle, { color: isDark ? "#fff" : "#000" }]}>Belum Terwujud</Text>
      <FlatList
        data={notCompleted}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <ItemCard item={item} onPress={openDetail} onToggle={toggleCompleted} onDelete={deleteItem} onFavorite={toggleFavorite} deletable isDark={isDark} />
        )}
        contentContainerStyle={{ paddingBottom: 12 }}
        ListEmptyComponent={<Text style={{ textAlign: "center", marginTop: 10, color: isDark ? "#ddd" : "#666" }}>Belum ada barang</Text>}
      />

      <Text style={[styles.sectionTitle, { color: isDark ? "#fff" : "#000", marginTop: 16 }]}>Terwujud ✅</Text>
      <FlatList
        data={completed}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <ItemCard item={item} onPress={openDetail} onToggle={toggleCompleted} onDelete={deleteItem} onFavorite={toggleFavorite} isDark={isDark} />
        )}
        contentContainerStyle={{ paddingBottom: 120 }}
        ListEmptyComponent={<Text style={{ textAlign: "center", marginTop: 10, color: isDark ? "#ddd" : "#666" }}>Belum ada barang terwujud</Text>}
      />

      {/* FAB */}
      <TouchableOpacity style={styles.fab} activeOpacity={0.85} onPress={() => setModalVisible(true)}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Modal Form */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDark ? "#1e1e1e" : "#fff" }]}>
            <Text style={[styles.modalTitle, { color: isDark ? "#fff" : "#000" }]}>Tambah Barang Impian</Text>

            <TextInput
              style={[styles.input, { backgroundColor: isDark ? "#333" : "#f2f2f2", color: isDark ? "#fff" : "#000" }]}
              placeholder="Nama barang..."
              placeholderTextColor={isDark ? "#aaa" : "#666"}
              value={newItem}
              onChangeText={setNewItem}
            />

            <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
              <Text style={styles.imagePickerText}>📷 Pilih Gambar</Text>
            </TouchableOpacity>

            {newImage ? <Image source={{ uri: newImage }} style={styles.preview} /> : null}

            <TouchableOpacity style={styles.modalSaveButton} onPress={addItem}>
              <Text style={styles.modalSaveButtonText}>Simpan</Text>
            </TouchableOpacity>

            <TouchableOpacity style={{ marginTop: 10 }} onPress={() => setModalVisible(false)}>
              <Text style={{ color: "#ff5555", textAlign: "center" }}>Batal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, marginTop: 40 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 12, textAlign: "center" },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 8 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  image: { width: 64, height: 64, borderRadius: 10, marginRight: 12, resizeMode: "cover" },
  itemText: { fontSize: 16, fontWeight: "600" },
  deleteButton: { marginLeft: 8, padding: 6, borderRadius: 6, backgroundColor: "#ff4d4d" },
  deleteButtonText: { color: "#fff", fontWeight: "bold" },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 30,
    backgroundColor: "#6C63FF",
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  modalOverlay: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.45)" },
  modalContent: { width: "88%", borderRadius: 14, padding: 18 },
  modalTitle: { fontSize: 20, fontWeight: "700", marginBottom: 12, textAlign: "center" },
  input: { borderRadius: 10, padding: 10, marginBottom: 10 },
  imagePicker: { backgroundColor: "#6C63FF", padding: 12, borderRadius: 8, alignItems: "center", marginBottom: 10 },
  imagePickerText: { color: "#fff", fontWeight: "700" },
  preview: { width: "100%", height: 180, borderRadius: 10, marginBottom: 10, resizeMode: "cover" },
  modalSaveButton: { backgroundColor: "#4CAF50", paddingVertical: 12, borderRadius: 8, alignItems: "center" },
  modalSaveButtonText: { color: "#fff", fontWeight: "700" },
  favoriteItem: { marginRight: 12, alignItems: "center", width: 88 },
  favoriteImage: { width: 76, height: 76, borderRadius: 10 },
  favoriteText: { fontSize: 12, marginTop: 6, textAlign: "center" },
});
