export const convertCourseRunKeytoCourseKey = (courseRunKey) => {
  if (!courseRunKey) {
    return '';
  }
  const newKeyFormat = courseRunKey.includes('+');
  if (newKeyFormat) {
    const splitCourseRunKey = courseRunKey.split(':').slice(-1)[0];
    const splitCourseKey = splitCourseRunKey.split('+').slice(0, 2);
    return `${splitCourseKey[0]}+${splitCourseKey[1]}`;
  }
  const splitCourseKey = courseRunKey.split('/').slice(0, 2);
  return `${splitCourseKey[0]}+${splitCourseKey[1]}`;
};

const courseTypeToProductTypeMap = {
  course: 'Course',
  'verified-audit': 'Course',
  verified: 'Course',
  audit: 'Course',
  'credit-verified-audit': 'Course',
  'spoc-verified-audit': 'Course',
  professional: 'Professional Certificate',
  'bootcamp-2u': 'Boot Camp',
  'executive-education-2u': 'Executive Education',
  'executive-education': 'Executive Education',
  masters: "Master's",
  'masters-verified-audit': "Master's",
};

const programTypeToProductTypeMap = {
  xseries: 'XSeries',
  micromasters: 'MicroMasters',
  microbachelors: 'MicroBachelors',
  'professional certificate': 'Professional Certificate',
  "bachelor's": "Bachelor's",
  bachelors: "Bachelor's",
  "master's": "Master's",
  masters: "Master's",
  doctorate: 'Doctorate',
  license: 'License',
  certificate: 'Certificate',
};

export const useProductType = (courseType, programType) => {
  const courseTypeLowerCase = courseType?.toLowerCase();
  if (courseTypeToProductTypeMap[courseTypeLowerCase]) {
    return courseTypeToProductTypeMap[courseTypeLowerCase];
  }

  const programTypeLowerCase = programType?.toLowerCase();
  if (programTypeToProductTypeMap[programTypeLowerCase]) {
    return programTypeToProductTypeMap[programTypeLowerCase];
  }

  return undefined;
};

export const getVariant = (productType) => (
  ['Boot Camp', 'Executive Education', 'Course'].includes(productType) ? 'light' : 'dark'
);

export const createCodeFriendlyProduct = (type) => type?.replace(/\s+/g, '-').replace(/'/g, '').toLowerCase();

export const isEdxProgram = ({ cardType, is2UDegreeProgram }) => cardType === 'program' && !is2UDegreeProgram;

export const truncateText = (input) => (input?.length > 50 ? `${input.substring(0, 50)}...` : input);

export default convertCourseRunKeytoCourseKey;
