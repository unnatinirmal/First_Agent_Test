# Git Commands Reference

Common Git commands for this project.

## Check Changes

```powershell
git status
git status --short
git diff
git diff --stat
```

## Stage Changes

```powershell
git add .
git add <file-path>
```

## Commit Changes

Use the project commit message format from `AGENTS.md`.

```powershell
git commit -m "Short heading" -m "- Body line one" -m "- Body line two"
```

## View History

```powershell
git log --oneline
git log --oneline -5
git show --stat
```

## Work With Remotes

```powershell
git remote -v
git pull
git push
```

Agents may stage and commit local changes when asked. The user should push
commits to the remote repository.
