# Um capítulo nosso

Uma página romântica simples, feita com HTML, CSS e JavaScript, com um pequeno servidor Node.js para enviar as respostas do formulário.

## Pastas

- `index.html`: conteúdo da página.
- `assets/css/styles.css`: estilos e layout responsivo.
- `assets/js/app.js`: personalização, enigma, formulário, Campo Minado e galeria.
- `assets/js/config.js`: valores iniciais do enigma, perguntas e caminhos das fotos.
- `assets/fotos/`: coloque aqui as fotos do projeto.
- `.env`: credenciais SMTP e endereço que recebe as respostas (não é enviado ao Git).
- `.env.example`: modelo das variáveis de ambiente.
- `server.js`: servidor local e endpoint de envio do formulário.

## Personalizar

Abra `index.html` no navegador. No botão **Personalizar**, você pode mudar os nomes, a data, os textos, a cartinha e todos os campos do enigma. As respostas não diferenciam maiúsculas de minúsculas nem acentos. Essas mudanças ficam salvas no armazenamento local do navegador usado para editar a página.

Para trocar as fotos sem editar código, clique em uma imagem da galeria e escolha um arquivo. Esse envio fica salvo apenas naquele navegador. As imagens podem ter até 2,5 MB cada.

Para incluir fotos como arquivos do projeto, copie-as para `assets/fotos/` e informe os caminhos em `assets/js/config.js`, por exemplo:

```js
photos: [
  'assets/fotos/nossa-foto.jpg',
  'assets/fotos/um-passeio.png',
  'assets/fotos/outro-momento.jpg'
]
```

Uma foto escolhida pela galeria substitui a foto do projeto naquele navegador; use o botão `×` da imagem para voltar à foto configurada no projeto.

Se quiser publicar a página já com o enigma pronto para outra pessoa, preencha os valores iniciais em `assets/js/config.js` antes de publicar. Personalizações feitas pelo botão **Personalizar** são locais e não são enviadas junto com o site.

## Formulário de perguntas

Para receber as respostas, configure no `.env` o servidor SMTP do seu provedor:

```env
SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=
EMAIL_TO=
```

`SMTP_FROM` deve ser um endereço autorizado pelo provedor, e `EMAIL_TO` é o endereço que receberá as respostas. Você pode consultar o `.env.example` para ver o formato. Não compartilhe o `.env` nem coloque credenciais no `assets/js/config.js`; o arquivo `.env` está ignorado pelo Git.

Para mudar as perguntas, edite a lista `form.questions` em `assets/js/config.js`; cada item tem um `id` único, um `label` e um `type` (`text` ou `textarea`).

## Iniciar o projeto

1. Instale o [Node.js](https://nodejs.org/).
2. Preencha as variáveis SMTP e `EMAIL_TO` no `.env`.
3. No terminal, dentro da pasta do projeto, rode `npm install` uma vez.
4. Rode `npm start` e abra `http://localhost:3000`.

O formulário só pode enviar e-mails quando o `.env` tiver credenciais válidas de um serviço SMTP. A senha fica no servidor e não é enviada ao navegador.

## Campo Minado

O jogo tem uma grade 8×8 com 10 minas. O primeiro clique é sempre seguro. No computador, use o botão direito para marcar uma bandeira; no celular, use **Marcar bandeiras**.

Abra pelo endereço do servidor (`http://localhost:3000`); abrir `index.html` diretamente ou usar apenas Live Server não inicia o endpoint de e-mail.
