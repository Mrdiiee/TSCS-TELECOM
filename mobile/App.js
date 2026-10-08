import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Linking, Pressable, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { supabase } from "./src/supabase";

const COLORS = { bg:"#f5f8fc", card:"#ffffff", text:"#102033", muted:"#718096", blue:"#1769e0", blue2:"#eaf2ff", line:"#e3e9f2", green:"#16a05d", red:"#d94141", yellow:"#c98300" };
const plans = [
  {id:"5-basic",name:"Basic 5",speed:5,price:115000,category:"Basic",benefit:"Cocok untuk browsing dan kebutuhan ringan.",popular:true},
  {id:"10-family",name:"Family 10",speed:10,price:200000,category:"Family",benefit:"Nyaman untuk keluarga dan beberapa perangkat.",popular:true},
  {id:"15-streaming",name:"Streaming 15",speed:15,price:250000,category:"Streaming",benefit:"Lebih nyaman untuk streaming dan hiburan rumah.",popular:true},
  {id:"30-gaming",name:"Gaming 30",speed:30,price:325000,category:"Gaming",benefit:"Koneksi lebih lega untuk gaming dan aktivitas berat.",popular:false},
  {id:"50-family",name:"Family 50",speed:50,price:425000,category:"Family",benefit:"Untuk keluarga dengan banyak perangkat.",popular:false},
  {id:"100-streaming",name:"Streaming 100",speed:100,price:575000,category:"Streaming",benefit:"Untuk rumah dengan kebutuhan streaming tinggi.",popular:false}
];

const money = n => "Rp" + Number(n||0).toLocaleString("id-ID");
const statusLabel = s => ({pending:"Menunggu pembayaran",processing:"Diproses",installation:"Instalasi",completed:"Selesai",cancelled:"Dibatalkan",paid:"Lunas",active:"Aktif",overdue:"Jatuh tempo"})[s] || s;
const uid = () => "TSCS-" + Date.now().toString(36).toUpperCase();

function Button({children,onPress,secondary=false,disabled=false}){return <Pressable disabled={disabled} onPress={onPress} style={({pressed})=>[styles.button,secondary&&styles.buttonSecondary,disabled&&styles.disabled,pressed&&styles.pressed]}><Text style={[styles.buttonText,secondary&&styles.buttonSecondaryText]}>{children}</Text></Pressable>}
function Pill({children,tone="blue"}){return <View style={[styles.pill,tone==="green"&&styles.pillGreen,tone==="red"&&styles.pillRed]}><Text style={[styles.pillText,tone==="green"&&styles.pillGreenText,tone==="red"&&styles.pillRedText]}>{children}</Text></View>}
function Card({children}){return <View style={styles.card}>{children}</View>}

export default function App(){
  const [screen,setScreen]=useState("choose");
  const [customerType,setCustomerType]=useState(null);
  const [tab,setTab]=useState("home");
  const [selected,setSelected]=useState(null);
  const [checkoutStep,setCheckoutStep]=useState(1);
  const [paymentType,setPaymentType]=useState("prabayar");
  const [paymentMethod,setPaymentMethod]=useState("qris");
  const [profile,setProfile]=useState({name:"",email:"",phone:"",address:""});
  const [phone,setPhone]=useState("");
  const [otp,setOtp]=useState("");
  const [authMode,setAuthMode]=useState("login");
  const [user,setUser]=useState(null);
  const [orders,setOrders]=useState([]);
  const [bills,setBills]=useState([]);
  const [location,setLocation]=useState(null);
  const [coverage,setCoverage]=useState(null);
  const [admin,setAdmin]=useState(false);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");
  const [activeServices,setActiveServices]=useState([]);\n  const [selectedOrder,setSelectedOrder]=useState(null);

  useEffect(()=>{ supabase.auth.getSession().then(({data})=>{setUser(data.session?.user||null);setAdmin(data.session?.user?.app_metadata?.role==="admin");}); const {data}=supabase.auth.onAuthStateChange((_e,s)=>{setUser(s?.user||null);setAdmin(s?.user?.app_metadata?.role==="admin");}); return ()=>data.subscription.unsubscribe(); },[]);
  useEffect(()=>{ if(user) loadData(); },[user]);
  useEffect(()=>{ AsyncStorage.getItem("tscs_profile").then(v=>{if(v) setProfile(JSON.parse(v));}); },[]);
  useEffect(()=>{ AsyncStorage.setItem("tscs_profile",JSON.stringify(profile)); },[profile]);

  async function loadData(){
    const {data:o}=await supabase.from("orders").select("*").order("created_at",{ascending:false});
    const {data:b}=await supabase.from("bills").select("*").order("due_date",{ascending:true});
    if(o) setOrders(o); if(b) setBills(b);
    if(o) setActiveServices(o.filter(x=>x.status==="completed" && x.payment_status==="paid").map(x=>({
      id:x.id, name:x.plan_name, speed:x.speed_mbps, amount:x.amount, address:x.address,
      startedAt:x.created_at, nextPayment:null, status:"active"
    })));
  }

  async function sendOtp(){
    setError(""); if(!/^\+?[0-9]{9,15}$/.test(phone.replace(/\s/g,""))){setError("Masukkan nomor HP yang valid.");return}
    setLoading(true); const {error:e}=await supabase.auth.signInWithOtp({phone:phone.replace(/\s/g,"")}); setLoading(false);
    if(e){setError(e.message);return} setAuthMode("verify");
  }
  async function verifyOtp(){
    setLoading(true); const {data,error:e}=await supabase.auth.verifyOtp({phone:phone.replace(/\s/g,""),token:otp,type:"sms"}); setLoading(false);
    if(e){setError(e.message);return} setUser(data.user); setScreen("app");
  }
  async function requestLocation(){
    setError(""); const p=await Location.requestForegroundPermissionsAsync();
    if(p.status!=="granted"){setError("Izin lokasi belum diberikan.");return}
    const pos=await Location.getCurrentPositionAsync({accuracy:Location.Accuracy.Balanced});
    setLocation({lat:pos.coords.latitude,lng:pos.coords.longitude});
    setCoverage("available"); // coverage database can replace this fallback once wilayah TSCS is populated.
  }
  async function createOrder(){
    if(!user){setScreen("auth");return}
    if(!profile.name||!profile.phone||!profile.email||!profile.address){setError("Lengkapi nama, nomor WhatsApp, email, dan alamat pemasangan.");return}
    setLoading(true); const orderId=uid();
    const payload={order_number:orderId,user_id:user.id,customer_type:customerType,plan_id:selected.id,plan_name:selected.name,speed_mbps:selected.speed,amount:selected.price,billing_type:paymentType,payment_method:paymentMethod,address:profile.address,status:"pending",payment_status:"pending",latitude:location?.lat||null,longitude:location?.lng||null};
    const {data,error:e}=await supabase.from("orders").insert(payload).select().single(); setLoading(false);
    if(e){setError(e.message);return}
    setOrders(x=>[data,...x]); setScreen("success");
  }
  function openOrder(order){setSelectedOrder(order);setScreen("order-detail")}\n\n  async function cancelOrder(id){
    const {data,error:e}=await supabase.from("orders").update({status:"cancelled"}).eq("id",id).eq("user_id",user.id).eq("payment_status","pending").select().single();
    if(!e&&data)setOrders(x=>x.map(o=>o.id===id?data:o));
  }
  function chooseType(t){setCustomerType(t);setScreen("app");setTab("home")}
  function openPlan(p){setSelected(p);setCheckoutStep(1);setScreen("detail")}
  function home(){setScreen("app");setTab("home")}

  if(screen==="choose") return <Shell><View style={styles.center}><Text style={styles.brand}>TSCS</Text><Text style={styles.title}>Internet yang sesuai kebutuhanmu.</Text><Text style={styles.sub}>Pilih jenis layanan untuk melihat paket yang relevan.</Text><View style={styles.typeRow}><Pressable style={styles.typeCard} onPress={()=>chooseType("rumah")}><Text style={styles.typeIcon}>⌂</Text><Text style={styles.typeTitle}>Rumah</Text><Text style={styles.sub}>Internet untuk rumah & personal.</Text></Pressable><Pressable style={styles.typeCard} onPress={()=>chooseType("bisnis")}><Text style={styles.typeIcon}>▦</Text><Text style={styles.typeTitle}>Bisnis</Text><Text style={styles.sub}>Konektivitas untuk kebutuhan bisnis.</Text></Pressable></View></View></Shell>;
  if(screen==="auth") return <Shell><View style={styles.page}><Text style={styles.eyebrow}>AKUN TSCS</Text><Text style={styles.title}>Masuk dengan nomor HP.</Text><Text style={styles.sub}>Kami akan mengirim OTP untuk memverifikasi akun.</Text>{authMode==="login"&&<><TextInput value={phone} onChangeText={setPhone} placeholder="+62 8xxxxxxxx" keyboardType="phone-pad" style={styles.input}/><Button onPress={sendOtp} disabled={loading}>{loading?"MENGIRIM...":"KIRIM OTP"}</Button></>}{authMode==="verify"&&<><TextInput value={otp} onChangeText={setOtp} placeholder="Kode OTP" keyboardType="number-pad" style={styles.input}/><Button onPress={verifyOtp} disabled={loading}>{loading?"MEMVERIFIKASI...":"VERIFIKASI OTP"}</Button><Button secondary onPress={()=>setAuthMode("login")}>GANTI NOMOR</Button></>}{error?<Text style={styles.error}>{error}</Text>:null}</View></Shell>;

  if(screen==="detail"&&selected) return <Shell onBack={home}><View style={styles.page}><Text style={styles.eyebrow}>DETAIL PAKET</Text><Text style={styles.title}>{selected.name}</Text><Text style={styles.speed}>{selected.speed} Mbps</Text><Text style={styles.price}>Mulai dari {money(selected.price)}<Text style={styles.month}> / bulan</Text></Text><Card><Text style={styles.cardTitle}>Benefit</Text><Text style={styles.sub}>{selected.benefit}</Text><Text style={styles.meta}>Biaya pemasangan dan ketentuan akan ditampilkan saat checkout.</Text></Card><View style={styles.toggle}><Pressable onPress={()=>setPaymentType("prabayar")} style={[styles.toggleItem,paymentType==="prabayar"&&styles.toggleActive]}><Text>PRABAYAR</Text></Pressable><Pressable onPress={()=>setPaymentType("pascabayar")} style={[styles.toggleItem,paymentType==="pascabayar"&&styles.toggleActive]}><Text>PASCABAYAR</Text></Pressable></View><Button onPress={()=>{setCheckoutStep(1);setScreen("checkout")}}>PILIH PAKET</Button></View></Shell>;

  if(screen==="checkout"&&selected) return <Shell onBack={()=>setScreen("detail")}><View style={styles.page}><Text style={styles.eyebrow}>CHECKOUT • {checkoutStep}/4</Text>{checkoutStep===1&&<><Text style={styles.title}>Data pribadi</Text><TextInput placeholder="Nama lengkap" value={profile.name} onChangeText={v=>setProfile({...profile,name:v})} style={styles.input}/><TextInput placeholder="Nomor HP" value={profile.phone} onChangeText={v=>setProfile({...profile,phone:v})} keyboardType="phone-pad" style={styles.input}/><TextInput placeholder="Email" value={profile.email} onChangeText={v=>setProfile({...profile,email:v})} keyboardType="email-address" style={styles.input}/><Button onPress={()=>user?setCheckoutStep(2):setScreen("auth")}>LANJUTKAN</Button></>}{checkoutStep===2&&<><Text style={styles.title}>Alamat pemasangan</Text><Button secondary onPress={requestLocation}>GUNAKAN LOKASI SAYA</Button>{location?<Text style={styles.success}>Lokasi GPS tersimpan.</Text>:null}<TextInput placeholder="Alamat lengkap pemasangan" value={profile.address} onChangeText={v=>setProfile({...profile,address:v})} multiline style={[styles.input,styles.textarea]}/><Button onPress={()=>{setCoverage(null);setCheckoutStep(3)}}>LANJUTKAN</Button></>}{checkoutStep===3&&<><Text style={styles.title}>Detail pemasangan</Text><Card><Text style={styles.cardTitle}>{selected.name} • {paymentType}</Text><Text style={styles.sub}>{money(selected.price)} / bulan</Text><Text style={styles.meta}>Lokasi: {profile.address||"Belum diisi"}</Text></Card><Text style={styles.label}>Status jaringan</Text><View style={styles.coverageRow}><Text style={styles.success}>● Jaringan tersedia</Text></View><Button onPress={()=>setCheckoutStep(4)}>LANJUTKAN</Button></>}{checkoutStep===4&&<><Text style={styles.title}>Pembayaran</Text><Card><Text style={styles.cardTitle}>Total</Text><Text style={styles.total}>{money(selected.price)}</Text><Text style={styles.meta}>Metode yang dipilih hanya dicatat pada pesanan sampai payment gateway TSCS dihubungkan.</Text></Card>{["qris","virtual_account","ewallet"].map(m=><Pressable key={m} onPress={()=>setPaymentMethod(m)} style={[styles.method,paymentMethod===m&&styles.methodActive]}><Text style={styles.cardTitle}>{m==="qris"?"QRIS":m==="virtual_account"?"Virtual Account":"E-Wallet"}</Text><Text style={styles.sub}>{paymentMethod===m?"Dipilih":"Pilih metode"}</Text></Pressable>)}<Button onPress={createOrder} disabled={loading}>{loading?"MEMBUAT PESANAN...":"KONFIRMASI PESANAN"}</Button></>}{error?<Text style={styles.error}>{error}</Text>:null}</View></Shell>;

  if(screen==="success") return <Shell><View style={styles.center}><Text style={styles.successIcon}>✓</Text><Text style={styles.title}>Pesanan berhasil dibuat.</Text><Text style={styles.sub}>Pesanan tercatat dan menunggu pembayaran.</Text><Button onPress={()=>{setScreen("app");setTab("orders")}}>LIHAT PESANAN</Button><Button secondary onPress={home}>KEMBALI KE BERANDA</Button></View></Shell>;

  if(screen==="admin") return <AdminView orders={orders} bills={bills} onBack={home}/>;\n  if(screen==="order-detail"&&selectedOrder) return <OrderDetail order={selectedOrder} onBack={()=>{setSelectedOrder(null);setScreen("app");setTab("orders")}} onCancel={async()=>{await cancelOrder(selectedOrder.id); setSelectedOrder(x=>x?{...x,status:"cancelled"}:x)}}/>;

  return <Shell>{tab==="home"&&<Home customerType={customerType} openPlan={openPlan} onCoverage={requestLocation} coverage={coverage} onRecommend={c=>{const p=plans.find(x=>x.category===c)||plans[0];openPlan(p)}}/>}{tab==="packages"&&<Packages openPlan={openPlan}/>} {tab==="orders"&&<Orders orders={orders} cancelOrder={cancelOrder} openOrder={openOrder}/>} {tab==="bills"&&<Bills bills={bills}/>} {tab==="account"&&<Account user={user} profile={profile} setProfile={setProfile} setScreen={setScreen} admin={admin} onLogin={()=>setScreen("auth")} activeServices={activeServices} bills={bills}/>}<Bottom tab={tab} setTab={setTab}/></Shell>;
}

function Home({customerType,openPlan,onCoverage,coverage,onRecommend}){return <ScrollView contentContainerStyle={styles.page}><View style={styles.promo}><Text style={styles.promoTag}>PROMO TSCS</Text><Text style={styles.promoTitle}>Koneksi rumah, lebih simpel.</Text><Text style={styles.promoText}>Pilih paket yang sesuai kebutuhanmu.</Text><Button onPress={()=>openPlan(plans[1])}>LIHAT PROMO</Button></View><Text style={styles.section}>Paket populer</Text>{plans.filter(p=>p.popular).slice(0,3).map(p=><Pressable key={p.id} onPress={()=>openPlan(p)} style={styles.product}><View><Text style={styles.productName}>{p.name}</Text><Text style={styles.productSpeed}>{p.speed} Mbps</Text><Text style={styles.sub}>{p.benefit}</Text></View><View><Text style={styles.productPrice}>Mulai dari</Text><Text style={styles.productPriceBig}>{money(p.price)}</Text><Text style={styles.productPrice}>/ bulan</Text></View></Pressable>)}<View style={styles.availability}><Text style={styles.section}>Cek ketersediaan</Text><Text style={styles.sub}>Periksa apakah jaringan TSCS tersedia di lokasi kamu.</Text><Button secondary onPress={onCoverage}>GUNAKAN GPS</Button>{coverage==="available"&&<Text style={styles.success}>● Jaringan tersedia di lokasi yang diperiksa.</Text>}</View><Text style={styles.section}>Rekomendasi cepat</Text><View style={styles.chips}>{["Basic","Family","Streaming","Gaming"].map(c=><Pressable key={c} onPress={()=>onRecommend(c)} style={styles.chip}><Text>{c}</Text></Pressable>)}</View></ScrollView>}

function Packages({openPlan}){const [speed,setSpeed]=useState(null),[cat,setCat]=useState(null);const data=plans.filter(p=>(!speed||p.speed===speed)&&(!cat||p.category===cat));return <ScrollView contentContainerStyle={styles.page}><Text style={styles.eyebrow}>PAKET</Text><Text style={styles.title}>Pilih paket internet.</Text><Text style={styles.sub}>Filter berdasarkan kecepatan atau kebutuhan.</Text><Text style={styles.label}>Kecepatan</Text><View style={styles.chips}>{[5,10,15,30,50,100].map(s=><Pressable key={s} onPress={()=>setSpeed(speed===s?null:s)} style={[styles.chip,speed===s&&styles.chipActive]}><Text>{s} Mbps</Text></Pressable>)}</View><Text style={styles.label}>Kebutuhan</Text><View style={styles.chips}>{["Basic","Family","Streaming","Gaming"].map(c=><Pressable key={c} onPress={()=>setCat(cat===c?null:c)} style={[styles.chip,cat===c&&styles.chipActive]}><Text>{c}</Text></Pressable>)}</View>{data.map(p=><Pressable key={p.id} onPress={()=>openPlan(p)} style={styles.product}><View><Text style={styles.productName}>{p.name}</Text><Text style={styles.productSpeed}>{p.speed} Mbps</Text><Text style={styles.sub}>{p.benefit}</Text></View><Text style={styles.productPriceBig}>{money(p.price)}</Text></Pressable>)}</ScrollView>}

function Orders({orders,cancelOrder,openOrder}){return <ScrollView contentContainerStyle={styles.page}><Text style={styles.eyebrow}>PESANAN</Text><Text style={styles.title}>Riwayat pesanan</Text>{orders.length===0?<Empty text="Belum ada pesanan."/>:orders.map(o=><Pressable key={o.id} onPress={()=>openOrder(o)}><Card><View style={styles.row}><Text style={styles.cardTitle}>{o.order_number}</Text><Pill tone={o.status==="cancelled"?"red":o.status==="completed"?"green":"blue"}>{statusLabel(o.status)}</Pill></View><Text style={styles.sub}>{o.plan_name} • {o.speed_mbps} Mbps</Text><Text style={styles.meta}>{money(o.amount)} • {o.address||"Alamat belum diisi"}</Text><Text style={styles.orderLink}>LIHAT DETAIL PESANAN →</Text>{o.payment_status==="pending"&&o.status!=="cancelled"?<Button secondary onPress={()=>cancelOrder(o.id)}>BATALKAN PESANAN</Button>:null}</Card></Pressable>)}</ScrollView>}

function OrderDetail({order,onBack,onCancel}){const steps=[["pending","Menunggu"],["processing","Diproses"],["installation","Instalasi"],["completed","Selesai"]];const current=steps.findIndex(x=>x[0]===order.status);return <Shell onBack={onBack}><ScrollView contentContainerStyle={styles.page}><Text style={styles.eyebrow}>DETAIL PESANAN</Text><Text style={styles.title}>{order.order_number}</Text><View style={styles.row}><Text style={styles.sub}>Dibuat {order.created_at?new Date(order.created_at).toLocaleDateString("id-ID"): "-"}</Text><Pill tone={order.status==="cancelled"?"red":order.status==="completed"?"green":"blue"}>{statusLabel(order.status)}</Pill></View>{order.status!=="cancelled"&&<Card><Text style={styles.cardTitle}>Status pesanan</Text>{steps.map((s,i)=><View key={s[0]} style={styles.timelineRow}><View style={[styles.timelineDot,(i<=current)&&styles.timelineDotActive]}/><View><Text style={[styles.timelineLabel,i<=current&&styles.timelineLabelActive]}>{s[1]}</Text>{i===current?<Text style={styles.meta}>Status saat ini</Text>:null}</View></View>)}</Card>}{order.status==="cancelled"&&<Card><Text style={styles.cardTitle}>Pesanan dibatalkan</Text><Text style={styles.sub}>Pesanan ini tidak dapat diproses kembali.</Text></Card>}<Card><Text style={styles.cardTitle}>Paket</Text><Text style={styles.productName}>{order.plan_name}</Text><Text style={styles.sub}>{order.speed_mbps} Mbps</Text><Text style={styles.meta}>Tipe: {order.billing_type==="pascabayar"?"Pascabayar":"Prabayar"}</Text><Text style={styles.total}>{money(order.amount)}</Text></Card><Card><Text style={styles.cardTitle}>Pemasangan</Text><Text style={styles.sub}>{order.address||"Alamat belum diisi"}</Text></Card><Card><Text style={styles.cardTitle}>Pembayaran</Text><Text style={styles.sub}>Status: {statusLabel(order.payment_status)}</Text><Text style={styles.meta}>Metode: {order.payment_method||"-"}</Text><Text style={styles.total}>{money(order.amount)}</Text></Card>{order.payment_status==="pending"&&order.status!=="cancelled"?<Button secondary onPress={()=>Alert.alert("Batalkan pesanan","Pesanan belum dibayar. Batalkan pesanan ini?",[{text:"Tidak",style:"cancel"},{text:"Ya, batalkan",style:"destructive",onPress:onCancel}])}>BATALKAN PESANAN</Button>:null}</ScrollView></Shell>}

function Bills({bills}){return <ScrollView contentContainerStyle={styles.page}><Text style={styles.eyebrow}>TAGIHAN</Text><Text style={styles.title}>Tagihan</Text>{bills.length===0?<Empty text="Belum ada tagihan."/>:bills.map(b=><Card key={b.id}><View style={styles.row}><Text style={styles.cardTitle}>{b.invoice_number}</Text><Pill tone={b.status==="paid"?"green":"blue"}>{statusLabel(b.status)}</Pill></View><Text style={styles.sub}>{money(b.amount)}</Text><Text style={styles.meta}>Periode: {b.period||"-"}</Text><Text style={styles.meta}>Jatuh tempo: {b.due_date||"-"}</Text><Button secondary onPress={()=>Alert.alert("Invoice",`Nomor invoice: ${b.invoice_number}\\nTanggal: ${new Date(b.created_at).toLocaleDateString("id-ID")}\\nTotal: ${money(b.amount)}\\nStatus: ${statusLabel(b.status)}`)}>LIHAT INVOICE</Button></Card>)}</ScrollView>}\n


// Order detail styles are kept near the existing stylesheet.