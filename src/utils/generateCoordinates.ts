import axios from 'axios';

export async function generateCoordinates(
  ip: string
): Promise<{ lat: number; lon: number }> {
  const options = {
    method: 'GET',
    url: 'https://ip-geolocation-ipwhois-io.p.rapidapi.com/json/',

    headers: {
      'X-RapidAPI-Key': 'e9f77350eemshfe1ac471c3f2963p1b1854jsn4970638bb009',
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
