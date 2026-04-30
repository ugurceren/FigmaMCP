import "dotenv/config";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { FigmaClient } from "./figma.js";

type FigmaProject = {
  id: string;
  name: string;
};

type FigmaTeamProjectsResponse = {
  projects?: FigmaProject[];
};

type FigmaFileSummary = {
  key: string;
  name: string;
  thumbnail_url?: string;
  last_modified?: string;
};

type FigmaProjectFilesResponse = {
  files?: FigmaFileSummary[];
};

type ImportManifest = {
  importedAt: string;
  teamIds: string[];
  projects: Array<{
    teamId: string;
    projectId: string;
    projectName: string;
    files: FigmaFileSummary[];
  }>;
};

const outDir = path.resolve("figma-export");
const figma = new FigmaClient();

function requiredEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required.`);
  return value;
}

function sanitizeName(value: string) {
  return value
    .replace(/[<>:"/\\|?*\u0000-\u001F]/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);
}

async function writeJson(filePath: string, data: unknown) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

async function main() {
  const teamIds = requiredEnv("FIGMA_TEAM_IDS")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  const depth = process.env.FIGMA_IMPORT_DEPTH
    ? Number.parseInt(process.env.FIGMA_IMPORT_DEPTH, 10)
    : undefined;

  if (depth !== undefined && (!Number.isInteger(depth) || depth < 1)) {
    throw new Error("FIGMA_IMPORT_DEPTH must be a positive integer when provided.");
  }

  const manifest: ImportManifest = {
    importedAt: new Date().toISOString(),
    teamIds,
    projects: [],
  };

  await mkdir(outDir, { recursive: true });

  for (const teamId of teamIds) {
    console.log(`Reading projects for team ${teamId}...`);
    const projectResponse = (await figma.getTeamProjects(teamId)) as FigmaTeamProjectsResponse;
    const projects = projectResponse.projects ?? [];

    await writeJson(path.join(outDir, `team-${teamId}`, "projects.json"), projectResponse);

    for (const project of projects) {
      console.log(`Reading files for project ${project.name} (${project.id})...`);
      const filesResponse = (await figma.getProjectFiles(project.id)) as FigmaProjectFilesResponse;
      const files = filesResponse.files ?? [];

      const projectDir = path.join(
        outDir,
        `team-${teamId}`,
        `${sanitizeName(project.name)}-${project.id}`,
      );

      await writeJson(path.join(projectDir, "files.json"), filesResponse);

      manifest.projects.push({
        teamId,
        projectId: project.id,
        projectName: project.name,
        files,
      });

      for (const file of files) {
        console.log(`Downloading file JSON: ${file.name} (${file.key})...`);
        const fileJson = await figma.getFile(file.key, { depth });
        await writeJson(path.join(projectDir, "files", `${sanitizeName(file.name)}-${file.key}.json`), fileJson);
      }
    }
  }

  await writeJson(path.join(outDir, "manifest.json"), manifest);
  console.log(`Done. Export written to ${outDir}`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exitCode = 1;
});

