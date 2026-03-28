# Book Tier List

An Astro + Tailwind project for ranking books in numeric tiers from 5 down to 0.5.

## Features

- Numeric tiers from 5 to 0.5 in 0.5 increments.
- One discrete color per tier, transitioning from green (5) to red (0.5).
- Data source is YAML under src/data/books.yaml.
- Book cards with image covers and tooltip metadata (title + author).
- Tooltip behavior supports desktop hover/focus and mobile tap-toggle.
- Mobile-first responsive layout.

## Project Structure

- `src/data/books.yaml`: tier list data source.
- `src/lib/books.ts`: YAML loading, validation, and rank ordering.
- `src/components/TierRow.astro`: one tier row with rank label and cards.
- `src/components/BookCard.astro`: book cover card and tooltip markup.
- `src/components/TooltipController.ts`: tooltip interactions for tap/outside click/escape.
- `src/pages/index.astro`: page composition.
- `src/styles/global.css`: global look and responsive styling.

## YAML Format

The file must define numeric ranks as string keys under `ranks`, plus a `want_to_read` list:

```yaml
ranks:
	"5":
		- title: Example Top Tier Book
			author: Example Author
			image: https://example.com/cover.jpg
	"4.5": []
	"4": []
	"3.5": []
	"3": []
	"2.5": []
	"2":
		- title: Example Mid Tier Book
			author: Example Author
			image: https://example.com/cover.jpg
	"1.5": []
	"1": []
	"0.5": []

want_to_read:
	- title: Example Queue Book
		author: Example Author
		image: https://example.com/cover.jpg
```

Allowed `ranks` keys are strictly: 5, 4.5, 4, 3.5, 3, 2.5, 2, 1.5, 1, 0.5.

## Commands

- `npm install`: install dependencies.
- `npm run dev`: run local development server.
- `npm run check`: run Astro type and project checks.
- `npm run build`: build production output.
- `npm run preview`: preview the built site.
