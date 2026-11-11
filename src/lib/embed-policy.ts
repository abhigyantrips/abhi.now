export type EmbedScope = "/blog" | "/weeknotes" | "/snippets" | "/whoami";
export interface EmbedPage {
	canonical: string;
	path: string;
	scope: EmbedScope;
}
export const normalizePath = (path: string) => path.replace(/\/+$/, "") || "/";
export const inScope = (path: string, scope: string) =>
	path === scope || path.startsWith(`${scope}/`);

/** Pure policy shared by the HTML transform and any future dynamic anchors. */
export function embedLink(
	href: string,
	page: EmbedPage,
	manifest: readonly EmbedPage[],
	origin: string,
	target?: string
) {
	if (href.trim().startsWith("#")) return { href, target: "_self", separate: false };
	let url: URL;
	try {
		url = new URL(href, new URL(`${page.canonical}/`, origin));
	} catch {
		return { href, target: "_self", separate: false };
	}
	if (!["http:", "https:"].includes(url.protocol))
		return { href, target: "_self", separate: false };
	// Public absolute URLs also refer to this deployment. Compare complete origins.
	const internal = url.origin === origin || url.origin === "https://abhi.now";
	if (internal) {
		const path = normalizePath(url.pathname);
		const entry = manifest.find((item) => item.canonical === path || item.path === path);
		if (entry && inScope(entry.canonical, page.scope) && entry.scope === page.scope) {
			const separate = target?.toLowerCase() === "_blank";
			return {
				href: `${entry.path}${url.search}${url.hash}`,
				target: separate ? "_blank" : "_self",
				separate,
			};
		}
		return {
			href: `${entry?.canonical ?? path.replace(/\/embed$/, "")}${url.search}${url.hash}`,
			target: "_blank",
			separate: true,
		};
	}
	return { href: url.href, target: "_blank", separate: true };
}
