const amqp = require("amqplib");
const Responses = require("@constants/responses");
const RABBITMQ_URL = require("@configs/rabbit");

const QUEUE_NAME = "user_queue";
const responses = new Responses();

// Function to send a message to RabbitMQ
const send_message_to_queue = async (message) => {
  try {
    // Log the RabbitMQ URL for debugging
    console.log("RabbitMQ URL:", RABBITMQ_URL);

    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();

    await channel.assertQueue(QUEUE_NAME, { durable: true }); // Ensure the queue exists
    channel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(message)), {
      persistent: true,
    });

    console.log(`Sent message to queue: ${JSON.stringify(message)}`);

    await channel.close();
    await connection.close();
  } catch (error) {
    console.log(error);
    // throw responses.server_error_response("Error sending message to RabbitMQ:");
  }
};

module.exports = send_message_to_queue;
