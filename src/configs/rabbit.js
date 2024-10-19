const RABBITMQ_URL = `amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASSWORD}@localhost:${process.env.RABBIT_MQ_PORT}`;

module.exports = RABBITMQ_URL;
