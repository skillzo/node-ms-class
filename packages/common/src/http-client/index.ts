import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from "axios";

export interface HttpClientConfig {
  baseURL: string;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  apiKey?: string;
}

export class HttpClient {
  private client: AxiosInstance;
  private config: HttpClientConfig;
  private circuitBreakerState: "closed" | "open" | "half-open" = "closed";
  private failureCount: number = 0;
  private readonly failureThreshold: number = 5;
  private readonly resetTimeout: number = 60000; // 1 minute
  private lastFailureTime: number = 0;

  constructor(config: HttpClientConfig) {
    this.config = {
      timeout: 5000,
      retries: 3,
      retryDelay: 1000,
      ...config,
    };

    this.client = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: {
        "Content-Type": "application/json",
        ...(this.config.apiKey && { "X-API-Key": this.config.apiKey }),
      },
    });
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private checkCircuitBreaker(): boolean {
    const now = Date.now();

    if (this.circuitBreakerState === "open") {
      if (now - this.lastFailureTime > this.resetTimeout) {
        this.circuitBreakerState = "half-open";
        this.failureCount = 0;
        return true;
      }
      return false;
    }

    return true;
  }

  private recordSuccess(): void {
    this.failureCount = 0;
    if (this.circuitBreakerState === "half-open") {
      this.circuitBreakerState = "closed";
    }
  }

  private recordFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.failureThreshold) {
      this.circuitBreakerState = "open";
    }
  }

  async request<T = any>(config: AxiosRequestConfig): Promise<T> {
    if (!this.checkCircuitBreaker()) {
      throw new Error("Circuit breaker is open. Service unavailable.");
    }

    let lastError: AxiosError | Error | null = null;

    for (let attempt = 0; attempt <= (this.config.retries || 3); attempt++) {
      try {
        if (attempt > 0) {
          const delay = this.config.retryDelay! * Math.pow(2, attempt - 1);
          await this.sleep(delay);
        }

        const response = await this.client.request<T>(config);
        this.recordSuccess();
        return response.data;
      } catch (error) {
        lastError = error as AxiosError;

        if (axios.isAxiosError(error)) {
          const status = error.response?.status;
          if (status && status >= 400 && status < 500 && status !== 408) {
            throw error;
          }
        }

        if (attempt === (this.config.retries || 3)) {
          this.recordFailure();
          throw error;
        }
      }
    }

    throw lastError || new Error("Request failed");
  }

  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: "GET", url });
  }

  async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return this.request<T>({ ...config, method: "POST", url, data });
  }

  async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return this.request<T>({ ...config, method: "PUT", url, data });
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: "DELETE", url });
  }
}
