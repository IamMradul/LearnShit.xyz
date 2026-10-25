import type { LanguageAdapter, SupportedLanguage } from '../TraceTypes';
import { PythonAdapter } from './PythonAdapter';
import { JavaScriptAdapter } from './JavaScriptAdapter';
import { CppAdapter } from './CppAdapter';
import { JavaAdapter } from './JavaAdapter';

const registry = new Map<SupportedLanguage, LanguageAdapter>();

export function getAdapter(language: SupportedLanguage): LanguageAdapter {
  if (!registry.has(language)) {
    switch (language) {
      case 'python':
        registry.set(language, new PythonAdapter());
        break;
      case 'javascript':
        registry.set(language, new JavaScriptAdapter());
        break;
      case 'cpp':
        registry.set(language, new CppAdapter());
        break;
      case 'java':
        registry.set(language, new JavaAdapter());
        break;
      default:
        throw new Error(
          `Language "${language}" is not supported yet. ` +
            `Go/Rust are scheduled for Phase 3.`,
        );
    }
  }
  return registry.get(language)!;
}

export function disposeAll() {
  for (const adapter of registry.values()) {
    adapter.dispose();
  }
  registry.clear();
}
