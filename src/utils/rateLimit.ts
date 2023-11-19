export function throttle<T>(
  func: (this: T, ...args: any[]) => void,
  interval: number
): (this: T, ...args: any[]) => void {
  let isRunning = false

  return function (this: T, ...args: any[]) {
    if (!isRunning) {
      isRunning = true

      func.apply(this, args)
      setTimeout(() => {
        isRunning = false
      }, interval)
    }
  }
}
