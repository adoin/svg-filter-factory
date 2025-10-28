/**
 * SVG Filter Factory Core Library
 * 
 * This library provides utilities for registering and applying SVG filters
 * Uses localStorage for persistence with prefix '__svg_filter_factory'
 */

const STORAGE_PREFIX = '__svg_filter_factory';

// SVG Filter Types based on the 17 primitive types
export type FilterType = 
  | 'feGaussianBlur'
  | 'feDropShadow'
  | 'feMorphology'
  | 'feDisplacementMap'
  | 'feBlend'
  | 'feColorMatrix'
  | 'feConvolveMatrix'
  | 'feComponentTransfer'
  | 'feSpecularLighting'
  | 'feDiffuseLighting'
  | 'feFlood'
  | 'feTurbulence'
  | 'feImage'
  | 'feTile'
  | 'feOffset'
  | 'feComposite'
  | 'feMerge';

// Filter configuration interfaces for each type
export interface GaussianBlurProps {
  stdDeviation?: number | string;  // 支持 "2,2" 格式
  edgeMode?: 'duplicate' | 'wrap' | 'none';
}

export interface DropShadowProps {
  dx?: number;
  dy?: number;
  stdDeviation?: number | string;  // 支持单个值或 "x,y" 格式
  floodColor?: string;
  floodOpacity?: number;
}

export interface MorphologyProps {
  operator?: 'erode' | 'dilate';
  radius?: number | string;  // 支持单个值或 "x,y" 格式
}

export interface DisplacementMapProps {
  scale?: number;
  xChannelSelector?: 'R' | 'G' | 'B' | 'A';
  yChannelSelector?: 'R' | 'G' | 'B' | 'A';
  in2?: string;
}

export interface BlendProps {
  mode?: 'normal' | 'multiply' | 'screen' | 'darken' | 'lighten' | 'color-dodge' | 'color-burn' | 'hard-light' | 'soft-light' | 'difference' | 'exclusion';
  in?: string;
  in2?: string;
}

export interface ColorMatrixProps {
  type?: 'matrix' | 'saturate' | 'hueRotate' | 'luminanceToAlpha';
  values?: string;
}

export interface ConvolveMatrixProps {
  order?: number;
  kernelMatrix?: string;
  bias?: number;
  edgeMode?: 'duplicate' | 'wrap' | 'none';
}

export interface ComponentTransferProps {
  funcR?: { type: 'identity' | 'table' | 'discrete' | 'linear' | 'gamma'; values?: string };
  funcG?: { type: 'identity' | 'table' | 'discrete' | 'linear' | 'gamma'; values?: string };
  funcB?: { type: 'identity' | 'table' | 'discrete' | 'linear' | 'gamma'; values?: string };
  funcA?: { type: 'identity' | 'table' | 'discrete' | 'linear' | 'gamma'; values?: string };
}

export interface SpecularLightingProps {
  surfaceScale?: number;
  specularConstant?: number;
  specularExponent?: number;
  lightingColor?: string;
}

export interface DiffuseLightingProps {
  surfaceScale?: number;
  diffuseConstant?: number;
  lightingColor?: string;
}

export interface FloodProps {
  floodColor?: string;
  floodOpacity?: number;
}

export interface TurbulenceProps {
  type?: 'fractalNoise' | 'turbulence';
  baseFrequency?: number;
  numOctaves?: number;
  seed?: number;
  stitchTiles?: 'stitch' | 'noStitch';
}

export interface ImageProps {
  href?: string;
  preserveAspectRatio?: string;
}

export interface OffsetProps {
  dx?: number;
  dy?: number;
}

export interface CompositeProps {
  operator?: 'over' | 'in' | 'out' | 'atop' | 'xor' | 'lighter' | 'arithmetic';
  in?: string;
  in2?: string;
  k1?: number;
  k2?: number;
  k3?: number;
  k4?: number;
}

export interface MergeProps {
  inputs?: string[];
}

export interface TileProps {
  in?: string;
}

// Union type for all filter props
export type FilterProps = 
  | GaussianBlurProps
  | DropShadowProps
  | MorphologyProps
  | DisplacementMapProps
  | BlendProps
  | ColorMatrixProps
  | ConvolveMatrixProps
  | ComponentTransferProps
  | SpecularLightingProps
  | DiffuseLightingProps
  | FloodProps
  | TurbulenceProps
  | ImageProps
  | OffsetProps
  | CompositeProps
  | MergeProps
  | TileProps;

// 单个子过滤器配置
export interface SubFilter {
  type: FilterType;
  props?: FilterProps;
  result?: string;  // 可选的输出结果名称，用于在其他过滤器中引用
  in?: string;      // 可选的输入源
}

// 完整的过滤器定义
export interface FilterDefinition {
  id: string;
  config: SubFilter[];
}

// Storage utilities - 每个filter ID对应独立的storage key
function getStorageKey(filterId: string): string {
  return `${STORAGE_PREFIX}_${filterId}`;
}

function saveFilterConfig(filterId: string, config: SubFilter[]): void {
  try {
    localStorage.setItem(getStorageKey(filterId), JSON.stringify(config));
  } catch (error) {
    console.warn(`Failed to save filter config for ${filterId}:`, error);
  }
}

function loadFilterConfig(filterId: string): SubFilter[] | null {
  try {
    const data = localStorage.getItem(getStorageKey(filterId));
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.warn(`Failed to load filter config for ${filterId}:`, error);
    return null;
  }
}

function removeFilterConfig(filterId: string): void {
  try {
    localStorage.removeItem(getStorageKey(filterId));
  } catch (error) {
    console.warn(`Failed to remove filter config for ${filterId}:`, error);
  }
}

// Generate single sub-filter element
function generateSubFilterElement(subFilter: SubFilter): string {
  const { type, props = {}, result, in: inputSource } = subFilter;
  
  // Common attributes
  const commonAttrs: string[] = [];
  if (result) commonAttrs.push(`result="${result}"`);
  if (inputSource) commonAttrs.push(`in="${inputSource}"`);
  const common = commonAttrs.length > 0 ? ' ' + commonAttrs.join(' ') : '';
  
  // Default filter region attributes (used by most filters)
  const defaultRegion = 'x="0%" y="0%" width="100%" height="100%"';
  const defaultIn = inputSource || 'SourceGraphic';
  
  switch (type) {
    case 'feGaussianBlur': {
      const p = props as GaussianBlurProps;
      const stdDev = p.stdDeviation || '2,2';
      return `<feGaussianBlur ${defaultRegion} in="${defaultIn}" stdDeviation="${stdDev}" edgeMode="none"${result ? ` result="${result}"` : ''} />`;
    }
    
    case 'feDropShadow': {
      const p = props as DropShadowProps;
      const stdDev = p.stdDeviation || '2,2';
      return `<feDropShadow ${defaultRegion} in="${defaultIn}" dx="${p.dx || 2}" dy="${p.dy || 2}" stdDeviation="${stdDev}" flood-color="${p.floodColor || '#000000'}" flood-opacity="${p.floodOpacity || 1}"${result ? ` result="${result}"` : ''} />`;
    }
    
    case 'feMorphology': {
      const p = props as MorphologyProps;
      const radius = p.radius || '0,0';
      return `<feMorphology ${defaultRegion} in="${defaultIn}" operator="${p.operator || 'erode'}" radius="${radius}"${result ? ` result="${result}"` : ''} />`;
    }
    
    case 'feDisplacementMap': {
      const p = props as DisplacementMapProps;
      const in2 = p.in2 || 'SourceGraphic';
      return `<feDisplacementMap ${defaultRegion} in="${defaultIn}" in2="${in2}" scale="${p.scale || 0}" xChannelSelector="${p.xChannelSelector || 'R'}" yChannelSelector="${p.yChannelSelector || 'R'}"${result ? ` result="${result}"` : ''} />`;
    }
    
    case 'feBlend': {
      const p = props as BlendProps;
      const in1 = p.in || defaultIn;
      const in2 = p.in2 || 'SourceGraphic';
      return `<feBlend ${defaultRegion} mode="${p.mode || 'normal'}" in="${in1}" in2="${in2}"${result ? ` result="${result}"` : ''} />`;
    }
    
    case 'feColorMatrix': {
      const p = props as ColorMatrixProps;
      // 将换行符替换为空格，用于matrix类型
      const values = (p.values || '1').replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
      return `<feColorMatrix ${defaultRegion} in="${defaultIn}" type="${p.type || 'saturate'}" values="${values}"${result ? ` result="${result}"` : ''} />`;
    }
    
    case 'feConvolveMatrix': {
      const p = props as ConvolveMatrixProps;
      return `<feConvolveMatrix ${defaultRegion} in="${defaultIn}" order="${p.order || 3}" kernelMatrix="${p.kernelMatrix || '1 0 0 0 1 0 0 0 1'}" bias="${p.bias || 0}" edgeMode="${p.edgeMode || 'duplicate'}"${result ? ` result="${result}"` : ''} />`;
    }
    
    case 'feComponentTransfer': {
      const p = props as ComponentTransferProps;
      let content = `<feComponentTransfer${common}>`;
      if (p.funcR) content += `<feFuncR type="${p.funcR.type}"${p.funcR.values ? ` values="${p.funcR.values}"` : ''} />`;
      if (p.funcG) content += `<feFuncG type="${p.funcG.type}"${p.funcG.values ? ` values="${p.funcG.values}"` : ''} />`;
      if (p.funcB) content += `<feFuncB type="${p.funcB.type}"${p.funcB.values ? ` values="${p.funcB.values}"` : ''} />`;
      if (p.funcA) content += `<feFuncA type="${p.funcA.type}"${p.funcA.values ? ` values="${p.funcA.values}"` : ''} />`;
      content += '</feComponentTransfer>';
      return content;
    }
    
    case 'feSpecularLighting': {
      const p = props as SpecularLightingProps;
      return `<feSpecularLighting surfaceScale="${p.surfaceScale || 1}" specularConstant="${p.specularConstant || 1}" specularExponent="${p.specularExponent || 1}" lighting-color="${p.lightingColor || 'white'}"${common} />`;
    }
    
    case 'feDiffuseLighting': {
      const p = props as DiffuseLightingProps;
      return `<feDiffuseLighting surfaceScale="${p.surfaceScale || 1}" diffuseConstant="${p.diffuseConstant || 1}" lighting-color="${p.lightingColor || 'white'}"${common} />`;
    }
    
    case 'feFlood': {
      const p = props as FloodProps;
      return `<feFlood ${defaultRegion} flood-color="${p.floodColor || '#000000'}" flood-opacity="${p.floodOpacity || 1}"${result ? ` result="${result}"` : ''} />`;
    }
    
    case 'feTurbulence': {
      const p = props as TurbulenceProps;
      return `<feTurbulence ${defaultRegion} type="${p.type || 'fractalNoise'}" baseFrequency="${p.baseFrequency || 0.05}" numOctaves="${p.numOctaves || 1}" seed="${p.seed || 0}" stitchTiles="${p.stitchTiles || 'noStitch'}"${result ? ` result="${result}"` : ''} />`;
    }
    
    case 'feImage': {
      const p = props as ImageProps;
      return `<feImage ${defaultRegion} href="${p.href || ''}" preserveAspectRatio="${p.preserveAspectRatio || 'xMidYMid meet'}"${result ? ` result="${result}"` : ''} />`;
    }
    
    case 'feTile': {
      const p = props as TileProps;
      return `<feTile ${defaultRegion} in="${defaultIn}"${result ? ` result="${result}"` : ''} />`;
    }
    
    case 'feOffset': {
      const p = props as OffsetProps;
      return `<feOffset ${defaultRegion} in="${defaultIn}" dx="${p.dx || 0}" dy="${p.dy || 0}"${result ? ` result="${result}"` : ''} />`;
    }
    
    case 'feComposite': {
      const p = props as CompositeProps;
      const in1 = p.in || defaultIn;
      const in2 = p.in2 || 'SourceGraphic';
      let attrs = `${defaultRegion} operator="${p.operator || 'over'}" in="${in1}" in2="${in2}"`;
      if (p.operator === 'arithmetic') {
        attrs += ` k1="${p.k1 || 0}" k2="${p.k2 || 0}" k3="${p.k3 || 0}" k4="${p.k4 || 0}"`;
      }
      return `<feComposite ${attrs}${result ? ` result="${result}"` : ''} />`;
    }
    
    case 'feMerge': {
      const p = props as MergeProps;
      let content = `<feMerge ${defaultRegion}${result ? ` result="${result}"` : ''}>`;
      if (p.inputs && p.inputs.length > 0) {
        p.inputs.forEach(input => {
          content += `<feMergeNode in="${input}" />`;
        });
      } else {
        content += `<feMergeNode in="${defaultIn}" />`;
      }
      content += '</feMerge>';
      return content;
    }
    
    default:
      return '';
  }
}

// Generate complete filter with multiple sub-filters
function generateFilterElement(filter: FilterDefinition): string {
  return filter.config.map(subFilter => generateSubFilterElement(subFilter)).join('\n');
}

/**
 * Register one or more SVG filters
 * @param filters - Filter definition(s) or a single filter definition
 */
export function register(filters: FilterDefinition | FilterDefinition[]): void {
  const filterArray = Array.isArray(filters) ? filters : [filters];
  
  filterArray.forEach(filter => {
    saveFilterConfig(filter.id, filter.config);
  });
}

// 获取或创建SVG容器
function getOrCreateSvgContainer(): SVGDefsElement {
  let svgContainer = document.getElementById('__svg_filter_factory_container');
  if (!svgContainer) {
    svgContainer = document.createElement('div');
    svgContainer.id = '__svg_filter_factory_container';
    svgContainer.style.display = 'none';
    document.body.appendChild(svgContainer);
  }
  
  let svgDefs = document.getElementById('__svg_filter_factory_defs') as SVGDefsElement | null;
  if (!svgDefs) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.id = '__svg_filter_factory_defs';
    svg.style.position = 'absolute';
    svg.style.width = '0';
    svg.style.height = '0';
    svg.style.visibility = 'hidden';
    
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    defs.id = '__svg_filter_factory_defs';
    svg.appendChild(defs);
    svgContainer.appendChild(svg);
    svgDefs = defs;
  }
  
  return svgDefs;
}

/**
 * Render specific filter(s) by ID to the DOM
 * @param filterIds - Single filter ID or array of filter IDs to render
 */
export function render(filterIds: string | string[]): void {
  const ids = Array.isArray(filterIds) ? filterIds : [filterIds];
  const svgDefs = getOrCreateSvgContainer();
  
  ids.forEach(filterId => {
    // 检查是否已渲染
    const existingFilter = document.getElementById(filterId);
    if (existingFilter && existingFilter.parentElement?.id === '__svg_filter_factory_defs') {
      console.log(`Filter "${filterId}" already rendered, skipping.`);
      return;
    }
    
    // 从localStorage加载配置
    const config = loadFilterConfig(filterId);
    if (!config) {
      console.error(`Filter "${filterId}" not found in localStorage. Please register it first.`);
      return;
    }
    
    // 创建filter元素
    const filterElement = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
    filterElement.id = filterId;
    filterElement.innerHTML = generateFilterElement({ id: filterId, config });
    svgDefs.appendChild(filterElement);
    
    console.log(`Filter "${filterId}" rendered successfully.`);
  });
}

/**
 * Get all registered filters from localStorage
 */
export function getRegisteredFilters(): FilterDefinition[] {
  const filters: FilterDefinition[] = [];
  const prefix = STORAGE_PREFIX + '_';
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(prefix)) {
      const filterId = key.substring(prefix.length);
      const config = loadFilterConfig(filterId);
      if (config) {
        filters.push({ id: filterId, config });
      }
    }
  }
  
  return filters;
}

/**
 * Get a specific filter configuration
 * @param filterId - ID of the filter to get
 */
export function getFilter(filterId: string): FilterDefinition | null {
  const config = loadFilterConfig(filterId);
  return config ? { id: filterId, config } : null;
}

/**
 * Check if a filter is registered
 * @param filterId - ID of the filter to check
 */
export function isRegistered(filterId: string): boolean {
  return loadFilterConfig(filterId) !== null;
}

/**
 * Unregister a specific filter
 * @param filterId - ID of the filter to unregister
 */
export function unregister(filterId: string): void {
  removeFilterConfig(filterId);
  
  // Remove from DOM if rendered
  const filterElement = document.getElementById(filterId);
  if (filterElement) {
    filterElement.remove();
  }
}

/**
 * Clear all registered filters
 */
export function clearFilters(): void {
  const filters = getRegisteredFilters();
  filters.forEach(filter => {
    removeFilterConfig(filter.id);
  });
  
  // Remove rendered SVG container
  const svgContainer = document.getElementById('__svg_filter_factory_container');
  if (svgContainer) {
    svgContainer.remove();
  }
}
