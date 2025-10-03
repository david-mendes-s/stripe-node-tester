import winston from 'winston';
import path from 'path';
import 'winston-daily-rotate-file';

// Define os níveis de log personalizados (opcional)
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define cores para cada nível de log (opcional)
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Adiciona cores ao winston
winston.addColors(colors);

// Define o formato dos logs
const format = winston.format.combine(
  // Adiciona timestamp
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  // Adiciona coloração condicional (apenas para console)
  winston.format.colorize({ all: true }),
  // Define o formato da mensagem
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

// Configuração para rotação de logs
const fileRotateTransport = new winston.transports.DailyRotateFile({
  filename: path.join('logs', 'application-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m', // Tamanho máximo de 20MB por arquivo
  maxFiles: '14d', // Manter logs por 14 dias
  zippedArchive: true, // Compactar arquivos antigos
});

// Configuração para rotação de logs de erro
const errorFileRotateTransport = new winston.transports.DailyRotateFile({
  filename: path.join('logs', 'error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '30d', // Manter logs de erro por mais tempo (30 dias)
  level: 'error',
  zippedArchive: true,
});

// Define quais transportes serão usados
const transports = [
  // Logs de erro e todos os logs com rotação
  errorFileRotateTransport,
  fileRotateTransport,
  // Logs também serão exibidos no console
  new winston.transports.Console(),
];

// Cria a instância do logger
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'warn',
  levels,
  format,
  transports,
});

export default logger;
