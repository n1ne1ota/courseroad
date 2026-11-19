import 'server-only';

import type { ChangelogEntry, PostEntry } from '../types/content-types';

/** The most items a feed carries. */
export const FEED_LIMIT = 20;

export interface FeedItem {
    description: string;
    /** `YYYY-MM-DD`; emitted as RFC 822 at 00:00:00 GMT. */
    date: string;
    guid: string;
    link: string;
    title: string;
}

export interface FeedChannel {
    description: string;
    feedUrl: string;
    items: readonly FeedItem[];
    link: string;
    title: string;
}

/** Escapes the five XML characters, so a title or description can never break out of its element. */
export function escapeXml(value: string): string {
    return value
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&apos;');
}

/** RFC 822 date at 00:00:00 GMT for a calendar date. */
export function rfc822(date: string): string {
    return new Date(`${date}T00:00:00Z`).toUTCString();
}

/** Builds an RSS 2.0 document. Items are written in the order given; the caller sorts and caps them. */
export function buildRss(channel: FeedChannel): string {
    const newest = channel.items[0];
    const items = channel.items
        .map(
            item => `    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${escapeXml(item.link)}</link>
      <guid isPermaLink="true">${escapeXml(item.guid)}</guid>
      <pubDate>${rfc822(item.date)}</pubDate>
      <description>${escapeXml(item.description)}</description>
    </item>`
        )
        .join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(channel.title)}</title>
    <link>${escapeXml(channel.link)}</link>
    <description>${escapeXml(channel.description)}</description>
    <language>en</language>
    <atom:link href="${escapeXml(channel.feedUrl)}" rel="self" type="application/rss+xml" />${newest ? `\n    <lastBuildDate>${rfc822(newest.date)}</lastBuildDate>` : ''}
${items}
  </channel>
</rss>
`;
}

function absolute(path: string, siteUrl: string) {
    return new URL(path, siteUrl).toString();
}

export function postsFeed(posts: readonly PostEntry[], siteUrl: string, siteName: string): string {
    return buildRss({
        description: `Articles and updates from ${siteName}.`,
        feedUrl: absolute('/blog/rss.xml', siteUrl),
        items: posts.slice(0, FEED_LIMIT).map(post => ({
            date: post.publishedAt,
            description: post.description,
            guid: absolute(`/blog/${post.slug}`, siteUrl),
            link: absolute(`/blog/${post.slug}`, siteUrl),
            title: post.title
        })),
        link: absolute('/blog', siteUrl),
        title: `${siteName} Blog`
    });
}

export function changelogFeed(entries: readonly ChangelogEntry[], siteUrl: string, siteName: string): string {
    return buildRss({
        description: `What is new in ${siteName}.`,
        feedUrl: absolute('/changelog/rss.xml', siteUrl),
        items: entries.slice(0, FEED_LIMIT).map(entry => ({
            date: entry.date,
            description: `${entry.kind[0]?.toUpperCase() ?? ''}${entry.kind.slice(1)} for ${entry.audience.join(', ')}`,
            guid: absolute(`/changelog#${entry.id}`, siteUrl),
            link: absolute(`/changelog#${entry.id}`, siteUrl),
            title: entry.title
        })),
        link: absolute('/changelog', siteUrl),
        title: `${siteName} Changelog`
    });
}
