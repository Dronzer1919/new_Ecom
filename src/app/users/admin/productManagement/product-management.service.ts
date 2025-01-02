import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { EndPoints } from '../../../shared/endpoints/apiEndpoints';

@Injectable({
  providedIn: 'root'
})
export class ProductManagementService {

  constructor(
    private http: HttpClient
  ) { }

  public addNewProduct(payload:any) {
    const url = EndPoints.APIURL.addProduct.replace('{0}', environment.serviceBaseUrls.DOMAIN01);
    return this.http.post<any>(url,payload)
  }

  public getAllProduct() {
    const url = EndPoints.APIURL.getAllProduct.replace('{0}', environment.serviceBaseUrls.DOMAIN01);
    return this.http.get<any>(url)
  }

  public deleteStudent(id: any) {
    const url = EndPoints.APIURL.deleteProduct.replace('{0}', environment.serviceBaseUrls.DOMAIN01).replace('{1}', id);
    return this.http.delete<any>(url)
  }

  public editForm(payload:any,id: any) { 
    const url = EndPoints.APIURL.editProduct.replace('{0}', environment.serviceBaseUrls.DOMAIN01).replace('{1}', id);
    return this.http.put(url,payload)
  }

  public addType(payload:any) {
    const url = EndPoints.APIURL.addType.replace('{0}', environment.serviceBaseUrls.DOMAIN01);
    return this.http.post<any>(url,payload)
  }
}
