# Privacy Policy — AWS Extend Switch Roles

_Last updated: 2026/06/03_

AWS Extend Switch Roles ("the Extension") is a browser extension that lets you
switch between AWS IAM roles from the AWS Management Console using a role list
you configure yourself.

**Summary:** The Extension has no server of its own. It does not collect,
transmit, sell, or share your data with the developer or with any analytics or
advertising provider. Everything you configure stays in your own browser.

## Data the Extension handles

- **Your role configuration** — the AWS account IDs, IAM role names, display
  names, colors, and regions you enter (in `~/.aws/config`-style INI text).
  Stored in your browser via `chrome.storage` (the `sync` area, so it can follow
  your signed-in browser profile, or the `local` area) and cached in your
  browser's IndexedDB. Used only to render your switch-role menu.
- **Your display preferences** — for example visual mode (light/dark), "hide
  account id", and tab-grouping toggles, plus any supporter ("Golden Key") code.
  Stored locally in your browser; the Golden Key is verified locally. Never sent
  to the developer.
- **AWS console page data** — when you open the Extension on an AWS Management
  Console page, it reads the account ID and role currently shown on that page to
  determine which of your roles you can switch to, and submits the console's
  role-switch form to perform the switch you select. This happens entirely
  within your browser on the AWS page; it is not stored off your device or sent
  to the developer.

The Extension does **not** access your AWS credentials, passwords, cookies,
browsing history, or any website other than the AWS Management Console domains
listed under Permissions.

## What the Extension does NOT do

- No analytics, telemetry, tracking, or advertising.
- No selling or transferring of your data to third parties.
- No use of your data for any purpose other than switching AWS roles.
- No developer-operated server — the developer never receives your data.

## Permissions and why they are requested

- **`activeTab`** — to act on the AWS console tab you are viewing when you click
  the Extension.
- **`storage`** — to save your role configuration and preferences in your
  browser.
- **`tabGroups`** (optional) — only if you enable tab grouping; to group AWS
  console tabs by role.
- **Host access to AWS console domains** (`*.console.aws.amazon.com` and the AWS
  GovCloud, AWS China, AWS Health, and Lightsail console domains) — to read the
  signed-in account/role and submit role switches.

## Storage, retention, and deletion

Your configuration and preferences remain in your browser until you change or
remove them. Uninstalling the Extension removes its locally stored data;
configuration kept in the `sync` area is removed through your browser's
synced-data controls. You can clear your role list at any time from the
Extension's options page.

## Children

The Extension is a developer tool, not directed to children under 13, and
collects no data from them.

## Changes to this policy

Material changes will be posted here with an updated date.

## Contact

Maintainer: Matthew Nessworthy. Questions or requests:
<https://github.com/matthewnessworthy/aws-extend-switch-roles/issues>
