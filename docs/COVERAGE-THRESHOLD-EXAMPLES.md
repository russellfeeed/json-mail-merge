# Coverage Threshold Configuration Examples

This document provides practical examples for configuring coverage thresholds for different project scenarios and development phases.

## Overview

Coverage thresholds enforce minimum code coverage standards and fail builds when requirements aren't met. This guide shows how to configure thresholds for various scenarios, from new projects to mature codebases.

## Basic Threshold Configurations

### 1. New Project (Permissive)

For new projects where you want to establish coverage without blocking development:

```typescript
// vitest.config.ts
thresholds: {
  global: {
    branches: 0,
    functions: 0,
    lines: 5,
    statements: 5
  }
}
```

**Use Case**: 
- New projects
- Proof of concepts
- Rapid prototyping

**Benefits**:
- Doesn't block development
- Establishes coverage infrastructure
- Provides baseline metrics

### 2. Development Project (Moderate)

For active development with some quality requirements:

```typescript
thresholds: {
  global: {
    branches: 20,
    functions: 30,
    lines: 40,
    statements: 40
  }
}
```

**Use Case**:
- Active development projects
- Teams learning testing practices
- Gradual quality improvement

**Benefits**:
- Encourages testing habits
- Prevents major coverage regressions
- Balances quality with velocity

### 3. Production Project (Strict)

For production-ready applications with high quality standards:

```typescript
thresholds: {
  global: {
    branches: 70,
    functions: 80,
    lines: 85,
    statements: 85
  }
}
```

**Use Case**:
- Production applications
- Critical business systems
- Mature codebases

**Benefits**:
- Ensures high code quality
- Reduces production bugs
- Maintains testing discipline

## Pattern-Based Threshold Examples

### 1. Layered Architecture Thresholds

Different standards for different architectural layers:

```typescript
thresholds: {
  // Global baseline
  global: {
    branches: 30,
    functions: 40,
    lines: 50,
    statements: 50
  },
  
  // Business logic - highest standards
  'src/lib/**/*.ts': {
    branches: 80,
    functions: 90,
    lines: 95,
    statements: 95
  },
  
  // Services - high standards
  'src/services/**/*.ts': {
    branches: 70,
    functions: 80,
    lines: 85,
    statements: 85
  },
  
  // Components - moderate standards
  'src/components/**/*.tsx': {
    branches: 50,
    functions: 60,
    lines: 65,
    statements: 65
  },
  
  // Pages - lower standards (mostly integration)
  'src/pages/**/*.tsx': {
    branches: 30,
    functions: 40,
    lines: 45,
    statements: 45
  },
  
  // Configuration - minimal standards
  'src/config/**/*.ts': {
    branches: 10,
    functions: 20,
    lines: 25,
    statements: 25
  }
}
```

### 2. Feature-Based Thresholds

Different standards based on feature criticality:

```typescript
thresholds: {
  global: {
    branches: 40,
    functions: 50,
    lines: 60,
    statements: 60
  },
  
  // Critical features - payment, authentication
  'src/**/payment/**/*.ts': {
    branches: 90,
    functions: 95,
    lines: 98,
    statements: 98
  },
  
  'src/**/auth/**/*.ts': {
    branches: 85,
    functions: 90,
    lines: 95,
    statements: 95
  },
  
  // Important features - user management, data processing
  'src/**/user/**/*.ts': {
    branches: 70,
    functions: 80,
    lines: 85,
    statements: 85
  },
  
  'src/**/data/**/*.ts': {
    branches: 75,
    functions: 80,
    lines: 85,
    statements: 85
  },
  
  // UI features - moderate standards
  'src/**/ui/**/*.tsx': {
    branches: 40,
    functions: 50,
    lines: 55,
    statements: 55
  },
  
  // Experimental features - lenient
  'src/**/experimental/**/*.ts': {
    branches: 20,
    functions: 30,
    lines: 35,
    statements: 35
  }
}
```

### 3. File Type-Based Thresholds

Different standards for different types of files:

```typescript
thresholds: {
  global: {
    branches: 50,
    functions: 60,
    lines: 70,
    statements: 70
  },
  
  // Utility functions - very high standards
  'src/utils/**/*.ts': {
    branches: 90,
    functions: 95,
    lines: 98,
    statements: 98
  },
  
  // API clients - high standards
  'src/api/**/*.ts': {
    branches: 80,
    functions: 85,
    lines: 90,
    statements: 90
  },
  
  // Hooks - high standards (reusable logic)
  'src/hooks/**/*.ts': {
    branches: 75,
    functions: 85,
    lines: 90,
    statements: 90
  },
  
  // Components - moderate standards
  'src/components/**/*.tsx': {
    branches: 50,
    functions: 60,
    lines: 65,
    statements: 65
  },
  
  // Types and interfaces - minimal (mostly declarations)
  'src/types/**/*.ts': {
    branches: 0,
    functions: 0,
    lines: 10,
    statements: 10
  },
  
  // Constants - minimal
  'src/constants/**/*.ts': {
    branches: 0,
    functions: 20,
    lines: 30,
    statements: 30
  }
}
```

## Progressive Threshold Strategies

### 1. Gradual Improvement Strategy

Start with low thresholds and gradually increase:

```typescript
// Phase 1: Establish baseline (Month 1-2)
thresholds: {
  global: { branches: 10, functions: 15, lines: 20, statements: 20 },
  'src/lib/**/*.ts': { branches: 30, functions: 40, lines: 50, statements: 50 }
}

// Phase 2: Moderate improvement (Month 3-4)
thresholds: {
  global: { branches: 25, functions: 35, lines: 45, statements: 45 },
  'src/lib/**/*.ts': { branches: 60, functions: 70, lines: 80, statements: 80 }
}

// Phase 3: High quality (Month 5-6)
thresholds: {
  global: { branches: 50, functions: 60, lines: 70, statements: 70 },
  'src/lib/**/*.ts': { branches: 80, functions: 90, lines: 95, statements: 95 }
}

// Phase 4: Production ready (Month 7+)
thresholds: {
  global: { branches: 70, functions: 80, lines: 85, statements: 85 },
  'src/lib/**/*.ts': { branches: 90, functions: 95, lines: 98, statements: 98 }
}
```

### 2. New Feature Integration Strategy

Higher standards for new code, lenient for legacy:

```typescript
thresholds: {
  // Legacy code - maintain current levels
  global: {
    branches: 30,
    functions: 40,
    lines: 50,
    statements: 50
  },
  
  // New features (created after specific date) - high standards
  'src/features/new-feature/**/*.ts': {
    branches: 80,
    functions: 90,
    lines: 95,
    statements: 95
  },
  
  // Recently refactored code - moderate improvement
  'src/components/refactored/**/*.tsx': {
    branches: 60,
    functions: 70,
    lines: 75,
    statements: 75
  }
}
```

## Environment-Specific Thresholds

### 1. Development vs Production

```typescript
const isDevelopment = process.env.NODE_ENV === 'development';
const isCI = process.env.CI === 'true';

const thresholds = {
  global: isDevelopment 
    ? { branches: 10, functions: 15, lines: 20, statements: 20 }  // Lenient for dev
    : { branches: 50, functions: 60, lines: 70, statements: 70 }, // Strict for CI
    
  'src/lib/**/*.ts': isDevelopment
    ? { branches: 30, functions: 40, lines: 50, statements: 50 }
    : { branches: 80, functions: 90, lines: 95, statements: 95 }
};
```

### 2. Branch-Specific Thresholds

```typescript
const branch = process.env.GITHUB_REF_NAME || 'main';

const getThresholds = () => {
  switch (branch) {
    case 'main':
    case 'master':
      // Production branch - strict standards
      return {
        global: { branches: 70, functions: 80, lines: 85, statements: 85 }
      };
      
    case 'develop':
      // Development branch - moderate standards
      return {
        global: { branches: 50, functions: 60, lines: 65, statements: 65 }
      };
      
    default:
      // Feature branches - lenient standards
      return {
        global: { branches: 30, functions: 40, lines: 45, statements: 45 }
      };
  }
};
```

## Team-Based Threshold Examples

### 1. Small Team (2-5 developers)

```typescript
thresholds: {
  // Moderate standards - balance quality with velocity
  global: {
    branches: 40,
    functions: 50,
    lines: 60,
    statements: 60
  },
  
  // Higher standards for shared utilities
  'src/lib/**/*.ts': {
    branches: 70,
    functions: 80,
    lines: 85,
    statements: 85
  }
}
```

### 2. Large Team (10+ developers)

```typescript
thresholds: {
  // Stricter standards - prevent quality degradation
  global: {
    branches: 60,
    functions: 70,
    lines: 75,
    statements: 75
  },
  
  // Very high standards for core modules
  'src/core/**/*.ts': {
    branches: 85,
    functions: 90,
    lines: 95,
    statements: 95
  },
  
  // Team-specific standards
  'src/team-a/**/*.ts': {
    branches: 70,
    functions: 80,
    lines: 85,
    statements: 85
  },
  
  'src/team-b/**/*.ts': {
    branches: 65,
    functions: 75,
    lines: 80,
    statements: 80
  }
}
```

## Project Type-Specific Examples

### 1. Library/Package Project

```typescript
thresholds: {
  // Very high standards for public APIs
  global: {
    branches: 85,
    functions: 90,
    lines: 95,
    statements: 95
  },
  
  // Perfect coverage for main exports
  'src/index.ts': {
    branches: 100,
    functions: 100,
    lines: 100,
    statements: 100
  },
  
  // High standards for core functionality
  'src/core/**/*.ts': {
    branches: 90,
    functions: 95,
    lines: 98,
    statements: 98
  },
  
  // Moderate for internal utilities
  'src/internal/**/*.ts': {
    branches: 70,
    functions: 80,
    lines: 85,
    statements: 85
  }
}
```

### 2. Web Application

```typescript
thresholds: {
  global: {
    branches: 50,
    functions: 60,
    lines: 65,
    statements: 65
  },
  
  // High standards for business logic
  'src/lib/**/*.ts': {
    branches: 80,
    functions: 85,
    lines: 90,
    statements: 90
  },
  
  // Moderate for components
  'src/components/**/*.tsx': {
    branches: 45,
    functions: 55,
    lines: 60,
    statements: 60
  },
  
  // Lower for pages (mostly composition)
  'src/pages/**/*.tsx': {
    branches: 30,
    functions: 40,
    lines: 45,
    statements: 45
  }
}
```

### 3. API/Backend Service

```typescript
thresholds: {
  global: {
    branches: 70,
    functions: 80,
    lines: 85,
    statements: 85
  },
  
  // Critical for API endpoints
  'src/routes/**/*.ts': {
    branches: 85,
    functions: 90,
    lines: 95,
    statements: 95
  },
  
  // Very high for business logic
  'src/services/**/*.ts': {
    branches: 90,
    functions: 95,
    lines: 98,
    statements: 98
  },
  
  // High for middleware
  'src/middleware/**/*.ts': {
    branches: 80,
    functions: 85,
    lines: 90,
    statements: 90
  },
  
  // Moderate for configuration
  'src/config/**/*.ts': {
    branches: 40,
    functions: 50,
    lines: 60,
    statements: 60
  }
}
```

## Troubleshooting Threshold Issues

### 1. Threshold Too High

**Problem**: Build fails because thresholds are unrealistic

**Solution**: Gradually reduce thresholds
```typescript
// Before (too strict)
global: { lines: 90, functions: 95, branches: 85, statements: 90 }

// After (more realistic)
global: { lines: 70, functions: 75, branches: 65, statements: 70 }
```

### 2. Threshold Too Low

**Problem**: Poor code quality despite passing thresholds

**Solution**: Gradually increase thresholds
```typescript
// Phase 1: Current state
global: { lines: 30, functions: 25, branches: 20, statements: 30 }

// Phase 2: Improvement target (next sprint)
global: { lines: 40, functions: 35, branches: 30, statements: 40 }

// Phase 3: Quality target (next quarter)
global: { lines: 60, functions: 55, branches: 50, statements: 60 }
```

### 3. Inconsistent Standards

**Problem**: Some files have much lower coverage than others

**Solution**: Use pattern-based thresholds
```typescript
thresholds: {
  // Baseline for all files
  global: { lines: 50, functions: 50, branches: 40, statements: 50 },
  
  // Higher standards for well-tested areas
  'src/lib/**/*.ts': { lines: 80, functions: 85, branches: 75, statements: 80 },
  
  // Lower standards for legacy code
  'src/legacy/**/*.ts': { lines: 20, functions: 25, branches: 15, statements: 20 }
}
```

## Best Practices

### 1. Start Conservative

Begin with achievable thresholds and improve over time:
- Analyze current coverage levels
- Set thresholds 5-10% below current levels
- Gradually increase every few weeks

### 2. Use Pattern-Based Thresholds

Different code deserves different standards:
- Business logic: High thresholds (80-95%)
- UI components: Moderate thresholds (50-70%)
- Configuration: Low thresholds (20-40%)

### 3. Consider Team Dynamics

Adjust thresholds based on team experience:
- New teams: Start with low thresholds
- Experienced teams: Use higher thresholds
- Mixed teams: Use moderate thresholds with gradual increases

### 4. Monitor and Adjust

Regularly review threshold effectiveness:
- Track coverage trends over time
- Adjust thresholds based on team feedback
- Consider project phase and priorities

### 5. Document Rationale

Always document why specific thresholds were chosen:
- Business requirements
- Risk tolerance
- Team capabilities
- Project timeline

This comprehensive guide provides practical examples for configuring coverage thresholds in various scenarios. Choose the approach that best fits your project's needs and team capabilities.