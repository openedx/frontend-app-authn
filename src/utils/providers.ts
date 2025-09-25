interface Provider {
    id: string;
    name: string;
    iconClass: string | null;
    iconImage: string;
    skipHintedLogin: boolean;
    skipRegistrationForm: boolean;
    loginUrl: string;
    registerUrl: string;
}

// Helper function to format provider names
export const formatProviderNames = (providerList: Provider[]) => {
    if (!providerList || providerList.length === 0) {
      return '';
    }
    if (providerList.length === 1) {
      return providerList[0].name;
    }
    if (providerList.length === 2) {
      return `${providerList[0].name} or ${providerList[1].name}`;
    }
    // For more than 2 providers, use commas and 'or' for the last one
    const allButLast = providerList.slice(0, -1).map(p => p.name).join(', ');
    const lastProvider = providerList[providerList.length - 1].name;
    
    return `${allButLast}, or ${lastProvider}`;
};