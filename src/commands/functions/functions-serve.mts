 
import { join } from 'path'

import { startFunctionsServer } from '../../lib/functions/server.mjs'
import { printBanner } from '../../utils/banner.mjs'
import { acquirePort, getDotEnvVariables, getSiteInformation, injectEnvVariables } from '../../utils/dev.mjs'
import { getFunctionsDir } from '../../utils/functions/index.mjs'
import { getProxyUrl } from '../../utils/proxy.mjs'

const DEFAULT_PORT = 9999

/**
 * The functions:serve command
 * @param {import('commander').OptionValues} options
 * @param {import('../base-command.mjs').default} command
 */
// @ts-expect-error TS(7006) FIXME: Parameter 'options' implicitly has an 'any' type.
const functionsServe = async (options, command) => {
  const { api, config, site, siteInfo, state } = command.netlify

  const functionsDir = getFunctionsDir({ options, config }, join('netlify', 'functions'))
  let { env } = command.netlify.cachedConfig

  env.NETLIFY_DEV = { sources: ['internal'], value: 'true' }

  env = await getDotEnvVariables({ devConfig: { ...config.dev }, env, site })
  injectEnvVariables(env)

  const { accountId, capabilities, siteUrl, timeouts } = await getSiteInformation({
    offline: options.offline,
    api,
    site,
    siteInfo,
  })

  const functionsPort = await acquirePort({
    configuredPort: options.port || (config.dev && config.dev.functionsPort),
    defaultPort: DEFAULT_PORT,
    errorMessage: 'Could not acquire configured functions port',
  })

  await startFunctionsServer({
    config,
    debug: options.debug,
    command,
    api,
    settings: { functions: functionsDir, functionsPort },
    site,
    siteInfo,
    siteUrl,
    capabilities,
    timeouts,
    functionsPrefix: '/.netlify/functions/',
    buildersPrefix: '/.netlify/builders/',
    geolocationMode: options.geo,
    geoCountry: options.country,
    offline: options.offline,
    state,
    accountId,
  })

  const url = getProxyUrl({ port: functionsPort })
  printBanner({ url })
}

/**
 * Creates the `netlify functions:serve` command
 * @param {import('../base-command.mjs').default} program
 * @returns
 */
// @ts-expect-error TS(7006) FIXME: Parameter 'program' implicitly has an 'any' type.
export const createFunctionsServeCommand = (program) =>
  program
    .command('functions:serve')
    .alias('function:serve')
    .description('Serve functions locally')
    .option('-f, --functions <dir>', 'Specify a functions directory to serve')
    // @ts-expect-error TS(7006) FIXME: Parameter 'value' implicitly has an 'any' type.
    .option('-p, --port <port>', 'Specify a port for the functions server', (value) => Number.parseInt(value))
    .option('-o, --offline', 'disables any features that require network access')
    .addHelpText('after', 'Helpful for debugging functions.')
    .action(functionsServe)
