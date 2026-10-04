import Link from "next/link";

const services = [
  ["01", "Fiber Internet", "Koneksi fiber yang cepat dan stabil untuk menjaga operasional bisnis tetap terhubung."],
  ["02", "Business Connectivity", "Konektivitas profesional untuk kantor, enterprise, dan kebutuhan jaringan bisnis."],
  ["03", "Fiber Infrastructure", "Perencanaan dan pembangunan infrastruktur fiber optic yang terukur dan siap berkembang."],
  ["04", "Network Solution", "Solusi jaringan yang dirancang mengikuti kebutuhan konektivitas dan infrastruktur bisnis."]
];

const strengths = [
  ["Fiber Optic Connectivity", "Fondasi konektivitas berbasis fiber optic untuk kebutuhan yang menuntut stabilitas."],
  ["Network Infrastructure", "Infrastruktur jaringan yang dirancang dengan pendekatan terukur dan berorientasi jangka panjang."],
  ["Business Connectivity", "Solusi konektivitas yang menempatkan kebutuhan operasional bisnis sebagai prioritas."],
  ["Scalable Solution", "Arsitektur jaringan yang dapat dikembangkan mengikuti pertumbuhan kebutuhan."]
];

function FiberVisual() {
  return (
    <div className="fiberVisual" aria-hidden="true">
      <div className="fiberGlow glowOne" />
      <div className="fiberGlow glowTwo" />
      <svg viewBox="0 0 760 560" className="fiberSvg" preserveAspectRatio="none">
        <defs>
          <linearGradient id="fiberBlue" x1="0" x2="1">
            <stop offset="0" stopColor="#183b91" stopOpacity=".05"/>
            <stop offset=".45" stopColor="#2f7cff"/>
            <stop offset="1" stopColor="#8eb9ff"/>
          </linearGradient>
          <filter id="softGlow">
            <feGaussianBlur stdDeviation="5" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
        <g fill="none" strokeLinecap="round" filter="url(#softGlow)">
          <path className="fiberPath" d="M-40 520 C120 455 160 270 330 300 S520 440 820 90" stroke="url(#fiberBlue)" strokeWidth="10"/>
          <path className="fiberPath delayOne" d="M-50 500 C120 420 190 245 345 285 S535 410 820 55" stroke="#4d91ff" strokeWidth="3"/>
          <path className="fiberPath delayTwo" d="M-20 555 C135 480 185 320 355 325 S545 455 820 135" stroke="#8bb8ff" strokeWidth="2"/>
          <path className="fiberPath delayThree" d="M35 565 C190 475 235 360 380 350 S590 420 820 205" stroke="#2469e8" strokeWidth="5"/>
        </g>
        <g className="fiberCore">
          <circle cx="318" cy="300" r="7"/><circle cx="520" cy="393" r="6"/><circle cx="665" cy="260" r="5"/>
        </g>
      </svg>
      <div className="fiberCaption">FIBER OPTIC / NETWORK INFRASTRUCTURE</div>
    </div>
  );
}

export default function Home() {
  return (
    <>
      <section className="hero heroHome">
        <div className="heroCopy">
          <span className="eyebrow">TELECOMMUNICATION • FIBER OPTIC • CONNECTIVITY</span>
          <h1>Koneksi yang <em>Menggerakkan.</em><br/>Infrastruktur yang <em>Menguatkan.</em></h1>
          <p>Menghadirkan konektivitas fiber optic dan solusi jaringan modern untuk membangun infrastruktur digital yang cepat, stabil, dan siap berkembang.</p>
          <div className="actions">
            <Link href="/layanan" className="btn">Jelajahi Layanan <span>↗</span></Link>
            <Link href="/kontak" className="btn ghost">Konsultasi</Link>
          </div>
        </div>
        <FiberVisual />
      </section>

      <section className="trustSection">
        <div className="sectionHead">
          <span className="eyebrow">PT. TIGA SERANGKAI CAHAYA SELATAN</span>
          <h2>Membangun fondasi konektivitas untuk bisnis yang terus bergerak.</h2>
        </div>
        <div className="trustGrid">
          {strengths.map(([title, text]) => (
            <article className="trustItem" key={title}>
              <span className="trustDot" />
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section servicesSection">
        <div className="sectionHead rowHead">
          <div><span className="eyebrow">OUR SERVICES</span><h2>Solusi konektivitas untuk kebutuhan nyata.</h2></div>
          <Link href="/layanan" className="textLink">Lihat semua layanan <span>→</span></Link>
        </div>
        <div className="serviceList">
          {services.map(([num, title, text]) => (
            <Link href="/layanan" className="serviceRow" key={title}>
              <span className="serviceNum">{num}</span>
              <div><h3>{title}</h3><p>{text}</p></div>
              <span className="serviceArrow">↗</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="networkSection">
        <div className="networkMap" aria-hidden="true">
          <div className="mapShape" />
          <span className="mapNode n1"/><span className="mapNode n2"/><span className="mapNode n3"/><span className="mapNode n4"/>
          <span className="mapLine ml1"/><span className="mapLine ml2"/><span className="mapLine ml3"/>
        </div>
        <div className="networkCopy">
          <span className="eyebrow">NETWORK</span>
          <h2>Konektivitas yang terus berkembang.</h2>
          <p>Infrastruktur jaringan dibangun untuk mendukung kebutuhan konektivitas yang cepat, stabil, dan siap berkembang.</p>
          <Link href="/jaringan" className="btn">Cek Ketersediaan Jaringan <span>↗</span></Link>
          <small>Coverage dapat berbeda berdasarkan lokasi dan ketersediaan jaringan.</small>
        </div>
      </section>

      <section className="section technologySection">
        <div className="sectionHead">
          <span className="eyebrow">INFRASTRUCTURE & TECHNOLOGY</span>
          <h2>Fiber sebagai fondasi. Network sebagai penggerak.</h2>
        </div>
        <div className="techGrid">
          <div className="techVisual">
            <div className="techCore">FIBER</div>
            <div className="techRing tr1"/><div className="techRing tr2"/><div className="techRing tr3"/>
            <span className="techPulse tp1"/><span className="techPulse tp2"/><span className="techPulse tp3"/>
          </div>
          <div className="techPoints">
            <div><span>01</span><div><h3>Fiber Optic</h3><p>Infrastruktur transmisi berkapasitas tinggi sebagai fondasi konektivitas.</p></div></div>
            <div><span>02</span><div><h3>Network Infrastructure</h3><p>Jaringan yang dirancang untuk mendukung kebutuhan operasional secara konsisten.</p></div></div>
            <div><span>03</span><div><h3>Scalable Architecture</h3><p>Solusi yang dapat berkembang mengikuti kebutuhan bisnis dan jaringan.</p></div></div>
          </div>
        </div>
      </section>

      <section className="aboutSection">
        <div className="aboutPanel">
          <span className="eyebrow">ABOUT TSCS</span>
          <h2>PT. TIGA SERANGKAI CAHAYA SELATAN</h2>
          <p>TSCS hadir dengan fokus pada konektivitas, fiber optic, dan infrastruktur jaringan untuk membantu menciptakan fondasi digital yang lebih andal bagi bisnis.</p>
          <p>Kami memandang jaringan bukan sekadar koneksi, tetapi sebagai infrastruktur yang memungkinkan bisnis bergerak lebih cepat dan berkembang dengan percaya diri.</p>
          <Link href="/tentang-kami" className="textLink">Mengenal TSCS <span>→</span></Link>
        </div>
      </section>

      <section className="finalCta">
        <span className="eyebrow">LET'S CONNECT</span>
        <h2>Siap Terhubung dengan<br/><em>Infrastruktur yang Lebih Baik?</em></h2>
        <Link href="/layanan" className="btn">Jelajahi Layanan <span>↗</span></Link>
      </section>
    </>
  );
}
