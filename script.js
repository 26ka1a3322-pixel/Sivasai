(() => {
  const displayEl = document.getElementById("display");
  const historyEl = document.getElementById("history");

  let current = "0";      // number being typed
  let previous = null;    // stored left operand
  let operator = null;    // pending operator
  let justEvaluated = false;

  const symbols = { "+": "+", "-": "−", "*": "×", "/": "÷" };

  function render() {
    displayEl.textContent = current;
    historyEl.textContent =
      previous !== null && operator ? `${previous} ${symbols[operator]}` : "";
  }

  function format(n) {
    if (!isFinite(n)) return "Error";
    return String(parseFloat(n.toPrecision(12)));
  }

  function compute(a, b, op) {
    switch (op) {
      case "+": return a + b;
      case "-": return a - b;
      case "*": return a * b;
      case "/": return b === 0 ? NaN : a / b;
    }
    return b;
  }

  function inputNumber(d) {
    if (current === "Error" || justEvaluated) {
      current = "0";
      justEvaluated = false;
    }
    current = current === "0" ? d : current + d;
  }

  function inputDecimal() {
    if (current === "Error" || justEvaluated) {
      current = "0";
      justEvaluated = false;
    }
    if (!current.includes(".")) current += ".";
  }

  function chooseOperator(op) {
    if (current === "Error") return;
    if (operator && !justEvaluated && previous !== null) {
      current = format(compute(parseFloat(previous), parseFloat(current), operator));
      if (current === "Error") { operator = null; previous = null; return; }
    }
    previous = current;
    operator = op;
    justEvaluated = true; // next digit starts a new number
  }

  function equals() {
    if (operator === null || previous === null || current === "Error") return;
    const result = format(compute(parseFloat(previous), parseFloat(current), operator));
    historyEl.textContent = `${previous} ${symbols[operator]} ${current} =`;
    current = result;
    previous = null;
    operator = null;
    justEvaluated = true;
    displayEl.textContent = current;
  }

  function handleAction(action) {
    switch (action) {
      case "clear":
        current = "0"; previous = null; operator = null; justEvaluated = false;
        break;
      case "backspace":
        if (justEvaluated || current === "Error") break;
        current = current.length > 1 ? current.slice(0, -1) : "0";
        if (current === "-") current = "0";
        break;
      case "percent":
        if (current !== "Error") current = format(parseFloat(current) / 100);
        break;
      case "sign":
        if (current !== "Error" && current !== "0")
          current = current.startsWith("-") ? current.slice(1) : "-" + current;
        break;
      case "decimal": inputDecimal(); break;
      case "equals":
        equals();
        return; // equals() renders itself so the history line stays
    }
    render();
  }

  // Mouse / touch
  document.querySelector(".keys").addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    if (btn.dataset.num !== undefined) { inputNumber(btn.dataset.num); render(); }
    else if (btn.dataset.op) { chooseOperator(btn.dataset.op); render(); }
    else if (btn.dataset.action) handleAction(btn.dataset.action);
  });

  // Keyboard
  document.addEventListener("keydown", (e) => {
    if (/^[0-9]$/.test(e.key)) { inputNumber(e.key); render(); }
    else if (["+", "-", "*", "/"].includes(e.key)) { e.preventDefault(); chooseOperator(e.key); render(); }
    else if (e.key === "." || e.key === ",") handleAction("decimal");
    else if (e.key === "Enter" || e.key === "=") { e.preventDefault(); handleAction("equals"); }
    else if (e.key === "Backspace") handleAction("backspace");
    else if (e.key === "Escape" || e.key.toLowerCase() === "c") handleAction("clear");
    else if (e.key === "%") handleAction("percent");
  });

  render();
})();
