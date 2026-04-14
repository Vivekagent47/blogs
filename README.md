# Personal Publishing Website

A content-first personal site built with Next.js App Router, TypeScript, Tailwind CSS, and MDX.

## Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS + existing shadcn theme tokens
- MDX content files in `content/`
- RSS feed at `/rss.xml`
- Sitemap at `/sitemap.xml`

## Run locally

```bash
bun install
bun run dev
```

## Content model

All published writing is file-based MDX:

- `content/blog/*.mdx`

Required frontmatter fields:

```yaml
title: "Post title"
description: "Short summary for cards and SEO"
date: "YYYY-MM-DD"
updatedAt: "YYYY-MM-DD" # optional
tags:
  - tag-one
  - tag-two
draft: false
coverImage: "/images/example.jpg" # optional
```

## Publishing workflow

1. Add a new `.mdx` file in `content/blog`.
2. Use a unique file name; it becomes the URL slug.
3. Set `draft: false` to publish.

Draft behavior:

- Development: drafts are visible.
- Production: drafts are excluded from lists, routes, RSS, and sitemap.

## Quality checks

```bash
bun run test
bun run typecheck
bun run lint
bun run build
```

## Comments setup

The blog now supports first-party comments backed by Supabase.

1. Copy `.env.example` to `.env.local`.
2. Fill in:
   - `SUPABASE_URL`
   - `SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_SECRET_KEY` or `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SITE_URL`
   - `COMMENTS_AUTH_REDIRECT_URL`
3. Run the SQL in [supabase/comments.sql](/Users/apple/Work/blogs/supabase/comments.sql).
4. In Supabase Auth, edit the `Magic Link` email template and replace the default `{{ .ConfirmationURL }}` with a server-side verification link:

```txt
{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&redirect_to={{ .RedirectTo }}
```

5. Add your local and production site URLs to Supabase Auth redirect URLs and URL Configuration allow list.

Comments are plain text only, require email magic-link sign-in, block links for new users, and auto-hide heavily reported comments. If Supabase is not configured, the site still builds and the comment area renders as offline.

This comments implementation does not use a browser-side Supabase client, so the Supabase project URL and publishable key are kept server-only as `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY`.

## Comment moderation flow

Moderation in v1 is handled from the Supabase dashboard, not from a custom admin page.

### Core tables

- `public.comments`
  Stores each comment, reply, and moderation state.
- `public.comment_reports`
  Stores abuse reports from readers.
- `public.comment_user_moderation`
  Stores whether a user is trusted or banned.
- `public.profiles`
  Stores the public display name for each commenter.
- `public.comment_rate_limits`
  Stores per-user and per-IP rate-limit buckets. Useful for debugging abuse bursts.

### What the app already enforces

- Email magic-link sign-in is required before posting.
- Comments are plain text only.
- New users cannot post links until marked trusted.
- One reply level only.
- Comment authors can edit only for 15 minutes after posting.
- Comment authors can delete their own comments.
- Users can post at most `5` comments per minute.
- Users can post at most `30` comments per day.
- Open reports auto-hide a comment after `3` reports.

### Daily moderation workflow

1. Open Supabase Dashboard.
2. Go to `Table Editor`.
3. Review `public.comment_reports` first.
   Filter `status = open` and sort by `created_at desc`.
4. For each report, inspect the related `comment_id` in `public.comments`.
5. If the comment is abusive or spammy:
   - hide the comment
   - optionally ban the user
   - mark the report as reviewed
6. If the report is not valid:
   - leave the comment visible
   - mark the report as dismissed
7. Periodically review `public.comment_user_moderation`:
   - mark good users as trusted
   - confirm banned users stay banned only when necessary

### Recommended moderation actions

#### 1. Monitor open reports

Use the table editor or run:

```sql
select
  cr.id,
  cr.created_at,
  cr.reason,
  cr.status,
  cr.comment_id,
  c.post_slug,
  c.author_id,
  c.body,
  c.status as comment_status
from public.comment_reports cr
join public.comments c on c.id = cr.comment_id
where cr.status = 'open'
order by cr.created_at desc;
```

#### 2. Hide a bad comment

This removes it from the public thread but keeps the record for audit/history.

```sql
update public.comments
set
  status = 'hidden',
  hidden_at = timezone('utc', now()),
  moderation_reason = 'manual_hide'
where id = 'COMMENT_ID_HERE';
```

#### 3. Restore a hidden comment

Use this if a report was incorrect.

```sql
update public.comments
set
  status = 'visible',
  hidden_at = null,
  moderation_reason = null
where id = 'COMMENT_ID_HERE';
```

#### 4. Ban a user from commenting

This blocks future comments, replies, edits, and reports from that account.

```sql
update public.comment_user_moderation
set is_banned = true
where user_id = 'USER_ID_HERE';
```

If you also want to hide everything they already posted:

```sql
update public.comments
set
  status = 'hidden',
  hidden_at = timezone('utc', now()),
  moderation_reason = 'author_banned'
where author_id = 'USER_ID_HERE'
  and status = 'visible';
```

#### 5. Unban a user

```sql
update public.comment_user_moderation
set is_banned = false
where user_id = 'USER_ID_HERE';
```

#### 6. Mark a user as trusted

Trusted users are allowed to post links.

```sql
update public.comment_user_moderation
set is_trusted = true
where user_id = 'USER_ID_HERE';
```

#### 7. Remove trusted status

```sql
update public.comment_user_moderation
set is_trusted = false
where user_id = 'USER_ID_HERE';
```

#### 8. Mark reports as reviewed

Use this after you have taken action.

```sql
update public.comment_reports
set status = 'reviewed'
where comment_id = 'COMMENT_ID_HERE'
  and status = 'open';
```

#### 9. Dismiss invalid reports

```sql
update public.comment_reports
set status = 'dismissed'
where comment_id = 'COMMENT_ID_HERE'
  and status = 'open';
```

### Useful investigation queries

#### Recent comments with author names

```sql
select
  c.id,
  c.created_at,
  c.post_slug,
  p.display_name,
  c.author_id,
  c.parent_id,
  c.status,
  c.body
from public.comments c
left join public.profiles p on p.id = c.author_id
order by c.created_at desc
limit 100;
```

#### See all comments from one user

```sql
select
  id,
  created_at,
  post_slug,
  status,
  body
from public.comments
where author_id = 'USER_ID_HERE'
order by created_at desc;
```

#### See users who are banned or trusted

```sql
select
  m.user_id,
  p.display_name,
  m.is_trusted,
  m.is_banned,
  m.updated_at
from public.comment_user_moderation m
left join public.profiles p on p.id = m.user_id
where m.is_trusted = true
   or m.is_banned = true
order by m.updated_at desc;
```

#### Inspect rate-limit spikes

```sql
select
  scope,
  scope_key,
  window_starts_at,
  attempts,
  updated_at
from public.comment_rate_limits
order by updated_at desc
limit 100;
```

### Suggested moderation policy

- Hide comments instead of deleting them directly. `hidden` is safer for review and audit history.
- Ban only when there is repeated spam, harassment, or obvious abuse.
- Use `is_trusted = true` for known good commenters who need to share useful links.
- Mark reports as `reviewed` or `dismissed` after action so the queue stays clean.
- If a comment was auto-hidden after repeated reports, manually confirm whether it should stay hidden or be restored.

### Notes about status fields

- `comments.status = visible`
  Comment is shown publicly.
- `comments.status = hidden`
  Comment is hidden by moderation or auto-hide rules.
- `comments.status = deleted`
  Comment was deleted, usually by its author.
- `comment_reports.status = open`
  Needs moderation review.
- `comment_reports.status = reviewed`
  Action taken or confirmed.
- `comment_reports.status = dismissed`
  Report was invalid or not actionable.
