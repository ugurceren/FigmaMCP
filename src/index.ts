import "dotenv/config";
import { z } from "zod";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { FigmaClient } from "./figma.js";

type FigmaImageExportResponse = {
  err?: unknown;
  images?: Record<string, string>;
};

const server = new Server(
  { name: "figma-mcp", version: "0.1.0" },
  { capabilities: { tools: {} } },
);

const figma = new FigmaClient();

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "figma_get_file",
        description:
          "Get a Figma file document JSON. Input: fileKey and optional depth/geometry.",
        inputSchema: {
          type: "object",
          additionalProperties: false,
          required: ["fileKey"],
          properties: {
            fileKey: { type: "string", description: "Figma file key (from file URL)." },
            depth: { type: "number", description: "Optional depth for document traversal." },
            geometry: {
              type: "string",
              enum: ["paths", "all"],
              description: "Optional geometry mode.",
            },
          },
        },
      },
      {
        name: "figma_get_nodes",
        description:
          "Get specific nodes from a file. Input: fileKey and nodeIds array (node id strings).",
        inputSchema: {
          type: "object",
          additionalProperties: false,
          required: ["fileKey", "nodeIds"],
          properties: {
            fileKey: { type: "string" },
            nodeIds: { type: "array", items: { type: "string" }, minItems: 1 },
          },
        },
      },
      {
        name: "figma_export_images",
        description:
          "Request export URLs for nodes. Input: fileKey, nodeIds, and optional export params.",
        inputSchema: {
          type: "object",
          additionalProperties: false,
          required: ["fileKey", "nodeIds"],
          properties: {
            fileKey: { type: "string" },
            nodeIds: { type: "array", items: { type: "string" }, minItems: 1 },
            format: { type: "string", enum: ["png", "jpg", "svg", "pdf"] },
            scale: { type: "number" },
            svg_include_id: { type: "boolean" },
            svg_simplify_stroke: { type: "boolean" },
            use_absolute_bounds: { type: "boolean" },
          },
        },
      },
      {
        name: "figma_export_image_data",
        description:
          "Export a single node and return the image bytes (base64) for immediate viewing. Best for quick previews. Input: fileKey and nodeId, optional format/scale.",
        inputSchema: {
          type: "object",
          additionalProperties: false,
          required: ["fileKey", "nodeId"],
          properties: {
            fileKey: { type: "string" },
            nodeId: { type: "string", description: "Single node id, e.g. 0:1" },
            format: { type: "string", enum: ["png", "jpg", "svg"] },
            scale: { type: "number" },
            svg_include_id: { type: "boolean" },
            svg_simplify_stroke: { type: "boolean" },
            use_absolute_bounds: { type: "boolean" },
          },
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const name = req.params.name;
  const args = req.params.arguments ?? {};

  try {
    if (name === "figma_get_file") {
      const schema = z.object({
        fileKey: z.string().min(1),
        depth: z.number().int().positive().optional(),
        geometry: z.enum(["paths", "all"]).optional(),
      });
      const input = schema.parse(args);
      const data = await figma.getFile(input.fileKey, { depth: input.depth, geometry: input.geometry });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }

    if (name === "figma_get_nodes") {
      const schema = z.object({
        fileKey: z.string().min(1),
        nodeIds: z.array(z.string().min(1)).min(1),
      });
      const input = schema.parse(args);
      const data = await figma.getNodes(input.fileKey, input.nodeIds);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }

    if (name === "figma_export_images") {
      const schema = z.object({
        fileKey: z.string().min(1),
        nodeIds: z.array(z.string().min(1)).min(1),
        format: z.enum(["png", "jpg", "svg", "pdf"]).optional(),
        scale: z.number().positive().optional(),
        svg_include_id: z.boolean().optional(),
        svg_simplify_stroke: z.boolean().optional(),
        use_absolute_bounds: z.boolean().optional(),
      });
      const input = schema.parse(args);
      const data = await figma.exportImages(input.fileKey, input.nodeIds, {
        format: input.format,
        scale: input.scale,
        svg_include_id: input.svg_include_id,
        svg_simplify_stroke: input.svg_simplify_stroke,
        use_absolute_bounds: input.use_absolute_bounds,
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }

    if (name === "figma_export_image_data") {
      const schema = z.object({
        fileKey: z.string().min(1),
        nodeId: z.string().min(1),
        format: z.enum(["png", "jpg", "svg"]).optional(),
        scale: z.number().positive().optional(),
        svg_include_id: z.boolean().optional(),
        svg_simplify_stroke: z.boolean().optional(),
        use_absolute_bounds: z.boolean().optional(),
      });
      const input = schema.parse(args);

      const exported = (await figma.exportImages(input.fileKey, [input.nodeId], {
        format: input.format ?? "png",
        scale: input.scale,
        svg_include_id: input.svg_include_id,
        svg_simplify_stroke: input.svg_simplify_stroke,
        use_absolute_bounds: input.use_absolute_bounds,
      })) as FigmaImageExportResponse;

      const url = exported.images?.[input.nodeId];
      if (!url) {
        throw new Error("Export URL not found for requested nodeId.");
      }

      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Failed to download exported image: ${res.status} ${res.statusText}`);
      }
      const bytes = new Uint8Array(await res.arrayBuffer());
      const b64 = Buffer.from(bytes).toString("base64");

      const format = input.format ?? "png";
      const mimeType =
        format === "jpg" ? "image/jpeg" : format === "svg" ? "image/svg+xml" : "image/png";

      return { content: [{ type: "image", data: b64, mimeType }] };
    }

    return {
      content: [{ type: "text", text: `Unknown tool: ${name}` }],
      isError: true,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      content: [{ type: "text", text: message }],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exitCode = 1;
});

