import type { Route, Site, Social } from '@/types';

export const SITE: Site = {
	TITLE: 'abhigyan trips.',
	DESCRIPTION: 'working towards a more distraction-free internet.',
	AUTHOR: 'Abhigyan Trips',
	URL: 'https://abhi.now',
};

export const ROUTES: Route[] = [
	{ NAME: 'whoami', PATH: '/whoami', ICON: '/icons/question.svg', COLOR: '#689D6A' },
	{ NAME: 'blog', PATH: '/blog', ICON: '/icons/note.svg', COLOR: '#076678' },
	{ NAME: 'snippets', PATH: '/snippets', ICON: '/icons/photo.svg', COLOR: '#79740E' },
	{ NAME: 'projects', PATH: '/projects', ICON: '/icons/automation.svg', COLOR: 'darkblue' },
	{ NAME: 'anti-vision', PATH: '/anti-vision', ICON: '/icons/hide.svg', COLOR: '#CC241D' },
	{ NAME: 'people', PATH: '/people', ICON: '/icons/crown.svg', COLOR: 'orange' },
	{ NAME: 'media', PATH: '/media', ICON: '/icons/movie-clapper.svg', COLOR: '#B16286' },
	{ NAME: 'now', PATH: '/now', ICON: '/icons/point-down.svg', COLOR: 'darkorange' },
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
