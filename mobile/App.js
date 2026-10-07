import React, { useRef, useState } from "react";
import { ActivityIndicator, BackHandler, Linking, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { WebView } from "react-native-webview";

const HOME = "https://tscs-telecom.vercel.app";

export default function App() {
  const webViewRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [canGoBack, setCanGoBack] = useState(false);

  React.useEffect(() => {
    const handler = () => {
      if (webViewRef.current) {
        if (canGoBack) {
          webViewRef.current.goBack();
          return true;
        }
        return false;
      }
      return false;
    };
    const sub = BackHandler.addEventListener("hardwareBackPress", handler);
    return () => sub.remove();
  }, [canGoBack]);

  if (failed) {
    return (
      <SafeAreaView style={styles.errorScreen}>
        <StatusBar style="light" backgroundColor="#05070b" />
        <Text style={styles.logo}>TSCS</Text>
        <Text style={styles.title}>Koneksi belum tersedia</Text>
        <Text style={styles.copy}>Periksa koneksi internet Anda lalu buka aplikasi kembali.</Text>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar style="light" backgroundColor="#05070b" />
      <WebView
        ref={webViewRef}
        source={{ uri: HOME }}
        style={styles.webview}
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState
        allowsBackForwardNavigationGestures
        setSupportMultipleWindows={false}
        onLoadStart={() => { setLoading(true); setFailed(false); }}
        onLoadEnd={() => setLoading(false)}
        onNavigationStateChange={(state) => setCanGoBack(state.canGoBack)}
        onError={() => { setLoading(false); setFailed(true); }}
        onShouldStartLoadWithRequest={(request) => {
          if (request.url.startsWith("tel:") || request.url.startsWith("mailto:") || request.url.startsWith("whatsapp:")) {
            Linking.openURL(request.url).catch(() => {});
            return false;
          }
          return true;
        }}
      />
      {loading && (
        <View pointerEvents="none" style={styles.loader}>
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={styles.loaderText}>TSCS</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#05070b" },
  webview: { flex: 1, backgroundColor: "#05070b" },
  loader: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#05070b"
  },
  loaderText: { marginTop: 14, color: "#fff", fontSize: 18, fontWeight: "700", letterSpacing: 4 },
  errorScreen: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, backgroundColor: "#05070b" },
  logo: { color: "#fff", fontSize: 42, fontWeight: "800", letterSpacing: 8, marginBottom: 30 },
  title: { color: "#fff", fontSize: 24, fontWeight: "700", textAlign: "center" },
  copy: { color: "#aab1bd", fontSize: 15, lineHeight: 24, textAlign: "center", marginTop: 12 }
});
