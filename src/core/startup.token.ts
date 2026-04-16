export interface StartupTask {
  handleCron(): Promise<void>;
}

export const STARTUP_TASKS_TOKEN = Symbol('STARTUP_TASKS_TOKEN');
