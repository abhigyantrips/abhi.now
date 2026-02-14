import type { Route, Site, Social } from '@/types';

export const SITE: Site = {
	TITLE: 'abhigyan trips.',
	DESCRIPTION: 'working towards a more distraction-free internet.',
	AUTHOR: 'Abhigyan Trips',
	URL: 'https://abhi.now',
};

export const ROUTES: Route[] = [
	{
		NAME: 'whoami',
		PATH: '/whoami',
		ICON: '/icons/question.svg',
		COLOR: '#689D6A',
		DESCRIPTION: 'a little bit about who i am and what i do.',
	},
	{
		NAME: 'blog',
		PATH: '/blog',
		ICON: '/icons/note.svg',
		COLOR: '#076678',
		DESCRIPTION: 'thoughts, ideas, and random musings.',
	},
	{
		NAME: 'snippets',
		PATH: '/snippets',
		ICON: '/icons/photo.svg',
		COLOR: '#79740E',
		DESCRIPTION: 'sticky notes from my life i wanna document.',
	},
	{
		NAME: 'projects',
		PATH: '/projects',
		ICON: '/icons/automation.svg',
		COLOR: '#458588',
		DESCRIPTION: 'things i have built and that people found cool.',
	},
	{
		NAME: 'anti-vision',
		PATH: '/anti-vision',
		ICON: '/icons/hide.svg',
		COLOR: '#CC241D',
		DESCRIPTION: "my vision? pfft, that's too broad. i gotta start with what i *don't* want.",
	},
	{
		NAME: 'people',
		PATH: '/people',
		ICON: '/icons/crown.svg',
		COLOR: 'orange',
		DESCRIPTION: "people from my life who're doing crazy and cool things.",
	},
	{
		NAME: 'media',
		PATH: '/media',
		ICON: '/icons/movie-clapper.svg',
		COLOR: '#B16286',
		DESCRIPTION: 'media i consumed and cannot stop talking about.',
	},
	{
		NAME: 'now',
		PATH: '/now',
		ICON: '/icons/point-down.svg',
		COLOR: 'darkorange',
		DESCRIPTION:
			"hahahah see how the site is called 'abhi.now' and this page is called '/now' and-",
	},
];

export const SOCIALS: Social[] = [
	{
		NAME: 'GitHub',
		TEXT: 'github',
		COLOR: '#FF5C00',
		HREF: 'https://github.com/abhigyantrips',
	},
	{
		NAME: 'LinkedIn',
		TEXT: 'linkedin',
		COLOR: '#0077B5',
		HREF: 'https://linkedin.com/in/abhigyantrips',
	},
	{
		NAME: 'Discord',
		TEXT: 'discord',
		COLOR: '#5539CC',
		HREF: 'https://discord.gg/zdVnRaQVzn',
	},
];
