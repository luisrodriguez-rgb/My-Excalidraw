import React, { useState } from "react";

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  topic?: string;
}

interface StudyModeProps {
  isOpen: boolean;
  onClose: () => void;
  cards?: Flashcard[];
}

const DEFAULT_CARDS: Flashcard[] = [
  {
    id: "1",
    topic: "Arquitectura Web",
    question: "¿Qué ventaja principal ofrece renderizar elementos dentro del canvas?",
    answer: "Permite conectar ideas, realizar anotaciones directas, hacer zoom infinito y vincular diagramas sin cambiar entre aplicaciones.",
  },
  {
    id: "2",
    topic: "Optimización de PDF",
    question: "¿Por qué se utiliza compresión JPEG al 75% en las páginas de PDF?",
    answer: "Reduce el tamaño de cada página en más de un 90% (~70KB), manteniendo una nitidez de lectura clara e impidiendo la sobrecarga de memoria del navegador.",
  },
  {
    id: "3",
    topic: "Seguridad y Roles",
    question: "¿Cómo funciona el bloqueo de edición por URL?",
    answer: "Al abrir enlaces con el parámetro ?role=viewer o ?role=commenter, la aplicación activa viewModeEnabled = true impidiendo alterations involuntarias en el canvas.",
  },
];

export const StudyMode: React.FC<StudyModeProps> = ({
  isOpen,
  onClose,
  cards = DEFAULT_CARDS,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [completedIds, setCompletedIds] = useState<string[]>([]);

  if (!isOpen) return null;

  const currentCard = cards[currentIndex] || cards[0];
  const progressPercent = Math.round((completedIds.length / cards.length) * 100);

  const handleNext = (mastered = false) => {
    if (mastered && !completedIds.includes(currentCard.id)) {
      setCompletedIds((prev) => [...prev, currentCard.id]);
    }
    setIsFlipped(false);
    if (currentIndex < cards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.75)",
        backdropFilter: "blur(6px)",
        zIndex: 9999999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Outfit', 'Inter', sans-serif",
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "20px",
          width: "100%",
          maxWidth: "560px",
          padding: "28px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          border: "1px solid #e2e8f0",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "#fef2f2", color: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
              </svg>
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: "17px", fontWeight: 700, color: "#0f172a" }}>Modo Estudio</h3>
              <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>Tarjetas de repaso interactivo para memorización activa</p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", fontSize: "18px", cursor: "pointer", color: "#94a3b8" }}
          >
            ✕
          </button>
        </div>

        {/* Progress Bar */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: 600, color: "#64748b" }}>
            <span>Tarjeta {currentIndex + 1} de {cards.length}</span>
            <span>{progressPercent}% Dominado</span>
          </div>
          <div style={{ width: "100%", height: "6px", backgroundColor: "#f1f5f9", borderRadius: "3px", overflow: "hidden" }}>
            <div style={{ width: `${progressPercent}%`, height: "100%", backgroundColor: "#ef4444", transition: "width 0.3s ease" }} />
          </div>
        </div>

        {/* Flashcard Box */}
        <div
          onClick={() => setIsFlipped(!isFlipped)}
          style={{
            minHeight: "220px",
            borderRadius: "16px",
            border: "2px solid #e2e8f0",
            backgroundColor: isFlipped ? "#fff1f2" : "#f8fafc",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            cursor: "pointer",
            transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.03)",
            position: "relative",
          }}
        >
          {currentCard.topic && (
            <span style={{ position: "absolute", top: "14px", left: "16px", fontSize: "11px", fontWeight: 700, color: "#ef4444", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              {currentCard.topic}
            </span>
          )}
          <span style={{ position: "absolute", top: "14px", right: "16px", fontSize: "11px", fontWeight: 600, color: "#94a3b8" }}>
            {isFlipped ? "Respuesta" : "Pregunta (Haz clic para voltear)"}
          </span>

          <p style={{ fontSize: "16px", fontWeight: isFlipped ? 500 : 700, color: isFlipped ? "#991b1b" : "#0f172a", margin: 0, lineHeight: 1.5 }}>
            {isFlipped ? currentCard.answer : currentCard.question}
          </p>
        </div>

        {/* Footer Actions */}
        <div style={{ display: "flex", gap: "12px", justifyContent: "space-between", marginTop: "4px" }}>
          <button
            onClick={() => handleNext(false)}
            style={{
              flex: 1,
              padding: "11px",
              borderRadius: "10px",
              border: "1px solid #cbd5e1",
              backgroundColor: "#ffffff",
              fontSize: "13px",
              fontWeight: 600,
              color: "#475569",
              cursor: "pointer",
            }}
          >
            Revisar Luego
          </button>
          <button
            onClick={() => handleNext(true)}
            style={{
              flex: 1,
              padding: "11px",
              borderRadius: "10px",
              border: "none",
              backgroundColor: "#ef4444",
              color: "#ffffff",
              fontSize: "13px",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(239, 68, 68, 0.25)",
            }}
          >
            Dominado
          </button>
        </div>
      </div>
    </div>
  );
};
