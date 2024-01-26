import ConfigurationModel from "../models/configuration.model";
import { Configuration } from "@projectTypes/configuration";

export class ConfigurationService {
  constructor() {};

  async getConfiguration(key: string): Promise<Configuration | undefined> {
    try {
      const configDoc = await ConfigurationModel.findOne({ key });
      return configDoc ? configDoc as Configuration : undefined;
    } catch (error) {
      console.error('Error fetching configuration:', error);
      throw error;
    }
  };

  async setConfiguration(key: string, value: string): Promise<Configuration> {
    try {
      const update = { value, updatedAt: new Date() };
      const options = { upsert: true, new: true };
      const updatedConfig = await ConfigurationModel.findOneAndUpdate({ key }, update, options);
      return updatedConfig as Configuration;
    } catch (error) {
      console.error('Error setting configuration:', error);
      throw error;
    }
  }
}
