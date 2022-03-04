import { Consumer, Kafka } from 'kafkajs';
import { PrismaClient } from '@prisma/client';


export class Server {
    private kafka: Kafka;
    private brokers: string[]
    private clientId: string;
    private consumer: Consumer;
    private group: string;
    private prisma: PrismaClient;

    constructor({ brokers, clientId, group }: {brokers?: string[], clientId?: string, group?: string}){
        this.brokers = brokers ? brokers : process.env.KAFKA_BROKERS ? process.env.KAFKA_BROKERS.split(',') : ['localhost:9092']
        this.clientId = clientId ? clientId : process.env.KAFKA_CLIENT_ID ? process.env.KAFKA_CLIENT_ID : "CHAT_MESSAGES_SERVER";
        this.group = group ? group : process.env.KAFKA_CONSUMER_GROUP ? process.env.KAFKA_CONSUMER_GROUP : "chatserver-messages";

        this.kafka = new Kafka({
            clientId: this.clientId,
            brokers: this.brokers
        });

        this.consumer = this.kafka.consumer({
            groupId: this.group
        });

        this.prisma = new PrismaClient();
    }

    async listen() {
        await this.consumer.connect()
        await this.consumer.subscribe({
            topic: /chat_\w+$/,
            fromBeginning: true
        })

        this.consumer.run({
            eachMessage: async({ topic, partition, message }) => {

                const chatMessage = JSON.parse(message.value?.toString() as string)
                await this.prisma.message.create({
                    data: {
                        id: chatMessage.id,
                        user: chatMessage.user,
                        room: chatMessage.room,
                        message: chatMessage.message,
                        kafkaPartition: partition,
                        kafkaTopic: topic
                    }
                });
            }
        })
    }
}