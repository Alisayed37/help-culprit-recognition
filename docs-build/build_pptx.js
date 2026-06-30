const pptxgen = require("pptxgenjs");
const ROOT = "F:/GP/code/docs-build";
const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.33 x 7.5
pres.author = "Help Culprit Recognition Team";
pres.title = "Help Culprit Recognition";

// ---- palette ----
const BG_DARK = "0F1626", NAVY = "16213E", HEAD = "0F3460", ACCENT = "2E8BC0",
      CYAN = "21D4FD", CARD = "F2F6FA", TEXTD = "1A2233", MUTED = "5A6478", WHITE = "FFFFFF";
const SERIF = "Cambria", SANS = "Calibri";
const W = 13.33, H = 7.5;
const sh = () => ({ type: "outer", color: "9BB0C5", blur: 8, offset: 3, angle: 90, opacity: 0.25 });

function title(slide, txt, sub) {
  slide.addText(txt, { x: 0.6, y: 0.4, w: 12.1, h: 0.7, fontFace: SERIF, fontSize: 30, bold: true, color: HEAD, margin: 0 });
  if (sub) slide.addText(sub, { x: 0.62, y: 1.08, w: 12.1, h: 0.4, fontFace: SANS, fontSize: 14, italic: true, color: ACCENT, margin: 0 });
}
function light(slide) { slide.background = { color: WHITE }; }
function dark(slide) { slide.background = { color: BG_DARK }; }
function card(slide, x, y, w, h, fill) {
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.08, fill: { color: fill || CARD }, shadow: sh() });
}
function numCircle(slide, x, y, n, color) {
  slide.addShape(pres.shapes.OVAL, { x, y, w: 0.5, h: 0.5, fill: { color: color || ACCENT } });
  slide.addText(String(n), { x, y, w: 0.5, h: 0.5, align: "center", valign: "middle", fontFace: SANS, fontSize: 18, bold: true, color: WHITE, margin: 0 });
}

// ============ 1. TITLE ============
let s = pres.addSlide(); dark(s);
s.addShape(pres.shapes.OVAL, { x: 10.4, y: -1.6, w: 5, h: 5, fill: { color: NAVY } });
s.addShape(pres.shapes.OVAL, { x: -1.4, y: 4.6, w: 4.4, h: 4.4, fill: { color: NAVY } });
s.addText("HELP CULPRIT RECOGNITION", { x: 0.8, y: 2.0, w: 11.7, h: 1.0, fontFace: SERIF, fontSize: 44, bold: true, color: WHITE, charSpacing: 1, margin: 0 });
s.addText("An AI-Powered Forensic Suspect Retrieval System", { x: 0.82, y: 3.0, w: 11.5, h: 0.5, fontFace: SANS, fontSize: 20, color: CYAN, margin: 0 });
s.addText([
  { text: "Graduation Project  ·  Department of Information Systems", options: { breakLine: true, fontSize: 14, color: "AEBED2" } },
  { text: "Faculty of Computer and Information Sciences  ·  Ain Shams University", options: { fontSize: 14, color: "AEBED2" } },
], { x: 0.82, y: 3.75, w: 11.5, h: 0.8, fontFace: SANS, margin: 0 });
s.addText([
  { text: "Team:  ", options: { bold: true, color: WHITE } },
  { text: "Ali Sayed · Wasim Abdelhalem · Adel Ahmed · Mohamed Mowaffak · Ahmed Zayed", options: { color: "AEBED2" } },
], { x: 0.82, y: 5.5, w: 11.6, h: 0.4, fontFace: SANS, fontSize: 13, margin: 0 });
s.addText([
  { text: "Supervisor:  ", options: { bold: true, color: WHITE } },
  { text: "Dr. Fatma Mohamed", options: { color: "AEBED2" } },
  { text: "      Teaching Assistant:  ", options: { bold: true, color: WHITE } },
  { text: "Shamia Abdallah Ahmed", options: { color: "AEBED2" } },
], { x: 0.82, y: 5.95, w: 11.6, h: 0.4, fontFace: SANS, fontSize: 13, margin: 0 });
s.addText("2025 / 2026", { x: 0.82, y: 6.5, w: 4, h: 0.4, fontFace: SANS, fontSize: 13, color: ACCENT, bold: true, margin: 0 });
s.addNotes("Introduce the project: an AI tool that finds suspects in a photo database from a witness's text description or a reference image. Built as a full-stack system with a fine-tuned CLIP model.");

// ============ 2. AGENDA ============
s = pres.addSlide(); light(s); title(s, "Agenda");
const agenda = [
  "Problem & Motivation", "Objectives", "Background: Vision-Language Models",
  "System Architecture", "Technology Stack", "AI Methodology",
  "How Search Works", "Certainty Weighting", "Results & Evaluation",
  "Key Findings", "Limitations & Future Work", "Conclusion",
];
agenda.forEach((it, i) => {
  const col = Math.floor(i / 6), row = i % 6;
  const x = 0.8 + col * 6.2, y = 1.55 + row * 0.85;
  numCircle(s, x, y, i + 1);
  s.addText(it, { x: x + 0.65, y: y, w: 5.2, h: 0.5, valign: "middle", fontFace: SANS, fontSize: 16, color: TEXTD, margin: 0 });
});
s.addNotes("Roadmap of the talk: motivation, objectives, the model and architecture, then the results — which is where most questions will focus.");

// ============ 3. PROBLEM & MOTIVATION ============
s = pres.addSlide(); light(s); title(s, "Problem & Motivation");
card(s, 0.8, 1.55, 5.7, 4.9, CARD);
s.addText("The Problem", { x: 1.1, y: 1.8, w: 5.1, h: 0.5, fontFace: SERIF, fontSize: 20, bold: true, color: HEAD, margin: 0 });
s.addText([
  { text: "A witness describes a suspect in words.", options: { bullet: true, breakLine: true } },
  { text: "Evidence is an unlabelled pile of photographs.", options: { bullet: true, breakLine: true } },
  { text: "Investigators bridge the two manually — slow, tiring, and inconsistent.", options: { bullet: true, breakLine: true } },
  { text: "Beyond a few hundred images, exhaustive review is impractical.", options: { bullet: true } },
], { x: 1.1, y: 2.35, w: 5.2, h: 3.9, fontFace: SANS, fontSize: 16, color: TEXTD, paraSpaceAfter: 10, margin: 0 });
card(s, 6.85, 1.55, 5.7, 4.9, "EAF2F8");
s.addText("Our Approach", { x: 7.15, y: 1.8, w: 5.1, h: 0.5, fontFace: SERIF, fontSize: 20, bold: true, color: HEAD, margin: 0 });
s.addText([
  { text: "Close the “semantic gap” between language and pixels.", options: { bullet: true, breakLine: true } },
  { text: "Use a vision-language model to compare text directly with images.", options: { bullet: true, breakLine: true } },
  { text: "Rank candidates by confidence and present them as leads.", options: { bullet: true, breakLine: true } },
  { text: "Keep a human in the loop — a tool, not an identification.", options: { bullet: true } },
], { x: 7.15, y: 2.35, w: 5.2, h: 3.9, fontFace: SANS, fontSize: 16, color: TEXTD, paraSpaceAfter: 10, margin: 0 });
s.addNotes("Frame the semantic gap clearly. Emphasize the system is a decision-support tool producing ranked leads, never an autonomous identification.");

// ============ 4. OBJECTIVES ============
s = pres.addSlide(); light(s); title(s, "Objectives");
const objs = [
  ["End-to-end retrieval", "Search a gallery by text description or by a reference image."],
  ["Fine-tuned model", "Specialize CLIP for facial-attribute matching."],
  ["Interpretable results", "Ranked matches with clear percentage scores."],
  ["Secure & multi-user", "Each investigator isolated to their own cases."],
  ["Quantified benefit", "Measure fine-tuning with Recall@K on our own models."],
  ["Clean architecture", "Maintainable, service-oriented, extensible design."],
];
objs.forEach((o, i) => {
  const col = i % 2, row = Math.floor(i / 2);
  const x = 0.8 + col * 6.2, y = 1.55 + row * 1.62;
  card(s, x, y, 5.7, 1.42, CARD);
  numCircle(s, x + 0.28, y + 0.46, i + 1);
  s.addText(o[0], { x: x + 1.0, y: y + 0.18, w: 4.5, h: 0.45, fontFace: SERIF, fontSize: 17, bold: true, color: HEAD, margin: 0 });
  s.addText(o[1], { x: x + 1.0, y: y + 0.66, w: 4.5, h: 0.65, fontFace: SANS, fontSize: 13.5, color: MUTED, margin: 0 });
});
s.addNotes("Six concrete objectives. The fifth — quantifying the benefit of fine-tuning — is what sets this apart from a demo and is backed by the results slides.");

// ============ 5. BACKGROUND: CLIP ============
s = pres.addSlide(); light(s); title(s, "Background: Vision-Language Models (CLIP)", "Both images and text become points in one shared 512-dimensional space");
const bg = [
  ["Two encoders", "An image encoder (ViT-B/32) and a text encoder trained together."],
  ["Shared space", "A photo and a sentence that describes it land close together."],
  ["Contrastive training", "Matching image–text pairs are pulled together; mismatches pushed apart."],
  ["Direct comparison", "Similarity is a simple cosine (dot product) of normalized vectors."],
];
bg.forEach((b, i) => {
  const col = i % 2, row = Math.floor(i / 2);
  const x = 0.8 + col * 6.2, y = 1.95 + row * 1.85;
  card(s, x, y, 5.7, 1.62, CARD);
  s.addText(b[0], { x: x + 0.35, y: y + 0.2, w: 5.0, h: 0.45, fontFace: SERIF, fontSize: 18, bold: true, color: ACCENT, margin: 0 });
  s.addText(b[1], { x: x + 0.35, y: y + 0.72, w: 5.05, h: 0.8, fontFace: SANS, fontSize: 14.5, color: TEXTD, margin: 0 });
});
s.addNotes("Explain CLIP simply: it learns to map images and matching captions to nearby points. That shared space is what lets us search images with text.");

// ============ 6. ARCHITECTURE ============
s = pres.addSlide(); light(s); title(s, "System Architecture", "Three-tier web application plus a dedicated AI microservice");
s.addImage({ path: `${ROOT}/arch.png`, x: 2.46, y: 1.6, w: 8.4, h: 5.6 });
s.addNotes("Three tiers plus an AI microservice. The .NET API is the single gateway: the browser never talks to the database or the Python service directly. This centralizes security.");

// ============ 7. TECH STACK ============
s = pres.addSlide(); light(s); title(s, "Technology Stack");
const techRows = [
  ["Frontend", "React 19 · Vite · Axios · React Router"],
  ["Backend API", "ASP.NET Core 8 (C#) · JWT · BCrypt"],
  ["Data", "MySQL 8 · Entity Framework Core 8"],
  ["AI Service", "Python · FastAPI · Uvicorn"],
  ["ML Framework", "PyTorch (CUDA) · Hugging Face Transformers"],
  ["Model", "Fine-tuned CLIP ViT-B/32 · 512-dim embeddings"],
];
techRows.forEach((r, i) => {
  const y = 1.6 + i * 0.86;
  card(s, 0.8, y, 11.7, 0.74, i % 2 ? "EAF2F8" : CARD);
  s.addText(r[0], { x: 1.1, y: y, w: 3.2, h: 0.74, valign: "middle", fontFace: SERIF, fontSize: 16, bold: true, color: HEAD, margin: 0 });
  s.addText(r[1], { x: 4.4, y: y, w: 7.9, h: 0.74, valign: "middle", fontFace: SANS, fontSize: 15, color: TEXTD, margin: 0 });
});
s.addNotes("Heterogeneous stack chosen so each tier uses the best tool: Python for ML, C# for the transactional layer, React for the UI. The microservice split lets them evolve independently.");

// ============ 8. AI METHODOLOGY ============
s = pres.addSlide(); light(s); title(s, "AI Methodology: Fine-Tuning Pipeline", "Specializing a general CLIP model for facial-attribute retrieval");
const steps = [
  ["CelebA", "Face images with 40 binary attributes (glasses, beard, age…)."],
  ["Synthetic Captions", "Rule-based: attributes → natural sentences (e.g. “a man wearing glasses”)."],
  ["Transfer Learning", "Start from pre-trained CLIP; partial freezing of layers."],
  ["Contrastive Training", "AdamW optimizer · symmetric cross-entropy loss · checkpoints saved per epoch."],
];
steps.forEach((st, i) => {
  const x = 0.8 + i * 3.05;
  card(s, x, 2.0, 2.8, 3.6, CARD);
  numCircle(s, x + 1.15, 2.25, i + 1);
  s.addText(st[0], { x: x + 0.2, y: 2.95, w: 2.4, h: 0.6, align: "center", fontFace: SERIF, fontSize: 16.5, bold: true, color: HEAD, margin: 0 });
  s.addText(st[1], { x: x + 0.2, y: 3.55, w: 2.4, h: 1.9, align: "center", fontFace: SANS, fontSize: 13, color: TEXTD, margin: 0 });
  if (i < 3) s.addShape(pres.shapes.LINE, { x: x + 2.82, y: 3.8, w: 0.2, h: 0, line: { color: ACCENT, width: 2.5, endArrowType: "triangle" } });
});
s.addNotes("Key point examiners ask about: CelebA gives binary labels, but CLIP needs captions — so we generate sentences from the attributes. Partial freezing avoids catastrophic forgetting and overfitting.");

// ============ 9. HOW SEARCH WORKS ============
s = pres.addSlide(); light(s); title(s, "How Search Works", "Text or image query → one shared space → ranked matches");
const sst = [
  ["Encode query", "The description (or query image) becomes a 512-dim vector."],
  ["Load index", "Pre-computed image vectors for the case are read from disk."],
  ["Compute similarity", "One matrix operation scores every image by cosine similarity."],
  ["Return matches", "Investigator chooses how many (5 by default), with percentage scores."],
];
sst.forEach((st, i) => {
  const y = 1.95 + i * 1.18;
  card(s, 0.8, y, 11.7, 1.0, i % 2 ? "EAF2F8" : CARD);
  numCircle(s, 1.1, y + 0.25, i + 1);
  s.addText(st[0], { x: 1.85, y: y, w: 3.3, h: 1.0, valign: "middle", fontFace: SERIF, fontSize: 17, bold: true, color: HEAD, margin: 0 });
  s.addText(st[1], { x: 5.2, y: y, w: 7.1, h: 1.0, valign: "middle", fontFace: SANS, fontSize: 14.5, color: TEXTD, margin: 0 });
});
s.addNotes("Because vectors are precomputed at index time, a search is a single fast matrix operation — effectively instant. Image search is identical except the query is encoded by the image encoder.");

// ============ 10. CERTAINTY WEIGHTING ============
s = pres.addSlide(); light(s); title(s, "Certainty Weighting", "Letting the investigator express confidence in each facial attribute");
card(s, 0.8, 1.7, 5.7, 4.7, CARD);
s.addText("How it works", { x: 1.1, y: 1.95, w: 5, h: 0.5, fontFace: SERIF, fontSize: 19, bold: true, color: HEAD, margin: 0 });
s.addText([
  { text: "Sliders for glasses, beard, mustache, hat, bald, young, old.", options: { bullet: true, breakLine: true } },
  { text: "Each expresses the witness’s confidence (0–100%).", options: { bullet: true, breakLine: true } },
  { text: "Above 50%, the attribute phrase is appended to the query.", options: { bullet: true, breakLine: true } },
  { text: "This steers the embedding toward the desired traits.", options: { bullet: true } },
], { x: 1.1, y: 2.5, w: 5.2, h: 3.6, fontFace: SANS, fontSize: 15.5, color: TEXTD, paraSpaceAfter: 12, margin: 0 });
card(s, 6.85, 1.7, 5.7, 4.7, "EAF2F8");
s.addText("Example", { x: 7.15, y: 1.95, w: 5, h: 0.5, fontFace: SERIF, fontSize: 19, bold: true, color: HEAD, margin: 0 });
s.addText([
  { text: "Base query:  ", options: { bold: true } },
  { text: "“a man”", options: { italic: true, color: ACCENT } },
], { x: 7.15, y: 2.6, w: 5.2, h: 0.4, fontFace: SANS, fontSize: 16, color: TEXTD, margin: 0 });
s.addText("+ Glasses 80%      + Beard 65%", { x: 7.15, y: 3.1, w: 5.2, h: 0.4, fontFace: SANS, fontSize: 15, color: MUTED, margin: 0 });
s.addShape(pres.shapes.LINE, { x: 7.15, y: 3.7, w: 5.0, h: 0, line: { color: ACCENT, width: 1.5 } });
s.addText([
  { text: "Final query:  ", options: { bold: true } },
  { text: "“a man, wearing glasses, with a beard”", options: { italic: true, color: HEAD } },
], { x: 7.15, y: 3.95, w: 5.3, h: 0.9, fontFace: SANS, fontSize: 16, color: TEXTD, margin: 0 });
s.addText("A lightweight, transparent form of query expansion.", { x: 7.15, y: 5.4, w: 5.2, h: 0.7, fontFace: SANS, fontSize: 13.5, italic: true, color: MUTED, margin: 0 });
s.addNotes("Threshold-based query expansion: each slider above 50% appends its attribute phrase to the typed query, and the complete sentence is encoded as one unit. We also implemented a continuous embedding-interpolation variant, but the threshold approach gave more accurate retrieval on our fine-tuned model because encoding the full sentence preserves the contextual interaction between attributes. With no sliders raised it reduces to a plain text search.");

// ============ 11. RESULTS — LEARNING CURVE ============
s = pres.addSlide(); light(s); title(s, "Results: Recall@K Learning Curve", "Measured on all 9 checkpoints over a 536-image CelebA evaluation set");
const ep = ["0", "1", "2", "3", "4", "5", "6", "7", "8"];
s.addChart(pres.charts.LINE, [
  { name: "Recall@1", labels: ep, values: [3.73, 5.60, 6.34, 6.16, 6.72, 6.72, 7.46, 6.53, 6.34] },
  { name: "Recall@5", labels: ep, values: [13.25, 20.90, 20.71, 20.52, 21.08, 20.71, 21.08, 19.96, 20.15] },
  { name: "Recall@10", labels: ep, values: [21.08, 31.72, 31.34, 29.85, 29.85, 29.10, 30.60, 29.66, 29.66] },
], {
  x: 0.7, y: 1.7, w: 8.3, h: 5.3, chartColors: [ACCENT, HEAD, "D2783C"],
  lineSize: 3, lineSmooth: false, showLegend: true, legendPos: "b", legendFontSize: 13,
  showValue: false, catAxisTitle: "Training epoch", showCatAxisTitle: true,
  valAxisTitle: "Recall (%)", showValAxisTitle: true, valAxisMaxVal: 35, valAxisMinVal: 0,
  catAxisLabelColor: MUTED, valAxisLabelColor: MUTED, valGridLine: { color: "E2E8F0", size: 0.5 },
});
card(s, 9.3, 1.85, 3.4, 4.9, "EAF2F8");
s.addText("Reading the curve", { x: 9.55, y: 2.05, w: 2.95, h: 0.5, fontFace: SERIF, fontSize: 16, bold: true, color: HEAD, margin: 0 });
s.addText([
  { text: "Big jump at epoch 1.", options: { bullet: true, breakLine: true } },
  { text: "Recall@1 peaks at epoch 6 (7.46%).", options: { bullet: true, breakLine: true } },
  { text: "Declines through epochs 7–8 = overfitting.", options: { bullet: true, breakLine: true } },
  { text: "Full curve cleanly brackets the optimum.", options: { bullet: true } },
], { x: 9.55, y: 2.6, w: 2.95, h: 4.0, fontFace: SANS, fontSize: 13.5, color: TEXTD, paraSpaceAfter: 10, margin: 0 });
s.addNotes("THE key graph. Walk each line. Recall@1 is strictest and peaks at epoch 6 (7.46%). The dip at epoch 8 is overfitting. Stress all numbers are our own measurements under one protocol.");

// ============ 12. RESULTS — COMPARISON ============
s = pres.addSlide(); light(s); title(s, "Results: Baseline vs. Fine-Tuned", "Fine-tuning roughly doubles top-1 retrieval accuracy");
s.addChart(pres.charts.BAR, [
  { name: "Epoch 0 (baseline)", labels: ["Recall@1", "Recall@5", "Recall@10"], values: [3.73, 13.25, 21.08] },
  { name: "Epoch 3 (default)", labels: ["Recall@1", "Recall@5", "Recall@10"], values: [6.16, 20.52, 29.85] },
  { name: "Epoch 6 (best)", labels: ["Recall@1", "Recall@5", "Recall@10"], values: [7.46, 21.08, 30.60] },
], {
  x: 0.7, y: 1.7, w: 8.3, h: 5.3, barDir: "col", chartColors: ["9AA8BC", ACCENT, HEAD],
  showValue: true, dataLabelPosition: "outEnd", dataLabelColor: TEXTD, dataLabelFontSize: 10,
  dataLabelFormatCode: "0.0",
  showLegend: true, legendPos: "b", legendFontSize: 13, valAxisMaxVal: 35, valAxisMinVal: 0,
  catAxisLabelColor: MUTED, valAxisLabelColor: MUTED, valGridLine: { color: "E2E8F0", size: 0.5 },
});
card(s, 9.3, 1.85, 3.4, 4.9, "EAF2F8");
s.addText("Takeaways", { x: 9.55, y: 2.05, w: 2.95, h: 0.5, fontFace: SERIF, fontSize: 16, bold: true, color: HEAD, margin: 0 });
s.addText([
  { text: "Every fine-tuned checkpoint beats the baseline on every metric.", options: { bullet: true, breakLine: true } },
  { text: "Recall@1: 3.73% → 7.46% (a doubling).", options: { bullet: true, breakLine: true } },
  { text: "Random chance ≈ 0.19% over 536 images.", options: { bullet: true } },
], { x: 9.55, y: 2.6, w: 2.95, h: 4.0, fontFace: SANS, fontSize: 13.5, color: TEXTD, paraSpaceAfter: 12, margin: 0 });
s.addNotes("Grouped bars compare baseline, the deployed default (epoch 3), and the best (epoch 6). The doubling of Recall@1 is the headline result. Mention the random floor for context.");

// ============ 13. KEY FINDINGS ============
s = pres.addSlide(); light(s); title(s, "Key Findings");
const stats = [
  ["2×", "top-1 accuracy vs. the pre-trained baseline"],
  ["Epoch 6", "best checkpoint (Recall@1 = 7.46%)"],
  ["Epoch 8", "performance dips — onset of overfitting"],
];
stats.forEach((st, i) => {
  const x = 0.8 + i * 4.05;
  card(s, x, 1.9, 3.75, 2.6, CARD);
  s.addText(st[0], { x: x + 0.2, y: 2.2, w: 3.35, h: 1.1, align: "center", fontFace: SERIF, fontSize: 48, bold: true, color: ACCENT, margin: 0 });
  s.addText(st[1], { x: x + 0.3, y: 3.45, w: 3.15, h: 0.9, align: "center", fontFace: SANS, fontSize: 14, color: TEXTD, margin: 0 });
});
card(s, 0.8, 4.85, 11.75, 1.7, "EAF2F8");
s.addText("Why it matters", { x: 1.1, y: 5.0, w: 5, h: 0.4, fontFace: SERIF, fontSize: 16, bold: true, color: HEAD, margin: 0 });
s.addText("Fine-tuning on facial captions produces a substantial, measurable, and operationally meaningful gain — the correct suspect reaches the very top of the ranking about twice as often — with a clear optimal stopping point before overfitting sets in.",
  { x: 1.1, y: 5.4, w: 11.2, h: 1.0, fontFace: SANS, fontSize: 15, color: TEXTD, margin: 0 });
s.addNotes("Three headline numbers. The overfitting finding is a strength, not a weakness — it shows we evaluated rigorously and understand the model's behavior.");

// ============ 14. LIMITATIONS & FUTURE WORK ============
s = pres.addSlide(); light(s); title(s, "Limitations & Future Work");
card(s, 0.8, 1.6, 5.7, 5.0, CARD);
s.addText("Limitations", { x: 1.1, y: 1.85, w: 5, h: 0.5, fontFace: SERIF, fontSize: 19, bold: true, color: HEAD, margin: 0 });
s.addText([
  { text: "Evaluation on a 536-image subset with rule-based captions (indicative, not definitive).", options: { bullet: true, breakLine: true } },
  { text: "Exhaustive search — not yet optimized for very large galleries.", options: { bullet: true, breakLine: true } },
  { text: "Development security configuration needs hardening.", options: { bullet: true, breakLine: true } },
  { text: "Quality degrades on occluded or non-frontal faces.", options: { bullet: true } },
], { x: 1.1, y: 2.45, w: 5.2, h: 4.0, fontFace: SANS, fontSize: 14.5, color: TEXTD, paraSpaceAfter: 12, margin: 0 });
card(s, 6.85, 1.6, 5.7, 5.0, "EAF2F8");
s.addText("Future Work", { x: 7.15, y: 1.85, w: 5, h: 0.5, fontFace: SERIF, fontSize: 19, bold: true, color: HEAD, margin: 0 });
s.addText([
  { text: "Full evaluation on the held-out split with training-aligned captions.", options: { bullet: true, breakLine: true } },
  { text: "Approximate nearest-neighbour index for national-scale galleries.", options: { bullet: true, breakLine: true } },
  { text: "Promote epoch 6 as default; automate checkpoint selection.", options: { bullet: true, breakLine: true } },
  { text: "Role-based access, audit trail, and containerized deployment.", options: { bullet: true } },
], { x: 7.15, y: 2.45, w: 5.2, h: 4.0, fontFace: SANS, fontSize: 14.5, color: TEXTD, paraSpaceAfter: 12, margin: 0 });
s.addNotes("Be candid about limitations — examiners respect honesty. The most consequential future step is replacing exhaustive search to scale up.");

// ============ 15. CONCLUSION ============
s = pres.addSlide(); dark(s);
s.addShape(pres.shapes.OVAL, { x: 10.8, y: 4.7, w: 4.6, h: 4.6, fill: { color: NAVY } });
s.addText("Conclusion", { x: 0.8, y: 0.7, w: 11, h: 0.9, fontFace: SERIF, fontSize: 34, bold: true, color: WHITE, margin: 0 });
s.addText([
  { text: "A complete, secure, multi-user forensic retrieval system driven by text and image queries.", options: { bullet: { code: "2022" }, color: "DCE6F2", breakLine: true } },
  { text: "A fine-tuned CLIP model specialized for facial-attribute matching.", options: { bullet: { code: "2022" }, color: "DCE6F2", breakLine: true } },
  { text: "A rigorous evaluation across all checkpoints — fine-tuning doubles top-1 accuracy and peaks at epoch 6.", options: { bullet: { code: "2022" }, color: "DCE6F2", breakLine: true } },
  { text: "Both a working system and defensible evidence about when fine-tuning helps.", options: { bullet: { code: "2022" }, color: "DCE6F2" } },
], { x: 0.85, y: 1.9, w: 10.8, h: 3.4, fontFace: SANS, fontSize: 18, paraSpaceAfter: 16, margin: 0 });
s.addText("Integrate early · separate concerns · measure honestly.", { x: 0.85, y: 6.0, w: 11, h: 0.6, fontFace: SERIF, fontSize: 18, italic: true, bold: true, color: CYAN, margin: 0 });
s.addNotes("Tie it together: a working system AND evidence. End on the methodological lesson — integrate early, separate concerns, measure honestly.");

// ============ 16. THANK YOU ============
s = pres.addSlide(); dark(s);
s.addShape(pres.shapes.OVAL, { x: -1.5, y: -1.6, w: 5, h: 5, fill: { color: NAVY } });
s.addShape(pres.shapes.OVAL, { x: 10.6, y: 4.4, w: 5, h: 5, fill: { color: NAVY } });
s.addText("Thank You", { x: 0.8, y: 2.6, w: 11.7, h: 1.2, align: "center", fontFace: SERIF, fontSize: 54, bold: true, color: WHITE, margin: 0 });
s.addText("Questions & Discussion", { x: 0.8, y: 3.9, w: 11.7, h: 0.7, align: "center", fontFace: SANS, fontSize: 22, color: CYAN, margin: 0 });
s.addText("Help Culprit Recognition  ·  Ain Shams University  ·  2025 / 2026", { x: 0.8, y: 5.2, w: 11.7, h: 0.5, align: "center", fontFace: SANS, fontSize: 14, color: "AEBED2", margin: 0 });
s.addNotes("Invite questions. Be ready for the graph questions: the learning curve, the doubling, the overfitting at epoch 8, and why epoch 3 is the default while epoch 6 is best.");

pres.writeFile({ fileName: "HelpCulpritRecognition_Presentation.pptx" }).then((f) => console.log("WROTE", f));
