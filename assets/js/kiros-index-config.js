/* Kiros AI Readiness & Value Index (K-ARVI): configuration.
   Edit questions, weights, bands, pathways and actions here. No other file needs to change.
   See README.md, section "Editing the assessment". */
window.KARVI_CONFIG = {
  version: '1.0 (preliminary)',

  /* One rubric for every question. Scores are 0-4; a dimension score is the average answer / 4 x 100. */
  scale: [
    { v: 0, label: 'Not in place' },
    { v: 1, label: 'Early or ad hoc' },
    { v: 2, label: 'Partly in place' },
    { v: 3, label: 'Largely in place' },
    { v: 4, label: 'Fully in place and reviewed' }
  ],

  /* Weights must add up to 1. */
  dimensions: [
    { id: 'S', name: 'Strategy and Leadership', weight: 0.15 },
    { id: 'D', name: 'Data and Infrastructure', weight: 0.20 },
    { id: 'P', name: 'Processes and Automation', weight: 0.20 },
    { id: 'C', name: 'People and Change', weight: 0.15 },
    { id: 'G', name: 'Governance and Risk', weight: 0.20 },
    { id: 'F', name: 'Financial Measurement', weight: 0.10 }
  ],

  questions: [
    { id: 'S1', dim: 'S', q: 'Our leadership has agreed specific business objectives for AI, tied to growth, cost, capital or risk targets.', help: 'Not just "use more AI", but which results it should change.' },
    { id: 'S2', dim: 'S', q: 'A named executive owns AI outcomes and has the authority and budget to act.', help: 'One accountable person, rather than many enthusiastic ones.' },
    { id: 'S3', dim: 'S', q: 'The board receives regular, decision-ready reporting on AI opportunities and risks.', help: 'Reporting that leads to decisions, not just updates.' },
    { id: 'S4', dim: 'S', q: 'We choose AI initiatives by expected business value, not by interest in the technology.', help: 'Each initiative has a reason in the business plan.' },

    { id: 'D1', dim: 'D', q: 'Data on our core operations, such as orders, inventory, receivables, assets and cases, is digital, reasonably complete and accessible.', help: 'Could someone pull a reliable year of this data within a week?' },
    { id: 'D2', dim: 'D', q: 'We have a reliable, joined-up view of each customer across sales, service and billing.', help: 'One customer, one record, wherever they deal with you.' },
    { id: 'D3', dim: 'D', q: 'Our core systems can connect to other software without major rework.', help: 'For example, through modern interfaces (APIs) that IT already supports.' },
    { id: 'D4', dim: 'D', q: 'Access to data is controlled, with clear owners and security safeguards.', help: 'You know who can see what, and why.' },

    { id: 'P1', dim: 'P', q: 'Our key processes are documented, with clear steps, handoffs and decision points.', help: 'Someone new could follow them.' },
    { id: 'P2', dim: 'P', q: 'We measure how long core processes take, what they cost and where errors occur.', help: 'Cycle times, unit costs and error rates are known, not guessed.' },
    { id: 'P3', dim: 'P', q: 'We have already automated parts of routine work, and those automations are maintained.', help: 'Workflow tools, scripts or robotic process automation that still work.' },
    { id: 'P4', dim: 'P', q: 'Customer-facing processes, such as enquiries, quotes, onboarding and service, are consistent enough to be partly automated.', help: 'The same request is handled the same way each time.' },

    { id: 'C1', dim: 'C', q: 'Staff use AI tools in their work, with clear guidance on what is and is not allowed.', help: 'Approved tools and rules, rather than informal use.' },
    { id: 'C2', dim: 'C', q: 'We have people who can turn business problems into AI requirements and manage vendors.', help: 'Inside the business, not only in IT or with suppliers.' },
    { id: 'C3', dim: 'C', q: 'Managers are prepared to redesign roles and workflows, not just add tools.', help: 'Willing to change how the work is done.' },
    { id: 'C4', dim: 'C', q: 'We have a plan to reskill or redeploy people whose work changes.', help: 'Including how junior staff will still learn the business.' },

    { id: 'G1', dim: 'G', q: 'We keep an up-to-date inventory of AI systems in use, including AI inside vendor software.', help: 'You could list them, with an owner for each, today.' },
    { id: 'G2', dim: 'G', q: 'We have defined which decisions AI may make, recommend or never touch, with approval thresholds.', help: 'In effect, a delegation map.' },
    { id: 'G3', dim: 'G', q: 'AI systems are tested before use and monitored afterwards, and someone can intervene or switch them off.', help: 'Testing, monitoring and a working off switch.' },
    { id: 'G4', dim: 'G', q: 'We assess vendor and third-party AI for data handling, security and suitability before we buy.', help: 'Procurement asks the right questions.' },

    { id: 'F1', dim: 'F', q: 'We set a measurable baseline before launching an AI initiative.', help: 'What the number is today, before anything changes.' },
    { id: 'F2', dim: 'F', q: 'We track the financial results of AI initiatives against the expected benefits after launch.', help: 'Results, not activity.' },
    { id: 'F3', dim: 'F', q: 'We count the full cost of AI, including integration, running costs, oversight and assurance.', help: 'Not only licence fees.' },
    { id: 'F4', dim: 'F', q: 'Finance is involved in approving and reviewing AI business cases.', help: 'The CFO\'s team signs off the numbers.' }
  ],

  /* Maturity bands for the composite score (provisional, not validated benchmarks). */
  bands: [
    { min: 0, max: 39, name: 'Foundational', text: 'The foundations for capturing value from AI are not yet in place. Focus on a small number of priorities before scaling.' },
    { min: 40, max: 59, name: 'Emerging', text: 'Some foundations exist, but gaps in key dimensions are likely to limit results. Close the largest gaps alongside one or two well-measured initiatives.' },
    { min: 60, max: 79, name: 'Developing', text: 'The organisation is broadly ready to pursue value from AI. The priority is disciplined selection, measurement and governance as initiatives scale.' },
    { min: 80, max: 100, name: 'Advanced', text: 'Strong foundations across most dimensions. The priority is scaling the highest-value agents and keeping the evidence of results robust.' }
  ],

  /* Value pathways: readiness to pursue each Agent Value Ledger category.
     Each is a weighted average of specific answers (weights per pathway must add up to 1).
     These measure readiness to pursue value, NOT the value itself. */
  pathways: [
    { id: 'revenue', name: 'Revenue', parts: { S1: 0.25, D2: 0.25, P4: 0.20, C3: 0.10, F2: 0.20 },
      basis: 'Strategy tied to growth, customer data, consistent customer processes, people ready to change, and measurement of results.' },
    { id: 'cost', name: 'Operating costs', parts: { P1: 0.20, P2: 0.20, P3: 0.20, D1: 0.15, C1: 0.10, F3: 0.15 },
      basis: 'Documented and measured processes, automation experience, operational data, adoption and full-cost capture.' },
    { id: 'capital', name: 'Capital', parts: { D1: 0.30, P2: 0.20, D3: 0.15, F1: 0.15, F2: 0.20 },
      basis: 'Data on inventory, receivables and assets, measured processes, system integration and financial baselines.' },
    { id: 'risk', name: 'Risk', parts: { G1: 0.20, G2: 0.20, G3: 0.25, G4: 0.15, D4: 0.20 },
      basis: 'An AI inventory, defined decision rights, testing and monitoring, vendor oversight and data security.' }
  ],
  pathwayBands: [
    { min: 0, max: 39, name: 'Build foundations first' },
    { min: 40, max: 59, name: 'Pursue selectively' },
    { min: 60, max: 100, name: 'Ready to pursue' }
  ],

  /* Priority actions by dimension, used when a dimension scores below 60. */
  actions: {
    S: ['Agree three to five business objectives for AI, each tied to a line in the accounts.', 'Name one accountable executive with authority and budget.', 'Set a quarterly board review of AI opportunities and risks.'],
    D: ['Identify the data behind your top three value opportunities and fix its quality first.', 'Create a single customer view for the channels that matter most.', 'Assign owners and access rules for core data sets.'],
    P: ['Document and measure the five processes with the most cost or customer impact.', 'Establish baselines for cycle time, unit cost and error rate.', 'Redesign one end-to-end process before automating it.'],
    C: ['Publish approved AI tools and clear rules for their use.', 'Build a small group that can translate business needs into AI requirements.', 'Plan how roles will change and how junior staff will still learn.'],
    G: ['Build an inventory of AI in use, including AI inside vendor software.', 'Draw a delegation map for material decisions, with approval thresholds.', 'Put testing, monitoring and a tested off switch in place for each material system.'],
    F: ['Require a baseline and a full-cost business case for every AI initiative.', 'Track results against expected benefits, and stop initiatives that do not deliver.', 'Involve finance in approving and reviewing AI cases.']
  },

  /* Sector context shown with results. Text only: it does not change any score. */
  industries: {
    'financial-services': { name: 'Financial services & investment management', focus: ['cost', 'risk', 'revenue'] },
    'family-offices': { name: 'Family offices & private wealth', focus: ['cost', 'risk', 'capital'] },
    'professional-services': { name: 'Professional & corporate services', focus: ['revenue', 'cost', 'capital'] },
    'energy': { name: 'Property, facilities & energy', focus: ['cost', 'capital', 'risk'] },
    'healthcare': { name: 'Healthcare & aged care', focus: ['cost', 'revenue', 'risk'] },
    'supply-chain': { name: 'Manufacturing, logistics & supply chains', focus: ['capital', 'cost', 'risk'] },
    'education': { name: 'Education', focus: ['revenue', 'cost', 'risk'] },
    'retail-consumer': { name: 'Retail & consumer businesses', focus: ['revenue', 'capital', 'cost'] },
    'other': { name: 'Other', focus: [] }
  }
};
