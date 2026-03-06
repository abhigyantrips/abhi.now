import type { Route, Site, Social } from "@/types";

export const SITE: Site = {
	TITLE: "abhigyan trips.",
	DESCRIPTION: "working towards a more distraction-free internet.",
	AUTHOR: "Abhigyan Trips",
	URL: "https://abhi.now",
};

export const MAIN_ROUTES: Route[] = [
	{
		NAME: "whoami",
		PATH: "/whoami",
		ICON: "/icons/question.svg",
		COLOR: { LIGHT: "#467A56", DARK: "#7AEF90" },
		DESCRIPTION: "a little bit about who i am and what i do.",
	},
	{
		NAME: "blog",
		PATH: "/blog",
		ICON: "/icons/note.svg",
		COLOR: { LIGHT: "#3A7A90", DARK: "#6DD4F0" },
		DESCRIPTION: "thoughts, ideas, and random musings.",
	},
	{
		NAME: "snippets",
		PATH: "/snippets",
		ICON: "/icons/photo.svg",
		COLOR: { LIGHT: "#6B7D2E", DARK: "#A8C44A" },
		DESCRIPTION: "sticky notes from my life i wanna document.",
	},
	{
		NAME: "projects",
		PATH: "/projects",
		ICON: "/icons/automation.svg",
		COLOR: { LIGHT: "#60B0B5", DARK: "#5DC4AC" },
		DESCRIPTION: "things i have built and that people found cool.",
	},
	{
		NAME: "anti-vision",
		PATH: "/anti-vision",
		ICON: "/icons/hide.svg",
		COLOR: { LIGHT: "#B84848", DARK: "#FF6B6B" },
		DESCRIPTION: "my vision? pfft, that's too broad. i gotta start with what i *don't* want.",
	},
	{
		NAME: "people",
		PATH: "/people",
		ICON: "/icons/crown.svg",
		COLOR: { LIGHT: "#B08825", DARK: "#FFB830" },
		DESCRIPTION: "people from my life who're doing crazy and cool things.",
	},
	{
		NAME: "media",
		PATH: "/media",
		ICON: "/icons/movie-clapper.svg",
		COLOR: { LIGHT: "#904A72", DARK: "#F07EB8" },
		DESCRIPTION: "media i consumed and cannot stop talking about.",
	},
	{
		NAME: "now",
		PATH: "/now",
		ICON: "/icons/point-down.svg",
		COLOR: { LIGHT: "#B57035", DARK: "#FF9838" },
		DESCRIPTION:
			"hahahah see how the site is called 'abhi.now' and this page is called '/now' and-",
	},
];

export const ROUTES: Route[] = [
	...MAIN_ROUTES,
	{
		NAME: "weeknotes",
		PATH: "/weeknotes",
		ICON: "/icons/calendar.svg",
		COLOR: { LIGHT: "#3C3836", DARK: "#EBDBB2" },
		DESCRIPTION: "history of weeks in the life.",
	},
	{
		NAME: "before",
		PATH: "/before",
		ICON: "/icons/point-down.svg",
		COLOR: { LIGHT: "#B57035", DARK: "#FF9838" },
		DESCRIPTION: "snapshots from a time before now.",
	},
];

export const SOCIALS: Social[] = [
	{
		NAME: "GitHub",
		TEXT: "github",
		COLOR: "#FF5C00",
		HREF: "https://github.com/abhigyantrips",
	},
	{
		NAME: "LinkedIn",
		TEXT: "linkedin",
		COLOR: "#0077B5",
		HREF: "https://linkedin.com/in/abhigyantrips",
	},
	{
		NAME: "Discord",
		TEXT: "discord",
		COLOR: "#5539CC",
		HREF: "https://discord.gg/zdVnRaQVzn",
	},
];
