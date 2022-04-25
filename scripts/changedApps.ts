import util from 'util'
import { exec } from 'child_process'
import fs from 'fs'

const execCommand = util.promisify(exec)

type FrontendApp = {
  name: string
  projectId: string
}

const FILE_NAME = 'changed_apps.json'

const FRONTEND_APPS: FrontendApp[] = [
  {
    name: 'acquisition-royale-landing-page',
    projectId: 'prj_So4gfuKdA7SYrdLpc20mSTLyCWAz',
  },
  {
    name: 'docs',
    projectId: 'prj_P9R3CtLzShfhpRDRTnvFqguGIvtB',
  },
  {
    name: 'react-boilerplate',
    projectId: 'prj_3Lydru5gdN5RuqWFQBT8AZrbiROq',
  },
  {
    name: 'simulator',
    projectId: 'prj_JqVcxQPRfkDbLp3ytm7FLLIvOPXc',
  },
  {
    name: 'website',
    projectId: 'prj_OtZFmASyChHVcxNEAY2NfOQoYQ56',
  },
]

const getChangedApps = async (): Promise<FrontendApp[]> => {
  const { stdout } = await execCommand('yarn build:dry')

  // https://stackoverflow.com/a/63660736
  const TWO_LEVEL_JSON = /\{(?:[^{}]|(\{(?:[^{}]|())*\}))*\}/g

  const outputObject = stdout.match(TWO_LEVEL_JSON)
  const outputAsJson =
    outputObject && outputObject.length > 0 ? JSON.parse(outputObject[0]) : undefined
  const appsChanged: string[] = outputAsJson ? outputAsJson.packages : []
  const frontendAppsChanged = FRONTEND_APPS.filter((app) => appsChanged.includes(app.name))

  return frontendAppsChanged
}

const writeChangedAppsFile = (changedAppsArray: string) => {
  try {
    const input = {
      include: changedAppsArray,
    }
    console.log({ input })
    fs.writeFileSync(FILE_NAME, JSON.stringify(input))
    //file written successfully
  } catch (err) {
    console.error(err)
  }
}

const init = async (): Promise<void> => {
  const changedApps = await getChangedApps()
  writeChangedAppsFile(JSON.stringify(changedApps))
}

init()
