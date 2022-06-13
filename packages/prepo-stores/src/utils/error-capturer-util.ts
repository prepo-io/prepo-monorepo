import { makeError } from 'prepo-utils'
import { runInAction } from 'mobx'
import { CaptureError, ErrorCapturer } from './stores.types'

const irrelevantErrors = [
  'missing revert data in call exception', // etherjs BaseProvider error
  'missing revert data in call exception; Transaction reverted without a reason string', // etherjs JsonRpcProvider error
  'failed to meet quorum', // fallback provider error
]

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isImportantError = (error: any): boolean => !irrelevantErrors.includes(error.reason)

export const makeErrorCapturer =
  (errorCapturer?: ErrorCapturer): CaptureError =>
  (err): Error => {
    const error = makeError(err)
    runInAction(() => {
      // TODO: format/serialize store
      if (errorCapturer) {
        errorCapturer(error)
      }
    })
    return error
  }
