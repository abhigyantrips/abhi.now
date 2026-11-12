import type { ShikiConfig } from "@astrojs/markdown-remark";
type ShikiTransformer = NonNullable<ShikiConfig["transformers"]>[number];

export const codeMetaTransformer: ShikiTransformer = {
	pre(hast) {
		const meta = this.options.meta;
		const raw = meta && ("__raw" in meta ? meta.__raw : "raw" in meta ? meta.raw : undefined);

		if (typeof raw === "string" && raw.length > 0) {
			hast.properties["data-meta"] = raw;
		}
	},
};
