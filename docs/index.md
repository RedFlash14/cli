---
title: Netlify CLI command reference
description: All Netlify CLI commands
---

# Netlify CLI command reference

To get a list of commands, run

```
netlify help
```

To get a list of available sub-commands, arguments & flags run

```
netlify [command] help
```

## Commands

<!-- AUTO-GENERATED-CONTENT:START (GENERATE_COMMANDS_LIST) -->
### [api](/docs/commands/api.md)

Run any Netlify API method

### [build](/docs/commands/build.md)

Build on your local machine

### [completion](/docs/commands/completion.md)

Generate shell completion script

| Subcommand | description  |
|:--------------------------- |:-----|
| [`completion:install`](/docs/commands/completion.md#completioninstall) | Generates completion script for your preferred shell  |


### [deploy](/docs/commands/deploy.md)

Create a new deploy from the contents of a folder

### [dev](/docs/commands/dev.md)

Local dev server

| Subcommand | description  |
|:--------------------------- |:-----|
| [`dev:exec`](/docs/commands/dev.md#devexec) | Exec command  |


### [env](/docs/commands/env.md)

Control environment variables for the current site

| Subcommand | description  |
|:--------------------------- |:-----|
| [`env:clone`](/docs/commands/env.md#envclone) | Clone environment variables from one site to another  |
| [`env:get`](/docs/commands/env.md#envget) | Get resolved value of specified environment variable (includes netlify.toml)  |
| [`env:import`](/docs/commands/env.md#envimport) | Import and set environment variables from .env file  |
| [`env:list`](/docs/commands/env.md#envlist) | Lists resolved environment variables for site (includes netlify.toml)  |
| [`env:set`](/docs/commands/env.md#envset) | Set value of environment variable  |
| [`env:unset`](/docs/commands/env.md#envunset) | Unset an environment variable which removes it from the UI  |


### [functions](/docs/commands/functions.md)

Manage netlify functions

| Subcommand | description  |
|:--------------------------- |:-----|
| [`functions:build`](/docs/commands/functions.md#functionsbuild) | Build functions locally  |
| [`functions:create`](/docs/commands/functions.md#functionscreate) | Create a new function locally  |
| [`functions:invoke`](/docs/commands/functions.md#functionsinvoke) | Trigger a function while in netlify dev with simulated data, good for testing function calls including Netlify's Event Triggered Functions  |
| [`functions:list`](/docs/commands/functions.md#functionslist) | List functions that exist locally  |
| [`functions:serve`](/docs/commands/functions.md#functionsserve) | Serve functions locally  |


### [init](/docs/commands/init.md)

Configure continuous deployment for a new or existing site. To create a new site without continuous deployment, use `netlify sites:create`

### [integration](/docs/commands/integration.md)

Manage Netlify Integrations built with the Netlify SDK

| Subcommand | description  |
|:--------------------------- |:-----|
| [`integration:deploy`](/docs/commands/integration.md#integrationdeploy) | Register, build, and deploy a private integration on Netlify  |


### [link](/docs/commands/link.md)

Link a local repo or project folder to an existing site on Netlify

### [login](/docs/commands/login.md)

Login to your Netlify account

### [open](/docs/commands/open.md)

Open settings for the site linked to the current folder

| Subcommand | description  |
|:--------------------------- |:-----|
| [`open:admin`](/docs/commands/open.md#openadmin) | Opens current site admin UI in Netlify  |
| [`open:site`](/docs/commands/open.md#opensite) | Opens current site url in browser  |


### [recipes](/docs/commands/recipes.md)

Create and modify files in a project using pre-defined recipes

| Subcommand | description  |
|:--------------------------- |:-----|
| [`recipes:list`](/docs/commands/recipes.md#recipeslist) | List the recipes available to create and modify files in a project  |


### [serve](/docs/commands/serve.md)

Build the site for production and serve locally. This does not watch the code for changes, so if you need to rebuild your site then you must exit and run `serve` again.

### [sites](/docs/commands/sites.md)

Handle various site operations

| Subcommand | description  |
|:--------------------------- |:-----|
| [`sites:create`](/docs/commands/sites.md#sitescreate) | Create an empty site (advanced)  |
| [`sites:create-template`](/docs/commands/sites.md#sitescreate-template) | (Beta) Create a site from a starter template  |
| [`sites:delete`](/docs/commands/sites.md#sitesdelete) | Delete a site  |
| [`sites:list`](/docs/commands/sites.md#siteslist) | List all sites you have access to  |


### [status](/docs/commands/status.md)

Print status information

| Subcommand | description  |
|:--------------------------- |:-----|
| [`status:hooks`](/docs/commands/status.md#statushooks) | Print hook information of the linked site  |


### [switch](/docs/commands/switch.md)

Switch your active Netlify account

### [unlink](/docs/commands/unlink.md)

Unlink a local folder from a Netlify site

### [watch](/docs/commands/watch.md)

Watch for site deploy to finish


<!-- AUTO-GENERATED-CONTENT:END -->
