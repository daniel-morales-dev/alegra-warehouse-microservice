import app from "../app";
import morgan from "morgan";
import { AppDataSource } from "../config/DataSource.config";

export default class Server {
  public port: number;
  constructor(port: number) {
    this.port = port;
  }

  static init(port: number) {
    return new Server(port);
  }

  start(callback: () => void) {
    this.connect()
      .then(() => {
        app.use(
          morgan(
            ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" STATUS=:status :res[content-length] ":referrer" ":user-agent"',
          ),
        );
        app.disable("x-powered-by");
        app.listen(this.port, callback);
      })
      .catch((err) => console.error(err));
  }

  private async connect(): Promise<void> {
    await AppDataSource.initialize();
  }
}
