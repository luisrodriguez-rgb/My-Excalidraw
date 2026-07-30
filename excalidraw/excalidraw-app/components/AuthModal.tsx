import React, { useState } from "react";

import { supabase } from "../data/supabaseClient";

import "./AuthModal.scss";

interface AuthModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

type AuthMode = "login" | "signup" | "forgot";

// CN-009: User-friendly error messages to avoid exposing Supabase internals
const AUTH_ERROR_MESSAGES: Record<string, string> = {
  "Invalid login credentials": "Correo o contraseña incorrectos.",
  "Email not confirmed": "Verifica tu correo antes de iniciar sesión.",
  "User already registered": "Ya existe una cuenta con este correo.",
  "Password should be at least 6 characters": "La contraseña debe tener al menos 6 caracteres.",
  "For security purposes, you can only request this once every 60 seconds":
    "Por seguridad, espera 60 segundos antes de intentarlo de nuevo.",
  "signup is disabled": "El registro está temporalmente deshabilitado.",
  "Unsupported provider: provider is not enabled":
    "El inicio de sesión con Google requiere activar el proveedor Google en el panel de Supabase Auth.",
};

const getAuthErrorMessage = (err: any): string => {
  if (err?.message?.includes("provider is not enabled") || err?.message?.includes("Unsupported provider")) {
    return "El inicio de sesión con Google aún no ha sido activado en las configuraciones de Supabase Auth.";
  }
  return AUTH_ERROR_MESSAGES[err?.message] || err?.message || "Ha ocurrido un error. Intenta de nuevo.";
};


export const AuthModal: React.FC<AuthModalProps> = ({ onClose, onSuccess }) => {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [infoMsg, setInfoMsg] = useState("");

  const resetMessages = () => {
    setErrorMsg("");
    setInfoMsg("");
  };

  const handleGoogleAuth = async () => {
    resetMessages();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setErrorMsg(getAuthErrorMessage(err));
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

    if (mode === "forgot") {
      if (!email.trim()) {
        setErrorMsg("Por favor, ingresa tu correo electrónico.");
        return;
      }
      setLoading(true);
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(
          email.trim(),
          {
            redirectTo: `${window.location.origin}/`,
          },
        );
        if (error) throw error;
        setInfoMsg(
          "Te hemos enviado un correo para restablecer tu contrasena. Revisa tu bandeja de entrada.",
        );
      } catch (err: any) {
        setErrorMsg(getAuthErrorMessage(err));
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!email.trim() || !password.trim()) {
      setErrorMsg("Por favor, rellena todos los campos.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password: password.trim(),
        });
        if (error) throw error;
        setInfoMsg(
          "¡Registro exitoso! Por favor, verifica tu correo electrónico.",
        );
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password.trim(),
        });
        if (error) throw error;
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(getAuthErrorMessage(err));

    } finally {
      setLoading(false);
    }
  };

  const titles: Record<AuthMode, string> = {
    login: "Iniciar Sesión",
    signup: "Crear una Cuenta",
    forgot: "Recuperar Contraseña",
  };

  return (
    <div className="dialog-overlay auth-overlay">
      <div className="dialog-box auth-dialog">
        <div className="auth-header">
          <h3>{titles[mode]}</h3>
          <p>
            {mode === "forgot"
              ? "Te enviaremos un enlace para restablecer tu contraseña."
              : "Únete para sincronizar tus tableros y bibliotecas en la nube."}
          </p>
        </div>

        {errorMsg && <div className="auth-alert error">{errorMsg}</div>}
        {infoMsg && <div className="auth-alert success">{infoMsg}</div>}

        <button
          type="button"
          onClick={handleGoogleAuth}
          disabled={loading}
          className="btn-google-auth"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            width: "100%",
            padding: "10px",
            borderRadius: "8px",
            border: "1px solid #cbd5e1",
            backgroundColor: "#ffffff",
            color: "#1e293b",
            fontSize: "14px",
            fontWeight: "600",
            cursor: "pointer",
            marginBottom: "16px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            transition: "all 0.2s ease",
            fontFamily: "'Outfit', 'Inter', sans-serif",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          Continuar con Google
        </button>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            margin: "12px 0 16px",
            color: "#94a3b8",
            fontSize: "12px",
            fontWeight: 500,
          }}
        >
          <div style={{ flex: 1, height: "1px", backgroundColor: "#e2e8f0" }} />
          <span style={{ padding: "0 10px" }}>o con tu correo</span>
          <div style={{ flex: 1, height: "1px", backgroundColor: "#e2e8f0" }} />
        </div>

        <form onSubmit={handleEmailAuth} className="auth-form">
          <div className="form-group">
            <label>Correo Electrónico:</label>
            <input
              type="email"
              placeholder="ejemplo@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>

          {mode !== "forgot" && (
            <div className="form-group">
              <label>Contraseña:</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          )}

          {mode === "login" && (
            <div className="auth-forgot-link">
              <button
                type="button"
                onClick={() => {
                  setMode("forgot");
                  resetMessages();
                }}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          )}

          <button
            type="submit"
            className="btn-confirm btn-auth-submit"
            disabled={loading}
          >
            {loading
              ? "Procesando..."
              : mode === "signup"
              ? "Registrarse"
              : mode === "forgot"
              ? "Enviar enlace"
              : "Entrar"}
          </button>
        </form>

        <div className="auth-footer">
          {mode === "forgot" ? (
            <p>
              ¿Recordaste tu contraseña?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  resetMessages();
                }}
              >
                Inicia sesión aquí
              </button>
            </p>
          ) : mode === "signup" ? (
            <p>
              ¿Ya tienes cuenta?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  resetMessages();
                }}
              >
                Inicia sesión aquí
              </button>
            </p>
          ) : (
            <p>
              ¿No tienes una cuenta?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  resetMessages();
                }}
              >
                Regístrate aquí
              </button>
            </p>
          )}
        </div>

        <div className="dialog-buttons" style={{ marginTop: "1.5rem" }}>
          <button
            type="button"
            className="btn-cancel"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};
