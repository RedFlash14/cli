 
import { exit, log } from '../../utils/command-helpers.mjs'
import { track } from '../../utils/telemetry/index.mjs'

/**
 * The unlink command
 * @param {import('commander').OptionValues} options
 * @param {import('../base-command.mjs').default} command
 */
// @ts-expect-error TS(7006) FIXME: Parameter 'options' implicitly has an 'any' type.
const unlink = async (options, command) => {
  const { site, siteInfo, state } = command.netlify
  const siteId = site.id

  if (!siteId) {
    log(`Folder is not linked to a Netlify site. Run 'netlify link' to link it`)
    return exit()
  }

  const siteData = siteInfo

  state.delete('siteId')

  await track('sites_unlinked', {
    siteId: siteData.id || siteId,
  })

  if (site) {
    log(`Unlinked ${site.configPath} from ${siteData ? siteData.name : siteId}`)
  } else {
    log('Unlinked site')
  }
}

/**
 * Creates the `netlify unlink` command
 * @param {import('../base-command.mjs').default} program
 * @returns
 */
// @ts-expect-error TS(7006) FIXME: Parameter 'program' implicitly has an 'any' type.
export const createUnlinkCommand = (program) =>
  program.command('unlink').description('Unlink a local folder from a Netlify site').action(unlink)
