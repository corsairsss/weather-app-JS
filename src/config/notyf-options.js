export default {
  duration: 5000,
  position: {
    x: 'center',
    y: 'top',
  },
  types: [
    {
      type: 'error',
      backgroundColor: 'grey',
      duration: 2000,
      message: `CITY in the favorites list`,

      dismissible: true,
    },
    {
      type: 'nocity',
      backgroundColor: 'orange',
      duration: 2000,
      message: `Enter your city...`,

      dismissible: true,
    },
    {
      type: 'info',
      backgroundColor: '#007786',
      icon: false,
      message: `Added City to favorites list`,
      dismissible: true,
      duration: 2000,
    },
    {
      type: 'badRequest',
      backgroundColor: '#007786',
      icon: false,
      message: `NO CITY FOUND`,
      dismissible: true,
      duration: 3000,
    },
  ],
};
