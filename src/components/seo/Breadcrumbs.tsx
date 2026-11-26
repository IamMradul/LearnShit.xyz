import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  return (
    <nav
      aria-label="Breadcrumb"
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '12px 0',
        marginBottom: 20,
        fontSize: 13,
        fontFamily: "'Inter', -apple-system, sans-serif",
        color: 'rgba(247, 245, 239, 0.6)',
      }}
    >
      <ol
        style={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 6,
          listStyle: 'none',
          padding: 0,
          margin: 0,
        }}
      >
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li
              key={item.url}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              {index === 0 ? (
                <a
                  href={item.url}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    color: isLast ? 'var(--text-primary)' : 'rgba(247, 245, 239, 0.7)',
                    textDecoration: 'none',
                    fontWeight: isLast ? 600 : 400,
                  }}
                >
                  <Home size={13} aria-hidden="true" />
                  <span>{item.name}</span>
                </a>
              ) : isLast ? (
                <span
                  aria-current="page"
                  style={{
                    color: 'var(--text-primary)',
                    fontWeight: 600,
                  }}
                >
                  {item.name}
                </span>
              ) : (
                <a
                  href={item.url}
                  style={{
                    color: 'rgba(247, 245, 239, 0.7)',
                    textDecoration: 'none',
                  }}
                >
                  {item.name}
                </a>
              )}

              {!isLast && (
                <ChevronRight
                  size={12}
                  style={{ opacity: 0.4 }}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
