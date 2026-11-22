const { pathToFileURL } = require('node:url');
(async () => {
  const m = await import(pathToFileURL('./node_modules/.cache/pyodide/pyodide.mjs').href);
  const py = await m.loadPyodide({ indexURL: './node_modules/.cache/pyodide' });
  const badPython = 'if "' + '\n' + '" in "hello":\n    pass';
  try {
    await py.runPythonAsync(badPython);
  } catch (err) {
    console.log("CAUGHT ERROR AS EXPECTED:");
    console.log(err.message);
  }
})();
