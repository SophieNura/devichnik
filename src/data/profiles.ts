import type { Profile, ProfileLoadIssue } from "../types";

type RawProfileFrontmatter = {
  name?: unknown;
  hobbies?: unknown;
  occupation?: unknown;
  style?: unknown;
  pets?: unknown;
  worst_act?: unknown;
};

const markdownModules = import.meta.glob("./../content/profiles/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const imageModules = import.meta.glob(
  "./../content/profiles/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG,WEBP,AVIF}",
  {
    import: "default",
    eager: true,
  },
) as Record<string, string>;

const imageFormatPriority = ["avif", "webp", "jpg", "jpeg", "png"];

function getBaseName(path: string) {
  return path.split("/").pop()!.replace(/\.[^.]+$/, "");
}

function getFileName(path: string) {
  return path.split("/").pop() ?? path;
}

function getExtension(path: string) {
  return path.split(".").pop()?.toLowerCase() ?? "";
}

function normalizeString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeStringArray(value: unknown) {
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function parseValue(rawValue: string): unknown {
  const value = rawValue.trim();

  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  if (value.startsWith("[") && value.endsWith("]")) {
    return value
      .slice(1, -1)
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => item.replace(/^['"]|['"]$/g, ""));
  }

  return value;
}

function parseFrontmatter(source: string) {
  if (!source.startsWith("---")) {
    return { data: {}, content: source.trim() };
  }

  const closingIndex = source.indexOf("\n---", 3);

  if (closingIndex === -1) {
    return { data: {}, content: source.trim() };
  }

  const frontmatterBlock = source.slice(3, closingIndex).trim();
  const content = source.slice(closingIndex + 4).trim();
  const data: Record<string, unknown> = {};

  frontmatterBlock.split(/\r?\n/).forEach((line) => {
    const separatorIndex = line.indexOf(":");

    if (separatorIndex === -1) {
      return;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1);

    if (!key) {
      return;
    }

    data[key] = parseValue(value);
  });

  return { data, content };
}

function validateProfile(
  filePath: string,
  source: string,
  imageUrl: string | undefined,
): { profile?: Profile; issue?: ProfileLoadIssue } {
  const parsed = parseFrontmatter(source);
  const data = parsed.data as RawProfileFrontmatter;
  const name = normalizeString(data.name);
  const hobbies = normalizeStringArray(data.hobbies);
  const occupation = normalizeString(data.occupation);
  const style = normalizeString(data.style);
  const pets = normalizeString(data.pets);
  const worstAct = normalizeString(data.worst_act);
  const about = parsed.content.trim();

  if (!imageUrl) {
    return {
      issue: {
        file: getFileName(filePath),
        reason: "Не найдено фото с таким же именем файла.",
      },
    };
  }

  if (!name || !occupation || !style || !pets || !worstAct || !about || hobbies.length === 0) {
    return {
      issue: {
        file: getFileName(filePath),
        reason:
          "Не заполнены обязательные поля: name, hobbies, occupation, style, pets, worst_act или текст блока 'О себе'.",
      },
    };
  }

  return {
    profile: {
      id: getBaseName(filePath),
      imageUrl,
      name,
      hobbies,
      occupation,
      style,
      pets,
      worstAct,
      about,
    },
  };
}

export function loadProfiles() {
  const imagesByBaseName = new Map<string, string>();

  Object.entries(imageModules)
    .sort(([leftPath], [rightPath]) => {
      const leftPriority = imageFormatPriority.indexOf(getExtension(leftPath));
      const rightPriority = imageFormatPriority.indexOf(getExtension(rightPath));

      return leftPriority - rightPriority;
    })
    .forEach(([path, url]) => {
      const basename = getBaseName(path);

      if (!imagesByBaseName.has(basename)) {
        imagesByBaseName.set(basename, url);
      }
    });

  const profiles: Profile[] = [];
  const issues: ProfileLoadIssue[] = [];

  Object.entries(markdownModules)
    .sort(([leftPath], [rightPath]) => leftPath.localeCompare(rightPath, "ru"))
    .forEach(([path, source]) => {
      const result = validateProfile(path, source, imagesByBaseName.get(getBaseName(path)));

      if (result.profile) {
        profiles.push(result.profile);
      }

      if (result.issue) {
        issues.push(result.issue);
      }
    });

  return { profiles, issues };
}
