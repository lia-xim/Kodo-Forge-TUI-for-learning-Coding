/**
 * Lesson 08 — Transfer Tasks: Type Aliases vs Interfaces
 */

import type { TransferTask } from "../tools/transfer-engine.ts";

export const transferTasks: TransferTask[] = [
  {
    id: "08-plugin-system",
    title: "Type-Safe Plugin System with Declaration Merging",
    prerequisiteLessons: [8],
    scenario:
      "You are building a plugin system for an app. Plugins should be able to " +
      "extend the app configuration without changing the core code. " +
      "Currently each plugin adds its config properties " +
      "via 'any' — no type safety.",
    task:
      "Create a plugin system with Declaration Merging:\n\n" +
      "1. Define a core AppConfig interface\n" +
      "2. Create 2 plugins that extend AppConfig via Declaration Merging\n" +
      "3. Show that the extended config is type-safe\n" +
      "4. Explain why interface (not type) is the only option here",
    starterCode: [
      "// Core Config",
      "interface AppConfig {",
      "  appName: string;",
      "  version: string;",
      "}",
      "",
      "// TODO: Plugin 1 extends AppConfig",
      "// TODO: Plugin 2 extends AppConfig",
      "// TODO: Type-safe usage",
    ].join("\n"),
    solutionCode: [
      "// ═══ Core Config ═══",
      "interface AppConfig {",
      "  appName: string;",
      "  version: string;",
      "}",
      "",
      "// ═══ Plugin 1: Analytics ═══",
      "interface AppConfig {",
      "  analytics: {",
      "    trackingId: string;",
      "    enabled: boolean;",
      "  };",
      "}",
      "",
      "// ═══ Plugin 2: Theme ═══",
      "interface AppConfig {",
      "  theme: {",
      "    primaryColor: string;",
      "    darkMode: boolean;",
      "  };",
      "}",
      "",
      "// ═══ Usage: Everything merged! ═══",
      "const config: AppConfig = {",
      "  appName: 'MyApp',",
      "  version: '1.0.0',",
      "  analytics: { trackingId: 'UA-123', enabled: true },",
      "  theme: { primaryColor: '#007bff', darkMode: false },",
      "};",
      "",
      "// TypeScript knows ALL properties — full type safety!",
      "console.log(config.analytics.trackingId);",
      "console.log(config.theme.primaryColor);",
      "",
      "// Why interface? type aliases cannot be merged.",
      "// Each file declares interface AppConfig and adds its properties.",
      "// This is only possible with interfaces (Declaration Merging).",
    ].join("\n"),
    conceptsBridged: [
      "Declaration Merging (interface-only)",
      "Plugin architecture without code changes",
      "type vs interface decision (here: interface required)",
    ],
    hints: [
      "Declaration Merging only works with interface — three declarations with the same name.",
      "Each plugin declares interface AppConfig { ... } and adds its properties.",
      "In the end, AppConfig has merged ALL properties from all declarations.",
    ],
    difficulty: 3,
  },

  {
    id: "08-domain-model",
    title: "Domain Model with interface-extends and type-Utilities",
    prerequisiteLessons: [8],
    scenario:
      "You are modeling an e-commerce domain model. There is " +
      "an inheritance hierarchy for entities and various " +
      "utility types for API DTOs (CreateDto, UpdateDto).",
    task:
      "Create a domain model that combines interface AND type:\n\n" +
      "1. Interface hierarchy: BaseEntity → Product → DigitalProduct\n" +
      "2. type CreateProductDto = Omit<Product, 'id' | 'createdAt'>\n" +
      "3. type UpdateProductDto = Partial<Omit<Product, 'id'>>\n" +
      "4. Explain why you use interface for the hierarchy and type for the DTOs",
    starterCode: [
      "// TODO: BaseEntity Interface",
      "// TODO: Product extends BaseEntity",
      "// TODO: DigitalProduct extends Product",
      "// TODO: CreateDto and UpdateDto with Utility Types",
    ].join("\n"),
    solutionCode: [
      "// ═══ Interface Hierarchy (extends for Inheritance) ═══",
      "interface BaseEntity {",
      "  id: string;",
      "  createdAt: Date;",
      "  updatedAt: Date;",
      "}",
      "",
      "interface Product extends BaseEntity {",
      "  name: string;",
      "  price: number;",
      "  category: string;",
      "}",
      "",
      "interface DigitalProduct extends Product {",
      "  downloadUrl: string;",
      "  fileSize: number;",
      "}",
      "",
      "// ═══ Type Utilities for DTOs (Mapped Types → type only) ═══",
      "type CreateProductDto = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>;",
      "// { name: string; price: number; category: string }",
      "",
      "type UpdateProductDto = Partial<Omit<Product, 'id' | 'createdAt'>>;",
      "// { name?: string; price?: number; category?: string; updatedAt?: Date }",
      "",
      "// ═══ Why this combination? ═══",
      "// interface for hierarchy: extends is faster, reports conflicts,",
      "//   and the object shape is clear (Angular/Enterprise style).",
      "// type for DTOs: Omit, Partial, Pick are Mapped Types —",
      "//   they only work with type.",
    ].join("\n"),
    conceptsBridged: [
      "Interface extends for inheritance hierarchy",
      "Type for Mapped/Utility Types (Omit, Partial)",
      "Combined use of both constructs",
      "Decision matrix in practice",
    ],
    hints: [
      "The entity hierarchy is ideal for interface extends — clear inheritance, conflict detection.",
      "DTOs require Utility Types (Omit, Partial) — they only work with type.",
      "This is the pattern for real-world use: Interfaces for object shapes, Types for transformations.",
    ],
    difficulty: 3,
  },
];