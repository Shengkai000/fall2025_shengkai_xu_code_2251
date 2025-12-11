// script.js
// Front-end logic for the code configurator and AI helper

// --- Unity movement template ---------------------------------------------

const unityMovementTemplate = `
using UnityEngine;

public class {{CLASS_NAME}} : MonoBehaviour
{
    public float speed = 5f;
{{RIGIDBODY_FIELD}}

    void Awake()
    {
{{RIGIDBODY_AWAKE}}
    }

    void Update()
    {
{{INPUT_BLOCK}}
{{JUMP_BLOCK}}
    }
}
`.trim();

// Build code based on configuration from the form
function buildCodeFromConfig(config) {
  const is2D = config.dimension === "2d";
  const useRigidbody = config.movementType === "rigidbody";

  let rigidField = "";
  let rigidAwake = "";
  let inputBlock = "";
  let jumpBlock = "";

  if (useRigidbody) {
    const rbType = is2D ? "Rigidbody2D" : "Rigidbody";
    rigidField = `    private ${rbType} rb;`;
    rigidAwake = `        rb = GetComponent<${rbType}>();`;

    const vecType = is2D ? "Vector2" : "Vector3";

    const moveAssign = is2D
      ? `${vecType} move = new ${vecType}(Input.GetAxis("Horizontal"), 0f);`
      : `${vecType} move = new ${vecType}(Input.GetAxis("Horizontal"), 0f, Input.GetAxis("Vertical"));`;

    const velocityLine = is2D
      ? `rb.velocity = new ${vecType}(move.x * speed, rb.velocity.y);`
      : `rb.velocity = new ${vecType}(move.x * speed, rb.velocity.y, move.z * speed);`;

    inputBlock =
`        // Read input and move using Rigidbody
        ${moveAssign}
        ${velocityLine}`;
  } else {
    const vecType = is2D ? "Vector2" : "Vector3";
    const moveAssign = is2D
      ? `${vecType} move = new ${vecType}(Input.GetAxis("Horizontal"), 0f);`
      : `${vecType} move = new ${vecType}(Input.GetAxis("Horizontal"), 0f, Input.GetAxis("Vertical"));`;

    const translateVec = is2D
      ? `new Vector3(move.x, 0f, 0f)`
      : `new Vector3(move.x, 0f, move.z)`;

    inputBlock =
`        // Read input and move using Transform
        ${moveAssign}
        transform.Translate(${translateVec} * speed * Time.deltaTime);`;
  }

  if (config.enableJump && useRigidbody) {
    const forceType = is2D ? "Vector2" : "Vector3";
    const upVec = is2D ? `${forceType}.up` : `${forceType}.up`;

    jumpBlock =
`
        // Simple jump
        if (Input.GetButtonDown("Jump"))
        {
            // NOTE: replace "isGrounded" with your own ground check
            rb.AddForce(${upVec} * 5f, ForceMode2D.Impulse);
        }`;
  }

  return unityMovementTemplate
    .replace(/{{CLASS_NAME}}/g, config.className || "MyFirstScript")
    .replace("{{RIGIDBODY_FIELD}}", rigidField)
    .replace("{{RIGIDBODY_AWAKE}}", rigidAwake || "        // No Rigidbody required for Transform-based movement")
    .replace("{{INPUT_BLOCK}}", inputBlock)
    .replace("{{JUMP_BLOCK}}", jumpBlock);
}

// --- Init code generator --------------------------------------------------

function initCodeGenerator() {
  const form = document.getElementById("code-config-form");
  const output = document.getElementById("generated-code");

  if (!form || !output) return;

  function getConfigFromForm() {
    const className = document.getElementById("config-class-name").value.trim() || "MyFirstScript";
    const dimension = document.getElementById("config-dimension").value;
    const movementType = document.getElementById("config-movement-type").value;
    const enableJump = document.getElementById("config-enable-jump").checked;

    return { className, dimension, movementType, enableJump };
  }

  function render() {
    const config = getConfigFromForm();
    const code = buildCodeFromConfig(config);
    output.textContent = code;
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    render();
  });

  // Initial render
  render();
}

// --- Init AI helper -------------------------------------------------------

function initAIHelper() {
  const btn = document.getElementById("ai-ask-btn");
  const textarea = document.getElementById("ai-question");
  const answerEl = document.getElementById("ai-answer");
  const snippetEl = document.getElementById("snippet-code");

  if (!btn || !textarea || !answerEl || !snippetEl) return;

  btn.addEventListener("click", async () => {
    const question = textarea.value.trim();
    if (!question) {
      answerEl.textContent = "Please type a question or describe your project.";
      return;
    }

    answerEl.textContent = "Asking AI…";

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          code: snippetEl.textContent
        })
      });

      if (!res.ok) {
        answerEl.textContent = "AI request failed. Please try again later.";
        return;
      }

      const data = await res.json();
      answerEl.textContent = data.answer || "No answer returned from AI.";
    } catch (err) {
      console.error(err);
      answerEl.textContent = "Error contacting AI service.";
    }
  });
}

// --- Scroll reveal micro animation ----------------------------------------

function initScrollReveal() {
  const elements = document.querySelectorAll(".reveal-on-scroll");
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          // 可选：显示一次后不再观察
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.15
    }
  );

  elements.forEach((el) => observer.observe(el));
}

// --- Global init ----------------------------------------------------------

document.addEventListener("DOMContentLoaded", () => {
  initCodeGenerator();
  initAIHelper();
  initScrollReveal();
});
