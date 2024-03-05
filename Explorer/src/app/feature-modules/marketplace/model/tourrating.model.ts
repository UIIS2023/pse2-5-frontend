export interface TourRating{
    Id? : number,
    personId : number,
    tourId? : number,
    mark : number,
    comment : string,
    dateOfVisit : Date,
    dateOfCommenting : Date,
    images : string[]
}