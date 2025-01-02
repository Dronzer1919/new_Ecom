import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { EndPoints } from '../../../shared/endpoints/apiEndpoints';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserManagementService {

  constructor(
    private http: HttpClient

  ) { }

  public addNewUser(payload: any) {
    const url = EndPoints.APIURL.addUser.replace('{0}', environment.serviceBaseUrls.DOMAIN01);
    return this.http.post<any>(url, payload);
  }
  
  public getAllUsers() {
    const url = EndPoints.APIURL.getAllUsers.replace('{0}', environment.serviceBaseUrls.DOMAIN01);
    return this.http.get<any>(url);
  }
  
  public getUserById(userId: string) {
    const url = EndPoints.APIURL.getUserById.replace('{0}', environment.serviceBaseUrls.DOMAIN01).replace('{1}', userId);
    return this.http.get<any>(url);
  }
  
  public updateUser(userId: string, payload: any) {
    const url = EndPoints.APIURL.updateUser.replace('{0}', environment.serviceBaseUrls.DOMAIN01).replace('{1}', userId);
    return this.http.put<any>(url, payload);
  }
  
  public deleteUser(userId: string) {
    const url = EndPoints.APIURL.deleteUser.replace('{0}', environment.serviceBaseUrls.DOMAIN01).replace('{1}', userId);
    return this.http.delete<any>(url);
  }
  
  public checkEmail(payload: any) {
    const url = EndPoints.APIURL.checkEmail.replace('{0}', environment.serviceBaseUrls.DOMAIN01);
    return this.http.post<any>(url, payload);
  }

  public login(payload: any): Observable<any> {
    const url = EndPoints.APIURL.adminlogin.replace('{0}', environment.serviceBaseUrls.DOMAIN01);
    return this.http.post<any>(url, payload);
  }

}
