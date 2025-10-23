import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';

export async function POST(request: NextRequest) {
  try {
    const { amount, description, customer } = await request.json();

    if (!amount || !customer) {
      return NextResponse.json(
        { success: false, error: 'Dados obrigatórios não fornecidos' },
        { status: 400 }
      );
    }

    // Gerar chave PIX aleatória (em produção, você usaria uma chave real)
    const pixKey = 'zark@zarabatanas.com.br'; // Chave PIX da loja
    
    // Gerar código PIX válido usando padrão EMV
    const pixCode = generatePixCode({
      pixKey,
      amount: amount * 100, // Converter para centavos
      description: description || `Compra - ${customer.name}`,
      merchantName: 'ZARK',
      merchantCity: 'São Paulo',
      txid: generateTxId()
    });

    // Gerar QR Code
    const qrCodeDataUrl = await QRCode.toDataURL(pixCode, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    // Definir expiração (15 minutos)
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    return NextResponse.json({
      success: true,
      pix: {
        qrCode: qrCodeDataUrl,
        copyPaste: pixCode,
        expiresAt: expiresAt.toISOString(),
        amount: amount,
        description: description || `Compra - ${customer.name}`
      }
    });

  } catch (error: any) {
    console.error('Erro ao gerar PIX:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Função para gerar código PIX válido
function generatePixCode(params: {
  pixKey: string;
  amount: number;
  description: string;
  merchantName: string;
  merchantCity: string;
  txid: string;
}): string {
  const { pixKey, amount, description, merchantName, merchantCity, txid } = params;

  // Estrutura EMV para PIX
  const emv = [
    { id: '00', value: '01' }, // Payload Format Indicator
    { id: '26', value: `0014BR.GOV.BCB.PIX0114${pixKey}` }, // Merchant Account Information
    { id: '52', value: '0000' }, // Merchant Category Code
    { id: '53', value: '986' }, // Transaction Currency (986 = BRL)
    { id: '54', value: amount.toString() }, // Transaction Amount
    { id: '58', value: 'BR' }, // Country Code
    { id: '59', value: merchantName }, // Merchant Name
    { id: '60', value: merchantCity }, // Merchant City
    { id: '62', value: `05${txid}` } // Additional Data Field Template
  ];

  // Construir string EMV
  let emvString = emv.map(item => item.id + item.value.length.toString().padStart(2, '0') + item.value).join('');
  
  // Adicionar CRC16
  const crc = calculateCRC16(emvString + '6304');
  emvString += '6304' + crc;

  return emvString;
}

// Função para calcular CRC16
function calculateCRC16(data: string): string {
  const polynomial = 0x1021;
  let crc = 0xFFFF;

  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i) << 8;
    
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ polynomial;
      } else {
        crc <<= 1;
      }
    }
  }

  return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
}

// Função para gerar Transaction ID único
function generateTxId(): string {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 15);
  return `${timestamp}${random}`.substring(0, 25);
}
