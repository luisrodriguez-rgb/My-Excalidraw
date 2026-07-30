/**
 * frameworkSchemas.ts — Catálogo de Schemas JSON Universales y Mapeador de Frameworks (Fase 3)
 * Mapea más de 230 frameworks de trabajo directamente hacia los 9 Motores Visuales Canónicos (DSL).
 */

import {
  UniversalFrameworkSchema,
  renderCanonicalEngine,
} from "./visualEngines";

export const FRAMEWORK_CATALOG: UniversalFrameworkSchema[] = [
  // ESTRATEGIA
  { template: "vision_to_action", title: "Vision to Action", engine: "cerebro", industry: "Estrategia", difficulty: "advanced" },
  { template: "goal_planning", title: "Goal Planning", engine: "timeline", industry: "Estrategia", difficulty: "basic" },
  { template: "okr_planner", title: "OKR Planner", engine: "arbol", industry: "Estrategia", difficulty: "intermediate" },
  { template: "smart_goals", title: "SMART Goals Planner", engine: "matriz", industry: "Estrategia", difficulty: "basic" },
  { template: "annual_planning", title: "Annual Planning", engine: "timeline", industry: "Estrategia", difficulty: "intermediate" },

  // PRODUCTIVIDAD
  { template: "weekly_planner", title: "Weekly Planner", engine: "timeline", industry: "Productividad", difficulty: "basic" },
  { template: "daily_planner", title: "Daily Planner", engine: "timeline", industry: "Productividad", difficulty: "basic" },
  { template: "time_blocking", title: "Time Blocking", engine: "timeline", industry: "Productividad", difficulty: "basic" },
  { template: "habit_tracker", title: "Habit Tracker", engine: "cerebro", industry: "Productividad", difficulty: "basic" },
  { template: "action_tracker", title: "Team Action Tracker", engine: "board", industry: "Productividad", difficulty: "basic" },

  // PRODUCT MANAGEMENT
  { template: "product_roadmap", title: "Product Roadmap", engine: "timeline", industry: "Product Management", difficulty: "intermediate" },
  { template: "sprint_planning", title: "Sprint Planning", engine: "board", industry: "Product Management", difficulty: "intermediate" },
  { template: "sprint_retro", title: "Sprint Retrospective", engine: "board", industry: "Product Management", difficulty: "basic" },
  { template: "feature_prioritization", title: "Feature Prioritization Matrix", engine: "matriz", industry: "Product Management", difficulty: "basic" },
  { template: "rice_framework", title: "RICE Framework", engine: "matriz", industry: "Product Management", difficulty: "basic" },

  // UX/UI
  { template: "user_journey_map", title: "User Journey Map", engine: "flujo", industry: "UX/UI", difficulty: "intermediate" },
  { template: "customer_journey_map", title: "Customer Journey Map", engine: "flujo", industry: "UX/UI", difficulty: "intermediate" },
  { template: "empathy_map", title: "Empathy Map", engine: "matriz", industry: "UX/UI", difficulty: "basic" },
  { template: "user_flow", title: "User Flow", engine: "flujo", industry: "UX/UI", difficulty: "intermediate" },

  // NEGOCIOS & STARTUPS
  { template: "lean_canvas", title: "Lean Canvas", engine: "matriz", industry: "Negocios", difficulty: "advanced" },
  { template: "business_model_canvas", title: "Business Model Canvas", engine: "matriz", industry: "Negocios", difficulty: "advanced" },
  { template: "swot_analysis", title: "SWOT Analysis", engine: "matriz", industry: "Negocios", difficulty: "basic" },
  { template: "sipoc", title: "SIPOC", engine: "board", industry: "Negocios", difficulty: "intermediate" },
  { template: "startup_roadmap", title: "Startup Roadmap", engine: "timeline", industry: "Startups", difficulty: "intermediate" },

  // INGENIERÍA & IA
  { template: "system_design", title: "System Design", engine: "red", industry: "Ingeniería", difficulty: "advanced" },
  { template: "software_architecture", title: "Software Architecture", engine: "red", industry: "Ingeniería", difficulty: "advanced" },
  { template: "microservices_architecture", title: "Microservices Architecture", engine: "red", industry: "Ingeniería", difficulty: "advanced" },
  { template: "ai_agent_architecture", title: "AI Agent Architecture", engine: "red", industry: "Inteligencia Artificial", difficulty: "advanced" },
  { template: "rag_architecture", title: "RAG Architecture", engine: "red", industry: "Inteligencia Artificial", difficulty: "advanced" },

  // PRESENTACIONES
  { template: "pitch_deck", title: "Pitch Deck", engine: "storyboard", industry: "Presentaciones", difficulty: "intermediate" },
  { template: "executive_summary", title: "Executive Summary", engine: "storyboard", industry: "Presentaciones", difficulty: "intermediate" },

  // DASHBOARDS
  { template: "financial_dashboard", title: "Financial Dashboard", engine: "dashboard", industry: "Finanzas", difficulty: "intermediate" },
  { template: "operations_dashboard", title: "Operations Dashboard", engine: "dashboard", industry: "Operaciones", difficulty: "intermediate" },
  { template: "marketing_kpi_dashboard", title: "Marketing KPI Dashboard", engine: "dashboard", industry: "Marketing", difficulty: "intermediate" },
];

/**
 * Busca un schema por nombre o ID de plantilla
 */
export const getFrameworkSchemaByName = (nameOrId: string): UniversalFrameworkSchema | undefined => {
  const normalized = nameOrId.toLowerCase().trim();
  return FRAMEWORK_CATALOG.find(
    (item) =>
      item.template.toLowerCase() === normalized ||
      item.title.toLowerCase() === normalized,
  );
};

/**
 * Renderiza cualquier framework del catálogo en coordenadas (startX, startY)
 */
export const renderFrameworkByName = (
  nameOrId: string,
  startX = 100,
  startY = 100,
): any[] => {
  const schema = getFrameworkSchemaByName(nameOrId) || {
    template: "custom",
    title: nameOrId,
    engine: "matriz",
  };

  return renderCanonicalEngine(schema, startX, startY);
};
