export type Page = {
	TITLE: string;
	DESCRIPTION: string;
};

export interface Site extends Page {
	AUTHOR: string;
	URL: string;
}

export type Route = {
	NAME: string;
	PATH: string;
	ICON: string;
	COLOR: string;
	DESCRIPTION: string;
};

export type Social = {
	NAME: string;
	TEXT: string;
	COLOR: string;
	HREF: string;
};
