import client, { Connection, Channel } from "amqplib";
import { AMQP_URL } from "../config/app.config";
import { Service, Container } from "typedi";
import { QUEUES_TO_SUBSCRIBE } from "./queues.amqp";

type HandlerCB = (msg: string, ack: () => void) => any;

@Service()
class RabbitMQConnection {
  private connection!: Connection;
  private channel!: Channel;
  private connected: boolean = false;

  async connect() {
    if (this.connected && this.channel) return;
    try {
      console.log("⌛️ Connecting to RabbitMQ Server");
      this.connection = await client.connect(AMQP_URL);
      console.log("✅ RabbitMQ Connection is ready");
      this.channel = await this.connection.createChannel();
      this.channel.prefetch(1);
      console.log("🛸 Created RabbitMQ Channel successfully");
      this.connected = true;
    } catch (error) {
      console.error(error);
      console.error("Not connected to MQ Server");
    }
  }

  async consume(
    handleIncomingNotification: HandlerCB,
    queueName: string,
    prefetch: number = 1,
  ): Promise<void> {
    await this.channel.assertQueue(queueName, {
      durable: true,
    });

    this.channel.prefetch(prefetch);

    this.channel.consume(
      queueName,
      async (msg) => {
        if (!msg) {
          console.error("Invalid incoming message");
          return;
        }
        try {
          await handleIncomingNotification(msg.content.toString(), () =>
            this.channel.ack(msg),
          );
        } catch (error) {
          console.error("Error processing message:", error);
          const errorMsg = {
            originalMessage: msg.content.toString(),
            error: error,
          };
          this.channel.sendToQueue(
            "error_queue",
            Buffer.from(JSON.stringify(errorMsg)),
          );
          this.channel.nack(msg, false, false); // Do not requeue
        }
      },
      { noAck: false },
    );
  }

  async sendToQueue<T>(queue: string, message: T) {
    try {
      if (!this.channel) {
        await this.connect();
      }
      this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
    } catch (error) {
      console.error("Error sending message to queue:", error);
      throw error;
    }
  }

  async initializeSubscription() {
    for (const queue of QUEUES_TO_SUBSCRIBE) {
      const handlerInstance = Container.get(queue.HANDLER);
      const prefetch = queue.PREFETCH || 1;
      await this.consume(
        (msg: string, ack: () => void) => handlerInstance.run(msg, ack),
        queue.NAME,
        prefetch,
      );
      console.info(
        `[INFO] Subscribed to queue: ${queue.NAME} with prefetch: ${prefetch}`,
      );
    }
  }
}

const mqConnection = new RabbitMQConnection();

export default mqConnection;
