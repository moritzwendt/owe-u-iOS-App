# Code Style

## Comments
Never add comments that explain what the code does. Code speaks for itself through well-named identifiers.

Only add a comment when the WHY is non-obvious: a hidden constraint, a subtle invariant, or a workaround for a specific bug.

In larger files, use `// MARK: - Section Name` to divide the file into navigable sections (Xcode-style). Use it for meaningful structural boundaries like Components, Screen, Helpers, Styles — not for every function.

# Versioning

The app version is defined in `app/(tabs)/profil.tsx` as `APP_VERSION` and displayed in the profile footer.

Increment rules:
- Patch (`1.0.x`): small fixes, UI tweaks, minor corrections
- Minor (`1.x.0`): new features or meaningful user-visible additions
- Major (`x.0.0`): large redesigns or breaking changes

Always update `APP_VERSION` when making changes to the app.
