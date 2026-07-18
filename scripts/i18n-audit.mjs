import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import ts from "typescript";

const root = process.cwd();
const sourceRoot = path.join(root, "src");
const failures = [];
const requiredLocales = ["en", "uk", "pl"];

async function sourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) return sourceFiles(fullPath);
      return /\.(?:ts|tsx)$/.test(entry.name) ? [fullPath] : [];
    })
  );
  return nested.flat();
}

function parse(source, fileName) {
  return ts.createSourceFile(
    fileName,
    source,
    ts.ScriptTarget.Latest,
    true,
    fileName.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS
  );
}

function propertyName(node) {
  if (ts.isIdentifier(node) || ts.isStringLiteral(node) || ts.isNumericLiteral(node)) {
    return node.text;
  }
  return null;
}

function objectLeafPaths(object, prefix = "", values = new Map()) {
  for (const property of object.properties) {
    if (!ts.isPropertyAssignment(property)) continue;
    const name = propertyName(property.name);
    if (!name) continue;
    const current = prefix ? `${prefix}.${name}` : name;
    if (ts.isObjectLiteralExpression(property.initializer)) {
      objectLeafPaths(property.initializer, current, values);
    } else {
      values.set(current, property.initializer);
    }
  }
  return values;
}

function catalogLeaves(source, fileName, variableName) {
  const sourceFile = parse(source, fileName);
  for (const statement of sourceFile.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const declaration of statement.declarationList.declarations) {
      if (
        ts.isIdentifier(declaration.name) &&
        declaration.name.text === variableName &&
        declaration.initializer &&
        ts.isObjectLiteralExpression(declaration.initializer)
      ) {
        return objectLeafPaths(declaration.initializer);
      }
    }
  }
  failures.push(`${fileName} does not export an object literal named ${variableName}.`);
  return new Map();
}

function placeholders(node) {
  if (!ts.isStringLiteral(node) && !ts.isNoSubstitutionTemplateLiteral(node)) return [];
  return [...node.text.matchAll(/\{([A-Za-z0-9_]+)\}/g)].map((match) => match[1]).sort();
}

const catalogSources = Object.fromEntries(
  await Promise.all(
    requiredLocales.map(async (locale) => [
      locale,
      await readFile(path.join(sourceRoot, "messages", `${locale}.ts`), "utf8"),
    ])
  )
);
const polishCatalog = catalogSources.pl;
if (polishCatalog.includes('from "./en"') || polishCatalog.includes("...en")) {
  failures.push("src/messages/pl.ts must be complete and must not silently inherit English copy.");
}

const catalogMaps = Object.fromEntries(
  requiredLocales.map((locale) => [
    locale,
    catalogLeaves(catalogSources[locale], `src/messages/${locale}.ts`, locale),
  ])
);

for (const [locale, expected] of Object.entries({
  "pl-PL": { 1: "one", 2: "few", 5: "many", 1.5: "other" },
  "uk-UA": { 1: "one", 2: "few", 5: "many", 1.5: "other" },
})) {
  const rules = new Intl.PluralRules(locale);
  for (const [value, category] of Object.entries(expected)) {
    const actual = rules.select(Number(value));
    if (actual !== category) {
      failures.push(
        `${locale} plural category for ${value} should be ${category}, received ${actual}.`
      );
    }
  }
}

const clockProbe = new Date("2026-01-15T13:05:00Z");
for (const [locale, timeZone, expectedHour, expectedMinute] of [
  ["pl-PL", "Europe/Warsaw", "14", "05"],
  ["uk-UA", "Europe/Kyiv", "15", "05"],
  ["pl-PL", "Asia/Kolkata", "18", "35"],
  ["pl-PL", "Asia/Kathmandu", "18", "50"],
]) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat(locale, {
      hour: "2-digit",
      minute: "2-digit",
      timeZone,
    })
      .formatToParts(clockProbe)
      .map((part) => [part.type, part.value])
  );
  if (parts.hour !== expectedHour || parts.minute !== expectedMinute || parts.dayPeriod) {
    failures.push(
      `${locale}/${timeZone} should use a 24-hour localized clock (${expectedHour}:${expectedMinute}).`
    );
  }
}

const warsawBeforeDst = Object.fromEntries(
  new Intl.DateTimeFormat("pl-PL", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Warsaw",
  })
    .formatToParts(new Date("2026-03-29T00:30:00Z"))
    .map((part) => [part.type, part.value])
);
const warsawAfterDst = Object.fromEntries(
  new Intl.DateTimeFormat("pl-PL", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Warsaw",
  })
    .formatToParts(new Date("2026-03-29T01:30:00Z"))
    .map((part) => [part.type, part.value])
);
if (warsawBeforeDst.hour !== "01" || warsawAfterDst.hour !== "03") {
  failures.push("Europe/Warsaw DST transition should skip from 01:xx to 03:xx on 2026-03-29.");
}
const canonicalPaths = [...catalogMaps.en.keys()].sort();
for (const locale of requiredLocales.slice(1)) {
  const translatedPaths = [...catalogMaps[locale].keys()].sort();
  for (const missing of canonicalPaths.filter((key) => !catalogMaps[locale].has(key))) {
    failures.push(`src/messages/${locale}.ts is missing ${missing}.`);
  }
  for (const extra of translatedPaths.filter((key) => !catalogMaps.en.has(key))) {
    failures.push(`src/messages/${locale}.ts has unknown key ${extra}.`);
  }
  for (const key of canonicalPaths) {
    if (!catalogMaps[locale].has(key)) continue;
    const expected = placeholders(catalogMaps.en.get(key));
    const actual = placeholders(catalogMaps[locale].get(key));
    if (expected.join("|") !== actual.join("|")) {
      failures.push(
        `src/messages/${locale}.ts placeholder mismatch at ${key}: expected {${expected.join(
          "}, {"
        )}}, found {${actual.join("}, {")}}.`
      );
    }
  }
}

for (const file of await sourceFiles(sourceRoot)) {
  const source = await readFile(file, "utf8");
  const relative = path.relative(root, file).replaceAll("\\", "/");
  const sourceFile = parse(source, relative);

  const hasUkrainianLocaleBranch =
    /locale\s*===\s*["']uk["']/.test(source) ||
    /localePrefix\.endsWith\(["']\/uk["']\)/.test(source);
  const hasPolishLocaleBranch =
    /locale\s*===\s*["']pl["']/.test(source) ||
    /localePrefix\.endsWith\(["']\/pl["']\)/.test(source);
  if (hasUkrainianLocaleBranch && !hasPolishLocaleBranch) {
    failures.push(
      `${relative} branches for Ukrainian but has no explicit Polish path; use localText/localized or add PL.`
    );
  }

  if (
    /\btoLocale(?:DateString|TimeString|String)\s*\(/.test(source) &&
    /\bLocale\b|\blocale\b/.test(source)
  ) {
    failures.push(
      `${relative} uses an implicit host locale for user-visible date/time; use the locale-aware format helpers.`
    );
  }

  const visit = (node) => {
    if (ts.isCallExpression(node) && ts.isIdentifier(node.expression)) {
      if (node.expression.text === "localText" && node.arguments.length !== 4) {
        failures.push(
          `${relative}:${sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1} calls localText without en/uk/pl.`
        );
      }
      if (
        node.expression.text === "localized" &&
        node.arguments[1] &&
        ts.isObjectLiteralExpression(node.arguments[1])
      ) {
        const keys = new Set(
          node.arguments[1].properties
            .filter(
              (property) =>
                ts.isPropertyAssignment(property) || ts.isShorthandPropertyAssignment(property)
            )
            .map((property) => propertyName(property.name))
            .filter(Boolean)
        );
        for (const locale of requiredLocales) {
          if (!keys.has(locale)) {
            failures.push(
              `${relative}:${sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1} calls localized without ${locale}.`
            );
          }
        }
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
}

if (failures.length) {
  console.error(`i18n audit failed (${failures.length}):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(
    "i18n audit passed: EN/UK/PL catalogs, placeholders, plural rules, 24-hour clocks, DST and offset edge cases are locale-aware."
  );
}
