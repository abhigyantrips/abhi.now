export function parseCodeMeta(raw?: string): { filename?: string } {
	if (!raw?.trim()) return {};

	const trimmed = raw.trim();

	const keyValue = trimmed
		.split(",")
		.map((part) => part.trim())
		.filter(Boolean)
		.reduce<Record<string, string>>((meta, part) => {
			const separator = part.indexOf("=");

			if (separator === -1) return meta;

			const key = part.slice(0, separator).trim();
			const value = part
				.slice(separator + 1)
				.trim()
				.replace(/^["']|["']$/g, "");

			if (key && value) meta[key] = value;

			return meta;
		}, {});

	const titledFilename = keyValue.title ?? keyValue.file ?? keyValue.filename;

	if (titledFilename) {
		return { filename: titledFilename };
	}

	const quoted = trimmed.match(/^["'](.+)["']$/);

	if (quoted?.[1]) {
		return { filename: quoted[1] };
	}

	if (/^[\w./-]+\.[\w.-]+$/.test(trimmed)) {
		return { filename: trimmed };
	}

	return {};
}
