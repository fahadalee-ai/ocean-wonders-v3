import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import { User, Mail, Lock, Sparkles } from "lucide-react";
import { AuthOceanBackground } from "@/components/AuthOceanBackground";
import { GlossyButton } from "@/components/GlossyButton";
import { saveProfile, type AvatarId } from "@/lib/progress";
import { AVATARS } from "@/lib/avatars";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Join the Adventure! — Ocean Wonders" },
      { name: "description", content: "Create your Ocean Wonders account and pick your explorer avatar." },
      { property: "og:title", content: "Join Ocean Wonders" },
      { property: "og:description", content: "Set up your explorer and start diving in." },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const [parent, setParent] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [nickname, setNickname] = useState("");
  const [avatar, setAvatar] = useState<AvatarId>("turtle");
  const [error, setError] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!parent.trim()) return setError("Please enter a parent/guardian name.");
    if (!email.includes("@")) return setError("Please enter a valid email.");
    if (password.length < 4) return setError("Password should be at least 4 letters.");
    if (password !== confirm) return setError("Oops! Passwords don't match — try again!");
    setError("");
    saveProfile({
      parent: parent.trim(),
      email: email.trim(),
      nickname: nickname.trim() || "Explorer",
      avatar,
    });
    navigate({ to: "/globe" });
  }

  return (
    <main
      className="relative flex h-dvh items-center justify-center overflow-hidden px-3 py-3 sm:px-5"
      style={{ backgroundColor: "#0A2F7A" }}
    >
      <AuthOceanBackground fishCount={6} />

      <motion.form
        onSubmit={submit}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="relative z-10 grid max-h-[min(96dvh,720px)] w-full max-w-4xl grid-cols-1 gap-4 overflow-y-auto rounded-3xl border-4 border-white p-4 sm:grid-cols-2 sm:gap-6 sm:p-6"
        style={{ backgroundColor: "#FFFFFF", boxShadow: "0 24px 50px -16px rgba(0,30,80,0.45)" }}
      >
        <div className="min-w-0">
          <h1 className="text-center font-display text-2xl font-bold sm:text-left sm:text-3xl" style={{ color: "#0B3D91" }}>
            Join the Adventure!
          </h1>
          <div className="mt-3 space-y-2.5">
            <Field icon={<User strokeWidth={3} />} type="text" placeholder="Parent / Guardian Name" value={parent} onChange={setParent} />
            <Field icon={<Mail strokeWidth={3} />} type="email" placeholder="Email" value={email} onChange={setEmail} />
            <Field icon={<Lock strokeWidth={3} />} type="password" placeholder="Password" value={password} onChange={setPassword} />
            <Field icon={<Lock strokeWidth={3} />} type="password" placeholder="Confirm Password" value={confirm} onChange={setConfirm} />
            <Field icon={<Sparkles strokeWidth={3} />} type="text" placeholder="Child's Nickname (optional)" value={nickname} onChange={setNickname} />
          </div>
        </div>

        <div className="flex min-w-0 flex-col justify-between">
          <div>
            <p className="mb-2 text-center font-display text-base font-bold sm:text-lg" style={{ color: "#0B3D91" }}>
              Pick your Explorer!
            </p>
            <div className="grid grid-cols-6 gap-2">
              {AVATARS.map((a) => {
                const selected = avatar === a.id;
                return (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => setAvatar(a.id)}
                    className="aspect-square rounded-full border-[3px] p-1 transition-transform active:scale-95"
                    style={{
                      backgroundColor: selected ? "#FFB347" : "#F0F9FF",
                      borderColor: selected ? "#E85A1A" : "#2EB8F0",
                      boxShadow: selected ? "0 4px 0 #C44A10" : "0 3px 0 rgba(11,61,145,0.12)",
                    }}
                    aria-label={a.label}
                    aria-pressed={selected}
                  >
                    <img src={a.src} alt={a.label} className="h-full w-full object-contain" draggable={false} />
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <p
              className="mt-3 rounded-2xl px-3 py-2 text-center text-sm font-bold"
              style={{ backgroundColor: "#FFD1CC", color: "#B34437" }}
            >
              {error}
            </p>
          )}

          <div className="mt-4 flex flex-col items-center gap-2.5">
            <GlossyButton variant="orange" size="lg" type="submit" className="max-w-none">
              Create My Account!
            </GlossyButton>
            <Link
              to="/login"
              className="font-display text-sm font-bold underline decoration-2 underline-offset-4 sm:text-base"
              style={{ color: "#0B3D91" }}
            >
              Already an Explorer? Sign In.
            </Link>
          </div>
        </div>
      </motion.form>
    </main>
  );
}

function Field({
  icon,
  type,
  placeholder,
  value,
  onChange,
}: {
  icon: React.ReactNode;
  type: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label
      className="flex items-center gap-3 rounded-full border-[3px] px-4 py-3"
      style={{ backgroundColor: "#F0F9FF", borderColor: "#2EB8F0" }}
    >
      <span style={{ color: "#1A8FD4" }}>{icon}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-transparent text-base font-semibold outline-none"
        style={{ color: "#0B3D91" }}
      />
    </label>
  );
}
