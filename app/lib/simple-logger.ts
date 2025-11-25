// app/lib/simple-logger.ts
export const createLogger = (context: string) => ({
  timeStart: (label: string) => {
    const fullLabel = `[${context}] ${label}`;
    console.time(fullLabel);
    return {
      end: (data?: any) => {
        console.timeEnd(fullLabel);
        if (data) console.log(fullLabel, data);
      },
      error: (error: any) => {
        console.timeEnd(fullLabel);
        console.error(fullLabel, error);
      }
    };
  },
  warn: (message: string, data?: any) => {
    console.warn(`[${context}] ${message}`, data);
  }
});