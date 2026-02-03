/* eslint-disable no-console */

class Logger {
  static log(data: any): void {
    console.log(`[LOG]: ${data}`);
  }

  static info(data: any): void {
    console.info(`[INFO]: ${data}`);
  }

  static error(data: any): void {
    console.error(`[ERROR]: ${data}`);
  }
}

export default Logger;
