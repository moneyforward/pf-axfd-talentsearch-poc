# TypeSpec Project for PF Talent Search

This directory contains the TypeSpec API definitions for the PF Talent Search application.

## Project Structure

```
apps/typespec/
├── package.json          # Node.js dependencies and scripts
├── tspconfig.yaml         # TypeSpec configuration
├── main.tsp              # Main API definition with base models
├── models/
│   ├── person.tsp        # Person/Talent related models and endpoints
│   └── search.tsp        # Search related models and endpoints
└── tsp-output/           # Generated output (created after compilation)
    ├── openapi/          # OpenAPI 3.0 specifications
    └── json-schema/      # JSON Schema definitions
```

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm or yarn

### Installation

1. Install dependencies:
   ```bash
   cd apps/typespec
   npm install
   ```

2. Install TypeSpec CLI globally (optional but recommended):
   ```bash
   npm install -g @typespec/compiler
   ```

### Building the API Specifications

Generate OpenAPI and JSON Schema outputs:

```bash
npm run build
```

The generated files will be available in the `tsp-output/` directory:
- `tsp-output/openapi/openapi.yaml` - OpenAPI 3.0 specification
- `tsp-output/json-schema/` - JSON Schema definitions

### Development

Watch for changes and automatically rebuild:

```bash
npm run watch
```

Format TypeSpec files:

```bash
npm run format
```

Lint TypeSpec files:

```bash
npm run lint
```

Clean generated output:

```bash
npm run clean
```

## API Overview

The API is organized into the following main areas:

### Core Models

- **BaseResponse**: Standard response wrapper
- **ErrorResponse**: Error handling model
- **PaginatedResponse**: Paginated data responses
- **HealthResponse**: Health check model

### Person/Talent Management

Defined in `models/person.tsp`:

- **Person**: Complete talent profile with skills, location, and experience
- **Skill**: Individual skill with category and proficiency level
- **Location**: Geographic information and remote work preferences
- **CreatePersonRequest/UpdatePersonRequest**: Request models for CRUD operations

### Search Functionality

Defined in `models/search.tsp`:

- **SearchRequest**: Advanced search with filters and options
- **SearchResult**: Individual search result with scoring and highlights
- **SearchResponse**: Complete search response with statistics
- **SearchSuggestion**: Autocomplete suggestions

## API Endpoints

### Health & Status
- `GET /health` - Health check
- `GET /` - API information

### Person Management
- `GET /persons` - List persons with filtering and pagination
- `POST /persons` - Create a new person
- `GET /persons/{id}` - Get person by ID
- `PUT /persons/{id}` - Update person by ID
- `DELETE /persons/{id}` - Delete person by ID

### Search
- `POST /search` - Advanced talent search
- `POST /search/suggestions` - Get search suggestions
- `GET /search` - Quick search with query parameters

## Extending the API

To add new functionality:

1. Create a new `.tsp` file in the appropriate location
2. Import necessary dependencies
3. Define your models and operations
4. Run `npm run build` to generate the updated specifications

## Integration

The generated OpenAPI specification can be used with:

- API documentation tools (Swagger UI, Redoc)
- Code generation tools for client SDKs
- API testing tools (Postman, Insomnia)
- Backend frameworks for validation and routing

## TypeSpec Resources

- [TypeSpec Documentation](https://typespec.io/)
- [TypeSpec Playground](https://typespec.io/playground)
- [TypeSpec Examples](https://github.com/microsoft/typespec/tree/main/packages/samples)
