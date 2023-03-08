import { Channel } from "amqplib";

export class RabbitMQHelper {
  static messageChannel: Channel;

  static publishMessage(queue: string, message: any, exchange = "") {
    if (!this.messageChannel) throw Error("Message channel not set");

    const json = JSON.stringify(message);
    this.messageChannel.publish(exchange, queue, Buffer.from(json));
  }
}
