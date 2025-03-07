const mockedProductData = [
  {
    uuid: 'test-uuid-1',
    title: 'How to Learn Online 1',
    subtitle: 'Org 1',
    cardImageUrl: 'https://test-recommendations.com/image/how-to-learn-online-1.png',
    authoringOrganizations: [
      {
        key: 'org-1',
        logoImageUrl: 'https://test-recommendations.com/logos/how-to-learn-online-1.png',
        name: 'Org 1',
      },
    ],
    courses: [
      {
        course: {
          title: 'How to learn online course 1',
          topics: [],
        },
      },
    ],
    type: 'Professional Certificate',
    url: '/test-professional-certificate/how-to-learn-online-1',
    organizationLogoOverrideUrl: null,
    organizationShortCodeOverride: '',
    productSource: {
      name: 'company X',
      slug: 'companyX',
    },
    status: 'active',
    hidden: false,
    degree: null,
    locationRestriction: null,
    cardType: 'program',
    cardIndex: 0,
  },
  {
    uuid: 'test-uuid-2',
    title: 'How to Learn Online 2',
    subtitle: 'Org 2',
    cardImageUrl: 'https://test-recommendations.com/image/how-to-learn-online-2.png',
    authoringOrganizations: [
      {
        key: 'org-2',
        logoImageUrl: 'https://test-recommendations.com/logos/how-to-learn-online-2.png',
        name: 'Org 2',
      },
    ],
    courses: [
      {
        course: {
          title: 'How to learn online course 1',
          topics: [],
        },
      },
      {
        course: {
          title: 'How to learn online course 2',
          topics: [],
        },
      },
    ],
    type: 'Professional Certificate',
    url: '/test-professional-certificate/how-to-learn-online-2',
    organizationLogoOverrideUrl: null,
    organizationShortCodeOverride: '',
    productSource: {
      name: 'company X',
      slug: 'companyX',
    },
    status: 'active',
    hidden: false,
    degree: null,
    cardType: 'program',
    cardIndex: 1,
    locationRestriction: { restrictionType: 'blocklist', countries: ['PK'] },
  },
];

export default mockedProductData;
