 
import inquirer from 'inquirer'
import isEmpty from 'lodash/isEmpty.js'

import { ADDON_VALIDATION, prepareAddonCommand } from '../../utils/addons/prepare.mjs'
import generatePrompts from '../../utils/addons/prompts.mjs'
import { renderConfigValues, renderMissingValues } from '../../utils/addons/render.mjs'
import { missingConfigValues, requiredConfigValues, updateConfigValues } from '../../utils/addons/validation.mjs'
import { chalk, error, log } from '../../utils/command-helpers.mjs'
import { parseRawFlags } from '../../utils/parse-raw-flags.mjs'

// @ts-expect-error TS(7031) FIXME: Binding element 'addonName' implicitly has an 'any... Remove this comment to see the full error message
const createAddon = async ({ addonName, api, config, siteData, siteId }) => {
  try {
    const response = await api.createServiceInstance({
      siteId,
      addon: addonName,
      body: { config },
    })
    log(`Add-on "${addonName}" created for ${siteData.name}`)
    if (response.config && response.config.message) {
      log()
      log(`${response.config.message}`)
    }
  } catch (error_) {
    // @ts-expect-error TS(2571) FIXME: Object is of type 'unknown'.
    error(error_.message)
  }
}

/**
 * The addons:create command
 * @param {string} addonName
 * @param {import('commander').OptionValues} options
 * @param {import('../base-command.mjs').default} command
 * @returns {Promise<boolean>}
 */
// @ts-expect-error TS(7006) FIXME: Parameter 'addonName' implicitly has an 'any' type... Remove this comment to see the full error message
const addonsCreate = async (addonName, options, command) => {
  const { manifest, siteData } = await prepareAddonCommand({
    command,
    addonName,
    validation: ADDON_VALIDATION.NOT_EXISTS,
  })

  const { api, site } = command.netlify
  const siteId = site.id

  // GET flags from `raw` data
  const rawFlags = parseRawFlags(command.args)
  const hasConfig = !isEmpty(manifest.config)

  let configValues = rawFlags

  if (hasConfig) {
    const required = requiredConfigValues(manifest.config)
    const missingValues = missingConfigValues(required, rawFlags)
    log(`Starting the setup for "${addonName} add-on"`)
    log()

    if (Object.keys(rawFlags).length !== 0) {
      const newConfig = updateConfigValues(manifest.config, {}, rawFlags)

      if (missingValues.length !== 0) {
        /* Warn user of missing required values */
        log(`${chalk.redBright.underline.bold(`Error: Missing required configuration for "${addonName} add-on"`)}`)
        log()
        renderMissingValues(missingValues, manifest)
        log()
        const msg = `netlify addons:create ${addonName}`
        log(`Please supply the configuration values as CLI flags`)
        log()
        log(`Alternatively, you can run ${chalk.cyan(msg)} with no flags to walk through the setup steps`)
        log()
        return false
      }

      await createAddon({ api, siteId, addonName, config: newConfig, siteData })

      return false
    }

    const words = `The ${addonName} add-on has the following configurable options:`
    log(` ${chalk.yellowBright.bold(words)}`)
    // @ts-expect-error TS(2554) FIXME: Expected 3 arguments, but got 2.
    renderConfigValues(addonName, manifest.config)
    log()
    log(` ${chalk.greenBright.bold('Lets configure those!')}`)

    log()
    log(` - Hit ${chalk.white.bold('enter')} to confirm value or set empty value`)
    log(` - Hit ${chalk.white.bold('ctrl + C')} to cancel & exit configuration`)
    log()

    const prompts = generatePrompts({
      config: manifest.config,
      configValues: rawFlags,
    })

    const userInput = await inquirer.prompt(prompts)
    // Merge user input with the flags specified
    configValues = updateConfigValues(manifest.config, rawFlags, userInput)
    const missingRequiredValues = missingConfigValues(required, configValues)
    if (missingRequiredValues && missingRequiredValues.length !== 0) {
      // @ts-expect-error TS(7006) FIXME: Parameter 'val' implicitly has an 'any' type.
      missingRequiredValues.forEach((val) => {
        log(`Missing required value "${val}". Please run the command again`)
      })
      return false
    }
  }

  await createAddon({ api, siteId, addonName, config: configValues, siteData })
}

/**
 * Creates the `netlify addons:create` command
 * @param {import('../base-command.mjs').default} program
 * @returns
 */
// @ts-expect-error TS(7006) FIXME: Parameter 'program' implicitly has an 'any' type.
export const createAddonsCreateCommand = (program) =>
  program
    .command('addons:create', { hidden: true })
    .alias('addon:create')
    .argument('<name>', 'Add-on namespace')
    .description(
      `Add an add-on extension to your site
Add-ons are a way to extend the functionality of your Netlify site`,
    )
    // allow for any flags. Handy for variadic configuration options
    .allowUnknownOption(true)
    // @ts-expect-error TS(7006) FIXME: Parameter 'addonName' implicitly has an 'any' type... Remove this comment to see the full error message
    .action(async (addonName, options, command) => {
      await addonsCreate(addonName, options, command)
    })
