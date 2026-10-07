import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Linking, Pressable, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";

const WEB = "https://tscs-telecom.vercel.app";
const services = [
  ["Fiber Internet", "Koneksi fiber cepat dan stabil untuk operasional bisnis.", "/layanan/fiber-internet"],
  ["Business Connectivity", "Konektivitas profesional untuk kantor dan enterprise.", "/layanan/business-connectivity"],
  ["Fiber Infrastructure", "Infrastruktur fiber optic yang terukur dan siap berkembang.", "/layanan/fiber-infrastructure"],
  ["Network Solution", "Solusi jaringan sesuai kebutuhan infrastruktur bisnis.", "/layanan/network-solution"]
];

function Card({ title, text, onPress }) {
  return <Pressable onPress={onPress} style={({pressed}) => [styles.card, pressed && styles.pressed]}>
    <View style={styles.cardLine}/><Text style={styles.cardTitle}>{title}</Text><Text style={styles.cardText}>{text}</Text><Text style={styles.explore}>EXPLORE  →</Text>
  </Pressable>;
}

export default function App() {
  const [screen, setScreen] = useState("home");
  const [loading, setLoading] = useState(false);

  const openWeb = async (path="") => {
    setLoading(true);
    try { await Linking.openURL(WEB + path); } finally { setLoading(false); }
  };

  const tabs = useMemo(() => [
    ["home", "Beranda"], ["services", "Layanan"], ["network", "Jaringan"], ["contact", "Kontak"]
  ], []);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#05070b"/>
      <View style={styles.root}>
        <View style={styles.header}>
          <Pressable onPress={() => setScreen("home")}><Text style={styles.logo}>TSCS</Text><Text style={styles.company}>PT. TIGA SERANGKAI CAHAYA SELATAN</Text></Pressable>
          <Pressable style={styles.headerButton} onPress={() => openWeb("/kontak")}><Text style={styles.headerButtonText}>KONSULTASI</Text></Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {screen === "home" && <>
            <Text style={styles.eyebrow}>TELECOMMUNICATION • FIBER OPTIC</Text>
            <Text style={styles.hero}>Koneksi yang <Text style={styles.italic}>Menggerakkan.</Text></Text>
            <Text style={styles.hero}>Infrastruktur yang <Text style={styles.italic}>Menguatkan.</Text></Text>
            <Text style={styles.lead}>Konektivitas fiber optic dan solusi jaringan modern untuk membangun infrastruktur digital yang cepat, stabil, dan siap berkembang.</Text>
            <Pressable style={styles.primary} onPress={() => setScreen("contact")}><Text style={styles.primaryText}>MULAI KONSULTASI  →</Text></Pressable>
            <View style={styles.networkVisual}><View style={styles.core}><Text style={styles.coreText}>TSCS</Text></View>{[0,1,2,3,4].map(i=><View key={i} style={[styles.node,{top:30+i*48,left:i%2?190:55}]}/>)}</View>
            <Text style={styles.sectionEyebrow}>OUR SERVICES</Text><Text style={styles.sectionTitle}>Layanan yang Menghubungkan Bisnis Anda.</Text>
            {services.slice(0,3).map(([t,d,p])=><Card key={t} title={t} text={d} onPress={() => openWeb(p)}/>)}
          </>}

          {screen === "services" && <>
            <Text style={styles.eyebrow}>OUR SERVICES</Text><Text style={styles.sectionTitle}>Solusi konektivitas TSCS.</Text>
            {services.map(([t,d,p])=><Card key={t} title={t} text={d} onPress={() => openWeb(p)}/>)}
            <Pressable style={styles.secondary} onPress={() => openWeb("/layanan")}><Text style={styles.secondaryText}>LIHAT SEMUA LAYANAN</Text></Pressable>
          </>}

          {screen === "network" && <>
            <Text style={styles.eyebrow}>NETWORK / COVERAGE</Text><Text style={styles.sectionTitle}>Jaringan yang Menjangkau Lebih Jauh.</Text>
            <View style={styles.networkPanel}><Text style={styles.panelTitle}>NETWORK</Text><Text style={styles.panelText}>Cek ketersediaan jaringan dan infrastruktur TSCS melalui halaman coverage kami.</Text></View>
            <Pressable style={styles.primary} onPress={() => openWeb("/jaringan")}><Text style={styles.primaryText}>CEK KETERSEDIAAN  →</Text></Pressable>
          </>}

          {screen === "contact" && <>
            <Text style={styles.eyebrow}>LET'S CONNECT</Text><Text style={styles.sectionTitle}>Bangun koneksi bersama TSCS.</Text>
            <Text style={styles.lead}>Sampaikan kebutuhan konektivitas, infrastruktur, atau solusi jaringan bisnis Anda.</Text>
            <Pressable style={styles.primary} onPress={() => openWeb("/kontak")}><Text style={styles.primaryText}>BUKA FORM KONSULTASI  →</Text></Pressable>
            <Pressable style={styles.secondary} onPress={() => Linking.openURL("mailto:info@tscs-telecom.com")}><Text style={styles.secondaryText}>EMAIL TSCS</Text></Pressable>
          </>}
        </ScrollView>

        <View style={styles.tabbar}>{tabs.map(([id,label])=><Pressable key={id} style={styles.tab} onPress={() => setScreen(id)}><View style={[styles.dot, screen===id && styles.activeDot]}/><Text style={[styles.tabText, screen===id && styles.activeTab]}>{label}</Text></Pressable>)}</View>
        {loading && <View style={styles.loading}><ActivityIndicator color="#fff"/></View>}
      </View>
    </SafeAreaView>
  );
}

const styles=StyleSheet.create({
 safe:{flex:1,backgroundColor:"#05070b"},root:{flex:1,backgroundColor:"#05070b"},header:{height:78,paddingHorizontal:20,flexDirection:"row",alignItems:"center",justifyContent:"space-between",borderBottomWidth:1,borderBottomColor:"#171c24"},logo:{fontSize:25,fontWeight:"900",letterSpacing:5,color:"#fff"},company:{fontSize:7,letterSpacing:1,color:"#737b89",marginTop:2},headerButton:{borderWidth:1,borderColor:"#39404d",paddingHorizontal:12,paddingVertical:9,borderRadius:4},headerButtonText:{color:"#fff",fontSize:9,fontWeight:"700",letterSpacing:1},content:{padding:24,paddingBottom:110},eyebrow:{color:"#788291",fontSize:9,fontWeight:"700",letterSpacing:2,marginBottom:18},hero:{fontSize:35,lineHeight:41,fontWeight:"700",color:"#f5f7fa"},italic:{fontStyle:"italic",color:"#cdd3dc"},lead:{fontSize:15,lineHeight:24,color:"#929aa7",marginTop:18,marginBottom:22},primary:{backgroundColor:"#f2f4f7",padding:16,borderRadius:4,alignItems:"center",marginBottom:25},primaryText:{fontSize:10,fontWeight:"900",letterSpacing:1,color:"#080a0e"},secondary:{borderWidth:1,borderColor:"#353c47",padding:15,borderRadius:4,alignItems:"center",marginTop:8},secondaryText:{color:"#fff",fontSize:10,fontWeight:"800",letterSpacing:1},networkVisual:{height:190,borderWidth:1,borderColor:"#202632",borderRadius:8,marginBottom:36,marginTop:8,position:"relative",overflow:"hidden",backgroundColor:"#080b11"},core:{position:"absolute",top:65,left:"43%",width:70,height:70,borderRadius:35,borderWidth:1,borderColor:"#788291",alignItems:"center",justifyContent:"center"},coreText:{color:"#fff",fontWeight:"900",letterSpacing:2},node:{position:"absolute",width:7,height:7,borderRadius:4,backgroundColor:"#dfe4ea"},sectionEyebrow:{color:"#788291",fontSize:9,fontWeight:"700",letterSpacing:2,marginBottom:10},sectionTitle:{fontSize:28,lineHeight:35,fontWeight:"700",color:"#f5f7fa",marginBottom:22},card:{borderWidth:1,borderColor:"#252c36",borderRadius:6,padding:19,marginBottom:12,backgroundColor:"#090c12"},pressed:{opacity:.7},cardLine:{width:28,height:2,backgroundColor:"#aeb5bf",marginBottom:18},cardTitle:{fontSize:18,fontWeight:"700",color:"#fff",marginBottom:7},cardText:{fontSize:13,lineHeight:20,color:"#8e97a4",marginBottom:16},explore:{fontSize:9,fontWeight:"800",letterSpacing:1.5,color:"#cfd5dd"},networkPanel:{height:230,borderWidth:1,borderColor:"#252c36",borderRadius:8,marginBottom:22,padding:22,justifyContent:"flex-end",backgroundColor:"#080b11"},panelTitle:{fontSize:12,fontWeight:"900",letterSpacing:3,color:"#fff",marginBottom:8},panelText:{fontSize:14,lineHeight:21,color:"#8e97a4"},tabbar:{position:"absolute",bottom:0,left:0,right:0,height:72,backgroundColor:"#080a0f",borderTopWidth:1,borderTopColor:"#1c222b",flexDirection:"row",justifyContent:"space-around",paddingTop:10},tab:{alignItems:"center",width:"25%"},dot:{width:4,height:4,borderRadius:2,backgroundColor:"#555d69",marginBottom:7},activeDot:{backgroundColor:"#fff",width:5,height:5},tabText:{fontSize:9,color:"#656e7b"},activeTab:{color:"#fff",fontWeight:"700"},loading:{...StyleSheet.absoluteFillObject,backgroundColor:"rgba(5,7,11,.75)",alignItems:"center",justifyContent:"center"}
});