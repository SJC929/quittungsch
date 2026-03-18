import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { apiRequest } from "../lib/api";
import { useAuthStore } from "../lib/auth-store";

interface RegisterScreenProps {
  onNavigateToLogin: () => void;
}

export function RegisterScreen({ onNavigateToLogin }: RegisterScreenProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();

  async function handleRegister() {
    if (!email || password.length < 8) {
      Alert.alert("Fehler", "Bitte alle Felder ausfüllen. Passwort min. 8 Zeichen.");
      return;
    }

    setLoading(true);
    try {
      await apiRequest("/api/auth/register", {
        method: "POST",
        body: { name, email, password },
      });

      // Auto-login after registration
      await login(email, password);
    } catch (err) {
      Alert.alert(
        "Registrierung fehlgeschlagen",
        err instanceof Error ? err.message : "Bitte versuchen Sie es erneut."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.appName}>QuittungsCH</Text>
          <Text style={styles.tagline}>14 Tage kostenlos testen</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.title}>Konto erstellen</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Name / Firma</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Max Muster"
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>E-Mail *</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="max@muster.ch"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Passwort *</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Min. 8 Zeichen"
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={() => void handleRegister()}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>Kostenlos registrieren</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.disclaimer}>
            Mit der Registrierung stimmen Sie unseren AGB zu. Alle Daten werden in der Schweiz gespeichert (DSG-konform).
          </Text>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={onNavigateToLogin}
          >
            <Text style={styles.linkText}>
              Bereits ein Konto?{" "}
              <Text style={styles.linkBold}>Anmelden</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  content: { paddingHorizontal: 24, paddingVertical: 40, justifyContent: "center", flexGrow: 1 },
  header: { alignItems: "center", marginBottom: 32 },
  appName: { fontSize: 32, fontWeight: "800", color: "#2563EB" },
  tagline: { fontSize: 14, color: "#6B7280", marginTop: 4 },
  form: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  title: { fontSize: 20, fontWeight: "700", color: "#111827", marginBottom: 20 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: "500", color: "#374151", marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: "#111827",
    backgroundColor: "#FAFAFA",
  },
  button: {
    backgroundColor: "#2563EB",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "white", fontSize: 16, fontWeight: "600" },
  disclaimer: { fontSize: 11, color: "#9CA3AF", textAlign: "center", marginTop: 12, lineHeight: 16 },
  linkButton: { marginTop: 16, alignItems: "center" },
  linkText: { color: "#6B7280", fontSize: 14 },
  linkBold: { color: "#2563EB", fontWeight: "600" },
});
