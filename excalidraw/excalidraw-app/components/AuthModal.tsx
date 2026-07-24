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
  "Invalid login credentials": "Correo o contrasena incorrectos.",
  "Email not confirmed": "Verifica tu correo antes de iniciar sesion.",
  "User already registered": "Ya existe una cuenta con este correo.",
  "Password should be at least 6 characters": "La contrasena debe tener al menos 6 caracteres.",
  "For security purposes, you can only request this once every 60 seconds":
    "Por seguridad, espera 60 segundos antes de intentarlo de nuevo.",
  "signup is disabled": "El registro esta temporalmente deshabilitado.",
};

const getAuthErrorMessage = (err: any): string =>
  AUTH_ERROR_MESSAGES[err?.message] || "Ha ocurrido un error. Intenta de nuevo.";


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
