# Development Rules & Agent Conventions

## File Creation & Modification Rules
1. **Modular New File Creation**: When implementing new features, components, plotters, or utilities, always create clean, modular **new files** (e.g. in `/src/components/`, `/src/services/`, or `/src/utils/`) rather than putting large code blocks into existing files.
2. **Modification Bounds**: Modify existing files (e.g. `App.tsx` or `server.ts`) ONLY to register, import, or integrate newly created files, or when explicitly asked to edit an existing file.
3. **Deep Reasoning & Complete Execution**: Before creating or modifying any file, perform thorough internal reasoning to structure the data models, state flow, UI layouts, and error boundaries. Always output full, production-ready, typed code with no incomplete placeholders.
4. **Resilient AI Server Fallbacks**: Ensure server endpoints include graceful fallback logic, standard token limits, and deep reasoning summaries so AI responses never fail or crash the interface.
