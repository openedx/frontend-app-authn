export const registerFields = {
  fields: {
    country: {
      name: 'country',
      error_message: 'Select your country or region of residence',
    },
    honor_code: {
      name: 'honor_code',
      type: 'tos_and_honor_code',
      error_message: '',
    },
  },
};

export const progressiveProfilingFields = {
  extended_profile: [],
  fields: {
    level_of_education: {
      name: 'level_of_education',
      type: 'select',
      label: 'Highest level of education completed',
      error_message: '',
      options: [
        [
          'p',
          'Doctorate',
        ],
        [
          'm',
          "Master's or professional degree",
        ],
        [
          'b',
          "Bachelor's degree",
        ],
        [
          'a',
          'Associate degree',
        ],
        [
          'hs',
          'Secondary/high school',
        ],
        [
          'jhs',
          'Junior secondary/junior high/middle school',
        ],
        [
          'none',
          'No formal education',
        ],
        [
          'other',
          'Other education',
        ],
      ],
    },
    gender: {
      name: 'gender',
      type: 'select',
      label: 'Gender',
      error_message: '',
      options: [
        [
          'm',
          'Male',
        ],
        [
          'f',
          'Female',
        ],
        [
          'o',
          'Other/Prefer Not to Say',
        ],
      ],
    },
  },
};

export const FIELD_LABELS = {
  COUNTRY: 'country',
};
