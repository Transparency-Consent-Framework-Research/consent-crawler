declare module 'tc-string-parse' {
  type ParseResult = {
    core: {
      version: number;
      cmpId: number;
      cmpVersion: number;
      consentScreen: number;
      consentLanguage: string;
      vendorListVersion: number;
      tcfPolicyVersion: number;
      isServiceSpecific: boolean;
      useNonStandardStacks: boolean;
      specialFeatureOptins: object;
      purposeConsents: object;
      purposeLegitimateInterests: object;
      purposeOneTreatment: boolean;
      publisherCountryCode: string;
      vendorConsents: object;
      vendorLegitimateInterests: object;
      publisherRestrictions?: object;
    },
    publisherTC: {
      purposeConsents: object,
      purposeLegitimateInterests: object,
      numCustomPurposes: number,
      customPurposeConsents: object,
      customPurposeLegitimateInterests: object,
    },
  }
  export default function parse_string(input: string): ParseResult;
}