/* Agent Value Ledger calculator: inputs and default (hypothetical) values.
   Edit labels, defaults and limits here. See README.md, section "Editing the ledger calculator". */
window.LEDGER_CONFIG = {
  groups: [
    { id: 'revenue', name: 'Revenue', note: 'Counted as gross profit, not revenue.' },
    { id: 'cost', name: 'Operating costs', note: 'Freed time counts only when it is redeployed or replaces hiring.' },
    { id: 'capital', name: 'Capital', note: 'One-off cash release, shown separately.' },
    { id: 'risk', name: 'Risk', note: 'Off by default: counted only with evidence.' },
    { id: 'costs', name: 'Cost of the agent', note: 'Include integration, oversight and assurance.' },
    { id: 'time', name: 'Time and finance', note: '' }
  ],
  inputs: [
    { id: 'revScope', group: 'revenue', label: 'Annual revenue in scope', unit: 'money', value: 40000000, min: 0, step: 100000 },
    { id: 'revUplift', group: 'revenue', label: 'Expected uplift on revenue in scope', unit: '%', value: 2, min: 0, max: 20, step: 0.1 },
    { id: 'margin', group: 'revenue', label: 'Gross margin', unit: '%', value: 40, min: 0, max: 100, step: 1 },

    { id: 'hours', group: 'cost', label: 'Hours freed per year', unit: 'hours', value: 14000, min: 0, step: 500 },
    { id: 'rate', group: 'cost', label: 'Fully loaded cost per hour', unit: 'money', value: 90, min: 0, step: 5 },
    { id: 'capture', group: 'cost', label: 'Share of freed time actually redeployed or avoiding hires', unit: '%', value: 70, min: 0, max: 100, step: 5 },

    { id: 'cash', group: 'capital', label: 'Working capital released (one-off)', unit: 'money', value: 1000000, min: 0, step: 50000 },

    { id: 'riskOn', group: 'risk', label: 'Include risk benefit', unit: 'toggle', value: 0 },
    { id: 'risk', group: 'risk', label: 'Expected annual reduction in losses', unit: 'money', value: 200000, min: 0, step: 10000 },

    { id: 'build', group: 'costs', label: 'One-off implementation cost', unit: 'money', value: 400000, min: 0, step: 10000 },
    { id: 'run', group: 'costs', label: 'Annual running cost (model usage, oversight, assurance)', unit: 'money', value: 450000, min: 0, step: 10000 },

    { id: 'years', group: 'time', label: 'Time horizon', unit: 'years', value: 3, min: 1, max: 5, step: 1 },
    { id: 'ramp', group: 'time', label: 'Share of full benefit achieved in year 1', unit: '%', value: 50, min: 0, max: 100, step: 5 },
    { id: 'coc', group: 'time', label: 'Cost of capital (discount rate)', unit: '%', value: 8, min: 0, max: 25, step: 0.5 }
  ]
};
