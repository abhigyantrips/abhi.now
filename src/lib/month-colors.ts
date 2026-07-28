const MONTH_COLORS = {
	LIGHT: [
		"#B64A53", // jan - rose
		"#9B6230", // feb - amber
		"#8A6A13", // mar - gold
		"#5F7F37", // apr - green
		"#2F7D86", // may - teal
		"#2D6FA7", // jun - sky
		"#315FB8", // jul - blue
		"#5B52B4", // aug - indigo
		"#8E4BA4", // sep - purple
		"#A84F83", // oct - magenta
		"#A34B4B", // nov - coral
		"#8C3F37", // dec - rust
	],
	DARK: [
		"#E06C75", // jan - rose
		"#D19A66", // feb - amber
		"#E5C07B", // mar - gold
		"#98C379", // apr - green
		"#56B6C2", // may - teal
		"#61AFEF", // jun - sky
		"#528BFF", // jul - blue
		"#7C6FE1", // aug - indigo
		"#C678DD", // sep - purple
		"#E06CB0", // oct - magenta
		"#D16969", // nov - coral
		"#BE5046", // dec - rust
	],
} as const;

export function getMonthColor(date: Date) {
	const month = date.getMonth();

	return {
		light: MONTH_COLORS.LIGHT[month],
		dark: MONTH_COLORS.DARK[month],
	};
}
