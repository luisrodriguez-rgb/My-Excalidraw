import React, { useState } from "react";

import { supabase } from "../data/supabaseClient";

import "./AuthModal.scss";

interface AuthModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, onSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [infoMsg, setInfoMsg] = useState("");

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMsg("Por favor, rellena todos los campos.");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setInfoMsg("");

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password: password.trim(),
        });
        if (error) {
          throw error;
        }
        setInfoMsg(
          "¡Registro exitoso! Por favor, verifica tu correo electrónico.",
        );
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password.trim(),
        });
        if (error) {
          throw error;
        }
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Ha ocurrido un error en la autenticación.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) {
        throw error;
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Error al conectar con Google.");
      setLoading(false);
    }
  };

  return (
    <div className="dialog-overlay auth-overlay">
      <div className="dialog-box auth-dialog">
        <div className="auth-header">
          <h3>{isSignUp ? "Crear una Cuenta" : "Iniciar Sesión"}</h3>
          <p>Únete para sincronizar tus tableros y bibliotecas en la nube.</p>
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

          <button
            type="submit"
            className="btn-confirm btn-auth-submit"
            disabled={loading}
          >
            {loading ? "Procesando..." : isSignUp ? "Registrarse" : "Entrar"}
          </button>
        </form>

        <div className="auth-divider">
          <span>O CONTINUAR CON</span>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          className="btn-google-login"
          disabled={loading}
        >
          <svg
            viewBox="0 0 24 24"
            width="18"
            height="18"
            style={{ marginRight: "10px" }}
          >
            <path
              fill="#EA4335"
              d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.578-7.859-8s3.53-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l3.227-3.107C18.29 1.95 15.538 1 12.24 1 5.922 1 1 5.922 1 12s4.922 11 11.24 11c6.592 0 11.002-4.638 11.002-11.2 0-.756-.08-1.333-.18-1.8H12.24z"
            />
          </svg>
          Google
        </button>

        <div className="auth-footer">
          {isSignUp ? (
            <p>
              ¿Ya tienes cuenta?{" "}
              <button type="button" onClick={() => setIsSignUp(false)}>
                Inicia sesión aquí
              </button>
            </p>
          ) : (
            <p>
              ¿No tienes una cuenta?{" "}
              <button type="button" onClick={() => setIsSignUp(true)}>
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
