 
import inquirer from 'inquirer'
import isEmpty from 'lodash/isEmpty.js'

import compare from '../../utils/addons/compare.mjs'
import diffValues from '../../utils/addons/diffs/index.mjs'
import { ADDON_VALIDATION, prepareAddonCommand } from '../../utils/addons/prepare.mjs'
import generatePrompts from '../../utils/addons/prompts.mjs'
import { renderConfigValues } from '../../utils/addons/render.mjs'
import { missingConfigValues, requiredConfigValues, updateConfigValues } from '../../utils/addons/validation.mjs'
import { chalk, error, log } from '../../utils/command-helpers.mjs'
import { parseRawFlags } from '../../utils/parse-raw-flags.mjs'

// @ts-expect-error TS(7031) FIXME: Binding element 'addonName' implicitly has an 'any... Remove this comment to see the full error message
const update = async function ({ addonName, api, currentConfig, instanceId, newConfig, siteId }) {
  const codeDiff = diffValues(currentConfig, newConfig)
  if (!codeDiff) {
    log('No changes, exiting early')
    return false
  }
  log()
  const msg = `Updating ${addonName} add-on config values...`
  log(`${chalk.white.bold(msg)}`)
  log()
  log(`${codeDiff}\n`)
  log()

  try {
    await api.updateServiceInstance({
      siteId,
      addon: addonName,
      instanceId,
      body: { config: newConfig },
    })
    log(`Add-on "${addonName}" successfully updated`)
  } catch (error_) {
    // @ts-expect-error TS(2571) FIXME: Object is of type 'unknown'.
    error(error_.message)
  }
}

/**
 * The addons:config command
 * @param {string} addonName
 * @param {import('commander').OptionValues} options
 * @param {import('../base-command.mjs').default} command
 * @returns {Promise<boolean>}
 */
// @ts-expect-error TS(7006) FIXME: Parameter 'addonName' implicitly has an 'any' type... Remove this comment to see the full error message
const addonsConfig = async (addonName, options, command) => {
  const { addon, manifest, siteData } = await prepareAddonCommand({
    command,
    addonName,
    validation: ADDON_VALIDATION.EXISTS,
  })

  const { api, site } = command.netlify
  const siteId = site.id

  const hasConfig = !isEmpty(manifest.config)
  // Parse flags
  const rawFlags = parseRawFlags(command.args)
  // Get Existing Config
  const currentConfig = addon.config || {}

  const words = `Current "${addonName} add-on" Settings:`
  log(` ${chalk.yellowBright.bold(words)}`)
  if (hasConfig) {
    if (!rawFlags.silent) {
      renderConfigValues(addonName, manifest.config, currentConfig)
    }
  } else {
    // For addons without manifest. TODO remove once we enforce manifests
    Object.keys(currentConfig).forEach((key) => {
      log(`${key} - ${currentConfig[key]}`)
    })
  }

  if (hasConfig) {
    const required = requiredConfigValues(manifest.config)
    const missingValues = missingConfigValues(required, rawFlags)

    /* Config set by command line flags */
    if (rawFlags && missingValues.length === 0) {
      const newConfig = updateConfigValues(manifest.config, currentConfig, rawFlags)

      await update({
        addonName,
        currentConfig,
        newConfig,
        siteId,
        instanceId: addon.id,
        api,
      })
      return false
    }

    const updatePrompt = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'updateNow',
        message: `Do you want to update config values?`,
        default: false,
      },
    ])
    if (!updatePrompt.updateNow) {
      log('Sounds good! Exiting configuration...')
      return false
    }
    log()
    log(` - Hit ${chalk.white.bold('enter')} to keep the existing value in (parentheses)`)
    log(` - Hit ${chalk.white.bold('down arrow')} to remove the value`)
    log(` - Hit ${chalk.white.bold('ctrl + C')} to cancel & exit configuration`)
    log()
    log(` You will need to verify the changed before we push them to your live site!`)
    log()
    const prompts = generatePrompts({
      config: manifest.config,
      configValues: currentConfig,
    })
    const userInput = await inquirer.prompt(prompts)
    // Merge user input with the flags specified
    const newConfig = updateConfigValues(manifest.config, currentConfig, userInput)

    const diffs = compare(currentConfig, newConfig)
    // log('compare', diffs)
    // @ts-expect-error TS(2339) FIXME: Property 'isEqual' does not exist on type 'string'... Remove this comment to see the full error message
    if (diffs.isEqual) {
      log(`No changes. exiting early`)
      return false
    }
    log()
    log(`${chalk.yellowBright.bold.underline('Confirm your updates:')}`)
    log()
    // @ts-expect-error TS(2339) FIXME: Property 'keys' does not exist on type 'string'.
    diffs.keys.forEach((key) => {
      // @ts-expect-error TS(2339) FIXME: Property 'diffs' does not exist on type 'string'.
      const { newValue, oldValue } = diffs.diffs[key]
      const oldVal = oldValue || 'NO VALUE'
      log(`${chalk.cyan(key)} changed from ${chalk.whiteBright(oldVal)} to ${chalk.green(newValue)}`)
    })
    log()

    const confirmPrompt = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirmChange',
        message: `Do you want to publish the updated "${addonName} add-on" settings for ${chalk.cyan(siteData.name)}?`,
        default: false,
      },
    ])

    if (!confirmPrompt.confirmChange) {
      log('Canceling changes... You are good to go!')
      return false
    }

    await update({
      addonName,
      currentConfig,
      newConfig,
      siteId,
      instanceId: addon.id,
      api,
    })
  }
}

/**
 * Creates the `netlify addons:config` command
 * @param {import('../base-command.mjs').default} program
 * @returns
 */
// @ts-expect-error TS(7006) FIXME: Parameter 'program' implicitly has an 'any' type.
export const createAddonsConfigCommand = (program) =>
  program
    .command('addons:config', { hidden: true })
    .alias('addon:config')
    .argument('<name>', 'Add-on namespace')
    .description('Configure add-on settings')
    // allow for any flags. Handy for variadic configuration options
    .allowUnknownOption(true)
    // @ts-expect-error TS(7006) FIXME: Parameter 'addonName' implicitly has an 'any' type... Remove this comment to see the full error message
    .action(async (addonName, options, command) => {
      await addonsConfig(addonName, options, command)
    })
