import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Lock, Upload, Loader2, CheckCircle2, ImagePlus, LogOut } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/panel-rahasia-iboy")({
  head: () => ({ meta: [{ name: "robots", content: "noindex,nofollow" }, { title: "Panel" }] }),
  component: AdminPanel,
});

const ADMIN_PASSWORD = "iboy-admin-2026";
const STORAGE_KEY = "iboy_admin_auth";

function AdminPanel() {
  const navigate = useNavigate();
  const [authed, setAuthed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.sessionStorage.getItem(STORAGE_KEY) === "1";
  });
  const [pwd, setPwd] = useState("");
  const [attempts, setAttempts] = useState(0);

  const tryLogin = (e: FormEvent) => {
    e.preventDefault();
    if (pwd === ADMIN_PASSWORD) {
      window.sessionStorage.setItem(STORAGE_KEY, "1");
      setAuthed(true);
      toast.success("Login berhasil");
    } else {
      const next = attempts + 1;
      setAttempts(next);
      toast.error("Password salah");
      if (next >= 3) {
        toast.error("Terlalu banyak percobaan. Diarahkan ke beranda.");
        setTimeout(() => navigate({ to: "/" }), 800);
      }
    }
  };

  if (!authed) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <form onSubmit={tryLogin} className="glass-strong w-full max-w-sm rounded-2xl p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="glass rounded-xl p-2"><Lock className="h-5 w-5" /></div>
            <div>
              <h1 className="font-display text-lg font-semibold">Area Terbatas</h1>
              <p className="text-xs text-muted-foreground">Masukkan password admin</p>
            </div>
          </div>
          <input
            type="password"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            autoFocus
            placeholder="Password"
            className="h-11 w-full rounded-xl border border-white/15 bg-white/5 px-3 text-sm outline-none focus:border-white/40 focus:bg-white/10"
          />
          <button type="submit" className="chrome-btn mt-3 h-11 w-full rounded-xl font-semibold transition hover:brightness-110">
            Masuk
          </button>
          <button type="button" onClick={() => navigate({ to: "/" })} className="mt-2 w-full text-xs text-muted-foreground hover:text-foreground">
            Kembali
          </button>
        </form>
      </div>
    );
  }

  return <AdminContent onLogout={() => { window.sessionStorage.removeItem(STORAGE_KEY); setAuthed(false); }} />;
}

function AdminContent({ onLogout }: { onLogout: () => void }) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState<string>("");
  const [wa, setWa] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [stage, setStage] = useState<"idle" | "uploading" | "saving">("idle");
  const [showSuccess, setShowSuccess] = useState(false);

  const onFileChange = (f: File | null) => {
    setFile(f);
    if (f) {
      const reader = new FileReader();
      reader.onload = () => setPreview(String(reader.result));
      reader.readAsDataURL(f);
    } else setPreview("");
  };

  const reset = () => {
    setName(""); setPrice(""); setWa(""); setFile(null); setPreview("");
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price || !wa.trim() || !file) {
      toast.error("Mohon lengkapi semua kolom");
      return;
    }
    const priceNum = Number(price);
    if (!Number.isFinite(priceNum) || priceNum <= 0) {
      toast.error("Harga tidak valid");
      return;
    }

    setSubmitting(true);
    try {
      setStage("uploading");
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("product-images")
        .upload(path, file, { cacheControl: "3600", upsert: false, contentType: file.type });
      if (upErr) throw upErr;

      const { data: pub } = supabase.storage.from("product-images").getPublicUrl(path);
      const imageUrl = pub.publicUrl;

      setStage("saving");
      const { error: insErr } = await supabase.from("products").insert({
        name: name.trim(),
        price: priceNum,
        whatsapp_number: wa.trim(),
        image_url: imageUrl,
      });
      if (insErr) throw insErr;

      toast.success("Produk berhasil diupload");
      setShowSuccess(true);
      reset();
    } catch (err: any) {
      console.error(err);
      toast.error("Gagal: " + (err?.message ?? "Unknown error"));
    } finally {
      setSubmitting(false);
      setStage("idle");
    }
  };

  return (
    <div className="min-h-screen px-3 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-2xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="chrome-text font-display text-3xl font-bold sm:text-4xl">Panel Admin</h1>
            <p className="text-sm text-muted-foreground">Upload produk baru</p>
          </div>
          <button onClick={onLogout} className="glass inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium">
            <LogOut className="h-3.5 w-3.5" /> Keluar
          </button>
        </div>

        <form onSubmit={onSubmit} className="glass-strong rounded-2xl p-5 sm:p-7">
          <div className="space-y-4">
            <Field label="Nama Produk">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Sepatu Premium"
                className="h-11 w-full rounded-xl border border-white/15 bg-white/5 px-3 text-sm outline-none focus:border-white/40 focus:bg-white/10"
              />
            </Field>

            <Field label="Harga Produk (Rp)">
              <input
                type="number"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="150000"
                className="h-11 w-full rounded-xl border border-white/15 bg-white/5 px-3 text-sm outline-none focus:border-white/40 focus:bg-white/10"
              />
            </Field>

            <Field label="Nomor WhatsApp">
              <input
                value={wa}
                onChange={(e) => setWa(e.target.value)}
                placeholder="628xxxxxxxxx"
                className="h-11 w-full rounded-xl border border-white/15 bg-white/5 px-3 text-sm outline-none focus:border-white/40 focus:bg-white/10"
              />
            </Field>

            <Field label="Foto Produk">
              <label className="glass flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/25 p-5 text-center transition hover:bg-white/10">
                {preview ? (
                  <img src={preview} alt="preview" className="h-32 w-32 rounded-lg object-cover" />
                ) : (
                  <>
                    <ImagePlus className="h-8 w-8 text-white/70" />
                    <span className="text-xs text-muted-foreground">Klik untuk pilih gambar</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
                />
                {file && <span className="text-[10px] text-muted-foreground">{file.name}</span>}
              </label>
            </Field>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="chrome-btn mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl font-semibold transition hover:brightness-110 disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {stage === "uploading" ? "Mengupload gambar..." : "Menyimpan produk..."}
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" /> Upload Produk
              </>
            )}
          </button>
        </form>
      </div>

      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowSuccess(false)}>
          <div className="glass-strong max-w-sm rounded-2xl p-6 text-center" onClick={(e) => e.stopPropagation()}>
            <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-400" />
            <h3 className="mt-3 font-display text-xl font-semibold">Berhasil!</h3>
            <p className="mt-1 text-sm text-muted-foreground">Produk baru telah ditambahkan ke katalog.</p>
            <button onClick={() => setShowSuccess(false)} className="chrome-btn mt-5 h-10 w-full rounded-xl font-semibold">
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}
