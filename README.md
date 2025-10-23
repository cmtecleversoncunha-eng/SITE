# ZARK - Loja Online

Loja online especializada em zarabatanas e acessórios.

## Tecnologias

- **Next.js 15** - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Supabase** - Banco de dados e autenticação
- **Mercado Pago** - Gateway de pagamento
- **Melhor Envio** - Cálculo de frete

## Funcionalidades

- 🛒 Catálogo de produtos
- 🚚 Cálculo automático de frete
- 💳 Pagamentos via Mercado Pago
- 👤 Sistema de usuários
- 📱 Design responsivo
- ⚡ Performance otimizada

## Deploy

Este projeto está configurado para deploy automático no Vercel.

### Variáveis de Ambiente

Configure as seguintes variáveis no Vercel:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY`
- `MERCADOPAGO_ACCESS_TOKEN`
- `MELHOR_ENVIO_TOKEN`
- `MELHOR_ENVIO_CLIENT_ID`
- `MELHOR_ENVIO_SECRET`
- `MELHOR_ENVIO_API_URL`
- `MELHOR_ENVIO_FROM_ZIP`
- `MELHOR_ENVIO_FROM_NAME`
- `MELHOR_ENVIO_USE_MOCK`

## Desenvolvimento

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm start
```
