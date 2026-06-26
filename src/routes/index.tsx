import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  ShoppingBag,
  Loader2,
  PackageOpen,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Copy,
  Check,
  CreditCard,
  User,
  Instagram,
  MessageCircle,
  Music2,
} from "lucide-react";
import { supabase, formatRupiah, type Product } from "@/lib/supabase";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Katalog Produk — Premium Chrome" },
      { name: "description", content: "Jelajahi koleksi produk premium kami." },
    ],
  }),
  component: Index,
});

const LOGO_URL = "https://files.catbox.moe/3whqvw.png";
const HERO_SLIDES = [
  "https://files.catbox.moe/v50i58.png",
  "https://files.catbox.moe/kwwzmj.png",
  "https://files.catbox.moe/rk6rku.png",
];

function Index() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });
      if (!mounted) return;
      if (error) setError(error.message);
      else setProducts((data ?? []) as Product[]);
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => p.name.toLowerCase().includes(q));
  }, [products, query]);

  const handleBuy = (p: Product) => {
    const num = p.whatsapp_number.replace(/[^0-9]/g, "");
    const text = encodeURIComponent(
      `Halo, saya tertarik untuk membeli produk ${p.name}. Bagaimana proses selanjutnya?`
    );
    window.open(`https://wa.me/${num}?text=${text}`, "_blank");
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 px-3 pt-3 pb-2 sm:px-6 sm:pt-4">
        <div className="glass-strong mx-auto flex max-w-6xl items-center gap-2 rounded-2xl px-3 py-2.5 sm:gap-4 sm:px-5 sm:py-3">
          <a href="/" className="flex shrink-0 items-center gap-2">
            <img src={LOGO_URL} alt="Logo" className="h-8 w-8 rounded-lg object-contain sm:h-10 sm:w-10" />
          </a>
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari produk..."
              className="h-10 w-full rounded-xl border border-white/15 bg-white/5 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground outline-none transition focus:border-white/40 focus:bg-white/10"
            />
          </div>
          <button
            aria-label="Buka menu"
            onClick={() => setMenuOpen(true)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white transition hover:bg-white/20 active:scale-95"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      <MenuDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />

      {/* Hero Carousel */}
      <section className="mx-auto max-w-6xl px-3 pt-4 sm:px-6 sm:pt-6">
        <HeroCarousel slides={HERO_SLIDES} />
      </section>

      {/* Title */}
      <section className="mx-auto max-w-6xl px-3 pt-6 pb-4 sm:px-6 sm:pt-10">
        <div className="text-center">
          <h1 className="chrome-text font-display text-5xl font-bold tracking-tight sm:text-7xl">
            PRODUK
          </h1>
          <div className="mx-auto mt-3 h-px w-24 bg-gradient-to-r from-transparent via-white/60 to-transparent" />
          <p className="mt-3 text-sm text-muted-foreground sm:text-base">
            Koleksi pilihan dengan kualitas premium
          </p>
        </div>
      </section>

      {/* Grid */}
      <main className="mx-auto max-w-6xl px-3 pb-16 sm:px-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-white/70" />
          </div>
        ) : error ? (
          <div className="glass mx-auto max-w-md rounded-2xl p-6 text-center">
            <p className="text-sm text-destructive">Gagal memuat produk: {error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass mx-auto max-w-md rounded-2xl p-8 text-center">
            <PackageOpen className="mx-auto h-10 w-10 text-white/60" />
            <p className="mt-3 text-sm text-muted-foreground">
              {query ? "Tidak ada produk yang cocok." : "Belum ada produk."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} onBuy={() => handleBuy(p)} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function ProductCard({ product, onBuy }: { product: Product; onBuy: () => void }) {
  return (
    <article className="glass group flex flex-col overflow-hidden rounded-xl transition hover:-translate-y-0.5 hover:shadow-2xl">
      <div className="relative aspect-square w-full overflow-hidden bg-black/30">
        <img
          src={product.image_url}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = "0.3"; }}
        />
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-3 sm:p-4">
        <h3 className="line-clamp-2 min-h-[2.6em] text-sm font-medium leading-snug sm:text-sm">
          {product.name}
        </h3>
        <p className="chrome-text text-base font-bold sm:text-lg">
          {formatRupiah(product.price)}
        </p>
        <button
          onClick={onBuy}
          className="chrome-btn mt-1.5 inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition hover:brightness-110 active:scale-95 sm:text-sm"
        >
          <ShoppingBag className="h-3.5 w-3.5" />
          <span>Beli</span>
        </button>
      </div>
    </article>
  );
}

function HeroCarousel({ slides }: { slides: string[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 3500);
    return () => clearInterval(id);
  }, [paused, slides.length]);

  const go = (i: number) => setIndex(((i % slides.length) + slides.length) % slides.length);

  return (
    <div
      className="glass-strong relative overflow-hidden rounded-2xl shadow-2xl sm:rounded-3xl"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => {
        if (touchStartX.current == null) return;
        const dx = e.changedTouches[0].clientX - touchStartX.current;
        if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
        touchStartX.current = null;
      }}
    >
      <div className="relative aspect-[16/9] w-full sm:aspect-[21/9]">
        {slides.map((src, i) => (
          <img
            key={src}
            src={src}
            alt={`Slide ${i + 1}`}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${i === index ? "opacity-100" : "opacity-0"}`}
            draggable={false}
          />
        ))}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-white/5" />
      </div>

      <button
        aria-label="Sebelumnya"
        onClick={() => go(index - 1)}
        className="absolute left-2 top-1/2 hidden -translate-y-1/2 rounded-full border border-white/20 bg-black/30 p-2 text-white backdrop-blur transition hover:bg-black/50 sm:block"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button
        aria-label="Berikutnya"
        onClick={() => go(index + 1)}
        className="absolute right-2 top-1/2 hidden -translate-y-1/2 rounded-full border border-white/20 bg-black/30 p-2 text-white backdrop-blur transition hover:bg-black/50 sm:block"
      >
        <ChevronRight className="h-4 w-4" />
      </button>

      <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5 sm:bottom-3">
        {slides.map((_, i) => (
          <button
            key={i}
            aria-label={`Ke slide ${i + 1}`}
            onClick={() => go(i)}
            className={`h-1.5 rounded-full transition-all ${i === index ? "w-6 bg-white" : "w-1.5 bg-white/50"}`}
          />
        ))}
      </div>
    </div>
  );
}

function MenuDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [tab, setTab] = useState<"payment" | "profile">("payment");

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <div
      className={`fixed inset-0 z-[100] transition ${open ? "pointer-events-auto" : "pointer-events-none"}`}
      aria-hidden={!open}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`}
      />
      {/* Drawer */}
      <aside
        className={`glass-strong absolute right-0 top-0 flex h-full w-full max-w-md flex-col overflow-y-auto border-l border-white/20 transition-transform duration-300 ease-out ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between border-b border-white/15 p-4">
          <h2 className="chrome-text font-display text-xl font-bold">Menu</h2>
          <button
            aria-label="Tutup"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white/20"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 p-4">
          <button
            onClick={() => setTab("payment")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${tab === "payment" ? "chrome-btn border-white/40" : "border-white/15 bg-white/5 text-white hover:bg-white/10"}`}
          >
            <CreditCard className="h-4 w-4" />
            Payment
          </button>
          <button
            onClick={() => setTab("profile")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${tab === "profile" ? "chrome-btn border-white/40" : "border-white/15 bg-white/5 text-white hover:bg-white/10"}`}
          >
            <User className="h-4 w-4" />
            Profile
          </button>
        </div>

        <div className="flex-1 px-4 pb-6">
          {tab === "payment" ? <PaymentPanel /> : <ProfilePanel />}
        </div>
      </aside>
    </div>
  );
}

function CopyRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };
  return (
    <div className="glass flex items-center justify-between gap-3 rounded-xl p-3">
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wider text-white/60">{label}</p>
        <p className="truncate font-mono text-base font-semibold text-white">{value}</p>
      </div>
      <button
        onClick={copy}
        className="chrome-btn inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold"
      >
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        {copied ? "Disalin" : "Salin"}
      </button>
    </div>
  );
}

function PaymentPanel() {
  return (
    <div className="space-y-3">
      <CopyRow label="Seabank" value="901102551341" />
      <CopyRow label="Dana" value="083109105308" />
      <div className="glass rounded-xl p-4">
        <p className="mb-3 text-center text-xs uppercase tracking-wider text-white/60">
          QRIS
        </p>
        <div className="mx-auto aspect-square w-full max-w-xs overflow-hidden rounded-xl bg-white p-2">
          <img
            src="https://files.catbox.moe/1z6nkc.jpg"
            alt="QRIS"
            className="h-full w-full object-contain"
          />
        </div>
      </div>
    </div>
  );
}

function ProfilePanel() {
  const socials = [
    {
      label: "Instagram",
      href: "https://www.instagram.com/byuu681?igsh=eGJocDdncThvMDkx",
      Icon: Instagram,
    },
    {
      label: "TikTok",
      href: "https://tiktok.com/@iboycd1",
      Icon: Music2,
    },
    {
      label: "Saluran WhatsApp",
      href: "https://whatsapp.com/channel/0029Vb8XyJkGehERjMvj1R1k",
      Icon: MessageCircle,
    },
  ];
  return (
    <div className="space-y-4">
      <div className="glass flex flex-col items-center rounded-2xl p-5">
        <div className="relative">
          <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-white via-white/40 to-white/10 blur" />
          <img
            src="https://files.catbox.moe/jecork.jpg"
            alt="Avatar"
            className="relative h-28 w-28 rounded-full border-2 border-white/60 object-cover shadow-2xl"
          />
        </div>
        <p className="chrome-text mt-3 font-display text-lg font-bold">iBoy</p>
        <p className="text-xs text-white/60">Owner</p>
      </div>

      <div className="space-y-2">
        {socials.map(({ label, href, Icon }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="glass flex items-center gap-3 rounded-xl p-3 transition hover:-translate-y-0.5 hover:bg-white/15"
          >
            <span className="chrome-btn flex h-10 w-10 items-center justify-center rounded-lg">
              <Icon className="h-4 w-4" />
            </span>
            <p className="flex-1 text-sm font-semibold text-white">{label}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
