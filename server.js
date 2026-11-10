const path = require('node:path');
const express = require('express');
const rateLimit = require('express-rate-limit');
const nodemailer = require('nodemailer');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const requiredEnvironment = ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASSWORD', 'SMTP_FROM', 'EMAIL_TO'];
const missingEnvironment = requiredEnvironment.filter((key) => !process.env[key]?.trim());

if (missingEnvironment.length) {
  throw new Error(`Configure estas variáveis no .env antes de iniciar: ${missingEnvironment.join(', ')}`);
}

const port = Number(process.env.PORT || 3000);
const smtpPort = Number(process.env.SMTP_PORT || 587);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT precisa ser um número entre 1 e 65535.');
}
if (!Number.isInteger(smtpPort) || smtpPort < 1 || smtpPort > 65535) {
  throw new Error('SMTP_PORT precisa ser um número entre 1 e 65535.');
}
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(process.env.EMAIL_TO)) {
  throw new Error('EMAIL_TO precisa conter um endereço de e-mail válido.');
}

const app = express();
const mailer = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: smtpPort,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
});

app.disable('x-powered-by');
app.use(express.json({ limit: '12kb' }));
app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Muitas tentativas. Tente novamente mais tarde.' }
}));

app.post('/api/responses', async (request, response, next) => {
  const { answers } = request.body || {};
  if (!Array.isArray(answers) || answers.length < 1 || answers.length > 10) {
    response.status(400).json({ error: 'O formulário precisa conter entre 1 e 10 respostas.' });
    return;
  }

  const validAnswers = answers.every((item) =>
    item
    && typeof item.question === 'string'
    && item.question.trim().length > 0
    && item.question.length <= 180
    && typeof item.answer === 'string'
    && item.answer.trim().length > 0
    && item.answer.length <= 500
  );
  if (!validAnswers) {
    response.status(400).json({ error: 'Confira as respostas e tente novamente.' });
    return;
  }

  const text = answers
    .map(({ question, answer }) => `${question.trim()}\n${answer.trim()}`)
    .join('\n\n');

  try {
    await mailer.sendMail({
      from: process.env.SMTP_FROM,
      to: process.env.EMAIL_TO,
      subject: 'Respostas do nosso formulário',
      text
    });
    response.json({ message: 'Respostas enviadas com sucesso.' });
  } catch (error) {
    next(error);
  }
});

app.use(express.static(__dirname));

app.use((error, request, response, next) => {
  if (response.headersSent) {
    next(error);
    return;
  }
  console.error('Falha ao processar a solicitação:', error.message);
  response.status(error.status || 500).json({
    error: error.status === 413 ? 'O formulário enviado é muito grande.' : 'Não foi possível enviar agora. Tente novamente mais tarde.'
  });
});

app.listen(port, () => {
  console.log(`Projeto disponível em http://localhost:${port}`);
});
