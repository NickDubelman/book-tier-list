import { parse } from "yaml";
import booksSource from "../data/books.yaml?raw";

export const RANKS = [5, 4.5, 4, 3.5, 3, 2.5, 2, 1.5, 1, 0.5] as const;

export type Rank = (typeof RANKS)[number];

export interface Book {
  title: string;
  author: string;
  image: string;
  notes?: string;
  emojis?: string;
  goodreadsUrl?: string;
}

export interface TierRow {
  key: string;
  label: string;
  caption: string;
  color: string;
  books: Book[];
}

const IN_PROGRESS_KEY = "in_progress";
const IN_PROGRESS_LABEL = "In-Progress";
const IN_PROGRESS_COLOR = "#14b8a6";

const WANT_TO_READ_KEY = "want_to_read";
const WANT_TO_READ_LABEL = "Want to Read";
const WANT_TO_READ_COLOR = "#3b82f6";

export const RANK_COLORS: Record<Rank, string> = {
  5: "#148a32",
  4.5: "#58b84b",
  4: "#78b24a",
  3.5: "#8fad4d",
  3: "#b1b545",
  2.5: "#f3c623",
  2: "#ef9f2f",
  1.5: "#e87833",
  1: "#df5b34",
  0.5: "#db3a34",
};

type RawBook = Partial<Book> & { notes?: unknown; emojis?: unknown; goodreadsUrl?: unknown };
type RawBooksFile = {
  ranks?: Record<string, RawBook[] | undefined>;
  in_progress?: RawBook[];
  want_to_read?: RawBook[];
};

function assertObject(
  value: unknown,
  context: string,
): asserts value is Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`Expected ${context} to be an object.`);
  }
}

function parseBook(rawBook: RawBook, rowLabel: string, index: number): Book {
  const missingFields = ["title", "author", "image"].filter((fieldName) => {
    const value = rawBook[fieldName as keyof RawBook];
    return typeof value !== "string" || value.trim().length === 0;
  });

  if (missingFields.length > 0) {
    throw new Error(
      `Book at row '${rowLabel}' index ${index} is missing valid fields: ${missingFields.join(", ")}.`,
    );
  }

  const notes =
    typeof rawBook.notes === "string" && rawBook.notes.trim().length > 0
      ? rawBook.notes.trim()
      : undefined;

  const emojis =
    typeof rawBook.emojis === "string" && rawBook.emojis.trim().length > 0
      ? rawBook.emojis.trim()
      : undefined;

  const goodreadsUrl =
    typeof rawBook.goodreadsUrl === "string" && rawBook.goodreadsUrl.trim().length > 0
      ? rawBook.goodreadsUrl.trim()
      : undefined;

  return {
    title: rawBook.title!.trim(),
    author: rawBook.author!.trim(),
    image: rawBook.image!.trim(),
    ...(notes !== undefined && { notes }),
    ...(emojis !== undefined && { emojis }),
    ...(goodreadsUrl !== undefined && { goodreadsUrl }),
  };
}

export function getTierRows(): TierRow[] {
  const parsed = parse(booksSource) as RawBooksFile;

  assertObject(parsed, "YAML root");
  assertObject(parsed.ranks, "ranks");

  const allowedRankKeys = new Set(RANKS.map(String));

  for (const rankKey of Object.keys(parsed.ranks)) {
    if (!allowedRankKeys.has(rankKey)) {
      throw new Error(
        `Invalid rank '${rankKey}' found in books.yaml. Allowed ranks are ${RANKS.join(", ")}.`,
      );
    }
  }

  const rankedRows = RANKS.map((rank) => {
    const rankKey = String(rank);
    const rankBooks = parsed.ranks?.[rankKey] ?? [];

    if (!Array.isArray(rankBooks)) {
      throw new Error(`Rank ${rank} must map to an array of books.`);
    }

    return {
      key: rankKey,
      label: rankKey,
      caption: "Rating",
      color: RANK_COLORS[rank],
      books: rankBooks.map((book, index) => parseBook(book, rankKey, index)),
    };
  });

  const inProgressRaw = parsed.in_progress ?? [];
  if (!Array.isArray(inProgressRaw)) {
    throw new Error(`${IN_PROGRESS_KEY} must map to an array of books.`);
  }

  const inProgressRow: TierRow = {
    key: IN_PROGRESS_KEY,
    label: IN_PROGRESS_LABEL,
    caption: "Reading",
    color: IN_PROGRESS_COLOR,
    books: inProgressRaw.map((book, index) =>
      parseBook(book, IN_PROGRESS_LABEL, index),
    ),
  };

  const wantToReadRaw = parsed.want_to_read ?? [];
  if (!Array.isArray(wantToReadRaw)) {
    throw new Error(`${WANT_TO_READ_KEY} must map to an array of books.`);
  }

  const wantToReadRow: TierRow = {
    key: WANT_TO_READ_KEY,
    label: WANT_TO_READ_LABEL,
    caption: "Queue",
    color: WANT_TO_READ_COLOR,
    books: wantToReadRaw.map((book, index) =>
      parseBook(book, WANT_TO_READ_LABEL, index),
    ),
  };

  return [...rankedRows, inProgressRow, wantToReadRow];
}
