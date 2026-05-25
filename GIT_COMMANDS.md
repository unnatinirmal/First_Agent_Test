# Git Commands Reference

This document is a project-local Git reference for everyday work in this
repository. Commands are written for PowerShell.

## Start Here

Run commands from the repository root:

```powershell
cd G:\Unnati_Workspace\First_Agent_Test
```

Check which branch you are on and whether files changed:

```powershell
git status
git status --short
```

Use `git status --short` when you want compact output:

```text
 M file.txt      Modified tracked file
 A file.txt      Added staged file
 D file.txt      Deleted tracked file
?? file.txt      New untracked file
```

## Local Identity

Set commit author details for this repository only:

```powershell
git config --local user.name "Your Name"
git config --local user.email "your.email@example.com"
```

View local Git settings:

```powershell
git config --local --list
```

Check where a setting came from:

```powershell
git config --show-origin user.name
git config --show-origin user.email
```

## Inspect Changes

Show unstaged file changes:

```powershell
git diff
```

Show staged changes:

```powershell
git diff --cached
```

Show a summary of changed files:

```powershell
git diff --stat
git diff --cached --stat
```

Show changes for one file:

```powershell
git diff -- path/to/file
git diff --cached -- path/to/file
```

Show ignored files:

```powershell
git status --ignored
```

## Stage Changes

Stage all changes:

```powershell
git add .
```

Stage one file:

```powershell
git add path/to/file
```

Stage multiple files:

```powershell
git add file-one.txt file-two.txt
```

Interactively choose parts of files to stage:

```powershell
git add -p
```

Unstage a file without deleting your work:

```powershell
git restore --staged path/to/file
```

Unstage everything:

```powershell
git restore --staged .
```

## Commit Changes

Use the project commit message format from `AGENTS.md`:

```powershell
git commit -m "Short heading" -m "- Body line one" -m "- Body line two"
```

Rules:

- Heading must be less than 40 characters.
- Each body line must be less than 80 characters.
- Each body line must start with `- `.
- Prefer separate body lines over paragraphs.

Example:

```powershell
git commit -m "Add Git reference docs" -m "- Expand setup and workflow commands" -m "- Add safe undo and branch examples"
```

Amend the most recent commit message:

```powershell
git commit --amend
```

Amend the most recent commit after staging more files:

```powershell
git add path/to/file
git commit --amend --no-edit
```

## View History

Show compact history:

```powershell
git log --oneline
git log --oneline -5
```

Show history with branches:

```powershell
git log --oneline --decorate --graph --all
```

Show details for the latest commit:

```powershell
git show --stat
git show --name-only
```

Show details for a specific commit:

```powershell
git show <commit-hash>
git show --stat <commit-hash>
```

Find who last changed each line in a file:

```powershell
git blame path/to/file
```

## Branches

List local branches:

```powershell
git branch
```

List local and remote branches:

```powershell
git branch -a
```

Create a new branch:

```powershell
git switch -c branch-name
```

Switch to an existing branch:

```powershell
git switch branch-name
```

Rename the current branch:

```powershell
git branch -m new-branch-name
```

Delete a fully merged local branch:

```powershell
git branch -d branch-name
```

Force delete a local branch only when you are sure:

```powershell
git branch -D branch-name
```

## Remotes

Show configured remotes:

```powershell
git remote -v
```

Add a remote:

```powershell
git remote add origin https://github.com/USERNAME/REPO.git
```

Change a remote URL:

```powershell
git remote set-url origin https://github.com/USERNAME/REPO.git
```

Fetch remote updates without merging:

```powershell
git fetch
git fetch origin
```

Pull remote updates into the current branch:

```powershell
git pull
git pull origin branch-name
```

Push the current branch:

```powershell
git push
```

Push a new branch and set upstream tracking:

```powershell
git push -u origin branch-name
```

## Undo Safely

Discard unstaged changes in one file:

```powershell
git restore path/to/file
```

Discard all unstaged changes:

```powershell
git restore .
```

Restore a deleted file:

```powershell
git restore path/to/file
```

Unstage changes while keeping file edits:

```powershell
git restore --staged path/to/file
git restore --staged .
```

Create a new commit that reverses an older commit:

```powershell
git revert <commit-hash>
```

Use `git revert` for commits that may already be shared with others.

## Stash Work

Save current uncommitted work:

```powershell
git stash push -m "Short note"
```

Include untracked files in the stash:

```powershell
git stash push -u -m "Short note"
```

List stashes:

```powershell
git stash list
```

Apply the latest stash and keep it in the stash list:

```powershell
git stash apply
```

Apply the latest stash and remove it from the stash list:

```powershell
git stash pop
```

Drop a stash:

```powershell
git stash drop stash@{0}
```

## Tags

List tags:

```powershell
git tag
```

Create a lightweight tag:

```powershell
git tag v1.0.0
```

Push one tag:

```powershell
git push origin v1.0.0
```

Push all tags:

```powershell
git push --tags
```

## Common Workflows

### Save New Work

```powershell
git status --short
git diff
git add .
git diff --cached --stat
git commit -m "Short heading" -m "- Explain the main change"
```

### Update Your Branch

```powershell
git status
git fetch
git pull
```

Commit or stash local changes before pulling if Git reports conflicts.

### Create And Push A Feature Branch

```powershell
git switch -c feature/name
git add .
git commit -m "Short heading" -m "- Explain the feature"
git push -u origin feature/name
```

### Review Before Push

```powershell
git status
git log --oneline -5
git show --stat
git remote -v
```

Then push:

```powershell
git push
```

## Agent Workflow

Agents may stage and commit local changes when asked or when completing a
requested repository change. Agents should leave pushing to the user.

Before committing, agents should run:

```powershell
git status --short
git diff --stat
```

After committing, agents should report:

- Commit hash
- Commit heading
- Whether the working tree is clean
- The push command for the user

## Helpful Troubleshooting

Check the current branch:

```powershell
git branch --show-current
```

See files tracked by Git:

```powershell
git ls-files
```

See why a file is ignored:

```powershell
git check-ignore -v path/to/file
```

Prune deleted remote branches from local remote-tracking refs:

```powershell
git fetch --prune
```

Show recent branch and HEAD movements:

```powershell
git reflog
```

`git reflog` is useful when you need to find a previous commit after a branch
move, amend, or reset.
