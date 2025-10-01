import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    Alert,
    FlatList,
    Image,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    useColorScheme,
    View,
} from "react-native";

type Item = {
  id: string;
  text: string;
  image: string;
  completed: boolean;
};

export default function HomeScreen() {
  const [items, setItems] = useState<Item[]>([]);
  const [newItem, setNewItem] = useState("");
  const [newImage, setNewImage] = useState("");
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      const saved = await AsyncStorage.getItem("items");
      if (saved) setItems(JSON.parse(saved));
    };
    loadData();
  }, []);

  const saveData = async (data: Item[]) => {
    setItems(data);
    await AsyncStorage.setItem("items", JSON.stringify(data));
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false, // full gambar
      quality: 1,
    });

    if (!result.canceled) {
      setNewImage(result.assets[0].uri);
    }
  };

  const addItem = () => {
    if (newItem.trim() === "" || newImage.trim() === "") {
      Alert.alert("Error", "Nama barang dan gambar harus diisi!");
      return;
    }
    const newHelp: Item = {
      id: Date.now().toString(),
      text: newItem,
      image: newImage,
      completed: false,
    };
    const updated = [...items, newHelp];
    saveData(updated);
    setNewItem("");
    setNewImage("");
  };

  const toggleCompleted = (id: string) => {
    const updated = items.map((item) =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    saveData(updated);
  };

  // Render item untuk list
  const renderItem = (item: Item, isDeletable: boolean = false) => (
    <View
      style={[
        styles.card,
        { backgroundColor: isDark ? "#1e1e1e" : "#fff" },
      ]}
    >
      <TouchableOpacity
        style={{ flex: 1, flexDirection: "row", alignItems: "center" }}
        onPress={() =>
          router.push({
            pathname: "/detail",
            params: { text: item.text, image: item.image },
          })
        }
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
          >
            {item.text}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Switch untuk centang */}
      <Switch
        value={item.completed}
        onValueChange={() => toggleCompleted(item.id)}
        trackColor={{ false: "#ccc", true: "#4CAF50" }}
        thumbColor="#fff"
      />

      {/* Tombol hapus hanya untuk Belum Terwujud */}
      {isDeletable && (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => {
            Alert.alert(
              "Hapus Barang",
              "Apakah kamu yakin ingin menghapus barang ini?",
              [
                { text: "Batal", style: "cancel" },
                {
                  text: "Hapus",
                  style: "destructive",
                  onPress: () => {
                    const updated = items.filter((i) => i.id !== item.id);
                    saveData(updated);
                  },
                },
              ]
            );
          }}
        >
          <Text style={styles.deleteButtonText}>🗑️</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? "#121212" : "#f4f6f9" },
      ]}
    >
      <Text style={[styles.title, { color: isDark ? "#fff" : "#000" }]}>
        Barang Impian ✨
      </Text>

      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: isDark ? "#333" : "#fff",
            color: isDark ? "#fff" : "#000",
            borderColor: isDark ? "#555" : "#ccc",
          },
        ]}
        placeholder="Nama barang..."
        placeholderTextColor={isDark ? "#aaa" : "#666"}
        value={newItem}
        onChangeText={setNewItem}
      />

      <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
        <Text style={styles.imagePickerText}>📷 Pilih Gambar</Text>
      </TouchableOpacity>

      {newImage ? <Image source={{ uri: newImage }} style={styles.preview} /> : null}

      <TouchableOpacity style={styles.addButton} onPress={addItem}>
        <Text style={styles.addButtonText}>+ Tambah Barang</Text>
      </TouchableOpacity>

      {/* List Belum Terwujud */}
      <Text style={[styles.sectionTitle, { color: isDark ? "#fff" : "#000" }]}>
        Belum Terwujud
      </Text>
      <FlatList
        data={items.filter((item) => !item.completed)}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => renderItem(item, true)} // bisa dihapus
        ListEmptyComponent={<Text style={{ textAlign: "center", marginTop: 10 }}>Belum ada barang</Text>}
      />

      {/* List Terwujud */}
      <Text style={[styles.sectionTitle, { color: isDark ? "#fff" : "#000", marginTop: 20 }]}>
        Terwujud ✅
      </Text>
      <FlatList
        data={items.filter((item) => item.completed)}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => renderItem(item, false)} // tidak bisa dihapus
        ListEmptyComponent={<Text style={{ textAlign: "center", marginTop: 10 }}>Belum ada barang terwujud</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, marginTop: 40 },
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 15 },
  input: {
    borderWidth: 1,
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
    fontSize: 16,
  },
  imagePicker: {
    backgroundColor: "#6C63FF",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  imagePickerText: { color: "#fff", fontWeight: "bold" },
  preview: { width: "100%", height: 180, borderRadius: 10, marginBottom: 10 },
  addButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: "center",
  },
  addButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  sectionTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 8 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  image: { width: 60, height: 60, borderRadius: 10, marginRight: 12 },
  itemText: { fontSize: 18, fontWeight: "500" },
  deleteButton: {
    marginLeft: 8,
    padding: 6,
    borderRadius: 6,
    backgroundColor: "#ff4d4d",
    justifyContent: "center",
    alignItems: "center",
  },
  deleteButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
