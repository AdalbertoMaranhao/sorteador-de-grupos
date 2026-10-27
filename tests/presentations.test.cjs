const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const source = fs.readFileSync(path.join(__dirname, "..", "script.js"), "utf8");
const storageKey = "sorteador-de-grupos:presentation-progress:v1";

function startApp(data = new Map(), storageOverrides = {}) {
  const nodes = {};
  const timers = new Map();
  let nextId = 0;

  function node() {
    const classes = new Set();
    return {
      value: "", textContent: "", innerHTML: "", listeners: {},
      classList: {
        add: (name) => classes.add(name), remove: (name) => classes.delete(name),
        toggle(name, enabled) { if (enabled) classes.add(name); else classes.delete(name); },
        contains: (name) => classes.has(name)
      },
      addEventListener(type, fn) { this.listeners[type] = fn; },
      append() {}, appendChild() {},
      click() { this.listeners.click?.(); }
    };
  }

  const get = (id) => nodes[id] ||= node();
  get("#team-count").value = "2";
  get("#student-count").value = "4";
  get("#presentation-count").value = "4";
  get("#raffle-form").reset = () => {
    get("#raffle-name").value = get("#student-list").value = "";
  };

  const context = vm.createContext({
    console, TextEncoder,
    document: { querySelector: get, createElement: node },
    localStorage: {
      getItem: (key) => data.get(key) ?? null,
      setItem: (key, value) => data.set(key, value),
      ...storageOverrides
    },
    setInterval(fn) { timers.set(++nextId, fn); return nextId; },
    clearInterval: (id) => timers.delete(id)
  });
  vm.runInContext(source, context);
  return {
    get, data, timers,
    progress: () => JSON.parse(data.get(storageKey)),
    input(id, value) { get(id).value = value; get(id).listeners.input?.(); },
    drawPresentation() { get("#presentation-form").listeners.submit({ preventDefault() {} }); },
    drawTeams() { get("#raffle-form").listeners.submit({ preventDefault() {} }); },
    finishAnimation() {
      for (let tick = 0; tick < 15; tick++) {
        for (const callback of [...timers.values()]) callback();
      }
    }
  };
}

test("count and manual history save automatically and restore in a new session", () => {
  const app = startApp();
  app.input("#presentation-count", "6");
  app.input("#presentation-drawn", "1, 3, 5");
  assert.deepEqual(app.progress(), { version: 1, count: 6, drawn: "1, 3, 5" });
  const reopened = startApp(app.data);
  assert.equal(reopened.get("#presentation-count").value, "6");
  assert.equal(reopened.get("#presentation-drawn").value, "1, 3, 5");
  assert.match(reopened.get("#presentation-status").textContent, /3 de 6.*salvo/);
});

test("a resumed draw excludes presented groups and persists the new result", () => {
  const first = startApp();
  first.input("#presentation-drawn", "1, 2, 3");
  const resumed = startApp(first.data);
  resumed.drawPresentation();
  resumed.finishAnimation();
  assert.equal(resumed.get("#presentation-result").textContent, "🎉 O Grupo 4 vai apresentar!");
  assert.equal(resumed.progress().drawn, "1, 2, 3, 4");
  const completed = startApp(resumed.data);
  completed.drawPresentation();
  assert.equal(completed.timers.size, 0);
  assert.match(completed.get("#presentation-result").textContent, /Todos os grupos/);
});

test("a new round clears saved history, keeps the count, and cancels a pending draw", () => {
  const app = startApp();
  app.input("#presentation-count", "5");
  app.input("#presentation-drawn", "1, 3");
  app.drawPresentation();
  assert.equal(app.timers.size, 1);
  app.get("#reset-presentations").click();
  assert.equal(app.timers.size, 0);
  app.finishAnimation();
  assert.deepEqual(app.progress(), { version: 1, count: 5, drawn: "" });
  const reopened = startApp(app.data);
  assert.equal(reopened.get("#presentation-count").value, "5");
  assert.equal(reopened.get("#presentation-drawn").value, "");
});

test("clearing or redrawing student teams preserves ongoing presentation history", () => {
  const app = startApp();
  app.input("#presentation-count", "6");
  app.input("#presentation-drawn", "2, 4");
  const original = app.data.get(storageKey);
  app.drawTeams();
  app.get("#clear-button").click();
  assert.equal(app.get("#presentation-count").value, "6");
  assert.equal(app.get("#presentation-drawn").value, "2, 4");
  assert.equal(app.data.get(storageKey), original);
});

test("manual edits cancel outdated animations and rapid clicks only draw one group", () => {
  const app = startApp();
  app.drawPresentation(); app.drawPresentation();
  assert.equal(app.timers.size, 1);
  app.input("#presentation-drawn", "1, 2, 3");
  assert.equal(app.timers.size, 0);
  app.drawPresentation(); app.finishAnimation();
  assert.equal(app.progress().drawn, "1, 2, 3, 4");
});

test("invalid counts preserve the last valid saved state; duplicate entries do not repeat", () => {
  const app = startApp();
  app.input("#presentation-drawn", "1, 1, 2, 3, 99, texto");
  const original = app.data.get(storageKey);
  app.input("#presentation-count", "");
  assert.equal(app.data.get(storageKey), original);
  assert.match(app.get("#presentation-status").textContent, /quantidade.*válida/);
  app.drawPresentation();
  assert.equal(app.timers.size, 0);
  app.input("#presentation-count", "4");
  app.drawPresentation(); app.finishAnimation();
  assert.equal(app.progress().drawn, "1, 2, 3, 4");
});

test("blocked or full storage reports failures while presentation draws still work", () => {
  const app = startApp(new Map(), {
    getItem() { throw new Error("Blocked"); },
    setItem() { throw new Error("Quota exceeded"); }
  });
  assert.match(app.get("#presentation-status").textContent, /Não foi possível recuperar/);
  app.input("#presentation-drawn", "1, 2, 3");
  app.drawPresentation(); app.finishAnimation();
  assert.equal(app.get("#presentation-drawn").value, "1, 2, 3, 4");
  assert.match(app.get("#presentation-status").textContent, /Não foi possível salvar/);
  assert.equal(app.get("#presentation-status").classList.contains("error"), true);
});

test("invalid stored progress is reported without modifying it on startup", () => {
  for (const raw of ["{", "null", '{"version":1,"count":0,"drawn":"1"}', '{"version":1,"count":4,"drawn":[]}']) {
    const data = new Map([[storageKey, raw]]);
    const app = startApp(data);
    assert.equal(app.get("#presentation-count").value, "4");
    assert.match(app.get("#presentation-status").textContent, /Não foi possível recuperar/);
    assert.equal(data.get(storageKey), raw);
  }
});
