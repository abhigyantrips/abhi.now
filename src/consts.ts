import type { Route, Site, Social } from '@/types';

export const SITE: Site = {
	TITLE: 'abhigyan trips.',
	DESCRIPTION: 'working towards a more distraction-free internet.',
	AUTHOR: 'Abhigyan Trips',
	URL: 'https://abhi.now',
};

export const ROUTES: Route[] = [
	{ NAME: 'whoami', PATH: '/whoami', ICON: '/icons/question.svg', COLOR: 'grey' },
	{ NAME: 'blog', PATH: '/blog', ICON: '/icons/note.svg', COLOR: 'blue' },
	{ NAME: 'snippets', PATH: '/snippets', ICON: '/icons/photo.svg', COLOR: 'green' },
	{ NAME: 'projects', PATH: '/projects', ICON: '/icons/automation.svg', COLOR: 'darkblue' },
	{ NAME: 'anti-vision', PATH: '/anti-vision', ICON: '/icons/hide.svg', COLOR: 'red' },
	{ NAME: 'people', PATH: '/people', ICON: '/icons/crown.svg', COLOR: 'orange' },
	{ NAME: 'media', PATH: '/media', ICON: '/icons/movie-clapper.svg', COLOR: 'purple' },
	{ NAME: 'now', PATH: '/now', ICON: '/icons/point-down.svg', COLOR: 'pink' },
];

export const SOCIALS: Social[] = [
	{
		NAME: 'GitHub',
		ICON: '/icons/github.svg',
		TEXT: 'github',
		HREF: 'https://github.com/abhigyantrips',
	},
	{
		NAME: 'LinkedIn',
		ICON: '/icons/linkedin.svg',
		TEXT: 'linkedin',
		HREF: 'https://linkedin.com/in/abhigyantrips',
	},
	{
		NAME: 'Discord',
		ICON: '/icons/discord.svg',
		TEXT: 'discord',
		HREF: 'https://discord.gg/zdVnRaQVzn',
	},
];
