import { describe, it, expect, beforeEach } from 'vitest';
import { useEditorStore } from '../editorStore';

describe('editorStore - input highlighting & code update', () => {
  beforeEach(() => {
    useEditorStore.setState({
      code: '',
      input: '',
      inputHighlighted: false,
    });
  });

  it('initializes with inputHighlighted false', () => {
    expect(useEditorStore.getState().inputHighlighted).toBe(false);
  });

  it('sets inputHighlighted to true when new code is added', () => {
    useEditorStore.getState().setCode('function test() { return 42; }');
    expect(useEditorStore.getState().inputHighlighted).toBe(true);
  });

  it('keeps inputHighlighted false if code is unchanged or empty', () => {
    useEditorStore.getState().setInputHighlighted(false);
    useEditorStore.getState().setCode('');
    expect(useEditorStore.getState().inputHighlighted).toBe(false);
  });

  it('allows dismissing inputHighlighted manually', () => {
    useEditorStore.getState().setCode('const x = 10;');
    expect(useEditorStore.getState().inputHighlighted).toBe(true);
    useEditorStore.getState().setInputHighlighted(false);
    expect(useEditorStore.getState().inputHighlighted).toBe(false);
  });

  it('sets inputHighlighted to true when sample code is loaded', () => {
    useEditorStore.getState().setInputHighlighted(false);
    useEditorStore.getState().loadSample('python');
    expect(useEditorStore.getState().inputHighlighted).toBe(true);
  });
});
