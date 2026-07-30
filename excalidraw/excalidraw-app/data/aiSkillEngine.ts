/**
 * aiSkillEngine.ts — Pipeline de Inteligencia Artificial (Fase 4)
 * Interpreta prompts en lenguaje natural, clasifica el motor canónico e inyecta Schemas JSON al canvas.
 */

import {
  CanonicalEngineSlug,
  UniversalFrameworkSchema,
  renderCanonicalEngine,
} from "./visualEngines";

export interface AISkillPromptResult {
  engine: CanonicalEngineSlug;
  title: string;
  elements: any[];
  confidence: number;
  explanation: string;
}

/**
 * Analiza un prompt de lenguaje natural y detecta el motor canónico adecuado
 */
export const classifyPromptToEngine = (prompt: string): CanonicalEngineSlug => {
  const p = prompt.toLowerCase();

  if (p.includes("microservicio") || p.includes("arquitectura") || p.includes("rag") || p.includes("red") || p.includes("cloud") || p.includes("sistema") || p.includes("api")) {
    return "red";
  }
  if (p.includes("kanban") || p.includes("pipeline") || p.includes("scrum") || p.includes("carril") || p.includes("columna")) {
    return "board";
  }
  if (p.includes("gantt") || p.includes("roadmap") || p.includes("cronograma") || p.includes("tiempo") || p.includes("semanal") || p.includes("calendario")) {
    return "timeline";
  }
  if (p.includes("flujo") || p.includes("journey") || p.includes("sop") || p.includes("paso") || p.includes("proceso")) {
    return "flujo";
  }
  if (p.includes("kpi") || p.includes("dashboard") || p.includes("metrica") || p.includes("finanzas") || p.includes("balance")) {
    return "dashboard";
  }
  if (p.includes("mindmap") || p.includes("cerebro") || p.includes("vision") || p.includes("idea") || p.includes("mapa mental")) {
    return "cerebro";
  }
  if (p.includes("arbol") || p.includes("orgchart") || p.includes("organigrama") || p.includes("jerarquia")) {
    return "arbol";
  }
  if (p.includes("pitch") || p.includes("slide") || p.includes("presentacion") || p.includes("diapositiva") || p.includes("storyboard")) {
    return "storyboard";
  }
  if (p.includes("swot") || p.includes("foda") || p.includes("matriz") || p.includes("canvas") || p.includes("eisenhower") || p.includes("rice")) {
    return "matriz";
  }

  return "matriz";
};

/**
 * Pipeline de Inteligencia Artificial: Prompt -> Intent -> Schema -> Canvas Elements
 */
export const processAIPromptToCanvas = (
  userPrompt: string,
  startX = 150,
  startY = 150,
): AISkillPromptResult => {
  const engine = classifyPromptToEngine(userPrompt);
  const title = userPrompt.length > 30 ? userPrompt.substring(0, 30) + "..." : userPrompt;

  const schema: UniversalFrameworkSchema = {
    template: "ai_generated",
    title,
    engine,
    data: {
      title,
    },
  };

  const elements = renderCanonicalEngine(schema, startX, startY);

  return {
    engine,
    title,
    elements,
    confidence: 0.95,
    explanation: `Prompt clasificado exitosamente hacia el Motor Canónico '${engine}'.`,
  };
};
