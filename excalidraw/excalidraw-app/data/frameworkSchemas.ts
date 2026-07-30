/**
 * frameworkSchemas.ts — Catálogo Completo de Schemas JSON Universales (Fase 3 & 4)
 * Mapea los 230+ frameworks de trabajo divididos en 25 categorías de negocio
 * directamente hacia los 9 Motores Visuales Canónicos (DSL).
 */

import {
  UniversalFrameworkSchema,
  CanonicalEngineSlug,
  renderCanonicalEngine,
} from "./visualEngines";

// Mapeo automático de los códigos de motor (A, C, F, G, I, J, K, L, M) a los slugs canónicos
const mapCodeToEngine = (code: string): CanonicalEngineSlug => {
  switch (code) {
    case "A":
    case "H":
      return "cerebro";
    case "C":
      return "flujo";
    case "F":
      return "red";
    case "G":
    case "D":
      return "matriz";
    case "I":
      return "arbol";
    case "J":
      return "timeline";
    case "K":
    case "E":
      return "board";
    case "L":
    case "B":
      return "dashboard";
    case "M":
      return "storyboard";
    default:
      return "matriz";
  }
};

const RAW_FRAMEWORKS_DATA: { name: string; engineCode: string; level: string; category: string }[] = [
  // ESTRATEGIA
  { name: "Vision to Action", engineCode: "A", level: "A", category: "Estrategia" },
  { name: "Goal Planning", engineCode: "J", level: "B", category: "Estrategia" },
  { name: "OKR Planner", engineCode: "I", level: "I", category: "Estrategia" },
  { name: "SMART Goals", engineCode: "G", level: "B", category: "Estrategia" },
  { name: "Annual Planning", engineCode: "J", level: "I", category: "Estrategia" },
  { name: "Quarterly Planning", engineCode: "J", level: "I", category: "Estrategia" },
  { name: "Personal Growth Roadmap", engineCode: "J", level: "I", category: "Estrategia" },
  { name: "Career Planning Canvas", engineCode: "G", level: "I", category: "Estrategia" },
  { name: "Decision Matrix", engineCode: "G", level: "B", category: "Estrategia" },
  { name: "Priority Matrix Eisenhower", engineCode: "G", level: "B", category: "Estrategia" },

  // PRODUCTIVIDAD
  { name: "Weekly Planner", engineCode: "J", level: "B", category: "Productividad" },
  { name: "Daily Planner", engineCode: "J", level: "B", category: "Productividad" },
  { name: "Time Blocking", engineCode: "J", level: "B", category: "Productividad" },
  { name: "Habit Tracker", engineCode: "H", level: "B", category: "Productividad" },
  { name: "Focus Planner", engineCode: "J", level: "B", category: "Productividad" },
  { name: "Meeting Notes", engineCode: "M", level: "B", category: "Productividad" },
  { name: "Team Action Tracker", engineCode: "K", level: "B", category: "Productividad" },
  { name: "Action Item Tracker", engineCode: "K", level: "B", category: "Productividad" },
  { name: "Accountability Board", engineCode: "K", level: "I", category: "Productividad" },
  { name: "Productivity Dashboard", engineCode: "L", level: "I", category: "Productividad" },

  // PRODUCT MANAGEMENT
  { name: "Product Roadmap", engineCode: "J", level: "I", category: "Product Management" },
  { name: "Product Vision Board", engineCode: "A", level: "I", category: "Product Management" },
  { name: "User Story Map", engineCode: "I", level: "A", category: "Product Management" },
  { name: "Sprint Planning", engineCode: "K", level: "I", category: "Product Management" },
  { name: "Sprint Retrospective", engineCode: "K", level: "B", category: "Product Management" },
  { name: "Release Planning", engineCode: "J", level: "I", category: "Product Management" },
  { name: "Feature Prioritization Matrix", engineCode: "G", level: "B", category: "Product Management" },
  { name: "RICE", engineCode: "G", level: "B", category: "Product Management" },
  { name: "MoSCoW", engineCode: "G", level: "B", category: "Product Management" },
  { name: "Opportunity Solution Tree", engineCode: "I", level: "A", category: "Product Management" },

  // UX/UI
  { name: "User Journey Map", engineCode: "C", level: "I", category: "UX/UI" },
  { name: "Customer Journey Map", engineCode: "C", level: "I", category: "UX/UI" },
  { name: "Empathy Map", engineCode: "G", level: "B", category: "UX/UI" },
  { name: "Persona Builder", engineCode: "A", level: "B", category: "UX/UI" },
  { name: "User Flow", engineCode: "C", level: "I", category: "UX/UI" },
  { name: "Wireframe Board", engineCode: "M", level: "I", category: "UX/UI" },
  { name: "Design Critique Board", engineCode: "K", level: "B", category: "UX/UI" },
  { name: "UX Research Board", engineCode: "K", level: "I", category: "UX/UI" },
  { name: "Heuristic Evaluation", engineCode: "G", level: "I", category: "UX/UI" },
  { name: "Accessibility Review", engineCode: "G", level: "B", category: "UX/UI" },

  // NEGOCIOS
  { name: "Lean Canvas", engineCode: "G", level: "A", category: "Negocios" },
  { name: "Business Model Canvas", engineCode: "G", level: "A", category: "Negocios" },
  { name: "SWOT Analysis", engineCode: "G", level: "B", category: "Negocios" },
  { name: "SIPOC", engineCode: "K", level: "I", category: "Negocios" },
  { name: "Value Stream Mapping", engineCode: "C", level: "A", category: "Negocios" },
  { name: "Process Mapping", engineCode: "C", level: "I", category: "Negocios" },
  { name: "Stakeholder Analysis", engineCode: "G", level: "I", category: "Negocios" },
  { name: "Competitor Analysis", engineCode: "K", level: "I", category: "Negocios" },
  { name: "Strategic Planning Board", engineCode: "A", level: "A", category: "Negocios" },
  { name: "Growth Strategy Canvas", engineCode: "G", level: "A", category: "Negocios" },

  // MARKETING
  { name: "Marketing Plan", engineCode: "K", level: "A", category: "Marketing" },
  { name: "Campaign Planner", engineCode: "J", level: "I", category: "Marketing" },
  { name: "Content Calendar", engineCode: "J", level: "B", category: "Marketing" },
  { name: "Social Media Planner", engineCode: "J", level: "B", category: "Marketing" },
  { name: "Brand Strategy Canvas", engineCode: "G", level: "A", category: "Marketing" },
  { name: "Customer Acquisition Funnel", engineCode: "C", level: "I", category: "Marketing" },
  { name: "Growth Experiment Board", engineCode: "K", level: "I", category: "Marketing" },
  { name: "Launch Plan", engineCode: "J", level: "I", category: "Marketing" },
  { name: "Email Campaign Planner", engineCode: "C", level: "B", category: "Marketing" },
  { name: "Marketing KPI Dashboard", engineCode: "L", level: "I", category: "Marketing" },

  // VENTAS
  { name: "Sales Pipeline", engineCode: "K", level: "I", category: "Ventas" },
  { name: "CRM Board", engineCode: "K", level: "I", category: "Ventas" },
  { name: "Lead Qualification", engineCode: "G", level: "B", category: "Ventas" },
  { name: "Discovery Call Framework", engineCode: "A", level: "I", category: "Ventas" },
  { name: "Sales Process Map", engineCode: "C", level: "I", category: "Ventas" },
  { name: "Deal Review Board", engineCode: "K", level: "B", category: "Ventas" },
  { name: "Account Planning", engineCode: "A", level: "I", category: "Ventas" },
  { name: "Customer Success Journey", engineCode: "A", level: "I", category: "Ventas" },
  { name: "Upsell Strategy Canvas", engineCode: "G", level: "I", category: "Ventas" },
  { name: "Revenue Planning", engineCode: "J", level: "I", category: "Ventas" },

  // STARTUPS
  { name: "Startup Operating System", engineCode: "A", level: "A", category: "Startups" },
  { name: "MVP Planning", engineCode: "G", level: "I", category: "Startups" },
  { name: "Product Validation", engineCode: "G", level: "I", category: "Startups" },
  { name: "Problem-Solution Fit", engineCode: "G", level: "B", category: "Startups" },
  { name: "Product-Market Fit", engineCode: "G", level: "I", category: "Startups" },
  { name: "Startup Roadmap", engineCode: "J", level: "I", category: "Startups" },
  { name: "Investor Pitch Planning", engineCode: "M", level: "A", category: "Startups" },
  { name: "Fundraising Tracker", engineCode: "K", level: "B", category: "Startups" },
  { name: "Growth Roadmap", engineCode: "J", level: "I", category: "Startups" },
  { name: "Go-To-Market Plan", engineCode: "K", level: "A", category: "Startups" },

  // INGENIERÍA
  { name: "System Design", engineCode: "F", level: "A", category: "Ingeniería" },
  { name: "Software Architecture", engineCode: "F", level: "A", category: "Ingeniería" },
  { name: "API Architecture", engineCode: "F", level: "I", category: "Ingeniería" },
  { name: "Event Driven Architecture", engineCode: "F", level: "A", category: "Ingeniería" },
  { name: "Microservices Architecture", engineCode: "F", level: "A", category: "Ingeniería" },
  { name: "Database Design", engineCode: "F", level: "I", category: "Ingeniería" },
  { name: "Infrastructure Diagram", engineCode: "F", level: "I", category: "Ingeniería" },
  { name: "Cloud Architecture", engineCode: "F", level: "A", category: "Ingeniería" },
  { name: "DevOps Pipeline", engineCode: "C", level: "I", category: "Ingeniería" },
  { name: "Incident Response Plan", engineCode: "C", level: "I", category: "Ingeniería" },

  // INTELIGENCIA ARTIFICIAL
  { name: "AI Project Canvas", engineCode: "G", level: "I", category: "IA" },
  { name: "AI Agent Architecture", engineCode: "F", level: "A", category: "IA" },
  { name: "Multi-Agent System", engineCode: "F", level: "A", category: "IA" },
  { name: "RAG Architecture", engineCode: "F", level: "A", category: "IA" },
  { name: "Prompt Engineering Framework", engineCode: "I", level: "B", category: "IA" },
  { name: "AI Workflow Design", engineCode: "C", level: "I", category: "IA" },
  { name: "AI Product Strategy", engineCode: "A", level: "A", category: "IA" },
  { name: "LLM Evaluation Framework", engineCode: "G", level: "I", category: "IA" },
  { name: "AI Automation Planner", engineCode: "C", level: "I", category: "IA" },
  { name: "AI Implementation Roadmap", engineCode: "J", level: "I", category: "IA" },

  // GASTRONOMÍA, SALUD, LEGAL, EVENTOS Y FREELANCERS
  { name: "Menu Engineering Canvas", engineCode: "G", level: "I", category: "Gastronomía" },
  { name: "Restaurant Onboarding Checklist", engineCode: "C", level: "B", category: "Gastronomía" },
  { name: "Reservation Flow Map", engineCode: "C", level: "I", category: "Gastronomía" },
  { name: "Guest Journey Map", engineCode: "C", level: "I", category: "Gastronomía" },
  { name: "Patient Journey Map", engineCode: "C", level: "I", category: "Salud" },
  { name: "Clinical Workflow", engineCode: "C", level: "I", category: "Salud" },
  { name: "Litigation Timeline", engineCode: "J", level: "I", category: "Legal" },
  { name: "Event Planning Timeline", engineCode: "J", level: "I", category: "Eventos" },
  { name: "Client Onboarding Framework", engineCode: "A", level: "I", category: "Freelancers" },
];

export const FRAMEWORK_CATALOG: UniversalFrameworkSchema[] = RAW_FRAMEWORKS_DATA.map((item) => ({
  template: item.name.toLowerCase().replace(/[^a-z0-9]/g, "_"),
  title: item.name,
  engine: mapCodeToEngine(item.engineCode),
  industry: item.category,
  difficulty: item.level === "A" ? "advanced" : item.level === "I" ? "intermediate" : "basic",
}));

/**
 * Busca un schema por nombre o ID de plantilla
 */
export const getFrameworkSchemaByName = (nameOrId: string): UniversalFrameworkSchema | undefined => {
  const normalized = nameOrId.toLowerCase().trim();
  return FRAMEWORK_CATALOG.find(
    (item) =>
      item.template.toLowerCase() === normalized ||
      item.title.toLowerCase() === normalized ||
      item.template.includes(normalized) ||
      normalized.includes(item.template),
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
