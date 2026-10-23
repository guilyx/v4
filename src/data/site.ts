/**
 * Single source of truth for everything rendered on the site.
 * Edit this file to update content — no component changes needed.
 */

export const site = {
  name: "Erwin Lejeune",
  handle: "guilyx",
  role: "Team Lead — Robotics Software",
  tagline: "Building the layer that decides what happens next.",
  description:
    "Erwin Lejeune — Team Lead, Robotics Software, in Abu Dhabi. Hands-on ROS 2 developer: behavior, task and path planning, sensor fusion, multi-agent planning and agentic AI orchestration. C++, Python, Go.",
  url: "https://v4.elejeune.me",
  email: "erwin.lejeune15@gmail.com",
  location: "Abu Dhabi, UAE",
  resume: "https://resume.elejeune.me",
  socials: [
    { label: "GitHub", url: "https://github.com/guilyx", icon: "github" },
    {
      label: "LinkedIn",
      url: "https://www.linkedin.com/in/erwinlejeune-lkn",
      icon: "linkedin",
    },
    {
      label: "ResearchGate",
      url: "https://www.researchgate.net/profile/Erwin-Lejeune",
      icon: "researchgate",
    },
    {
      label: "Spotify",
      url: "https://open.spotify.com/user/11147618695",
      icon: "spotify",
    },
  ],
} as const;

export const nav = [
  { label: "background", href: "/#about" },
  { label: "experiences", href: "/#experience" },
  { label: "systems", href: "/#systems" },
  { label: "projects", href: "/#projects" },
  { label: "contact", href: "/#contact" },
  { label: "blog", href: "/blog" },
  { label: "photos", href: "/photos" },
] as const;

export const about = {
  paragraphs: [
    `Hello! I'm Erwin — a robotics software team lead who still writes the
     code. I've spent 8+ years taking autonomy from research to real-world
     deployment: behavior, task and path planning, sensor fusion, motion
     control, and the system design that keeps robots reliable outside the
     lab. ROS 2 is home.`,
    `Today I'm Head of Robotics at [SIRB.AI](https://sirb.ai/). Until early
     2026 I led a team of 9 robotics engineers at the
     [Technology Innovation Institute](https://www.tii.ae/) — autonomy,
     infrastructure and platform integration for drone fleets. I've been
     leading teams for 2+ years, from product roadmaps through PI planning to
     sprints, while staying hands-on in the stack. Before drones, I built the
     navigation stack of a robot working the aisles of a supermarket in
     Odense, Denmark, at [Coalescent Mobile Robotics](https://cm-robotics.com/).`,
    `On the side I run [Unchained Labs](https://unchainedlabs.dev/), building
     local-first agentic systems for companies, and
     [Clanker Labs](https://clanker-labs.github.io/clanker-labs-public/), the
     same idea pointed at my own home: one self-hosted stack, with an agent
     running it. I bring both back to robotics: agentic tooling that turns
     robot data into diagnostics, and self-healing autonomy that detects and
     recovers from failures in the field. When I'm not shipping autonomy
     stacks I'm playing basketball, watching films, or chasing ranked
     ladders.`,
  ],
  technologies: [
    "ROS 2",
    "C++ / Python / Go",
    "Behavior Trees",
    "Task & Path Planning",
    "Multi-Agent Planning",
    "PDDL",
    "Sensor Fusion",
    "Motion Control",
    "Agent Orchestration",
    "MCP / RAG",
    "Docker / CI",
    "Scrum / PI Planning",
  ],
} as const;

export interface Job {
  company: string;
  shortName: string;
  url: string;
  role: string;
  period: string;
  location?: string;
  /** Decimal years, used to place the bar on the trajectory timeline. */
  start: number;
  /** `null` means still running — the bar extends to the present marker. */
  end: number | null;
  bullets: string[];
}

/** Left edge of the trajectory axis. */
export const TIMELINE_START = 2018;

export const experience: Job[] = [
  {
    company: "SIRB.AI",
    shortName: "SIRB.AI",
    url: "https://sirb.ai/",
    role: "Head of Robotics",
    period: "Feb 2026 — Present",
    location: "Abu Dhabi, UAE",
    start: 2026.1,
    end: null,
    bullets: [
      "Head the robotics software team at a defense-technology startup spun off from the Technology Innovation Institute.",
      "Agentic mission generation for surveillance, monitoring and tail-chasing — missions framed as tool calls for an LLM instead of waypoints for a flight controller.",
      "Own the robotics software roadmap: multi-agent task allocation and mission planning across heterogeneous drone fleets.",
    ],
  },
  {
    company: "Technology Innovation Institute",
    shortName: "TII",
    url: "https://www.tii.ae/",
    role: "Team Lead — Robotics Software",
    period: "2024 — 2026",
    location: "Abu Dhabi, UAE",
    start: 2024,
    end: 2026.1,
    bullets: [
      "Grew and led a Robotics Software team of 9 engineers across autonomy (navigation, perception, orchestration), infrastructure (DevOps, RobotOps) and platform integration.",
      "Ran delivery end to end — product roadmap, PI planning, sprints — while staying hands-on in the ROS 2 stack.",
      "Overhauled the swarm autonomy architecture, cutting onboard CPU usage by 74% and network bandwidth by 52%.",
      "Scaled the multi-drone framework (modular architecture, lifecycle management, behavior orchestration) and grew the team's scope to own path planning and path tracking.",
      "Joint program with Caltech on their multi-modal robot M4 and their humanoid: outdoor planning and tracking for M4's flying and rolling modalities.",
      "Designed new swarm behaviors, including decentralized bird-inspired flocking published at IEEE/RSJ IROS 2024.",
      "Led autonomy demos to companies in Europe and the UAE, resulting in USD 10M+ in contracts.",
      "Started building AI tooling for the team to raise engineering efficiency and productivity.",
    ],
  },
  {
    company: "Technology Innovation Institute",
    shortName: "TII",
    url: "https://www.tii.ae/",
    role: "Senior Engineer — Robotics Software",
    period: "2022 — 2024",
    location: "Abu Dhabi, UAE",
    start: 2022,
    end: 2024,
    bullets: [
      "Led the software design and implementation of the decentralized framework used to develop and run multi-drone missions, built on behavior trees and task orchestration so each drone runs and switches between multiple behaviors.",
      "Ran the live demos to partners; the project led to USD 3M in contracts with other companies in the UAE ecosystem.",
    ],
  },
  {
    company: "Unchained Labs",
    shortName: "Unchained",
    url: "https://unchainedlabs.dev/",
    role: "Founder",
    period: "2024 — Present",
    location: "Remote",
    start: 2024,
    end: null,
    bullets: [
      "Build AI brains for companies: local-first agentic systems that run on their own models, data and infrastructure.",
      "Design graph-based agent orchestration (Kymatics) and open-source the tooling to run it reliably.",
    ],
  },
  {
    company: "Coalescent Mobile Robotics",
    shortName: "Coalescent",
    url: "https://cm-robotics.com/",
    role: "Founding Robotics Engineer",
    period: "2021 — 2022",
    location: "Odense, Denmark",
    start: 2021,
    end: 2022.9,
    bullets: [
      "Founding engineer on the team that delivered the first 24/7 in-store robot at Bilka, Odense.",
      "Led the navigation and path-planning stack — localization, motion control, collision-free routing among shoppers.",
      "Demonstrations under this stack supported the company's pre-seed round.",
    ],
  },
  {
    company: "Ecole Centrale de Nantes",
    shortName: "ECN",
    url: "https://www.ec-nantes.fr/",
    role: "Robotics Researcher",
    period: "2020 — 2021",
    location: "Nantes, France",
    start: 2020.2,
    end: 2021.2,
    bullets: [
      "Led 4 research projects: multi-agent pathfinding, AI planning (PDDL), real-time ROS control on Xenomai/XDDP, and ROS 2 latency benchmarking.",
      "Published research on real-time jitter measurements under ROS 2 and a survey of multi-agent pathfinding solutions.",
    ],
  },
  {
    company: "Hiventive",
    shortName: "Hiventive",
    url: "https://www.hiventive.com/en/",
    role: "Software Engineer",
    period: "2020 — 2021",
    location: "Remote",
    start: 2020.5,
    end: 2021.1,
    bullets: [
      "Built core backend services in Go with PostgreSQL and Docker for a computer-aided production engineering platform.",
      "Developed an automated programming test manager for candidate evaluation.",
    ],
  },
  {
    company: "Hiventive",
    shortName: "Hiventive",
    url: "https://www.hiventive.com/en/",
    role: "Embedded Software Engineer",
    period: "2018 — 2019",
    location: "Bordeaux, France",
    start: 2018.7,
    end: 2019.5,
    bullets: [
      "Developed a SystemC/TLM virtual prototype of an STM32 microcontroller for SoC emulation — TIM, I2C, CAN, GPIO, USART peripherals with QEMU integration.",
      "Built a virtual temperature/humidity sensor and validated firmware against real hardware.",
    ],
  },
  {
    company: "Ingeniarius",
    shortName: "Ingeniarius",
    url: "https://ingeniarius.pt/",
    role: "Robotics Assistant",
    period: "2019",
    location: "Coimbra, Portugal",
    start: 2019.5,
    end: 2019.75,
    bullets: [
      "Built full autonomy stacks from scratch with ROS and embedded systems.",
      "Won both the mapped and unmapped maze-solving competitions.",
    ],
  },
];

/**
 * "Built for Companies" — systems from the day job, shown as conceptual
 * animations rather than code. Each `scene` names a canvas scene in
 * src/scripts/systems/. `**bold**` in points renders as <b>.
 */
export interface System {
  id: "bt" | "fmr" | "swarm";
  tab: string;
  headline: string;
  points: string[];
  note: string;
  caption: string;
}

export const systemsIntro = `Solutions I've engineered for companies, sketched
  conceptually: how each one works, not the code or the client behind it.`;

export const systems: System[] = [
  {
    id: "bt",
    tab: "Behavior tree densification & scoring",
    headline: "Mission trees anyone can read, scored before they fly.",
    points: [
      "**Densify.** Control nodes become arrows, conditions become guards on those arrows, subtrees inline. A 16-node tree reads as six actions, and \"what happens if GoToZone fails?\" takes one arrow to answer.",
      "**Find the gaps.** Actions with no failure path, branches that can never run, loops with no exit — flagged before anyone flies the tree.",
      "**Score.** Every node logs every run. Point that history at a tree being authored and you get the weakest branch and a concrete fix, not one percentage for the whole flight.",
    ],
    note: "Operators get a plain-language view of the mission: what the robot is doing now, and what comes next. Engineers get the guards, the gap report and a graph diff on every change.",
    caption: "behavior tree → action graph → risk per branch",
  },
  {
    id: "fmr",
    tab: "Agentic fault management & recovery",
    headline: "One timeline for every fault, and an agent that proposes the repair.",
    points: [
      "**Components report; they don't recover themselves.** Lifecycle errors, failed transitions, tree outcomes and silent process deaths all land in one ordered event table.",
      "**One place decides.** Policies match patterns and actuate. Restarts go through the dependency graph, so dependents come back in the right order.",
      "**The agent reads windows, not events.** It tells a link flap from a dying node, suppresses the noise and proposes the repair. It never owns the actuator: the deterministic rules stay underneath.",
    ],
    note: "This is most of the distance between a demo and a product: autonomy that doesn't need a person on the link.",
    caption: "report → one timeline → read the window → repair",
  },
  {
    id: "swarm",
    tab: "Swarm navigation & coverage",
    headline: "Plan, fly in formation, cover the zone, find the target.",
    points: [
      "**Plan around what the fleet must not touch.** Zones and every other source of the world are costmap layers; a global plan is routed through them before anything moves.",
      "**Fly in formation, links in view.** The flock holds its slots behind a virtual leader, a safety barrier underneath keeps every vehicle clear of the boundary, and link strength across the mesh is part of the picture.",
      "**Cover, then localize.** In the task zone the formation breaks into a Voronoi partition and each vehicle sweeps its own cell. When one gets a contact, the others take bearings and triangulate it.",
    ],
    note: "Change the vehicle, change a plugin: every motion algorithm became a tracker behind the same contract.",
    caption: "plan → formation transit → Voronoi coverage → triangulation",
  },
];

/**
 * Every project sits at one of three altitudes. The layer is real information —
 * it says how far from the metal the thing runs — so it's rendered, not just
 * used for sorting.
 */
export type Layer = "field" | "agent" | "machine";

export const layers: Record<Layer, string> = {
  field: "in the field",
  agent: "in the loop",
  machine: "on the metal",
};

export interface Project {
  title: string;
  blurb: string;
  tech: string[];
  layer: Layer;
  github?: string;
  external?: string;
  externalLabel?: string;
  glyph?: string;
  /** The org it lives under (Clanker Labs, Unchained Labs…); omitted means personal. */
  org?: string;
  /** Local promo clip under public/media/, with a poster frame shown before playback. */
  video?: string;
  videoPoster?: string;
  /** Defaults to video/mp4. */
  videoType?: string;
  /** Set when there's no public link — closed source or internal. */
  closed?: boolean;
}

/** A row in the /archive table — everything, not just the highlights. */
export interface ArchiveEntry {
  year: number;
  title: string;
  /** Company or org it was built under; omitted means personal. */
  madeAt?: string;
  tech: string[];
  github?: string;
  external?: string;
}

/** The framing for the Featured Projects section: side projects only. */
export const projectsIntro = `Side projects, built on my own time and in the
  open — lately most of them under Clanker Labs, a self-hosted stack for the
  home with an agent running it. Swipe through the ones with a demo; the rest
  are listed below and in the archive.`;

/**
 * Featured projects — the carousel. Every slide has a real demo clip recorded
 * from the thing actually running. Work done for an employer belongs in Built
 * for Companies, not here.
 */
export const featured: Project[] = [
  {
    title: "Clanker Labs",
    blurb:
      "Self-host your home, let the agent run it. One stack that moves notes, mail, media, passwords and money back onto hardware you own — a NUC in a closet, an old laptop — with an agent in front so keeping it running doesn't take a sysadmin.",
    tech: ["Ansible", "Docker", "LangGraph", "MCP"],
    layer: "machine",
    org: "Clanker Labs",
    github: "https://github.com/Clanker-Labs",
    external: "https://clanker-labs.github.io/clanker-labs-public/",
    externalLabel: "Visit the site",
    video: "/media/clanker-labs-promo.mp4",
    videoPoster: "/media/clanker-labs-poster.png",
  },
  {
    title: "grip",
    blurb:
      "Pass the whiteboard defense before you push. A git hook that asks five questions about your own diff — what it does, why it's built this way, where it fails — grades the answers against a hidden rubric, and blocks the push below your team's pass mark. It checks the developer, not the code.",
    tech: ["Python", "Git Hooks", "LLM Grading", "Coding Agents"],
    layer: "agent",
    github: "https://github.com/guilyx/grip",
    external: "https://guilyx.github.io/grip/",
    externalLabel: "Read the docs",
    video: "/media/grip-promo.mp4",
    videoPoster: "/media/grip-poster.jpg",
  },
  {
    title: "wallet",
    blurb:
      "Your money, on your machine. Net worth, budgets and investments in any currency, in one SQLite file behind passkey sign-in — with an assistant you can drop a bank statement on, reachable from Claude Code, Codex or Telegram through the same tools.",
    tech: ["Next.js", "SQLite", "MCP", "Passkeys"],
    layer: "agent",
    org: "Clanker Labs",
    github: "https://github.com/Clanker-Labs/wallet",
    external: "https://clanker-labs.github.io/wallet/",
    externalLabel: "Docs & demos",
    video: "/media/wallet-promo.mp4",
    videoPoster: "/media/wallet-poster.jpg",
  },
  {
    title: "tradesights",
    blurb:
      "Talk is cheap; options cost money. Every morning it lines up what the price did, what the options market is paid to believe and what people are saying, and ranks the names where those stop agreeing. A screener: it tells you where to look, not what to do.",
    tech: ["Python", "Options Data", "Data Viz"],
    layer: "agent",
    org: "Clanker Labs",
    github: "https://github.com/Clanker-Labs/tradesights",
    video: "/media/tradesights-promo.mp4",
    videoPoster: "/media/tradesights-poster.png",
  },
  {
    title: "PyMAPF",
    blurb:
      "A multi-agent planning toolbox — CBS, PIBT, LaCAM and Prioritized Planning on arbitrary graphs, not just grids. Every solver streams its search live, so you can watch conflicts get found and resolved node by node.",
    tech: ["Python", "Multi-Agent Planning", "Graph Search"],
    layer: "field",
    org: "APLA-Toolbox",
    github: "https://github.com/APLA-Toolbox/pymapf",
    external: "https://apla-toolbox.github.io/pymapf/",
    externalLabel: "Open the playground",
    video: "/media/pymapf-promo.mp4",
    videoPoster: "/media/pymapf-poster.png",
  },
  {
    title: "jupyddl",
    blurb:
      "A pure-Python PDDL planning framework — hand-written parser and grounder from STRIPS to durative actions, 14 planners from BFS to LM-cut, and heuristics you can train on your own solved plans.",
    tech: ["Python", "PDDL", "Heuristic Search"],
    layer: "field",
    org: "APLA-Toolbox",
    github: "https://github.com/APLA-Toolbox/pythonpddl",
    external: "https://apla-toolbox.github.io/PythonPDDL/",
    externalLabel: "Open the workbench",
    video: "/media/jupyddl-promo.mp4",
    videoPoster: "/media/jupyddl-poster.png",
  },
  {
    title: "rostree",
    blurb:
      "A ROS 2 dependency graph is a DAG, not a tree. rostree explores it properly — from the command line, a TUI, or a self-contained HTML file with no network calls, so it still opens on a robot with no route out.",
    tech: ["Python", "Graph Theory", "ROS 2", "TUI"],
    layer: "machine",
    github: "https://github.com/guilyx/rostree",
    external: "https://guilyx.github.io/rostree",
    video: "/media/rostree-promo.mp4",
    videoPoster: "/media/rostree-poster.png",
  },
  {
    title: "flybots",
    blurb:
      "Flight algorithms from scratch: multirotor, fixed-wing and VTOL physics written out in full, 40+ runnable simulations, and a gym for teaching a drone to fly itself.",
    tech: ["Python", "Flight Dynamics", "Reinforcement Learning"],
    layer: "field",
    github: "https://github.com/guilyx/flybots",
    external: "https://guilyx.github.io/flybots/",
    video: "/media/autonomous-uav-guide-promo.mp4",
    videoPoster: "/media/autonomous-uav-guide-poster.png",
  },
  {
    title: "Kymatics",
    blurb:
      "Speak an intent and watch it become a queue of build jobs: a Python speech service in, a Rust orchestrator that plans and schedules the work, and a React board tracking every job from todo to done.",
    tech: ["Rust", "Python", "React", "Voice / STT"],
    layer: "agent",
    org: "Unchained Labs",
    github: "https://github.com/Unchained-Labs/kymatics",
    external: "https://kymatics.vercel.app/",
    video: "/media/kymatics-promo.mp4",
    videoPoster: "/media/kymatics-poster.png",
  },
];

/**
 * More projects — the flat list under the carousel. Private repos are
 * described but never linked: a link a visitor can't open is worse than none.
 */
export const projects: Project[] = [
  {
    title: "BTView",
    blurb:
      "A visual graph editor for BehaviorTree.CPP trees, built into VS Code and Cursor: bidirectional XML sync, tidy layout, and a validation panel that jumps to the offending node.",
    tech: ["TypeScript", "Behavior Trees", "VS Code"],
    layer: "agent",
    github: "https://github.com/guilyx/btview-vscode-plugin",
    external: "https://marketplace.visualstudio.com/items?itemName=rangonomics.btview",
  },
  {
    title: "lebenchmark",
    blurb:
      "How reliably do locally served models call tools? Structured calls against calls leaked into prose, picking the right tool, knowing when not to call one, and the latency it costs — written up as an interactive study site.",
    tech: ["Python", "LLM Evaluation", "Statistics"],
    layer: "machine",
    org: "Clanker Labs",
    github: "https://github.com/Clanker-Labs/lebenchmark",
    external: "https://clanker-labs.github.io/lebenchmark/",
  },
  {
    title: "t212-mcp",
    blurb:
      "An MCP server giving AI assistants read-only access to a Trading 212 account — balances, positions, dividends, pies. No code path issues anything but a GET.",
    tech: ["TypeScript", "Node.js", "MCP"],
    layer: "agent",
    github: "https://github.com/guilyx/t212-mcp",
  },
  {
    title: "selfmail",
    blurb:
      "A small mail relay for a private network: services on the LAN POST a message with an API key, it hands delivery to an upstream SMTP host and keeps the audit trail. One Rust binary and a dashboard.",
    tech: ["Rust", "axum", "SQLite"],
    layer: "machine",
    org: "Clanker Labs",
    github: "https://github.com/Clanker-Labs/selfmail",
  },
  {
    title: "setup",
    blurb:
      "One curl command takes a bare Ubuntu box — a dev machine or a VPS — to provisioned: packages, users, SSH hardening, firewall, reverse proxy, dotfiles through chezmoi. Ansible underneath, a typed Python CLI on top.",
    tech: ["Ansible", "Python", "chezmoi"],
    layer: "machine",
    org: "Clanker Labs",
    github: "https://github.com/Clanker-Labs/setup",
  },
  {
    title: "Doxmosis",
    blurb:
      "Agentic tooling that keeps documentation alive: watches a codebase, detects drift, and opens documentation pull requests on its own.",
    tech: ["Go", "Agentic AI", "GitHub Apps"],
    layer: "agent",
    org: "Unchained Labs",
    external: "https://doxmosis.vercel.app/",
  },
  {
    title: "zucman",
    blurb:
      "A campaign kit for one statistic: sourced research, regenerable charts, decks in two languages and a zero-dependency dataviz site, all rebuilt from the data by script.",
    tech: ["Python", "Matplotlib", "Data Viz"],
    layer: "agent",
    github: "https://github.com/guilyx/zucman",
    external: "https://guilyx.github.io/zucman/",
  },
  {
    title: "LeHarness",
    blurb:
      "Serves local models on whatever hardware is in the box — vLLM with tensor parallelism on a GPU rig, Ollama with GGUF on a Jetson or a bare CPU — behind one OpenAI-compatible URL.",
    tech: ["vLLM", "Ollama", "Docker", "CUDA"],
    layer: "machine",
    org: "Clanker Labs",
    closed: true,
  },
  {
    title: "artin-pathfinding",
    blurb: "A C++17 pathfinding library — A*, Dijkstra, DFS/BFS and friends — with a clean interface for grid worlds.",
    tech: ["C++17", "Algorithms"],
    layer: "field",
    github: "https://github.com/master-coro/artin-pathfinding",
  },
  {
    title: "epsteinexposed-mcp",
    blurb:
      "An MCP server over a public-records API, so an assistant can query the archive — persons, documents, flight logs — directly instead of being told about it.",
    tech: ["Python", "MCP", "Public Data"],
    layer: "agent",
    github: "https://github.com/guilyx/epsteinexposed-mcp",
  },
];

/**
 * The full record, newest first. Years are repo creation dates (or publication
 * year for the papers), not the last time something was touched.
 */
export const archive: ArchiveEntry[] = [
  {
    year: 2026,
    title: "grip",
    tech: ["Python", "Git Hooks", "LLM Grading"],
    github: "https://github.com/guilyx/grip",
    external: "https://guilyx.github.io/grip/",
  },
  {
    year: 2026,
    title: "Clanker Labs",
    madeAt: "Clanker Labs",
    tech: ["Ansible", "Docker", "LangGraph", "MCP"],
    github: "https://github.com/Clanker-Labs",
    external: "https://clanker-labs.github.io/clanker-labs-public/",
  },
  {
    year: 2026,
    title: "wallet",
    madeAt: "Clanker Labs",
    tech: ["Next.js", "SQLite", "MCP", "Passkeys"],
    github: "https://github.com/Clanker-Labs/wallet",
    external: "https://clanker-labs.github.io/wallet/",
  },
  {
    year: 2026,
    title: "tradesights",
    madeAt: "Clanker Labs",
    tech: ["Python", "Options Data", "Data Viz"],
    github: "https://github.com/Clanker-Labs/tradesights",
  },
  {
    year: 2026,
    title: "selfmail",
    madeAt: "Clanker Labs",
    tech: ["Rust", "axum", "SQLite"],
    github: "https://github.com/Clanker-Labs/selfmail",
  },
  {
    year: 2026,
    title: "lebenchmark",
    madeAt: "Clanker Labs",
    tech: ["Python", "LLM Evaluation", "Statistics"],
    github: "https://github.com/Clanker-Labs/lebenchmark",
    external: "https://clanker-labs.github.io/lebenchmark/",
  },
  {
    year: 2026,
    title: "Kymatics",
    madeAt: "Unchained Labs",
    tech: ["Rust", "Python", "React", "Voice"],
    github: "https://github.com/Unchained-Labs/kymatics",
    external: "https://kymatics.vercel.app/",
  },
  {
    year: 2026,
    title: "t212-mcp",
    tech: ["TypeScript", "Node.js", "MCP"],
    github: "https://github.com/guilyx/t212-mcp",
  },
  {
    year: 2026,
    title: "BTView",
    tech: ["TypeScript", "Behavior Trees", "VS Code"],
    github: "https://github.com/guilyx/btview-vscode-plugin",
    external: "https://marketplace.visualstudio.com/items?itemName=rangonomics.btview",
  },
  {
    year: 2026,
    title: "zucman",
    tech: ["Python", "Matplotlib", "Data Viz"],
    github: "https://github.com/guilyx/zucman",
    external: "https://guilyx.github.io/zucman/",
  },
  {
    year: 2026,
    title: "flybots",
    tech: ["Python", "Flight Dynamics", "Reinforcement Learning"],
    github: "https://github.com/guilyx/flybots",
    external: "https://guilyx.github.io/flybots/",
  },
  {
    year: 2026,
    title: "Doxmosis",
    madeAt: "Unchained Labs",
    tech: ["Go", "Agentic AI", "GitHub Apps"],
    external: "https://doxmosis.vercel.app/",
  },
  {
    year: 2026,
    title: "rostree",
    tech: ["Python", "Graph Theory", "ROS 2", "TUI"],
    github: "https://github.com/guilyx/rostree",
    external: "https://guilyx.github.io/rostree",
  },
  {
    year: 2026,
    title: "epsteinexposed-mcp",
    tech: ["Python", "MCP"],
    github: "https://github.com/guilyx/epsteinexposed-mcp",
  },
  {
    year: 2026,
    title: "setup",
    madeAt: "Clanker Labs",
    tech: ["Ansible", "Python", "chezmoi", "Flask"],
    github: "https://github.com/Clanker-Labs/setup",
  },
  {
    year: 2026,
    title: "LeHarness",
    madeAt: "Clanker Labs",
    tech: ["vLLM", "Ollama", "Docker", "CUDA"],
  },
  {
    year: 2025,
    title: "v3 — portfolio",
    tech: ["React", "Vite", "Tailwind", "d3"],
    github: "https://github.com/guilyx/v3",
  },
  {
    year: 2024,
    title: "Decentralized Acceleration-Based Bird-Inspired Flocking",
    madeAt: "Technology Innovation Institute",
    tech: ["C++", "ROS 2", "Control Theory", "IROS 2024"],
    external:
      "https://www.researchgate.net/publication/387418977_Decentralized_Acceleration-Based_Bird-Inspired_Flocking",
  },
  {
    year: 2022,
    title: "v2 — portfolio",
    tech: ["HTML", "CSS", "Vanilla JS"],
    github: "https://github.com/guilyx/v2",
  },
  {
    year: 2021,
    title: "PyMAPF",
    madeAt: "APLA-Toolbox",
    tech: ["Python", "Multi-Agent Planning", "Graph Search"],
    github: "https://github.com/APLA-Toolbox/pymapf",
    external: "https://apla-toolbox.github.io/pymapf/",
  },
  {
    year: 2021,
    title: "Real-time Jitter Measurements under ROS 2",
    madeAt: "Ecole Centrale de Nantes",
    tech: ["ROS 2", "Xenomai", "C++"],
    github: "https://github.com/mastererts/ros2_realtime_statistics",
    external:
      "https://www.researchgate.net/publication/350353690_Real-time_Jitter_Measurements_under_ROS2_the_Inverted_Pendulum_case",
  },
  {
    year: 2021,
    title: "Survey of the Multi-Agent Pathfinding Solutions",
    madeAt: "Ecole Centrale de Nantes",
    tech: ["Research", "Path Planning"],
    external:
      "https://www.researchgate.net/publication/348716625_Survey_of_the_Multi-Agent_Pathfinding_Solutions",
  },
  {
    year: 2020,
    title: "jupyddl",
    madeAt: "APLA-Toolbox",
    tech: ["Python", "PDDL", "A* / Search", "Heuristics"],
    github: "https://github.com/APLA-Toolbox/pythonpddl",
    external: "https://apla-toolbox.github.io/PythonPDDL/",
  },
  {
    year: 2020,
    title: "artin-pathfinding",
    madeAt: "Ecole Centrale de Nantes",
    tech: ["C++17", "Algorithms"],
    github: "https://github.com/master-coro/artin-pathfinding",
  },
  {
    year: 2020,
    title: "v1 — portfolio",
    tech: ["Bootstrap", "jQuery"],
    github: "https://github.com/guilyx/v1",
  },
];

/**
 * Hero spec block — the key/value register comes from Erwin's own GitHub
 * profile README, which introduces him as a YAML document.
 */
/**
 * The hero's one-paragraph answer to "who is this and what do they do."
 * Deliberately does not restate the tagline above it or the spec block
 * beside it — this is the part that carries the story.
 */
export const heroSummary = `Head of Robotics at SIRB.AI, after leading a robotics
  software team at the Technology Innovation Institute, and still hands-on in
  the code. Two-plus years running teams from product roadmaps through PI
  planning to sprints; eight years taking autonomy from research to real-world
  deployment — from a supermarket robot in Denmark to drone fleets in the UAE.`;

export const spec = [
  { key: "role", value: "team lead · robotics software" },
  { key: "based", value: "abu dhabi, uae" },
  { key: "domain", value: "behavior, task & path planning, sensor fusion" },
  { key: "hands-on", value: "ros 2 · c++ · python" },
] as const;

export const contact = {
  title: "Open Channel",
  body: `I'm not actively looking, but the inbox stays open — a question
   about multi-agent planning, an open-source idea, or just to say hi. I'll
   get back to you.`,
} as const;
