export interface PlaceholderMethod {
  name: string;
  description: string;
  apply: (value: string) => string;
}

export const placeholderMethods: Record<string, PlaceholderMethod> = {
  toLowerCase: {
    name: 'toLowerCase()',
    description: 'Convert to lowercase',
    apply: (v) => v.toLowerCase()
  },
  toUpperCase: {
    name: 'toUpperCase()',
    description: 'Convert to uppercase',
    apply: (v) => v.toUpperCase()
  },
  trim: {
    name: 'trim()',
    description: 'Remove whitespace',
    apply: (v) => v.trim()
  },
  capitalize: {
    name: 'capitalize()',
    description: 'Capitalize first letter',
    apply: (v) => v.charAt(0).toUpperCase() + v.slice(1).toLowerCase()
  },
  titleCase: {
    name: 'titleCase()',
    description: 'Capitalize each word',
    apply: (v) => v.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase())
  },
  slugify: {
    name: 'slugify()',
    description: 'Convert to URL slug',
    apply: (v) => v.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '')
  },
  camelCase: {
    name: 'camelCase()',
    description: 'Convert to camelCase',
    apply: (v) => v.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
  },
  snakeCase: {
    name: 'snakeCase()',
    description: 'Convert to snake_case',
    apply: (v) => v.toLowerCase().trim().replace(/[^\w\s]/g, '').replace(/\s+/g, '_')
  },
  reverse: {
    name: 'reverse()',
    description: 'Reverse the string',
    apply: (v) => v.split('').reverse().join('')
  },
  length: {
    name: 'length()',
    description: 'Get string length',
    apply: (v) => v.length.toString()
  }
};

export interface ParsedPlaceholder {
  full: string;
  baseName: string;
  methods: string[];
}

export function parsePlaceholder(placeholder: string): ParsedPlaceholder {
  // Remove {{ and }} if present
  const inner = placeholder.replace(/^\{\{|\}\}$/g, '').trim();
  
  // Match base name and method calls
  const methodRegex = /\.([a-zA-Z]+)\(\)/g;
  const methods: string[] = [];
  let match;
  
  while ((match = methodRegex.exec(inner)) !== null) {
    methods.push(match[1]);
  }
  
  // Get base name (everything before the first dot or the whole string)
  const baseName = inner.split('.')[0].trim();
  
  return {
    full: placeholder,
    baseName,
    methods
  };
}

export function applyMethods(value: string, methods: string[]): string {
  let result = value;
  
  for (const method of methods) {
    const methodDef = placeholderMethods[method];
    if (methodDef) {
      result = methodDef.apply(result);
    }
  }
  
  return result;
}

export function getAvailableMethods(): PlaceholderMethod[] {
  return Object.values(placeholderMethods);
}

export function getMethodNames(): string[] {
  return Object.keys(placeholderMethods);
}
