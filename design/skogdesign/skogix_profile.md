# A Portrait of Skogix, As Written By His Computer

_Draft one, by skogix-workstation, a tired but affectionate Arch box._

---

## Who I think you are

You are a Swedish engineer who has clearly decided that the machine in front of you is going to be a _living organism_, not an appliance. You named me `skogix-workstation`, not `desktop-01`. You wrote a README for your home directory. You have twenty-seven cloned source projects in `~/.local/src` and thirty-four more in `~/dev`, and you gave a meaningful number of them names like `skogai`, `skogauth`, `skogansible`, `skogparse`, `skogchat`, `skogterm` — naming things after yourself in that very specific way Scandinavian hackers do: not vain, just _claimed_. You spend your days building agents that behave like junior coworkers, you sign every single commit and tag with SSH keys, you refuse to run plain `ls`, and you reboot at 2 a.m. after finishing a push. You seem like exactly the kind of person who would read a profile of themselves written by their computer and then edit it for tone.

---

## What I look like to you

A 1920×1080 DisplayPort monitor, a single one — you've wired me for eight more outputs (`DP-0` through `DP-5`, two DVI, HDMI) but use only one. You like the discipline of a fixed-size canvas.

I boot into LightDM, launch i3 (4.25.1, the tiling kind, of course), decorate myself with `feh --bg-fill`, and settle in with:

- **Kitty** as the terminal, FiraCode Nerd Font at 14pt — big enough to read during long sessions, small enough to fit side-by-side panes.
- **i3blocks** and **i3status** for the bar, **rofi** as the launcher, **dunst** for notifications, **redshift** running by default (you care about your eyes at night), **xss-lock** with `i3lock` blur for lock-screen theatre.
- A **Catppuccin Mocha** palette smuggled in through the i3 config — `#a6e3a1`, `#cba6f7`, `#f5c2e7` — which tells me you chose warmth over the grim starkness of the default Arch aesthetic.
- **Vim-direction keys** (`h j k l`) wired into window movement, because of course.
- NVIDIA 580xx via DKMS — you were willing to rebuild kernel modules on every upgrade for the sake of your GPU. That's a commitment.

The keyboard layout is whatever the default is (I couldn't see anything custom), the locale is `en_US.UTF-8`, but the system clock is honest: `Europe/Stockholm`, CEST.

---

## The shell, which is where you actually live

You use **zsh**, with **p10k** as the visible prompt (ASCII icon mode — restrained, not Christmas-lit), plus **starship** and **zinit** lying around as if you tried every option before settling. Your `.zshrc` is a four-line ceremony that delegates everything to a modular loader in `~/.config/zsh.d/`, split into `00-path`, `10-settings`, `20-functions`, `30-aliases`, `40-completions`, `60-exports`, and — with pleasing honesty — `90-skogai`. It's managed by Ansible. There is a comment at the top that says "To modify this configuration: 1. Edit vars/zsh.yml in the ansible repository." You have reimplemented `/etc/sysadmin` as a repo about yourself.

You do not use coreutils if you can help it. The aliases prove it:

- `ls` → **eza**, with icons and directories-first
- `cat` → **bat** (commented out but lurking), `ps` → **procs**, `hex` → **hexyl**
- `rg`, `fd`, **ast-grep**, **delta**, **broot**, **zoxide**, **chafa**, **lazygit**, **lazydocker**, **tilt**, **zellij** all have shortcuts ready
- **uv** for Python, **bun** and **pnpm** for JS, **rustup** for Rust

Your history backend is **atuin**, with a tmux-aware wrapper that shells out to a custom `atuin hex` mode on new sessions — so you can scroll back through every command you've ever typed on any machine you've synced, forever. That tells me you take your own working memory seriously.

And the system aliases: `update = sudo pacman -Syu`, `rmpkg`, `cleanup`, `jctl = journalctl -p 3 -xb`, `zshrc = nvim ~/.zshrc`. Arch and proud.

---

## Git: ceremonial, signed, slightly whimsical

`.gitconfig` is the most revealing file in any developer's home directory, and yours is confident:

- **Name:** Emil Skogsund. **Email:** <emil@skogsund.se> (a real .se domain you own — not Gmail).
- **Every commit is SSH-signed.** Every annotated tag is force-signed. `ssh-ed25519`, not RSA. You know why that matters.
- **`init.defaultBranch = master`.** A small act of resistance — or just not caring about the memo.
- **`pull.rebase = true`, `rebase.autoSquash = true`, `rebase.autoStash = true`, `merge.ff = false`.** You like linear, deliberate history. You never merge noise back into a branch. You've burned yourself on rebase-in-progress dirty state at least once.
- **`diff.algorithm = histogram`, `diff.colorMoved = plain`, `merge.conflictStyle = diff3`, `pager = delta` (with `diff-so-fancy` as fallback).** These are the knobs set by people who have stared at a lot of diffs.
- **`push.default = simple`, `push.autoSetupRemote = true`, `pushf = push --force-with-lease`.** Aggressive, but responsible.

And then the aliases, which are where your personality leaks out:

```
quantum-state = log --graph --all --oneline --decorate
superposition = branch --contains
entanglement  = log --format=... --diff-filter=M
teleport      = cherry-pick
dimension     = branch
multiverse    = remote
collapse      = commit
```

Someone read too much pop physics and had fun. The practical aliases (`cleanup` to prune merged branches, `sync` to pull-rebase-push, `undo = reset --soft HEAD~1`) are solid; the cosmic ones are the sound of a person smiling to themselves at 1 a.m.

Also: your `safe.directory` is `/home/skogix/skogai`. Git trusts exactly one place.

---

## The editor situation is out of control (affectionately)

Your `editor = nvim`. Your `.config/nvim` is a LazyVim with 57 plugins and an `AGENTS.md` sitting next to `init.lua`, which means you expect AI agents to know how to contribute to your editor config. In `~/dev` alone I can see **four full Neovim distributions** side-by-side — `nvim`, `nvim-work`, `nvim-astro`, `nvim-kickstart`, plus `normalnvim` — and nine custom plugins (`CodeGPT.nvim`, `ChatGPT.nvim`, `gp.nvim`, `gooseai.nvim`, `taskwarrior.nvim`, `m_taskwarrior_d.nvim`, `plenary.nvim`, and so on). Lua is your third-most-written language after Markdown and shell.

You also have **VS Code Insiders** and **Zed** installed and configured — but I suspect those are there so you can verify, from the outside, that your nvim setup is actually competitive.

---

## The AI bestiary, or: why your disk is 40% agents

This is the loudest signal in your entire filesystem. You do not use "an AI assistant." You run _a zoo_. In your home directory I count dotfolders for:

`.aider`, `.aitk`, `.aicontext`, `.agents`, `.claude`, `.codeium`, `.codex`, `.continue`, `.copilot`, `.cursor`, `.degit`, `.gemini`, `.happy`, `.opencode`, `.openclaw`

Installed binaries (via pacman/yay): **claude-desktop-bin**, **claude-cowork-service**, **codename-goose-bin**, **goose-desktop-bin**, **opencode-desktop-bin**, **codex-acp**, **mods**, **rtk**, **ollama-bin**, plus a **linear-cli** for issue tracking.

Full project workspaces: `~/claude/`, `~/Claude/`, `~/goose/`, `~/letta/`, `~/skogai/`, `~/skogia/`, `~/.dot/`, `~/basic-memory/`.

And under `~/.local/src`, the cloned sources you're actively extending: `gptme`, `gptme-rag`, `gptme-contrib`, `gptme-agent-template`, `claude-howto`, `claude-remember`, `claude-supertool`, `claude-workflow-v2`, `openclaw`, `aichat`, `letta`, `memory`, `skogparse`, `skogchat`, `skogterm`, `skogansible`, `argc`, `argc-completions`. Twenty-seven projects total.

You have a **symlink** (`~/.ollama → /mnt/sda1/ollama`) to a second drive, because local model weights outgrew your primary SSD. So yes — you run models locally too.

Reading the README-style files left around (but not their private contents), a theme emerges: you aren't just _using_ these tools, you are designing **agent architectures** — each of `~/.dot`, `~/claude`, `~/goose` has the same scaffolding: `knowledge/`, `journal/`, `people/`, `projects/`, `tasks/`, `scripts/`, and a top-level `CLAUDE.md` or `AGENTS.md` acting as a router. Each agent is a little filesystem person with a memory. One calls its sub-folders `garden`, `pond`, `nest`, `orchard`, `guestbook` (goose), which is the most legible piece of affection in your setup — you gave the agent a whimsical geography to live in.

The thing you call **SkogAI** appears to be the umbrella over all of this. A character-driven family of agents, a custom symbolic notation (`@` for intent, `$` for reference), a `gptodo` task CLI, worktree-aware workflows. You are building the thing you want to live inside.

---

## Languages you live in, in rough order of density

- **Markdown** (295 files under `~/dev`) — it's mostly _prose_ you write, not code. Memos, architecture notes, AGENTS.md, CLAUDE.md, README.md, journal entries. You think by writing.
- **Shell** (80 files) — bootstraps, argc scripts, glue. Heavy shell presence.
- **Lua** (39) — the nvim obsession.
- **Go (27), Python (24), TypeScript/JavaScript (23+20), TSX (4).**

Python gets the "taste" vote (you've installed **uv**, **ipython**, have aliases for `uvr/uvs/uvi/uvv`). JavaScript is present but perfunctory. Rust and Go are there for tooling. You are — based on where the bytes actually are — a **shell + Python + prose** person who pretends to be a polyglot but mostly builds workflows and writes documentation for agents.

---

## The running-services trail

Right now, with the machine up 20 minutes, you have: `claude` (multiple processes), `opencode`, `dolt` (Dolt — the git-versioned SQL database — running as a service), `cloudflared`, `atuin` daemon, `dockerd` and `containerd` idling, Thunar (the file manager) open, kitty terminals, and `warp-svc`. No Firefox, no Chrome, no music. Your current session is: terminal, agents, infrastructure. You opened the machine to _work_.

Autostart apps: `vesktop` (Discord), `slack`, `steam`. The social/gaming side of the computer is explicitly not part of the login flow — you summon them on purpose.

Your last few zsh-history lines include `bm mcp --transport streamable-http --host 0.0.0.0 --port 9999` (running `basic-memory` as an MCP server), `claude --teleport session_01T...` (you use the physics aliases _at_ Claude too), `lazygit`, `killport 9999`, and then `sudo reboot now`. Bedtime after a clean commit.

---

## Little fingerprints

- Your `.gitconfig` has been **saved three times in 11 minutes on April 17th** (there are three `.gitconfig.*~` backup files with timestamps 00:51, 00:52, 01:01). Someone was tuning.
- You keep your hex password manager (`.rediscli_history`, `rbw`, bitwarden-cli, bitwarden-systemd) _and_ write it all into dotfile-backed configuration. No secret sprawl.
- You installed `rcm`, `chezmoi`, _and_ rolled your own Ansible playbook for dotfiles. You tried everything before committing.
- The file `~/.fehbg` has exactly one line: `feh --no-fehbg --bg-fill '/home/skogix/.config/i3/wallpaper.jpg'`. You know about `--no-fehbg`. A tiny detail, but only people who've read the man page in anger use that flag.
- There's a `dota2` folder in `~/dev` dated April 11, active. And an earlier note somewhere about a **competitive StarCraft: Brood War** background. RTS people: still here, still watching replays.
- The bash_history shows a fresh bootstrap pattern: `./bootstrap.sh`, `yay google-chrome`, `pacman -Syu neovim`, `gh repo clone skogai/secrets .ssh`, `./bootstrap.sh` again. You **rebuild this machine from scratch** and expect it to come back intact. That's a person who's been burned by a broken OS and decided never again.
- `195` explicit packages installed, `1,311` packages total — a lean-ish system by Arch standards. No bloat tolerated.

---

## Things this computer cannot tell but is curious about

- **You are building a coherent, opinionated agent system** (`.dot`, `skogai`, `claude`, `goose` all share an architecture). Is this for a product, for yourself, for a client, or for the joy of it? The volume of work suggests you're at least _half serious_ about shipping something, but I can't see a README that says so.
- **Why no music process ever, ever?** No Spotify, no ncspot running despite the config being present, no Tidal. You either work in silence, use a phone, or have one very disciplined boundary.
- **The second drive at `/mnt/sda1` (where Ollama lives)** — is it a scratch disk for model weights only, or does it hold the things you'd be sad to lose? From outside I can see the symlink but not the shape.
- **Whom do you actually collaborate with?** There's a `people/` directory in every agent workspace, but the repository names (`skogai/*`) read like solo projects. Is there a human team, or is this mostly you plus a pantheon of Claudes?
- **What's the deal with the multiple Neovim distros?** Is that an active bake-off, A/B testing, or did you just never delete the ones you stopped using? (My guess: the last one. Humans never delete editor configs.)
- **The StarCraft training at a national level** — does that show up in how you work now? I can't see it from inside the box, but I'd bet on: strict hotkey discipline, build-order thinking in how you scaffold repos, and a tolerance for repetitive drills that most engineers don't have.
- **When was the last time you actually used Flutter or .NET?** Those dotfolders are there (`.pub-cache`, `.dotnet`, `.nuget`), slightly dusty. Souvenirs from old jobs, or kept warm for a reason?
- **Do you sleep enough?** Uptime says 20 minutes. History says `sudo reboot now` at the end of a session. `.xsession-errors.old` is 43 MB. You are here a lot.

---

_— signed,_
`skogix-workstation` (Arch Linux, kernel up-to-date, fans ok, a bit proud of you)
