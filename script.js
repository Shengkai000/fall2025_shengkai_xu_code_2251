/* script.js — shared for all pages */

// --- Data -------------------------------------------------------------

// Home: Featured tutorials
const featuredTutorials = [
  {
    title: "Unity Movement Script",
    description: "Move a player using Rigidbody and C# in Unity.",
    category: "Unity",
    imageUrl: "images/unity_movement.jpg"
  },
  {
    title: "Unreal Blueprint Basics",
    description: "Create gameplay logic visually with Blueprints.",
    category: "Unreal",
    imageUrl: "images/unreal_blueprint.jpg"
  },
  {
    title: "Unity Loop Examples",
    description: "for / while / foreach with practical samples.",
    category: "Unity",
    imageUrl: "images/unity_loops.jpg"
  },
  {
    title: "C++ Conditions in Unreal",
    description: "if / else and switch patterns for gameplay code.",
    category: "Unreal",
    imageUrl: "images/unreal_condition.jpg"
  },
  {
    title: "Shader Graph Tips",
    description: "Stylish materials with Unity’s Shader Graph.",
    category: "Unity",
    imageUrl: "images/unity_shader.jpg"
  }
];

// Unity Community: category cards (title + count text)
const unityCategories = [
  { title: "C#", countText: "387 list problems", href: "unity-csharp.html" },
  { title: "Loop", countText: "234 list problems", href: "unity-csharp.html" },
  { title: "Condition", countText: "198 list problems", href: "unity-csharp.html" }
];

// Unity C#: list rows (rank, title, excerpt, rating, link)
const csharpPosts = [
  {
    rank: 1,
    title: "How to write your first C# code in Unity",
    excerpt: "Create a MonoBehaviour, print to Console, update transform…",
    rating: 5,
    href: "unity-csharp-post.html"
  },
  {
    rank: 2,
    title: "Why am I getting a NullReferenceException?",
    excerpt: "Common causes and how to debug references and components…",
    rating: 3.5,
    href: "unity-csharp-post.html"
  },
  {
    rank: 3,
    title: "Understanding Update vs FixedUpdate",
    excerpt: "Frame-based vs physics step timing, when to use each…",
    rating: 4,
    href: "unity-csharp-post.html"
  }
];


// --- Helpers ----------------------------------------------------------

function createEl(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (k === "class") el.className = v;
    else if (k === "html") el.innerHTML = v;
    else if (k === "text") el.textContent = v;
    else el.setAttribute(k, v);
  });
  children.forEach(child => {
    if (child == null) return;
    if (typeof child === "string") el.appendChild(document.createTextNode(child));
    else el.appendChild(child);
  });
  return el;
}

function buildStars(rating) {
  // Produces five spans with .star / .mute, supporting halves
  const wrap = createEl("div", { class: "stars", "aria-label": `rating ${rating} of 5` });
  for (let i = 1; i <= 5; i++) {
    const span = createEl("span", { class: "star" });
    const diff = rating - i;
    if (diff >= 0) {
      // full star (do nothing, default var(--star))
    } else if (diff > -1 && diff < 0) {
      // half star via linear-gradient like in your HTML
      const pct = Math.round((rating - (i - 1)) * 100); // 1..99
      span.style.background = `linear-gradient(90deg, var(--star) ${pct}%, var(--star-muted) ${pct}%)`;
    } else {
      span.classList.add("mute");
    }
    wrap.appendChild(span);
  }
  return wrap;
}


// --- Renderers --------------------------------------------------------

function renderHome() {
  const container = document.getElementById("content-container");
  if (!container) return;

  featuredTutorials.forEach(item => {
    const card = createEl("div", { class: "item" });
            card.append(h3, p, badge);
    container.appendChild(card);
  });
}

function renderUnityCommunity() {
  const cards = document.querySelector(".cards");
  if (!cards) return;

  // If cards already have children (from HTML), don't duplicate
  if (cards.children.length > 0) return;

  unityCategories.forEach(c => {
    const a = createEl("a", { class: "card", href: c.href, role: "listitem", "aria-label": `${c.title} ${c.countText}` },
      createEl("h4", { text: c.title }),
      createEl("p", { class: "muted", text: c.countText })
    );
    cards.appendChild(a);
  });
}

function renderUnityCSharpList() {
  const list = document.querySelector(".list");
  // Only render if there is a .list and it's empty (to avoid duplicate rows)
  if (!list || list.children.length > 0) return;

  csharpPosts.forEach(post => {
    const rank = createEl("div", { class: "rank" },
      createEl("small", { text: "Top" }),
      createEl("div", { text: String(post.rank) })
    );

    const content = createEl("div", { class: "content" },
      createEl("h4", { text: post.title }),
      createEl("p", { text: post.excerpt })
    );

    const stars = buildStars(post.rating);
    const row = createEl("a", { class: "row", href: post.href }, rank, content, stars);
    list.appendChild(row);
  });
}


// --- Init -------------------------------------------------------------

document.addEventListener("DOMContentLoaded", () => {
  // Safely run on all pages. Renderers will no-op if containers aren't present.
  renderHome();
  renderUnityCommunity();
  renderUnityCSharpList();
});
