export class Session {
    id?: number;
    tourId?: number;
    touristId: number;
    location: PositionSimulatorDto;
    sessionStatus?: number;
    distanceCrossedPercent?: number;
    lastActivity: Date;
    completedKeyPoints: CompletedKeyPointDto[];
  }
  
  export class PositionSimulatorDto {
    latitude: number;
    longitude: number;
  }

  export class CompletedKeyPointDto{
    keyPointId: number;
    completionTime: Date;
  }