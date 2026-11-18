# Browser tests

Run from a PowerShell subprocess with PHP, Node, and Microsoft Edge installed:

```powershell
powershell -NoProfile -File tests/browser/run.ps1
```

The expanded PDF checks also require Python 3 and PyMuPDF
(`python -m pip install PyMuPDF`). These are QA dependencies, not application
runtime dependencies.

Build the frontend first with `npm run build`. Clear cached Laravel configuration
with `php artisan config:clear` before testing if configuration has been cached.

The runner uses a disposable SQLite database at
`storage/app/browser-testing.sqlite` and a separate server on port 8018.
It resets that database, creates test accounts for admin and manager, and keeps
CSRF protection enabled. It does not edit `.env` or the normal application database.
Playwright is installed in the system temporary directory; Edge runs headless.
To watch the automated steps in a separate Edge window, use
`powershell -NoProfile -File tests/browser/run.ps1 -Visible`. Avoid interacting
with that window until the run finishes. The visible run uses the same isolated
database and port 8018, and closes its test server when finished.

After a full browser run has created its disposable fixtures, the focused report
print check can be run with `powershell -NoProfile -File tests/browser/run-report-print.ps1`.
It uses the existing isolated browser database and produces PDFs for both roles,
all five report tabs, and an empty result. It does not reset the database.

Checks cover all page routes and session restoration, master data create/edit/status
and search, company image upload and reload, settings, users without email,
invoice create/edit/publish/cancel/preview/download, partial and final payments,
income and expense create/edit, report filters, manager restrictions, logout,
JavaScript exceptions, HTTP 500 responses, and mobile dashboard layout.
Additional checks verify account and vendor filters for both roles.

Results, screenshots, and downloaded PDFs are saved to
`storage/app/browser-test-results/`. Functional API and policy tests run separately
with `php artisan test` and use an in-memory SQLite database.

The default runner executes the smoke suite, filter suite, login required-field
and password-visibility checks, then
`full-system.cjs`, and five additional manager transaction filter combinations.
This expanded suite compares actual browser writes with API
responses and direct database snapshots, exercises payment atomicity and
concurrent workers, and checks both roles at five viewport sizes. Negative
requests are explicitly marked; unexpected failed requests, JavaScript errors,
and HTTP errors fail the final health check.

The business clock is fixed to 17 November 2026, 12:00 Asia/Jakarta in the
dedicated PHP router and browser contexts. Timers still run normally. The router
preserves normal session-cookie lifetimes against the real system clock, so
the fixed business date does not disable CSRF or expire every session cookie.
The application itself uses its normal clock outside this test router.

Uploads use `storage/app/public/browser-tests`, synthetic fixtures, and the
public application logo. Original company uploads are never fixture sources.
PDF caches use `storage/app/browser-test-results/pdf-cache`. The database helper
checks the resolved exact SQLite path before allowing a reset or snapshot.
Snapshots omit password hashes and remember tokens.

The default runner also verifies and renders downloaded PDFs using Python and
PyMuPDF. To repeat the PDF check independently:

```powershell
python tests/browser/verify-pdfs.py
```

This checks A4 size, expected text across page breaks, image presence, clipping,
column headers staying with item rows, and signer overlap, and produces page PNGs for visual inspection. Evidence is
recorded in `json/pdf-verification.json`.

`pdf-layout.php` is a read-only layout probe for the isolated database. It renders
an unsaved invoice clone with a long description; it does not insert or edit
database records. The database environment must point to the exact guarded
browser-testing SQLite file before running it.

During development, `-Suite full -Focus financial` (or `remaining`, `settings`,
`users`, `responsive`, `double`) reuses the last isolated fixture state. A focused
run is explicitly **not** a full-system PASS. Final regression must use the
default command without `-Focus`, which starts from clean isolated fixtures.
