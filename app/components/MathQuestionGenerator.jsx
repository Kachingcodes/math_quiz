"use client";
import React, { useEffect, useState } from "react";
import { FaMoon, FaSun } from "react-icons/fa";

// Small utility RNG so generation is fast and reproducible (optional seed)
function rng(seed = Date.now()) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return function () {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function randint(rand, a, b) {
  return a + Math.floor(rand() * (b - a + 1));
}

function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a;
}

function formatFrac(num, den) {
  if (den === 1) return String(num);
  const sign = num * den < 0 ? "-" : "";
  num = Math.abs(num);
  den = Math.abs(den);
  const g = gcd(num, den);
  num = num / g;
  den = den / g;
  return `${sign}${num}/${den}`;
}

function generateQuadratic(rand, id) {
  let a = randint(rand, 1, 5);
  let b = randint(rand, -10, 10);
  let c = randint(rand, -10, 10);
  let disc = b * b - 4 * a * c;
  let tries = 0;
  while (disc < 0 && tries < 10) {
    c = randint(rand, -10, 10);
    disc = b * b - 4 * a * c;
    tries++;
  }
  const sqrtDisc = Math.sqrt(disc);
  let answer, solution;
  if (Number.isInteger(sqrtDisc)) {
    const r1 = (-b + sqrtDisc) / (2 * a);
    const r2 = (-b - sqrtDisc) / (2 * a);
    answer = `x = ${r1}, ${r2}`;
    solution = `Solve ${a}x^2 ${b < 0 ? "-" : "+"} ${Math.abs(b)}x ${
      c < 0 ? "-" : "+"
    } ${Math.abs(c)} = 0.\n`;
    solution += `Discriminant Δ = b^2 - 4ac = ${b}^2 - 4*${a}*${c} = ${disc}.\n`;
    solution += `√Δ = ${sqrtDisc}.\n`;
    solution += `Roots: x = (-b ± √Δ) / (2a) = ${answer}.`;
  } else {
    answer = `x = ( -${b} ± √${disc} ) / ${2 * a}`;
    solution = `Solve ${a}x^2 ${b < 0 ? "-" : "+"} ${Math.abs(b)}x ${
      c < 0 ? "-" : "+"
    } ${Math.abs(c)} = 0.\n`;
    solution += `Δ = ${disc} so roots are x = (-b ± √Δ)/(2a) = ${answer}. (Irrational roots)\n`;
  }
  return {
    id,
    prompt: `Solve for x: ${a}x^2 ${b < 0 ? "-" : "+"} ${Math.abs(b)}x ${
      c < 0 ? "-" : "+"
    } ${Math.abs(c)} = 0`,
    answer,
    solution,
    topic: "Quadratic equations",
  };
}

function generateLinearSystem(rand, id) {
  const a1 = randint(rand, -6, 6) || 1;
  const b1 = randint(rand, -6, 6) || 1;
  const c1 = randint(rand, -12, 12);
  const a2 = randint(rand, -6, 6) || 1;
  const b2 = randint(rand, -6, 6) || 1;
  const c2 = randint(rand, -12, 12);
  const det = a1 * b2 - a2 * b1;
  let answer, solution;
  if (det === 0) {
    answer = "No unique solution (parallel or infinite solutions).";
    solution = `System: ${a1}x ${b1 < 0 ? "-" : "+"} ${Math.abs(b1)}y = ${c1};\n`;
    solution += `${a2}x ${b2 < 0 ? "-" : "+"} ${Math.abs(b2)}y = ${c2}.\n`;
    solution += `Determinant = ${det}. Since determinant is 0, there's no unique solution.`;
  } else {
    const x = (c1 * b2 - c2 * b1) / det;
    const y = (a1 * c2 - a2 * c1) / det;
    answer = `x = ${Number(x.toFixed(4))}, y = ${Number(y.toFixed(4))}`;
    solution = `Use Cramer's rule. Determinant D = ${det}.\n`;
    solution += `Dx = |${c1} ${b1}; ${c2} ${b2}| = ${c1 * b2 - c2 * b1}.\n`;
    solution += `Dy = |${a1} ${c1}; ${a2} ${c2}| = ${a1 * c2 - a2 * c1}.\n`;
    solution += `x = Dx/D = ${Number((c1 * b2 - c2 * b1).toFixed(4))}/${det} = ${Number(x.toFixed(4))}.\n`;
    solution += `y = Dy/D = ${Number((a1 * c2 - a2 * c1).toFixed(4))}/${det} = ${Number(y.toFixed(4))}.`;
  }
  return {
    id,
    prompt: `Solve the system: ${a1}x ${b1 < 0 ? "-" : "+"} ${Math.abs(b1)}y = ${c1};\n${a2}x ${
      b2 < 0 ? "-" : "+"
    } ${Math.abs(b2)}y = ${c2}`,
    answer,
    solution,
    topic: "Linear system (2x2)",
  };
}

function generateDerivative(rand, id) {
  const degree = randint(rand, 1, 4);
  const coeffs = Array.from({ length: degree + 1 }, () => randint(rand, -5, 8));
  if (coeffs[0] === 0) coeffs[0] = randint(rand, 1, 8);
  const x0 = randint(rand, -5, 5);
  const expr = coeffs
    .map((c, i) => {
      const pow = degree - i;
      if (c === 0) return null;
      const sign = c < 0 ? "- " : "+ ";
      const abs = Math.abs(c);
      if (pow === 0) return `${sign}${abs}`;
      if (pow === 1) return `${sign}${abs}x`;
      return `${sign}${abs}x^${pow}`;
    })
    .filter(Boolean)
    .join(" ")
    .replace(/^\+ /, "");

  const derivCoeffs = coeffs.map((c, i) => c * (degree - i)).slice(0, -1);
  const derivExpr = derivCoeffs
    .map((c, i) => {
      const pow = derivCoeffs.length - 1 - i;
      if (c === 0) return null;
      const sign = c < 0 ? "- " : "+ ";
      const abs = Math.abs(c);
      if (pow === 0) return `${sign}${abs}`;
      if (pow === 1) return `${sign}${abs}x`;
      return `${sign}${abs}x^${pow}`;
    })
    .filter(Boolean)
    .join(" ")
    .replace(/^\+ /, "");

  const derivVal = derivCoeffs.reduce((acc, c, i) => {
    const pow = derivCoeffs.length - 1 - i;
    return acc + c * Math.pow(x0, pow);
  }, 0);

  const answer = `f'(${x0}) = ${derivVal}`;
  let solution = `Given f(x) = ${expr}.\n`;
  solution += `f'(x) = ${derivExpr}.\n`;
  solution += `Evaluate at x = ${x0}: f'(${x0}) = ${derivVal}.`;

  return {
    id,
    prompt: `If f(x) = ${expr}, find f'(${x0}).`,
    answer,
    solution,
    topic: "Differentiation",
  };
}

function generateIntegral(rand, id) {
  const degree = randint(rand, 0, 3);
  const coeffs = Array.from({ length: degree + 1 }, () => randint(rand, -5, 8));
  if (coeffs.every((c) => c === 0)) coeffs[0] = 1;
  const a = randint(rand, -3, 2);
  const b = randint(rand, a + 1, a + 6);
  const expr = coeffs
    .map((c, i) => {
      const pow = degree - i;
      if (c === 0) return null;
      const sign = c < 0 ? "- " : "+ ";
      const abs = Math.abs(c);
      if (pow === 0) return `${sign}${abs}`;
      if (pow === 1) return `${sign}${abs}x`;
      return `${sign}${abs}x^${pow}`;
    })
    .filter(Boolean)
    .join(" ")
    .replace(/^\+ /, "");

  const integralCoeffs = coeffs.map((c, i) => {
    const pow = degree - i;
    return { coeff: c / (pow + 1), pow: pow + 1 };
  });
  const antideriv = integralCoeffs
    .map((t) => {
      const c = t.coeff;
      const pow = t.pow;
      if (c === 0) return null;
      const sign = c < 0 ? "- " : "+ ";
      const abs = Math.abs(c);
      if (pow === 1) return `${sign}${abs}x`;
      return `${sign}${abs}x^${pow}`;
    })
    .filter(Boolean)
    .join(" ")
    .replace(/^\+ /, "");

  const evaluate = (x) =>
    integralCoeffs.reduce((acc, t) => acc + t.coeff * Math.pow(x, t.pow), 0);

  const val = evaluate(b) - evaluate(a);
  const answer = `∫_${a}^${b} (${expr}) dx = ${Number(val.toFixed(4))}`;
  let solution = `Compute the antiderivative of f(x) = ${expr}.\n`;
  solution += `An antiderivative is F(x) = ${antideriv}.\n`;
  solution += `Then ∫_${a}^${b} f(x) dx = F(${b}) - F(${a}) = ${Number(
    evaluate(b).toFixed(4)
  )} - ${Number(evaluate(a).toFixed(4))} = ${Number(val.toFixed(4))}.`;

  return {
    id,
    prompt: `Compute the definite integral: ∫_${a}^${b} (${expr}) dx`,
    answer,
    solution,
    topic: "Integration (definite)",
  };
}

function generateSequenceQuestion(rand, id) {
  const isArithmetic = rand() > 0.5;
  if (isArithmetic) {
    const a1 = randint(rand, -5, 8);
    const d = randint(rand, -5, 6);
    const n = randint(rand, 5, 12);
    const an = a1 + (n - 1) * d;
    const answer = `a_${n} = ${an}`;
    const solution = `Arithmetic sequence with a1 = ${a1}, d = ${d}. Formula a_n = a1 + (n-1)d.\nSo a_${n} = ${a1} + (${n}-1)*${d} = ${an}.`;
    return {
      id,
      prompt: `Given an arithmetic sequence with first term ${a1} and common difference ${d}, find the ${n}th term.`,
      answer,
      solution,
      topic: "Sequences (arithmetic)",
    };
  } else {
    const a1 = randint(rand, 1, 6);
    const r = randint(rand, 2, 5);
    const n = randint(rand, 3, 8);
    const an = a1 * Math.pow(r, n - 1);
    const answer = `a_${n} = ${an}`;
    const solution = `Geometric sequence with a1 = ${a1}, r = ${r}. Formula a_n = a1 * r^(n-1).\nSo a_${n} = ${a1}*${r}^${n - 1} = ${an}.`;
    return {
      id,
      prompt: `Given a geometric sequence with first term ${a1} and ratio ${r}, find the ${n}th term.`,
      answer,
      solution,
      topic: "Sequences (geometric)",
    };
  }
}

function generateLogExp(rand, id) {
  const isLog = rand() > 0.5;
  if (isLog) {
    const a = randint(rand, 2, 6);
    const b = randint(rand, 1, 6);
    const x = randint(rand, 1, 6);
    const c = Math.log(b * x) / Math.log(a);
    const answer = `x = ${x}`;
    const solution = `Solve log_${a}(${b}x) = ${Number(c.toFixed(4))}.\nRewrite: ${b}x = ${a}^${Number(
      c.toFixed(4)
    )}. Hence x = ${(Math.pow(a, c) / b).toFixed(4)} = ${x}.`;
    return {
      id,
      prompt: `Solve for x: log_${a}(${b}x) = ${Number(c.toFixed(4))}`,
      answer,
      solution,
      topic: "Logarithmic equations",
    };
  } else {
    const a = randint(rand, 2, 6);
    const x = randint(rand, 1, 6);
    const val = Math.pow(a, x);
    const answer = `x = ${x}`;
    const solution = `Solve ${a}^x = ${val}. Taking log (or recognizing power), x = ${x}.`;
    return {
      id,
      prompt: `Solve for x: ${a}^x = ${val}`,
      answer,
      solution,
      topic: "Exponential equations",
    };
  }
}

function generateQuestionOfType(rand, id) {
  const t = rand();
  if (t < 0.18) return generateQuadratic(rand, id);
  if (t < 0.34) return generateLinearSystem(rand, id);
  if (t < 0.56) return generateDerivative(rand, id);
  if (t < 0.72) return generateIntegral(rand, id);
  if (t < 0.86) return generateSequenceQuestion(rand, id);
  return generateLogExp(rand, id);
}

export default function MathQuestionsGenerator() {
  const [seed, setSeed] = useState(() => Date.now() % 1000000);
  const [questions, setQuestions] = useState(null);
  const [current, setCurrent] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  useEffect(() => {
    setTimeout(() => {
      const randGen = rng(seed);
      const out = Array.from({ length: 2000 }, (_, i) => generateQuestionOfType(randGen, i + 1));
      setQuestions(out);
      setCurrent(out[0]);
    }, 100);
  }, [seed]);

  const randomQuestion = () => {
    if (!questions || questions.length === 0) return;
    const i = Math.floor(Math.random() * questions.length);
    setCurrent(questions[i]);
    setShowAnswer(false);
    setShowSolution(false);
  };

  const showAns = () => setShowAnswer(true);
  const showSol = () => setShowSolution(true);

  const regenerate = () => {
    setSeed((s) => s + 1 + Math.floor(Math.random() * 1000));
  };

  return (
    <section className="w-full flex items-start justify-center transition-colors p-2 py-10 duration-500 bg-gradient-to-br from-green-900 via-gray-800 to-black dark:from-[#0b1a0b] dark:via-[#0f0e0e] dark:to-black text-black dark:text-white min-h-screen relative overflow-y-auto">

  {/* Floating Glow */}
  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,255,100,0.15),transparent_70%)] pointer-events-none"></div>
  <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(0,255,100,0.1),transparent_70%)] pointer-events-none"></div>

  {/* Dark/Light Mode Toggle */}
  <button
    onClick={() => setDarkMode(!darkMode)}
    className="fixed md:absolute top-4 right-4 p-2 rounded-full dark:text-green-400 text-green-900 bg-white/40 dark:bg-black/30 backdrop-blur-md border border-white/30 shadow-lg hover:scale-105 transition-transform z-50"
  >
    {darkMode ? <FaSun size={18} /> : <FaMoon size={18} />}
  </button>

  {/* Main Glass Container */}
  <div className="relative z-10 max-w-3xl mx-auto font-[Inter] p-2 md:p-4 space-y-4 bg-white/10 dark:bg-green-900/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-[0_0_30px_rgba(0,255,150,0.1)] transition-all duration-500">
    <h1 className="text-2xl font-bold mb-4 text-center text-green-200">Math Quiz Questions Generator</h1>

    <div className="p-4 rounded-2xl bg-white/20 dark:bg-black/30 border border-white/20 backdrop-blur-md transition-colors duration-500 shadow-inner">
      {!current ? (
        <div>Loading questions...</div>
      ) : (
        <>
          <div style={{ marginBottom: 12 }}>
            <strong>Question #{current.id} — {current.topic}</strong>
          </div>
          <div style={{ whiteSpace: "pre-wrap", fontSize: 18, marginBottom: 12 }}>{current.prompt}</div>

          {showAnswer && (
            <div style={{ marginTop: 16, borderTop: `1px solid ${darkMode ? "#eee" : "#000"}` }}>
              <strong>Answer:</strong>
              <div style={{ whiteSpace: "pre-wrap", marginTop: 6 }}>{current.answer}</div>
            </div>
          )}

          {showSolution && (
            <div style={{ marginTop: 16, borderTop: `1px solid ${darkMode ? "#eee" : "#000"}` }}>
              <strong>Solution:</strong>
              <div
                style={{
                  whiteSpace: "pre-wrap",
                  marginTop: 6,
                  maxHeight: "300px",
                  overflowY: "auto",
                  paddingRight: "6px",
                }}
                className="scrollbar-thin scrollbar-thumb-green-500/40 scrollbar-track-transparent hover:scrollbar-thumb-green-400/60 transition-all"
              >
                {current.solution}
              </div>
            </div>
          )}
        </>
      )}
    </div>

    {/* Buttons */}
    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-4 w-full">
      <button onClick={randomQuestion} className="w-full sm:w-auto py-2 px-4 bg-green-500/30 hover:bg-green-500/50 text-white border border-green-400/50 backdrop-blur-md rounded-xl shadow-lg transition-all duration-200">
        Select question
      </button>
      <button onClick={showAns} className="w-full sm:w-auto py-2 px-4 bg-green-500/30 hover:bg-green-500/50 text-white border border-green-400/50 backdrop-blur-md rounded-xl shadow-lg transition-all duration-200">
        Show answer
      </button>
      <button onClick={showSol} className="w-full sm:w-auto py-2 px-4 bg-green-500/30 hover:bg-green-500/50 text-white border border-green-400/50 backdrop-blur-md rounded-xl shadow-lg transition-all duration-200">
        Show solution
      </button>
      <button onClick={regenerate} className="w-full sm:w-auto py-2 px-4 bg-green-500/30 hover:bg-green-500/50 text-white border border-green-400/50 backdrop-blur-md rounded-xl shadow-lg transition-all duration-200" title="Regenerate the pool with a new seed">
        Regenerate 
      </button>
    </div>
  </div>
</section>


  );
}
