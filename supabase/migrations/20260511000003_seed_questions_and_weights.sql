-- Seed the 100 standards-aligned questions and the pillar × dimension weights matrix.
-- Ports server.ts:227-430. The per-question weight is a DERIVED value computed
-- at seed time: dimensionWeight / count(questions in that pillar×dimension cell).

-- 1. Insert all 100 questions with their pillar + dimension tagging.
INSERT INTO questions (id, text, "pillarId", "dimensionId") VALUES
  (1, 'Is there a formally approved ERM policy?', 'lead', 'Governance'),
  (2, 'Are risk roles and responsibilities clearly defined and communicated?', 'lead', 'Governance'),
  (3, 'Does senior leadership actively champion risk management?', 'lead', 'People'),
  (4, 'Is risk appetite approved and periodically reviewed by governing bodies?', 'lead', 'Governance'),
  (5, 'Are risk breaches escalated and addressed promptly?', 'lead', 'Process'),
  (6, 'Are risk responsibilities included in performance evaluations?', 'lead', 'People'),
  (7, 'Are governance committees overseeing risk effectively?', 'lead', 'Governance'),
  (8, 'Is leadership trained on emerging risks (cyber, AI, ESG)?', 'lead', 'People'),
  (9, 'Are accountability mechanisms enforced for risk violations?', 'lead', 'Governance'),
  (10, 'Does leadership receive timely, accurate, decision‑ready risk reports?', 'lead', 'Process'),
  (11, 'Is ERM integrated into strategic planning cycles?', 'strat', 'Process'),
  (12, 'Are risks considered during budgeting and resource allocation?', 'strat', 'Governance'),
  (13, 'Are major initiatives required to conduct risk assessments?', 'strat', 'Process'),
  (14, 'Are risk insights used to prioritize investments?', 'strat', 'Governance'),
  (15, 'Are risk indicators integrated into performance dashboards?', 'strat', 'Technology'),
  (16, 'Are cross‑functional risk reviews conducted regularly?', 'strat', 'People'),
  (17, 'Are risk considerations embedded in procurement and vendor decisions?', 'strat', 'Process'),
  (18, 'Are emerging risks considered in strategic reviews?', 'strat', 'Governance'),
  (19, 'Are risk appetite limits operationalized across business units?', 'strat', 'Process'),
  (20, 'Are risk insights used in project portfolio management?', 'strat', 'Governance'),
  (21, 'Is internal and external context defined and reviewed periodically?', 'scope', 'Process'),
  (22, 'Are risk criteria standardized across the organization?', 'scope', 'Governance'),
  (23, 'Are assumptions and constraints documented for assessments?', 'scope', 'Process'),
  (24, 'Are risk appetite and tolerance levels clearly defined?', 'scope', 'Governance'),
  (25, 'Are criteria for velocity, contagion, and persistence defined?', 'scope', 'Process'),
  (26, 'Are ESG, cyber, and technology criteria included?', 'scope', 'Governance'),
  (27, 'Are context changes reviewed after major events?', 'scope', 'Process'),
  (28, 'Are stakeholder expectations incorporated into context setting?', 'scope', 'People'),
  (29, 'Are risk boundaries and limits communicated effectively?', 'scope', 'People'),
  (30, 'Are criteria aligned with regulatory and industry standards?', 'scope', 'Governance'),
  (31, 'Is there a structured process for identifying risks?', 'ident', 'Process'),
  (32, 'Are risks identified across all business units and functions?', 'ident', 'Process'),
  (33, 'Are emerging risks identified through environmental scanning?', 'ident', 'People'),
  (34, 'Are third‑party and supply chain risks identified?', 'ident', 'Process'),
  (35, 'Are interdependencies between risks identified?', 'ident', 'Process'),
  (36, 'Are lessons from incidents used to identify new risks?', 'ident', 'Process'),
  (37, 'Are technology, cyber, and data risks identified systematically?', 'ident', 'Technology'),
  (38, 'Are ESG and sustainability risks identified?', 'ident', 'Governance'),
  (39, 'Are stakeholder‑driven risks identified?', 'ident', 'People'),
  (40, 'Are identification processes reviewed for completeness?', 'ident', 'Governance'),
  (41, 'Are likelihood and impact assessed using standardized criteria?', 'assess', 'Process'),
  (42, 'Are quantitative and qualitative methods used appropriately?', 'assess', 'Process'),
  (43, 'Are scenarios developed for critical risks?', 'assess', 'Process'),
  (44, 'Are systemic and cascading risks assessed?', 'assess', 'Process'),
  (45, 'Are assumptions documented and validated?', 'assess', 'Governance'),
  (46, 'Are risk assessments reviewed for consistency across units?', 'assess', 'Governance'),
  (47, 'Are data sources validated for quality and reliability?', 'assess', 'Technology'),
  (48, 'Are risk models governed and periodically validated?', 'assess', 'Technology'),
  (49, 'Are assessments updated after major changes?', 'assess', 'Process'),
  (50, 'Are risk prioritization methods transparent and repeatable?', 'assess', 'Governance'),
  (51, 'Are treatment plans documented for all major risks?', 'treat', 'Process'),
  (52, 'Are treatment options evaluated for cost‑effectiveness?', 'treat', 'Governance'),
  (53, 'Are controls designed and tested for effectiveness?', 'treat', 'Technology'),
  (54, 'Are residual risks documented and approved?', 'treat', 'Governance'),
  (55, 'Are treatment actions linked to KRIs?', 'treat', 'Technology'),
  (56, 'Are risk financing options (insurance, hedging) considered?', 'treat', 'Governance'),
  (57, 'Are treatments updated based on monitoring results?', 'treat', 'Process'),
  (58, 'Are treatment owners accountable for implementation?', 'treat', 'People'),
  (59, 'Are contingency plans aligned with risk treatments?', 'treat', 'Process'),
  (60, 'Are treatment timelines tracked and reported?', 'treat', 'Technology'),
  (61, 'Are KRIs monitored against thresholds?', 'monitor', 'Technology'),
  (62, 'Are dashboards used to track risk exposure?', 'monitor', 'Technology'),
  (63, 'Are early‑warning indicators in place?', 'monitor', 'Technology'),
  (64, 'Are risk breaches escalated promptly?', 'monitor', 'Process'),
  (65, 'Are monitoring results reviewed by leadership?', 'monitor', 'Governance'),
  (66, 'Are controls tested regularly?', 'monitor', 'Process'),
  (67, 'Are monitoring processes automated where possible?', 'monitor', 'Technology'),
  (68, 'Are monitoring results integrated into performance reporting?', 'monitor', 'Governance'),
  (69, 'Are monitoring processes reviewed for effectiveness?', 'monitor', 'Governance'),
  (70, 'Are systemic risk indicators monitored?', 'monitor', 'Technology'),
  (71, 'Are risk records maintained consistently across units?', 'report', 'Process'),
  (72, 'Are reports standardized and comparable?', 'report', 'Governance'),
  (73, 'Are reports audit‑ready and evidence‑based?', 'report', 'Governance'),
  (74, 'Are digital tools used for reporting?', 'report', 'Technology'),
  (75, 'Are reporting timelines defined and followed?', 'report', 'Process'),
  (76, 'Are dashboards accessible to relevant stakeholders?', 'report', 'Technology'),
  (77, 'Are reporting processes reviewed for quality?', 'report', 'Governance'),
  (78, 'Are risk insights communicated clearly and concisely?', 'report', 'People'),
  (79, 'Are regulatory reporting requirements met?', 'report', 'Governance'),
  (80, 'Are reporting templates updated periodically?', 'report', 'Process'),
  (81, 'Is risk awareness measured periodically?', 'culture', 'People'),
  (82, 'Are employees encouraged to escalate risks?', 'culture', 'People'),
  (83, 'Are incentives aligned with risk appetite?', 'culture', 'Governance'),
  (84, 'Is leadership modeling desired risk behaviors?', 'culture', 'People'),
  (85, 'Are culture surveys conducted regularly?', 'culture', 'People'),
  (86, 'Are training programs effective and role‑specific?', 'culture', 'People'),
  (87, 'Are risk behaviors embedded into performance management?', 'culture', 'Governance'),
  (88, 'Are communication channels open and trusted?', 'culture', 'People'),
  (89, 'Are risk violations addressed consistently?', 'culture', 'Governance'),
  (90, 'Is psychological safety present for risk escalation?', 'culture', 'People'),
  (91, 'Are lessons learned captured and applied?', 'improve', 'Process'),
  (92, 'Are ERM processes reviewed periodically?', 'improve', 'Governance'),
  (93, 'Are benchmarks used to compare maturity?', 'improve', 'Governance'),
  (94, 'Are improvements tracked against KPIs?', 'improve', 'Technology'),
  (95, 'Are audits used to improve ERM processes?', 'improve', 'Governance'),
  (96, 'Are resilience and continuity plans tested regularly?', 'improve', 'Process'),
  (97, 'Are stress tests conducted for major risks?', 'improve', 'Process'),
  (98, 'Are recovery capabilities aligned with risk appetite?', 'improve', 'Governance'),
  (99, 'Are improvement actions assigned and monitored?', 'improve', 'Technology'),
  (100, 'Are ERM enhancements incorporated into training and culture?', 'improve', 'People')
ON CONFLICT (id) DO NOTHING;

-- 2. Populate the pillar × dimension weights matrix.
-- Dimension weights come from the workbook: People=22%, Process=38%, Technology=14%, Governance=26%.
-- A row exists per (pillar × dimension) cell that actually contains questions.
INSERT INTO weights ("pillarId", "dimensionId", weight)
SELECT DISTINCT
  q."pillarId",
  q."dimensionId",
  CASE q."dimensionId"
    WHEN 'People' THEN 0.22
    WHEN 'Process' THEN 0.38
    WHEN 'Technology' THEN 0.14
    WHEN 'Governance' THEN 0.26
  END
FROM questions q
ON CONFLICT DO NOTHING;

-- 3. Derive per-question weight = dimensionWeight / cellQuestionCount.
-- This matches the runtime calculation in server.ts:422-430 exactly.
UPDATE questions q
SET weight = (
  CASE q."dimensionId"
    WHEN 'People' THEN 0.22
    WHEN 'Process' THEN 0.38
    WHEN 'Technology' THEN 0.14
    WHEN 'Governance' THEN 0.26
  END
) / NULLIF((
  SELECT COUNT(*)
  FROM questions q2
  WHERE q2."pillarId" = q."pillarId" AND q2."dimensionId" = q."dimensionId"
), 0)
WHERE q.weight = 0 OR q.weight IS NULL;
