// Types para integração com Melhor Envio

export interface MelhorEnvioProduct {
  id: string;
  weight: number; // em kg
  width: number; // em cm
  height: number; // em cm
  length: number; // em cm
  quantity: number;
}

export interface ShippingOption {
  id: string;
  name: string; // ex: "PAC", "SEDEX", "Jadlog"
  company: string; // ex: "Correios", "Jadlog"
  price: number; // preço em centavos
  delivery_time: number; // prazo em dias úteis
  delivery_range: {
    min: number;
    max: number;
  };
  company_id: number;
  error?: string;
}

export interface ShippingCalculation {
  from: {
    postal_code: string;
  };
  to: {
    postal_code: string;
  };
  products: MelhorEnvioProduct[];
  services: string; // IDs dos serviços separados por vírgula
  options?: {
    insurance_value?: number;
    receipt?: boolean;
    own_hand?: boolean;
    reverse?: boolean;
    non_commercial?: boolean;
    invoice?: {
      key: string;
    };
    platform?: string;
  };
}

export interface ShippingCalculationResponse {
  id: string;
  name: string;
  price: number;
  company: {
    id: number;
    name: string;
    picture: string;
  };
  delivery_time: number;
  delivery_range: {
    min: number;
    max: number;
  };
  type: string;
  packages: Array<{
    price: number;
    discount: number;
    format: string;
    dimensions: {
      height: number;
      width: number;
      length: number;
    };
    weight: number;
    insurance_value: number;
    products: Array<{
      id: string;
      quantity: number;
    }>;
  }>;
  additional_services: Array<{
    id: string;
    name: string;
    price: number;
  }>;
  company_id: number;
  final_price: number;
  original_price: number;
  currency: string;
  delivery_time_info: {
    working_days: number;
  };
}

export interface ShippingError {
  message: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

// Configuração do Melhor Envio
export interface MelhorEnvioConfig {
  token: string;
  clientId: string;
  secret: string;
  apiUrl: string;
  fromZip: string;
  fromName: string;
}
