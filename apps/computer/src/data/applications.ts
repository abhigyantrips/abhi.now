export const applications = [
	{ id: "journal", path: "/journal/", title: "Tinkering Journal", favoriteLabel: "Journal" },
	{ id: "blog", path: "/blog/", title: "Blog", favoriteLabel: "Blog", url: "https://abhi.now/blog" },
	{
		id: "weeknotes",
		path: "/weeknotes/",
		title: "Weeknotes",
		favoriteLabel: "Weeknotes",
		url: "https://abhi.now/weeknotes",
	},
	{
		id: "projects",
		path: "/projects/",
		title: "Projects",
		favoriteLabel: "Projects",
		url: "https://abhi.now/projects",
	},
	{ id: "snippets", path: "/snippets/", title: "Snippets", url: "https://abhi.now/snippets" },
	{ id: "whoami", path: "/whoami/", title: "Whoami", url: "https://abhi.now/whoami" },
	{ id: "settings", path: "/settings/", title: "Settings" },
	{ id: "colophon", path: "/colophon/", title: "Colophon" },
] as const;

export type ApplicationId = (typeof applications)[number]["id"];
