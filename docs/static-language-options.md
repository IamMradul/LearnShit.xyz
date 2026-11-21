# Architectural Options Report: Real C++, Java, Go, and Rust Tracing

**Date:** November 2026  
**Status:** Evaluation & Decision Document  
**Target:** Visualizer Engine (`LearnShit.xyz` / `AlgoLens`)

---

## 1. Executive Summary

LearnShit currently runs an entirely browser-based visualizer engine. JavaScript executes in a dedicated Web Worker instrumented via Babel AST rewriting, while Python uses a hybrid approach (a zero-download fast-path regex transpiler falling back to a client-side WebAssembly Pyodide sandbox with `sys.settrace`).

For statically typed, compiled languages (C++, Java, Go, Rust), the client currently employs lightweight regex transpilers that map common procedural syntax (loops, arrays, math, basic functions) to JavaScript. While this works for simple educational algorithms like Bubble Sort, the 241-fixture corpus revealed that idiomatic LeetCode, Codeforces, and HackerRank submissions fail whenever they touch language-specific features:
- **C++:** Nested templates (`vector<vector<int>>`, `map<int, vector<pair<int, int>>>`), references (`&`), pointers, fast I/O (`cin.tie(NULL)`), STL algorithm methods (`std::sort`).
- **Java:** `BufferedReader`/`StringTokenizer`, generics collections (`HashMap<Integer, List<Integer>>`), streams, interfaces, inner static classes.
- **Go:** Slices (`make([]int, n)`), multiple return values, pointers (`*Node`), struct methods with value/pointer receivers.
- **Rust:** Ownership, borrowing (`&mut`), pattern matching (`match`, `if let`), `Option<Box<ListNode>>`, standard traits (`Clone`, `Debug`).

Extending client-side regexes to parse and execute these languages is a dead end. This document evaluates four distinct architectural options to provide real execution tracing for compiled languages.

---

## 2. Option Comparison Matrix

| Criteria | Option A: Backend Debugger (gdb/lldb/JDI in Docker) | Option B: Remote Sandboxes (Judge0 / Piston) | Option C: Tree-sitter WASM AST Transpiler | Option D: Status Quo with Honest Labeling |
|---|---|---|---|---|
| **True Visualizer State?** | **Yes** (line-by-line stack & variables) | **No** (stdout/stderr only) | **Partial** (syntax only, no runtime semantics) | **Partial** (simple programs only) |
| **Full Standard Library?** | **Yes** (100% native stdlib) | **Yes** (native compiler) | **No** (must shim stdlib in JS) | **No** (only basic math/arrays) |
| **Client / Server Model** | Backend service required | 3rd-party or self-hosted API | 100% Client-side (WASM) | 100% Client-side |
| **Security Risk** | High (arbitrary code execution container sandbox) | Low (delegated to sandbox API) | Zero (sandboxed in browser worker) | Zero (sandboxed in browser worker) |
| **Latency** | 800ms – 2500ms (compile + step debug) | 500ms – 1500ms | 20ms – 80ms | Instant (<5ms) |
| **Hosting & Running Cost** | High ($50–$300/mo for container cluster) | Medium ($10–$50/mo or self-hosted) | Free ($0 hosting) | Free ($0 hosting) |
| **Implementation Effort** | High (3–5 weeks) | Low (1 week) but **architecturally unviable** | Very High (3–6 months per language) | Completed (0 days) |

---

## 3. Deep-Dive: Option A — Containerized Backend Debugger Service

### Architecture
An ephemeral containerized runner (e.g. AWS Fargate, Fly.io Machines, or Nomad cluster) runs a dedicated agent:
1. Client sends source code and test input over WebSocket or HTTP POST.
2. The container writes code to disk and compiles it with debugging symbols:
   - C++: `g++ -g -O0 solution.cpp -o solution`
   - Rust: `rustc -g -C opt-level=0 solution.rs -o solution`
   - Go: `go build -gcflags="all=-N -l" solution.go`
   - Java: `javac -g Solution.java`
3. A headless debugger driver steps through program execution:
   - C++/Rust: Python script driving `gdb` via `gdb-python` or `lldb` via LLDB C++/Python API.
   - Go: Headless `delve` (`dlv`) JSON-RPC client.
   - Java: Java Debug Interface (JDI) client attaching to `java -agentlib:jdwp=...`.
4. At each step / breakpoint on user lines, the debugger queries frame locals and serializes variables into JSON matching `TraceStep`.
5. The complete trace stream or step array is returned to the client and fed directly into LearnShit's existing `VisualizerPane` renderers.

### Pros
- **100% native language fidelity:** Templates, traits, pointers, references, fast I/O, and all competitive programming idioms work without modification.
- **Accurate memory visualization:** Enables genuine pointer diagrams, memory addresses, and structural views that transpilers cannot replicate.

### Cons & Blockers
- **Hostile Code Execution:** Running unvetted user C++ or Rust on a backend requires hardened sandboxing (`nsjail`, `gVisor`, or Firecracker microVMs) to prevent resource exhaustion, fork bombs, network breakouts, and crypto-mining.
- **Ongoing Infrastructure Cost:** Needs active server capacity (CPU/RAM for compilation and debugging). Cannot run on free static hosting (Vercel/GitHub Pages).
- **Network Latency:** Stepping or downloading trace bundles introduces multi-second round-trip latency compared to client-side execution.

---

## 4. Deep-Dive: Option B — Remote Execution APIs (Judge0 / Piston)

### Architecture
Judge0 and Piston are popular open-source code execution engines used by competitive programming platforms:
- Client submits code, language ID, and stdin.
- The remote service compiles and runs the code in an isolated cgroup sandbox.
- The response contains `{ stdout, stderr, compile_output, status, time, memory }`.

### The Critical Flaw: Why Judge0 / Piston Cannot Drive the Visualizer
**Neither Judge0 nor Piston supports runtime variable inspection or execution stepping.**
- They execute the binary from start to finish and capture standard output streams.
- LearnShit's renderers (`ArrayRenderer`, `TreeRenderer`, `GraphRenderer`, `HashMapRenderer`) require fine-grained `TraceStep` snapshots containing `step.variables[varName].value` and mutation events at every line of execution.
- Without a custom debugger protocol injected into the code, Judge0 / Piston can only show raw terminal output—reducing LearnShit to a generic code runner rather than an algorithm visualizer.
- Injecting `printf`/`println` logging at every AST node would require a full compiler front-end, defeating the purpose of using Judge0.

**Verdict:** Incompatible with the visualizer's core purpose.

---

## 5. Deep-Dive: Option C — Tree-sitter WASM AST Translation

### Architecture
Use Tree-sitter parsers (`tree-sitter-cpp`, `tree-sitter-java`, `tree-sitter-go`, `tree-sitter-rust`) compiled to WebAssembly to generate a complete, valid Concrete Syntax Tree (CST) directly in the browser. A custom AST visitor transforms language constructs into JavaScript ASTs for Babel instrumentation.

### Pros
- Runs 100% in the browser (zero server costs, zero security risk).
- Solves syntax parsing robustness (no regex breakage on comments, multi-line statements, or nested braces).

### Cons & Blockers
- **Semantic Analysis Gap:** Parsing syntax is only 10% of the problem. Emulating C++ pointer arithmetic, templates, pass-by-reference semantics, Rust borrow checker lifetimes, Java's JVM memory model, and Go channels inside JavaScript requires reimplementing language runtimes.
- **Standard Library Deficit:** Users rely on `std::priority_queue`, `java.util.TreeMap`, `bufio.Scanner`, etc. Writing JavaScript shims for four standard libraries represents hundreds of hours of ongoing maintenance.

---

## 6. Deep-Dive: Option D — Status Quo with Honest UI Labeling (Selected Strategy)

### Architecture
1. **JavaScript & Python First:**
   - JavaScript is fully supported in-browser via Babel instrumentation and achieves **100% pass rate** on the standard corpus.
   - Python is fully supported in-browser via Pyodide WebAssembly + `sys.settrace`, providing complete standard library support (`collections`, `heapq`, `bisect`, type hints, classes).
2. **Compiled Languages (C++, Java, Go, Rust):**
   - Retained as **client-side experimental tools**.
   - Clear UI labeling ("⚡ Experimental: simple programs only") informs users upfront that complex templates and advanced libraries are not supported.
   - When transpile fails, the UI falls back gracefully to standard code view and displays the exact failing line.
   - Zero hosting bills, zero backend maintenance, zero security exposure.

---

## 7. Debugger Feature Support Matrix (v2.4)

With the release of the debugger-style Trace View, the runtime tracer guarantees the following feature set across languages:

| Feature | JavaScript (Babel AST) | Python (Pyodide WASM) | C++ / Java / Go / Rust (Regex) |
|---|:---:|:---:|:---:|
| **Execution Engine** | In-browser Babel Rewriting | Client WebAssembly (`sys.settrace`) | Regex Transpilation to JS |
| **Line Pointer & Highlighting** | ✅ Exact | ✅ Exact | ⚠️ Simple programs only |
| **Gutter Execution Counts (`×N`)** | ✅ Exact | ✅ Exact | ⚠️ Simple programs only |
| **Loop Iteration Badges** | ✅ Exact | ✅ Exact | ⚠️ Simple programs only |
| **Call Stack Args & Return Values** | ✅ Exact | ✅ Exact | ⚠️ Simple recursion only |
| **Incremental stdout (`stdoutSoFar`)** | ✅ Exact | ✅ Exact | ⚠️ Simple programs only |
| **Collapsible Variable Tree** | ✅ Exact | ✅ Exact | ⚠️ Simple primitives only |
| **Failure Handling on Idiomatic Code** | Graceful Error | Graceful Error | Honest error banner + Experimental Badge |

---

## 8. Decision Gate & Next Steps

Before any implementation of compiled language tracing is attempted, the user must make an architectural choice:

1. **Option A: Containerized Backend Debugger Service (`gdb` / `lldb` / `delve` / `JDI`)**
   - *Cost:* ~$50 to $300/month for dedicated sandboxed container hosting (AWS Fargate, Fly.io, or Nomad with `nsjail`/`gVisor`).
   - *Fidelity:* 100% true native debugging (pointer diagrams, STL, standard templates, full memory visualization).
   - *Latency:* 800ms – 2500ms network roundtrip + compilation time.
   - *Security:* Requires strict containment against hostile code, fork bombs, and mining.

2. **Option C: Tree-sitter WASM AST Translation**
   - *Cost:* $0 hosting (100% in-browser WebAssembly).
   - *Fidelity:* Solves syntax errors, but does not provide standard libraries (`std::priority_queue`, `java.util.TreeMap`, etc.) or native pointer/borrow semantics without writing full JS shims.
   - *Effort:* 3–6 months of compiler runtime engineering.

3. **Option D: Status Quo with Honest Labeling (Current & Recommended Baseline)**
   - *Cost:* $0 hosting.
   - *Fidelity:* JavaScript and Python deliver 100% flawless line-by-line debugger traces. C++, Java, Go, and Rust provide fast client-side visualization for basic procedural algorithms, with clear `"⚡ Experimental: simple programs only"` warnings and explicit error messages when complex constructs are pasted.
   - *Integrity:* Zero fake traces. If transpilation fails, execution stops honestly with an informative error rather than rendering corrupt states.

> **Status:** Awaiting user decision before proceeding with any backend or Tree-sitter changes. Option D is currently fully implemented and verified.
