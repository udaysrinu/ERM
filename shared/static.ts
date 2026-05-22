/*
 * Shared static data for the backend engines + UI.
 * GENERATED FROM ERM Navigator - 100 Qs.xlsx via scripts/import-xlsx.cjs.
 * DO NOT edit by hand — re-run the importer after spec updates.
 *
 * Captures: 100 questions with 5-level rubric, per-pillar + per-dimension
 * standards-alignment provenance, the canonical 5-level maturity model,
 * benchmark profiles, roadmap action templates, business unit catalog.
 */

export const PROVENANCE = `The Proprietary ERM Navigator was created to give the the organization a unified, in‑house platform for measuring, comparing, and advancing risk‑management maturity across the entire organizational ecosystem—including joint ventures and subsidiaries. As the company expands its operational footprint and navigates a more complex risk landscape, the need for a consistent, standards‑aligned assessment framework has become essential.

The Navigator provides that foundation. It translates the principles of leading global frameworks—such as ISO 31000, COSO ERM, NIST risk guidelines, and the maturity models used by international utilities—into a single, coherent measurement system tailored to the organization’s operating reality. By doing so, it eliminates fragmentation, ensures comparability, and creates a common language for risk capability across all business units.`;

export const PILLAR_WEIGHTS: Record<string, number> = {
  lead: 0.2, strat: 0.15, scope: 0.1, ident: 0.1, assess: 0.2,
  treat: 0.1, monitor: 0.05, report: 0.05, culture: 0.03, improve: 0.02,
};

export const PILLAR_IDS = Object.keys(PILLAR_WEIGHTS);

export const PILLAR_NAMES: Record<string, string> = {
  lead: 'Leadership & Governance',
  strat: 'Strategy & Integration',
  scope: 'Scope, Context & Criteria',
  ident: 'Risk Identification',
  assess: 'Risk Assessment',
  treat: 'Risk Treatment',
  monitor: 'Monitoring & Review',
  report: 'Recording & Reporting',
  culture: 'Risk Culture',
  improve: 'Continuous Improvement & Resilience',
};

export interface PillarProvenance { weight: number; standards: string; rationale: string; }
export const PILLAR_PROVENANCE: Record<string, PillarProvenance> = {
  lead: {
    weight: 0.2,
    standards: `ISO 31000 (Leadership & Commitment), COSO ERM (Governance & Culture), RIMS RMM (Leadership), OECD Governance Principles`,
    rationale: `The 10 questions emphasize policy approval, roles, leadership sponsorship, Board oversight, appetite approval, escalation discipline, accountability, and decision‑ready reporting. These are foundational drivers of ERM maturity, justifying the highest strategic weight.`,
  },
  strat: {
    weight: 0.15,
    standards: `COSO ERM (Strategy & Objective‑Setting), ISO 31000 (Integration), McKinsey/BCG ERM Integration Models, NIST RMF (Prepare)`,
    rationale: `The questions cover integration into planning, budgeting, investments, procurement, cross‑functional reviews, emerging risk analysis, and portfolio management. This domain operationalizes ERM across the enterprise, warranting a high weight.`,
  },
  scope: {
    weight: 0.1,
    standards: `ISO 31000 (Scope, Context, Criteria), COSO ERM (Risk Appetite), NIST Scoping Guidance, KPMG Criteria Benchmarks`,
    rationale: `The 10 questions define context, appetite, tolerance, criteria (likelihood, impact, velocity, contagion, persistence), ESG/cyber criteria, and regulatory alignment. This domain sets the foundation for consistent assessment, deserving a solid but enabling weight.`,
  },
  ident: {
    weight: 0.1,
    standards: `ISO 31000 (Risk Identification), NIST CSF (Identify), EY Emerging Risk Practices`,
    rationale: `The questions cover structured identification, enterprise coverage, emerging risks, third‑party risks, interdependencies, lessons learned, ESG, cyber, and stakeholder‑driven risks. This is a core ERM activity but not the analytical center, so 10% is appropriate.`,
  },
  assess: {
    weight: 0.2,
    standards: `ISO 31000 (Risk Analysis & Evaluation), COSO ERM (Performance), NIST RMF (Assess), EY Quantitative Methods`,
    rationale: `The 10 questions include standardized scoring, qualitative/quantitative methods, scenarios, systemic risks, assumptions, consistency, data validation, model governance, update triggers, and prioritization. This is the analytical engine of ERM, justifying the highest operational weight.`,
  },
  treat: {
    weight: 0.1,
    standards: `ISO 31000 (Treatment), NIST RMF (Respond), Bain Mitigation Models`,
    rationale: `The questions cover treatment planning, cost‑effectiveness, control design/testing, residual risk approval, KRI linkage, financing options, monitoring‑based updates, ownership, contingency planning, and timeline tracking. Treatment is essential but follows assessment, so 10% is correct.`,
  },
  monitor: {
    weight: 0.05,
    standards: `ISO 31000 (Monitoring & Review), COSO ERM (Review & Revision), Deloitte Continuous Monitoring`,
    rationale: `The questions include KRIs, dashboards, early‑warning indicators, escalation, leadership review, control testing, automation, performance integration, process reviews, and systemic indicators. Monitoring is critical but supportive, so 5% is globally consistent.`,
  },
  report: {
    weight: 0.05,
    standards: `ISO 31000 (Recording & Reporting), COSO Internal Control Reporting, PwC Documentation Standards`,
    rationale: `The questions cover record consistency, standardized reporting, audit‑readiness, digital tools, timelines, dashboard access, quality reviews, communication clarity, regulatory compliance, and template updates. Reporting is essential for governance but not a primary driver, so 5% fits.`,
  },
  culture: {
    weight: 0.03,
    standards: `RIMS RMM (Culture), McKinsey Culture Diagnostics, GRC Culture Frameworks`,
    rationale: `The questions cover awareness, escalation, incentives, leadership modeling, surveys, training, performance linkage, communication trust, enforcement, and psychological safety. Culture is a multiplier but not a standalone pillar, so 3% is appropriate.`,
  },
  improve: {
    weight: 0.02,
    standards: `ISO 31000 (Improvement), ISO 22301 (Resilience), KPMG Benchmarking, McKinsey Transformation Cycles`,
    rationale: `The questions include lessons learned, ERM reviews, benchmarking, KPI tracking, audit integration, resilience testing, stress testing, recovery alignment, improvement monitoring, and embedding enhancements. This domain strengthens maturity over time, so 2% is appropriate.`,
  },
};

export interface DimensionProvenance { weight: number; standards: string; rationale: string; }
export const DIMENSION_PROVENANCE: Record<string, DimensionProvenance> = {
  "Process": {
    weight: 0.38,
    standards: `ISO 31000 (Process Model), NIST RMF (Lifecycle), COSO ERM (Performance), Deloitte ERM Operating Model`,
    rationale: `The100‑question model contains 38 process‑tagged questions, covering structured workflows, escalation, identification, assessment, treatment, monitoring, reporting, and continuous improvement. This is the operational engine of ERM, and global frameworks consistently treat process as the backbone of maturity.`,
  },
  "Governance": {
    weight: 0.26,
    standards: `COSO ERM (Governance & Culture), OECD Governance Principles, RIMS RMM (Governance), Basel Governance Standards`,
    rationale: `We have 26 governance‑tagged questions, covering policy, roles, committees, appetite, criteria, regulatory alignment, accountability, reporting governance, and audit integration. Governance is the anchor of ERM oversight, and your model reflects this with strong structural emphasis.`,
  },
  "People": {
    weight: 0.22,
    standards: `RIMS RMM (Culture), ISO 31000 (Human Factors), McKinsey Capability Models, GRC Culture Frameworks`,
    rationale: `We have 22 people‑tagged questions, covering leadership behavior, training, culture, escalation, communication, incentives, psychological safety, and performance linkage. People shape risk behavior and culture — global frameworks treat this as a critical enabler, and your model reflects that.`,
  },
  "Technology": {
    weight: 0.14,
    standards: `NIST RMF (Automation), Gartner RiskTech Quadrant, Deloitte Digital ERM, ISO 27001 Controls`,
    rationale: `We have 14 technology‑tagged questions, covering KRIs, dashboards, automation, data validation, model governance, digital reporting, and systemic indicators. Technology accelerates ERM but remains a supporting dimension — your weighting reflects global practice.`,
  },
};

export interface MaturityLevel { level: number; name: string; characteristics: string[]; examples: string[]; }
export const MATURITY_LEVELS: MaturityLevel[] = [
  {
    level: 1,
    name: "INITIAL / AD‑HOC",
    characteristics: [`Risk management is informal, inconsistent, and reactive.`, `No standardized processes, templates, or governance.`, `Risk activities depend on individual effort.`, `Limited awareness of risk roles or responsibilities.`, `Technology use is minimal or nonexistent.`],
    examples: [`Risk registers incomplete or outdated`, `No KRIs, dashboards, or structured reporting`, `Risk treatment is unplanned or undocumented`, `Culture is unaware of risk expectations`],
  },
  {
    level: 2,
    name: "DEVELOPING / BASIC",
    characteristics: [`Some risk processes exist but are not consistently applied.`, `Governance roles are partially defined.`, `Risk assessments occur but lack depth or standardization.`, `Communication is irregular and mostly top‑down.`, `Technology is basic (spreadsheets, manual tracking).`],
    examples: [`Risk identification occurs annually or during crises`, `Some KRIs exist but are not automated`, `Risk treatment plans exist but lack ownership`, `Culture is aware but not engaged`],
  },
  {
    level: 3,
    name: "DEFINED / ESTABLISHED",
    characteristics: [`Risk processes are documented, standardized, and repeatable.`, `Governance structures (committees, roles, escalation) are active.`, `Risk assessments use consistent criteria across the organization.`, `KRIs, dashboards, and reporting are established.`, `Culture is supportive; training is periodic.`, `Technology supports monitoring and reporting.`],
    examples: [`Enterprise‑wide risk register maintained`, `KRIs monitored regularly`, `Risk treatment plans assigned and tracked`, `Scenario analysis conducted for major risks`, `Continuous improvement activities exist but are not systematic`],
  },
  {
    level: 4,
    name: "MANAGED / INTEGRATED",
    characteristics: [`ERM is embedded into strategy, planning, budgeting, and operations.`, `Risk appetite guides decision‑making.`, `Cross‑functional collaboration is strong.`, `Technology enables automation, dashboards, and analytics.`, `Culture is risk‑aware and proactive.`, `Continuous improvement is structured and data‑driven.`],
    examples: [`KRIs linked to early‑warning indicators`, `Risk treatments updated dynamically`, `ESG, cyber, AI, and systemic risks integrated`, `Leadership receives timely, accurate, automated reporting`, `Lessons learned systematically captured and applied`],
  },
  {
    level: 5,
    name: "OPTIMIZED / ADVANCED",
    characteristics: [`ERM is fully embedded, predictive, and continuously optimized.`, `the organization uses advanced analytics, AI, and scenario modeling.`, `Risk culture is strong at all levels — bottom‑up and top‑down.`, `Governance is transparent, accountable, and highly effective.`, `Continuous improvement is institutionalized.`, `ERM drives competitive advantage and strategic resilience.`],
    examples: [`Predictive KRIs and automated alerts`, `Real‑time dashboards for leadership and board`, `Integrated ESG, cyber, AI, and systemic risk frameworks`, `Benchmarking against global best practices`, `ERM fully aligned with strategy, performance, and transformation`],
  },
];

// Score legend — single source of truth, used by UI tooltips + PDF methodology page.
export const SCORE_LEGEND: Record<number, string> = {
  1: 'No evidence / ad-hoc / inconsistent',
  2: 'Partial evidence / developing / inconsistent application',
  3: 'Defined and consistently applied',
  4: 'Integrated, automated, and well-managed',
  5: 'Optimized, predictive, and continuously improved',
};

export const BUSINESS_UNITS: Array<{ id: string; name: string; industry: string }> = [
  { id: 'gen',  name: 'Generation',     industry: 'Power Generation' },
  { id: 'tra',  name: 'Transmission',   industry: 'Grid Operations' },
  { id: 'dis',  name: 'Distribution',   industry: 'Distribution Networks' },
  { id: 'corp', name: 'Corporate',      industry: 'Corporate Services' },
  { id: 'sub',  name: 'Subsidiaries',   industry: 'Subsidiary Operations' },
  { id: 'jv',   name: 'Joint Ventures', industry: 'Joint Venture Portfolio' },
];

export const BUSINESS_UNIT_NAMES: Record<string, string> = Object.fromEntries(
  BUSINESS_UNITS.map(b => [b.id, b.name]),
);

const DIM_WEIGHT: Record<string, number> = {
  People: 0.22, Process: 0.38, Technology: 0.14, Governance: 0.26,
};

export interface QuestionRubric { 1: string; 2: string; 3: string; 4: string; 5: string; }

export interface QuestionMeta {
  id: number;
  pillarId: string;
  dimensionId: string;
  weight: number;
  text: string;
  rubric: QuestionRubric;
}

const QUESTION_SOURCE: Array<Omit<QuestionMeta, 'weight'>> = [
  {
    id: 1,
    pillarId: 'lead',
    dimensionId: 'Governance',
    text: `Is there a formally approved ERM policy?`,
    rubric: {
      1: `No formal ERM policy exists, or it is outdated, draft‑only, or not approved by leadership.`,
      2: `A basic ERM policy exists but is inconsistently applied, not widely communicated, or lacks formal approval.`,
      3: `A formally documented ERM policy is approved by senior management and communicated to relevant functions.`,
      4: `The ERM policy is approved by the Board, reviewed annually, version‑controlled, and embedded into procedures and onboarding.`,
      5: `The ERM policy is continuously updated based on lessons learned, audits, regulatory changes, and benchmarking, with compliance monitored enterprise‑wide.`,
    },
  },
  {
    id: 2,
    pillarId: 'lead',
    dimensionId: 'Governance',
    text: `Are risk roles and responsibilities clearly defined and communicated?`,
    rubric: {
      1: `Risk roles are unclear, informal, undocumented, or vary across functions.`,
      2: `Some roles exist but are inconsistently defined or not communicated across the organization.`,
      3: `Risk roles and responsibilities are documented, approved, and communicated to all relevant stakeholders.`,
      4: `Roles are embedded into job descriptions, governance charters, and performance expectations across functions.`,
      5: `Roles are periodically reviewed for effectiveness, aligned with global standards, and supported by competency frameworks and training.`,
    },
  },
  {
    id: 3,
    pillarId: 'lead',
    dimensionId: 'People',
    text: `Does senior leadership actively champion risk management?`,
    rubric: {
      1: `Leadership involvement in risk management is minimal, reactive, or absent.`,
      2: `Leadership occasionally supports risk initiatives but inconsistently or without clear direction.`,
      3: `Leadership regularly communicates the importance of ERM and participates in key risk discussions.`,
      4: `Leadership actively drives ERM integration into strategy, operations, and performance management.`,
      5: `Leadership models risk‑aware behavior, sponsors enterprise‑wide initiatives, and uses risk insights to shape strategic decisions.`,
    },
  },
  {
    id: 4,
    pillarId: 'lead',
    dimensionId: 'Governance',
    text: `Is risk appetite approved and periodically reviewed by governing bodies?`,
    rubric: {
      1: `No formal risk appetite exists or it is not documented.`,
      2: `A draft or partial risk appetite exists but is not formally approved or reviewed.`,
      3: `A documented risk appetite is approved by senior leadership and communicated across the organization.`,
      4: `Risk appetite is approved by the Board, reviewed annually, and cascaded into limits, thresholds, and decision processes.`,
      5: `Risk appetite is dynamically updated based on performance, market conditions, and predictive analytics, with enterprise‑wide alignment and monitoring.`,
    },
  },
  {
    id: 5,
    pillarId: 'lead',
    dimensionId: 'Process',
    text: `Are risk breaches escalated and addressed promptly? (Prc)`,
    rubric: {
      1: `Breaches are handled informally, inconsistently, or not escalated.`,
      2: `Some escalation occurs, but processes are unclear or inconsistently followed.`,
      3: `A documented escalation process exists and is followed for significant breaches.`,
      4: `Escalation thresholds are automated through KRIs and dashboards, with timely reporting to leadership.`,
      5: `Escalation processes are continuously improved, with predictive alerts and root‑cause analysis driving proactive interventions.`,
    },
  },
  {
    id: 6,
    pillarId: 'lead',
    dimensionId: 'People',
    text: `Are risk responsibilities included in performance evaluations?`,
    rubric: {
      1: `Risk responsibilities are not included in performance evaluations for any roles.`,
      2: `Some roles include risk responsibilities, but application is inconsistent or informal.`,
      3: `Risk responsibilities are formally included in performance evaluations for relevant roles.`,
      4: `Risk accountability is embedded across leadership and operational roles with measurable KPIs.`,
      5: `Risk behaviors and outcomes are systematically evaluated, incentivized, and linked to leadership scorecards and organizational culture.`,
    },
  },
  {
    id: 7,
    pillarId: 'lead',
    dimensionId: 'Governance',
    text: `Are governance committees overseeing risk effectively?`,
    rubric: {
      1: `Committees do not exist or operate informally without structure or documentation.`,
      2: `Committees exist but lack clear charters, defined responsibilities, or consistent meeting practices.`,
      3: `Committees have documented charters, defined responsibilities, and hold regular meetings with recorded minutes.`,
      4: `Committees actively oversee risk, challenge assumptions, review dashboards, and ensure cross‑functional alignment.`,
      5: `Committees periodically assess their own effectiveness, benchmark against best practices, and drive continuous governance improvements.`,
    },
  },
  {
    id: 8,
    pillarId: 'lead',
    dimensionId: 'People',
    text: `Is leadership trained on emerging risks (cyber, AI, ESG)?`,
    rubric: {
      1: `Leadership receives no structured or formal training on emerging risks.`,
      2: `Training exists but is ad‑hoc, optional, or not role‑specific.`,
      3: `Leadership participates in periodic, structured training on key emerging risks.`,
      4: `Training is mandatory, role‑specific, and integrated into leadership development and competency programs.`,
      5: `Training is continuous, data‑driven, updated based on global trends, and leadership demonstrates applied competency in decision‑making.`,
    },
  },
  {
    id: 9,
    pillarId: 'lead',
    dimensionId: 'Governance',
    text: `Are accountability mechanisms enforced for risk violations?`,
    rubric: {
      1: `No formal accountability mechanisms exist for risk violations.`,
      2: `Some mechanisms exist but are inconsistently applied or poorly documented.`,
      3: `Documented accountability mechanisms are enforced for significant risk violations.`,
      4: `Accountability is embedded into governance, HR processes, and disciplinary frameworks across the organization.`,
      5: `Accountability is transparent, consistently enforced, and used to strengthen culture, controls, and organizational learning.`,
    },
  },
  {
    id: 10,
    pillarId: 'lead',
    dimensionId: 'Process',
    text: `Does leadership receive timely, accurate, decision‑ready risk reports? (Prc)`,
    rubric: {
      1: `Risk reports are irregular, incomplete, outdated, or not decision‑ready.`,
      2: `Reports exist but lack consistency, timeliness, or actionable insights.`,
      3: `Leadership receives periodic, structured risk reports with key metrics and analysis.`,
      4: `Reports are automated, dashboard‑driven, and aligned with leadership decision cycles.`,
      5: `Reports include predictive insights, scenario impacts, and forward‑looking analytics enabling proactive, strategic`,
    },
  },
  {
    id: 11,
    pillarId: 'strat',
    dimensionId: 'Process',
    text: `Is ERM integrated into strategic planning cycles? (Prc)`,
    rubric: {
      1: `ERM is not considered during strategic planning; risk discussions are ad‑hoc or absent.`,
      2: `ERM is occasionally referenced in planning but inconsistently or without formal requirements.`,
      3: `ERM inputs are formally included in strategic planning cycles and major decision processes.`,
      4: `ERM is embedded into all planning cycles, with risk insights shaping objectives, priorities, and resource allocation.`,
      5: `ERM is fully integrated into dynamic strategy processes, using predictive analytics and scenario insights to guide strategic choices.`,
    },
  },
  {
    id: 12,
    pillarId: 'strat',
    dimensionId: 'Governance',
    text: `Are risks considered during budgeting and resource allocation?`,
    rubric: {
      1: `Budgeting occurs without structured consideration of risks.`,
      2: `Some risk factors are considered, but inconsistently or without documentation.`,
      3: `Risk assessments inform budgeting and resource allocation for major initiatives.`,
      4: `Risk‑adjusted budgeting is standard practice, with clear links between risk exposure and resource decisions.`,
      5: `Risk‑based resource allocation is optimized using analytics, forecasting, and continuous monitoring of financial and operational risk impacts.`,
    },
  },
  {
    id: 13,
    pillarId: 'strat',
    dimensionId: 'Process',
    text: `Are major initiatives required to conduct risk assessments? (Prc)`,
    rubric: {
      1: `Major initiatives proceed without formal risk assessments.`,
      2: `Some initiatives include risk assessments, but not consistently or systematically.`,
      3: `All major initiatives require documented risk assessments before approval.`,
      4: `Risk assessments are embedded into project governance, with cross‑functional review and approval.`,
      5: `Risk assessments are dynamic, continuously updated, and integrated with project management tools and predictive models.`,
    },
  },
  {
    id: 14,
    pillarId: 'strat',
    dimensionId: 'Governance',
    text: `Are risk insights used to prioritize investments?`,
    rubric: {
      1: `Investment decisions are made without considering risk insights.`,
      2: `Risk insights are occasionally referenced but not systematically applied.`,
      3: `Risk insights are used to prioritize investments and evaluate alternatives.`,
      4: `Investment prioritization incorporates risk‑adjusted returns, scenario impacts, and strategic alignment.`,
      5: `Investment decisions leverage advanced analytics, stress testing, and enterprise‑wide risk‑return optimization models.`,
    },
  },
  {
    id: 15,
    pillarId: 'strat',
    dimensionId: 'Technology',
    text: `Are risk indicators integrated into performance dashboards?`,
    rubric: {
      1: `Dashboards do not include risk indicators or early‑warning metrics.`,
      2: `Some risk indicators exist but are manually tracked or inconsistently displayed.`,
      3: `Key risk indicators (KRIs) are included in performance dashboards for relevant functions.`,
      4: `KRIs are automated, updated in real time, and integrated with operational and strategic dashboards.`,
      5: `Dashboards include predictive KRIs, trend analysis, and automated alerts that support proactive decision‑making.`,
    },
  },
  {
    id: 16,
    pillarId: 'strat',
    dimensionId: 'People',
    text: `Are cross‑functional risk reviews conducted regularly?`,
    rubric: {
      1: `Cross‑functional risk discussions rarely occur or are informal.`,
      2: `Some cross‑functional reviews occur but lack structure or consistency.`,
      3: `Regular cross‑functional risk reviews are conducted with documented outcomes.`,
      4: `Reviews are embedded into governance cycles, enabling alignment across business units and functions.`,
      5: `Reviews incorporate enterprise‑wide insights, systemic risk analysis, and collaborative scenario planning.`,
    },
  },
  {
    id: 17,
    pillarId: 'strat',
    dimensionId: 'Process',
    text: `Are risk considerations embedded in procurement and vendor decisions? (Prc)`,
    rubric: {
      1: `Procurement decisions are made without structured risk considerations.`,
      2: `Some vendor risks are reviewed, but processes are inconsistent or incomplete.`,
      3: `Vendor and procurement processes include formal risk assessments and due diligence.`,
      4: `Risk scoring, vendor tiering, and ongoing monitoring are integrated into procurement workflows.`,
      5: `Vendor risk management is predictive, automated, and continuously updated using real‑time data and external intelligence sources.`,
    },
  },
  {
    id: 18,
    pillarId: 'strat',
    dimensionId: 'Governance',
    text: `Are emerging risks considered in strategic reviews?`,
    rubric: {
      1: `Emerging risks are not formally identified or considered in strategic reviews.`,
      2: `Emerging risks are occasionally discussed but not systematically analyzed.`,
      3: `Emerging risks are included in strategic reviews with documented assessments.`,
      4: `Emerging risk analysis is integrated into strategy cycles, with leadership reviewing trends and impacts.`,
      5: `Emerging risk monitoring is continuous, data‑driven, and supported by external intelligence, scenario modeling, and foresight tools.`,
    },
  },
  {
    id: 19,
    pillarId: 'strat',
    dimensionId: 'Process',
    text: `Are risk appetite limits operationalized across business units? (Prc)`,
    rubric: {
      1: `Risk appetite exists but is not translated into operational limits or thresholds.`,
      2: `Some limits exist but are inconsistently applied across units.`,
      3: `Risk appetite is translated into operational limits and communicated to all units.`,
      4: `Limits are embedded into processes, dashboards, and decision workflows across the enterprise.`,
      5: `Limits are dynamically adjusted based on real‑time risk exposure, predictive analytics, and enterprise‑wide monitoring.`,
    },
  },
  {
    id: 20,
    pillarId: 'strat',
    dimensionId: 'Governance',
    text: `Are risk insights used in project portfolio management?`,
    rubric: {
      1: `Project portfolio decisions are made without structured risk input.`,
      2: `Some risk insights are considered but not consistently applied.`,
      3: `Risk assessments inform project prioritization, selection, and approval.`,
      4: `Portfolio management integrates risk‑adjusted value, interdependencies, and scenario impacts.`,
      5: `Portfolio decisions leverage advanced analytics, systemic risk modeling, and continuous monitoring of project‑level and enterprise‑level exposures.`,
    },
  },
  {
    id: 21,
    pillarId: 'scope',
    dimensionId: 'Process',
    text: `Is internal and external context defined and reviewed periodically? (Prc)`,
    rubric: {
      1: `Context is not defined, documented, or reviewed.`,
      2: `Some context elements are identified but inconsistently documented or reviewed.`,
      3: `Internal and external context is documented and reviewed during major planning cycles.`,
      4: `Context is systematically reviewed across functions and updated after significant changes.`,
      5: `Context is continuously monitored using internal data, market intelligence, and predictive tools, with automated updates feeding into ERM processes.`,
    },
  },
  {
    id: 22,
    pillarId: 'scope',
    dimensionId: 'Governance',
    text: `Are risk criteria standardized across the organization?`,
    rubric: {
      1: `No formal risk criteria exist or criteria vary widely across units.`,
      2: `Basic criteria exist but are inconsistently applied or poorly documented.`,
      3: `Standardized risk criteria are documented and used across major functions.`,
      4: `Criteria are consistently applied enterprise‑wide and embedded into tools, templates, and workflows.`,
      5: `Criteria are continuously refined using benchmarking, analytics, and lessons learned, ensuring alignment with global standards and emerging risks.`,
    },
  },
  {
    id: 23,
    pillarId: 'scope',
    dimensionId: 'Process',
    text: `Are assumptions and constraints documented for assessments? (Prc)`,
    rubric: {
      1: `Assumptions and constraints are not documented or communicated.`,
      2: `Some assumptions are documented, but inconsistently or without validation.`,
      3: `Assumptions and constraints are documented for all formal risk assessments.`,
      4: `Assumptions are validated, reviewed, and challenged through cross‑functional governance.`,
      5: `Assumptions are dynamically updated using real‑time data, scenario analysis, and model validation practices.`,
    },
  },
  {
    id: 24,
    pillarId: 'scope',
    dimensionId: 'Governance',
    text: `Are risk appetite and tolerance levels clearly defined?`,
    rubric: {
      1: `No formal risk appetite or tolerance levels exist.`,
      2: `Draft appetite or tolerance levels exist but lack clarity or approval.`,
      3: `Appetite and tolerance levels are documented, approved, and communicated.`,
      4: `Appetite and tolerance levels are embedded into decision‑making, limits, and thresholds across the organization.`,
      5: `Appetite and tolerance levels are dynamically adjusted using predictive analytics, performance insights, and external risk signals.`,
    },
  },
  {
    id: 25,
    pillarId: 'scope',
    dimensionId: 'Process',
    text: `Are criteria for velocity, contagion, and persistence defined? (Prc)`,
    rubric: {
      1: `These criteria are not defined or considered in assessments.`,
      2: `Some criteria exist but are inconsistently applied or poorly understood.`,
      3: `Criteria for velocity, contagion, and persistence are documented and used in assessments.`,
      4: `Criteria are embedded into scoring models, dashboards, and scenario analysis.`,
      5: `Criteria are continuously refined using systemic risk modeling, stress testing, and advanced analytics.`,
    },
  },
  {
    id: 26,
    pillarId: 'scope',
    dimensionId: 'Governance',
    text: `Are ESG, cyber, and technology criteria included?`,
    rubric: {
      1: `ESG, cyber, and technology risks are not included in criteria.`,
      2: `Some criteria exist but are incomplete or inconsistently applied.`,
      3: `ESG, cyber, and technology criteria are documented and used in assessments.`,
      4: `Criteria are embedded into enterprise‑wide frameworks, dashboards, and governance processes.`,
      5: `Criteria are continuously updated based on global standards, regulatory changes, and emerging risk intelligence.`,
    },
  },
  {
    id: 27,
    pillarId: 'scope',
    dimensionId: 'Process',
    text: `Are context changes reviewed after major events? (Prc)`,
    rubric: {
      1: `Context is not reviewed after major events or disruptions.`,
      2: `Reviews occur occasionally but without structure or documentation.`,
      3: `Context is reviewed after major events and documented in ERM updates.`,
      4: `Reviews are embedded into governance cycles and trigger updates to assessments, appetite, and controls.`,
      5: `Reviews are automated using monitoring tools, with real‑time triggers prompting immediate reassessment and scenario updates.`,
    },
  },
  {
    id: 28,
    pillarId: 'scope',
    dimensionId: 'People',
    text: `Are stakeholder expectations incorporated into context setting?`,
    rubric: {
      1: `Stakeholder expectations are not identified or considered.`,
      2: `Some expectations are considered but inconsistently or informally.`,
      3: `Stakeholder expectations are documented and incorporated into context setting.`,
      4: `Expectations are systematically gathered through surveys, consultations, and engagement processes.`,
      5: `Stakeholder insights are continuously monitored using analytics, sentiment tools, and structured engagement frameworks.`,
    },
  },
  {
    id: 29,
    pillarId: 'scope',
    dimensionId: 'People',
    text: `Are risk boundaries and limits communicated effectively?`,
    rubric: {
      1: `Risk boundaries and limits are unclear or not communicated.`,
      2: `Some limits exist but are inconsistently communicated or understood.`,
      3: `Risk boundaries and limits are documented and communicated to relevant teams.`,
      4: `Limits are embedded into dashboards, workflows, and decision‑making processes.`,
      5: `Limits are dynamically updated, automated, and supported by real‑time alerts and predictive indicators.`,
    },
  },
  {
    id: 30,
    pillarId: 'scope',
    dimensionId: 'Governance',
    text: `Are criteria aligned with regulatory and industry standards?`,
    rubric: {
      1: `Criteria are not aligned with regulatory or industry expectations.`,
      2: `Partial alignment exists but is incomplete or outdated.`,
      3: `Criteria are aligned with current regulatory and industry standards.`,
      4: `Alignment is maintained through periodic reviews, audits, and benchmarking.`,
      5: `Alignment is continuously optimized using horizon scanning, regulatory intelligence, and participation in industry forums.`,
    },
  },
  {
    id: 31,
    pillarId: 'ident',
    dimensionId: 'Process',
    text: `Is there a structured process for identifying risks? (Prc)`,
    rubric: {
      1: `Risk identification is informal, reactive, or undocumented.`,
      2: `Some risk identification occurs, but processes are inconsistent or vary across units.`,
      3: `A structured, documented risk identification process exists and is used across major functions.`,
      4: `Risk identification is embedded into business processes, planning cycles, and governance routines.`,
      5: `Risk identification is continuous, data‑driven, and supported by predictive analytics, external intelligence, and automated scanning tools.`,
    },
  },
  {
    id: 32,
    pillarId: 'ident',
    dimensionId: 'Process',
    text: `Are risks identified across all business units and functions? (Prc)`,
    rubric: {
      1: `Risk identification is limited to a few functions or occurs only when issues arise.`,
      2: `Some units identify risks, but coverage is inconsistent or incomplete.`,
      3: `All business units participate in periodic, structured risk identification exercises.`,
      4: `Risk identification is coordinated enterprise‑wide, ensuring cross‑functional alignment and consistency.`,
      5: `Risk identification is dynamic, integrated with real‑time data sources, and continuously updated across all units.`,
    },
  },
  {
    id: 33,
    pillarId: 'ident',
    dimensionId: 'People',
    text: `Are emerging risks identified through environmental scanning?`,
    rubric: {
      1: `Emerging risks are not identified or monitored.`,
      2: `Some emerging risks are identified, but scanning is ad‑hoc or informal.`,
      3: `Emerging risks are identified through periodic environmental scanning and documented in ERM reports.`,
      4: `Emerging risk scanning is systematic, using structured tools, external sources, and cross‑functional input.`,
      5: `Emerging risk scanning is continuous, leveraging advanced analytics, horizon scanning, and global intelligence networks.`,
    },
  },
  {
    id: 34,
    pillarId: 'ident',
    dimensionId: 'Process',
    text: `Are third‑party and supply chain risks identified? (Prc)`,
    rubric: {
      1: `Third‑party and supply chain risks are not formally identified or assessed.`,
      2: `Some third‑party risks are identified, but processes are inconsistent or incomplete.`,
      3: `Third‑party and supply chain risks are identified through structured assessments and due diligence.`,
      4: `Risk identification is embedded into procurement, vendor management, and supply chain workflows.`,
      5: `Third‑party risk identification is automated, continuously monitored, and supported by external intelligence and real‑time data feeds.`,
    },
  },
  {
    id: 35,
    pillarId: 'ident',
    dimensionId: 'Process',
    text: `Are interdependencies between risks identified? (Prc)`,
    rubric: {
      1: `Interdependencies are not considered or documented.`,
      2: `Some interdependencies are recognized, but analysis is informal or incomplete.`,
      3: `Interdependencies are identified and documented during risk assessments.`,
      4: `Interdependency analysis is integrated into risk workshops, dashboards, and scenario planning.`,
      5: `Interdependencies are modeled using systemic risk tools, network analysis, and advanced simulation techniques.`,
    },
  },
  {
    id: 36,
    pillarId: 'ident',
    dimensionId: 'Process',
    text: `Are lessons from incidents used to identify new risks? (Prc)`,
    rubric: {
      1: `Lessons from incidents are not captured or used to identify risks.`,
      2: `Some lessons are captured, but they are inconsistently applied to risk identification.`,
      3: `Lessons learned are documented and used to update risk registers and assessments.`,
      4: `Lessons learned are systematically integrated into ERM processes, governance reviews, and control updates.`,
      5: `Lessons learned are continuously analyzed using root‑cause analysis, trend monitoring, and predictive tools to identify emerging risks.`,
    },
  },
  {
    id: 37,
    pillarId: 'ident',
    dimensionId: 'Technology',
    text: `Are technology, cyber, and data risks identified systematically?`,
    rubric: {
      1: `Technology, cyber, and data risks are not formally identified.`,
      2: `Some risks are identified, but coverage is incomplete or inconsistent.`,
      3: `Technology, cyber, and data risks are identified using structured assessments and frameworks.`,
      4: `Risk identification is integrated with IT governance, cybersecurity programs, and data management processes.`,
      5: `Identification is continuous, automated, and supported by threat intelligence, monitoring tools, and predictive analytics.`,
    },
  },
  {
    id: 38,
    pillarId: 'ident',
    dimensionId: 'Governance',
    text: `Are ESG and sustainability risks identified?`,
    rubric: {
      1: `ESG and sustainability risks are not identified or considered.`,
      2: `Some ESG risks are identified, but processes are informal or incomplete.`,
      3: `ESG and sustainability risks are identified using structured frameworks and assessments.`,
      4: `ESG risk identification is embedded into strategy, planning, and reporting processes.`,
      5: `ESG risk identification is continuously updated using global standards, stakeholder expectations, and external sustainability intelligence.`,
    },
  },
  {
    id: 39,
    pillarId: 'ident',
    dimensionId: 'People',
    text: `Are stakeholder‑driven risks identified?`,
    rubric: {
      1: `Stakeholder‑driven risks are not identified or considered.`,
      2: `Some stakeholder risks are recognized, but processes are inconsistent.`,
      3: `Stakeholder‑driven risks are identified through structured engagement and documented assessments.`,
      4: `Stakeholder insights are systematically integrated into risk identification and prioritization.`,
      5: `Stakeholder‑driven risks are continuously monitored using sentiment analysis, surveys, and external intelligence tools.`,
    },
  },
  {
    id: 40,
    pillarId: 'ident',
    dimensionId: 'Governance',
    text: `Are identification processes reviewed for completeness?`,
    rubric: {
      1: `Risk identification processes are not reviewed or validated.`,
      2: `Some reviews occur, but they are informal or infrequent.`,
      3: `Risk identification processes are periodically reviewed for completeness and accuracy.`,
      4: `Reviews are embedded into governance cycles, with cross‑functional validation and challenge.`,
      5: `Reviews are continuous, data‑driven, and supported by audit insights, benchmarking, and advanced analytics.`,
    },
  },
  {
    id: 41,
    pillarId: 'assess',
    dimensionId: 'Process',
    text: `Are likelihood and impact assessed using standardized criteria? (Prc)`,
    rubric: {
      1: `Likelihood and impact are assessed informally or inconsistently, without standardized criteria.`,
      2: `Some criteria exist, but they are inconsistently applied across functions.`,
      3: `Standardized likelihood and impact criteria are documented and used in all formal assessments.`,
      4: `Criteria are embedded into assessment tools, dashboards, and cross‑functional workflows.`,
      5: `Criteria are continuously refined using analytics, benchmarking, and lessons learned, ensuring predictive and dynamic scoring.`,
    },
  },
  {
    id: 42,
    pillarId: 'assess',
    dimensionId: 'Process',
    text: `Are quantitative and qualitative methods used appropriately? (Prc)`,
    rubric: {
      1: `Assessments rely solely on subjective judgment with no structured methods.`,
      2: `Some qualitative methods are used, but quantitative methods are limited or inconsistently applied.`,
      3: `Both qualitative and quantitative methods are used appropriately for relevant risks.`,
      4: `Methods are integrated into models, tools, and governance processes, with cross‑functional validation.`,
      5: `Advanced quantitative techniques (e.g., Monte Carlo, sensitivity analysis) and qualitative insights are combined for predictive, data‑driven assessments.`,
    },
  },
  {
    id: 43,
    pillarId: 'assess',
    dimensionId: 'Process',
    text: `Are scenarios developed for critical risks? (Prc)`,
    rubric: {
      1: `No scenarios are developed for critical risks.`,
      2: `Some scenarios exist, but they are basic, outdated, or inconsistently used.`,
      3: `Scenarios are developed for critical risks and used in assessments and planning.`,
      4: `Scenario analysis is embedded into strategic planning, stress testing, and decision‑making.`,
      5: `Scenarios are dynamic, data‑driven, and continuously updated using horizon scanning, predictive analytics, and external intelligence.`,
    },
  },
  {
    id: 44,
    pillarId: 'assess',
    dimensionId: 'Process',
    text: `Are systemic and cascading risks assessed? (Prc)`,
    rubric: {
      1: `Systemic or cascading risks are not identified or assessed.`,
      2: `Some systemic risks are recognized, but analysis is informal or incomplete.`,
      3: `Systemic and cascading risks are assessed using structured methods.`,
      4: `Systemic risk analysis is integrated into ERM, dashboards, and cross‑functional reviews.`,
      5: `Systemic risks are modeled using network analysis, simulations, and advanced analytics to anticipate contagion effects.`,
    },
  },
  {
    id: 45,
    pillarId: 'assess',
    dimensionId: 'Governance',
    text: `Are assumptions documented and validated?`,
    rubric: {
      1: `Assumptions used in assessments are undocumented or unvalidated.`,
      2: `Some assumptions are documented, but validation is inconsistent.`,
      3: `Assumptions are documented and validated during formal assessments.`,
      4: `Assumptions are reviewed, challenged, and approved through governance processes.`,
      5: `Assumptions are continuously validated using real‑time data, model testing, and predictive analytics.`,
    },
  },
  {
    id: 46,
    pillarId: 'assess',
    dimensionId: 'Governance',
    text: `Are risk assessments reviewed for consistency across units?`,
    rubric: {
      1: `Assessments vary widely across units with no consistency checks.`,
      2: `Some reviews occur, but they are informal or incomplete.`,
      3: `Assessments are periodically reviewed for consistency across units.`,
      4: `Consistency reviews are embedded into governance cycles, with cross‑functional calibration.`,
      5: `Consistency is ensured through automated scoring, benchmarking, and continuous model refinement.`,
    },
  },
  {
    id: 47,
    pillarId: 'assess',
    dimensionId: 'Technology',
    text: `Are data sources validated for quality and reliability?`,
    rubric: {
      1: `Data used in assessments is unvalidated, incomplete, or unreliable.`,
      2: `Some data validation occurs, but processes are inconsistent.`,
      3: `Data sources are validated for quality and reliability during assessments.`,
      4: `Data validation is embedded into ERM workflows, tools, and governance processes.`,
      5: `Data quality is continuously monitored using automated controls, analytics, and external verification.`,
    },
  },
  {
    id: 48,
    pillarId: 'assess',
    dimensionId: 'Technology',
    text: `Are risk models governed and periodically validated?`,
    rubric: {
      1: `Risk models are not governed, documented, or validated.`,
      2: `Some governance exists, but validation is infrequent or incomplete.`,
      3: `Risk models are documented, governed, and validated periodically.`,
      4: `Model governance is embedded into ERM, with structured testing, approvals, and monitoring.`,
      5: `Models are continuously improved using advanced analytics, machine learning, and real‑time performance monitoring.`,
    },
  },
  {
    id: 49,
    pillarId: 'assess',
    dimensionId: 'Process',
    text: `Are assessments updated after major changes? (Prc)`,
    rubric: {
      1: `Assessments are not updated after major internal or external changes.`,
      2: `Some updates occur, but they are inconsistent or delayed.`,
      3: `Assessments are updated after major changes and documented accordingly.`,
      4: `Updates are embedded into governance triggers, workflows, and monitoring processes.`,
      5: `Updates occur dynamically, supported by automated alerts, real‑time data, and predictive indicators.`,
    },
  },
  {
    id: 50,
    pillarId: 'assess',
    dimensionId: 'Governance',
    text: `Are risk prioritization methods transparent and repeatable?`,
    rubric: {
      1: `Prioritization is subjective, undocumented, or inconsistent.`,
      2: `Some prioritization methods exist, but transparency and repeatability are limited.`,
      3: `Prioritization methods are documented, transparent, and repeatable across units.`,
      4: `Methods are embedded into tools, dashboards, and governance processes.`,
      5: `Prioritization is optimized using analytics, scenario modeling, and continuous refinement based on performance and outcomes.`,
    },
  },
  {
    id: 51,
    pillarId: 'treat',
    dimensionId: 'Process',
    text: `Are treatment plans documented for all major risks? (Prc)`,
    rubric: {
      1: `Treatment plans are absent, informal, or undocumented.`,
      2: `Some treatment plans exist, but coverage is inconsistent or incomplete.`,
      3: `Treatment plans are documented for all major risks and include actions, owners, and timelines.`,
      4: `Treatment plans are embedded into workflows, monitored regularly, and linked to KRIs and controls.`,
      5: `Treatment plans are dynamic, continuously updated using real‑time data, predictive indicators, and automated monitoring.`,
    },
  },
  {
    id: 52,
    pillarId: 'treat',
    dimensionId: 'Governance',
    text: `Are treatment options evaluated for cost‑effectiveness?`,
    rubric: {
      1: `Treatment options are selected without considering cost‑effectiveness.`,
      2: `Some cost considerations occur, but analysis is informal or inconsistent.`,
      3: `Cost‑effectiveness is evaluated for major treatment options using structured criteria.`,
      4: `Cost‑benefit analysis is embedded into decision‑making, with cross‑functional review and financial validation.`,
      5: `Treatment decisions leverage advanced analytics, scenario modeling, and optimization techniques to maximize value.`,
    },
  },
  {
    id: 53,
    pillarId: 'treat',
    dimensionId: 'Technology',
    text: `Are controls designed and tested for effectiveness?`,
    rubric: {
      1: `Controls are undocumented, untested, or inconsistently applied.`,
      2: `Some controls exist, but testing is ad‑hoc or incomplete.`,
      3: `Controls are designed, documented, and periodically tested for effectiveness.`,
      4: `Control design and testing are integrated into governance, internal audit, and automated monitoring systems.`,
      5: `Controls are continuously optimized using analytics, automation, and real‑time performance data.`,
    },
  },
  {
    id: 54,
    pillarId: 'treat',
    dimensionId: 'Governance',
    text: `Are residual risks documented and approved?`,
    rubric: {
      1: `Residual risks are not documented or reviewed.`,
      2: `Some residual risks are documented, but approval is inconsistent.`,
      3: `Residual risks are documented and approved by appropriate risk owners.`,
      4: `Residual risk evaluation is embedded into governance processes, with clear thresholds and escalation paths.`,
      5: `Residual risks are dynamically monitored, with predictive analytics identifying emerging exposures and required adjustments.`,
    },
  },
  {
    id: 55,
    pillarId: 'treat',
    dimensionId: 'Technology',
    text: `Are treatment actions linked to KRIs?`,
    rubric: {
      1: `Treatment actions are not linked to KRIs or performance indicators.`,
      2: `Some links exist, but they are informal or inconsistently applied.`,
      3: `Treatment actions are linked to relevant KRIs and monitored periodically.`,
      4: `KRIs are automated, integrated into dashboards, and directly tied to treatment triggers and thresholds.`,
      5: `KRIs are predictive, continuously refined, and drive proactive treatment adjustments using real‑time insights.`,
    },
  },
  {
    id: 56,
    pillarId: 'treat',
    dimensionId: 'Governance',
    text: `Are risk financing options (insurance, hedging) considered?`,
    rubric: {
      1: `Risk financing options are not considered or evaluated.`,
      2: `Some financing options are reviewed, but analysis is informal or incomplete.`,
      3: `Risk financing options (insurance, hedging, reserves) are evaluated for major risks.`,
      4: `Financing strategies are integrated into ERM, treasury, and business planning processes.`,
      5: `Financing decisions are optimized using market intelligence, analytics, and dynamic risk‑transfer strategies.`,
    },
  },
  {
    id: 57,
    pillarId: 'treat',
    dimensionId: 'Process',
    text: `Are treatments updated based on monitoring results? (Prc)`,
    rubric: {
      1: `Treatment actions are not updated based on monitoring or performance data.`,
      2: `Some updates occur, but they are inconsistent or delayed.`,
      3: `Treatment actions are updated based on monitoring results and documented reviews.`,
      4: `Updates are embedded into governance cycles, with automated triggers and cross‑functional validation.`,
      5: `Treatment updates are continuous, data‑driven, and supported by predictive analytics and real‑time monitoring.`,
    },
  },
  {
    id: 58,
    pillarId: 'treat',
    dimensionId: 'People',
    text: `Are treatment owners accountable for implementation?`,
    rubric: {
      1: `Treatment ownership is unclear or not assigned.`,
      2: `Some owners are assigned, but accountability is inconsistent.`,
      3: `Treatment owners are assigned, documented, and accountable for implementation.`,
      4: `Accountability is embedded into performance evaluations, governance reviews, and reporting cycles.`,
      5: `Accountability is reinforced through transparent metrics, incentives, and continuous performance monitoring.`,
    },
  },
  {
    id: 59,
    pillarId: 'treat',
    dimensionId: 'Process',
    text: `Are contingency plans aligned with risk treatments? (Prc)`,
    rubric: {
      1: `Contingency plans do not exist or are not aligned with treatments.`,
      2: `Some contingency plans exist, but alignment is inconsistent or incomplete.`,
      3: `Contingency plans are documented and aligned with treatment strategies.`,
      4: `Contingency planning is integrated into business continuity, crisis management, and operational workflows.`,
      5: `Contingency plans are continuously tested, updated, and optimized using scenario analysis and stress testing.`,
    },
  },
  {
    id: 60,
    pillarId: 'treat',
    dimensionId: 'Technology',
    text: `Are treatment timelines tracked and reported?`,
    rubric: {
      1: `Treatment timelines are not tracked or reported.`,
      2: `Some timelines are tracked, but reporting is inconsistent or informal.`,
      3: `Treatment timelines are documented, tracked, and reported to relevant stakeholders.`,
      4: `Timeline tracking is automated, integrated into dashboards, and reviewed through governance processes.`,
      5: `Treatment timelines are continuously optimized using workflow automation, predictive alerts, and performance analytics.`,
    },
  },
  {
    id: 61,
    pillarId: 'monitor',
    dimensionId: 'Technology',
    text: `Are KRIs monitored against thresholds?`,
    rubric: {
      1: `KRIs are not defined or monitored.`,
      2: `Some KRIs exist, but monitoring is inconsistent or manual.`,
      3: `KRIs are defined, monitored regularly, and compared against approved thresholds.`,
      4: `KRIs are automated, integrated into dashboards, and trigger alerts when thresholds are breached.`,
      5: `KRIs are predictive, continuously refined, and supported by real‑time analytics and automated early‑warning systems.`,
    },
  },
  {
    id: 62,
    pillarId: 'monitor',
    dimensionId: 'Technology',
    text: `Are dashboards used to track risk exposure?`,
    rubric: {
      1: `Dashboards do not exist or are rarely used.`,
      2: `Basic dashboards exist but are incomplete, outdated, or manually maintained.`,
      3: `Dashboards provide structured, timely visibility into key risk exposures.`,
      4: `Dashboards are automated, integrated with data sources, and used in governance and decision‑making.`,
      5: `Dashboards include predictive analytics, trend modeling, and real‑time monitoring across the enterprise.`,
    },
  },
  {
    id: 63,
    pillarId: 'monitor',
    dimensionId: 'Technology',
    text: `Are early‑warning indicators in place?`,
    rubric: {
      1: `No early‑warning indicators exist.`,
      2: `Some indicators exist, but they are informal or inconsistently monitored.`,
      3: `Early‑warning indicators are defined and monitored for major risks.`,
      4: `Indicators are automated, integrated into dashboards, and linked to escalation processes.`,
      5: `Indicators are predictive, continuously refined, and supported by advanced analytics and external intelligence.`,
    },
  },
  {
    id: 64,
    pillarId: 'monitor',
    dimensionId: 'Process',
    text: `Are risk breaches escalated promptly? (Prc)`,
    rubric: {
      1: `Breaches are not escalated or are handled informally.`,
      2: `Some breaches are escalated, but processes are unclear or inconsistently followed.`,
      3: `A documented escalation process exists and is followed for significant breaches.`,
      4: `Escalation is automated through KRIs, dashboards, and workflow triggers.`,
      5: `Escalation is proactive, supported by predictive alerts, and drives continuous improvement through root‑cause analysis.`,
    },
  },
  {
    id: 65,
    pillarId: 'monitor',
    dimensionId: 'Governance',
    text: `Are monitoring results reviewed by leadership?`,
    rubric: {
      1: `Leadership does not review monitoring results.`,
      2: `Some results are reviewed, but not consistently or formally.`,
      3: `Leadership reviews monitoring results during scheduled governance meetings.`,
      4: `Monitoring results are integrated into leadership dashboards and decision cycles.`,
      5: `Leadership uses predictive insights and trend analysis to proactively address emerging risks.`,
    },
  },
  {
    id: 66,
    pillarId: 'monitor',
    dimensionId: 'Process',
    text: `Are controls tested regularly? (Prc)`,
    rubric: {
      1: `Controls are not tested or testing is ad‑hoc.`,
      2: `Some controls are tested, but coverage is inconsistent or undocumented.`,
      3: `Controls are tested regularly using documented procedures.`,
      4: `Control testing is integrated into governance, internal audit, and automated monitoring systems.`,
      5: `Control testing is continuous, data‑driven, and supported by analytics and automated validation tools.`,
    },
  },
  {
    id: 67,
    pillarId: 'monitor',
    dimensionId: 'Technology',
    text: `Are monitoring processes automated where possible?`,
    rubric: {
      1: `Monitoring processes are manual and fragmented.`,
      2: `Some automation exists, but coverage is limited.`,
      3: `Key monitoring processes are partially automated and documented.`,
      4: `Automation is embedded across monitoring workflows, dashboards, and reporting systems.`,
      5: `Monitoring is fully automated, predictive, and continuously optimized using advanced analytics and AI‑driven tools.`,
    },
  },
  {
    id: 68,
    pillarId: 'monitor',
    dimensionId: 'Governance',
    text: `Are monitoring results integrated into performance reporting?`,
    rubric: {
      1: `Monitoring results are not included in performance reporting.`,
      2: `Some results are included, but inconsistently or without clear linkage.`,
      3: `Monitoring results are incorporated into performance reports for relevant functions.`,
      4: `Monitoring insights are integrated into enterprise performance dashboards and leadership scorecards.`,
      5: `Monitoring results drive strategic adjustments, predictive performance insights, and continuous optimization.`,
    },
  },
  {
    id: 69,
    pillarId: 'monitor',
    dimensionId: 'Governance',
    text: `Are monitoring processes reviewed for effectiveness?`,
    rubric: {
      1: `Monitoring processes are not reviewed or evaluated.`,
      2: `Some reviews occur, but they are informal or infrequent.`,
      3: `Monitoring processes are periodically reviewed for effectiveness and completeness.`,
      4: `Reviews are embedded into governance cycles, with cross‑functional validation and improvement actions.`,
      5: `Reviews are continuous, data‑driven, and supported by benchmarking, analytics, and audit insights.`,
    },
  },
  {
    id: 70,
    pillarId: 'monitor',
    dimensionId: 'Technology',
    text: `Are systemic risk indicators monitored?`,
    rubric: {
      1: `Systemic risk indicators are not identified or monitored.`,
      2: `Some indicators exist, but monitoring is inconsistent or informal.`,
      3: `Systemic risk indicators are defined and monitored for major risk categories.`,
      4: `Indicators are integrated into dashboards, scenario analysis, and governance reviews.`,
      5: `Systemic indicators are continuously monitored using network analysis, predictive modeling, and external intelligence sources.`,
    },
  },
  {
    id: 71,
    pillarId: 'report',
    dimensionId: 'Process',
    text: `Are risk records maintained consistently across units? (Prc)`,
    rubric: {
      1: `Risk records are incomplete, inconsistent, or not maintained.`,
      2: `Some units maintain records, but formats and quality vary widely.`,
      3: `Risk records are maintained consistently using standardized templates and processes.`,
      4: `Records are integrated into centralized systems with automated updates and validation.`,
      5: `Records are continuously updated, quality‑checked, and supported by workflow automation and real‑time data feeds.`,
    },
  },
  {
    id: 72,
    pillarId: 'report',
    dimensionId: 'Governance',
    text: `Are reports standardized and comparable?`,
    rubric: {
      1: `Reports are unstructured, inconsistent, or vary across units.`,
      2: `Some standardization exists, but formats and content differ across functions.`,
      3: `Standardized reporting templates and structures are used across the organization.`,
      4: `Reporting is automated, comparable across units, and aligned with governance requirements.`,
      5: `Reporting is continuously optimized using benchmarking, analytics, and evolving best practices.`,
    },
  },
  {
    id: 73,
    pillarId: 'report',
    dimensionId: 'Governance',
    text: `Are reports audit‑ready and evidence‑based?`,
    rubric: {
      1: `Reports lack supporting evidence, documentation, or audit trails.`,
      2: `Some evidence is included, but documentation is inconsistent or incomplete.`,
      3: `Reports include supporting evidence, documentation, and clear audit trails.`,
      4: `Evidence is embedded into reporting workflows, with automated traceability and validation.`,
      5: `Reports are fully audit‑ready, with real‑time evidence linkage, automated controls, and continuous assurance mechanisms.`,
    },
  },
  {
    id: 74,
    pillarId: 'report',
    dimensionId: 'Technology',
    text: `Are digital tools used for reporting?`,
    rubric: {
      1: `Reporting is manual, spreadsheet‑based, or fragmented.`,
      2: `Some digital tools are used, but adoption is inconsistent or limited.`,
      3: `Digital tools support structured reporting for major risk categories.`,
      4: `Reporting is automated using integrated platforms, dashboards, and workflow tools.`,
      5: `Reporting leverages advanced analytics, real‑time data integration, and AI‑enabled insights.`,
    },
  },
  {
    id: 75,
    pillarId: 'report',
    dimensionId: 'Process',
    text: `Are reporting timelines defined and followed? (Prc)`,
    rubric: {
      1: `Reporting timelines are undefined or frequently missed.`,
      2: `Some timelines exist, but adherence is inconsistent.`,
      3: `Reporting timelines are defined, documented, and generally followed.`,
      4: `Timelines are embedded into workflows, monitored, and enforced through governance.`,
      5: `Reporting cycles are optimized using automation, predictive scheduling, and real‑time monitoring.`,
    },
  },
  {
    id: 76,
    pillarId: 'report',
    dimensionId: 'Technology',
    text: `Are dashboards accessible to relevant stakeholders?`,
    rubric: {
      1: `Dashboards do not exist or are not accessible to stakeholders.`,
      2: `Some dashboards exist, but access is limited or inconsistent.`,
      3: `Dashboards are accessible to relevant stakeholders with appropriate permissions.`,
      4: `Dashboards are integrated across functions, updated automatically, and widely used in decision‑making.`,
      5: `Dashboards are enterprise‑wide, real‑time, customizable, and supported by predictive analytics and mobile access.`,
    },
  },
  {
    id: 77,
    pillarId: 'report',
    dimensionId: 'Governance',
    text: `Are reporting processes reviewed for quality?`,
    rubric: {
      1: `Reporting processes are not reviewed or evaluated.`,
      2: `Some reviews occur, but they are informal or infrequent.`,
      3: `Reporting processes are periodically reviewed for accuracy, completeness, and quality.`,
      4: `Reviews are embedded into governance cycles, with cross‑functional validation and improvement actions.`,
      5: `Reporting processes are continuously improved using analytics, benchmarking, and audit insights.`,
    },
  },
  {
    id: 78,
    pillarId: 'report',
    dimensionId: 'People',
    text: `Are risk insights communicated clearly and concisely?`,
    rubric: {
      1: `Risk insights are unclear, overly technical, or difficult to interpret.`,
      2: `Some insights are communicated clearly, but consistency varies.`,
      3: `Risk insights are communicated clearly and concisely using standardized formats.`,
      4: `Communication is tailored to stakeholder needs, supported by visuals, dashboards, and decision‑ready summaries.`,
      5: `Communication is optimized using storytelling, predictive insights, and advanced visualization techniques.`,
    },
  },
  {
    id: 79,
    pillarId: 'report',
    dimensionId: 'Governance',
    text: `Are regulatory reporting requirements met?`,
    rubric: {
      1: `Regulatory reporting is incomplete, inconsistent, or non‑compliant.`,
      2: `Some requirements are met, but gaps or delays occur.`,
      3: `Regulatory reporting requirements are met consistently and documented.`,
      4: `Compliance is embedded into reporting workflows, with automated checks and governance oversight.`,
      5: `Reporting is continuously aligned with evolving regulations using horizon scanning, automation, and external intelligence.`,
    },
  },
  {
    id: 80,
    pillarId: 'report',
    dimensionId: 'Process',
    text: `Are reporting templates updated periodically? (Prc)`,
    rubric: {
      1: `Reporting templates are outdated or rarely updated.`,
      2: `Some updates occur, but not systematically or consistently.`,
      3: `Reporting templates are reviewed and updated periodically.`,
      4: `Template updates are embedded into governance cycles and aligned with best practices.`,
      5: `Templates are continuously optimized using analytics, user feedback, and regulatory or industry changes.`,
    },
  },
  {
    id: 81,
    pillarId: 'culture',
    dimensionId: 'People',
    text: `Is risk awareness measured periodically?`,
    rubric: {
      1: `Risk awareness is not measured or assessed.`,
      2: `Some informal awareness checks occur, but not systematically.`,
      3: `Risk awareness is measured periodically using surveys or assessments.`,
      4: `Awareness measurement is embedded into culture programs, training cycles, and governance reviews.`,
      5: `Awareness is continuously monitored using analytics, pulse surveys, and behavioral indicators, with insights driving targeted interventions.`,
    },
  },
  {
    id: 82,
    pillarId: 'culture',
    dimensionId: 'People',
    text: `Are employees encouraged to escalate risks?`,
    rubric: {
      1: `Employees are discouraged or afraid to escalate risks.`,
      2: `Some employees escalate risks, but processes are unclear or inconsistent.`,
      3: `Employees are encouraged to escalate risks through documented channels.`,
      4: `Escalation is embedded into workflows, supported by leadership messaging and safe‑speak mechanisms.`,
      5: `Escalation is proactive, psychologically safe, and reinforced through culture programs, analytics, and continuous feedback loops.`,
    },
  },
  {
    id: 83,
    pillarId: 'culture',
    dimensionId: 'Governance',
    text: `Are incentives aligned with risk appetite?`,
    rubric: {
      1: `Incentives do not consider risk appetite or risk behaviors.`,
      2: `Some incentives reflect risk considerations, but alignment is inconsistent.`,
      3: `Incentives are aligned with risk appetite for relevant roles.`,
      4: `Incentive structures are integrated into performance management and governance processes.`,
      5: `Incentives are continuously optimized using analytics, behavioral insights, and alignment with enterprise risk outcomes.`,
    },
  },
  {
    id: 84,
    pillarId: 'culture',
    dimensionId: 'People',
    text: `Is leadership modeling desired risk behaviors?`,
    rubric: {
      1: `Leadership does not demonstrate desired risk behaviors.`,
      2: `Some leaders model desired behaviors, but inconsistently.`,
      3: `Leadership consistently models desired risk behaviors and reinforces expectations.`,
      4: `Leadership behaviors are embedded into culture programs, evaluations, and communication routines.`,
      5: `Leadership behaviors are continuously assessed, benchmarked, and improved using feedback, analytics, and culture insights.`,
    },
  },
  {
    id: 85,
    pillarId: 'culture',
    dimensionId: 'People',
    text: `Are culture surveys conducted regularly?`,
    rubric: {
      1: `Culture surveys are not conducted.`,
      2: `Some surveys occur, but not regularly or comprehensively.`,
      3: `Culture surveys are conducted regularly and results are documented.`,
      4: `Survey results are integrated into culture programs, governance reviews, and action plans.`,
      5: `Culture insights are continuously monitored using advanced analytics, sentiment tools, and real‑time feedback mechanisms.`,
    },
  },
  {
    id: 86,
    pillarId: 'culture',
    dimensionId: 'People',
    text: `Are training programs effective and role‑specific?`,
    rubric: {
      1: `Training is absent, generic, or ineffective.`,
      2: `Some training exists, but it is not role‑specific or consistently applied.`,
      3: `Training programs are role‑specific, structured, and evaluated for effectiveness.`,
      4: `Training is embedded into onboarding, development programs, and governance cycles.`,
      5: `Training is continuously optimized using analytics, adaptive learning, and emerging risk intelligence.`,
    },
  },
  {
    id: 87,
    pillarId: 'culture',
    dimensionId: 'Governance',
    text: `Are risk behaviors embedded into performance management?`,
    rubric: {
      1: `Performance management does not include risk behaviors.`,
      2: `Some roles include risk behaviors, but application is inconsistent.`,
      3: `Risk behaviors are included in performance evaluations for relevant roles.`,
      4: `Risk behaviors are embedded across leadership and operational roles with measurable KPIs.`,
      5: `Risk behaviors are continuously evaluated, incentivized, and aligned with enterprise culture and strategic outcomes.`,
    },
  },
  {
    id: 88,
    pillarId: 'culture',
    dimensionId: 'People',
    text: `Are communication channels open and trusted?`,
    rubric: {
      1: `Communication channels are unclear, unused, or not trusted.`,
      2: `Some channels exist, but trust and usage vary across units.`,
      3: `Clear communication channels exist and are used for risk discussions and escalation.`,
      4: `Channels are embedded into workflows, supported by leadership messaging and transparency practices.`,
      5: `Communication is continuous, multi‑directional, and supported by analytics, feedback loops, and a strong culture of trust.`,
    },
  },
  {
    id: 89,
    pillarId: 'culture',
    dimensionId: 'Governance',
    text: `Are risk violations addressed consistently?`,
    rubric: {
      1: `Risk violations are ignored or handled inconsistently.`,
      2: `Some violations are addressed, but enforcement is inconsistent or undocumented.`,
      3: `Violations are addressed consistently using documented disciplinary processes.`,
      4: `Enforcement is integrated into governance, HR processes, and leadership oversight.`,
      5: `Enforcement is transparent, data‑driven, and used to strengthen culture, controls, and organizational learning.`,
    },
  },
  {
    id: 90,
    pillarId: 'culture',
    dimensionId: 'People',
    text: `Is psychological safety present for risk escalation?`,
    rubric: {
      1: `Employees fear retaliation or negative consequences for escalating risks.`,
      2: `Some pockets of psychological safety exist, but not enterprise‑wide.`,
      3: `Psychological safety is supported through policies, leadership messaging, and training.`,
      4: `Psychological safety is embedded into culture programs, leadership behaviors, and governance processes.`,
      5: `Psychological safety is continuously reinforced through analytics, feedback, and proactive culture interventions, enabling open and fearless escalation.`,
    },
  },
  {
    id: 91,
    pillarId: 'improve',
    dimensionId: 'Process',
    text: `Are lessons learned captured and applied? (Prc)`,
    rubric: {
      1: `Lessons learned are not captured or applied.`,
      2: `Some lessons are captured, but application is inconsistent or informal.`,
      3: `Lessons learned are documented and applied to improve processes and controls.`,
      4: `Lessons learned are integrated into ERM, governance, and operational improvement cycles.`,
      5: `Lessons learned are continuously analyzed using root‑cause analysis, trend monitoring, and predictive insights to drive proactive improvements.`,
    },
  },
  {
    id: 92,
    pillarId: 'improve',
    dimensionId: 'Governance',
    text: `Are ERM processes reviewed periodically?`,
    rubric: {
      1: `ERM processes are not reviewed or evaluated.`,
      2: `Some reviews occur, but they are informal or infrequent.`,
      3: `ERM processes are reviewed periodically for effectiveness and alignment.`,
      4: `Reviews are embedded into governance cycles, with cross‑functional participation and documented improvements.`,
      5: `ERM processes are continuously optimized using benchmarking, analytics, and audit insights.`,
    },
  },
  {
    id: 93,
    pillarId: 'improve',
    dimensionId: 'Governance',
    text: `Are benchmarks used to compare maturity?`,
    rubric: {
      1: `No benchmarking is conducted.`,
      2: `Some benchmarking occurs, but it is informal or limited in scope.`,
      3: `Benchmarking is conducted periodically against industry or regulatory standards.`,
      4: `Benchmarking results are integrated into improvement plans and governance reviews.`,
      5: `Benchmarking is continuous, leveraging global standards, peer insights, and external intelligence to drive strategic improvements.`,
    },
  },
  {
    id: 94,
    pillarId: 'improve',
    dimensionId: 'Technology',
    text: `Are improvements tracked against KPIs?`,
    rubric: {
      1: `Improvements are not tracked or measured.`,
      2: `Some improvements are tracked, but KPIs are inconsistent or unclear.`,
      3: `Improvement actions are tracked using defined KPIs and documented progress.`,
      4: `KPIs are integrated into dashboards, governance reviews, and performance management.`,
      5: `KPIs are predictive, automated, and continuously refined using analytics and real‑time monitoring.`,
    },
  },
  {
    id: 95,
    pillarId: 'improve',
    dimensionId: 'Governance',
    text: `Are audits used to improve ERM processes?`,
    rubric: {
      1: `Audits do not cover ERM or findings are not used for improvement.`,
      2: `Some audit findings are applied, but improvements are inconsistent.`,
      3: `Audit findings are used to improve ERM processes and controls.`,
      4: `Audit insights are integrated into governance, risk assessments, and continuous improvement cycles.`,
      5: `Audits drive strategic enhancements, with real‑time assurance, continuous auditing, and predictive risk insights.`,
    },
  },
  {
    id: 96,
    pillarId: 'improve',
    dimensionId: 'Process',
    text: `Are resilience and continuity plans tested regularly? (Prc)`,
    rubric: {
      1: `Resilience and continuity plans are not tested.`,
      2: `Some testing occurs, but it is infrequent or limited in scope.`,
      3: `Plans are tested regularly using documented scenarios and exercises.`,
      4: `Testing is integrated into governance, with cross‑functional participation and improvement actions.`,
      5: `Testing is continuous, using advanced simulations, stress testing, and real‑time scenario modeling.`,
    },
  },
  {
    id: 97,
    pillarId: 'improve',
    dimensionId: 'Process',
    text: `Are stress tests conducted for major risks? (Prc)`,
    rubric: {
      1: `Stress tests are not conducted.`,
      2: `Some stress tests occur, but they are basic or inconsistent.`,
      3: `Stress tests are conducted for major risks using structured scenarios.`,
      4: `Stress testing is integrated into planning, risk assessments, and decision‑making.`,
      5: `Stress testing is dynamic, data‑driven, and supported by predictive analytics and advanced modeling.`,
    },
  },
  {
    id: 98,
    pillarId: 'improve',
    dimensionId: 'Governance',
    text: `Are recovery capabilities aligned with risk appetite?`,
    rubric: {
      1: `Recovery capabilities are not defined or aligned with risk appetite.`,
      2: `Some alignment exists, but it is informal or incomplete.`,
      3: `Recovery capabilities are documented and aligned with risk appetite.`,
      4: `Alignment is embedded into continuity planning, governance, and operational processes.`,
      5: `Recovery capabilities are continuously optimized using analytics, scenario insights, and real‑time monitoring of resilience metrics.`,
    },
  },
  {
    id: 99,
    pillarId: 'improve',
    dimensionId: 'Technology',
    text: `Are improvement actions assigned and monitored?`,
    rubric: {
      1: `Improvement actions are not assigned or monitored.`,
      2: `Some actions are assigned, but monitoring is inconsistent or informal.`,
      3: `Improvement actions are assigned, tracked, and monitored through structured processes.`,
      4: `Monitoring is automated, integrated into dashboards, and reviewed through governance cycles.`,
      5: `Improvement actions are continuously optimized using workflow automation, predictive alerts, and performance analytics.`,
    },
  },
  {
    id: 100,
    pillarId: 'improve',
    dimensionId: 'People',
    text: `Are ERM enhancements incorporated into training and culture?`,
    rubric: {
      1: `ERM enhancements are not incorporated into training or culture programs.`,
      2: `Some enhancements are included, but inconsistently or informally.`,
      3: `ERM enhancements are incorporated into training programs and culture initiatives.`,
      4: `Enhancements are embedded into onboarding, leadership development, and enterprise culture programs.`,
      5: `Enhancements are continuously reinforced using analytics, adaptive learning, and culture insights to drive sustained behavioral change.`,
    },
  },
];

const cellCounts = new Map<string, number>();
for (const q of QUESTION_SOURCE) {
  const k = `${q.pillarId}:${q.dimensionId}`;
  cellCounts.set(k, (cellCounts.get(k) ?? 0) + 1);
}

export const QUESTIONS: QuestionMeta[] = QUESTION_SOURCE.map(q => ({
  ...q,
  weight: (DIM_WEIGHT[q.dimensionId] ?? 0) / (cellCounts.get(`${q.pillarId}:${q.dimensionId}`) ?? 1),
}));

export const QUESTIONS_BY_ID = new Map(QUESTIONS.map(q => [q.id, q]));

export const BENCHMARKS: Record<string, Record<string, number>> = {
  target:   { lead: 4.0, strat: 4.0, scope: 4.0, ident: 4.0, assess: 4.0, treat: 4.0, monitor: 4.0, report: 4.0, culture: 4.0, improve: 4.0 },
  industry: { lead: 3.8, strat: 3.7, scope: 3.5, ident: 3.5, assess: 3.8, treat: 3.6, monitor: 3.5, report: 3.4, culture: 3.3, improve: 3.4 },
  peer:     { lead: 3.5, strat: 3.4, scope: 3.3, ident: 3.3, assess: 3.5, treat: 3.4, monitor: 3.2, report: 3.2, culture: 3.1, improve: 3.1 },
  external: { lead: 4.3, strat: 4.2, scope: 4.1, ident: 4.1, assess: 4.3, treat: 4.1, monitor: 4.0, report: 4.0, culture: 3.9, improve: 4.0 },
};

export const BENCHMARK_TYPES = Object.keys(BENCHMARKS);

export const PILLARS: Array<{ id: string; name: string; weight: number }> =
  PILLAR_IDS.map(pid => ({ id: pid, name: PILLAR_NAMES[pid], weight: PILLAR_WEIGHTS[pid] }));

export const WEIGHTS = { dimension: DIM_WEIGHT, pillar: PILLAR_WEIGHTS };

export interface RoadmapAction {
  id: string; pillarId: string; dimensionId: string;
  description: string; expectedUplift: number; costScore: number; durationScore: number;
}

export const ROADMAP_ACTIONS: RoadmapAction[] = PILLAR_IDS.flatMap(pid => {
  const pname = PILLAR_NAMES[pid].toLowerCase();
  return [
    { id: `act_${pid}_1`, pillarId: pid, dimensionId: 'Process', description: `Standardize ${pname} workflows`, expectedUplift: 0.8, costScore: 3, durationScore: 2 },
    { id: `act_${pid}_2`, pillarId: pid, dimensionId: 'People', description: `Launch targeted capability uplift for ${pname}`, expectedUplift: 0.5, costScore: 1, durationScore: 2 },
    { id: `act_${pid}_3`, pillarId: pid, dimensionId: 'Technology', description: `Digitize ${pname} controls and dashboards`, expectedUplift: 0.7, costScore: 4, durationScore: 3 },
  ];
});
