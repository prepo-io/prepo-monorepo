import { notification } from 'antd'

export function handleError(message: string, error: unknown): void {
  // eslint-disable-next-line no-console
  console.error(error)
  if (error instanceof Error) {
    notification.error({
      message,
      description: error.message,
    })
  }
}
