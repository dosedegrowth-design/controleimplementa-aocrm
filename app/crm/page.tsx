import { CrmLanding } from "./crm-landing";

export const metadata = {
  title: "CRM SuperVisão — Painel oficial das unidades",
  description:
    "Pare de perder cliente no WhatsApp. Centralize, organize e venda mais com o CRM oficial da rede SuperVisão.",
  openGraph: {
    title: "CRM SuperVisão — Painel oficial das unidades",
    description:
      "Painel único pra atender, vender, agendar e medir tudo da sua unidade.",
  },
};

export default function CrmLandingPage() {
  return <CrmLanding />;
}
