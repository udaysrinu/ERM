-- Seed reference data: business units, pillars, dimensions, benchmark profiles,
-- roadmap action templates, demo user.
-- Ports the deterministic seed block from server.ts:159-224 and 441-450.

-- Business units (6 SE operating units)
INSERT INTO business_units (id, name, industry) VALUES
  ('gen', 'Generation', 'Power Generation'),
  ('tra', 'Transmission', 'Grid Operations'),
  ('dis', 'Distribution', 'Distribution Networks'),
  ('corp', 'Corporate', 'Corporate Services'),
  ('sub', 'Subsidiaries', 'Subsidiary Operations'),
  ('jv', 'Joint Ventures', 'Joint Venture Portfolio')
ON CONFLICT (id) DO NOTHING;

-- 10 pillars (order determines display; ids match server.ts:144-155)
INSERT INTO pillars (id, name) VALUES
  ('lead', 'Leadership & Governance'),
  ('strat', 'Strategy & Integration'),
  ('scope', 'Scope, Context & Criteria'),
  ('ident', 'Risk Identification'),
  ('assess', 'Risk Assessment'),
  ('treat', 'Risk Treatment'),
  ('monitor', 'Monitoring & Review'),
  ('report', 'Recording & Reporting'),
  ('culture', 'Risk Culture'),
  ('improve', 'Continuous Improvement & Resilience')
ON CONFLICT (id) DO NOTHING;

-- 4 operating dimensions
INSERT INTO dimensions (id, name) VALUES
  ('People', 'People'),
  ('Process', 'Process'),
  ('Technology', 'Technology'),
  ('Governance', 'Governance')
ON CONFLICT (id) DO NOTHING;

-- 4 benchmark profiles × 10 pillars = 40 rows
INSERT INTO benchmarks (type, "pillarId", "dimensionId", score) VALUES
  ('target', 'lead', NULL, 4.0), ('target', 'strat', NULL, 4.0), ('target', 'scope', NULL, 4.0),
  ('target', 'ident', NULL, 4.0), ('target', 'assess', NULL, 4.0), ('target', 'treat', NULL, 4.0),
  ('target', 'monitor', NULL, 4.0), ('target', 'report', NULL, 4.0), ('target', 'culture', NULL, 4.0),
  ('target', 'improve', NULL, 4.0),
  ('industry', 'lead', NULL, 3.8), ('industry', 'strat', NULL, 3.7), ('industry', 'scope', NULL, 3.5),
  ('industry', 'ident', NULL, 3.5), ('industry', 'assess', NULL, 3.8), ('industry', 'treat', NULL, 3.6),
  ('industry', 'monitor', NULL, 3.5), ('industry', 'report', NULL, 3.4), ('industry', 'culture', NULL, 3.3),
  ('industry', 'improve', NULL, 3.4),
  ('peer', 'lead', NULL, 3.5), ('peer', 'strat', NULL, 3.4), ('peer', 'scope', NULL, 3.3),
  ('peer', 'ident', NULL, 3.3), ('peer', 'assess', NULL, 3.5), ('peer', 'treat', NULL, 3.4),
  ('peer', 'monitor', NULL, 3.2), ('peer', 'report', NULL, 3.2), ('peer', 'culture', NULL, 3.1),
  ('peer', 'improve', NULL, 3.1),
  ('external', 'lead', NULL, 4.3), ('external', 'strat', NULL, 4.2), ('external', 'scope', NULL, 4.1),
  ('external', 'ident', NULL, 4.1), ('external', 'assess', NULL, 4.3), ('external', 'treat', NULL, 4.1),
  ('external', 'monitor', NULL, 4.0), ('external', 'report', NULL, 4.0), ('external', 'culture', NULL, 3.9),
  ('external', 'improve', NULL, 4.0)
ON CONFLICT DO NOTHING;

-- Demo login
INSERT INTO users (email, password) VALUES ('operator@riskxai.com', 'password')
ON CONFLICT (email) DO NOTHING;

-- Roadmap action templates (3 per pillar × 10 pillars = 30 rows)
-- Priority formula lives in the engine: priorityScore = expectedUplift / (costScore * durationScore)
INSERT INTO roadmap_actions (id, "pillarId", "dimensionId", description, "expectedUplift", "costScore", "durationScore") VALUES
  ('act_lead_1', 'lead', 'Process', 'Standardize leadership & governance workflows', 0.8, 3, 2),
  ('act_lead_2', 'lead', 'People', 'Launch targeted capability uplift for leadership & governance', 0.5, 1, 2),
  ('act_lead_3', 'lead', 'Technology', 'Digitize leadership & governance controls and dashboards', 0.7, 4, 3),
  ('act_strat_1', 'strat', 'Process', 'Standardize strategy & integration workflows', 0.8, 3, 2),
  ('act_strat_2', 'strat', 'People', 'Launch targeted capability uplift for strategy & integration', 0.5, 1, 2),
  ('act_strat_3', 'strat', 'Technology', 'Digitize strategy & integration controls and dashboards', 0.7, 4, 3),
  ('act_scope_1', 'scope', 'Process', 'Standardize scope, context & criteria workflows', 0.8, 3, 2),
  ('act_scope_2', 'scope', 'People', 'Launch targeted capability uplift for scope, context & criteria', 0.5, 1, 2),
  ('act_scope_3', 'scope', 'Technology', 'Digitize scope, context & criteria controls and dashboards', 0.7, 4, 3),
  ('act_ident_1', 'ident', 'Process', 'Standardize risk identification workflows', 0.8, 3, 2),
  ('act_ident_2', 'ident', 'People', 'Launch targeted capability uplift for risk identification', 0.5, 1, 2),
  ('act_ident_3', 'ident', 'Technology', 'Digitize risk identification controls and dashboards', 0.7, 4, 3),
  ('act_assess_1', 'assess', 'Process', 'Standardize risk assessment workflows', 0.8, 3, 2),
  ('act_assess_2', 'assess', 'People', 'Launch targeted capability uplift for risk assessment', 0.5, 1, 2),
  ('act_assess_3', 'assess', 'Technology', 'Digitize risk assessment controls and dashboards', 0.7, 4, 3),
  ('act_treat_1', 'treat', 'Process', 'Standardize risk treatment workflows', 0.8, 3, 2),
  ('act_treat_2', 'treat', 'People', 'Launch targeted capability uplift for risk treatment', 0.5, 1, 2),
  ('act_treat_3', 'treat', 'Technology', 'Digitize risk treatment controls and dashboards', 0.7, 4, 3),
  ('act_monitor_1', 'monitor', 'Process', 'Standardize monitoring & review workflows', 0.8, 3, 2),
  ('act_monitor_2', 'monitor', 'People', 'Launch targeted capability uplift for monitoring & review', 0.5, 1, 2),
  ('act_monitor_3', 'monitor', 'Technology', 'Digitize monitoring & review controls and dashboards', 0.7, 4, 3),
  ('act_report_1', 'report', 'Process', 'Standardize recording & reporting workflows', 0.8, 3, 2),
  ('act_report_2', 'report', 'People', 'Launch targeted capability uplift for recording & reporting', 0.5, 1, 2),
  ('act_report_3', 'report', 'Technology', 'Digitize recording & reporting controls and dashboards', 0.7, 4, 3),
  ('act_culture_1', 'culture', 'Process', 'Standardize risk culture workflows', 0.8, 3, 2),
  ('act_culture_2', 'culture', 'People', 'Launch targeted capability uplift for risk culture', 0.5, 1, 2),
  ('act_culture_3', 'culture', 'Technology', 'Digitize risk culture controls and dashboards', 0.7, 4, 3),
  ('act_improve_1', 'improve', 'Process', 'Standardize continuous improvement & resilience workflows', 0.8, 3, 2),
  ('act_improve_2', 'improve', 'People', 'Launch targeted capability uplift for continuous improvement & resilience', 0.5, 1, 2),
  ('act_improve_3', 'improve', 'Technology', 'Digitize continuous improvement & resilience controls and dashboards', 0.7, 4, 3)
ON CONFLICT (id) DO NOTHING;
