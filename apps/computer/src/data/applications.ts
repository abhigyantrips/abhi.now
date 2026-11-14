export const applications = [
	{
		id: "journal",
		description: "Notes on tinkering, discoveries, and things worth keeping.",
		path: "/journal/",
		title: "Lab Notebook",
		topLink: true,
	},
	{
		id: "blog",
		description: "Essays and thoughts on technology, design, and life.",
		path: "/blog/",
		title: "Blog",
		topLink: true,
		url: "https://abhi.now/blog",
	},
	{
		id: "weeknotes",
		description: "Weekly notes on work, life, and everything in between.",
		path: "/weeknotes/",
		title: "Weeknotes",
		topLink: true,
		url: "https://abhi.now/weeknotes",
	},
	{
		id: "projects",
		description: "Things I’m building and experiments I’m working on.",
		path: "/projects/",
		title: "Projects",
		topLink: true,
		url: "https://abhi.now/projects",
	},
	{
		id: "snippets",
		description: "Small pieces of code and useful technical notes.",
		path: "/snippets/",
		title: "Snippets",
		url: "https://abhi.now/snippets",
	},
	{
		id: "settings",
		description: "Preferences for this computer.",
		path: "/settings/",
		title: "Settings",
	},
	{
		id: "colophon",
		description: "The artists and resources behind this computer.",
		path: "/colophon/",
		title: "Colophon",
	},
] as const;

export type ApplicationId = (typeof applications)[number]["id"];
