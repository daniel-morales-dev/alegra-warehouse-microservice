import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

export class ApiCore {
  private api: AxiosInstance;

  constructor(config: AxiosRequestConfig) {
    this.api = axios.create(config);
  }

  public get<T, R = AxiosResponse<T>>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<R> {
    return this.api.get(url, config);
  }

  public delete<T, R = AxiosResponse<T>>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<R> {
    return this.api.delete(url, config);
  }

  public post<T, R = AxiosResponse<T>>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<R> {
    return this.api.post(url, data, config);
  }

  public put<T, R = AxiosResponse<T>>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<R> {
    return this.api.put(url, data, config);
  }

  public patch<T, R = AxiosResponse<T>>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<R> {
    return this.api.patch(url, data, config);
  }
}
