import { useLocalSearchParams, useRouter } from "expo-router";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function DetailScreen() {
  const { text, image, completed } = useLocalSearchParams<{ text: string; image: string; completed: string }>();
  const router = useRouter();

  const isCompleted = completed === "true";

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        {/* Gambar */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: image }} style={styles.image} />
          <View style={styles.overlay}>
            <Text style={styles.title}>{text}</Text>
          </View>
        </View>

        {/* Deskripsi */}
        <View style={[styles.detailsBox, { borderColor: isCompleted ? "#333" : "#333" }]}>
          <Text style={[styles.subtitle, { color: isCompleted ? "#00d4ff" : "#00d4ff" }]}>
            {isCompleted ? " Barang Impianmu Terwujud!" : " Deskripsi Barang Impian "}
          </Text>

          <Text style={styles.description}>
            {isCompleted
              ? `Selamat! "${text}" sudah berhasil kamu wujudkan.`
              : `"${text}" adalah barang impianmu. 
Kamu bisa menandainya di halaman utama jika sudah berhasil terwujudkan`}
          </Text>
        </View>

        {/* Tombol Kembali */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>⬅ Kembali</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0d0d0d",
    paddingBottom: 40,
  },
  container: {
    width: "90%",
    alignItems: "center",
  },
  imageContainer: {
    width: "100%",
    height: 320,
    borderRadius: 20,
    overflow: "hidden",
    marginTop: 80,
    marginBottom: 25,
    shadowColor: "#000",
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
    position: "relative",
    borderWidth: 1,
    borderColor: "#222",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  overlay: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  title: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: 1,
  },
  detailsBox: {
    backgroundColor: "#1a1a1a",
    borderRadius: 15,
    padding: 20,
    width: "100%",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 20,
    borderWidth: 1,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
    textAlign: "center",
  },
  description: {
    fontSize: 15,
    color: "#d1d5db",
    textAlign: "center",
    lineHeight: 22,
  },
  backButton: {
    backgroundColor: "#00d4ff",
    paddingVertical: 12,
    paddingHorizontal: 35,
    borderRadius: 12,
    shadowColor: "#00d4ff",
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#0ff",
  },
  backButtonText: {
    color: "#000",
    fontWeight: "700",
    fontSize: 16,
    textTransform: "uppercase",
  },
});
