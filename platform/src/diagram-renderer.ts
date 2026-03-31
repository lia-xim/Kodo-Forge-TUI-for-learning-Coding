/**
 * Mermaid-zu-Terminal Diagramm-Renderer
 *
 * Parst einfache Mermaid-Flowcharts und rendert sie als
 * Unicode-Box-Drawing-Art im Terminal.
 *
 * Unterstuetzte Syntax:
 *   - Nodes: A["text"], A{"text"}, A(["text"]), A[["text"]]
 *   - Edges: -->, -->|"label"|, ---, -.->
 *   - Direction: TD (top-down), LR (left-right)
 *
 * Keine externen Dependencies.
 */

// ─── ANSI-Farben ────────────────────────────────────────────────────────────

const c = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  italic: "\x1b[3m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  gray: "\x1b[90m",
};

// ─── Typen ──────────────────────────────────────────────────────────────────

type NodeShape = "rect" | "diamond" | "stadium" | "subroutine";
type EdgeStyle = "solid" | "dotted";
type Direction = "TD" | "LR";

interface MermaidNode {
  id: string;
  label: string;
  shape: NodeShape;
}

interface MermaidEdge {
  from: string;
  to: string;
  label: string;
  style: EdgeStyle;
}

interface ParsedDiagram {
  direction: Direction;
  nodes: Map<string, MermaidNode>;
  edges: MermaidEdge[];
}

interface LayoutNode {
  id: string;
  label: string;
  shape: NodeShape;
  rank: number;     // Tiefe im Graphen (Zeile bei TD, Spalte bei LR)
  order: number;    // Position innerhalb des Ranks
  x: number;        // Spaltenposition im Zeichenraster
  y: number;        // Zeilenposition im Zeichenraster
  width: number;    // Breite der gerenderten Node
  height: number;   // Hoehe der gerenderten Node
}

interface LayoutResult {
  direction: Direction;
  nodes: LayoutNode[];
  edges: MermaidEdge[];
  gridWidth: number;
  gridHeight: number;
}

// ─── Parser ─────────────────────────────────────────────────────────────────

/**
 * Parst die Mermaid-Flowchart-Syntax in eine Datenstruktur.
 */
function parseMermaid(code: string): ParsedDiagram | null {
  const lines = code
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith("%%"));

  if (lines.length === 0) return null;

  // Erste Zeile: "flowchart TD" oder "flowchart LR" oder "graph TD" etc.
  const headerMatch = lines[0].match(
    /^(?:flowchart|graph)\s+(TD|TB|LR|RL|BT)\s*$/i
  );
  if (!headerMatch) return null;

  let direction: Direction = "TD";
  const dir = headerMatch[1].toUpperCase();
  if (dir === "LR" || dir === "RL") {
    direction = "LR";
  }

  const nodes = new Map<string, MermaidNode>();
  const edges: MermaidEdge[] = [];

  // Verarbeite restliche Zeilen
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    parseLine(line, nodes, edges);
  }

  if (nodes.size === 0) return null;

  return { direction, nodes, edges };
}

/**
 * Parst eine einzelne Zeile der Mermaid-Definition.
 * Kann Node-Definitionen und Edges enthalten.
 */
function parseLine(
  line: string,
  nodes: Map<string, MermaidNode>,
  edges: MermaidEdge[]
): void {
  // Entferne fuehrende Leerzeichen und optionales Semikolon am Ende
  let trimmed = line.trim().replace(/;$/, "").trim();
  if (trimmed.length === 0) return;

  // Ignoriere subgraph, end, style, class, etc.
  if (/^(subgraph|end|style|class|click|linkStyle)\b/i.test(trimmed)) return;

  // Versuche Edge zu parsen: A --> B, A -->|label| B, A --- B, A -.-> B
  // Muster: NODE EDGE NODE (ggf. verkettet: A --> B --> C)
  const edgePattern =
    /^([A-Za-z_][\w]*)(\s*(?:\[(?:\[.*?\]\]|\[.*?\]|".*?"|'.*?'|[^\]]*)\]|\{(?:".*?"|'.*?'|[^}]*)\}|\(\[(?:".*?"|'.*?'|[^\]]*)\]\))?)\s*(-->|---|-.->|==>)(\|(?:".*?"|'.*?'|[^|]*)\|)?\s*([A-Za-z_][\w]*)(\s*(?:\[(?:\[.*?\]\]|\[.*?\]|".*?"|'.*?'|[^\]]*)\]|\{(?:".*?"|'.*?'|[^}]*)\}|\(\[(?:".*?"|'.*?'|[^\]]*)\]\))?)(.*)$/;

  const edgeMatch = trimmed.match(edgePattern);
  if (edgeMatch) {
    const fromId = edgeMatch[1];
    const fromShape = edgeMatch[2]?.trim() || "";
    const edgeType = edgeMatch[3];
    const edgeLabelRaw = edgeMatch[4] || "";
    const toId = edgeMatch[5];
    const toShape = edgeMatch[6]?.trim() || "";
    const rest = edgeMatch[7]?.trim() || "";

    // Node-Shapes registrieren
    if (fromShape && !nodes.has(fromId)) {
      registerNode(fromId, fromShape, nodes);
    } else if (!nodes.has(fromId)) {
      nodes.set(fromId, { id: fromId, label: fromId, shape: "rect" });
    }

    if (toShape && !nodes.has(toId)) {
      registerNode(toId, toShape, nodes);
    } else if (!nodes.has(toId)) {
      nodes.set(toId, { id: toId, label: toId, shape: "rect" });
    }

    // Edge-Label extrahieren
    let edgeLabel = "";
    if (edgeLabelRaw) {
      edgeLabel = edgeLabelRaw
        .replace(/^\|/, "")
        .replace(/\|$/, "")
        .replace(/^"/, "")
        .replace(/"$/, "")
        .replace(/^'/, "")
        .replace(/'$/, "")
        .trim();
    }

    const style: EdgeStyle =
      edgeType === ".->" || edgeType === "-.->" ? "dotted" : "solid";

    edges.push({ from: fromId, to: toId, label: edgeLabel, style });

    // Restliche verkettete Edges verarbeiten
    if (rest.length > 0) {
      parseLine(`${toId}${toShape} ${rest}`, nodes, edges);
    }
    return;
  }

  // Standalone Node-Definition: A["text"]
  const nodePattern =
    /^([A-Za-z_][\w]*)\s*(\[(?:\[.*?\]\]|\[.*?\]|".*?"|'.*?'|[^\]]*)\]|\{(?:".*?"|'.*?'|[^}]*)\}|\(\[(?:".*?"|'.*?'|[^\]]*)\]\))$/;
  const nodeMatch = trimmed.match(nodePattern);
  if (nodeMatch) {
    registerNode(nodeMatch[1], nodeMatch[2], nodes);
    return;
  }
}

/**
 * Registriert einen Node mit Shape-Erkennung.
 */
function registerNode(
  id: string,
  shapeStr: string,
  nodes: Map<string, MermaidNode>
): void {
  let label = id;
  let shape: NodeShape = "rect";

  // Stadium: (["text"])
  const stadiumMatch = shapeStr.match(/^\(\[(?:"(.*?)"|'(.*?)'|(.+?))\]\)$/);
  if (stadiumMatch) {
    label = stadiumMatch[1] ?? stadiumMatch[2] ?? stadiumMatch[3] ?? id;
    shape = "stadium";
    nodes.set(id, { id, label, shape });
    return;
  }

  // Subroutine: [["text"]]
  const subMatch = shapeStr.match(/^\[\[(?:"(.*?)"|'(.*?)'|(.+?))\]\]$/);
  if (subMatch) {
    label = subMatch[1] ?? subMatch[2] ?? subMatch[3] ?? id;
    shape = "subroutine";
    nodes.set(id, { id, label, shape });
    return;
  }

  // Diamant: {"text"}
  const diamondMatch = shapeStr.match(/^\{(?:"(.*?)"|'(.*?)'|(.+?))\}$/);
  if (diamondMatch) {
    label = diamondMatch[1] ?? diamondMatch[2] ?? diamondMatch[3] ?? id;
    shape = "diamond";
    nodes.set(id, { id, label, shape });
    return;
  }

  // Rechteck: ["text"] oder [text]
  const rectMatch = shapeStr.match(/^\[(?:"(.*?)"|'(.*?)'|(.+?))\]$/);
  if (rectMatch) {
    label = rectMatch[1] ?? rectMatch[2] ?? rectMatch[3] ?? id;
    shape = "rect";
    nodes.set(id, { id, label, shape });
    return;
  }

  // Fallback
  nodes.set(id, { id, label, shape: "rect" });
}

// ─── Layout-Engine ──────────────────────────────────────────────────────────

/**
 * Berechnet die Positionen aller Nodes mittels Rank-basiertem Layout.
 */
function computeLayout(diagram: ParsedDiagram, maxWidth: number): LayoutResult {
  const { direction, nodes, edges } = diagram;

  // 1. Topologische Sortierung und Rank-Zuweisung
  const ranks = assignRanks(nodes, edges);

  // 2. Nodes nach Rank gruppieren
  const rankGroups = new Map<number, string[]>();
  for (const [nodeId, rank] of ranks) {
    if (!rankGroups.has(rank)) {
      rankGroups.set(rank, []);
    }
    rankGroups.get(rank)!.push(nodeId);
  }

  // 3. Sortiere Ranks
  const sortedRanks = [...rankGroups.keys()].sort((a, b) => a - b);

  // 4. Layout-Nodes erstellen
  const layoutNodes: LayoutNode[] = [];
  const nodePositions = new Map<string, LayoutNode>();

  const NODE_PADDING = 2; // Padding links+rechts in der Box
  const NODE_H_GAP = 3;  // Horizontaler Abstand zwischen Nodes
  const NODE_V_GAP = 3;  // Vertikaler Abstand (fuer Pfeile)
  const NODE_HEIGHT = 3; // Hoehe einer Node (obere Linie, Text, untere Linie)

  if (direction === "TD") {
    let currentY = 0;

    for (const rank of sortedRanks) {
      const group = rankGroups.get(rank) ?? [];

      // Berechne Breiten
      const nodeWidths: number[] = group.map((id) => {
        const node = nodes.get(id)!;
        return node.label.length + NODE_PADDING * 2 + 2; // +2 fuer Raender
      });

      // Gesamtbreite dieser Rank-Ebene
      const totalWidth =
        nodeWidths.reduce((a, b) => a + b, 0) +
        (group.length - 1) * NODE_H_GAP;

      // Startposition (zentriert)
      let currentX = Math.max(0, Math.floor((maxWidth - totalWidth) / 2));

      for (let i = 0; i < group.length; i++) {
        const nodeId = group[i];
        const node = nodes.get(nodeId)!;
        const width = nodeWidths[i];

        const layoutNode: LayoutNode = {
          id: nodeId,
          label: node.label,
          shape: node.shape,
          rank,
          order: i,
          x: currentX,
          y: currentY,
          width,
          height: NODE_HEIGHT,
        };

        layoutNodes.push(layoutNode);
        nodePositions.set(nodeId, layoutNode);
        currentX += width + NODE_H_GAP;
      }

      currentY += NODE_HEIGHT + NODE_V_GAP;
    }

    const gridWidth = maxWidth;
    const gridHeight = currentY - NODE_V_GAP + 1;
    return { direction, nodes: layoutNodes, edges, gridWidth, gridHeight };
  } else {
    // LR Layout
    let currentX = 0;

    for (const rank of sortedRanks) {
      const group = rankGroups.get(rank) ?? [];

      // Maximalbreite in diesem Rank
      const maxNodeWidth = Math.max(
        ...group.map((id) => {
          const node = nodes.get(id)!;
          return node.label.length + NODE_PADDING * 2 + 2;
        })
      );

      let currentY = 0;
      const nodeVGap = NODE_HEIGHT + 1;

      // Startposition (vertikal zentriert)
      for (let i = 0; i < group.length; i++) {
        const nodeId = group[i];
        const node = nodes.get(nodeId)!;
        const width = node.label.length + NODE_PADDING * 2 + 2;

        const layoutNode: LayoutNode = {
          id: nodeId,
          label: node.label,
          shape: node.shape,
          rank,
          order: i,
          x: currentX,
          y: currentY,
          width,
          height: NODE_HEIGHT,
        };

        layoutNodes.push(layoutNode);
        nodePositions.set(nodeId, layoutNode);
        currentY += nodeVGap;
      }

      currentX += maxNodeWidth + NODE_H_GAP + 4; // Extra space for arrows
    }

    const gridWidth = currentX;
    const gridHeight =
      Math.max(...layoutNodes.map((n) => n.y + n.height)) + 1;
    return { direction, nodes: layoutNodes, edges, gridWidth, gridHeight };
  }
}

/**
 * Weist jedem Node einen Rank (Tiefe) zu mittels BFS.
 */
function assignRanks(
  nodes: Map<string, MermaidNode>,
  edges: MermaidEdge[]
): Map<string, number> {
  const ranks = new Map<string, number>();
  const adjacency = new Map<string, string[]>();
  const inDegree = new Map<string, number>();

  // Initialisiere
  for (const nodeId of nodes.keys()) {
    adjacency.set(nodeId, []);
    inDegree.set(nodeId, 0);
  }

  for (const edge of edges) {
    if (nodes.has(edge.from) && nodes.has(edge.to)) {
      adjacency.get(edge.from)!.push(edge.to);
      inDegree.set(edge.to, (inDegree.get(edge.to) ?? 0) + 1);
    }
  }

  // BFS von Quellen (inDegree === 0)
  const queue: string[] = [];
  for (const [nodeId, deg] of inDegree) {
    if (deg === 0) {
      queue.push(nodeId);
      ranks.set(nodeId, 0);
    }
  }

  // Falls keine Quellen gefunden (Zyklen), nimm den ersten Node
  if (queue.length === 0 && nodes.size > 0) {
    const firstId = nodes.keys().next().value!;
    queue.push(firstId);
    ranks.set(firstId, 0);
  }

  while (queue.length > 0) {
    const current = queue.shift()!;
    const currentRank = ranks.get(current) ?? 0;

    for (const neighbor of adjacency.get(current) ?? []) {
      const existingRank = ranks.get(neighbor);
      const newRank = currentRank + 1;

      if (existingRank === undefined || newRank > existingRank) {
        ranks.set(neighbor, newRank);
      }

      inDegree.set(neighbor, (inDegree.get(neighbor) ?? 1) - 1);
      if ((inDegree.get(neighbor) ?? 0) <= 0) {
        if (!queue.includes(neighbor)) {
          queue.push(neighbor);
        }
      }
    }
  }

  // Noch nicht zugewiesene Nodes
  for (const nodeId of nodes.keys()) {
    if (!ranks.has(nodeId)) {
      ranks.set(nodeId, 0);
    }
  }

  return ranks;
}

// ─── Renderer ───────────────────────────────────────────────────────────────

/**
 * Rendert das Layout als Terminal-Zeilen mit Box-Drawing-Zeichen.
 */
function renderLayout(layout: LayoutResult, maxWidth: number): string[] {
  const { direction, nodes, edges } = layout;

  if (direction === "TD") {
    return renderTopDown(nodes, edges, maxWidth);
  } else {
    return renderLeftRight(nodes, edges, maxWidth);
  }
}

/**
 * Rendert ein Top-Down-Flowchart.
 */
function renderTopDown(
  nodes: LayoutNode[],
  edges: MermaidEdge[],
  maxWidth: number
): string[] {
  const output: string[] = [];

  // Nodes nach Rank gruppieren
  const rankGroups = new Map<number, LayoutNode[]>();
  for (const node of nodes) {
    if (!rankGroups.has(node.rank)) {
      rankGroups.set(node.rank, []);
    }
    rankGroups.get(node.rank)!.push(node);
  }

  const sortedRanks = [...rankGroups.keys()].sort((a, b) => a - b);
  const nodeById = new Map<string, LayoutNode>();
  for (const node of nodes) {
    nodeById.set(node.id, node);
  }

  // Edge-Map: fuer jeden Node die ausgehenden Edges
  const outEdges = new Map<string, MermaidEdge[]>();
  const inEdges = new Map<string, MermaidEdge[]>();
  for (const edge of edges) {
    if (!outEdges.has(edge.from)) outEdges.set(edge.from, []);
    outEdges.get(edge.from)!.push(edge);
    if (!inEdges.has(edge.to)) inEdges.set(edge.to, []);
    inEdges.get(edge.to)!.push(edge);
  }

  for (let ri = 0; ri < sortedRanks.length; ri++) {
    const rank = sortedRanks[ri];
    const group = rankGroups.get(rank) ?? [];

    // Rendere die Nodes dieser Ebene
    const nodeLines = renderNodeRow(group, maxWidth);
    output.push(...nodeLines);

    // Rendere Verbindungen zur naechsten Ebene
    if (ri < sortedRanks.length - 1) {
      const nextRank = sortedRanks[ri + 1];
      const nextGroup = rankGroups.get(nextRank) ?? [];
      const connectionLines = renderConnections(
        group,
        nextGroup,
        edges,
        nodeById,
        maxWidth
      );
      output.push(...connectionLines);
    }
  }

  return output;
}

/**
 * Rendert eine Reihe von Nodes nebeneinander.
 */
function renderNodeRow(
  group: LayoutNode[],
  maxWidth: number
): string[] {
  if (group.length === 0) return [];

  // Berechne Gesamtbreite und Zentrierung
  const NODE_H_GAP = 2;
  const totalWidth =
    group.reduce((sum, n) => sum + n.width, 0) +
    (group.length - 1) * NODE_H_GAP;

  const startOffset = Math.max(0, Math.floor((maxWidth - totalWidth) / 2));

  // 3 Zeilen pro Node: oben, mitte, unten
  const topLine: string[] = [];
  const midLine: string[] = [];
  const botLine: string[] = [];

  let currentPos = startOffset;

  for (let i = 0; i < group.length; i++) {
    const node = group[i];
    const innerW = node.width - 2;
    const labelPad = Math.max(0, innerW - node.label.length);
    const leftPad = Math.floor(labelPad / 2);
    const rightPad = labelPad - leftPad;

    // Aktualisiere die tatsaechliche X-Position
    node.x = currentPos;

    if (i > 0) {
      const gap = NODE_H_GAP;
      topLine.push(" ".repeat(gap));
      midLine.push(" ".repeat(gap));
      botLine.push(" ".repeat(gap));
    }

    if (node.shape === "diamond") {
      topLine.push(`${c.magenta}┌${"─".repeat(innerW)}┐${c.reset}`);
      midLine.push(
        `${c.magenta}│${c.reset}${" ".repeat(leftPad)}${c.bold}${c.magenta}${node.label}${c.reset}${" ".repeat(rightPad)}${c.magenta}◆${c.reset}`
      );
      botLine.push(`${c.magenta}└${"─".repeat(innerW)}┘${c.reset}`);
    } else if (node.shape === "stadium") {
      topLine.push(`${c.cyan}╭${"─".repeat(innerW)}╮${c.reset}`);
      midLine.push(
        `${c.cyan}│${c.reset}${" ".repeat(leftPad)}${c.bold}${c.cyan}${node.label}${c.reset}${" ".repeat(rightPad)}${c.cyan}│${c.reset}`
      );
      botLine.push(`${c.cyan}╰${"─".repeat(innerW)}╯${c.reset}`);
    } else if (node.shape === "subroutine") {
      topLine.push(`${c.cyan}┌${"─".repeat(innerW)}┐${c.reset}`);
      midLine.push(
        `${c.cyan}║${c.reset}${" ".repeat(leftPad)}${c.bold}${c.cyan}${node.label}${c.reset}${" ".repeat(rightPad)}${c.cyan}║${c.reset}`
      );
      botLine.push(`${c.cyan}└${"─".repeat(innerW)}┘${c.reset}`);
    } else {
      // rect
      topLine.push(`${c.cyan}┌${"─".repeat(innerW)}┐${c.reset}`);
      midLine.push(
        `${c.cyan}│${c.reset}${" ".repeat(leftPad)}${c.bold}${c.cyan}${node.label}${c.reset}${" ".repeat(rightPad)}${c.cyan}│${c.reset}`
      );
      botLine.push(`${c.cyan}└${"─".repeat(innerW)}┘${c.reset}`);
    }

    currentPos += node.width + NODE_H_GAP;
  }

  const prefix = " ".repeat(startOffset);
  return [
    prefix + topLine.join(""),
    prefix + midLine.join(""),
    prefix + botLine.join(""),
  ];
}

/**
 * Rendert die Verbindungslinien zwischen zwei Rank-Ebenen.
 */
function renderConnections(
  sourceGroup: LayoutNode[],
  targetGroup: LayoutNode[],
  allEdges: MermaidEdge[],
  nodeById: Map<string, LayoutNode>,
  maxWidth: number
): string[] {
  // Finde alle Edges die von sourceGroup nach targetGroup gehen
  const relevantEdges: MermaidEdge[] = [];
  const sourceIds = new Set(sourceGroup.map((n) => n.id));
  const targetIds = new Set(targetGroup.map((n) => n.id));

  for (const edge of allEdges) {
    if (sourceIds.has(edge.from) && targetIds.has(edge.to)) {
      relevantEdges.push(edge);
    }
  }

  if (relevantEdges.length === 0) {
    // Leerzeile als Abstand
    return [""];
  }

  // Berechne Mittelpunkte der Source- und Target-Nodes
  interface ConnectionPoint {
    edge: MermaidEdge;
    sourceX: number; // Mittelpunkt der Source-Node
    targetX: number; // Mittelpunkt der Target-Node
  }

  const connections: ConnectionPoint[] = relevantEdges.map((edge) => {
    const src = nodeById.get(edge.from)!;
    const tgt = nodeById.get(edge.to)!;
    return {
      edge,
      sourceX: src.x + Math.floor(src.width / 2),
      targetX: tgt.x + Math.floor(tgt.width / 2),
    };
  });

  const lines: string[] = [];

  // Zeile 1: Vertikale Linien von Source-Nodes
  const line1 = new Array(maxWidth).fill(" ");
  for (const conn of connections) {
    if (conn.sourceX >= 0 && conn.sourceX < maxWidth) {
      const ch = conn.edge.style === "dotted" ? "┊" : "│";
      line1[conn.sourceX] = `${c.dim}${ch}${c.reset}`;
    }
  }
  lines.push(line1.join(""));

  // Pruefen ob Merging/Splitting noetig ist
  const needsHorizontal = connections.some(
    (conn) => conn.sourceX !== conn.targetX
  );

  if (needsHorizontal) {
    // Zeile 2: Horizontale Verbindungen + Labels
    const line2 = new Array(maxWidth).fill(" ");

    // Sortiere Connections nach sourceX
    const sorted = [...connections].sort((a, b) => a.sourceX - b.sourceX);

    // Finde die Extents der horizontalen Linie
    const allX = sorted.flatMap((c) => [c.sourceX, c.targetX]);
    const minX = Math.max(0, Math.min(...allX));
    const maxX = Math.min(maxWidth - 1, Math.max(...allX));

    // Zeichne horizontale Linie
    for (let x = minX; x <= maxX; x++) {
      line2[x] = `${c.dim}─${c.reset}`;
    }

    // Zeichne Verbindungspunkte
    for (const conn of sorted) {
      if (conn.sourceX >= 0 && conn.sourceX < maxWidth) {
        // Source-Punkt: Linie kommt von oben
        const isLeftmost = conn.sourceX === minX;
        const isRightmost = conn.sourceX === maxX;
        if (isLeftmost && isRightmost) {
          line2[conn.sourceX] = `${c.dim}│${c.reset}`;
        } else if (isLeftmost) {
          line2[conn.sourceX] = `${c.dim}└${c.reset}`;
        } else if (isRightmost) {
          line2[conn.sourceX] = `${c.dim}┘${c.reset}`;
        } else {
          line2[conn.sourceX] = `${c.dim}┴${c.reset}`;
        }
      }
    }

    // Target-Punkte: Linie geht nach unten
    for (const conn of sorted) {
      if (conn.targetX >= 0 && conn.targetX < maxWidth) {
        const existingChar = stripAnsiChar(line2[conn.targetX]);
        if (existingChar === "─") {
          line2[conn.targetX] = `${c.dim}┬${c.reset}`;
        } else if (existingChar === "└") {
          line2[conn.targetX] = `${c.dim}├${c.reset}`;
        } else if (existingChar === "┘") {
          line2[conn.targetX] = `${c.dim}┤${c.reset}`;
        } else if (existingChar === "┴") {
          line2[conn.targetX] = `${c.dim}┼${c.reset}`;
        } else if (existingChar === " ") {
          line2[conn.targetX] = `${c.dim}│${c.reset}`;
        }
      }
    }

    lines.push(line2.join(""));

    // Zeile 3: Vertikale Linien zu Target-Nodes + Labels
    const line3 = new Array(maxWidth).fill(" ");
    for (const conn of connections) {
      if (conn.targetX >= 0 && conn.targetX < maxWidth) {
        line3[conn.targetX] = `${c.dim}│${c.reset}`;
      }
      // Label neben der Linie
      if (conn.edge.label) {
        const labelStart = conn.targetX + 1;
        const label = ` ${conn.edge.label}`;
        for (let j = 0; j < label.length && labelStart + j < maxWidth; j++) {
          line3[labelStart + j] = `${c.yellow}${label[j]}${c.reset}`;
        }
      }
    }
    lines.push(line3.join(""));

    // Zeile 4: Pfeile (▼) zu Target-Nodes
    const line4 = new Array(maxWidth).fill(" ");
    for (const conn of connections) {
      if (conn.targetX >= 0 && conn.targetX < maxWidth) {
        line4[conn.targetX] = `${c.dim}▼${c.reset}`;
      }
    }
    lines.push(line4.join(""));
  } else {
    // Einfache vertikale Verbindung
    // Labels anzeigen
    if (connections.some((conn) => conn.edge.label)) {
      const line2 = new Array(maxWidth).fill(" ");
      for (const conn of connections) {
        if (conn.sourceX >= 0 && conn.sourceX < maxWidth) {
          line2[conn.sourceX] = `${c.dim}│${c.reset}`;
        }
        if (conn.edge.label) {
          const labelStart = conn.sourceX + 2;
          const label = conn.edge.label;
          for (let j = 0; j < label.length && labelStart + j < maxWidth; j++) {
            line2[labelStart + j] = `${c.yellow}${label[j]}${c.reset}`;
          }
        }
      }
      lines.push(line2.join(""));
    }

    // Pfeil-Zeile
    const arrowLine = new Array(maxWidth).fill(" ");
    for (const conn of connections) {
      if (conn.targetX >= 0 && conn.targetX < maxWidth) {
        arrowLine[conn.targetX] = `${c.dim}▼${c.reset}`;
      }
    }
    lines.push(arrowLine.join(""));
  }

  return lines;
}

/**
 * Rendert ein Left-Right-Flowchart.
 */
function renderLeftRight(
  nodes: LayoutNode[],
  edges: MermaidEdge[],
  maxWidth: number
): string[] {
  const output: string[] = [];

  // Nodes nach Rank gruppieren
  const rankGroups = new Map<number, LayoutNode[]>();
  for (const node of nodes) {
    if (!rankGroups.has(node.rank)) {
      rankGroups.set(node.rank, []);
    }
    rankGroups.get(node.rank)!.push(node);
  }

  const sortedRanks = [...rankGroups.keys()].sort((a, b) => a - b);
  const nodeById = new Map<string, LayoutNode>();
  for (const node of nodes) {
    nodeById.set(node.id, node);
  }

  // Bei LR: Alle Nodes in einer Zeile rendern mit Pfeilen dazwischen
  const allNodesInOrder: LayoutNode[] = [];
  for (const rank of sortedRanks) {
    const group = rankGroups.get(rank) ?? [];
    // Fuer LR nur den ersten Node pro Rank (Vereinfachung)
    if (group.length > 0) {
      allNodesInOrder.push(group[0]);
    }
  }

  // Top line
  let topParts: string[] = [];
  let midParts: string[] = [];
  let botParts: string[] = [];

  for (let i = 0; i < allNodesInOrder.length; i++) {
    const node = allNodesInOrder[i];
    const innerW = node.width - 2;
    const labelPad = Math.max(0, innerW - node.label.length);
    const leftPad = Math.floor(labelPad / 2);
    const rightPad = labelPad - leftPad;

    if (node.shape === "diamond") {
      topParts.push(`${c.magenta}┌${"─".repeat(innerW)}┐${c.reset}`);
      midParts.push(
        `${c.magenta}│${c.reset}${" ".repeat(leftPad)}${c.bold}${c.magenta}${node.label}${c.reset}${" ".repeat(rightPad)}${c.magenta}◆${c.reset}`
      );
      botParts.push(`${c.magenta}└${"─".repeat(innerW)}┘${c.reset}`);
    } else {
      topParts.push(`${c.cyan}┌${"─".repeat(innerW)}┐${c.reset}`);
      midParts.push(
        `${c.cyan}│${c.reset}${" ".repeat(leftPad)}${c.bold}${c.cyan}${node.label}${c.reset}${" ".repeat(rightPad)}${c.cyan}│${c.reset}`
      );
      botParts.push(`${c.cyan}└${"─".repeat(innerW)}┘${c.reset}`);
    }

    // Pfeil zum naechsten Node
    if (i < allNodesInOrder.length - 1) {
      // Finde den Edge-Label
      const edge = edges.find(
        (e) =>
          e.from === node.id && e.to === allNodesInOrder[i + 1].id
      );
      const arrowLen = 3;
      const arrowStr =
        edge?.style === "dotted" ? "╌╌►" : "──►";
      const label = edge?.label || "";

      topParts.push(" ".repeat(arrowLen));
      midParts.push(`${c.dim}${arrowStr}${c.reset}`);
      if (label) {
        const labelAbove = label.length <= arrowLen
          ? label.padEnd(arrowLen)
          : label.slice(0, arrowLen);
        topParts[topParts.length - 1] = `${c.yellow}${labelAbove}${c.reset}`;
      }
      botParts.push(" ".repeat(arrowLen));
    }
  }

  output.push(" " + topParts.join(""));
  output.push(" " + midParts.join(""));
  output.push(" " + botParts.join(""));

  return output;
}

// ─── Hilfsfunktionen ────────────────────────────────────────────────────────

function stripAnsiChar(str: string): string {
  return str.replace(/\x1b\[[0-9;]*m/g, "");
}

// ─── Oeffentliche API ───────────────────────────────────────────────────────

/**
 * Prueft ob ein Mermaid-Codeblock im Terminal gerendert werden kann.
 *
 * Unterstuetzte Syntax:
 *   - flowchart/graph mit TD, TB, LR, RL, BT
 *   - Nodes: A["text"], A{"text"}, A(["text"]), A[["text"]]
 *   - Edges: -->, ---|, ---, -.->
 *
 * Nicht unterstuetzt (gibt false zurueck):
 *   - subgraph
 *   - style/class Direktiven
 *   - Mehr als 12 Nodes
 *   - Komplexe Verschachtelungen
 *
 * @param mermaidCode - Der Mermaid-Quelltext (ohne ``` Markers)
 * @returns true wenn das Diagramm im Terminal renderbar ist
 */
export function canRenderInTerminal(mermaidCode: string): boolean {
  const lines = mermaidCode
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) return false;

  // Muss mit flowchart/graph anfangen
  if (!/^(flowchart|graph)\s+(TD|TB|LR|RL|BT)\s*$/i.test(lines[0])) {
    return false;
  }

  // Keine Subgraphs
  if (lines.some((l) => /^subgraph\b/i.test(l))) return false;

  // Keine style/class Direktiven
  if (lines.some((l) => /^(style|class|click|linkStyle)\b/i.test(l)))
    return false;

  // Parse und pruefe Node-Anzahl
  const parsed = parseMermaid(mermaidCode);
  if (!parsed) return false;
  if (parsed.nodes.size > 12) return false;
  if (parsed.nodes.size === 0) return false;

  return true;
}

/**
 * Rendert einen Mermaid-Flowchart als Box-Drawing-Art im Terminal.
 *
 * @param mermaidCode - Der Mermaid-Quelltext (ohne ``` Markers)
 * @param maxWidth - Maximale Breite in Zeichen
 * @returns Array von gerenderten Zeilen mit ANSI-Farbcodes
 *
 * @example
 * const lines = renderMermaidToTerminal(`
 * flowchart TD
 *     A["Start"] --> B{"Entscheidung?"}
 *     B -->|"Ja"| C["Aktion 1"]
 *     B -->|"Nein"| D["Aktion 2"]
 * `, 60);
 * lines.forEach(l => console.log(l));
 */
export function renderMermaidToTerminal(
  mermaidCode: string,
  maxWidth: number
): string[] {
  const parsed = parseMermaid(mermaidCode);
  if (!parsed) {
    return [
      `  ${c.dim}(Mermaid-Diagramm konnte nicht geparst werden)${c.reset}`,
    ];
  }

  const layout = computeLayout(parsed, Math.max(20, maxWidth));
  const rendered = renderLayout(layout, Math.max(20, maxWidth));

  // Auf maxWidth trimmen
  return rendered.map((line) => {
    const vis = stripAnsiChar(line);
    if (vis.length > maxWidth) {
      // Trimme den sichtbaren Text
      return line.slice(0, maxWidth);
    }
    return line;
  });
}

/**
 * Rendert einen Fallback-Hinweis fuer nicht renderbare Diagramme.
 *
 * @param maxWidth - Verfuegbare Breite
 * @returns Array von Fallback-Zeilen
 */
export function renderMermaidFallback(maxWidth: number): string[] {
  const boxW = Math.min(maxWidth - 4, 50);
  return [
    `  ${c.dim}┌${"─".repeat(boxW)}┐${c.reset}`,
    `  ${c.dim}│${c.reset} ${c.cyan}(Mermaid-Diagramm)${c.reset}${" ".repeat(Math.max(0, boxW - 20))}${c.dim}│${c.reset}`,
    `  ${c.dim}│${c.reset} ${c.italic}Zu komplex fuer Terminal-Darstellung${c.reset}${" ".repeat(Math.max(0, boxW - 38))}${c.dim}│${c.reset}`,
    `  ${c.dim}│${c.reset} ${c.yellow}[D] Vollstaendiges Diagramm im Browser${c.reset}${" ".repeat(Math.max(0, boxW - 40))}${c.dim}│${c.reset}`,
    `  ${c.dim}└${"─".repeat(boxW)}┘${c.reset}`,
  ];
}
