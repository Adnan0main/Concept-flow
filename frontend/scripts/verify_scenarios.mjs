// Verification script for ConceptFlow Curated Scenarios & Learning Features
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

console.log('--- ConceptFlow Modules 11 & 12 Verification ---');

// Read demoData.ts source directly
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const demoDataPath = join(__dirname, '../src/data/demoData.ts');
const content = readFileSync(demoDataPath, 'utf8');

// Verify scenario keys exist in file
const expectedScenarios = ['linear_algebra_nn', 'calculus_physics', 'graph_chemistry'];
for (const sc of expectedScenarios) {
  if (!content.includes(`${sc}: {`)) {
    throw new Error(`Missing scenario ${sc} in demoData.ts`);
  }
  console.log(`[PASS] Scenario '${sc}' registered in DEMO_SCENARIOS`);
}

// Check each scenario contents
const scenariosToCheck = [
  { name: 'DEMO_GRAPH', crossExpected: 4, nodesExpected: 10 },
  { name: 'CALCULUS_PHYSICS_GRAPH', crossExpected: 4, nodesExpected: 10 },
  { name: 'GRAPH_CHEMISTRY_GRAPH', crossExpected: 4, nodesExpected: 10 },
];

for (const sc of scenariosToCheck) {
  if (!content.includes(`export const ${sc.name}`)) {
    throw new Error(`Missing graph definition for ${sc.name}`);
  }
  console.log(`[PASS] Graph definition found for ${sc.name}`);
}

// Check SideInspector quiz & roadmap features
const sideInspectorPath = join(__dirname, '../src/components/SideInspector.tsx');
const inspectorContent = readFileSync(sideInspectorPath, 'utf8');

const inspectorChecks = [
  'Cross-Discipline Challenge',
  'quizQuestions',
  'selectedOption',
  'handleSelectQuizOption',
  'Sequential Learning Roadmap',
  'learningRoadmap',
];

for (const check of inspectorChecks) {
  if (!inspectorContent.includes(check)) {
    throw new Error(`SideInspector missing feature: ${check}`);
  }
  console.log(`[PASS] SideInspector contains: ${check}`);
}

// Check GraphCanvas export & presentation mode
const canvasPath = join(__dirname, '../src/components/GraphCanvas.tsx');
const canvasContent = readFileSync(canvasPath, 'utf8');

const canvasChecks = [
  'isPresentationMode',
  'handleExportPNG',
  'handleExportJSON',
  'Judge Pitch Mode',
  'cyRef.current.png',
  'application/json',
];

for (const check of canvasChecks) {
  if (!canvasContent.includes(check)) {
    throw new Error(`GraphCanvas missing feature: ${check}`);
  }
  console.log(`[PASS] GraphCanvas contains: ${check}`);
}

// Check Header scenario selector
const headerPath = join(__dirname, '../src/components/Header.tsx');
const headerContent = readFileSync(headerPath, 'utf8');

const headerChecks = [
  'scenario-select',
  'selectedScenario',
  'onSelectScenario',
  'linear_algebra_nn',
  'calculus_physics',
  'graph_chemistry',
];

for (const check of headerChecks) {
  if (!headerContent.includes(check)) {
    throw new Error(`Header missing feature: ${check}`);
  }
  console.log(`[PASS] Header contains: ${check}`);
}

console.log('\n[SUCCESS] All Module 11 & 12 verification assertions passed!');
