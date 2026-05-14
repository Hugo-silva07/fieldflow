"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = "http://localhost:8000";

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/api/token/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await response.json();

      if (!data.token) {
        alert("Usuário ou senha inválidos");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("username", username);

      router.push("/demands");
    } catch (err) {
      console.error(err);
      alert("Erro ao realizar login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F5F7FA]">
      <form
        onSubmit={handleLogin}
        className="w-[380px] rounded-[16px] bg-white p-8 shadow-lg"
      >
        <h1 className="mb-1 text-[28px] font-bold text-[#0F172A]">
          Login
        </h1>

        <p className="mb-6 text-[14px] text-[#64748B]">
          Entre para acessar o portal
        </p>

        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium text-[#344054]">
            Usuário
          </label>

          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="h-11 w-full rounded-[10px] border border-[#D0D5DD] px-4 outline-none"
            placeholder="Digite seu usuário"
          />
        </div>

        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-[#344054]">
            Senha
          </label>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-11 w-full rounded-[10px] border border-[#D0D5DD] px-4 outline-none"
            placeholder="Digite sua senha"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="h-11 w-full rounded-[10px] bg-[#2563EB] font-semibold text-white transition hover:bg-[#1D4ED8]"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}