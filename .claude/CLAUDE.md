# Code Style

## Comments
Never add comments that explain what the code does. Code speaks for itself through well-named identifiers.

Only add a comment when the WHY is non-obvious: a hidden constraint, a subtle invariant, or a workaround for a specific bug.

In larger files, use `// MARK: - Section Name` to divide the file into navigable sections (Xcode-style). Use it for meaningful structural boundaries like Components, Screen, Helpers, Styles — not for every function.
