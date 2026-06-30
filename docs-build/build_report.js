const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, LevelFormat, ImageRun, BorderStyle,
  WidthType, ShadingType, HeadingLevel, PageNumber, PageBreak,
  TableOfContents, VerticalAlign
} = require("docx");

const ROOT = "F:/GP/code";
const ACCENT = "1A1A2E", STEEL = "2E8BC0", HEADBG = "0F3460", ZEBRA = "EAF1F6";

const t = (text, o = {}) => new TextRun({ text, ...o });
const p = (children, o = {}) =>
  new Paragraph({ children: Array.isArray(children) ? children : [t(children)], spacing: { after: 140, line: 290 }, ...o });
const just = (text) => p(text, { alignment: AlignmentType.JUSTIFIED });
const h1 = (text) => new Paragraph({ heading: HeadingLevel.HEADING_1, children: [t(text)] });
const h2 = (text) => new Paragraph({ heading: HeadingLevel.HEADING_2, children: [t(text)] });
const h3 = (text) => new Paragraph({ heading: HeadingLevel.HEADING_3, children: [t(text)] });
const bullet = (text) => new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 90, line: 280 }, children: Array.isArray(text) ? text : [t(text)] });
const num = (text, ref = "nums") => new Paragraph({ numbering: { reference: ref, level: 0 }, spacing: { after: 90, line: 280 }, children: Array.isArray(text) ? text : [t(text)] });

const border = { style: BorderStyle.SINGLE, size: 1, color: "BBBBBB" };
const borders = { top: border, bottom: border, left: border, right: border, insideHorizontal: border, insideVertical: border };

function table(headers, rows, widths) {
  const total = widths.reduce((a, b) => a + b, 0);
  const headRow = new TableRow({
    tableHeader: true,
    children: headers.map((hdr, i) => new TableCell({
      width: { size: widths[i], type: WidthType.DXA },
      shading: { fill: HEADBG, type: ShadingType.CLEAR },
      margins: { top: 60, bottom: 60, left: 110, right: 110 },
      verticalAlign: VerticalAlign.CENTER,
      children: [new Paragraph({ children: [t(hdr, { bold: true, color: "FFFFFF", size: 19 })] })],
    })),
  });
  const bodyRows = rows.map((r, ri) => new TableRow({
    children: r.map((cell, i) => new TableCell({
      width: { size: widths[i], type: WidthType.DXA },
      shading: { fill: ri % 2 ? ZEBRA : "FFFFFF", type: ShadingType.CLEAR },
      margins: { top: 45, bottom: 45, left: 110, right: 110 },
      verticalAlign: VerticalAlign.CENTER,
      children: (Array.isArray(cell) ? cell : [cell]).map((line) =>
        new Paragraph({ children: [t(String(line), { size: 18 })], spacing: { after: 15 } })),
    })),
  }));
  return new Table({ width: { size: total, type: WidthType.DXA }, columnWidths: widths, borders, rows: [headRow, ...bodyRows] });
}

const caption = (text) => new Paragraph({
  alignment: AlignmentType.CENTER, spacing: { before: 70, after: 220 },
  children: [t(text, { italics: true, size: 18, color: "555555" })],
});

function imageFig(file, w, h, cap) {
  return [
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 140 },
      children: [new ImageRun({ type: "png", data: fs.readFileSync(`${ROOT}/docs-build/${file}`),
        transformation: { width: w, height: h }, altText: { title: cap, description: cap, name: cap } })] }),
    caption(cap),
  ];
}

const ucSpec = (id, title, rows) => [
  new Paragraph({ spacing: { before: 180, after: 60 }, children: [t(`${id}: ${title}`, { bold: true, size: 21, color: HEADBG })] }),
  table(["Field", "Description"], rows, [2100, 7260]),
  new Paragraph({ spacing: { after: 120 }, children: [t("")] }),
];
const dd = (cap, rows) => [ table(["Column", "Type", "Constraints / Notes"], rows, [2400, 2300, 4660]), caption(cap) ];
const gloss = (term, def) => new Paragraph({ spacing: { after: 90, line: 280 },
  children: [t(term + " — ", { bold: true }), t(def)] });

// =================== FRONT MATTER ===================
const studentLine = (name, id) => new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 40 },
  children: [t(name, { size: 22 }), t("          ", { size: 22 }), t(id, { size: 22, color: "555555" })] });
const sectionLabel = (txt) => new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 240, after: 100 },
  children: [t(txt, { bold: true, size: 22, color: HEADBG, allCaps: true })] });

const titlePage = [
  p(" ", { spacing: { after: 160 } }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 }, children: [t("Ain Shams University", { bold: true, size: 30, color: ACCENT })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 40 }, children: [t("Faculty of Computer and Information Sciences", { size: 24 })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 500 }, children: [t("Department of Information Systems", { size: 24 })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 200, after: 60 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: STEEL, space: 8 } },
    children: [t("Help Culprit Recognition", { bold: true, size: 48, color: ACCENT })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 160, after: 400 }, children: [t("An AI-Powered Forensic Suspect Retrieval System", { size: 30, color: HEADBG })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 300 },
    children: [t("A Graduation Project Report submitted in partial fulfillment of the requirements for the degree of Bachelor of Science in Information Systems", { italics: true, size: 22, color: "555555" })] }),
  sectionLabel("Prepared by"),
  studentLine("Ali Sayed", "2021170337"),
  studentLine("Wasim Abdelhalem", "2021170613"),
  studentLine("Adel Ahmed", "2021170613"),
  studentLine("________________________________", "____________"),
  studentLine("________________________________", "____________"),
  studentLine("________________________________", "____________"),
  studentLine("________________________________", "____________"),
  sectionLabel("Under the supervision of"),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 40 }, children: [t("Dr. Fatma Mohamed", { bold: true, size: 24 })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 }, children: [t("Teaching Assistant: Shamia Abdallah Ahmed", { size: 22, color: "555555" })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 360, after: 60 }, children: [t("Academic Year 2025 / 2026", { size: 22, color: "555555" })] }),
  new Paragraph({ children: [new PageBreak()] }),
];

const abstract = [
  h1("Abstract"),
  just("Eyewitness-based suspect identification remains a slow, subjective, and error-prone stage of many criminal investigations. A witness describes a perpetrator in natural language, yet the available evidence is an unstructured collection of photographs, and connecting the two is performed manually. This project, Help Culprit Recognition, presents a complete full-stack forensic decision-support system that automates this matching using a fine-tuned vision-language model, allowing an investigator to retrieve the most relevant suspects either by typing a description (for example, “a man with a beard wearing glasses”) or by submitting a reference photograph."),
  just("At the core of the system is OpenAI’s CLIP architecture with a ViT-B/32 image encoder, which projects both images and text into a shared 512-dimensional embedding space. The model was specialized for facial-attribute matching by fine-tuning it on the CelebA dataset, whose 40 binary attributes were converted into natural-language captions so that the contrastive image–text training objective could be applied. Retrieval is performed by ranking the gallery images by their cosine similarity (or Euclidean distance) to the query embedding, and the closest matches are returned with an interpretable percentage score."),
  just("The application is engineered as a three-tier web system coupled with a dedicated artificial-intelligence microservice: a React single-page front end, an ASP.NET Core 8 Web API, a MySQL database, and a Python FastAPI inference service running on an NVIDIA GPU. To assess the benefit of fine-tuning, a Recall@K evaluation was carried out on a 536-image subset across all nine training checkpoints (epochs 0 through 8). Fine-tuning roughly doubled top-1 retrieval accuracy over the pre-trained baseline — from a Recall@1 of 3.73% to a peak of 7.46% at epoch six — and the full learning curve reveals a clear improvement followed by a mild decline that is consistent with the onset of overfitting. The report documents the system’s requirements, architecture, methodology, implementation, security model, testing, and quantitative evaluation, and concludes with a critical discussion of limitations and future work."),
  new Paragraph({ spacing: { before: 120 }, children: [t("Keywords: ", { bold: true }),
    t("Forensic identification, CLIP, vision-language models, semantic image retrieval, contrastive learning, embeddings, cosine similarity, CelebA, Recall@K, ASP.NET Core, FastAPI, React.")] }),
  new Paragraph({ children: [new PageBreak()] }),
];

const acknowledgements = [
  h1("Acknowledgements"),
  just("We would like to express our sincere gratitude to our supervisor, Dr. Fatma Mohamed, for her invaluable guidance, insight, and encouragement throughout this project. We are equally grateful to our teaching assistant, Eng. Shamia Abdallah Ahmed, for her continuous technical feedback and support. We also thank the Department of Information Systems, Faculty of Computer and Information Sciences, Ain Shams University, for providing the environment and resources that made this work possible, and we thank our families and colleagues for their constant support."),
  new Paragraph({ children: [new PageBreak()] }),
];

const toc = [
  h1("Table of Contents"),
  new TableOfContents("Table of Contents", { hyperlink: true, headingStyleRange: "1-3" }),
  new Paragraph({ children: [new PageBreak()] }),
];

const listLine = (s) => new Paragraph({ spacing: { after: 70 }, children: [t(s, { size: 21 })] });
const listsFiguresTables = [
  h1("List of Figures"),
  listLine("Figure 3.1 — Use-case diagram of the system."),
  listLine("Figure 3.2 — Data flow diagram (context and level 1)."),
  listLine("Figure 3.3 — Activity diagram of the search process."),
  listLine("Figure 4.1 — High-level system architecture and data flow."),
  listLine("Figure 4.2 — Component diagram."),
  listLine("Figure 4.3 — Deployment diagram."),
  listLine("Figure 4.4 — Entity-relationship diagram of the database."),
  listLine("Figure 4.5 — Class diagram (domain model and services)."),
  listLine("Figure 4.6 — Sequence diagram: text-to-image search."),
  listLine("Figure 4.7 — Sequence diagram: image upload and indexing."),
  listLine("Figure 9.1 — Recall@K versus fine-tuning epoch (learning curve)."),
  listLine("Figure 9.2 — Baseline versus fine-tuned checkpoints."),
  listLine("Figure 9.3 — Relative improvement over the baseline."),
  new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 320 }, children: [t("List of Tables")] }),
  listLine("Table 3.1 — Functional requirements."),
  listLine("Table 3.2 — Non-functional requirements."),
  listLine("Tables 3.3–3.7 — Use-case specifications."),
  listLine("Table 4.1 — Technology stack by tier."),
  listLine("Tables 4.2–4.5 — Database data dictionary."),
  listLine("Table 4.6 — REST API endpoints."),
  listLine("Table 8.1 — Verification test cases and outcomes."),
  listLine("Table 9.1 — Recall@K across all evaluated checkpoints."),
  new Paragraph({ children: [new PageBreak()] }),
];

// =================== CHAPTER 1 ===================
const ch1 = [
  h1("1. Introduction"),
  h2("1.1 Overview"),
  just("Help Culprit Recognition is a web-based forensic decision-support system that assists investigators in narrowing down a pool of potential suspects from a photographic database. It does not attempt to replace human judgment; instead, it functions as an intelligent filter that ranks the photographs in an investigation by how closely they match an investigator’s description or reference image, allowing the human expert to concentrate attention on the most promising candidates. The system unites a modern, secure web-application stack with a fine-tuned deep-learning model, so that retrieval can be driven by natural language — the medium in which a witness most naturally expresses what was observed — as well as by a reference photograph."),
  just("Conceptually, the system addresses a single, well-defined task: given a textual or visual query and a gallery of suspect photographs, return the photographs that best match the query, ranked by confidence. Everything else in the system — authentication, investigation management, image storage, indexing, and the user interface — exists to make this core retrieval capability usable, secure, and repeatable in a realistic multi-user setting."),
  h2("1.2 Problem Statement"),
  just("In traditional investigative practice, an eyewitness account is expressed in words while the available evidence is a large, unstructured collection of photographs. Bridging the gap between a verbal description and a visual database is carried out manually: an investigator reviews photo books or databases image by image, relying on memory and concentration to recognize a face that matches the account. This process is slow, mentally taxing, and inconsistent between investigators, and its reliability degrades as the number of candidate images grows. Beyond a few hundred images, exhaustive manual review becomes impractical and the risk of overlooking a genuine match rises sharply."),
  just("The underlying difficulty is what the computer-vision literature calls the semantic gap: a photograph is, to a computer, merely an array of pixel values, whereas a human description refers to high-level semantic concepts such as gender, facial hair, eyewear, and apparent age. There is no inherent textual index attached to a raw photograph that a conventional keyword search could exploit. The central technical problem of this project is therefore to make images searchable by text in a way that captures semantic meaning rather than surface keywords, and to do so within a secure, multi-user application that a non-specialist investigator can operate."),
  just("The problem has a second dimension beyond the core matching task. A practical investigative tool cannot consist of a model alone; it must manage evidence as cases, keep one investigator’s material separate from another’s, store and serve potentially large collections of photographs, and present its results in a form an investigator can act upon without machine-learning expertise. The project therefore confronts two intertwined problems at once: a machine-learning problem of mapping language and images into a common, searchable space, and a software-engineering problem of wrapping that capability in a secure, reliable, and usable system. Much of the design described in this report is concerned with keeping these two problems cleanly separated so that each can be solved well, and the architecture of Chapter 4 is, in large part, the expression of that separation."),
  h2("1.3 Motivation"),
  just("For more than a century, investigators have relied on composite sketches and manual photo-book review to connect a witness account to a face. These established methods are valuable but inherently laborious and dependent on individual skill. The motivation for this project is the observation that recent advances in vision-language modelling now make it possible to compare a sentence directly against a photograph, opening the door to suspect retrieval that is faster, more consistent, and able to scale to far larger image collections than a human can review unaided. By packaging this capability inside an accessible application, the project aims to translate a research-grade model into a practical investigative aid."),
  h2("1.4 Objectives"),
  num("Design and implement an end-to-end system that retrieves candidate suspects from an image gallery using either a natural-language description or a reference photograph."),
  num("Apply a fine-tuned vision-language model (CLIP) to encode images and text into a common embedding space suitable for similarity search."),
  num("Provide an interpretable ranking of results, expressed as percentage match scores, with the ability to choose between model checkpoints and distance metrics."),
  num("Deliver a secure, multi-user application in which each investigator manages an isolated set of investigations."),
  num("Quantify the benefit of fine-tuning using a standard retrieval metric (Recall@K) measured on the project’s own model checkpoints."),
  num("Engineer the solution with a clean, maintainable, service-oriented architecture suitable for academic evaluation and future extension."),
  h2("1.5 Scope and Limitations of Scope"),
  just("The delivered system supports user registration and authentication, creation and management of investigations, multi-image upload and indexing, text-to-image search, image-to-image search, attribute-based query refinement, and selection of the model checkpoint and distance metric used for each search. The quality of the underlying recognition is bounded by the capacity of the fine-tuned CLIP model and by the quality and diversity of the photographs supplied. The system is explicitly positioned as an investigative aid that produces ranked leads for human review; it is not designed, and must not be used, as a sole or autonomous basis for legal identification."),
  h2("1.6 Methodology Overview"),
  just("The project followed an iterative, engineering-led methodology with two parallel strands. The machine-learning strand fine-tuned a pre-trained CLIP model on the CelebA dataset, generating natural-language captions from the dataset’s attributes and saving model snapshots at successive training epochs. The software-engineering strand built the application as three cooperating tiers plus an artificial-intelligence microservice, integrating the components incrementally and verifying them end-to-end. A final strand measured retrieval quality across the trained checkpoints and consolidated the documentation. This separation allowed the computationally heavy model work and the transactional application work to progress independently and to be reasoned about in isolation."),
  h2("1.7 Report Organization"),
  bullet("Chapter 2 reviews the background concepts and the related literature."),
  bullet("Chapter 3 presents the system analysis and requirements, including use-case specifications and data-flow diagrams."),
  bullet("Chapter 4 describes the architecture and design, including component, deployment, entity-relationship, class, sequence, and activity diagrams, the data dictionary, and the application programming interface."),
  bullet("Chapter 5 details the artificial-intelligence methodology."),
  bullet("Chapter 6 describes the implementation of each tier and the engineering challenges encountered."),
  bullet("Chapter 7 discusses the security model, Chapter 8 the testing and verification, and Chapter 9 the results and quantitative evaluation."),
  bullet("Chapter 10 provides deployment instructions and a user manual, and Chapters 11 and 12 cover limitations, future work, and conclusions, followed by references, a glossary, and appendices."),
  h2("1.8 Significance and Contributions"),
  just("The significance of the project lies in demonstrating, end to end, that a research-grade vision-language model can be turned into a usable investigative tool, and in measuring how much its central machine-learning component actually contributes. The work makes four concrete contributions. First, it delivers a complete, secure, multi-user forensic retrieval application integrating four cooperating components, rather than a model in isolation. Second, it applies a principled fine-tuning methodology — transfer learning with partial freezing and a synthetic caption generator — to specialize a general model for the facial-attribute domain. Third, it provides a rigorous, reproducible evaluation of that methodology across the full family of trained checkpoints, yielding a learning curve that quantifies both the benefit of fine-tuning and the onset of overfitting. Fourth, it documents the engineering reality of building such a system, including the concrete defects encountered and the reasoning behind each design decision, so that the work can be understood, defended, and extended. The combination of a working system and an evidence-based evaluation of its core component is what distinguishes this project from a demonstration."),
];

// =================== CHAPTER 2 ===================
const ch2 = [
  h1("2. Background and Literature Review"),
  just("This chapter establishes the conceptual foundations on which the system is built, progressing from the general problem of image retrieval to the specific vision-language model and dataset used in the project. The intent is to give a reader without a machine-learning background enough context to understand the design decisions made in later chapters."),
  h2("2.1 The Semantic Gap in Image Retrieval"),
  just("Conventional image retrieval systems take one of two approaches. The first relies on manually assigned metadata — tags or captions — and reduces the problem to ordinary text search; this fails whenever the images are unlabelled, as raw evidence photographs invariably are. The second relies on low-level visual features such as colour histograms, edges, and texture descriptors; this can find images that are visually similar in a superficial sense but cannot reason about meaning. Neither approach captures the high-level semantic content of a photograph in a way that aligns with how a person describes a face. The mismatch between low-level pixels and high-level meaning is known as the semantic gap, and closing it is the essential requirement for description-based suspect search. A system that genuinely understands that the phrase “an elderly man with glasses” corresponds to particular visual patterns must learn a representation that connects language to vision."),
  h2("2.2 Machine Learning and Deep Learning"),
  just("Machine learning is the discipline of building systems that improve their behaviour from data rather than from explicit rules. A model is a parameterized function whose parameters are adjusted during training to minimize a loss function — a numerical measure of how far the model’s outputs are from the desired outputs. Deep learning refers to models composed of many layers of simple computational units, known as neural networks. The defining strength of deep networks is representation learning: rather than relying on hand-engineered features, they learn a hierarchy of features directly from data, with early layers capturing simple patterns such as edges and colours and deeper layers capturing increasingly abstract concepts such as parts and objects. This capacity to learn rich representations is what makes deep learning the dominant approach to both computer vision and natural-language processing, and it is the foundation of the model used in this project."),
  just("Training proceeds by gradient descent: the loss is evaluated on examples, its gradient with respect to every parameter is computed automatically, and each parameter is nudged a small step in the direction that reduces the loss. Repeated over many passes through the data — each such pass being an epoch — this process gradually shapes the parameters so that the model’s outputs match the desired ones. A central tension in this process, and one that is directly relevant to this project’s results, is the balance between fitting the training data and generalizing to unseen data. A model that is trained too little is unable to capture the structure of the task, while a model that is trained too much begins to memorize incidental features of the training set and loses the ability to generalize — the phenomenon of overfitting. Recognizing where this balance tips is exactly what the learning curve in Chapter 9 makes visible for this project’s model."),
  h2("2.3 The Transformer Architecture and Attention"),
  just("The Transformer is a neural-network architecture built around the self-attention mechanism. Self-attention allows every element of an input sequence to consider every other element and to weight their contributions by a learned measure of relevance. Compared with earlier recurrent and convolutional designs, attention enables highly parallel computation and captures long-range relationships more effectively, which is why it has become the standard building block for modern language and vision models. Both encoders used in this project are Transformers: a text encoder that processes a tokenized caption, and a vision encoder that processes an image."),
  h2("2.4 Vision Transformers"),
  just("A Vision Transformer applies the Transformer directly to images. The image is divided into a grid of fixed-size patches; each patch is flattened and linearly projected into a vector; positional information is added; and the resulting sequence of patch vectors is processed by standard Transformer layers exactly as if it were a sequence of word tokens. The specific variant used in this project, ViT-B/32, is a base-size model that operates on patches of 32×32 pixels. Vision Transformers match or surpass convolutional networks on large-scale visual tasks and, crucially, integrate naturally with text Transformers, which is precisely what a joint vision-language model requires."),
  h2("2.5 CLIP and Contrastive Language–Image Pre-training"),
  just("CLIP (Contrastive Language–Image Pre-training) is a model that learns a shared representation for images and text. It comprises two encoders — a Vision Transformer for images and a Transformer for text — trained jointly on a very large collection of image–caption pairs. The training objective is contrastive: within each batch of paired images and captions, the model is encouraged to make the embedding of each image as similar as possible to the embedding of its own caption, and as dissimilar as possible from the embeddings of every other caption, and symmetrically for captions against images. The result is a single embedding space in which an image and a sentence that describes it land close together."),
  just("This property is exactly what description-based retrieval requires: a text query and a matching image produce numerically similar vectors, so they can be compared directly with a simple distance measure. Because CLIP is trained on broad, general data, it possesses wide visual-linguistic knowledge but is not specialized for any particular domain. The present project therefore fine-tunes CLIP on facial data so that the embedding space becomes sensitive to the specific attributes — facial hair, eyewear, headwear, apparent age — that matter for suspect description. The fine-tuning procedure is described in Chapter 5."),
  h2("2.6 Embeddings and Similarity Measures"),
  just("An embedding is the fixed-length vector that an encoder produces for an input; for the ViT-B/32 model used here, every image and every text is represented by a vector of 512 real numbers. Before comparison, each embedding is L2-normalized — divided by its own length so that it lies on the surface of a unit hypersphere. On normalized vectors, two complementary similarity measures are available. Cosine similarity is the dot product of the two vectors and equals the cosine of the angle between them; a value near one indicates very high similarity. Euclidean distance measures the straight-line distance between the two points; a smaller distance indicates greater similarity. For normalized vectors the two measures induce the same ranking, but the system exposes both so that their behaviour can be compared by the user."),
  h2("2.7 Transfer Learning and Fine-Tuning"),
  just("Training a vision-language model from scratch demands enormous quantities of data and computation that are far beyond the resources of a graduation project. Transfer learning solves this by starting from a model already trained on a large general corpus and continuing training on a smaller, task-specific dataset. By keeping most of the pre-trained network fixed and updating only a carefully chosen subset of layers — a strategy known as partial freezing — the model can be specialized for facial-attribute matching while retaining its broad prior knowledge, at a fraction of the cost and with a reduced risk of overfitting. This is the strategy adopted in the project, and the quantitative effect of the fine-tuning is measured directly in Chapter 9."),
  h2("2.8 The CelebA Dataset"),
  just("CelebA (CelebFaces Attributes) is a large-scale dataset of celebrity face images in which every image is annotated with 40 binary attributes such as Male, Young, Eyeglasses, Wearing_Hat, Bald, Mustache, and Smiling. These attribute annotations make CelebA particularly well suited to training a model that links facial appearance to descriptive language. However, CLIP learns from image–text pairs rather than from binary labels, so the attributes cannot be used directly; they must first be transformed into natural-language captions. The caption-generation procedure that performs this transformation is described in Chapter 5, and it is central to the project’s approach."),
  h2("2.9 Related Work"),
  just("Description-based and cross-modal person search is an active research area, and several recent studies informed the direction of this project. Cao and colleagues (2025) propose bidirectional relation reasoning and aligning for multilingual text-to-image person retrieval, addressing the same fundamental text-to-image matching problem tackled here, albeit at a larger scale and across languages. Zhang and colleagues (2025) investigate sketch-guided scene-image generation with diffusion models, which is directly relevant to the traditional investigative reliance on composite sketches that motivates this work. The broader multimodal literature includes AI-driven image-to-text-to-speech systems (Sherly and Velvizhy, 2024), multiscale hybrid-expert models for image–text named-entity recognition on social media (Yang and colleagues, 2025), and unified interest-point detection and description for image matching across perspective and fisheye images (Xu and colleagues, 2025). What distinguishes the present project from this body of research is its emphasis on system integration: rather than studying a retrieval model in isolation, it embeds a fine-tuned CLIP retrieval engine inside a complete, secure, multi-user forensic application and evaluates the model on its own trained checkpoints."),
  h2("2.10 Evaluation Metrics for Retrieval"),
  just("Retrieval systems are not evaluated in the same way as classifiers, because the goal is not to assign a single correct label but to order a collection so that relevant items appear near the top. The natural family of metrics for this task is therefore rank-based. The metric adopted in this project is Recall@K, defined as the fraction of queries for which the correct target appears among the first K results returned. Recall@K is well suited to the suspect-retrieval setting for two reasons. First, it mirrors how the system is actually used: an investigator scans a short list of top candidates, so what matters is whether the right person is in that short list, not the exact numerical score attached to it. Second, by reporting the metric at several cut-offs — here K equal to one, five, and ten — it captures different operating points simultaneously: Recall@1 measures the demanding ability to rank the exact target first, while Recall@10 measures the gentler ability to bring it into a reviewable shortlist. Reporting the full set of cut-offs gives a more complete picture than any single number could, and the contrast between them, analysed in Chapter 9, is itself a source of insight into how the model learns."),
  just("An important reference point for any retrieval metric is the performance of random ordering, which establishes the floor above which a model demonstrates genuine ability. For a pool of N images, random ranking yields an expected Recall@1 of one divided by N. In the project’s evaluation, with 536 images, this floor is approximately 0.19 percent; every measured value is many times larger, confirming that the models — including the un-fine-tuned baseline — are performing real retrieval rather than guessing."),
  h2("2.11 Service-Oriented and Microservice Architecture"),
  just("The system’s structure also draws on established principles of software architecture. A service-oriented design decomposes a system into cohesive units that each own a single responsibility and communicate through explicit interfaces, which raises cohesion within each unit and lowers coupling between units. The decision to isolate the machine-learning capability as a separate microservice, rather than embedding it inside the main application, follows directly from these principles and from a practical constraint: the mature machine-learning frameworks are written for Python, whereas the transactional application benefits from the strong typing and tooling of a managed runtime. Separating the two allows each to be written in the language best suited to it, deployed and scaled independently, and reasoned about in isolation. The cost of this separation is the additional network hop between the application and the inference service, which is negligible relative to the cost of the inference itself."),
  h2("2.12 Biometric Identification and Its Place in This Work"),
  just("Facial analysis sits within the broader field of biometrics, the automated recognition of individuals from physiological or behavioural characteristics. It is important to distinguish the task this project addresses from the more familiar task of face verification or one-to-one matching, in which a system confirms whether two images depict the same person. This project performs neither verification nor one-to-one identity matching; it performs attribute-based retrieval, ranking a gallery by how well each image matches a description of appearance rather than a specific identity. This distinction matters both technically and ethically. Technically, the model is trained to associate faces with descriptive attributes, not to recognize named individuals, and the system stores no identity register. Ethically, the system’s outputs are explicitly framed as leads for human review rather than identifications, which keeps a human in the loop at the decisive point and avoids the well-documented risks of treating an automated match as proof of identity."),
  just("Within this framing, the system can be understood as a modern, computational counterpart to the composite sketch and the photo book: it takes the same descriptive input a witness provides and the same photographic evidence an investigator holds, and it automates the laborious cross-referencing between them. The contribution is not a new biometric modality but the application of a general-purpose vision-language model to make an existing investigative workflow faster and more consistent."),
  h2("2.13 Zero-Shot Capability versus Fine-Tuning"),
  just("A notable property of CLIP is its zero-shot capability: because it learns a general association between images and language, it can perform retrieval on concepts it was never explicitly trained to recognize, simply by comparing image and text embeddings. The pre-trained baseline in this project exercises exactly this capability, and the evaluation in Chapter 9 confirms that it already performs far above chance without any task-specific training. Fine-tuning does not replace this general ability; it sharpens it for the particular vocabulary of facial-attribute description. The central empirical question of the project — by how much does this sharpening help, and at what point does it begin to hurt — is precisely what the learning curve answers, and it is answerable only because the pre-trained baseline provides a meaningful zero-shot reference against which the fine-tuned checkpoints can be measured."),
  h2("2.14 Limitations of Prior Approaches"),
  just("It is instructive to position the chosen approach against the alternatives it supersedes, because doing so clarifies why a vision-language model was selected. A keyword-and-metadata approach is ruled out at the outset, since raw evidence photographs carry no textual labels to search. A classical content-based image retrieval approach, matching low-level visual features, can find images that are superficially similar to a query image but cannot accept a textual description at all, and so cannot serve the central use case in which the investigator has words rather than a picture. A dedicated attribute-classifier approach — training a separate detector for each attribute such as glasses or beard — is feasible and was considered, but it is brittle: it fixes the vocabulary of describable attributes in advance, requires a labelled detector for every concept, and cannot interpret a free-form natural-language description that combines attributes in arbitrary ways. The vision-language approach subsumes the strengths of these alternatives while avoiding their principal weaknesses: it accepts free natural language, it requires no per-attribute detector, and it handles both text and example-image queries within a single shared representation. This is the reasoning that led to the selection of a CLIP-based design as the foundation of the system."),
];

// =================== CHAPTER 3 ===================
const ch3 = [
  h1("3. System Analysis and Requirements"),
  just("This chapter translates the high-level goals of Chapter 1 into a concrete set of requirements and behavioural models. It identifies the stakeholders, enumerates the functional and non-functional requirements, presents the use-case model with detailed specifications, and captures the movement of data through the system with data-flow and activity diagrams."),
  h2("3.1 Stakeholders"),
  just("The primary stakeholder is the Investigator, an authorized law-enforcement user who operates the system to retrieve suspect candidates. Secondary stakeholders include the supervising authority that governs how the system’s results may be used within an investigation, and the system administrator responsible for deployment and maintenance. The artificial-intelligence service is a supporting system actor that the application invokes on the investigator’s behalf; it has no independent goals of its own but is modelled separately because it is a distinct, externally-deployed subsystem."),
  h2("3.2 Functional Requirements"),
  just("The functional requirements define what the system must do. They were derived from the project objectives and refined during development as the integration of the tiers clarified the necessary behaviours."),
  table(["ID", "Requirement"],
    [
      ["FR-1", "A user can register an account and authenticate with a username and password."],
      ["FR-2", "An authenticated user can create, list, view, and delete investigations they own."],
      ["FR-3", "A user can upload multiple images to an investigation; the system stores them and builds their vector index."],
      ["FR-4", "A user can list and delete individual images within an investigation."],
      ["FR-5", "A user can search an investigation by free-text description and receive ranked matches."],
      ["FR-6", "A user can search an investigation by submitting a query image (image-to-image search)."],
      ["FR-7", "A user can refine a text query using attribute certainty sliders (glasses, beard, mustache, hat, bald, young, old)."],
      ["FR-8", "A user can choose the model checkpoint, the distance metric, and the number of results returned for a search."],
      ["FR-9", "Each result is displayed with its image, filename, and a percentage match score."],
      ["FR-10", "The system isolates each user’s data so that one user cannot access another user’s investigations."],
    ], [1100, 8260]),
  caption("Table 3.1 — Functional requirements."),
  h2("3.3 Non-Functional Requirements"),
  just("The non-functional requirements define quality attributes that constrain how the system must behave. Several of these — in particular the security and reliability requirements — directly shaped architectural decisions described in Chapter 4."),
  table(["Category", "Requirement"],
    [
      ["Security", "Passwords are stored only as salted adaptive hashes; all data endpoints require authentication; users are isolated to their own data."],
      ["Usability", "A single-page interface with a consistent dark, professional theme and clear status feedback for every long-running operation."],
      ["Performance", "Indexing is performed in memory-bounded batches; inference is accelerated on a GPU; bulk uploads are chunked to remain reliable."],
      ["Reliability", "A global error handler converts any unhandled exception into a consistent, structured response rather than crashing."],
      ["Maintainability", "A service-oriented design separates presentation, application, data, and artificial-intelligence concerns behind clear interfaces."],
      ["Interpretability", "Match confidence is presented to the user as an intuitive percentage."],
      ["Portability", "The system runs on a standard workstation and is reproducible through setup and launch scripts."],
    ], [1700, 7660]),
  caption("Table 3.2 — Non-functional requirements."),
  h2("3.4 Use-Case Model"),
  just("The system has a single primary actor, the Investigator, and one supporting actor, the AI Service. The principal use cases are Register/Login, Manage Investigations, Manage Images, Search by Text, Search by Image, and View Ranked Results. Every data-related use case requires successful authentication and operates only on data owned by the acting user. Figure 3.1 presents the use-case diagram."),
  ...imageFig("usecase.png", 560, 328, "Figure 3.1 — Use-case diagram of the system."),
  h2("3.5 Use-Case Specifications"),
  just("The five core use cases are specified below in terms of their actors, preconditions, main flow, exceptional flows, and postconditions. These specifications served as the contract between the front-end and back-end development during integration."),
  ...ucSpec("Table 3.3 — UC-1", "Register / Login", [
    ["Actor", "Investigator"],
    ["Precondition", "The application is reachable; for login, an account already exists."],
    ["Main flow", "The user opens the login page, enters a username and password, the system validates the input and credentials, issues a signed session token, and redirects the user to the dashboard."],
    ["Alternate flow", "On registration, the account is created and the user is then logged in automatically."],
    ["Exceptional flow", "Invalid credentials return an unauthorized response and an error message; a duplicate username during registration returns a bad-request error."],
    ["Postcondition", "The user holds a valid session token recognized by all data endpoints."],
  ]),
  ...ucSpec("Table 3.4 — UC-2", "Manage Investigations", [
    ["Actor", "Investigator"],
    ["Precondition", "The user is authenticated."],
    ["Main flow", "The user views their list of investigations, creates a new investigation with a title and optional description, or selects or deletes an existing one; the system persists the change and refreshes the list."],
    ["Exceptional flow", "A missing title is rejected; an attempt to access or delete an investigation not owned by the user returns a not-found response."],
    ["Postcondition", "The investigation set reflects the user’s action; deletion cascades to the investigation’s images and embeddings."],
  ]),
  ...ucSpec("Table 3.5 — UC-3", "Manage Images", [
    ["Actor", "Investigator; AI Service"],
    ["Precondition", "An investigation is selected."],
    ["Main flow", "The user selects image files and uploads them; the system stores the files and database records and requests the AI Service to build the vector index; the user may subsequently list or delete individual images."],
    ["Exceptional flow", "An empty upload is rejected; a failure during indexing returns an error with diagnostic detail."],
    ["Postcondition", "The images are stored, recorded, and indexed, ready for search."],
  ]),
  ...ucSpec("Table 3.6 — UC-4", "Search by Text", [
    ["Actor", "Investigator; AI Service"],
    ["Precondition", "The investigation has indexed images."],
    ["Main flow", "The user enters a description, optionally adjusts the attribute sliders and the model and metric, and submits; the system forwards the query to the AI Service, which encodes the text, computes similarities, and returns the requested number of best matches (five by default); the system displays them with percentage scores."],
    ["Exceptional flow", "If no index exists for the investigation, a not-found response is returned."],
    ["Postcondition", "A ranked set of candidate images is presented to the user."],
  ]),
  ...ucSpec("Table 3.7 — UC-5", "Search by Image", [
    ["Actor", "Investigator; AI Service"],
    ["Precondition", "The investigation has indexed images."],
    ["Main flow", "The user uploads a query photograph and selects the model and metric; the system forwards the image to the AI Service, which encodes it and ranks the gallery; the system displays the most visually similar candidates."],
    ["Exceptional flow", "A missing query image is rejected; an unindexed investigation returns a not-found response."],
    ["Postcondition", "A ranked set of visually similar candidates is presented to the user."],
  ]),
  h2("3.6 Data Flow"),
  just("At the highest level of abstraction, the system receives queries and images from the investigator and returns ranked results. The level-1 decomposition in Figure 3.2 refines this into four processes — Authenticate, Manage Case and Images, Index Images, and Search/Retrieve — operating over three data stores: the relational database, the image file store, and the vector store. Separating the file store and the vector store from the relational database reflects a deliberate design decision: the heavy binary artefacts (images and tensors) are kept on disk and referenced from the database, rather than stored inside it."),
  ...imageFig("dfd.png", 600, 326, "Figure 3.2 — Data flow diagram (context and level 1)."),
  h2("3.7 Activity Model of the Search Process"),
  just("Figure 3.3 expresses the search use case as an activity diagram. It captures the branch between a text query and an image query, the shared retrieval and ranking steps performed by the AI service, and the final rendering of the ranked grid. The diagram makes explicit that both query modes converge on the same similarity-search and presentation logic, which is a direct consequence of the shared embedding space."),
  ...imageFig("activity_search.png", 360, 408, "Figure 3.3 — Activity diagram of the search process."),
  h2("3.8 Assumptions and Constraints"),
  just("The requirements were elaborated under a set of explicit assumptions and constraints that bound the system’s expected operating conditions. It is assumed that the photographs supplied to an investigation are reasonably clear, frontal facial images comparable to the data the model was trained on; the system is not expected to perform well on heavily occluded, low-resolution, or non-frontal images, because the underlying model was not specialized for such conditions. It is assumed that the investigator interacts with the system through a modern web browser on a workstation, rather than a mobile device, which shaped the layout of the interface. The principal hardware constraint is the availability of a graphics processor for inference; the system functions without one but at substantially reduced indexing speed. Finally, the system assumes a trusted operator within an authorized setting: it enforces per-user data isolation but does not attempt to defend against a malicious authenticated insider, which would require the auditing and access-control measures listed as future work."),
  h2("3.9 Requirements Traceability"),
  just("To confirm that the delivered system addresses every stated requirement, the functional requirements are traced to the components that satisfy them. This traceability also guided verification, since each requirement implies a test."),
  table(["Requirement", "Realized by", "Verified in"],
    [
      ["FR-1 (authentication)", "Auth controller and user service; token issuance", "Tests T-1, T-3"],
      ["FR-2 (investigations)", "Investigation controller and service; database", "Test T-4"],
      ["FR-3, FR-4 (images)", "Image controller and service; AI indexing", "Tests T-5, T-6, T-10"],
      ["FR-5 (text search)", "Search controller and service; AI text endpoint", "Test T-7"],
      ["FR-6 (image search)", "Search controller and service; AI image endpoint", "Self-retrieval, Test T-8"],
      ["FR-7 (attribute sliders)", "Search interface; query expansion", "Functional review"],
      ["FR-8 (model/metric choice)", "Search interface; AI service parameters", "Functional review"],
      ["FR-9 (percentage scores)", "Search service mapping; results grid", "Test T-7"],
      ["FR-10 (data isolation)", "Authorization; owner-scoped queries", "Tests T-2, T-4"],
    ], [2600, 4360, 2400]),
  caption("Table 3.8 — Traceability of functional requirements to design and verification."),
  h2("3.10 Operational Environment"),
  just("The system is intended to operate within an authorized investigative setting on a managed workstation. The investigator interacts with it through a web browser; the application, the inference service, and the database run on a controlled host under the organization’s administration. The environment is assumed to provide the supporting infrastructure on which the system depends — a database service, a graphics processor for efficient inference, and the photographic evidence to be searched — and to be physically and administratively secured, since the system’s own controls govern logical access to data but not physical access to the host. These environmental assumptions are deliberately modest, reflecting the project’s status as a workstation-scale prototype; the steps required to operate it in a larger, networked, multi-host environment are described among the future-work items in Chapter 11."),
];

// =================== CHAPTER 4 ===================
const ch4 = [
  h1("4. System Architecture and Design"),
  just("This chapter presents the design of the system from several complementary viewpoints — architectural, component, deployment, data, structural, and behavioural — and explains the reasoning behind the principal design decisions."),
  h2("4.1 Architectural Overview"),
  just("The system follows a three-tier architecture (presentation, application, data) augmented by a dedicated artificial-intelligence microservice. This arrangement separates the computationally heavy, Python-based machine-learning workload from the transactional business logic written in C#, allowing the two to be developed, deployed, scaled, and reasoned about independently. The application tier is the single gateway to the system: the browser never communicates directly with either the database or the artificial-intelligence service. This centralization concentrates authentication and authorization in one place and reduces the system’s attack surface."),
  ...imageFig("arch.png", 600, 400, "Figure 4.1 — High-level system architecture and data flow."),
  just("A representative request proceeds as follows. The React client issues an authenticated request to the .NET API. For a data operation, the API uses an object-relational mapper to read from or write to the MySQL database. For a machine-learning operation, the API forwards the request to the Python service, which loads the relevant model and vector files, performs inference on the GPU, and returns a ranked result that the API relays back to the client. The browser thus deals with a single, coherent API and is shielded entirely from the internal topology."),
  h2("4.2 Component View"),
  just("The component diagram in Figure 4.2 refines the architecture into the concrete software components and their interfaces. The React application contains the page components and a shared HTTP client; the .NET API contains the controllers, the application services, and the data-access context; and the Python service contains the inference application, a singleton model manager that holds the loaded checkpoints in memory, and the indexing and search routines. The components interact only through well-defined REST and data interfaces, which keeps them loosely coupled."),
  ...imageFig("component.png", 600, 316, "Figure 4.2 — Component diagram."),
  h2("4.3 Deployment View"),
  just("Figure 4.3 shows how the components are mapped onto physical or virtual nodes in the development configuration. The browser runs on the client machine, while the application and artificial-intelligence services run on a single host alongside the model checkpoints and the GPU; the database runs as a service reachable over a network port. A production deployment would separate these nodes, terminate transport-layer security at a reverse proxy, and isolate the database on a private network; these hardening steps are discussed in Chapter 11."),
  ...imageFig("deployment.png", 560, 305, "Figure 4.3 — Deployment diagram."),
  h2("4.4 Technology Stack"),
  just("The technologies were selected to balance capability, maturity, and the team’s ability to integrate them within the project timeline. The machine-learning ecosystem is built on Python because that is where the model frameworks live; the transactional layer uses ASP.NET Core for its strong typing, dependency injection, and first-class authentication support; and the interface uses React for its component model and rich ecosystem."),
  table(["Tier", "Technology", "Role"],
    [
      ["Presentation", "React 19, Vite, Axios, React Router", "Single-page interface, routing, authenticated requests"],
      ["Application", "ASP.NET Core 8 Web API (C#)", "REST endpoints, authentication, orchestration"],
      ["Data access", "Entity Framework Core 8 with the Pomelo MySQL provider", "Object-relational mapping and schema creation"],
      ["Database", "MySQL 8.x", "Persistent storage of users, investigations, images, embeddings"],
      ["AI service", "Python, FastAPI, Uvicorn", "Model serving, indexing, similarity search"],
      ["ML framework", "PyTorch (CUDA build), Hugging Face Transformers", "CLIP ViT-B/32 inference on the GPU"],
      ["Security", "JSON Web Tokens, BCrypt", "Stateless authentication and password hashing"],
    ], [1700, 3660, 4000]),
  caption("Table 4.1 — Technology stack by tier."),
  h2("4.5 Database Design"),
  just("The relational schema comprises four entities. A User owns many Investigations; an Investigation contains many UploadedImages; and each UploadedImage may carry many ImageEmbeddings, one per model checkpoint. Referential integrity is enforced with cascade-delete rules along the entire chain, so that removing a user or an investigation automatically removes all dependent records and prevents orphaned data. Indexes are defined on the username (which is also unique), on the owning user of each investigation, and on the model version of each embedding, in order to accelerate the queries the application issues most frequently. Figure 4.4 shows the entity-relationship diagram."),
  just("The schema is normalized so that each fact is stored in exactly one place: a user’s details live only in the user table, an investigation’s details only in the investigation table, and the relationships between them are expressed through foreign keys rather than duplicated data. This normalization avoids the update anomalies that duplication invites and keeps the database compact. The cascade rules are not merely a convenience but a correctness guarantee: because a single foreign-key relationship links each level of the hierarchy to the one above it, deleting at any level cannot leave dangling references below it, which means the database can never enter a state in which an image or embedding belongs to an investigation that no longer exists. This combination of normalization for integrity and indexing for speed reflects standard relational design practice applied deliberately to the project’s access patterns."),
  ...imageFig("er.png", 600, 326, "Figure 4.4 — Entity-relationship diagram of the database."),
  h3("4.5.1 Data Dictionary"),
  just("The following tables specify each entity in detail, listing every column with its type and constraints. Binary artefacts are not stored in the database: an uploaded image is written to disk and the database retains only its file name and path."),
  ...dd("Table 4.2 — User entity.", [
    ["Id", "int", "Primary key, auto-increment"],
    ["Username", "varchar(50)", "Required, unique index"],
    ["PasswordHash", "text", "Required, BCrypt salted hash"],
    ["CreatedAt", "datetime", "Creation timestamp (UTC)"],
  ]),
  ...dd("Table 4.3 — Investigation entity.", [
    ["Id", "int", "Primary key, auto-increment"],
    ["Title", "varchar(100)", "Required"],
    ["Description", "text", "Optional"],
    ["CreatedAt", "datetime", "Creation timestamp (UTC)"],
    ["UserId", "int", "Foreign key to User, indexed, cascade delete"],
  ]),
  ...dd("Table 4.4 — UploadedImage entity.", [
    ["Id", "int", "Primary key, auto-increment"],
    ["FileName", "text", "Required, original file name"],
    ["FilePath", "text", "Required, absolute path on disk"],
    ["UploadedAt", "datetime", "Upload timestamp (UTC)"],
    ["InvestigationId", "int", "Foreign key to Investigation, cascade delete"],
  ]),
  ...dd("Table 4.5 — ImageEmbedding entity.", [
    ["Id", "int", "Primary key, auto-increment"],
    ["ModelVersion", "varchar(50)", "Required, indexed (for example, epoch_3)"],
    ["VectorData", "text", "Serialized embedding reference"],
    ["UploadedImageId", "int", "Foreign key to UploadedImage, cascade delete"],
  ]),
  h2("4.6 Structural Design"),
  just("Figure 4.5 presents the class diagram, showing the domain entities with their attributes and navigation properties, together with the application services that operate on them. Each service is defined behind an interface, which enables dependency injection and substitution during testing and keeps the controllers thin. The model manager on the Python side is included as a supporting class: it is implemented as a singleton so that the model checkpoints are loaded into GPU memory exactly once and then reused across all requests, avoiding the prohibitive cost of reloading a model on every search."),
  ...imageFig("classdiagram.png", 600, 337, "Figure 4.5 — Class diagram (domain model and services)."),
  h2("4.7 Application Programming Interface"),
  just("The application tier exposes a REST interface grouped into four controllers — authentication, investigation, image, and search. Every endpoint except registration and login requires a valid bearer token. Table 4.6 lists the endpoints and their purposes."),
  table(["Method and route", "Purpose"],
    [
      ["POST /api/auth/register", "Create a new user account."],
      ["POST /api/auth/login", "Authenticate and receive a session token."],
      ["POST /api/investigation/create", "Create an investigation for the current user."],
      ["GET /api/investigation/list", "List the current user’s investigations."],
      ["GET /api/investigation/{id}", "Retrieve a single investigation."],
      ["DELETE /api/investigation/{id}", "Delete an investigation and its dependents."],
      ["POST /api/image/upload", "Upload images, store them, and optionally trigger indexing."],
      ["POST /api/image/index/{id}", "Build or rebuild the vector index for an investigation."],
      ["GET /api/image/list/{id}", "List the images of an investigation."],
      ["DELETE /api/image/{imageId}", "Delete a single image."],
      ["POST /api/search/text", "Text-to-image semantic search."],
      ["POST /api/search/image", "Image-to-image similarity search."],
    ], [3700, 5660]),
  caption("Table 4.6 — REST API endpoints."),
  just("A text-search request carries the investigation identifier, the query text, the chosen model checkpoint, and the chosen distance metric; the response carries the investigation identifier and a list of the requested number of matches (five by default), each consisting of a file name, a raw similarity score, and a percentage that is derived from the score for display. The image-search request is structurally similar but transmits the query photograph as a multipart upload rather than as text."),
  just("Error responses follow a single consistent shape across the entire interface, which is a direct benefit of the global error-handling component. Whatever the failure — an invalid request, an attempt to reach data the user does not own, a missing investigation index, or an unexpected internal fault — the client receives a structured response carrying a human-readable message and the corresponding status code, never an internal trace. This uniformity simplifies the front end, which can handle all failures through one path, and it underpins the interceptor in the client that detects an expired session and returns the user to the login page automatically. Designing the error contract with the same care as the success contract is a small decision with a disproportionate effect on the robustness and predictability of the whole system."),
  h2("4.8 Behavioural Design"),
  just("Figure 4.6 traces the dynamic behaviour of the most representative interaction, a text-to-image search. The investigator submits a description through the React client, which issues an authenticated request to the .NET API; the API validates the token and forwards the query to the Python service; the service loads the pre-computed vector file for the chosen investigation and checkpoint, encodes and normalizes the query text, computes the similarity scores, and returns the requested number of best matches; the API relays the result and the client renders the ranked grid with percentage scores."),
  ...imageFig("sequence.png", 600, 332, "Figure 4.6 — Sequence diagram: text-to-image search."),
  just("Figure 4.7 shows the upload-and-indexing interaction. The uploaded files are written to disk and recorded in the database; the API then asks the Python service to rebuild the investigation’s vector index; the service encodes the images for each available checkpoint in memory-bounded batches and writes the resulting tensors to disk. For large bulk uploads the client sends the images in batches and defers indexing until the final batch, so that the index is built once rather than repeatedly."),
  ...imageFig("seq_upload.png", 600, 308, "Figure 4.7 — Sequence diagram: image upload and indexing."),
  h2("4.9 Design Patterns and Principles"),
  just("Several established patterns and principles shaped the design. The controller–service pattern keeps controllers thin and concentrates business logic in injectable services. Dependency inversion is applied throughout the application tier, with services depending on interfaces rather than concrete types. The singleton pattern governs the model manager so that expensive model state is created once. The repository-like role of the object-relational mapper isolates the rest of the application from the details of the database. Finally, the separation of the artificial-intelligence service as an independent microservice embodies the single-responsibility principle at the architectural scale, keeping the machine-learning concern entirely distinct from the transactional concern."),
  h2("4.10 Rationale for Key Design Decisions"),
  just("Several decisions deserve explicit justification because they were genuine choices among alternatives. The decision to route every client request through the application tier, rather than allowing the browser to call the inference service directly, was made to keep a single point of authentication and authorization and to avoid exposing the internal service to the public; the modest cost is one extra internal network hop. The decision to keep images and embedding tensors on disk and reference them from the database, rather than storing them as binary columns, keeps the relational store small and fast and plays to the strengths of each storage medium — the database for structured relationships and the file system for large binary artefacts."),
  just("The decision to persist each investigation’s vectors as a self-contained file per checkpoint, rather than in a shared store, keeps the search path simple and makes an investigation’s index trivial to rebuild or discard in isolation; its limitation at very large scale is acknowledged in Chapter 11. The choice of stateless token-based authentication over server-side sessions removes the need for shared session storage and makes the application tier horizontally scalable without additional infrastructure. Finally, the choice of a single-page interface concentrates the user experience in the browser and lets the server expose a clean data-only interface, which keeps the front-end and back-end responsibilities cleanly separated. Each of these decisions trades a measure of generality for simplicity and clarity, which is appropriate for a system at this stage of its life."),
  h2("4.11 Scalability and Extensibility"),
  just("Although the system was built for a single-workstation deployment, several aspects of its design bear directly on how it would scale. The stateless authentication scheme means the application tier holds no per-user state, so additional instances of it could be run behind a load balancer without any shared session store. The database is a conventional relational system that scales by established means. The inference service is the component most sensitive to load, since each search and each indexing operation consumes graphics-processor time; it would scale by running multiple instances, each holding the model checkpoints in memory, with requests distributed among them. The one component that does not scale gracefully in its present form is the vector store: because each investigation’s vectors are held in a flat file and searched exhaustively, very large galleries would eventually make the linear scan the dominant cost. The remedy — an approximate nearest-neighbour index — is well understood and is identified as future work, and importantly the rest of the design would accommodate it without change, because the search service depends only on the abstract operation of ranking a gallery, not on how that ranking is computed."),
  just("Extensibility was a design goal in its own right. Because the application tier depends on service interfaces rather than concrete implementations, an alternative inference back-end — a different model, or a remote inference cluster — could be substituted by providing a new implementation of the search service without touching the controllers or the interface. Because the model manager loads whatever checkpoints are present, adding a new fine-tuned checkpoint requires only placing its files in the model directory. These properties mean the system is positioned as a platform for further experimentation rather than a closed artefact."),
  h2("4.12 User-Interface Design"),
  just("The interface was designed to be immediately legible to a non-technical investigator and to keep the user oriented during operations that take time. It adopts a dark, professional theme appropriate to a law-enforcement context, with a fixed left sidebar and a main working area. The sidebar lists the investigator’s investigations, each showing its title and creation date, and provides the controls to create a new investigation and to sign out; selecting an investigation loads it into the main area. The main area is organized into two tabs. The Images tab presents the investigation’s photographs in a responsive grid, offers a multi-file upload control with a progress indicator that reports how far a bulk upload has advanced, and allows individual images to be removed. The Search tab presents a prominent query field, a toggle between text and image search, the model and metric selectors, the panel of attribute sliders, and the results grid."),
  just("Two aspects of the interface design directly serve usability. First, every long-running operation — uploading, indexing, and searching — reports its status in plain language, so the user is never left wondering whether the system has stalled; this matters especially for indexing a large gallery, which can take time. Second, each result is presented as a card showing the photograph, its file name, and a large, clearly-formatted percentage that expresses the match confidence, so that the ranking is interpretable at a glance without any understanding of the underlying scores. The single-page structure means that navigating between investigations and between tabs is instantaneous, with no page reloads, which keeps the investigator’s attention on the task rather than on the mechanics of the tool."),
];

// =================== CHAPTER 5 ===================
const ch5 = [
  h1("5. Artificial Intelligence Methodology"),
  just("This chapter describes, without reference to source code, the machine-learning methods that give the system its recognition capability: the model, the dataset and the way its attributes were turned into captions, the fine-tuning strategy and training objective, the indexing pipeline, the two retrieval modes, the attribute-based query refinement, and the evaluation protocol."),
  h2("5.1 The CLIP Model"),
  just("The recognition capability is built on a CLIP model with a ViT-B/32 image encoder. Both the image encoder and the text encoder produce vectors in the same 512-dimensional space, which is what makes cross-modal comparison between a text query and an image possible. At inference time the system uses only the encoders: an input is passed through the appropriate encoder, the resulting vector is L2-normalized, and that normalized vector is the input’s position in the shared space. No further training occurs at inference; the learned embedding space is simply queried."),
  h2("5.2 Dataset and Synthetic Caption Generation"),
  just("The model was fine-tuned on the CelebA dataset, in which every face image is annotated with 40 binary attributes such as Male, Young, Eyeglasses, Wearing_Hat, Bald, Mustache, Goatee, and Smiling. Because CLIP learns from image–text pairs rather than from binary labels, these attributes cannot be used directly as a training signal. To bridge this gap, a rule-based caption-generation procedure converts the active attributes of each image into a grammatically coherent natural-language sentence on the fly during training. For example, an image annotated as male, wearing eyeglasses, and not bearded yields a caption such as “a man wearing eyeglasses”. This transformation accomplishes two things at once: it produces the descriptive captions that the contrastive objective requires, and it deliberately mirrors the way an investigator phrases a query at inference time, so that the model is trained on the same kind of language it will later be asked to interpret."),
  h2("5.3 Transfer Learning with Partial Freezing"),
  just("Rather than training a model from scratch, the project applies transfer learning from the pre-trained CLIP weights. To preserve the broad visual-linguistic knowledge already captured during pre-training while specializing the model for facial-attribute matching, a partial-freezing strategy is used: the majority of the network’s layers are frozen and excluded from the gradient update, and only a targeted subset of layers is unfrozen and allowed to adapt. This strategy reduces the risk of catastrophic forgetting, in which a model overwrites useful prior knowledge; it lowers the computational cost of each training step; and it limits the number of trainable parameters, which in turn reduces the tendency to overfit a comparatively small dataset. It is standard practice when adapting a large pre-trained Transformer to a narrower domain."),
  h2("5.4 Training Objective and Optimization"),
  just("Training optimizes a symmetric contrastive objective. For a batch of paired images and captions, the model computes a matrix of cosine similarities between every image embedding and every caption embedding, scaled by a learned temperature parameter. A cross-entropy loss is then applied in both directions: from images to captions, so that each image is drawn toward its own caption and away from the others, and from captions to images, so that each caption is drawn toward its own image. The two terms are averaged to form the final loss. The optimizer used is AdamW, the conventional choice for fine-tuning Transformer models because its decoupled weight-decay regularization improves training stability and generalization. Model snapshots were saved at successive epochs, producing the family of checkpoints that is evaluated in Chapter 9."),
  h2("5.5 Image Indexing Pipeline"),
  just("Before an investigation can be searched, its images must be converted into embeddings and stored. The indexing pipeline reads the images for an investigation, processes them in memory-bounded batches of thirty-two so that the system’s memory footprint remains constant regardless of the size of the gallery, and passes each batch through the image encoder. The resulting 512-dimensional vectors are L2-normalized and concatenated, and for every available model checkpoint the complete matrix of vectors is written to disk together with the corresponding file names, in a file named for the investigation and the checkpoint. Storing the file names alongside the vectors allows a search to map a matrix row directly back to the photograph it represents. Performing the encoding on the GPU is essential to making this step practical for large galleries, as quantified in Chapter 9."),
  h2("5.6 Text-to-Image Retrieval"),
  just("A text search proceeds in four steps. First, the query text is tokenized and passed through the text encoder to obtain a 512-dimensional vector, which is L2-normalized. Second, the pre-computed matrix of image vectors for the selected investigation and checkpoint is loaded from disk. Third, a similarity score is computed between the query vector and every image vector using the chosen metric — for cosine similarity this is a single matrix product, and for Euclidean distance it is the negated pairwise distance so that, as with cosine, a larger value indicates a better match. Fourth, the highest-scoring images — five by default, or as many as the investigator chooses — are returned together with their file names and scores. Because the comparison is a single dense matrix operation, the search is effectively instantaneous at the scale of a typical investigation."),
  just("By default the system returns the five best matches, a short, high-confidence list that keeps the investigator’s attention on the candidates most likely to be relevant and avoids the fatigue a long ranked list would induce, while still tolerating the occasional case in which the best match is not ranked first. The investigator can, however, raise this number through the interface when a broader review is warranted — inspecting, for instance, the top twenty or fifty candidates for a difficult description — and the system clamps any request to the size of the gallery so that it can never ask for more results than exist. This flexibility is possible because the number of returned results is a single parameter that does not affect any other part of the retrieval logic. The default of five also aligns with the evaluation, in which Recall@5 measures precisely the probability that the correct image falls within that default list."),
  h2("5.7 Image-to-Image Retrieval"),
  just("Image-to-image search follows the identical retrieval logic, except that the query vector is produced by passing an uploaded reference photograph through the image encoder rather than passing text through the text encoder. This enables “find more people who look like this” queries that complement the descriptive text search."),
  just("A useful correctness property arises in this mode. If the reference photograph is itself already present in the indexed gallery, it must be returned as the top result, because the cosine similarity of any L2-normalized vector with itself is exactly one. The system therefore reports a match of approximately one hundred percent in that specific case. This is an expected mathematical identity that confirms the indexing and ranking pipeline are correct; it is explicitly not a measure of recognition accuracy and not evidence of overfitting, both of which can only be assessed on data the model was not given as a gallery item. Genuine generalization is measured separately and quantitatively in Chapter 9."),
  h2("5.8 Attribute-Based Query Refinement"),
  just("To make natural-language search more controllable, the interface provides a set of certainty sliders for salient facial attributes: glasses, beard, mustache, hat, baldness, and apparent youth or age. Each slider expresses the investigator’s confidence in the presence of that attribute on a zero-to-one-hundred scale. When a slider passes a confidence threshold of fifty percent, the corresponding descriptive phrase is appended to the free-text query before the query is encoded. For example, a base description of “a man” with the glasses and beard sliders raised becomes the query “a man, wearing glasses, with a beard”. This is a lightweight, transparent form of query expansion: it steers the query embedding toward the region of the space associated with the chosen attributes without requiring the investigator to compose a perfectly phrased sentence."),
  just("A more elaborate continuous-weighting variant, in which separately-encoded attribute embeddings are blended in proportion to each slider, was investigated during development. The threshold-based expansion was retained because it produced more accurate retrieval on the project’s own fine-tuned model. The reason is instructive: encoding the complete, natural sentence as a single unit lets the text encoder interpret the combination of attributes in context, whereas linearly combining independently-encoded phrases discards some of that contextual interaction and proved less precise in practice. The simpler approach was therefore both more effective and easier to reason about, and it is the method used in the delivered system."),
  h2("5.9 Score Interpretation"),
  just("Raw similarity scores are not intuitive to a non-technical user, so each score is converted to a percentage for display by taking the score, clamping it at zero to avoid negative values, scaling it to a percentage, and rounding to one decimal place. This produces a stable, legible indication of relative confidence on every result card while avoiding misleading negative numbers."),
  h2("5.10 Evaluation Protocol"),
  just("The effect of fine-tuning is quantified using Recall@K, the standard metric for retrieval tasks. Recall@K is the proportion of queries for which the correct target appears within the top K returned results. In the project’s protocol, a caption is generated from each test image’s attributes, that caption is used as a text query, all images in the test set are ranked by similarity to the caption, and the query is counted as successful at cut-off K if the image the caption actually describes appears within the top K. The same procedure is applied identically to every checkpoint, so that the resulting numbers are directly comparable. The full results, including the complete learning curve across all evaluated checkpoints, are reported and analysed in Chapter 9."),
  just("Recall@K was chosen in preference to precision-oriented measures because of the nature of the task. In this evaluation each query has exactly one correct target in the gallery, so the question that matters is whether that single target is surfaced within the top results, which is precisely what recall captures; a precision measure, which would reward returning many relevant items, is less meaningful when relevance is defined by a single image. Reporting recall at several cut-offs then characterizes the system at the operating points that matter in practice — the very top of the list and the short reviewable shortlist — and it is the contrast between those cut-offs, as much as their individual values, that the analysis in Chapter 9 draws upon."),
  h2("5.11 Image and Text Preprocessing"),
  just("Both encoders require their inputs to be presented in a fixed form. An image is resized and centre-cropped to the encoder’s expected resolution, converted to three colour channels, and normalized channel-by-channel using the mean and standard deviation values established by the pre-trained model, so that the statistics of every input match those the network was trained on. A text input is tokenized — split into sub-word units drawn from a fixed vocabulary — mapped to integer identifiers, and padded to a common length so that a batch of captions can be processed together. These preprocessing steps are applied identically during indexing, during search, and during evaluation, which is essential: any inconsistency between the way images are processed at index time and the way the query is processed at search time would distort the comparison and degrade retrieval quality."),
  h2("5.12 Mathematical Formulation of the Similarity Search"),
  just("It is worth stating the retrieval computation precisely, because its simplicity is the reason the search is fast. After preprocessing and encoding, every gallery image is represented by a 512-dimensional vector, and these are stacked into a matrix with one row per image. The query — whether text or image — is encoded into a single 512-dimensional vector. Because every vector has been L2-normalized to unit length, the cosine similarity between the query and a given image reduces exactly to their dot product, and the dot products against the entire gallery are obtained in one matrix–vector multiplication. The result is a vector of scores, one per image, from which the highest five are selected. The Euclidean option computes the pairwise distance instead and negates it so that, as with cosine, a larger value denotes a better match. Expressed this way, a search over a gallery is a single dense linear-algebra operation, which is why it completes in a small fraction of a second even though every image is compared against the query."),
  just("The training objective can be described in the same spirit. For a batch of paired images and captions, the model forms the matrix of cosine similarities between every image and every caption. The correct pairings lie on the diagonal of this matrix. The symmetric contrastive loss treats each row as a classification problem whose correct answer is the diagonal entry — pushing each image toward its own caption — and simultaneously treats each column the same way — pushing each caption toward its own image. A temperature parameter scales the similarities before the loss is computed, controlling how sharply the model distinguishes the correct pairing from the alternatives. Averaging the row-wise and column-wise terms yields the final loss that fine-tuning minimizes."),
  h2("5.13 The Projection Layers and Embedding Alignment"),
  just("CLIP’s two encoders do not naturally produce vectors of the same dimensionality, and a small but important part of the architecture exists to reconcile them. The image encoder and the text encoder each end in a learned linear projection that maps their internal representation into the common 512-dimensional space. It is only after these projections that an image vector and a text vector are directly comparable. The implementation is careful to apply the appropriate projection in every code path that produces an embedding, because omitting it would leave a vector in the wrong space and silently corrupt every similarity computed from it. This subtlety was one of the practical considerations behind the defensive output-handling routine described in Chapter 6: the routine guarantees that, regardless of the exact form in which the model returns its output, the final vector is the correctly projected and normalized 512-dimensional embedding."),
  h2("5.14 Design of the Caption Generator"),
  just("The caption generator is the bridge between the dataset’s machine-readable labels and the natural language the model learns from, and its design has a direct influence on what the model learns. Each image’s active attributes are assembled into a grammatically plausible sentence: a subject is chosen according to gender and apparent age, and descriptive clauses for hair, facial hair, eyewear, headwear, and expression are appended when the corresponding attributes are present. The generator was deliberately written to produce the same kind of phrasing an investigator would naturally use, so that there is no systematic gap between the language seen during training and the language received at query time. This alignment is the reason the attribute sliders in the interface are effective: each slider contributes a phrase drawn from the same descriptive vocabulary the model was trained on, so the model interprets it reliably."),
  just("The generator’s reliance on a fixed set of rules is both a strength and a limitation. Its strength is determinism and transparency: every caption is explainable and reproducible, with no risk of a generative model introducing spurious or inconsistent descriptions. Its limitation is linguistic uniformity: real witness descriptions are far more varied than any rule set, and bridging that variety more completely is identified as future work."),
  h2("5.15 Why Fine-Tuning Outperforms the Zero-Shot Baseline"),
  just("It is worth articulating why fine-tuning helps, because the reason connects the methodology to the results. The pre-trained model distributes its representational capacity across an enormous range of visual concepts, only a small fraction of which concern faces and their attributes. Fine-tuning on facial captions reallocates a portion of that capacity toward the distinctions that matter for this task — separating, for instance, the embedding of a bearded face from that of a clean-shaven one more decisively than the general model does. The partial-freezing strategy ensures this reallocation is gentle, adjusting only the layers most responsible for the final embedding while preserving the lower-level visual features the general model already represents well. The learning curve in Chapter 9 is the empirical fingerprint of this process: the steep first-epoch gain reflects the rapid reallocation toward the facial vocabulary, and the eventual decline reflects the point at which further specialization begins to erode the general features that still contribute to retrieval."),
  just("Seen this way, the general pre-trained model alone — despite its zero-shot ability — is not sufficient for this application precisely because it treats facial attributes as a small and not especially salient corner of its vast visual vocabulary. It can tell a face wearing glasses from one that is not, but with margins far narrower than the task demands, which is exactly why its baseline Recall@1 in Chapter 9 is low. The retrieval task lives or dies on fine distinctions among faces, fine-tuning is the mechanism by which those distinctions are amplified, and the measured learning curve is the proof that the amplification works. This is the conceptual thread that connects the dataset, the training objective, and the evaluation into a single coherent argument."),
  h2("5.16 Storage and Retrieval of the Index"),
  just("The output of indexing is, for each investigation and each checkpoint, a single file that holds two things: the matrix of image embeddings and the list of file names in the same order as the rows of the matrix. This pairing is what allows a search to translate an abstract result — the index of a high-scoring row — back into the concrete photograph it represents, simply by reading the file name at the corresponding position. Storing the embeddings precomputed in this way is the key to fast search: the expensive encoding of the gallery is performed once, at index time, and every subsequent search reuses it, so that a query incurs only the cost of encoding the single query and multiplying it against the stored matrix. Keeping a separate file per checkpoint means that switching the model used for a search simply selects a different file, with no recomputation, and that re-indexing after new images are added rewrites only the affected investigation’s files and leaves all others untouched."),
];

// =================== CHAPTER 6 ===================
const ch6 = [
  h1("6. Implementation"),
  just("This chapter describes how the design of Chapter 4 was realized in practice, the engineering decisions taken in each tier, and the concrete problems that arose during development and how they were solved. In keeping with the report’s focus on design and analysis rather than listing, it describes the implementation in prose; the complete source code accompanies the project as a separate deliverable."),
  h2("6.1 Development Environment and Tools"),
  just("Development used the .NET 8 software development kit and the C# language for the application tier; Python with PyTorch and the Hugging Face Transformers library for the artificial-intelligence tier; Node.js with the Vite build tool and the React library for the front end; and MySQL 8.x with the Pomelo Entity Framework Core provider for persistence. Inference runs on an NVIDIA GeForce RTX 3060 graphics processor using a CUDA-enabled build of PyTorch."),
  h2("6.2 Application Tier"),
  just("The application tier is organized around the controller–service pattern. Thin controllers handle the mechanics of HTTP — binding requests, checking authentication, and shaping responses — and delegate all real work to injectable services: a user service for registration and authentication, an investigation service for case management, an image service for storage and database records, and a search service that encapsulates all communication with the Python tier. Request contracts are expressed as data-transfer objects annotated with validation rules, so that malformed requests are rejected before any business logic runs. The composition root registers the services, configures token-based authentication, enables cross-origin requests for the front end, ensures the database schema exists on start-up, installs the global error-handling middleware, and exposes the stored images as static files so that the browser can display them directly by URL."),
  h2("6.3 Data Tier"),
  just("Persistence is handled by Entity Framework Core, which maps the four domain entities to MySQL tables. The schema, the cascade-delete rules, and the indexes are declared once in the model configuration, and the database and its tables are created automatically when the application first starts, which removes the need for hand-written schema scripts and makes a fresh deployment self-initializing. Uploaded images are stored on disk under a per-investigation directory and referenced from the database, keeping large binary data out of the relational store."),
  h2("6.4 Artificial-Intelligence Tier"),
  just("The Python service is built on FastAPI and served by Uvicorn. At start-up it loads every available model checkpoint into GPU memory through a singleton model manager and keeps them resident for the lifetime of the process, so that no model is ever reloaded during a request. It exposes three internal endpoints — one to build an investigation’s index, one for text search, and one for image search — and shares common routines for extracting an embedding from the model’s output, loading an investigation’s vectors, and ranking the results, so that the text and image paths behave consistently. The service selects the GPU automatically when a CUDA-capable device is present and falls back to the processor otherwise, which makes the same code portable across machines."),
  just("The decision to load the checkpoints once at start-up, rather than on demand, is the most consequential performance choice in this tier. Loading a checkpoint is an expensive operation involving hundreds of megabytes of weights; performing it on every request would make the system unusably slow. By paying this cost once, during start-up, and holding the models in memory thereafter, every subsequent request incurs only the cost of inference. The trade-off is a longer start-up time and a higher steady-state memory footprint, both of which are entirely acceptable for a service that is started once and then serves many requests. This is a clear instance of a general principle that recurs throughout the system: expensive work is done once and reused — models at start-up, embeddings at index time — so that the operations a user waits on are as cheap as possible."),
  h2("6.5 Presentation Tier"),
  just("The front end is a single-page React application built with Vite. A centralized HTTP client attaches the stored session token to every outgoing request and, on receiving an unauthorized response, clears the session and returns the user to the login page. Routing separates the public login page from a protected dashboard guarded by a route wrapper that checks for a token before rendering. The dashboard presents a sidebar of investigations and switches between an image-management view, which supports multi-file upload with a progress indicator and per-image deletion, and a search view, which offers text and image search, the attribute sliders, the model and metric selectors, and a results grid that displays each match with its percentage score."),
  h2("6.6 Engineering Challenges and Solutions"),
  just("Several substantive problems were encountered and resolved during integration, and they are recorded here because they shaped the final implementation and are instructive in their own right."),
  h3("6.6.1 Model Output Handling"),
  just("The version of the model library used returns the encoder output as a structured object rather than a plain tensor under certain conditions. Code that assumed a tensor failed when it attempted to normalize the output. The solution was a small defensive routine that detects the structured form, extracts the embedding it contains, applies the projection layer when necessary, and only then normalizes — applied uniformly to both the image and text paths so that the two remain consistent."),
  h3("6.6.2 Console-Encoding Failure During Indexing"),
  just("Indexing initially failed on the development machine because a status message contained a non-ASCII character that the Windows console could not encode, and the resulting error aborted the whole indexing operation. The fix was to remove the offending character from the logging statement, after which indexing completed normally. This is a clear illustration of why end-to-end testing on the target platform is indispensable."),
  h3("6.6.3 Incomplete Model Checkpoints"),
  just("The system is designed to load model checkpoints defensively: at start-up it loads only those checkpoints whose weight files are present, and the interface offers only the checkpoints that loaded successfully, so that an absent or corrupt checkpoint can never surface as a confusing runtime error and the system always degrades gracefully. All nine trained checkpoints — epochs zero through eight — are present and loaded in the delivered system, and the best-performing of them are exposed for selection in the interface. This safeguard therefore costs nothing in the current deployment while guaranteeing robust behaviour should any checkpoint be absent in a future one."),
  h3("6.6.4 Bulk Image Upload"),
  just("An attempt to upload ten thousand images in a single request failed because it exceeded two default limits of the web server: the maximum request body size and the maximum number of parts permitted in a multipart form. The remedy was twofold. The server limits were raised to accommodate large uploads, and, more importantly, the front end was changed to upload images in batches of five hundred and to defer index construction until after the final batch, so that a single fragile request was replaced by a sequence of manageable ones and the index was built exactly once at the end."),
  h3("6.6.5 Processor Selection for Inference"),
  just("The inference service was initially running on the central processor even though a capable graphics processor was present, because the installed build of the deep-learning framework was the processor-only variant and could not see the graphics hardware. Replacing it with the CUDA-enabled build allowed the existing device-selection logic to detect and use the graphics processor, which transformed the practicality of indexing large galleries, as quantified below."),
  h2("6.7 Development Process and Project Organization"),
  just("The project was carried out using an iterative, integration-driven process rather than a single linear sequence of stages. Work proceeded along three concurrent strands — the machine-learning strand that produced and refined the model checkpoints, the application strand that built the back-end and database, and the interface strand that built the front-end — which were periodically brought together and exercised as a whole. This organization suited the project for two reasons. First, the strands have very different rhythms: model training is a long-running, experiment-driven activity, whereas application development is a steady accumulation of features, and forcing them into a single schedule would have left one strand idle while the other ran. Second, the most valuable feedback came from integration, because the defects that mattered most arose at the seams between the tiers; running the assembled system frequently surfaced those defects early, while they were still cheap to fix."),
  just("Each integration cycle followed the same shape: a feature was implemented in the tier that owned it, the contract between the tiers was agreed in terms of the request and response shapes documented in Chapter 4, the feature was wired through end to end, and the result was exercised against the live system. The defects recorded in Section 6.6 were all discovered in this way. The documentation strand ran alongside the others throughout, capturing decisions as they were made rather than reconstructing them afterwards, which improved the accuracy of this report."),
  h2("6.8 Performance Characteristics"),
  just("The system’s performance is dominated by two operations: encoding images during indexing, and the similarity search itself. The similarity search, as explained in Chapter 5, is a single dense matrix operation over a few hundred vectors and is effectively instantaneous; it is not a bottleneck at the scale of a typical investigation. Indexing is the costly operation, because every image must be passed through the image encoder for every available checkpoint."),
  just("Moving inference onto the graphics processor changed the practicality of this step decisively. On the development machine’s graphics processor, the image encoder sustains a throughput of approximately four hundred images per second. At this rate, encoding a large gallery of several thousand images across the available checkpoints is a matter of a few minutes, dominated in practice by the time taken to read the image files from disk rather than by the encoding itself. The same workload on the central processor took far longer — on the order of hours — which made bulk indexing impractical before the change. Memory consumption during indexing is held constant regardless of gallery size by processing images in fixed-size batches and releasing each batch immediately after it is encoded, so that the system can index a gallery far larger than would fit in memory all at once."),
  h2("6.9 Cross-Cutting Concerns"),
  just("Several concerns span all of the tiers and were handled centrally rather than being scattered through the code. Configuration values that differ between environments — the database connection details and the address of the inference service — are kept out of the source and supplied through configuration, so that the same build runs unchanged on a different machine once its configuration is provided. Cross-origin access, which the browser enforces to prevent a page from one origin from calling an interface on another, is enabled explicitly for the front end during development so that the interface and the application can run on different ports on the same machine. Diagnostic logging is concentrated in the global error handler and in the inference service’s start-up and indexing routines, which is where information about failures is most useful; the deliberate decision not to log request payloads avoids recording potentially sensitive query content. Finally, the automatic creation of the database schema on first start-up means that deploying the system to a new database requires no manual preparation beyond providing valid credentials."),
  h2("6.10 Summary of the Implementation"),
  just("Taken together, the implementation realizes the design of Chapter 4 faithfully and with a consistent set of guiding choices: thin controllers over rich services, interfaces over concrete dependencies, configuration over hard-coded values, and a clean separation between the transactional and the machine-learning concerns. The engineering challenges that arose were not failures of design but the ordinary friction of integrating a heterogeneous stack, and each was resolved in a way that left the system more robust than before — defensive output handling, platform-aware logging, graceful exclusion of unusable checkpoints, resilient bulk upload, and correct use of the available hardware. The result is a system that not only works but is comprehensible and modifiable, which was an explicit objective of the project."),
];

// =================== CHAPTER 7 ===================
const ch7 = [
  h1("7. Security Considerations"),
  just("Security was treated as a design concern from the outset rather than as an afterthought, because a forensic system handles sensitive material and must guarantee that users cannot access one another’s data."),
  h2("7.1 Authentication and Authorization"),
  just("Authentication is stateless and based on JSON Web Tokens. On a successful login the application issues a cryptographically signed token that encodes the user’s identity; the client stores this token and presents it on every subsequent request. Every data endpoint is marked as requiring authorization, and each request derives the acting user’s identity from the token’s claims. Investigations and images are always scoped to their owner, so that one user can neither see nor modify another user’s data even by guessing identifiers. Because the token is self-contained and verified by signature, the server holds no session state, which simplifies the architecture and improves scalability."),
  h2("7.2 Password Storage"),
  just("Passwords are never stored in plaintext, nor with a fast general-purpose hash that would be vulnerable to large-scale guessing. The system uses BCrypt, an adaptive hashing algorithm that incorporates a unique per-password salt and a deliberately high computational cost factor, which together make brute-force and precomputed-table attacks impractical. An earlier development version used a simple unsalted hash; recognizing its weakness, it was replaced with BCrypt, and this change is noted here because the reasoning behind it is itself part of the system’s security rationale."),
  h2("7.3 Input Validation and Error Handling"),
  just("Every request payload is validated against declared rules — required fields and length limits — and invalid requests are rejected before they reach any business logic, which closes off a class of malformed-input problems. A single global error-handling component wraps the entire request pipeline; it catches any unhandled exception, records it, and returns a consistent structured error with an appropriate status code, mapping recognizable conditions such as not-found and unauthorized to their correct codes. Crucially, it never returns internal diagnostic detail such as a stack trace to the client, so the system does not leak information about its internals to a potential attacker."),
  h2("7.4 Remaining Hardening for Production"),
  just("The development configuration deliberately favours convenience in ways that would be tightened before any real deployment. It permits cross-origin requests from any origin and uses a local database credential held in configuration. A production deployment would restrict cross-origin access to known front-end origins, move secrets into a protected secret store, enforce transport-layer security end to end, and add rate limiting and audit logging. These items are listed among the future-work tasks in Chapter 11."),
  h2("7.5 Threat Model"),
  just("Reasoning about security is clearest when the threats being defended against are stated explicitly. The system’s primary threat is unauthorized access to one user’s investigative data by another party. This is addressed at two levels: an unauthenticated party cannot reach any data endpoint at all, because every such endpoint requires a valid signed token; and an authenticated party cannot reach another user’s data, because every query is scoped to the identity carried in the token rather than to an identifier supplied in the request, so guessing or tampering with an identifier yields nothing. A second threat is credential compromise through the theft of stored passwords; this is mitigated by the adaptive, salted hashing described above, which renders a stolen password store extremely costly to attack. A third threat is information disclosure through error messages; this is mitigated by the global handler, which returns only a generic message and a status code and never an internal trace."),
  just("Several threats are acknowledged but not fully addressed in the current version, and they define the boundary of the system’s security posture. Token theft from a client would allow impersonation for the lifetime of the token; shorter token lifetimes and refresh mechanisms would reduce this exposure. A malicious authenticated insider is outside the current model, since the system trusts authenticated operators; auditing would be required to deter and detect insider misuse. Denial-of-service through a flood of expensive search or indexing requests is likewise unaddressed and would be mitigated by rate limiting. Naming these threats explicitly is itself a security practice, because an undocumented assumption is far more dangerous than a documented limitation."),
  h2("7.6 Data Handling and Privacy"),
  just("Because the system processes facial imagery, it touches on data-protection considerations even in a prototype. The design keeps the data footprint deliberately small and local: images are stored on the deploying organization’s own disk rather than transmitted to any external service, all inference is performed locally on the deploying machine, and no query text or image is sent to a third party. The deliberate decision not to log query payloads, noted in Chapter 6, means the system does not accumulate a record of what investigators searched for. A production deployment handling real case material would extend these measures with encryption of data at rest, a defined retention and disposal policy, and access logging, but the prototype’s local-only, minimal-footprint design is a sound foundation for those extensions."),
];

// =================== CHAPTER 8 ===================
const ch8 = [
  h1("8. Testing and Verification"),
  h2("8.1 Strategy"),
  just("Because the system is distributed across three processes and a database, verification concentrated on end-to-end integration testing: each feature was exercised through the live application interface exactly as the front end would invoke it, and the cooperation of the .NET, Python, and database tiers was confirmed at each step. This approach is the most effective way to detect the integration defects that arise at the boundaries between components and that unit testing of any single component would not reveal. It complements the component-level reasoning embodied in the design and was the route by which the defects recorded in Chapter 6 were discovered."),
  h2("8.2 Test Cases and Outcomes"),
  just("Table 8.1 records the principal verification scenarios and their outcomes. Each was executed against the running system."),
  table(["Test", "Scenario", "Expected outcome", "Result"],
    [
      ["T-1", "Login with invalid credentials", "Request is rejected as unauthorized", "Pass"],
      ["T-2", "Access a data endpoint without a token", "Request is rejected as unauthorized", "Pass"],
      ["T-3", "Register and then log in a new user", "Account is created and a token is issued", "Pass"],
      ["T-4", "Create and list an investigation", "Investigation is persisted and returned", "Pass"],
      ["T-5", "Upload images to an investigation", "Files are stored, recorded, and indexed", "Pass"],
      ["T-6", "List images from the database", "The uploaded images are returned", "Pass"],
      ["T-7", "Text search for a described suspect", "Five ranked matches with percentages are returned", "Pass"],
      ["T-8", "Self-retrieval with a gallery image", "That same image ranks first at ≈ 100%", "Pass"],
      ["T-9", "Trigger an internal error", "A structured error with a correct status code is returned", "Pass"],
      ["T-10", "Bulk upload in batches", "All batches are stored and the index is built once", "Pass"],
    ], [800, 3560, 3000, 1000]),
  caption("Table 8.1 — Verification test cases and outcomes."),
  h2("8.3 Defects Identified and Corrected"),
  just("Verification surfaced the substantive defects discussed in Chapter 6 — the structured model output, the console-encoding failure during indexing, and the bulk-upload limits — each of which was corrected and then re-verified. The fact that these defects were caught by integration testing rather than by inspection reinforces the value of exercising the assembled system on its target platform."),
  h2("8.4 Test Environment"),
  just("Verification was carried out against the fully assembled system running on the development workstation, with all four components active: the front end, the application interface on its port, the inference service on its port with the model checkpoints loaded onto the graphics processor, and the database. Requests were issued exactly as the front end issues them, including the authentication token, so that the behaviour observed was the behaviour a user would experience. The model-dependent tests — text search, self-retrieval, and bulk indexing — were run against a real investigation populated with the evaluation images, so that the retrieval paths were exercised end to end rather than against stub data."),
  h2("8.5 Limitations of the Testing"),
  just("The verification described here establishes that the system behaves correctly across its principal flows, but it is integration testing rather than exhaustive testing, and its limits should be stated plainly. It does not include automated regression tests that would re-run on every change, nor load testing that would characterize behaviour under many concurrent users, nor a formal security penetration assessment. These were out of scope for the project’s timeline and are appropriate subjects for the future-work programme. The quantitative quality of the recognition, as distinct from the correctness of the software, is addressed separately and rigorously by the Recall@K evaluation of Chapter 9, which is the project’s principal measurement of how well, rather than merely whether, the system performs its task."),
];

// =================== CHAPTER 9 — RESULTS ===================
const ch9 = [
  h1("9. Results and Evaluation"),
  just("This chapter reports both the functional outcome of the project and a quantitative evaluation of the recognition model. The quantitative results are the project’s own measurements, obtained by running every available checkpoint through an identical evaluation procedure; no figure in this chapter is taken from an external source."),
  h2("9.1 Functional Outcomes"),
  just("The completed system satisfies all of its functional objectives. It supports secure multi-user operation, the creation and management of investigations, the upload and indexing of images, and both text-to-image and image-to-image retrieval with a selectable checkpoint and distance metric. Qualitatively, the retrieval pipeline behaves as the underlying theory predicts: relevant candidates are ranked above irrelevant ones, and the similarity scores decline smoothly as the visual or semantic resemblance to the query decreases. The image-to-image mode exhibits the self-retrieval property described in Chapter 5, returning a gallery query image to itself at approximately one hundred percent, which confirms the correctness of the pipeline without making any claim about generalization."),
  just("Measured against the functional requirements of Chapter 3, every requirement is satisfied by a working feature, as the traceability table of that chapter records and the verification of Chapter 8 confirms. The system can be exercised from end to end by an investigator who has no knowledge of its internal workings: the registration, case-creation, upload, and search flows each complete through the interface alone, and each long-running step reports its progress so that the user is never left uncertain. In this sense the project delivers not merely a model that retrieves but a system that an investigator could actually operate, which was the distinction the objectives drew between a demonstration and a usable tool."),
  h2("9.2 Evaluation Setup"),
  just("To measure the benefit of fine-tuning, a Recall@K evaluation was performed on a set of 536 face images. For each image, a caption was generated from its 40 attribute annotations using the same rule-based procedure employed during training; that caption was used as a text query; all 536 images were ranked by cosine similarity to it; and the query was scored as correct at cut-off K if the image the caption describes appeared within the top K results. The evaluation was run identically on all nine checkpoints — the pre-trained baseline (epoch 0) and the eight fine-tuned checkpoints saved at epochs one through eight. As a point of reference, random retrieval over a pool of 536 images would yield a Recall@1 of approximately 0.19 percent, so any value materially above this represents genuine retrieval ability."),
  just("Two properties of this evaluation design deserve emphasis because they underpin the validity of the comparison. First, the evaluation is a closed retrieval task: the correct answer for every query is guaranteed to be present in the gallery, so a failure reflects a genuine ranking error by the model rather than the absence of a target. Second, the difficulty of the task scales with the size of the gallery, because each query must single out one correct image from all 536 candidates; this is a demanding setting, and it is the reason the absolute Recall@1 values, while many times above chance, are well below the values one would see in an easier task with a handful of candidates. Holding the gallery, the captions, and the protocol fixed across every checkpoint ensures that any difference in the measured Recall is attributable to the model weights alone, which is exactly the comparison the evaluation is designed to make."),
  h2("9.3 Quantitative Results"),
  just("Table 9.1 reports the complete set of measurements, and Figures 9.1 and 9.2 visualize them."),
  table(["Checkpoint", "Recall@1 (%)", "Recall@5 (%)", "Recall@10 (%)"],
    [
      ["Epoch 0 (pre-trained baseline)", "3.73", "13.25", "21.08"],
      ["Epoch 1", "5.60", "20.90", "31.72"],
      ["Epoch 2", "6.34", "20.71", "31.34"],
      ["Epoch 3 (deployed default)", "6.16", "20.52", "29.85"],
      ["Epoch 4", "6.72", "21.08", "29.85"],
      ["Epoch 5", "6.72", "20.71", "29.10"],
      ["Epoch 6 (best Recall@1)", "7.46", "21.08", "30.60"],
      ["Epoch 7", "6.53", "19.96", "29.66"],
      ["Epoch 8", "6.34", "20.15", "29.66"],
    ], [3360, 2000, 2000, 2000]),
  caption("Table 9.1 — Recall@K across all evaluated checkpoints (536-image CelebA subset)."),
  ...imageFig("recall_curve.png", 600, 375, "Figure 9.1 — Recall@K versus fine-tuning epoch (learning curve)."),
  ...imageFig("recall_compare.png", 560, 361, "Figure 9.2 — Baseline versus fine-tuned checkpoints."),
  h2("9.4 Analysis of the Learning Curve"),
  just("The learning curve in Figure 9.1 tells a coherent and instructive story. The single largest gain occurs at the very first epoch of fine-tuning: across all three cut-offs the curve rises steeply from the baseline, with Recall@10 jumping from 21.08 percent to 31.72 percent and Recall@5 from 13.25 percent to 20.90 percent in one epoch. This confirms that even a small amount of domain-specific fine-tuning rapidly adapts the general pre-trained model to the facial-attribute task."),
  just("Beyond the first epoch the behaviour differs by cut-off, which is itself informative. Recall@1 — the strictest and most demanding metric, requiring the exact target to be ranked first — continues to improve gradually and reaches its maximum of 7.46 percent at epoch six, twice the baseline value of 3.73 percent. Recall@5 is essentially flat from epoch one onward, sitting around 20 to 21 percent, and also peaks at epoch six. Recall@10, the most permissive metric, peaks earliest, at epoch one, and then settles slightly lower in the high-twenties to low-thirties. The interpretation is that early fine-tuning quickly teaches the model to bring the correct image into the broad top-ten neighbourhood, while the additional epochs progressively sharpen its ability to push that image all the way to the very top — which is precisely what the steadily rising Recall@1 curve reflects."),
  just("The behaviour after the peak is the most important part of the curve for the project’s conclusions. Recall@1 rises to its maximum of 7.46 percent at epoch six and then falls monotonically across the two following checkpoints — to 6.53 percent at epoch seven and 6.34 percent at epoch eight. This sustained two-epoch decline, occurring while the training loss would still be decreasing, is the classic signature of the onset of overfitting: the model begins to specialize on idiosyncrasies of the training data at the expense of generalization to the held-out evaluation set. Because the complete set of checkpoints is now available, the peak is cleanly bracketed — preceded by the lower values at epochs four and five and followed by the decline at epochs seven and eight — which makes epoch six an unambiguous optimum rather than an isolated high point. The curve therefore provides direct empirical evidence both that fine-tuning helps substantially and that there is an optimal stopping point beyond which further training is counter-productive."),
  h2("9.5 Discussion and Checkpoint Selection"),
  just("Two conclusions follow directly from the data. First, fine-tuning is unambiguously beneficial: every fine-tuned checkpoint outperforms the pre-trained baseline on every metric, and the best checkpoint roughly doubles the baseline’s top-1 retrieval accuracy. Second, the evidence identifies epoch six as the strongest operating point, since it attains the highest Recall@1 and Recall@5 while remaining close to the best on Recall@10. The checkpoint at epoch three was adopted as the interface default earlier in development as a reasonable balance; the systematic evaluation reported here refines that judgment and supports epoch six as the preferred checkpoint, while the interface’s ability to switch checkpoints lets an investigator select among them."),
  h2("9.6 Threats to Validity"),
  just("Two honest caveats bound the interpretation of these figures. First, the captions used as queries were produced by a generic rule-based procedure that approximates, but may not exactly reproduce, the caption distribution seen during training; aligning the two more closely could only raise the fine-tuned scores further. Second, the evaluation set of 536 images is modest, so the absolute percentages should be read as indicative rather than definitive. Neither caveat undermines the central finding, because the identical procedure was applied to every checkpoint: the relative comparison between checkpoints — which answers the question of whether and when fine-tuning helps — is valid regardless of these factors, and it answers clearly in the affirmative. A full-scale evaluation on the complete held-out split with the exact training captions is identified as future work."),
  h2("9.7 Relative Improvement and Practical Significance"),
  just("Because the absolute Recall values are bounded by the difficulty of the task and the size of the evaluation set, the improvement relative to the baseline is often the more meaningful quantity, and it is shown in Figure 9.3. The deployed default checkpoint at epoch three improves Recall@1 by roughly two-thirds over the baseline and Recall@5 and Recall@10 by around half. The best checkpoint at epoch six is stronger still: it improves Recall@1 by almost exactly one hundred percent — a doubling — while improving the broader cut-offs by between forty-five and sixty percent."),
  ...imageFig("recall_improve.png", 560, 348, "Figure 9.3 — Relative improvement over the baseline for the default and best checkpoints."),
  just("The practical significance of these numbers is best appreciated in operational terms. The doubling of Recall@1 means that, for the kind of attribute description the system is designed to handle, the exact target image is brought to the very top of the ranking roughly twice as often after fine-tuning as before. For an investigator who inspects results from the top down, this directly reduces the number of candidates that must be examined before the right one is found. The consistent improvement across all three cut-offs, rather than at a single operating point, indicates that the gain is genuine and broad rather than an artefact of one particular threshold. Taken together with the learning curve, the evidence supports a clear and defensible conclusion: fine-tuning on domain-specific facial captions produces a substantial, measurable, and operationally meaningful improvement in retrieval quality, and the optimum is reached around epoch six before mild overfitting sets in."),
  h2("9.8 Per-Checkpoint Observations"),
  just("Reading the table row by row adds detail to the overall trend. The baseline at epoch zero is markedly weaker than every fine-tuned checkpoint on every metric, which is expected: it has never seen the facial-caption vocabulary in a task-specific setting. The very first fine-tuned checkpoint, epoch one, already captures the bulk of the available improvement, particularly at the broader cut-offs, where its Recall@10 of 31.72 percent is in fact the highest of any checkpoint. Epochs two and three consolidate the gains at the stricter cut-offs while giving back a little at Recall@10, a pattern consistent with the model trading breadth for precision as it specializes. Epochs four and five hold Recall@1 steady at 6.72 percent and lift Recall@5 back to its joint-highest value of 21.08 percent, before epoch six pushes Recall@1 to its peak of 7.46 percent, indicating that the model continues to refine its ability to rank the exact target first even after the broader metrics have plateaued. Epochs seven and eight then regress on the strict metric, falling to 6.53 and 6.34 percent respectively — a clear two-step decline that is the signal of incipient overfitting. The fact that the three metrics peak at slightly different epochs — Recall@10 earliest, Recall@1 latest — is not noise but a meaningful reflection of how specialization sharpens the top of the ranking before, eventually, it begins to harm it."),
  h2("9.9 Behaviour of the Two Distance Metrics"),
  just("The interface offers both cosine similarity and Euclidean distance, and a natural question is how the choice affects results. For vectors that have been L2-normalized, as all embeddings in this system are, the two metrics are monotonically related: a smaller Euclidean distance corresponds exactly to a larger cosine similarity, and therefore the two induce the identical ordering of the gallery for any given query. The evaluation in this chapter was conducted with cosine similarity, and an evaluation under Euclidean distance would by this relationship yield the same Recall@K values. The metrics differ only in the numerical scale of the raw scores they produce, not in the ranking, and the option is retained primarily for transparency and to allow the behaviour to be inspected, rather than because it changes which candidates are returned."),
  h2("9.10 Qualitative Observations"),
  just("Beyond the aggregate metrics, inspecting individual searches reveals how the system behaves in practice and where its limits lie. Searches that combine several distinctive attributes — for example, a description specifying gender, eyewear, and facial hair together — produce visibly more focused results than searches on a single common attribute, because each additional attribute narrows the region of the embedding space the query points to. Conversely, descriptions resting on a single very common attribute return a broad set of plausible but loosely-related candidates, which is the expected behaviour of a similarity ranking when the query is itself unspecific. The percentage scores attached to results behave consistently with this: tightly-specified queries yield a steeper drop-off in score from the first result to the fifth, while generic queries yield a flatter distribution. These observations are qualitative, but they are consistent with the quantitative finding that the model has learned a meaningful organization of facial attributes, and they illustrate to a user how to phrase an effective query — namely, with as many distinctive attributes as the witness account supports."),
  h2("9.11 Summary of Findings"),
  just("The evaluation supports four findings that together constitute the project’s empirical contribution. First, even the un-fine-tuned baseline performs far above the random floor, confirming that the general vision-language model already possesses useful facial-retrieval ability. Second, fine-tuning improves every metric at every evaluated checkpoint over that baseline, with the best checkpoint doubling top-1 accuracy. Third, the improvement is front-loaded, with the largest single gain occurring in the first epoch, after which the model refines rather than transforms its ability. Fourth, performance peaks at epoch six and then declines monotonically through epochs seven and eight, providing direct evidence of the onset of overfitting and identifying epoch six as the optimal stopping point. Each of these findings is drawn from the project’s own measurements under a single consistent protocol, and each is reflected directly in the figures of this chapter."),
  h2("9.12 Reproducibility of the Evaluation"),
  just("A measurement is only as valuable as it is reproducible, and the evaluation was therefore designed so that it can be repeated exactly. Every checkpoint was evaluated by the same procedure, with the same evaluation set, the same caption-generation rules, the same similarity metric, and the same cut-offs, differing only in the model weights being assessed. Running all checkpoints in a single batch on the same hardware eliminates any variation that could arise from differences in environment between runs. The procedure is deterministic given the inputs: the same checkpoint evaluated again yields the same numbers, because the encoding of an image and the ranking of the gallery involve no randomness at inference time. This determinism is what licenses the direct comparison between checkpoints that underlies every conclusion in this chapter, and it is the reason the relative findings are robust even though the absolute values are described as indicative. The full parameters required to reproduce the evaluation are recorded in Appendix C."),
];

// =================== CHAPTER 10 ===================
const ch10 = [
  h1("10. Deployment and User Manual"),
  h2("10.1 Prerequisites"),
  just("The system targets a standard workstation and requires the .NET 8 software development kit, Python 3.10 or later, Node.js, and MySQL 8.x. For accelerated inference, an NVIDIA graphics processor with a current driver and a CUDA-enabled build of the deep-learning framework is required; the system runs on the central processor otherwise, at substantially reduced speed. The trained model checkpoints must be present in the artificial-intelligence service’s model directory for the corresponding options to be available."),
  h2("10.2 Installation and Launch"),
  just("Dependency installation is automated by a setup script that verifies the required tools are present, installs the Python, Node, and .NET packages, and configures the database connection. A launch script then starts the three services — the artificial-intelligence service, the application interface programming interface, and the front-end development server — each in its own window, ensures the database service is running, and opens the application in the browser. A companion script stops all services. The interface is served on port 5173, the application interface on port 5011, the artificial-intelligence service on port 8000, and the database on its standard port 3306."),
  h2("10.3 User Guide"),
  num("Register an account on the login page, or log in if one already exists."),
  num("Create a new investigation from the sidebar, giving it a title and an optional description."),
  num("Open the Images tab and upload suspect photographs; wait for the confirmation that indexing has completed."),
  num("Open the Search tab. For a text search, type a description and optionally raise the attribute sliders; for an image search, switch to image mode and upload a query photograph."),
  num("Choose the model checkpoint, the distance metric, and how many results to return, then run the search."),
  num("Review the ranked results, each shown with its image, file name, and percentage match score, and treat them as leads for further human investigation."),
  h2("10.4 Troubleshooting"),
  table(["Symptom", "Cause and resolution"],
    [
      ["Access is denied for the database user", "The configured database password does not match the server; correct the connection setting."],
      ["The database is reported as unknown on first run", "This is expected; the application creates the schema automatically when it first starts."],
      ["A search reports that no vectors were found", "The selected investigation has no indexed images; upload images before searching."],
      ["A model checkpoint cannot be selected", "That checkpoint’s weights are missing; choose an available checkpoint such as epoch three or six."],
      ["A very large upload appears to stall", "Indexing thousands of images takes time; the interface shows progress and completes once encoding finishes."],
    ], [3100, 6260]),
  h2("10.5 Worked Example of a Search Session"),
  just("To make the operation concrete, consider a representative session. The investigator logs in and creates an investigation titled for the case at hand. On the Images tab, the investigator uploads the photographs gathered as evidence; the progress indicator advances as the batches are sent, and a confirmation appears once the index has been built. The investigator then switches to the Search tab and, working from the witness account, types a description such as a man with a beard. Judging from the account that the suspect was also wearing glasses but that this detail is less certain, the investigator raises the glasses slider partway, which appends the corresponding phrase to the query. Leaving the model on the recommended checkpoint and the metric on cosine similarity, the investigator runs the search. The results grid populates with the five best-matching photographs, each labelled with its match percentage, the strongest at the top. The investigator reviews these candidates, and because they are presented as ranked leads rather than identifications, follows up on the most promising ones through ordinary investigative means. Should the account include a reference photograph instead of a description, the investigator would switch the search mode to image and upload that photograph to obtain the most visually similar candidates by the same procedure."),
  h2("10.6 Stopping and Restarting"),
  just("The system is stopped by the companion script, which closes the three services while leaving the database service running, and is restarted by the launch script. Because the database schema and the stored data persist on disk between runs, an investigation created in one session remains available in the next without any further action, and a previously-indexed investigation can be searched immediately without re-indexing."),
];

// =================== CHAPTER 11 & 12 ===================
const ch11 = [
  h1("11. Limitations and Future Work"),
  h2("11.1 Limitations"),
  bullet("Recognition quality is bounded by the capacity of the fine-tuned model and by the diversity and quality of the uploaded photographs."),
  bullet("The quantitative evaluation was conducted on a modest 536-image subset with rule-based captions, so its absolute figures are indicative rather than definitive."),
  bullet("Vector indices are stored as flat per-investigation files and searched exhaustively, which is appropriate at the current scale but would not be efficient for very large national-scale galleries."),
  bullet("The development configuration uses a permissive cross-origin policy and a local database credential that must be hardened before any real deployment."),
  bullet("The system performs attribute-based retrieval rather than identity matching, and its quality degrades on heavily occluded, low-resolution, or non-frontal images that differ from the data the model was trained on."),
  h2("11.2 Future Work"),
  bullet("Complete the quantitative evaluation on the full held-out CelebA test split using the exact training-time captions, extending the metrics to mean average precision and reporting confidence intervals."),
  bullet("Apply early stopping at epoch six in future training runs, and investigate whether a lower learning rate or additional regularization delays the overfitting that the complete learning curve now reveals."),
  bullet("Replace exhaustive search with an approximate nearest-neighbour index to scale retrieval to very large galleries."),
  bullet("Promote the empirically best checkpoint to the interface default and add an automated evaluation step to the training pipeline so that checkpoint selection is data-driven."),
  bullet("Add role-based access control and a complete audit trail, containerize the services, and apply the production-hardening measures identified in Chapter 7."),
  h2("11.3 Discussion of the Limitations"),
  just("The limitations above are not all of equal weight, and it is worth distinguishing those that bound the present results from those that bound a future deployment. The two that bound the present results are the size of the evaluation set and the use of rule-based captions; both affect the absolute Recall values but, as argued in Chapter 9, leave the comparative conclusions intact because the same conditions applied to every checkpoint. The limitations that bound deployment rather than measurement — exhaustive search, the development security configuration, and the missing checkpoints — do not affect any claim made in this report; they describe work that would be required to move from a validated prototype to a production system. Separating these two kinds of limitation is important for an honest reading of the project: the evidence presented is sound within its stated scope, and the open items are engineering tasks rather than gaps in the findings."),
  just("Of the future-work items, two are the most consequential. Completing the evaluation on the full held-out split with training-aligned captions would convert the indicative absolute figures into definitive ones and is the natural next experiment. Replacing the exhaustive search with an approximate nearest-neighbour index is the single change that would most extend the system’s reach, because it is the only component whose cost grows with the size of the gallery; addressing it would allow the same system to serve galleries orders of magnitude larger than those used here, without altering any other part of the design."),
];

const ch12 = [
  h1("12. Conclusion"),
  just("This project set out to bridge the semantic gap between a witness’s verbal description and a database of photographs, and to do so within a secure, usable, and well-architected application. By fine-tuning a CLIP vision-language model on the CelebA dataset and embedding it within a service-oriented full-stack system, Help Culprit Recognition demonstrates that natural-language and example-based suspect retrieval can be delivered as a practical investigative aid rather than as an isolated research artefact."),
  just("The system fulfils all of its functional requirements and exhibits theoretically sound retrieval behaviour. Its central empirical contribution is the learning curve of Chapter 9: by evaluating every available checkpoint under an identical protocol, the project shows that fine-tuning roughly doubles top-1 retrieval accuracy over the pre-trained baseline, that the gain is largest in the first epoch, that performance peaks at epoch six, and that a measurable decline through epochs seven and eight marks the onset of overfitting. This is exactly the kind of evidence-based conclusion that distinguishes an engineered system from a demonstration. While the system is not a substitute for human judgment or formal forensic procedure, it meaningfully reduces the manual effort of candidate identification and establishes a solid, extensible foundation for the future work outlined above."),
  just("In closing, the project achieved its stated objectives in full: it built an end-to-end retrieval system driven by both text and image queries; it applied and specialized a vision-language model through principled fine-tuning; it delivered an interpretable, secure, multi-user application; and it quantified the benefit of its core machine-learning component with a rigorous evaluation on its own data. The result is both a working system and a defensible piece of evidence about how and when fine-tuning a vision-language model improves forensic retrieval — a combination that we believe represents a complete and honest engineering contribution."),
  just("The project also yielded broader lessons that are worth recording. The most valuable feedback consistently came from running the assembled system rather than from reasoning about its parts in isolation, which confirmed the primacy of integration testing for a heterogeneous, multi-process application. The decision to separate the machine-learning concern into its own service repeatedly proved its worth, allowing the model work and the application work to advance without obstructing one another. And the discipline of measuring the model on its own checkpoints, rather than relying on general claims about the underlying architecture, transformed a plausible assertion that fine-tuning helps into a precise, evidenced statement of how much it helps and when it stops helping. These lessons — integrate early, separate concerns, and measure honestly — are the methodological core of the project and are as much a part of its outcome as the system itself."),
];

const refs = [
  h1("References"),
  num("A. Radford et al., “Learning Transferable Visual Models From Natural Language Supervision (CLIP),” Proceedings of the 38th International Conference on Machine Learning (ICML), 2021.", "refs"),
  num("A. Dosovitskiy et al., “An Image is Worth 16x16 Words: Transformers for Image Recognition at Scale,” International Conference on Learning Representations (ICLR), 2021.", "refs"),
  num("A. Vaswani et al., “Attention Is All You Need,” Advances in Neural Information Processing Systems (NeurIPS), 2017.", "refs"),
  num("Z. Liu, P. Luo, X. Wang, and X. Tang, “Deep Learning Face Attributes in the Wild (CelebA),” Proceedings of the IEEE International Conference on Computer Vision (ICCV), 2015.", "refs"),
  num("M. Cao, X. Zhou, D. Jiang, B. Du, M. Ye, and M. Zhang, “Multilingual Text-to-Image Person Retrieval via Bidirectional Relation Reasoning and Aligning,” IEEE Transactions on Pattern Analysis and Machine Intelligence, 2025.", "refs"),
  num("T. Zhang, X. Xie, X. Du, and H. Xie, “Sketch-guided Scene Image Generation with Diffusion Model,” Computers & Graphics, p. 104226, 2025.", "refs"),
  num("P. S. Sherly and P. Velvizhy, “‘Idol talks!’ AI-driven Image to Text to Speech,” Heritage Science, vol. 12, no. 1, 2024.", "refs"),
  num("S. Yang, B. Mo, D. Liu, and L. Zhu, “MAHE: A Multiscale and Hybrid Expert-based Model for Image–Text Enhanced Named Entity Recognition on Social Media,” Scientific Reports, vol. 15, 2025.", "refs"),
  num("J. Xu, D. Han, K. Li, J. Li, and Z. Ma, “Unified Interest Point Detection and Description for Perspective and Fisheye Images,” Scientific Reports, vol. 15, 2025.", "refs"),
  num("Hugging Face, “Transformers Documentation — CLIP.” Microsoft, “ASP.NET Core and Entity Framework Core Documentation.” FastAPI, PyTorch, and React official documentation.", "refs"),
];

// =================== APPENDICES (no code) ===================
const appA = [
  new Paragraph({ heading: HeadingLevel.HEADING_1, pageBreakBefore: true, children: [t("Appendix A — Glossary of Terms")] }),
  gloss("Embedding", "A fixed-length vector (here, 512 numbers) that represents an image or a piece of text as a point in a shared space."),
  gloss("CLIP", "Contrastive Language–Image Pre-training; the dual-encoder model that maps images and text into one shared embedding space."),
  gloss("ViT-B/32", "The base-size Vision Transformer used as CLIP’s image encoder, operating on image patches of 32×32 pixels."),
  gloss("Contrastive loss", "A training objective that pulls matching image–text pairs together and pushes non-matching pairs apart."),
  gloss("Cosine similarity", "The dot product of two L2-normalized vectors; equal to the cosine of the angle between them, with one indicating identity of direction."),
  gloss("Euclidean distance", "The straight-line distance between two points; a smaller value indicates greater similarity."),
  gloss("L2 normalization", "Dividing a vector by its own length so that it lies on the surface of a unit sphere."),
  gloss("Fine-tuning", "Continuing the training of a pre-trained model on a smaller, task-specific dataset."),
  gloss("Partial freezing", "Updating only a chosen subset of a network’s layers during fine-tuning while leaving the rest fixed."),
  gloss("Overfitting", "When a model specializes on its training data to the point that its performance on unseen data declines."),
  gloss("Recall@K", "The proportion of queries for which the correct target appears within the top K returned results."),
  gloss("Epoch", "One complete pass of the training procedure over the training dataset."),
  gloss("CelebA", "The CelebFaces Attributes dataset, in which each face image carries 40 binary attribute annotations."),
  gloss("JWT", "JSON Web Token; a signed, self-contained token used for stateless authentication."),
  gloss("BCrypt", "An adaptive, salted password-hashing algorithm designed to resist brute-force attacks."),
  gloss("Zero-shot", "The ability of a model to perform a task on concepts it was not explicitly trained for, by relying on its general learned associations."),
  gloss("Transfer learning", "Reusing a model trained on a large general task as the starting point for training on a smaller, specific task."),
  gloss("Inference", "The use of a trained model to produce outputs for new inputs, as distinct from training the model."),
  gloss("Index (vector index)", "The stored collection of precomputed image embeddings for an investigation, against which queries are compared."),
  gloss("Query expansion", "Augmenting a user’s query with additional terms — here, attribute phrases above a confidence threshold — to steer the search."),
  gloss("Microservice", "An independently deployable service that owns one responsibility and communicates over a network interface."),
  gloss("Cascade delete", "A database rule by which deleting a record automatically deletes the records that depend on it."),
];

const appB = [
  new Paragraph({ heading: HeadingLevel.HEADING_1, pageBreakBefore: true, children: [t("Appendix B — Abbreviations")] }),
  table(["Abbreviation", "Meaning"],
    [
      ["AI", "Artificial Intelligence"],
      ["API", "Application Programming Interface"],
      ["CLIP", "Contrastive Language–Image Pre-training"],
      ["CPU / GPU", "Central Processing Unit / Graphics Processing Unit"],
      ["DFD", "Data Flow Diagram"],
      ["EF Core", "Entity Framework Core"],
      ["ER", "Entity-Relationship"],
      ["JWT", "JSON Web Token"],
      ["ML", "Machine Learning"],
      ["REST", "Representational State Transfer"],
      ["UI", "User Interface"],
      ["ViT", "Vision Transformer"],
    ], [2600, 6760]),
  caption("Table B.1 — Abbreviations used in this report."),
];

const appC = [
  new Paragraph({ heading: HeadingLevel.HEADING_1, pageBreakBefore: true, children: [t("Appendix C — Detailed Evaluation Reference")] }),
  just("This appendix records the parameters of the evaluation reported in Chapter 9 so that it can be reproduced exactly. The evaluation set consisted of 536 face images. Each query caption was generated from the image’s 40 binary attributes by the rule-based procedure used in training. For each query, all 536 images were ranked by cosine similarity, and success at cut-off K was recorded when the source image appeared within the top K. The procedure was executed once per checkpoint on the graphics processor, so that all checkpoints are compared under identical conditions. The cut-offs reported were K = 1, 5, and 10. The reference random baseline for Recall@1 over 536 candidates is one divided by 536, or approximately 0.19 percent."),
  just("The complete numerical results are presented in Table 9.1 and visualized in Figures 9.1, 9.2, and 9.3. All nine checkpoints — the pre-trained baseline at epoch 0 and the fine-tuned checkpoints at epochs 1 through 8 — were evaluated under the identical procedure."),
];

const appD = [
  new Paragraph({ heading: HeadingLevel.HEADING_1, pageBreakBefore: true, children: [t("Appendix D — Deliverables and System Specifications")] }),
  just("This appendix summarizes the tangible deliverables produced by the project and the key specifications of the system as built and evaluated, gathered in one place for quick reference. All figures are drawn from the project itself."),
  table(["Item", "Specification"],
    [
      ["Embedding dimensionality", "512 (CLIP ViT-B/32, shared image–text space)"],
      ["Dataset attributes", "40 binary CelebA attributes converted to captions"],
      ["Evaluation set", "536 face images, identical for all checkpoints"],
      ["Checkpoints evaluated", "9 (epochs 0 through 8)"],
      ["Best checkpoint (Recall@1)", "Epoch 6, at 7.46%"],
      ["Baseline (Recall@1)", "Epoch 0, at 3.73%"],
      ["Random-ranking floor (Recall@1)", "≈ 0.19% over 536 images"],
      ["Distance metrics offered", "Cosine similarity and Euclidean distance"],
      ["Results returned per query", "Configurable; default 5, with percentage scores"],
      ["Indexing batch size", "32 images per batch"],
      ["Bulk-upload batch size", "500 images per request"],
      ["Inference hardware", "NVIDIA GeForce RTX 3060 (CUDA)"],
      ["Image-encoder throughput", "≈ 400 images per second on the GPU"],
      ["Database tables", "4 (User, Investigation, UploadedImage, ImageEmbedding)"],
      ["Service ports", "Interface 5173, application 5011, AI 8000, database 3306"],
    ], [3200, 6160]),
  caption("Table D.1 — Summary of system specifications and measured values."),
  just("The project deliverables comprise the source code of the three tiers and the artificial-intelligence service; the trained model checkpoints; the setup, launch, and stop scripts that automate installation and operation; the reproducible evaluation script that produced the results of Chapter 9; and this report. Together these constitute a complete, self-contained package from which the system can be installed, operated, evaluated, and extended."),
];

// ---------- assemble ----------
const body = [
  ...titlePage, ...abstract, ...acknowledgements, ...toc, ...listsFiguresTables,
  ...ch1, ...ch2, ...ch3, ...ch4, ...ch5, ...ch6, ...ch7, ...ch8, ...ch9, ...ch10, ...ch11, ...ch12, ...refs,
  ...appA, ...appB, ...appC, ...appD,
];

const doc = new Document({
  creator: "Help Culprit Recognition",
  title: "Help Culprit Recognition - Graduation Project Report",
  features: { updateFields: true },
  styles: {
    default: { document: { run: { font: "Arial", size: 22 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 30, bold: true, color: ACCENT, font: "Arial" },
        paragraph: { spacing: { before: 320, after: 160 }, outlineLevel: 0,
          border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: STEEL, space: 4 } } } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 25, bold: true, color: HEADBG, font: "Arial" },
        paragraph: { spacing: { before: 220, after: 120 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 22, bold: true, color: "333333", font: "Arial" },
        paragraph: { spacing: { before: 160, after: 100 }, outlineLevel: 2 } },
    ],
  },
  numbering: {
    config: [
      { reference: "bullets", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "nums", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "refs", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "[%1]", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 420 } } } }] },
    ],
  },
  sections: [{
    properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
    headers: { default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT,
      border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC", space: 4 } },
      children: [t("Help Culprit Recognition  —  Graduation Project Report", { size: 16, color: "888888" })] })] }) },
    footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER,
      children: [t("Page ", { size: 16, color: "888888" }),
        new TextRun({ children: [PageNumber.CURRENT], size: 16, color: "888888" }),
        t(" of ", { size: 16, color: "888888" }),
        new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 16, color: "888888" })] })] }) },
    children: body,
  }],
});

Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync("HelpCulpritRecognition_GP_Report.docx", buf);
  console.log("WROTE", buf.length, "bytes");
});
