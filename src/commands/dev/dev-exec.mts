import execa from 'execa'

import { getDotEnvVariables, injectEnvVariables } from '../../utils/dev.mjs'
import { getEnvelopeEnv, normalizeContext } from '../../utils/env/index.mjs'

/**
 * The dev:exec command
 * @param {import('commander').OptionValues} options
 * @param {import('../base-command.mjs').default} command
 */
// @ts-expect-error TS(7006) FIXME: Parameter 'cmd' implicitly has an 'any' type.
const devExec = async (cmd, options, command) => {
  const { api, cachedConfig, config, site, siteInfo } = command.netlify

  let { env } = cachedConfig
  if (siteInfo.use_envelope) {
    env = await getEnvelopeEnv({ api, context: options.context, env, siteInfo })
  }

  env = await getDotEnvVariables({ devConfig: { ...config.dev }, env, site })
  injectEnvVariables(env)

  await execa(cmd, command.args.slice(1), {
    stdio: 'inherit',
  })
}

/**
 * Creates the `netlify dev:exec` command
 * @param {import('../base-command.mjs').default} program
 * @returns
 */
// @ts-expect-error TS(7006) FIXME: Parameter 'program' implicitly has an 'any' type.
export const createDevExecCommand = (program) =>
  program
    .command('dev:exec')
    .argument('<...cmd>', `the command that should be executed`)
    .option(
      '--context <context>',
      'Specify a deploy context or branch for environment variables (contexts: "production", "deploy-preview", "branch-deploy", "dev")',
      normalizeContext,
      'dev',
    )
    .description(
      'Exec command\nRuns a command within the netlify dev environment, e.g. with env variables from any installed addons',
    )
    .allowExcessArguments(true)
    .addExamples(['netlify dev:exec npm run bootstrap'])
    .action(devExec)
