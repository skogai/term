import type { IdentityLike, Vfs } from './vfs.js';

const GLOB_META = new Set(['*', '?', '[']);
const REGEXP_META = /[\\^$.*+?()[\]{}|]/g;

const escapeRegExp = (s: string): string => s.replace(REGEXP_META, '\\$&');

const unescapeGlob = (s: string): string => s.replace(/\\(.)/g, '$1');

const hasUnescapedMeta = (s: string): boolean => {
  let escaped = false;
  for (const ch of s) {
    if (escaped) {
      escaped = false;
      continue;
    }
    if (ch === '\\') {
      escaped = true;
      continue;
    }
    if (GLOB_META.has(ch)) {
      return true;
    }
  }
  return false;
};

const normalizePattern = (
  pattern: string,
  cwd: string,
  identity: IdentityLike
) => {
  let expanded = pattern;
  if (expanded === '~') {
    expanded = `/home/${identity.name}`;
  } else if (expanded.startsWith('~/')) {
    expanded = `/home/${identity.name}${expanded.slice(1)}`;
  }

  const absolute = expanded.startsWith('/');
  const prefixed = absolute ? expanded : `${cwd || '/'}/${expanded}`;
  const parts = prefixed.split('/').filter(Boolean);
  const out: string[] = [];
  for (const part of parts) {
    if (part === '.') {
      continue;
    }
    if (part === '..') {
      out.pop();
      continue;
    }
    out.push(part);
  }

  return {
    absolute,
    absPattern: `/${out.join('/')}`,
    cwd: cwd === '/' ? '/' : cwd.replace(/\/$/, ''),
  };
};

const displayPath = (abs: string, absolute: boolean, cwd: string): string => {
  if (absolute) {
    return abs;
  }
  if (cwd === '/') {
    return abs.slice(1) || '.';
  }
  if (abs === cwd) {
    return '.';
  }
  if (abs.startsWith(`${cwd}/`)) {
    return abs.slice(cwd.length + 1);
  }
  return abs;
};

export function compileSegment(segment: string): RegExp {
  let pattern = '^';
  for (let i = 0; i < segment.length; i++) {
    const ch = segment[i] as string;
    if (ch === '\\') {
      const next = segment[i + 1];
      pattern += escapeRegExp(next ?? ch);
      if (next !== undefined) {
        i++;
      }
      continue;
    }
    if (ch === '*') {
      pattern += '.*';
      continue;
    }
    if (ch === '?') {
      pattern += '.';
      continue;
    }
    if (ch === '[') {
      let j = i + 1;
      let cls = '';
      if (segment[j] === '!' || segment[j] === '^') {
        cls += '^';
        j++;
      }
      if (segment[j] === ']') {
        cls += '\\]';
        j++;
      }
      let closed = false;
      for (; j < segment.length; j++) {
        const c = segment[j] as string;
        if (c === ']') {
          closed = true;
          break;
        }
        if (c === '\\') {
          const next = segment[j + 1];
          cls += escapeRegExp(next ?? c);
          if (next !== undefined) {
            j++;
          }
          continue;
        }
        cls += c === '^' ? '\\^' : c;
      }
      if (closed) {
        pattern += `[${cls}]`;
        i = j;
      } else {
        pattern += '\\[';
      }
      continue;
    }
    pattern += escapeRegExp(ch);
  }
  pattern += '$';
  return new RegExp(pattern);
}

export function globExpand(
  pattern: string,
  vfs: Vfs,
  cwd: string,
  identity: IdentityLike
): string[] {
  if (!hasUnescapedMeta(pattern)) {
    return [unescapeGlob(pattern)];
  }

  const normalized = normalizePattern(pattern, cwd, identity);
  const parts = normalized.absPattern.split('/').filter(Boolean);
  const matches: string[] = [];

  const walk = (base: string, index: number): void => {
    if (index >= parts.length) {
      matches.push(base || '/');
      return;
    }

    const segment = parts[index] as string;
    if (!hasUnescapedMeta(segment)) {
      const next =
        base === '/'
          ? `/${unescapeGlob(segment)}`
          : `${base}/${unescapeGlob(segment)}`;
      const resolved = vfs.resolve(next, '/', identity);
      if (resolved.ok) {
        walk(resolved.abs, index + 1);
      }
      return;
    }

    const stat = vfs.stat(base || '/', '/', identity);
    if (!stat.ok || stat.type !== 'dir') {
      return;
    }
    const listing = vfs.list(base || '/', '/', identity);
    if (!listing.ok) {
      return;
    }

    const matcher = compileSegment(segment);
    const includeDotfiles = segment.startsWith('.');
    for (const [name] of listing.entries) {
      if (!includeDotfiles && name.startsWith('.')) {
        continue;
      }
      if (!matcher.test(name)) {
        continue;
      }
      const next = base === '/' ? `/${name}` : `${base}/${name}`;
      walk(next, index + 1);
    }
  };

  walk('/', 0);

  if (matches.length === 0) {
    return [unescapeGlob(pattern)];
  }

  return matches
    .sort((a, b) => a.localeCompare(b))
    .map(path => displayPath(path, normalized.absolute, normalized.cwd));
}
