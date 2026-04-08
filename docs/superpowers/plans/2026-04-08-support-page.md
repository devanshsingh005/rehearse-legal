# Support Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a simple standalone support page and surface it in site navigation so Re-Hearse has a clear support URL for App Store review.

**Architecture:** Reuse the established legal-page pattern for a new `support/index.html` page so the change stays consistent with the static site and requires no new runtime dependencies. Update existing navigation links in the homepage and legal pages to expose the new destination.

**Tech Stack:** Static HTML, shared `style.css`, shared `subpage.js`

---

## File Structure

- Create: `support/index.html`
- Create: `docs/superpowers/specs/2026-04-08-support-page-design.md`
- Create: `docs/superpowers/plans/2026-04-08-support-page.md`
- Modify: `index.html`
- Modify: `privacy-policy/index.html`
- Modify: `terms-of-service/index.html`

### Task 1: Add the Support Page

**Files:**
- Create: `support/index.html`
- Reuse: `subpage.js`, `style.css`
- Test: manual browser verification

- [ ] **Step 1: Define the support-page content and structure**

```html
<header class="header">
  <h1>Support</h1>
  <span class="last-updated">We're here to help with Re-Hearse.</span>
</header>

<div class="container">
  <main>
    <section>
      <h2>How to Reach Us</h2>
      <p>Email us at <strong><a href="mailto:devansh.singh20045@gmail.com">devansh.singh20045@gmail.com</a></strong>.</p>
    </section>
  </main>
</div>
```

- [ ] **Step 2: Create `support/index.html` with the shared navbar and lightweight page behavior**

```html
<script defer src="../subpage.js"></script>
<link rel="stylesheet" href="../style.css">
<nav class="navbar" id="navbar">...</nav>
```

- [ ] **Step 3: Add help-topic and response-time sections**

```html
<section>
  <h2>What We Can Help With</h2>
  <ul>
    <li>Account access questions</li>
    <li>Sheet upload issues</li>
    <li>Bug reports and playback problems</li>
    <li>General app support</li>
  </ul>
</section>

<section>
  <h2>Response Time</h2>
  <p>We aim to respond as soon as possible, typically within 2-3 business days.</p>
</section>
```

- [ ] **Step 4: Open the page and verify it renders**

Run: `open support/index.html`
Expected: the new page loads with the same overall look and navbar pattern as the legal pages

- [ ] **Step 5: Commit**

```bash
git add support/index.html
git commit -m "feat: add support page"
```

### Task 2: Add Support Links Across the Site

**Files:**
- Modify: `index.html`
- Modify: `privacy-policy/index.html`
- Modify: `terms-of-service/index.html`
- Test: manual browser verification

- [ ] **Step 1: Add a support link to the homepage navbar and footer**

```html
<a href="support/index.html" class="data-magnetic">Support</a>
```

- [ ] **Step 2: Add a support link to the legal-page navbars**

```html
<a href="../support/index.html" class="data-magnetic">Support</a>
```

- [ ] **Step 3: Keep existing contact email links intact while exposing the dedicated support URL**

```html
<a href="support/index.html" class="data-magnetic">Support</a>
<a href="mailto:devansh.singh20045@gmail.com" class="data-magnetic">Contact Us</a>
```

- [ ] **Step 4: Verify navigation paths**

Run: `rg -n "support/index.html|../support/index.html" index.html privacy-policy/index.html terms-of-service/index.html`
Expected: homepage uses `support/index.html`; legal pages use `../support/index.html`

- [ ] **Step 5: Commit**

```bash
git add index.html privacy-policy/index.html terms-of-service/index.html
git commit -m "feat: link support page across the site"
```

### Task 3: Final Verification

**Files:**
- Test: `index.html`, `support/index.html`, `privacy-policy/index.html`, `terms-of-service/index.html`

- [ ] **Step 1: Verify direct support-page content**

Run: `rg -n "Support|How to Reach Us|What We Can Help With|Response Time|devansh.singh20045@gmail.com" support/index.html`
Expected: all required content is present

- [ ] **Step 2: Verify no broken relative links in edited pages**

Run: `rg -n "href=" index.html support/index.html privacy-policy/index.html terms-of-service/index.html`
Expected: support links and legal links resolve with the correct relative prefixes

- [ ] **Step 3: Review the edited pages in a browser**

Run: `open index.html support/index.html privacy-policy/index.html terms-of-service/index.html`
Expected: all four pages render; support page matches the site style; nav links are visible

- [ ] **Step 4: Commit final polish if needed**

```bash
git add support/index.html index.html privacy-policy/index.html terms-of-service/index.html
git commit -m "chore: verify support page integration"
```
