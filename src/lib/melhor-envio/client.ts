import axios, { AxiosInstance } from 'axios';
import { 
  MelhorEnvioProduct, 
  ShippingCalculation, 
  ShippingCalculationResponse, 
  ShippingError,
  MelhorEnvioConfig 
} from '@/types/melhor-envio';

class MelhorEnvioClient {
  private api: AxiosInstance;
  private config: MelhorEnvioConfig;

  constructor() {
    this.config = {
      token: process.env.MELHOR_ENVIO_TOKEN || '',
      clientId: process.env.MELHOR_ENVIO_CLIENT_ID || '',
      secret: process.env.MELHOR_ENVIO_SECRET || '',
      apiUrl: process.env.MELHOR_ENVIO_API_URL || 'https://sandbox.melhorenvio.com.br/api/v2',
      fromZip: process.env.MELHOR_ENVIO_FROM_ZIP || '01310100',
      fromName: process.env.MELHOR_ENVIO_FROM_NAME || 'zark'
    };

    // Debug: Log das configurações
    console.log('🔧 Melhor Envio Config:', {
      fromZip: this.config.fromZip,
      fromZipClean: this.config.fromZip.replace(/\D/g, ''),
      apiUrl: this.config.apiUrl,
      hasToken: !!this.config.token
    });

    this.api = axios.create({
      baseURL: this.config.apiUrl,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.token}`,
        'User-Agent': 'Zark E-commerce (contato@zark.com)'
      },
      timeout: 30000 // 30 segundos
    });
  }

  /**
   * Calcula frete para um CEP de destino
   */
  async calculateShipping(params: {
    toZip: string;
    products: MelhorEnvioProduct[];
  }): Promise<ShippingCalculationResponse[]> {
    try {
      if (!this.config.token) {
        throw new Error('Token do Melhor Envio não configurado. Atualize as variáveis de ambiente MELHOR_ENVIO_* e reinicie o servidor.');
      }

      // Validar CEPs
      const fromZipClean = this.config.fromZip.replace(/\D/g, '');
      const toZipClean = params.toZip.replace(/\D/g, '');
      
      console.log('🔍 Debug CEPs:', {
        originalFromZip: this.config.fromZip,
        fromZipClean,
        originalToZip: params.toZip,
        toZipClean
      });
      
      if (!await this.validateZipCode(fromZipClean)) {
        throw new Error(`CEP de origem inválido: ${this.config.fromZip}`);
      }
      
      if (!await this.validateZipCode(toZipClean)) {
        throw new Error(`CEP de destino inválido: ${params.toZip}`);
      }

      // Preparar dados para a API
      const calculationData: ShippingCalculation = {
        from: {
          postal_code: fromZipClean
        },
        to: {
          postal_code: toZipClean
        },
        products: params.products,
        services: '1,2,3,4,17', // Correios (PAC, SEDEX) e Jadlog
        options: {
          insurance_value: 0,
          receipt: false,
          own_hand: false,
          reverse: false,
          non_commercial: false,
          platform: 'zark-ecommerce'
        }
      };

      console.log('🚚 Calculando frete:', {
        from: calculationData.from.postal_code,
        to: calculationData.to.postal_code,
        products: calculationData.products.length
      });

      const response = await this.api.post('/me/shipment/calculate', calculationData);

      if (!response.data || !Array.isArray(response.data)) {
        console.error('❌ Corpo inesperado recebido da API do Melhor Envio:', {
          status: response.status,
          data: response.data
        });
        throw new Error('Resposta inválida da API do Melhor Envio');
      }

      // Filtrar apenas Correios e Jadlog, ordenar por preço
      const filteredResults = response.data
        .filter((item: any) => {
          const companyName = item.company?.name?.toLowerCase() || '';
          return companyName.includes('correios') || companyName.includes('jadlog');
        })
        .sort((a: any, b: any) => a.final_price - b.final_price);

      console.log(`✅ Frete calculado: ${filteredResults.length} opções encontradas`);
      
      return filteredResults;

    } catch (error: any) {
      console.error('❌ Erro ao calcular frete:', error);
      if (error.response) {
        console.error('📦 Resposta bruta da API:', error.response.status, error.response.data);
        if (error.response.status === 401 || error.response.status === 403) {
          throw new Error('Credenciais inválidas do Melhor Envio. Verifique o token informado.');
        }
        if (error.response.status === 404) {
          throw new Error('Endpoint de cálculo de frete do Melhor Envio não encontrado. Confirme a URL base configurada.');
        }
        if (error.response.status === 405) {
          throw new Error('Método HTTP não suportado pela API do Melhor Envio. Confirme se o endpoint correto está configurado.');
        }
      }
      
      if (error.code === 'ECONNABORTED') {
        throw new Error('Timeout na consulta de frete. Tente novamente.');
      }
      
      throw new Error(error.message || 'Erro interno ao calcular frete');
    }
  }

  /**
   * Valida se um CEP é válido
   */
  async validateZipCode(zipCode: string): Promise<boolean> {
    const cleanZip = zipCode.replace(/\D/g, '');
    
    if (cleanZip.length !== 8) {
      console.log(`❌ CEP inválido: ${zipCode} (${cleanZip.length} dígitos)`);
      return false;
    }

    // Validação básica de CEP brasileiro
    const cepRegex = /^[0-9]{8}$/;
    const isValid = cepRegex.test(cleanZip);
    
    if (!isValid) {
      console.log(`❌ CEP inválido: ${zipCode} (formato incorreto)`);
    }
    
    // Validação adicional: CEPs conhecidos como inválidos
    const invalidCeps = ['00000000', '11111111', '22222222', '33333333', '44444444', '55555555', '66666666', '77777777', '88888888', '99999999'];
    if (invalidCeps.includes(cleanZip)) {
      console.log(`❌ CEP inválido: ${zipCode} (CEP genérico)`);
      return false;
    }
    
    return isValid;
  }

  /**
   * Converte dimensões do formato "20x15x10" para objeto
   */
  parseDimensions(dimensions: string): { width: number; height: number; length: number } {
    const parts = dimensions.split('x').map(Number);
    
    if (parts.length !== 3 || parts.some(isNaN)) {
      throw new Error('Formato de dimensões inválido. Use: largura x altura x comprimento');
    }

    return {
      width: parts[0],
      height: parts[1], 
      length: parts[2]
    };
  }

  /**
   * Normaliza dimensões para atender limites mínimos dos Correios
   */
  private normalizeDimensions(dim: { width: number; height: number; length: number }) {
    // Correios exige mínimo: 11cm (comprimento) x 16cm (largura) x 2cm (altura)
    // Para simplificar, usamos 11x16x2 como mínimos
    return {
      width: Math.max(dim.width, 11),
      height: Math.max(dim.height, 2),
      length: Math.max(dim.length, 16)
    };
  }

  /**
   * Converte produto do banco para formato do Melhor Envio
   */
  convertProduct(product: {
    id: number;
    weight: number | null;
    dimensions: string | null;
    quantity: number;
  }): MelhorEnvioProduct {
    if (!product.weight || !product.dimensions) {
      throw new Error(`Produto ${product.id} sem peso ou dimensões configurados`);
    }

    const weight = Math.max(product.weight, 0.001); // Mínimo 1g
    const dimensions = this.parseDimensions(product.dimensions);
    const normalized = this.normalizeDimensions(dimensions);

    return {
      id: product.id.toString(),
      weight: weight,
      width: normalized.width,
      height: normalized.height,
      length: normalized.length,
      quantity: product.quantity
    };
  }

  /**
   * Formata preço para exibição
   */
  formatPrice(priceInCents: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(priceInCents / 100);
  }

  /**
   * Formata prazo de entrega
   */
  formatDeliveryTime(deliveryTime: number): string {
    if (deliveryTime === 1) {
      return '1 dia útil';
    }
    return `${deliveryTime} dias úteis`;
  }
}

export const melhorEnvioClient = new MelhorEnvioClient();
export default melhorEnvioClient;
