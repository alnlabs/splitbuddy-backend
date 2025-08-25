import { Injectable, Logger } from '@nestjs/common';
import DopplerSDK from '@dopplerhq/node-sdk';

export interface DopplerConfig {
  project: string;
  config: string;
  accessToken?: string;
}

@Injectable()
export class DopplerService {
  private readonly logger = new Logger(DopplerService.name);
  private doppler: DopplerSDK | null = null;
  private secrets: Record<string, string> = {};
  private isInitialized = false;

  constructor() {
    this.initializeDoppler();
  }

  private async initializeDoppler() {
    try {
      // Check if we have Doppler configuration
      const accessToken = process.env.DOPPLER_TOKEN;
      const project = process.env.DOPPLER_PROJECT || 'splitbuddy-backend';
      const config = process.env.DOPPLER_CONFIG || 'dev';

      if (!accessToken) {
        this.logger.warn(
          'DOPPLER_TOKEN not found. Using fallback environment variables.',
        );
        return;
      }

      this.doppler = new DopplerSDK({ accessToken });

      // Fetch secrets from Doppler
      await this.fetchSecrets(project, config);
      this.isInitialized = true;

      this.logger.log(
        `Doppler initialized successfully for project: ${project}, config: ${config}`,
      );
    } catch (error) {
      this.logger.error('Failed to initialize Doppler:', error);
      this.logger.warn('Falling back to environment variables');
    }
  }

  private async fetchSecrets(project: string, config: string) {
    try {
      if (!this.doppler) {
        throw new Error('Doppler SDK not initialized');
      }

      // Fetch secrets from Doppler
      const response = await this.doppler.secrets.list(project, config);

      // Convert secrets to environment variables format
      if (response.secrets) {
        this.secrets = Object.entries(response.secrets).reduce(
          (acc, [key, secret]) => {
            if (
              key &&
              secret &&
              typeof secret === 'object' &&
              'computed' in secret
            ) {
              acc[key] = secret.computed as string;
            }
            return acc;
          },
          {} as Record<string, string>,
        );
      }

      this.logger.log(
        `Fetched ${Object.keys(this.secrets).length} secrets from Doppler`,
      );
    } catch (error) {
      this.logger.error('Failed to fetch secrets from Doppler:', error);
      throw error;
    }
  }

  /**
   * Get a secret value from Doppler or fallback to environment variable
   */
  getSecret(key: string, fallback?: string): string {
    // First check Doppler secrets
    if (this.isInitialized && this.secrets[key]) {
      let value = this.secrets[key];

      // Handle Docker environment adjustments
      if (this.isRunningInDocker()) {
        value = this.adjustForDocker(key, value);
      }

      return value;
    }

    // Fallback to environment variables
    const envValue = process.env[key];
    if (envValue !== undefined) {
      let value = envValue;

      // Handle Docker environment adjustments
      if (this.isRunningInDocker()) {
        value = this.adjustForDocker(key, value);
      }

      return value;
    }

    // Return fallback if provided
    if (fallback !== undefined) {
      let value = fallback;

      // Handle Docker environment adjustments
      if (this.isRunningInDocker()) {
        value = this.adjustForDocker(key, value);
      }

      return value;
    }

    this.logger.warn(`Secret not found: ${key}`);
    return '';
  }

  /**
   * Get all secrets as an object
   */
  getAllSecrets(): Record<string, string> {
    if (this.isInitialized) {
      return { ...this.secrets };
    }
    return {};
  }

  /**
   * Check if Doppler is properly initialized
   */
  isDopplerAvailable(): boolean {
    return this.isInitialized;
  }

  /**
   * Refresh secrets from Doppler
   */
  async refreshSecrets(): Promise<void> {
    if (!this.doppler) {
      throw new Error('Doppler SDK not initialized');
    }

    const project = process.env.DOPPLER_PROJECT || 'splitbuddy-backend';
    const config = process.env.DOPPLER_CONFIG || 'dev';

    await this.fetchSecrets(project, config);
    this.logger.log('Secrets refreshed from Doppler');
  }

  /**
   * Check if running in Docker container
   */
  private isRunningInDocker(): boolean {
    const isDocker =
      process.env.DOCKER_ENV === 'true' ||
      process.env.NODE_ENV === 'production' ||
      process.env.NODE_ENV === 'docker';

    this.logger.debug(
      `Docker detection: DOCKER_ENV=${process.env.DOCKER_ENV}, NODE_ENV=${process.env.NODE_ENV}, isDocker=${isDocker}`,
    );

    return isDocker;
  }

  /**
   * Adjust values for Docker environment
   */
  private adjustForDocker(key: string, value: string): string {
    const originalValue = value;

    // Adjust database host for Docker
    if (key === 'DB_HOST' && value === 'localhost') {
      value = 'postgres';
    }

    // Adjust database port for Docker
    if (key === 'DB_PORT' && value === '5434') {
      value = '5432';
    }

    // Adjust Redis host for Docker
    if (key === 'REDIS_HOST' && value === 'localhost') {
      value = 'redis';
    }

    // Adjust Redis port for Docker
    if (key === 'REDIS_PORT' && value === '6382') {
      value = '6379';
    }

    if (originalValue !== value) {
      this.logger.debug(
        `Docker adjustment: ${key} ${originalValue} -> ${value}`,
      );
    }

    return value;
  }
}
