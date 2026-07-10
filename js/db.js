function createClient() {
  if (!window.SUPABASE_URL || !window.SUPABASE_ANON_KEY || window.SUPABASE_ANON_KEY.includes("REPLACE")) {
    return null;
  }
  return window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
}

const db = {
  client: null,

  init() {
    this.client = createClient();
    return this.client;
  },

  async listVehicles() {
    const { data, error } = await this.client
      .from("vehicles")
      .select("*, expenses(*)")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data || []).map((v) => ({
      ...v,
      expenses: [...(v.expenses || [])].sort((a, b) =>
        (b.date || "").localeCompare(a.date || ""),
      ),
    }));
  },

  async getVehicle(id) {
    const { data, error } = await this.client
      .from("vehicles")
      .select("*, expenses(*)")
      .eq("id", id)
      .single();
    if (error) throw error;
    return {
      ...data,
      expenses: [...(data.expenses || [])].sort((a, b) =>
        (b.date || "").localeCompare(a.date || ""),
      ),
    };
  },

  async createVehicle(payload) {
    const { data, error } = await this.client
      .from("vehicles")
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateVehicle(id, payload) {
    const { data, error } = await this.client
      .from("vehicles")
      .update(payload)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteVehicle(id) {
    const { error } = await this.client.from("vehicles").delete().eq("id", id);
    if (error) throw error;
  },

  async addExpense(payload) {
    const { data, error } = await this.client
      .from("expenses")
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteExpense(id) {
    const { error } = await this.client.from("expenses").delete().eq("id", id);
    if (error) throw error;
  },
};
