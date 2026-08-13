/**
 * Single source of truth for everything rendered on the site.
 * Edit this file to update content — no component changes needed.
 */

export const site = {
  name: "Erwin Lejeune",
  handle: "guilyx",
  role: "Lead Architect — Robot Autonomy",
  tagline: "I build the layer that decides what happens next.",
  description:
    "Erwin Lejeune — Lead Architect, Robot Autonomy, in Abu Dhabi. Multi-agent planning, behavior trees, and agentic orchestration — platform-agnostic, from in-store robots to drones. C++, Python, Go.",
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
  { label: "builds", href: "/#projects" },
  { label: "contact", href: "/#contact" },
  { label: "blog", href: "/blog" },
  { label: "photos", href: "/photos" },
] as const;

export const about = {
  paragraphs: [
    `Hello! I'm Erwin. My titles have said "robotics," but what I actually
     build is one layer: given a goal and a set of constraints, decide what
     happens next. A planner, a behavior tree, a search over a graph — the
     part underneath the mission that turns intent into action. I don't
     particularly care which body it's wired to.`,
    `Today I lead autonomy architecture at [SIRB.AI](https://sirb.ai/) and
     the [Technology Innovation Institute](https://www.tii.ae/) — mission
     planning, task allocation, and behavior orchestration for drone fleets.
     Before drones, I put the same planning stack into a robot working the
     aisles of a supermarket in Odense, Denmark, at
     [Coalescent Mobile Robotics](https://cm-robotics.com/) — same
     constraints, same discipline, a chassis with wheels instead of rotors.
     On the side, at [Unchained Labs](https://unchainlabs.xyz/), I apply the
     same instincts to software agents: giving an LLM a toolset and a plan is
     the same problem as giving a robot a mission.`,
    `My actual background is planning: multi-agent pathfinding, PDDL search,
     graph theory, real-time control. If the question is "what should this
     system do next, given what it knows and what it can't do," that's my
     domain — whether the actor is a drone, a warehouse robot, or an agent
     with tool access. When I'm not shipping autonomy stacks I'm playing
     basketball, watching films, or chasing ranked ladders.`,
  ],
  technologies: [
    "Multi-Agent Planning",
    "Graph Search / A*",
    "Behavior Trees",
    "PDDL",
    "Task Allocation",
    "Agentic Orchestration",
    "ROS 2",
    "PX4 / MAVLink",
    "C++ / Python / Go",
    "MCP / Tool Use",
    "Motion Control",
    "Docker / CI",
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
    role: "Lead Robotics Engineer",
    period: "2026 — Present",
    location: "Abu Dhabi, UAE",
    start: 2026,
    end: null,
    bullets: [
      "Lead the autonomy team at a defense-technology startup spun off from the Technology Innovation Institute.",
      "Agentic mission generation for surveillance, monitoring, and tail-chasing — the same planning problem as before, framed as tool calls for an LLM instead of waypoints for a flight controller.",
      "Architecture for multi-agent task allocation and mission planning across heterogeneous drone fleets.",
    ],
  },
  {
    company: "Technology Innovation Institute",
    shortName: "TII",
    url: "https://www.tii.ae/",
    role: "Lead Robotics Engineer",
    period: "2026 — Present",
    location: "Abu Dhabi, UAE",
    start: 2026,
    end: null,
    bullets: [
      "Lead a robotics software team of 9 engineers building the planning and orchestration layer for heterogeneous drone fleets — navigation, perception, task allocation, and mission behavior — plus the DevOps/RobotOps infrastructure that gets it onto real hardware.",
      "Set technical direction for behavior-tree-based mission orchestration across the fleet-autonomy stack.",
    ],
  },
  {
    company: "Technology Innovation Institute",
    shortName: "TII",
    url: "https://www.tii.ae/",
    role: "Senior Robotics Engineer",
    period: "2024 — 2026",
    location: "Abu Dhabi, UAE",
    start: 2024,
    end: 2026,
    bullets: [
      "Owned modular software architecture and lifecycle management across the fleet-autonomy stack.",
      "Scaled task allocation and mission planning to heterogeneous fleets operating concurrently.",
    ],
  },
  {
    company: "Technology Innovation Institute",
    shortName: "TII",
    url: "https://www.tii.ae/",
    role: "Robotics Engineer",
    period: "2022 — 2024",
    location: "Abu Dhabi, UAE",
    start: 2022,
    end: 2024,
    bullets: [
      "Built the navigation, perception, and mission-behavior stack for heterogeneous drone fleets — the planning and orchestration layer, not the airframe.",
      "Established behavior-tree-based mission orchestration as the standard pattern for multi-drone tasking.",
    ],
  },
  {
    company: "Unchained Labs",
    shortName: "Unchained",
    url: "https://unchainlabs.xyz/",
    role: "Principal Solutions Engineer",
    period: "2024 — Present",
    location: "Remote",
    start: 2024,
    end: null,
    bullets: [
      "Built agentic AI tools for automated documentation PRs (Doxmosis), agentic orchestration (Kymatics), contribution analysis, real-estate analysis, and UAE defense data analysis — the planning discipline applied to software agents instead of robots.",
      "Developed production backend services for LoopFi's blockchain data analysis on EVM chains.",
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
      "Founding engineer on the team that delivered the first 24/7 in-store robot at Bilka, Odense — proof the planning stack isn't drone-specific.",
      "Led the navigation and path-planning stack — localization, motion control, collision-free routing among shoppers — the same planning problem as a drone mission, worked at walking speed instead of flight speed.",
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
 * Every build sits at one of three altitudes. The layer is real information —
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
  /** Local promo clip under public/media/, with a poster frame shown before playback. */
  video?: string;
  videoPoster?: string;
  /** Defaults to video/mp4; weave's clip is VP8 WebM. */
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

/** The framing for the Builds section. */
export const buildsIntro = `Three altitudes, one question: given a goal and
  constraints, what happens next. A route through a warehouse, a mission for
  a drone fleet, a sequence of tool calls for an agent — same discipline,
  different actors. Six with something to show; the rest are in the archive.`;

/**
 * Featured builds — the six that earn a full spotlight, every one of them
 * with a real promo clip recorded from the thing actually running.
 */
export const featured: Project[] = [
  {
    title: "PyMAPF",
    blurb:
      "A multi-agent planning toolbox — CBS, PIBT, LaCAM and Prioritized Planning solvers, running on arbitrary graphs, not just grids. Every solver streams its search live, so you can watch conflicts get found and resolved node by node instead of taking the answer on faith.",
    tech: ["Python", "Multi-Agent Planning", "Graph Search", "CBS / PIBT"],
    layer: "field",
    github: "https://github.com/APLA-Toolbox/pymapf",
    external: "https://apla-toolbox.github.io/pymapf/",
    externalLabel: "Open the playground",
    video: "/media/pymapf-promo.mp4",
    videoPoster: "/media/pymapf-poster.png",
  },
  {
    title: "jupyddl",
    blurb:
      "A pure-Python PDDL planning framework — hand-written parser and grounder covering STRIPS through durative actions, 14 planners from BFS to weighted A* to LM-cut, and heuristics you can train on your own solved plans.",
    tech: ["Python", "PDDL", "A* / Search", "Heuristics"],
    layer: "field",
    github: "https://github.com/APLA-Toolbox/pythonpddl",
    external: "https://apla-toolbox.github.io/PythonPDDL/",
    externalLabel: "Open the workbench",
    video: "/media/jupyddl-promo.mp4",
    videoPoster: "/media/jupyddl-poster.png",
  },
  {
    title: "rostree",
    blurb:
      "A ROS 2 dependency graph is a DAG, not a tree — expanding it path by path is exponential. rostree explores it properly instead: from the command line, a TUI, or a self-contained HTML file with no CDN and no network calls, so it survives being opened on a robot with no route out.",
    tech: ["Python", "Graph Theory", "ROS 2", "TUI"],
    layer: "machine",
    github: "https://github.com/guilyx/rostree",
    external: "https://guilyx.github.io/rostree",
    video: "/media/rostree-promo.mp4",
    videoPoster: "/media/rostree-poster.png",
  },
  {
    title: "autonomous-uav-guide",
    blurb:
      "Flight algorithms from scratch: multirotor, fixed-wing and VTOL physics written out in full, 40+ runnable simulations, and a gym for teaching a drone to fly itself. The platform-agnostic argument made literal — the planning and control layer doesn't know or care what it's flying.",
    tech: ["Python", "Flight Dynamics", "Reinforcement Learning"],
    layer: "field",
    github: "https://github.com/guilyx/autonomous-uav-guide",
    external: "https://guilyx.github.io/autonomous-uav-guide/",
    video: "/media/autonomous-uav-guide-promo.mp4",
    videoPoster: "/media/autonomous-uav-guide-poster.png",
  },
  {
    title: "Kymatics",
    blurb:
      "Speak an intent and watch it become a queue of build jobs. Voice goes in through a Python speech service, a Rust orchestrator plans and schedules the work, and a React board tracks every job through todo → running → done. The queue plans itself — the same scheduling problem as a robot fleet, with a microphone as the input device.",
    tech: ["Rust", "Python", "React", "Voice / STT"],
    layer: "agent",
    github: "https://github.com/Unchained-Labs/kymatics",
    external: "https://kymatics.vercel.app/",
    video: "/media/kymatics-promo.mp4",
    videoPoster: "/media/kymatics-poster.jpg",
  },
  {
    title: "weave",
    blurb:
      "A live D&D session assistant — captures table audio, transcribes the narrative, maintains a rolling recap, and offers suggestions grounded in the campaign's own characters and lore. STT plus a LangGraph agent plus a memory of the campaign — a planning problem wearing a dice-game costume.",
    tech: ["Python", "FastAPI", "LangGraph", "STT"],
    layer: "agent",
    github: "https://github.com/guilyx/weave",
    video: "/media/weave-promo.webm",
    videoPoster: "/media/weave-poster.png",
    videoType: "video/webm",
  },
];

/**
 * Other noteworthy projects — the small grid under the spotlights. Six show
 * by default; the rest of the record lives in /archive.
 */
export const projects: Project[] = [
  {
    title: "BTView",
    blurb:
      "A visual graph editor for BehaviorTree.CPP trees, built into VS Code and Cursor. Bidirectional XML sync, tidy layout, and a validation panel that jumps straight to the offending node.",
    tech: ["TypeScript", "Behavior Trees", "VS Code"],
    layer: "agent",
    github: "https://github.com/guilyx/btview-vscode-plugin",
    external: "https://marketplace.visualstudio.com/items?itemName=rangonomics.btview",
  },
  {
    title: "setup",
    blurb:
      "One curl command turns a bare Ubuntu box into my entire working environment — shell, toolchains, containers, dotfiles via chezmoi. Ansible underneath for idempotency, a typed Python CLI so every generated command is auditable before it runs.",
    tech: ["Ansible", "Python", "chezmoi"],
    layer: "machine",
    github: "https://github.com/guilyx/setup",
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
    title: "Doxmosis",
    blurb:
      "Agentic tooling that keeps documentation alive: watches a codebase, detects drift, and opens documentation pull requests on its own.",
    tech: ["Go", "Agentic AI", "GitHub Apps"],
    layer: "agent",
    external: "https://doxmosis.vercel.app/",
  },
  {
    title: "Bird-Inspired Flocking",
    blurb:
      "Published research on decentralized, acceleration-based coordination for UAVs — a third-order control law for collective motion, validated in field experiments.",
    tech: ["C++", "ROS 2", "Control Theory", "IROS 2024"],
    layer: "field",
    external:
      "https://www.researchgate.net/publication/387418977_Decentralized_Acceleration-Based_Bird-Inspired_Flocking",
  },
  {
    title: "zucman",
    blurb:
      "A campaign kit for one statistic: sourced research, regenerable charts, decks in two languages, and a zero-dependency dataviz site — all rebuilt from the underlying data by script, never by hand.",
    tech: ["Python", "Matplotlib", "Data Viz"],
    layer: "agent",
    github: "https://github.com/guilyx/zucman",
    external: "https://guilyx.github.io/zucman/",
  },
  {
    title: "epsteinexposed-mcp",
    blurb:
      "An MCP server over a public-records API, so an assistant can query the archive — persons, documents, flight logs — directly instead of being told about it.",
    tech: ["Python", "MCP", "Public Data"],
    layer: "agent",
    github: "https://github.com/guilyx/epsteinexposed-mcp",
  },
  {
    title: "artin-pathfinding",
    blurb:
      "A C++17 pathfinding library — A*, Dijkstra, DFS/BFS and friends — with a clean interface for grid worlds.",
    tech: ["C++17", "Algorithms"],
    layer: "field",
    github: "https://github.com/master-coro/artin-pathfinding",
  },
  {
    title: "LeHarness",
    blurb:
      "Serves local models on whatever hardware is actually in the box — vLLM with tensor parallelism on a GPU rig, Ollama with GGUF quantization on a Jetson or a bare CPU — behind one OpenAI-compatible URL.",
    tech: ["vLLM", "Ollama", "Docker", "CUDA"],
    layer: "machine",
    closed: true,
  },
];

/**
 * The full record, newest first. Years are repo creation dates (or publication
 * year for the papers), not the last time something was touched.
 */
export const archive: ArchiveEntry[] = [
  {
    year: 2026,
    title: "weave",
    tech: ["Python", "FastAPI", "LangGraph", "STT"],
    github: "https://github.com/guilyx/weave",
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
    title: "autonomous-uav-guide",
    tech: ["Python", "Flight Dynamics", "Reinforcement Learning"],
    github: "https://github.com/guilyx/autonomous-uav-guide",
    external: "https://guilyx.github.io/autonomous-uav-guide/",
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
    tech: ["Ansible", "Python", "chezmoi", "Flask"],
    github: "https://github.com/guilyx/setup",
  },
  {
    year: 2026,
    title: "LeHarness",
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
export const spec = [
  { key: "role", value: "lead architect · robot autonomy" },
  { key: "based", value: "abu dhabi, uae" },
  { key: "domain", value: "multi-agent planning, behavior trees" },
  { key: "platform", value: "agnostic — in-store robots, drones" },
] as const;

export const contact = {
  title: "Open Channel",
  body: `I'm not actively looking, but the inbox stays open — a question
   about multi-agent planning, an open-source idea, or just to say hi. I'll
   get back to you.`,
} as const;
