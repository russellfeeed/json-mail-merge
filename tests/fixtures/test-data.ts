/**
 * Test data fixtures for Playwright E2E tests
 * Contains sample JSON templates and CSV data for testing various scenarios
 */

// TypeScript interfaces for test data structures
export interface TestTemplate {
  id: string;
  name: string;
  json: string;
  csv: string;
  expectedOutput: any[];
  description: string;
}

export interface PlaceholderTest {
  placeholder: string;
  csvValue: string;
  expectedResult: string;
  transformation?: string;
}

export interface UserInputTest {
  jsonTemplate: string;
  csvData: string;
  userInputs: Record<string, string>;
  rowInputs: Record<number, Record<string, string>>;
  expectedOutput: any[];
}

// Sample JSON Templates
export const sampleJsonTemplates = {
  simple: `{
  "name": "{{name}}",
  "email": "{{email}}",
  "role": "{{role}}"
}`,

  withPlaceholders: `{
  "id": "{{uuid}}",
  "name": "{{name}}",
  "email": "{{email}}",
  "role": "{{role}}",
  "createdAt": "{{currentDatetime}}",
  "active": true
}`,

  withTransformations: `{
  "name": "{{name}}",
  "nameUpper": "{{name.toUpperCase()}}",
  "nameLower": "{{name.toLowerCase()}}",
  "email": "{{email}}",
  "emailSlug": "{{email.slugify()}}",
  "role": "{{role.capitalize()}}",
  "roleTrim": "{{role.trim()}}"
}`,

  withUserInputs: `{
  "name": "{{name}}",
  "email": "{{email}}",
  "department": "{{userInputText}}",
  "version": {{userInputNumber}}
}`,

  withRowInputs: `{
  "users": [
    {
      "name": "{{name}}",
      "email": "{{email}}",
      "customNote": "{{rowInputText}}",
      "priority": {{rowInputNumber}}
    }
  ]
}`,

  arrayMode: `{
  "generatedAt": "{{currentDatetime}}",
  "users": [
    {
      "id": "{{uuid}}",
      "name": "{{name.titleCase()}}",
      "email": "{{email.toLowerCase()}}",
      "role": "{{role.toUpperCase()}}"
    }
  ]
}`
};

// Sample CSV Data
export const sampleCsvData = {
  simple: `name,email,role
John Smith,john@example.com,Admin
Jane Doe,jane@example.com,Editor
Bob Wilson,bob@example.com,Viewer`,

  withHeaders: `name,email,role,department
John Smith,john@example.com,Admin,Engineering
Jane Doe,jane@example.com,Editor,Marketing
Bob Wilson,bob@example.com,Viewer,Sales`,

  multiRow: `name,email,role
Alice Johnson,alice@example.com,Manager
Bob Smith,bob@example.com,Developer
Carol White,carol@example.com,Designer
David Brown,david@example.com,Analyst
Eve Davis,eve@example.com,Tester`,

  specialChars: `name,email,role
"Smith, John",john@example.com,"Admin, Senior"
Jane "JD" Doe,jane@example.com,Editor
Bob O'Brien,bob@example.com,"Viewer
Multi-line"
José García,jose@example.com,Contributor`,

  singleRow: `name,email,role
John Smith,john@example.com,Admin`,

  emptyValues: `name,email,role
John Smith,john@example.com,
,jane@example.com,Editor
Bob Wilson,,Viewer`
};

// Complete test templates with expected outputs
export const testTemplates: TestTemplate[] = [
  {
    id: 'simple-merge',
    name: 'Simple Merge',
    json: sampleJsonTemplates.simple,
    csv: sampleCsvData.simple,
    expectedOutput: [
      { name: 'John Smith', email: 'john@example.com', role: 'Admin' },
      { name: 'Jane Doe', email: 'jane@example.com', role: 'Editor' },
      { name: 'Bob Wilson', email: 'bob@example.com', role: 'Viewer' }
    ],
    description: 'Basic merge with simple placeholders'
  },
  {
    id: 'with-transformations',
    name: 'With Transformations',
    json: sampleJsonTemplates.withTransformations,
    csv: sampleCsvData.simple,
    expectedOutput: [
      {
        name: 'John Smith',
        nameUpper: 'JOHN SMITH',
        nameLower: 'john smith',
        email: 'john@example.com',
        emailSlug: 'john-example-com',
        role: 'Admin',
        roleTrim: 'Admin'
      }
    ],
    description: 'Merge with transformation methods'
  }
];

// Placeholder transformation test cases
export const placeholderTests: PlaceholderTest[] = [
  {
    placeholder: 'name.toUpperCase()',
    csvValue: 'John Smith',
    expectedResult: 'JOHN SMITH',
    transformation: 'toUpperCase'
  },
  {
    placeholder: 'name.toLowerCase()',
    csvValue: 'John Smith',
    expectedResult: 'john smith',
    transformation: 'toLowerCase'
  },
  {
    placeholder: 'name.trim()',
    csvValue: '  John Smith  ',
    expectedResult: 'John Smith',
    transformation: 'trim'
  },
  {
    placeholder: 'name.capitalize()',
    csvValue: 'john smith',
    expectedResult: 'John smith',
    transformation: 'capitalize'
  },
  {
    placeholder: 'email.slugify()',
    csvValue: 'john@example.com',
    expectedResult: 'john-example-com',
    transformation: 'slugify'
  },
  {
    placeholder: 'name.titleCase()',
    csvValue: 'john smith',
    expectedResult: 'John Smith',
    transformation: 'titleCase'
  }
];

// User input test scenarios
export const userInputTests: UserInputTest[] = [
  {
    jsonTemplate: sampleJsonTemplates.withUserInputs,
    csvData: sampleCsvData.simple,
    userInputs: {
      userInputText: 'Engineering',
      userInputNumber: '42'
    },
    rowInputs: {},
    expectedOutput: [
      {
        name: 'John Smith',
        email: 'john@example.com',
        department: 'Engineering',
        version: 42
      },
      {
        name: 'Jane Doe',
        email: 'jane@example.com',
        department: 'Engineering',
        version: 42
      },
      {
        name: 'Bob Wilson',
        email: 'bob@example.com',
        department: 'Engineering',
        version: 42
      }
    ]
  }
];

// Row input test scenarios
export const rowInputTests: UserInputTest[] = [
  {
    jsonTemplate: sampleJsonTemplates.withRowInputs,
    csvData: sampleCsvData.simple,
    userInputs: {},
    rowInputs: {
      0: { rowInputText: 'First user note', rowInputNumber: '1' },
      1: { rowInputText: 'Second user note', rowInputNumber: '2' },
      2: { rowInputText: 'Third user note', rowInputNumber: '3' }
    },
    expectedOutput: [
      {
        users: [
          {
            name: 'John Smith',
            email: 'john@example.com',
            customNote: 'First user note',
            priority: 1
          }
        ]
      }
    ]
  }
];

// Invalid JSON examples for error testing
export const invalidJsonExamples = [
  '{ "name": "test" ',  // Missing closing brace
  '{ "name": "test", }',  // Trailing comma
  '{ name: "test" }',  // Unquoted key
  '{ "name": \'test\' }',  // Single quotes
  '{ "name": undefined }',  // Undefined value
  'not json at all',  // Plain text
  '',  // Empty string
];

// Valid JSON examples for validation testing
export const validJsonExamples = [
  '{ "name": "test" }',
  '{ "name": "test", "email": "test@example.com" }',
  '{ "users": [{ "name": "test" }] }',
  '{\n  "name": "test"\n}',
  '{"name":"test"}',  // No spaces
];

// CSV with various edge cases
export const edgeCaseCsv = {
  emptyFile: '',
  headersOnly: 'name,email,role',
  noHeaders: 'John Smith,john@example.com,Admin',
  mismatchedColumns: `name,email
John Smith,john@example.com,Admin
Jane Doe,jane@example.com`,
  unicodeChars: `name,email,role
José García,jose@example.com,Admin
李明,liming@example.com,Editor
Müller,muller@example.com,Viewer`,
  largeValues: `name,email,role
${'A'.repeat(1000)},${'test@example.com'},Admin`
};

// System placeholder examples
export const systemPlaceholders = [
  'uuid',
  'currentDatetime',
  'currentDate',
  'currentTime',
  'timestamp'
];

// Helper function to generate large CSV for performance testing
export function generateLargeCsv(rows: number): string {
  const headers = 'name,email,role';
  const dataRows = Array.from({ length: rows }, (_, i) => 
    `User ${i + 1},user${i + 1}@example.com,Role ${i % 5}`
  );
  return [headers, ...dataRows].join('\n');
}

// Helper function to create CSV from object array
export function createCsvFromObjects(objects: Record<string, string>[]): string {
  if (objects.length === 0) return '';
  const headers = Object.keys(objects[0]);
  const rows = objects.map(obj => headers.map(h => obj[h] || '').join(','));
  return [headers.join(','), ...rows].join('\n');
}
