import {
  Client,
  Language,
  TravelMode,
} from '@googlemaps/google-maps-services-js';

export interface IGoogleMapsDirections {
  origin: string;
  destination: string;
}

export const getMapsDirections = async (
  origin: string,
  destination: string,
) => {
  try {
    const client = new Client();

    const response = await client.directions({
      params: {
        origin,
        destination,
        mode: <TravelMode>'driving',
        language: <Language>'it',
        key: <string>process.env.GOOGLE_MAPS_API_KEY,
      },
    });

    // if Google Maps API returns OK create an object to use with mongodb
    if (response.data.status === 'OK') {
      const direction = response.data.routes[0].legs[0];

      const distanceObject = {
        status: response.data.status,
        distance: {
          text: direction.distance.text,
          value: direction.distance.value,
        },
        duration: {
          text: direction.duration.text,
          value: direction.duration.value,
        },
        start: {
          address: direction.start_address,
          location: {
            coordinates: [
              direction.start_location.lat,
              direction.start_location.lng,
            ],
          },
        },
        end: {
          address: direction.end_address,
          location: {
            coordinates: [
              direction.end_location.lat,
              direction.end_location.lng,
            ],
          },
        },
      };
      return distanceObject;
    }
  } catch (error) {
    /**
     * Google Maps API returns error in different forms
     * If we use a throw we can block the execution of the function
     * so for now we just return an object containing the error
     * to store into mongodb travel schema
     * directions returns code: error.response.status
     * directions returns error: error.response.data.status
     * directions returns error message: error.response.data.error_message
     */
    if (error instanceof Error) {
      return {
        // status: error.response.data.error_message || error.response.data.status,
        status: error,
      };
    }
    return {
      status: error,
    };
  }
};
