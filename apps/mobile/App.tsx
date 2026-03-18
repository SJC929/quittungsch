import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import { View, ActivityIndicator } from "react-native";

import { LoginScreen } from "./src/screens/LoginScreen";
import { RegisterScreen } from "./src/screens/RegisterScreen";
import { CameraScreen } from "./src/screens/CameraScreen";
import { OcrConfirmScreen } from "./src/screens/OcrConfirmScreen";
import { ExpensesListScreen } from "./src/screens/ExpensesListScreen";
import { useAuthStore } from "./src/lib/auth-store";
import type { ExtractedExpense } from "@quittungsch/types";

const Stack = createNativeStackNavigator();

// Screen for OCR confirmation – needs captured data passed as route params
type OcrScreenParams = {
  extracted: ExtractedExpense;
  receiptPath: string;
  imageUri: string;
};

export default function App() {
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore();
  const [authScreen, setAuthScreen] = useState<"login" | "register">("login");
  const [ocrData, setOcrData] = useState<OcrScreenParams | null>(null);
  const [currentScreen, setCurrentScreen] = useState<"expenses" | "camera" | "ocr">("expenses");

  useEffect(() => {
    void checkAuth();
  }, [checkAuth]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <StatusBar style="dark" />
        {authScreen === "login" ? (
          <LoginScreen
            onNavigateToRegister={() => setAuthScreen("register")}
          />
        ) : (
          <RegisterScreen
            onNavigateToLogin={() => setAuthScreen("login")}
          />
        )}
      </>
    );
  }

  // OCR Confirmation screen
  if (currentScreen === "ocr" && ocrData) {
    return (
      <>
        <StatusBar style="dark" />
        <OcrConfirmScreen
          extracted={ocrData.extracted}
          receiptPath={ocrData.receiptPath}
          imageUri={ocrData.imageUri}
          onSaved={() => {
            setOcrData(null);
            setCurrentScreen("expenses");
          }}
          onCancel={() => {
            setOcrData(null);
            setCurrentScreen("expenses");
          }}
        />
      </>
    );
  }

  // Camera screen
  if (currentScreen === "camera") {
    return (
      <>
        <StatusBar style="light" />
        <CameraScreen
          onReceiptCaptured={(extracted, receiptPath, imageUri) => {
            setOcrData({ extracted, receiptPath, imageUri });
            setCurrentScreen("ocr");
          }}
        />
      </>
    );
  }

  // Main: Expenses list
  return (
    <>
      <StatusBar style="dark" />
      <ExpensesListScreen
        onAddExpense={() => setCurrentScreen("camera")}
      />
    </>
  );
}
