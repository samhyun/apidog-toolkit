import {
  searchEndpoints,
  getEndpointDetails,
  listAllEndpoints,
  getSchema,
  getProjectInfo,
  invalidateCache,
  // 쓰기 기능
  importFromUrl,
  addEndpoint,
  addSchema,
  importOpenAPISpec,
  addFolderDoc,
  // 수정/삭제 기능
  updateEndpoint,
  syncWithSpec,
  clearProject,
  // 삭제 기능 (신규)
  listPlaceholderEndpoints,
  deleteEndpoints,
  deletePlaceholderEndpoints,
  // 프로젝트 컨텍스트
  setProjectContext,
  getProjectContext
} from "../apidog/client";

export function listTools() {
  return {
    tools: [
      // ===== 컨텍스트 도구 =====
      {
        name: "apidog_set_context",
        description: "Set project context for folder organization. All subsequent add/update operations will use this context for automatic folder tagging. Optionally add folder documentation.",
        inputSchema: {
          type: "object",
          properties: {
            serviceName: {
              type: "string",
              description: "Service/product name (e.g., 'aura-assistant', 'my-app')"
            },
            projectName: {
              type: "string",
              description: "Project/module name within the service (e.g., 'backend', 'frontend', 'api-gateway')"
            },
            description: {
              type: "string",
              description: "Markdown documentation for the folder (e.g., '# My API\\n\\n## Auth\\nBearer token required')"
            }
          },
          required: ["serviceName"]
        }
      },
      {
        name: "apidog_get_context",
        description: "Get current project context and folder path.",
        inputSchema: {
          type: "object",
          properties: {}
        }
      },
      {
        name: "apidog_clear_context",
        description: "Clear the current project context.",
        inputSchema: {
          type: "object",
          properties: {}
        }
      },

      // ===== 읽기 도구 =====
      {
        name: "apidog_search",
        description: "Search API endpoints by keyword. Searches in endpoint names, paths, descriptions, and methods. Use 'useContext: true' to filter by current project context.",
        inputSchema: {
          type: "object",
          properties: {
            keyword: {
              type: "string",
              description: "Keyword to search for in API endpoints"
            },
            useContext: {
              type: "boolean",
              description: "If true, only search within the current project context folder"
            }
          },
          required: ["keyword"]
        }
      },
      {
        name: "apidog_get_endpoint",
        description: "Get detailed information about a specific API endpoint including parameters, request body, and responses.",
        inputSchema: {
          type: "object",
          properties: {
            pathOrId: {
              type: "string",
              description: "The endpoint path (e.g., '/users/{id}') or operationId"
            }
          },
          required: ["pathOrId"]
        }
      },
      {
        name: "apidog_list_endpoints",
        description: "List all available API endpoints in the project.",
        inputSchema: {
          type: "object",
          properties: {}
        }
      },
      {
        name: "apidog_get_schema",
        description: "Get a specific schema/model definition from the API specification.",
        inputSchema: {
          type: "object",
          properties: {
            schemaName: {
              type: "string",
              description: "Name of the schema/model to retrieve"
            }
          },
          required: ["schemaName"]
        }
      },
      {
        name: "apidog_project_info",
        description: "Get project information including API title, version, and statistics.",
        inputSchema: {
          type: "object",
          properties: {}
        }
      },
      {
        name: "apidog_refresh",
        description: "Refresh the cached API documentation data.",
        inputSchema: {
          type: "object",
          properties: {}
        }
      },

      // ===== 쓰기 도구 =====
      {
        name: "apidog_import_url",
        description: "Import OpenAPI/Swagger specification from a URL into the Apidog project.",
        inputSchema: {
          type: "object",
          properties: {
            url: {
              type: "string",
              description: "URL of the OpenAPI/Swagger specification (e.g., 'https://petstore.swagger.io/v2/swagger.json')"
            }
          },
          required: ["url"]
        }
      },
      {
        name: "apidog_add_endpoint",
        description: "Add a new API endpoint to the Apidog project.",
        inputSchema: {
          type: "object",
          properties: {
            method: {
              type: "string",
              enum: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"],
              description: "HTTP method"
            },
            path: {
              type: "string",
              description: "Endpoint path (e.g., '/users/{id}')"
            },
            name: {
              type: "string",
              description: "Endpoint name/summary"
            },
            description: {
              type: "string",
              description: "Detailed description of the endpoint"
            },
            tags: {
              type: "array",
              items: {
                oneOf: [
                  { type: "string" },
                  {
                    type: "object",
                    properties: {
                      name: { type: "string", description: "Tag/folder name" },
                      description: { type: "string", description: "Markdown documentation for this folder" }
                    },
                    required: ["name"]
                  }
                ]
              },
              description: "Tags for grouping endpoints. Can be strings or objects with {name, description} for folder documentation"
            },
            parameters: {
              type: "array",
              description: "OpenAPI parameter objects"
            },
            requestBody: {
              type: "object",
              description: "OpenAPI requestBody object"
            },
            responses: {
              type: "object",
              description: "OpenAPI responses object"
            }
          },
          required: ["method", "path", "name"]
        }
      },
      {
        name: "apidog_add_folder_doc",
        description: "⚠️ DEPRECATED: Creates placeholder endpoints (/__docs__/...) that pollute API list. Use apidog_add_endpoint with tags containing {name, description} instead for folder documentation. Placeholder endpoints must be deleted manually via Apidog web UI or apidog_delete_placeholders.",
        inputSchema: {
          type: "object",
          properties: {
            folderPath: {
              type: "string",
              description: "Folder path (e.g., 'Users', 'Auth'). Context prefix is auto-applied if set."
            },
            documentation: {
              type: "string",
              description: "Markdown documentation content for the folder"
            }
          },
          required: ["folderPath", "documentation"]
        }
      },
      {
        name: "apidog_add_schema",
        description: "Add a new schema/model to the Apidog project.",
        inputSchema: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "Schema name (e.g., 'User', 'Product')"
            },
            schema: {
              type: "object",
              description: "OpenAPI schema object defining the model structure"
            }
          },
          required: ["name", "schema"]
        }
      },
      {
        name: "apidog_import_spec",
        description: "Import a complete OpenAPI specification object into the Apidog project.",
        inputSchema: {
          type: "object",
          properties: {
            spec: {
              type: "object",
              description: "Complete OpenAPI 3.0 specification object"
            },
            overwriteBehavior: {
              type: "string",
              enum: ["OVERWRITE_EXISTING", "AUTO_MERGE", "KEEP_EXISTING", "CREATE_NEW"],
              description: "How to handle conflicts with existing endpoints/schemas"
            }
          },
          required: ["spec"]
        }
      },

      // ===== 수정/삭제 도구 =====
      {
        name: "apidog_update_endpoint",
        description: "Update an existing API endpoint using AUTO_MERGE behavior. Changes are merged with existing endpoint.",
        inputSchema: {
          type: "object",
          properties: {
            method: {
              type: "string",
              enum: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"],
              description: "HTTP method"
            },
            path: {
              type: "string",
              description: "Endpoint path (e.g., '/users/{id}')"
            },
            name: {
              type: "string",
              description: "Endpoint name/summary"
            },
            description: {
              type: "string",
              description: "Detailed description of the endpoint"
            },
            tags: {
              type: "array",
              items: {
                oneOf: [
                  { type: "string" },
                  {
                    type: "object",
                    properties: {
                      name: { type: "string", description: "Tag/folder name" },
                      description: { type: "string", description: "Markdown documentation for this folder" }
                    },
                    required: ["name"]
                  }
                ]
              },
              description: "Tags for grouping endpoints. Can be strings or objects with {name, description} for folder documentation"
            },
            parameters: {
              type: "array",
              description: "OpenAPI parameter objects"
            },
            requestBody: {
              type: "object",
              description: "OpenAPI requestBody object"
            },
            responses: {
              type: "object",
              description: "OpenAPI responses object"
            }
          },
          required: ["method", "path", "name"]
        }
      },
      {
        name: "apidog_sync_spec",
        description: "Synchronize project with an OpenAPI spec. WARNING: Removes endpoints/schemas not in the spec!",
        inputSchema: {
          type: "object",
          properties: {
            url: {
              type: "string",
              description: "URL of the OpenAPI specification to sync with"
            },
            spec: {
              type: "object",
              description: "OpenAPI specification object to sync with (if not using URL)"
            }
          }
        }
      },
      {
        name: "apidog_clear_project",
        description: "DANGER: Remove ALL endpoints and schemas from the project. This cannot be undone!",
        inputSchema: {
          type: "object",
          properties: {
            confirm: {
              type: "boolean",
              description: "Must be set to true to confirm deletion"
            }
          },
          required: ["confirm"]
        }
      },

      // ===== 삭제 도구 (신규) =====
      {
        name: "apidog_list_placeholders",
        description: "List all placeholder endpoints (/__docs__/...) created by apidog_add_folder_doc. Use this to identify endpoints that need to be deleted.",
        inputSchema: {
          type: "object",
          properties: {}
        }
      },
      {
        name: "apidog_delete_endpoints",
        description: "Delete specific endpoints by path. Uses sync-based deletion (removes endpoints not in the new spec). WARNING: Always use dryRun first to preview changes. Schemas are preserved by default.",
        inputSchema: {
          type: "object",
          properties: {
            paths: {
              type: "array",
              items: { type: "string" },
              description: "Array of endpoint paths to delete (e.g., ['/__docs__/test', '/api/old'])"
            },
            confirm: {
              type: "boolean",
              description: "Must be true to execute deletion. Required for safety."
            },
            dryRun: {
              type: "boolean",
              description: "If true, only preview what will be deleted without making changes. Recommended before actual deletion."
            },
            preserveSchemas: {
              type: "boolean",
              description: "If true (default), keep all schemas. Set to false to also remove schemas not referenced by remaining endpoints."
            }
          },
          required: ["paths", "confirm"]
        }
      },
      {
        name: "apidog_delete_placeholders",
        description: "Delete all placeholder endpoints (/__docs__/...) created by apidog_add_folder_doc. Convenience function that finds and removes all placeholder endpoints while preserving schemas.",
        inputSchema: {
          type: "object",
          properties: {
            confirm: {
              type: "boolean",
              description: "Must be true to execute deletion. Required for safety."
            },
            dryRun: {
              type: "boolean",
              description: "If true, only preview what will be deleted without making changes."
            }
          },
          required: ["confirm"]
        }
      }
    ]
  };
}

export async function callTool({ name, arguments: args }: { name: string; arguments?: Record<string, any> }) {
  try {
    switch (name) {
      // ===== 컨텍스트 =====
      case "apidog_set_context": {
        const result = await setProjectContext({
          serviceName: args?.serviceName,
          projectName: args?.projectName,
          description: args?.description
        });
        return {
          content: [{ type: "text", text: result }]
        };
      }

      case "apidog_get_context": {
        const result = getProjectContext();
        return {
          content: [{ type: "text", text: result }]
        };
      }

      case "apidog_clear_context": {
        const result = setProjectContext(null);
        return {
          content: [{ type: "text", text: result }]
        };
      }

      // ===== 읽기 =====
      case "apidog_search": {
        const result = await searchEndpoints(args?.keyword || "", args?.useContext || false);
        return {
          content: [{ type: "text", text: result }]
        };
      }

      case "apidog_get_endpoint": {
        const result = await getEndpointDetails(args?.pathOrId || "");
        return {
          content: [{ type: "text", text: result }]
        };
      }

      case "apidog_list_endpoints": {
        const result = await listAllEndpoints();
        return {
          content: [{ type: "text", text: result }]
        };
      }

      case "apidog_get_schema": {
        const result = await getSchema(args?.schemaName || "");
        return {
          content: [{ type: "text", text: result }]
        };
      }

      case "apidog_project_info": {
        const result = await getProjectInfo();
        return {
          content: [{ type: "text", text: result }]
        };
      }

      case "apidog_refresh": {
        invalidateCache();
        return {
          content: [{ type: "text", text: JSON.stringify({ success: true, message: "Cache invalidated. Next request will fetch fresh data." }) }]
        };
      }

      // ===== 쓰기 =====
      case "apidog_import_url": {
        const result = await importFromUrl(args?.url);
        return {
          content: [{ type: "text", text: result }]
        };
      }

      case "apidog_add_endpoint": {
        const result = await addEndpoint({
          method: args?.method,
          path: args?.path,
          name: args?.name,
          description: args?.description,
          tags: args?.tags,
          parameters: args?.parameters,
          requestBody: args?.requestBody,
          responses: args?.responses
        });
        return {
          content: [{ type: "text", text: result }]
        };
      }

      case "apidog_add_folder_doc": {
        const result = await addFolderDoc(args?.folderPath, args?.documentation);
        return {
          content: [{ type: "text", text: result }]
        };
      }

      case "apidog_add_schema": {
        const result = await addSchema(args?.name, args?.schema);
        return {
          content: [{ type: "text", text: result }]
        };
      }

      case "apidog_import_spec": {
        const result = await importOpenAPISpec(
          { data: args?.spec },
          {
            endpointOverwriteBehavior: args?.overwriteBehavior || "OVERWRITE_EXISTING",
            schemaOverwriteBehavior: args?.overwriteBehavior || "OVERWRITE_EXISTING"
          }
        );
        return {
          content: [{ type: "text", text: result }]
        };
      }

      // ===== 수정/삭제 =====
      case "apidog_update_endpoint": {
        const result = await updateEndpoint({
          method: args?.method,
          path: args?.path,
          name: args?.name,
          description: args?.description,
          tags: args?.tags,
          parameters: args?.parameters,
          requestBody: args?.requestBody,
          responses: args?.responses
        });
        return {
          content: [{ type: "text", text: result }]
        };
      }

      case "apidog_sync_spec": {
        if (!args?.url && !args?.spec) {
          throw new Error("Either 'url' or 'spec' must be provided");
        }
        const input = args?.url ? { url: args.url } : { data: args.spec };
        const result = await syncWithSpec(input);
        return {
          content: [{ type: "text", text: result }]
        };
      }

      case "apidog_clear_project": {
        if (args?.confirm !== true) {
          throw new Error("You must set 'confirm: true' to clear the project. This action cannot be undone!");
        }
        const result = await clearProject();
        return {
          content: [{ type: "text", text: result }]
        };
      }

      // ===== 삭제 도구 (신규) =====
      case "apidog_list_placeholders": {
        const result = await listPlaceholderEndpoints();
        return {
          content: [{ type: "text", text: result }]
        };
      }

      case "apidog_delete_endpoints": {
        const paths = args?.paths;
        if (!Array.isArray(paths) || paths.length === 0) {
          throw new Error("'paths' must be a non-empty array of endpoint paths to delete");
        }
        const result = await deleteEndpoints(paths, {
          confirm: args?.confirm || false,
          dryRun: args?.dryRun || false,
          preserveSchemas: args?.preserveSchemas !== false // default true
        });
        return {
          content: [{ type: "text", text: result }]
        };
      }

      case "apidog_delete_placeholders": {
        const result = await deletePlaceholderEndpoints({
          confirm: args?.confirm || false,
          dryRun: args?.dryRun || false
        });
        return {
          content: [{ type: "text", text: result }]
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error: any) {
    return {
      content: [{ type: "text", text: JSON.stringify({ error: error.message }) }],
      isError: true
    };
  }
}
