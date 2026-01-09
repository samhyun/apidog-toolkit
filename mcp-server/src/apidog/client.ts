import fetch from "node-fetch";

const BASE_URL = "https://api.apidog.com";
const API_VERSION = "2024-03-28";

interface ApidogConfig {
  accessToken: string;
  projectId?: string;
  oasUrl?: string;
}

interface ApiEndpoint {
  id: string;
  name: string;
  method: string;
  path: string;
  description?: string;
  parameters?: any[];
  requestBody?: any;
  responses?: any;
}

interface ProjectData {
  endpoints: ApiEndpoint[];
  schemas: Record<string, any>;
  info: {
    title: string;
    version: string;
    description?: string;
  };
}

// 캐시된 프로젝트 데이터
let cachedData: ProjectData | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5분

function getConfig(): ApidogConfig {
  const accessToken = process.env.APIDOG_ACCESS_TOKEN || process.env.APIDOG_API_KEY;
  const projectId = process.env.APIDOG_PROJECT_ID;
  const oasUrl = process.env.APIDOG_OAS_URL;

  if (!accessToken && !oasUrl) {
    throw new Error("APIDOG_ACCESS_TOKEN or APIDOG_OAS_URL is required");
  }

  return { accessToken: accessToken || "", projectId, oasUrl };
}

async function fetchFromApidog(
  endpoint: string,
  options?: { method?: string; body?: any }
): Promise<any> {
  const config = getConfig();
  const method = options?.method || "GET";

  const fetchOptions: any = {
    method,
    headers: {
      "Authorization": `Bearer ${config.accessToken}`,
      "X-Apidog-Api-Version": API_VERSION,
      "Content-Type": "application/json"
    }
  };

  if (options?.body) {
    fetchOptions.body = JSON.stringify(options.body);
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, fetchOptions);

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Apidog API error ${res.status}: ${text}`);
  }

  return res.json();
}

async function fetchFromOAS(url: string): Promise<any> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch OAS: ${res.status}`);
  }
  return res.json();
}

function parseOpenAPISpec(spec: any): ProjectData {
  const endpoints: ApiEndpoint[] = [];
  const paths = spec.paths || {};

  for (const [path, methods] of Object.entries(paths)) {
    for (const [method, details] of Object.entries(methods as Record<string, any>)) {
      if (['get', 'post', 'put', 'patch', 'delete', 'options', 'head'].includes(method)) {
        endpoints.push({
          id: details.operationId || `${method}-${path}`,
          name: details.summary || details.operationId || path,
          method: method.toUpperCase(),
          path,
          description: details.description,
          parameters: details.parameters,
          requestBody: details.requestBody,
          responses: details.responses
        });
      }
    }
  }

  return {
    endpoints,
    schemas: spec.components?.schemas || {},
    info: {
      title: spec.info?.title || "API",
      version: spec.info?.version || "1.0.0",
      description: spec.info?.description
    }
  };
}

export async function loadProjectData(): Promise<ProjectData> {
  const now = Date.now();

  // 캐시가 유효하면 반환
  if (cachedData && (now - cacheTimestamp) < CACHE_TTL) {
    return cachedData;
  }

  const config = getConfig();

  let spec: any;

  if (config.oasUrl) {
    // OAS URL에서 직접 로드
    spec = await fetchFromOAS(config.oasUrl);
  } else if (config.projectId) {
    // Apidog 프로젝트에서 로드
    // 공식 API: POST /v1/projects/{projectId}/export-openapi
    spec = await fetchFromApidog(
      `/v1/projects/${config.projectId}/export-openapi`,
      {
        method: "POST",
        body: {
          scope: { type: "ALL" },
          options: {
            includeApidogExtensionProperties: false,
            addFoldersToTags: true
          },
          oasVersion: "3.0",
          exportFormat: "JSON"
        }
      }
    );
  } else {
    throw new Error("Either APIDOG_PROJECT_ID or APIDOG_OAS_URL is required");
  }

  cachedData = parseOpenAPISpec(spec);
  cacheTimestamp = now;

  return cachedData;
}

export async function searchEndpoints(keyword: string, useContext: boolean = false): Promise<string> {
  const data = await loadProjectData();
  const lowerKeyword = keyword.toLowerCase();

  let matches = data.endpoints.filter(ep =>
    ep.name.toLowerCase().includes(lowerKeyword) ||
    ep.path.toLowerCase().includes(lowerKeyword) ||
    ep.description?.toLowerCase().includes(lowerKeyword) ||
    ep.method.toLowerCase().includes(lowerKeyword)
  );

  // 컨텍스트 필터링: 현재 프로젝트 경로에 해당하는 엔드포인트만
  if (useContext && currentContext) {
    const contextPath = currentContext.projectName
      ? `${currentContext.serviceName}/${currentContext.projectName}`
      : currentContext.serviceName;

    matches = matches.filter(ep => {
      // tags 배열에서 컨텍스트 경로로 시작하는 태그 확인
      const tags = (ep as any).tags || [];
      return tags.some((tag: string) => tag.startsWith(contextPath));
    });
  }

  if (matches.length === 0) {
    return JSON.stringify({
      message: "No endpoints found matching the keyword",
      keyword,
      context: useContext ? currentContext : null,
      totalEndpoints: data.endpoints.length
    }, null, 2);
  }

  return JSON.stringify({
    found: matches.length,
    context: useContext ? currentContext : null,
    endpoints: matches.map(ep => ({
      method: ep.method,
      path: ep.path,
      name: ep.name,
      description: ep.description
    }))
  }, null, 2);
}

export async function getEndpointDetails(pathOrId: string): Promise<string> {
  const data = await loadProjectData();

  const endpoint = data.endpoints.find(ep =>
    ep.path === pathOrId || ep.id === pathOrId
  );

  if (!endpoint) {
    return JSON.stringify({
      error: "Endpoint not found",
      searchedFor: pathOrId
    }, null, 2);
  }

  return JSON.stringify(endpoint, null, 2);
}

export async function listAllEndpoints(): Promise<string> {
  const data = await loadProjectData();

  return JSON.stringify({
    projectInfo: data.info,
    totalEndpoints: data.endpoints.length,
    endpoints: data.endpoints.map(ep => ({
      method: ep.method,
      path: ep.path,
      name: ep.name
    }))
  }, null, 2);
}

export async function getSchema(schemaName: string): Promise<string> {
  const data = await loadProjectData();

  const schema = data.schemas[schemaName];
  if (!schema) {
    const available = Object.keys(data.schemas);
    return JSON.stringify({
      error: "Schema not found",
      searchedFor: schemaName,
      availableSchemas: available.slice(0, 20),
      totalSchemas: available.length
    }, null, 2);
  }

  return JSON.stringify({ name: schemaName, schema }, null, 2);
}

export async function getProjectInfo(): Promise<string> {
  const data = await loadProjectData();

  return JSON.stringify({
    ...data.info,
    totalEndpoints: data.endpoints.length,
    totalSchemas: Object.keys(data.schemas).length,
    endpointsByMethod: data.endpoints.reduce((acc, ep) => {
      acc[ep.method] = (acc[ep.method] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  }, null, 2);
}

// 캐시 무효화
export function invalidateCache(): void {
  cachedData = null;
  cacheTimestamp = 0;
}

// ============================================
// 쓰기 API (Write Operations)
// ============================================

type OverwriteBehavior = "OVERWRITE_EXISTING" | "AUTO_MERGE" | "KEEP_EXISTING" | "CREATE_NEW";

// ============================================
// 프로젝트 컨텍스트 (폴더 규칙)
// ============================================

interface ProjectContext {
  serviceName: string;      // 예: "aura-assistant"
  projectName?: string;     // 예: "backend", "frontend"
  description?: string;     // 폴더 문서 (마크다운)
}

// Tag 타입: 문자열 또는 description 포함 객체
type TagInput = string | { name: string; description?: string };

interface TagObject {
  name: string;
  description?: string;
}

let currentContext: ProjectContext | null = null;

/**
 * 현재 프로젝트 컨텍스트 설정
 * 이후 모든 엔드포인트/스키마 작업에 자동 적용
 */
export async function setProjectContext(context: ProjectContext | null): Promise<string> {
  currentContext = context;
  if (context) {
    const folderPath = context.projectName
      ? `${context.serviceName}/${context.projectName}`
      : context.serviceName;

    // description이 있으면 폴더 문서도 생성
    let folderDocResult = null;
    if (context.description) {
      try {
        folderDocResult = await addFolderDoc(folderPath, context.description);
      } catch (e: any) {
        folderDocResult = { error: e.message };
      }
    }

    return JSON.stringify({
      success: true,
      message: `Project context set: ${folderPath}`,
      context,
      folderDocResult
    }, null, 2);
  } else {
    return JSON.stringify({
      success: true,
      message: "Project context cleared"
    }, null, 2);
  }
}

/**
 * 현재 프로젝트 컨텍스트 조회
 */
export function getProjectContext(): string {
  return JSON.stringify({
    context: currentContext,
    folderPath: currentContext
      ? `${currentContext.serviceName}${currentContext.projectName ? '/' + currentContext.projectName : ''}`
      : null
  }, null, 2);
}

/**
 * TagInput을 TagObject로 정규화
 */
function normalizeTag(tag: TagInput): TagObject {
  if (typeof tag === 'string') {
    return { name: tag };
  }
  return tag;
}

/**
 * 컨텍스트 기반 태그 생성
 * 기존 태그 앞에 프로젝트 경로 태그를 추가
 * @returns { tagNames: string[], tagObjects: TagObject[] }
 */
function applyContextToTags(tags?: TagInput[]): { tagNames: string[]; tagObjects: TagObject[] } {
  const normalizedTags = (tags || []).map(normalizeTag);

  if (!currentContext) {
    return {
      tagNames: normalizedTags.map(t => t.name),
      tagObjects: normalizedTags
    };
  }

  const contextPath = currentContext.projectName
    ? `${currentContext.serviceName}/${currentContext.projectName}`
    : currentContext.serviceName;

  // 첫 번째 태그로 컨텍스트 경로 추가 (중첩 폴더 생성)
  const contextTag: TagObject = { name: contextPath };
  const allTags = [contextTag, ...normalizedTags];

  return {
    tagNames: allTags.map(t => t.name),
    tagObjects: allTags
  };
}

interface ImportOptions {
  targetEndpointFolderId?: number;
  targetSchemaFolderId?: number;
  endpointOverwriteBehavior?: OverwriteBehavior;
  schemaOverwriteBehavior?: OverwriteBehavior;
  updateFolderOfChangedEndpoint?: boolean;
  prependBasePath?: boolean;
  targetBranchId?: number;
  moduleId?: number;
  deleteUnmatchedResources?: boolean; // 동기화 시 프로젝트에만 있는 리소스 삭제
}

interface ImportInput {
  url?: string;
  data?: any; // OpenAPI spec object
}

async function postToApidog(endpoint: string, body: any): Promise<any> {
  const config = getConfig();

  if (!config.accessToken) {
    throw new Error("APIDOG_ACCESS_TOKEN is required for write operations");
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${config.accessToken}`,
      "X-Apidog-Api-Version": API_VERSION,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Apidog API error ${res.status}: ${text}`);
  }

  return res.json();
}

/**
 * OpenAPI/Swagger 스펙을 Apidog 프로젝트에 임포트
 */
export async function importOpenAPISpec(
  input: ImportInput,
  options?: ImportOptions
): Promise<string> {
  const config = getConfig();

  if (!config.projectId) {
    throw new Error("APIDOG_PROJECT_ID is required for import operations");
  }

  // Apidog API expects JSON data as a string, not as an object
  const inputValue = input.url
    ? { url: input.url }
    : JSON.stringify(input.data);

  const body: Record<string, any> = {
    input: inputValue,
    options: {
      targetEndpointFolderId: options?.targetEndpointFolderId ?? 0,
      targetSchemaFolderId: options?.targetSchemaFolderId ?? 0,
      endpointOverwriteBehavior: options?.endpointOverwriteBehavior ?? "OVERWRITE_EXISTING",
      schemaOverwriteBehavior: options?.schemaOverwriteBehavior ?? "OVERWRITE_EXISTING",
      updateFolderOfChangedEndpoint: options?.updateFolderOfChangedEndpoint ?? false,
      prependBasePath: options?.prependBasePath ?? false,
      deleteUnmatchedResources: options?.deleteUnmatchedResources ?? false
    }
  };

  // 선택적 옵션 추가
  if (options?.targetBranchId) {
    body.options.targetBranchId = options.targetBranchId;
  }
  if (options?.moduleId) {
    body.options.moduleId = options.moduleId;
  }

  const result = await postToApidog(
    `/v1/projects/${config.projectId}/import-openapi?locale=en-US`,
    body
  );

  // 캐시 무효화 (새 데이터가 추가됨)
  invalidateCache();

  return JSON.stringify({
    success: true,
    message: "OpenAPI specification imported successfully",
    result
  }, null, 2);
}

/**
 * 단일 API 엔드포인트 추가
 * tags는 문자열 또는 { name, description } 객체 배열
 * description이 있는 태그는 폴더 문서로 생성됨
 */
export async function addEndpoint(endpoint: {
  method: string;
  path: string;
  name: string;
  description?: string;
  tags?: TagInput[];
  parameters?: any[];
  requestBody?: any;
  responses?: any;
}): Promise<string> {
  // 컨텍스트 적용 및 태그 정규화
  const { tagNames, tagObjects } = applyContextToTags(endpoint.tags);

  // description이 있는 태그들만 tags 섹션에 포함
  const tagsWithDescription = tagObjects.filter(t => t.description);

  // OpenAPI 형식으로 변환
  const spec: any = {
    openapi: "3.0.0",
    info: {
      title: "API Import",
      version: "1.0.0"
    },
    paths: {
      [endpoint.path]: {
        [endpoint.method.toLowerCase()]: {
          summary: endpoint.name,
          description: endpoint.description,
          tags: tagNames, // 태그 이름 배열
          parameters: endpoint.parameters,
          requestBody: endpoint.requestBody,
          responses: endpoint.responses || {
            "200": { description: "Successful response" }
          }
        }
      }
    }
  };

  // 태그에 description이 있으면 tags 섹션 추가 (폴더 문서)
  if (tagsWithDescription.length > 0) {
    spec.tags = tagsWithDescription;
  }

  return importOpenAPISpec({ data: spec }, {
    endpointOverwriteBehavior: "OVERWRITE_EXISTING"
  });
}

/**
 * 스키마/모델 추가
 */
export async function addSchema(
  name: string,
  schema: any
): Promise<string> {
  const spec = {
    openapi: "3.0.0",
    info: {
      title: "Schema Import",
      version: "1.0.0"
    },
    paths: {},
    components: {
      schemas: {
        [name]: schema
      }
    }
  };

  return importOpenAPISpec({ data: spec }, {
    schemaOverwriteBehavior: "OVERWRITE_EXISTING"
  });
}

/**
 * URL에서 OpenAPI 스펙 임포트
 */
export async function importFromUrl(url: string): Promise<string> {
  return importOpenAPISpec({ url });
}

/**
 * 엔드포인트 업데이트 (AUTO_MERGE 사용)
 */
export async function updateEndpoint(endpoint: {
  method: string;
  path: string;
  name: string;
  description?: string;
  tags?: TagInput[];
  parameters?: any[];
  requestBody?: any;
  responses?: any;
}): Promise<string> {
  // 컨텍스트 적용 및 태그 정규화
  const { tagNames, tagObjects } = applyContextToTags(endpoint.tags);
  const tagsWithDescription = tagObjects.filter(t => t.description);

  const spec: any = {
    openapi: "3.0.0",
    info: {
      title: "API Update",
      version: "1.0.0"
    },
    paths: {
      [endpoint.path]: {
        [endpoint.method.toLowerCase()]: {
          summary: endpoint.name,
          description: endpoint.description,
          tags: tagNames, // 컨텍스트 자동 적용
          parameters: endpoint.parameters,
          requestBody: endpoint.requestBody,
          responses: endpoint.responses || {
            "200": { description: "Successful response" }
          }
        }
      }
    }
  };

  // 태그에 description이 있으면 tags 섹션 추가 (폴더 문서)
  if (tagsWithDescription.length > 0) {
    spec.tags = tagsWithDescription;
  }

  return importOpenAPISpec({ data: spec }, {
    endpointOverwriteBehavior: "AUTO_MERGE"
  });
}

/**
 * OpenAPI 스펙과 동기화 (프로젝트에만 있는 리소스 삭제)
 */
export async function syncWithSpec(
  input: ImportInput,
  options?: Omit<ImportOptions, 'deleteUnmatchedResources'>
): Promise<string> {
  return importOpenAPISpec(input, {
    ...options,
    deleteUnmatchedResources: true
  });
}

/**
 * 프로젝트 초기화 (모든 엔드포인트/스키마 삭제)
 * 빈 스펙을 동기화하여 모든 리소스 삭제
 */
export async function clearProject(): Promise<string> {
  const emptySpec = {
    openapi: "3.0.0",
    info: {
      title: "Empty",
      version: "1.0.0"
    },
    paths: {}
  };

  return importOpenAPISpec({ data: emptySpec }, {
    deleteUnmatchedResources: true
  });
}

/**
 * @deprecated 이 함수는 더미 엔드포인트를 생성하므로 권장하지 않습니다.
 * 대신 addEndpoint의 tags에 description을 포함하여 폴더 문서를 추가하세요.
 *
 * 폴더 문서 추가/업데이트
 * 엔드포인트 없이 폴더와 문서만 생성
 *
 * @param folderPath 폴더 경로 (예: "Users", "aura-assistant/backend/Users")
 * @param documentation 마크다운 문서 내용
 */
export async function addFolderDoc(
  folderPath: string,
  documentation: string
): Promise<string> {
  // 컨텍스트가 있으면 폴더 경로에 적용
  let fullPath = folderPath;
  if (currentContext) {
    const contextPath = currentContext.projectName
      ? `${currentContext.serviceName}/${currentContext.projectName}`
      : currentContext.serviceName;

    // 이미 컨텍스트 경로로 시작하지 않으면 추가
    if (!folderPath.startsWith(contextPath)) {
      fullPath = `${contextPath}/${folderPath}`;
    }
  }

  // OpenAPI tags 섹션으로 폴더 문서 생성
  // paths가 비어있으면 tags만 import되지 않으므로 더미 엔드포인트 필요
  // 대신 info.description에 넣거나, 기존 엔드포인트와 함께 사용해야 함

  // 더미 GET 엔드포인트로 태그와 문서 생성
  const dummyPath = `/__docs__/${fullPath.replace(/\//g, '_')}`;

  const spec = {
    openapi: "3.0.0",
    info: {
      title: "Folder Documentation",
      version: "1.0.0"
    },
    tags: [
      {
        name: fullPath,
        description: documentation
      }
    ],
    paths: {
      [dummyPath]: {
        get: {
          summary: `${fullPath} Documentation`,
          description: "This is a placeholder endpoint for folder documentation",
          tags: [fullPath],
          responses: {
            "200": { description: "Documentation placeholder" }
          }
        }
      }
    }
  };

  const result = await importOpenAPISpec({ data: spec }, {
    endpointOverwriteBehavior: "OVERWRITE_EXISTING"
  });

  return JSON.stringify({
    success: true,
    message: `Folder documentation added for: ${fullPath}`,
    warning: "⚠️ DEPRECATED: This creates a placeholder endpoint (/__docs__/...) that cannot be deleted via API. Use apidog_add_endpoint with tag descriptions instead.",
    suggestion: "To add folder docs without placeholders, use: addEndpoint({ ..., tags: [{ name: 'FolderName', description: '# Markdown docs' }] })",
    placeholderPath: dummyPath,
    folderPath: fullPath,
    result: JSON.parse(result)
  }, null, 2);
}

// ============================================
// 삭제 기능 (Delete Operations)
// ============================================

/**
 * 플레이스홀더 엔드포인트 목록 조회
 * /__docs__/ 경로로 시작하는 엔드포인트들을 반환
 */
export async function listPlaceholderEndpoints(): Promise<string> {
  // 최신 데이터 가져오기
  invalidateCache();
  const data = await loadProjectData();

  const placeholders = data.endpoints.filter(ep =>
    ep.path.startsWith('/__docs__/')
  );

  return JSON.stringify({
    found: placeholders.length,
    message: placeholders.length > 0
      ? "These placeholder endpoints were created by addFolderDoc. Delete them via Apidog web UI or use apidog_delete_endpoints."
      : "No placeholder endpoints found.",
    placeholders: placeholders.map(ep => ({
      method: ep.method,
      path: ep.path,
      name: ep.name
    }))
  }, null, 2);
}

/**
 * OpenAPI 스펙을 빌드하는 헬퍼 함수
 */
function buildOpenAPISpec(
  endpoints: ApiEndpoint[],
  schemas: Record<string, any>,
  info?: { title: string; version: string; description?: string }
): any {
  const paths: Record<string, any> = {};

  for (const ep of endpoints) {
    if (!paths[ep.path]) {
      paths[ep.path] = {};
    }
    paths[ep.path][ep.method.toLowerCase()] = {
      summary: ep.name,
      description: ep.description,
      parameters: ep.parameters,
      requestBody: ep.requestBody,
      responses: ep.responses || { "200": { description: "Success" } }
    };
  }

  return {
    openapi: "3.0.0",
    info: info || { title: "API", version: "1.0.0" },
    paths,
    components: {
      schemas
    }
  };
}

export interface DeleteEndpointsOptions {
  confirm: boolean;          // 필수 확인
  preserveSchemas?: boolean; // 스키마 보존 (기본: true)
  dryRun?: boolean;          // 미리보기 모드 (기본: false)
}

/**
 * 특정 엔드포인트들을 삭제 (간접 삭제 - syncWithSpec 기반)
 *
 * ⚠️ 주의: Apidog API는 직접 삭제를 지원하지 않습니다.
 * 이 함수는 삭제 대상을 제외한 스펙으로 동기화하여 간접적으로 삭제합니다.
 *
 * @param pathsToDelete 삭제할 엔드포인트 경로 배열 (예: ["/__docs__/test", "/api/old"])
 * @param options 삭제 옵션
 */
export async function deleteEndpoints(
  pathsToDelete: string[],
  options: DeleteEndpointsOptions
): Promise<string> {
  // 1. confirm 필수 확인
  if (!options.confirm) {
    return JSON.stringify({
      error: "Confirmation required",
      message: "You must set 'confirm: true' to delete endpoints. This action uses sync and may affect other data.",
      hint: "Use 'dryRun: true' first to preview what will be deleted."
    }, null, 2);
  }

  // 2. 캐시 무효화하고 최신 데이터 가져오기
  invalidateCache();
  const data = await loadProjectData();

  // 3. 삭제 대상 찾기
  const toDelete = data.endpoints.filter(ep =>
    pathsToDelete.includes(ep.path)
  );

  if (toDelete.length === 0) {
    return JSON.stringify({
      error: "No matching endpoints found",
      searchedFor: pathsToDelete,
      availableEndpoints: data.endpoints.map(ep => ep.path).slice(0, 20)
    }, null, 2);
  }

  // 4. 유지할 엔드포인트 필터링
  const toKeep = data.endpoints.filter(ep =>
    !pathsToDelete.includes(ep.path)
  );

  // 5. dryRun이면 미리보기만 반환
  if (options.dryRun) {
    return JSON.stringify({
      dryRun: true,
      message: "Preview mode - no changes made",
      willDelete: toDelete.map(ep => ({
        method: ep.method,
        path: ep.path,
        name: ep.name
      })),
      willKeep: {
        count: toKeep.length,
        endpoints: toKeep.map(ep => ({
          method: ep.method,
          path: ep.path,
          name: ep.name
        }))
      },
      schemasPreserved: options.preserveSchemas !== false,
      schemaCount: Object.keys(data.schemas).length
    }, null, 2);
  }

  // 6. 스키마 보존 옵션 (기본: true)
  const schemasToKeep = options.preserveSchemas !== false ? data.schemas : {};

  // 7. 새 스펙 빌드
  const newSpec = buildOpenAPISpec(toKeep, schemasToKeep, data.info);

  // 8. 동기화로 삭제 실행
  const syncResult = await syncWithSpec({ data: newSpec });

  return JSON.stringify({
    success: true,
    message: `Deleted ${toDelete.length} endpoint(s) via sync`,
    deleted: toDelete.map(ep => ({
      method: ep.method,
      path: ep.path,
      name: ep.name
    })),
    kept: toKeep.length,
    schemasPreserved: options.preserveSchemas !== false,
    syncResult: JSON.parse(syncResult)
  }, null, 2);
}

/**
 * 플레이스홀더 엔드포인트만 삭제하는 편의 함수
 */
export async function deletePlaceholderEndpoints(
  options: Omit<DeleteEndpointsOptions, 'confirm'> & { confirm: boolean }
): Promise<string> {
  // 최신 데이터 가져오기
  invalidateCache();
  const data = await loadProjectData();

  // /__docs__/ 경로만 필터링
  const placeholderPaths = data.endpoints
    .filter(ep => ep.path.startsWith('/__docs__/'))
    .map(ep => ep.path);

  if (placeholderPaths.length === 0) {
    return JSON.stringify({
      success: true,
      message: "No placeholder endpoints found to delete"
    }, null, 2);
  }

  return deleteEndpoints(placeholderPaths, {
    ...options,
    preserveSchemas: true // 플레이스홀더 삭제 시 스키마는 항상 보존
  });
}
