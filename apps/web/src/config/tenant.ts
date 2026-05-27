export type TenantConfig = {
  operationName: string;
  brandName: string;
  tagline: string;
  whiteLabelNote: string;
  primaryColor: string;
  darkColor: string;
  clinicAdminTitle: string;
  clinicAdminSubtitle: string;
  productionAdminTitle: string;
  productionAdminSubtitle: string;
};

export const tenantConfig: TenantConfig = {
  operationName: 'Operação Lia',
  brandName: 'Lia',
  tagline: 'Pedidos, moldes e próteses em fluxo offline-first.',
  whiteLabelNote: 'White-label pronto para outras operações',
  primaryColor: '#087f83',
  darkColor: '#0f172a',
  clinicAdminTitle: 'Consultórios que pedem próteses',
  clinicAdminSubtitle: 'Administração dos consultórios, pedidos de prótese e produção de moldes.',
  productionAdminTitle: 'Controle da empresa de próteses',
  productionAdminSubtitle: 'Acompanhamento da produção de próteses, status operacional e prontidão para entrega.'
};
