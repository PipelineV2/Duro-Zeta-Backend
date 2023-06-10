import axios from 'axios';
import NodeGeocoder, { Options } from 'node-geocoder';

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
    // console.log("response data =>", response.data)
    const { latitude, longitude } = response.data;
    return { lat: latitude, lon: longitude };
  } catch (error) {
    console.error('Error retrieving location:', error.message);
    throw error;
  }
}

interface Address {
  latitude?: number;
  longitude?: number;
  formattedAddress?: string;
  country?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  streetName?: string;
  streetNumber?: string;
  countryCode?: string;
  neighbourhood?: string;
  provider?: string;
}
// Configure the geocoder options
const geocoderOptions: Options = {
  provider: 'openstreetmap',
};

// Create the geocoder instance
const geocoder = NodeGeocoder(geocoderOptions);

export async function reverseGeocode(
  lat: number,
  lon: number
): Promise<Address[]> {
  try {
    const result = await geocoder.reverse({ lat, lon });
    return result;
  } catch (error) {
    console.error('Error in reverse geocoding:', error);
    throw error;
  }
}
