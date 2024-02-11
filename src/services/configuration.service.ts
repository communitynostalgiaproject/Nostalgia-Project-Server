import ConfigurationModel from "../models/configuration.model";
import { startSession } from "mongoose";
import { Configuration } from "@projectTypes/configuration";

export interface ConfigurationService {
  getConfiguration: (key: string) => Promise<Configuration | undefined>;
  setConfiguration: (key: string, value: string) => Promise<Configuration>;
  setConfigurations: (configUpdates: { key: string, value: string }[]) => Promise<void>;
}

export class MongoDBConfigurationService implements MongoDBConfigurationService {
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

  // Performs transactional updates
  async setConfigurations(configUpdates: { key: string, value: string }[]): Promise<void> {
    const session = await startSession();
    session.startTransaction();

    try {
      const updateOperations = configUpdates.map(config => {
        return {
          updateOne: {
            filter: { key: config.key },
            update: { $set: { value: config.value } },
            upsert: true
          }
        };
      });

      await ConfigurationModel.bulkWrite(updateOperations);
      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      console.error(`Error updating configurations: ${error}`);
      throw error;
    } finally {
      session.endSession();
    }
  }
}
