# Base Rules for Development & Editing

## Core Philosophy
- Code must be production-ready, clean, modular, and fully typed.
- Prioritize explicit logic over implicit "magic".
- Never sacrifice security, readability, or testability for brevity.

## Modern Coding Standards
1. **Type Safety:** 
   - Never use `any`. Use explicit interfaces, types, or generics.
   - Narrow `unknown` types explicitly before usage.

2. **Error Management:**
   - Catch errors at boundaries.
   - Always return typed error responses or throw domain-specific custom errors.
   - Log errors with structured contextual metadata.

3. **Function Design:**
   - Maximum 30-40 lines per function.
   - Functions must have a single responsibility.
   - Use early returns to reduce nesting levels.

4. **Architecture & Imports:**
   - Use clean, alias-based imports (e.g., `@/components/...`) over deep relative paths (`../../..`).
   - Keep business logic isolated from UI or framework code.
