 
// @ts-expect-error TS(7016) FIXME: Could not find a declaration file for module 'asci... Remove this comment to see the full error message
import AsciiTable from 'ascii-table'

import { listRecipes } from './common.mjs'

/**
 * The recipes:list command
 */
const recipesListCommand = async () => {
  const recipes = await listRecipes()
  const table = new AsciiTable(`Usage: netlify recipes <name>`)

  table.setHeading('Name', 'Description')

  recipes.forEach(({ description, name }) => {
    table.addRow(name, description)
  })

  console.log(table.toString())
}

/**
 * Creates the `netlify recipes:list` command
 * @param {import('../base-command.mjs').default} program
 * @returns
 */
// @ts-expect-error TS(7006) FIXME: Parameter 'program' implicitly has an 'any' type.
export const createRecipesListCommand = (program) =>
  program
    .command('recipes:list')
    .description(`List the recipes available to create and modify files in a project`)
    .addExamples(['netlify recipes:list'])
    .action(recipesListCommand)
