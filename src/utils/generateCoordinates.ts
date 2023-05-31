import axios from 'axios';

// import dotenv from 'dotenv';

// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();



export async function generateCoordinates(
  ip: string
): Promise<{ lat: number; lon: number }> {
  const options = {
    method: 'GET',
    url: 'https://ip-geolocation-ipwhois-io.p.rapidapi.com/json/',

    headers: {
      'X-RapidAPI-Key': process.env.RAPID_API_KEY as string,
      'X-RapidAPI-Host': 'ip-geolocation-ipwhois-io.p.rapidapi.com',
      useQueryString: true,
    },
    params: {
      ip,
    },
  };

  try {
    const response = await axios.request(options);
    const { latitude, longitude } = response.data;
    return { lat: latitude, lon: longitude };
  } catch (error) {
    console.error('Error retrieving location:', error.message);
    throw error;
  }
}
