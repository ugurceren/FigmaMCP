import { z } from "zod";

const FigmaEnvSchema = z.object({
  FIGMA_TOKEN: z.string().min(1, "FIGMA_TOKEN is required"),
});

function getEnv() {
  const parsed = FigmaEnvSchema.safeParse(process.env);
  if (!parsed.success) {
    const message = parsed.error.issues.map((i) => i.message).join("; ");
    throw new Error(message);
  }
  return parsed.data;
}

export class FigmaClient {
  private readonly token?: string;
  private readonly baseUrl = "https://api.figma.com/v1";

  constructor(opts?: { token?: string }) {
    if (opts?.token) {
      this.token = opts.token;
      return;
    }

    try {
      this.token = getEnv().FIGMA_TOKEN;
    } catch {
      this.token = undefined;
    }
  }

  private async request<T>(
    path: string,
    init?: RequestInit & { query?: Record<string, string | undefined> },
  ): Promise<T> {
    if (!this.token) {
      throw new Error(
        "FIGMA_TOKEN is required. Create a .env file (or set env var) with FIGMA_TOKEN=... then restart the server.",
      );
    }

    const url = new URL(this.baseUrl + path);
    if (init?.query) {
      for (const [k, v] of Object.entries(init.query)) {
        if (v !== undefined && v !== "") url.searchParams.set(k, v);
      }
    }

    const res = await fetch(url, {
      ...init,
      headers: {
        "X-Figma-Token": this.token,
        ...(init?.headers ?? {}),
      },
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(
        `Figma API error ${res.status} ${res.statusText} for ${url.toString()}${text ? `: ${text}` : ""}`,
      );
    }
    return (await res.json()) as T;
  }

  getFile(fileKey: string, opts?: { depth?: number; geometry?: "paths" | "all" }) {
    return this.request<unknown>(`/files/${encodeURIComponent(fileKey)}`, {
      query: {
        depth: opts?.depth?.toString(),
        geometry: opts?.geometry,
      },
    });
  }

  getTeamProjects(teamId: string) {
    return this.request<unknown>(`/teams/${encodeURIComponent(teamId)}/projects`);
  }

  getProjectFiles(projectId: string) {
    return this.request<unknown>(`/projects/${encodeURIComponent(projectId)}/files`);
  }

  getNodes(fileKey: string, nodeIds: string[]) {
    return this.request<unknown>(`/files/${encodeURIComponent(fileKey)}/nodes`, {
      query: {
        ids: nodeIds.join(","),
      },
    });
  }

  exportImages(
    fileKey: string,
    nodeIds: string[],
    opts?: {
      format?: "png" | "jpg" | "svg" | "pdf";
      scale?: number;
      svg_include_id?: boolean;
      svg_simplify_stroke?: boolean;
      use_absolute_bounds?: boolean;
    },
  ) {
    return this.request<unknown>(`/images/${encodeURIComponent(fileKey)}`, {
      query: {
        ids: nodeIds.join(","),
        format: opts?.format,
        scale: opts?.scale?.toString(),
        svg_include_id: opts?.svg_include_id ? "true" : undefined,
        svg_simplify_stroke: opts?.svg_simplify_stroke ? "true" : undefined,
        use_absolute_bounds: opts?.use_absolute_bounds ? "true" : undefined,
      },
    });
  }
}

