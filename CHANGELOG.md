# Changelog

What changed in each version of `@sharadox/git-hub-action-library`, newest first.

## 0.2.2

Prerelease cleanup removes a feature's npm tag with Trusted Publishing when no token is given (npm 11.21, whose Trusted Publishing can change dist-tags), so packages need no npm token at all.

## 0.2.1

Verify installs only Chromium on the self-hosted runner (its system libraries are installed already; `--with-deps` failed there on every run), and gives the npm token to the install alone through a settings file it removes, instead of a token setting every later step warned about.
