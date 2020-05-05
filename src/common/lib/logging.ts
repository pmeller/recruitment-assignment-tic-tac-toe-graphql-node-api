/* eslint-disable no-console */

import { currentIsoTimestamp } from './datetime'
import { noop } from './fp'

export interface Logger {
  info(...content: any[]): void
  error(...content: any[]): void
  warn(...content: any[]): void
  debug(...content: any[]): void
}

enum LogLevel {
  Debug = 'debug',
  Info = 'info',
  Warn = 'warn',
  Error = 'error',
}

const getGlobalLogLevel = (): LogLevel => {
  const logLevel = process.env.LOG_LEVEL

  switch (logLevel) {
    case LogLevel.Debug:
    case LogLevel.Info:
    case LogLevel.Warn:
    case LogLevel.Error:
      return logLevel
    default:
      return LogLevel.Info
  }
}

const GLOBAL_LOG_LEVEL = getGlobalLogLevel()

const createLevelLogger = (loggerName: string, logLevel: LogLevel, print: (...args: any[]) => void) => (
  ...content: any[]
) => print(currentIsoTimestamp(), loggerName, `[${logLevel}]`, ...content)

export const createLogger = (loggerName: string, logLevel = GLOBAL_LOG_LEVEL): Logger => {
  return {
    debug: LogLevel.Debug === logLevel ? createLevelLogger(loggerName, LogLevel.Debug, console.debug) : noop,
    info: [LogLevel.Debug, LogLevel.Info].includes(logLevel)
      ? createLevelLogger(loggerName, LogLevel.Info, console.info)
      : noop,
    warn: [LogLevel.Debug, LogLevel.Info, LogLevel.Warn].includes(logLevel)
      ? createLevelLogger(loggerName, LogLevel.Warn, console.warn)
      : noop,
    error: [LogLevel.Debug, LogLevel.Info, LogLevel.Warn, LogLevel.Error].includes(logLevel)
      ? createLevelLogger(loggerName, LogLevel.Error, console.error)
      : noop,
  }
}
