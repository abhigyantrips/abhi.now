declare module "parse-srcset" {
	export default function parseSrcset(
		value: string
	): { url: string; w?: number; h?: number; d?: number }[];
}
