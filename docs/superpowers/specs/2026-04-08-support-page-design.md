# Support Page Design

## Goal

Add a simple standalone support page to the Re-Hearse marketing website so App Store reviewers and end users have a clear, permanent support URL.

## Context

The current site is a static HTML/CSS/JS website with:

- a landing page at `index.html`
- legal pages at `privacy-policy/index.html` and `terms-of-service/index.html`
- shared styling in `style.css`
- lightweight legal-page interactions in `subpage.js`

The existing legal pages already establish the right pattern for a content-heavy secondary page: shared navbar, theme toggle, custom cursor on desktop, and page-local inline styles.

## Recommended Approach

Create a new standalone page at `support/index.html` that reuses the existing legal-page structure and `subpage.js`, then add navigation links to it from the homepage and legal pages.

This keeps the support URL obvious, lightweight, and visually consistent without introducing new JavaScript or a new CSS bundle.

## Page Structure

The support page should include:

1. Hero header
   - Page title: `Support`
   - Short description explaining that users can contact Re-Hearse for help

2. Contact section
   - Primary support email: `devansh.singh20045@gmail.com`
   - Clear mailto link

3. Help topics section
   - A short list of common reasons to contact support
   - Examples: account access, upload issues, app questions, bug reports

4. Response-time section
   - A simple expectation such as responding as soon as possible or within a few business days

5. Optional note
   - Encourage users to include device/app details when reporting issues

## Navigation Changes

Update these locations to link to the new support page:

- `index.html` navbar
- `index.html` footer
- `privacy-policy/index.html` navbar
- `terms-of-service/index.html` navbar

The homepage can also keep the existing support email link in the footer if desired, but there should be a direct page link as well.

## Visual Design

Follow the existing legal-page visual language:

- same navbar shell
- same theme toggle behavior
- same dark/light styling approach
- same typography family choices
- same glassmorphism and orange-accent palette

The support page should feel slightly friendlier and simpler than the legal pages, with compact sections and clear calls to action.

## Error Handling / Edge Cases

- If JavaScript is unavailable, the page should still render correctly because the content is static.
- If theme state is unavailable, the page should default cleanly to dark mode like the rest of the site.
- Mailto links should remain functional without any client-side enhancement.

## Testing

Manual verification is sufficient for this static change:

- open the support page directly
- verify navbar links work
- verify theme toggle works on the support page
- verify mailto links are correct
- verify homepage and legal pages now expose the support page
- verify layout remains readable on mobile widths

## Scope

This design intentionally does not add:

- a support form backend
- FAQ search
- ticketing integration
- account deletion workflow
- refund policy content

Those can be added later if needed, but they are unnecessary for the current App Store compliance goal.
