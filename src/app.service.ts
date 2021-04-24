import { Injectable } from '@nestjs/common';
import { FLIGHT_SCHEDULES } from './constants';
import * as moment from 'moment';

@Injectable()
export class AppService {

  async searchFlight(payload: any): Promise<any[]> {
    let directFlights = await FLIGHT_SCHEDULES.filter((flight) => {
      return flight.departureAirport === payload?.tripStartPoint && flight.arrivalAirport === payload?.tripEndPoint;
    });
    let allFlightPath = await this.formatDirectFlights(directFlights);
    const selectedIndirectFlights = this.getConnectedFlights(payload);
    return [...allFlightPath, ...selectedIndirectFlights];
  }

  async formatDirectFlights(directFlights: any[]): Promise<any[]> {
    const mappedDetails = directFlights.map(flight => {
      return {
        onwardFltNo: flight.flightNo,
        onwardDepArpt: flight.departureAirport,
        onwardArrArpt: flight.arrivalAirport,
        onwardDepTime: flight.departureTime,
        onwardArrTime: flight.arrivalTime,
        connFltNo: '',
        connDepArpt: '',
        connArrArpt: '',
        connDepTime: '',
        connArrTime: ''
      }
    });
    return await mappedDetails;
  }



  getConnectedFlights(payload: any): any[] {

    // this will give two level connectivity flights


    // First of Find all flights which starts from tripStartPoint  and ends on tripEndPoint

    let indirectFlights = FLIGHT_SCHEDULES.filter((flight) => {
      return flight.departureAirport === payload?.tripStartPoint || flight.arrivalAirport === payload?.tripEndPoint
    });

    // Get all start point flights from indirect flights

    const startPointFlights = indirectFlights.filter((flight) => {
      return flight.departureAirport === payload?.tripStartPoint;
    });

    // Get all end point flights from indirect flights

    const endPointFlights = indirectFlights.filter((flight) => {
      return flight.arrivalAirport === payload?.tripEndPoint;
    });

    // Now filter all startPointFlights whose arrivalAirport  and endPointFlights departure is same

    let connectedFlights = [];
    const MIN_CONNECTING_TIME = 2 * 60; // 2 hours conversion in minutes
    const MAX_CONNECTING_TIME = 8 * 60; // 8 hours conversion in minutes

    startPointFlights.map((startFlight) => {
      endPointFlights.map((endPoint) => {
        if (startFlight.arrivalAirport === endPoint.departureAirport) {
          const connectedFlightDepartureTime = moment(endPoint.departureTime, 'HH:mm');
          const directFlightArrivalTime = moment(startFlight.arrivalTime, 'HH:mm');
          const waitingTimeForConnectedFlight = connectedFlightDepartureTime.diff(directFlightArrivalTime, 'minutes');
          if (waitingTimeForConnectedFlight >= MIN_CONNECTING_TIME && waitingTimeForConnectedFlight <= MAX_CONNECTING_TIME) {
            connectedFlights.push({
              startFlight: startFlight,
              connectedFlight: endPoint
            });
          }
        }
      })
    })

    const mappedFlightPath = this.formatConnectingFlights(connectedFlights);
    return mappedFlightPath;

  }

  formatConnectingFlights(connectedFlights: any[]): any[] {
    const mappedDetails = connectedFlights.map(flight => {
      const { startFlight, connectedFlight } = flight;
      return {
        onwardFltNo: startFlight.flightNo,
        onwardDepArpt: startFlight.departureAirport,
        onwardArrArpt: startFlight.arrivalAirport,
        onwardDepTime: startFlight.departureTime,
        onwardArrTime: startFlight.arrivalTime,
        connFltNo: connectedFlight.flightNo || '',
        connDepArpt: connectedFlight.departureAirport || '',
        connArrArpt: connectedFlight.arrivalAirport || '',
        connDepTime: connectedFlight.departureTime || '',
        connArrTime: connectedFlight.arrivalTime || ''
      }
    })
    return mappedDetails;
  }
}
