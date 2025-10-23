declare global {
  interface Window {
    MercadoPago: {
      new (key: string, options?: { locale?: string }): IMercadoPago;
    };
  }
}

interface IMercadoPago {
  cardForm: (options: any) => any;
  createCardToken: (cardData: any) => Promise<{ id: string }>;
  getInstallments: (options: any) => Promise<any>;
  getIssuers: (options: any) => Promise<any>;
  getIdentificationTypes: () => Promise<any>;
}

export {};
