import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { preprocessReceiptImage } from "../lib/image-preprocessing";
import { uploadReceipt } from "../lib/api";
import type { ExtractedExpense } from "@spezo/types";

interface CameraScreenProps {
  onReceiptCaptured: (extracted: ExtractedExpense, receiptPath: string, imageUri: string) => void;
}

export function CameraScreen({ onReceiptCaptured }: CameraScreenProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [processing, setProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState("");
  const [flashEnabled, setFlashEnabled] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  async function capturePhoto() {
    if (!cameraRef.current) return;

    setProcessing(true);
    setProcessingStep("Foto wird aufgenommen...");

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.9,
        skipProcessing: false,
      });

      if (!photo) throw new Error("Kein Foto aufgenommen");

      await processImage(photo.uri);
    } catch (err) {
      Alert.alert("Fehler", err instanceof Error ? err.message : "Foto fehlgeschlagen");
      setProcessing(false);
    }
  }

  async function pickFromGallery() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
    });

    if (!result.canceled && result.assets[0]) {
      setProcessing(true);
      await processImage(result.assets[0].uri);
    }
  }

  async function processImage(uri: string) {
    try {
      setProcessingStep("Bild wird optimiert...");
      const processedUri = await preprocessReceiptImage(uri, {
        receiptMode: true,
        maxSize: 2000,
        quality: 0.85,
      });

      setProcessingStep("Texterkennung (OCR)...");
      const { extracted, receiptPath } = await uploadReceipt(processedUri);

      setProcessingStep("KI-Analyse...");

      onReceiptCaptured(extracted as ExtractedExpense, receiptPath, processedUri);
    } catch (err) {
      Alert.alert(
        "OCR fehlgeschlagen",
        err instanceof Error ? err.message : "Bitte Daten manuell eingeben."
      );
    } finally {
      setProcessing(false);
    }
  }

  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.permissionText}>
          Spezo benötigt Kamerazugriff, um Belege zu fotografieren.
        </Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Kamerazugriff erlauben</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (processing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.processingText}>{processingStep}</Text>
        <Text style={styles.processingSubText}>Beleg wird analysiert...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="back"
        flash={flashEnabled ? "on" : "off"}
      >
        {/* Receipt frame guide */}
        <View style={styles.frameGuide}>
          <View style={styles.frameCornerTL} />
          <View style={styles.frameCornerTR} />
          <View style={styles.frameCornerBL} />
          <View style={styles.frameCornerBR} />
        </View>

        <Text style={styles.guideText}>Beleg im Rahmen positionieren</Text>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.galleryButton}
            onPress={() => void pickFromGallery()}
          >
            <Text style={styles.galleryIcon}>🖼️</Text>
            <Text style={styles.galleryText}>Galerie</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.captureButton}
            onPress={() => void capturePhoto()}
          >
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.flashButton}
            onPress={() => setFlashEnabled((f) => !f)}
          >
            <Text style={styles.flashIcon}>{flashEnabled ? "⚡" : "🔦"}</Text>
            <Text style={styles.flashText}>Blitz</Text>
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
}

const CORNER_SIZE = 24;
const CORNER_WIDTH = 3;
const CORNER_COLOR = "white";

const styles = StyleSheet.create({
  container: { flex: 1 },
  camera: { flex: 1 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    backgroundColor: "#F9FAFB",
  },
  permissionText: {
    fontSize: 16,
    textAlign: "center",
    color: "#374151",
    marginBottom: 24,
  },
  button: {
    backgroundColor: "#2563EB",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  buttonText: { color: "white", fontSize: 15, fontWeight: "600" },
  frameGuide: {
    position: "absolute",
    top: "15%",
    left: "10%",
    right: "10%",
    height: "55%",
  },
  frameCornerTL: {
    position: "absolute",
    top: 0,
    left: 0,
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderTopWidth: CORNER_WIDTH,
    borderLeftWidth: CORNER_WIDTH,
    borderColor: CORNER_COLOR,
    borderTopLeftRadius: 4,
  },
  frameCornerTR: {
    position: "absolute",
    top: 0,
    right: 0,
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderTopWidth: CORNER_WIDTH,
    borderRightWidth: CORNER_WIDTH,
    borderColor: CORNER_COLOR,
    borderTopRightRadius: 4,
  },
  frameCornerBL: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderBottomWidth: CORNER_WIDTH,
    borderLeftWidth: CORNER_WIDTH,
    borderColor: CORNER_COLOR,
    borderBottomLeftRadius: 4,
  },
  frameCornerBR: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderBottomWidth: CORNER_WIDTH,
    borderRightWidth: CORNER_WIDTH,
    borderColor: CORNER_COLOR,
    borderBottomRightRadius: 4,
  },
  guideText: {
    position: "absolute",
    bottom: "38%",
    left: 0,
    right: 0,
    textAlign: "center",
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
  },
  controls: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 32,
  },
  captureButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(255,255,255,0.3)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "white",
  },
  captureButtonInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "white",
  },
  galleryButton: { alignItems: "center" },
  galleryIcon: { fontSize: 28 },
  galleryText: { color: "white", fontSize: 12, marginTop: 4 },
  flashButton: { alignItems: "center" },
  flashIcon: { fontSize: 28 },
  flashText: { color: "white", fontSize: 12, marginTop: 4 },
  processingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: "600",
    color: "#1E3A8A",
  },
  processingSubText: {
    marginTop: 4,
    fontSize: 13,
    color: "#6B7280",
  },
});
