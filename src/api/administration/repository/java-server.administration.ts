import { Writable, Stream } from 'stream';
import { spawn, ChildProcess } from 'child_process';
import { logger } from '../../../global/logger';
import { SERVER_JAR_PATH } from '../../../core/config/environment';

export type ServerStatus =
  | 'online'
  | 'busy'
  | 'offline'
  | 'unknown'
  | 'initializing'
  | 'stopping'
  | 'errored';

class OutputStream extends Writable {
  private buffer: string[] = [];
  _write(chunk: any, encoding: string, next: (err?: Error) => void) {
    try {
      this.buffer.push(chunk);
      logger.debug(chunk.toString());
    } catch (err) {
      next(err);
    } finally {
      next();
    }
  }
  read() {
    return this.buffer.toString();
  }
}

export class JavaServer {
  private instance: ChildProcess;
  private isServerStopped = true;
  private isServerStarting = false;
  private isServerStopping = false;
  private isServerStarted = false;
  private isServerErrored = false;
  private outputStream: { stdout: Writable; stdin: Writable; stderr: Writable };

  constructor() {
    this.outputStream = {
      stdout: new OutputStream(),
      stdin: new OutputStream(),
      stderr: new OutputStream()
    };
  }
  async start() {
    try {
      logger.debug('Starting Java Server');
      this.instance = await this.spawnMinecraftServer();
      logger.debug(`Java Server started`);
      return true;
    } catch (err) {
      logger.crit(err.toString());
      return false;
    }
  }

  status(): ServerStatus {
    if (this.isServerStarting && !this.isServerStopped && !this.isServerStarted)
      return 'initializing';
    else if (this.isServerStopped && !this.isServerStarting && !this.isServerStarted)
      return 'offline';
    else if (this.isServerStarted && !this.isServerStarting && !this.isServerStopped)
      return 'online';
    else if (this.isServerErrored) return 'errored';
    else if (this.isServerStopping) return 'stopping';
    else return 'unknown';
  }

  async spawnMinecraftServer(): Promise<ChildProcess> {
    try {
      if (this.isServerStopped && !this.isServerStarting && !this.isServerStarting) {
        const instance = spawn('java', ['-Xmx1024M', '-Xms1024M', '-jar', `server.jar`, 'nogui'], {
          cwd: SERVER_JAR_PATH
        });
        return new Promise((resolve, reject) => {
          this.isServerStopped = false;
          this.isServerStarted = false;
          this.isServerStarting = true;
          this.attachHandlers(instance);
          const startedHandler = (data: string) => {
            const decodedData = data.toString();
            const serverStarted = RegExp(/(Done)(.*)(! For help, type "help")/).test(decodedData);
            if (serverStarted) {
              this.isServerStarted = true;
              this.isServerStarting = false;
              instance.removeListener('data', startedHandler);
              resolve(instance);
            }
          };
          instance.stdout.on('data', startedHandler);
        });
      }
    } catch (err) {
      this.isServerStarted = false;
      this.isServerStarting = false;
      this.isServerStopped = true;
      logger.crit('Error spawning Java server');
      logger.crit(err.toString());
    }
  }

  attachHandlers(instance: ChildProcess) {
    this.registerStdIoListeners(instance);
  }

  registerStdIoListeners(instance: ChildProcess) {
    try {
      instance.stdout.on('data', data => this.outputStream.stdout.write(data));
      instance.stderr.on('data', data => this.outputStream.stderr.write(data));
      instance.stdin.on('data', data => this.outputStream.stdin.write(data));
    } catch (err) {
      logger.crit('Error attaching IO Handlers');
      logger.crit(err);
    }
  }

  removeAllListeners(instance: ChildProcess) {
    instance.removeAllListeners();
  }

  async stop() {
    try {
      this.isServerStopping = true;
      this.isServerStarted = false;
      this.isServerStarting = false;
      this.isServerStopped = false;
      logger.debug('Restarting Server');

      this.instance.stdin.write('stop\n');

      await new Promise(resolve =>
        this.instance.on('close', (code, signal) => resolve({ code, signal }))
      );
      this.removeAllListeners(this.instance);
      this.isServerStopped = true;
      this.isServerStopping = false;
    } catch (err) {
      logger.crit(err.toString());
    }
  }

  async shutdown() {
    this.removeAllListeners(this.instance);
    await this.stop();
  }

  async restart() {
    await this.stop();
    await this.start();
  }
}
