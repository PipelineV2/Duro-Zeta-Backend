

export class GeofencingService {

    static async createGeofence(userId: string, geofenceData: IGeofenceInterface): Promise<IGeofenceInterface> {
    interface Coordinates {
        latitude: number;
        longitude: number;
      }
      
      function calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
        const earthRadius = 6371; // Earth's radius in kilometers
      
        const latDiff = toRad(coord2.latitude - coord1.latitude);
        const lonDiff = toRad(coord2.longitude - coord1.longitude);
      
        // Haversine formula
        const a =
          Math.sin(latDiff / 2) * Math.sin(latDiff / 2) +
          Math.cos(toRad(coord1.latitude)) *
            Math.cos(toRad(coord2.latitude)) *
            Math.sin(lonDiff / 2) *
            Math.sin(lonDiff / 2);
      
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      
        const distance = earthRadius * c; // Distance in kilometers
      
        return distance;
      }
      
      function toRad(degrees: number): number {
        return degrees * (Math.PI / 180);
      }
      
      // Example usage
      const userLocation: Coordinates = {
        latitude: 51.5074,
        longitude: -0.1278,
      };
      
      const businessLocation: Coordinates = {
        latitude: 51.5123,
        longitude: -0.1231,
      };
      
      const distance = calculateDistance(userLocation, businessLocation);
      const radius = 0.5; // 500 meters
      
      if (distance <= radius) {
        console.log("User is within the geofence. Access granted.");
      } else {
        console.log("User is outside the geofence. Access denied.");
      }

    }
      
}