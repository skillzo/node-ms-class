import amqplib, { Connection, Channel } from 'amqplib';
import { EventPayload } from '@ecommerce/types';

export interface EventBusConfig {
  url: string;
  exchange?: string;
}

export class EventBus {
  private connection: Connection | null = null;
  private channel: Channel | null = null;
  private config: EventBusConfig;
  private exchange: string;

  constructor(config: EventBusConfig) {
    this.config = config;
    this.exchange = config.exchange || 'ecommerce.events';
  }

  async connect(): Promise<void> {
    try {
      this.connection = await amqplib.connect(this.config.url);
      this.channel = await this.connection.createChannel();
      await this.channel.assertExchange(this.exchange, 'topic', { durable: true });
    } catch (error) {
      throw new Error(`Failed to connect to message broker: ${error}`);
    }
  }

  async disconnect(): Promise<void> {
    if (this.channel) {
      await this.channel.close();
      this.channel = null;
    }
    if (this.connection) {
      await this.connection.close();
      this.connection = null;
    }
  }

  async publish(eventType: string, data: any, correlationId?: string, source?: string): Promise<void> {
    if (!this.channel) {
      throw new Error('EventBus not connected');
    }

    const payload: EventPayload = {
      eventType,
      data,
      timestamp: new Date().toISOString(),
      correlationId: correlationId || this.generateCorrelationId(),
      source: source || 'unknown',
    };

    const message = Buffer.from(JSON.stringify(payload));
    this.channel.publish(this.exchange, eventType, message, { persistent: true });
  }

  async subscribe(
    eventType: string,
    handler: (payload: EventPayload) => Promise<void>,
    queueName?: string
  ): Promise<void> {
    if (!this.channel) {
      throw new Error('EventBus not connected');
    }

    const queue = queueName || `queue.${eventType}`;
    await this.channel.assertQueue(queue, { durable: true });
    await this.channel.bindQueue(queue, this.exchange, eventType);

    await this.channel.consume(queue, async (msg) => {
      if (msg) {
        try {
          const payload: EventPayload = JSON.parse(msg.content.toString());
          await handler(payload);
          this.channel!.ack(msg);
        } catch (error) {
          console.error(`Error processing event ${eventType}:`, error);
          this.channel!.nack(msg, false, false);
        }
      }
    });
  }

  private generateCorrelationId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

