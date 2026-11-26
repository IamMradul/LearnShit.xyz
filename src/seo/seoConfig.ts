export interface PageSeoConfig {
  title: string;
  description: string;
  canonicalUrl: string;
  ogType: 'website' | 'article';
  ogImage: string;
  keywords: string[];
  breadcrumbs?: Array<{ name: string; url: string }>;
  structuredData?: Record<string, unknown>[];
}

export const SITE_URL = 'https://learnshit.xyz';
export const SITE_NAME = 'LearnShit';
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;
export const AUTHOR_NAME_PLACEHOLDER = 'YOUR_NAME'; // Placeholders to be filled by site owner

export const SEO_PAGES: Record<string, PageSeoConfig> = {
  home: {
    title: 'Algorithm & Data Structure Visualizer | LearnShit',
    description:
      'Interactive step-by-step code execution visualizer for Python, JavaScript, and C++. Master DSA with animated data structures, real traces, and playgrounds.',
    canonicalUrl: `${SITE_URL}/`,
    ogType: 'website',
    ogImage: DEFAULT_OG_IMAGE,
    keywords: [
      'algorithm visualizer',
      'data structure visualizer',
      'code execution tracer',
      'python visualizer',
      'dsa animation',
      'learn data structures',
    ],
    structuredData: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'LearnShit',
        alternateName: ['learnshit.xyz', 'Learn Shit'],
        url: `${SITE_URL}/`,
        description:
          'Interactive step-by-step code execution visualizer for Python, JavaScript, and C++. Master DSA with animated data structures, real traces, and playgrounds.',
      },
      {
        '@context': 'https://schema.org',
        '@type': 'EducationalOrganization',
        name: 'LearnShit',
        url: `${SITE_URL}/`,
        logo: `${SITE_URL}/learnshit.svg`,
        email: 'learnshit.xyz@gmail.com',
        sameAs: ['https://github.com/IamMradul/LearnShit.xyz'],
      },
    ],
  },

  visualizer: {
    title: 'Interactive Code Execution Tracer & IDE | LearnShit',
    description:
      'Run Python, JavaScript, and C++ code step by step. Inspect variables, recursion call trees, memory mutations, and algorithmic complexity in real time.',
    canonicalUrl: `${SITE_URL}/visualizer`,
    ogType: 'website',
    ogImage: DEFAULT_OG_IMAGE,
    keywords: [
      'code visualizer ide',
      'in-browser python execution',
      'recursion tree visualizer',
      'step by step code tracer',
      'memory mutation inspector',
    ],
    breadcrumbs: [
      { name: 'Home', url: `${SITE_URL}/` },
      { name: 'Visualizer', url: `${SITE_URL}/visualizer` },
    ],
    structuredData: [
      {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'LearnShit Code Visualizer',
        applicationCategory: 'EducationalApplication',
        operatingSystem: 'All',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
        description:
          'Interactive algorithm and code execution visualizer supporting Python, JavaScript, and transpiled C++, Java, Go, and Rust with real-time state inspection.',
        url: `${SITE_URL}/visualizer`,
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: `${SITE_URL}/`,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Visualizer',
            item: `${SITE_URL}/visualizer`,
          },
        ],
      },
    ],
  },

  books: {
    title: 'CS Library & Canonical Engineering Books | LearnShit',
    description:
      'Interactive 3D shelf of foundational Computer Science books: CLRS, TAOCP, CS:APP, DDIA, OSTEP, SICP, Dragon Book, and more with takeaways and companions.',
    canonicalUrl: `${SITE_URL}/books`,
    ogType: 'website',
    ogImage: DEFAULT_OG_IMAGE,
    keywords: [
      'computer science books',
      'algorithms textbook shelf',
      'clrs book',
      'ddia summary',
      'cs student library',
    ],
    breadcrumbs: [
      { name: 'Home', url: `${SITE_URL}/` },
      { name: 'Books', url: `${SITE_URL}/books` },
    ],
    structuredData: [
      {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'LearnShit CS Library & Engineering Books',
        description:
          'Curated interactive 3D shelf of foundational computer science and software engineering books.',
        url: `${SITE_URL}/books`,
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: `${SITE_URL}/`,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Books',
            item: `${SITE_URL}/books`,
          },
        ],
      },
    ],
  },

  playgrounds: {
    title: 'Algorithm Playgrounds & Visualizations | LearnShit',
    description:
      'Explore 26+ interactive algorithm playgrounds. Test sorting, graph traversals, binary search trees, and dynamic programming with custom live inputs.',
    canonicalUrl: `${SITE_URL}/playgrounds`,
    ogType: 'website',
    ogImage: DEFAULT_OG_IMAGE,
    keywords: [
      'algorithm playgrounds',
      'sorting visualizer',
      'graph traversal playground',
      'binary search tree interactive',
      'dijkstra playground',
    ],
    breadcrumbs: [
      { name: 'Home', url: `${SITE_URL}/` },
      { name: 'Playgrounds', url: `${SITE_URL}/playgrounds` },
    ],
    structuredData: [
      {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'LearnShit Algorithm Playgrounds',
        applicationCategory: 'EducationalApplication',
        operatingSystem: 'All',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
        description:
          '26+ curated interactive algorithm simulation playgrounds covering arrays, graphs, trees, and dynamic programming.',
        url: `${SITE_URL}/playgrounds`,
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: `${SITE_URL}/`,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Playgrounds',
            item: `${SITE_URL}/playgrounds`,
          },
        ],
      },
    ],
  },

  dsa: {
    title: 'Data Structures & Algorithms DSA Guide | LearnShit',
    description:
      'Comprehensive reference of data structures and algorithms with time and space complexity, key invariants, curated interview problems, and code snippets.',
    canonicalUrl: `${SITE_URL}/dsa`,
    ogType: 'article',
    ogImage: DEFAULT_OG_IMAGE,
    keywords: [
      'dsa guide',
      'data structures reference',
      'algorithm time complexity',
      'coding interview algorithms',
      'leetcode patterns',
    ],
    breadcrumbs: [
      { name: 'Home', url: `${SITE_URL}/` },
      { name: 'DSA Guide', url: `${SITE_URL}/dsa` },
    ],
    structuredData: [
      {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'Comprehensive Data Structures & Algorithms (DSA) Interactive Guide',
        description:
          'Reference guide covering time and space complexities, invariants, and implementation patterns for essential data structures and algorithms.',
        datePublished: '2026-01-15T00:00:00+00:00',
        dateModified: '2026-11-24T00:00:00+00:00',
        author: {
          '@type': 'Person',
          name: AUTHOR_NAME_PLACEHOLDER,
        },
        publisher: {
          '@type': 'Organization',
          name: 'LearnShit',
          logo: {
            '@type': 'ImageObject',
            url: `${SITE_URL}/learnshit.svg`,
          },
        },
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': `${SITE_URL}/dsa`,
        },
        image: DEFAULT_OG_IMAGE,
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: `${SITE_URL}/`,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'DSA Guide',
            item: `${SITE_URL}/dsa`,
          },
        ],
      },
    ],
  },

  resources: {
    title: 'Curated Coding Interview DSA Sheets & Roadmaps | LearnShit',
    description:
      'Curated collection of top coding interview preparation sheets, DSA roadmaps, recommended computer science books, and topic checklists for engineers.',
    canonicalUrl: `${SITE_URL}/resources`,
    ogType: 'website',
    ogImage: DEFAULT_OG_IMAGE,
    keywords: [
      'dsa sheets',
      'striver sde sheet',
      'neetcode 150 roadmap',
      'cs books free',
      'coding interview roadmap',
    ],
    breadcrumbs: [
      { name: 'Home', url: `${SITE_URL}/` },
      { name: 'Resources', url: `${SITE_URL}/resources` },
    ],
    structuredData: [
      {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Curated DSA Interview Preparation Sheets & Resources',
        description:
          'Directory of curated DSA practice sheets, roadmaps, and computer science study books.',
        url: `${SITE_URL}/resources`,
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: `${SITE_URL}/`,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Resources',
            item: `${SITE_URL}/resources`,
          },
        ],
      },
    ],
  },

  about: {
    title: 'About Interactive CS Learning Platform | LearnShit',
    description:
      'LearnShit is an open-access computer science learning platform built to help developers truly understand code execution through interactive visualization.',
    canonicalUrl: `${SITE_URL}/about`,
    ogType: 'website',
    ogImage: DEFAULT_OG_IMAGE,
    keywords: [
      'about learnshit',
      'open source education',
      'cs visualizer mission',
      'interactive learning platform',
    ],
    breadcrumbs: [
      { name: 'Home', url: `${SITE_URL}/` },
      { name: 'About', url: `${SITE_URL}/about` },
    ],
    structuredData: [
      {
        '@context': 'https://schema.org',
        '@type': 'AboutPage',
        name: 'About LearnShit',
        description:
          'LearnShit is an educational platform dedicated to demystifying algorithms and data structures through live execution traces.',
        url: `${SITE_URL}/about`,
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: `${SITE_URL}/`,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'About',
            item: `${SITE_URL}/about`,
          },
        ],
      },
    ],
  },

  contact: {
    title: 'Contact LearnShit Developers & Feedback | LearnShit',
    description:
      'Get in touch with the LearnShit development team. Share algorithm suggestions, report tracer issues, or propose open educational collaboration ideas.',
    canonicalUrl: `${SITE_URL}/contact`,
    ogType: 'website',
    ogImage: DEFAULT_OG_IMAGE,
    keywords: [
      'contact learnshit',
      'report tracer bug',
      'suggest algorithm',
      'developer contact',
    ],
    breadcrumbs: [
      { name: 'Home', url: `${SITE_URL}/` },
      { name: 'Contact', url: `${SITE_URL}/contact` },
    ],
    structuredData: [
      {
        '@context': 'https://schema.org',
        '@type': 'ContactPage',
        name: 'Contact LearnShit Team',
        description: 'Contact form and communication channels for the LearnShit platform.',
        url: `${SITE_URL}/contact`,
        email: 'learnshit.xyz@gmail.com',
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: `${SITE_URL}/`,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Contact',
            item: `${SITE_URL}/contact`,
          },
        ],
      },
    ],
  },

  privacy: {
    title: 'Privacy Policy & Browser Execution Safety | LearnShit',
    description:
      'LearnShit privacy policy. All code runs locally in your browser sandbox with zero tracking of user algorithm source code. Read our transparent policies.',
    canonicalUrl: `${SITE_URL}/privacy`,
    ogType: 'website',
    ogImage: DEFAULT_OG_IMAGE,
    keywords: [
      'learnshit privacy',
      'in-browser execution safety',
      'code privacy',
      'data protection',
    ],
    breadcrumbs: [
      { name: 'Home', url: `${SITE_URL}/` },
      { name: 'Privacy Policy', url: `${SITE_URL}/privacy` },
    ],
    structuredData: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'LearnShit Privacy Policy',
        description: 'Privacy policy explaining local sandbox execution and data handling.',
        url: `${SITE_URL}/privacy`,
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: `${SITE_URL}/`,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Privacy Policy',
            item: `${SITE_URL}/privacy`,
          },
        ],
      },
    ],
  },

  'not-found': {
    title: 'Page Not Found (404 Error) | LearnShit',
    description:
      'The requested page could not be found. Explore our interactive algorithm visualizers, DSA guides, and coding playgrounds from the LearnShit homepage.',
    canonicalUrl: `${SITE_URL}/404`,
    ogType: 'website',
    ogImage: DEFAULT_OG_IMAGE,
    keywords: ['404 not found', 'learnshit error'],
    structuredData: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'Page Not Found',
        description: 'The requested resource could not be found.',
        url: `${SITE_URL}/404`,
      },
    ],
  },
};

export function getSeoForRoute(route: string): PageSeoConfig {
  return SEO_PAGES[route] || SEO_PAGES.home;
}
