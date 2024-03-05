import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, forkJoin } from 'rxjs';
import { Person } from 'src/app/shared/model/person.model';
import { PagedResults } from 'src/app/shared/model/paged-results.model';
import { Club } from './model/club.model';
import { environment } from 'src/env/environment';
import { Message } from './model/message.model';
import { User } from '../administration/model/user.model';
import { FollowerNotification } from './model/followerNotification.model';
import { Follower } from './model/follower.model';
import { SavedNotification } from './model/savedNotification.model';
import { TourProblemMessage } from './model/tourProblemMessage.model';
import { Tour } from '../tour-execution/model/tour-model';
import { UserExpirience } from './model/userExperience';
import { Challenge } from '../administration/model/challenge.model';



@Injectable({
  providedIn: 'root'
})
export class LayoutService {
  private refreshNavbarSource = new BehaviorSubject<boolean>(false);
  refreshNavbar$ = this.refreshNavbarSource.asObservable();
  
  constructor(private http: HttpClient) { }

  preloadAssets(): Observable<any> {
    const assetUrls = [
      './assets/map/scene.gltf',
      './assets/van/scene.gltf',
    ];

    const preloadObservables: Observable<any>[] = assetUrls.map((url) =>
      this.http.get(url, { responseType: 'blob' })
    );

    return forkJoin(preloadObservables);
  }

  triggerNavbarRefresh() {
    this.refreshNavbarSource.next(true);
  }

  getUserProfile(id: number, role: string): Observable<Person>{
    return this.http.get<Person>(environment.apiHost + role + "/person/" + id)
  }

  getAllUserProfiles(role: string): Observable<Person[]>{
    return this.http.get<Person[]>(environment.apiHost + role + "/person")
  }

  update(data: Person, userId: number, role: string): Observable<Person>{
    return this.http.put<Person>(environment.apiHost + role + "/person/" + userId, data);
  }

  getClubs(): Observable<PagedResults<Club>> {
    return this.http.get<PagedResults<Club>>(environment.apiHost + 'tourist/club')   
  }
  
  addClub(club: Club): Observable<Club> {
    return this.http.post<Club>(environment.apiHost + 'tourist/club', club);
  }

  updateClub(club: Club): Observable<Club> {
    return this.http.put<Club>(environment.apiHost + 'tourist/club/' + club.id, club);
  }

  deleteClub(club: Club): Observable<Club> {
    return this.http.delete<Club>(environment.apiHost + 'tourist/club/' + club.id);
  }
  getFollowers(id: number, role: string): Observable<Person[]>{
    return this.http.get<Person[]>(environment.apiHost + role + "/person/followers/" + id);
  }

  getFollowings(id: number, role: string): Observable<Person[]>{
    return this.http.get<Person[]>(environment.apiHost +  role + "/person/followings/" + id);
  }

  createFollow(follower: Follower, role: string): Observable<Person>{
    return this.http.put<Person>(environment.apiHost +  role + "/follower", follower)
  }

  deleteFollow(followerId: number, followedId: number, role: string){
    return this.http.delete(environment.apiHost +  role + "/follower/" + followerId + "/" + followedId);
  }
  
  getAllMessages(role: string): Observable<PagedResults<Message>> {
    return this.http.get<PagedResults<Message>>(environment.apiHost + role + '/messages');   
  }  

  getUser(id: number): Observable<User> {
    return this.http.get<User>(environment.apiHost + 'users/messages/' + id);
  }

  sendMessage(newMessage: Message, role: string): Observable<Message> {
    return this.http.post<Message>(environment.apiHost + role + '/messages', newMessage );
  }
  
  getFollowersNotifications(followedId: number, role: string): Observable<SavedNotification[]>{
    return this.http.get<SavedNotification[]>(environment.apiHost + role + "/follower/" + followedId);
  }

  getUnreadTourProblemMessages(userId: number, role: string): Observable<TourProblemMessage[]>{
    return this.http.get<TourProblemMessage[]>(environment.apiHost + role + "/tourProblem/messages/" + userId);
  }

  getTours(): Observable<PagedResults<Tour>>{
    return this.http.get<PagedResults<Tour>>(environment.apiHost + 'tourist/tour')
  }
  deleteMessage(role: string, messageId: number){
    return this.http.delete(environment.apiHost +  role + "/messages/" + messageId);
  }
  getXP(userId:number):Observable<UserExpirience>
  {
    return this.http.get<UserExpirience>(environment.apiHost + 'tourist/userExperience/userxp/'+userId)
  }
  addChallenge(challenge: Challenge): Observable<Challenge> {
    return this.http.post<Challenge>(
      environment.apiHost + 'tourist/challenge',
      challenge
    );
  }
}

