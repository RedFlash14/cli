 
import { InvalidArgumentError } from 'commander'
import inquirer from 'inquirer'
import pick from 'lodash/pick.js'
import prettyjson from 'prettyjson'

import { chalk, error, log, logJson, warn } from '../../utils/command-helpers.mjs'
import getRepoData from '../../utils/get-repo-data.mjs'
import { configureRepo } from '../../utils/init/config.mjs'
import { track } from '../../utils/telemetry/index.mjs'
import { link } from '../link/index.mjs'

// @ts-expect-error TS(7006) FIXME: Parameter 'name' implicitly has an 'any' type.
export const getSiteNameInput = async (name) => {
  if (!name) {
    const { name: nameInput } = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Site name (leave blank for a random name; you can change it later):',
        validate: (input) =>
          /^[a-zA-Z\d-]+$/.test(input || undefined) || 'Only alphanumeric characters and hyphens are allowed',
      },
    ])
    name = nameInput || ''
  }

  return { name }
}

/**
 * The sites:create command
 * @param {import('commander').OptionValues} options
 * @param {import('../base-command.mjs').default} command
 */
// @ts-expect-error TS(7006) FIXME: Parameter 'options' implicitly has an 'any' type.
export const sitesCreate = async (options, command) => {
  const { api } = command.netlify

  await command.authenticate()

  const accounts = await api.listAccountsForUser()

  let { accountSlug } = options
  if (!accountSlug) {
    const { accountSlug: accountSlugInput } = await inquirer.prompt([
      {
        type: 'list',
        name: 'accountSlug',
        message: 'Team:',
        // @ts-expect-error TS(7006) FIXME: Parameter 'account' implicitly has an 'any' type.
        choices: accounts.map((account) => ({
          value: account.slug,
          name: account.name,
        })),
      },
    ])
    accountSlug = accountSlugInput
  }

  let site

  // Allow the user to reenter site name if selected one isn't available
  // @ts-expect-error TS(7006) FIXME: Parameter 'name' implicitly has an 'any' type.
  const inputSiteName = async (name) => {
    const { name: siteName } = await getSiteNameInput(name)

    const body = {}
    if (typeof siteName === 'string') {
      // @ts-expect-error TS(2339) FIXME: Property 'name' does not exist on type '{}'.
      body.name = siteName.trim()
    }
    try {
      site = await api.createSiteInTeam({
        accountSlug,
        body,
      })
    } catch (error_) {
      // @ts-expect-error TS(2571) FIXME: Object is of type 'unknown'.
      if (error_.status === 422) {
        warn(`${siteName}.netlify.app already exists. Please try a different slug.`)
        // @ts-expect-error TS(2554) FIXME: Expected 1 arguments, but got 0.
        await inputSiteName()
      } else {
        // @ts-expect-error TS(2571) FIXME: Object is of type 'unknown'.
        error(`createSiteInTeam error: ${error_.status}: ${error_.message}`)
      }
    }
  }
  await inputSiteName(options.name)

  log()
  log(chalk.greenBright.bold.underline(`Site Created`))
  log()

  // @ts-expect-error TS(2532) FIXME: Object is possibly 'undefined'.
  const siteUrl = site.ssl_url || site.url
  log(
    prettyjson.render({
      // @ts-expect-error TS(2532) FIXME: Object is possibly 'undefined'.
      'Admin URL': site.admin_url,
      URL: siteUrl,
      // @ts-expect-error TS(2532) FIXME: Object is possibly 'undefined'.
      'Site ID': site.id,
    }),
  )

  track('sites_created', {
    // @ts-expect-error TS(2532) FIXME: Object is possibly 'undefined'.
    siteId: site.id,
    // @ts-expect-error TS(2532) FIXME: Object is possibly 'undefined'.
    adminUrl: site.admin_url,
    siteUrl,
  })

  if (options.withCi) {
    log('Configuring CI')
    // @ts-expect-error TS(2345) FIXME: Argument of type '{ workingDir: any; }' is not ass... Remove this comment to see the full error message
    const repoData = await getRepoData({ workingDir: command.workingDir })
    // @ts-expect-error TS(2532) FIXME: Object is possibly 'undefined'.
    await configureRepo({ command, siteId: site.id, repoData, manual: options.manual })
  }

  if (options.json) {
    logJson(
      pick(site, [
        'id',
        'state',
        'plan',
        'name',
        'custom_domain',
        'domain_aliases',
        'url',
        'ssl_url',
        'admin_url',
        'screenshot_url',
        'created_at',
        'updated_at',
        'user_id',
        'ssl',
        'force_ssl',
        'managed_dns',
        'deploy_url',
        'account_name',
        'account_slug',
        'git_provider',
        'deploy_hook',
        'capabilities',
        'id_domain',
      ]),
    )
  }

  if (!options.disableLinking) {
    log()
    // @ts-expect-error TS(2532) FIXME: Object is possibly 'undefined'.
    await link({ id: site.id }, command)
  }

  return site
}

const MAX_SITE_NAME_LENGTH = 63
// @ts-expect-error TS(7006) FIXME: Parameter 'value' implicitly has an 'any' type.
const validateName = function (value) {
  // netlify sites:create --name <A string of more than 63 words>
  if (typeof value === 'string' && value.length > MAX_SITE_NAME_LENGTH) {
    throw new InvalidArgumentError(`--name should be less than 64 characters, input length: ${value.length}`)
  }

  return value
}

/**
 * Creates the `netlify sites:create` command
 * @param {import('../base-command.mjs').default} program
 * @returns
 */
// @ts-expect-error TS(7006) FIXME: Parameter 'program' implicitly has an 'any' type.
export const createSitesCreateCommand = (program) =>
  program
    .command('sites:create')
    .description(
      `Create an empty site (advanced)
Create a blank site that isn't associated with any git remote. Will link the site to the current working directory.`,
    )
    .option('-n, --name <name>', 'name of site', validateName)
    .option('-a, --account-slug <slug>', 'account slug to create the site under')
    .option('-c, --with-ci', 'initialize CI hooks during site creation')
    .option('-m, --manual', 'force manual CI setup.  Used --with-ci flag')
    .option('--disable-linking', 'create the site without linking it to current directory')
    .addHelpText(
      'after',
      `Create a blank site that isn't associated with any git remote. Will link the site to the current working directory.`,
    )
    .action(sitesCreate)
