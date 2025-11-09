// Simple localStorage wrapper to replace spark.kv
export const storage = {
  async get<T>(key: string): Promise<T | undefined> {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : undefined
    } catch (error) {
      console.error(`Error getting ${key}:`, error)
      return undefined
    }
  },

  async set<T>(key: string, value: T): Promise<void> {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(`Error setting ${key}:`, error)
    }
  },

  async delete(key: string): Promise<void> {
    try {
      window.localStorage.removeItem(key)
    } catch (error) {
      console.error(`Error deleting ${key}:`, error)
    }
  }
}
