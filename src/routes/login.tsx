import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Mail, Lock } from "lucide-react";
import { AuthOceanBackground } from "@/components/AuthOceanBackground";
import { GlossyButton } from "@/components/GlossyButton";
import { getProfile, saveProfile } from "@/lib/progress";
import mascot from "@/assets/Characters_1.png";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Welcome Back, Explorer! — Ocean Wonders" },
      { name: "description", content: "Sign back in to Ocean Wonders and keep exploring the five oceans of the world." },
      { property: "og:title", content: "Sign in to Ocean Wonders" },
      { property: "og:description", content: "Parent/guardian sign-in for young ocean explorers." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    const p = getProfile();
    if (p?.email) setEmail(p.email);
  }, []);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@") || password.length < 4) {
      setError("Oops! Please enter an email and password (4+ letters).");
      return;
    }
    const existing = getProfile();
    const p = existing ?? {
      parent: "Explorer",
      email,
      nickname: "Explorer",
      avatar: "turtle" as const,
    };
    saveProfile({ ...p, email });
    navigate({ to: "/globe" });
  }

  return (
    <main
      className="relative flex h-dvh items-center justify-center overflow-hidden px-4 py-4 sm:px-6"
      style={{ backgroundColor: "#0A2F7A" }}
    >
      <AuthOceanBackground fishCount={6} />

      <motion.form
        onSubmit={submit}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="relative z-10 grid w-full max-w-3xl grid-cols-[auto_1fr] items-center gap-5 rounded-3xl border-4 border-white p-5 sm:gap-8 sm:p-7"
        style={{ backgroundColor: "#FFFFFF", boxShadow: "0 24px 50px -16px rgba(0,30,80,0.45)" }}
      >
        <div className="flex flex-col items-center text-center">
          <img src={mascot} alt="" width={100} height={100} className="h-20 w-20 object-contain drop-shadow-md sm:h-28 sm:w-28" draggable={false} />
          <h1 className="mt-1 font-display text-2xl font-bold sm:text-3xl" style={{ color: "#0B3D91" }}>
            Welcome Back!
          </h1>
          <p className="mt-1 text-xs font-semibold sm:text-sm" style={{ color: "#1A8FD4" }}>
            Parent/Guardian Sign In
          </p>
        </div>

        <div className="min-w-0">
          <div className="space-y-3">
            <Field icon={<Mail strokeWidth={3} />} type="email" placeholder="Email" value={email} onChange={setEmail} />
            <Field
              icon={<Lock strokeWidth={3} />}
              type="password"
              placeholder="Password"
              value={password}
              onChange={setPassword}
            />
          </div>

          {error && (
            <p
              className="mt-3 rounded-2xl px-3 py-2 text-center text-sm font-bold"
              style={{ backgroundColor: "#FFD1CC", color: "#B34437" }}
            >
              {error}
            </p>
          )}

          <div className="mt-4 flex flex-col items-center gap-2.5 sm:mt-5">
            <GlossyButton variant="orange" size="lg" type="submit" className="max-w-none">
              Dive In!
            </GlossyButton>
            <Link
              to="/register"
              className="font-display text-sm font-bold underline decoration-2 underline-offset-4 sm:text-base"
              style={{ color: "#0B3D91" }}
            >
              New Explorer? Create an Account
            </Link>
            <button type="button" className="text-xs font-semibold sm:text-sm" style={{ color: "#1A8FD4" }}>
              Forgot Password?
            </button>
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
        className="flex-1 bg-transparent text-lg font-semibold outline-none"
        style={{ color: "#0B3D91" }}
      />
    </label>
  );
}
