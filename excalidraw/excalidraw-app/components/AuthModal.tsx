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
