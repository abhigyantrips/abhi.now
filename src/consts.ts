import type { Route, Site, Social } from '@/types';

export const SITE: Site = {
	TITLE: 'abhi.now',
	DESCRIPTION: 'personal website of abhi',
	AUTHOR: 'Abhigyan Trips',
	URL: 'https://abhi.now',
};

export const ROUTES: Route[] = [
	{ NAME: 'whoami', PATH: '/whoami', ICON: '/icons/whoami.svg', COLOR: 'cyan' },
	{ NAME: 'blog', PATH: '/blog', ICON: '/icons/blog.svg', COLOR: 'blue' },
	{ NAME: 'snippets', PATH: '/snippets', ICON: '/icons/snippets.svg', COLOR: 'green' },
	{ NAME: 'projects', PATH: '/projects', ICON: '/icons/projects.svg', COLOR: 'purple' },
	{ NAME: 'anti-vision', PATH: '/anti-vision', ICON: '/icons/anti-vision.svg', COLOR: 'red' },
	{ NAME: 'photos', PATH: '/photos', ICON: '/icons/photos.svg', COLOR: 'orange' },
	{ NAME: 'media', PATH: '/media', ICON: '/icons/media.svg', COLOR: 'yellow' },
	{ NAME: 'now', PATH: '/now', ICON: '/icons/now.svg', COLOR: 'pink' },
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
